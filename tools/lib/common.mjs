// Shared plumbing for the scripts in tools/bin.
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

// Git quotes a path with non-ASCII bytes unless told not to, and a quoted
// path is not a file name that cloc or reviewdog can open.
export const GIT_ENV = { ...process.env, GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'core.quotePath', GIT_CONFIG_VALUE_0: 'false' };

export function fail(message) {
  console.error(message);
  process.exit(2);
}

export function run(cmd, args, { input, check = true, env = GIT_ENV } = {}) {
  const r = spawnSync(cmd, args, { input, env, encoding: 'utf8', maxBuffer: 1 << 30 });
  if (r.error?.code === 'ENOENT') fail(`${cmd} is not installed: ${INSTALL[cmd] ?? 'install it'}`);
  if (r.error) fail(`${cmd}: ${r.error.message}`);
  if (check && r.status !== 0) fail(`${cmd} exited ${r.status}\n${r.stderr}`);
  return r;
}

const git = (...args) => run('git', args).stdout;

// Write, then set the exit code. process.exit() would cut a pipe short: on a
// pipe, stdout drains after the write call returns.
export function finish(text, code) {
  process.stdout.write(text);
  process.exitCode = code;
}

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
  // Paths are relative to where the caller stands, and git output to the
  // repository root. Resolve them here, before moving to the root.
  const root = fs.realpathSync(git('rev-parse', '--show-toplevel').trim());
  if (parsed.values.config) parsed.values.config = path.resolve(parsed.values.config);
  const paths = parsed.positionals.map(p => {
    const abs = path.resolve(p);
    if (!fs.existsSync(abs)) fail(`${p}: no such file or directory`);
    const rel = path.relative(root, fs.realpathSync(abs));
    if (rel.startsWith('..') || path.isAbsolute(rel)) fail(`${p}: outside the repository at ${root}`);
    return rel || '.';
  });
  process.chdir(root);
  return { ...parsed.values, paths, passthrough, root };
}

// The first of --config, <root>/.comments.json, tools/comments.json wins
// whole. Configs do not merge.
export function loadConfig(flag) {
  const file = flag ?? [path.resolve('.comments.json'), path.join(TOOLS, 'comments.json')].find(f => fs.existsSync(f));
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
  return { ...config, file, vale: resolve(config.vale), astGrep: resolve(config.astGrep), cloc: resolve(config.cloc) };
}

// git matches the globs, as pathspecs: `**` crosses dot-directories, and
// braces are not supported.
function pathspecs(config) {
  return [...config.include.map(g => `:(glob)${g}`), ...config.exclude.map(e => `:(glob,exclude)${e.glob}`)];
}

// Tracked files, or with a base the files that differ from it. `against` is
// a commit, or undefined for the working tree. Untracked files are never
// read.
export function listFiles(config, paths, { base, against } = {}) {
  const out = base
    ? git('diff', '--name-only', '--diff-filter=d', '-z', base, ...(against ? [against] : []), '--', ...pathspecs(config))
    : git('ls-files', '-z', '--', ...pathspecs(config));
  const under = f => !paths.length || paths.some(p => p === '.' || f === p || f.startsWith(`${p}/`));
  // A file in a merge conflict is listed once per stage.
  const files = [...new Set(out.split('\0'))];
  return files.filter(f => f && under(f) && (against || fs.existsSync(f)));
}

export function mergeBase(base, head = 'HEAD') {
  const r = run('git', ['merge-base', base, head], { check: false });
  if (r.status !== 0) {
    fail(`no merge base for ${base} and ${head}. Check that ${base} names a commit. In a shallow clone, fetch more history (for example, fetch-depth: 0 in actions/checkout).\n${r.stderr}`);
  }
  return r.stdout.trim();
}

// Split a file list so that no command line passes ARG_MAX.
export function chunks(files, bytes = 200_000) {
  const out = [[]];
  let size = 0;
  for (const f of files) {
    if (size + f.length + 1 > bytes && out.at(-1).length) {
      out.push([]);
      size = 0;
    }
    out.at(-1).push(f);
    size += f.length + 1;
  }
  return out;
}

// Every comment of the files, by ast-grep's parser, sorted by place. Lines
// and columns count from 1.
export function comments(config, files, passthrough = []) {
  if (!config.astGrep) fail(`${config.file}: no "astGrep" config`);
  const found = [];
  for (const part of chunks(files)) {
    const sg = run('ast-grep', ['scan', '--config', config.astGrep, '--json=stream', ...passthrough, ...part]);
    for (const json of sg.stdout.split('\n')) {
      if (!json) continue;
      const m = JSON.parse(json);
      found.push({ file: m.file, line: m.range.start.line + 1, column: m.range.start.column + 1, endLine: m.range.end.line + 1, text: m.text });
    }
  }
  return found.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : a.line - b.line || a.column - b.column));
}

// reviewdog decides which findings to keep: those on lines the diff adds,
// with a base, or all of them. A finding with an endLine is kept when any
// of its lines is added. The local reporter prints the kept findings as it
// read them, so each carries its index and comes back whole.
export function report(findings, { base, reporter = 'local', name, failOn = 'none' }) {
  if (!findings.length) return { kept: [], status: 0 };
  const lines = findings.map((f, i) =>
    JSON.stringify({
      message: f.message,
      code: { value: String(i) },
      severity: f.severity ?? 'WARNING',
      location: {
        path: f.file,
        range: { start: { line: f.line, column: f.column }, ...(f.endLine ? { end: { line: f.endLine } } : {}) },
      },
    })
  );
  const args = ['-f=rdjsonl', `-name=${name}`, `-reporter=${reporter}`, `-fail-level=${failOn}`];
  if (base) args.push('-filter-mode=added', `-diff=git -c core.quotePath=false diff --no-color --no-ext-diff --src-prefix=a/ --dst-prefix=b/ ${base}`);
  else args.push('-filter-mode=nofilter');
  const r = run('reviewdog', args, { input: lines.join('\n'), check: false });
  // reviewdog exits 1 both for findings at the fail level and for its own
  // errors; only the stderr text tells them apart.
  const found = /found at least one issue/.test(r.stderr);
  if (r.status !== 0 && !found) fail(`reviewdog exited ${r.status}\n${r.stderr}`);
  const kept = reporter === 'local'
    ? r.stdout.split('\n').filter(Boolean).map(l => findings[Number(JSON.parse(l).code.value)])
    : [];
  return { kept, status: found ? 1 : 0 };
}
