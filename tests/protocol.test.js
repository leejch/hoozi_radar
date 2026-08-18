import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

import {
    HooziProtocolError,
    computeLongUidFromShort,
    normalizeYaw,
    parseHoozi3Message,
    parseHoozi3StateFile
} from '../src/protocol/hoozi3.js';
import { createRadarStore } from '../src/state/store.js';

const basePlayer = {
    damage: 800, distance: 0, id: 'ix7', index: 7, is_dead: false, kills: 4,
    legend: 'Wraith', legend_icon_key: 'icon_legends/30px-Portrait_Wraith_square',
    level: 99, name: 'Local', rank: 'Gold', rank_color: '#fff',
    rank_icon_key: 'icon_rank/gold1', roster: 0, self: true, team: 1,
    uid: '123', x: 500, y: 400, yaw: 90
};

const backendPlayerFields = [
    'damage', 'distance', 'id', 'index', 'is_dead', 'kills', 'legend',
    'legend_icon_key', 'level', 'name', 'rank', 'rank_color', 'rank_icon_key',
    'roster', 'self', 'team', 'uid', 'x', 'y', 'yaw'
];
const removedPlayerFields = ['hp', 'is_down', 'max_hp', 'max_shield', 'shield', 'squad'];

test('normalizes the reduced backend player contract', () => {
    const message = parseHoozi3Message({
        kind: 'state', ts: 10.5, map: 'mp_rr_test', players: [basePlayer],
        ring: { x: 500, y: 500, radius: 250, t_start: 1, t_end: 60, t_now: 20 }
    });
    const player = message.players[0];
    assert.deepEqual(player.position, { x: 500, y: 400 });
    assert.equal(player.uid, '123');
    assert.equal(player.uid_long, '16045690981555499126');
    assert.equal(player.yaw, 90);
    for (const field of removedPlayerFields) assert.equal(Object.hasOwn(player, field), false, field);
    assert.equal(message.ring.radius, 250);
});

test('removed backend fields are ignored instead of synthesized into state', () => {
    const player = parseHoozi3Message({
        kind: 'state', ts: 1, map: '', players: [{
            ...basePlayer,
            hp: 87, is_down: true, max_hp: 100, max_shield: 100, shield: 50, squad: 2
        }]
    }).players[0];
    for (const field of removedPlayerFields) assert.equal(Object.hasOwn(player, field), false, field);
});

test('yaw is normalized to (-180, 180] independently of map-axis projection', () => {
    assert.equal(normalizeYaw(0), 0);
    assert.equal(normalizeYaw(180), 180);
    assert.equal(normalizeYaw(-180), 180);
    assert.ok(Math.abs(normalizeYaw(249.08) - (-110.92)) < 1e-10);
    assert.ok(Math.abs(normalizeYaw(314.3) - (-45.7)) < 1e-10);
    assert.equal(normalizeYaw(undefined), 0);
});

test('derives the long UID from the short UID with the approved 64-bit mask', () => {
    assert.equal(computeLongUidFromShort('123'), '16045690981555499126');
    assert.equal(computeLongUidFromShort('1000365359555'), '16045689988710527438');
    assert.equal(computeLongUidFromShort(''), '');
    assert.equal(computeLongUidFromShort('not-a-number'), '');
});

test('retains a self player with unavailable map coordinates', () => {
    const player = { ...basePlayer };
    delete player.x;
    delete player.y;
    const message = parseHoozi3Message({ kind: 'state', ts: 1, map: '', players: [player] });
    assert.equal(message.players[0].position, null);
    assert.equal(message.players[0].self, true);
});

test('normalizes display sentinels and roster aliases', () => {
    const player = parseHoozi3Message({
        kind: 'state', ts: 1, map: '', players: [{
            ...basePlayer, legend: 'pilot_medium_empty', rank: 'None', roster: undefined, rosters: 13
        }]
    }).players[0];
    assert.equal(player.legend, '');
    assert.equal(player.rank, '');
    assert.equal(player.roster, 13);
});

test('rejects unknown message kinds and malformed state arrays', () => {
    assert.throws(() => parseHoozi3Message('{"kind":"legacy"}'), HooziProtocolError);
    assert.throws(() => parseHoozi3Message('{"kind":"state","players":{}}'), HooziProtocolError);
});

test('store orders snapshots and selects the explicit self player', () => {
    const store = createRadarStore({ viewMode: 'follow' });
    const first = parseHoozi3Message({ kind: 'state', ts: 5, map: 'map', players: [basePlayer] });
    const stale = parseHoozi3Message({ kind: 'state', ts: 4, map: 'old', players: [] });
    assert.equal(store.applySnapshot(first), true);
    assert.equal(store.state.selectedPlayerId, 'ix7');
    assert.equal(store.applySnapshot(stale), false);
    assert.equal(store.state.mapName, 'map');
});

test('state-file import rejects non-state JSON messages', () => {
    assert.throws(() => parseHoozi3StateFile('{"kind":"pong","ts":1}'), HooziProtocolError);
    assert.equal(parseHoozi3StateFile(JSON.stringify({
        kind: 'state', ts: 1, map: 'map', players: [basePlayer]
    })).players.length, 1);
});

test('checked-in real fixtures use exactly the reduced player field set', async () => {
    const fixtureRoot = new URL('./fixtures/', import.meta.url);
    const names = (await readdir(fixtureRoot)).filter((name) => name.startsWith('hoozi3-current-players-'));
    assert.equal(names.length, 2);

    for (const name of names) {
        const text = await readFile(new URL(name, fixtureRoot), 'utf8');
        const raw = JSON.parse(text);
        const normalized = parseHoozi3StateFile(text);
        assert.equal(normalized.players.length, raw.players.length, name);
        for (const player of raw.players) {
            assert.deepEqual(Object.keys(player).sort(), backendPlayerFields, `${name}: ${player.id}`);
            for (const field of removedPlayerFields) assert.equal(Object.hasOwn(player, field), false, field);
        }
    }
});

test('an imported snapshot does not corrupt live server timestamp ordering', () => {
    const store = createRadarStore({ viewMode: 'follow' });
    const make = (ts) => parseHoozi3Message({ kind: 'state', ts, map: 'map', players: [basePlayer] });
    assert.equal(store.applySnapshot(make(5)), true);
    assert.equal(store.applySnapshot(make(1), '{}', { imported: true }), true);
    assert.equal(store.applySnapshot(make(4)), false);
    assert.equal(store.applySnapshot(make(6)), true);
    assert.equal(store.state.currentSnapshotImported, false);
    assert.equal(store.state.previousSnapshot, null);
});
