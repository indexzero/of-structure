// Shared plumbing for the scripts in tools/bin. Each script exits 0 when
// clean, 1 on findings, and 2 when it cannot run.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

export const TOOLS = path.resolve(import.meta.dirname, '..');

const INSTALL = {
  'ast-grep': 'brew install ast-grep',
  cloc: 'brew install cloc',
  reviewdog: 'brew install reviewdog/tap/reviewdog',
  vale: 'brew install vale',
};

export function fail(message) {
  console.error(message);
  process.exit(2);
}

export function run(cmd, args, { input, check = true } = {}) {
  const r = spawnSync(cmd, args, { input, encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.error?.code === 'ENOENT') fail(`${cmd} is not installed: ${INSTALL[cmd] ?? 'install it'}`);
  if (r.error) fail(`${cmd}: ${r.error.message}`);
  if (check && r.status !== 0) fail(`${cmd} ${args.join(' ')} exited ${r.status}\n${r.stderr}`);
  return r;
}

const git = (...args) => run('git', args).stdout;

// Options after `--` pass through to the wrapped tool untouched.
export function cli(options, usage) {
  const argv = process.argv.slice(2);
  const cut = argv.indexOf('--');
  const own = cut < 0 ? argv : argv.slice(0, cut);
  const passthrough = cut < 0 ? [] : argv.slice(cut + 1);
  let parsed;
  try {
    parsed = parseArgs({ args: own, allowPositionals: true, options: { help: { type: 'boolean', short: 'h' }, ...options } });
  } catch (e) {
    fail(`${e.message}\n\n${usage}`);
  }
  if (parsed.values.help) {
    console.log(usage);
    process.exit(0);
  }
  // Paths are relative to where the caller stands; git output is relative to
  // the repository root, so both move to the root here.
  const root = git('rev-parse', '--show-toplevel').trim();
  const paths = parsed.positionals.map(p => path.relative(root, path.resolve(p)) || '.');
  process.chdir(root);
  return { ...parsed.values, paths, passthrough, root };
}

// The first of --config, <root>/.comments.json, tools/comments.json wins
// whole. Configs do not merge.
export function loadConfig(flag) {
  const file = flag
    ? path.resolve(flag)
    : [path.resolve('.comments.json'), path.join(TOOLS, 'comments.json')].find(f => fs.existsSync(f));
  let config;
  try {
    config = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    fail(`${file}: ${e.message}`);
  }
  const bad = why => fail(`${file}: ${why}`);
  if (!Array.isArray(config.include) || !config.include.every(g => typeof g === 'string')) bad('include must be a list of globs');
  if (!Array.isArray(config.exclude)) bad('exclude must be a list');
  for (const e of config.exclude) {
    if (typeof e.glob !== 'string' || !e.reason?.trim()) bad('every exclude needs a glob and a reason');
  }
  for (const [f, e] of Object.entries(config.exceptions ?? {})) {
    if (!e.reason?.trim()) bad(`the exception for ${f} needs a reason`);
    if (!Object.keys(e).every(k => ['reason', 'ratio', 'physical'].includes(k))) bad(`the exception for ${f} sets an unknown limit`);
  }
  const dir = path.dirname(file);
  const resolve = p => (p ? path.resolve(dir, p) : undefined);
  return { ...config, file, vale: resolve(config.vale), astGrep: resolve(config.astGrep), cloc: config.cloc ?? [] };
}

export function selector(config, paths) {
  const under = f => !paths.length || paths.some(p => p === '.' || f === p || f.startsWith(`${p}/`));
  return f =>
    under(f) &&
    config.include.some(g => path.matchesGlob(f, g)) &&
    !config.exclude.some(e => path.matchesGlob(f, e.glob));
}

export function mergeBase(base, head = 'HEAD') {
  return git('merge-base', base, head).trim();
}

// Tracked files, or with a base the files that differ from it. `against`
// is a commit, or undefined for the working tree.
export function listFiles(keep, { base, against } = {}) {
  const out = base
    ? git('diff', '--name-only', '--diff-filter=d', '-z', base, ...(against ? [against] : []), '--')
    : git('ls-files', '-z');
  return out.split('\0').filter(f => f && keep(f) && (against || fs.existsSync(f)));
}

// reviewdog keeps the findings on lines the diff adds and prints them as it
// read them.
export function addedOnly(lines, base, { reporter = 'local', name, failOn = 'none' } = {}) {
  const r = run(
    'reviewdog',
    ['-efm=%f:%l:%c:%m', `-name=${name}`, `-reporter=${reporter}`, '-filter-mode=added', `-fail-level=${failOn}`, `-diff=git diff --no-color --no-ext-diff --src-prefix=a/ --dst-prefix=b/ ${base}`],
    { input: lines, check: false }
  );
  // reviewdog exits 1 both for findings at the fail level and for its own
  // errors; only the stderr text tells them apart.
  const found = /found at least one issue/.test(r.stderr);
  if (r.status !== 0 && !found) fail(`reviewdog exited ${r.status}\n${r.stderr}`);
  return { stdout: r.stdout, status: found ? 1 : 0 };
}
