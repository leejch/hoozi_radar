import test from 'node:test';
import assert from 'node:assert/strict';

import { formatRosterTags, rosterTags } from '../src/ui/roster.js';

test('roster bits map to ordered localized marker tags', () => {
    assert.equal(formatRosterTags(15, 'zh-Hans'), '[友][作弊][名人][权]');
    assert.equal(formatRosterTags(15, 'zh-Hant'), '[友][作弊][名人][權]');
    assert.equal(formatRosterTags(15, 'en'), '[Friend][Cheater][Celebrity][Pro]');
    assert.equal(formatRosterTags(0, 'en'), '');
});

test('roster table tags preserve the requested colors', () => {
    assert.deepEqual(rosterTags(13, 'en').map(({ text, color }) => ({ text, color })), [
        { text: '[Friend]', color: '#63B5FFCC' },
        { text: '[Cheater]', color: '#FF0000CC' },
        { text: '[Pro]', color: '#B300FFCC' }
    ]);
});
