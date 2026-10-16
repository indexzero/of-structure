---
_id: a0f9edad7dccb008ed4b0b89e178c5e02eb52fbd1ecc6e64a4ce1c722fa7d05c6
_rev: "8e0f4582d11fab06b948e0c3cf4b3f1892b15eac3c0f9f654a435576e9d54afc"
type: draft
title: "The Elements of Documentation — the Engineer's draft"
---

# THE ELEMENTS OF DOCUMENTATION

*Rules, and the prices they charge.*

---

**Dedication.** For the engineer at midnight, two years from now, who cannot
ask us anything. Every rule in this book is an answer she will need.

**Epigraphs.**

> Record what evaporates.

> The bad message wasn't cheaper to write — it was only cheaper to think.

---

## Preface

This book has one reader, and every rule serves her. She is the engineer two
years from now, bisecting a failure at midnight, who finds your commit at the
bottom. She cannot ask you anything. Your message is the only interview you
will ever give her. Serve her and every other reader — the novice, the expert,
the machine — is served for free. The reverse is not true.

Each rule below is a command in one line, followed by the reasoning, an
example of obedience, and an example of sin. Each rule names its scope —
*(commits)*, *(reference)*, *(teaching)*, *(all prose)* — because a rule
applied to the wrong reader is a bug wearing a badge of virtue. Reference says
a thing once; teaching says it twice, differently, on purpose. Know which
document you are in before the first sentence.

Five of these twenty-two rules a machine can enforce today: subject length and
form, trailer spelling, examples that run, one term per concept, and the
same-commit drift check. Automate those five, so review can spend its whole
attention on the seventeen that need a human. Lint the form; review the truth.

Everything in this book is three commandments wearing work clothes: omit
needless words; the words that remain, make true; and of the true words, keep
the ones the reader cannot get anywhere else.

Apply the rules to the commit you are writing right now. That is what they
are for.

---

## Chapter I — The Subject Line

*Fifty characters, read a thousand times.*

The subject line is read a hundred times for every read of the body, and a
thousand times for every read of the diff. In `git log --oneline` it is all
that survives. These four rules govern the most-read sentence you will write
this week.

The mechanical form, first, because you need it before the philosophy:

```
address: claim
```

The **address** names the territory — package, subsystem, directory:
`net/http`, `pool`, `docs`. Then a colon and a space. The **claim** is a
lowercase imperative sentence with no terminal period:

```
net/http: don't crash when the request has no body
```

Lowercase after the colon, because the address already did the capital's job
of starting the line. No period, because a subject is a heading, and headings
don't take periods. Aim under about fifty characters; past seventy, every
tool you use will amputate the end, so put the news in the front half. The
subject must grep well: it is a line in a pipeline, and every stage downstream
of you — `--oneline`, blame views, release scripts, a colleague's eyes —
agrees on that format. Uniformity is elegance at this scale.

### Rule 1. Write the subject for the reader who will never open the commit. *(commits)*

Most readers of your subject are doing triage over five hundred of them,
deciding in under a second whether this commit concerns them. The subject
must let them decide. The address-and-claim form above is the practice; the
principle is that the subject survives alone, stripped of body and diff, and
must still carry the one fact the scanner needs.

Sin: `Fixed some issues with connection handling`
Obedience: `pool: return connections to the pool after idle timeout`

### Rule 2. Use the imperative: name the act, not the aftermath. *(commits)*

Write `fix the leak`, not `fixed the leak` or `fixes the leak`. The commit is
not a diary entry; it is an instruction to the tree: apply this, and the leak
is fixed. The imperative also carries an honest humility — "fixed" announces
a fact about the past the commit cannot promise, since the bug may outlive
it. The imperative names an intention, like a function name: `fixLeak()`,
never `leakWasFixed()`.

Sin: `parser: fixed the crash on empty input`
Obedience: `parser: don't crash on empty input`

### Rule 3. Make the subject falsifiable. *(commits)*

