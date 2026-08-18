import test from 'node:test';
import assert from 'node:assert/strict';

import { sortPlayersForTable } from '../src/ui/player-sort.js';

test('player table sorting moves only fully dead teams to the bottom', () => {
    const players = [
        { id: 'a', team: 1, name: 'Alpha', is_dead: true },
        { id: 'b', team: 1, name: 'Beta', is_dead: true },
        { id: 'c', team: 2, name: 'Charlie', is_dead: false },
        { id: 'd', team: 3, name: 'Delta', is_dead: false },
        { id: 'e', team: 2, name: 'Echo', is_dead: true }
    ];

    assert.deepEqual(
        sortPlayersForTable(players).map((player) => player.id),
        ['c', 'e', 'd', 'a', 'b']
    );
});

test('player table sorting uses id as a final duplicate-name tie breaker', () => {
    const players = [
        { id: 'z', team: 5, name: 'Same', is_dead: true },
        { id: 'a', team: 5, name: 'Same', is_dead: true }
    ];

    assert.deepEqual(
        sortPlayersForTable(players).map((player) => player.id),
        ['a', 'z']
    );
});
