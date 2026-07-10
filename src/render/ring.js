import { MAP_SIDE } from '../config.js';

const OUTSIDE_DARK_FILTER = 'rgba(2, 6, 23, 0.42)';
const OUTSIDE_WARM_FILTER = 'rgba(127, 29, 29, 0.16)';
const RING_COLOR = 'rgba(56, 189, 248, 0.96)';

function addOutsidePath(ctx, centerX, centerY, radius, width, height) {
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
}

export function renderRingEffect(ctx, ring, settings, dimensions, { clear = true } = {}) {
    const { width, height } = dimensions;
    if (clear) ctx.clearRect(0, 0, width, height);
    if (!settings.showRing || !ring || ring.radius <= 0) return;

    const mapScale = Math.min(width, height) / MAP_SIDE;
    const centerX = ring.x * mapScale;
    const centerY = ring.y * mapScale;
    const radius = ring.radius * mapScale;

    ctx.save();
    ctx.fillStyle = OUTSIDE_DARK_FILTER;
    addOutsidePath(ctx, centerX, centerY, radius, width, height);
    ctx.fill('evenodd');
    ctx.fillStyle = OUTSIDE_WARM_FILTER;
    addOutsidePath(ctx, centerX, centerY, radius, width, height);
    ctx.fill('evenodd');
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = RING_COLOR;
    ctx.lineWidth = 1.35;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.45)';
    ctx.shadowBlur = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}