A reader must be able to check the subject against the diff in under a
minute. `qmail-smtpd: reject bare LF` — verifiable in thirty seconds.
`cleanup` — you can verify nothing, so you must verify everything, so the
message saved you nothing. The subject is the only part of the change most
people will ever audit; an unfalsifiable subject is decoration, and
decoration invites forgery. `cleanup`, `various fixes`, and `improvements`
are therefore forbidden.

Sin: `improve error handling`
Obedience: `smtpd: reject bare LF in message data`

### Rule 4. State the effect, not the mechanism — unless the mechanism is the news. *(commits)*

`use sync.Once in dial` tells the reader what the diff would tell her in ten
seconds. `dial: connect only once per address` tells her the thing the diff
cannot: the behavior she may now rely on. Name the effect. The exception is
when the mechanism *is* the point — a revert, a vendoring bump, a rename —
and then say the mechanism plainly: `runtime: revert CL 12345` is a fine
subject. The rule beneath both halves: say the thing the reader cannot get
elsewhere.

Sin: `dial: use sync.Once`
Obedience: `dial: connect only once per address`

---

## Chapter II — The Body

*Rules for the midnight reader.*

The diff records the *what*, perfectly and forever. The *why* evaporates the
moment you forget it. The body exists to record exactly the part that
evaporates, and nothing else.

**When is a body owed?** Apply this test: would a competent reader of the
diff still have a question? If not, write no body. `spell: fix typo in error
message` owes nothing; its why is self-evident for as long as the diff
exists, which is forever. The empty body is not an exemption from the
standard — it *is* the standard, applied. But measure the debt by the diff's
consequence, never by its size. `increase timeout to 30s` always owes a body,
and the one-liner "the CI runners got slower after the migration to arm64"
pays it in full. One-character diffs have shipped root holes; if the one
character matters, the message says why. `if (a = b)` to `if (a == b)`
deserves a paragraph.

**The skeleton.** When a body is owed, build it in this order:

1. **The problem** — stated so a reader with no context believes the problem
   exists.
2. **The fix, as intent** — what invariant is now true that wasn't.
3. **Only if needed:** alternatives rejected and why; costs accepted
   knowingly; what to look at first if this turns out to be wrong.
4. **The trailers** — machine lines, at the bottom, exactly spelled.

If the bug was interesting, add one sentence on the *shape* of the trap —
"the race only fires when the timer wraps" — not the story of finding it.
That sentence is the difference between a log entry and a lesson.

### Rule 5. Record what evaporates. *(commits)*

The body carries the why, the rejected alternatives, and the knowingly
accepted costs — and nothing the reader already holds in her hands. Not the
file list (the diffstat exists). Not a recitation of the hunks (she has
eyes). The early Unix commits had no bodies, and their authors answered email
about three-character flags for forty years. The archive laughs last.

Sin: `Modified pool.go and pool_test.go. Renamed foo to bar, updated callers.`
Obedience: `The timeout path now releases the slot through the same put() as the normal path, so the count can no longer drift from the live set.`

### Rule 6. State the problem before the solution. *(commits)*

Paragraph one earns the reader's belief that a problem exists; paragraph two
states the invariant that now holds. A body that opens with the fix is a
proof with no theorem — the reader has a solution and no way to judge it.
Statement of the problem is also the cheapest self-review you will ever run:
if you cannot state the problem convincingly, you may not have one.

Sin: `Switch to a channel-based design for the pool.` *(opening line — a proof with no theorem)*
Obedience: `Connections that hit the idle timeout were closed but never removed from the pool's active count, so the pool eventually reported itself full while holding no live connections.`

### Rule 7. Write complete sentences, in order of importance. *(commits)*

A sentence forces a claim — subject, verb, promise. A fragment gestures at
one: "also refactor" never has to say what was refactored, or toward what.
And order the sentences by importance, not by discovery. Half of all rejected
commit bodies are archaeology — "first I looked at X, then I noticed Y" —
the author narrating their afternoon. Nobody cares about your afternoon.
State the conclusion. State why it's right. Stop.

