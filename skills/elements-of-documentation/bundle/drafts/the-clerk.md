---
_id: a0f9edad7dccb008ed4b0b89e178c5e02eb52fbd1ecc6e64a4ce1c722fa7d05cf
_rev: a8f7e064100a3c6a49b4e842ca890ac31461950f14b0aef263929f8c36609909
type: draft
title: "The Elements of Documentation — rules, and the prices they charge (The Clerk's draft)"
---

# THE ELEMENTS OF DOCUMENTATION

*rules, and the prices they charge*

---

## Dedication

For the engineer at midnight, two years from now, who cannot ask us anything.
Every rule in this book is an answer she will need.

## Epigraphs

> Record what evaporates.

> The bad message wasn't cheaper to write — it was only cheaper to think.

The first tells you what to write; the second tells you why you didn't.

---

## Preface

This book has one design center: the engineer two years from now, bisecting a
failure at midnight, who finds your commit at the bottom and cannot ask you
anything. The message is the only interview you will ever give her. Every rule
here serves her first. Everyone else — novice, expert, machine — is served by
serving her. Half the readers of documentation are now models and tools, and
this changes nothing: everything the midnight reader needs — one term per
concept, falsifiable sentences, facts stated once at an authoritative home,
examples that run, structure that routes — is precisely what retrieval and
generation need. Write for the tired human at midnight and the machine is
served free. The reverse is not true; write for the machine's parser and you
get keyword soup no human trusts.

The original *Elements of Style* was written for one genre, the undergraduate
essay, and the cargo cult misses this. So the second thing this book must say,
on page one: these rules serve the reader named at the top of each rule, and a
rule applied to the wrong reader is a bug wearing a badge of virtue. Every rule
below names its scope — (commit subjects), (commit bodies), (reference),
(teaching), (all documents), (all prose). One settlement governs the scoping:
the deletion test is right for reference and commit messages and wrong for
pedagogy. In reference, say it once; in teaching, say it twice, differently, on
purpose — and the second telling must know it is a second telling.

The authors' closing statements, one sentence each, stand here as the preface's
argument in miniature:

- **McIlroy:** Documentation is the part of the program that runs on people —
  write it, test it, and delete it to the same standard.
- **Kernighan:** Write so that the reader who knows least loses least, and the
  reader who knows most loses nothing.
- **Ritchie:** Every sentence of documentation is a promise; make only the
  promises you can keep, and keep every one you make.
- **Pike:** The diff says what; the message says why; anything else, one of you
  is lying.
- **Thompson:** Say it once, say it true, stop.
- **Cox:** Write for the reader who cannot ask you anything, because soon every
  reader is that reader.
- **Bernstein:** A sentence you cannot check is a sentence you cannot trust —
  write checkable sentences.
- **de Raadt:** If the documentation is embarrassing to write, the design is
  what's embarrassing — fix that, then write.

And the moderator's last word, which contains the whole book: omit needless
words; the words that remain, make true; and of the true words, keep the ones
the reader cannot get anywhere else. Everything adopted here is one of those
three commandments wearing work clothes.

---

# CHAPTER I — THE SUBJECT LINE

*Rules for the fifty characters read a thousand times.*

The subject line is read a hundred times for every time the body is read, and a
thousand times for every time the diff is read. `git log --oneline` strips
everything else away — and `git log --oneline` is a pipeline stage: a pipeline
works because every stage agrees on the format of a line. Uniformity is
elegance, at that scale. Underneath the whole chapter stands one principle:
every layer of documentation is a filter for the layer below. Subject filters
body; body filters diff; comment filters code. Each layer must add information,
or be deleted.

## Rule 1. Write the subject for the reader who will never open the commit. *(commit subjects)*

The subject must let a reader decide, in one second, whether this commit
concerns her. A maintainer doing triage reads thousands of these; if the
subject is "various fixes," she already knows the diff is careless, because the
sentence was. The practice that serves the principle is the address-claim form:
begin with the address, then the claim — a prefix naming the territory
(package, subsystem, area), a colon, then a lowercase summary with no terminal
period. The prefix is the address; the sentence is the payload. The reader
scanning five hundred subjects is doing triage, and triage needs uniformity
more than it needs elegance. Why lowercase? The prefix already did the
capital's job of starting the line. Why no period? The period claims the
sentence is finished, and a subject is a heading; headings don't take periods.
Also it's one less character. Write subjects that grep well.

