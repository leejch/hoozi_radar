import { MAP_SIDE } from '../config.js';

const OUTSIDE_DARK_FILTER = 'rgba(2, 6, 23, 0.42)';
const OUTSIDE_WARM_FILTER = 'rgba(127, 29, 29, 0.16)';
const RING_COLOR = 'rgba(56, 189, 248, 0.96)';

function addOutsidePath(ctx, centerX, centerY, radiusX, radiusY, width, height) {
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
}

export function renderRingEffect(ctx, ring, settings, dimensions) {
    const { width, height } = dimensions;
    ctx.clearRect(0, 0, width, height);
    if (!settings.showRing || !ring || ring.radius <= 0) return;

    const centerX = ring.x / MAP_SIDE * width;
    const centerY = ring.y / MAP_SIDE * height;
    const radiusX = ring.radius / MAP_SIDE * width;
    const radiusY = ring.radius / MAP_SIDE * height;

    ctx.save();
    ctx.fillStyle = OUTSIDE_DARK_FILTER;
    addOutsidePath(ctx, centerX, centerY, radiusX, radiusY, width, height);
    ctx.fill('evenodd');
    ctx.fillStyle = OUTSIDE_WARM_FILTER;
    addOutsidePath(ctx, centerX, centerY, radiusX, radiusY, width, height);
    ctx.fill('evenodd');
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = RING_COLOR;
    ctx.lineWidth = 1.35;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.45)';
    ctx.shadowBlur = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}
