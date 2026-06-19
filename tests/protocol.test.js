import test from 'node:test';
import assert from 'node:assert/strict';

import { HooziProtocolError, parseHoozi3Message } from '../src/protocol/hoozi3.js';
import { createRadarStore } from '../src/state/store.js';

const basePlayer = {
    id: 'ix7', self: true, name: 'Local', index: 7, team: 1, squad: 2,
    x: 500, y: 400, yaw: 90, hp: 87, max_hp: 100, shield: 50,
    max_shield: 100, distance: 0, is_dead: false, is_down: false,
    legend: 'Wraith', legend_icon_key: 'wraith', uid: '123', level: 99,
    kills: 4, damage: 800, rank: 'Gold', rank_icon_key: 'gold',
    rank_color: '#fff', roster: 0
};

test('normalizes the checked-in state payload without legacy field synthesis', () => {
    const message = parseHoozi3Message(JSON.stringify({
        kind: 'state', ts: 10.5, map: 'mp_rr_test', players: [basePlayer],
        ring: { x: 500, y: 500, radius: 250, t_start: 1, t_end: 60, t_now: 20 }
    }));
    assert.equal(message.kind, 'state');
    assert.equal(message.map, 'mp_rr_test');
    assert.deepEqual(message.players[0].position, { x: 500, y: 400 });
    assert.equal(message.players[0].uid, '123');
    assert.equal(Object.hasOwn(message.players[0], 'uidLong'), false);
    assert.equal(message.ring.radius, 250);
});

test('retains a self player with unavailable map coordinates', () => {
    const player = { ...basePlayer };
    delete player.x;
    delete player.y;
    const message = parseHoozi3Message({ kind: 'state', ts: 1, map: '', players: [player] });
    assert.equal(message.players.length, 1);
    assert.equal(message.players[0].position, null);
    assert.equal(message.players[0].self, true);
});

test('rejects unknown message kinds and malformed state arrays', () => {
    assert.throws(() => parseHoozi3Message('{"kind":"legacy"}'), HooziProtocolError);
    assert.throws(() => parseHoozi3Message('{"kind":"state","players":{}}'), HooziProtocolError);
});

test('store orders snapshots and selects the explicit self player', () => {
    const store = createRadarStore({ selectedPlayerId: '', viewMode: 'follow' });
    const first = parseHoozi3Message({ kind: 'state', ts: 5, map: 'map', players: [basePlayer] });
    const stale = parseHoozi3Message({ kind: 'state', ts: 4, map: 'old', players: [] });
    assert.equal(store.applySnapshot(first), true);
    assert.equal(store.state.selectedPlayerId, 'ix7');
    assert.equal(store.applySnapshot(stale), false);
    assert.equal(store.state.mapName, 'map');
});

