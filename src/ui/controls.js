import {
    LAYOUT_ORIENTATION_LANDSCAPE,
    LAYOUT_ORIENTATION_PORTRAIT,
    VIEW_MODE_FOLLOW,
    VIEW_MODE_FREE,
    saveSetting,
    teamColorFor
} from '../config.js';
import { mapDisplayName } from '../assets/maps.js';
import { formatPlayerStatus, shieldBarStyle } from '../render/entities.js';
import { allocateDesktopLayout, resolveResponsiveLayoutOrientation } from './layout.js';
import { currentPlayerExportFileName, formatPlayerExportJson, isJsonFileName } from './player-data.js';

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
        layoutLandscapeButton: byId('layoutOrientationLandscape'),
        layoutPortraitButton: byId('layoutOrientationPortrait'),
        menuVisibleButton: byId('menuVisibleToggle'),
        playerTableVisibleButton: byId('playerTableVisibleToggle'),
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

function nodeCell(content, className = '') {
    const element = document.createElement('td');
    element.className = `whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200 ${className}`;
    element.append(content);
    return element;
}

function displayValue(value) {
    return value === null || value === undefined || value === '' ? '—' : String(value);
}

function displayDistance(value) {
    const distance = Number(value);
    if (!Number.isFinite(distance)) return displayValue(value);
    return `${Number.isInteger(distance) ? distance : distance.toFixed(1)}m`;
}

function displayStatus(player, t) {
    return `${formatPlayerStatus(player, t)} · ${displayDistance(player.distance)} · ${t('player.roster', { roster: player.roster })}`;
}

function teamSortValue(team) {
    const value = Number(team);
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function comparePlayersByTeam(left, right) {
    const teamDelta = teamSortValue(left?.team) - teamSortValue(right?.team);
    if (teamDelta !== 0) return teamDelta;
    return String(left?.name ?? '').localeCompare(String(right?.name ?? ''));
}

function resIconSource(iconKey) {
    const key = String(iconKey || '').trim();
    if (!key || key.includes('..') || key.includes('\\') || key.startsWith('/') || /^[a-z]+:/i.test(key)) return '';
    return `./res/${key.split('/').map((part) => encodeURIComponent(part)).join('/')}.png`;
}

function teamCell(player) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center gap-2';
    const dot = document.createElement('span');
    dot.className = 'inline-flex size-2.5 shrink-0 rounded-full';
    dot.style.backgroundColor = teamColorFor(player.team);
    const text = document.createElement('span');
    text.className = 'font-semibold text-slate-100';
    text.textContent = displayValue(player.team);
    wrapper.append(dot, text);
    return nodeCell(wrapper);
}

function iconImage(iconKey, altText) {
    const source = resIconSource(iconKey);
    if (!source) return null;
    const image = document.createElement('img');
    image.src = source;
    image.alt = altText || '';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.className = 'size-6 shrink-0 object-contain';
    image.title = iconKey;
    return image;
}

function iconTextCell({ iconKey, altText, text, showIcon, showText }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center gap-1.5';
    const image = showIcon ? iconImage(iconKey, altText) : null;
    if (image) wrapper.appendChild(image);
    if (showText) {
        const label = document.createElement('span');
        label.textContent = displayValue(text);
        wrapper.appendChild(label);
    }
    if (!wrapper.childNodes.length) return cell('—', 'text-slate-500');
    return nodeCell(wrapper);
}

function shieldQualityCell(player) {
    const maximum = Number(player.max_shield);
    if (!Number.isFinite(maximum)) return cell('—', 'text-slate-500');
    const shieldStyle = shieldBarStyle(player.max_shield);
    const square = document.createElement('span');
    square.className = 'inline-flex size-3.5 border border-black align-middle';
    square.style.backgroundColor = shieldStyle?.color || 'rgba(15, 23, 42, 0.85)';
    square.title = String(player.max_shield);
    return nodeCell(square, 'text-center');
}

function deadCell(player, t) {
    return cell(player.is_dead ? t('player.dead') : '', player.is_dead ? 'font-semibold text-orange-200' : 'text-slate-500');
}

function downCell(player, t) {
    return cell(player.is_down ? t('player.down') : '', player.is_down ? 'font-semibold text-slate-300' : 'text-slate-500');
}

