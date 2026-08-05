import { iconSourcesForKind } from '../config.js';

const ICON_PREFIX_BY_KIND = Object.freeze({
    legend: 'icon_legends/',
    rank: 'icon_rank/'
});

function encodedPath(path) {
    return path.split('/').map((part) => encodeURIComponent(part)).join('/');
}

export function iconAssetNameForKey(kind, iconKey) {
    const prefix = ICON_PREFIX_BY_KIND[kind];
    if (!prefix) return '';
    let key = String(iconKey || '').trim();
    if (!key || key.includes('..') || key.includes('\\') || key.startsWith('/') || /^[a-z]+:/i.test(key)) return '';
    if (key.toLowerCase().endsWith('.png')) key = key.slice(0, -4);
    if (key.toLowerCase().startsWith(prefix)) key = key.slice(prefix.length);
    if (!key || key.includes('/')) return '';
    return `${key}.png`;
}

export function iconUrl(source, assetName) {
    return `${source.baseUrl}${encodedPath(assetName)}`;
}

export function configureFallbackIconImage(image, kind, iconKey, location) {
    const assetName = iconAssetNameForKey(kind, iconKey);
    if (!assetName) return false;

    const sources = iconSourcesForKind(kind, location);
    let sourceIndex = 0;
    if ('referrerPolicy' in image) image.referrerPolicy = 'origin';

    const loadSource = () => {
        const source = sources[sourceIndex];
        if (!source) {
            image.hidden = true;
            image.removeAttribute('src');
            return;
        }
        image.hidden = true;
        image.dataset.assetSource = source.key;
        image.src = iconUrl(source, assetName);
    };

    image.addEventListener('load', () => {
        image.hidden = false;
    });
    image.addEventListener('error', () => {
        sourceIndex += 1;
        loadSource();
    });

    image.dataset.iconKind = kind;
    image.dataset.iconAsset = assetName;
    loadSource();
    return true;
}