Sin: `fixed leak. also refactor. tests pass`
Obedience: `The pool leaked one slot per idle timeout. The timeout path now releases through put(). The tests missed it because the test pool's timeout exceeded the test duration.`

### Rule 8. Address posterity, not the approver. *(commits)*

Nothing for the reviewer — no "please look carefully at the locking" — and
nothing about the process that produced the change. The review dies within
the week; the log is forever. The same discipline governs links: the message
must stand alone on the *why*, because the tracker is a different system with
a different lifetime, and the day it is migrated, a load-bearing link becomes
a locked box labeled "key elsewhere." Summarize the verdict in the message;
cite the issue for the archaeology — repro logs, benchmarks, dead ends. The
extras, never the essence.

Sin: `See the discussion in #4127 for why. Please review carefully!`
Obedience: `…so Get blocked forever once the counter drifted (full analysis and benchmarks in #4127). Fixes #4127`

### Rule 9. End with the trailers, exactly spelled. *(commits)*

The last audience is the machine, and the machine reads only the bottom.
Trailers are machine lines, one per line, in the machine's dialect, spelled
exactly:

```
Fixes #4127
Co-authored-by: Ada Lovelace <ada@example.com>
Reviewed-by: Grace Hopper <grace@example.com>
```

`Fixes #4127` closes the issue; `fixes issue 4127`, `Fixed #4127`, and
`Fixes: #4127` (where the tracker takes no colon) close nothing, silently.
Check your forge's accepted verbs once and use them forever. Trailers go
below the prose, after a blank line, never woven into a paragraph — machines
look at the bottom, and only there.

Sin: `This fixes the issue we discussed (4127 I think).`
Obedience: `Fixes #4127`

### Worked example — the commit message

The specimen, from the wild:

```
Fixed some issues with the connection handling code. There were
several problems that this PR addresses. First I noticed that the
pool wasn't working right so I investigated and found that it was
related to how we were handling timeouts. Also refactored some
stuff in pool.go to be cleaner and more maintainable going forward.
Please review carefully since this touches critical code!
Various other small fixes included as well.
```

Every sentence unfalsifiable (Rule 3). Past tense narrating the afternoon
(Rules 2, 7). "Cleaner and more maintainable going forward" — three phrases,
no information. "Please review carefully" — addressed to the approver, dead
within the week (Rule 8). And "various other small fixes" is the confession
that this should have been more than one commit: Rule 3 cannot hold a
subject over a mixed diff, so the refactor rides separately.

The cure, commit one:

```
pool: return connections to the pool after idle timeout

Connections that hit the idle timeout were closed but never removed
from the pool's active count, so the pool eventually reported itself
full while holding no live connections. New requests then blocked
forever in Get.

The timeout path now releases the slot through the same put() as the
normal path, so the count can no longer drift from the live set.

The leak was invisible in tests because the test pool's timeout
exceeded the test duration.

Fixes #4127
```

Commit two: `pool: hoist dial retry out of Get`, with its own body, whose
claim — "no behavior change" — is stated as the falsifiable claim it is.

Notice what the rewrite cost: nothing. Every sentence came from knowledge
the original author held and withheld. The bad message wasn't cheaper to
write — it was only cheaper to think.

---

## Chapter III — Documentation

*READMEs, references, tutorials, man pages.*

### Rule 10. First sentence: X is a Y that Z. *(all documents)*

The first sentence of any document says what the thing *is*: subject,
category, distinguishing property. "Vault-LD is a multi-writer wiki on
autobee." Not what it enables, not what it believes in, not how it compares,
and never what it *isn't* — negation is not identity. A reader who stops
after one sentence stops informed. This is the topic sentence, promoted to
institution.

Sin: `Flowlite is a blazingly fast, lightweight, developer-first framework for building next-generation data pipelines with unparalleled DX.`
Obedience: `Flowlite runs data pipelines defined as plain Python functions, on one machine, without a scheduler service.`

### Rule 11. One document, one reader. *(all documents)*

