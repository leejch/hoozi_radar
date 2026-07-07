import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { createFallbackImageLoader, isLobbyMap, mapAssetName, mapDefinition, mapDisplayName } from '../src/assets/maps.js';

const i18nSource = await readFile(new URL('../src/i18n.js', import.meta.url), 'utf8');

const knownMaps = [
    ['mp_rr_canyonlands', '1.png', 'maps.kingsCanyon'],
    ['mp_rr_desertlands', '2.png', 'maps.worldsEdge'],
    ['mp_rr_olympus', '3.png', 'maps.olympus'],
    ['mp_rr_divided_moon', '4.png', 'maps.brokenMoon'],
    ['mp_rr_tropic_island', '5.png', 'maps.stormPoint'],
    ['mp_rr_nemesis', '6.png', 'maps.eDistrict']
];

test('known HOOZi map tokens resolve to the six numeric radar assets', () => {
    for (const [mapName, assetName, translationKey] of knownMaps) {
        assert.equal(mapAssetName(mapName), assetName);
        assert.equal(mapDefinition(mapName)?.translationKey, translationKey);
    }
});

test('map matching uses the first token after mp_rr and accepts runtime suffixes', () => {
    assert.equal(mapAssetName('mp_rr_canyonlands_mu1'), '1.png');
    assert.equal(mapAssetName('mp_rr_canyonlands_mu2'), '1.png');
    assert.equal(mapAssetName('mp_rr_divided_moon_mu1'), '4.png');
    assert.equal(mapAssetName('mp_rr_tropic_island_mu2'), '5.png');
});

test('unknown raw map names keep exact-name loading and debug display', () => {
    const t = (key) => `translated:${key}`;
    assert.equal(mapAssetName('mp_rr_unknown_variant'), 'mp_rr_unknown_variant.png');
    assert.equal(mapDisplayName('mp_rr_unknown_variant', t), 'mp_rr_unknown_variant');
    assert.equal(mapDisplayName('mp_rr_nemesis_mu1', t), 'translated:maps.eDistrict');
});

test('lobby map names use the dedicated lobby image without coordinate-map classification', () => {
    const t = (key) => `translated:${key}`;
    assert.equal(isLobbyMap('mp_lobby'), true);
    assert.equal(isLobbyMap('mp_lobby_mu1'), true);
    assert.equal(mapAssetName('mp_lobby_mu1'), 'mp_lobby.png');
    assert.equal(mapDefinition('mp_lobby_mu1')?.lobby, true);
    assert.equal(mapDisplayName('mp_lobby_mu1', t), 'translated:maps.lobby');
});

test('all map names are present in all three supported languages', () => {
    for (const label of [
        '诸王峡谷', '世界尽头', '奥林匹斯', '残月', '风暴点', '电气区',
        '王者峽谷', '世界邊緣', '奧林匹斯', '殘月', '暴風點', '電流區',
        'Kings Canyon', "World's Edge", 'Olympus', 'Broken Moon', 'Storm Point', 'E-District',
        '大厅', '大廳', 'Lobby'
    ]) {
        assert.ok(i18nSource.includes(label), `missing localized map label: ${label}`);
    }
});

test('an image stays hidden until a requested asset finishes loading', () => {
    const listeners = {};
    const image = {
        dataset: {},
        hidden: false,
        referrerPolicy: '',
        addEventListener(type, listener) {
            listeners[type] = listener;
        },
        removeAttribute(name) {
            if (name === 'src') delete this.src;
        }
    };
    const loader = createFallbackImageLoader(image);
    assert.equal(image.referrerPolicy, 'origin');

    loader.load('4.png');
    assert.equal(image.hidden, true);
    assert.equal(image.dataset.assetSource, 'local');
    assert.match(image.src, /static\/4\.png$/);

    listeners.load();
    assert.equal(image.hidden, false);

    loader.clear();
    assert.equal(image.hidden, true);
    assert.equal(Object.hasOwn(image, 'src'), false);
});
