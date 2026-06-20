import test from 'node:test';
import assert from 'node:assert/strict';

import {
    MAX_SCALE,
    MIN_SCALE,
    VIEW_MODE_FOLLOW,
    VIEW_MODE_FREE,
    defaultScaleForMode
} from '../src/config.js';
import {
    mapPointAtObservationPoint,
    normalizeZoomScale,
    squareSurfaceForObservation,
    translationAfterObservationResize,
    translationForAnchor,
    translationForCenteredSurface,
    translationForFollow
} from '../src/render/viewport.js';

test('a rectangular observation port creates a covering square map surface', () => {
    assert.deepEqual(squareSurfaceForObservation({ width: 1280, height: 720 }), {
        width: 1280,
        height: 1280
    });
    assert.deepEqual(squareSurfaceForObservation({ width: 540, height: 800 }), {
        width: 800,
        height: 800
    });
});

test('mode defaults are 150 percent follow and 100 percent free view', () => {
    assert.equal(defaultScaleForMode(VIEW_MODE_FOLLOW), 1.5);
    assert.equal(defaultScaleForMode(VIEW_MODE_FREE), 1);
});

test('100 percent centers a square that covers both observation dimensions', () => {
    const observation = { width: 1280, height: 720 };
    const surface = squareSurfaceForObservation(observation);
    const translation = translationForCenteredSurface(surface, observation, MIN_SCALE);

    assert.deepEqual(translation, { x: 0, y: -280 });
    assert.ok(surface.width * MIN_SCALE >= observation.width);
    assert.ok(surface.height * MIN_SCALE >= observation.height);
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
