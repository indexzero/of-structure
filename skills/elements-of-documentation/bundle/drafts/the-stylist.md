---
_id: a0f9edad7dccb008ed4b0b89e178c5e02eb52fbd1ecc6e64a4ce1c722fa7d05cc
_rev: a8896399c7fa8b6bb1a0cbcf2b3f920b8d676a60f38ca2880c2cb3179cc64da1
type: draft
title: The Elements of Documentation
---

# The Elements of Documentation

*Rules, and the prices they charge*

---

*For the engineer at midnight, two years from now, who cannot ask us
anything. Every rule in this book is an answer she will need.*

---

> Record what evaporates.

> The bad message wasn't cheaper to write — it was only cheaper to think.

---

## Preface

This book has one reader in mind, and she appears on the dedication page:
the engineer bisecting a failure at midnight, two years from now, who
cannot ask the author anything. Every rule here was tested against her
need. The novice, the expert, and the machine are all served by serving
her; the reverse is not true.

Each rule is stated as a command in one line and names its scope in
parentheses — *(subjects)*, *(bodies)*, *(reference)*, *(teaching)*,
*(all prose)*. A rule applied outside its scope is not rigor. It is a bug
wearing a badge of virtue. The original *Elements of Style* legislated
for one genre, the undergraduate essay, and its cargo cult forgot this;
we say it on the first page so no one can claim we hid it.

A few of these rules a machine can enforce: the shape of a subject line,
the spelling of a trailer, the example that must compile. Let it. The
lint buys back the reviewer's attention for the seventeen rules that need
a human. Lint the form; review the truth.

The whole book is three commandments wearing work clothes. Omit needless
words; the words that remain, make true; and of the true words, keep the
ones the reader cannot get anywhere else. Everything that follows is one
of those three, dressed for a particular job.

One more thing, because the subtitle promises it. Rules charge prices,
and the authors of this book have all, on occasion, declined to pay.
Appendix B records where, and why. A rule book written by people who
never break the rules is written by people who never write.

---

## Chapter I — The Subject Line

*The fifty characters read a thousand times.*

The subject line is read a hundred times for every time the body is
read, and a thousand times for every time the diff is read. It is a
caption, not the picture; the diff is the picture. But it is a caption
that must survive alone, because `git log --oneline` strips everything
else away.

### Rule 1. Write the subject for the reader who will never open the commit. *(subjects)*

Most readers of a subject line are doing triage: five hundred subjects,
one second each, deciding which concern them. The subject must let that
reader decide, in one second, whether this commit is hers. Everything
else about the form follows from this duty.

The practice: begin with the address, then the claim. The prefix names
the territory — package, subsystem, area — then a colon, then a
lowercase summary with no terminal period. The prefix is the address;
the sentence is the payload. Lowercase after the colon, because the
prefix already did the capital's job of starting the line. No period,
because a subject is a heading, and headings do not take periods.
Also it is one less character.

> *Sin:* `Various fixes and improvements`
> *Obedience:* `net/http: don't crash when the request has no body`

A reader scanning at scale needs uniformity more than she needs
elegance. Uniformity, at that scale, is elegance. Write subjects that
grep well.

### Rule 2. Use the imperative: name the act, not the aftermath. *(subjects)*

Write "fix the leak," not "fixed the leak" or "fixes the leak." The
commit is not a diary entry; it is an instruction to the tree — apply
this, and the leak is fixed. The imperative names the act the way a
function name does: `fixLeak()`, not `leakWasFixed()`.

There is honest humility in the mood as well. "Fixed" announces a fact
about the past that the commit cannot actually promise; the bug may
outlive the commit. The imperative names an intention, which is the
only thing the author truly owns.

> *Sin:* `Fixed the race in the timer path`
> *Obedience:* `timer: fix race between reset and expiry`

### Rule 3. Make the subject falsifiable. *(subjects)*

