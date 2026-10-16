# The findings file

`PR.<number>.comments.md` is the artifact this skill produces. One file per PR,
holding four things:

- the comment lines the change adds, quoted verbatim
- the sin each one commits
- the draft that convicts it
- the size of the resulting ask

Seven hand-written reviews produced the shape below. Each section earns its
place. Add nothing else, and give a short PR a short file.

## The shape

````markdown
---
pr: 612
title: "limits: one retry budget, read from config (#601)"
comment_lines_added: 41
verdict: "One number, three homes, and a good cliff sign underneath them."
reviewed_against:
  - the-elements-of-documentation.md
  - drafts/the-teacher.md
  - drafts/the-auditor.md
  - drafts/the-clerk.md
  - drafts/the-engineer.md
  - drafts/the-stylist.md
  - drafts/the-minimalist.md
---

# PR #612 — what the authors would strike

## Finding 1. The retry budget, three homes

```
src/limits.ts:14        // Retries cap at 3. Beyond that the queue drains slower
src/limits.ts:15        // than it fills.

src/queue.ts:88         // 3 retries, per limits.ts — past that the queue drains
test/queue.test.ts:31   // The cap is 3, so the fourth attempt never runs.
```

**Rule 15. Sin 14, THE ORPHANED WHY.**

`the-stylist.md` gives the four-word verdict: *"The copy is the future lie."*
`the-clerk.md` gives the instrument: *"grep for each literal; more than one
authoritative-looking occurrence is a finding."* `grep -c` returns three.

The home is `src/limits.ts:14`, where the constant is declared. The other two
restate a number nothing checks them against, so they rot on their own
schedule and the reader believes whichever one they read first.

## What the authors would keep

```
src/limits.ts:22   // Sleep in the caller, never here: this runs under the
src/limits.ts:23   // scheduler lock and a sleep here stalls every queue.
```

`the-auditor.md`'s converse test decides it: *"could a maintainer violate this
comment's claim without noticing? If no claim can be violated, no claim was
made."* A maintainer will move the sleep inward, the tests will pass, and
production will stall. The comment is what stops them.

## The count

| | lines |
|---|---|
| comment lines added | 41 |
| proposed delete | 6 |
| proposed edit | 4 |
| untouched | 31 |

Delete + edit + untouched = comment lines added.
````

## The frontmatter

Five keys, each doing work. `pr` and `title` name the change. `verdict` is
one sentence, and it is the whole review compressed — write it last, after the
findings exist, so it reports rather than predicts.

`comment_lines_added` comes from `scripts/extract-comments.mjs`, not from
memory. It anchors the count table at the end, and the two must agree.

`reviewed_against` is a claim about what you read. List the adopted book first,
then the drafts. Never list a draft you did not open.

## The findings

Number them, and title each one with a noun phrase naming the fault, not the
file. *"The retry budget, three homes"* tells the author what happened;
*"index.ts"* tells them where to scroll.

Each finding carries four things, in this order:

The quote, verbatim, in a fenced block, one line per source line, each prefixed
`path:line`. Elide with `…` on its own line. Keep the comment markers. An
author who cannot find the line you convicted reads a sermon, not a review.

The sin, by name and in caps, with the rules on the same line: **Sin 4, THE
TOMBSTONE. Rule 18.** The names are the reporting vocabulary for a reason — a
named error shames faster than a rule number nobody has memorised.

The draft, with its sentence quoted, not paraphrased. A paraphrase is your
opinion wearing the book's jacket, and the author cannot argue with it. Name
the file: `` `the-engineer.md` ``.

The why. What the reader loses if the lines stay, or what nothing loses when
they go. This is the part that survives disagreement about the rule.

## Splits between drafts

The drafts disagree about test files, about history that teaches, and about
whether length is itself a fault. Where they split, the split is the finding.

Report both readings and name which draft holds which. Then state the
consensus, if the drafts reach one — *keep where a test enforces the fact,
strike where prose merely claims it*. Picking the harshest reading and calling
it the book is the dishonesty this skill exists to prevent.

## What the authors would keep

Not optional. A review that only convicts is not a review, and the good
comments in a diff are the working model for repairing the bad ones.

Quote the keeps the same way you quote the convictions, and say which rule each
one meets. Name the shape when it has one: a cliff sign, an interface contract,
a non-vacuity note, a named degradation. Naming what passed makes the standard
legible to the author who has to apply it tomorrow.

A clean PR is mostly this section. Say so and stop.

## The verdict, when the review resolves to one act

Optional, and it goes between the keeps and the count. Add it when the whole
review compresses to one instruction — *strike the parenthetical, keep the
rest*. The author reads that before the table and knows the job.

## The count

The table answers one question before the author reads a word of argument: **is
this a trim or a rewrite?** Three columns carry it.

**Proposed delete lines.** Comment lines the review strikes with nothing put
back. The line goes; the file gets shorter. A line lands here when the deletion
test takes it and no fact needs rehoming.

**Proposed edit lines.** Comment lines whose text changes and stays — rewrites,
and copies that become pointers at the home. The author still opens the file
and decides what the replacement says, so an edit line costs more than a delete
line. Count a split verdict here unless the review resolves it.

**Untouched lines.** Everything the review does not ask for: the keeps, and the
lines it convicted of nothing.

Every added comment line takes exactly one of the three, so:

> delete + edit + untouched = `comment_lines_added`

State that reconciliation below the table. It catches a careless fill: a sum
that misses means you counted a line twice, or skipped a file.

Read the delete-to-edit ratio, not the total. Six delete and four edit on 41
lines is an afternoon of striking. Four delete and forty edit is a rewrite, and
the author budgets for it differently.

### The fault breakdown, when it earns its place

A second table, under the first, naming where the deleted and edited lines
land:

| fault | lines |
|---|---|
| one fact, many homes (Rule 15) | 8 |
| history (Rule 18) | 4 |

Include it when it changes what the author fixes first. Leave it out when it
does not. It stays secondary because fault classes overlap: one line is history
and a copy at once. Numbers that overlap sum to nothing, so they cannot head
the table.

## Length

The file runs as long as the diff earns. A five-line comment footprint yields a
five-line review. Padding it to look diligent is **Sin 15, THE CONFIDENT
ESSAY**, committed by the reviewer against the author.
