export const R2_STATIC_BASE_URL = 'https://img.hoozi.net/static/';
export const LOCAL_STATIC_BASE_URL = 'static/';
export const STATIC_SOURCE_URLS = {
    remote: R2_STATIC_BASE_URL,
    local: LOCAL_STATIC_BASE_URL
};

export const isHttpsAccess = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
export const STATIC_SOURCE_ORDER = isHttpsAccess ? ['remote', 'local'] : ['local', 'remote'];
export const DEFAULT_LOCAL_WS_TARGET = 'ws://127.0.0.1:2334/ws';

export const RAW_CANVAS_WIDTH = 1920;
export const RAW_CANVAS_HEIGHT = 1080;
export const RAW_OFFSET_LEFT = 454;
export const RAW_OFFSET_TOP = 0;
export const RAW_VISIBLE_WIDTH = 1015;
export const RAW_VISIBLE_HEIGHT = 1015;
export const DESKTOP_LEFT_COLUMN_WIDTH = 300;
export const DESKTOP_RIGHT_MIN_WIDTH = 320;
export const DESKTOP_MIN_MAP_SIZE = 320;
export const MIN_SCALE = 1.0;
export const MAX_SCALE = 3.0;

export const AVAILABLE_MAP_IDS = ['1', '2', '3', '4', '5', '6'];

export function clampScale(value) {
    if (!Number.isFinite(value)) {
        return MIN_SCALE;
    }
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

export function getEffectivePixelRatio() {
    const baseRatio = window.devicePixelRatio || 1;
    const viewport = window.visualViewport;
    const viewportScale = viewport && Number.isFinite(viewport.scale) && viewport.scale > 0 ? viewport.scale : 1;
    return Math.max(1, baseRatio * viewportScale);
}

export function normalizeMapId(value) {
    if (value === null || value === undefined) {
        return null;
    }
    const str = String(value).trim();
    return str === '' ? null : str;
}
