import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { parseHoozi3Message, parseHoozi3StateFile } from '../src/protocol/hoozi3.js';
import {
    PLAYER_SELECTION_AUTO,
    PLAYER_SELECTION_MANUAL,
    createRadarStore
} from '../src/state/store.js';

const examplesRoot = new URL('./fixtures/focus-examples/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', examplesRoot), 'utf8'));

async function readJson(relativePath) {
    return JSON.parse(await readFile(new URL(relativePath, examplesRoot), 'utf8'));
}

async function readState(file) {
    return parseHoozi3Message(await readFile(new URL(file, examplesRoot), 'utf8'));
}

function createStore(selectedPlayerId = '') {
    return createRadarStore({ selectedPlayerId, viewMode: 'follow' });
}

test('focus examples remain exact reduced copies of the real WebSocket captures', async () => {
    for (const metadata of manifest.examples) {
        const [example, source] = await Promise.all([
            readJson(metadata.file),
            readJson(metadata.source)
        ]);
        const sourcePlayers = new Map(source.players.map((player) => [player.id, player]));

        assert.equal(example.kind, 'state', metadata.file);
        assert.equal(example.map, source.map, metadata.file);
        assert.equal(example.ts, metadata.timestampOverride ?? source.ts, metadata.file);
        assert.deepEqual(example.ring, source.ring, metadata.file);
        assert.deepEqual(
            example.players,
            metadata.playerIds.map((id) => sourcePlayers.get(id)),
            metadata.file
        );
        assert.equal(parseHoozi3StateFile(JSON.stringify(example)).kind, 'state', metadata.file);
    }
});

test('automatic focus follows the current self across entry, death, identity changes, and the next match', async () => {
    for (const sequence of manifest.sequences) {
        const store = createStore('ix53');
        for (const [index, file] of sequence.files.entries()) {
            const snapshot = await readState(file);
            assert.equal(store.applySnapshot(snapshot), true, `${sequence.id}: ${file}`);
            assert.equal(
                store.state.selectedPlayerId,
                sequence.expectedAutomaticFocus[index],
                `${sequence.id}: ${file}`
            );
            assert.equal(store.state.selectionMode, PLAYER_SELECTION_AUTO);
            assert.equal(
                store.getSelectedPlayer()?.id || '',
                sequence.expectedAutomaticFocus[index],
                `${sequence.id}: ${file}`
            );
        }
    }
});

test('a dead self player remains the automatic focus instead of the spectated teammate', async () => {
    const store = createStore();
    store.applySnapshot(await readState('04-self-dead-spectating.json'));

    const selected = store.getSelectedPlayer();
    assert.equal(selected.id, 'ix54');
    assert.equal(selected.self, true);
    assert.equal(selected.is_dead, true);
});

test('automatic focus stays empty while every player has self false and resumes when self returns', async () => {
    const store = createStore();
    store.applySnapshot(await readState('06-no-self.json'));

    assert.equal(store.state.selectedPlayerId, '');
    assert.equal(store.getSelectedPlayer(), null);

    store.applySnapshot(await readState('07-self-returns.json'));
    assert.equal(store.state.selectedPlayerId, 'ix27');
    assert.equal(store.getSelectedPlayer()?.self, true);
});

test('an explicit non-self selection overrides later self changes until automatic mode is requested', async () => {
    const store = createStore();
    store.applySnapshot(await readState('02-entering-match-self-alive.json'));

    assert.equal(store.selectPlayer('ix22'), true);
    assert.equal(store.state.selectionMode, PLAYER_SELECTION_MANUAL);
    assert.equal(store.getSelectedPlayer()?.id, 'ix22');

    store.applySnapshot(await readState('03-self-changed-old-id-remains.json'));
    assert.equal(store.state.selectionMode, PLAYER_SELECTION_MANUAL);
    assert.equal(store.getSelectedPlayer()?.id, 'ix22');
    assert.equal(store.getSelectedPlayer()?.self, false);

    assert.equal(store.selectPlayer(''), true);
    assert.equal(store.state.selectionMode, PLAYER_SELECTION_AUTO);
    assert.equal(store.getSelectedPlayer()?.id, 'ix30');
});

test('selecting the self player exits manual mode', async () => {
    const store = createStore();
    store.applySnapshot(await readState('02-entering-match-self-alive.json'));
    store.selectPlayer('ix22');

    assert.equal(store.selectPlayer('ix53'), true);
    assert.equal(store.state.selectionMode, PLAYER_SELECTION_AUTO);
    assert.equal(store.getSelectedPlayer()?.id, 'ix53');
});

test('manual focus rejects a reused entity id when UID identifies a different next-match player', async () => {
    const store = createStore();
    const previousMatch = await readState('04-self-dead-spectating.json');
    const nextMatch = await readState('05-next-match-index-reused.json');
    const previousIx5 = previousMatch.players.find((player) => player.id === 'ix5');
    const nextIx5 = nextMatch.players.find((player) => player.id === 'ix5');
    assert.notEqual(previousIx5.uid, nextIx5.uid);

    store.applySnapshot(previousMatch);
    store.selectPlayer('ix5');
    assert.equal(store.state.selectionMode, PLAYER_SELECTION_MANUAL);

    store.applySnapshot(nextMatch);
    assert.equal(store.state.selectionMode, PLAYER_SELECTION_AUTO);
    assert.equal(store.getSelectedPlayer()?.id, 'ix24');
    assert.equal(store.getSelectedPlayer()?.self, true);
});

test('manual focus is still allowed when a snapshot has no self player', async () => {
    const store = createStore();
    store.applySnapshot(await readState('06-no-self.json'));

    assert.equal(store.getSelectedPlayer(), null);
    assert.equal(store.selectPlayer('ix24'), true);
    assert.equal(store.state.selectionMode, PLAYER_SELECTION_MANUAL);
    assert.equal(store.getSelectedPlayer()?.id, 'ix24');
});
