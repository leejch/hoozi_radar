import { VIEW_MODE_FOLLOW, VIEW_MODE_FREE, saveSetting, teamColorFor } from '../config.js';
import { formatPlayerStatus } from '../render/entities.js';
import { allocateDesktopLayout } from './layout.js';
import { currentPlayerExportFileName, isJsonFileName } from './player-data.js';

const DESKTOP_QUERY = window.matchMedia('(min-width: 1024px)');
const DESKTOP_CONFIG_WIDTH = 300;
const DESKTOP_TABLE_MIN_WIDTH = 180;
const DESKTOP_TABLE_MAX_RATIO = 0.25;

export function collectDomReferences(root = document) {
    const byId = (id) => root.getElementById(id);
    return {
        layout: root.querySelector('[data-role="layout"]'),
        brandLogo: root.querySelector('[data-role="brand-logo"]'),
        statusIndicator: root.querySelector('[data-role="status-indicator"]'),
        statusText: root.querySelector('[data-role="status-text"]'),
        playerSelect: byId('sel_player'),
        viewModeFreeButton: byId('viewModeFree'),
        viewModeFollowButton: byId('viewModeFollow'),
        mapStageContainer: root.querySelector('.map-stage-container'),
        mapStage: byId('mapStage'),
        mapViewport: byId('mapViewport'),
        mapImage: byId('mapImage'),
        mapZoneCanvas: byId('mapZoneCanvas'),
        mapCanvas: byId('mapCanvas'),
        mapOverlay: byId('mapOverlay'),
        overlayTitle: byId('overlayTitle'),
        overlaySubtitle: byId('overlaySubtitle'),
        mapName: byId('mapName'),
        aliveCount: byId('aliveCount'),
        focusName: byId('focusPlayerName'),
        focusTeamBadge: byId('focusTeamBadge'),
        focusMeta: byId('focusMeta'),
        zoomControls: byId('mapZoomControls'),
        zoomOut: byId('zoomOut'),
        zoomValue: byId('zoomValue'),
        zoomIn: byId('zoomIn'),
        mapControls: byId('mapControls'),
        reconnectButton: byId('reconnectButton'),
        configReconnectButton: byId('configReconnectButton'),
        connectionModeAutoButton: byId('connectionModeAuto'),
        connectionModeManualButton: byId('connectionModeManual'),
        connectionManualFields: root.querySelector('[data-role="connection-manual-fields"]'),
        importPlayerDataButton: byId('importPlayerDataButton'),
        importPlayerDataInput: byId('importPlayerDataInput'),
        exportPlayerDataButton: byId('exportPlayerDataButton'),
        playerDataMessage: byId('playerDataMessage'),
        playerTableSection: root.querySelector('[data-role="player-table-section"]'),
        playerTableShell: root.querySelector('[data-role="player-table-shell"]'),
        playerTableToolbar: root.querySelector('[data-role="player-table-toolbar"]'),
        playerTableScroll: root.querySelector('[data-role="player-table-scroll"]'),
        playerTableElement: root.querySelector('.player-table'),
        playerTableHeader: root.querySelector('[data-role="player-table-header"]'),
        playerTableBody: root.querySelector('[data-role="player-table-body"]'),
        settingInputs: [...root.querySelectorAll('input[data-setting]')],
        inputs: {
            protocol: byId('conf_protocol'),
            host: byId('conf_host'),
            port: byId('conf_port'),
            path: byId('conf_path'),
            fontSize: byId('conf_fontsize')
        }
    };
}

export function setOverlay(refs, state, title, subtitle, showReconnect = false) {
    refs.mapOverlay.dataset.state = state;
    refs.mapOverlay.dataset.reconnect = showReconnect ? 'true' : 'false';
    refs.overlayTitle.textContent = title;
    refs.overlaySubtitle.textContent = subtitle;
}

export function setConnectionStatus(refs, state, label) {
    refs.statusText.textContent = label;
    refs.statusIndicator.className = 'size-2.5 rounded-full shadow-inner shadow-black/50 transition';
    const classNames = {
        connected: ['bg-emerald-400'],
        connecting: ['bg-amber-300', 'animate-pulse'],
        error: ['bg-rose-500'],
        waiting: ['bg-slate-500']
    };
    refs.statusIndicator.classList.add(...(classNames[state] || classNames.waiting));
}

function cell(text, className = '') {
    const element = document.createElement('td');
    element.className = `whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200 ${className}`;
    element.textContent = text;
    return element;
}

function displayValue(value) {
    return value === null || value === undefined || value === '' ? '—' : String(value);
}

function displayBoolean(value, t) {
    return value ? t('player.yes') : t('player.no');
}

function displayStatus(player, t) {
    return `${formatPlayerStatus(player, t)} · ${player.distance.toFixed(1)}m · yaw ${player.yaw} · ${t('player.roster', { roster: player.roster })}`;
}