Decide which reader you serve before the first sentence, say so in the first
screen, and route the other reader away by link: "This page is the reference
for X; for the tutorial, see Y." One line; both readers routed. Reference is
austere and complete; the tutorial is warm and long; neither apologizes for
the other. The sin is the hybrid that alternates modes paragraph by
paragraph — reference interrupted by pep talk — which serves neither reader
and lies to both about what it is. No document is a hallway and a room at
once.

Sin: a man page whose DESCRIPTION pauses twice to say "don't worry if this seems complicated!"
Obedience: `This page is the flowlite(1) reference. New here? Start with the tutorial: docs/tutorial.md.`

### Rule 12. Lead with a worked example, and make it complete. *(teaching)*

An example is the one form of documentation the author cannot fake. Prose
can bluff — "handles errors gracefully" — but the example either runs or it
doesn't. Lead with one, and make it *complete*: select, paste, run. No
ellipses, no "assuming the setup from chapter 2," no invisible
prerequisites. An example that fails on paste is worse than none — it
teaches the reader to distrust the whole document. Where the tooling allows,
compile the examples in CI: prose under test, rot caught before a reader
finds it.

Sin: `result = client.query(...)  # assumes client from earlier`
Obedience: a first code block that begins with the import and ends with output the reader can compare against her screen.

### Rule 13. Answer the five questions in order. *(reference)*

What is it. How do I invoke it. What does it do. Show me. What will bite me.
NAME, SYNOPSIS, DESCRIPTION, EXAMPLES, BUGS — fifty years of proof the order
is right, because every section answers exactly one question a reader
arrives with, and sections are routing. The README is the modern man page
and the questions are unchanged: a README that answers all five in the first
screen is complete, and everything after it is appendix. A logo, six badges,
and a paragraph of adjectives answer none of them.

Sin: first screen = logo, twelve badges, "Why Flowlite?"
Obedience: first screen = what it is, the install line, one worked example, the sharp edge.

### Rule 14. Keep the BUGS section, and tell the truth in it. *(reference)*

A document that admits one true fault is believed about everything else.
State known deficiencies plainly, dated if possible: "slow on trees deeper
than 10,000 nodes (measured 2025-11)." Omitting a deficiency does not fix
it; it only ensures the reader discovers it at the worst time, alone, and
then distrusts the rest of the page. The confession is the credential.
Confess deficiencies you'd bet on — accuracy is what makes the credential —
and in security-sensitive documents, keep suspicions out of print: a stated
"this area is probably weak" is a treasure map.

Sin: no BUGS section, and a closed issue titled "known: crashes on symlink loops" marked wontfix.
Obedience: `BUGS: follows symlink loops until the stack dies; use --max-depth on untrusted trees.`

### Worked example — the README first screen

The specimen:

```
# ⚡ Flowlite ⚡
[12 badges]
Flowlite is a blazingly fast, lightweight, developer-first
framework for building next-generation data pipelines with
unparalleled DX. Built from the ground up with performance
in mind. No bloat. Batteries included.
## Why Flowlite?
We believe data engineering should spark joy...
```

"Blazingly fast" — compared to what, measured how? "Lightweight" — in what
unit? "No bloat. Batteries included" — two slogans, contradicting each
other, three words apart. Zero distinguishing properties; after four lines
the reader still does not know what it *does*.

The cure, four sentences:

> Flowlite runs data pipelines defined as plain Python functions, on one
> machine, without a scheduler service. A pipeline is a function; a
> dependency is an argument. If you need distributed execution or a UI, use
> Airflow — Flowlite is for the case where Airflow is too much.

Category, property, boundary — and the honest routing of the wrong reader,
which is the roadmap in reverse: what it refuses to do, checkable today.

### The changelog is not the commit log

Conflating them ruins both. The commit log addresses the *maintainer of the
code*; the changelog addresses the *operator of the software*. Different
reader, different unit: the commit's unit is a change to the tree; the
changelog's unit is a change to the user's world — a flag added, a default
altered, a behavior gone. Most commits produce no changelog line; some
changelog lines summarize forty commits. Generating one from the other is
Rule 11 violated by machine: two readers, force-fed one document.

