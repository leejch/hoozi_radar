import {
    AVAILABLE_MAP_IDS,
    DEFAULT_LOCAL_WS_TARGET,
    DESKTOP_LEFT_COLUMN_WIDTH,
    DESKTOP_MIN_MAP_SIZE,
    DESKTOP_RIGHT_MIN_WIDTH,
    RAW_CANVAS_HEIGHT,
    RAW_CANVAS_WIDTH,
    RAW_OFFSET_LEFT,
    RAW_OFFSET_TOP,
    RAW_VISIBLE_HEIGHT,
    RAW_VISIBLE_WIDTH,
    STATIC_SOURCE_ORDER,
    STATIC_SOURCE_URLS,
    clampScale,
    getEffectivePixelRatio,
    isHttpsAccess,
    normalizeMapId
} from './scripts/config.js';
import { applyTranslations, markLabels, t } from './scripts/i18n.js';
import { refs, doc } from './scripts/refs.js';
import { settings, state } from './scripts/state.js';
import {
    createPlayerTableSnapshot,
    normalizePlayers,
    teamColorFor
} from './scripts/player-utils.js';

applyTranslations(doc);

const desktopQuery = window.matchMedia('(min-width: 1024px)');

let layoutRefreshScheduled = false;

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
if (refs.inputs.mapAuto) {
    refs.inputs.mapAuto.checked = state.mapAuto;
    refs.inputs.mapAuto.addEventListener('change', (event) => {
        setMapAuto(event.target.checked);
    });
}
refs.inputs.tableTeam.checked = settings.tableTeam;
refs.inputs.tableName.checked = settings.tableName;
refs.inputs.tableUidShort.checked = settings.tableUidShort;
refs.inputs.tableUidLong.checked = settings.tableUidLong;
refs.inputs.tableLevel.checked = settings.tableLevel;
refs.inputs.tableRank.checked = settings.tableRank;
refs.inputs.tableKills.checked = settings.tableKills;
refs.inputs.tableMarks.checked = settings.tableMarks;
refs.inputs.tableVisible.checked = settings.tableVisible;

const mapOptionButtons = Array.isArray(refs.mapOptionButtons) ? refs.mapOptionButtons : [];
if (mapOptionButtons.length) {
    mapOptionButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const mapId = normalizeMapId(button.dataset.mapOption);
            if (!mapId || !AVAILABLE_MAP_IDS.includes(mapId)) {
                return;
            }
            if (state.mapAuto) {
                setMapAuto(false);
            }
            if (state.manualMapId === mapId) {
                state.manualMapId = null;
                settings.manualMapId = '';
                localStorage.removeItem('conf_manual_map');
            } else {
                state.manualMapId = mapId;
                settings.manualMapId = mapId;
                localStorage.setItem('conf_manual_map', mapId);
            }
            updateManualMapSelectionUI();
            syncMapFromState();
        });
    });
}

updateManualMapSelectionUI();
syncMapFromState();

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
    const raw = (settings.ipaddr || '').trim();
    if (!raw || raw.toLowerCase() === 'auto') {
        if (isHttpsAccess) {
            return location.host ? `wss://${location.host}/ws` : null;
        }
        return DEFAULT_LOCAL_WS_TARGET;
    }
    if (/^wss?:\/\//i.test(raw)) {
        return raw;
    }
    const scheme = isHttpsAccess ? 'wss://' : 'ws://';
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
        state.latestWsMapId = null;
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

        const layoutHasTable = !layout.classList.contains('player-table-hidden');
        const columnGapCount = layoutHasTable ? 2 : 1;
        const reservedRightWidth = layoutHasTable ? DESKTOP_RIGHT_MIN_WIDTH : 0;

        const availableWidth = Math.max(
                0,
                viewportWidth - DESKTOP_LEFT_COLUMN_WIDTH - horizontalPadding - gapX * columnGapCount
        );
        const widthCandidate = Math.max(0, availableWidth - reservedRightWidth);
        const boundedWidth = layoutHasTable && widthCandidate > 0 ? widthCandidate : availableWidth;
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
    state.viewport.scale = 1;
    state.viewport.translateX = 0;
    state.viewport.translateY = 0;
    applyTransform();
    updateCanvasResolution();
    renderPlayers();
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

function setMapAuto(enabled) {
    const nextValue = Boolean(enabled);
    state.mapAuto = nextValue;
    settings.mapAuto = nextValue;
    const toggle = refs.mapAutoToggle || refs.inputs.mapAuto;
    if (toggle) {
        toggle.checked = nextValue;
    }
    localStorage.setItem('conf_map_auto', nextValue ? 'true' : 'false');
    if (nextValue) {
        state.manualMapId = null;
        settings.manualMapId = '';
        localStorage.removeItem('conf_manual_map');
    }
    updateManualMapSelectionUI();
    syncMapFromState();
}

function updateManualMapSelectionUI() {
    const buttons = Array.isArray(refs.mapOptionButtons) ? refs.mapOptionButtons : [];
    buttons.forEach((button) => {
        const mapId = normalizeMapId(button.dataset.mapOption);
        const isActive = Boolean(mapId) && state.manualMapId === mapId;
        button.classList.toggle('border-emerald-400/60', isActive);
        button.classList.toggle('bg-emerald-500/10', isActive);
        button.classList.toggle('ring-2', isActive);
        button.classList.toggle('ring-emerald-400/70', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        button.setAttribute('aria-disabled', state.mapAuto ? 'true' : 'false');
    });
}

function syncMapFromState() {
    const activeMapId = state.manualMapId || state.latestWsMapId;
    if (activeMapId) {
        updateMap(activeMapId);
    }
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
        if (!state.manualMapId) {
            state.latestWsMapId = incomingMapId;
        }
        syncMapFromState();
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

refs.reconnectButton.addEventListener('click', () => {
    connect();
});

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

refs.mapStage.addEventListener('pointerdown', (event) => {
    if (isOverlayBlocking()) return;
    if (refs.mapControls && refs.mapControls.contains(event.target)) {
        return;
    }
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
    syncMapControlsHost();
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

renderPlayerTable();
updateDownloadButtonState();

syncMapControlsHost();
resizeCanvas();
updateStatus('connecting', t('status.waiting'));
setOverlayState('loading', t('overlay.waitingTitle'), t('overlay.waitingSubtitle'));
connect();
