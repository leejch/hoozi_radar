export const LOCAL_TEAM_DISPLAY_NAME = 'HOOZi3.0';
export const REDACTED_DISPLAY_VALUE = '-';

const REDACTED_FIELDS = Object.freeze({
    name: LOCAL_TEAM_DISPLAY_NAME,
    legend: REDACTED_DISPLAY_VALUE,
    legend_icon_key: '',
    rank: REDACTED_DISPLAY_VALUE,
    rank_icon_key: '',
    level: REDACTED_DISPLAY_VALUE,
    uid: REDACTED_DISPLAY_VALUE,
    uid_long: REDACTED_DISPLAY_VALUE,
    displayRedacted: true
});

export function localPlayerTeam(players) {
    const selfPlayer = players?.find((player) => player.self === true);
    return selfPlayer ? selfPlayer.team : null;
}

export function playerForDisplay(player, localTeam) {
    if (!player || localTeam === null || player.team !== localTeam) return player;
    return Object.freeze({ ...player, ...REDACTED_FIELDS });
}

export function playersForDisplay(players = []) {
    const localTeam = localPlayerTeam(players);
    return players.map((player) => playerForDisplay(player, localTeam));
}
