import { html, jsonScript } from '../scripts/lib/html.mjs';
import { icons, checkedLine, slugify, itemLink } from './layout.mjs';

const BADGE_MARK = { yes: '✓', lim: '◐', no: '✕' };

const oldest = (dates) => dates.filter(Boolean).sort()[0];

function badge(stamp) {
  return html`<span class="badge badge-${stamp.kind}"><span aria-hidden="true">${BADGE_MARK[stamp.kind]}</span> ${stamp.badge}</span>`;
}

function back(u, path, label) {
  return html`<a class="back" href="${u(path)}">← ${label}</a>`;
}

function row(item, u) {
  const href = itemLink(item, u);
  const inner = item.sub ? html`<span><strong>${item.name}</strong><small>${item.sub}</small></span>` : html`<span>${item.name}</span>`;
  if (!href) return html`<div class="row">${inner}</div>`;
  const ext = Boolean(item.url);
  return html`<a class="row" href="${href}"${ext ? html` rel="external"` : ''}>${inner}${ext ? icons.external : icons.chevron}</a>`;
}

function linkButton(link, u, cls = 'btn-secondary') {
  const ext = Boolean(link.url);
  return html`<a class="${cls}" href="${itemLink(link, u)}"${ext ? html` rel="external"` : ''}>${link.label}${ext ? html` <span class="vh">(official site)</span>` : ''}</a>`;
}

// A block of sourced facts from content/*.json.
function factSection(s, u, opts = {}) {
  const id = slugify(s.heading);
  return html`<section class="card pad" id="${id}" aria-labelledby="${id}-h">
    <h2 id="${id}-h" class="h-md">${s.heading}</h2>
    ${s.body && html`<p>${s.body}</p>`}
    ${s.steps && html`<ol class="steps">${s.steps.map((x) => html`<li>${x}</li>`)}</ol>`}
    ${s.list && html`<ul class="bullets">${s.list.map((x) => html`<li>${x}</li>`)}</ul>`}
    ${s.warning && html`<p class="note warn">${icons.alert}<span>${s.warning}</span></p>`}
    ${opts.extra}
    ${s.link && linkButton(s.link, u)}
  </section>`;
}

function stampTile(s, u) {
  return html`<a class="snum" href="${u(`/stamps/${s.slug}/`)}"><span class="vh">Stamp </span>${s.id}</a>`;
}

function searchIndex(content) {
  const entries = content.stamps.map((s) => ({
    label: s.name,
    sub: s.badge,
    keys: `stamp ${s.id} stamp${s.id} ${s.summary} ${s.who.join(' ')}`,
    path: `/stamps/${s.slug}/`,
  }));
  return entries.concat([
    { label: 'Can I work?', sub: 'Check what your stamp allows', keys: 'work job hours part time permission', path: '/work/' },
    { label: 'Employment permits', sub: 'All 9 permit types', keys: 'permit employment work permit critical skills general intra company transfer', path: '/employment-permits/' },
    { label: 'Register and get your IRP card', sub: 'Burgh Quay, documents, €300 fee', keys: 'register registration irp card gnib burgh quay appointment book booking fee 300 renew renewal', path: '/register/' },
    { label: 'Visas and the 90-day stamp', sub: 'For visitors and tourists', keys: 'visa tourist visit holiday 90 days 3 months landing stamp airport border', path: '/visiting/' },
    { label: 'Lost or stolen passport', sub: 'What to do next', keys: 'passport lost stolen embassy', path: '/visiting/#lost-or-stolen-passport' },
    { label: 'Help for students', sub: 'Registering, PPS number, free advice', keys: 'student college university pps ilep study', path: '/students/' },
    { label: 'Moving here to work or join family', sub: 'Permits, family, free advice', keys: 'family spouse partner husband wife move moving join', path: '/moving-here/' },
    { label: 'Minimum wage', sub: 'What you must be paid', keys: 'minimum wage pay salary money hour', path: '/work/#your-pay' },
    { label: 'Emergency help', sub: 'Call or text 112', keys: 'sos emergency garda gardai police danger help 112 999 ambulance fire', path: '/emergency/' },
  ]);
}

