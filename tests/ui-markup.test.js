import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const generatedCss = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

test('player toolbar exposes JSON import before current-player export', () => {
    const importPosition = indexHtml.indexOf('id="importPlayerDataButton"');
    const exportPosition = indexHtml.indexOf('id="exportPlayerDataButton"');

    assert.ok(importPosition >= 0);
    assert.ok(exportPosition > importPosition);
    assert.match(indexHtml, /id="importPlayerDataInput"[^>]+accept="\.json,application\/json"/);
    assert.match(indexHtml, /data-i18n="table\.title">玩家信息列表</);
});

test('automatic connection and fixed follow have persistent default selection styling', () => {
    assert.match(indexHtml, /id="connectionModeAuto"[\s\S]{0,180}data-selected="true"/);
    assert.match(indexHtml, /id="layoutOrientationLandscape"[\s\S]{0,180}data-selected="true"/);
    assert.match(indexHtml, /id="menuVisibleToggle"[\s\S]{0,180}data-selected="true"/);
    assert.match(indexHtml, /id="playerTableVisibleToggle"[\s\S]{0,180}data-selected="true"/);
    assert.match(indexHtml, /id="viewModeFollow"[\s\S]{0,180}data-selected="true"/);
    assert.match(generatedCss, /\[data-selected="true"\]/);
});

test('player list visibility moved from menu checkbox to top controls', () => {
    assert.doesNotMatch(indexHtml, /id="conf_table_visible"/);
    assert.match(indexHtml, /id="playerTableVisibleToggle"/);
});

test('portrait layout keeps a wide map and avoids an inner vertical player-list scroller', () => {
    assert.match(indexHtml, /data-layout-orientation="portrait"[\s\S]{0,120}#mapStage[\s\S]{0,120}aspect-ratio:\s*1\s*\/\s*1\.12/);
    assert.match(indexHtml, /data-layout-orientation="portrait"\] \[data-role="player-table-scroll"\]\s*\{[\s\S]{0,120}overflow-y:\s*hidden/);
    assert.match(indexHtml, /data-layout-orientation="portrait"\]\[data-menu-visible="false"\]\[data-table-visible="false"\]/);
});

test('the unloaded map image has no source and remains hidden', () => {
    const mapImageTag = indexHtml.match(/<img id="mapImage"[^>]*>/)?.[0] || '';
    assert.match(mapImageTag, /\shidden(?:\s|>)/);
    assert.doesNotMatch(mapImageTag, /\ssrc=/);
});

test('lobby map mode fits the image and suppresses coordinate drawing layers', () => {
    assert.match(indexHtml, /#mapViewport\[data-map-mode="lobby"\][\s\S]{0,180}width:\s*100% !important/);
    assert.match(indexHtml, /#mapViewport\[data-map-mode="lobby"\] canvas[\s\S]{0,80}display:\s*none/);
    assert.match(indexHtml, /id="mapViewport"[^>]+data-map-mode="radar"/);
});

test('footer disclaimer uses the trademark ownership wording', () => {
    assert.match(indexHtml, /所有其他商标、标志及著作权均为其各自所有者所有/);
});