The changelog entry's grammar: **what changed for you, what you must do
about it, nothing else.** "Upgraded internal parser" is a commit fact; the
changelog line is "dates before 1970 no longer parse as errors."

### The deprecation notice: the four-parter

The deprecation notice is the only documentation written *to* someone you
are actively inconveniencing, and it is usually written as if to someone you
are rid of. "Deprecated: use NewThing instead" has never once contained
enough information to act on. The complete form has four parts, and it fits
in four lines:

1. **What stops working.**
2. **When it stops** — a date or a version. "Deprecated" without a date is a
   mood, not a notice; the reader plans around dates, not vibes.
3. **The one-to-one replacement, shown, not named** — old call above, new
   call below.
4. **The escape hatch** for the case where the mapping isn't one-to-one.

```
Deprecated: Client.Do(req) is removed in v3.0 (2026-10).
Replace:  resp := client.Do(req)
With:     resp := client.Send(ctx, req)
No context to pass? Use context.Background() and see MIGRATION.md §2.
```

The migration guide ships in the same commit as the breaking change — Rule
19 applied to the future. If writing the migration table is too much work,
you have just measured the pain you are about to ship, multiplied by your
user count. Reconsider the break. And have the courage to finish the
sentence: announce, date, remove. A deprecation that lives five years is a
lie about your intentions.

---

## Chapter IV — Comments and the Placement of Truth

*Where facts live, so they cannot lie.*

### Rule 15. Give every fact one home; let every other mention point. *(all prose)*

The moment a timeout value appears in the code, a comment, the README, and
the wiki, three of the four are future lies — you just don't know which
three yet. State each fact once, where it is checkable — code, test, or
generated reference — and let every other mention point at the home instead
of copying it. This convicts most wikis: a wiki is where facts go to escape
review — no diff, no reviewer, no test, no owner. Documentation lives in the
tree, versioned with the code it describes, or it drifts alone.

Sin: `// times out after 30 seconds` above `timeout = flag.Duration("timeout", 45*time.Second, …)`
Obedience: `// Timeout policy: see the -timeout flag definition below; ops runbook points here.`

### Rule 16. Comment what the code cannot say. *(comments)*

A comment cannot be executed, so nothing catches it lying; every comment
starts life as a small debt. So the bar is high: a comment says what the
code *cannot* — intent, invariant, the reason the simpler approach fails.
Never what the code already says slower. `i++ // increment i` is not
documentation; it is a hostage note proving the author was alive at the
keyboard. And put the comment on the line it governs: a comment three lines
above its code is already lying about something, because locality is a
claim.

Sin: `i++ // increment i`
Obedience: `i++ // consume the delimiter; the parser loop must not see it twice`

### Rule 17. Spend your prose at the interface. *(comments)*

The comment on the declaration is the contract; the code below it is merely
one implementation. Callers compile against your sentence, not your body —
which makes the interface comment the most load-bearing prose in the system,
and the place your maintenance budget goes. The amendment that governs its
content: preconditions or silence. "Assumes the lock is held" prevents a
category of bug; "loops over the array" prevents nothing.

Sin: `// helper for connections` on an exported function
Obedience: `// Get returns an idle connection or dials a new one. The caller must Return it; Get blocks when the pool is at capacity.`

### Rule 18. Sign the cliffs; skip the coastline. *(comments)*

Do not document the internals as narrative — a travelogue of how it
currently happens to work freezes the very thing that must stay free to
change, and the reader who needs internals has the source, which is always
current, being the thing itself. Document internals only at the boundary of
surprise: the sorted array that must stay sorted, the field that aliases
another, the invariant a maintainer would never guess — stated at the exact
line it governs. A warning sign at the cliff, not a tour of the coast.

Sin: a 40-line block comment walking through the function's phases.
Obedience: `// entries stays sorted by expiry; evict() binary-searches it. Insert only via add().`

