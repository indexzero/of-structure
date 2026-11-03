// Runs each script in tools/bin against small git repositories built here.
//   node --test tools/test
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

const TOOLS = path.resolve(import.meta.dirname, '..');
const bin = name => path.join(TOOLS, 'bin', name);
const missing = ['ast-grep', 'cloc', 'reviewdog', 'vale'].filter(t => spawnSync(t, ['--version']).error);
const skip = missing.length ? `not installed: ${missing.join(', ')}` : false;

// The fixture config names the shipped Comments style but not the Slop
// package, so no test needs the network.
const config = {
  include: ['**/*.js', '**/*.mjs'],
  exclude: [{ glob: '**/generated/**', reason: 'build output' }],
  limits: { ratio: 1, physical: 1000, minLines: 3 },
  exceptions: {},
  vale: 'vale.ini',
  astGrep: path.join(TOOLS, 'ast-grep', 'sgconfig.yml'),
};
const VALE = `StylesPath = ${path.join(TOOLS, 'vale', 'styles')}\nMinAlertLevel = suggestion\n[*]\nBasedOnStyles = Comments\n`;

const repos = [];
function repo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'of-structure-tools-'));
  repos.push(dir);
  const r = {
    dir,
    sh: (cmd, args, opts = {}) => spawnSync(cmd, args, { cwd: dir, encoding: 'utf8', ...opts }),
    tool: (name, ...args) => r.sh(bin(name), args),
    write: (file, lines) => {
      fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      fs.writeFileSync(path.join(dir, file), Array.isArray(lines) ? `${lines.join('\n')}\n` : lines);
    },
    commit: message => {
      r.sh('git', ['add', '-A']);
      r.sh('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', message]);
    },
  };
  r.sh('git', ['init', '-q', '-b', 'main']);
  r.write('.comments.json', JSON.stringify(config));
  r.write('vale.ini', VALE);
  return r;
}

const ten = 'one two three four five six seven eight nine ten';
let fx;

before(() => {
  if (skip) return;
  fx = repo();
  fx.write('src/a.js', ['// See #11 for why.', 'export const a = 1;', 'export const b = 2;']);
  fx.write('src/old.js', ['export const o1 = 1;', 'export const o2 = 2;', 'export const o3 = 3;', 'export const o4 = 4;', 'export const o5 = 5;', 'export const o6 = 6;']);
  fx.write('src/bare.js', ['export const x = 1;']);
  fx.write('src/grow.js', [...Array(5).fill(`// ${ten}`), 'export const g = 1;']);
  fx.commit('base');

  fx.sh('git', ['switch', '-qc', 'topic']);
  fx.write('src/a.js', [
    '// See #11 for why.',
    'export const a = 1;',
    'export const b = 2;',
    '// The ledger rotates its quorum keys at every epoch boundary.',
    '// It follows index.js:95 in the parent package.',
    "export const s = '// not a comment'; // trailing note",
  ]);
  fx.write('src/b.js', ['// Quorum keys rotate at the epoch boundary of the ledger.', 'export const c = 3;']);
  // cloc counts a file once per content unless told otherwise.
  fx.write('src/copy.js', ['// Quorum keys rotate at the epoch boundary of the ledger.', 'export const c = 3;']);
  fx.write('src/note.js', ['// Empty on purpose.', '// The loader requires the file.']);
  fx.write('src/generated/g.js', ['// generated', 'export const g = 4;']);
  fx.write('src/rules.js', [
    '// The handle no longer exists once the file is renamed away.',
    '// It used to read the whole file. UTF-8 and ECMA-262 are names, not records.',
    '// Anything left in existing was removed by discover(), the old version of a file.',
    '// If we found an @ the scope is built at first use.',
    '// We tried a lock first.',
    "// Colors #808080 and '#000', license AGPL-3.0, keys F1-F12, slots t[N-2].",
    '// See TODO.md for the plan.',
    '// todo: prefetch the writer',
    '// It follows index.js:30, :134 and :204-208.',
    'export const r = 5;',
  ]);
  fx.sh('git', ['mv', 'src/old.js', 'src/new.js']);
  fx.write('src/new.js', ['// one', '// two', '// three', ...fs.readFileSync(path.join(fx.dir, 'src/new.js'), 'utf8').trim().split('\n')]);
  fx.write('src/bare.js', ['// a', '// b', '// c', '//', '// zz TODO', 'export const x = 1;']);
  fx.write('src/grow.js', [...Array(7).fill(`// ${ten}`), 'export const g = 1;']);
  fx.write('src/block.js', ['/* one', '', '   two */', 'export const z = 1;']);
  fx.write('src/mod.mjs', ['// An mjs file, see #15.', 'export const m = 1;']);
  fx.write('src/café.js', ['// A file name with an accent, see #13.', 'export const k = 1;']);
  fx.write('src/with space/s p.js', ['// A path with a space, see #12.', 'export const p = 1;']);
  fx.write('.config/x.js', ['// A dot-directory, see #14.', 'export const d = 1;']);
  fx.commit('topic');
});

