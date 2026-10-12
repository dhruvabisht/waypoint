// Local preview: builds the site, serves dist/ on http://localhost:8080 and
// rebuilds when content/, src/ or site.config.mjs change.
//   npm run dev
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, extname, normalize } from 'node:path';
import { ROOT } from './lib/content.mjs';

const OUT = join(ROOT, 'dist');

const PORT = Number(process.env.PORT) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

// Build in a fresh process each time so edited templates are picked up.
function rebuild() {
  spawnSync(process.execPath, [join(ROOT, 'scripts', 'build.mjs')], { stdio: 'inherit' });
}

rebuild();

let timer;
for (const dir of ['content', 'src', 'scripts']) {
  watch(join(ROOT, dir), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(rebuild, 150);
  });
}

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = normalize(join(OUT, path));
  if (!file.startsWith(OUT)) {
    res.writeHead(403).end();
    return;
  }
  if (path.endsWith('/')) file = join(file, 'index.html');
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    try {
      // Mirror GitHub Pages: /stamps redirects to /stamps/, unknown paths get 404.html.
      await readFile(join(file, 'index.html'));
      res.writeHead(301, { location: `${path}/` }).end();
    } catch {
      res.writeHead(404, { 'content-type': TYPES['.html'] });
      res.end(await readFile(join(OUT, '404.html')).catch(() => 'Not found'));
    }
  }
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}`));