- *Obedience:* `net/http: don't crash when the request has no body`
- *Sin:* `Various fixes` — the reader must now read the whole diff herself; the
  message has saved her nothing.

## Rule 2. Use the imperative: name the act, not the aftermath. *(commit subjects)*

Write "fix the leak," not "fixed the leak" or "fixes the leak." The commit is
not a diary entry; it is an instruction to the tree: apply this and the leak is
fixed. The imperative reads as the name of an act, like a function name —
`fixLeak()`, not `leakWasFixed()`. There is also honest humility in it.
"Fixed" announces a fact about the past that the commit cannot actually
promise — the bug may outlive the commit. The imperative names an intention.
C's documentation had this property by accident: "returns the number of
characters transmitted" — present tense, a contract, not a boast.

- *Obedience:* `fix the leak`
- *Sin:* `fixed the leak` — a boast the commit cannot keep.

## Rule 3. Make the subject falsifiable. *(commit subjects)*

The subject line is a security boundary: it is the only part of the change most
people will ever audit. Hold it to the standard of an interface declaration —
a reader must be able to check the claim against the diff in under a minute.
If the subject says "improve error handling" and the diff quietly widens a
buffer, the subject lied by omission. A subject is falsifiable or it is
decoration, and decoration invites forgery. "cleanup" and "various fixes" are
unfalsifiable, therefore forbidden: you cannot verify anything, so you must
verify everything, so the message saved you nothing.

- *Obedience:* `qmail-smtpd: reject bare LF` — you can verify that claim in
  thirty seconds.
- *Sin:* `cleanup` — a claim no diff can confirm or deny.

## Rule 4. State the effect, not the mechanism — unless the mechanism is the news. *(commit subjects)*

Never name the mechanism when you can name the effect. "use sync.Once in dial"
tells the reader what she'd learn from the diff in ten seconds anyway. "dial:
connect only once per address" tells her the thing the diff can't say — the
behavior she can now rely on. A word the diff already says is needless. But
when the mechanism *is* the point — a revert, a vendoring bump, a rename — say
the mechanism plainly; `runtime: revert CL 12345` is a fine subject. The rule
underneath both halves: say the thing the reader cannot get elsewhere.

- *Obedience:* `dial: connect only once per address`
- *Sin:* `use sync.Once in dial` — the diff already says so, faster.

---

# CHAPTER II — THE BODY

*Rules for the midnight reader.*

## Rule 5. Record what evaporates. *(commit bodies)*

The diff preserves the what forever; the why dies with the author's attention.
The body's job is to record precisely the part that evaporates: why the change
was necessary, the alternatives rejected and why, the costs accepted knowingly
— and nothing the reader already holds in her hands. Not the file list: the
diff stat exists, and reciting "modified foo.c, added bar.h" is reading the
reader her own eyes. The early Unix commits had no body, and the price is
still being paid: the flag is three characters; the email thread asking why it
exists is forty years long. The archive laughs last.

A body is owed when the diff leaves a question standing — measured by the
diff's consequence, never by its size. `spell: fix typo in error message`
needs no body at all: a typo fix's why is self-evident for exactly as long as
the diff exists, which is forever. The empty body is not an exemption from the
standard; it IS the standard, applied — omission of the needless message. The
test for owing one: would a competent reader of the diff still have a
question? For the typo, no. For "increase timeout to 30s" — yes, always, and
the one-line body "the CI runners got slower after the migration to arm64"
pays the debt. The inverse holds too: one-character diffs have shipped root
holes. If the one character matters, the message says why; `if (a = b)` to
`if (a == b)` deserves a paragraph.

- *Obedience:* `increase timeout to 30s` with the body "The CI runners got
  slower after the migration to arm64."
- *Sin:* the thousand-word narration of the what — or the empty body under a
  one-character change that shipped a root hole.

## Rule 6. State the problem before the solution. *(commit bodies)*

Paragraph one earns the reader's belief that a problem exists, stated so a
reader who lacks context believes it. Paragraph two states the fix at the
level of intent — what invariant now holds that didn't. Paragraph three, only
if needed: alternatives rejected and why, costs accepted knowingly, and what
to look at if this turns out wrong. A body that opens with the fix is a proof
with no theorem. One grace note earns its place: if the bug was interesting,
one sentence on why it was hard to see — not your afternoon, the *shape* of
the trap. "The race only fires when the timer wraps" teaches the next person
to see traps of that shape. That sentence is the difference between a log
entry and a lesson.

