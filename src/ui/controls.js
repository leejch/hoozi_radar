import { VIEW_MODE_FOLLOW, VIEW_MODE_FREE, saveSetting, teamColorFor } from '../config.js';
import { formatPlayerStatus } from '../render/entities.js';

export function collectDomReferences(root = document) {
    const byId = (id) => root.getElementById(id);
    return {
        layout: root.querySelector('[data-role="layout"]'),
        brandLogo: root.querySelector('[data-role="brand-logo"]'),
        statusIndicator: root.querySelector('[data-role="status-indicator"]'),
        statusText: root.querySelector('[data-role="status-text"]'),
        playerSelect: byId('sel_player'),
        viewModeFreeButton: byId('viewModeFree'),
        viewModeFollowButton: byId('viewModeFollow'),
        mapStage: byId('mapStage'),
        mapViewport: byId('mapViewport'),
        mapImage: byId('mapImage'),
        mapCanvas: byId('mapCanvas'),
        mapOverlay: byId('mapOverlay'),
        overlayTitle: byId('overlayTitle'),
        overlaySubtitle: byId('overlaySubtitle'),
        playerCount: byId('playerCount'),
        focusName: byId('focusPlayerName'),
        focusTeamBadge: byId('focusTeamBadge'),
        focusMeta: byId('focusMeta'),
        zoomReset: byId('zoomReset'),
        mapControls: byId('mapControls'),
        reconnectButton: byId('reconnectButton'),
        configReconnectButton: byId('configReconnectButton'),
        connectionModeAutoButton: byId('connectionModeAuto'),
        connectionModeManualButton: byId('connectionModeManual'),
        connectionManualFields: root.querySelector('[data-role="connection-manual-fields"]'),
        downloadLatestButton: byId('downloadLatestButton'),
        playerTableSection: root.querySelector('[data-role="player-table-section"]'),
        playerTableHeader: root.querySelector('[data-role="player-table-header"]'),
        playerTableBody: root.querySelector('[data-role="player-table-body"]'),
        playerTableToggleLabel: root.querySelector('[data-role="player-table-toggle-label"]'),
        inputs: {
            protocol: byId('conf_protocol'), host: byId('conf_host'), port: byId('conf_port'), path: byId('conf_path'),
            fontSize: byId('conf_fontsize'), showName: byId('conf_showname'), showLegend: byId('conf_showlegend'),
            showVitals: byId('conf_showvitals'), showStats: byId('conf_showstats'), showTeamLinks: byId('conf_showteamlinks'),
            showRing: byId('conf_showring'), showDead: byId('conf_showdead'), showDown: byId('conf_showdown'),
            tableVisible: byId('conf_table_visible'), tableTeam: byId('conf_table_team'), tableName: byId('conf_table_name'),
            tableLegend: byId('conf_table_legend'), tableUid: byId('conf_table_uid'), tableVitals: byId('conf_table_vitals'),
            tableRank: byId('conf_table_rank'), tableCombat: byId('conf_table_combat'), tableStatus: byId('conf_table_status')
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
        connected: ['bg-emerald-400'], connecting: ['bg-amber-300', 'animate-pulse'],
        error: ['bg-rose-500'], waiting: ['bg-slate-500']
    };
    refs.statusIndicator.classList.add(...(classNames[state] || classNames.waiting));
}

function cell(text, className = '') {
    const element = document.createElement('td');
    element.className = `whitespace-nowrap px-2.5 py-1.5 text-sm text-slate-200 ${className}`;
    element.textContent = text;
    return element;
}

function displayStatus(player, t) {
    return `${formatPlayerStatus(player, t)} · ${player.distance.toFixed(1)}m · yaw ${player.yaw} · ${t('player.roster', { roster: player.roster })}`;
}

export function createUiController({ refs, store, settings, t, onReconnect, onViewModeChange }) {
    const checkboxBindings = [
        ['showName', refs.inputs.showName], ['showLegend', refs.inputs.showLegend], ['showVitals', refs.inputs.showVitals],
        ['showStats', refs.inputs.showStats], ['showTeamLinks', refs.inputs.showTeamLinks], ['showRing', refs.inputs.showRing],
        ['showDead', refs.inputs.showDead], ['showDown', refs.inputs.showDown], ['tableVisible', refs.inputs.tableVisible],
        ['tableTeam', refs.inputs.tableTeam], ['tableName', refs.inputs.tableName], ['tableLegend', refs.inputs.tableLegend],
        ['tableUid', refs.inputs.tableUid], ['tableVitals', refs.inputs.tableVitals], ['tableRank', refs.inputs.tableRank],
        ['tableCombat', refs.inputs.tableCombat], ['tableStatus', refs.inputs.tableStatus]
    ];

    function syncConnectionControls() {
        const manual = settings.connectionMode === 'manual';
        refs.connectionManualFields.classList.toggle('hidden', !manual);
        refs.connectionModeAutoButton.classList.toggle('border-emerald-400', !manual);
        refs.connectionModeAutoButton.classList.toggle('text-emerald-300', !manual);
        refs.connectionModeManualButton.classList.toggle('border-emerald-400', manual);
        refs.connectionModeManualButton.classList.toggle('text-emerald-300', manual);
    }

    function syncViewControls() {
        const free = store.state.viewMode === VIEW_MODE_FREE;
        refs.viewModeFreeButton.classList.toggle('border-emerald-400', free);
        refs.viewModeFreeButton.classList.toggle('text-emerald-300', free);
        refs.viewModeFollowButton.classList.toggle('border-emerald-400', !free);
        refs.viewModeFollowButton.classList.toggle('text-emerald-300', !free);
    }

    function syncTableVisibility() {
        refs.playerTableSection.classList.toggle('lg:flex', settings.tableVisible);
        refs.playerTableSection.classList.toggle('lg:hidden', !settings.tableVisible);
        refs.layout.classList.toggle('player-table-hidden', !settings.tableVisible);
    }

    function populatePlayerSelect(players) {
        const selectedId = store.state.selectedPlayerId;
        const fragment = document.createDocumentFragment();
        for (const player of [...players].sort((a, b) => a.team - b.team || a.name.localeCompare(b.name))) {
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
            refs.focusMeta.textContent = '—';
            return;
        }
        refs.focusName.textContent = `${player.self ? '★ ' : ''}${player.name}`;
        refs.focusName.style.color = teamColorFor(player.team);
        refs.focusTeamBadge.style.backgroundColor = teamColorFor(player.team);
        refs.focusMeta.textContent = `${player.legend || t('player.unknown')} · HP ${player.hp}/${player.max_hp} · S ${player.shield}/${player.max_shield} · K ${player.kills}`;
        refs.focusName.title = `${t('player.team', { team: player.team })} · ${t('player.squad', { squad: player.squad })} · ${displayStatus(player, t)}`;
    }

    const columns = [
        ['tableTeam', 'table.columns.team', (p) => cell(`${p.team} / ${p.squad}`, 'font-semibold')],
        ['tableName', 'table.columns.name', (p) => cell(`${p.self ? '★ ' : ''}${p.name}`)],
        ['tableLegend', 'table.columns.legend', (p) => cell(p.legend || '—')],
        ['tableUid', 'table.columns.uid', (p) => cell(p.uid || '—', 'font-mono')],
        ['tableVitals', 'table.columns.vitals', (p) => cell(`${p.hp}/${p.max_hp} · ${p.shield}/${p.max_shield}`)],
        ['tableRank', 'table.columns.rank', (p) => cell(`Lv ${p.level} · ${p.rank || '—'}`)],
        ['tableCombat', 'table.columns.combat', (p) => cell(`${p.kills} · ${p.damage}`)],
        ['tableStatus', 'table.columns.status', (p) => cell(displayStatus(p, t))]
    ];

    function renderTable(players) {
        const activeColumns = columns.filter(([setting]) => settings[setting]);
        refs.playerTableHeader.replaceChildren(...activeColumns.map(([, label]) => {
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
            return;
        }
        const rows = [...players]
            .sort((a, b) => a.team - b.team || a.name.localeCompare(b.name))
            .map((player, index) => {
                const row = document.createElement('tr');
                row.className = `player-table-row player-table-row-band-${index % 2}`;
                row.append(...activeColumns.map(([, , render]) => render(player)));
                return row;
            });
        refs.playerTableBody.replaceChildren(...rows);
    }

    function updateSnapshot(snapshot) {
        const players = snapshot?.players || [];
        refs.playerCount.textContent = String(players.length);
        populatePlayerSelect(players);
        updateFocus(players);
        renderTable(players);
        refs.downloadLatestButton.disabled = !store.state.latestMessageText;
    }

    refs.connectionModeAutoButton.addEventListener('click', () => {
        settings.connectionMode = 'auto'; saveSetting('connectionMode', 'auto'); syncConnectionControls(); onReconnect();
    });
    refs.connectionModeManualButton.addEventListener('click', () => {
        settings.connectionMode = 'manual'; saveSetting('connectionMode', 'manual'); syncConnectionControls();
    });
    for (const [key, input] of [['manualProtocol', refs.inputs.protocol], ['manualHost', refs.inputs.host], ['manualPort', refs.inputs.port], ['manualPath', refs.inputs.path]]) {
        input.value = settings[key];
        input.addEventListener('change', () => { settings[key] = input.value.trim(); saveSetting(key, settings[key]); });
    }
    for (const [key, input] of checkboxBindings) {
        input.checked = Boolean(settings[key]);
        input.addEventListener('change', () => {
            settings[key] = input.checked; saveSetting(key, settings[key]);
            if (key.startsWith('table')) { syncTableVisibility(); renderTable(store.state.currentSnapshot?.players || []); }
        });
    }
    refs.inputs.fontSize.value = String(settings.fontSize);
    refs.inputs.fontSize.addEventListener('change', () => {
        settings.fontSize = Math.min(32, Math.max(7, Number(refs.inputs.fontSize.value) || 11));
        refs.inputs.fontSize.value = String(settings.fontSize); saveSetting('fontSize', settings.fontSize);
    });
    refs.playerSelect.addEventListener('change', () => {
        store.selectPlayer(refs.playerSelect.value);
        settings.selectedPlayerId = store.state.selectedPlayerId;
        saveSetting('selectedPlayerId', settings.selectedPlayerId);
        updateFocus(store.state.currentSnapshot?.players || []);
    });
    refs.viewModeFreeButton.addEventListener('click', () => { onViewModeChange(VIEW_MODE_FREE); syncViewControls(); });
    refs.viewModeFollowButton.addEventListener('click', () => { onViewModeChange(VIEW_MODE_FOLLOW); syncViewControls(); });
    refs.reconnectButton.addEventListener('click', onReconnect);
    refs.configReconnectButton.addEventListener('click', onReconnect);
    refs.downloadLatestButton.addEventListener('click', () => {
        if (!store.state.latestMessageText) return;
        const blob = new Blob([store.state.latestMessageText], { type: 'application/json;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `hoozi3-state-${new Date().toISOString().replace(/[:]/g, '-')}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
    });

    syncConnectionControls();
    syncViewControls();
    syncTableVisibility();

    return { updateSnapshot, updateFocus, renderTable, syncViewControls };
}
