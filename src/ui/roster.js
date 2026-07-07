const ROSTER_TAGS = Object.freeze([
    Object.freeze({
        key: 'friend',
        mask: 8,
        color: '#63B5FFCC',
        labels: Object.freeze({ 'zh-Hans': '友', 'zh-Hant': '友', en: 'Friend' })
    }),
    Object.freeze({
        key: 'cheater',
        mask: 4,
        color: '#FF0000CC',
        labels: Object.freeze({ 'zh-Hans': '作弊', 'zh-Hant': '作弊', en: 'Cheater' })
    }),
    Object.freeze({
        key: 'celebrity',
        mask: 2,
        color: '#FFE633CC',
        labels: Object.freeze({ 'zh-Hans': '名人', 'zh-Hant': '名人', en: 'Celebrity' })
    }),
    Object.freeze({
        key: 'pro',
        mask: 1,
        color: '#B300FFCC',
        labels: Object.freeze({ 'zh-Hans': '权', 'zh-Hant': '權', en: 'Pro' })
    })
]);

function rosterBits(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.trunc(numeric) : 0;
}

export function rosterTags(value, language = 'en') {
    const bits = rosterBits(value);
    return ROSTER_TAGS
        .filter((tag) => (bits & tag.mask) === tag.mask)
        .map((tag) => Object.freeze({
            key: tag.key,
            color: tag.color,
            label: tag.labels[language] || tag.labels.en,
            text: `[${tag.labels[language] || tag.labels.en}]`
        }));
}

export function formatRosterTags(value, language = 'en') {
    return rosterTags(value, language).map((tag) => tag.text).join('');
}
