import test from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_SETTINGS } from '../src/config.js';
import { renderEntities, shieldBarStyle } from '../src/render/entities.js';

function recordingContext() {
    const records = { arcs: [], fills: [], strokes: [], outlinedText: [] };
    const stack = [];
    const ctx = {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        globalAlpha: 1,
        font: '',
        textAlign: '',
        textBaseline: '',
        clearRect() {},
        beginPath() {},
        moveTo() {},
        lineTo() {},
        save() {
            stack.push({
                fillStyle: this.fillStyle,
                strokeStyle: this.strokeStyle,
                lineWidth: this.lineWidth,
                globalAlpha: this.globalAlpha
            });
        },
        restore() {
            Object.assign(this, stack.pop());
        },
        arc(x, y, radius) {
            records.arcs.push({ x, y, radius });
        },
        fill() {},
        stroke() {
            records.strokes.push({ style: this.strokeStyle, width: this.lineWidth });
        },
        fillRect(x, y, width, height) {
            records.fills.push({ style: this.fillStyle, x, y, width, height });
        },
        strokeText(text, x, y) {
            records.outlinedText.push({ text, x, y, width: this.lineWidth });
        },
        fillText() {}
    };
    return { ctx, records };
}

test('player markers and text use the reduced geometry', () => {
    const { ctx, records } = recordingContext();
    const player = {
        id: 'local', self: true, name: 'Local', team: 1,
        position: { x: 500, y: 500 }, is_dead: false, is_down: false,
        hp: 80, max_hp: 100, shield: 50, max_shield: 100,
        legend: '', level: 1, rank: '', kills: 0, damage: 0, roster: 0
    };
    const settings = {
        ...DEFAULT_SETTINGS,
        showTeamLinks: false,
        showLegend: false,
        showLevel: false,
        showRank: false,
        showCombat: false,
        showRoster: false
    };

    renderEntities(ctx, { players: [player] }, settings, player, { width: 1000, height: 1000 }, (key) => key);

    assert.deepEqual(records.arcs, [{ x: 500, y: 500, radius: 4 }]);
    assert.deepEqual(records.strokes[0], { style: 'rgb(255, 0, 0)', width: 1 });
    assert.equal(records.outlinedText[0].width, 1);
    assert.equal(DEFAULT_SETTINGS.fontSize, 10);
});

test('shield is above white health with one shared boundary and thinner borders', () => {
    const { ctx, records } = recordingContext();
    const player = {
        id: 'p1', self: false, name: '', team: 2,
        position: { x: 500, y: 500 }, is_dead: false, is_down: false,
        hp: 100, max_hp: 100, shield: 125, max_shield: 75,
        legend: '', level: 0, rank: '', kills: 0, damage: 0, roster: 0
    };
    const settings = {
        ...DEFAULT_SETTINGS,
        showTeamLinks: false,
        showName: false,
        showLegend: false,
        showLevel: false,
        showRank: false,
        showCombat: false,
        showRoster: false
    };

    renderEntities(ctx, { players: [player] }, settings, null, { width: 1000, height: 1000 }, (key) => key);

    const [shieldBorder, shieldFill, healthBorder, healthFill] = records.fills;
    assert.deepEqual(records.strokes[0], { style: 'rgba(2, 6, 23, 0.95)', width: 1 });
    assert.equal(shieldFill.style, 'rgb(50, 133, 205)');
    assert.equal(healthFill.style, '#FFFFFF');
    assert.equal(shieldBorder.x, healthBorder.x);
    assert.equal(shieldBorder.width, 21);
    assert.equal(shieldBorder.y + shieldBorder.height, healthBorder.y);
    assert.equal(shieldFill.x - shieldBorder.x, 0.5);
    assert.equal(healthFill.x - healthBorder.x, 0.5);
    assert.equal(shieldFill.width, shieldBorder.width - 1);
});

test('shield tiers control bar length and exact fill color', () => {
    assert.equal(shieldBarStyle(0), null);
    assert.equal(shieldBarStyle(''), null);
    assert.equal(shieldBarStyle(undefined), null);
    assert.deepEqual(shieldBarStyle(50), { width: 14, color: 'rgb(224, 224, 224)' });
    assert.deepEqual(shieldBarStyle(75), { width: 21, color: 'rgb(50, 133, 205)' });
    assert.deepEqual(shieldBarStyle(100), { width: 28, color: 'rgb(135, 65, 177)' });
    assert.deepEqual(shieldBarStyle(125), { width: 35, color: 'rgb(209, 17, 15)' });
});

test('zero maximum shield omits the shield bar without moving the health bar', () => {
    const { ctx, records } = recordingContext();
    const player = {
        id: 'p1', self: false, name: '', team: 2,
        position: { x: 500, y: 500 }, is_dead: false, is_down: false,
        hp: 100, max_hp: 100, shield: 0, max_shield: 0,
        legend: '', level: 0, rank: '', kills: 0, damage: 0, roster: 0
    };
    const settings = {
        ...DEFAULT_SETTINGS,
        showTeamLinks: false,
        showName: false,
        showLegend: false,
        showLevel: false,
        showRank: false,
        showCombat: false,
        showRoster: false
    };

    renderEntities(ctx, { players: [player] }, settings, null, { width: 1000, height: 1000 }, (key) => key);

    assert.equal(records.fills.length, 2);
    assert.equal(records.fills[0].y, 507);
    assert.equal(records.fills[1].style, '#FFFFFF');
});
