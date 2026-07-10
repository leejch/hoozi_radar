export const DEFAULT_LOCAL_WS_PATH = '/ws';
export const R2_STATIC_BASE_URL = 'https://img.hoozi.net/static/';
export const LOCAL_STATIC_BASE_URL = 'static/';
export const R2_LEGEND_ICON_BASE_URL = 'https://img.hoozi.net/icon_legends/';
export const LOCAL_LEGEND_ICON_BASE_URL = './res/icon_legends/';
export const R2_RANK_ICON_BASE_URL = 'https://img.hoozi.net/icon_rank/';
export const LOCAL_RANK_ICON_BASE_URL = './res/icon_rank/';
export const STATIC_SOURCE_URLS = Object.freeze({
    remote: R2_STATIC_BASE_URL,
    local: LOCAL_STATIC_BASE_URL
});
export const ICON_SOURCE_URLS = Object.freeze({
    legend: Object.freeze({
        remote: R2_LEGEND_ICON_BASE_URL,
        local: LOCAL_LEGEND_ICON_BASE_URL
    }),
    rank: Object.freeze({
        remote: R2_RANK_ICON_BASE_URL,
        local: LOCAL_RANK_ICON_BASE_URL
    })
});
export const LOCAL_DEFAULT_HOST = '127.0.0.1';
export const DEFAULT_LOCAL_WS_TARGET = `ws://127.0.0.1:9001${DEFAULT_LOCAL_WS_PATH}`;
export const DEFAULT_WS_PORT = '9001';
export const DEFAULT_WSS_PORT = '443';
export const DEFAULT_WS_PATH = DEFAULT_LOCAL_WS_PATH;
export const MAP_SIDE = 1000;
export const MIN_SCALE = 0.5;
export const MAX_SCALE = 3;
export const VIEW_MODE_FOLLOW = 'follow';
export const VIEW_MODE_FREE = 'free';
export const LAYOUT_ORIENTATION_LANDSCAPE = 'landscape';
export const LAYOUT_ORIENTATION_PORTRAIT = 'portrait';

export const TEAM_PALETTE = Object.freeze([
    '#F87171', '#34D399', '#60A5FA', '#FBBF24', '#2DD4BF', '#A855F7', '#F97316', '#38BDF8',
    '#22C55E', '#F472B6', '#A3A3A3', '#FDE68A', '#F9A8D4', '#C4B5FD', '#A7F3D0', '#7DD3FC',
    '#FDBA74', '#86EFAC', '#FCA5A5', '#FACC15', '#67E8F9', '#E9D5FF', '#F0ABFC', '#BBF7D0',
    '#93C5FD', '#FECACA', '#FCD34D', '#FBCFE8', '#C7D2FE', '#A5F3FC'
]);

export const DEFAULT_SETTINGS = Object.freeze({
    connectionMode: 'auto',
    manualProtocol: 'ws',
    manualHost: '127.0.0.1',
    manualPort: DEFAULT_WS_PORT,
    manualPath: DEFAULT_WS_PATH,
    fontSize: 10,
    showName: false,
    showLegend: false,
    showVitals: true,
    showLevel: false,
    showRank: false,
    showCombat: false,
    showRoster: true,
    showTeamLinks: true,
    showRing: true,
    showDead: false,
    showDown: true,
    menuVisible: true,
    tableVisible: true,
    tableTeam: true,
    tableName: true,
    tableLevel: true,
    tableLegend: true,
    tableLegendIconKey: true,
    tableRank: true,
    tableRankIconKey: true,
    tableDamage: true,
    tableKills: true,
    tableVitals: true,
    tableDead: true,
    tableDown: true,
    tableUid: true,
    tableUidLong: true,
    // rank_color is preserved in normalized/exported state but no longer shown
    // as a visible table field.
    // tableRankColor: true,
    // Removed from the visible table controls by request. Exported JSON still
    // preserves these raw backend fields when they are present.
    // tableId: true,
    // tableIndex: true,
    // tableSelf: true,
    // tableSquad: true,
    // tableX: true,
    // tableY: true,
    // tableYaw: true,
    // tableMaxHp: true,
    selectedPlayerId: '',
    viewMode: VIEW_MODE_FOLLOW,
    layoutOrientation: LAYOUT_ORIENTATION_LANDSCAPE
});

const STORAGE_PREFIX = 'hoozi3_radar_';
const SETTINGS_SCHEMA_VERSION = '6';
const RESET_TO_DEFAULT_ON_SCHEMA_UPDATE = Object.freeze([
    'showName',
    'showLegend',
    'showVitals',
    'showLevel',
    'showRank',
    'showCombat',
    'showDead',
    'showDown',
    'manualProtocol',
    'manualPort',
    'manualPath'
]);

function browserLocation() {
    return typeof window !== 'undefined' && window.location ? window.location : null;
}

export function isHttpsLocation(location = browserLocation()) {
    return location?.protocol === 'https:';
}

export function staticSourceOrderForLocation(location = browserLocation()) {
    return isHttpsLocation(location) ? ['remote', 'local'] : ['local', 'remote'];
}

export function staticSourcesForLocation(location = browserLocation()) {
    return Object.freeze(staticSourceOrderForLocation(location).map((key) => Object.freeze({
        key,
        baseUrl: STATIC_SOURCE_URLS[key]
    })));
}

export const STATIC_SOURCES = staticSourcesForLocation();

export function iconSourcesForKind(kind, location = browserLocation()) {
    const urls = ICON_SOURCE_URLS[kind];
    if (!urls) return Object.freeze([]);
    return Object.freeze(staticSourceOrderForLocation(location).map((key) => Object.freeze({
        key,
        baseUrl: urls[key]
    })));
}

