const R2_STATIC_BASE_URL = 'https://img.hoozi.net/static/';
const LOCAL_STATIC_BASE_URL = 'static/';

const translations = {
    'zh-CN': {
        title: 'HOOZi 网页雷达',
        header: {
            title: 'HOOZi 网页雷达',
            connectionStatusLabel: '连接状态',
            purchaseLink: 'HOOZi卡密购买',
            watchPlayerLabel: '关注玩家'
        },
        config: {
            connection: '连接配置',
            ipPlaceholder: 'auto',
            ipHelper: 'auto自动, 或手动填写ws/wss地址',
            toggles: '信息开关',
            toggleName: '昵称',
            toggleLevel: '等级',
            toggleRank: '段位',
            toggleKills: '击杀',
            toggleRoster: '名册',
            toggleSuspect: '嫌疑',
            quickFilter: '快捷过滤',
            filterOnlyMarks: '仅显示 权 / 黑 / 白',
            filterOnlySuspicious: '仅显示 低等级 / 高击杀',
            fontSize: '字体大小',
            killsAtLeast: '击杀≥',
            levelBelow: '等级≤'
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
            waitingSubtitle: '正在尝试与服务器建立通信',
            connectingTitle: '正在连接',
            connectingSubtitle: '正在尝试连接 {target}',
            instructionsTitle: '未连接',
            instructionsSubtitle: '①启动游戏 ②开启HOOZi ③开启FRP',
            noDataTitle: '等待玩家数据',
            noDataSubtitle: '当前地图暂无玩家或数据尚未同步',
            mapLoadingTitle: '加载地图',
            mapLoadingSubtitle: '正在载入地图资源',
            mapMissingTitle: '地图资源缺失',
            mapMissingSubtitle: '未找到 static/{mapId}.png',
            noTransferTitle: '暂无数据传输',
            noTransferSubtitle: '游戏对局开始后才可查看'
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
            black: '[黑]',
            white: '[白]',
            danger: '[危险]',
            highKills: '[高杀]',
            lowLevel: '[低级]',
            none: '—'
        }
    },
    'zh-TW': {
        title: 'HOOZi 網頁雷達',
        header: {
            title: 'HOOZi 網頁雷達',
            connectionStatusLabel: '連線狀態',
            purchaseLink: 'HOOZi 卡密購買',
            watchPlayerLabel: '關注玩家'
        },
        config: {
            connection: '連線設定',
            ipPlaceholder: 'auto',
            ipHelper: 'auto自動, 或手動填寫ws/wss地址',
            toggles: '資訊開關',
            toggleName: '暱稱',
            toggleLevel: '等級',
            toggleRank: '段位',
            toggleKills: '擊殺',
            toggleRoster: '名冊',
            toggleSuspect: '嫌疑',
            quickFilter: '快捷篩選',
            filterOnlyMarks: '僅顯示 權 / 黑 / 白',
            filterOnlySuspicious: '僅顯示 低等級 / 高擊殺',
            fontSize: '字體大小',
            killsAtLeast: '擊殺≥',
            levelBelow: '等級≤'
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
            connectingSubtitle: '正在嘗試連線 {target}',
            instructionsTitle: '未連線',
            instructionsSubtitle: '①啟動遊戲 ②開啟 HOOZi ③開啟 FRP',
            noDataTitle: '等待玩家資料',
            noDataSubtitle: '目前地圖暫無玩家或資料尚未同步',
            mapLoadingTitle: '載入地圖',
            mapLoadingSubtitle: '正在載入地圖資源',
            mapMissingTitle: '地圖資源缺失',
            mapMissingSubtitle: '找不到 static/{mapId}.png',
            noTransferTitle: '暫無資料傳輸',
            noTransferSubtitle: '對戰開始後才可查看'
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
            black: '[黑]',
            white: '[白]',
            danger: '[危險]',
            highKills: '[高殺]',
            lowLevel: '[低級]',
            none: '—'
        }
    },
    en: {
        title: 'HOOZi Radar',
        header: {
            title: 'HOOZi Radar',
            connectionStatusLabel: 'Status',
            purchaseLink: 'Buy HOOZi Key',
            watchPlayerLabel: 'Follow Player'
        },
        config: {
            connection: 'Connection',
            ipPlaceholder: 'auto',
            ipHelper: 'Use auto or enter a ws/wss address manually',
            toggles: 'Info Toggles',
            toggleName: 'Name',
            toggleLevel: 'Level',
            toggleRank: 'Rank',
            toggleKills: 'Kills',
            toggleRoster: 'Roster',
            toggleSuspect: 'Suspect',
            quickFilter: 'Quick Filters',
            filterOnlyMarks: 'Show only Pro / Black / White',
            filterOnlySuspicious: 'Show only Low Level / High Kills',
            fontSize: 'Font Size',
            killsAtLeast: 'Kills ≥',
            levelBelow: 'Level ≤'
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
            waitingSubtitle: 'Trying to reach the server',
            connectingTitle: 'Connecting',
            connectingSubtitle: 'Connecting to {target}',
            instructionsTitle: 'Disconnected',
            instructionsSubtitle: '① Start the game ② Launch HOOZi ③ Enable FRP',
            noDataTitle: 'Waiting for player data',
            noDataSubtitle: 'No players on the current map or data not yet synced',
            mapLoadingTitle: 'Loading map',
            mapLoadingSubtitle: 'Fetching map assets',
            mapMissingTitle: 'Missing map asset',
            mapMissingSubtitle: 'static/{mapId}.png not found',
            noTransferTitle: 'No data yet',
            noTransferSubtitle: 'Visible after the match starts'
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
            black: '[Black]',
            white: '[White]',
            danger: '[Danger]',
            highKills: '[High Kills]',
            lowLevel: '[Low Level]',
            none: '—'
        }
    }
};

function getBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    if (lang.startsWith('zh-TW') || lang.startsWith('zh-HK')) {
        return 'zh-TW';
    } else if (lang.startsWith('zh')) {
        return 'zh-CN';
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
const DESKTOP_LEFT_COLUMN_WIDTH = 300;
const DESKTOP_RIGHT_MIN_WIDTH = 320;
const DESKTOP_MIN_MAP_SIZE = 320;
const MIN_SCALE = 1;
const MAX_SCALE = 5;
function getEffectivePixelRatio() {
    const baseRatio = window.devicePixelRatio || 1;
    const viewport = window.visualViewport;
    const viewportScale = viewport && Number.isFinite(viewport.scale) && viewport.scale > 0 ? viewport.scale : 1;
    return Math.max(1, baseRatio * viewportScale);
}

const refs = {
    layout: doc.querySelector('[data-role="layout"]'),
    header: doc.querySelector('header'),
    footer: doc.querySelector('footer'),
    statusIndicator: doc.querySelector('[data-role="status-indicator"]'),
    statusText: doc.querySelector('[data-role="status-text"]'),
    playerSelect: doc.getElementById('sel_player'),
    mapStage: doc.getElementById('mapStage'),
    mapStageContainer: doc.querySelector('.map-stage-container'),
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
    zoomIn: doc.getElementById('zoomIn'),
    zoomOut: doc.getElementById('zoomOut'),
    zoomReset: doc.getElementById('zoomReset'),
    reconnectButton: doc.getElementById('reconnectButton'),
    configColumn: doc.querySelector('.config-column'),
    configStack: doc.querySelector('.config-stack'),
    mapShell: doc.querySelector('.map-shell'),
    playerTableShell: doc.querySelector('[data-role="player-table-shell"]'),
    playerTableWrapper: doc.querySelector('[data-role="player-table-wrapper"]'),
    playerTableScroll: doc.querySelector('[data-role="player-table-scroll"]'),
    playerTableBody: doc.querySelector('[data-role="player-table-body"]'),
    playerTableEmpty: doc.querySelector('[data-role="player-table-empty"]'),
    inputs: {
        ip: doc.getElementById('conf_ipaddr'),
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
        showsprefix: doc.getElementById('conf_showsprefix')
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
    isConnected: false,
    playerTableSignature: null
};

const desktopQuery = window.matchMedia('(min-width: 1024px)');

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

const settings = {
    ipaddr: readSetting('conf_ipaddr', 'auto'),
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
    selectedPlayer: readSetting('sel_player', '<hoozi>')
};

// Initialize input values
refs.inputs.ip.value = settings.ipaddr;
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
    const raw = (settings.ipaddr || '').trim();
    if (!raw || raw.toLowerCase() === 'auto') {
        if (!location.host) {
            return null;
        }
        const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';
        return `${scheme}${location.host}/ws`;
    }
    if (/^wss?:\/\//i.test(raw)) {
        return raw;
    }
    const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';
    const sanitized = raw.replace(/^\/+/, '');
    return `${scheme}${sanitized}`;
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
        refs.playerCount.textContent = '0';
        updatePlayerInfo();
        renderPlayers();
        renderPlayerTable();
    };
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
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const headerHeight = refs.header ? refs.header.getBoundingClientRect().height : 0;
        const footerHeight = refs.footer ? refs.footer.getBoundingClientRect().height : 0;
        const availableVerticalSpace = Math.max(0, viewportHeight - headerHeight - footerHeight);
        const interiorHeight = Math.max(0, availableVerticalSpace - paddingTop - paddingBottom);

        const availableWidth = Math.max(
                0,
                viewportWidth - DESKTOP_LEFT_COLUMN_WIDTH - horizontalPadding - gapX * 2
        );
        const widthCandidate = Math.max(0, availableWidth - DESKTOP_RIGHT_MIN_WIDTH);
        const boundedWidth = widthCandidate > 0 ? widthCandidate : availableWidth;
        let size = Math.min(boundedWidth, interiorHeight, availableVerticalSpace);
        if (!Number.isFinite(size) || size < 0) {
            size = 0;
        }
        const minSize = Math.min(DESKTOP_MIN_MAP_SIZE, boundedWidth, interiorHeight);
        if (minSize > 0 && size < minSize) {
            size = minSize;
        }

        stage.style.width = `${size}px`;
        stage.style.height = `${size}px`;

        if (refs.mapStageContainer) {
            refs.mapStageContainer.style.width = `${size}px`;
            refs.mapStageContainer.style.height = `${size}px`;
        }

        const sideHeight = Math.min(size, interiorHeight || availableVerticalSpace, availableVerticalSpace);
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
            refs.mapShell.style.minHeight = `${size}px`;
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

function updateCanvasResolution() {
    if (!state.canvasDeviceWidth || !state.canvasDeviceHeight) {
        return false;
    }
    const scale = Number.isFinite(state.viewport.scale) ? state.viewport.scale : 1;
    const effectiveScale = Math.max(1, scale);
    const width = Math.max(1, Math.round(state.canvasDeviceWidth * effectiveScale));
    const height = Math.max(1, Math.round(state.canvasDeviceHeight * effectiveScale));
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
    const { scale, translateX, translateY } = state.viewport;
    const ratio = state.pixelRatio || getEffectivePixelRatio();
    const alignedX = Math.round(translateX * ratio) / ratio;
    const alignedY = Math.round(translateY * ratio) / ratio;
    refs.mapViewport.style.transform = `translate3d(${alignedX}px, ${alignedY}px, 0) scale(${scale})`;
}

function resetViewport() {
    state.viewport.scale = 1;
    state.viewport.translateX = 0;
    state.viewport.translateY = 0;
    applyTransform();
    updateCanvasResolution();
    renderPlayers();
}

function zoomAt(point, factor) {
    const previous = state.viewport.scale;
    let next = previous * factor;
    next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    const scaleRatio = next / previous;
    state.viewport.translateX = point.x - (point.x - state.viewport.translateX) * scaleRatio;
    state.viewport.translateY = point.y - (point.y - state.viewport.translateY) * scaleRatio;
    state.viewport.scale = next;
    applyTransform();
    updateCanvasResolution();
    renderPlayers();
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
    const scaleX = refs.mapCanvas.width / RAW_VISIBLE_WIDTH;
    const scaleY = refs.mapCanvas.height / RAW_VISIBLE_HEIGHT;

    ctx.save();
    ctx.setTransform(scaleX, 0, 0, scaleY, -RAW_OFFSET_LEFT * scaleX, -RAW_OFFSET_TOP * scaleY);
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
        const levelValue = Number.isFinite(Number(player.level)) ? Number(player.level) : 'null';
        const rankValue = player.rank ? String(player.rank) : '';
        const killsValue = Number.isFinite(Number(player.kills)) ? Number(player.kills) : 'null';
        const proValue = player.pro ? '1' : '0';
        const blackValue = player.black ? '1' : '0';
        const whiteValue = player.white ? '1' : '0';
        return [teamValue, nameValue, levelValue, rankValue, killsValue, proValue, blackValue, whiteValue].join('|');
    });

    return {
        sorted,
        signature: `${players.length}|${signatureParts.join('||')}`
    };
}

