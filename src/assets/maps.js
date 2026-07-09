import { STATIC_SOURCES } from '../config.js';

const RADAR_MAP_DEFINITIONS = Object.freeze([
    Object.freeze({ match: /^mp_rr_canyonlands(?:_|$)/i, assetName: 'mp_rr_canyonlands.png', translationKey: 'maps.kingsCanyon' }),
    Object.freeze({ match: /^mp_rr_desertlands(?:_|$)/i, assetName: 'mp_rr_desertlands.png', translationKey: 'maps.worldsEdge' }),
    Object.freeze({ match: /^mp_rr_olympus(?:_|$)/i, assetName: 'mp_rr_olympus.png', translationKey: 'maps.olympus' }),
    Object.freeze({ match: /^mp_rr_divided_moon(?:_|$)/i, assetName: 'mp_rr_divided_moon.png', translationKey: 'maps.brokenMoon' }),
    Object.freeze({ match: /^mp_rr_tropic_island(?:_|$)/i, assetName: 'mp_rr_thunderdome.png', translationKey: 'maps.thunderdome' }),
    Object.freeze({ match: /^mp_rr_district(?:_|$)/i, assetName: 'mp_rr_district.png', translationKey: 'maps.eDistrict' })
]);

const LOBBY_MAP_DEFINITION = Object.freeze({ assetName: 'mp_lobby.png', translationKey: 'maps.lobby', imageOnly: true, lobby: true });
const RANGE_MAP_DEFINITION = Object.freeze({ assetName: 'mp_range.png', translationKey: 'maps.range', imageOnly: true, range: true });
const RANGE_MAP_NAME_RE = /^mp_rr_canyonlands_staging(?:_|$)/i;

export function isLobbyMap(mapName) {
    return /^mp_lobby/i.test(String(mapName || '').trim());
}

export function isRangeMap(mapName) {
    return RANGE_MAP_NAME_RE.test(String(mapName || '').trim());
}

export function isImageOnlyMap(mapName) {
    return isLobbyMap(mapName) || isRangeMap(mapName);
}

export function mapDefinition(mapName) {
    const normalized = String(mapName || '').trim();
    if (isLobbyMap(normalized)) {
        return LOBBY_MAP_DEFINITION;
    }
    if (isRangeMap(normalized)) {
        return RANGE_MAP_DEFINITION;
    }
    return RADAR_MAP_DEFINITIONS.find((definition) => definition.match.test(normalized)) || null;
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
    return mapDefinition(normalized)?.assetName || '';
}

export function mapDisplayName(mapName, t) {
    const normalized = String(mapName || '').trim();
    if (!normalized) return '—';
    const definition = mapDefinition(normalized);
    return definition ? t(definition.translationKey) : normalized;
}
