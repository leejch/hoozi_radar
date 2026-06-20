import test from 'node:test';
import assert from 'node:assert/strict';

import { currentPlayerExportFileName, isJsonFileName } from '../src/ui/player-data.js';

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