function renderPlayerTable(snapshot) {
    const body = refs.playerTableBody;
    if (!body) return;
    const emptyRow = refs.playerTableEmpty;
    const { sorted, signature } = snapshot || createPlayerTableSnapshot(state.players);

    body.innerHTML = '';
    state.playerTableSignature = signature;

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

        const teamCell = doc.createElement('td');
        teamCell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm font-semibold text-slate-100';
        const teamWrapper = doc.createElement('div');
        teamWrapper.className = 'flex items-center gap-2';
        const teamBadge = doc.createElement('span');
        teamBadge.className = 'inline-flex size-2.5 rounded-full';
        teamBadge.style.backgroundColor = teamColorFor(player.team);
        const teamText = doc.createElement('span');
        teamText.textContent = team !== null ? String(team) : '—';
        teamWrapper.appendChild(teamBadge);
        teamWrapper.appendChild(teamText);
        teamCell.appendChild(teamWrapper);
        row.appendChild(teamCell);

        const nameCell = doc.createElement('td');
        nameCell.className = 'px-2.5 py-1.5 text-sm text-slate-100 whitespace-nowrap';
        const displayName = typeof player.name === 'string' ? (player.name === '<hoozi>' ? 'hoozi' : player.name) : '—';
        const nameSpan = doc.createElement('span');
        nameSpan.className = 'block whitespace-nowrap';
        nameSpan.textContent = displayName;
        nameCell.appendChild(nameSpan);
        row.appendChild(nameCell);

        const levelCell = doc.createElement('td');
        levelCell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200';
        if (typeof player.level === 'number' && Number.isFinite(player.level)) {
            levelCell.textContent = String(player.level);
        } else {
            levelCell.textContent = '—';
        }
        row.appendChild(levelCell);

        const rankCell = doc.createElement('td');
        rankCell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200';
        rankCell.textContent = player.rank ? String(player.rank) : '—';
        row.appendChild(rankCell);

        const killsCell = doc.createElement('td');
        killsCell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200';
        if (typeof player.kills === 'number' && Number.isFinite(player.kills)) {
            killsCell.textContent = String(player.kills);
        } else {
            killsCell.textContent = '—';
        }
        row.appendChild(killsCell);

        const marksCell = doc.createElement('td');
        marksCell.className = 'whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200';
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
        marksCell.textContent = marks.length ? marks.join('') : markLabels.none;
        row.appendChild(marksCell);

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

    if (payload.map) {
        updateMap(payload.map);
    }
    if (Array.isArray(payload.players)) {
        updatePlayers(payload.players);
    }
}