export function homePage(content, ctx) {
  const { u } = ctx;
  const body = html`
  <section class="hero">
    <h1 class="h-xl">Your stay in Ireland, explained simply.</h1>
    <p class="lede">Check what your stamp allows, see if you can work, and find help near you.</p>
    <div class="search js-only" role="search">
      <label for="q" class="label">Search</label>
      <div class="searchbox">${icons.search}<input id="q" type="search" placeholder="Try: Stamp 2, visa, passport" autocomplete="off" enterkeyhint="search" aria-describedby="search-help"></div>
      <p id="search-help" class="vh">Results appear below as you type.</p>
      <div id="search-results" class="box" hidden role="region" aria-label="Search results" aria-live="polite"></div>
      <script type="application/json" id="search-index">${jsonScript(searchIndex(content).map((e) => ({ ...e, href: u(e.path) })))}</script>
    </div>
  </section>

  <section class="stack" aria-labelledby="iam-h">
    <h2 id="iam-h" class="h-md">I am a…</h2>
    <div class="grid3">
      <a class="tile" href="${u('/students/')}"><span class="ticon">${icons.student}</span><span class="tiletext"><strong>International student</strong><span>Stamp 2, work hours, registering</span></span></a>
      <a class="tile" href="${u('/moving-here/')}"><span class="ticon">${icons.briefcase}</span><span class="tiletext"><strong>Working or moving here</strong><span>Permits, family, long-term stay</span></span></a>
      <a class="tile" href="${u('/visiting/')}"><span class="ticon">${icons.pin}</span><span class="tiletext"><strong>Visitor or tourist</strong><span>Visas, 90-day stays, lost passport</span></span></a>
    </div>
  </section>

  <section class="card pad" aria-labelledby="mystamp-h">
    <h2 id="mystamp-h" class="h-md">What does my stamp allow?</h2>
    <p class="muted">Find the stamp number on your IRP card or in your passport. Tap it.</p>
    <div class="stampgrid">${content.stamps.map((s) => stampTile(s, u))}</div>
    <a class="more" href="${u('/stamps/')}">See all stamps side by side →</a>
  </section>

  <section class="box" aria-labelledby="tasks-h">
    <h2 id="tasks-h" class="boxh">Common tasks</h2>
    ${[
      { name: 'Register and get my IRP card', href: '/register/' },
      { name: 'Can I work? Check my permission', href: '/work/' },
      { name: 'Types of employment permit', href: '/employment-permits/' },
      { name: 'Visiting: visas and the 90-day stamp', href: '/visiting/' },
      { name: 'Report a lost or stolen passport', href: '/visiting/#lost-or-stolen-passport' },
    ].map((item) => row(item, u))}
  </section>

  <section class="danger" aria-labelledby="danger-h">
    <h2 id="danger-h" class="h-md">In danger right now?</h2>
    <p>Call 112 or 999. Both numbers reach the Gardaí, ambulance, fire and coast guard.</p>
    <div class="two">
      <a class="btn-danger-ghost" href="tel:112">${icons.phone} Call 112</a>
      <a class="btn-danger" href="${u('/emergency/')}">Emergency help</a>
    </div>
  </section>`;

  return {
    path: '/',
    nav: 'home',
    fullTitle: 'Waypoint: Irish immigration stamps, work and visas explained',
    title: 'Your stay in Ireland, explained simply',
    description: 'A plain-English guide to Irish immigration. Check what your stamp allows, if you can work, how to register for your IRP card, and where to get free help.',
    body,
  };
}

