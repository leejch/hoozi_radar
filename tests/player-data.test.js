import test from 'node:test';
import assert from 'node:assert/strict';

import {
    currentPlayerExportFileName,
    formatPlayerExportJson,
    isJsonFileName
} from '../src/ui/player-data.js';

test('player data import accepts only JSON filenames', () => {
    assert.equal(isJsonFileName('fixture.json'), true);
    assert.equal(isJsonFileName('FIXTURE.JSON'), true);
    assert.equal(isJsonFileName('fixture.json.txt'), false);
    assert.equal(isJsonFileName('fixture.csv'), false);
    assert.equal(isJsonFileName(''), false);
});

test('player data export uses a JSON filename', () => {
    const name = currentPlayerExportFileName(new Date('2026-06-20T08:00:00.000Z'));
    assert.equal(name, 'hoozi3-current-players-2026-06-20T08-00-00.000Z.json');
});

test('player data export uses four-space indentation and dictionary-ordered keys', () => {
    const json = formatPlayerExportJson({
        ts: 1,
        players: [],
        kind: 'state',
        map: 'mp_rr_olympus',
        ring: { y: 2, radius: 3, x: 1 }
    });

    assert.equal(json, `{
    "kind": "state",
    "map": "mp_rr_olympus",
    "players": [],
    "ring": {
        "radius": 3,
        "x": 1,
        "y": 2
    },
    "ts": 1
}`);
});

test('player data export sorts players by team and then nickname', () => {
    const json = formatPlayerExportJson(JSON.stringify({
        players: [
            { name: 'No Team', id: '4' },
            { team: 2, name: 'Beta', id: '3' },
            { team: 1, name: 'Zulu', id: '2' },
            { team: 1, name: 'Alpha', id: '1' }
        ],
        kind: 'state'
    }));

    const payload = JSON.parse(json);
    assert.deepEqual(payload.players.map(({ id }) => id), ['1', '2', '3', '4']);
    assert.ok(json.includes('            "id": "1",\n            "name": "Alpha",\n            "team": 1'));
});

test('player data export empties private fields for the local team only', () => {
    const source = {
        kind: 'state',
        players: [
            {
                id: 'self', self: true, team: 5, name: 'Local', legend: 'Wraith',
                legend_icon_key: 'wraith', rank: 'Gold', rank_icon_key: 'gold',
                level: 100, uid: '123', uid_long: '456'
            },
            {
                id: 'mate', self: false, team: 5, name: 'Mate', legend: 'Loba',
                legend_icon_key: 'loba', rank: 'Silver', rank_icon_key: 'silver',
                level: 200, uid: '789'
            },
            {
                id: 'enemy', self: false, team: 9, name: 'Enemy', legend: 'Ash',
                legend_icon_key: 'ash', rank: 'Platinum', rank_icon_key: 'platinum',
                level: 300, uid: '999', uid_long: '111'
            }
        ]
    };

    const payload = JSON.parse(formatPlayerExportJson(source));
    const self = payload.players.find((player) => player.id === 'self');
    const teammate = payload.players.find((player) => player.id === 'mate');
    const enemy = payload.players.find((player) => player.id === 'enemy');

    assert.deepEqual(payload.players.map((player) => player.id), ['mate', 'self', 'enemy']);
    for (const player of [self, teammate]) {
        assert.equal(player.name, 'HOOZi3.0');
        for (const field of ['legend', 'legend_icon_key', 'rank', 'rank_icon_key', 'level', 'uid']) {
            assert.equal(player[field], '');
        }
    }
    assert.equal(self.uid_long, '');
    assert.equal(Object.hasOwn(teammate, 'uid_long'), false);
    assert.equal(enemy.name, 'Enemy');
    assert.equal(enemy.legend, 'Ash');
    assert.equal(enemy.uid_long, '111');
    assert.equal(source.players[0].name, 'Local');
    assert.equal(source.players[0].level, 100);
});

test('player data export does not guess a local team without self', () => {
    const source = { kind: 'state', players: [{ id: 'p1', team: 5, name: 'Visible', uid: '123' }] };
    assert.deepEqual(JSON.parse(formatPlayerExportJson(source)), source);
});
