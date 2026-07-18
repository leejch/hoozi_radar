import {
    LAYOUT_ORIENTATION_LANDSCAPE,
    LAYOUT_ORIENTATION_PORTRAIT,
    VIEW_MODE_FOLLOW,
    VIEW_MODE_FREE,
    defaultManualPortForProtocol,
    isHttpsLocation,
    saveSetting,
    teamColorFor
} from '../config.js';
import { configureFallbackIconImage } from '../assets/icons.js';
import { mapDisplayName } from '../assets/maps.js';
import { activeLanguage } from '../i18n.js';
import { localPlayerTeam, playerForDisplay, playersForDisplay } from '../player-display.js';
import { formatPlayerStatus, shieldBarStyle } from '../render/entities.js';
import { formatRosterTags, rosterTags } from './roster.js';
import { allocateDesktopLayout, resolveResponsiveLayoutOrientation } from './layout.js';
import { currentPlayerExportFileName, formatPlayerExportJson, isJsonFileName } from './player-data.js';
import { comparePlayersByTeamAndName, sortPlayersForTable, teamSortValue } from './player-sort.js';

const DESKTOP_QUERY = window.matchMedia('(min-width: 1024px)');
const DESKTOP_CONFIG_WIDTH = 300;
const DESKTOP_TABLE_MIN_WIDTH = 180;
const DESKTOP_TABLE_MAX_RATIO = 0.3;
const TABLE_VITALS_MAX_WIDTH = 70;
const TABLE_VITALS_HEALTH_WIDTH = TABLE_VITALS_MAX_WIDTH * 0.8;
const TABLE_VITALS_BAR_HEIGHT = 4;

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
    const roster = formatRosterTags(player.roster, activeLanguage);
    return [
        formatPlayerStatus(player, t),
        displayDistance(player.distance),
        roster ? t('player.roster', { roster }) : ''
    ].filter(Boolean).join(' · ');
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

function iconImage(kind, iconKey, altText) {
    const image = document.createElement('img');
    image.alt = altText || '';
    image.loading = 'eager';
    image.decoding = 'async';
    // text-sm uses a 20px line box. Keep icons within that same box so
    // enabling an icon never changes the table row height.
    image.className = 'size-5 shrink-0 object-contain';
    image.title = iconKey;
    return configureFallbackIconImage(image, kind, iconKey) ? image : null;
}

function iconTextCell({ kind, iconKey, altText, text, showIcon, showText, redacted = false }) {
    if (redacted) return cell('-', 'text-slate-500');
    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center gap-1.5';
    const image = showIcon ? iconImage(kind, iconKey, altText) : null;
    if (image) wrapper.appendChild(image);
    if (showText) {
        const label = document.createElement('span');
        const value = text === null || text === undefined ? '' : String(text);
        if (value) {
            label.textContent = value;
            wrapper.appendChild(label);
        }
    }
    if (!wrapper.childNodes.length) return cell('', 'text-slate-500');
    return nodeCell(wrapper);
}

function nameCell(player) {
    const tags = rosterTags(player.roster, activeLanguage);
    const wrapper = document.createElement('span');
    wrapper.className = 'inline-flex items-center whitespace-nowrap';
    for (const tag of tags) {
        const item = document.createElement('span');
        item.textContent = tag.text;
        item.style.color = tag.color;
        wrapper.appendChild(item);
    }
    if (tags.length) wrapper.append(' ');
    const name = document.createElement('span');
    name.textContent = displayValue(player.name);
    if (tags[0]) name.style.color = tags[0].color;
    wrapper.appendChild(name);
    return nodeCell(wrapper);
}

function barSegment(width, fillWidth, color) {
    const bar = document.createElement('span');
    bar.className = 'relative block border border-black bg-slate-950/60';
    bar.style.width = `${width}px`;
    bar.style.height = `${TABLE_VITALS_BAR_HEIGHT}px`;
    const fill = document.createElement('span');
    fill.className = 'absolute inset-y-0 left-0';
    fill.style.width = `${Math.max(0, Math.min(width, fillWidth))}px`;
    fill.style.backgroundColor = color;
    bar.appendChild(fill);
    return bar;
}

