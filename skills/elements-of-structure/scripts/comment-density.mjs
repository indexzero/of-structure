// Classify the ADDED lines of a unified diff as comment, code, or blank.
// Reads a diff on stdin. Handles // line comments, /* */ blocks, and #
// comments in yml. Markdown and generated files are reported separately.
import fs from 'node:fs';

const diff = fs.readFileSync(0, 'utf8').split('\n');
const files = new Map();
let cur = null;
let inBlock = false;

for (const line of diff) {
  const m = line.match(/^\+\+\+ b\/(.+)$/);
  if (m) {
    cur = m[1];
    inBlock = false;
    if (!files.has(cur)) files.set(cur, { comment: 0, code: 0, blank: 0 });
    continue;
  }
  if (!cur || !line.startsWith('+') || line.startsWith('+++')) continue;
  const t = line.slice(1).trim();
  const f = files.get(cur);

  if (t === '') { f.blank++; continue; }

  const yml = cur.endsWith('.yml');
  if (inBlock) {
    f.comment++;
    if (t.includes('*/')) inBlock = false;
    continue;
  }
  if (t.startsWith('/*')) {
    f.comment++;
    if (!t.includes('*/')) inBlock = true;
    continue;
  }
  if (t.startsWith('//') || t.startsWith('*') || (yml && t.startsWith('#'))) {
    f.comment++;
    continue;
  }
  f.code++;
}

const SKIP = /\.md$|generated\/|\.png$|lock\.yaml$/;
const rows = [...files.entries()].filter(([f]) => !SKIP.test(f));
let tc = 0;
let tk = 0;
for (const [, v] of rows) { tc += v.comment; tk += v.code; }

rows.sort((a, b) => b[1].comment + b[1].code - (a[1].comment + a[1].code));
console.log('file'.padEnd(52), 'cmt'.padStart(5), 'code'.padStart(5), 'ratio'.padStart(7));
for (const [f, v] of rows) {
  if (v.comment + v.code === 0) continue;
  const r = v.code ? (v.comment / v.code).toFixed(2) : '∞';
  console.log(f.padEnd(52), String(v.comment).padStart(5), String(v.code).padStart(5), String(r).padStart(7));
}
console.log('-'.repeat(72));
console.log('TOTAL (source only)'.padEnd(52), String(tc).padStart(5), String(tk).padStart(5),
  String((tc / tk).toFixed(2)).padStart(7));
