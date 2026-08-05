import test from 'node:test';
import assert from 'node:assert/strict';

import { renderRingEffect } from '../src/render/ring.js';

test('ring rendering uses one uniform map scale and always draws circles', () => {
    const arcs = [];
    const ctx = {
        clearRect() {},
        save() {},
        restore() {},
        beginPath() {},
        rect() {},
        fill() {},
        stroke() {},
        arc(x, y, radius) {
            arcs.push({ x, y, radius });
        }
    };

    renderRingEffect(
        ctx,
        { x: 500, y: 500, radius: 250 },
        { showRing: true },
        { width: 1200, height: 700 }
    );

    assert.equal(arcs.length, 3);
    for (const arc of arcs) {
        assert.deepEqual(arc, { x: 350, y: 350, radius: 175 });
    }
});
