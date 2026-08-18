import test from 'node:test';
import assert from 'node:assert/strict';

import {
    LOCAL_TEAM_DISPLAY_NAME,
    REDACTED_DISPLAY_VALUE,
    localPlayerTeam,
    playerForDisplay,
    playersForDisplay
} from '../src/player-display.js';

const localPlayer = Object.freeze({
    id: 'local', uid: 'local-uid', self: false, team: 5, name: 'Local', legend: 'Wraith',
    legend_icon_key: 'wraith', rank: 'Gold', rank_icon_key: 'gold',
    level: 100, uid_long: '456'
});
const teammate = Object.freeze({ ...localPlayer, id: 'mate', uid: 'mate-uid', name: 'Teammate' });
const spectatedEnemy = Object.freeze({
    ...localPlayer, id: 'enemy', uid: 'enemy-uid', self: true, team: 9, name: 'Enemy'
});

test('local-team anonymity is disabled unless explicitly requested', () => {
    const localTeam = localPlayerTeam([localPlayer, teammate, spectatedEnemy], 'local-uid');
    assert.equal(localTeam, 5);
    assert.equal(playerForDisplay(localPlayer, localTeam), localPlayer);
    assert.deepEqual(
        playersForDisplay([localPlayer, teammate, spectatedEnemy], localTeam),
        [localPlayer, teammate, spectatedEnemy]
    );
});

test('enabled anonymity redacts only the UID-anchored local team', () => {
    const players = [localPlayer, teammate, spectatedEnemy];
    const localTeam = localPlayerTeam(players, 'local-uid');
    const displayed = playersForDisplay(players, localTeam, true);

    for (const player of displayed.slice(0, 2)) {
        assert.equal(player.name, LOCAL_TEAM_DISPLAY_NAME);
        assert.equal(player.legend, REDACTED_DISPLAY_VALUE);
        assert.equal(player.legend_icon_key, '');
        assert.equal(player.rank, REDACTED_DISPLAY_VALUE);
        assert.equal(player.rank_icon_key, '');
        assert.equal(player.level, REDACTED_DISPLAY_VALUE);
        assert.equal(player.uid, REDACTED_DISPLAY_VALUE);
        assert.equal(player.uid_long, REDACTED_DISPLAY_VALUE);
        assert.equal(player.displayRedacted, true);
    }
    assert.equal(displayed[2], spectatedEnemy);
});

test('a spectated self player does not redefine the known local team', () => {
    const players = [localPlayer, teammate, spectatedEnemy];
    assert.equal(localPlayerTeam(players, 'local-uid'), 5);
    assert.equal(localPlayerTeam(players), 9);
});

test('an absent known UID yields no local team instead of falling back to self', () => {
    assert.equal(localPlayerTeam([spectatedEnemy], 'local-uid'), null);
});