### Rule 19. A change to behavior changes its documentation in the same commit. *(all prose)*

Same commit, same review — that is the whole mechanism. If the doc cannot
drift *separately* from the code, it drifts less. "Docs to follow" is where
docs go to not exist; the follow-up commit has a documented survival rate of
nil. Enforce it in review; better, enforce it in CI — a drift check, a doc
lint, an example that compiles. Let the machine blush for you.

Sin: `add --parallel flag` with `TODO: document in a follow-up`
Obedience: one commit: the flag, its man page entry, and the changelog line, reviewed together.

Two more placement laws, briefly, because they name what *not* to write.
History: "previously this used a linked list" belongs in the log, not the
comment — the commit message is where the past lives; the comment is where
the present lives; confusing them is how you get comments that read like
tombstones. Aspirations: a TODO in code is a tracked item that escaped
tracking — no owner, no date, mostly false within a year. File it where
undone work is counted, or delete it.

---

## Chapter V — An Approach to Style

*One page. It earns it.*

### Rule 20. Place yourself in the background. *(all prose)*

The record exposes the change, not the author's temperament. Be blunt about
code — "this was wrong for nine years and the test was wrong the same way"
is a fact pattern, and softening it deletes the lesson. Be silent about
character — "whoever wrote this was careless" is speculation, in the
permanent record, about a person who worked under constraints you cannot see
from here. The git log is not the place to win an argument with a ghost;
even `git blame` names lines, not character.

### Rule 21. One concept, one word, everywhere. *(all prose)*

Pick one term per concept and spell it the same at every occurrence. Grep is
a reader: the searcher who finds half your mentions trusts all of them. The
second-language reader is the majority of programmers now; idioms —
footguns, punting — cost her what jargon costs the novice. Use a technical
term only when its precision is required, and then use it correctly; when it
isn't, the plain phrase is not dumbing down — it is telling the truth about
how much precision the sentence contains. Plain words travel. Short words
travel farther. The thesaurus is where documentation goes to die.

### Rule 22. Earn the aphorism. *(all prose)*

Default to the plain long sentence. Compression is a dialect of experts —
"obviously wrong, revert" lands from the veteran because forty years of
context decompress it, and teaches the junior only fear. Most readers of
your prose are still earning the dialect; write so the reader who knows
least loses least. But when a sentence can carry a chapter, let it. One fish
per thousand pages — the manual that ended "you can tune a file system, but
you can't tune a fish" bought the reader's affection for a thousand dry
pages — and never in the load-bearing sentence: a joke in the SYNOPSIS is a
bug; a joke in BUGS is a feature. Style is the sound sense makes.

---

## Appendix A — The Sins

Fifteen named anti-patterns. Errors with names shame better than paragraphs
of theory.

1. **THE HOSTAGE NOTE.** `i++ // increment i`. A comment proving only that
   the author was present at the keyboard.
2. **THE AFTERNOON.** "First I looked at X, then I noticed Y…" The author
   narrating their day instead of stating their conclusion.
3. **THE UNFALSIFIABLE SUBJECT.** "cleanup," "various fixes,"
   "improvements." A claim no diff can confirm or deny, therefore worthless
   as a filter.
4. **THE TOMBSTONE.** The comment describing what the code used to do.
   History belongs to the log; the comment lies in the present tense.
5. **THE APOLOGY TOUR.** "This is a bit hacky, sorry" — self-deprecation
   standing where the actual constraint should be. Say why the hack is
   necessary, or fix it. Shame is not documentation.
6. **THE GREENHOUSE.** Docs that only work in the author's environment — the
   example with invisible prerequisites, the setup that "assumes chapter 2."
7. **THE ADJECTIVE STACK.** "Blazingly fast, lightweight, powerful" —
   properties claimed in units that don't exist. Measurements have numbers;
   the rest is weather.
8. **THE ECHO.** The commit body that recites the diff. "Renamed foo to bar,
   updated callers." The reader has eyes.