The subject line is the only part of the change most people will ever
audit. Hold it to the standard of an interface declaration: a reader
must be able to check the claim against the diff in under a minute.
"qmail-smtpd: reject bare LF" — verifiable in thirty seconds.
"cleanup" — you can verify nothing, so you must verify everything, and
the message has saved you nothing.

A subject is falsifiable or it is decoration, and decoration invites
forgery. "Various fixes," "improvements," "cleanup" are therefore
forbidden — not discouraged, forbidden. If your subject is "various
fixes," the reader already knows your diff is careless, because your
sentence was.

> *Sin:* `improve error handling`
> *Obedience:* `smtpd: reject commands containing a bare LF`

### Rule 4. State the effect, not the mechanism — unless the mechanism is the news. *(subjects)*

"use sync.Once in dial" tells the reader what she would learn from the
diff in ten seconds anyway. "dial: connect only once per address" tells
her the thing the diff cannot say: the behavior she may now rely on.
Never spend the subject on what the diff already shouts.

The exception earns its clause. When the mechanism *is* the point — a
revert, a vendoring bump, a rename — say the mechanism plainly.
"runtime: revert CL 12345" is a fine subject. The rule beneath both
halves: say the thing the reader cannot get elsewhere.

> *Sin:* `dial: use sync.Once`
> *Obedience:* `dial: connect only once per address`

---

## Chapter II — The Body

*Rules for the midnight reader.*

The diff preserves the what, forever and exactly. The why evaporates
the moment the author's attention moves on. The body exists to catch
what evaporates, and for no other reason. From this, everything in the
chapter follows — including when to write no body at all.

### Rule 5. Record what evaporates. *(bodies)*

The body holds the why, the alternatives rejected, the costs accepted
knowingly — and nothing the reader already holds in her hands. Not the
file list; the diff stat exists. Not a recitation of the change;
reciting the diff is reading the reader her own eyes. Only the part
that dies with you.

A body is owed when the diff leaves a question standing — measured by
the diff's consequence, never by its size. `spell: fix typo in error
message` owes nothing; its why is self-evident for exactly as long as
the diff exists, which is forever. The empty body there is not an
exemption from the standard; it is the standard, applied. But
"increase timeout to 30s" always owes its line — *the CI runners got
slower after the migration to arm64* — and the one-character change
from `=` to `==` may owe a paragraph. One-character diffs have shipped
root holes. If the one character matters, the message says why.

> *Sin:* `Modified pool.go and conn.go, updated tests accordingly.`
> *Obedience:* `The leak was invisible in tests because the test pool's timeout exceeded the test duration.`

### Rule 6. State the problem before the solution. *(bodies)*

Paragraph one earns the reader's belief that a problem exists, stated
so that a reader without context believes it. Paragraph two states the
fix at the level of intent: what invariant is now true that was not.
A third paragraph, only if needed, holds the alternatives rejected,
the costs accepted, and what to look at first if this turns out wrong.

A body that opens with the fix is a proof with no theorem. The reader
cannot judge a solution she has not yet been given a problem for.

> *Sin:* `Switch the timeout path to use put(). Also update the counter logic.`
> *Obedience:* `Connections that hit the idle timeout were closed but never removed from the pool's active count, so the pool eventually reported itself full while holding no live connections.`

### Rule 7. Write complete sentences, in order of importance. *(bodies)*

A sentence forces the writer to commit to a subject and a verb — which
is to say, to a claim. A fragment gestures at a claim without making
one. "also refactor" — what was refactored? Toward what? A sentence
would have had to say.

Order by importance, never by discovery. Half of all rejected bodies
are archaeology: "first I looked at X, then I noticed Y" — the author
narrating their own afternoon. Nobody cares about your afternoon.
State the conclusion. State why it is right. Stop. The journey is
scaffolding; tear it down before you ship the building.

> *Sin:* `First I noticed the pool wasn't working right so I investigated and found it was related to timeouts.`
> *Obedience:* `The timeout path now releases the slot through the same put() as the normal path, so the count can no longer drift from the live set.`

### Rule 8. Address posterity, not the approver. *(bodies)*

