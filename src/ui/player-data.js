import { LOCAL_TEAM_DISPLAY_NAME, localPlayerTeam } from '../player-display.js';

const PRIVATE_EXPORT_FIELDS = Object.freeze([
    'legend',
    'legend_icon_key',
    'rank',
    'rank_icon_key',
    'level',
    'uid',
    'uid_long'
]);

export function isJsonFileName(name) {
    return typeof name === 'string' && name.trim().toLowerCase().endsWith('.json');
}

export function currentPlayerExportFileName(date = new Date()) {
    return `hoozi3-current-players-${date.toISOString().replace(/[:]/g, '-')}.json`;
}

function compareDictionaryOrder(left, right) {
    const leftText = String(left ?? '');
    const rightText = String(right ?? '');
    if (leftText < rightText) return -1;
    if (leftText > rightText) return 1;
    return 0;
}

function comparePlayers(left, right) {
    const leftTeam = Number(left?.team);
    const rightTeam = Number(right?.team);
    const normalizedLeftTeam = Number.isFinite(leftTeam) ? leftTeam : Number.POSITIVE_INFINITY;
    const normalizedRightTeam = Number.isFinite(rightTeam) ? rightTeam : Number.POSITIVE_INFINITY;
    if (normalizedLeftTeam !== normalizedRightTeam) return normalizedLeftTeam - normalizedRightTeam;
    const nameOrder = compareDictionaryOrder(left?.name, right?.name);
    return nameOrder || compareDictionaryOrder(left?.id, right?.id);
}

function redactLocalTeamForExport(payload) {
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.players)) return payload;
    const localTeam = localPlayerTeam(payload.players);
    if (localTeam === null) return payload;

    return {
        ...payload,
        players: payload.players.map((player) => {
            if (!player || player.team !== localTeam) return player;
            const redacted = { ...player, name: LOCAL_TEAM_DISPLAY_NAME };
            for (const field of PRIVATE_EXPORT_FIELDS) {
                if (Object.hasOwn(redacted, field)) redacted[field] = '';
            }
            return redacted;
        })
    };
}

function sortJsonValue(value, parentKey = '') {
    if (Array.isArray(value)) {
        const items = value.map((item) => sortJsonValue(item));
        return parentKey === 'players' ? items.sort(comparePlayers) : items;
    }
    if (value === null || typeof value !== 'object') return value;

    return Object.keys(value)
        .sort(compareDictionaryOrder)
        .reduce((sorted, key) => {
            sorted[key] = sortJsonValue(value[key], key);
            return sorted;
        }, {});
}

export function formatPlayerExportJson(raw) {
    const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return JSON.stringify(sortJsonValue(redactLocalTeamForExport(payload)), null, 4);
}
