// Checks every link in the built site (run `npm run build` first).
//   node scripts/check-links.mjs                  internal + external links
//   node scripts/check-links.mjs --internal-only  fast; used before every deploy
//   node scripts/check-links.mjs --issues         also open a GitHub issue
// Exits with code 1 when an internal link is broken.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import site from '../site.config.mjs';
import { ROOT } from './lib/content.mjs';
import { upsertIssue } from './lib/github.mjs';

const OUT = join(ROOT, 'dist');
const internalOnly = process.argv.includes('--internal-only');
const openIssues = process.argv.includes('--issues') || process.argv.includes('--dry-run');
const basePath = new URL(site.url).pathname.replace(/\/$/, '');
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

if (!existsSync(OUT)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? htmlFiles(join(dir, e.name)) : e.name.endsWith('.html') ? [join(dir, e.name)] : []));

const links = new Map(); // url -> Set of pages
const anchors = new Map(); // page path -> Set of ids
for (const file of htmlFiles(OUT)) {
  const page = `/${relative(OUT, file).replace(/index\.html$/, '')}`;
  const html = readFileSync(file, 'utf8');
  anchors.set(page, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  for (const [, href] of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const url = href.replace(/&amp;/g, '&');
    if (/^(tel|sms|mailto):/.test(url)) continue;
    const key = url.startsWith('#') ? `${page}${url}` : url;
    if (!links.has(key)) links.set(key, new Set());
    links.get(key).add(page);
  }
}

const brokenInternal = [];
const external = [];
for (const [url, pages] of links) {
  if (/^https?:\/\//.test(url)) {
    external.push([url, pages]);
    continue;
  }
  const [pathAndQuery, hash] = url.split('#');
  let path = pathAndQuery.split('?')[0];
  if (basePath && path.startsWith(basePath)) path = path.slice(basePath.length) || '/';
  const file = path.endsWith('/') ? join(OUT, path, 'index.html') : join(OUT, path);
  if (!existsSync(file)) brokenInternal.push({ url, pages, reason: 'page does not exist' });
  else if (hash && !anchors.get(path)?.has(hash)) brokenInternal.push({ url, pages, reason: `no element with id="${hash}"` });
}

for (const b of brokenInternal) console.error(`Broken internal link ${b.url} (${b.reason}) on ${[...b.pages].join(', ')}`);
console.log(`Internal links: ${links.size - external.length} checked, ${brokenInternal.length} broken`);

const brokenExternal = [];
const unreachable = [];
if (!internalOnly) {
  for (const [url, pages] of external) {
    if (url.includes('github.com/') && url.includes('/issues/new')) continue;
    let status = 0;
    let error = '';
    for (let attempt = 1; attempt <= 2 && !status; attempt++) {
      try {
        const res = await fetch(url, { headers: { 'user-agent': BROWSER_UA, accept: 'text/html' }, redirect: 'follow', signal: AbortSignal.timeout(30000) });
        status = res.status;
        await res.body?.cancel();
      } catch (err) {
        error = err.message;
      }
    }
    if (status === 404 || status === 410) brokenExternal.push({ url, pages, reason: `HTTP ${status}` });
    else if (!status || status >= 400) unreachable.push({ url, pages, reason: status ? `HTTP ${status}` : error });
  }
  for (const b of brokenExternal) console.error(`Broken external link ${b.url} (${b.reason}) on ${[...b.pages].join(', ')}`);
  for (const b of unreachable) console.warn(`Could not check ${b.url} (${b.reason})`);
  console.log(`External links: ${external.length} checked, ${brokenExternal.length} broken, ${unreachable.length} could not be checked`);

  if (openIssues && (brokenExternal.length || brokenInternal.length)) {
    const list = (items) => items.map((b) => `- ${b.url} (${b.reason})\n  on ${[...b.pages].map((p) => `${site.url}${p}`).join(', ')}`).join('\n');
    upsertIssue({
      label: 'link-problem',
      onExisting: 'skip',
      title: 'Broken links on Waypoint',
      body: [
        'The link check found links that no longer work.',
        '',
        ...(brokenExternal.length ? ['### Links to other websites', list(brokenExternal), ''] : []),
        ...(brokenInternal.length ? ['### Links between our own pages', list(brokenInternal), ''] : []),
        ...(unreachable.length ? ['### Could not be checked this time (may be temporary)', list(unreachable), ''] : []),
        'Find the new address on the official website, update the link in `content/` and close this issue.',
      ].join('\n'),
    });
  }
}

if (brokenInternal.length) process.exit(1);