export function stampsPage(content, ctx) {
  const { u } = ctx;
  const stamps = content.stamps;
  const body = html`
  ${back(u, '/', 'Home')}
  <h1 class="h-lg">Immigration stamps</h1>
  <p class="lede">Your stamp shows why you are in Ireland and what you can do here. It is on your IRP card, and sometimes in your passport.</p>
  ${checkedLine(oldest(stamps.map((s) => s.reviewed)))}
  <div class="chips js-only" role="group" aria-label="Filter stamps">
    ${[['all', 'All'], ['work', 'Can work'], ['students', 'Students'], ['family', 'Family']].map(([key, label], i) => html`<button type="button" class="pill" data-filter="${key}" aria-pressed="${i === 0 ? 'true' : 'false'}">${label}</button>`)}
  </div>
  <div class="stgrid" id="stamp-list">
    ${stamps.map((s) => html`<a class="st" href="${u(`/stamps/${s.slug}/`)}" data-tags="${s.tags.join(' ')}">
      <span class="num" aria-hidden="true">${s.id}</span>
      <span class="sttext"><strong>${s.name}</strong><span>${s.summary}</span>${badge(s)}</span>
    </a>`)}
  </div>
  <p class="note warn">${icons.alert}<span>This is a summary. Your own letter of permission is the final word.</span></p>
  <p class="note card">${icons.info}<span>Family member of an EU, EEA, Swiss or UK citizen? Different rules apply to you. <a href="${content.sources['isd-eu-treaty-rights'].url}" rel="external">Read about EU Treaty Rights</a>.</span></p>`;

  return {
    path: '/stamps/',
    nav: 'stamps',
    title: 'Irish immigration stamps explained: Stamp 0 to Stamp 6',
    description: 'Every Irish immigration stamp in plain English: Stamp 0, 1, 1A, 1G, 1H, 2, 2A, 3, 4, 4D, 5 and 6. Who gets each one and whether you can work.',
    crumbs: [{ name: 'Stamps', path: '/stamps/' }],
    sources: [...new Set(stamps.flatMap((s) => s.sources))],
    reviewed: oldest(stamps.map((s) => s.reviewed)),
    body,
  };
}

export function stampPage(stamp, content, ctx) {
  const { u } = ctx;
  const others = content.stamps.filter((s) => s.id !== stamp.id);
  const body = html`
  ${back(u, '/stamps/', 'All stamps')}
  <section class="stamphead">
    <span class="bignum" aria-hidden="true">${stamp.id}</span>
    <div class="stack-sm">
      <h1 class="h-lg">${stamp.name}</h1>
      ${badge(stamp)}
    </div>
  </section>
  <p class="lede">${stamp.summary}</p>
  ${checkedLine(stamp.reviewed)}
  ${stamp.student && html`<div class="two">
    <div class="card stat"><span class="eyebrow">During term</span><strong>20 h</strong><span>per week, at most</span></div>
    <div class="card stat"><span class="eyebrow">Holidays</span><strong>40 h</strong><span>per week, at most</span></div>
  </div>`}
  <section class="result" aria-labelledby="canwork-h">
    <h2 id="canwork-h" class="eyebrow">Can I work on ${stamp.name}?</h2>
    <strong class="result-title">${stamp.work.title}</strong>
    <span>${stamp.work.body}</span>
  </section>
  <section class="card pad" aria-labelledby="means-h">
    <h2 id="means-h" class="h-md">What this means for you</h2>
    <ul class="bullets">${stamp.points.map((p) => html`<li>${p}</li>`)}</ul>
  </section>
  <section class="card pad" aria-labelledby="who-h">
    <h2 id="who-h" class="h-md">Who gets ${stamp.name}</h2>
    <ul class="bullets">${stamp.who.map((p) => html`<li>${p}</li>`)}</ul>
  </section>
  ${stamp.id === '6'
    ? ''
    : html`<section class="card pad" aria-labelledby="reg-h">
    <h2 id="reg-h" class="h-md">Registering</h2>
    <p>Register your permission within 90 days of arriving. The fee is €300, unless you do not have to pay. You then get an Irish Residence Permit (IRP) card by post.</p>
  </section>`}
  <div class="two">
    ${stamp.id === '6' ? '' : html`<a class="btn-primary" href="${u('/register/')}">How to register</a>`}
    <a class="btn-secondary" href="${u(`/work/?stamp=${stamp.id.toLowerCase()}`)}">Can I work?</a>
  </div>
  <nav class="card pad" aria-labelledby="other-h">
    <h2 id="other-h" class="h-sm">Other stamps</h2>
    <div class="stampgrid">${others.map((s) => stampTile(s, u))}</div>
  </nav>`;

  return {
    path: `/stamps/${stamp.slug}/`,
    nav: 'stamps',
    narrow: true,
    title: `${stamp.name} Ireland: meaning, rules and work rights`,
    description: stamp.description,
    crumbs: [{ name: 'Stamps', path: '/stamps/' }, { name: stamp.name, path: `/stamps/${stamp.slug}/` }],
    sources: stamp.sources,
    reviewed: stamp.reviewed,
    body,
  };
}

