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
    assert.match(indexHtml, /id="viewModeFollow"[\s\S]{0,180}data-selected="true"/);
    assert.match(generatedCss, /\[data-selected="true"\]/);
});
