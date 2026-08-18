import test from 'node:test';
import assert from 'node:assert/strict';

import { parseHoozi3Message } from '../src/protocol/hoozi3.js';
import {
    PLAYER_SELECTION_AUTO,
    PLAYER_SELECTION_MANUAL,
    createRadarStore
} from '../src/state/store.js';

function player(id, uid, team, { self = false, dead = false, name = id } = {}) {
    return {
        id, uid, team, self, name, is_dead: dead, index: Number(id.replace(/\D/g, '')) || 0,
        x: 500, y: 500, yaw: 0, distance: 0, legend: '', legend_icon_key: '',
        level: 1, kills: 0, damage: 0, rank: '', rank_icon_key: '', rank_color: '', roster: 0
    };
}

function snapshot(ts, players, map = 'mp_rr_olympus') {
    return parseHoozi3Message({ kind: 'state', ts, map, players });
}

function createStore() {
    return createRadarStore({ viewMode: 'follow' });
}

test('automatic focus follows the current self, including a spectated enemy', () => {
    const store = createStore();
    store.applySnapshot(snapshot(1, [
        player('ix1', 'local-uid', 5, { self: true, name: 'Local' }),
        player('ix2', 'enemy-uid', 9, { name: 'Enemy' })
    ]));
    assert.equal(store.getSelectedPlayer()?.id, 'ix1');

    store.applySnapshot(snapshot(2, [
        player('ix1', 'local-uid', 5, { dead: true, name: 'Local' }),
        player('ix2', 'enemy-uid', 9, { self: true, name: 'Enemy' })
    ]));
    assert.equal(store.getSelectedPlayer()?.id, 'ix2');
    assert.equal(store.state.selectionMode, PLAYER_SELECTION_AUTO);
});

test('local-team identity stays bound to the original UID while spectating another team', () => {
    const store = createStore();
    store.applySnapshot(snapshot(1, [
        player('ix1', 'local-uid', 5, { self: true, name: 'Local' }),
        player('ix3', 'mate-uid', 5, { name: 'Mate' })
    ]));
    assert.equal(store.state.localPlayerUid, 'local-uid');
    assert.equal(store.getLocalPlayerTeam(), 5);

    store.applySnapshot(snapshot(2, [
        player('ix1', 'local-uid', 5, { dead: true, name: 'Local' }),
        player('ix3', 'mate-uid', 5, { dead: true, name: 'Mate' }),
        player('ix9', 'spectated-uid', 12, { self: true, name: 'Spectated' })
    ]));

    assert.equal(store.getSelectedPlayer()?.id, 'ix9');
    assert.equal(store.getLocalPlayerTeam(), 5);
    assert.equal(store.state.localPlayerUid, 'local-uid');
});

test('the next match follows self again and resolves the local UID to its new team', () => {
    const store = createStore();
    store.applySnapshot(snapshot(1, [player('ix1', 'local-uid', 5, { self: true })]));
    store.applySnapshot(snapshot(2, [
        player('ix1', 'local-uid', 5, { dead: true }),
        player('ix9', 'spectated-uid', 12, { self: true })
    ]));
    store.applySnapshot(snapshot(3, [
        player('ix41', 'local-uid', 2, { self: true, name: 'Local next match' }),
        player('ix9', 'different-uid', 8)
    ]));

    assert.equal(store.getSelectedPlayer()?.id, 'ix41');
    assert.equal(store.getSelectedPlayer()?.uid, 'local-uid');
    assert.equal(store.getLocalPlayerTeam(), 2);
});

test('a temporarily absent local UID never makes the spectated team local', () => {
    const store = createStore();
    store.applySnapshot(snapshot(1, [player('ix1', 'local-uid', 5, { self: true })]));
    store.applySnapshot(snapshot(2, [player('ix9', 'spectated-uid', 12, { self: true })]));

    assert.equal(store.getSelectedPlayer()?.id, 'ix9');
    assert.equal(store.getLocalPlayerTeam(), null);
    assert.equal(store.state.localPlayerUid, 'local-uid');
});

test('a session-restored local UID identifies the real team after reload during spectating', () => {
    const store = createRadarStore({ viewMode: 'follow', localPlayerUid: 'local-uid' });
    store.applySnapshot(snapshot(1, [
        player('ix1', 'local-uid', 5, { dead: true }),
        player('ix9', 'spectated-uid', 12, { self: true })
    ]));

    assert.equal(store.getSelectedPlayer()?.id, 'ix9');
    assert.equal(store.getLocalPlayerTeam(), 5);
});

test('automatic focus stays empty without self and resumes when self returns', () => {
    const store = createStore();
    store.applySnapshot(snapshot(1, [player('ix1', 'a', 1), player('ix2', 'b', 2)]));
    assert.equal(store.getSelectedPlayer(), null);
    store.applySnapshot(snapshot(2, [player('ix2', 'b', 2, { self: true })]));
    assert.equal(store.getSelectedPlayer()?.id, 'ix2');
});

test('an explicit non-self selection overrides later self changes', () => {
    const store = createStore();
    store.applySnapshot(snapshot(1, [
        player('ix1', 'local', 1, { self: true }),
        player('ix2', 'manual', 2)
    ]));
    assert.equal(store.selectPlayer('ix2'), true);
    assert.equal(store.state.selectionMode, PLAYER_SELECTION_MANUAL);

    store.applySnapshot(snapshot(2, [
        player('ix1', 'local', 1),
        player('ix2', 'manual', 2),
        player('ix3', 'spectated', 3, { self: true })
    ]));
    assert.equal(store.getSelectedPlayer()?.id, 'ix2');

    store.selectPlayer('');
    assert.equal(store.state.selectionMode, PLAYER_SELECTION_AUTO);
    assert.equal(store.getSelectedPlayer()?.id, 'ix3');
});

test('manual focus rejects a reused entity id with a different UID', () => {
    const store = createStore();
    store.applySnapshot(snapshot(1, [
        player('ix1', 'local', 1, { self: true }),
        player('ix7', 'old-uid', 2)
    ]));
    store.selectPlayer('ix7');
    store.applySnapshot(snapshot(2, [
        player('ix3', 'local', 4, { self: true }),
        player('ix7', 'new-uid', 8)
    ]));

    assert.equal(store.state.selectionMode, PLAYER_SELECTION_AUTO);
    assert.equal(store.getSelectedPlayer()?.id, 'ix3');
});

test('render interpolation takes the shortest yaw path across the 180-degree boundary', () => {
    const store = createStore();
    store.applySnapshot(snapshot(1, [{ ...player('ix1', 'local', 1, { self: true }), yaw: 170 }]));
    store.applySnapshot(snapshot(2, [{ ...player('ix1', 'local', 1, { self: true }), yaw: -170 }]));
    store.state.currentReceivedAt = 0;
    store.state.snapshotIntervalMs = 100;

    assert.equal(store.getRenderSnapshot(50).players[0].yaw, 180);
});