export function workPage(content, ctx) {
  const { u } = ctx;
  const { work, permits, stamps } = content;
  const answers = Object.fromEntries(stamps.map((s) => [s.id.toLowerCase(), { title: s.work.title, titleHoliday: s.work.titleHoliday, body: s.work.body, href: u(`/stamps/${s.slug}/`), name: s.name }]));
  answers.none = { title: 'Not yet.', body: 'You need a stamp that allows work, or a job offer and an employment permit.', href: u('/employment-permits/'), name: 'employment permits' };
  const two = stamps.find((s) => s.id === '2');

  const body = html`
  <section class="stack-sm">
    <h1 class="h-lg">${work.h1}</h1>
    <p class="lede">${work.lede}</p>
    ${checkedLine(oldest([work.permitNote.reviewed, work.rights.reviewed, ...stamps.map((s) => s.reviewed)]))}
  </section>

  <section class="card pad js-only" id="checker" aria-label="Work checker">
    <fieldset>
      <legend>1. Which stamp do you have?</legend>
      <div class="chips">
        ${stamps.map((s) => html`<label class="pill"><input type="radio" name="stamp" value="${s.id.toLowerCase()}"${s.id === '2' ? html` checked` : ''}><span>${s.name}</span></label>`)}
        <label class="pill"><input type="radio" name="stamp" value="none"><span>No stamp yet</span></label>
      </div>
    </fieldset>
    <fieldset id="holiday-q">
      <legend>2. Is it a college holiday?</legend>
      <div class="chips">
        <label class="pill"><input type="radio" name="period" value="term" checked><span>No, it is term time</span></label>
        <label class="pill"><input type="radio" name="period" value="holiday"><span>Yes, holidays</span></label>
      </div>
    </fieldset>
    <div class="result" role="status" aria-live="polite">
      <span class="eyebrow">Your result</span>
      <strong class="result-title" id="work-title">${two.work.title}</strong>
      <span id="work-body">${two.work.body}</span>
      <a id="work-link" href="${u(`/stamps/${two.slug}/`)}">More about ${two.name} →</a>
    </div>
    <script type="application/json" id="work-data">${jsonScript(answers)}</script>
  </section>

  <section class="box" aria-labelledby="glance-h">
    <h2 id="glance-h" class="boxh">Every stamp at a glance</h2>
    ${stamps.map((s) => html`<a class="row" href="${u(`/stamps/${s.slug}/`)}"><span><strong>${s.name}: ${s.work.title}</strong><small>${s.work.body}</small></span>${icons.chevron}</a>`)}
  </section>

  <p class="note card">${icons.info}<span><strong>${work.permitNote.heading}.</strong> ${work.permitNote.body}</span></p>

  <section class="box" aria-labelledby="permits-h">
    <h2 id="permits-h" class="boxh">Types of employment permit</h2>
    <p class="boxp">There are 9 types. The most common are Critical Skills and General.</p>
    ${row({ name: 'See all 9 types', sub: permits.permits.map((p) => p.name).join(', '), href: '/employment-permits/' }, u)}
  </section>

  <section class="tint" id="your-pay" aria-labelledby="pay-h">
    <h2 id="pay-h" class="h-md">${work.rights.heading}</h2>
    <ul class="bullets">${work.rights.list.map((x) => html`<li>${x}</li>`)}</ul>
    <p>${work.rights.body}</p>
    ${linkButton(work.rights.link, u, 'more')}
  </section>`;

  return {
    path: '/work/',
    nav: 'work',
    narrow: true,
    title: work.title,
    description: work.description,
    crumbs: [{ name: 'Work', path: '/work/' }],
    sources: [...work.permitNote.sources, ...work.rights.sources, ...stamps.flatMap((s) => s.sources)],
    reviewed: oldest([work.permitNote.reviewed, work.rights.reviewed, ...stamps.map((s) => s.reviewed)]),
    body,
  };
}

