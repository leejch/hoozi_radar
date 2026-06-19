import { spawn } from 'node:child_process';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 8080);
const shouldOpen = process.argv.includes('--open');

const contentTypes = new Map([
    ['.css', 'text/css; charset=utf-8'],
    ['.html', 'text/html; charset=utf-8'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.mjs', 'text/javascript; charset=utf-8'],
    ['.png', 'image/png'],
    ['.svg', 'image/svg+xml; charset=utf-8'],
    ['.txt', 'text/plain; charset=utf-8']
]);

function openBrowser(url) {
    const commands = {
        win32: ['cmd.exe', ['/c', 'start', '', url]],
        darwin: ['open', [url]],
        linux: ['xdg-open', [url]]
    };
    const command = commands[process.platform];
    if (!command) return;
    const child = spawn(command[0], command[1], { detached: true, stdio: 'ignore' });
    child.unref();
}

function resolveRequestPath(requestUrl) {
    let pathname;
    try {
        pathname = decodeURIComponent(new URL(requestUrl || '/', 'http://localhost').pathname);
    } catch {
        return null;
    }
    const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const absolutePath = resolve(projectRoot, requested);
    const rootPrefix = projectRoot.endsWith(sep) ? projectRoot : `${projectRoot}${sep}`;
    return absolutePath === projectRoot || absolutePath.startsWith(rootPrefix) ? absolutePath : null;
}

const server = createServer((request, response) => {
    const filePath = resolveRequestPath(request.url);
    if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
    }

    response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': contentTypes.get(extname(filePath).toLowerCase()) || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff'
    });
    createReadStream(filePath).pipe(response);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Set another port with: $env:PORT=8081; npm run serve`);
    } else {
        console.error(error);
    }
    process.exitCode = 1;
});

server.listen(port, host, () => {
    const url = `http://${host}:${port}/`;
    console.log(`HOOZi radar: ${url}`);
    console.log('Press Ctrl+C to stop the server.');
    if (shouldOpen) openBrowser(url);
});
