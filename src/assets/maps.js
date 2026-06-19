import { STATIC_SOURCES } from '../config.js';

function assetUrl(baseUrl, assetName) {
    return `${baseUrl}${encodeURIComponent(assetName)}`;
}

export function createFallbackImageLoader(image, { onLoad, onMissing } = {}) {
    let requestToken = 0;
    let currentAsset = '';
    let sourceIndex = 0;

    const loadSource = () => {
        const source = STATIC_SOURCES[sourceIndex];
        if (!source || !currentAsset) {
            image.removeAttribute('src');
            onMissing?.(currentAsset);
            return;
        }
        image.dataset.assetSource = source.key;
        image.src = assetUrl(source.baseUrl, currentAsset);
    };

    image.addEventListener('load', () => onLoad?.(currentAsset, image.dataset.assetSource));
    image.addEventListener('error', () => {
        if (!currentAsset) return;
        sourceIndex += 1;
        loadSource();
    });

    return {
        load(assetName) {
            const normalized = String(assetName || '').trim();
            requestToken += 1;
            currentAsset = normalized;
            sourceIndex = 0;
            image.dataset.assetRequest = String(requestToken);
            if (!normalized) {
                image.removeAttribute('src');
                return;
            }
            loadSource();
        },
        clear() {
            requestToken += 1;
            currentAsset = '';
            image.removeAttribute('src');
            delete image.dataset.assetSource;
        }
    };
}

export function mapAssetName(mapName) {
    const normalized = String(mapName || '').trim();
    return normalized ? `${normalized}.png` : '';
}
