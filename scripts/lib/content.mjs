import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const read = (name) => JSON.parse(readFileSync(join(ROOT, 'content', name), 'utf8'));

export function loadContent() {
  return {
    sources: read('sources.json'),
    stamps: read('stamps.json').map((s) => ({ ...s, name: `Stamp ${s.id}`, slug: `stamp-${s.id.toLowerCase()}` })),
    register: read('register.json'),
    work: read('work.json'),
    permits: read('permits.json'),
    help: read('help.json'),
    emergency: read('emergency.json'),
  };
}

// Every block of facts that must carry official sources and a review date.
export function factBlocks(content) {
  const blocks = [];
  const add = (file, label, page, block, extra = {}) =>
    blocks.push({ file: `content/${file}`, label, page, sources: block.sources, reviewed: block.reviewed, reviewBy: block.reviewBy, reviewReason: block.reviewReason, ...extra });

  content.stamps.forEach((s) => add('stamps.json', s.name, `/stamps/${s.slug}/`, s));
  content.register.sections.forEach((s) => add('register.json', `Register: ${s.heading}`, '/register/', s));
  add('work.json', 'Work: stamp and permit', '/work/', content.work.permitNote);
  add('work.json', 'Work: pay', '/work/', content.work.rights);
  add('permits.json', 'Employment permits', '/employment-permits/', content.permits);
  content.help.audiences.forEach((a) => {
    add('help.json', a.h1, `/${a.slug}/`, a);
    (a.sections || []).forEach((s) => add('help.json', `${a.h1}: ${s.heading}`, `/${a.slug}/`, s));
  });
  add('emergency.json', 'Emergency: location', '/emergency/', content.emergency.location);
  add('emergency.json', 'Emergency: text 112', '/emergency/', content.emergency.sms);
  add('emergency.json', 'Emergency: numbers', '/emergency/', content.emergency, { sources: content.emergency.numbersSources });
  return blocks;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY = 24 * 60 * 60 * 1000;
const toDate = (iso) => new Date(`${iso}T00:00:00Z`);

// Facts whose review is due: older than the review interval, or past a
// known change date ("reviewBy"), e.g. a new minimum wage on 1 January.
export function dueReviews(content, { today = new Date(), reviewIntervalDays }) {
  const due = [];
  for (const b of factBlocks(content)) {
    if (!ISO_DATE.test(b.reviewed || '')) continue;
    const age = Math.floor((today - toDate(b.reviewed)) / DAY);
    if (age > reviewIntervalDays) {
      due.push({ ...b, reason: `Last checked ${b.reviewed} (${age} days ago). Pages must be re-checked every ${reviewIntervalDays} days.` });
    } else if (b.reviewBy && today >= toDate(b.reviewBy) && toDate(b.reviewed) < toDate(b.reviewBy)) {
      due.push({ ...b, reason: `${b.reviewReason || 'A known change date has passed.'} (review by ${b.reviewBy})` });
    }
  }
  return due;
}

function* strings(value, path = '') {
  if (typeof value === 'string') yield [path, value];
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, `${path}[${i}]`);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) yield* strings(v, path ? `${path}.${k}` : k);
}

export function validate(content, { today = new Date(), reviewIntervalDays }) {
  const errors = [];
  const warnings = [];

  for (const [id, s] of Object.entries(content.sources)) {
    if (!/^https:\/\//.test(s.url || '')) errors.push(`sources.json "${id}": url must start with https://`);
    if (!s.title || !s.publisher) errors.push(`sources.json "${id}": needs a title and a publisher`);
  }

  const used = new Set();
  for (const b of factBlocks(content)) {
    if (!b.sources?.length) errors.push(`${b.label}: list at least one official source`);
    for (const id of b.sources || []) {
      if (!content.sources[id]) errors.push(`${b.label}: unknown source "${id}" (add it to content/sources.json)`);
      used.add(id);
    }
    if (!ISO_DATE.test(b.reviewed || '')) errors.push(`${b.label}: "reviewed" must be a date like 2026-10-12`);
    else if (toDate(b.reviewed) > today) errors.push(`${b.label}: "reviewed" date ${b.reviewed} is in the future`);
    if (b.reviewBy && !ISO_DATE.test(b.reviewBy)) errors.push(`${b.label}: "reviewBy" must be a date like 2027-01-01`);
  }
  for (const id of Object.keys(content.sources)) {
    if (!used.has(id)) warnings.push(`sources.json "${id}" is not used by any page`);
  }
  for (const d of dueReviews(content, { today, reviewIntervalDays })) warnings.push(`Review due: ${d.label}. ${d.reason}`);

  // Leftover placeholders from the design, like [CURRENT FEE] or TODO.
  for (const [file, data] of Object.entries(content)) {
    for (const [path, text] of strings(data)) {
      if (/\[[A-Z0-9 ._-]{3,}\]|\bTODO\b|\bTBC\b|\bXXX\b/.test(text)) errors.push(`${file}.${path}: placeholder text "${text}"`);
    }
  }
  return { errors, warnings };
}
