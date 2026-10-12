// Turns an official web page into stable plain text, so we can tell when its
// wording changes. Menus, footers, scripts and other page furniture are
// dropped; links keep their URL so a swapped form or policy PDF is noticed.

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', euro: '€', pound: '£', copy: '©', reg: '®',
  aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
};

function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e] ?? m;
  });
}

function mainContent(html) {
  // Immigration Service Delivery pages keep their content in .post-content.
  const post = html.search(/class="[^"]*\bpost-content\b/);
  if (post !== -1) return html.slice(post);
  const main = html.match(/<main\b[\s\S]*<\/main>/i);
  if (main) return main[0];
  const article = html.match(/<article\b[\s\S]*<\/article>/i);
  if (article) return article[0];
  const body = html.match(/<body\b[\s\S]*<\/body>/i);
  return body ? body[0] : html;
}

export function extractText(html) {
  let s = html.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<(script|style|noscript|svg|template|iframe|head)\b[\s\S]*?<\/\1>/gi, ' ');
  s = mainContent(s);
  s = s.replace(/<(nav|header|footer|aside)\b[\s\S]*?<\/\1>/gi, ' ');
  s = s.replace(/<a\b[^>]*\bhref="([^"]*)"[^>]*>/gi, (m, href) => {
    const url = decode(href).trim();
    if (!url || url.startsWith('#') || /^(javascript|mailto):|\/cdn-cgi\//i.test(url)) return ' ';
    return ` [${url}] `;
  });
  s = s.replace(/<(br|p|li|h[1-6]|tr|div|section|dt|dd|table|ul|ol)\b[^>]*>/gi, '\n');
  s = s.replace(/<[^>]+>/g, ' ');
  s = decode(s);
  return s
    .split('\n')
    .map((line) => line.replace(/[ \t ​]+/g, ' ').trim())
    .filter((line) => line && line !== '[]')
    .join('\n');
}

// Line diff (longest common subsequence). Returns lines prefixed "+ " or "- ".
export function diffLines(before, after) {
  const a = before.split('\n');
  const b = after.split('\n');
  const n = a.length;
  const m = b.length;
  const lcs = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      out.push(`- ${a[i++]}`);
    } else {
      out.push(`+ ${b[j++]}`);
    }
  }
  while (i < n) out.push(`- ${a[i++]}`);
  while (j < m) out.push(`+ ${b[j++]}`);
  return out;
}
