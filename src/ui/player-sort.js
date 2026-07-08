export function teamSortValue(team) {
    const value = Number(team);
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

export function comparePlayersByTeamAndName(left, right) {
    const teamDelta = teamSortValue(left?.team) - teamSortValue(right?.team);
    if (teamDelta !== 0) return teamDelta;
    const nameDelta = String(left?.name ?? '').localeCompare(String(right?.name ?? ''));
    if (nameDelta !== 0) return nameDelta;
    return String(left?.id ?? '').localeCompare(String(right?.id ?? ''));
}

export function sortPlayersForTable(players) {
    const teamHasAlive = new Map();
    for (const player of players || []) {
        const team = teamSortValue(player?.team);
        teamHasAlive.set(team, Boolean(teamHasAlive.get(team)) || player?.is_dead !== true);
    }
    return [...(players || [])].sort((left, right) => {
        const leftTeamDead = !teamHasAlive.get(teamSortValue(left?.team));
        const rightTeamDead = !teamHasAlive.get(teamSortValue(right?.team));
        if (leftTeamDead !== rightTeamDead) return leftTeamDead ? 1 : -1;
        return comparePlayersByTeamAndName(left, right);
    });
}
