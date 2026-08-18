import {
    MAX_SCALE,
    MIN_SCALE,
    VIEW_MODE_FOLLOW,
    VIEW_MODE_FREE,
    defaultScaleForMode
} from '../config.js';
import { isImageOnlyMap } from '../assets/maps.js';
import { renderEntities } from './entities.js';
import { renderRingEffect } from './ring.js';
import {
    canvasTransformForViewport,
    mapPointAtObservationPoint,
    normalizeZoomScale,
    squareSurfaceForObservation,
    translationAfterObservationResize,
    translationForCenteredSurface,
    translationForAnchor,
    translationForFollow
} from './viewport.js';

const BUTTON_ZOOM_STEP = 0.25;
const WHEEL_ZOOM_STEP = 0.1;
const SCALE_EPSILON = 0.0001;
const MAP_MODE_IMAGE = 'image';
const MAP_MODE_RADAR = 'radar';

export function createRadarRenderer({ refs, store, settings, t }) {
    const ctx = refs.mapCanvas.getContext('2d');
    const zoneCtx = refs.mapZoneCanvas.getContext('2d');
    const pointers = new Map();
    const surface = { width: 0, height: 0 };
    let pan = null;
    let pinch = null;
    let viewportWidth = 0;
    let viewportHeight = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let resizeObserver = null;
    let mapMode = MAP_MODE_RADAR;

    function isImageMode() {
        return mapMode === MAP_MODE_IMAGE;
    }

    function clearDrawingLayers() {
        for (const context of [zoneCtx, ctx]) {
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }
    }

    function setDrawingTransform(context) {
        const transform = canvasTransformForViewport(store.state.viewport, pixelRatio);
        context.setTransform(
            transform.scale,
            0,
            0,
            transform.scale,
            transform.translateX,
            transform.translateY
        );
    }

    function setMapMode(mode) {
        const normalized = mode === MAP_MODE_IMAGE ? MAP_MODE_IMAGE : MAP_MODE_RADAR;
        if (mapMode === normalized && refs.mapViewport.dataset.mapMode === normalized) return;
        mapMode = normalized;
        refs.mapViewport.dataset.mapMode = mapMode;
        refs.mapStage.dataset.mapMode = mapMode;
        if (isImageMode()) {
            refs.mapViewport.style.transform = 'none';
            clearDrawingLayers();
        } else {
            applyTransform();
        }
    }

    function selectedPosition() {
        const snapshot = store.getRenderSnapshot();
        return store.getSelectedPlayer(snapshot?.players)?.position || null;
    }

    function resizeCanvases() {
        if (!viewportWidth || !viewportHeight) return;
        pixelRatio = Math.max(1, window.devicePixelRatio || 1);
        const width = Math.max(1, Math.round(viewportWidth * pixelRatio));
        const height = Math.max(1, Math.round(viewportHeight * pixelRatio));
        for (const canvas of [refs.mapZoneCanvas, refs.mapCanvas]) {
            if (canvas.width !== width) canvas.width = width;
            if (canvas.height !== height) canvas.height = height;
        }
    }

    function initializeSurface(width, height) {
        if (surface.width || !width || !height) return;
        const squareSurface = squareSurfaceForObservation({ width, height });
        if (!squareSurface) return;
        surface.width = squareSurface.width;
        surface.height = squareSurface.height;
        refs.mapViewport.style.width = `${surface.width}px`;
        refs.mapViewport.style.height = `${surface.height}px`;
        refs.mapViewport.dataset.surfaceWidth = String(Math.round(surface.width));
        refs.mapViewport.dataset.surfaceHeight = String(Math.round(surface.height));
        resizeCanvases();
    }

    function measureObservationPort() {
        const rect = refs.mapStage.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        initializeSurface(width, height);

        if (viewportWidth && viewportHeight && store.state.viewMode === VIEW_MODE_FREE) {
            const translation = translationAfterObservationResize(
                store.state.viewport,
                { width: viewportWidth, height: viewportHeight },
                { width, height }
            );
            if (translation) {
                store.state.viewport.translateX = translation.x;
                store.state.viewport.translateY = translation.y;
            }
        }
        viewportWidth = width;
        viewportHeight = height;
        resizeCanvases();

        if (store.state.viewMode === VIEW_MODE_FOLLOW) centerOn(selectedPosition());
        else applyTransform();
    }

    function applyTransform() {
        if (isImageMode()) {
            refs.mapViewport.style.transform = 'none';
            return;
        }
        const viewport = store.state.viewport;
        refs.mapViewport.style.transform = `translate3d(${viewport.translateX}px, ${viewport.translateY}px, 0) scale(${viewport.scale})`;
    }

    function centerOn(position) {
        if (isImageMode()) return false;
        if (!position || !surface.width || !surface.height || !viewportWidth || !viewportHeight) return false;
        const viewport = store.state.viewport;
        const translation = translationForFollow(
            position,
            surface,
            { width: viewportWidth, height: viewportHeight },
            viewport.scale
        );
        if (!translation) return false;
        viewport.translateX = translation.x;
        viewport.translateY = translation.y;
        applyTransform();
        return true;
    }

    function syncZoomControls() {
        const scale = normalizeZoomScale(store.state.viewport.scale);
        store.state.viewport.scale = scale;
        const percent = Math.round(scale * 100);
        refs.zoomValue.textContent = `${percent}%`;
        refs.zoomOut.disabled = scale <= MIN_SCALE + SCALE_EPSILON;
        refs.zoomIn.disabled = scale >= MAX_SCALE - SCALE_EPSILON;
        refs.mapStage.dataset.zoomPercent = String(percent);
    }

    function resetViewport() {
        const viewport = store.state.viewport;
        viewport.scale = defaultScaleForMode(store.state.viewMode);
        const centered = translationForCenteredSurface(
            surface,
            { width: viewportWidth, height: viewportHeight },
            viewport.scale
        );
        viewport.translateX = centered?.x || 0;
        viewport.translateY = centered?.y || 0;
        if (store.state.viewMode !== VIEW_MODE_FOLLOW || !centerOn(selectedPosition())) applyTransform();
        syncZoomControls();
    }

    function zoomTo(point, requestedScale, anchoredMapPoint = null) {
        if (isImageMode()) return;
        const viewport = store.state.viewport;
        const nextScale = normalizeZoomScale(requestedScale);
        if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) return;

        const mapPoint = anchoredMapPoint || mapPointAtObservationPoint(point, viewport);
        if (!mapPoint) return;
        viewport.scale = nextScale;
        if (store.state.viewMode !== VIEW_MODE_FOLLOW || !centerOn(selectedPosition())) {
            const translation = translationForAnchor(point, mapPoint, nextScale);
            if (!translation) return;
            viewport.translateX = translation.x;
            viewport.translateY = translation.y;
            applyTransform();
        }
        syncZoomControls();
    }

    function adjustZoom(point, delta) {
        zoomTo(point, store.state.viewport.scale + delta);
    }

    function setViewMode(mode, recenter = true) {
        store.state.viewMode = mode === VIEW_MODE_FREE ? VIEW_MODE_FREE : VIEW_MODE_FOLLOW;
        settings.viewMode = store.state.viewMode;
        if (recenter) resetViewport();
        else {
            store.state.viewport.scale = defaultScaleForMode(store.state.viewMode);
            applyTransform();
            syncZoomControls();
        }
    }

    function renderFrame(now) {
        const snapshot = store.getRenderSnapshot(now);
        setMapMode(isImageOnlyMap(snapshot?.map) ? MAP_MODE_IMAGE : MAP_MODE_RADAR);
        // Browser zoom and display-DPI changes do not consistently fire a
        // ResizeObserver. This is a no-op unless the backing dimensions changed.
        resizeCanvases();
        if (isImageMode()) {
            clearDrawingLayers();
            animationFrame = requestAnimationFrame(renderFrame);
            return;
        }
        const selected = store.getSelectedPlayer(snapshot?.players);
        if (store.state.viewMode === VIEW_MODE_FOLLOW && selected?.position) centerOn(selected.position);
        clearDrawingLayers();
        setDrawingTransform(zoneCtx);
        renderRingEffect(
            zoneCtx,
            snapshot?.ring,
            settings,
            { width: surface.width, height: surface.height },
            { clear: false }
        );
        setDrawingTransform(ctx);
        renderEntities(
            ctx,
            snapshot,
            settings,
            selected,
            { width: surface.width, height: surface.height },
            t,
            { clear: false, localTeam: store.getLocalPlayerTeam(snapshot?.players) }
        );
        animationFrame = requestAnimationFrame(renderFrame);
    }

    function pointForEvent(event) {
        const rect = refs.mapStage.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function startPointer(event) {
        if (isImageMode()) return;
        if ((event.pointerType === 'mouse' && event.button !== 0)
            || refs.mapControls.contains(event.target)
            || refs.zoomControls.contains(event.target)
            || refs.mapOverlay.dataset.state !== 'hidden') return;
        refs.mapStage.setPointerCapture(event.pointerId);
        pointers.set(event.pointerId, pointForEvent(event));
        if (pointers.size === 1 && store.state.viewMode === VIEW_MODE_FREE) {
            pan = { point: pointForEvent(event), x: store.state.viewport.translateX, y: store.state.viewport.translateY };
            refs.mapStage.classList.add('dragging');
        } else if (pointers.size === 2) {
            const [a, b] = [...pointers.values()];
            const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            const distance = Math.hypot(a.x - b.x, a.y - b.y);
            const viewport = store.state.viewport;
            pinch = {
                midpoint,
                distance: Math.max(1, distance),
                scale: normalizeZoomScale(viewport.scale),
                mapX: (midpoint.x - viewport.translateX) / viewport.scale,
                mapY: (midpoint.y - viewport.translateY) / viewport.scale
            };
            pan = null;
        }
    }

    function movePointer(event) {
        if (!pointers.has(event.pointerId)) return;
        const point = pointForEvent(event);
        pointers.set(event.pointerId, point);
        if (pinch && pointers.size >= 2) {
            const [a, b] = [...pointers.values()];
            const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
            const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
            const requestedScale = pinch.scale * distance / pinch.distance;
            if (!Number.isFinite(requestedScale)) return;
            zoomTo(midpoint, requestedScale, { x: pinch.mapX, y: pinch.mapY });
        } else if (pan && store.state.viewMode === VIEW_MODE_FREE) {
            store.state.viewport.translateX = pan.x + point.x - pan.point.x;
            store.state.viewport.translateY = pan.y + point.y - pan.point.y;
            applyTransform();
        }
    }

    function endPointer(event) {
        pointers.delete(event.pointerId);
        if (refs.mapStage.hasPointerCapture(event.pointerId)) refs.mapStage.releasePointerCapture(event.pointerId);
        if (pointers.size < 2) pinch = null;
        if (pointers.size === 1 && store.state.viewMode === VIEW_MODE_FREE) {
            const [pointerId, point] = pointers.entries().next().value;
            pan = {
                pointerId,
                point,
                x: store.state.viewport.translateX,
                y: store.state.viewport.translateY
            };
            refs.mapStage.classList.add('dragging');
        } else if (pointers.size === 0) {
            pan = null;
            refs.mapStage.classList.remove('dragging');
        }
    }

    refs.mapStage.addEventListener('pointerdown', startPointer);
    refs.mapStage.addEventListener('pointermove', movePointer);
    refs.mapStage.addEventListener('pointerup', endPointer);
    refs.mapStage.addEventListener('pointercancel', endPointer);
    refs.mapStage.addEventListener('lostpointercapture', endPointer);
    refs.mapStage.addEventListener('wheel', (event) => {
        if (isImageMode()) return;
        if (refs.mapOverlay.dataset.state !== 'hidden' || event.deltaY === 0) return;
        event.preventDefault();
        adjustZoom(pointForEvent(event), event.deltaY < 0 ? WHEEL_ZOOM_STEP : -WHEEL_ZOOM_STEP);
    }, { passive: false });
    refs.mapStage.addEventListener('dblclick', (event) => {
        if (isImageMode()) return;
        if (refs.mapOverlay.dataset.state === 'hidden') adjustZoom(pointForEvent(event), BUTTON_ZOOM_STEP);
    });
    refs.zoomOut.addEventListener('click', () => {
        adjustZoom({ x: viewportWidth / 2, y: viewportHeight / 2 }, -BUTTON_ZOOM_STEP);
    });
    refs.zoomIn.addEventListener('click', () => {
        adjustZoom({ x: viewportWidth / 2, y: viewportHeight / 2 }, BUTTON_ZOOM_STEP);
    });
    return {
        start() {
            // The UI computes the minimum non-compressed table width in its
            // first frame. Lock the drawing surface after that layout settles;
            // later stage resizes only change the observation port.
            animationFrame = requestAnimationFrame((now) => {
                measureObservationPort();
                applyTransform();
                syncZoomControls();
                if ('ResizeObserver' in window) {
                    resizeObserver = new ResizeObserver(measureObservationPort);
                    resizeObserver.observe(refs.mapStage);
                }
                window.addEventListener('resize', measureObservationPort);
                renderFrame(now);
            });
        },
        stop() {
            cancelAnimationFrame(animationFrame);
            resizeObserver?.disconnect();
            window.removeEventListener('resize', measureObservationPort);
        },
        setViewMode,
        resetViewport,
        setMapName(mapName) {
            setMapMode(isImageOnlyMap(mapName) ? MAP_MODE_IMAGE : MAP_MODE_RADAR);
        },
        recenterSelected() {
            const snapshot = store.getRenderSnapshot();
            centerOn(store.getSelectedPlayer(snapshot?.players)?.position);
        }
    };
}