Nothing in the body for the reviewer. "Please look carefully at the
locking" belongs in review discussion, which dies within the week; the
commit message outlives the review by decades. Nothing about the
process that produced the change, either. The log is not a workplace;
it is a record.

On links: the commit message must stand alone on the why. "See the
discussion in #4127 for why" outsources the essence to a system with a
different lifetime; the day the tracker is migrated, the why is gone
and the commit is a locked box labeled *key elsewhere*. Summarize the
verdict; cite the trial. The link carries the archaeology — repro
logs, benchmarks, dead ends — the extras, never the essence.

> *Sin:* `Please review carefully since this touches critical code!`
> *Obedience:* `If this regresses, the suspect is the reordering of close() and release(); see the benchmark logs in #4127 for the measured cases.`

### Rule 9. End with the trailers, exactly spelled. *(bodies)*

The machine reads the bottom of the message, in the machine's dialect,
one line per fact. `Fixes #311` closes the issue; misspelled, it
closes nothing, silently. Put the trailers last, spell them exactly,
and keep prose out of them — they are the one part of the message
where style is forbidden and conformance is the whole virtue.

> *Sin:* `This should fix issue 311 I think.`
> *Obedience:* `Fixes #311`

### Worked example — the specimen and the cure

A specimen from the wild, unretouched:

```
Fixed some issues with the connection handling code. There were
several problems that this PR addresses. First I noticed that the
pool wasn't working right so I investigated and found that it was
related to how we were handling timeouts. Also refactored some
stuff in pool.go to be cleaner and more maintainable going forward.
Please review carefully since this touches critical code!
Various other small fixes included as well.
```

Every sentence is unfalsifiable: "some issues," "several problems,"
"working right," "some stuff." Six claims, zero checkable. The tense
narrates the afternoon. "Cleaner and more maintainable going forward"
is three phrases carrying no information, one of which names the
direction time already goes. "Please review carefully" addresses a
reader who will be gone in a week. And "various other small fixes" is
the confession that this commit should have been three.

The cure begins with the split: the timeout bug and the refactor ride
separately, because Rule 3 cannot hold a subject over a mixed diff.
Commit one:

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

Commit two: `pool: hoist dial retry out of Get`, with its own body,
whose whole claim — "no behavior change" — is stated as the checkable
thing it is.

Notice what the rewrite cost: nothing. Every sentence came from
knowledge the original author held and withheld. The bad message
wasn't cheaper to write — it was only cheaper to think.

---

## Chapter III — Documentation

*READMEs, references, tutorials, man pages.*

### Rule 10. First sentence: X is a Y that Z. *(all documents)*

The first sentence of any document says what the thing *is*: subject,
category, distinguishing property. Not what it enables, not what it
believes in, not how it compares. "Vault-LD is a multi-writer wiki on
autobee." A reader who stops after one sentence stops informed.

The anti-pattern is naming what it isn't. "X is not a framework" —
negation is not identity. Tell the reader what it is; she will work
out the complement herself. This rule is the topic sentence, promoted
to an institution: it holds for the README, for the man page, for the
book's own spine.

> *Sin:* `Flowlite is a blazingly fast, lightweight, developer-first framework.`
> *Obedience:* `Flowlite runs data pipelines defined as plain Python functions, on one machine, without a scheduler service.`

### Rule 11. One document, one reader. *(all documents)*

There is a reader for whom the precondition list is everything, and a
reader for whom it is a wall. The answer was never one document. It is
the oldest solution we have: the man page and the paper — reference
and narrative, separated, cross-linked, each pure, neither apologizing
for the other. The sin is the hybrid that alternates modes paragraph
by paragraph — reference interrupted by pep talk — which serves
neither reader and lies to both about what it is.

Declare in the opening line whether this is reference or teaching, and
route the other reader away by link: "This page is the reference for
X; for the tutorial see Y." One line; both readers routed. No document
should try to be a hallway and a room at once.

