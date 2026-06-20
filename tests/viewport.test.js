import test from 'node:test';
import assert from 'node:assert/strict';

import { MAX_SCALE, MIN_SCALE } from '../src/config.js';
import {
    mapPointAtObservationPoint,
    normalizeZoomScale,
    squareSurfaceForObservation,
    translationAfterObservationResize,
    translationForAnchor,
    translationForFollow
} from '../src/render/viewport.js';

test('a rectangular observation port creates a square, non-stretched map surface', () => {
    assert.deepEqual(squareSurfaceForObservation({ width: 1280, height: 720 }), {
        width: 720,
        height: 720
    });
    assert.deepEqual(squareSurfaceForObservation({ width: 540, height: 800 }), {
        width: 540,
        height: 540
    });
});

test('all zoom inputs share the strict 100% to 300% range', () => {
    assert.equal(normalizeZoomScale(Number.NEGATIVE_INFINITY), MIN_SCALE);
    assert.equal(normalizeZoomScale(0.25), MIN_SCALE);
    assert.equal(normalizeZoomScale(1.3754), 1.375);
    assert.equal(normalizeZoomScale(9), MAX_SCALE);
    assert.equal(normalizeZoomScale(Number.POSITIVE_INFINITY), MIN_SCALE);
});

test('anchored zoom preserves the map point under the observation point at a limit', () => {
    const viewport = { scale: 2.75, translateX: -320, translateY: -180 };
    const observationPoint = { x: 240, y: 160 };
    const mapPoint = mapPointAtObservationPoint(observationPoint, viewport);
    const scale = normalizeZoomScale(8);
    const translation = translationForAnchor(observationPoint, mapPoint, scale);

    assert.equal(scale, MAX_SCALE);
    assert.deepEqual(
        mapPointAtObservationPoint(observationPoint, {
            scale,
            translateX: translation.x,
            translateY: translation.y
        }),
        mapPoint
    );
});

test('fixed follow remains centered at minimum and maximum zoom', () => {
    const position = { x: 760, y: 220 };
    const surface = { width: 900, height: 600 };
    const observation = { width: 540, height: 480 };

    for (const scale of [MIN_SCALE, MAX_SCALE]) {
        const translation = translationForFollow(position, surface, observation, scale);
        const surfacePoint = {
            x: position.x / 1000 * surface.width,
            y: position.y / 1000 * surface.height
        };
        assert.equal(translation.x + surfacePoint.x * scale, observation.width / 2);
        assert.equal(translation.y + surfacePoint.y * scale, observation.height / 2);
    }
});

test('resizing the observation port changes only its centered crop translation', () => {
    const surface = Object.freeze({ width: 900, height: 600 });
    const translation = translationAfterObservationResize(
        { translateX: -150, translateY: -80 },
        { width: 700, height: 500 },
        { width: 500, height: 360 }
    );

    assert.deepEqual(translation, { x: -250, y: -150 });
    assert.deepEqual(surface, { width: 900, height: 600 });
});
