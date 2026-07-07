import { STATIC_SOURCES } from '../config.js';

const MAPS_BY_RUNTIME_TOKEN = Object.freeze({
    canyonlands: Object.freeze({ assetName: '1.png', translationKey: 'maps.kingsCanyon' }),
    desertlands: Object.freeze({ assetName: '2.png', translationKey: 'maps.worldsEdge' }),
    olympus: Object.freeze({ assetName: '3.png', translationKey: 'maps.olympus' }),
    divided: Object.freeze({ assetName: '4.png', translationKey: 'maps.brokenMoon' }),
    tropic: Object.freeze({ assetName: '5.png', translationKey: 'maps.stormPoint' }),
    nemesis: Object.freeze({ assetName: '6.png', translationKey: 'maps.eDistrict' })
});

export function isLobbyMap(mapName) {
    return /^mp_lobby/i.test(String(mapName || '').trim());
}

export function mapDefinition(mapName) {
    const normalized = String(mapName || '').trim();
    if (isLobbyMap(normalized)) {
        return Object.freeze({ assetName: 'mp_lobby.png', translationKey: 'maps.lobby', lobby: true });
    }
    const token = /^mp_rr_([^_]+)/i.exec(normalized)?.[1]?.toLowerCase();
    return token ? MAPS_BY_RUNTIME_TOKEN[token] || null : null;
}

function assetUrl(baseUrl, assetName) {
    return `${baseUrl}${encodeURIComponent(assetName)}`;
}

export function createFallbackImageLoader(image, { onLoad, onMissing } = {}) {
    let requestToken = 0;
    let currentAsset = '';
    let sourceIndex = 0;

    if ('referrerPolicy' in image) image.referrerPolicy = 'origin';

    const loadSource = () => {
        const source = STATIC_SOURCES[sourceIndex];
        if (!source || !currentAsset) {
            image.hidden = true;
            image.removeAttribute('src');
            onMissing?.(currentAsset);
            return;
        }
        image.dataset.assetSource = source.key;
        image.src = assetUrl(source.baseUrl, currentAsset);
    };

    image.addEventListener('load', () => {
        image.hidden = false;
        onLoad?.(currentAsset, image.dataset.assetSource);
    });
    image.addEventListener('error', () => {
        if (!currentAsset) return;
        image.hidden = true;
        sourceIndex += 1;
        loadSource();
    });

    return {
        load(assetName) {
            const normalized = String(assetName || '').trim();
            requestToken += 1;
            currentAsset = normalized;
            sourceIndex = 0;
            image.hidden = true;
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
            image.hidden = true;
            image.removeAttribute('src');
            delete image.dataset.assetSource;
        }
    };
}

export function mapAssetName(mapName) {
    const normalized = String(mapName || '').trim();
    if (!normalized) return '';
    if (isLobbyMap(normalized)) return 'mp_lobby.png';
    return mapDefinition(normalized)?.assetName || `${normalized}.png`;
}

export function mapDisplayName(mapName, t) {
    const normalized = String(mapName || '').trim();
    if (!normalized) return '—';
    const definition = mapDefinition(normalized);
    return definition ? t(definition.translationKey) : normalized;
}