export function createUiController({ refs, store, settings, t, onReconnect, onViewModeChange, onImportPlayerData }) {
    let layoutFrame = 0;

    function layoutContentBox() {
        const style = window.getComputedStyle(refs.layout);
        const horizontalPadding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        const verticalPadding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        return {
            width: Math.max(0, refs.layout.clientWidth - horizontalPadding),
            height: Math.max(0, refs.layout.clientHeight - verticalPadding),
            columnGap: parseFloat(style.columnGap) || 0
        };
    }

    function horizontalBoxOverhead(element) {
        const style = window.getComputedStyle(element);
        return ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth']
            .reduce((total, property) => total + (parseFloat(style[property]) || 0), 0);
    }

    function intrinsicWidth(element) {
        const previousWidth = element.style.width;
        const previousMinWidth = element.style.minWidth;
        element.style.width = 'max-content';
        element.style.minWidth = 'max-content';
        const width = element.getBoundingClientRect().width;
        element.style.width = previousWidth;
        element.style.minWidth = previousMinWidth;
        return width;
    }

    function requiredTablePanelWidth() {
        if (!settings.tableVisible) return DESKTOP_TABLE_MIN_WIDTH;
        const shellOverhead = horizontalBoxOverhead(refs.playerTableShell);
        const wrapperOverhead = horizontalBoxOverhead(refs.playerTableScroll.parentElement);
        return Math.ceil(Math.max(
            intrinsicWidth(refs.playerTableElement) + shellOverhead + wrapperOverhead,
            intrinsicWidth(refs.playerTableToolbar) + shellOverhead
        ));
    }

    function syncDesktopLayout() {
        layoutFrame = 0;
        if (!DESKTOP_QUERY.matches) {
            refs.layout.style.removeProperty('grid-template-columns');
            refs.mapStageContainer.style.removeProperty('height');
            delete refs.layout.dataset.mapAllocatedWidth;
            delete refs.layout.dataset.mapAllocatedHeight;
            delete refs.layout.dataset.tableAllocatedWidth;
            return;
        }

        const content = layoutContentBox();
        const allocation = allocateDesktopLayout({
            width: content.width,
            height: content.height,
            tableVisible: settings.tableVisible,
            tableContentWidth: requiredTablePanelWidth(),
            configWidth: DESKTOP_CONFIG_WIDTH,
            columnGap: content.columnGap,
            tableMinWidth: DESKTOP_TABLE_MIN_WIDTH,
            tableMaxRatio: DESKTOP_TABLE_MAX_RATIO
        });
        refs.layout.style.gridTemplateColumns = settings.tableVisible
            ? `${allocation.configWidth}px minmax(0, 1fr) ${allocation.tableWidth}px`
            : `${allocation.configWidth}px minmax(0, 1fr)`;
        refs.mapStageContainer.style.height = `${allocation.mapHeight}px`;
        refs.layout.dataset.mapAllocatedWidth = String(Math.floor(allocation.mapWidth));
        refs.layout.dataset.mapAllocatedHeight = String(allocation.mapHeight);
        refs.layout.dataset.tableAllocatedWidth = String(allocation.tableWidth);
    }

    function scheduleLayoutSync() {
        if (layoutFrame) cancelAnimationFrame(layoutFrame);
        layoutFrame = requestAnimationFrame(syncDesktopLayout);
    }

    function setSegmentButtonState(button, selected) {
        button.dataset.selected = selected ? 'true' : 'false';
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
    }

    function showPlayerDataMessage(kind, message) {
        refs.playerDataMessage.hidden = false;
        refs.playerDataMessage.className = `px-2 pb-1 text-xs font-medium ${kind === 'success' ? 'text-emerald-300' : 'text-rose-300'}`;
        refs.playerDataMessage.textContent = message;
    }

    function syncConnectionControls() {
        const manual = settings.connectionMode === 'manual';
        refs.connectionManualFields.classList.toggle('hidden', !manual);
        setSegmentButtonState(refs.connectionModeAutoButton, !manual);
        setSegmentButtonState(refs.connectionModeManualButton, manual);
    }

    function syncViewControls() {
        const free = store.state.viewMode === VIEW_MODE_FREE;
        setSegmentButtonState(refs.viewModeFreeButton, free);
        setSegmentButtonState(refs.viewModeFollowButton, !free);
    }

    function syncTableVisibility() {
        refs.playerTableSection.classList.toggle('lg:flex', settings.tableVisible);
        refs.playerTableSection.classList.toggle('lg:hidden', !settings.tableVisible);
        refs.layout.classList.toggle('player-table-hidden', !settings.tableVisible);
        scheduleLayoutSync();
    }

    function populatePlayerSelect(players) {
        const selectedId = store.state.selectedPlayerId;
        const fragment = document.createDocumentFragment();
        for (const player of [...players].sort((a, b) => a.team - b.team || a.name.localeCompare(b.name))) {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = `${player.self ? '★ ' : ''}${player.name} · T${player.team}`;
            option.style.color = teamColorFor(player.team);
            fragment.appendChild(option);
        }
        refs.playerSelect.replaceChildren(fragment);
        refs.playerSelect.value = selectedId;
    }

    function updateFocus(players) {
        const player = store.getSelectedPlayer(players);
        if (!player) {
            refs.focusName.textContent = '—';
            refs.focusTeamBadge.style.backgroundColor = '#64748B';
            refs.focusMeta.textContent = `${t('map.focusHealth')} — · ${t('map.focusShield')} — · ${t('map.focusKills')} —`;
            return;
        }
        refs.focusName.textContent = `${player.self ? '★ ' : ''}${player.name}`;
        refs.focusName.style.color = teamColorFor(player.team);
        refs.focusTeamBadge.style.backgroundColor = teamColorFor(player.team);
        refs.focusMeta.textContent = `${t('map.focusHealth')} ${player.hp}/${player.max_hp} · ${t('map.focusShield')} ${player.shield}/${player.max_shield} · ${t('map.focusKills')} ${player.kills}`;
        refs.focusName.title = `${t('player.team', { team: player.team })} · ${t('player.squad', { squad: player.squad })} · ${displayStatus(player, t)}`;
    }

    const columns = [
        ['tableSelf', 'table.columns.self', (p) => cell(displayBoolean(p.self, t))],
        ['tableId', 'table.columns.id', (p) => cell(displayValue(p.id), 'font-mono')],
        ['tableIndex', 'table.columns.index', (p) => cell(displayValue(p.index))],
        ['tableTeam', 'table.columns.team', (p) => cell(displayValue(p.team), 'font-semibold')],
        ['tableSquad', 'table.columns.squad', (p) => cell(displayValue(p.squad))],
        ['tableName', 'table.columns.name', (p) => cell(displayValue(p.name))],
        ['tableLegend', 'table.columns.legend', (p) => cell(displayValue(p.legend))],
        ['tableLegendIconKey', 'table.columns.legendIconKey', (p) => cell(displayValue(p.legend_icon_key), 'font-mono')],
        ['tableUid', 'table.columns.uid', (p) => cell(displayValue(p.uid), 'font-mono')],
        ['tableHp', 'table.columns.hp', (p) => cell(displayValue(p.hp))],
        ['tableMaxHp', 'table.columns.maxHp', (p) => cell(displayValue(p.max_hp))],
        ['tableShield', 'table.columns.shield', (p) => cell(displayValue(p.shield))],
        ['tableMaxShield', 'table.columns.maxShield', (p) => cell(displayValue(p.max_shield))],
        ['tableDistance', 'table.columns.distance', (p) => cell(`${p.distance.toFixed(1)} m`)],
        ['tableYaw', 'table.columns.yaw', (p) => cell(displayValue(p.yaw))],
        ['tableDead', 'table.columns.dead', (p) => cell(displayBoolean(p.is_dead, t))],
        ['tableDown', 'table.columns.down', (p) => cell(displayBoolean(p.is_down, t))],
        ['tableLevel', 'table.columns.level', (p) => cell(displayValue(p.level))],
        ['tableRank', 'table.columns.rank', (p) => cell(displayValue(p.rank))],
        ['tableRankIconKey', 'table.columns.rankIconKey', (p) => cell(displayValue(p.rank_icon_key), 'font-mono')],
        ['tableRankColor', 'table.columns.rankColor', (p) => cell(displayValue(p.rank_color), 'font-mono')],
        ['tableKills', 'table.columns.kills', (p) => cell(displayValue(p.kills))],
        ['tableDamage', 'table.columns.damage', (p) => cell(displayValue(p.damage))],
        ['tableRoster', 'table.columns.roster', (p) => cell(displayValue(p.roster))]
    ];

    function renderTable(players) {
        const activeColumns = columns.filter(([setting]) => settings[setting]);
        refs.playerTableHeader.replaceChildren(...activeColumns.map(([, label]) => {
            const th = document.createElement('th');
            th.className = 'whitespace-nowrap px-2.5 py-2 text-left';
            th.textContent = t(label);
            return th;
        }));
        if (!players.length || !activeColumns.length) {
            const row = document.createElement('tr');
            const empty = cell(t('table.empty'));
            empty.colSpan = Math.max(1, activeColumns.length);
            empty.className = 'px-2.5 py-5 text-center text-xs text-slate-500';
            row.appendChild(empty);
            refs.playerTableBody.replaceChildren(row);
            scheduleLayoutSync();
            return;
        }
        const rows = [...players]
            .sort((a, b) => a.team - b.team || a.name.localeCompare(b.name))
            .map((player, index) => {
                const row = document.createElement('tr');
                row.className = `player-table-row player-table-row-band-${index % 2}`;
                row.append(...activeColumns.map(([, , render]) => render(player)));
                return row;
            });
        refs.playerTableBody.replaceChildren(...rows);
        scheduleLayoutSync();
    }

    function updateSnapshot(snapshot) {
        const players = snapshot?.players || [];
        const mapName = snapshot?.map || '—';
        refs.mapName.textContent = mapName;
        refs.mapName.title = mapName;
        refs.aliveCount.textContent = String(players.filter((player) => !player.is_dead).length);
        populatePlayerSelect(players);
        updateFocus(players);
        renderTable(players);
        refs.exportPlayerDataButton.disabled = !store.state.latestMessageText;
    }

    refs.connectionModeAutoButton.addEventListener('click', () => {
        settings.connectionMode = 'auto';
        syncConnectionControls();
        onReconnect();
    });
    refs.connectionModeManualButton.addEventListener('click', () => {
        settings.connectionMode = 'manual';
        syncConnectionControls();
    });
    for (const [key, input] of [
        ['manualProtocol', refs.inputs.protocol],
        ['manualHost', refs.inputs.host],
        ['manualPort', refs.inputs.port],
        ['manualPath', refs.inputs.path]
    ]) {
        input.value = settings[key];
        input.addEventListener('change', () => {
            settings[key] = input.value.trim();
            saveSetting(key, settings[key]);
        });
    }
    for (const input of refs.settingInputs) {
        const key = input.dataset.setting;
        input.checked = Boolean(settings[key]);
        input.addEventListener('change', () => {
            settings[key] = input.checked;
            saveSetting(key, settings[key]);
            if (key.startsWith('table')) {
                syncTableVisibility();
                renderTable(store.state.currentSnapshot?.players || []);
            }
        });
    }
    refs.inputs.fontSize.value = String(settings.fontSize);
    refs.inputs.fontSize.addEventListener('change', () => {
        settings.fontSize = Math.min(32, Math.max(7, Number(refs.inputs.fontSize.value) || 11));
        refs.inputs.fontSize.value = String(settings.fontSize);
        saveSetting('fontSize', settings.fontSize);
    });
    refs.playerSelect.addEventListener('change', () => {
        store.selectPlayer(refs.playerSelect.value);
        settings.selectedPlayerId = store.state.selectedPlayerId;
        saveSetting('selectedPlayerId', settings.selectedPlayerId);
        updateFocus(store.state.currentSnapshot?.players || []);
    });
    refs.viewModeFreeButton.addEventListener('click', () => {
        onViewModeChange(VIEW_MODE_FREE);
        syncViewControls();
    });
    refs.viewModeFollowButton.addEventListener('click', () => {
        onViewModeChange(VIEW_MODE_FOLLOW);
        syncViewControls();
    });
    refs.reconnectButton.addEventListener('click', onReconnect);
    refs.configReconnectButton.addEventListener('click', onReconnect);
    refs.importPlayerDataButton.addEventListener('click', () => {
        refs.playerDataMessage.hidden = true;
        refs.importPlayerDataInput.click();
    });
    refs.importPlayerDataInput.addEventListener('change', async () => {
        const file = refs.importPlayerDataInput.files?.[0];
        refs.importPlayerDataInput.value = '';
        if (!file) return;
        if (!isJsonFileName(file.name)) {
            showPlayerDataMessage('error', t('table.importJsonOnly'));
            return;
        }
        try {
            const raw = await file.text();
            const playerCount = await onImportPlayerData(raw);
            showPlayerDataMessage('success', t('table.importSuccess', { count: playerCount }));
        } catch {
            showPlayerDataMessage('error', t('table.importInvalid'));
        }
    });
    refs.exportPlayerDataButton.addEventListener('click', () => {
        if (!store.state.latestMessageText) return;
        const blob = new Blob([store.state.latestMessageText], { type: 'application/json;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = currentPlayerExportFileName();
        link.click();
        URL.revokeObjectURL(link.href);
    });

    window.addEventListener('resize', scheduleLayoutSync);
    if (typeof DESKTOP_QUERY.addEventListener === 'function') DESKTOP_QUERY.addEventListener('change', scheduleLayoutSync);
    if ('ResizeObserver' in window) new ResizeObserver(scheduleLayoutSync).observe(refs.layout);
    document.fonts?.ready.then(scheduleLayoutSync);

    syncConnectionControls();
    syncViewControls();
    syncTableVisibility();

    return { updateSnapshot, updateFocus, renderTable, syncViewControls, syncDesktopLayout };
}
