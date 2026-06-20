const translations = {
    'zh-Hans': {
        title: 'HOOZi 3.0 网页雷达',
        header: { title: 'HOOZi 3.0 网页雷达', connectionStatusLabel: '连接状态', viewModeFree: '自由视角', viewModeFollow: '固定跟随' },
        config: {
            connection: '连接配置', connectionAuto: '自动', connectionManual: '手动', protocol: '协议',
            host: 'IP 地址 / 域名', port: '端口', path: '路径（可选）', toggles: '地图绘制信息',
            toggleName: '昵称', toggleLegend: '英雄', toggleHealth: '血量', toggleShield: '护盾',
            toggleLevel: '等级', toggleRank: '段位', toggleCombat: '战绩', toggleRoster: '名册',
            toggleTeamLinks: '同队连线', toggleRing: '安全区', filters: '玩家过滤', showDead: '显示死亡玩家',
            showDown: '显示倒地玩家', fontSize: '字体大小', importPlayerData: '导入玩家数据',
            exportCurrentPlayers: '导出当前玩家信息',
            playerTable: '玩家信息列表', playerTableShow: '显示'
        },
        map: {
            reconnect: '重连', mapLabel: '地图', aliveLabel: '存活', zoomControls: '地图缩放', zoomOut: '缩小', zoomIn: '放大', focusLabel: '焦点',
            focusHealth: '血量', focusShield: '护盾', focusKills: '击杀'
        },
        table: {
            title: '玩家信息列表', empty: '等待玩家数据', importJsonOnly: '仅允许导入 JSON 文件',
            importInvalid: '导入失败：JSON 内容不符合 HOOZi state 数据格式',
            importSuccess: '已导入 {count} 名玩家',
            columns: {
                self: '本机', id: '稳定 ID', index: '索引', team: '队伍', squad: '小队', name: '昵称',
                legend: '英雄', legendIconKey: '英雄图标 Key', uid: '平台 UID', hp: '血量', maxHp: '最大血量',
                shield: '护盾', maxShield: '最大护盾', distance: '距离', yaw: '朝向值', dead: '死亡', down: '倒地',
                level: '等级', rank: '段位', rankIconKey: '段位图标 Key', rankColor: '段位颜色', kills: '击杀',
                damage: '伤害', roster: '名册'
            }
        },
        status: { waiting: '等待连接', connecting: '正在连接', connected: '已连接', disconnected: '未连接', protocolError: '协议错误' },
        overlay: {
            waitingTitle: '等待连接', waitingSubtitle: '正在尝试连接 HOOZi 3.0 本机数据桥',
            connectingTitle: '正在连接', connectingSubtitle: '正在连接 {target}', instructionsTitle: '未连接',
            instructionsSubtitle: '请启动 HOOZi 3.0、加载 web_radar.lua，并确认网页雷达 server 已启用',
            noDataTitle: '等待对局数据', noDataSubtitle: '连接成功，等待 state 快照',
            mapLoadingTitle: '加载地图资源', mapLoadingSubtitle: '优先使用 HOOZi CDN，失败后回退到本地 static 目录',
            mapMissingTitle: '地图资源缺失', mapMissingSubtitle: '找不到 {map} 对应的地图文件',
            protocolTitle: '数据协议错误', protocolSubtitle: '{message}'
        },
        player: { self: '本机', alive: '存活', down: '倒地', dead: '死亡', yes: '是', no: '否', team: '队伍 {team}', squad: '小队 {squad}', roster: '名册 {roster}', unknown: '未知' },
        footer: { copyright: 'Copyright © hoozi.net 版权所有', disclaimer: 'HOOZi 3.0 Lua 数据流网页雷达' }
    },
    'zh-Hant': {
        title: 'HOOZi 3.0 網頁雷達',
        header: { title: 'HOOZi 3.0 網頁雷達', connectionStatusLabel: '連線狀態', viewModeFree: '自由視角', viewModeFollow: '固定跟隨' },
        config: {
            connection: '連線設定', connectionAuto: '自動', connectionManual: '手動', protocol: '協議',
            host: 'IP 位址 / 網域', port: '連接埠', path: '路徑（可選）', toggles: '地圖繪製資訊',
            toggleName: '暱稱', toggleLegend: '英雄', toggleHealth: '血量', toggleShield: '護盾',
            toggleLevel: '等級', toggleRank: '段位', toggleCombat: '戰績', toggleRoster: '名冊',
            toggleTeamLinks: '同隊連線', toggleRing: '安全區', filters: '玩家篩選', showDead: '顯示死亡玩家',
            showDown: '顯示倒地玩家', fontSize: '字體大小', importPlayerData: '匯入玩家資料',
            exportCurrentPlayers: '匯出目前玩家資訊',
            playerTable: '玩家資訊列表', playerTableShow: '顯示'
        },
        map: {
            reconnect: '重新連線', mapLabel: '地圖', aliveLabel: '存活', zoomControls: '地圖縮放', zoomOut: '縮小', zoomIn: '放大', focusLabel: '焦點',
            focusHealth: '血量', focusShield: '護盾', focusKills: '擊殺'
        },
        table: {
            title: '玩家資訊列表', empty: '等待玩家資料', importJsonOnly: '僅允許匯入 JSON 檔案',
            importInvalid: '匯入失敗：JSON 內容不符合 HOOZi state 資料格式',
            importSuccess: '已匯入 {count} 名玩家',
            columns: {
                self: '本機', id: '穩定 ID', index: '索引', team: '隊伍', squad: '小隊', name: '暱稱',
                legend: '英雄', legendIconKey: '英雄圖示 Key', uid: '平台 UID', hp: '血量', maxHp: '最大血量',
                shield: '護盾', maxShield: '最大護盾', distance: '距離', yaw: '朝向值', dead: '死亡', down: '倒地',
                level: '等級', rank: '段位', rankIconKey: '段位圖示 Key', rankColor: '段位顏色', kills: '擊殺',
                damage: '傷害', roster: '名冊'
            }
        },
        status: { waiting: '等待連線', connecting: '正在連線', connected: '已連線', disconnected: '未連線', protocolError: '協議錯誤' },
        overlay: {
            waitingTitle: '等待連線', waitingSubtitle: '正在嘗試連線 HOOZi 3.0 本機資料橋',
            connectingTitle: '正在連線', connectingSubtitle: '正在連線 {target}', instructionsTitle: '未連線',
            instructionsSubtitle: '請啟動 HOOZi 3.0、載入 web_radar.lua，並確認網頁雷達 server 已啟用',
            noDataTitle: '等待對局資料', noDataSubtitle: '連線成功，等待 state 快照',
            mapLoadingTitle: '載入地圖資源', mapLoadingSubtitle: '優先使用 HOOZi CDN，失敗後回退到本機 static 目錄',
            mapMissingTitle: '地圖資源缺失', mapMissingSubtitle: '找不到 {map} 對應的地圖檔案',
            protocolTitle: '資料協議錯誤', protocolSubtitle: '{message}'
        },
        player: { self: '本機', alive: '存活', down: '倒地', dead: '死亡', yes: '是', no: '否', team: '隊伍 {team}', squad: '小隊 {squad}', roster: '名冊 {roster}', unknown: '未知' },
        footer: { copyright: 'Copyright © hoozi.net 版權所有', disclaimer: 'HOOZi 3.0 Lua 資料流網頁雷達' }
    },
    en: {
        title: 'HOOZi 3.0 Web Radar',
        header: { title: 'HOOZi 3.0 Web Radar', connectionStatusLabel: 'Connection', viewModeFree: 'Free', viewModeFollow: 'Follow' },
        config: {
            connection: 'Connection', connectionAuto: 'Auto', connectionManual: 'Manual', protocol: 'Protocol',
            host: 'IP address / domain', port: 'Port', path: 'Path (optional)', toggles: 'Map overlays',
            toggleName: 'Name', toggleLegend: 'Legend', toggleHealth: 'Health', toggleShield: 'Shield',
            toggleLevel: 'Level', toggleRank: 'Rank', toggleCombat: 'Combat', toggleRoster: 'Roster',
            toggleTeamLinks: 'Team links', toggleRing: 'Ring', filters: 'Player filters', showDead: 'Show dead players',
            showDown: 'Show downed players', fontSize: 'Font size', importPlayerData: 'Import player data',
            exportCurrentPlayers: 'Export current player data',
            playerTable: 'Player table fields', playerTableShow: 'Show'
        },
        map: {
            reconnect: 'Reconnect', mapLabel: 'Map', aliveLabel: 'Alive', zoomControls: 'Map zoom', zoomOut: 'Zoom out', zoomIn: 'Zoom in', focusLabel: 'Focus',
            focusHealth: 'Health', focusShield: 'Shield', focusKills: 'Kills'
        },
        table: {
            title: 'Player information', empty: 'Waiting for player data', importJsonOnly: 'Only JSON files can be imported',
            importInvalid: 'Import failed: JSON does not match the HOOZi state data format',
            importSuccess: 'Imported {count} players',
            columns: {
                self: 'Local', id: 'Stable ID', index: 'Index', team: 'Team', squad: 'Squad', name: 'Name',
                legend: 'Legend', legendIconKey: 'Legend icon key', uid: 'Platform UID', hp: 'Health', maxHp: 'Max health',
                shield: 'Shield', maxShield: 'Max shield', distance: 'Distance', yaw: 'Yaw value', dead: 'Dead', down: 'Down',
                level: 'Level', rank: 'Rank', rankIconKey: 'Rank icon key', rankColor: 'Rank color', kills: 'Kills',
                damage: 'Damage', roster: 'Roster'
            }
        },
        status: { waiting: 'Waiting', connecting: 'Connecting', connected: 'Connected', disconnected: 'Disconnected', protocolError: 'Protocol error' },
        overlay: {
            waitingTitle: 'Waiting to connect', waitingSubtitle: 'Trying the local HOOZi 3.0 data bridge',
            connectingTitle: 'Connecting', connectingSubtitle: 'Connecting to {target}', instructionsTitle: 'Not connected',
            instructionsSubtitle: 'Start HOOZi 3.0, load web_radar.lua, and enable its Web Radar server',
            noDataTitle: 'Waiting for match data', noDataSubtitle: 'Connected; waiting for a state snapshot',
            mapLoadingTitle: 'Loading map asset', mapLoadingSubtitle: 'HOOZi CDN first, then the local static directory',
            mapMissingTitle: 'Map asset missing', mapMissingSubtitle: 'No map file was found for {map}',
            protocolTitle: 'Protocol error', protocolSubtitle: '{message}'
        },
        player: { self: 'Local', alive: 'Alive', down: 'Down', dead: 'Dead', yes: 'Yes', no: 'No', team: 'Team {team}', squad: 'Squad {squad}', roster: 'Roster {roster}', unknown: 'Unknown' },
        footer: { copyright: 'Copyright © hoozi.net. All rights reserved.', disclaimer: 'Web radar for the HOOZi 3.0 Lua data stream' }
    }
};

function browserLanguage() {
    const language = navigator.language || navigator.userLanguage || 'en';
    if (language.startsWith('zh-TW') || language.startsWith('zh-HK') || language.startsWith('zh-MO')) return 'zh-Hant';
    if (language.startsWith('zh')) return 'zh-Hans';
    return 'en';
}

export const activeLanguage = browserLanguage();
const locale = translations[activeLanguage] || translations.en;

function resolve(path) {
    return path.split('.').reduce((value, part) => value?.[part], locale);
}

export function t(path, replacements = {}) {
    const value = resolve(path);
    if (typeof value !== 'string') return value;
    return value.replace(/\{(\w+)\}/g, (match, token) => (
        Object.prototype.hasOwnProperty.call(replacements, token) ? String(replacements[token]) : match
    ));
}

export function applyTranslations(root = document) {
    document.documentElement.lang = activeLanguage === 'zh-Hans' ? 'zh-CN' : activeLanguage === 'zh-Hant' ? 'zh-TW' : 'en';
    document.title = locale.title;
    root.querySelectorAll('[data-i18n]').forEach((element) => {
        const translation = t(element.dataset.i18n);
        if (typeof translation === 'string') element.textContent = translation;
    });
}

