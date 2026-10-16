---
name: elements-of-structure
description: >-
  Review the prose inside a change — code comments, docstrings, commit messages
  — against The Elements of Documentation, and emit a per-PR findings file that
  quotes each offending comment verbatim, names the sin, cites the rule, and
  says what to keep. Use this whenever someone asks to review comments, asks
  "are these comments any good", complains a diff is over-commented or
  under-commented, asks about comment density or comment-to-code ratio, wants
  documentation debt assessed on a branch or PR stack, mentions "the elements
  of documentation", "the sins", "hostage note", "tombstone", "the echo", or
  asks why a refactor added more lines of comment than code. Also use it before
  merging a stack, when a reviewer wants prose held to the same bar as code.
compatibility: >-
  node (scripts), git. Optional: codex CLI for adversarial evaluation.
metadata:
  tags: code-review, comments, documentation, prose, diff-review
  source: The Elements of Documentation (22 rules, 15 sins, 6 drafts)
---

# Elements of Structure

Review the prose a change adds, and report it the way a reviewer can act on.

The premise, from the book this skill serves: **a comment cannot be executed, so
it cannot be caught lying.** The compiler checks the code; nothing checks the
comment against the code. Every comment starts life as a small debt, and the
review's job is to find the debts not worth their interest.

## Why this exists as a skill and not a prompt

A model asked to "review these comments" will read the diff and produce
impressions. Impressions miss the fault that dominates real changes.

The dominant fault is **Rule 15 — one fact, many homes**. It is invisible to
reading, because each copy looks fine on its own. You find it by *counting
homes*, which is mechanical. Get the counting right and the review stops being
taste.

## Process

### Step 1 — Extract, don't skim

Never review from a rendered diff by eye. Pull the added comment lines
mechanically, with file and line number, so every finding can be quoted:

```bash
git diff <base> <head> | node scripts/extract-comments.mjs
```

For a GitHub PR whose base has been force-pushed, `gh pr diff` can return
empty. Prefer local refs (`git diff <base-branch> <head-branch>`) and verify
you got a non-zero line count before continuing. A silent zero here produces a
review that finds nothing and says so confidently.

### Step 2 — Measure the ratio

```bash
git diff <base> <head> | node scripts/comment-density.mjs
```

This reports comment and code lines per file and an overall ratio. Read it for
*distribution*, not the aggregate. An overall 0.45 is unremarkable; a single
file at 2.25, or a file with comment lines and **zero** code lines, is the
finding.

### Step 3 — Count the homes

```bash
git diff <base> <head> | node scripts/find-repeated-facts.mjs
```

This is the highest-yield step and the one a human reviewer skips. It reports
distinctive phrases appearing in two or more files. Each cluster is a candidate
Rule 15 violation — one fact, several homes, all but one of them a future lie.

Judge each cluster before reporting it. A repeated phrase is a finding when it
states the same *fact*; it is not a finding when a test names the rule it is
testing and points at where the rule lives. The book allows the second
explicitly: reference says a thing once, teaching says it twice, *and the second
telling knows it is a second telling*.

### Step 4 — Classify against the rules

Read `references/rules.md` for the 22 rules and the 15 named sins. The sins are
the reporting vocabulary: a named error shames faster than a paragraph of
theory, which is the whole reason the book names them.

The comment-specific rules are 15 through 19, plus 20 through 22 on style. Most
findings in real diffs land on:

- **Rule 15 / Sin 14** — the fact with many homes, the constraint filed away
  from the code it constrains
- **Rule 18 / Sin 4** — history in a comment; the coastline narrated instead of
  the cliff signed
- **Rule 16 / Sin 1** — the comment that restates the code
- **Rule 22** — the aphorism standing where the explanation should be
- **Sin 15** — length worn as authority

Apply the deletion test to every candidate: strike it, reread the code, and ask
whether anything is missing. Then apply the converse, which is sharper: *could a
maintainer violate this comment's claim without noticing?* If no claim can be
violated, no claim was made.

### Step 5 — Attribute to a draft

Read `references/drafts.md`. Six drafts argued this book into existence and they
do not agree about everything. Citing the one that convicts most sharply keeps
the review honest and gives the author somewhere to argue back.

Attribution also protects you from overreach. Where the drafts split — teaching
code, derivations, a trap worth naming — say so and report the split rather than
picking the harshest reading and presenting it as consensus.

### Step 6 — Write the findings file

One file per PR: `PR.<number>.comments.md`. See
`references/output-template.md` for the shape.

Non-negotiable in the output, because each of these is what separates a review
from an opinion:

- **Quote verbatim, with `file:line`.** A finding the author cannot locate is a
  sermon.
- **Name the sin.** "This is the Tombstone" lands; "Rule 18" does not, until
  they have read the rules.
- **Cite the draft, with its sentence.** Not a paraphrase.
- **Say what to keep.** A review that only convicts is not a review, and the
  good comments in a diff are the model for fixing the bad ones.
- **Count the ask at the end.** Report comment lines added, and the three
  numbers that reconcile against it: proposed delete, proposed edit, untouched.
  A table where `delete + edit + untouched` misses the added count is a review
  that has not finished counting. The author needs the size of the ask before
  the argument for it. A breakdown by fault class does not answer that; a trim
  and a rewrite are different afternoons.

## What earns its debt

Report these as keeps, by name, so the standard is legible:

A **cliff sign** — the unguessable invariant, at the line it governs, whose
violation costs something stated in a unit that exists. The test is the converse
one: a maintainer would plausibly break this, and the comment is what stops
them.

An **interface contract** — on the declaration, stating what the caller may rely
on and must guarantee. Read it alone and you can write a correct call.

A **non-vacuity note** in a test — what the test guarantees about *itself*,
which no reading of its assertions yields.

A **named degradation** — the failure mode a design chooses, stated before
anyone hits it.

## Scope and its edges

This skill reviews **prose inside a change**. Three neighbours it should route
to rather than absorb:

- Commit message and PR body quality — the same book governs them (Chapters I
  and II), but the artifact is different. Review those on request; do not fold
  them into a comments file unprompted.
- Markdown construct linting — heading depth, list nesting, table cell width.
  That is `simple-technical-markdown`'s territory.
- Whether the *code* is right. Prose review is not code review, and conflating
  them buries both.

## The failure this skill guards against

Reviewing comments encourages a particular dishonesty: finding a lot, because
finding a lot looks like diligence. The book names it — **Sin 15, the Confident
Essay** — and turns the instrument on itself.

So: run the scripts, quote what they find, and let the counts carry the verdict.
If the honest answer is "this PR's comments are sound, here are the two lines
I'd cut," that is the review. Length reads as diligence and is not diligence.