function vitalsCell(player) {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex w-[70px] flex-col items-start gap-0.5';

    if (player.is_dead) return nodeCell(wrapper);

    const showShield = !player.is_down;
    wrapper.title = showShield
        ? `${displayValue(player.shield)}/${displayValue(player.max_shield)} · ${displayValue(player.hp)}/${displayValue(player.max_hp)}`
        : `${displayValue(player.hp)}/${displayValue(player.max_hp)}`;

    const maximumShield = Number(player.max_shield);
    const shieldStyle = shieldBarStyle(maximumShield);
    if (showShield && shieldStyle && maximumShield > 0) {
        const shieldWidth = TABLE_VITALS_MAX_WIDTH * Math.min(1, maximumShield / 125);
        const shieldValue = Math.max(0, Number(player.shield) || 0);
        wrapper.appendChild(barSegment(
            shieldWidth,
            shieldWidth * Math.min(1, shieldValue / maximumShield),
            shieldStyle.color
        ));
    }

    const maximumHealth = Math.max(1, Number(player.max_hp) || 100);
    const healthValue = Math.max(0, Number(player.hp) || 0);
    wrapper.appendChild(barSegment(
        TABLE_VITALS_HEALTH_WIDTH,
        TABLE_VITALS_HEALTH_WIDTH * Math.min(1, healthValue / maximumHealth),
        '#FFFFFF'
    ));
    return nodeCell(wrapper);
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
    let lastTableRenderSignature = null;
    let lastTableColumnSignature = null;
    const tableRowsByPlayerId = new Map();

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
        const httpsAccess = isHttpsLocation();
        if (httpsAccess) {
            settings.manualProtocol = 'wss';
            settings.manualPort = defaultManualPortForProtocol('wss');
        }
        refs.inputs.protocol.value = settings.manualProtocol;
        refs.inputs.protocol.disabled = httpsAccess;
        refs.inputs.protocol.classList.toggle('opacity-60', httpsAccess);
        refs.inputs.protocol.classList.toggle('cursor-not-allowed', httpsAccess);
        refs.inputs.port.value = String(settings.manualPort);
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
        const localTeam = localPlayerTeam(players);
        const fragment = document.createDocumentFragment();
        for (const player of [...players].sort(comparePlayersByTeamAndName)) {
            const displayPlayer = playerForDisplay(player, localTeam);
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = `${player.self ? '★ ' : ''}${displayPlayer.name} · T${player.team}`;
            option.style.color = teamColorFor(player.team);
            fragment.appendChild(option);
        }
        refs.playerSelect.replaceChildren(fragment);
        refs.playerSelect.value = selectedId;
    }

    function updateFocus(players) {
        const selectedPlayer = store.getSelectedPlayer(players);
        if (!selectedPlayer) {
            refs.focusName.textContent = '—';
            refs.focusTeamBadge.style.backgroundColor = '#64748B';
            refs.focusMeta.textContent = `${t('map.focusHealth')} — · ${t('map.focusShield')} — · ${t('map.focusKills')} —`;
            return;
        }
        const player = playerForDisplay(selectedPlayer, localPlayerTeam(players));
        refs.focusName.textContent = `${player.self ? '★ ' : ''}${player.name}`;
        refs.focusName.style.color = teamColorFor(player.team);
        refs.focusTeamBadge.style.backgroundColor = teamColorFor(player.team);
        const shieldText = Number(player.max_shield) > 0 ? `${player.shield}/${player.max_shield}` : '';
        refs.focusMeta.textContent = `${t('map.focusHealth')} ${player.hp}/${player.max_hp} · ${t('map.focusShield')} ${shieldText} · ${t('map.focusKills')} ${player.kills}`;
        refs.focusName.title = `${t('player.team', { team: player.team })} · ${displayStatus(player, t)}`;
    }

    const columns = [
        { key: 'team', visible: () => settings.tableTeam, signature: (p) => p.team, label: 'table.columns.team', render: (p) => teamCell(p) },
        { key: 'name', visible: () => settings.tableName, signature: (p) => [p.name, p.roster], label: 'table.columns.name', render: (p) => nameCell(p) },
        {
            key: 'vitals',
            visible: () => settings.tableVitals,
            signature: (p) => p.is_dead
                ? ['dead']
                : p.is_down
                    ? ['down', p.hp, p.max_hp]
                    : ['alive', p.shield, p.max_shield, p.hp, p.max_hp],
            label: 'table.columns.vitals',
            render: (p) => vitalsCell(p)
        },
        {
            key: 'legend',
            visible: () => settings.tableLegend || settings.tableLegendIconKey,
            settingsSignature: () => [settings.tableLegend, settings.tableLegendIconKey],
            signature: (p) => [p.legend, p.legend_icon_key],
            label: 'table.columns.legend',
            render: (p) => iconTextCell({
                kind: 'legend',
                iconKey: p.legend_icon_key,
                altText: p.legend,
                text: p.legend,
                showIcon: settings.tableLegendIconKey,
                showText: settings.tableLegend,
                redacted: p.displayRedacted
            })
        },
        {
            key: 'rank',
            visible: () => settings.tableRank || settings.tableRankIconKey,
            settingsSignature: () => [settings.tableRank, settings.tableRankIconKey],
            signature: (p) => [p.rank, p.rank_icon_key],
            label: 'table.columns.rank',
            render: (p) => iconTextCell({
                kind: 'rank',
                iconKey: p.rank_icon_key,
                altText: p.rank,
                text: p.rank,
                showIcon: settings.tableRankIconKey,
                showText: settings.tableRank,
                redacted: p.displayRedacted
            })
        },
        { key: 'level', visible: () => settings.tableLevel, signature: (p) => p.level, label: 'table.columns.level', render: (p) => cell(displayValue(p.level)) },
        { key: 'damage', visible: () => settings.tableDamage, signature: (p) => p.damage, label: 'table.columns.damage', render: (p) => cell(displayValue(p.damage)) },
        { key: 'kills', visible: () => settings.tableKills, signature: (p) => p.kills, label: 'table.columns.kills', render: (p) => cell(displayValue(p.kills)) },
        { key: 'uid', visible: () => settings.tableUid, signature: (p) => p.uid, label: 'table.columns.uid', render: (p) => cell(displayValue(p.uid), 'font-mono') },
        { key: 'uidLong', visible: () => settings.tableUidLong, signature: (p) => p.uid_long, label: 'table.columns.uidLong', render: (p) => cell(displayValue(p.uid_long), 'font-mono') },
        { key: 'down', visible: () => settings.tableDown, signature: (p) => p.is_down, label: 'table.columns.down', render: (p) => downCell(p, t) },
        { key: 'dead', visible: () => settings.tableDead, signature: (p) => p.is_dead, label: 'table.columns.dead', render: (p) => deadCell(p, t) }

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

    function tableRenderSignature(sortedPlayers, activeColumns) {
        return JSON.stringify({
            columns: activeColumns.map((column) => [column.key, column.settingsSignature?.() || null]),
            players: sortedPlayers.map((player) => ({
                id: player.id,
                row: [Boolean(player.is_dead), Boolean(player.is_down)],
                cells: activeColumns.map((column) => column.signature(player))
            }))
        });
    }

    function tableColumnSignature(activeColumns) {
        return JSON.stringify(activeColumns.map((column) => [
            column.key,
            column.settingsSignature?.() || null
        ]));
    }

    function rowStateClassName(player, bandIndex) {
        const classNames = ['player-table-row', `player-table-row-band-${bandIndex}`];
        if (player.is_dead) classNames.push('player-table-row-dead');
        else if (player.is_down) classNames.push('player-table-row-down');
        return classNames.join(' ');
    }

    function renderPlayerRow(player, bandIndex, activeColumns, existing = null) {
        const record = existing || {
            element: document.createElement('tr'),
            cells: new Map()
        };
        record.element.dataset.playerId = player.id;
        record.element.className = rowStateClassName(player, bandIndex);

        for (const column of activeColumns) {
            const signature = JSON.stringify(column.signature(player));
            const currentCell = record.cells.get(column.key);
            if (currentCell?.signature === signature) continue;
            const nextElement = column.render(player);
            if (currentCell) currentCell.element.replaceWith(nextElement);
            else record.element.appendChild(nextElement);
            record.cells.set(column.key, { element: nextElement, signature });
        }
        return record;
    }

    function placeTableRows(rows) {
        rows.forEach((row, index) => {
            const current = refs.playerTableBody.children[index];
            if (current !== row) refs.playerTableBody.insertBefore(row, current || null);
        });
        while (refs.playerTableBody.children.length > rows.length) {
            refs.playerTableBody.lastElementChild.remove();
        }
    }

    function renderTable(players) {
        const displayPlayers = playersForDisplay(players);
        const activeColumns = columns.filter((column) => column.visible());
        const sortedPlayers = sortPlayersForTable(displayPlayers);
        const signature = tableRenderSignature(sortedPlayers, activeColumns);
        if (signature === lastTableRenderSignature) return false;
        lastTableRenderSignature = signature;
        const columnSignature = tableColumnSignature(activeColumns);
        const columnsChanged = columnSignature !== lastTableColumnSignature;
        if (columnsChanged) {
            lastTableColumnSignature = columnSignature;
            tableRowsByPlayerId.clear();
            refs.playerTableHeader.replaceChildren(...activeColumns.map(({ label }) => {
                const th = document.createElement('th');
                th.className = 'whitespace-nowrap px-2.5 py-2 text-left';
                th.textContent = t(label);
                return th;
            }));
        }
        if (!players.length || !activeColumns.length) {
            const row = document.createElement('tr');
            const empty = cell(t('table.empty'));
            empty.colSpan = Math.max(1, activeColumns.length);
            empty.className = 'px-2.5 py-5 text-center text-xs text-slate-500';
            row.appendChild(empty);
            refs.playerTableBody.replaceChildren(row);
            tableRowsByPlayerId.clear();
            scheduleLayoutSync();
            return true;
        }
        let currentTeam = null;
        let bandIndex = 0;
        const previousPlayerIds = new Set(tableRowsByPlayerId.keys());
        const playerSetChanged = sortedPlayers.length !== previousPlayerIds.size
            || sortedPlayers.some((player) => !previousPlayerIds.has(player.id));
        const rows = sortedPlayers.map((player, index) => {
                const team = teamSortValue(player.team);
                if (index === 0) currentTeam = team;
                else if (team !== currentTeam) {
                    bandIndex = bandIndex === 0 ? 1 : 0;
                    currentTeam = team;
                }
                const record = renderPlayerRow(
                    player,
                    bandIndex,
                    activeColumns,
                    tableRowsByPlayerId.get(player.id)
                );
                tableRowsByPlayerId.set(player.id, record);
                previousPlayerIds.delete(player.id);
                return record.element;
            });
        for (const playerId of previousPlayerIds) tableRowsByPlayerId.delete(playerId);
        placeTableRows(rows);
        if (columnsChanged || playerSetChanged || previousPlayerIds.size > 0) {
            scheduleLayoutSync();
        }
        return true;
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
    refs.inputs.protocol.value = settings.manualProtocol;
    refs.inputs.protocol.addEventListener('change', () => {
        settings.manualProtocol = refs.inputs.protocol.value === 'wss' ? 'wss' : 'ws';
        settings.manualPort = defaultManualPortForProtocol(settings.manualProtocol);
        refs.inputs.port.value = String(settings.manualPort);
        saveSetting('manualProtocol', settings.manualProtocol);
        saveSetting('manualPort', settings.manualPort);
    });
    for (const [key, input] of [
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