Brevity that locks out the second reader is not economy; it is
cost-shifting — a paragraph saved, and a thousand strangers each pay
an afternoon. Verbosity is cost-shifting too — it moves the afternoon
from the novice to the expert, who cannot find the load-bearing
sentence on page nine. Routing is how both debts are paid by the
author, once, where they belong.

> *Sin:* a tutorial paragraph, then a precondition table, then a pep talk, then a caveat, alternating to the end
> *Obedience:* `This page is the reference for awk. For the tutorial, see The AWK Programming Language.`

### Rule 12. Lead with a worked example, and make it complete. *(teaching)*

An example is the one form of documentation the author cannot fake.
Prose can bluff — "the tool handles errors gracefully" — but no such
sentence survives in an example. The example either runs or it does
not. The reader who has run something believes you; the reader who has
read four pages of abstraction is still deciding whether to.

Complete means paste-and-run complete. No ellipses, no "assuming the
setup from chapter 2," no invisible prerequisites. An example that
fails on paste is worse than none: it teaches the reader to distrust
the whole document. Where the tooling allows, examples compile in CI
— prose under test, caught by a machine before it is caught by a
stranger.

> *Sin:* `result = process(data)  # ... assuming config from above`
> *Obedience:* an example block a reader can select, paste, and run, from an empty directory, today

### Rule 13. Answer the five questions in order. *(reference)*

What is it. How do I invoke it. What does it do. Show me. What will
bite me. The man page anatomy — NAME, SYNOPSIS, DESCRIPTION, EXAMPLES,
BUGS — is fifty years old and unbeaten, because every section answers
exactly one question a reader arrives with. Sections are routing:
SYNOPSIS for the expert, EXAMPLES for everyone else.

The README is the modern man page, and it has lost the anatomy. Most
open with a logo, six badges, and a paragraph of adjectives. The
reader's five questions are unchanged. A README that answers them in
the first screen is complete; everything after is appendix. Strike the
roadmap from that first screen while you are there — promises about
the future are the least checkable claims in the document, and
badges are marketing wearing engineering's clothes.

> *Sin:* logo, twelve badges, "Why Flowlite?", a mission statement
> *Obedience:* what it is, the install line, one running example, what breaks — one screen

### Rule 14. Keep the BUGS section, and tell the truth in it. *(reference)*

Modern documentation omits known deficiencies as if omission fixed
them. The old BUGS sections — "this command is slow and stupid about
tabs" — bought reader trust at the price of author vanity, and it was
the best purchase in the manual. A document that admits one true fault
is believed about everything else. The confession is the credential.

State known deficiencies plainly, dated if possible. Confess
deficiencies you would bet on; the credential is the confession's
accuracy, not its existence.

> *Sin:* a documentation set with no admitted fault anywhere in it
> *Obedience:* `BUGS: pathological inputs with more than 64 nested groups make the matcher quadratic.`

### Worked example — the README first screen

The specimen, genus modern:

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

Run Rule 10 against it. X is a Y that Z — where Y is "framework" and
Z is a row of adjectives. Blazingly fast: compared to what, measured
how? Lightweight: in what unit? Developer-first: as opposed to the
frameworks built for non-developers? "No bloat. Batteries included" —
two slogans, contradicting each other, three words apart. After the
whole first screen the reader still does not know what it *does*.

The cure, in four sentences:

> Flowlite runs data pipelines defined as plain Python functions, on
> one machine, without a scheduler service. A pipeline is a function;
> a dependency is an argument. If you need distributed execution or a
> UI, use Airflow — Flowlite is for the case where Airflow is too
> much.

Category, property, boundary, and the honest routing of the wrong
reader. Note that the rewrite states what the tool refuses to do —
the roadmap in reverse, and checkable today.

### A note on the boundary genres

**The changelog** is not the commit log wearing a suit, and conflating
them ruins both. The commit log addresses the maintainer of the code;
the changelog addresses the operator of the software. The commit's
unit is a change to the tree; the changelog's unit is a change to the
*user's world* — a flag added, a default altered, a behavior gone.
Most commits produce no changelog line; some changelog lines
summarize forty commits. The entry's grammar: what changed for you,
what you must do about it, nothing else. "Upgraded internal parser"
is a commit fact; the changelog line is "dates before 1970 no longer
parse as errors." Generating one document from the other is Rule 11
violated by machine — two readers, force-fed one document.

