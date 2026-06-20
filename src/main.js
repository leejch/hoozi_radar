import { createReconnectPolicy, getConnectionTarget, loadSettings } from './config.js';
import { applyTranslations, t } from './i18n.js';
import { createFallbackImageLoader, mapAssetName } from './assets/maps.js';
import {
    HooziProtocolError,
    createPingMessage,
    parseHoozi3Message,
    parseHoozi3StateFile
} from './protocol/hoozi3.js';
import { createRadarRenderer } from './render/radar.js';
import { createRadarStore } from './state/store.js';
import {
    collectDomReferences,
    createUiController,
    setConnectionStatus,
    setOverlay
} from './ui/controls.js';

applyTranslations();

const refs = collectDomReferences();
const settings = loadSettings();
const store = createRadarStore(settings);
let reconnectTimer = null;
let pingTimer = null;
const reconnectPolicy = createReconnectPolicy();

const radar = createRadarRenderer({ refs, store, settings, t });

const mapLoader = createFallbackImageLoader(refs.mapImage, {
    onLoad() {
        store.state.mapLoaded = true;
        setOverlay(refs, 'hidden', '', '');
        radar.resetViewport();
    },
    onMissing() {
        store.state.mapLoaded = false;
        setOverlay(
            refs,
            'info',
            t('overlay.mapMissingTitle'),
            t('overlay.mapMissingSubtitle', { map: store.state.mapName || '—' }),
            false
        );
    }
});

const logoLoader = createFallbackImageLoader(refs.brandLogo);
logoLoader.load('default.png');

const ui = createUiController({
    refs,
    store,
    settings,
    t,
    onReconnect: () => connect(),
    onViewModeChange: (mode) => radar.setViewMode(mode),
    onImportPlayerData: (raw) => {
        const message = parseHoozi3StateFile(raw);
        pauseForImportedPreview();
        applyStateMessage(message, raw, { imported: true });
        return message.players.length;
    }
});
ui.updateSnapshot(null);

function clearTimers() {
    if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
    if (pingTimer !== null) window.clearInterval(pingTimer);
    reconnectTimer = null;
    pingTimer = null;
}

function detachSocket() {
    const socket = store.state.socket;
    store.state.socket = null;
    if (!socket) return;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    try {
        socket.close();
    } catch (error) {
        console.debug('WebSocket close failed', error);
    }
}

function pauseForImportedPreview() {
    reconnectPolicy.suspend();
    clearTimers();
    detachSocket();
    store.state.connection = 'preview';
    setConnectionStatus(refs, 'waiting', t('status.importedPreview'));
}

function scheduleReconnect() {
    if (!reconnectPolicy.canSchedule(settings.connectionMode, reconnectTimer !== null)) return;
    reconnectTimer = window.setTimeout(() => {
        reconnectTimer = null;
        connect();
    }, 2000);
}

function applyStateMessage(message, raw, { imported = false } = {}) {
    if (!store.applySnapshot(message, raw, { imported })) return;
    const mapChanged = refs.mapImage.dataset.mapName !== message.map;
    if (!message.map) {
        refs.mapImage.dataset.mapName = '';
        mapLoader.clear();
        store.state.mapLoaded = false;
        setOverlay(refs, 'loading', t('overlay.noDataTitle'), t('overlay.noDataSubtitle'));
    } else if (mapChanged) {
        refs.mapImage.dataset.mapName = message.map;
        store.state.mapLoaded = false;
        setOverlay(refs, 'loading', t('overlay.mapLoadingTitle'), t('overlay.mapLoadingSubtitle'));
        mapLoader.load(mapAssetName(message.map));
    } else if (store.state.mapLoaded) {
        setOverlay(refs, 'hidden', '', '');
    }
    ui.updateSnapshot(message);
}

function handleMessage(raw) {
    try {
        const message = parseHoozi3Message(raw);
        if (message.kind === 'state') applyStateMessage(message, raw);
    } catch (error) {
        const message = error instanceof HooziProtocolError ? error.message : String(error);
        console.error('HOOZi 3.0 protocol error', error);
        setConnectionStatus(refs, 'error', t('status.protocolError'));
        setOverlay(refs, 'info', t('overlay.protocolTitle'), t('overlay.protocolSubtitle', { message }), true);
    }
}

function connect() {
    reconnectPolicy.resume();
    clearTimers();
    detachSocket();
    if (store.state.mapName && !store.state.mapLoaded) refs.mapImage.dataset.mapName = '';

    const target = getConnectionTarget(settings);
    if (!target) {
        setConnectionStatus(refs, 'error', t('status.disconnected'));
        setOverlay(refs, 'info', t('overlay.instructionsTitle'), t('overlay.instructionsSubtitle'), true);
        return;
    }

    setConnectionStatus(refs, 'connecting', t('status.connecting'));
    setOverlay(refs, 'loading', t('overlay.connectingTitle'), t('overlay.connectingSubtitle', { target }));

    let socket;
    try {
        socket = new WebSocket(target);
    } catch (error) {
        console.error('Unable to create WebSocket', error);
        setConnectionStatus(refs, 'error', t('status.disconnected'));
        setOverlay(refs, 'info', t('overlay.instructionsTitle'), t('overlay.instructionsSubtitle'), true);
        scheduleReconnect();
        return;
    }

    store.state.socket = socket;
    socket.onopen = () => {
        if (store.state.socket !== socket) return;
        store.state.connection = 'connected';
        setConnectionStatus(refs, 'connected', t('status.connected'));
        setOverlay(refs, 'loading', t('overlay.noDataTitle'), t('overlay.noDataSubtitle'));
        socket.send(createPingMessage());
        pingTimer = window.setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) socket.send(createPingMessage());
        }, 10000);
    };
    socket.onmessage = (event) => handleMessage(event.data);
    socket.onerror = () => socket.close();
    socket.onclose = () => {
        if (store.state.socket !== socket) return;
        store.state.socket = null;
        if (pingTimer !== null) window.clearInterval(pingTimer);
        pingTimer = null;
        store.state.connection = 'disconnected';
        setConnectionStatus(refs, 'error', t('status.disconnected'));
        setOverlay(refs, 'info', t('overlay.instructionsTitle'), t('overlay.instructionsSubtitle'), true);
        scheduleReconnect();
    };
}

window.addEventListener('beforeunload', () => {
    reconnectPolicy.suspend();
    clearTimers();
    detachSocket();
    radar.stop();
});

setConnectionStatus(refs, 'waiting', t('status.waiting'));
setOverlay(refs, 'loading', t('overlay.waitingTitle'), t('overlay.waitingSubtitle'));
radar.start();
connect();
