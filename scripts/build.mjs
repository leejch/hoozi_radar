import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { build as bundle } from 'esbuild';
import JavaScriptObfuscator from 'javascript-obfuscator';

import obfuscatorOptions from '../obfuscator.config.mjs';

const execFileAsync = promisify(execFile);
const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const outputRoot = resolve(repositoryRoot, 'dist');
const outputAssets = join(outputRoot, 'assets');
const bootstrapPattern = /<script\s+type="module"\s+data-app-bootstrap>[\s\S]*?<\/script>/;

function assertInsideRepository(path) {
    const prefix = repositoryRoot.endsWith(sep) ? repositoryRoot : `${repositoryRoot}${sep}`;
    if (path !== repositoryRoot && !path.startsWith(prefix)) {
        throw new Error(`Refusing to access a path outside the repository: ${path}`);
    }
}

async function buildCss() {
    const cli = join(repositoryRoot, 'node_modules', '@tailwindcss', 'cli', 'dist', 'index.mjs');
    await execFileAsync(process.execPath, [cli, '-i', './input.css', '-o', './dist/styles.css', '--minify'], {
        cwd: repositoryRoot
    });
}

async function buildJavaScript() {
    const result = await bundle({
        absWorkingDir: repositoryRoot,
        entryPoints: ['./src/main.js'],
        bundle: true,
        charset: 'utf8',
        format: 'iife',
        legalComments: 'none',
        minify: true,
        platform: 'browser',
        sourcemap: false,
        target: ['es2018'],
        treeShaking: true,
        write: false
    });
    const bundledFile = result.outputFiles[0];
    if (!bundledFile) throw new Error('esbuild did not produce a JavaScript bundle');

    const obfuscated = JavaScriptObfuscator.obfuscate(bundledFile.text, obfuscatorOptions).getObfuscatedCode();
    if (!obfuscated || /sourceMappingURL/.test(obfuscated)) {
        throw new Error('Obfuscation produced an empty bundle or an unexpected source map reference');
    }
    const contentHash = createHash('sha256').update(obfuscated).digest('hex').slice(0, 12);
    const fileName = `app.${contentHash}.js`;
    const outputFile = join(outputAssets, fileName);
    await writeFile(outputFile, obfuscated, 'utf8');
    return {
        fileName,
        inputBytes: Buffer.byteLength(bundledFile.text),
        outputBytes: Buffer.byteLength(obfuscated)
    };
}

async function buildHtml(scriptFileName) {
    const source = await readFile(join(repositoryRoot, 'index.html'), 'utf8');
    if (!bootstrapPattern.test(source)) throw new Error('index.html is missing the production bootstrap marker');
    const production = source.replace(
        bootstrapPattern,
        `<script defer src="./assets/${scriptFileName}"></script>`
    );
    await writeFile(join(outputRoot, 'index.html'), production, 'utf8');
}

async function main() {
    assertInsideRepository(outputRoot);
    await rm(outputRoot, { recursive: true, force: true });
    await mkdir(outputAssets, { recursive: true });

    await Promise.all([
        buildCss(),
        cp(join(repositoryRoot, 'static'), join(outputRoot, 'static'), { recursive: true }),
        cp(join(repositoryRoot, 'res'), join(outputRoot, 'res'), { recursive: true })
    ]);
    const bundleSizes = await buildJavaScript();
    await buildHtml(bundleSizes.fileName);

    const indexSize = (await stat(join(outputRoot, 'index.html'))).size;
    console.log(`Built ${relative(repositoryRoot, outputRoot)} for production`);
    console.log(`JavaScript: ${bundleSizes.inputBytes} bundled bytes -> ${bundleSizes.outputBytes} obfuscated bytes`);
    console.log(`Entry: assets/${bundleSizes.fileName}`);
    console.log(`HTML: ${indexSize} bytes; CSS, static assets, and res icons copied`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