- *Obedience:* "Connections that hit the idle timeout were closed but never
  removed from the pool's active count…" — then the fix.
- *Sin:* a body that opens "Switched to put() in the timeout path" and never
  says what was broken.

## Rule 7. Write complete sentences, in order of importance. *(commit bodies)*

A sentence forces a claim; a fragment gestures at one. "fixed leak. also
refactor. tests pass" reads fast to write and slow to read — "also refactor":
what was refactored? Toward what? A sentence would have had to say. Complete
sentences are not formality; they force the writer to commit to a subject and
a verb, which is to say, to a claim, and the sentence is the unit of
accountability — in documentation more than anywhere, because documentation is
promises made in prose. And write the sentences in order of importance, not in
order of discovery. Half of rejected commit bodies are archaeology — "first I
looked at X, then I noticed Y" — the author narrating their own afternoon.
Nobody cares about your afternoon. State the conclusion. State why it's right.
Stop. The journey is scaffolding; tear it down before you ship the building.

- *Obedience:* "The pool's count drifted from the live set. The timeout path
  now releases slots through put()."
- *Sin:* "First I noticed the pool wasn't working right so I investigated…"

## Rule 8. Address posterity, not the approver. *(commit bodies)*

Nothing for the reviewer — no "please check the locking" — and nothing about
the process that produced the change. The review dies; the log is forever.
Instructions to the reviewer belong in review discussion, not the permanent
record: the commit message outlives the review by decades.

Distrust the load-bearing link. "See the discussion in #4127 for why" hands
the why to a system with a different lifetime; the day the tracker is
migrated, the why is gone. The commit message must stand alone on the why; the
link is for the archaeology — repro logs, benchmarks, dead ends — the extras,
never the essence. Summarize the verdict, cite the trial. Both readers served.

- *Obedience:* the why stated in full, then "Benchmarks and dead ends in
  #4127."
- *Sin:* "Please review carefully since this touches critical code!" — dead
  within the week, noise forever after.

## Rule 9. End with the trailers, exactly spelled. *(commit bodies)*

Machine lines at the bottom, in the machine's dialect, one per line. `Fixes
#311` closes issues; misspelled, it closes nothing. Grep is a reader, and so
is the tracker; the trailers are the one part of the message addressed to the
machine, and the machine forgives nothing. Put them at the bottom, where
machines look.

- *Obedience:* `Fixes #4127`
- *Sin:* `fixes issue 4127 (I think)` — closes nothing, promises less.

## Worked Example — The Commit Message

A specimen from the wild:

```
Fixed some issues with the connection handling code. There were
several problems that this PR addresses. First I noticed that the
pool wasn't working right so I investigated and found that it was
related to how we were handling timeouts. Also refactored some
stuff in pool.go to be cleaner and more maintainable going forward.
Please review carefully since this touches critical code!
Various other small fixes included as well.
```

The diagnosis, from the floor: every sentence unfalsifiable — "some issues,"
"several problems," "working right," "some stuff"; six claims, zero checkable
(Bernstein). Past tense narrating the afternoon — "First I noticed… so I
investigated" — archaeology, not conclusion (Kernighan). "Cleaner and more
maintainable going forward": three phrases, no information — and "going
forward," which is where time already goes (Pike). "Please review carefully"
is addressed to the approver, dead within the week; "various other small
fixes" is the confession that the commit should have been three commits (Cox).
The subject tells the maintainer to read the whole diff herself. Net
documentation: zero. Net cost: she now also distrusts the author (de Raadt).

The cure. First, the split: "various other small fixes" means two commits
minimum — the timeout bug, and the refactor; Rule 3 can't hold a subject over
a mixed diff. Commit one, subject by Rules 1 and 4:

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

Commit two: `pool: hoist dial retry out of Get` — its own message, its own
why: "no behavior change" stated as the claim it is, checkable by the reader.

Notice what the rewrite cost: nothing. Every sentence came from knowledge the
original author held and withheld. The bad message wasn't cheaper to write —
it was only cheaper to think.

---

# CHAPTER III — DOCUMENTATION

*READMEs, references, tutorials, man pages.*

## Rule 10. First sentence: X is a Y that Z. *(all documents)*

