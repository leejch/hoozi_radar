export const CDN_STATIC_BASE_URL = 'https://img.hoozi.net/static/';
export const LOCAL_STATIC_BASE_URL = './static/';
export const STATIC_SOURCES = Object.freeze([
    { key: 'cdn', baseUrl: CDN_STATIC_BASE_URL },
    { key: 'local', baseUrl: LOCAL_STATIC_BASE_URL }
]);

export const DEFAULT_LOCAL_WS_TARGET = 'ws://127.0.0.1:9001';
export const DEFAULT_WS_PORT = '9001';
export const DEFAULT_WSS_PORT = '443';
export const MAP_SIDE = 1000;
export const MIN_SCALE = 1;
export const MAX_SCALE = 3;
export const VIEW_MODE_FOLLOW = 'follow';
export const VIEW_MODE_FREE = 'free';

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
    manualPath: '',
    fontSize: 11,
    showName: true,
    showLegend: true,
    showHealth: true,
    showShield: true,
    showLevel: true,
    showRank: true,
    showCombat: true,
    showRoster: true,
    showTeamLinks: true,
    showRing: true,
    showDead: true,
    showDown: true,
    tableVisible: true,
    tableSelf: true,
    tableId: true,
    tableIndex: true,
    tableTeam: true,
    tableSquad: true,
    tableName: true,
    tableLegend: true,
    tableLegendIconKey: true,
    tableUid: true,
    tableHp: true,
    tableMaxHp: true,
    tableShield: true,
    tableMaxShield: true,
    tableDistance: true,
    tableYaw: true,
    tableDead: true,
    tableDown: true,
    tableLevel: true,
    tableRank: true,
    tableRankIconKey: true,
    tableRankColor: true,
    tableKills: true,
    tableDamage: true,
    tableRoster: true,
    selectedPlayerId: '',
    viewMode: VIEW_MODE_FOLLOW
});

const STORAGE_PREFIX = 'hoozi3_radar_';
const SETTINGS_SCHEMA_VERSION = '2';

export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function clampScale(value) {
    return Number.isFinite(value) ? clamp(value, MIN_SCALE, MAX_SCALE) : MIN_SCALE;
}

export function normalizeViewMode(value) {
    return value === VIEW_MODE_FREE ? VIEW_MODE_FREE : VIEW_MODE_FOLLOW;
}

export function defaultScaleForMode() {
    return MIN_SCALE;
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
        for (const key of Object.keys(DEFAULT_SETTINGS)) {
            if (!key.startsWith('table') || key === 'tableVisible') continue;
            settings[key] = true;
            localStorage.setItem(`${STORAGE_PREFIX}${key}`, 'true');
        }
        localStorage.setItem(`${STORAGE_PREFIX}schemaVersion`, SETTINGS_SCHEMA_VERSION);
    }
    settings.connectionMode = settings.connectionMode === 'manual' ? 'manual' : 'auto';
    settings.manualProtocol = settings.manualProtocol === 'wss' ? 'wss' : 'ws';
    settings.manualHost = String(settings.manualHost || DEFAULT_SETTINGS.manualHost).trim();
    settings.manualPort = String(settings.manualPort || '').trim();
    settings.manualPath = normalizeWebSocketPath(settings.manualPath);
    settings.fontSize = clamp(Math.round(Number(settings.fontSize) || DEFAULT_SETTINGS.fontSize), 7, 32);
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

export function buildManualWebSocketTarget(settings) {
    const protocol = settings.manualProtocol === 'wss' ? 'wss' : 'ws';
    const host = String(settings.manualHost || '').trim();
    const port = String(settings.manualPort || '').trim();
    const path = normalizeWebSocketPath(settings.manualPath);
    if (!host) return null;
    return `${protocol}://${host}${port ? `:${port}` : ''}${path}`;
}

export function getConnectionTarget(settings) {
    return settings.connectionMode === 'manual'
        ? buildManualWebSocketTarget(settings)
        : DEFAULT_LOCAL_WS_TARGET;
}

