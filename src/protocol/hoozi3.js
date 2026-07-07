const PLAYER_STRING_FIELDS = Object.freeze([
    'id', 'name', 'legend', 'legend_icon_key', 'uid', 'rank', 'rank_icon_key', 'rank_color'
]);

const PLAYER_NUMBER_FIELDS = Object.freeze([
    'index', 'team', 'squad', 'x', 'y', 'yaw', 'hp', 'max_hp', 'shield', 'max_shield',
    'distance', 'level', 'kills', 'damage', 'roster'
]);

const UID_MASK = BigInt('0xDEADBEEF1B4DF00D');

export class HooziProtocolError extends Error {
    constructor(message, cause) {
        super(message, cause ? { cause } : undefined);
        this.name = 'HooziProtocolError';
    }
}

function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function optionalFiniteNumber(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function nonNegativeNumber(value, fallback = 0) {
    return Math.max(0, finiteNumber(value, fallback));
}

function stringValue(value, fallback = '') {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return fallback;
}

function normalizedLegend(value) {
    const legend = stringValue(value).trim();
    return legend === 'pilot_medium_empty' ? '' : legend;
}

function normalizedRank(value) {
    const rank = stringValue(value).trim();
    return rank === 'None' ? '' : rank;
}

function extractUidString(raw) {
    if (raw === null || raw === undefined) return '';
    if (typeof raw === 'string') return raw.trim();
    if (typeof raw === 'number') return Number.isFinite(raw) ? Math.trunc(raw).toString() : '';
    if (typeof raw === 'bigint') return raw.toString();
    return '';
}

export function computeLongUidFromShort(shortUid) {
    const uid = extractUidString(shortUid);
    if (!uid) return '';
    try {
        return BigInt.asUintN(64, BigInt(uid) ^ UID_MASK).toString();
    } catch {
        return '';
    }
}

function normalizePlayer(rawPlayer, position) {
    if (!isRecord(rawPlayer)) {
        throw new HooziProtocolError(`players[${position}] must be an object`);
    }

    const normalized = {};
    for (const field of PLAYER_STRING_FIELDS) normalized[field] = stringValue(rawPlayer[field]);
    for (const field of PLAYER_NUMBER_FIELDS) normalized[field] = optionalFiniteNumber(rawPlayer[field]);

    normalized.id = normalized.id || `snapshot-${position}`;
    normalized.name = normalized.name || '?';
    normalized.uid = extractUidString(rawPlayer.uid);
    normalized.uid_long = computeLongUidFromShort(normalized.uid);
    normalized.legend = normalizedLegend(rawPlayer.legend);
    normalized.rank = normalizedRank(rawPlayer.rank);
    normalized.self = rawPlayer.self === true;
    normalized.team = normalized.team ?? 0;
    normalized.squad = normalized.squad ?? 0;
    normalized.yaw = normalized.yaw ?? 0;
    normalized.hp = nonNegativeNumber(rawPlayer.hp);
    normalized.max_hp = nonNegativeNumber(rawPlayer.max_hp, 100);
    normalized.shield = nonNegativeNumber(rawPlayer.shield);
    normalized.max_shield = nonNegativeNumber(rawPlayer.max_shield);
    normalized.distance = nonNegativeNumber(rawPlayer.distance);
    normalized.level = nonNegativeNumber(rawPlayer.level);
    normalized.kills = nonNegativeNumber(rawPlayer.kills);
    normalized.damage = nonNegativeNumber(rawPlayer.damage);
    normalized.roster = finiteNumber(rawPlayer.roster ?? rawPlayer.rosters);
    normalized.is_dead = rawPlayer.is_dead === true;
    normalized.is_down = rawPlayer.is_down === true;
    normalized.position = normalized.x !== null && normalized.y !== null
        ? Object.freeze({ x: normalized.x, y: normalized.y })
        : null;

    return Object.freeze(normalized);
}

function normalizeRing(rawRing) {
    if (rawRing === null || rawRing === undefined) return null;
    if (!isRecord(rawRing)) return null;
    const x = optionalFiniteNumber(rawRing.x);
    const y = optionalFiniteNumber(rawRing.y);
    const radius = optionalFiniteNumber(rawRing.radius);
    if (x === null || y === null || radius === null || radius < 0) return null;
    return Object.freeze({
        x,
        y,
        radius,
        t_start: finiteNumber(rawRing.t_start),
        t_end: finiteNumber(rawRing.t_end),
        t_now: finiteNumber(rawRing.t_now)
    });
}

function decode(raw) {
    if (isRecord(raw)) return raw;
    if (typeof raw !== 'string') throw new HooziProtocolError('WebSocket message must be a JSON string');
    try {
        const decoded = JSON.parse(raw);
        if (!isRecord(decoded)) throw new HooziProtocolError('Decoded message must be an object');
        return decoded;
    } catch (error) {
        if (error instanceof HooziProtocolError) throw error;
        throw new HooziProtocolError('Invalid JSON message', error);
    }
}

export function parseHoozi3Message(raw) {
    const payload = decode(raw);
    if (payload.kind === 'pong') {
        return Object.freeze({ kind: 'pong', ts: finiteNumber(payload.ts) });
    }
    if (payload.kind !== 'state') {
        throw new HooziProtocolError(`Unsupported message kind: ${stringValue(payload.kind, '<missing>')}`);
    }
    if (!Array.isArray(payload.players)) {
        throw new HooziProtocolError('state.players must be an array');
    }
    return Object.freeze({
        kind: 'state',
        ts: finiteNumber(payload.ts),
        map: stringValue(payload.map).trim(),
        players: Object.freeze(payload.players.map(normalizePlayer)),
        ring: normalizeRing(payload.ring)
    });
}

export function parseHoozi3StateFile(raw) {
    const message = parseHoozi3Message(raw);
    if (message.kind !== 'state') {
        throw new HooziProtocolError('Imported JSON must contain a state message');
    }
    return message;
}

export function createPingMessage() {
    return JSON.stringify({ kind: 'ping' });
}
