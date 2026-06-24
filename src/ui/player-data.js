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
    const normalizedLeftTeam = Number.isFinite(leftTeam) ? leftTeam : 0;
    const normalizedRightTeam = Number.isFinite(rightTeam) ? rightTeam : 0;
    if (normalizedLeftTeam !== normalizedRightTeam) return normalizedLeftTeam - normalizedRightTeam;
    return compareDictionaryOrder(left?.name, right?.name);
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
    return JSON.stringify(sortJsonValue(payload), null, 4);
}