export function permitsPage(content, ctx) {
  const { u } = ctx;
  const p = content.permits;
  const body = html`
  ${back(u, '/work/', 'Can I work?')}
  <h1 class="h-lg">${p.h1}</h1>
  <p class="lede">${p.lede}</p>
  ${checkedLine(p.reviewed)}
  <p class="note card">${icons.info}<span><strong>${content.work.permitNote.heading}.</strong> ${content.work.permitNote.body}</span></p>
  <section class="box" aria-labelledby="types-h">
    <h2 id="types-h" class="boxh">The 9 types</h2>
    ${p.permits.map((x) => html`<div class="row" id="${slugify(x.name)}"><span><strong>${x.name}</strong><small>${x.sub}</small></span></div>`)}
  </section>
  ${linkButton(p.link, u, 'btn-secondary')}`;

  return {
    path: '/employment-permits/',
    nav: 'work',
    narrow: true,
    title: p.title,
    description: p.description,
    crumbs: [{ name: 'Work', path: '/work/' }, { name: 'Employment permits', path: '/employment-permits/' }],
    sources: [...p.sources, ...content.work.permitNote.sources],
    reviewed: oldest([p.reviewed, content.work.permitNote.reviewed]),
    body,
  };
}

export function registerPage(content, ctx) {
  const { u } = ctx;
  const r = content.register;
  const reviewed = oldest(r.sections.map((s) => s.reviewed));
  const body = html`
  ${back(u, '/', 'Home')}
  <h1 class="h-lg">${r.h1}</h1>
  <p class="lede">${r.lede}</p>
  ${checkedLine(reviewed)}
  <nav class="box" aria-labelledby="toc-h">
    <h2 id="toc-h" class="boxh h-sm">On this page</h2>
    ${r.sections.map((s) => html`<a class="row" href="#${slugify(s.heading)}"><span>${s.heading}</span>${icons.chevron}</a>`)}
  </nav>
  ${r.sections.map((s) => factSection(s, u))}`;

  return {
    path: '/register/',
    nav: 'stamps',
    narrow: true,
    title: r.title,
    description: r.description,
    crumbs: [{ name: 'Register', path: '/register/' }],
    sources: r.sections.flatMap((s) => s.sources),
    reviewed,
    body,
  };
}

function audienceTabs(audiences, activeKey, u) {
  return html`<nav class="segmented" aria-label="Who are you">
    ${audiences.map((a) => html`<a href="${u(`/${a.slug}/`)}"${a.key === activeKey ? html` aria-current="page"` : ''}>${a.tab}</a>`)}
  </nav>`;
}

function numbersBox(content, u, heading = 'Numbers to keep') {
  return html`<section class="box" aria-labelledby="numbers-h">
    <h2 id="numbers-h" class="boxh">${heading}</h2>
    ${content.emergency.numbers.map((n) => html`<a class="tel" href="tel:${n.tel}"><span><strong>${n.name}</strong><small>${n.sub}</small></span><b class="${n.urgent ? 'urgent' : ''}">${n.display}</b></a>`)}
  </section>`;
}

export function helpHubPage(content, ctx) {
  const { u } = ctx;
  const { hub, audiences } = content.help;
  const tileIcon = { students: icons.student, moving: icons.briefcase, visiting: icons.pin };
  const body = html`
  <section class="stack-sm">
    <h1 class="h-lg">${hub.h1}</h1>
    <p class="lede">${hub.lede}</p>
  </section>
  <div class="grid3">
    ${audiences.map((a) => html`<a class="tile" href="${u(`/${a.slug}/`)}"><span class="ticon">${tileIcon[a.key]}</span><span class="tiletext"><strong>${a.h1}</strong><span>${a.lede}</span></span></a>`)}
  </div>
  ${numbersBox(content, u)}
  <a class="btn-danger" href="${u('/emergency/')}">In danger? Get help now</a>`;

  return {
    path: '/help/',
    nav: 'help',
    narrow: true,
    title: hub.title,
    description: hub.description,
    crumbs: [{ name: 'Help', path: '/help/' }],
    sources: content.emergency.numbersSources,
    reviewed: content.emergency.reviewed,
    body,
  };
}

