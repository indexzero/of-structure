# tools

Scripts that measure and lint the comments of a change. Each job has one
off-the-shelf tool, set up by that tool's own config file. The scripts only
choose the files, run the tool, and keep the findings on the lines a change
adds.

| Script | Job | Tool |
|---|---|---|
| `bin/comment-count` | comment and code lines per file, and a gate on their ratio | [cloc] |
| `bin/comment-lint` | the sins that have a textual signature | [Vale] |
| `bin/comment-extract` | every comment line, as `file:line:column:text` | [ast-grep] |
| `bin/repeated-facts` | one fact stated in several files (Rule 15) | none; see below |

With `--base <rev>`, each script looks only at the change since the merge base
of `<rev>` and `HEAD`. [reviewdog] does that filtering for `comment-lint` and
`comment-extract`. cloc compares the two commits itself.

Install the tools:

```sh
brew install cloc vale ast-grep reviewdog/tap/reviewdog
```

The scripts need node 22 or later, and git.

## Use

Run the scripts from inside the repository under review:

```sh
tools/bin/comment-count --base main --check src
tools/bin/comment-lint --base main src
tools/bin/comment-extract --base main | tools/bin/repeated-facts
```

Without `--base`, each script reads every selected file in the working tree.
Paths after the options narrow the selection. Everything after `--` goes to
the wrapped tool:

```sh
tools/bin/comment-count -- --exclude-lang=JSON
```

In CI, give `comment-lint` a reviewdog reporter, for example
`--reporter github-pr-review`.

Each script exits 0 when clean, 1 on findings, and 2 when it cannot run.
`repeated-facts` lists candidates and always exits 0.

## Configuration

One file, `comments.json`, selects the files and names each tool's config. A
script takes the first that exists of `--config <file>`, `.comments.json` at
the repository root, and `tools/comments.json`. The file it takes is the whole
configuration. Configs do not merge.

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
| `cloc` | extra cloc options |

cloc counts a line that holds both code and a comment as code. The scripts
pass `--skip-uniqueness`, because by default cloc counts identical files once.

### The Comments style

`vale/.vale.ini` applies two styles to comments. Slop comes from the
[vale-llm-slop] package, pinned at v0.1.0, and `comment-lint` installs it with
`vale sync` on its first run. Comments is in `vale/styles/Comments`. Each of
its rules is a detection from `skills/elements-of-structure/references/rules.md`:

| Rule | Sin or rule | Flags |
|---|---|---|
| `Essay` | Sin 15, the Confident Essay | a comment of more than 60 words |
| `LineNumber` | Rule 18, locality | `file.ext:NN` citations |
| `LoadBearingLink` | Sin 10, the Load-Bearing Link | `#123`, tracker keys, orckit ids such as `D-060`, `T25`, `AD7` |
| `Tombstone` | Sin 4, the Tombstone | the code's past: "it used to", "was replaced by" |
| `Afternoon` | Sin 2, the Afternoon | "we tried", "turns out" |
| `Apology` | Sin 5, the Apology Tour | "hacky", "sorry" |
| `Aspiration` | Rule 18 and Sin 9 | `TODO`, "for now", "will be added" |

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
| scc, tokei, the `sloc` npm package | No two-commit diff mode. Two counters would give two sets of numbers for one change. |
| [aislop] | Its `trivial-comment` and `narrative-comment` rules are the nearest off-the-shelf detector of restating comments. It sends telemetry unless `AISLOP_NO_TELEMETRY=1` is set, and by default it also runs Biome and oxlint. Not run here yet. |
| `eslint-plugin-unicorn` `expiring-todo-comments` | Ties a comment to a dependency version. It needs ESLint, and `Comments.LineNumber` removes most of the need. |
| `eslint-plugin-jsdoc` `informative-docs` | Sees only `/** */` blocks that repeat a name. It needs ESLint. |
| eslint-plugin-sonarjs | Its license is source-available from version 3.0 on, not open source. |
| strip-comments, decomment, terser, esbuild | They remove every comment. None can choose which. |

## Tests

```sh
node --test tools/test
```

The suite builds a small git repository, runs each script against it, and
skips itself when one of the four tools is missing.

[cloc]: https://github.com/AlDanial/cloc
[Vale]: https://vale.sh
[ast-grep]: https://ast-grep.github.io
[reviewdog]: https://github.com/reviewdog/reviewdog
[vale-llm-slop]: https://github.com/Syntaf/vale-llm-slop
[jscpd]: https://github.com/kucherenko/jscpd
[IgnaceMaes/comment-ratio]: https://github.com/IgnaceMaes/comment-ratio
[aislop]: https://github.com/scanaislop/aislop
