import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const generatedCss = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const controlsSource = await readFile(new URL('../src/ui/controls.js', import.meta.url), 'utf8');

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

test('manual connection fields use the requested labels and keep the websocket path lowercase', () => {
    assert.match(indexHtml, /data-i18n="config\.host">IP地址 \/ 域名</);
    assert.match(indexHtml, /data-i18n="config\.path">路径\(默认 \/ws\)</);
    assert.doesNotMatch(indexHtml, /data-i18n="config\.path"[^>]*uppercase/);
    assert.doesNotMatch(indexHtml, /conf_protocol_readonly/);
});

test('player list visibility moved from menu checkbox to top controls', () => {
    assert.doesNotMatch(indexHtml, /id="conf_table_visible"/);
    assert.match(indexHtml, /id="playerTableVisibleToggle"/);
});

test('menu exposes opt-in local-team anonymity and no removed vitals options', () => {
    const togglesPosition = indexHtml.indexOf('data-i18n="config.toggles"');
    const anonymityPosition = indexHtml.indexOf('id="conf_anonymizelocalteam"');
    const teamPosition = indexHtml.indexOf('id="conf_showteam"');
    const namePosition = indexHtml.indexOf('id="conf_showname"');
    const fontSizePosition = indexHtml.indexOf('id="conf_fontsize"');
    assert.match(indexHtml, /id="conf_anonymizelocalteam"[^>]+data-setting="anonymizeLocalTeam"/);
    assert.match(indexHtml, /id="conf_showteam"[^>]+data-setting="showTeam"/);
    assert.doesNotMatch(indexHtml, /conf_showvitals|conf_showhealth|conf_showshield/);
    assert.ok(anonymityPosition > togglesPosition);
    assert.ok(teamPosition > togglesPosition);
    assert.ok(namePosition > teamPosition);
    assert.ok(fontSizePosition > teamPosition);
});

test('removed backend fields have no menu or table controls', () => {
    assert.doesNotMatch(indexHtml, /data-i18n="config\.filters"/);
    assert.doesNotMatch(indexHtml, /id="conf_showdead"|id="conf_showdown"/);
    assert.doesNotMatch(indexHtml, /data-setting="tableVitals"|data-setting="tableDown"/);
    assert.doesNotMatch(indexHtml, /data-setting="tableRoster"/);
    assert.doesNotMatch(indexHtml, /data-setting="tableDistance"|data-i18n="table\.columns\.distance"/);
    assert.doesNotMatch(indexHtml, /tableMaxShield|tableShield|tableHp|tableSquad/);
});

test('player table columns and field toggles use the requested display order', () => {
    const expectedOrder = [
        'table.columns.team',
        'table.columns.name',
        'table.columns.legend',
        'table.columns.rank',
        'table.columns.level',
        'table.columns.damage',
        'table.columns.kills',
        'table.columns.uid',
        'table.columns.uidLong',
        'table.columns.dead'
    ];
    const liveColumnsSource = controlsSource.slice(
        controlsSource.indexOf('const columns = ['),
        controlsSource.indexOf('function tableRenderSignature')
    );
    const columnIndexes = expectedOrder.map((key) => liveColumnsSource.indexOf(`label: '${key}'`));
    assert.deepEqual(columnIndexes, [...columnIndexes].sort((a, b) => a - b));
    assert.ok(columnIndexes.every((index) => index >= 0));

    const toggleIndexes = expectedOrder.map((key) => indexHtml.indexOf(`data-i18n="${key}"`));
    assert.deepEqual(toggleIndexes, [...toggleIndexes].sort((a, b) => a - b));
    assert.ok(toggleIndexes.every((index) => index >= 0));
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

test('table icon images load eagerly so hidden fallback images still request assets', () => {
    assert.match(controlsSource, /image\.loading = 'eager'/);
    assert.doesNotMatch(controlsSource, /image\.loading = 'lazy'/);
    assert.match(controlsSource, /image\.className = 'size-5 shrink-0 object-contain'/);
});

test('table reuses keyed rows and replaces only visibly changed cells', () => {
    assert.match(controlsSource, /let lastTableRenderSignature = null/);
    assert.match(controlsSource, /const signature = tableRenderSignature\(sortedPlayers, activeColumns\)/);
    assert.match(controlsSource, /if \(signature === lastTableRenderSignature\) return false/);
    assert.match(controlsSource, /const tableRowsByPlayerId = new Map\(\)/);
    assert.match(controlsSource, /currentCell\.element\.replaceWith\(nextElement\)/);
    assert.match(controlsSource, /tableRowsByPlayerId\.get\(player\.id\)/);
    assert.match(controlsSource, /placeTableRows\(rows\)/);
    assert.match(controlsSource, /if \(columnsChanged \|\| playerSetChanged \|\| previousPlayerIds\.size > 0\)/);
});

test('player table headers stay visible inside the scrolling table viewport', () => {
    assert.match(indexHtml, /\.player-table thead th\s*\{[\s\S]{0,160}position:\s*sticky/);
    assert.match(indexHtml, /\.player-table thead th\s*\{[\s\S]{0,160}top:\s*0/);
    assert.match(indexHtml, /\.player-table thead th\s*\{[\s\S]{0,160}z-index:\s*2/);
});

test('image-only map mode fits the image and suppresses coordinate drawing layers', () => {
    assert.match(indexHtml, /#mapViewport\[data-map-mode="image"\][\s\S]{0,180}width:\s*100% !important/);
    assert.match(indexHtml, /#mapStage\[data-map-mode="image"\] #mapCanvas[\s\S]{0,80}display:\s*none/);
    assert.match(indexHtml, /id="mapViewport"[^>]+data-map-mode="radar"/);
});

test('canvas layers are siblings of the transformed map image', () => {
    const viewportStart = indexHtml.indexOf('<div id="mapViewport"');
    const viewportEnd = indexHtml.indexOf('</div>', viewportStart);
    const zoneCanvas = indexHtml.indexOf('<canvas id="mapZoneCanvas"');
    const playerCanvas = indexHtml.indexOf('<canvas id="mapCanvas"');
    assert.ok(viewportStart >= 0 && viewportEnd >= 0);
    assert.ok(zoneCanvas > viewportEnd);
    assert.ok(playerCanvas > zoneCanvas);
});

test('footer disclaimer uses the trademark ownership wording', () => {
    assert.match(indexHtml, /所有其他商标、标志及著作权均为其各自所有者所有/);
});
