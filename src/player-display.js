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

function normalizedUid(value) {
    const uid = String(value ?? '').trim();
    return uid && uid !== '0' ? uid : '';
}

export function localPlayerTeam(players, localPlayerUid = '') {
    const uid = normalizedUid(localPlayerUid);
    const selfPlayer = uid
        ? players?.find((player) => normalizedUid(player.uid) === uid)
        : players?.find((player) => player.self === true);
    return selfPlayer ? selfPlayer.team : null;
}

export function playerForDisplay(player, localTeam, anonymizeLocalTeam = false) {
    if (!anonymizeLocalTeam || !player || localTeam === null || player.team !== localTeam) return player;
    return Object.freeze({ ...player, ...REDACTED_FIELDS });
}

export function playersForDisplay(players = [], localTeam = null, anonymizeLocalTeam = false) {
    return players.map((player) => playerForDisplay(player, localTeam, anonymizeLocalTeam));
}