function getStaticAssetUrl(assetName, source) {
    const base = source === 'local' ? LOCAL_STATIC_BASE_URL : R2_STATIC_BASE_URL;
    return `${base}${assetName}`;
}

function updateMap(mapId) {
    if (!mapId) return;
    if (state.mapId === mapId && state.mapLoaded) {
        return;
    }
    state.mapId = mapId;
    state.mapLoaded = false;
    setOverlayState('loading', t('overlay.mapLoadingTitle'), t('overlay.mapLoadingSubtitle'));
    const assetName = `${mapId}.png`;
    const currentAsset = refs.mapImage.dataset.assetName;
    const currentSource = refs.mapImage.dataset.assetSource;
    if (currentAsset === assetName && currentSource && refs.mapImage.complete) {
        onMapReady();
    } else {
        refs.mapImage.dataset.assetName = assetName;
        refs.mapImage.dataset.assetSource = 'remote';
        refs.mapImage.src = getStaticAssetUrl(assetName, 'remote');
    }
}

function updatePlayers(players) {
    const normalizedPlayers = Array.isArray(players) ? players : [];
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
}

refs.mapImage.addEventListener('load', onMapReady);
refs.mapImage.addEventListener('error', () => {
    const assetName = refs.mapImage.dataset.assetName;
    if (assetName && refs.mapImage.dataset.assetSource === 'remote') {
        refs.mapImage.dataset.assetSource = 'local';
        refs.mapImage.src = getStaticAssetUrl(assetName, 'local');
        return;
    }
    const missingMapId = state.mapId ?? 'unknown';
    setOverlayState('info', t('overlay.mapMissingTitle'), t('overlay.mapMissingSubtitle', { mapId: missingMapId }));
});

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
    renderPlayers();
});

