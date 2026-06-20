import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { createReconnectPolicy } from '../src/config.js';

const mainSource = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

test('offline import suspension blocks automatic retries until an explicit reconnect', () => {
    const policy = createReconnectPolicy();

    assert.equal(policy.canSchedule('auto'), true);
    policy.suspend();
    assert.equal(policy.suspended, true);
    assert.equal(policy.canSchedule('auto'), false);
    assert.equal(policy.canSchedule('manual'), false);

    policy.resume();
    assert.equal(policy.suspended, false);
    assert.equal(policy.canSchedule('auto'), true);
    assert.equal(policy.canSchedule('auto', true), false);
});

test('a valid imported state suspends reconnect before applying preview data', () => {
    assert.match(
        mainSource,
        /parseHoozi3StateFile\(raw\);\s*pauseForImportedPreview\(\);\s*applyStateMessage\(message, raw, \{ imported: true \}\)/
    );
    assert.match(
        mainSource,
        /function pauseForImportedPreview\(\) \{\s*reconnectPolicy\.suspend\(\);\s*clearTimers\(\);\s*detachSocket\(\);/
    );
});
