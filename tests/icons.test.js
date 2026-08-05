import test from 'node:test';
import assert from 'node:assert/strict';

import { iconSourcesForKind } from '../src/config.js';
import { configureFallbackIconImage, iconAssetNameForKey, iconUrl } from '../src/assets/icons.js';

test('legend and rank icon keys resolve under their dedicated base directories', () => {
    assert.equal(iconAssetNameForKey('legend', 'icon_legends/30px-Portrait_Axle_square'), '30px-Portrait_Axle_square.png');
    assert.equal(iconAssetNameForKey('rank', 'icon_rank/rookie4'), 'rookie4.png');
    assert.equal(iconAssetNameForKey('rank', '../icon_rank/rookie4'), '');
});

test('icon source order follows map asset source order', () => {
    assert.deepEqual(iconSourcesForKind('legend', { protocol: 'http:' }).map((source) => source.baseUrl), [
        './res/icon_legends/',
        'https://img.hoozi.net/icon_legends/'
    ]);
    assert.deepEqual(iconSourcesForKind('rank', { protocol: 'https:' }).map((source) => source.baseUrl), [
        'https://img.hoozi.net/icon_rank/',
        './res/icon_rank/'
    ]);
});

test('fallback icon images use referrer origin and retry the next source', () => {
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

    assert.equal(configureFallbackIconImage(image, 'rank', 'icon_rank/rookie4', { protocol: 'http:' }), true);
    assert.equal(image.referrerPolicy, 'origin');
    assert.equal(image.dataset.assetSource, 'local');
    assert.equal(image.src, './res/icon_rank/rookie4.png');

    listeners.error();
    assert.equal(image.dataset.assetSource, 'remote');
    assert.equal(image.src, 'https://img.hoozi.net/icon_rank/rookie4.png');

    assert.equal(iconUrl({ baseUrl: './res/icon_legends/' }, '30px-Portrait_Axle_square.png'), './res/icon_legends/30px-Portrait_Axle_square.png');
});