9. **THE DOCS-TO-FOLLOW.** The behavior change merged with a promise of
   future documentation. The follow-up has a documented survival rate of
   nil.
10. **THE LOAD-BEARING LINK.** "See #4127 for why." The why, outsourced to a
    system with a different lifetime. When the tracker dies, the commit
    becomes a locked box labeled "key elsewhere."
11. **THE THESAURUS.** The document that says node, vertex, element, and
    item, and means one thing. Four terms, one concept, zero grep.
12. **THE HEDGE.** "Should probably," "seems to," "I think this fixes." If
    you verified it, say so plainly; if you didn't, say *that* plainly.
    Uncertainty is honest; vagueness about your uncertainty is not.
13. **THE BADGE WALL.** Twelve shields announcing CI status, coverage, chat
    channels — the first screen spent proving the project is alive instead
    of saying what it is.
14. **THE ORPHANED WHY.** The constraint documented nowhere near the code it
    constrains — the invariant in a wiki, the warning in a README, the cliff
    sign filed in a drawer three buildings from the cliff.
15. **THE CONFIDENT ESSAY.** Length worn as authority; a thousand words,
    wrong in every paragraph. Length reads as diligence and is not
    diligence. Verification saves you; style does not.

---

## Appendix B — The Confessions

A rule book written by people who never break the rules is written by people
who never write. Each author of these rules names the one he breaks, and
when. The honest subtitle of this book — rules, and the prices they charge —
is paid here.

1. **Pike breaks Rule 4** (effect over mechanism) when the mechanism is a
   landmine for the next person: `runtime: don't use cgo in the signal
   handler`. The effect was "fix a rare crash," but the subject's job that
   day was to make the pattern radioactive. Sometimes the subject is a
   warning label, not a summary.
2. **Kernighan breaks Rule 11** (one document, one reader) in a book,
   deliberately. A book can braid reference and teaching because it has a
   spine and an index — the reader can enter twice. The rule is really about
   documents with one door.
3. **McIlroy breaks Rule 12** (lead with the example) when the concept is
   dangerous half-understood. `rm` does not want an inviting example at the
   top of the page. For sharp tools, preconditions before invitations: the
   reader you hook is the reader you're responsible for.
4. **Thompson breaks all of them**, in code he writes for himself. The rules
   price the reader's time above the writer's; when the writer is the
   reader, the price is wrong. The mistake is only forgetting which kind of
   code you're in.
5. **Ritchie breaks Rule 16** (comment what the code cannot say) for the
   reader-in-training: in teaching code, comments that narrate the obvious
   are the point — the annotated program is a genre of its own. Pedagogy
   licenses what production forbids.
6. **Cox breaks Rule 7's** "conclusion first" when the conclusion is
   unbelievable without the journey — some fixes are so strange the reader
   rejects the summary until walked to it, and the message reads like a
   proof because the claim looked insane. The afternoon is forbidden; the
   *derivation* is not. The difference: a derivation could convince a
   stranger; an afternoon only describes the author.
7. **Bernstein narrows Rule 14** (the honest BUGS section) in
   security-sensitive documentation: a published suspicion is a treasure
   map. Confess deficiencies you'd bet on, or say nothing. The credential is
   the confession's accuracy, not its existence.
8. **de Raadt breaks Rule 20** (author in the background) every time the
   background caused the bug. When code is wrong because a vendor lied or a
   standard is malignant, the commit says so, with the vendor's name.
   Posterity deserves the indictment; softening it would be deleting the
   lesson.
9. **White breaks Rule 21** (one concept, one word) at the sentence where
   the twelfth repetition of the page's one word would deafen the reader to
   the occurrence that matters. Even grep forgives a pronoun.

---

## Closing

Documentation is the part of the program that runs on people — write it,
test it, review it, and delete it to the same standard as the code. The diff
says what; the message says why; anything else, one of them is lying. Say it
once, say it true, stop. And write, always, for the reader who cannot ask
you anything — because soon every reader is that reader.
