import { html, raw, jsonScript } from '../scripts/lib/html.mjs';

export const icons = {
  logo: raw('<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><rect x="1" y="1" width="26" height="26" rx="8" fill="#0B5D4B"/><path d="M8 18l6-10 6 10M10.5 14h7" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'),
  home: raw('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>'),
  stamps: raw('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M9 17h6"/></svg>'),
  work: raw('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>'),
  help: raw('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/></svg>'),
  search: raw('<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'),
  chevron: raw('<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'),
  external: raw('<svg class="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>'),
  student: raw('<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9l10-5 10 5-10 5-10-5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/></svg>'),
  briefcase: raw('<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>'),
  pin: raw('<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'),
  info: raw('<svg class="ico" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>'),
  alert: raw('<svg class="ico" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>'),
  check: raw('<svg class="ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>'),
  phone: raw('<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>'),
  message: raw('<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>'),
  locate: raw('<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>'),
};

const NAV = [
  { key: 'home', label: 'Home', path: '/', icon: icons.home },
  { key: 'stamps', label: 'Stamps', path: '/stamps/', icon: icons.stamps },
  { key: 'work', label: 'Work', path: '/work/', icon: icons.work },
  { key: 'help', label: 'Help', path: '/help/', icon: icons.help },
];

export function formatDate(iso) {
  return new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso + 'T00:00:00Z'));
}

export function slugify(text) {
  return text.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function reportUrl(site, pageUrl) {
  const params = new URLSearchParams({ template: 'report-mistake.yml', title: `Mistake on ${pageUrl.replace(site.url, '') || '/'}`, page: pageUrl });
  return `https://github.com/${site.repo}/issues/new?${params}`;
}

// Link to an internal path or an external URL. Item: { href } (internal) or { url } (external).
export function itemLink(item, u) {
  return item.href ? u(item.href) : item.url;
}

export function checkedLine(reviewed) {
  return html`<p class="checked">${icons.check}<span>Checked against official sources on <time datetime="${reviewed}">${formatDate(reviewed)}</time></span></p>`;
}

export function sourcesBlock(page, ctx) {
  const { site, sources } = ctx;
  if (!page.sources?.length) return '';
  const list = [...new Set(page.sources)].map((id) => sources[id]);
  return html`<section class="card pad sources" aria-labelledby="sources-h">
    <h2 id="sources-h" class="h-sm">Where this information comes from</h2>
    <p class="muted">We checked this page against these official pages on <time datetime="${page.reviewed}">${formatDate(page.reviewed)}</time>.</p>
    <ul class="srclist">${list.map((s) => html`<li><a href="${s.url}" rel="external">${s.title}</a><span>${s.publisher}</span></li>`)}</ul>
    <p class="small">This is a summary, not legal advice. Your own letter of permission is the final word.</p>
    <p class="small"><a href="${reportUrl(site, site.url + page.path)}" rel="external">Report a mistake on this page</a></p>
  </section>`;
}

function structuredData(page, ctx) {
  const { site, sources } = ctx;
  const url = site.url + page.path;
  const website = { '@type': 'WebSite', '@id': `${site.url}/#website`, name: site.name, url: `${site.url}/`, inLanguage: site.lang, description: 'An independent, plain-English guide to Irish immigration stamps, work rights, registration and help.' };
  const graph = [];
  if (page.path === '/') {
    graph.push(website);
  } else {
    graph.push({
      '@type': 'WebPage',
      '@id': url,
      url,
      name: page.title,
      description: page.description,
      inLanguage: site.lang,
      isPartOf: { '@id': `${site.url}/#website` },
      ...(page.reviewed && { lastReviewed: page.reviewed, dateModified: page.reviewed }),
      ...(page.sources?.length && { citation: [...new Set(page.sources)].map((id) => sources[id].url) }),
      author: { '@type': 'Person', name: site.maintainer.name, url: site.maintainer.url },
    });
  }
  if (page.crumbs) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [{ name: 'Home', path: '/' }, ...page.crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: site.url + c.path })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function layout(page, ctx) {
  const { site, u, asset } = ctx;
  const canonical = site.url + page.path;
  // Google shows roughly 60 characters of a title; only add the brand if it fits.
  const branded = `${page.title} | ${site.name}`;
  const title = page.fullTitle || (branded.length <= 60 ? branded : page.title);
  const ogImage = `${site.url}/assets/img/og-image.png`;
  const current = (key) => (page.nav === key ? raw(' aria-current="page"') : '');

  return html`<!doctype html>
<html lang="${site.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${page.description}">
${page.noindex ? html`<meta name="robots" content="noindex">` : html`<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="#FFFFFF">
<meta name="color-scheme" content="light">
<meta name="format-detection" content="telephone=no">
<script>document.documentElement.classList.add('js')</script>
<link rel="preload" href="${asset('/assets/fonts/atkinson-hyperlegible-400.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${asset('/assets/fonts/source-serif-4-700.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset('/assets/styles.css')}">
<script src="${asset('/assets/app.js')}" defer></script>
<link rel="icon" href="${u('/favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="${u('/assets/img/icon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${u('/assets/img/apple-touch-icon.png')}">
<link rel="manifest" href="${u('/site.webmanifest')}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:title" content="${page.title}">
<meta property="og:description" content="${page.description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Waypoint: your stay in Ireland, explained simply">
<meta name="twitter:card" content="summary_large_image">
${site.googleSiteVerification && html`<meta name="google-site-verification" content="${site.googleSiteVerification}">`}
${site.bingSiteVerification && html`<meta name="msvalidate.01" content="${site.bingSiteVerification}">`}
<script type="application/ld+json">${jsonScript(structuredData(page, ctx))}</script>
</head>
<body class="${page.bodyClass || ''}">
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <div class="topin">
    <a class="brand" href="${u('/')}">${icons.logo}<span>Waypoint</span></a>
    <nav class="topnav" aria-label="Main">
      ${NAV.map((n) => html`<a class="topbtn" href="${u(n.path)}"${current(n.key)}>${n.label}</a>`)}
    </nav>
    <a class="sosmini" href="${u('/emergency/')}"${page.nav === 'sos' ? raw(' aria-current="page"') : ''}><span class="vh">Emergency help: </span>SOS</a>
  </div>
</header>
<p class="concept">Independent guide. Not an official government service.</p>
<main id="main" class="wrap${page.narrow ? ' narrow' : ''}">
${page.body}
${sourcesBlock(page, ctx)}
</main>
<footer class="sitefoot">
  <nav aria-label="Footer">
    <a href="${u('/about/')}">About</a>
    <a href="${u('/about/')}#how-we-keep-it-correct">How we check</a>
    <a href="${u('/privacy/')}">Privacy</a>
    <a href="${reportUrl(site, canonical)}" rel="external">Report a mistake</a>
  </nav>
  <p>Waypoint is an independent guide. It is not legal advice and not a government service.</p>
</footer>
<nav class="nav" aria-label="Main">
  ${NAV.map((n) => html`<a class="navbtn" href="${u(n.path)}"${current(n.key)}>${n.icon}<span>${n.label}</span></a>`)}
</nav>
</body>
</html>
`;
}
