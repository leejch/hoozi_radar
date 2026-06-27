import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { DEFAULT_LOCAL_WS_TARGET, createInitialConnectionGate, getConnectionTarget } from '../src/config.js';

const mainSource = await readFile(new URL('../src/main.js', import.meta.url), 'utf8');

test('the initial connection gate can be consumed only once', () => {
    const gate = createInitialConnectionGate();

    assert.equal(gate.pending, true);
    assert.equal(gate.take(), true);
    assert.equal(gate.pending, false);
    assert.equal(gate.take(), false);
});

test('automatic connection uses the local /ws path', () => {
    assert.equal(DEFAULT_LOCAL_WS_TARGET, 'ws://127.0.0.1:9001/ws');
    assert.equal(getConnectionTarget({ connectionMode: 'auto' }), DEFAULT_LOCAL_WS_TARGET);
});

test('cancelling the initial connection gate prevents its only attempt', () => {
    const gate = createInitialConnectionGate();
    gate.cancel();
    assert.equal(gate.pending, false);
    assert.equal(gate.take(), false);
});

test('the app waits for full load and contains no automatic reconnect scheduler', () => {
    assert.match(mainSource, /window\.addEventListener\('load', attemptInitialConnection, \{ once: true \}\)/);
    assert.match(mainSource, /document\.readyState === 'complete'/);
    assert.doesNotMatch(mainSource, /scheduleReconnect|reconnectTimer/);
});

test('a valid imported state cancels the pending initial attempt before applying preview data', () => {
    assert.match(
        mainSource,
        /parseHoozi3StateFile\(raw\);\s*pauseForImportedPreview\(\);\s*applyStateMessage\(message, raw, \{ imported: true \}\)/
    );
    assert.match(
        mainSource,
        /function pauseForImportedPreview\(\) \{\s*initialConnectionGate\.cancel\(\);\s*clearTimers\(\);\s*detachSocket\(\);/
    );
});
