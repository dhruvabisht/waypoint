// Opens or updates GitHub issues with the gh CLI (preinstalled on GitHub
// Actions runners; it uses the GH_TOKEN environment variable).
import { execFileSync } from 'node:child_process';

const gh = (args, input) => execFileSync('gh', args, { encoding: 'utf8', input, stdio: [input ? 'pipe' : 'ignore', 'pipe', 'inherit'] });

const LABELS = {
  'source-changed': ['FBCA04', 'An official page we rely on has changed'],
  'review-due': ['D93F0B', 'Content is due to be re-checked against its sources'],
  'link-problem': ['B60205', 'A link is broken or an official page could not be reached'],
};

const ensured = new Set();
function ensureLabel(name) {
  if (ensured.has(name)) return;
  const [color, description] = LABELS[name];
  gh(['label', 'create', name, '--color', color, '--description', description, '--force']);
  ensured.add(name);
}

// GitHub limits issue bodies to 65,536 characters.
const clamp = (text) => (text.length > 60000 ? `${text.slice(0, 60000)}\n\n…(cut short)` : text);

// One open issue per title. If it is already open, add a comment
// (onExisting: 'comment') or leave it alone (onExisting: 'skip').
export function upsertIssue({ title, body, label, onExisting = 'comment' }) {
  if (process.argv.includes('--dry-run')) {
    console.log(`\n----- Would open issue [${label}] ${title} -----\n${clamp(body)}\n-----`);
    return;
  }
  ensureLabel(label);
  const open = JSON.parse(gh(['issue', 'list', '--state', 'open', '--label', label, '--limit', '200', '--json', 'number,title']));
  const existing = open.find((i) => i.title === title);
  if (existing && onExisting === 'skip') {
    console.log(`Already open as #${existing.number}: ${title}`);
  } else if (existing) {
    gh(['issue', 'comment', String(existing.number), '--body-file', '-'], clamp(`Still needs attention (${new Date().toISOString().slice(0, 10)}):\n\n${body}`));
    console.log(`Commented on #${existing.number}: ${title}`);
  } else {
    const url = gh(['issue', 'create', '--title', title, '--label', label, '--body-file', '-'], clamp(body)).trim();
    console.log(`Opened ${url}: ${title}`);
  }
}