export function audiencePage(audience, content, ctx) {
  const { u } = ctx;
  const all = content.help.audiences;
  const reviewed = oldest([audience.reviewed, ...(audience.sections || []).map((s) => s.reviewed)]);
  const body = html`
  ${back(u, '/help/', 'Help')}
  <h1 class="h-lg">${audience.h1}</h1>
  <p class="lede">${audience.lede}</p>
  ${checkedLine(reviewed)}
  ${audienceTabs(all, audience.key, u)}
  <section class="box" aria-labelledby="where-h">
    <h2 id="where-h" class="boxh">Where to start</h2>
    ${audience.items.map((item) => row(item, u))}
  </section>
  ${(audience.sections || []).map((s) => factSection(s, u))}
  ${audience.key === 'visiting' ? numbersBox(content, u, 'Numbers for visitors') : ''}`;

  return {
    path: `/${audience.slug}/`,
    nav: 'help',
    narrow: true,
    title: audience.title,
    description: audience.description,
    crumbs: [{ name: 'Help', path: '/help/' }, { name: audience.h1, path: `/${audience.slug}/` }],
    sources: [...audience.sources, ...(audience.sections || []).flatMap((s) => s.sources), ...(audience.key === 'visiting' ? content.emergency.numbersSources : [])],
    reviewed,
    body,
  };
}

export function emergencyPage(content, ctx) {
  const { u } = ctx;
  const e = content.emergency;
  const reviewed = oldest([e.reviewed, e.location.reviewed, e.sms.reviewed]);
  const locationTool = html`<div class="js-only stack-sm">
      <button type="button" class="btn-secondary" id="loc-btn">${icons.locate} Show my location</button>
      <div id="loc-out" class="locout" role="status" aria-live="polite" hidden>
        <span class="eyebrow">You are here</span>
        <strong id="loc-coords"></strong>
        <span id="loc-acc"></span>
        <div class="two">
          <button type="button" class="btn-secondary" id="loc-copy">Copy</button>
          <a class="btn-secondary" id="loc-sms" href="sms:112">${icons.message} Text 112</a>
        </div>
      </div>
      <p class="small">Your location stays on your phone. This website does not send it anywhere.</p>
    </div>`;

  const body = html`
  <section class="sos" aria-labelledby="sos-h">
    <h1 id="sos-h" class="h-lg">${e.h1}</h1>
    <p>${e.lede}</p>
    <a class="sosring" href="tel:112"><span><strong>112</strong><span>Tap to call</span></span></a>
    <div class="two">
      <a class="btn-sos-ghost" href="tel:999">${icons.phone} Call 999</a>
      <a class="btn-sos-ghost" href="#${slugify(e.sms.heading)}">${icons.message} Cannot speak?</a>
    </div>
  </section>
  ${checkedLine(reviewed)}
  ${factSection(e.location, u, { extra: locationTool })}
  ${factSection({ ...e.sms }, u, { extra: html`<a class="btn-secondary" href="sms:112">${icons.message} Text 112</a>` })}
  ${numbersBox(content, u)}`;

  return {
    path: '/emergency/',
    nav: 'sos',
    narrow: true,
    title: e.title,
    description: e.description,
    crumbs: [{ name: 'Emergency help', path: '/emergency/' }],
    sources: [...e.location.sources, ...e.sms.sources, ...e.numbersSources],
    reviewed,
    body,
  };
}

