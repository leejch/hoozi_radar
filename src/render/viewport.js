import { MAP_SIDE, clampScale } from '../config.js';

export function normalizeZoomScale(value) {
    return Math.round(clampScale(value) * 1000) / 1000;
}

export function squareSurfaceForObservation(observation) {
    if (![observation?.width, observation?.height].every(Number.isFinite)) return null;
    const side = Math.max(observation.width, observation.height);
    if (side <= 0) return null;
    return { width: side, height: side };
}

export function translationForCenteredSurface(surface, observation, scale) {
    if (![surface?.width, surface?.height, observation?.width, observation?.height].every(Number.isFinite)) {
        return null;
    }
    if (surface.width <= 0 || surface.height <= 0 || observation.width <= 0 || observation.height <= 0) return null;
    const normalizedScale = normalizeZoomScale(scale);
    return {
        x: (observation.width - surface.width * normalizedScale) / 2,
        y: (observation.height - surface.height * normalizedScale) / 2
    };
}

export function mapPointAtObservationPoint(point, viewport) {
    const scale = normalizeZoomScale(viewport.scale);
    if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) return null;
    return {
        x: (point.x - viewport.translateX) / scale,
        y: (point.y - viewport.translateY) / scale
    };
}

export function translationForAnchor(point, mapPoint, scale) {
    const normalizedScale = normalizeZoomScale(scale);
    if (![point?.x, point?.y, mapPoint?.x, mapPoint?.y].every(Number.isFinite)) return null;
    return {
        x: point.x - mapPoint.x * normalizedScale,
        y: point.y - mapPoint.y * normalizedScale
    };
}

export function translationForFollow(position, surface, observation, scale) {
    if (![position?.x, position?.y, surface?.width, surface?.height,
        observation?.width, observation?.height].every(Number.isFinite)) return null;
    if (surface.width <= 0 || surface.height <= 0 || observation.width <= 0 || observation.height <= 0) return null;

    const normalizedScale = normalizeZoomScale(scale);
    const x = position.x / MAP_SIDE * surface.width;
    const y = position.y / MAP_SIDE * surface.height;
    return {
        x: observation.width / 2 - x * normalizedScale,
        y: observation.height / 2 - y * normalizedScale
    };
}

export function translationAfterObservationResize(viewport, previousObservation, nextObservation) {
    if (![viewport?.translateX, viewport?.translateY, previousObservation?.width,
        previousObservation?.height, nextObservation?.width, nextObservation?.height].every(Number.isFinite)) {
        return null;
    }
    return {
        x: viewport.translateX + (nextObservation.width - previousObservation.width) / 2,
        y: viewport.translateY + (nextObservation.height - previousObservation.height) / 2
    };
}
