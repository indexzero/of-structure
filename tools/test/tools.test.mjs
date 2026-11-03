// Runs each script in tools/bin against a small git repository built here.
//   node --test tools/test
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

const TOOLS = path.resolve(import.meta.dirname, '..');
const missing = ['ast-grep', 'cloc', 'reviewdog', 'vale'].filter(t => spawnSync(t, ['--version']).error);
const skip = missing.length ? `not installed: ${missing.join(', ')}` : false;

let repo;
const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, { cwd: repo, encoding: 'utf8', ...opts });
const tool = (name, ...args) => sh(path.join(TOOLS, 'bin', name), args);
const write = (file, text) => {
  fs.mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
  fs.writeFileSync(path.join(repo, file), text);
};
const commit = message => {
  sh('git', ['add', '-A']);
  sh('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', message]);
};

// The fixture config names the shipped Comments style but not the Slop
// package, so no test needs the network.
const config = {
  include: ['**/*.js'],
  exclude: [{ glob: '**/generated/**', reason: 'build output' }],
  limits: { ratio: 1, physical: 1000, minLines: 3 },
  exceptions: {},
  vale: 'vale.ini',
  astGrep: path.join(TOOLS, 'ast-grep', 'sgconfig.yml'),
};

before(() => {
  if (skip) return;
  repo = fs.mkdtempSync(path.join(os.tmpdir(), 'of-structure-tools-'));
  sh('git', ['init', '-q', '-b', 'main']);
  write('.comments.json', JSON.stringify(config));
  write('vale.ini', `StylesPath = ${path.join(TOOLS, 'vale', 'styles')}\nMinAlertLevel = suggestion\n[*]\nBasedOnStyles = Comments\n`);
  write('src/a.js', ['// See #11 for why.', 'export const a = 1;', 'export const b = 2;', ''].join('\n'));
  commit('base');
  sh('git', ['switch', '-qc', 'topic']);
  write(
    'src/a.js',
    [
      '// See #11 for why.',
      'export const a = 1;',
      'export const b = 2;',
      '// The ledger rotates its quorum keys at every epoch boundary.',
      '// It follows index.js:95 in the parent package.',
      "export const s = '// not a comment'; // trailing note",
      '',
    ].join('\n')
  );
  write('src/b.js', ['// Quorum keys rotate at the epoch boundary of the ledger.', 'export const c = 3;', ''].join('\n'));
  // cloc counts a file once per content unless told otherwise.
  write('src/copy.js', ['// Quorum keys rotate at the epoch boundary of the ledger.', 'export const c = 3;', ''].join('\n'));
  write('src/note.js', '// Empty on purpose.\n// The loader requires the file.\n');
  write('src/generated/g.js', '// generated\nexport const g = 4;\n');
  write(
    'src/rules.js',
    [
      '// The handle no longer exists once the file is renamed away.',
      '// It used to read the whole file. UTF-8 and ECMA-262 are names, not records.',
      'export const r = 5;',
      '',
    ].join('\n')
  );
  commit('topic');
});

after(() => repo && fs.rmSync(repo, { recursive: true, force: true }));

test('comment-count counts the working tree per file, copies too, and skips excluded globs', { skip }, () => {
  const r = tool('comment-count', '--json');
  assert.equal(r.status, 0, r.stderr);
  const rows = Object.fromEntries(JSON.parse(r.stdout).rows.map(x => [x.file, x]));
  assert.deepEqual(Object.keys(rows).sort(), ['src/a.js', 'src/b.js', 'src/copy.js', 'src/note.js', 'src/rules.js']);
  // The trailing comment shares its line with code, so cloc counts code.
  assert.equal(rows['src/a.js'].comment, 3);
  assert.equal(rows['src/a.js'].code, 3);
});

test('comment-count --base counts only the written lines and holds them to the ratio', { skip }, () => {
  const r = tool('comment-count', '--base', 'main', '--check', '--json');
  assert.equal(r.status, 1, r.stderr);
  const out = JSON.parse(r.stdout);
  const a = out.rows.find(x => x.file === 'src/a.js');
  assert.deepEqual([a.comment, a.code], [2, 1]);
  assert.ok(out.violations.some(v => v.startsWith('src/a.js: ratio 2.00 > 1')), out.violations.join('\n'));
  // note.js wrote 2 comment lines and no code: under minLines, so the
  // ratio does not apply.
  assert.ok(!out.violations.some(v => v.startsWith('src/note.js')), out.violations.join('\n'));
});

test('an exception with a reason lifts a limit, and one without a reason is refused', { skip }, () => {
  const lifted = { ...config, exceptions: { 'src/a.js': { ratio: 3, reason: 'a fixture' } }, vale: path.join(repo, 'vale.ini') };
  write('lifted.json', JSON.stringify(lifted));
  const ok = tool('comment-count', '--base', 'main', '--check', '--config', 'lifted.json', 'src/a.js');
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  write('bad.json', JSON.stringify({ ...lifted, exceptions: { 'src/a.js': { ratio: 3 } } }));
  const bad = tool('comment-count', '--config', 'bad.json');
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /needs a reason/);
});

test('comment-lint with --base reports only the findings on added lines', { skip }, () => {
  const all = tool('comment-lint', 'src/a.js');
  assert.equal(all.status, 1, all.stderr);
  assert.match(all.stdout, /src\/a\.js:1:.*LoadBearingLink.*#11/);

  const added = tool('comment-lint', '--base', 'main', 'src/a.js');
  assert.equal(added.status, 1, added.stderr);
  assert.doesNotMatch(added.stdout, /src\/a\.js:1:/);
  assert.match(added.stdout, /src\/a\.js:5:.*LineNumber.*index\.js:95/);
});

test('the Tombstone and LoadBearingLink rules spare run-time state and spec names', { skip }, () => {
  const r = tool('comment-lint', 'src/rules.js');
  const lines = r.stdout.trim().split('\n');
  assert.deepEqual(
    lines.map(l => l.split(':').slice(1, 4).join(':')),
    ['2:4:Comments.Tombstone'],
    r.stdout
  );
});

test('comment-extract finds comments by parsing, and --base keeps the added ones', { skip }, () => {
  const r = tool('comment-extract', 'src/a.js');
  assert.equal(r.status, 0, r.stderr);
  assert.ok(r.stdout.includes('src/a.js:6:38:// trailing note'), r.stdout);
  assert.ok(!r.stdout.includes("'// not a comment'"));

  const added = tool('comment-extract', '--base', 'main', 'src/a.js');
  assert.ok(!added.stdout.includes('#11'), added.stdout);
  assert.equal(added.stdout.trim().split('\n').length, 3);
});

test('repeated-facts finds one fact stated in two files', { skip }, () => {
  const extract = tool('comment-extract', '--base', 'main');
  const r = sh(path.join(TOOLS, 'bin', 'repeated-facts'), [], { input: extract.stdout });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /terms: .*(quorum|epoch|ledger)/);
  assert.match(r.stdout, /src\/a\.js:4/);
  assert.match(r.stdout, /src\/b\.js:1/);
});
