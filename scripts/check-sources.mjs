// Freshness check, run twice a week by .github/workflows/check-sources.yml.
//
// 1. Reads every official page listed in content/sources.json, turns it into
//    plain text and compares its fingerprint with the one in
//    monitor/state.json. When the wording changes, it reports which Waypoint
//    pages rely on that source, and exactly what changed if last week's text
//    is still in monitor/snapshots/ (kept in the private GitHub Actions cache,
//    not in the repository, because it is other organisations' text).
// 2. Lists content that is due to be re-checked: older than the review
//    interval in site.config.mjs, or past a known change date ("reviewBy").
//
//   node scripts/check-sources.mjs            report only (and update snapshots)
//   node scripts/check-sources.mjs --issues   also open GitHub issues
//   node scripts/check-sources.mjs --dry-run  print the issues instead
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import site from '../site.config.mjs';
import { ROOT, loadContent, factBlocks, dueReviews } from './lib/content.mjs';
import { extractText, diffLines } from './lib/extract.mjs';
import { upsertIssue } from './lib/github.mjs';

const SNAPSHOTS = join(ROOT, 'monitor', 'snapshots');
const STATE = join(ROOT, 'monitor', 'state.json');
const USER_AGENT = `Mozilla/5.0 (compatible; WaypointSourceMonitor/1.0; +https://github.com/${site.repo})`;
const MAX_DIFF_LINES = 150;
const openIssues = process.argv.includes('--issues') || process.argv.includes('--dry-run');

async function fetchPage(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'user-agent': USER_AGENT, 'accept-language': 'en-IE,en;q=0.9', accept: 'text/html' },
        signal: AbortSignal.timeout(30000),
      });
      if (res.status === 404 || res.status === 410) return { status: res.status };
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { status: res.status, html: await res.text(), finalUrl: res.url };
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
  return { error: lastError?.message || 'unknown error' };
}

const content = loadContent();
const blocks = factBlocks(content);
const citedBy = (id) => blocks.filter((b) => b.sources?.includes(id));
const pageList = (id) =>
  [...new Map(citedBy(id).map((b) => [b.label, b])).values()].map((b) => `- [${b.label}](${site.url}${b.page}) · edit \`${b.file}\``).join('\n');

mkdirSync(SNAPSHOTS, { recursive: true });
const state = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {};
const today = new Date().toISOString().slice(0, 10);
const sha = (text) => createHash('sha256').update(text).digest('hex');
const changed = [];
const problems = [];
const baselined = [];

for (const [id, source] of Object.entries(content.sources)) {
  const result = await fetchPage(source.url);
  const file = join(SNAPSHOTS, `${id}.txt`);
  const known = state[id];
  const cached = existsSync(file) ? readFileSync(file, 'utf8') : null;
  // Only diff against the cached text if it is the version we last recorded.
  const before = cached !== null && known && sha(cached) === known.hash ? cached : null;

  if (result.status === 404 || result.status === 410) {
    problems.push({ id, source, reason: `The page is gone (HTTP ${result.status}). It has probably moved: find its new address and update content/sources.json.` });
    continue;
  }
  if (result.error) {
    problems.push({ id, source, reason: `Could not load the page (${result.error}). This is often temporary.` });
    continue;
  }
  const text = `${extractText(result.html)}\n`;
  // A tiny page where we used to have a full one is usually a block page or
  // an outage, not a real edit. Keep the old snapshot and flag it.
  if (text.length < 300 || (known && text.length < known.chars * 0.3)) {
    problems.push({ id, source, reason: `The page loaded but had almost no content (${text.length} characters). It may be blocking automated checks, or its layout changed.` });
    continue;
  }
  const hash = sha(text);
  writeFileSync(file, text);
  if (!known) {
    baselined.push(id);
  } else if (known.hash !== hash) {
    changed.push({ id, source, since: known.changed || known.checked, diff: before === null ? null : diffLines(before, text) });
  }
  state[id] = { hash, chars: text.length, checked: today, changed: !known || known.hash !== hash ? today : known.changed };
  await new Promise((r) => setTimeout(r, 1000)); // be polite to government servers
}

