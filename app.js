/*
Copyright © hoozi.net. All Rights Reserved.
Unauthorized copying, modification, distribution, or use of any part of this project is strictly prohibited.
*/
const R2_STATIC_BASE_URL = 'https://img.hoozi.net/static/';
const LOCAL_STATIC_BASE_URL = 'static/';
const STATIC_SOURCE_URLS = {
    remote: R2_STATIC_BASE_URL,
    local: LOCAL_STATIC_BASE_URL
};
const isHttpsAccess = typeof window !== 'undefined' && window.location && window.location.protocol === 'https:';
const STATIC_SOURCE_ORDER = isHttpsAccess ? ['remote', 'local'] : ['local', 'remote'];
const DEFAULT_LOCAL_WS_TARGET = 'ws://127.0.0.1:2334/ws';
const CURRENT_HOSTNAME = typeof window !== 'undefined' && window.location ? window.location.hostname : '';
const CURRENT_HOST_WITH_PORT = typeof window !== 'undefined' && window.location ? window.location.host : '';
const DEFAULT_WS_PORT = '2334';
const DEFAULT_WSS_PORT = '443';
const DEFAULT_WS_PATH = '/ws';
const DEFAULT_WS_PROTOCOL = isHttpsAccess ? 'wss' : 'ws';
const LOCAL_DEFAULT_HOST = '127.0.0.1';

const translations = {
    'zh-Hans': {
        title: 'HOOZi 网页雷达',
        header: {
            title: 'HOOZi 网页雷达',
            connectionStatusLabel: '连接状态',
            viewModeFree: '自由视角',
            viewModeFollow: '固定跟随'
        },
        config: {
            connection: '连接配置',
            connectionAuto: '自动',
            connectionManual: '手动',
            protocol: '协议',
            host: 'IP地址/域名',
            port: '端口',
            path: '路径',
            ipPlaceholder: 'auto',
            ipHelper: 'auto自动, 或手动填写ws/wss地址',
            toggles: '地图绘制信息',
            toggleName: '昵称',
            toggleLevel: '等级',
            toggleRank: '段位',
            toggleKills: '击杀',
            toggleRoster: '名册',
            toggleSuspect: '嫌疑',
            quickFilter: '快捷过滤',
            filterOnlyMarks: '仅显示 权 / 作弊 / 白',
            filterOnlySuspicious: '仅显示 低等级 / 高击杀',
            fontSize: '字体大小',
            killsAtLeast: '击杀≥',
            levelBelow: '等级≤',
            downloadLatest: '导出玩家列表',
            playerTable: '玩家信息列表',
            playerTableShow: '显示'
        },
        map: {
            reconnect: '重连',
            playerCountLabel: '玩家',
            zoomReset: '重置',
            focusLabel: '焦点'
        },
        table: {
            title: '玩家信息',
            liveUpdate: '实时更新',
            columns: {
                team: '队伍',
                name: '昵称',
                uid: 'UID',
                uidShort: '短UID',
                uidLong: '长UID',
                level: '等级',
                rank: '段位',
                kills: '击杀',
                marks: '标记'
            },
            empty: '等待玩家数据'
        },
        footer: {
            copyright: 'Copyright © hoozi.net 版权所有',
            disclaimer: '所有其他商标、标志及著作权均为其各自所有者所有'
        },
        overlay: {
            waitingTitle: '等待连接',
            waitingSubtitle: '正在尝试连接数据服务',
            connectingTitle: '正在连接',
            connectingSubtitle: '正在连接 {target}',
            instructionsTitle: '未连接',
            instructionsSubtitle: '①启动游戏 ②打开HOOZi ③若为公网访问，需在副机启用FRP',
            noDataTitle: '等待玩家数据',
            noDataSubtitle: '当前地图暂无玩家数据或尚未同步',
            mapLoadingTitle: '加载高清地图资源',
            mapLoadingSubtitle: '由全球加速节点提供支持, 首次加载可能较慢',
            mapMissingTitle: '地图资源缺失',
            mapMissingSubtitle: '未找到地图文件',
            noTransferTitle: '未检测到对局数据',
            noTransferSubtitle: '已成功连接数据服务, 当前尚未进入大逃杀模式对局'
        },
        status: {
            waiting: '等待连接',
            connecting: '正在连接',
            connected: '已连接',
            disconnected: '未连接'
        },
        errors: {
            websocketCreate: '无法创建 WebSocket',
            websocketClose: '关闭连接时发生错误',
            parse: '无法解析服务器数据'
        },
        marks: {
            authority: '[权]',
            black: '[作弊]',
            white: '[白]',
            danger: '[危险]',
            highKills: '[高杀]',
            lowLevel: '[低级]',
            none: '—'
        },
        mapNames: {
            '1': '诸王峡谷',
            '2': '世界尽头',
            '3': '奥林匹斯',
            '4': '残月',
            '5': '风暴点',
            '6': '电气区'
        }
    },
    'zh-Hant': {
        title: 'HOOZi 網頁雷達',
        header: {
            title: 'HOOZi 網頁雷達',
            connectionStatusLabel: '連線狀態',
            viewModeFree: '自由視角',
            viewModeFollow: '固定跟隨'
        },
        config: {
            connection: '連線設定',
            connectionAuto: '自動',
            connectionManual: '手動',
            protocol: '協議',
            host: 'IP位址/網域',
            port: '連接埠',
            path: '路徑',
            ipPlaceholder: 'auto',
            ipHelper: 'auto自動, 或手動填寫ws/wss地址',
            toggles: '地圖繪製資訊',
            toggleName: '暱稱',
            toggleLevel: '等級',
            toggleRank: '段位',
            toggleKills: '擊殺',
            toggleRoster: '名冊',
            toggleSuspect: '嫌疑',
            quickFilter: '快捷篩選',
            filterOnlyMarks: '僅顯示 權 / 作弊 / 白',
            filterOnlySuspicious: '僅顯示 低等級 / 高擊殺',
            fontSize: '字體大小',
            killsAtLeast: '擊殺≥',
            levelBelow: '等級≤',
            downloadLatest: '匯出玩家列表',
            playerTable: '玩家資訊列表',
            playerTableShow: '顯示'
        },
        map: {
            reconnect: '重新連線',
            playerCountLabel: '玩家',
            zoomReset: '重設',
            focusLabel: '焦點'
        },
        table: {
            title: '玩家資訊',
            liveUpdate: '即時更新',
            columns: {
                team: '隊伍',
                name: '暱稱',
                uid: 'UID',
                uidShort: '短UID',
                uidLong: '長UID',
                level: '等級',
                rank: '段位',
                kills: '擊殺',
                marks: '標記'
            },
            empty: '等待玩家資料'
        },
        footer: {
            copyright: 'Copyright © hoozi.net 版權所有',
            disclaimer: '所有其他商標、標誌及著作權皆為其各自所有者所有'
        },
        overlay: {
            waitingTitle: '等待連線',
            waitingSubtitle: '正在嘗試與伺服器建立通訊',
            connectingTitle: '正在連線',
            connectingSubtitle: '正在連線 {target}',
            instructionsTitle: '未連線',
            instructionsSubtitle: '①啟動遊戲 ②開啟HOOZi ③若為公網訪問，需在副機啟用FRP',
            noDataTitle: '等待玩家資料',
            noDataSubtitle: '目前地圖暫無玩家資料或尚未同步',
            mapLoadingTitle: '載入高畫質地圖資源',
            mapLoadingSubtitle: '由全球加速網路提供支援, 首次載入可能稍慢',
            mapMissingTitle: '地圖資源缺失',
            mapMissingSubtitle: '找不到地圖檔案',
            noTransferTitle: '未偵測到對局資料',
            noTransferSubtitle: '已成功連線資料服務, 目前尚未進入大逃殺模式對局'
        },
        status: {
            waiting: '等待連線',
            connecting: '正在連線',
            connected: '已連線',
            disconnected: '未連線'
        },
        errors: {
            websocketCreate: '無法建立 WebSocket',
            websocketClose: '關閉連線時發生錯誤',
            parse: '無法解析伺服器資料'
        },
        marks: {
            authority: '[權]',
            black: '[作弊]',
            white: '[白]',
            danger: '[危險]',
            highKills: '[高殺]',
            lowLevel: '[低級]',
            none: '—'
        },
        mapNames: {
            '1': '王者峽谷',
            '2': '世界邊緣',
            '3': '奧林匹斯',
            '4': '殘月',
            '5': '暴風點',
            '6': '電流區'
        }
    },
    en: {
        title: 'HOOZi Radar',
        header: {
            title: 'HOOZi Radar',
            connectionStatusLabel: 'Status',
            viewModeFree: 'Free',
            viewModeFollow: 'Follow'
        },
        config: {
            connection: 'Connection',
            connectionAuto: 'Auto',
            connectionManual: 'Manual',
            protocol: 'Protocol',
            host: 'Host / Domain',
            port: 'Port',
            path: 'Path',
            ipPlaceholder: 'auto',
            ipHelper: 'Use auto or enter a ws/wss address manually',
            toggles: 'Map Overlay Info',
            toggleName: 'Name',
            toggleLevel: 'Level',
            toggleRank: 'Rank',
            toggleKills: 'Kills',
            toggleRoster: 'Roster',
            toggleSuspect: 'Suspect',
            quickFilter: 'Quick Filters',
            filterOnlyMarks: 'Show only Pro / Cheater / White',
            filterOnlySuspicious: 'Show only Low Level / High Kills',
            fontSize: 'Font Size',
            killsAtLeast: 'Kills ≥',
            levelBelow: 'Level ≤',
            downloadLatest: 'Export Players',
            playerTable: 'Player List Fields',
            playerTableShow: 'Show'
        },
        map: {
            reconnect: 'Reconnect',
            playerCountLabel: 'Players',
            zoomReset: 'Reset',
            focusLabel: 'Focus'
        },
        table: {
            title: 'Player Info',
            liveUpdate: 'Live Update',
            columns: {
                team: 'Team',
                name: 'Name',
                uid: 'UID',
                uidShort: 'Short UID',
                uidLong: 'Long UID',
                level: 'Level',
                rank: 'Rank',
                kills: 'Kills',
                marks: 'Tags'
            },
            empty: 'Waiting for player data'
        },
        footer: {
            copyright: 'Copyright © hoozi.net. All rights reserved.',
            disclaimer: 'All other trademarks, logos, and copyrights belong to their respective owners.'
        },
        overlay: {
            waitingTitle: 'Waiting to Connect',
            waitingSubtitle: 'Attempting to connect to the data service',
            connectingTitle: 'Connecting',
            connectingSubtitle: 'Connecting to {target}',
            instructionsTitle: 'Not Connected',
            instructionsSubtitle: '① Start the game ② Launch HOOZi ③ For public network access, enable FRP on the secondary PC',
            noDataTitle: 'Waiting for player data',
            noDataSubtitle: 'No player data available or not yet synced for this map',
            mapLoadingTitle: 'Loading High-Resolution Map',
            mapLoadingSubtitle: 'Delivery is optimized through a global acceleration network',
            mapMissingTitle: 'Map Asset Missing',
            mapMissingSubtitle: 'No Map file found',
            noTransferTitle: 'No Match Data Detected',
            noTransferSubtitle: 'Connected successfully, but you are not in a Battle Royale match yet'
        },
        status: {
            waiting: 'Waiting to connect',
            connecting: 'Connecting',
            connected: 'Connected',
            disconnected: 'Disconnected'
        },
        errors: {
            websocketCreate: 'Unable to create WebSocket',
            websocketClose: 'Error while closing connection',
            parse: 'Failed to parse server data'
        },
        marks: {
            authority: '[Pro]',
            black: '[Cheater]',
            white: '[White]',
            danger: '[Danger]',
            highKills: '[High Kills]',
            lowLevel: '[Low Level]',
            none: '—'
        },
        mapNames: {
            '1': 'Kings Canyon',
            '2': "World's Edge",
            '3': 'Olympus',
            '4': 'Broken Moon',
            '5': 'Storm Point',
            '6': 'E-District'
        }
    }
};

function getBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    if (lang.startsWith('zh-TW') || lang.startsWith('zh-HK')) {
        return 'zh-Hant';
    } else if (lang.startsWith('zh')) {
        return 'zh-Hans';
    } else {
        return 'en';
    }
}

const fallbackLanguage = 'en';
const detectedLanguage = getBrowserLanguage();
const activeLanguage = translations[detectedLanguage] ? detectedLanguage : fallbackLanguage;
const locale = translations[activeLanguage];

function resolveTranslation(source, path) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source);
}

function t(path, replacements = {}) {
    const value = resolveTranslation(locale, path);
    if (typeof value === 'string') {
        return value.replace(/\{(\w+)\}/g, (match, token) => {
            return Object.prototype.hasOwnProperty.call(replacements, token) ? replacements[token] : match;
        });
    }
    return value;
}

const doc = document;
const RAW_CANVAS_WIDTH = 1920;
const RAW_CANVAS_HEIGHT = 1080;
const RAW_OFFSET_LEFT = 454;
const RAW_OFFSET_TOP = 0;
const RAW_VISIBLE_WIDTH = 1015;
const RAW_VISIBLE_HEIGHT = 1015;
const DESKTOP_LEFT_COLUMN_WIDTH_WITH_TABLE = 320;
const DESKTOP_LEFT_COLUMN_WIDTH_WITHOUT_TABLE = 300;
const DESKTOP_RIGHT_MIN_WIDTH = 320;
const DESKTOP_MIN_MAP_SIZE = 320;
const MIN_SCALE = 1.0;
const MAX_SCALE = 3.0;
const VIEW_MODE_FOLLOW = 'follow';
const VIEW_MODE_FREE = 'free';

function normalizeViewMode(value) {
    return value === VIEW_MODE_FREE ? VIEW_MODE_FREE : VIEW_MODE_FOLLOW;
}

function getDefaultScaleForMode(mode) {
    return mode === VIEW_MODE_FREE ? 1 : 1.5;
}

function clampScale(value) {
    if (!Number.isFinite(value)) {
        return MIN_SCALE;
    }
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}
function getEffectivePixelRatio() {
    const baseRatio = window.devicePixelRatio || 1;
    const viewport = window.visualViewport;
    const viewportScale = viewport && Number.isFinite(viewport.scale) && viewport.scale > 0 ? viewport.scale : 1;
    return Math.max(1, baseRatio * viewportScale);
}

function normalizeMapId(value) {
    if (value === null || value === undefined) {
        return null;
    }
    const str = String(value).trim();
    return str === '' ? null : str;
}

function isNoTransferMapId(mapId) {
    return mapId === '0';
}

const refs = {
    layout: doc.querySelector('[data-role="layout"]'),
    brandLogo: doc.querySelector('[data-role="brand-logo"]'),
    header: doc.querySelector('header'),
    footer: doc.querySelector('footer'),
    statusIndicator: doc.querySelector('[data-role="status-indicator"]'),
    statusText: doc.querySelector('[data-role="status-text"]'),
    playerSelect: doc.getElementById('sel_player'),
    viewModeFreeButton: doc.getElementById('viewModeFree'),
    viewModeFollowButton: doc.getElementById('viewModeFollow'),
    mapStage: doc.getElementById('mapStage'),
    mapStageContainer: doc.querySelector('.map-stage-container'),
    mapControls: doc.getElementById('mapControls'),
    mapControlsOutlet: doc.querySelector('[data-role="map-controls-outlet"]'),
    mapViewport: doc.getElementById('mapViewport'),
    mapImage: doc.getElementById('mapImage'),
    mapCanvas: doc.getElementById('mapCanvas'),
    mapOverlay: doc.getElementById('mapOverlay'),
    overlayTitle: doc.getElementById('overlayTitle'),
    overlaySubtitle: doc.getElementById('overlaySubtitle'),
    playerCount: doc.getElementById('playerCount'),
    focusName: doc.getElementById('focusPlayerName'),
    focusTeamBadge: doc.getElementById('focusTeamBadge'),
    focusMeta: doc.getElementById('focusMeta'),
    zoomReset: doc.getElementById('zoomReset'),
    reconnectButton: doc.getElementById('reconnectButton'),
    configReconnectButton: doc.getElementById('configReconnectButton'),
    connectionModeAutoButton: doc.getElementById('connectionModeAuto'),
    connectionModeManualButton: doc.getElementById('connectionModeManual'),
    connectionManualFields: doc.querySelector('[data-role="connection-manual-fields"]'),
    downloadLatestButton: doc.getElementById('downloadLatestButton'),
    configColumn: doc.querySelector('.config-column'),
    configStack: doc.querySelector('.config-stack'),
    mapShell: doc.querySelector('.map-shell'),
    playerTableSection: doc.querySelector('[data-role="player-table-section"]'),
    playerTableShell: doc.querySelector('[data-role="player-table-shell"]'),
    playerTableWrapper: doc.querySelector('[data-role="player-table-wrapper"]'),
    playerTableScroll: doc.querySelector('[data-role="player-table-scroll"]'),
    playerTableHeader: doc.querySelector('[data-role="player-table-header"]'),
    playerTableBody: doc.querySelector('[data-role="player-table-body"]'),
    playerTableEmpty: doc.querySelector('[data-role="player-table-empty"]'),
    playerTableEmptyCell: doc.querySelector('[data-role="player-table-empty-cell"]'),
    playerTableToggle: doc.getElementById('conf_table_visible'),
    playerTableToggleLabel: doc.querySelector('[data-role="player-table-toggle-label"]'),
    inputs: {
        protocol: doc.getElementById('conf_protocol'),
        protocolReadonly: doc.getElementById('conf_protocol_readonly'),
        host: doc.getElementById('conf_host'),
        port: doc.getElementById('conf_port'),
        path: doc.getElementById('conf_path'),
        font: doc.getElementById('conf_fontsize'),
        gkill: doc.getElementById('conf_gkill'),
        glevel: doc.getElementById('conf_glevel'),
        showmp: doc.getElementById('conf_showmp'),
        showsp: doc.getElementById('conf_showsp'),
        showname: doc.getElementById('conf_showname'),
        showkprefix: doc.getElementById('conf_showkprefix'),
        showlprefix: doc.getElementById('conf_showlprefix'),
        showrankprefix: doc.getElementById('conf_showrankprefix'),
        showmprefix: doc.getElementById('conf_showmprefix'),
        showsprefix: doc.getElementById('conf_showsprefix'),
        tableTeam: doc.getElementById('conf_table_team'),
        tableName: doc.getElementById('conf_table_name'),
        tableUidShort: doc.getElementById('conf_table_uid_short'),
        tableUidLong: doc.getElementById('conf_table_uid_long'),
        tableLevel: doc.getElementById('conf_table_level'),
        tableRank: doc.getElementById('conf_table_rank'),
        tableKills: doc.getElementById('conf_table_kills'),
        tableMarks: doc.getElementById('conf_table_marks'),
        tableVisible: doc.getElementById('conf_table_visible')
    }
};

if (refs.mapImage) {
    refs.mapImage.referrerPolicy = 'origin';
}

function applyTranslations() {
    if (!locale) {
        return;
    }
    doc.documentElement.lang = activeLanguage;
    if (locale.title) {
        doc.title = locale.title;
    }
    doc.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.getAttribute('data-i18n');
        const translation = key ? t(key) : null;
        if (typeof translation === 'string') {
            element.textContent = translation;
        }
    });
    doc.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = key ? t(key) : null;
        if (typeof translation === 'string') {
            element.setAttribute('placeholder', translation);
        }
    });
}

applyTranslations();

const UID_MASK = BigInt('0xDEADBEEF1B4DF00D');

function extractUidString(raw) {
    if (raw === null || raw === undefined) {
        return '';
    }
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        return trimmed === '' ? '' : trimmed;
    }
    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) {
            return '';
        }
        return Math.trunc(raw).toString();
    }
    if (typeof raw === 'bigint') {
        return raw.toString();
    }
    return '';
}

function computeLongUidFromShort(shortUid) {
    if (!shortUid) {
        return '';
    }
    try {
        const value = BigInt(shortUid);
        const converted = BigInt.asUintN(64, value ^ UID_MASK);
        return converted.toString();
    } catch (error) {
        return '';
    }
}

function normalizePlayer(player) {
    if (!player || typeof player !== 'object') {
        return {
            uidShort: '',
            uidLong: '',
            uid: ''
        };
    }
    const normalized = { ...player };
    const uidShort = extractUidString(player.uid);
    normalized.uidShort = uidShort;
    normalized.uidLong = computeLongUidFromShort(uidShort);
    normalized.uid = uidShort;
    return normalized;
}

function normalizePlayers(players) {
    if (!Array.isArray(players)) {
        return [];
    }
    return players.map((player) => normalizePlayer(player));
}

const markLabels = {
    pro: t('marks.authority') || '[Auth]',
    black: t('marks.black') || '[Black]',
    white: t('marks.white') || '[White]',
    danger: t('marks.danger') || '[Danger]',
    highKills: t('marks.highKills') || '[High Kills]',
    lowLevel: t('marks.lowLevel') || '[Low Level]',
    none: t('marks.none') || '—'
};