The first sentence of any document must say what the thing *is* — category and
distinguishing property, before virtues, before history, before comparison.
Not what it enables, not what it believes in, not how it compares. "Vault-LD
is a multi-writer wiki on autobee." Subject, category, distinguishing
property. A reader who stops there stops informed. It is the topic sentence,
promoted to institution — rediscovered at repository scale. The anti-pattern
is naming what it ISN'T: "X is not a framework." Negation is not identity;
tell the reader what it is and she will work out the complement herself. And
strike the roadmap from the first screen: promises about the future are the
least checkable claims in the document. Ship documentation of what runs today;
the rest is marketing wearing documentation's clothes. Badges are marketing
wearing engineering's clothes.

- *Obedience:* "Vault-LD is a multi-writer wiki on autobee."
- *Sin:* "a blazingly fast, lightweight, developer-first framework" — a
  category and a row of adjectives, zero distinguishing properties.

## Rule 11. One document, one reader. *(all documents)*

Decide which reader you are serving *before the first sentence*, say so in the
first sentence, and route the other reader away by link: "This page is the
reference for X; for the tutorial see Y." One line, both readers routed. The
answer to the brevity war was never one document — it is the oldest solution
we have: the man page and the paper, reference and narrative, separated,
cross-linked, each pure. `awk(1)` is austere and complete; *The AWK
Programming Language* is warm and long; neither apologizes for the other. The
sin is the hybrid that alternates modes paragraph by paragraph — reference
interrupted by pep talk — which serves neither reader and lies to both about
what it is. The hybrid serves nobody and lies to everybody. No document tries
to be a hallway and a room at once. Brevity that locks out the second reader
isn't economy; it's cost-shifting — you saved a paragraph and a thousand
strangers each pay an afternoon. And verbosity is cost-shifting too: the
tutorial buries the load-bearing sentence on page nine, where the reader under
attack at 3 a.m. cannot find it.

The changelog is this rule at system scale. The commit log addresses the
maintainer of the code; the changelog addresses the operator of the software.
The commit's unit is a change to the tree; the changelog's unit is a change to
the *user's world* — a flag added, a default altered, a behavior gone. Most
commits produce no changelog line; some changelog lines summarize forty
commits. Generating one from the other is this rule violated by machine: two
readers, force-fed one document. The changelog entry's grammar: what changed
for you, what you must do about it, nothing else. "Upgraded internal parser"
is a commit fact; the changelog line is "dates before 1970 no longer parse as
errors."

- *Obedience:* "This page is the reference for X; for the tutorial see Y."
- *Sin:* the reference interrupted by pep talk, paragraph by paragraph.

## Rule 12. Lead with a worked example, and make it complete. *(teaching)*

Every technical explanation should lead with a worked example, for a reason
that isn't pedagogical fashion: an example is the one form of documentation
the author cannot fake. Prose can bluff — "the tool handles errors gracefully"
— no such sentence survives in an example; it either runs or it doesn't. *The
C Programming Language* made the bet: "hello, world" on page one, before a
single word of theory, and forty years of imitators say the bet paid. The
reader who has run something believes you; the reader who has read four pages
of abstractions is still deciding whether to. The condition everyone violates:
the example must be complete. Not "…" elided, not "assuming the setup from
chapter 2." A reader must be able to select, paste, run. An example with
invisible prerequisites is worse than none — it fails and teaches the reader
to distrust the whole document. Where the tooling allows, examples compile in
CI: prose under test. If the example rots, CI says so before a reader does —
each layer checkable against the layer below.

- *Obedience:* `hello, world`, page one, paste-and-run.
- *Sin:* the example that "assumes the setup from chapter 2."

## Rule 13. Answer the five questions in order. *(reference)*

What is it. How do I invoke it. What does it do. Show me. What will bite me.
NAME, SYNOPSIS, DESCRIPTION, EXAMPLES, BUGS — fifty years of proof the order
is right. The format survived because every section answers exactly one
question a reader arrives with; sections are routing — SYNOPSIS for the
expert, EXAMPLES for everyone else. The README is the modern man page, and it
has lost the anatomy: most open with a logo, six badges, and a paragraph of
adjectives, while the reader's questions are the same five, unchanged. A
README that answers those in the first screen is complete; everything after is
appendix. The man page is part of the program: a feature that cannot be
documented in a sentence is a wrong feature — features have been deleted
because their documentation revealed them to be indefensible. The doc is the
design review. Documentation is thinking made visible; bad writing is bad
thinking caught in the act.

