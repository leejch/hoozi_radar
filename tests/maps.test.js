import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { createFallbackImageLoader, isImageOnlyMap, isLobbyMap, isRangeMap, mapAssetName, mapDefinition, mapDisplayName } from '../src/assets/maps.js';

const i18nSource = await readFile(new URL('../src/i18n.js', import.meta.url), 'utf8');

const knownMaps = [
    ['mp_rr_canyonlands', 'mp_rr_canyonlands.png', 'maps.kingsCanyon'],
    ['mp_rr_desertlands', 'mp_rr_desertlands.png', 'maps.worldsEdge'],
    ['mp_rr_olympus', 'mp_rr_olympus.png', 'maps.olympus'],
    ['mp_rr_divided_moon', 'mp_rr_divided_moon.png', 'maps.brokenMoon'],
    ['mp_rr_tropic_island', 'mp_rr_tropic_island.png', 'maps.stormPoint'],
    ['mp_rr_district', 'mp_rr_district.png', 'maps.eDistrict']
];

test('known HOOZi map prefixes resolve to named radar assets', () => {
    for (const [mapName, assetName, translationKey] of knownMaps) {
        assert.equal(mapAssetName(mapName), assetName);
        assert.equal(mapDefinition(mapName)?.translationKey, translationKey);
    }
});

test('map matching uses known runtime prefixes and accepts runtime suffixes', () => {
    assert.equal(mapAssetName('mp_rr_canyonlands_mu1'), 'mp_rr_canyonlands.png');
    assert.equal(mapAssetName('mp_rr_canyonlands_mu2'), 'mp_rr_canyonlands.png');
    assert.equal(mapAssetName('mp_rr_canyonlands_hu_avt_uh'), 'mp_rr_canyonlands.png');
    assert.equal(mapAssetName('mp_rr_divided_moon_mu1'), 'mp_rr_divided_moon.png');
    assert.equal(mapAssetName('mp_rr_district_mu1'), 'mp_rr_district.png');
    assert.equal(mapAssetName('mp_rr_tropic_island_mu2_landscape'), 'mp_rr_tropic_island.png');
});

test('unknown raw map names do not request synthetic map assets', () => {
    const t = (key) => `translated:${key}`;
    assert.equal(mapAssetName('mp_rr_unknown_variant'), '');
    assert.equal(mapAssetName('mp_rr_thunderdome_mu2'), '');
    assert.equal(mapDisplayName('mp_rr_unknown_variant', t), 'mp_rr_unknown_variant');
    assert.equal(mapDisplayName('mp_rr_unknown_br_mu1', t), 'mp_rr_unknown_br_mu1');
    assert.equal(mapDisplayName('mp_rr_thunderdome_mu2', t), 'mp_rr_thunderdome_mu2');
    assert.equal(mapDisplayName('mp_rr_district_mu1', t), 'translated:maps.eDistrict');
    assert.equal(mapDisplayName('mp_rr_tropic_island_mu2_landscape', t), 'translated:maps.stormPoint');
});

test('lobby map names use the dedicated lobby image without coordinate-map classification', () => {
    const t = (key) => `translated:${key}`;
    assert.equal(isLobbyMap('mp_lobby'), true);
    assert.equal(isLobbyMap('mp_lobby_mu1'), true);
    assert.equal(mapAssetName('mp_lobby_mu1'), 'mp_lobby.png');
    assert.equal(mapDefinition('mp_lobby_mu1')?.lobby, true);
    assert.equal(mapDisplayName('mp_lobby_mu1', t), 'translated:maps.lobby');
});

test('canyonlands staging map names use the range image-only map', () => {
    const t = (key) => `translated:${key}`;
    assert.equal(isRangeMap('mp_rr_canyonlands_staging_mu1'), true);
    assert.equal(isImageOnlyMap('mp_rr_canyonlands_staging_mu1'), true);
    assert.equal(mapAssetName('mp_rr_canyonlands_staging_mu1'), 'mp_range.png');
    assert.equal(mapDefinition('mp_rr_canyonlands_staging_mu1')?.range, true);
    assert.equal(mapDefinition('mp_rr_canyonlands_staging_mu1')?.imageOnly, true);
    assert.equal(mapDisplayName('mp_rr_canyonlands_staging_mu1', t), 'translated:maps.range');
    assert.equal(mapAssetName('mp_rr_canyonlands_hu_avt_uh'), 'mp_rr_canyonlands.png');
});

test('all map names are present in all three supported languages', () => {
    for (const label of [
        '诸王峡谷', '世界尽头', '奥林匹斯', '残月', '风暴点', '电气区',
        '王者峽谷', '世界邊緣', '奧林匹斯', '殘月', '暴風點', '電流區',
        'Kings Canyon', "World's Edge", 'Olympus', 'Broken Moon', 'Storm Point', 'E-District',
        '大厅', '大廳', 'Lobby', '射击场', '射擊場', 'Firing Range'
    ]) {
        assert.ok(i18nSource.includes(label), `missing localized map label: ${label}`);
    }
});

test('unsupported map guidance is localized instead of describing a missing png', () => {
    assert.ok(i18nSource.includes('当前地图 {map} 无网页雷达，只能在大逃杀模式的地图里使用。'));
    assert.ok(i18nSource.includes('目前地圖 {map} 沒有網頁雷達，只能在大逃殺模式的地圖中使用。'));
    assert.ok(i18nSource.includes('The current map {map} has no web radar'));
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

    loader.load('mp_rr_divided_moon.png');
    assert.equal(image.hidden, true);
    assert.equal(image.dataset.assetSource, 'local');
    assert.match(image.src, /static\/mp_rr_divided_moon\.png$/);

    listeners.load();
    assert.equal(image.hidden, false);

    loader.clear();
    assert.equal(image.hidden, true);
    assert.equal(Object.hasOwn(image, 'src'), false);
});