**The deprecation notice** is the only documentation written *to*
someone you are actively inconveniencing, and it is usually written as
if to someone you are rid of. "Deprecated: use NewThing instead" has
never once contained enough information to act on. The complete form
has four parts and fits in four lines: what stops working; when it
stops; the one-to-one replacement, shown not named — old call above,
new call below; and the escape hatch where the mapping is not
one-to-one. "Deprecated" without a date is a mood, not a notice.
Announce, date, remove — the reader plans around dates, not around
vibes. And the migration guide is part of the breaking change: same
commit, same review. If writing the migration table is too much work,
you have measured exactly the pain you are about to ship, multiplied
by your user count, and you should reconsider the break.

---

## Chapter IV — Comments and the Placement of Truth

*Where facts live so they cannot lie.*

The comment's great vice is that it cannot be executed, so it cannot
be caught lying. The compiler checks the code; nothing checks the
comment against the code. Every comment therefore starts life as a
small debt. This chapter is about where to take on that debt, and
where to refuse it.

### Rule 15. Give every fact one home; let every other mention point. *(all prose)*

The moment a timeout value appears in the code, the comment, the
README, and the wiki, three of the four are future lies — you just do
not know which three yet. State the fact once, where it is checkable
— code, or test, or generated reference — and let prose point.
The copy is the future lie.

This convicts most wikis. A wiki is a place where facts go to escape
review: no diff, no reviewer, no test, no owner. Documentation lives
in the tree, versioned with the code it describes, or it lives
nowhere. A doc that cannot drift separately from the code drifts
less.

> *Sin:* `// the pool holds at most 64 connections` — above a constant set to 128
> *Obedience:* `// capacity is bounded by MaxConns below; see pool_test.go for the saturation case`

### Rule 16. Comment what the code cannot say. *(comments)*

Intent, invariant, the reason the simpler approach fails — the things
no amount of reading the code will yield. Never what the code already
says slower. `i++ // increment i` is not documentation; it is a
hostage note, proving only that the author was alive at the keyboard.
The comment that translates code into English insults two languages
at once.

Position is part of truth. A comment three lines above the code it
describes is already lying about something — locality is a claim. Put
the why on the line it governs, or in the doc comment of the unit it
governs. Nothing in between. And comment the preconditions or do not
bother: "assumes the lock is held" prevents a category of bug; "loops
over the array" prevents nothing.

> *Sin:* `i++ // increment i`
> *Obedience:* `// callers must hold mu; the map is read without atomics on this path`

### Rule 17. Spend your prose at the interface. *(comments)*

The comment on the declaration is the contract; the code below it is
merely one implementation of that contract. Callers compile against
your sentence, not your body. This comment is not drift-prone
decoration — it is the most load-bearing prose in the system, and it
gets the maintenance budget before any other commentary. Preconditions
or silence.

> *Sin:* a paragraph inside the function about how the loop works, and a bare declaration above it
> *Obedience:* `// Get returns a pooled connection, or blocks until one is released. It never dials.`

### Rule 18. Sign the cliffs; skip the coastline. *(comments)*

Internals stay undocumented — documentation of how it currently
happens to work inside freezes the very thing you most need free to
change, and the reader who needs the internals has the source, which
is always current, being the thing itself — except at the boundary of
surprise. Where the implementation does something a maintainer would
never guess — the array that must stay sorted, the field that aliases
another — write it down, precisely there. A warning sign at the
cliff, not a travelogue of the whole coastline.

History is not a cliff. "Previously this used a linked list" — the
reader holds the present; the past has a whole subsystem, git, staffed
and indexed. The commit message is where the past lives; the comment
is where the present lives. Confuse the two and you get comments that
read like tombstones. Neither are aspirations: a TODO in code is a
tracked item that escaped tracking — no owner, no date, mostly false
within a year. File it where undone work is counted.

