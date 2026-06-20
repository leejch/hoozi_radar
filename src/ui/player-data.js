export function isJsonFileName(name) {
    return typeof name === 'string' && name.trim().toLowerCase().endsWith('.json');
}

export function currentPlayerExportFileName(date = new Date()) {
    return `hoozi3-current-players-${date.toISOString().replace(/[:]/g, '-')}.json`;
}