const state = {
    socket: null,
    players: [],
    mapId: null,
    mapLoaded: false,
    canvasCssWidth: 0,
    canvasCssHeight: 0,
    canvasDeviceWidth: 0,
    canvasDeviceHeight: 0,
    pixelRatio: window.devicePixelRatio || 1,
    isSelectingPlayer: false,
    viewport: { scale: 1, translateX: 0, translateY: 0 },
    viewMode: VIEW_MODE_FOLLOW,
    isConnected: false,
    playerTableSignature: null,
    latestMessageText: '',
    playerTableHasColumns: false
};

const desktopQuery = window.matchMedia('(min-width: 1024px)');

let layoutRefreshScheduled = false;

const teamPalette = [
    '#F87171', '#34D399', '#60A5FA', '#FBBF24', '#2DD4BF', '#A855F7', '#F97316', '#38BDF8', '#22C55E', '#F472B6',
    '#A3A3A3', '#FDE68A', '#F9A8D4', '#C4B5FD', '#A7F3D0', '#7DD3FC', '#FDBA74', '#86EFAC', '#FCA5A5', '#FACC15',
    '#67E8F9', '#E9D5FF', '#F0ABFC', '#BBF7D0', '#93C5FD', '#FECACA', '#FCD34D', '#FBCFE8', '#C7D2FE', '#A5F3FC',
    '#FDBA74', '#86EFAC', '#FDE68A', '#F9A8D4', '#C4B5FD', '#D1D5DB', '#F472B6', '#FB7185', '#F97316', '#34D399',
    '#60A5FA'
];

const nameCollator = new Intl.Collator('zh-Hans-u-co-pinyin', {
    numeric: true,
    sensitivity: 'base'
});

function teamColorFor(teamId) {
    if (teamId === undefined || teamId === null) {
        return '#93C5FD';
    }
    const index = Math.abs(Number(teamId)) % teamPalette.length;
    return teamPalette[index];
}

