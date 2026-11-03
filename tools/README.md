# tools

Scripts that measure and lint the comments of a change. Each job has one
off-the-shelf tool, set up by that tool's own config file. The scripts only
choose the files, run the tool, and keep what a change adds: [reviewdog]
filters the findings of `comment-lint` and `comment-extract`, and cloc
compares two commits itself.

| Script | Job | Tool |
|---|---|---|
| `bin/comment-count` | comment and code lines per file, and a gate on their ratio | [cloc] |
| `bin/comment-lint` | the sins that have a textual signature | [Vale] 3.25.1 or later |
| `bin/comment-extract` | every comment line, as `file:line:column:text` | [ast-grep] |
| `bin/repeated-facts` | one fact stated in several files (Rule 15) | none; see below |

Install the tools:

```sh
brew install cloc vale ast-grep reviewdog/tap/reviewdog
```

The scripts need node 22 or later, and git.

## Use

Run the scripts from inside the repository under review. `TOOLS` here is
the `tools/bin` directory of this repository:

```sh
TOOLS=~/Git/indexzero/of-structure/tools/bin
$TOOLS/comment-count --base main --check src
$TOOLS/comment-lint --base main src
$TOOLS/comment-extract --base main | $TOOLS/repeated-facts
```

The scripts read tracked files only. Paths after the options narrow the
selection, and a path that does not exist is an error. Everything after
`--` goes to the wrapped tool:

```sh
$TOOLS/comment-lint src -- --filter='.Name=="Comments.Essay"'
```

`--base <rev>` selects the change since the merge base of `<rev>` and
`HEAD`. The scripts differ in what they read:

- `comment-lint` and `comment-extract` read the working tree, so
  uncommitted changes count as added.
- `comment-count` compares two commits with cloc, `HEAD` or `--head <rev>`
  against the merge base. It warns when a selected file has uncommitted
  changes.
- `repeated-facts` has no `--base`. It reads the output of
  `comment-extract` on stdin.

`comment-lint` takes a reviewdog reporter, `local` by default. In CI, use
for example `--reporter github-pr-review`. In a shallow clone, fetch enough
history for the merge base, for example `fetch-depth: 0` in
`actions/checkout`.

| Script | Exits 0 | Exits 1 | Exits 2 |
|---|---|---|---|
| `comment-count` | clean, or no `--check` | `--check` finds a file over a limit | it cannot run |
| `comment-lint` | no findings | any finding | it cannot run |
| `comment-extract` | always, on success | never | it cannot run |
| `repeated-facts` | always, on success | never | bad options, or stdin is a terminal |

## Configuration

One file, `comments.json`, selects the files and names each tool's config. A
script takes the first that exists of `--config <file>`, `.comments.json` at
the repository root, and `tools/comments.json`. `--config` is relative to
the current directory. The file it takes is the whole configuration.
Configs do not merge.

| Key | Meaning |
|---|---|
| `include` | globs of the files to read |
| `exclude` | `{ "glob", "reason" }` entries. Every entry needs a reason. |
| `limits.ratio` | the most comment lines per code line in one file |
| `limits.physical` | the most lines in one file, without `--base` |
| `limits.minLines` | with `--base`, a file that wrote fewer lines is not held to the ratio |
| `exceptions` | per file, `{ "ratio" or "physical", "reason" }`. A full run reports an exception whose file is gone. |
| `vale` | the Vale config, relative to `comments.json` |
| `astGrep` | the ast-grep config, relative to `comments.json` |
| `cloc` | a cloc options file, one option per line, relative to `comments.json` |

git matches the globs as `:(glob)` pathspecs. `**` crosses every directory,
dot-directories too, and braces are not supported.

The default covers JavaScript and TypeScript. The deleted
`elements-of-structure` scripts also read the `#` comments of `.yml` files,
and these scripts do not: a YAML file needs an ast-grep rule
(`language: Yaml`) and a Vale View before both tools read its comments.

### Counting

cloc counts a line that holds both code and a comment as code. So its
comment column is lower than the line count of `comment-extract`, which
lists every comment line. A findings file takes `comment_lines_added` from
`comment-extract`.

