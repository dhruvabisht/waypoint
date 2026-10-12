// Builds the static site into dist/.
//   node scripts/build.mjs
// SITE_URL (set by the deploy workflow) controls canonical URLs and the base
// path, e.g. https://dhruvabisht.github.io/waypoint
import { mkdirSync, rmSync, writeFileSync, readFileSync, cpSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import site from '../site.config.mjs';
import { ROOT, loadContent, validate } from './lib/content.mjs';
import { layout } from '../src/layout.mjs';
import * as pages from '../src/pages.mjs';

export const OUT = join(ROOT, 'dist');
const SRC = join(ROOT, 'src');

export function build() {
  const content = loadContent();
  const { errors, warnings } = validate(content, { reviewIntervalDays: site.reviewIntervalDays });
  for (const w of warnings) console.warn(`warning: ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`error: ${e}`);
    throw new Error(`${errors.length} content error(s). Nothing was built.`);
  }

  rmSync(OUT, { recursive: true, force: true });
  cpSync(join(SRC, 'assets'), join(OUT, 'assets'), { recursive: true });
  cpSync(join(SRC, 'static'), OUT, { recursive: true });

  const basePath = new URL(site.url).pathname.replace(/\/$/, '');
  const u = (path) => basePath + path;
  const hashes = {};
  const asset = (path) => {
    hashes[path] ??= createHash('sha256').update(readFileSync(join(SRC, path))).digest('hex').slice(0, 10);
    return `${u(path)}?v=${hashes[path]}`;
  };
  const ctx = { site, u, asset, sources: content.sources };

  const list = [
    pages.homePage(content, ctx),
    pages.stampsPage(content, ctx),
    ...content.stamps.map((s) => pages.stampPage(s, content, ctx)),
    pages.workPage(content, ctx),
    pages.permitsPage(content, ctx),
    pages.registerPage(content, ctx),
    pages.helpHubPage(content, ctx),
    ...content.help.audiences.map((a) => pages.audiencePage(a, content, ctx)),
    pages.emergencyPage(content, ctx),
    pages.aboutPage(content, ctx),
    pages.privacyPage(content, ctx),
    pages.notFoundPage(content, ctx),
  ];

  for (const page of list) {
    const file = page.path.endsWith('/') ? join(OUT, page.path, 'index.html') : join(OUT, page.path);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, layout(page, ctx).toString());
  }

  const newest = list.map((p) => p.reviewed).filter(Boolean).sort().at(-1);
  const urls = list
    .filter((p) => !p.noindex)
    .map((p) => {
      const lastmod = p.reviewed || (p.path === '/' ? newest : null);
      return `  <url><loc>${site.url}${p.path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
    });
  writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
  writeFileSync(
    join(OUT, 'site.webmanifest'),
    JSON.stringify(
      {
        name: `${site.name}: ${site.tagline}`,
        short_name: site.name,
        description: 'A plain-English guide to Irish immigration stamps, work rights, registration and help.',
        lang: site.lang,
        start_url: u('/'),
        scope: u('/'),
        display: 'standalone',
        background_color: '#F5F6F2',
        theme_color: '#FFFFFF',
        icons: [
          { src: u('/assets/img/icon-192.png'), sizes: '192x192', type: 'image/png' },
          { src: u('/assets/img/icon-512.png'), sizes: '512x512', type: 'image/png' },
          { src: u('/assets/img/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      null,
      2,
    ),
  );

  return { pages: list.length, warnings: warnings.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = build();
    console.log(`Built ${result.pages} pages into dist/ for ${site.url}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