after(() => {
  for (const dir of repos) fs.rmSync(dir, { recursive: true, force: true });
});

const at = (out, file) => out.split('\n').filter(l => l.startsWith(`${file}:`));

test('comment-count counts the working tree per file, copies too, and skips excluded globs', { skip }, () => {
  const r = fx.tool('comment-count', '--json');
  assert.equal(r.status, 0, r.stderr);
  const rows = Object.fromEntries(JSON.parse(r.stdout).rows.map(x => [x.file, x]));
  for (const f of ['src/a.js', 'src/b.js', 'src/copy.js', 'src/mod.mjs', 'src/café.js', 'src/with space/s p.js']) assert.ok(rows[f], f);
  assert.ok(!rows['src/generated/g.js']);
  // cloc never reads a .config directory. The script says so by name.
  assert.ok(!rows['.config/x.js']);
  assert.match(r.stderr, /did not count 1 selected file\(s\), such as \.config\/x\.js/);
  // The trailing comment shares its line with code, so cloc counts code.
  assert.deepEqual([rows['src/a.js'].comment, rows['src/a.js'].code], [3, 3]);
  assert.equal(rows['src/note.js'].ratio, null);
});

test('comment-count --base counts written lines, follows renames, and holds them to the ratio', { skip }, () => {
  const r = fx.tool('comment-count', '--base', 'main', '--check', '--json');
  assert.equal(r.status, 1, r.stderr);
  const out = JSON.parse(r.stdout);
  const row = f => out.rows.find(x => x.file === f);
  assert.deepEqual([row('src/a.js').comment, row('src/a.js').code], [2, 1]);
  assert.deepEqual([row('src/new.js').comment, row('src/new.js').code], [3, 0]);
  assert.ok(row('src/café.js'), 'a non-ASCII name is counted');
  assert.ok(out.violations.some(v => v.startsWith('src/a.js: ratio 2.00 > 1')), out.violations.join('\n'));
  assert.ok(out.violations.some(v => v.startsWith('src/new.js: ratio')), out.violations.join('\n'));
  // note.js wrote 2 comment lines and no code: under minLines, so the
  // ratio does not apply.
  assert.ok(!out.violations.some(v => v.startsWith('src/note.js')), out.violations.join('\n'));
});

test('an exception with a reason lifts a limit, and one without a reason is refused', { skip }, () => {
  const lifted = { ...config, exceptions: { 'src/a.js': { ratio: 3, reason: 'a fixture' } }, vale: path.join(fx.dir, 'vale.ini') };
  fx.write('src/lifted.json', JSON.stringify(lifted));
  // --config is relative to where the caller stands.
  const ok = fx.sh(bin('comment-count'), ['--base', 'main', '--check', '--config', 'lifted.json', 'a.js'], { cwd: path.join(fx.dir, 'src') });
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  fx.write('bad.json', JSON.stringify({ ...lifted, exceptions: { 'src/a.js': { ratio: 3 } } }));
  const bad = fx.tool('comment-count', '--config', 'bad.json');
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /needs a reason/);
});

test('a missing path and an unknown base fail loudly', { skip }, () => {
  const missingPath = fx.tool('comment-lint', 'src/nope');
  assert.equal(missingPath.status, 2);
  assert.match(missingPath.stderr, /no such file/);
  const base = fx.tool('comment-extract', '--base', 'no-such-branch');
  assert.equal(base.status, 2);
  assert.match(base.stderr, /no merge base/);
});