> *Sin:* `// This used to be a linked list. TODO: revisit someday.`
> *Obedience:* `// entries must remain sorted by expiry; evict() binary-searches this slice`

### Rule 19. A change to behavior changes its documentation in the same commit. *(all prose)*

Not "docs to follow." The follow-up commit is where documentation
goes to not exist. Same commit, same review — that is the mechanism
by which doc and code are prevented from drifting apart, and it is
the only mechanism that has ever worked. A feature whose flag cannot
be documented in a sentence is telling you something about the flag;
projects have deleted features because writing the manual page
revealed them to be indefensible. The doc is the design review.

Enforce it by review; better, by check. The manual on every desk once
made an undocumented flag a public embarrassment. CI can blush on
your behalf: the drift check, the doc lint, the example that
compiles.

> *Sin:* `add --parallel flag` — man page untouched, "docs in a follow-up"
> *Obedience:* one commit: the flag, its test, and its paragraph in the manual

---

## Chapter V — An Approach to Style

*The unlegislatable residue: voice, tone, salt, fish. One page, and it
earns it.*

### Rule 20. Place yourself in the background. *(all prose)*

The record exposes the change, not the temperament of its author. Be
blunt about code and silent about character. "The code was wrong for
nine years and the test was wrong the same way" is a fact pattern,
and softening it deletes the lesson. "Whoever wrote this was
careless" is speculation, in the permanent record, about a person who
may have worked under constraints you cannot see from here. Two years
on, nobody bisecting cares who was careless; the blame layer is `git
blame`, and even that names lines, not character. The log is not the
place to win an argument with a ghost.

### Rule 21. One concept, one word, everywhere. *(all prose)*

The document that says node, vertex, element, and item, and means one
thing, has four terms, one concept, and zero grep. The searching
reader finds half your document and trusts all of it. And remember
the reader for whom English is a second language — by now the
majority. Idioms cost her what jargon costs the novice. Use a
technical term when its precision is required and the plain phrase
when it is not; the plain phrase is not dumbing down, it is telling
the truth about how much precision the sentence contains. Plain words
travel. Short words travel farther. The thesaurus is where
documentation goes to die.

### Rule 22. Earn the aphorism. *(all prose)*

Default to the plain long sentence. Compression is a dialect of
experts: the one-liner lands because forty years of context stand
behind it, and the junior who reads "obviously wrong, revert" learns
only fear. Most readers of your prose are still earning the dialect;
write for them, and let the veterans skim. But when a sentence can
carry a chapter — one fish per thousand pages, placed where nothing
load-bearing stands — let it. Some words are needless and kept
anyway; that is the one liberty this rule buys, having paid for it
with the twenty-one before. Style is the sound sense makes.

---

## Appendix A — The Sins

Errors shame better when they have names. The dangling participle did
more for English prose than a chapter of theory; these fifteen are
offered in the same spirit. The reader will recognize most of them.
The author will recognize the rest.

1. **The Hostage Note.** `i++ // increment i`. A comment proving only
   that the author was present at the keyboard.

2. **The Afternoon.** "First I looked at X, then I noticed Y..." The
   author narrating their day instead of stating their conclusion.

3. **The Unfalsifiable Subject.** "cleanup," "various fixes,"
   "improvements." A claim no diff can confirm or deny, and therefore
   worthless as a filter.

4. **The Tombstone.** The comment describing what the code used to
   do. History belongs to the log; the tombstone lies in the present
   tense.

5. **The Apology Tour.** "This is a bit hacky, sorry." Self-deprecation
   standing where the constraint should be. Say why the hack is
   necessary, or fix it. Shame is not documentation.

6. **The Greenhouse.** Documentation that only works in the author's
   environment — the example with invisible prerequisites, the setup
   that "assumes chapter 2."

7. **The Adjective Stack.** "Blazingly fast, lightweight, powerful."
   Properties claimed in units that do not exist. Measurements have
   numbers; the rest is weather.

