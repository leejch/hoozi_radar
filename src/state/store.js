import { defaultScaleForMode } from '../config.js';

export const PLAYER_SELECTION_AUTO = 'auto';
export const PLAYER_SELECTION_MANUAL = 'manual';

function clamp01(value) {
    return Math.min(1, Math.max(0, value));
}

function interpolateNumber(from, to, alpha) {
    return Number.isFinite(from) && Number.isFinite(to) ? from + (to - from) * alpha : to;
}

function interpolatePosition(previous, current, alpha) {
    if (!previous?.position || !current?.position) return current?.position ?? null;
    return {
        x: interpolateNumber(previous.position.x, current.position.x, alpha),
        y: interpolateNumber(previous.position.y, current.position.y, alpha)
    };
}

function interpolatePlayers(previousPlayers, currentPlayers, alpha) {
    const previousById = new Map((previousPlayers || []).map((player) => [player.id, player]));
    return currentPlayers.map((player) => {
        const previous = previousById.get(player.id);
        if (!previous) return player;
        return { ...player, position: interpolatePosition(previous, player, alpha) };
    });
}

function interpolateRing(previous, current, alpha) {
    if (!previous || !current) return current;
    return {
        ...current,
        x: interpolateNumber(previous.x, current.x, alpha),
        y: interpolateNumber(previous.y, current.y, alpha),
        radius: interpolateNumber(previous.radius, current.radius, alpha)
    };
}

function identityValue(value, ignoredValues = []) {
    const normalized = String(value ?? '').trim();
    return normalized && !ignoredValues.includes(normalized) ? normalized : '';
}

function playerIdentity(player) {
    return {
        id: player.id,
        uid: identityValue(player.uid, ['0']),
        name: identityValue(player.name, ['?'])
    };
}

function matchesPlayerIdentity(identity, player) {
    if (!identity || player.id !== identity.id) return false;
    const uid = identityValue(player.uid, ['0']);
    if (identity.uid && uid) return identity.uid === uid;
    const name = identityValue(player.name, ['?']);
    if (identity.name && name) return identity.name === name;
    return true;
}

function findSelfPlayer(players, preferredId = '') {
    return players.find((player) => player.self && player.id === preferredId)
        || players.find((player) => player.self)
        || null;
}

export function createRadarStore(settings = {}) {
    const state = {
        socket: null,
        connection: 'waiting',
        mapLoaded: false,
        mapName: '',
        previousSnapshot: null,
        currentSnapshot: null,
        latestServerTimestamp: Number.NEGATIVE_INFINITY,
        currentSnapshotImported: false,
        currentReceivedAt: 0,
        snapshotIntervalMs: 30,
        selectedPlayerId: '',
        selectionMode: PLAYER_SELECTION_AUTO,
        viewMode: settings.viewMode,
        viewport: {
            scale: defaultScaleForMode(settings.viewMode),
            translateX: 0,
            translateY: 0
        },
        latestMessageText: ''
    };
    let manualPlayerIdentity = null;

    function selectAutomaticPlayer(players) {
        const selfPlayer = findSelfPlayer(players, state.selectedPlayerId);
        state.selectedPlayerId = selfPlayer?.id || '';
    }

    function synchronizePlayerSelection(players) {
        if (state.selectionMode === PLAYER_SELECTION_MANUAL) {
            const manualPlayer = players.find((player) => matchesPlayerIdentity(manualPlayerIdentity, player));
            if (manualPlayer) {
                state.selectedPlayerId = manualPlayer.id;
                return;
            }
            state.selectionMode = PLAYER_SELECTION_AUTO;
            manualPlayerIdentity = null;
        }
        selectAutomaticPlayer(players);
    }

    return {
        state,
        applySnapshot(snapshot, rawText = '', { imported = false } = {}) {
            if (!imported && snapshot.ts < state.latestServerTimestamp) return false;
            const now = performance.now();
            if (!imported && !state.currentSnapshotImported && state.currentReceivedAt > 0) {
                const interval = now - state.currentReceivedAt;
                if (Number.isFinite(interval) && interval >= 8 && interval <= 1000) {
                    state.snapshotIntervalMs = interval;
                }
            }
            state.previousSnapshot = !imported
                && !state.currentSnapshotImported
                && state.currentSnapshot?.map === snapshot.map
                ? state.currentSnapshot
                : null;
            state.currentSnapshot = snapshot;
            state.currentSnapshotImported = imported;
            state.currentReceivedAt = now;
            if (!imported) state.latestServerTimestamp = snapshot.ts;
            state.mapName = snapshot.map;
            state.latestMessageText = rawText || JSON.stringify(snapshot, null, 2);
            synchronizePlayerSelection(snapshot.players);
            return true;
        },
        clearSnapshot() {
            state.mapLoaded = false;
            state.mapName = '';
            state.previousSnapshot = null;
            state.currentSnapshot = null;
            state.currentSnapshotImported = false;
            state.latestServerTimestamp = Number.NEGATIVE_INFINITY;
            state.currentReceivedAt = 0;
            state.selectedPlayerId = '';
            state.selectionMode = PLAYER_SELECTION_AUTO;
            manualPlayerIdentity = null;
        },
        selectPlayer(id) {
            const players = state.currentSnapshot?.players || [];
            if (!id) {
                state.selectionMode = PLAYER_SELECTION_AUTO;
                manualPlayerIdentity = null;
                selectAutomaticPlayer(players);
                return true;
            }
            const player = players.find((candidate) => candidate.id === id);
            if (!player) return false;
            if (player.self) {
                state.selectionMode = PLAYER_SELECTION_AUTO;
                manualPlayerIdentity = null;
                selectAutomaticPlayer(players);
                return true;
            }
            state.selectionMode = PLAYER_SELECTION_MANUAL;
            manualPlayerIdentity = playerIdentity(player);
            state.selectedPlayerId = player.id;
            return true;
        },
        getSelectedPlayer(players = state.currentSnapshot?.players || []) {
            if (state.selectionMode === PLAYER_SELECTION_MANUAL) {
                return players.find((player) => matchesPlayerIdentity(manualPlayerIdentity, player)) || null;
            }
            return findSelfPlayer(players, state.selectedPlayerId);
        },
        getRenderSnapshot(now = performance.now()) {
            const current = state.currentSnapshot;
            if (!current) return null;
            const previous = state.previousSnapshot;
            if (!previous) return current;
            const alpha = clamp01((now - state.currentReceivedAt) / Math.max(16, state.snapshotIntervalMs));
            return {
                ...current,
                players: interpolatePlayers(previous.players, current.players, alpha),
                ring: interpolateRing(previous.ring, current.ring, alpha)
            };
        }
    };
}