refs.inputs.ip.addEventListener('change', (event) => {
    const value = (event.target.value || '').trim() || 'auto';
    settings.ipaddr = value;
    event.target.value = value;
    localStorage.setItem('conf_ipaddr', value);
});

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
});

refs.inputs.glevel.addEventListener('input', (event) => {
    let value = Number(event.target.value);
    if (!Number.isFinite(value) || value < 0) value = 0;
    settings.glevel = value;
    localStorage.setItem('conf_glevel', value);
    renderPlayers();
    renderPlayerTable();
});

const checkboxBindings = [
    ['conf_showmp', 'showmp'],
    ['conf_showsp', 'showsp'],
    ['conf_showname', 'showname'],
    ['conf_showkprefix', 'showkprefix'],
    ['conf_showlprefix', 'showlprefix'],
    ['conf_showrankprefix', 'showrankprefix'],
    ['conf_showmprefix', 'showmprefix'],
    ['conf_showsprefix', 'showsprefix']
];

checkboxBindings.forEach(([key, settingKey]) => {
    const input = refs.inputs[settingKey];
    if (!input) return;
    input.addEventListener('change', (event) => {
        const checked = event.target.checked;
        settings[settingKey] = checked;
        localStorage.setItem(key, checked);
        renderPlayers();
    });
});

refs.reconnectButton.addEventListener('click', () => {
    connect();
});

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
    const mapPoint = {
        x: (midpoint.x - state.viewport.translateX) / state.viewport.scale,
        y: (midpoint.y - state.viewport.translateY) / state.viewport.scale
    };
    return {
        initialDistance: distance,
        initialScale: state.viewport.scale,
        mapPoint
    };
}

refs.mapStage.addEventListener('pointerdown', (event) => {
    if (isOverlayBlocking()) return;
    refs.mapStage.setPointerCapture(event.pointerId);
    updatePointer(event);
    if (activePointers.size === 1) {
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
        nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale));
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
    if (activePointers.size === 1 && !pinchState) {
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

refs.zoomIn.addEventListener('click', () => {
    const rect = refs.mapStage.getBoundingClientRect();
    zoomAt({ x: rect.width / 2, y: rect.height / 2 }, 1.18);
});

refs.zoomOut.addEventListener('click', () => {
    const rect = refs.mapStage.getBoundingClientRect();
    zoomAt({ x: rect.width / 2, y: rect.height / 2 }, 0.85);
});

refs.zoomReset.addEventListener('click', () => {
    resetViewport();
});

const handleLayoutChange = () => {
    resizeCanvas();
    renderPlayers();
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

resizeCanvas();
updateStatus('connecting', t('status.waiting'));
setOverlayState('loading', t('overlay.waitingTitle'), t('overlay.waitingSubtitle'));
connect();
