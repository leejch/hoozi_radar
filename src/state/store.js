import { defaultScaleForMode } from '../config.js';

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

export function createRadarStore(settings) {
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
        selectedPlayerId: settings.selectedPlayerId || '',
        viewMode: settings.viewMode,
        viewport: {
            scale: defaultScaleForMode(settings.viewMode),
            translateX: 0,
            translateY: 0
        },
        latestMessageText: ''
    };

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
            const selectedExists = snapshot.players.some((player) => player.id === state.selectedPlayerId);
            if (!selectedExists) {
                state.selectedPlayerId = snapshot.players.find((player) => player.self)?.id
                    || snapshot.players[0]?.id
                    || '';
            }
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
        },
        selectPlayer(id) {
            if (state.currentSnapshot?.players.some((player) => player.id === id)) {
                state.selectedPlayerId = id;
            }
        },
        getSelectedPlayer(players = state.currentSnapshot?.players || []) {
            return players.find((player) => player.id === state.selectedPlayerId)
                || players.find((player) => player.self)
                || players[0]
                || null;
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