// Drop sources that are no longer listed, then save.
for (const id of Object.keys(state)) if (!content.sources[id]) delete state[id];
writeFileSync(STATE, `${JSON.stringify(state, null, 2)}\n`);

const due = dueReviews(content, { reviewIntervalDays: site.reviewIntervalDays });

// Console / file report
const lines = [`# Source check ${new Date().toISOString().slice(0, 10)}`, ''];
lines.push(`Checked ${Object.keys(content.sources).length} official pages.`, '');
if (baselined.length) lines.push(`Saved first snapshot for: ${baselined.join(', ')}`, '');
lines.push(`## Changed (${changed.length})`, ...changed.map((c) => `- ${c.source.title} (${c.id}): ${c.diff ? `${c.diff.length} lines changed` : 'changed (no earlier copy to compare)'}`), '');
lines.push(`## Problems (${problems.length})`, ...problems.map((p) => `- ${p.source.title} (${p.id}): ${p.reason}`), '');
lines.push(`## Review due (${due.length})`, ...due.map((d) => `- ${d.label} (${d.page}): ${d.reason}`), '');
const report = lines.join('\n');
writeFileSync(join(ROOT, 'monitor', 'report.md'), report);
console.log(report);

if (openIssues) {
  for (const c of changed) {
    const shown = (c.diff || []).slice(0, MAX_DIFF_LINES).map((l) => (l.length > 400 ? `${l.slice(0, 400)}…` : l));
    const whatChanged = c.diff
      ? [
          `### What changed (\`-\` removed, \`+\` added)`,
          '```diff',
          ...shown,
          ...(c.diff.length > MAX_DIFF_LINES ? [`… and ${c.diff.length - MAX_DIFF_LINES} more lines`] : []),
          '```',
        ]
      : ['### What changed', `The text changed since ${c.since}, but last week's copy was not available to compare. Read the official page and compare it with our pages.`];
    upsertIssue({
      label: 'source-changed',
      title: `Official page changed: ${c.source.title}`,
      body: [
        `The official page **[${c.source.title}](${c.source.url})** (${c.source.publisher}) changed since our last check.`,
        '',
        '### Waypoint pages that rely on it',
        pageList(c.id) || '_None. You can remove this source from `content/sources.json`._',
        '',
        ...whatChanged,
        '',
        '### What to do',
        '1. Read the change on the official page. Many changes are small (a date, a typo) and do not affect us.',
        '2. If a fact on Waypoint is now wrong or missing, fix it in the content file listed above.',
        '3. Set `reviewed` to today on every block you checked, so the page shows the new "Checked on" date.',
        '4. Close this issue in your commit message, for example `Fixes #123`.',
      ].join('\n'),
    });
  }

  if (problems.length) {
    upsertIssue({
      label: 'link-problem',
      onExisting: 'skip',
      title: 'Some official sources could not be checked',
      body: [
        'The source check could not read these official pages:',
        '',
        ...problems.map((p) => `- **[${p.source.title}](${p.source.url})** (\`${p.id}\`): ${p.reason}\n  Used by:\n${pageList(p.id).replace(/^/gm, '  ')}`),
        '',
        'If a page has moved, update its `url` in `content/sources.json`. If it was a temporary error, close this issue.',
      ].join('\n'),
    });
  }

  const byPage = new Map();
  for (const d of due) byPage.set(d.page, [...(byPage.get(d.page) || []), d]);
  for (const [page, items] of byPage) {
    upsertIssue({
      label: 'review-due',
      onExisting: 'skip',
      title: `Review due: ${page}`,
      body: [
        `Some facts on [${site.url}${page}](${site.url}${page}) are due to be checked again.`,
        '',
        ...items.map((d) => `- **${d.label}** in \`${d.file}\`: ${d.reason}\n  Sources: ${d.sources.map((s) => `[${content.sources[s].title}](${content.sources[s].url})`).join(', ')}`),
        '',
        '### What to do',
        '1. Open each source and compare it with the page.',
        '2. Fix anything that changed.',
        '3. Set `reviewed` to today on each block (and remove `reviewBy` once a scheduled change has happened).',
      ].join('\n'),
    });
  }
}
