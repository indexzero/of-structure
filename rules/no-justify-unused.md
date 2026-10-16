---
name: no-justify-unused
description: >-
  Never write a comment that justifies why an unused artifact exists — that
  comment is the finding that it should be deleted. Covers the three-way
  consumer search, the information-not-the-file search, and the test that
  turns a claimed human-sync dependency into evidence.
metadata:
  tags: dead-code, deletion, comments, documentation, refactor
---

# No justifying the unused

## High-signal triggers

- You are about to write a comment explaining why a file, export, or branch
  of code still exists.
- A sentence you are drafting contains: `no code loads this`, `unused`,
  `nothing reads it`, `kept for reference`, `it STAYS one`, `left alone`.
- A doc paragraph explains the *shape* of files rather than their use.
- Two files hold the same information and a comment calls one "the source of
  truth".

## The rule

**A justification that contains its own refutation is a delete order.**

"No code loads them" is the finding. It is not a premise for keeping
something, and writing it down does not discharge it. If the sentence is true,
the artifact goes. If it is false, name the consumer instead.

Shortening such a comment is worse than leaving it long. A trimmed
justification looks like the file received attention.

## Step 1 — Search for consumers three ways

One search alone gives a false negative. Run all three.

```sh
# literal reference
grep -rn "<basename>" --exclude-dir=node_modules --exclude-dir=.git .

# dynamic construction — the one people forget
grep -rnE "(join|resolve)\([^)]*<stem>" --exclude-dir=node_modules .

# directory scan that would sweep it up
grep -rn "readdirSync\|readdir(" --exclude-dir=node_modules . | grep -i <dir>
```

Also check whether anything *writes* it. A generated artifact with no reader
is still dead, but it dies differently: delete the generator too.

## Step 2 — Search for the information, not the file

A dependency can exist with no import. Someone reads file A by hand to keep
constant B in sync, and the only trace is prose.

Grep for the *contents* — a distinctive value, key, or slug from inside the
artifact — across the whole repo. Then read every comment that names the file.
This is where the real answer usually is.

## Step 3 — Test any claimed sync; never accept it

A comment saying "mirrors X" or "X is the source of truth" is a hypothesis.
Load both sides and diff them.

```sh
node --input-type=module -e '
import a from "./path/to/view.mjs";
const src = await import("node:fs").then(fs => fs.readFileSync("consumer.js","utf8"));
/* extract the constant, then: */
console.log("only in consumer:", onlyConsumer.length);
console.log("only in view:", onlyView.length);
'
```

A drifted source of truth is a liability, not an asset. It sends the next
reader to the wrong file with full confidence.

## Disposition

| Finding | Disposition |
|---|---|
| No consumer of any kind | Delete, comments included |
| Hand-sync consumer, sync holds | Derive, then delete |
| Hand-sync consumer, sync drifted | Delete; settle the drift first |
| A real code consumer | Keep, and name it |
| Regenerable copy of computable data | Derive it |

Delete the comments defending an artifact in the same commit that removes it.
A drift is a live bug: settle which side is right before you derive anything
from either. A cache that nothing forces to stay honest goes stale.

Prefer deriving a projection over storing one. If you delete nothing, the
comment must name the consumer you found, not argue from shape.

## Worked case

Four flat data modules, `data/{0,1,2,3}/slugs.mjs`, 148 lines in all. Each
exported one array of slugs and nothing imported any of them. An agent added
seven comment lines to each, plus a doc paragraph, defending their flat shape
inside an argument that stated "no code loads them".

The three-way search found no reader, no writer, no scan. Step 2 found the one
consumer: a comment on a `KNOWN_SLUGS` set in the importer, calling
`data/1/slugs.mjs` "the source of truth". Step 3 measured it:

```
KNOWN_SLUGS: 61   data/1/slugs.mjs: 46
in the Set but NOT the file: 15
in the file but NOT the Set:  0
```

The named source of truth was a stale subset of its own mirror, drifted 15
entries in one direction. Documenting it preserved 148 dead lines and a false
claim. The correct output was a delete and a derivation.