- *Obedience:* NAME, SYNOPSIS, DESCRIPTION, EXAMPLES, BUGS.
- *Sin:* a first screen spent on a logo, twelve badges, and adjectives.

## Rule 14. Keep the BUGS section, and tell the truth in it. *(reference)*

A document that admits one true fault is believed about the rest. Known
deficiencies, stated plainly, dated if possible. Modern documentation omits
known deficiencies as if omission fixed them; the old BUGS sections — "this
command is slow and stupid about tabs" — bought reader trust at the price of
author vanity, and it was the best purchase in the manual. The confession is
the credential.

- *Obedience:* "BUGS: this command is slow and stupid about tabs."
- *Sin:* the manual with no BUGS section, as if omission fixed them.

## Worked Example — The README First Screen

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

The diagnosis: "X is a Y that Z" — where Y is "framework" and Z is a row of
adjectives. "Blazingly fast" — compared to what, measured how? "Lightweight" —
in what unit? "Developer-first" — as opposed to the frameworks built for
non-developers? Zero distinguishing properties; the reader still doesn't know
what it DOES (Pike). "No bloat. Batteries included." — two slogans,
contradicting each other, three words apart (McIlroy).

The rewrite (Kernighan): "Flowlite runs data pipelines defined as plain Python
functions, on one machine, without a scheduler service. A pipeline is a
function; a dependency is an argument. If you need distributed execution or a
UI, use Airflow — Flowlite is for the case where Airflow is too much."
Category, property, boundary, and the honest routing of the wrong reader, four
sentences. Note that the rewrite states what it refuses to do — the roadmap in
reverse, and checkable today (Bernstein). And "spark joy" returns to the
drawer whence it came.

---

# CHAPTER IV — COMMENTS AND THE PLACEMENT OF TRUTH

*Where facts live so they cannot lie.*

## Rule 15. Give every fact one home; let every other mention point. *(all prose)*

The copy is the future lie. The moment a timeout value appears in the code,
the comment, the README, and the wiki, three of the four are future lies — you
just don't know which three yet. State the fact where it is checkable — code,
or test, or generated reference — and let prose refer. This convicts most
wikis: a wiki is a place where facts go to escape review — no diff, no
reviewer, no test, no owner. The documentation lives in the tree, versioned
with the code it describes, or it lives nowhere. If the doc can't drift
*separately* from the code — same commit, same review — it drifts less.

- *Obedience:* the timeout defined once in code; the README points to it.
- *Sin:* the same value in code, comment, README, and wiki — three future
  lies, address unknown.

## Rule 16. Comment what the code cannot say. *(comments)*

The comment's great vice is that it can't be executed, so it can't be caught
lying: the compiler checks the code; nothing checks the comment against the
code. Every comment therefore starts life as a small debt — it will drift
unless maintained by hand — so the bar for writing one must be high. A comment
should say what the code *cannot*: intent, invariant, the reason a simpler
approach fails. Never what the code already says slower; the comment that
translates code into English insults two languages at once. Comment the
preconditions or don't bother: "this function assumes the lock is held"
prevents a category of bug; "this loops over the array" prevents nothing. And
position is a claim: a comment three lines above the code it describes is
already lying about something — locality is a claim. Put the why on the line
it governs or in the doc comment of the unit it governs; nothing in between.
History belongs elsewhere: "previously this used a linked list" — the reader
holds the present, and the past has a whole subsystem, git, staffed and
indexed. The commit message is where the past lives; the comment is where the
present lives. So do aspirations: a TODO in code is a tracked item that
escaped tracking — no owner, no date, mostly false within a year. If it must
be done, file it where undone work is tracked and counted.

- *Obedience:* `// assumes the lock is held`
- *Sin:* `i++ // increment i` — a hostage note proving the author was alive at
  the keyboard.

## Rule 17. Spend your prose at the interface. *(comments)*

The comment on the declaration is the contract; the code is merely one
implementation of it. That comment isn't drift-prone decoration — it is the
most load-bearing prose in the system, because callers compile against your
sentence, not your body. It outranks all other commentary and gets the
maintenance budget. Bernstein's amendment, seconded as amended: preconditions
or silence.

- *Obedience:* "returns the number of characters transmitted" — a contract,
  not a boast.
- *Sin:* a meticulous comment inside the body while the declaration above it
  says nothing.

## Rule 18. Sign the cliffs; skip the coastline. *(comments)*