export function createUiController({ refs, store, settings, t, onReconnect, onViewModeChange, onImportPlayerData }) {
    let layoutFrame = 0;
    let activeLayoutOrientation = settings.layoutOrientation;

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

    function viewportBox() {
        const viewport = window.visualViewport;
        return {
            width: viewport?.width || window.innerWidth || refs.layout.clientWidth,
            height: viewport?.height || window.innerHeight || refs.layout.clientHeight
        };
    }

    function applyLayoutState() {
        activeLayoutOrientation = resolveResponsiveLayoutOrientation(viewportBox(), settings.layoutOrientation);
        const portrait = activeLayoutOrientation === LAYOUT_ORIENTATION_PORTRAIT;
        refs.layout.dataset.layoutOrientation = activeLayoutOrientation;
        refs.layout.dataset.menuVisible = settings.menuVisible ? 'true' : 'false';
        refs.layout.dataset.tableVisible = settings.tableVisible ? 'true' : 'false';
        setSegmentButtonState(refs.layoutLandscapeButton, !portrait);
        setSegmentButtonState(refs.layoutPortraitButton, portrait);
        setSegmentButtonState(refs.menuVisibleButton, settings.menuVisible);
        setSegmentButtonState(refs.playerTableVisibleButton, settings.tableVisible);
    }

    function syncDesktopLayout() {
        layoutFrame = 0;
        applyLayoutState();
        if (!DESKTOP_QUERY.matches || activeLayoutOrientation !== LAYOUT_ORIENTATION_LANDSCAPE) {
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
            configVisible: settings.menuVisible,
            tableVisible: settings.tableVisible,
            tableContentWidth: requiredTablePanelWidth(),
            configWidth: DESKTOP_CONFIG_WIDTH,
            columnGap: content.columnGap,
            tableMinWidth: DESKTOP_TABLE_MIN_WIDTH,
            tableMaxRatio: DESKTOP_TABLE_MAX_RATIO
        });
        const columns = [];
        if (settings.menuVisible) columns.push(`${allocation.configWidth}px`);
        columns.push('minmax(0, 1fr)');
        if (settings.tableVisible) columns.push(`${allocation.tableWidth}px`);
        refs.layout.style.gridTemplateColumns = columns.join(' ');
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

    function syncLayoutControls() {
        applyLayoutState();
        scheduleLayoutSync();
    }

    function populatePlayerSelect(players) {
        const selectedId = store.state.selectedPlayerId;
        const fragment = document.createDocumentFragment();
        for (const player of [...players].sort(comparePlayersByTeam)) {
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
        refs.focusName.title = `${t('player.team', { team: player.team })} · ${displayStatus(player, t)}`;
    }

    const columns = [
        { visible: () => settings.tableTeam, label: 'table.columns.team', render: (p) => teamCell(p) },
        { visible: () => settings.tableName, label: 'table.columns.name', render: (p) => cell(displayValue(p.name)) },
        { visible: () => settings.tableLevel, label: 'table.columns.level', render: (p) => cell(displayValue(p.level)) },
        {
            visible: () => settings.tableLegend || settings.tableLegendIconKey,
            label: 'table.columns.legend',
            render: (p) => iconTextCell({
                iconKey: p.legend_icon_key,
                altText: p.legend,
                text: p.legend,
                showIcon: settings.tableLegendIconKey,
                showText: settings.tableLegend
            })
        },
        {
            visible: () => settings.tableRank || settings.tableRankIconKey,
            label: 'table.columns.rank',
            render: (p) => iconTextCell({
                iconKey: p.rank_icon_key,
                altText: p.rank,
                text: p.rank,
                showIcon: settings.tableRankIconKey,
                showText: settings.tableRank
            })
        },
        { visible: () => settings.tableDamage, label: 'table.columns.damage', render: (p) => cell(displayValue(p.damage)) },
        { visible: () => settings.tableKills, label: 'table.columns.kills', render: (p) => cell(displayValue(p.kills)) },
        { visible: () => settings.tableRoster, label: 'table.columns.roster', render: (p) => cell(displayValue(p.roster)) },
        { visible: () => settings.tableMaxShield, label: 'table.columns.maxShield', render: (p) => shieldQualityCell(p) },
        { visible: () => settings.tableShield, label: 'table.columns.shield', render: (p) => cell(displayValue(p.shield)) },
        { visible: () => settings.tableHp, label: 'table.columns.hp', render: (p) => cell(displayValue(p.hp)) },
        { visible: () => settings.tableDead, label: 'table.columns.dead', render: (p) => deadCell(p, t) },
        { visible: () => settings.tableDown, label: 'table.columns.down', render: (p) => downCell(p, t) },
        { visible: () => settings.tableDistance, label: 'table.columns.distance', render: (p) => cell(displayDistance(p.distance)) },
        { visible: () => settings.tableUid, label: 'table.columns.uid', render: (p) => cell(displayValue(p.uid), 'font-mono') },
        { visible: () => settings.tableUidLong, label: 'table.columns.uidLong', render: (p) => cell(displayValue(p.uid_long), 'font-mono') }

        // Removed from the visible table by request. The raw state/export
        // payload still keeps these fields when the backend sends them.
        // { visible: () => settings.tableId, label: 'table.columns.id', render: (p) => cell(displayValue(p.id), 'font-mono') },
        // { visible: () => settings.tableIndex, label: 'table.columns.index', render: (p) => cell(displayValue(p.index)) },
        // { visible: () => settings.tableSelf, label: 'table.columns.self', render: (p) => cell(p.self ? t('player.yes') : t('player.no')) },
        // { visible: () => settings.tableSquad, label: 'table.columns.squad', render: (p) => cell(displayValue(p.squad)) },
        // { visible: () => settings.tableX, label: 'table.columns.x', render: (p) => cell(displayValue(p.x)) },
        // { visible: () => settings.tableY, label: 'table.columns.y', render: (p) => cell(displayValue(p.y)) },
        // { visible: () => settings.tableYaw, label: 'table.columns.yaw', render: (p) => cell(displayValue(p.yaw)) },
        // { visible: () => settings.tableMaxHp, label: 'table.columns.maxHp', render: (p) => cell(displayValue(p.max_hp)) }
    ];

    function renderTable(players) {
        const activeColumns = columns.filter((column) => column.visible());
        refs.playerTableHeader.replaceChildren(...activeColumns.map(({ label }) => {
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
        let currentTeam = null;
        let bandIndex = 0;
        const rows = [...players]
            .sort(comparePlayersByTeam)
            .map((player, index) => {
                const team = teamSortValue(player.team);
                if (index === 0) currentTeam = team;
                else if (team !== currentTeam) {
                    bandIndex = bandIndex === 0 ? 1 : 0;
                    currentTeam = team;
                }
                const row = document.createElement('tr');
                row.className = `player-table-row player-table-row-band-${bandIndex}`;
                if (player.is_dead) row.classList.add('player-table-row-dead');
                else if (player.is_down) row.classList.add('player-table-row-down');
                row.append(...activeColumns.map(({ render }) => render(player)));
                return row;
            });
        refs.playerTableBody.replaceChildren(...rows);
        scheduleLayoutSync();
    }

    function updateSnapshot(snapshot) {
        const players = snapshot?.players || [];
        const rawMapName = snapshot?.map || '';
        refs.mapName.textContent = mapDisplayName(rawMapName, t);
        refs.mapName.title = rawMapName || '—';
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
    refs.layoutLandscapeButton.addEventListener('click', () => {
        settings.layoutOrientation = LAYOUT_ORIENTATION_LANDSCAPE;
        saveSetting('layoutOrientation', settings.layoutOrientation);
        syncLayoutControls();
    });
    refs.layoutPortraitButton.addEventListener('click', () => {
        settings.layoutOrientation = LAYOUT_ORIENTATION_PORTRAIT;
        saveSetting('layoutOrientation', settings.layoutOrientation);
        syncLayoutControls();
    });
    refs.menuVisibleButton.addEventListener('click', () => {
        settings.menuVisible = !settings.menuVisible;
        saveSetting('menuVisible', settings.menuVisible);
        syncLayoutControls();
    });
    refs.playerTableVisibleButton.addEventListener('click', () => {
        settings.tableVisible = !settings.tableVisible;
        saveSetting('tableVisible', settings.tableVisible);
        syncLayoutControls();
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
                renderTable(store.state.currentSnapshot?.players || []);
                scheduleLayoutSync();
            }
        });
    }
    refs.inputs.fontSize.value = String(settings.fontSize);
    refs.inputs.fontSize.addEventListener('change', () => {
        settings.fontSize = Math.min(32, Math.max(7, Number(refs.inputs.fontSize.value) || 10));
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
        const json = formatPlayerExportJson(store.state.latestMessageText);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = currentPlayerExportFileName();
        link.click();
        URL.revokeObjectURL(link.href);
    });

    window.addEventListener('resize', scheduleLayoutSync);
    window.visualViewport?.addEventListener('resize', scheduleLayoutSync);
    if (typeof DESKTOP_QUERY.addEventListener === 'function') DESKTOP_QUERY.addEventListener('change', scheduleLayoutSync);
    if ('ResizeObserver' in window) new ResizeObserver(scheduleLayoutSync).observe(refs.layout);
    document.fonts?.ready.then(scheduleLayoutSync);

    syncConnectionControls();
    syncLayoutControls();
    syncViewControls();

    return { updateSnapshot, updateFocus, renderTable, syncViewControls, syncDesktopLayout };
}