test('comment-lint with --base reports only the findings on added lines', { skip }, () => {
  const all = fx.tool('comment-lint', 'src/a.js');
  assert.equal(all.status, 1, all.stderr);
  assert.match(all.stdout, /^src\/a\.js:1:.*LoadBearingLink.*#11/m);

  const added = fx.tool('comment-lint', '--base', 'main');
  assert.equal(added.status, 1, added.stderr);
  assert.equal(at(added.stdout, 'src/a.js').filter(l => l.startsWith('src/a.js:1:')).length, 0);
  assert.match(added.stdout, /^src\/a\.js:5:.*LineNumber.*index\.js:95/m);
  // Each of these files is a defect the review found: an .mjs file, a
  // non-ASCII name, a space in the path, and a dot-directory.
  for (const f of ['src/mod.mjs', 'src/café.js', 'src/with space/s p.js', '.config/x.js']) {
    assert.equal(at(added.stdout, f).length, 1, `${f}\n${added.stdout}`);
  }
});

test('comment-lint places a finding after a bare // line on its own line', { skip }, () => {
  const r = fx.tool('comment-lint', '--base', 'main', 'src/bare.js');
  assert.match(r.stdout, /^src\/bare\.js:5:\d+:Comments\.Aspiration/m, r.stdout);
});

test('comment-lint with --base reports a comment that the change grows past 60 words', { skip }, () => {
  const r = fx.tool('comment-lint', '--base', 'main', 'src/grow.js');
  assert.match(r.stdout, /^src\/grow\.js:1:\d+:Comments\.Essay/m, r.stdout);
});

test('the Comments rules match the sins and spare run-time state, names and data', { skip }, () => {
  const r = fx.tool('comment-lint', 'src/rules.js');
  const got = r.stdout.trim().split('\n').map(l => l.split(':').slice(1, 4).filter((_, i) => i !== 1).join(':'));
  assert.deepEqual(
    got,
    // The nine // lines are one comment of more than 60 words.
    ['1:Comments.Essay', '2:Comments.Tombstone', '5:Comments.Afternoon', '8:Comments.Aspiration', '9:Comments.LineNumber', '9:Comments.LineNumber', '9:Comments.LineNumber'],
    r.stdout
  );
});

test('comment-extract finds comments by parsing, in order, and --base keeps the added ones', { skip }, () => {
  const r = fx.tool('comment-extract', 'src/a.js');
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes('src/a.js:6:38:// trailing note'), r.stdout);
  assert.ok(!r.stdout.includes("'// not a comment'"));
  assert.deepEqual(r.stdout.trim().split('\n').map(l => Number(l.split(':')[1])), [1, 4, 5, 6]);

  const added = fx.tool('comment-extract', '--base', 'main', 'src/a.js', 'src/block.js');
  assert.ok(!added.stdout.includes('#11'), added.stdout);
  assert.equal(at(added.stdout, 'src/a.js').length, 3);
  // The empty line inside a block comment is a comment line too.
  assert.deepEqual(at(added.stdout, 'src/block.js'), ['src/block.js:1:1:/* one', 'src/block.js:2:1:', 'src/block.js:3:1:   two */']);
});

test('repeated-facts finds one fact stated in two files, from a slow pipe', { skip }, () => {
  const extract = fx.tool('comment-extract', '--base', 'main', 'src');
  fx.write('extract.txt', extract.stdout);
  const r = fx.sh('sh', ['-c', `(sleep 1; cat extract.txt) | '${bin('repeated-facts')}'`]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /terms: .*(quorum|epoch|ledger)/);
  assert.match(r.stdout, /src\/a\.js:4/);
  assert.match(r.stdout, /src\/b\.js:1/);
});

test('output through a pipe is not cut at 64 KiB', { skip }, () => {
  const big = repo();
  big.write('many.js', [...Array.from({ length: 1500 }, (_, i) => `// TODO item ${i}`), 'export const n = 1;']);
  big.commit('many');
  const file = big.tool('comment-lint').stdout.length;
  const piped = big.sh('sh', ['-c', `'${bin('comment-lint')}' | wc -c`]).stdout.trim();
  assert.ok(file > 65536, `${file}`);
  assert.equal(Number(piped), file);
});

test('a file in a merge conflict is read once, not once per stage', { skip }, () => {
  const m = repo();
  m.write('a.js', ['// base', 'export const a = 0;']);
  m.commit('base');
  m.sh('git', ['switch', '-qc', 'other']);
  m.write('a.js', ['// other', 'export const a = 2;']);
  m.commit('other');
  m.sh('git', ['switch', '-q', 'main']);
  m.write('a.js', ['// main', 'export const a = 1;']);
  m.commit('main');
  m.sh('git', ['merge', '-q', 'other']);
  const r = m.tool('comment-extract');
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.stdout.trim().split('\n'), ['a.js:2:1:// main', 'a.js:5:1:// other']);
});