Internals stay undocumented except at the boundary of surprise — the invariant
a maintainer would never guess, stated at the exact line it governs. The
sorted array that must stay sorted; the field that aliases another. A warning
sign at the cliff, not a travelogue of the whole coastline. Documentation of
*how it currently happens to work inside* freezes the very thing you most need
free to change: document the contract; let the implementation breathe. The
reader who needs the internals has the source, which is always current, being
the thing itself.

- *Obedience:* `// this array must stay sorted; search() binary-searches it`
  at the exact line.
- *Sin:* the implementation narrative — a travelogue of the whole coastline.

## Rule 19. A change to behavior changes its documentation in the same commit. *(all changes)*

"Docs to follow" is where docs go to not exist. The follow-up commit is where
documentation goes to not exist; a change that alters behavior alters its
documentation in the same change, or the change is incomplete. Enforce by
review; better, by check — let CI blush for you. The old mechanism was
embarrassment: the manual was typeset and on everyone's desk, and shipping a
flag the manual didn't mention was public. The modern task is rebuilding that
embarrassment — the drift check, the doc lint, the example that compiles.

The rule applied to the future is the deprecation notice: the only
documentation written *to* someone you are actively inconveniencing, usually
written as if to someone you are rid of. "Deprecated: use NewThing instead"
has never once contained enough information to act on. The complete form has
four parts, and it fits in four lines: what stops working; when it stops; the
one-to-one replacement, shown not named — old call above, new call below; and
the escape hatch when the mapping isn't one-to-one. "Deprecated" without a
date is a mood, not a notice. And have the courage to finish the sentence: a
deprecation that lives five years is a lie about your intentions — you've
documented a decision you declined to make. Announce, date, remove; the reader
plans around dates, not around vibes. The migration guide is part of the
breaking change — same commit, same review. If writing the migration table is
too much work, you have measured exactly the pain you're about to ship
multiplied by your user count, and you should reconsider the break. The cost
of the prose is the measure of the change.

- *Obedience:* the flag, its manual entry, and its migration note in one
  commit.
- *Sin:* "docs to follow" — documented survival rate of the follow-up: nil.

---

# CHAPTER V — AN APPROACH TO STYLE

*One page. It earns it.*

## Rule 20. Place yourself in the background. *(all prose)*

The record exposes the change, not the author's temperament. Blunt about code,
silent about character; the log is not the place to win an argument with a
ghost. "The code was wrong" — fact. "Whoever wrote this was careless" —
speculation, in the permanent record, about a person who may have written it
under constraints you cannot see from here. 'Blunt about code' is
load-bearing: softness about wrongness is its own vanity. "This code was wrong
for nine years and nobody noticed because the test was also wrong" is not
rudeness; it is the fact pattern, and softening it deletes the lesson. But ad
hominem in a log entry is noise: two years later, nobody bisecting cares who
was careless. The blame layer is `git blame`, and even that names lines, not
character.

- *Obedience:* "The code was wrong for nine years; the test was also wrong."
- *Sin:* "Whoever wrote this was careless."

## Rule 21. One concept, one word, everywhere. *(all prose)*

The thesaurus is where documentation goes to die; grep is a reader; the
second-language reader is the majority. Plain words travel; short words travel
farther. Name things consistently — one term per concept, every occurrence
spelled the same — or the searching reader finds half your document and trusts
all of it. A technical term is a contract: use "idempotent" and you have
promised the reader that the precise meaning is required — that "safe to
retry" would have lost something. When precision is required, use the term and
use it correctly; when it isn't, the plain phrase is not dumbing down, it is
telling the truth about how much precision the sentence contains. Never define
a term the reader can't check: if the document says "we use optimistic
concurrency," link or cite or define — in one clause — what you take that to
mean. Idioms — "this is a footgun," "we punt on that" — cost the
second-language reader what jargon costs the novice. Avoid fancy words; avoid
clubby ones.

- *Obedience:* one term, every occurrence spelled the same, grep-complete.
- *Sin:* node, vertex, element, and item — four terms, one concept, zero grep.

## Rule 22. Earn the aphorism. *(all prose)*

