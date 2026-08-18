import test from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_SETTINGS, teamColorFor } from '../src/config.js';
import { headingVector, renderEntities } from '../src/render/entities.js';

function recordingContext() {
    const records = { arcs: [], strokes: [], paths: [], fills: [], texts: [], rects: [] };
    let path = [];
    const ctx = {
        clearRect() {}, save() {}, restore() {},
        beginPath() { path = []; },
        moveTo(x, y) { path.push({ kind: 'move', x, y }); },
        lineTo(x, y) { path.push({ kind: 'line', x, y }); },
        arc(x, y, radius) { records.arcs.push({ x, y, radius }); },
        fill() { records.fills.push({ style: ctx.fillStyle }); },
        stroke() {
            records.strokes.push({ style: ctx.strokeStyle, width: ctx.lineWidth });
            if (path.length) records.paths.push(path.map((point) => ({ ...point })));
        },
        fillRect(...args) { records.rects.push(args); },
        strokeRect(...args) { records.rects.push(args); },
        measureText(text) { return { width: String(text).length }; },
        strokeText(text, x, y) { records.texts.push({ kind: 'stroke', text, x, y }); },
        fillText(text, x, y) { records.texts.push({ kind: 'fill', text, x, y, style: ctx.fillStyle }); },
        fillStyle: '', strokeStyle: '', lineWidth: 1, globalAlpha: 1,
        textAlign: 'center', textBaseline: 'top', font: '', lineCap: 'butt'
    };
    return { ctx, records };
}

function player(overrides = {}) {
    return {
        id: 'p1', self: false, name: 'Player', team: 2,
        position: { x: 500, y: 500 }, yaw: 0, is_dead: false,
        legend: '', level: 0, rank: '', kills: 0, damage: 0, roster: 0,
        ...overrides
    };
}

function render(players, settings = {}, selected = null, options = {}) {
    const recording = recordingContext();
    renderEntities(
        recording.ctx,
        { players },
        { ...DEFAULT_SETTINGS, showTeamLinks: false, ...settings },
        selected,
        { width: 1000, height: 1000 },
        (key) => key,
        options
    );
    return recording.records;
}

test('yaw vectors use zero as east with positive angles turning toward north', () => {
    assert.ok(Math.abs(headingVector(0).x - 1) < 1e-12);
    assert.ok(Math.abs(headingVector(0).y) < 1e-12);
    assert.ok(Math.abs(headingVector(90).x) < 1e-12);
    assert.ok(Math.abs(headingVector(90).y + 1) < 1e-12);
    assert.ok(Math.abs(headingVector(-90).x) < 1e-12);
    assert.ok(Math.abs(headingVector(-90).y - 1) < 1e-12);
    assert.ok(Math.abs(headingVector(180).x + 1) < 1e-12);
    assert.equal(headingVector(undefined), null);
});

test('player markers draw a visible south-facing heading for yaw -90 without old vitals geometry', () => {
    const records = render([player({ yaw: -90 })], {
        showTeam: false, showName: false, showRoster: false
    });
    assert.deepEqual(records.arcs, [{ x: 500, y: 500, radius: 4 }]);
    assert.ok(records.paths.some((path) => (
        path.length === 2
        && path[0].x === 500 && path[0].y === 500
        && Math.abs(path[1].x - 500) < 1e-12 && path[1].y === 510
    )));
    assert.equal(records.rects.length, 0);
});

test('dead players are omitted from map drawing', () => {
    const records = render([player({ is_dead: true })]);
    assert.equal(records.arcs.length, 0);
    assert.equal(records.paths.length, 0);
});

test('team links retain their visible white styling', () => {
    const selected = player({ id: 'selected', self: true, team: 2, position: { x: 400, y: 400 } });
    const mate = player({ id: 'mate', team: 2, position: { x: 600, y: 600 } });
    const records = render([selected, mate], { showTeamLinks: true }, selected);
    assert.ok(records.strokes.some((stroke) => (
        stroke.style === 'rgba(255, 255, 255, 0.65)' && stroke.width === 1
    )));
});

test('map labels keep team before nickname', () => {
    const records = render([player({ team: 12, name: 'Local' })], {
        showTeam: true, showName: true, showLegend: false, showLevel: false,
        showRank: false, showCombat: false, showRoster: false
    });
    assert.equal(records.texts.find((record) => record.kind === 'stroke')?.text, '12 Local');
});

test('map anonymity is opt-in and applies only to the supplied local team', () => {
    const local = player({ id: 'local', uid: 'local', team: 5, name: 'Local', legend: 'Wraith', level: 100, rank: 'Gold' });
    const mate = player({ id: 'mate', uid: 'mate', team: 5, name: 'Mate', legend: 'Loba', level: 200, rank: 'Silver', position: { x: 550, y: 550 } });
    const enemy = player({ id: 'enemy', uid: 'enemy', self: true, team: 9, name: 'Enemy', legend: 'Ash', level: 300, rank: 'Platinum', position: { x: 600, y: 600 } });
    const settings = {
        showName: true, showLegend: true, showLevel: true, showRank: true,
        showCombat: false, showRoster: false
    };

    const visible = render([local, mate, enemy], settings, enemy, { localTeam: 5 });
    assert.ok(visible.texts.some((record) => record.text.includes('Local')));

    const anonymous = render(
        [local, mate, enemy],
        { ...settings, anonymizeLocalTeam: true },
        enemy,
        { localTeam: 5 }
    );
    const outlined = anonymous.texts.filter((record) => record.kind === 'stroke').map((record) => record.text);
    assert.deepEqual(outlined, [
        '5 HOOZi3.0 -', '- -',
        '5 HOOZi3.0 -', '- -',
        '9 Enemy Ash', 'Lv.300 Platinum'
    ]);
    assert.equal(teamColorFor(enemy.team), '#F472B6');
});
