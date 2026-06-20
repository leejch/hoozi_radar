import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { HooziProtocolError, parseHoozi3Message, parseHoozi3StateFile } from '../src/protocol/hoozi3.js';
import { createRadarStore } from '../src/state/store.js';

const basePlayer = {
    id: 'ix7', self: true, name: 'Local', index: 7, team: 1, squad: 2,
    x: 500, y: 400, yaw: 90, hp: 87, max_hp: 100, shield: 50,
    max_shield: 100, distance: 0, is_dead: false, is_down: false,
    legend: 'Wraith', legend_icon_key: 'wraith', uid: '123', level: 99,
    kills: 4, damage: 800, rank: 'Gold', rank_icon_key: 'gold',
    rank_color: '#fff', roster: 0
};

const requiredPlayerFields = [
    'id', 'self', 'name', 'index', 'team', 'squad', 'x', 'y', 'yaw',
    'hp', 'max_hp', 'shield', 'max_shield', 'distance', 'is_dead',
    'is_down', 'legend', 'legend_icon_key', 'uid', 'level', 'kills',
    'damage', 'rank', 'rank_icon_key', 'rank_color', 'roster'
];

const legacyPlayerFields = ['black', 'white', 'pro', 'hostile', 'pos'];

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

test('state-file import rejects non-state JSON messages', () => {
    assert.throws(() => parseHoozi3StateFile('{"kind":"pong","ts":1}'), HooziProtocolError);
    const state = parseHoozi3StateFile(JSON.stringify({
        kind: 'state', ts: 1, map: 'map', players: [basePlayer]
    }));
    assert.equal(state.kind, 'state');
    assert.equal(state.players.length, 1);
});

test('checked-in HOOZi 3.0 fixture is complete, importable, and legacy-free', async () => {
    const fixtureText = await readFile(
        new URL('./fixtures/hoozi3-state-example.json', import.meta.url),
        'utf8'
    );
    const raw = JSON.parse(fixtureText);
    const normalized = parseHoozi3StateFile(fixtureText);

    assert.equal(raw.kind, 'state');
    assert.equal(raw.map, 'mp_rr_divided_moon_mu1');
    assert.equal(raw.players.length, 12);
    assert.equal(normalized.players.length, raw.players.length);
    assert.equal(raw.players.filter((player) => player.self).length, 1);
    assert.equal(new Set(raw.players.map((player) => player.id)).size, raw.players.length);

    for (const player of raw.players) {
        for (const field of requiredPlayerFields) {
            assert.equal(Object.hasOwn(player, field), true, `${player.id} is missing ${field}`);
        }
        for (const field of legacyPlayerFields) {
            assert.equal(Object.hasOwn(player, field), false, `${player.id} contains legacy ${field}`);
        }
        assert.equal(typeof player.uid, 'string');
        assert.equal(player.max_hp, 100);
        assert.ok(player.x >= 0 && player.x <= 1000);
        assert.ok(player.y >= 0 && player.y <= 1000);
    }

    assert.deepEqual(Object.keys(raw.ring).sort(), [
        'radius', 't_end', 't_now', 't_start', 'x', 'y'
    ]);
    assert.ok(raw.ring.radius > 0);
    assert.ok(raw.ring.t_start <= raw.ring.t_now);
    assert.ok(raw.ring.t_now <= raw.ring.t_end);
    assert.equal(normalized.ring.radius, raw.ring.radius);
});

test('an imported snapshot does not corrupt live server timestamp ordering', () => {
    const store = createRadarStore({ selectedPlayerId: '', viewMode: 'follow' });
    const live = parseHoozi3Message({ kind: 'state', ts: 5, map: 'map', players: [basePlayer] });
    const imported = parseHoozi3Message({ kind: 'state', ts: 1, map: 'map', players: [basePlayer] });
    const staleLive = parseHoozi3Message({ kind: 'state', ts: 4, map: 'map', players: [basePlayer] });
    const nextLive = parseHoozi3Message({ kind: 'state', ts: 6, map: 'map', players: [basePlayer] });

    assert.equal(store.applySnapshot(live), true);
    assert.equal(store.applySnapshot(imported, '{}', { imported: true }), true);
    assert.equal(store.state.currentSnapshotImported, true);
    assert.equal(store.applySnapshot(staleLive), false);
    assert.equal(store.applySnapshot(nextLive), true);
    assert.equal(store.state.currentSnapshotImported, false);
    assert.equal(store.state.previousSnapshot, null);
});

