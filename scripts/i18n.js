export const translations = {
    'zh-Hans': {
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
            mapSelect: '选择地图',
            mapAuto: '自动',
            toggles: '地图绘制信息',
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
            instructionsSubtitle: '①启动游戏 ②打开HOOZi ③在副机启用FRP',
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
            black: '[黑]',
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
            purchaseLink: 'HOOZi 卡密購買',
            watchPlayerLabel: '關注玩家'
        },
        config: {
            connection: '連線設定',
            ipPlaceholder: 'auto',
            ipHelper: 'auto自動, 或手動填寫ws/wss地址',
            mapSelect: '選擇地圖',
            mapAuto: '自動',
            toggles: '地圖繪製資訊',
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
            instructionsSubtitle: '①啟動遊戲 ②開啟HOOZi ③在副機啟用FRP',
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
            black: '[黑]',
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
            purchaseLink: 'Buy HOOZi Key',
            watchPlayerLabel: 'Follow Player'
        },
        config: {
            connection: 'Connection',
            ipPlaceholder: 'auto',
            ipHelper: 'Use auto or enter a ws/wss address manually',
            mapSelect: 'Select Map',
            mapAuto: 'Auto',
            toggles: 'Map Overlay Info',
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
            instructionsSubtitle: '① Start the game ② Launch HOOZi ③ Enable FRP on the secondary PC',
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
            black: '[Black]',
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
export const activeLanguage = translations[detectedLanguage] ? detectedLanguage : fallbackLanguage;
export const locale = translations[activeLanguage];

function resolveTranslation(source, path) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), source);
}

export function t(path, replacements = {}) {
    const value = resolveTranslation(locale, path);
    if (typeof value === 'string') {
        return value.replace(/\{(\w+)\}/g, (match, token) => {
            return Object.prototype.hasOwnProperty.call(replacements, token) ? replacements[token] : match;
        });
    }
    return value;
}

export const markLabels = {
    pro: t('marks.authority') || '[Auth]',
    black: t('marks.black') || '[Black]',
    white: t('marks.white') || '[White]',
    danger: t('marks.danger') || '[Danger]',
    highKills: t('marks.highKills') || '[High Kills]',
    lowLevel: t('marks.lowLevel') || '[Low Level]',
    none: t('marks.none') || '—'
};

export function applyTranslations(doc = document) {
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
