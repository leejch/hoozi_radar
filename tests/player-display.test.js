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
    id: 'self', self: true, team: 5, name: 'Local', legend: 'Wraith',
    legend_icon_key: 'wraith', rank: 'Gold', rank_icon_key: 'gold',
    level: 100, uid: '123', uid_long: '456'
});
const teammate = Object.freeze({
    ...localPlayer,
    id: 'mate',
    self: false,
    name: 'Teammate'
});
const enemy = Object.freeze({
    ...localPlayer,
    id: 'enemy',
    self: false,
    team: 9,
    name: 'Enemy'
});

test('local player and teammates use the display-only HOOZi identity', () => {
    const displayed = playersForDisplay([localPlayer, teammate, enemy]);

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
    assert.equal(displayed[2], enemy);
    assert.equal(localPlayer.name, 'Local');
    assert.equal(teammate.legend, 'Wraith');
});

test('display redaction needs an explicit self player to identify the local team', () => {
    assert.equal(localPlayerTeam([teammate, enemy]), null);
    assert.equal(playerForDisplay(teammate, null), teammate);
    assert.deepEqual(playersForDisplay([teammate, enemy]), [teammate, enemy]);
});
