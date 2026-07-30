import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
    DEFAULT_LOCAL_WS_TARGET,
    DEFAULT_SETTINGS,
    buildAutomaticWebSocketTarget,
    createInitialConnectionGate,
    defaultManualPortForProtocol,
    getConnectionTarget,
    staticSourceOrderForLocation
} from '../src/config.js';

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

test('automatic HTTPS connection uses the current hostname with wss and /ws', () => {
    assert.equal(
        buildAutomaticWebSocketTarget({ protocol: 'https:', hostname: 'example.hoozi.net' }),
        'wss://example.hoozi.net/ws'
    );
});

test('manual empty or auto input falls back to the automatic target', () => {
    assert.equal(getConnectionTarget({ ...DEFAULT_SETTINGS, connectionMode: 'manual', manualHost: '' }), DEFAULT_LOCAL_WS_TARGET);
    assert.equal(getConnectionTarget({ ...DEFAULT_SETTINGS, connectionMode: 'manual', manualHost: 'auto' }), DEFAULT_LOCAL_WS_TARGET);
    assert.equal(
        getConnectionTarget(
            { ...DEFAULT_SETTINGS, connectionMode: 'manual', manualHost: '' },
            { protocol: 'https:', hostname: 'example.hoozi.net' }
        ),
        'wss://example.hoozi.net/ws'
    );
    assert.equal(
        getConnectionTarget({ ...DEFAULT_SETTINGS, connectionMode: 'manual', manualHost: 'wss://example.hoozi.net/ws' }),
        'wss://example.hoozi.net/ws'
    );
});

test('manual protocol defaults ports by page protocol and selected WebSocket protocol', () => {
    assert.equal(defaultManualPortForProtocol('ws', { protocol: 'http:' }), '9001');
    assert.equal(defaultManualPortForProtocol('wss', { protocol: 'http:' }), '443');
    assert.equal(defaultManualPortForProtocol('ws', { protocol: 'https:' }), '443');
});

test('static asset order is local-first outside HTTPS and remote-first on HTTPS', () => {
    assert.deepEqual(staticSourceOrderForLocation({ protocol: 'http:' }), ['local', 'remote']);
    assert.deepEqual(staticSourceOrderForLocation({ protocol: 'file:' }), ['local', 'remote']);
    assert.deepEqual(staticSourceOrderForLocation({ protocol: 'https:' }), ['remote', 'local']);
});

test('requested map overlay defaults keep team numbers and vitals enabled', () => {
    assert.equal(DEFAULT_SETTINGS.showTeam, true);
    assert.equal(DEFAULT_SETTINGS.showName, false);
    assert.equal(DEFAULT_SETTINGS.showLegend, false);
    assert.equal(DEFAULT_SETTINGS.showVitals, true);
    assert.equal(DEFAULT_SETTINGS.showLevel, false);
    assert.equal(DEFAULT_SETTINGS.showRank, false);
    assert.equal(DEFAULT_SETTINGS.showCombat, false);
    assert.equal(DEFAULT_SETTINGS.showDead, false);
    assert.equal(DEFAULT_SETTINGS.showDown, true);
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
