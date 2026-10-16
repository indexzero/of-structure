# The rules and the sins

Compressed from *The Elements of Documentation* — 22 rules, 15 named sins. The
full text and its six drafts live at
`../../elements-of-documentation/bundle/`. Read the source
when you need a sentence to quote; this file is for classification.

Each rule names its scope. **A rule applied to the wrong reader is a bug
wearing a badge of virtue.**

## Chapter I — the subject line *(subjects)*

| # | Rule |
|---|---|
| 1 | Write the subject for the reader who will never open the commit |
| 2 | Use the imperative: name the act, not the aftermath |
| 3 | Make the subject falsifiable |
| 4 | State the effect, not the mechanism — unless the mechanism is the news |

## Chapter II — the body *(commit bodies)*

| # | Rule |
|---|---|
| 5 | Record what evaporates |
| 6 | State the problem before the solution |
| 7 | Write complete sentences, in order of importance |
| 8 | Address posterity, not the approver |
| 9 | End with the trailers, exactly spelled |

## Chapter III — documentation *(documents)*

| # | Rule |
|---|---|
| 10 | First sentence: X is a Y that Z |
| 11 | One document, one reader |
| 12 | Lead with a worked example, and make it complete |
| 13 | Answer the five questions in order |
| 14 | Keep the BUGS section, and tell the truth in it |

## Chapter IV — comments and the placement of truth

**This is the chapter that governs code review.**

### Rule 15. Give every fact one home; let every other mention point. *(all prose)*

> "The moment a fact appears in the code, a comment, the README, and the wiki,
> three of the four copies are future lies — you just don't know which three
> yet."

The instrument is grep, not reading. Pick the facts most likely to change —
limits, defaults, measurements, invariants — and count occurrences. More than
one authoritative-looking occurrence is a finding.

The home is the most checkable place available: code, a test, or a generated
reference. Everything else points.

### Rule 16. Comment what the code cannot say. *(comments)*

Intent, invariant, the reason the simpler approach fails. Never what the code
already says slower.

> "If a comment would survive being checked against the code by a machine —
> because it says nothing the code doesn't — it should not survive being
> checked by you."

### Rule 17. Spend your prose at the interface. *(comments)*

The declaration's comment is the contract; the body is one implementation of
it. Callers compile against your sentence, not your body. **Preconditions or
silence.**

Test: read only the interface comment, then write a call. Needed the body? The
contract is incomplete. Told you how the body works? It overspent.

### Rule 18. Sign the cliffs; skip the coastline. *(comments)*

Internals stay undocumented — the reader who needs them has the source, which
is always current, being the thing itself. The exception is the boundary of
surprise, written at the exact line it governs.

**Locality is a claim.** A comment three lines above the code it describes is
already lying about something.

Three things never worth the debt:

- **history** — the past has a whole subsystem, git, staffed and indexed
- **aspirations** — a TODO in code is a tracked item that escaped tracking
- **the implementation narrative** — it freezes what most needs to stay free

### Rule 19. A change to behavior changes its documentation in the same commit. *(all prose)*

"Docs to follow" is where docs go to not exist.

## Chapter V — style *(all prose)*

| # | Rule |
|---|---|
| 20 | Place yourself in the background — blunt about code, silent about character |
| 21 | One concept, one word, everywhere |
| 22 | Earn the aphorism — write it *after* the explanation it compresses |

## The fifteen sins

Report by name. A named error shames faster than a paragraph of theory; a sin
you cannot detect is a sermon, so each carries its detection.

| # | Sin | What it is | Detect |
|---|---|---|---|
| 1 | **The Hostage Note** | `i++ // increment i` — proof the author was at the keyboard | deletion test |
| 2 | **The Afternoon** | "First I looked at X, then I noticed Y" | first-person past narration |
| 3 | **The Unfalsifiable Subject** | "cleanup", "various fixes" | can the diff confirm it? |
| 4 | **The Tombstone** | the comment describing what the code used to do | grep "previously", "used to", "the old", "before #" |
| 5 | **The Apology Tour** | "this is a bit hacky, sorry" | grep "hacky", "sorry" |
| 6 | **The Greenhouse** | the example that only runs in the author's environment | run it clean |
| 7 | **The Adjective Stack** | properties claimed in units that do not exist | per adjective, ask *in what unit?* |
| 8 | **The Echo** | prose reciting the artifact | reconstructible from the diff? |
| 9 | **The Docs-to-Follow** | behaviour merged on a promise | lint the string |
| 10 | **The Load-Bearing Link** | "see #4127 for why" | delete every link mentally; did the why go? |
| 11 | **The Thesaurus** | four terms, one concept, zero grep | term dictionary |
| 12 | **The Hedge** | "should probably", "seems to" | grep, then ask: verified or not? |
| 13 | **The Badge Wall** | the first screen spent proving the project is alive | is anything above the fold an answer? |
| 14 | **The Orphaned Why** | the constraint filed away from the code it constrains | at each invariant, is the sign in the neighbourhood? |
| 15 | **The Confident Essay** | length worn as authority | falsifiable sentences, checked |

## The two tests that decide most findings

**The deletion test.** Strike the comment, reread the code. If nothing is
missing, the comment was ornament.

**The converse, which is sharper.** Could a maintainer violate this comment's
claim without noticing? *If no claim can be violated, no claim was made.*

The converse is what saves good comments from an over-zealous deletion pass. A
comment explaining why `[ \t]` and not `\s` survives both tests: strike it and
someone "simplifies" the character class next month.

## The confessions

Nine authors, each naming the rule they break and when. These are the licensed
exceptions — cite them when a finding does not hold, and never present a split
reading as consensus.

- **Ritchie, against Rule 16** — in *teaching code*, comments that narrate the
  obvious are the point. Pedagogy licenses what production forbids. This one
  comes up constantly in test files.
- **Cox, against Rule 7** — when the conclusion is unbelievable without the
  journey, the *derivation* earns its place. The afternoon stays forbidden. The
  difference: a derivation could convince a stranger; an afternoon only
  describes the author.
- **Thompson, against all of them** — in code written for oneself alone. The
  rules price the reader's time above the writer's; when the writer is the
  reader, the price is wrong.
- **Kernighan, against Rule 11** — a book braids reference and teaching,
  because it has a spine and an index.
- **McIlroy, against Rule 12** — for sharp tools, preconditions before
  invitations.
- **Bernstein, narrowing Rule 14** — no published suspicions in
  security-sensitive documentation; a stated weakness is a treasure map.
- **de Raadt, against Rule 20** — when the background caused the bug, name the
  vendor. Softening it deletes the lesson.
- **Pike, against Rule 4** — when the mechanism is a landmine, make the pattern
  radioactive in the subject.
- **White, against Rule 21** — where the twelfth repetition would deafen the
  reader to the one that matters. Even grep forgives a pronoun.