8. **The Echo.** The commit body that recites the diff. "Renamed foo
   to bar, updated callers." The reader has eyes.

9. **The Docs-to-Follow.** The behavior change merged with a promise
   of future documentation. The follow-up has a documented survival
   rate of nil.

10. **The Load-Bearing Link.** "See #4127 for why." The why,
    outsourced to a system with a different lifetime. When the
    tracker dies, the commit becomes a locked box labeled *key
    elsewhere*.

11. **The Thesaurus.** The document that says node, vertex, element,
    and item, and means one thing. Four terms, one concept, zero
    grep.

12. **The Hedge.** "Should probably," "seems to," "I think this
    fixes." If you verified it, say so plainly; if you did not, say
    *that* plainly. Uncertainty is honest; vagueness about your
    uncertainty is not.

13. **The Badge Wall.** Twelve shields announcing CI status,
    coverage, and chat channels — the first screen spent proving the
    project is alive instead of saying what it is.

14. **The Orphaned Why.** The constraint documented nowhere near the
    code it constrains — the invariant in a wiki, the warning in a
    README, the cliff sign filed in a drawer three buildings from the
    cliff.

15. **The Confident Essay.** Length worn as authority: a thousand
    words, wrong in every paragraph. Length reads as diligence, and
    it is not diligence. Falsifiable sentences, checked against the
    diff, are the only defense — style does not save you;
    verification saves you.

---

## Appendix B — The Confessions

Strunk broke his own rules when the sentence demanded it. Each author
of this book was asked: which rule would you break, and when? The
answers are the honest half of the subtitle — the prices, paid on the
record.

**Pike, against Rule 4.** When the mechanism is a landmine for the
next person, name it in the subject even though the effect is small.
"runtime: don't use cgo in the signal handler" — the effect was a
rare crash fixed; the subject's job that day was to make the pattern
radioactive. Sometimes the subject is a warning label, not a summary.

**Kernighan, against Rule 11.** In a book, deliberately. A book can
braid reference and teaching because it has a spine and an index —
the reader can enter twice. The rule is really about documents with
one door.

**McIlroy, against Rule 12.** Not every concept should be inviting.
`rm` does not want a cheerful example at the top of the page; for
sharp tools, preconditions come before invitations. The reader you
hook is the reader you are responsible for.

**Thompson, against all of them.** In code written for oneself alone.
The rules price the reader's time above the writer's; when the writer
is the reader, the price is wrong. The mistake is only forgetting
which kind of code you are in.

**Ritchie, against Rule 16.** For the reader-in-training. In teaching
code, comments that narrate the obvious are the point; the annotated
program is a genre of its own, and the C book's examples practice it
shamelessly. Pedagogy licenses what production forbids.

**Cox, against Rule 7.** When the conclusion is unbelievable without
the journey. Some fixes are so strange the reader rejects the summary
until walked to it; those messages read like proofs because the claim
looked insane. The afternoon is still forbidden; the *derivation* is
not. The difference: a derivation could convince a stranger; an
afternoon only describes the author.

**Bernstein, against Rule 14.** Narrowed, in security-sensitive
documentation. A published suspicion — "this area is probably weak" —
is a treasure map. Confess the deficiencies you would bet on, or say
nothing. The credential is the confession's accuracy, not its
existence.

**de Raadt, against Rule 20.** Every time the background caused the
bug. When code is wrong because a vendor lied or a standard is
malignant, say so, in the commit, with the vendor's name. Posterity
deserves the indictment; softening it would be deleting the lesson.

**White, against Rule 21.** At the sentence where the twelfth
repetition of the page's one word would deafen the reader to the
occurrence that matters. Even grep forgives a pronoun.

---

## BUGS

This book states rules more confidently than their exceptions
deserve; Appendix B is the patch, applied by hand. Five of its
twenty-two rules can be enforced by machine; the other seventeen
require a reviewer who has read them, which is a dependency this book
cannot declare. Chapter V claims to be one page and is, by a
generous compositor.

You can tune a style guide, but you can't tune a fish.
