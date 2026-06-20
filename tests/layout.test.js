import test from 'node:test';
import assert from 'node:assert/strict';

import { allocateDesktopLayout } from '../src/ui/layout.js';

test('growing a three-column page gives excess width to the map, not the table', () => {
    const narrow = allocateDesktopLayout({
        width: 1100, height: 609, tableVisible: true, tableContentWidth: 2000
    });
    const wide = allocateDesktopLayout({
        width: 1500, height: 609, tableVisible: true, tableContentWidth: 2000
    });

    assert.equal(narrow.mapWidth, 609);
    assert.equal(narrow.mapHeight, 609);
    assert.equal(narrow.tableWidth, 181);
    assert.equal(wide.tableWidth, 375);
    assert.equal(wide.mapWidth, 815);
    assert.equal(wide.mapHeight, 609);
});

test('map width never falls below map height when desktop width is constrained', () => {
    const allocation = allocateDesktopLayout({
        width: 1024, height: 900, tableVisible: true, tableContentWidth: 2000
    });

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

test('allocation remains stable when player-table content width is unchanged', () => {
    const beforeContentChange = allocateDesktopLayout({
        width: 1280, height: 609, tableVisible: true, tableContentWidth: 2000
    });
    const afterContentChange = allocateDesktopLayout({
        width: 1280, height: 609, tableVisible: true, tableContentWidth: 2000
    });

    assert.deepEqual(afterContentChange, beforeContentChange);
    assert.ok(afterContentChange.mapWidth >= afterContentChange.mapHeight);
});

test('a short table expands only until its content fits', () => {
    const allocation = allocateDesktopLayout({
        width: 1500, height: 609, tableVisible: true, tableContentWidth: 248
    });

    assert.equal(allocation.tableWidth, 248);
    assert.equal(allocation.mapWidth, 942);
    assert.equal(allocation.mapHeight, 609);
});

test('a wide table is capped at 25 percent of the page content width', () => {
    const allocation = allocateDesktopLayout({
        width: 1600, height: 609, tableVisible: true, tableContentWidth: 2400
    });

    assert.equal(allocation.tableWidth, 400);
    assert.equal(allocation.mapWidth, 890);
    assert.ok(allocation.mapWidth >= allocation.mapHeight);
});
