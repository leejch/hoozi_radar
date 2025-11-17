const UID_MASK = BigInt('0xDEADBEEF1B4DF00D');

export function extractUidString(raw) {
    if (raw === null || raw === undefined) {
        return '';
    }
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        return trimmed === '' ? '' : trimmed;
    }
    if (typeof raw === 'number') {
        if (!Number.isFinite(raw)) {
            return '';
        }
        return Math.trunc(raw).toString();
    }
    if (typeof raw === 'bigint') {
        return raw.toString();
    }
    return '';
}

export function computeLongUidFromShort(shortUid) {
    if (!shortUid) {
        return '';
    }
    try {
        const value = BigInt(shortUid);
        const converted = BigInt.asUintN(64, value ^ UID_MASK);
        return converted.toString();
    } catch (error) {
        return '';
    }
}

export function normalizePlayer(player) {
    if (!player || typeof player !== 'object') {
        return {
            uidShort: '',
            uidLong: '',
            uid: ''
        };
    }
    const normalized = { ...player };
    const uidShort = extractUidString(player.uid);
    normalized.uidShort = uidShort;
    normalized.uidLong = computeLongUidFromShort(uidShort);
    normalized.uid = uidShort;
    return normalized;
}

export function normalizePlayers(players) {
    if (!Array.isArray(players)) {
        return [];
    }
    return players.map((player) => normalizePlayer(player));
}

const teamPalette = [
    '#F87171', '#34D399', '#60A5FA', '#FBBF24', '#2DD4BF', '#A855F7', '#F97316', '#38BDF8', '#22C55E', '#F472B6',
    '#A3A3A3', '#FDE68A', '#F9A8D4', '#C4B5FD', '#A7F3D0', '#7DD3FC', '#FDBA74', '#86EFAC', '#FCA5A5', '#FACC15',
    '#67E8F9', '#E9D5FF', '#F0ABFC', '#BBF7D0', '#93C5FD', '#FECACA', '#FCD34D', '#FBCFE8', '#C7D2FE', '#A5F3FC',
    '#FDBA74', '#86EFAC', '#FDE68A', '#F9A8D4', '#C4B5FD', '#D1D5DB', '#F472B6', '#FB7185', '#F97316', '#34D399',
    '#60A5FA'
];

export const nameCollator = new Intl.Collator('zh-Hans-u-co-pinyin', {
    numeric: true,
    sensitivity: 'base'
});

export function teamColorFor(teamId) {
    if (teamId === undefined || teamId === null) {
        return '#93C5FD';
    }
    const index = Math.abs(Number(teamId)) % teamPalette.length;
    return teamPalette[index];
}

export function createPlayerTableSnapshot(players) {
    if (!Array.isArray(players) || players.length === 0) {
        return { sorted: [], signature: 'size:0' };
    }

    const sorted = [...players].sort((a, b) => {
        const teamA = Number.isFinite(Number(a.team)) ? Number(a.team) : Number.POSITIVE_INFINITY;
        const teamB = Number.isFinite(Number(b.team)) ? Number(b.team) : Number.POSITIVE_INFINITY;
        if (teamA !== teamB) {
            return teamA - teamB;
        }
        const nameA = typeof a.name === 'string' ? a.name : '';
        const nameB = typeof b.name === 'string' ? b.name : '';
        return nameCollator.compare(nameA, nameB);
    });

    const signatureParts = sorted.map((player) => {
        const teamValue = Number.isFinite(Number(player.team)) ? Number(player.team) : 'null';
        const nameValue = typeof player.name === 'string' ? player.name : '';
        const uidShortValue = typeof player.uidShort === 'string' ? player.uidShort : '';
        const uidLongValue = typeof player.uidLong === 'string' ? player.uidLong : '';
        const levelValue = Number.isFinite(Number(player.level)) ? Number(player.level) : 'null';
        const rankValue = player.rank ? String(player.rank) : '';
        const killsValue = Number.isFinite(Number(player.kills)) ? Number(player.kills) : 'null';
        const proValue = player.pro ? '1' : '0';
        const blackValue = player.black ? '1' : '0';
        const whiteValue = player.white ? '1' : '0';
        return [teamValue, nameValue, uidShortValue, uidLongValue, levelValue, rankValue, killsValue, proValue, blackValue, whiteValue].join('|');
    });

    return {
        sorted,
        signature: `${players.length}|${signatureParts.join('||')}`
    };
}