The scripts pass `--skip-uniqueness`, because by default cloc counts
identical files once. They pass the options file with `--config`, which also
keeps cloc from reading `~/.config/cloc/options.txt`. cloc never reads a
`.config` or `.venv` directory, whatever its options say. `comment-count`
names each selected file that cloc did not count.

### The Comments style

`vale/.vale.ini` applies two styles to comments, at `MinAlertLevel = warning`
unless `--level` says otherwise. Slop comes from the [vale-llm-slop]
package, pinned at v0.1.0. `comment-lint` runs `vale sync` when the pin
changes or a style is missing. Comments is in `vale/styles/Comments`. Each of
its rules is a detection from `skills/elements-of-structure/references/rules.md`:

| Rule | Sin or rule | Flags |
|---|---|---|
| `Essay` | Sin 15, the Confident Essay | a comment of more than 60 words |
| `LineNumber` | Rule 18, locality | `file.ext:12`, a following `:134`, `#L12` on a branch URL, "file.js line 12" |
| `LoadBearingLink` | Sin 10, the Load-Bearing Link | `#123`, tracker keys, orckit ids such as `D-060`, `T25`, `AD7` |
| `Tombstone` | Sin 4, the Tombstone | the code's past, with the code as subject: "it used to", "this was replaced" |
| `Afternoon` | Sin 2, the Afternoon | "I tried", a clause that opens "we found", "turns out" |
| `Apology` | Sin 5, the Apology Tour | "hacky", "sorry" |
| `Aspiration` | Rule 18 and Sin 9 | `TODO`, `FIXME`, a line that opens "todo", "for now" |

Vale treats a run of `//` lines as one comment, and so a run of trailing
comments that start in the same column. `Essay` counts the words of that
whole run. With `--base`, `comment-lint` reports an `Essay` finding when any
line of its comment is added. Vale masks JSDoc tags, so `Aspiration` cannot
see an `@todo`.

To change a level or turn a rule off, edit `.vale.ini`, for example
`Comments.Aspiration = suggestion`.

## Why repeated-facts is bespoke

Rule 15 asks whether one fact has several homes. Clone detectors such as
[jscpd] and Dolos match tokens, so they find only pasted prose. A fact
restated in different words shares only its rare words, and the term pass in
`repeated-facts` looks for those.

## Considered, not adopted

| Tool | Why not |
|---|---|
| [IgnaceMaes/comment-ratio] | A GitHub Action only, built on tokei. `comment-count --base --check` does the same job locally and in any CI, with the same limits file. |
| scc, tokei, the `sloc` npm package | None compares two commits. cloc does. |
| [aislop] | Its `trivial-comment` and `narrative-comment` rules are the nearest off-the-shelf detector of restating comments. It sends telemetry unless `AISLOP_NO_TELEMETRY=1` is set, and by default it also runs Biome and oxlint. Not run here yet. |
| `eslint-plugin-unicorn` `expiring-todo-comments` | Ties a TODO to a dependency version. It needs ESLint. `Comments.Aspiration` flags every TODO, and `Comments.LineNumber` flags the version-bound line citations that would have needed it. |
| `eslint-plugin-jsdoc` `informative-docs` | Sees only `/** */` blocks that repeat a name. It needs ESLint. |
| eslint-plugin-sonarjs | Its license is source-available from version 3.0 on, not open source. |
| strip-comments, decomment, terser, esbuild | They strip comments from code. Their options keep comments by pattern, such as license headers, but they write a stripped copy and never report a comment for review. |

## Tests

```sh
node --test tools/test
```

The suite builds small git repositories, runs each script against them, and
skips itself when one of the four tools is missing.

[cloc]: https://github.com/AlDanial/cloc
[Vale]: https://vale.sh
[ast-grep]: https://ast-grep.github.io
[reviewdog]: https://github.com/reviewdog/reviewdog
[vale-llm-slop]: https://github.com/Syntaf/vale-llm-slop
[jscpd]: https://github.com/kucherenko/jscpd
[IgnaceMaes/comment-ratio]: https://github.com/IgnaceMaes/comment-ratio
[aislop]: https://github.com/scanaislop/aislop