Default to the plain long sentence; compression is a dialect of experts, and
most readers are still learning it. The one-liner lands because forty years of
context stand behind it; the junior who reads "obviously wrong, revert" learns
only fear. Terseness is not a policy; it is a role in a division of labor — a
Thompson can be terse because a Ritchie was thorough, and you should not staff
a project with nine Kens. But when a sentence can carry a chapter, let it. One
fish per thousand pages, placed where nothing load-bearing stands: the fish —
"You can tune a file system, but you can't tune a fish" — lived in BUGS, the
one section already licensed for confession and slouching. A joke in the
SYNOPSIS is a bug; a joke in BUGS is a feature. Never humor that requires
context the reader may lack, which is nearly all humor; the fish survives
because it is self-contained. Humor compounds badly — the second joke halves
the first one's charm, and the tenth makes the reader wonder if the SYNOPSIS
is also kidding. Length is not a virtue; neither is its absence. Style is the
sound sense makes.

Some words are needless and kept anyway; that is the one liberty this last
rule buys, having paid for it with the first twenty-one.

- *Obedience:* "You can tune a file system, but you can't tune a fish" — in
  BUGS.
- *Sin:* "obviously wrong, revert" — from anyone who has not spent forty years
  earning it.

---

## A Note for the Record — The Rules' Own Prose, and Who Checks the Checkers

The book's own sentences must survive the audit they impose. "A change to
behavior changes its documentation in the same commit" — thirteen words, none
removable, passes. Rule 4 carries a subordinate clause with an em-dash; Rule
12 has a compound imperative. They stand, and the record states why: a rule
may spend words to forestall the misreading that would be more expensive than
the words. Concision is a budget, not a vow. Even the commandments had
subordinate clauses.

And enforcement, stated honestly, because a style guide unenforced becomes
folklore in eighteen months. The inventory of what machines can hold today:
subject length and form — trivially lintable. Trailer spelling — lintable.
Examples that run — CI. One term per concept — a dictionary check, crude but
real. The drift rule — checkable where docs are generated or annotated. That
is five of twenty-two mechanized; the other seventeen live or die in review.
The book states this as a feature, not a gap: the mechanizable rules buy the
reviewer's attention back for the seventeen that need a human.

Lint the form; review the truth. Print that on the reviewer's desk.

Reviewers must reject prose the way they reject code. The message is the only
part of the commit every future maintainer is guaranteed to read; it deserves
the strictest review, not the laxest. "LGTM, fix the message" is a
contradiction — the message IS the part the reviewer was most qualified to
judge, having just done the work of understanding the change that the message
will have to do for everyone after. The reviewer's checklist is short: Is the
subject falsifiable and true? Does the body say why? Does anything in the
message contradict the diff? Does anything in the diff surprise a reader of
the message? Four checks, two minutes, permanent value. Add the deletion pass
— for each sentence, would the document be poorer without it? — sentence by
sentence, then again paragraph by paragraph; prose has dead code, and plenty
of true sentences are still needless. Review the examples by running them: an
example nobody has run since the author is a promise nobody has kept recently.
The writer's own passes: write the message before the final self-review of the
diff, then read the diff against your own message as if reviewing a stranger —
the message is a spec, the diff is the implementation. Read it aloud: prose
that can't be spoken can't be skimmed, and the ear catches the clause pile-up
the eye slides over. Or wait a day: yesterday's prose reviews itself. Write it
wrong, completely, to the end; then rewrite sentence by sentence. A complete
bad draft can be fixed; a perfect fragment cannot be finished. Prose held to
the code's standard — reviewed like code, tested like code, versioned like
code, deleted like code — because it is code. It runs on people.

---

# APPENDIX A — THE SINS

*Fifteen named anti-patterns. Errors with names shame better than a paragraph
of theory.*

1. **THE HOSTAGE NOTE** (Pike). `i++ // increment i`. A comment proving only
   that the author was present at the keyboard.
2. **THE AFTERNOON** (McIlroy). "First I looked at X, then I noticed Y…" The
   author narrating their day instead of stating their conclusion.
3. **THE UNFALSIFIABLE SUBJECT** (Bernstein). "cleanup," "various fixes,"
   "improvements." A claim no diff can confirm or deny, therefore worthless as
   a filter.
4. **THE TOMBSTONE** (Cox). The comment describing what the code used to do.
   History belongs to the log; the comment lies in the present tense.
5. **THE APOLOGY TOUR** (de Raadt). "This is a bit hacky, sorry" —
   self-deprecation standing where the actual constraint should be. Either say
   WHY the hack is necessary or fix it. Shame is not documentation.
