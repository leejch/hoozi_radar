import {
    MAP_SIDE,
    VIEW_MODE_FOLLOW,
    VIEW_MODE_FREE,
    clampScale,
    defaultScaleForMode,
    saveSetting
} from '../config.js';
import { renderEntities } from './entities.js';
import { renderRingEffect } from './ring.js';

export function createRadarRenderer({ refs, store, settings, t }) {
    const ctx = refs.mapCanvas.getContext('2d');
    const zoneCtx = refs.mapZoneCanvas.getContext('2d');
    const pointers = new Map();
    let pan = null;
    let pinch = null;
    let cssWidth = 0;
    let cssHeight = 0;
    let pixelRatio = 1;
    let animationFrame = 0;

    function resize() {
        const rect = refs.mapStage.getBoundingClientRect();
        cssWidth = Math.max(1, rect.width);
        cssHeight = Math.max(1, rect.height);
        pixelRatio = Math.max(1, window.devicePixelRatio || 1);
        const width = Math.round(cssWidth * pixelRatio);
        const height = Math.round(cssHeight * pixelRatio);
        for (const canvas of [refs.mapZoneCanvas, refs.mapCanvas]) {
            if (canvas.width !== width) canvas.width = width;
            if (canvas.height !== height) canvas.height = height;
        }
    }

    function applyTransform() {
        const viewport = store.state.viewport;
        refs.mapViewport.style.transform = `translate3d(${viewport.translateX}px, ${viewport.translateY}px, 0) scale(${viewport.scale})`;
    }

    function centerOn(position) {
        if (!position || !cssWidth || !cssHeight) return;
        const viewport = store.state.viewport;
        const x = position.x / MAP_SIDE * cssWidth;
        const y = position.y / MAP_SIDE * cssHeight;
        viewport.translateX = cssWidth / 2 - x * viewport.scale;
        viewport.translateY = cssHeight / 2 - y * viewport.scale;
        applyTransform();
    }

    function resetViewport() {
        const viewport = store.state.viewport;
        viewport.scale = clampScale(defaultScaleForMode(store.state.viewMode));
        viewport.translateX = 0;
        viewport.translateY = 0;
        const snapshot = store.getRenderSnapshot();
        if (store.state.viewMode === VIEW_MODE_FOLLOW) {
            centerOn(store.getSelectedPlayer(snapshot?.players)?.position);
        } else {
            applyTransform();
        }
    }

    function zoomAt(point, factor) {
        const viewport = store.state.viewport;
        const nextScale = clampScale(viewport.scale * factor);
        if (nextScale === viewport.scale) return;
        const mapX = (point.x - viewport.translateX) / viewport.scale;
        const mapY = (point.y - viewport.translateY) / viewport.scale;
        viewport.translateX = point.x - mapX * nextScale;
        viewport.translateY = point.y - mapY * nextScale;
        viewport.scale = nextScale;
        applyTransform();
    }

    function setViewMode(mode, recenter = true) {
        store.state.viewMode = mode === VIEW_MODE_FREE ? VIEW_MODE_FREE : VIEW_MODE_FOLLOW;
        settings.viewMode = store.state.viewMode;
        saveSetting('viewMode', settings.viewMode);
        if (recenter) resetViewport();
    }

    function renderFrame(now) {
        resize();
        const snapshot = store.getRenderSnapshot(now);
        const selected = store.getSelectedPlayer(snapshot?.players);
        if (store.state.viewMode === VIEW_MODE_FOLLOW && selected?.position) centerOn(selected.position);
        zoneCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        renderRingEffect(zoneCtx, snapshot?.ring, settings, { width: cssWidth, height: cssHeight });
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        renderEntities(ctx, snapshot, settings, selected, { width: cssWidth, height: cssHeight }, t);
        animationFrame = requestAnimationFrame(renderFrame);
    }

    function pointForEvent(event) {
        const rect = refs.mapStage.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function startPointer(event) {
        if (refs.mapControls.contains(event.target) || refs.mapOverlay.dataset.state !== 'hidden') return;
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
                distance,
                scale: viewport.scale,
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
            const scale = clampScale(pinch.scale * distance / Math.max(1, pinch.distance));
            store.state.viewport.scale = scale;
            store.state.viewport.translateX = midpoint.x - pinch.mapX * scale;
            store.state.viewport.translateY = midpoint.y - pinch.mapY * scale;
            applyTransform();
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
        if (pointers.size === 0) {
            pan = null;
            refs.mapStage.classList.remove('dragging');
        }
    }

    refs.mapStage.addEventListener('pointerdown', startPointer);
    refs.mapStage.addEventListener('pointermove', movePointer);
    refs.mapStage.addEventListener('pointerup', endPointer);
    refs.mapStage.addEventListener('pointercancel', endPointer);
    refs.mapStage.addEventListener('wheel', (event) => {
        if (refs.mapOverlay.dataset.state !== 'hidden') return;
        event.preventDefault();
        zoomAt(pointForEvent(event), event.deltaY < 0 ? 1.12 : 0.89);
    }, { passive: false });
    refs.mapStage.addEventListener('dblclick', (event) => {
        if (refs.mapOverlay.dataset.state === 'hidden') zoomAt(pointForEvent(event), 1.35);
    });
    refs.zoomReset.addEventListener('click', resetViewport);
    window.addEventListener('resize', resize);

    return {
        start() {
            resize();
            applyTransform();
            animationFrame = requestAnimationFrame(renderFrame);
        },
        stop() {
            cancelAnimationFrame(animationFrame);
        },
        setViewMode,
        resetViewport,
        recenterSelected() {
            const snapshot = store.getRenderSnapshot();
            centerOn(store.getSelectedPlayer(snapshot?.players)?.position);
        }
    };
}