export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function clampScale(value) {
    return Number.isFinite(value) ? clamp(value, MIN_SCALE, MAX_SCALE) : MIN_SCALE;
}

export function normalizeViewMode(value) {
    return value === VIEW_MODE_FREE ? VIEW_MODE_FREE : VIEW_MODE_FOLLOW;
}

export function normalizeLayoutOrientation(value) {
    return value === LAYOUT_ORIENTATION_PORTRAIT
        ? LAYOUT_ORIENTATION_PORTRAIT
        : LAYOUT_ORIENTATION_LANDSCAPE;
}

export function defaultScaleForMode(mode) {
    return mode === VIEW_MODE_FOLLOW ? 1.5 : 1;
}

export function teamColorFor(team) {
    const numericTeam = Number(team);
    if (!Number.isFinite(numericTeam)) return '#93C5FD';
    return TEAM_PALETTE[Math.abs(Math.trunc(numericTeam)) % TEAM_PALETTE.length];
}

function readStoredValue(key, fallback) {
    const value = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (value === null) return fallback;
    if (typeof fallback === 'boolean') return value === 'true';
    if (typeof fallback === 'number') {
        const number = Number(value);
        return Number.isFinite(number) ? number : fallback;
    }
    return value;
}

export function loadSettings() {
    const settings = {};
    for (const [key, fallback] of Object.entries(DEFAULT_SETTINGS)) {
        settings[key] = readStoredValue(key, fallback);
    }
    if (localStorage.getItem(`${STORAGE_PREFIX}schemaVersion`) !== SETTINGS_SCHEMA_VERSION) {
        for (const key of RESET_TO_DEFAULT_ON_SCHEMA_UPDATE) {
            settings[key] = DEFAULT_SETTINGS[key];
            localStorage.setItem(`${STORAGE_PREFIX}${key}`, String(DEFAULT_SETTINGS[key]));
        }
        for (const key of Object.keys(DEFAULT_SETTINGS)) {
            if (!key.startsWith('table') || key === 'tableVisible') continue;
            settings[key] = true;
            localStorage.setItem(`${STORAGE_PREFIX}${key}`, 'true');
        }
        localStorage.setItem(`${STORAGE_PREFIX}schemaVersion`, SETTINGS_SCHEMA_VERSION);
    }
    // Every page load starts in automatic local-bridge mode. Manual endpoint
    // fields remain persisted, but selecting Manual is intentionally session-only.
    settings.connectionMode = 'auto';
    const httpsAccess = isHttpsLocation();
    settings.manualProtocol = httpsAccess ? 'wss' : 'ws';
    settings.manualHost = String(settings.manualHost || DEFAULT_SETTINGS.manualHost).trim();
    settings.manualPort = defaultManualPortForProtocol(settings.manualProtocol);
    settings.manualPath = normalizeWebSocketPath(settings.manualPath || DEFAULT_SETTINGS.manualPath);
    settings.fontSize = clamp(Math.round(Number(settings.fontSize) || DEFAULT_SETTINGS.fontSize), 7, 32);
    settings.layoutOrientation = normalizeLayoutOrientation(settings.layoutOrientation);
    settings.showDead = false;
    settings.showDown = true;
    // Every page load starts in fixed-follow mode. View-mode changes are
    // intentionally session-only so an old persisted free-view choice cannot
    // move the focus away from the local player on the next launch.
    settings.viewMode = VIEW_MODE_FOLLOW;
    return settings;
}

export function saveSetting(key, value) {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, String(value));
}

export function normalizeWebSocketPath(value) {
    const path = String(value || '').trim();
    if (!path || path === '/') return '';
    return path.startsWith('/') ? path : `/${path}`;
}

export function normalizeManualTargetValue(value) {
    const target = String(value || '').trim();
    return target.toLowerCase() === 'auto' ? '' : target;
}

export function buildAutomaticWebSocketTarget(location = browserLocation()) {
    if (isHttpsLocation(location)) {
        const hostname = String(location?.hostname || '').trim() || LOCAL_DEFAULT_HOST;
        return `wss://${hostname}${DEFAULT_WS_PATH}`;
    }
    return DEFAULT_LOCAL_WS_TARGET;
}

export function defaultManualPortForProtocol(protocol, location = browserLocation()) {
    if (isHttpsLocation(location)) return DEFAULT_WSS_PORT;
    return protocol === 'wss' ? DEFAULT_WSS_PORT : DEFAULT_WS_PORT;
}

export function buildManualWebSocketTarget(settings, location = browserLocation()) {
    const httpsAccess = isHttpsLocation(location);
    const protocol = httpsAccess || settings.manualProtocol === 'wss' ? 'wss' : 'ws';
    const host = normalizeManualTargetValue(settings.manualHost);
    if (!host) return buildAutomaticWebSocketTarget(location);
    if (/^wss?:\/\//i.test(host)) return httpsAccess ? host.replace(/^ws:/i, 'wss:') : host;
    const port = String(settings.manualPort || '').trim();
    const path = normalizeWebSocketPath(settings.manualPath);
    return `${protocol}://${host}${port ? `:${port}` : ''}${path}`;
}

export function getConnectionTarget(settings, location = browserLocation()) {
    return settings.connectionMode === 'manual'
        ? buildManualWebSocketTarget(settings, location)
        : buildAutomaticWebSocketTarget(location);
}

export function createInitialConnectionGate() {
    let pending = true;
    return {
        cancel() {
            pending = false;
        },
        take() {
            if (!pending) return false;
            pending = false;
            return true;
        },
        get pending() {
            return pending;
        }
    };
}