6. **THE GREENHOUSE** (Kernighan). Docs that only work in the author's
   environment — the example with invisible prerequisites, the setup that
   "assumes chapter 2."
7. **THE ADJECTIVE STACK** (Ritchie). "Blazingly fast, lightweight, powerful"
   — properties claimed in units that don't exist. Measurements have numbers;
   the rest is weather.
8. **THE ECHO** (Thompson). The commit body that recites the diff. "Renamed
   foo to bar, updated callers." I have eyes.
9. **THE DOCS-TO-FOLLOW** (Cox). The behavior change merged with a promise of
   future documentation. The follow-up has a documented survival rate of nil.
10. **THE LOAD-BEARING LINK** (Bernstein). "See #4127 for why." The why,
    outsourced to a system with a different lifetime. When the tracker dies,
    the commit becomes a locked box labeled "key elsewhere."
11. **THE THESAURUS** (Pike). The document that says node, vertex, element,
    and item, and means one thing. Four terms, one concept, zero grep.
12. **THE HEDGE** (McIlroy). "Should probably," "seems to," "I think this
    fixes." If you verified it, say so plainly; if you didn't, say THAT
    plainly. Uncertainty is honest; vagueness about your uncertainty is not.
13. **THE BADGE WALL** (de Raadt). Twelve shields announcing CI status,
    coverage, chat channels — the first screen spent proving the project is
    alive instead of saying what it is.
14. **THE ORPHANED WHY** (Kernighan). The constraint documented nowhere near
    the code it constrains — the invariant in a wiki, the warning in a README,
    the cliff sign filed in a drawer three buildings from the cliff.
15. **THE CONFIDENT ESSAY** (Ritchie, crediting de Raadt's round-eight
    contribution). Length worn as authority; a thousand words, wrong in every
    paragraph.

---

# APPENDIX B — THE CONFESSIONS

*Each rule's honest breaking point, from the authors. A rule book written by
people who never break the rules is written by people who never write. The
subtitle keeps this appendix's promise: rules, and the prices they charge.*

**PIKE — Rule 4** (effect over mechanism). When the mechanism is a landmine
for the next person, name it in the subject even though the effect is small.
`runtime: don't use cgo in the signal handler` — the effect was "fix a rare
crash," but the subject's job that day was to make the *pattern* radioactive.
Sometimes the subject is a warning label, not a summary.

**KERNIGHAN — Rule 11** (one document, one reader). In a book, deliberately. A
book can braid reference and teaching because it has a spine and an index —
the reader can enter twice. The rule is really about documents with one door.

**McILROY — Rule 12** (lead with the example). When the concept is dangerous
half-understood. `rm` does not want an inviting example at the top of the
page. For sharp tools, preconditions before invitations. The reader you hook
is the reader you're responsible for.

**THOMPSON — all of them**, in code he writes for himself. The rules price the
reader's time above the writer's; when the writer IS the reader, the price is
wrong. The mistake is only forgetting which kind of code you're in.

**RITCHIE — Rule 16** (comment what the code cannot say). For the
reader-in-training: in teaching code, comments that narrate the obvious are
the point; the annotated program is a genre of its own. The C book's examples
do it shamelessly. Scope, again: pedagogy licenses what production forbids.

**COX — Rule 7's "conclusion first."** When the conclusion is unbelievable
without the journey, the journey earns its place — some fixes are so strange
the reader rejects the summary until walked to it; some commit messages read
like proofs precisely because the claim looked insane. The afternoon is
forbidden; the *derivation* is not. The difference: a derivation could
convince a stranger; an afternoon only describes the author.

**BERNSTEIN — Rule 14** (the honest BUGS section), narrowed. No published
suspicions in security-sensitive documentation; a stated "this area is
probably weak" is a treasure map. Confess deficiencies you'd bet on, or say
nothing. The credential is the confession's *accuracy*, not its existence.

**DE RAADT — Rule 20** (author in the background), every time the background
caused the bug. When code is wrong because a vendor lied or a standard is
malignant, say so, in the commit, with the vendor's name. Posterity deserves
the indictment. Softening it would be — what was the phrase — deleting the
lesson.

**WHITE — Rule 21** (one concept, one word) — except the word the whole page
has repeated twelve times, at the sentence where the twelfth repetition would
deafen the reader to the one that matters. Even grep forgives a pronoun.

---

*[END OF DRAFT — as adopted on the floor; the clerk's hand, the panel's
words.]*
