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
            { team: 2, name: 'Beta', id: '3' },
            { team: 1, name: 'Zulu', id: '2' },
            { team: 1, name: 'Alpha', id: '1' }
        ],
        kind: 'state'
    }));

    const payload = JSON.parse(json);
    assert.deepEqual(payload.players.map(({ id }) => id), ['1', '2', '3']);
    assert.ok(json.includes('            "id": "1",\n            "name": "Alpha",\n            "team": 1'));
});
