// Serves the production build the way GitHub Pages does, for the Playwright tests.
//
//   An existing file                        -> the file
//   A folder (/, /en/)                      -> its index.html; without its trailing
//                                              slash (/en), a 301 to it first
//   An extensionless path with a .html file -> that file (/stay, /en/stay: stay.html)
//   Anything else                           -> 404.html (the not-found page), status 404
//
// Text is gzipped when the browser accepts it, as GitHub Pages does: speed
// measurements (Lighthouse CI) would otherwise measure this server.
//
// Run after `ng build` and `node scripts/finish-static-build.mjs`; `npm run e2e` does it for you.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { createGzip } from 'node:zlib';

const root = join('dist', 'studio-sauze', 'browser');
// The port: PORT, or the first argument (Lighthouse CI uses 4301), or 4300.
const port = Number(process.env['PORT'] ?? process.argv[2] ?? 4300);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

/** Images and fonts are compressed already; gzip only helps text. */
const compressible = /^(text\/|application\/(json|xml)|image\/svg\+xml)/;

if (!existsSync(join(root, '404.html'))) {
  console.error(`${root}/404.html not found: run ng build, then scripts/finish-static-build.mjs.`);
  process.exit(1);
}

const isFile = (path) => existsSync(path) && statSync(path).isFile();

/** The file GitHub Pages would answer with and its status, or where it redirects. */
function resolve(urlPath) {
  // normalize() folds any `..`; a path that still escapes the root is not served.
  const local = normalize(join(root, decodeURIComponent(urlPath)));
  if (local === root || local.startsWith(root + sep)) {
    if (isFile(local)) return [local, 200];
    if (isFile(join(local, 'index.html'))) {
      return urlPath.endsWith('/') ? [join(local, 'index.html'), 200] : [`${urlPath}/`, 301];
    }
    if (isFile(`${local}.html`)) return [`${local}.html`, 200];
  }
  return [join(root, '404.html'), 404];
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  const [file, status] = resolve(url.pathname);
  if (status === 301) {
    response.writeHead(301, { Location: file + url.search }).end();
    return;
  }
  const contentType = contentTypes[extname(file)] ?? 'application/octet-stream';
  const gzip =
    compressible.test(contentType) && /\bgzip\b/.test(request.headers['accept-encoding'] ?? '');
  response.writeHead(status, {
    'Content-Type': contentType,
    Vary: 'Accept-Encoding',
    ...(gzip && { 'Content-Encoding': 'gzip' }),
  });
  const body = createReadStream(file);
  (gzip ? body.pipe(createGzip()) : body).pipe(response);
}).listen(port, () => console.log(`Serving ${root} on http://localhost:${port}/`));
