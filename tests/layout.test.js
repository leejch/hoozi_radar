import test from 'node:test';
import assert from 'node:assert/strict';

import { allocateDesktopLayout } from '../src/ui/layout.js';

test('growing a three-column page gives excess width to the map, not the table', () => {
    const narrow = allocateDesktopLayout({ width: 1100, height: 609, tableVisible: true });
    const wide = allocateDesktopLayout({ width: 1500, height: 609, tableVisible: true });

    assert.equal(narrow.mapWidth, 609);
    assert.equal(narrow.mapHeight, 609);
    assert.equal(narrow.tableWidth, 181);
    assert.equal(wide.tableWidth, 320);
    assert.equal(wide.mapWidth, 870);
    assert.equal(wide.mapHeight, 609);
});

test('map width never falls below map height when desktop width is constrained', () => {
    const allocation = allocateDesktopLayout({ width: 1024, height: 900, tableVisible: true });

    assert.equal(allocation.tableWidth, 180);
    assert.equal(allocation.mapWidth, 534);
    assert.equal(allocation.mapHeight, 534);
    assert.ok(allocation.mapWidth >= allocation.mapHeight);
});

test('hiding the table assigns all remaining width to the map', () => {
    const allocation = allocateDesktopLayout({ width: 1100, height: 609, tableVisible: false });

    assert.equal(allocation.tableWidth, 0);
    assert.equal(allocation.mapWidth, 795);
    assert.equal(allocation.mapHeight, 609);
});

test('allocation is independent of player-table content width', () => {
    const beforeContentChange = allocateDesktopLayout({ width: 1280, height: 609, tableVisible: true });
    const afterContentChange = allocateDesktopLayout({ width: 1280, height: 609, tableVisible: true });

    assert.deepEqual(afterContentChange, beforeContentChange);
    assert.ok(afterContentChange.mapWidth >= afterContentChange.mapHeight);
});
