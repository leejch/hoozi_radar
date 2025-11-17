import { AVAILABLE_MAP_IDS, normalizeMapId } from './config.js';

export const state = {
    socket: null,
    players: [],
    mapId: null,
    mapLoaded: false,
    manualMapId: null,
    latestWsMapId: null,
    mapAuto: true,
    canvasCssWidth: 0,
    canvasCssHeight: 0,
    canvasDeviceWidth: 0,
    canvasDeviceHeight: 0,
    pixelRatio: window.devicePixelRatio || 1,
    isSelectingPlayer: false,
    viewport: { scale: 1, translateX: 0, translateY: 0 },
    isConnected: false,
    playerTableSignature: null,
    latestMessageText: '',
    playerTableHasColumns: false
};

export function readSetting(key, fallback) {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    if (typeof fallback === 'boolean') {
        return stored === 'true';
    }
    if (typeof fallback === 'number') {
        const parsed = Number(stored);
        return Number.isFinite(parsed) ? parsed : fallback;
    }
    return stored;
}

export const settings = {
    ipaddr: readSetting('conf_ipaddr', 'auto'),
    manualMapId: readSetting('conf_manual_map', ''),
    mapAuto: readSetting('conf_map_auto', true),
    fontsize: readSetting('conf_fontsize', 10),
    gkill: readSetting('conf_gkill', 3),
    glevel: readSetting('conf_glevel', 250),
    showmp: readSetting('conf_showmp', false),
    showsp: readSetting('conf_showsp', false),
    showname: readSetting('conf_showname', false),
    showkprefix: readSetting('conf_showkprefix', false),
    showlprefix: readSetting('conf_showlprefix', false),
    showrankprefix: readSetting('conf_showrankprefix', false),
    showmprefix: readSetting('conf_showmprefix', true),
    showsprefix: readSetting('conf_showsprefix', true),
    tableTeam: readSetting('conf_table_team', true),
    tableName: readSetting('conf_table_name', true),
    tableUidShort: readSetting('conf_table_uid_short', true),
    tableUidLong: readSetting('conf_table_uid_long', false),
    tableLevel: readSetting('conf_table_level', true),
    tableRank: readSetting('conf_table_rank', true),
    tableKills: readSetting('conf_table_kills', true),
    tableMarks: readSetting('conf_table_marks', true),
    tableVisible: readSetting('conf_table_visible', true),
    selectedPlayer: readSetting('sel_player', '<hoozi>')
};

state.mapAuto = Boolean(settings.mapAuto);
if (state.mapAuto) {
    state.manualMapId = null;
    settings.manualMapId = '';
    localStorage.removeItem('conf_manual_map');
} else {
    const storedManualMapId = normalizeMapId(settings.manualMapId);
    if (storedManualMapId && AVAILABLE_MAP_IDS.includes(storedManualMapId)) {
        state.manualMapId = storedManualMapId;
        settings.manualMapId = storedManualMapId;
    } else {
        state.manualMapId = null;
        settings.manualMapId = '';
    }
}
