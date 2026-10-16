// Extract ADDED comment lines from a unified diff on stdin, with file and the
// new-file line number, so each can be quoted verbatim in a review.
import fs from 'node:fs';

const lines = fs.readFileSync(0, 'utf8').split('\n');
let file = null;
let newLine = 0;
let inBlock = false;
const out = [];

for (const line of lines) {
  const f = line.match(/^\+\+\+ b\/(.+)$/);
  if (f) { file = f[1]; inBlock = false; continue; }
  const h = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
  if (h) { newLine = Number(h[1]); continue; }
  if (!file) continue;
  if (line.startsWith('-')) continue;
  if (!line.startsWith('+') && !line.startsWith(' ')) continue;

  const added = line.startsWith('+');
  const t = line.slice(1);
  const s = t.trim();
  const yml = file.endsWith('.yml');

  let isComment = false;
  if (inBlock) { isComment = true; if (s.includes('*/')) inBlock = false; }
  else if (s.startsWith('/*') || s.startsWith('/**')) { isComment = true; if (!s.includes('*/')) inBlock = true; }
  else if (s.startsWith('//') || s.startsWith('*') || (yml && s.startsWith('#'))) isComment = true;

  if (added && isComment && s) out.push(`${file}:${newLine}: ${t}`);
  newLine++;
}

const SKIP = /generated\/|\.md$|\.png$/;
for (const l of out) if (!SKIP.test(l.split(':')[0])) console.log(l);
