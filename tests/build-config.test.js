import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import obfuscatorOptions from '../obfuscator.config.mjs';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const buildSource = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');

test('npm build and preview target the production pipeline', () => {
    assert.equal(packageJson.scripts.build, 'node ./scripts/build.mjs');
    assert.match(packageJson.scripts.preview, /--root dist/);
    assert.match(indexHtml, /<script type="module" data-app-bootstrap>/);
});

test('obfuscation profile raises reading cost without fragile browser traps', () => {
    assert.equal(obfuscatorOptions.target, 'browser-no-eval');
    assert.equal(obfuscatorOptions.controlFlowFlattening, true);
    assert.equal(obfuscatorOptions.deadCodeInjection, true);
    assert.deepEqual(obfuscatorOptions.stringArrayEncoding, ['rc4']);
    assert.equal(obfuscatorOptions.selfDefending, true);
    assert.equal(obfuscatorOptions.sourceMap, false);
    assert.equal(obfuscatorOptions.renameGlobals, false);
    assert.equal(obfuscatorOptions.renameProperties, false);
    assert.equal(obfuscatorOptions.debugProtection, false);
    assert.equal(obfuscatorOptions.disableConsoleOutput, false);
});

test('build output is an IIFE with no source maps and replaces the source bootstrap', () => {
    assert.match(buildSource, /format: 'iife'/);
    assert.match(buildSource, /sourcemap: false/);
    assert.match(buildSource, /sourceMappingURL/);
    assert.match(buildSource, /app\.\$\{contentHash\}\.js/);
    assert.match(buildSource, /createHash\('sha256'\)/);
    assert.match(buildSource, /bootstrapPattern/);
});
