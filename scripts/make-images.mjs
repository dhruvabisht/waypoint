// Renders the app icons and the social sharing image (og-image.png) with
// headless Chrome. Run it again after changing the logo or the tagline:
//   npm run images
// Needs Google Chrome installed (set CHROME=/path/to/chrome to override).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './lib/content.mjs';

const CHROME =
  process.env.CHROME ||
  ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(existsSync);
if (!CHROME) throw new Error('Chrome not found. Set CHROME=/path/to/chrome');

const IMG = join(ROOT, 'src', 'assets', 'img');
const FONTS = pathToFileURL(join(ROOT, 'src', 'assets', 'fonts')).href;
const tmp = mkdtempSync(join(tmpdir(), 'waypoint-img-'));

const mark = (size, inset = 0) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${-inset} ${-inset} ${28 + inset * 2} ${28 + inset * 2}">
    ${inset ? `<rect x="${-inset}" y="${-inset}" width="${28 + inset * 2}" height="${28 + inset * 2}" fill="#0B5D4B"/>` : ''}
    <rect x="${inset ? 0 : 1}" y="${inset ? 0 : 1}" width="${inset ? 28 : 26}" height="${inset ? 28 : 26}" rx="${inset ? 0 : 8}" fill="#0B5D4B"/>
    <path d="M8 18l6-10 6 10M10.5 14h7" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

function shoot(name, width, height, body) {
  const file = join(tmp, `${name}.html`);
  writeFileSync(
    file,
    `<!doctype html><html><head><meta charset="utf-8"><style>
      @font-face { font-family: 'Atkinson Hyperlegible'; font-weight: 400; src: url('${FONTS}/atkinson-hyperlegible-400.woff2'); }
      @font-face { font-family: 'Atkinson Hyperlegible'; font-weight: 700; src: url('${FONTS}/atkinson-hyperlegible-700.woff2'); }
      @font-face { font-family: 'Source Serif 4'; font-weight: 700; src: url('${FONTS}/source-serif-4-700.woff2'); }
      html, body { margin: 0; width: ${width}px; height: ${height}px; overflow: hidden; }
      body > svg { display: block; }
    </style></head><body>${body}</body></html>`,
  );
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    '--virtual-time-budget=2000',
    `--window-size=${width},${height}`,
    `--screenshot=${join(IMG, `${name}.png`)}`,
    pathToFileURL(file).href,
  ], { stdio: 'ignore' });
  console.log(`wrote src/assets/img/${name}.png`);
}

shoot('icon-32', 32, 32, mark(32));
shoot('apple-touch-icon', 180, 180, mark(180, 2));
shoot('icon-192', 192, 192, mark(192));
shoot('icon-512', 512, 512, mark(512));
shoot('icon-maskable-512', 512, 512, mark(512, 7));
shoot(
  'og-image',
  1200,
  630,
  `<div style="box-sizing:border-box;width:1200px;height:630px;padding:72px 80px;background:#F5F6F2;display:flex;flex-direction:column;justify-content:space-between;font-family:'Atkinson Hyperlegible',sans-serif;color:#14211D">
    <div style="display:flex;align-items:center;gap:18px;font-weight:700;font-size:40px">${mark(64)}Waypoint</div>
    <div style="font-family:'Source Serif 4',Georgia,serif;font-weight:700;font-size:84px;line-height:1.08;max-width:960px">Your stay in Ireland, explained simply.</div>
    <div style="display:flex;gap:14px;font-size:30px;font-weight:700;color:#0B5D4B">
      ${['Stamps', 'Work rights', 'Registering', 'Help'].map((t) => `<span style="padding:10px 22px;border-radius:999px;background:#E3EFEA">${t}</span>`).join('')}
    </div>
  </div>`,
);

rmSync(tmp, { recursive: true, force: true });