function readSetting(key, fallback) {
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

const legacyIpaddr = readSetting('conf_ipaddr', 'auto');

function normalizeProtocolValue(value) {
    if (isHttpsAccess) {
        return 'wss';
    }
    return value === 'wss' ? 'wss' : 'ws';
}

function normalizePathValue(value) {
    const trimmed = (value || '').trim();
    if (!trimmed) {
        return DEFAULT_WS_PATH;
    }
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function getDefaultHost() {
    return isHttpsAccess ? (CURRENT_HOSTNAME || '') : LOCAL_DEFAULT_HOST;
}

function getDefaultPortForProtocol(protocol) {
    return protocol === 'wss' ? DEFAULT_WSS_PORT : DEFAULT_WS_PORT;
}

function composeManualTarget(parts) {
    const path = normalizePathValue(parts.path);
    return `${parts.protocol}://${parts.host}:${parts.port}${path}`;
}

function normalizeManualSettings({ syncInputs = true, persist = true } = {}) {
    const previousProtocol = settings.manualProtocol;
    settings.manualProtocol = normalizeProtocolValue(settings.manualProtocol);
    const protocolChanged = settings.manualProtocol !== previousProtocol;
    settings.manualHost = (settings.manualHost || '').trim() || getDefaultHost();
    const fallbackPort = getDefaultPortForProtocol(settings.manualProtocol);
    const rawPort = String(settings.manualPort || '').trim();
    const shouldResetForHttps = isHttpsAccess && settings.manualProtocol === 'wss' && (!rawPort || rawPort === DEFAULT_WS_PORT);
    const shouldUseDefaultPort = protocolChanged || shouldResetForHttps;
    settings.manualPort = shouldUseDefaultPort ? fallbackPort : (rawPort || fallbackPort);
    settings.manualPath = normalizePathValue(settings.manualPath);

    const payload = {
        protocol: settings.manualProtocol,
        host: settings.manualHost,
        port: settings.manualPort,
        path: settings.manualPath
    };

    if (persist) {
        localStorage.setItem('conf_manual_protocol', payload.protocol);
        localStorage.setItem('conf_manual_host', payload.host);
        localStorage.setItem('conf_manual_port', payload.port);
        localStorage.setItem('conf_manual_path', payload.path);
        if (settings.connectionMode === 'manual') {
            localStorage.setItem('conf_ipaddr', composeManualTarget(payload));
        }
    }

    if (syncInputs) {
        if (!isHttpsAccess && refs.inputs.protocol) {
            refs.inputs.protocol.value = payload.protocol;
        }
        if (refs.inputs.protocolReadonly) {
            refs.inputs.protocolReadonly.textContent = 'wss';
        }
        if (refs.inputs.host) {
            refs.inputs.host.value = payload.host;
        }
        if (refs.inputs.port) {
            refs.inputs.port.value = payload.port;
        }
        if (refs.inputs.path) {
            refs.inputs.path.value = payload.path;
        }
    }

    return payload;
}

function applyLegacyIpaddr(raw) {
    const value = (raw || '').trim();
    if (!value || value.toLowerCase() === 'auto') {
        return;
    }

    const withScheme = /^wss?:\/\//i.test(value) ? value : `${DEFAULT_WS_PROTOCOL}://${value}`;
    try {
        const parsed = new URL(withScheme);
        settings.manualProtocol = normalizeProtocolValue(parsed.protocol.replace(':', ''));
        settings.manualHost = parsed.hostname || settings.manualHost;
        settings.manualPort = parsed.port || settings.manualPort;
        settings.manualPath = parsed.pathname || settings.manualPath;
        return;
    } catch (error) {
        // Fall back to best-effort parsing
    }

    const stripped = value.replace(/^wss?:\/\//i, '');
    const [hostWithPort, ...pathParts] = stripped.split('/');
    const [hostPart, portPart] = hostWithPort.split(':');
    settings.manualHost = hostPart || settings.manualHost;
    if (portPart) {
        settings.manualPort = portPart;
    }
    if (pathParts.length) {
        settings.manualPath = `/${pathParts.join('/')}`;
    }
}

const settings = {
    connectionMode: readSetting('conf_connection_mode', null),
    manualProtocol: readSetting('conf_manual_protocol', DEFAULT_WS_PROTOCOL),
    manualHost: readSetting('conf_manual_host', isHttpsAccess ? (CURRENT_HOSTNAME || '') : LOCAL_DEFAULT_HOST),
    manualPort: readSetting('conf_manual_port', getDefaultPortForProtocol(DEFAULT_WS_PROTOCOL)),
    manualPath: readSetting('conf_manual_path', DEFAULT_WS_PATH),
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
    tableUidLong: readSetting('conf_table_uid_long', true),
    tableLevel: readSetting('conf_table_level', true),
    tableRank: readSetting('conf_table_rank', true),
    tableKills: readSetting('conf_table_kills', true),
    tableMarks: readSetting('conf_table_marks', true),
    tableVisible: readSetting('conf_table_visible', true),
    selectedPlayer: readSetting('sel_player', '<hoozi>'),
    viewMode: normalizeViewMode(readSetting('view_mode', VIEW_MODE_FOLLOW))
};

if (settings.connectionMode !== 'manual' && settings.connectionMode !== 'auto') {
    settings.connectionMode = legacyIpaddr && legacyIpaddr !== 'auto' ? 'manual' : 'auto';
}

if (settings.connectionMode === 'manual' && legacyIpaddr && legacyIpaddr !== 'auto') {
    applyLegacyIpaddr(legacyIpaddr);
}

normalizeManualSettings({ syncInputs: false, persist: false });

state.viewMode = settings.viewMode;
state.viewport.scale = clampScale(getDefaultScaleForMode(state.viewMode));

// Initialize input values
if (settings.connectionMode === 'auto') {
    localStorage.setItem('conf_ipaddr', 'auto');
}
normalizeManualSettings();
localStorage.setItem('conf_connection_mode', settings.connectionMode);
refs.inputs.font.value = settings.fontsize;
refs.inputs.gkill.value = settings.gkill;
refs.inputs.glevel.value = settings.glevel;
refs.inputs.showmp.checked = settings.showmp;
refs.inputs.showsp.checked = settings.showsp;
refs.inputs.showname.checked = settings.showname;
refs.inputs.showkprefix.checked = settings.showkprefix;
refs.inputs.showlprefix.checked = settings.showlprefix;
refs.inputs.showrankprefix.checked = settings.showrankprefix;
refs.inputs.showmprefix.checked = settings.showmprefix;
refs.inputs.showsprefix.checked = settings.showsprefix;
refs.inputs.tableTeam.checked = settings.tableTeam;
refs.inputs.tableName.checked = settings.tableName;
refs.inputs.tableUidShort.checked = settings.tableUidShort;
refs.inputs.tableUidLong.checked = settings.tableUidLong;
refs.inputs.tableLevel.checked = settings.tableLevel;
refs.inputs.tableRank.checked = settings.tableRank;
refs.inputs.tableKills.checked = settings.tableKills;
refs.inputs.tableMarks.checked = settings.tableMarks;
refs.inputs.tableVisible.checked = settings.tableVisible;

updateViewModeControls();
updateConnectionModeControls();

const playerTableColumns = [
    {
        id: 'team',
        settingKey: 'tableTeam',
        labelKey: 'table.columns.team',
        defaultLabel: 'Team',
        createCell(player) {
            const cell = doc.createElement('td');
            cell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm font-semibold text-slate-100';
            const wrapper = doc.createElement('div');
            wrapper.className = 'flex items-center gap-2';
            const badge = doc.createElement('span');
            badge.className = 'inline-flex size-2.5 rounded-full';
            badge.style.backgroundColor = teamColorFor(player.team);
            const text = doc.createElement('span');
            const team = Number.isFinite(Number(player.team)) ? Number(player.team) : null;
            text.textContent = team !== null ? String(team) : '—';
            wrapper.appendChild(badge);
            wrapper.appendChild(text);
            cell.appendChild(wrapper);
            return cell;
        }
    },
    {
        id: 'name',
        settingKey: 'tableName',
        labelKey: 'table.columns.name',
        defaultLabel: 'Name',
        createCell(player) {
            const cell = doc.createElement('td');
            cell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-100';
            const span = doc.createElement('span');
            span.className = 'block whitespace-nowrap';
            const displayName = typeof player.name === 'string' ? (player.name === '<hoozi>' ? 'hoozi' : player.name) : '—';
            span.textContent = displayName;
            cell.appendChild(span);
            return cell;
        }
    },
    {
        id: 'uidShort',
        settingKey: 'tableUidShort',
        labelKey: 'table.columns.uidShort',
        defaultLabel: 'Short UID',
        createCell(player) {
            const cell = doc.createElement('td');
            cell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200 font-mono';
            const value = typeof player.uidShort === 'string' && player.uidShort !== '' ? player.uidShort : '—';
            cell.textContent = value;
            return cell;
        }
    },
    {
        id: 'uidLong',
        settingKey: 'tableUidLong',
        labelKey: 'table.columns.uidLong',
        defaultLabel: 'Long UID',
        createCell(player) {
            const cell = doc.createElement('td');
            cell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200 font-mono';
            const value = typeof player.uidLong === 'string' && player.uidLong !== '' ? player.uidLong : '—';
            cell.textContent = value;
            return cell;
        }
    },
    {
        id: 'level',
        settingKey: 'tableLevel',
        labelKey: 'table.columns.level',
        defaultLabel: 'Level',
        createCell(player) {
            const cell = doc.createElement('td');
            cell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200';
            if (typeof player.level === 'number' && Number.isFinite(player.level)) {
                cell.textContent = String(player.level);
            } else {
                cell.textContent = '—';
            }
            return cell;
        }
    },
    {
        id: 'rank',
        settingKey: 'tableRank',
        labelKey: 'table.columns.rank',
        defaultLabel: 'Rank',
        createCell(player) {
            const cell = doc.createElement('td');
            cell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200';
            cell.textContent = player.rank ? String(player.rank) : '—';
            return cell;
        }
    },
    {
        id: 'kills',
        settingKey: 'tableKills',
        labelKey: 'table.columns.kills',
        defaultLabel: 'Kills',
        createCell(player) {
            const cell = doc.createElement('td');
            cell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200';
            if (typeof player.kills === 'number' && Number.isFinite(player.kills)) {
                cell.textContent = String(player.kills);
            } else {
                cell.textContent = '—';
            }
            return cell;
        }
    },
    {
        id: 'marks',
        settingKey: 'tableMarks',
        labelKey: 'table.columns.marks',
        defaultLabel: 'Tags',
        createCell(player) {
            const cell = doc.createElement('td');
            cell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200';
            const marks = [];
            if (player.pro) marks.push(markLabels.pro);
            if (player.black) marks.push(markLabels.black);
            if (player.white) marks.push(markLabels.white);
            const levelLow = typeof player.level === 'number' && Number.isFinite(player.level) && player.level <= settings.glevel;
            const killHigh = typeof player.kills === 'number' && Number.isFinite(player.kills) && player.kills >= settings.gkill;
            if (levelLow && killHigh) {
                marks.push(markLabels.danger);
            } else {
                if (killHigh) marks.push(markLabels.highKills);
                if (levelLow) marks.push(markLabels.lowLevel);
            }
            cell.textContent = marks.length ? marks.join('') : markLabels.none;
            return cell;
        }
    }
];

const mapCtx = refs.mapCanvas.getContext('2d');
const textMeasureCanvas = doc.createElement('canvas');
const textMeasureCtx = textMeasureCanvas.getContext('2d');

function setOverlayState(stateName, title, subtitle, options = {}) {
    if (!refs.mapOverlay) return;
    refs.mapOverlay.dataset.state = stateName;
    refs.mapOverlay.dataset.reconnect = options.showReconnect ? 'true' : 'false';
    if (title !== undefined) refs.overlayTitle.textContent = title;
    if (subtitle !== undefined) refs.overlaySubtitle.textContent = subtitle;
}

function updateStatus(stateName, label) {
    if (label) {
        refs.statusText.textContent = label;
    }
    const indicator = refs.statusIndicator;
    indicator.classList.remove('bg-emerald-400', 'bg-amber-300', 'bg-rose-500', 'bg-slate-500', 'animate-pulse');
    indicator.style.boxShadow = 'none';
    switch (stateName) {
        case 'connected':
            indicator.classList.add('bg-emerald-400');
            indicator.style.boxShadow = '0 0 0 6px rgba(16, 185, 129, 0.2)';
            break;
        case 'connecting':
            indicator.classList.add('bg-amber-300', 'animate-pulse');
            indicator.style.boxShadow = '0 0 0 6px rgba(251, 191, 36, 0.18)';
            break;
        case 'error':
            indicator.classList.add('bg-rose-500');
            indicator.style.boxShadow = '0 0 0 6px rgba(244, 63, 94, 0.18)';
            break;
        default:
            indicator.classList.add('bg-slate-500');
            break;
    }
}

function buildTarget() {
    if (settings.connectionMode === 'manual') {
        const payload = normalizeManualSettings();
        return composeManualTarget(payload);
    }

    if (isHttpsAccess) {
        return CURRENT_HOST_WITH_PORT ? `wss://${CURRENT_HOST_WITH_PORT}${DEFAULT_WS_PATH}` : null;
    }
    return DEFAULT_LOCAL_WS_TARGET;
}

function clearSocket() {
    if (state.socket) {
        try {
            state.socket.onclose = null;
            state.socket.onerror = null;
            state.socket.onmessage = null;
            state.socket.close();
        } catch (error) {
            console.error(t('errors.websocketClose'), error);
        }
    }
    state.socket = null;
}

function connect() {
    clearSocket();

    const target = buildTarget();
    if (!target) {
        updateStatus('error', t('status.disconnected'));
        setOverlayState('info', t('overlay.instructionsTitle'), t('overlay.instructionsSubtitle'), { showReconnect: true });
        return;
    }

    updateStatus('connecting', t('status.connecting'));
    setOverlayState('loading', t('overlay.connectingTitle'), t('overlay.connectingSubtitle', { target }), { showReconnect: false });

    let socket;
    try {
        socket = new WebSocket(target);
    } catch (error) {
        console.error(t('errors.websocketCreate'), error);
        updateStatus('error', t('status.disconnected'));
        setOverlayState('info', t('overlay.instructionsTitle'), t('overlay.instructionsSubtitle'), { showReconnect: true });
        return;
    }

    state.socket = socket;

    socket.onopen = () => {
        state.isConnected = true;
        updateStatus('connected', t('status.connected'));
        setOverlayState('loading', t('overlay.noTransferTitle'), t('overlay.noTransferSubtitle'));
    };

    socket.onmessage = (event) => {
        handleMessage(event.data);
    };

    socket.onerror = () => {
        socket.close();
    };

    socket.onclose = () => {
        if (state.socket !== socket) {
            return;
        }
        state.isConnected = false;
        updateStatus('error', t('status.disconnected'));
        setOverlayState('info', t('overlay.instructionsTitle'), t('overlay.instructionsSubtitle'), { showReconnect: true });
        state.mapLoaded = false;
        state.players = [];
        state.mapId = null;
        refs.mapImage.removeAttribute('src');
        delete refs.mapImage.dataset.assetName;
        delete refs.mapImage.dataset.assetSource;
        delete refs.mapImage.dataset.assetSourceIndex;
        refs.playerCount.textContent = '0';
        updatePlayerInfo();
        renderPlayers();
        renderPlayerTable();
    };
}

function getPreferredPlayerTableWidth() {
    const baseWidth = DESKTOP_RIGHT_MIN_WIDTH;
    const shell = refs.playerTableShell;
    const scroll = refs.playerTableScroll;
    if (!shell || !scroll) {
        return baseWidth;
    }

    const shellExtraWidth = Math.max(0, shell.offsetWidth - scroll.clientWidth);
    const contentWidth = Math.max(scroll.scrollWidth, scroll.clientWidth);
    if (!Number.isFinite(contentWidth) || contentWidth <= 0) {
        return baseWidth;
    }

    return Math.max(baseWidth, Math.ceil(contentWidth + shellExtraWidth));
}

function syncMapStageSize() {
    const stage = refs.mapStage;
    const layout = refs.layout;
    if (!stage || !layout) {
        return;
    }

    if (desktopQuery.matches) {
        const layoutStyles = window.getComputedStyle(layout);
        const paddingLeft = parseFloat(layoutStyles.paddingLeft) || 0;
        const paddingRight = parseFloat(layoutStyles.paddingRight) || 0;
        const paddingTop = parseFloat(layoutStyles.paddingTop) || 0;
        const paddingBottom = parseFloat(layoutStyles.paddingBottom) || 0;
        const horizontalPadding = paddingLeft + paddingRight;
        const gapX = parseFloat(layoutStyles.columnGap || layoutStyles.gap) || 0;
        const layoutContentWidth = Math.max(0, (parseFloat(layoutStyles.width) || 0) - horizontalPadding);
        const viewportHeight = window.innerHeight;
        const headerHeight = refs.header ? refs.header.getBoundingClientRect().height : 0;
        const footerHeight = refs.footer ? refs.footer.getBoundingClientRect().height : 0;
        const availableVerticalSpace = Math.max(0, viewportHeight - headerHeight - footerHeight);
        const interiorHeight = Math.max(0, availableVerticalSpace - paddingTop - paddingBottom);

        const layoutHasTable = !layout.classList.contains('player-table-hidden');
        const columnGapCount = layoutHasTable ? 2 : 1;
        const leftColumnWidth = layoutHasTable ? DESKTOP_LEFT_COLUMN_WIDTH_WITH_TABLE : DESKTOP_LEFT_COLUMN_WIDTH_WITHOUT_TABLE;
        const availableWidth = Math.max(
                0,
                layoutContentWidth - leftColumnWidth - gapX * columnGapCount
        );

        let stageHeight = interiorHeight;
        if (!Number.isFinite(stageHeight) || stageHeight < 0) {
            stageHeight = 0;
        }
        if (stageHeight > 0) {
            stageHeight = Math.max(stageHeight, Math.min(DESKTOP_MIN_MAP_SIZE, interiorHeight));
        }

        let stageWidth = availableWidth;
        let playerTableWidth = 0;
        if (layoutHasTable) {
            const preferredPlayerTableWidth = getPreferredPlayerTableWidth();
            const widthWhenTablePreferred = Math.max(0, availableWidth - preferredPlayerTableWidth);
            if (widthWhenTablePreferred >= stageHeight) {
                stageWidth = widthWhenTablePreferred;
                playerTableWidth = preferredPlayerTableWidth;
            } else {
                stageWidth = Math.min(stageHeight, availableWidth);
                playerTableWidth = Math.max(0, availableWidth - stageWidth);
            }
        }

        if (!Number.isFinite(stageWidth) || stageWidth < 0) {
            stageWidth = 0;
        }
        if (stageWidth > 0) {
            stageWidth = Math.max(stageWidth, Math.min(DESKTOP_MIN_MAP_SIZE, availableWidth));
        }

        if (stageWidth < stageHeight) {
            stageHeight = stageWidth;
        }

        stage.style.width = `${stageWidth}px`;
        stage.style.height = `${stageHeight}px`;

        if (refs.mapStageContainer) {
            refs.mapStageContainer.style.width = `${stageWidth}px`;
            refs.mapStageContainer.style.height = `${stageHeight}px`;
        }
        const sideHeight = Math.min(stageHeight, interiorHeight || availableVerticalSpace, availableVerticalSpace);
        layout.style.height = `${availableVerticalSpace}px`;
        layout.style.maxHeight = `${availableVerticalSpace}px`;
        if (refs.configColumn) {
            refs.configColumn.style.height = `${sideHeight}px`;
            refs.configColumn.style.maxHeight = `${availableVerticalSpace}px`;
        }
        if (refs.configStack) {
            refs.configStack.style.height = `${sideHeight}px`;
            refs.configStack.style.maxHeight = `${sideHeight}px`;
        }
        if (refs.playerTableSection) {
            refs.playerTableSection.style.width = layoutHasTable ? `${playerTableWidth}px` : '';
            refs.playerTableSection.style.minWidth = layoutHasTable ? `${playerTableWidth}px` : '';
            refs.playerTableSection.style.maxWidth = layoutHasTable ? `${playerTableWidth}px` : '';
        }
        if (refs.playerTableShell) {
            refs.playerTableShell.style.height = `${sideHeight}px`;
            refs.playerTableShell.style.maxHeight = `${availableVerticalSpace}px`;
        }
        if (refs.playerTableWrapper) {
            refs.playerTableWrapper.style.maxHeight = `${sideHeight}px`;
        }
        if (refs.playerTableScroll) {
            refs.playerTableScroll.style.maxHeight = `${sideHeight}px`;
        }
        if (refs.mapShell) {
            refs.mapShell.style.minHeight = `${stageHeight}px`;
        }
    } else {
        stage.style.width = '';
        stage.style.height = '';
        if (refs.mapStageContainer) {
            refs.mapStageContainer.style.width = '';
            refs.mapStageContainer.style.height = '';
        }
        if (refs.mapShell) {
            refs.mapShell.style.minHeight = '';
        }
        if (refs.configColumn) {
            refs.configColumn.style.height = '';
            refs.configColumn.style.maxHeight = '';
        }
        if (refs.configStack) {
            refs.configStack.style.height = '';
            refs.configStack.style.maxHeight = '';
        }
        if (refs.playerTableSection) {
            refs.playerTableSection.style.width = '';
            refs.playerTableSection.style.minWidth = '';
            refs.playerTableSection.style.maxWidth = '';
        }
        if (refs.playerTableShell) {
            refs.playerTableShell.style.height = '';
            refs.playerTableShell.style.maxHeight = '';
        }
        if (refs.playerTableWrapper) {
            refs.playerTableWrapper.style.maxHeight = '';
        }
        if (refs.playerTableScroll) {
            refs.playerTableScroll.style.maxHeight = '';
        }
        layout.style.removeProperty('height');
        layout.style.removeProperty('max-height');
    }
}

function syncMapControlsHost() {
    const controls = refs.mapControls;
    const outlet = refs.mapControlsOutlet;
    const stage = refs.mapStage;

    if (!controls || !outlet || !stage) {
        return;
    }

    if (desktopQuery.matches) {
        if (controls.parentElement !== stage) {
            stage.appendChild(controls);
        }
        outlet.hidden = true;
    } else {
        if (controls.parentElement !== outlet) {
            outlet.appendChild(controls);
        }
        outlet.hidden = false;
    }
}

function updateCanvasResolution() {
    if (!state.canvasDeviceWidth || !state.canvasDeviceHeight) {
        return false;
    }
    const scale = clampScale(state.viewport.scale);
    state.viewport.scale = scale;
    const width = Math.max(1, Math.round(state.canvasDeviceWidth * scale));
    const height = Math.max(1, Math.round(state.canvasDeviceHeight * scale));
    let resized = false;
    if (refs.mapCanvas.width !== width) {
        refs.mapCanvas.width = width;
        resized = true;
    }
    if (refs.mapCanvas.height !== height) {
        refs.mapCanvas.height = height;
        resized = true;
    }
    return resized;
}

function resizeCanvas() {
    syncMapStageSize();
    const rect = refs.mapStage.getBoundingClientRect();
    if (!rect.width || !rect.height) {
        return;
    }
    const ratio = getEffectivePixelRatio();
    const deviceWidth = Math.max(1, Math.round(rect.width * ratio));
    const deviceHeight = Math.max(1, Math.round(rect.height * ratio));
    state.pixelRatio = ratio;
    state.canvasCssWidth = rect.width;
    state.canvasCssHeight = rect.height;
    state.canvasDeviceWidth = deviceWidth;
    state.canvasDeviceHeight = deviceHeight;
    refs.mapCanvas.style.width = `${rect.width}px`;
    refs.mapCanvas.style.height = `${rect.height}px`;
    updateCanvasResolution();
    renderPlayers();
}

function applyTransform() {
    const scale = clampScale(state.viewport.scale);
    state.viewport.scale = scale;
    const { translateX, translateY } = state.viewport;
    const ratio = state.pixelRatio || getEffectivePixelRatio();
    const alignedX = Math.round(translateX * ratio) / ratio;
    const alignedY = Math.round(translateY * ratio) / ratio;
    refs.mapViewport.style.transform = `translate3d(${alignedX}px, ${alignedY}px, 0) scale(${scale})`;
}

function resetViewport() {
    state.viewport.scale = clampScale(getDefaultScaleForMode(state.viewMode));
    state.viewport.translateX = 0;
    state.viewport.translateY = 0;
    applyTransform();
    updateCanvasResolution();
    renderPlayers();
    followSelectedPlayer();
}

function zoomAt(point, factor) {
    const previous = clampScale(state.viewport.scale);
    state.viewport.scale = previous;
    let next = previous * factor;
    next = clampScale(next);
    const scaleRatio = next / previous;
    state.viewport.translateX = point.x - (point.x - state.viewport.translateX) * scaleRatio;
    state.viewport.translateY = point.y - (point.y - state.viewport.translateY) * scaleRatio;
    state.viewport.scale = next;
    applyTransform();
    updateCanvasResolution();
    renderPlayers();
    followSelectedPlayer();
}

function updateViewModeControls() {
    const freeButton = refs.viewModeFreeButton;
    const followButton = refs.viewModeFollowButton;

    const setState = (button, active) => {
        if (!button) return;
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.classList.toggle('border-emerald-500/70', active);
        button.classList.toggle('text-emerald-300', active);
        button.classList.toggle('bg-emerald-500/10', active);
        button.classList.toggle('border-slate-700', !active);
        button.classList.toggle('text-slate-200', !active);
        button.classList.toggle('bg-slate-950/70', !active);
    };

    const isFollow = state.viewMode === VIEW_MODE_FOLLOW;
    setState(freeButton, !isFollow);
    setState(followButton, isFollow);
}

function renderProtocolControl() {
    const select = refs.inputs.protocol;
    const readonly = refs.inputs.protocolReadonly;
    const normalized = normalizeManualSettings({ syncInputs: false, persist: false });

    if (isHttpsAccess) {
        if (select) {
            select.classList.add('hidden');
            select.setAttribute('tabindex', '-1');
        }
        if (readonly) {
            readonly.classList.remove('hidden');
            readonly.textContent = 'wss';
        }
        settings.manualProtocol = 'wss';
    } else {
        if (select) {
            select.classList.remove('hidden');
            select.removeAttribute('tabindex');
            select.value = normalized.protocol;
        }
        if (readonly) {
            readonly.classList.add('hidden');
        }
    }
}

function updateConnectionModeControls() {
    const autoButton = refs.connectionModeAutoButton;
    const manualButton = refs.connectionModeManualButton;
    const manualFields = refs.connectionManualFields;

    const setState = (button, active) => {
        if (!button) return;
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
        button.classList.toggle('border-emerald-500/70', active);
        button.classList.toggle('text-emerald-300', active);
        button.classList.toggle('bg-emerald-500/10', active);
        button.classList.toggle('border-slate-700', !active);
        button.classList.toggle('text-slate-200', !active);
        button.classList.toggle('bg-slate-950/70', !active);
    };

    const isManual = settings.connectionMode === 'manual';
    setState(autoButton, !isManual);
    setState(manualButton, isManual);

    if (manualFields) {
        manualFields.classList.toggle('hidden', !isManual);
    }

    renderProtocolControl();
}

function setConnectionMode(mode) {
    const nextMode = mode === 'manual' ? 'manual' : 'auto';
    settings.connectionMode = nextMode;
    localStorage.setItem('conf_connection_mode', nextMode);

    if (nextMode === 'auto') {
        localStorage.setItem('conf_ipaddr', 'auto');
    } else {
        normalizeManualSettings();
    }

    updateConnectionModeControls();
}

function setViewMode(mode, { recenter = false } = {}) {
    const normalized = normalizeViewMode(mode);
    const changed = state.viewMode !== normalized;
    settings.viewMode = normalized;
    state.viewMode = normalized;
    localStorage.setItem('view_mode', normalized);
    updateViewModeControls();

    if (normalized === VIEW_MODE_FOLLOW && (recenter || changed)) {
        followSelectedPlayer();
    }
}


function getMapDisplayRect(width, height) {
    const safeWidth = Number.isFinite(width) && width > 0 ? width : 0;
    const safeHeight = Number.isFinite(height) && height > 0 ? height : 0;
    if (!safeWidth || !safeHeight) {
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    const mapAspect = RAW_VISIBLE_WIDTH / RAW_VISIBLE_HEIGHT;
    const stageAspect = safeWidth / safeHeight;
    let displayWidth = safeWidth;
    let displayHeight = safeHeight;

    if (stageAspect > mapAspect) {
        displayHeight = safeHeight;
        displayWidth = displayHeight * mapAspect;
    } else {
        displayWidth = safeWidth;
        displayHeight = displayWidth / mapAspect;
    }

    return {
        x: (safeWidth - displayWidth) / 2,
        y: (safeHeight - displayHeight) / 2,
        width: displayWidth,
        height: displayHeight
    };
}

function followSelectedPlayer() {
    if (state.viewMode !== VIEW_MODE_FOLLOW) {
        return;
    }
    if (!state.mapLoaded || !state.players.length) {
        return;
    }
    const target = state.players.find(player => player.name === settings.selectedPlayer) || state.players[0];
    if (!target || !target.pos) {
        return;
    }

    const stage = refs.mapStage;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) {
        return;
    }

    const posX = Number(target.pos.x);
    const posY = Number(target.pos.y);
    if (!Number.isFinite(posX) || !Number.isFinite(posY)) {
        return;
    }

    const mapRect = getMapDisplayRect(rect.width, rect.height);
    if (!mapRect.width || !mapRect.height) {
        return;
    }

    const scale = clampScale(state.viewport.scale);
    state.viewport.scale = scale;
    const baseX = mapRect.x + ((posX - RAW_OFFSET_LEFT) / RAW_VISIBLE_WIDTH) * mapRect.width;
    const baseY = mapRect.y + ((posY - RAW_OFFSET_TOP) / RAW_VISIBLE_HEIGHT) * mapRect.height;

    state.viewport.translateX = rect.width / 2 - baseX * scale;
    state.viewport.translateY = rect.height / 2 - baseY * scale;
    applyTransform();
}

function populatePlayerSelect(players) {
    if (state.isSelectingPlayer) {
        return;
    }
    const select = refs.playerSelect;
    const sorted = [...players].sort((a, b) => (a.team ?? 0) - (b.team ?? 0));
    const fragment = doc.createDocumentFragment();
    sorted.forEach(player => {
        const option = doc.createElement('option');
        option.value = player.name;
        option.textContent = player.name === '<hoozi>' ? 'hoozi' : player.name;
        option.style.color = teamColorFor(player.team);
        fragment.appendChild(option);
    });
    select.innerHTML = '';
    select.appendChild(fragment);
    if (!players.some(player => player.name === settings.selectedPlayer)) {
        const fallback = players.find(player => player.name === '<hoozi>') ?? players[0];
        if (fallback) {
            settings.selectedPlayer = fallback.name;
            localStorage.setItem('sel_player', settings.selectedPlayer);
        }
    }
    if (settings.selectedPlayer) {
        select.value = settings.selectedPlayer;
    }
}

function updatePlayerInfo() {
    const players = state.players;
    if (!players.length) {
        refs.focusName.textContent = '—';
        refs.focusName.style.color = '#e2e8f0';
        refs.focusName.title = '';
        refs.focusTeamBadge.style.backgroundColor = 'rgba(148, 163, 184, 0.6)';
        refs.focusMeta.textContent = 'Lv — · K —';
        refs.focusMeta.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
        refs.focusMeta.style.borderColor = 'rgba(148, 163, 184, 0.3)';
        return;
    }

    let focus = players.find(player => player.name === settings.selectedPlayer);
    if (!focus) {
        focus = players[0];
        settings.selectedPlayer = focus.name;
        localStorage.setItem('sel_player', settings.selectedPlayer);
        if (!state.isSelectingPlayer) {
            refs.playerSelect.value = focus.name;
        }
    }

    const teamColor = teamColorFor(focus.team);
    refs.focusName.textContent = focus.name === '<hoozi>' ? 'hoozi' : focus.name;
    refs.focusName.style.color = teamColor;
    const teamLabel = focus.team !== undefined && focus.team !== null ? `Team ${focus.team}` : 'Team —';
    refs.focusName.title = focus.rank ? `${teamLabel} · ${focus.rank}` : teamLabel;
    refs.focusTeamBadge.style.backgroundColor = teamColor;
    const level = typeof focus.level === 'number' ? focus.level : '—';
    const kills = typeof focus.kills === 'number' ? focus.kills : '—';
    refs.focusMeta.textContent = `Lv ${level} · K ${kills}`;
    if (focus.hostile === true) {
        refs.focusMeta.style.backgroundColor = 'rgba(244, 63, 94, 0.18)';
        refs.focusMeta.style.borderColor = 'rgba(244, 63, 94, 0.45)';
    } else if (focus.hostile === false) {
        refs.focusMeta.style.backgroundColor = 'rgba(34, 197, 94, 0.16)';
        refs.focusMeta.style.borderColor = 'rgba(34, 197, 94, 0.45)';
    } else {
        refs.focusMeta.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
        refs.focusMeta.style.borderColor = 'rgba(148, 163, 184, 0.35)';
    }
}

function renderPlayers() {
    mapCtx.setTransform(1, 0, 0, 1, 0, 0);
    mapCtx.clearRect(0, 0, refs.mapCanvas.width, refs.mapCanvas.height);

    if (!state.mapLoaded || !state.players.length || !state.canvasCssWidth || !state.canvasCssHeight) {
        return;
    }

    const players = state.players;
    let localPlayer = players.find(player => player.name === settings.selectedPlayer);
    if (!localPlayer) {
        localPlayer = players[0];
    }
    if (!localPlayer) return;

    const ctx = mapCtx;
    const fontSize = Number(settings.fontsize) || 10;
    const fontDeclaration = `${fontSize}px "Microsoft YaHei", "Noto Sans SC", "Inter", sans-serif`;
    const mapRectCanvas = getMapDisplayRect(refs.mapCanvas.width, refs.mapCanvas.height);
    if (!mapRectCanvas.width || !mapRectCanvas.height) {
        return;
    }
    const uniformScale = mapRectCanvas.width / RAW_VISIBLE_WIDTH;

    ctx.save();
    ctx.setTransform(
        uniformScale,
        0,
        0,
        uniformScale,
        mapRectCanvas.x - RAW_OFFSET_LEFT * uniformScale,
        mapRectCanvas.y - RAW_OFFSET_TOP * uniformScale
    );
    ctx.imageSmoothingEnabled = false;
    ctx.beginPath();
    ctx.rect(RAW_OFFSET_LEFT, RAW_OFFSET_TOP, RAW_VISIBLE_WIDTH, RAW_VISIBLE_HEIGHT);
    ctx.clip();
    ctx.font = fontDeclaration;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    textMeasureCtx.font = fontDeclaration;
    textMeasureCtx.textAlign = 'center';
    textMeasureCtx.textBaseline = 'bottom';

    const textCache = [];
    const showAll = !settings.showmp && !settings.showsp;
    const selectedTeam = localPlayer.team;
    const localX = Number(localPlayer.pos?.x) || 0;
    const localY = Number(localPlayer.pos?.y) || 0;

    players.forEach(player => {
        const px = Number(player.pos?.x) || 0;
        const py = Number(player.pos?.y) || 0;
        const color = player.team === selectedTeam ? '#FFFFFF' : teamColorFor(player.team);

        ctx.beginPath();
        ctx.arc(px, py, 4.8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.9)';
        ctx.stroke();
        ctx.closePath();

        if (player.team === selectedTeam && player.name !== localPlayer.name) {
            ctx.beginPath();
            ctx.moveTo(localX, localY);
            ctx.lineTo(px, py);
            ctx.strokeStyle = `${color}80`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.closePath();
        }

        if (player.name === localPlayer.name) {
            return;
        }

        const isRoster = Boolean(player.pro || player.white || player.black);
        const levelLow = typeof player.level === 'number' && player.level <= settings.glevel;
        const killHigh = typeof player.kills === 'number' && player.kills >= settings.gkill;

        if (!showAll) {
            let visible = player.team === selectedTeam;
            if (settings.showmp && isRoster) visible = true;
            if (settings.showsp && (levelLow || killHigh)) visible = true;
            if (!visible) return;
        }

        const labelParts = [];
        if (player.team !== selectedTeam) {
            if (settings.showmprefix && isRoster) {
                if (player.pro) {
                    labelParts.push(markLabels.pro);
                }
                if (player.black) {
                    labelParts.push(markLabels.black);
                }
                if (player.white) {
                    labelParts.push(markLabels.white);
                }
            }
            if (settings.showsprefix && (levelLow || killHigh)) {
                if (levelLow && killHigh) {
                    labelParts.push(markLabels.danger);
                } else if (killHigh) {
                    labelParts.push(markLabels.highKills);
                } else if (levelLow) {
                    labelParts.push(markLabels.lowLevel);
                }
            }
            if (settings.showkprefix && typeof player.kills === 'number') {
                labelParts.push(`[K:${player.kills}]`);
            }
            if (settings.showlprefix && typeof player.level === 'number') {
                labelParts.push(`[Lv:${player.level}]`);
            }
            if (settings.showrankprefix && player.rank) {
                labelParts.push(`[${player.rank}]`);
            }
        }
        if (settings.showname) {
            labelParts.push(player.name);
        }
        if (!labelParts.length) return;

        let label = labelParts.join(' ');
        if (label.length > 48) {
            label = `${label.slice(0, 48)}…`;
        }

        const textHeight = fontSize * 1.2;
        let adjustedY = py - 10;
        textCache.forEach(cached => {
            if (cached.team === player.team) {
                const dx = Math.abs(cached.cx - px);
                const dy = Math.abs(cached.cy - adjustedY);
                if (dx < cached.width / 2 && dy < cached.height) {
                    adjustedY -= cached.height;
                }
            }
        });

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.strokeText(label, px, adjustedY);
        ctx.fillStyle = color;
        ctx.fillText(label, px, adjustedY);

        const textWidth = textMeasureCtx.measureText(label).width;
        textCache.push({ cx: px, cy: adjustedY, width: textWidth, height: textHeight, team: player.team });
    });

    ctx.beginPath();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.moveTo(0, localY);
    ctx.lineTo(RAW_CANVAS_WIDTH, localY);
    ctx.moveTo(localX, 0);
    ctx.lineTo(localX, RAW_CANVAS_HEIGHT);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(localX, localY, 6, 0, Math.PI * 2);
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
}

function createPlayerTableSnapshot(players) {
    if (!Array.isArray(players) || players.length === 0) {
        return { sorted: [], signature: 'size:0' };
    }

    const sorted = [...players].sort((a, b) => {
        const teamA = Number.isFinite(Number(a.team)) ? Number(a.team) : Number.POSITIVE_INFINITY;
        const teamB = Number.isFinite(Number(b.team)) ? Number(b.team) : Number.POSITIVE_INFINITY;
        if (teamA !== teamB) {
            return teamA - teamB;
        }
        const nameA = typeof a.name === 'string' ? a.name : '';
        const nameB = typeof b.name === 'string' ? b.name : '';
        return nameCollator.compare(nameA, nameB);
    });

    const signatureParts = sorted.map((player) => {
        const teamValue = Number.isFinite(Number(player.team)) ? Number(player.team) : 'null';
        const nameValue = typeof player.name === 'string' ? player.name : '';
        const uidShortValue = typeof player.uidShort === 'string' ? player.uidShort : '';
        const uidLongValue = typeof player.uidLong === 'string' ? player.uidLong : '';
        const levelValue = Number.isFinite(Number(player.level)) ? Number(player.level) : 'null';
        const rankValue = player.rank ? String(player.rank) : '';
        const killsValue = Number.isFinite(Number(player.kills)) ? Number(player.kills) : 'null';
        const proValue = player.pro ? '1' : '0';
        const blackValue = player.black ? '1' : '0';
        const whiteValue = player.white ? '1' : '0';
        return [teamValue, nameValue, uidShortValue, uidLongValue, levelValue, rankValue, killsValue, proValue, blackValue, whiteValue].join('|');
    });

    return {
        sorted,
        signature: `${players.length}|${signatureParts.join('||')}`
    };
}

function scheduleLayoutRefresh() {
    if (layoutRefreshScheduled) {
        return;
    }

    layoutRefreshScheduled = true;
    const requestFrame = window.requestAnimationFrame || ((callback) => setTimeout(callback, 16));
    requestFrame(() => {
        layoutRefreshScheduled = false;
        syncMapControlsHost();
        resizeCanvas();
    });
}

function updatePlayerTableToggleState(hasColumns, isVisible) {
    const toggle = refs.playerTableToggle;
    if (!toggle) {
        return;
    }

    const checked = Boolean(hasColumns && isVisible);
    toggle.disabled = !hasColumns;
    toggle.checked = checked;

    const translation = t('config.playerTableShow');
    const resolvedLabel = typeof translation === 'string' ? translation : '显示';

    const label = refs.playerTableToggleLabel;
    if (label) {
        label.textContent = resolvedLabel;
        label.setAttribute('data-i18n', 'config.playerTableShow');
    }

    toggle.setAttribute('aria-label', resolvedLabel);
}

function updatePlayerTableSectionVisibility(visible) {
    const section = refs.playerTableSection;
    const layout = refs.layout;
    const shouldHide = !visible;
    let layoutClassChanged = false;

    if (section) {
        const sectionHidden = section.classList.contains('player-table-hidden');
        if (sectionHidden !== shouldHide) {
            section.classList.toggle('player-table-hidden', shouldHide);
        }
    }

    if (layout) {
        const layoutHidden = layout.classList.contains('player-table-hidden');
        if (layoutHidden !== shouldHide) {
            layout.classList.toggle('player-table-hidden', shouldHide);
            layoutClassChanged = true;
        }
    }

    if (layoutClassChanged) {
        scheduleLayoutRefresh();
    }
}

function renderPlayerTable(snapshot) {
    const body = refs.playerTableBody;
    const headerRow = refs.playerTableHeader;
    const emptyRow = refs.playerTableEmpty;
    const emptyCell = refs.playerTableEmptyCell;
    const { sorted, signature } = snapshot || createPlayerTableSnapshot(state.players);

    state.playerTableSignature = signature;

    const activeColumns = playerTableColumns.filter((column) => settings[column.settingKey]);

    const hasColumns = activeColumns.length > 0;
    state.playerTableHasColumns = hasColumns;
    const shouldShow = hasColumns && settings.tableVisible;

    updatePlayerTableToggleState(hasColumns, shouldShow);
    updatePlayerTableSectionVisibility(shouldShow);

    if (headerRow) {
        headerRow.innerHTML = '';
        activeColumns.forEach((column) => {
            const th = doc.createElement('th');
            th.className = 'px-2.5 py-1.5 text-left whitespace-nowrap';
            th.textContent = t(column.labelKey) || column.defaultLabel;
            headerRow.appendChild(th);
        });
    }

    if (emptyCell) {
        emptyCell.colSpan = Math.max(1, activeColumns.length);
    }

    if (!body) {
        return;
    }

    body.innerHTML = '';

    if (!hasColumns) {
        if (emptyRow) {
            emptyRow.classList.add('hidden');
        }
        return;
    }

    if (!sorted.length) {
        if (emptyRow) {
            emptyRow.classList.remove('hidden');
            body.appendChild(emptyRow);
        }
        return;
    }

    if (emptyRow) {
        emptyRow.classList.add('hidden');
    }

    let currentTeam = null;
    let bandIndex = 0;
    const fragment = doc.createDocumentFragment();

    sorted.forEach((player) => {
        const team = Number.isFinite(Number(player.team)) ? Number(player.team) : null;
        if (currentTeam === null) {
            currentTeam = team;
        } else if (team !== currentTeam) {
            bandIndex = bandIndex === 0 ? 1 : 0;
            currentTeam = team;
        }

        const row = doc.createElement('tr');
        row.className = `player-table-row player-table-row-band-${bandIndex}`;

        activeColumns.forEach((column) => {
            row.appendChild(column.createCell(player));
        });

        fragment.appendChild(row);
    });

    body.appendChild(fragment);
}

function handleMessage(raw) {
    if (!raw) return;
    let payload;
    try {
        payload = JSON.parse(raw);
    } catch (error) {
        console.error(t('errors.parse'), raw);
        return;
    }

    state.latestMessageText = JSON.stringify(payload, null, 2);
    updateDownloadButtonState();

    if (Object.prototype.hasOwnProperty.call(payload, 'map')) {
        const incomingMapId = normalizeMapId(payload.map);
        updateMap(incomingMapId);
    }
    if (Array.isArray(payload.players)) {
        updatePlayers(payload.players);
    }
}

function updateDownloadButtonState() {
    if (!refs.downloadLatestButton) {
        return;
    }
    const hasData = typeof state.latestMessageText === 'string' && state.latestMessageText.length > 0;
    refs.downloadLatestButton.disabled = !hasData;
    refs.downloadLatestButton.setAttribute('aria-disabled', hasData ? 'false' : 'true');
}

function downloadLatestMessage() {
    if (!state.latestMessageText) {
        return;
    }
    const blob = new Blob([state.latestMessageText], { type: 'application/json;charset=utf-8' });
    const timestamp = new Date().toISOString().replace(/[:]/g, '-');
    const filename = `hoozi-ws-latest-${timestamp}.json`;
    const url = URL.createObjectURL(blob);
    const link = doc.createElement('a');
    link.href = url;
    link.download = filename;
    doc.body.appendChild(link);
    link.click();
    doc.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getStaticSourceKey(index) {
    return STATIC_SOURCE_ORDER[index] ?? null;
}

function getStaticAssetUrl(assetName, source) {
    const base = STATIC_SOURCE_URLS[source] || STATIC_SOURCE_URLS.remote;
    return `${base}${assetName}`;
}

function applyStaticImageSource(target, assetName, sourceIndex) {
    const sourceKey = getStaticSourceKey(sourceIndex);
    if (!sourceKey) {
        return false;
    }
    target.dataset.assetName = assetName;
    target.dataset.assetSource = sourceKey;
    target.dataset.assetSourceIndex = String(sourceIndex);
    target.src = getStaticAssetUrl(assetName, sourceKey);
    return true;
}

function updateMap(mapId) {
    if (!mapId) return;

    if (isNoTransferMapId(mapId)) {
        state.mapId = null;
        state.mapLoaded = false;
        refs.mapImage.removeAttribute('src');
        delete refs.mapImage.dataset.assetName;
        delete refs.mapImage.dataset.assetSource;
        delete refs.mapImage.dataset.assetSourceIndex;
        setOverlayState('info', t('overlay.noTransferTitle'), t('overlay.noTransferSubtitle'));
        renderPlayers();
        return;
    }

    if (state.mapId === mapId && state.mapLoaded) {
        return;
    }
    state.mapId = mapId;
    state.mapLoaded = false;
    setOverlayState('loading', t('overlay.mapLoadingTitle'), t('overlay.mapLoadingSubtitle'));
    const assetName = `${mapId}.png`;
    const currentAsset = refs.mapImage.dataset.assetName;
    const currentSource = refs.mapImage.dataset.assetSource;
    const currentSrc = refs.mapImage.getAttribute('src');
    const isSameAssetLoading = currentAsset === assetName && currentSrc && !refs.mapImage.complete;
    if (isSameAssetLoading) {
        return;
    }
    const isSameAssetReady = currentAsset === assetName
        && currentSource
        && currentSrc
        && refs.mapImage.complete
        && refs.mapImage.naturalWidth
        && refs.mapImage.naturalHeight;
    if (isSameAssetReady) {
        onMapReady();
    } else if (!applyStaticImageSource(refs.mapImage, assetName, 0)) {
        const missingMapId = state.mapId ?? 'unknown';
        setOverlayState('info', t('overlay.mapMissingTitle'), t('overlay.mapMissingSubtitle', { mapId: missingMapId }));
    }
}

function updatePlayers(players) {
    const normalizedPlayers = normalizePlayers(players);
    const snapshot = createPlayerTableSnapshot(normalizedPlayers);

    state.players = normalizedPlayers;
    refs.playerCount.textContent = normalizedPlayers.length.toString();
    if (normalizedPlayers.length) {
        populatePlayerSelect(normalizedPlayers);
        if (state.mapLoaded) {
            setOverlayState('hidden');
        }
    } else if (state.mapLoaded) {
        setOverlayState('info', t('overlay.noDataTitle'), t('overlay.noDataSubtitle'));
    }
    updatePlayerInfo();
    followSelectedPlayer();
    renderPlayers();
    if (snapshot.signature !== state.playerTableSignature) {
        renderPlayerTable(snapshot);
    }
}

function onMapReady() {
    if (!refs.mapImage.naturalWidth || !refs.mapImage.naturalHeight) {
        return;
    }
    resizeCanvas();
    resetViewport();
    state.mapLoaded = true;
    if (state.players.length) {
        setOverlayState('hidden');
    } else {
        setOverlayState('info', t('overlay.noDataTitle'), t('overlay.noDataSubtitle'));
    }
    renderPlayers();
    followSelectedPlayer();
}

refs.mapImage.addEventListener('load', onMapReady);
refs.mapImage.addEventListener('error', () => {
    const assetName = refs.mapImage.dataset.assetName;
    const currentIndex = Number(refs.mapImage.dataset.assetSourceIndex || '0');
    if (assetName && applyStaticImageSource(refs.mapImage, assetName, currentIndex + 1)) {
        return;
    }
    const missingMapId = state.mapId ?? 'unknown';
    setOverlayState('info', t('overlay.mapMissingTitle'), t('overlay.mapMissingSubtitle', { mapId: missingMapId }));
});

if (refs.brandLogo) {
    const brandAssetName = refs.brandLogo.dataset.assetName || 'default.png';
    if (!applyStaticImageSource(refs.brandLogo, brandAssetName, 0)) {
        refs.brandLogo.removeAttribute('src');
    }
    refs.brandLogo.addEventListener('error', () => {
        const assetName = refs.brandLogo.dataset.assetName;
        const currentIndex = Number(refs.brandLogo.dataset.assetSourceIndex || '0');
        if (assetName && applyStaticImageSource(refs.brandLogo, assetName, currentIndex + 1)) {
            return;
        }
        refs.brandLogo.removeAttribute('src');
    });
}

refs.playerSelect.addEventListener('focus', () => {
    state.isSelectingPlayer = true;
});
refs.playerSelect.addEventListener('blur', () => {
    state.isSelectingPlayer = false;
});
refs.playerSelect.addEventListener('change', (event) => {
    settings.selectedPlayer = event.target.value;
    localStorage.setItem('sel_player', settings.selectedPlayer);
    updatePlayerInfo();
    followSelectedPlayer();
    renderPlayers();
});

if (refs.viewModeFreeButton) {
    refs.viewModeFreeButton.addEventListener('click', () => {
        setViewMode(VIEW_MODE_FREE);
    });
}

if (refs.viewModeFollowButton) {
    refs.viewModeFollowButton.addEventListener('click', () => {
        setViewMode(VIEW_MODE_FOLLOW, { recenter: true });
    });
}

if (refs.connectionModeAutoButton) {
    refs.connectionModeAutoButton.addEventListener('click', () => {
        setConnectionMode('auto');
    });
}

if (refs.connectionModeManualButton) {
    refs.connectionModeManualButton.addEventListener('click', () => {
        setConnectionMode('manual');
    });
}

if (refs.inputs.protocol) {
    refs.inputs.protocol.addEventListener('change', (event) => {
        settings.manualProtocol = normalizeProtocolValue(event.target.value);
        settings.manualPort = getDefaultPortForProtocol(settings.manualProtocol);
        normalizeManualSettings();
    });
}

if (refs.inputs.host) {
    refs.inputs.host.addEventListener('change', (event) => {
        settings.manualHost = (event.target.value || '').trim();
        normalizeManualSettings();
    });
}

if (refs.inputs.port) {
    refs.inputs.port.addEventListener('change', (event) => {
        settings.manualPort = String(event.target.value || '').trim();
        normalizeManualSettings();
    });
}

if (refs.inputs.path) {
    refs.inputs.path.addEventListener('change', (event) => {
        const value = normalizePathValue(event.target.value);
        settings.manualPath = value;
        event.target.value = value;
        normalizeManualSettings();
    });
}

refs.inputs.font.addEventListener('input', (event) => {
    let value = Number(event.target.value);
    if (!Number.isFinite(value)) value = settings.fontsize;
    value = Math.max(6, Math.min(48, value));
    settings.fontsize = value;
    localStorage.setItem('conf_fontsize', value);
    renderPlayers();
});

refs.inputs.gkill.addEventListener('input', (event) => {
    let value = Number(event.target.value);
    if (!Number.isFinite(value) || value < 0) value = 0;
    settings.gkill = value;
    localStorage.setItem('conf_gkill', value);
    renderPlayers();
    renderPlayerTable();
});

refs.inputs.glevel.addEventListener('input', (event) => {
    let value = Number(event.target.value);
    if (!Number.isFinite(value) || value < 0) value = 0;
    settings.glevel = value;
    localStorage.setItem('conf_glevel', value);
    renderPlayers();
    renderPlayerTable();
});

const overlayCheckboxBindings = [
    ['conf_showmp', 'showmp'],
    ['conf_showsp', 'showsp'],
    ['conf_showname', 'showname'],
    ['conf_showkprefix', 'showkprefix'],
    ['conf_showlprefix', 'showlprefix'],
    ['conf_showrankprefix', 'showrankprefix'],
    ['conf_showmprefix', 'showmprefix'],
    ['conf_showsprefix', 'showsprefix']
];

overlayCheckboxBindings.forEach(([key, settingKey]) => {
    const input = refs.inputs[settingKey];
    if (!input) return;
    input.addEventListener('change', (event) => {
        const checked = event.target.checked;
        settings[settingKey] = checked;
        localStorage.setItem(key, checked);
        renderPlayers();
    });
});

const tableCheckboxBindings = [
    ['conf_table_team', 'tableTeam'],
    ['conf_table_name', 'tableName'],
    ['conf_table_level', 'tableLevel'],
    ['conf_table_rank', 'tableRank'],
    ['conf_table_kills', 'tableKills'],
    ['conf_table_marks', 'tableMarks'],
    ['conf_table_uid_short', 'tableUidShort'],
    ['conf_table_uid_long', 'tableUidLong']
];

tableCheckboxBindings.forEach(([key, settingKey]) => {
    const input = refs.inputs[settingKey];
    if (!input) return;
    input.addEventListener('change', (event) => {
        const checked = event.target.checked;
        settings[settingKey] = checked;
        localStorage.setItem(key, checked);
        renderPlayerTable();
    });
});

if (refs.playerTableToggle) {
    refs.playerTableToggle.addEventListener('change', (event) => {
        const target = event.target;
        const checked = Boolean(target.checked);

        if (!state.playerTableHasColumns) {
            target.checked = false;
            return;
        }

        settings.tableVisible = checked;
        localStorage.setItem('conf_table_visible', settings.tableVisible);
        renderPlayerTable();
    });
}

const handleReconnectClick = () => connect();

if (refs.reconnectButton) {
    refs.reconnectButton.addEventListener('click', handleReconnectClick);
}

if (refs.configReconnectButton) {
    refs.configReconnectButton.addEventListener('click', handleReconnectClick);
}

if (refs.downloadLatestButton) {
    refs.downloadLatestButton.addEventListener('click', downloadLatestMessage);
}

const isOverlayBlocking = () => {
    return refs.mapOverlay && refs.mapOverlay.dataset.state !== 'hidden';
};

const activePointers = new Map();
let panState = null;
let pinchState = null;

function updatePointer(event) {
    activePointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
}

function createPinchState() {
    if (activePointers.size < 2) {
        return null;
    }
    const [first, second] = Array.from(activePointers.values());
    const rect = refs.mapStage.getBoundingClientRect();
    const p1 = { x: first.clientX - rect.left, y: first.clientY - rect.top };
    const p2 = { x: second.clientX - rect.left, y: second.clientY - rect.top };
    const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (!distance) {
        return null;
    }
    const midpoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const initialScale = clampScale(state.viewport.scale);
    state.viewport.scale = initialScale;
    const mapPoint = {
        x: (midpoint.x - state.viewport.translateX) / initialScale,
        y: (midpoint.y - state.viewport.translateY) / initialScale
    };
    return {
        initialDistance: distance,
        initialScale,
        mapPoint
    };
}

function isPanningAllowed() {
    return state.viewMode !== VIEW_MODE_FOLLOW;
}

refs.mapStage.addEventListener('pointerdown', (event) => {
    if (isOverlayBlocking()) return;
    if (refs.mapControls && refs.mapControls.contains(event.target)) {
        return;
    }
    refs.mapStage.setPointerCapture(event.pointerId);
    updatePointer(event);
    if (activePointers.size === 1 && isPanningAllowed()) {
        panState = {
            pointerId: event.pointerId,
            start: { x: event.clientX, y: event.clientY },
            translate: { x: state.viewport.translateX, y: state.viewport.translateY }
        };
        refs.mapStage.classList.add('dragging');
    } else if (activePointers.size === 2) {
        panState = null;
        refs.mapStage.classList.remove('dragging');
        pinchState = createPinchState();
    }
});

refs.mapStage.addEventListener('pointermove', (event) => {
    if (!activePointers.has(event.pointerId)) return;
    updatePointer(event);
    if (pinchState && activePointers.size >= 2) {
        const values = Array.from(activePointers.values());
        const rect = refs.mapStage.getBoundingClientRect();
        const p1 = { x: values[0].clientX - rect.left, y: values[0].clientY - rect.top };
        const p2 = { x: values[1].clientX - rect.left, y: values[1].clientY - rect.top };
        const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (!distance || !pinchState.initialDistance) {
            return;
        }
        let nextScale = pinchState.initialScale * (distance / pinchState.initialDistance);
        nextScale = clampScale(nextScale);
        const midpoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        state.viewport.scale = nextScale;
        state.viewport.translateX = midpoint.x - pinchState.mapPoint.x * nextScale;
        state.viewport.translateY = midpoint.y - pinchState.mapPoint.y * nextScale;
        applyTransform();
        updateCanvasResolution();
        renderPlayers();
        return;
    }

    if (panState && panState.pointerId === event.pointerId) {
        const dx = event.clientX - panState.start.x;
        const dy = event.clientY - panState.start.y;
        state.viewport.translateX = panState.translate.x + dx;
        state.viewport.translateY = panState.translate.y + dy;
        applyTransform();
    }
});

function releasePointer(event) {
    if (!activePointers.has(event.pointerId)) {
        return;
    }
    activePointers.delete(event.pointerId);
    refs.mapStage.releasePointerCapture(event.pointerId);
    if (pinchState && activePointers.size < 2) {
        pinchState = null;
    }
    if (panState && panState.pointerId === event.pointerId) {
        panState = null;
    }
    if (activePointers.size === 1 && !pinchState && isPanningAllowed()) {
        const [id, pointer] = activePointers.entries().next().value;
        panState = {
            pointerId: id,
            start: { x: pointer.clientX, y: pointer.clientY },
            translate: { x: state.viewport.translateX, y: state.viewport.translateY }
        };
        refs.mapStage.classList.add('dragging');
    } else if (!activePointers.size) {
        refs.mapStage.classList.remove('dragging');
    }

    if (state.viewMode === VIEW_MODE_FOLLOW && !activePointers.size) {
        followSelectedPlayer();
    }
}

refs.mapStage.addEventListener('pointerup', releasePointer);
refs.mapStage.addEventListener('pointercancel', releasePointer);
refs.mapStage.addEventListener('lostpointercapture', releasePointer);

refs.mapStage.addEventListener('wheel', (event) => {
    if (isOverlayBlocking()) return;
    event.preventDefault();
    const rect = refs.mapStage.getBoundingClientRect();
    const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    const factor = event.deltaY < 0 ? 1.12 : 0.88;
    zoomAt(point, factor);
}, { passive: false });

refs.mapStage.addEventListener('dblclick', (event) => {
    if (isOverlayBlocking()) return;
    const rect = refs.mapStage.getBoundingClientRect();
    const point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    zoomAt(point, 1.35);
});

refs.zoomReset.addEventListener('click', () => {
    resetViewport();
});

const handleLayoutChange = () => {
    syncMapControlsHost();
    resizeCanvas();
    renderPlayers();
    followSelectedPlayer();
};

if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleLayoutChange);
} else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleLayoutChange);
}

let resizeTimer = null;
const scheduleResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        resizeCanvas();
        renderPlayers();
        followSelectedPlayer();
    }, 120);
};

window.addEventListener('resize', scheduleResize);

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleResize);
    window.visualViewport.addEventListener('scroll', scheduleResize);
}

window.addEventListener('beforeunload', () => {
    clearSocket();
});

renderPlayerTable();
updateDownloadButtonState();

syncMapControlsHost();
resizeCanvas();
updateStatus('connecting', t('status.waiting'));
setOverlayState('loading', t('overlay.waitingTitle'), t('overlay.waitingSubtitle'));
connect();