export function aboutPage(content, ctx) {
  const { u, site } = ctx;
  const body = html`
  ${back(u, '/', 'Home')}
  <h1 class="h-lg">About Waypoint</h1>
  <p class="lede">Waypoint is an independent guide to Irish immigration rules, written in plain English for people who are new to Ireland.</p>
  <section class="card pad" aria-labelledby="what-h">
    <h2 id="what-h" class="h-md">What Waypoint is, and is not</h2>
    <ul class="bullets">
      <li>It is a free summary of official information, written to be easy to read on a phone.</li>
      <li>It is not a government service. For applications and decisions, use the official websites we link to.</li>
      <li>It is not legal advice. Your own letter of permission is the final word on your conditions.</li>
    </ul>
  </section>
  <section class="card pad" id="how-we-keep-it-correct" aria-labelledby="how-h">
    <h2 id="how-h" class="h-md">How we keep it correct</h2>
    <ol class="steps">
      <li>Every fact comes from an official source. Each page lists its sources at the bottom.</li>
      <li>We check every page against its sources at least every ${site.reviewIntervalDays} days. Each page shows the date it was last checked.</li>
      <li>Twice a week, an automatic check reads the official pages we rely on. When one changes, we are alerted and we review our page.</li>
      <li>The same check makes sure our links to official websites still work.</li>
      <li>Anyone can <a href="https://github.com/${site.repo}/issues/new?template=report-mistake.yml" rel="external">report a mistake</a>.</li>
    </ol>
  </section>
  <section class="card pad" aria-labelledby="who-h">
    <h2 id="who-h" class="h-md">Who runs it</h2>
    <p>Waypoint is made and maintained by <a href="${site.maintainer.url}" rel="external">${site.maintainer.name}</a>. The source code and every change to the content are public on <a href="https://github.com/${site.repo}" rel="external">GitHub</a>.</p>
  </section>
  <section class="card pad" aria-labelledby="a11y-h">
    <h2 id="a11y-h" class="h-md">Accessibility</h2>
    <p>Waypoint uses large text, high contrast and large buttons, and it works with screen readers. The text uses Atkinson Hyperlegible, a typeface designed for people with low vision. If something is hard to use, please <a href="https://github.com/${site.repo}/issues/new?template=report-mistake.yml" rel="external">tell us</a>.</p>
  </section>`;

  return {
    path: '/about/',
    nav: 'help',
    narrow: true,
    title: 'About Waypoint and how we check our information',
    description: 'Waypoint is an independent, plain-English guide to Irish immigration. How we source every fact and keep each page up to date.',
    crumbs: [{ name: 'About', path: '/about/' }],
    body,
  };
}

export function privacyPage(content, ctx) {
  const { u } = ctx;
  const body = html`
  ${back(u, '/', 'Home')}
  <h1 class="h-lg">Privacy</h1>
  <p class="lede">Waypoint does not collect your personal information.</p>
  <section class="card pad" aria-labelledby="p1-h">
    <h2 id="p1-h" class="h-md">What we do not do</h2>
    <ul class="bullets">
      <li>No cookies, no analytics and no advertising.</li>
      <li>No accounts and no forms.</li>
      <li>Searches on this site happen on your device. We never see them.</li>
    </ul>
  </section>
  <section class="card pad" aria-labelledby="p2-h">
    <h2 id="p2-h" class="h-md">Your location</h2>
    <p>On the emergency page, the "Show my location" button asks your phone for your location so you can read it out or text it to 112. It stays on your device. Waypoint does not send it anywhere.</p>
  </section>
  <section class="card pad" aria-labelledby="p3-h">
    <h2 id="p3-h" class="h-md">Hosting</h2>
    <p>Waypoint is hosted on GitHub Pages. GitHub may log visitors' IP addresses for security. Read the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="external">GitHub privacy statement</a>.</p>
  </section>`;

  return {
    path: '/privacy/',
    nav: 'help',
    narrow: true,
    title: 'Privacy',
    description: 'Waypoint uses no cookies, analytics or tracking. Your location on the emergency page stays on your device.',
    crumbs: [{ name: 'Privacy', path: '/privacy/' }],
    body,
  };
}

export function notFoundPage(content, ctx) {
  const { u } = ctx;
  const body = html`
  <h1 class="h-lg">Page not found</h1>
  <p class="lede">This page does not exist, or it has moved.</p>
  <div class="two">
    <a class="btn-primary" href="${u('/')}">Go to the home page</a>
    <a class="btn-secondary" href="${u('/stamps/')}">See all stamps</a>
  </div>
  <section class="danger" aria-labelledby="danger-h">
    <h2 id="danger-h" class="h-md">In danger right now?</h2>
    <p>Call 112 or 999.</p>
    <a class="btn-danger" href="tel:112">${icons.phone} Call 112</a>
  </section>`;
  return { path: '/404.html', nav: '', noindex: true, narrow: true, title: 'Page not found', description: 'This page does not exist.', body };
}

