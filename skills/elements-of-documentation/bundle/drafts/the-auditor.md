---
_id: a0f9edad7dccb008ed4b0b89e178c5e02eb52fbd1ecc6e64a4ce1c722fa7d05c9
_rev: cc20e259894e4969f43898e04dfbb092144af9f3150a5d6333bda151d88b1528
type: draft
title: "The Elements of Documentation — The Auditor's Draft"
---

# THE ELEMENTS OF DOCUMENTATION

*rules, and the prices they charge*

---

**For the engineer at midnight, two years from now, who cannot ask us
anything. Every rule in this book is an answer she will need.**

> Record what evaporates.

> The bad message wasn't cheaper to write — it was only cheaper to think.

---

## Preface: how this book is enforced

Most style guides are folklore in eighteen months. They decay because their
rules cannot be checked, and a rule that cannot be checked cannot be
enforced, and a rule that cannot be enforced is a mood.

This book takes the opposite bet. Every rule below is stated as a claim you
can test against a real artifact — a subject line, a body, a page, a
comment. Under each rule stands a **Check** line naming the cheapest
instrument that can hold it: **lint** (a machine holds it today, no
judgment required), **CI** (a machine holds it if you wire the harness),
or **review** (a human holds it, using the test written in the rule). If
you cannot decide whether a given artifact obeys a rule, the defect is in
this book, and this book's BUGS section is where you file it.

The inventory, so nobody has to infer it:

| rule | claim, compressed | held by |
| ---: | --- | --- |
| 1 | subject triages in one second | review |
| 2 | subject is imperative | **lint** (form) · review (sense) |
| 3 | subject is falsifiable against the diff | review |
| 4 | subject names effect, not mechanism | review |
| 5 | body records only what evaporates | review |
| 6 | problem stated before solution | review |
| 7 | complete sentences, importance order | review |
| 8 | nothing addressed to the reviewer | review |
| 9 | trailers exact, last, one per line | **lint** |
| 10 | first sentence is "X is a Y that Z" | review |
| 11 | one document, one reader, declared | review |
| 12 | examples complete and runnable | **CI** |
| 13 | the five questions, in order | review |
| 14 | BUGS section present and true | review |
| 15 | every fact has one home | review |
| 16 | comments say what code cannot | review |
| 17 | interface comments get the budget | review |
| 18 | internals documented only at cliffs | review |
| 19 | docs change in the behavior's commit | **CI** (where generated) · review |
| 20 | author absent from the record | review |
| 21 | one concept, one word | **lint** (dictionary) |
| 22 | aphorisms earned, not defaulted | review |

Five of twenty-two are machine-held today. That ratio is a feature, not a
gap: the lintable rules buy back the reviewer's attention and spend it on
the seventeen that need a human. **Lint the form; review the truth.** Print
that on the reviewer's desk.

The reviewer's checklist for any commit, in full — four checks, two
minutes, permanent value:

1. Is the subject falsifiable, and is it true?
2. Does the body say why?
3. Does anything in the message contradict the diff?
4. Does anything in the diff surprise a reader of the message?

Two facts about scope, stated once here so no rule need repeat them.
First: the design center of every rule is the engineer bisecting a failure
at midnight, two years from now, who cannot ask the author anything.
Serve her and the novice, the expert, and the machine reader are served
free; the reverse is not true. Second: each rule names its scope —
(commits), (reference), (teaching), (all prose) — and a rule applied to
the wrong reader is a bug wearing a badge of virtue. In reference, say it
once; in teaching, say it twice, differently, on purpose.

One more honesty, about this book's own prose. Some rules below carry a
subordinate clause. They stand because a rule may spend words to forestall
a misreading that would cost more than the words. Concision is a budget,
not a vow. Audit us by the same test we give you: strike any sentence in
this book, reread, and if nothing is missing, file the bug.

---

## CHAPTER I — THE SUBJECT LINE

Rules for the fifty characters read a thousand times.

The subject line is read a hundred times for every time the body is read,
and a thousand times for every time the diff is read. It is also the only
part of the change most people will ever audit — which makes it a security
boundary, and makes every unverifiable subject a small forgery invited.

### Rule 1. Write the subject for the reader who will never open the commit. *(commits)*

**The claim:** a reader scanning `git log --oneline` can decide, in one
second, whether this commit concerns her.

Triage is the subject's whole job. The practiced form, which you should
adopt unless your project has an older one: address, colon, claim —
`pool: return connections to the pool after idle timeout`. The prefix
names the territory; the sentence carries the payload; lowercase after the
colon, no terminal period, because the subject is a heading and headings
do not take periods. Uniformity at this scale *is* elegance: `git log
--oneline` is a pipeline stage, and pipelines work because every line
agrees on its format. Write subjects that grep well.

**Check:** by review. Cover the diff. Ask a colleague who does not know
the change: does this commit concern you, yes or no? If the honest answer
is "I'd have to open it," the subject failed. The mechanical form — length
under ~70, prefix present, no period — is **lintable**; the triage
property is not.

- Obeys: `net/http: don't crash when the request has no body`
- Sins: `Various fixes and improvements`

### Rule 2. Use the imperative: name the act, not the aftermath. *(commits)*

**The claim:** the subject's verb is an imperative — `fix the leak`, not
`fixed` or `fixes`.

The commit is not a diary entry. It is an instruction to the tree: apply
this and the leak is fixed. There is honest humility in the mood, too:
"fixed" asserts a fact about the past that the commit cannot promise — the
bug may outlive it. The imperative names an intention, the way a function
name does. `fixLeak()`, not `leakWasFixed()`.

**Check:** by **lint** — a first-word verb-form check is crude and
catches most violations today. By review for the residue: a lint cannot
tell `document` the verb from `document` the noun.

- Obeys: `spell: fix typo in error message`
- Sins: `Fixed the typo that was in the error message.`

### Rule 3. Make the subject falsifiable. *(commits)*

**The claim:** a reader can check the subject against the diff, and
confirm or refute it, in under a minute.

`qmail-smtpd: reject bare LF` — verifiable in thirty seconds. `cleanup` —
you can verify nothing, so you must verify everything, so the message
saved you nothing. Worse than nothing: an unfalsifiable subject over a
diff that quietly widens a buffer is a lie by omission, and the subject is
the only line most auditors will ever read. A subject is falsifiable or it
is decoration, and decoration invites forgery. "Cleanup," "various
fixes," and "improvements" are therefore forbidden.

**Check:** by review, with a clock. Read the subject, then the diff, and
time the confirmation. Over a minute, or impossible: reject. This is the
first line of the reviewer's checklist and the cheapest audit in the
book.

- Obeys: `tls: reject certificates with negative serial numbers`
- Sins: `improve error handling`

### Rule 4. State the effect, not the mechanism — unless the mechanism is the news. *(commits)*

**The claim:** the subject says the thing the reader cannot get from a
ten-second skim of the diff.

`use sync.Once in dial` tells me what the diff would tell me anyway.
`dial: connect only once per address` tells me the behavior I can now
rely on — the thing the diff cannot say. The exception is real and
bounded: when the mechanism *is* the point — a revert, a vendoring bump, a
rename — say it plainly. `runtime: revert CL 12345` is a fine subject. The
rule beneath both cases: say what the reader cannot get elsewhere. A word
the diff already says is a needless word.

**Check:** by review. Skim the diff for ten seconds, then reread the
subject. If the subject taught you nothing the skim didn't, it named the
mechanism when the effect was the news.

- Obeys: `dial: connect only once per address`
- Sins: `dial: use sync.Once`

---

## CHAPTER II — THE BODY

Rules for the midnight reader.

She is bisecting a failure at 3 a.m., two years from now, and your commit
is at the bottom. The message is the only interview you will ever give
her. These five rules govern bodies **when a body is owed** — and the test
for owing one is itself checkable: *would a competent reader of the diff
still have a question?* For `spell: fix typo in error message`, no; the
empty body is not an exemption from the standard, it is the standard,
applied. For `increase timeout to 30s`, yes, always — and the one-line
body "the CI runners got slower after the migration to arm64" pays the
debt. Measure the debt by the diff's consequence, never by its size:
one-character diffs have shipped root holes, and `if (a = b)` to
`if (a == b)` deserves a paragraph.

### Rule 5. Record what evaporates. *(commits)*

**The claim:** every sentence in the body states something absent from
the diff — the why, the rejected alternatives, the accepted costs — and no
sentence restates what the diff already shows.

The what ages perfectly; the diff is right there, eternally. The why
evaporates the moment the author's attention moves on, and after that the
only recovery is a forty-year email thread with whoever is still alive.
So the body's job is exactly the part that evaporates, and nothing else:
not the file list (the diff stat exists; reciting it is reading the
reader her own eyes), not the narrative of how it happens to work inside,
not what the reader already holds in her hands.

**Check:** by review, sentence by sentence. For each sentence ask: could
a reader reconstruct this from the diff alone? Yes → delete it. No → it
stays. A body that survives this pass at zero sentences was never owed.

- Obeys: "The leak was invisible in tests because the test pool's
  timeout exceeded the test duration."
- Sins: "Renamed foo to bar and updated the callers."

### Rule 6. State the problem before the solution. *(commits)*

**The claim:** the body's first paragraph makes a reader who lacks
context believe the problem exists; the fix appears only after.

A body that opens with the fix is a proof with no theorem. Paragraph one:
the problem, concrete enough to believe. Paragraph two: the fix at the
level of intent — what invariant is now true that wasn't. Paragraph
three, only when earned: alternatives rejected and why, costs accepted
knowingly, what to look at first if this turns out wrong. If the bug was
interesting, spend one sentence on the shape of the trap — "the race only
fires when the timer wraps" — because that sentence teaches the next
person to see traps of that shape. The shape of the trap is not your
afternoon; see Rule 7.

**Check:** by review. Read paragraph one alone. Do you believe a problem
exists, and could you roughly state it back? If paragraph one names a
technique instead of a symptom, the theorem is missing.

- Obeys: "Connections that hit the idle timeout were closed but never
  removed from the pool's active count, so the pool reported itself full
  while holding no live connections."
- Sins: "Switch the timeout path to use put()."

### Rule 7. Write complete sentences, in order of importance. *(commits)*

**The claim:** every sentence has a subject and a verb, and the sentences
appear conclusion first — never in order of discovery.

A sentence forces a claim; a fragment gestures at one. "also refactor" —
what was refactored? toward what? A sentence would have had to say. And
order the claims by importance, not chronology: half of all rejected
bodies are archaeology — "first I looked at X, then I noticed Y" — the
author narrating their own afternoon. Nobody cares about your afternoon.
State the conclusion. State why it's right. Stop.

**Check:** by review, two passes. Pass one, grammar: any verbless
fragment fails. Pass two, order: if any sentence of the form "first I,"
"then I," "after investigating" survives, the body is a diary, and the
diary is returned to its author.

- Obeys: "The timeout path now releases the slot through the same put()
  as the normal path, so the count can no longer drift from the live set."
- Sins: "Started digging into the pool code and noticed some weirdness
  with timeouts. also refactor. tests pass"

### Rule 8. Address posterity, not the approver. *(commits)*

**The claim:** no sentence in the message is addressed to the reviewer,
and no sentence describes the review process that produced the change.

"Please look carefully at the locking" belongs in the review thread and
dies with it; the commit message outlives the review by decades. The same
lifetime test convicts the load-bearing link: "see the discussion in
#4127 for why" outsources the why to a system with a different lifetime,
and the day the tracker migrates, the commit becomes a locked box labeled
*key elsewhere*. The rule for links: the message stands alone on the why;
the link carries the archaeology — repro logs, benchmarks, dead ends —
the extras, never the essence. Summarize the verdict; cite the trial.

**Check:** by review. Imagine every tracker, chat log, and reviewer name
deleted tonight. Reread the message. If the why survives, it passes. Any
second-person sentence fails on sight.

- Obeys: "Fixed by pinning the head revision; benchmarks and two dead
  ends are in #4127."
- Sins: "Please review carefully since this touches critical code!"

### Rule 9. End with the trailers, exactly spelled. *(commits)*

**The claim:** machine-readable lines — `Fixes #4127`,
`Co-authored-by: …` — appear at the bottom, one per line, in the exact
dialect the consuming machine parses.

`Fixes #311` closes the issue; `fixes: #311`, or the same words buried
mid-paragraph, close nothing, and nobody is told. This is the one place
in the message where the reader is a parser and the parser has no
judgment to appeal to. Spelling is the entire content of the rule.

**Check:** by **lint**, entirely. Trailer grammar is a regular language;
hold it in a commit-msg hook and never spend a human on it again.

- Obeys: `Fixes #4127`
- Sins: "This should fix issue 4127 I think."

### Worked example: the specimen and the cure

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

Run the checks. Rule 3: "some issues," "several problems," "working
right," "some stuff" — six claims, zero checkable. Rule 7: "First I
noticed… so I investigated" — the afternoon, verbatim. Rule 5: "cleaner
and more maintainable going forward" — three phrases, no information, and
"going forward" is where time already goes. Rule 8: "Please review
carefully" — dead within the week. And "various other small fixes" is the
confession that this is two commits wearing one hash: Rule 3 cannot hold
a subject over a mixed diff, so the refactor rides separately.

The cure, commit one:

```
pool: return connections to the pool after idle timeout

Connections that hit the idle timeout were closed but never removed
from the pool's active count, so the pool eventually reported itself
full while holding no live connections. New requests then blocked
forever in Get.

The timeout path now releases the slot through the same put() as the
normal path, so the count can no longer drift from the live set. The
leak was invisible in tests because the test pool's timeout exceeded
the test duration.

Fixes #4127
```

Commit two: `pool: hoist dial retry out of Get`, whose body states "no
behavior change" — a claim, checkable, like any other.

Audit the cost of the cure: nothing. Every sentence came from knowledge
the original author held and withheld. The bad message wasn't cheaper to
write — it was only cheaper to think.

---

## CHAPTER III — DOCUMENTATION

READMEs, references, tutorials, man pages.

### Rule 10. First sentence: X is a Y that Z. *(all documents)*

**The claim:** the document's first sentence names the thing, its
category, and its distinguishing property — before virtues, before
history, before comparison.

"Vault-LD is a multi-writer wiki on autobee." Subject, category,
property. A reader who stops there stops informed. The anti-pattern is
negation — "X is not a framework" — which is not identity; tell the
reader what it is and let her work out the complement. And strike the
roadmap from the first screen: promises about the future are the least
checkable claims in the document, which makes them marketing wearing
documentation's clothes. Ship documentation of what runs today.

**Check:** by review, mechanically. Parse sentence one for the three
slots: name, category noun, distinguishing property. An adjective is not
a property ("fast" — compared to what, measured how?). Any slot empty:
rewrite.

- Obeys: "Flowlite runs data pipelines defined as plain Python
  functions, on one machine, without a scheduler service."
- Sins: "Flowlite is a blazingly fast, lightweight, developer-first
  framework for building next-generation data pipelines."

### Rule 11. One document, one reader. *(all documents)*

**The claim:** the opening line declares whether this is reference or
teaching, and routes the other reader away by link.

Reference and narrative are the oldest solved problem in the field: the
man page and the paper, separated, cross-linked, each pure — `awk(1)`
austere and complete, the book warm and long, neither apologizing for the
other. The sin is the hybrid that alternates modes paragraph by
paragraph, reference interrupted by pep talk, which serves neither reader
and lies to both about what it is. One line routes both: "This page is
the reference for X; for the tutorial see Y." No document is a hallway
and a room at once.

The same law, applied by machine, convicts the generated changelog. The
commit log addresses the maintainer of the tree; the changelog addresses
the operator of the software, and its unit is a change to the *user's
world*. Most commits produce no changelog line; some changelog lines
summarize forty commits. Its grammar: what changed for you, what you must
do about it, nothing else. "Upgraded internal parser" is a commit fact;
the changelog line is "dates before 1970 no longer parse as errors."
Generating one from the other force-feeds two readers one document.

**Check:** by review. Two tests: (1) does the first screen name its
reader and link the other away? (2) sample three consecutive paragraphs
anywhere; if they alternate between contract-stating and hand-holding,
the document is a hybrid.

- Obeys: "This is the reference for the vault API. New here? Start with
  the tutorial."
- Sins: a SYNOPSIS followed by "Don't worry if that looks scary!"

### Rule 12. Lead with a worked example, and make it complete. *(teaching; reference where examples appear)*

**The claim:** the first example appears before the theory, and a reader
can select it, paste it, and run it — no ellipses, no invisible
prerequisites, no "assuming the setup from chapter 2."

The example is the one form of documentation the author cannot fake.
Prose can bluff — "the tool handles errors gracefully" — but the example
either runs or it doesn't, and the reader who has run something believes
you while the reader four pages into abstractions is still deciding
whether to. An example with invisible prerequisites is worse than none:
it fails, and it teaches the reader to distrust the whole document.

**Check:** by **CI**. This is the book's second machine-held rule and
the strongest: compile the examples with the package, run them under the
test suite, and the documentation is in the build — if the example rots,
CI says so before a reader does. Where the tooling can't, the review
check is paste-and-run in a clean environment, and "clean" is the entire
test.

- Obeys: an example block that begins with its imports and ends with its
  observable output.
- Sins: `result = process(data)  # ... (see setup above)`

### Rule 13. Answer the five questions in order. *(reference)*

**The claim:** the document answers, in order: What is it. How do I
invoke it. What does it do. Show me. What will bite me.

NAME, SYNOPSIS, DESCRIPTION, EXAMPLES, BUGS — fifty years of proof the
order is right, because every section answers exactly one question a
reader arrives with, and sections are routing. The README is the modern
man page and has lost the anatomy under a logo, a wall of badges, and a
paragraph of adjectives; the reader's five questions are unchanged. A
README that answers them in the first screen is complete; everything
after is appendix.

**Check:** by review. Write the five questions in the margin of the
first screen and tick each where it is answered. An unticked question,
or a ticked one answered out of order, is the finding.

- Obeys: name and one-sentence identity, then the install line, then
  what it does, then a runnable example, then the sharp edges.
- Sins: logo, twelve badges, "Why Flowlite?", philosophy, and no
  invocation anywhere on the first screen.

### Rule 14. Keep the BUGS section, and tell the truth in it. *(reference)*

**The claim:** the document names its known deficiencies, plainly, dated
where possible — and every deficiency listed is real.

Modern documentation omits known faults as if omission fixed them. The
old BUGS sections — "this command is slow and stupid about tabs" — bought
reader trust at the price of author vanity, and it was the best purchase
in the manual: a document that admits one true fault is believed about
everything else. The confession is the credential. Note the second clause
of the claim, which is load-bearing: the credential is the confession's
*accuracy*, not its existence. A BUGS section of hedges is the Adjective
Stack inverted.

**Check:** by review, in two directions. Forward: is the section
present, and is each entry a checkable statement of a current fault?
Backward: sample the tracker's confirmed, long-lived bugs — do the ones a
user will hit appear here?

- Obeys: "BUGS: deletes are not confirmed by default; a watcher started
  with --confirm-deletes will tombstone files removed on disk."
- Sins: a documentation set with no BUGS section and forty open issues
  labeled `known-limitation`.

### Worked example: the first screen

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

Rule 10: Y is "framework," Z is a row of adjectives in units that don't
exist — zero distinguishing properties, and the reader still doesn't know
what it *does*. "No bloat. Batteries included": two slogans contradicting
each other three words apart. Rule 13: none of the five questions
answered, the screen spent proving the project is alive instead of saying
what it is.

The cure, four sentences: "Flowlite runs data pipelines defined as plain
Python functions, on one machine, without a scheduler service. A pipeline
is a function; a dependency is an argument. If you need distributed
execution or a UI, use Airflow — Flowlite is for the case where Airflow
is too much." Category, property, boundary, and the honest routing of the
wrong reader — a roadmap in reverse, and checkable today.

### A boundary note: the deprecation notice

The deprecation notice is the only documentation written *to* someone you
are actively inconveniencing, and it is usually written as if to someone
you are rid of. "Deprecated: use NewThing instead" has never once
contained enough information to act on. The complete form has four parts
and fits in four lines: what stops working; **when** it stops; the
one-to-one replacement, *shown* not named — old call above, new call
below; and the escape hatch where the mapping isn't one-to-one.
"Deprecated" without a date is a mood, not a notice — and a deprecation
that lives five years is a lie about your intentions, a decision
documented but declined. Announce, date, remove; readers plan around
dates, not vibes. The migration guide ships in the breaking change's own
commit (Rule 19, applied to the future) — and if writing the migration
table is too much work, you have just measured the pain you are about to
ship, multiplied by your user count. Reconsider the break.

**Check:** by review, four ticks: what / when / shown replacement /
escape hatch. By **lint**, crudely: a `Deprecated` marker with no date
string in reach is returnable on form alone.

---

## CHAPTER IV — COMMENTS AND THE PLACEMENT OF TRUTH

Where facts live so they cannot lie.

### Rule 15. Give every fact one home; let every other mention point. *(all prose)*

**The claim:** each fact — a timeout value, a port, an invariant — is
stated authoritatively in exactly one place, the most checkable place
available (code, test, generated reference), and every other occurrence
is a pointer, not a copy.

The moment a value appears in the code, a comment, the README, and the
wiki, three of the four are future lies — you just don't know which three
yet. The copy is the future lie. And the law convicts most wikis
outright: a wiki is where facts go to escape review — no diff, no
reviewer, no test, no owner. Documentation lives in the tree, versioned
with the code it describes, or it lives nowhere; what cannot drift
*separately* drifts less.

**Check:** by review, and by grep. Pick the facts most likely to change —
limits, defaults, endpoints — and grep for each literal. More than one
authoritative-looking occurrence is a finding. Where docs are generated
from source, this rule graduates to **CI**.

- Obeys: "The op size limit is defined in `limits.js`; see the generated
  reference for the current value."
- Sins: "The max op size is 64KB" — in a README last touched two
  generations ago.

### Rule 16. Comment what the code cannot say. *(code)*

**The claim:** every comment states something unrecoverable from the
code itself — intent, invariant, the reason the simpler way fails — and
no comment restates what the code says slower.

The comment's great vice is that it can't be executed, so it can't be
caught lying; nothing checks it against the code, so every comment starts
life as a small debt. The bar for taking on that debt is therefore high.
`i++ // increment i` is not documentation, it is a hostage note proving
the author was alive at the keyboard. The comment that translates code
into English insults two languages at once. The floor of usefulness:
preconditions. "This function assumes the lock is held" prevents a
category of bug; "this loops over the array" prevents nothing.

**Check:** by review, with the deletion test: strike the comment, reread
the code, and if nothing is missing, the comment was ornament. Apply the
converse too — could a maintainer violate this comment's claim without
noticing? If no claim can be violated, no claim was made.

- Obeys: `// Callers must hold mu; the map is not otherwise synchronized.`
- Sins: `i++ // increment i`

### Rule 17. Spend your prose at the interface. *(code)*

**The claim:** the declaration's comment states the contract — what the
caller may rely on, what the caller must guarantee — and receives the
maintenance budget before any other commentary.

The interface comment is not drift-prone decoration; it is the most
load-bearing prose in the system, because callers compile against your
sentence, not your body. The code is merely one implementation of the
comment. The amendment that keeps the rule austere: preconditions or
silence — the contract states what must be true and what will be true,
never philosophy.

**Check:** by review, at the call site. Read only the interface comment,
then write a call. If you needed the body to call correctly, the contract
is incomplete; if the comment told you how the body works, it overspent.

- Obeys: "Returns the number of characters transmitted. On error,
  returns -1 and sets errno."
- Sins: "This method uses an efficient internal caching strategy."

### Rule 18. Sign the cliffs; skip the coastline. *(code)*

**The claim:** implementation internals are documented only at the
boundary of surprise — the invariant a maintainer would never guess,
stated at the exact line it governs — and nowhere else.

Documentation of how it currently happens to work inside freezes the very
thing you most need free to change; the reader who needs the internals
has the source, which is always current, being the thing itself. But
where the implementation does something no maintainer would guess — the
array that must stay sorted, the field that aliases another — write it
down, precisely there. A warning sign at the cliff, not a travelogue of
the coastline. Locality is part of the claim: a comment three lines above
the code it governs is already lying about something, and the cliff sign
filed in a wiki is filed in a drawer three buildings from the cliff.

**Check:** by review, in both directions. Coastline: any comment
narrating unsurprising mechanism is deletable — apply Rule 16's deletion
test. Cliffs: at every non-obvious invariant the diff touches, is the
sign present, and is it *on the line it governs*?

- Obeys: `// entries stays sorted by key; binarySearch below depends on it.`
- Sins: a twelve-line comment walking through what the loop does, above
  an undocumented aliasing trick.

### Rule 19. A change to behavior changes its documentation in the same commit. *(all prose)*

**The claim:** if a diff alters observable behavior, the same diff
alters every document that described the old behavior; "docs to follow"
does not appear.

The follow-up commit is where documentation goes to not exist. Same
commit, same review is the mechanism that keeps prose and program from
drifting apart — the change that ships a flag the manual doesn't mention
should be as embarrassing now as it was when the manual was typeset and
on every desk. The commit is the unit of truth; let it be the unit of
documentation too. And when a feature cannot be documented in a sentence,
treat that as the design review it is: docs are the test the design must
pass, and features have been rightly deleted for failing it.

**Check:** by **CI**, wherever docs are generated or annotated — the
drift check, the doc lint, the example that compiles; let CI blush for
you. By review everywhere else: the reviewer greps the docs for the
behavior the diff changes, and any surviving description of the old
behavior blocks the merge. The string "docs to follow" is **lintable** on
sight.

- Obeys: a diff that renames a flag and carries the man page hunk in the
  same commit.
- Sins: "Docs to follow in a separate PR."

---

## CHAPTER V — AN APPROACH TO STYLE

One page. It earns it.

### Rule 20. Place yourself in the background. *(all prose)*

**The claim:** the record exposes the change, never the author's
temperament; every judgment in it names code, not character.

Blunt about code, silent about character. "The code was wrong for nine
years and the test was wrong the same way" is the fact pattern, and
softening it deletes the lesson. "Whoever wrote this was careless" is
speculation, in the permanent record, about a person who worked under
constraints you cannot see from here. The log is not the place to win an
argument with a ghost; the blame layer is `git blame`, and even that
names lines, not character. **Check:** by review — scan for any sentence
whose subject is a person rather than the code; blunt sentences about
wrongness pass, verdicts about people fail. Obeys: "this parser accepted
malformed input for nine years." Sins: "previous author clearly never
tested this."

### Rule 21. One concept, one word, everywhere. *(all prose)*

**The claim:** each concept in a document is named by exactly one term,
spelled identically at every occurrence.

Grep is a reader: name the concept four ways — node, vertex, element,
item — and the searching reader finds half your document and trusts all
of it. The second-language reader is the majority of programmers now, and
one term learned once travels; so do plain words over clubby ones. A
technical term is a contract — use "idempotent" only when "safe to retry"
would have lost something, and never deploy a term the reader can't
check: define it in a clause, or cite where it's fixed. **Check:** by
**lint** — the only rule here a machine holds entire today: a project
dictionary of synonym sets, a check that flags the off-term. Crude, and
real.

### Rule 22. Earn the aphorism. *(all prose)*

**The claim:** the default register is the plain long sentence;
compression appears only where the surrounding prose has paid for it, and
never in a load-bearing position.

Terseness is a dialect of experts — the one-liner lands because forty
years of context stand behind it, and the junior who reads "obviously
wrong, revert" learns only fear. Default to the sentence the newest
reader can decompress. But when a sentence can carry a chapter, let it:
one fish per thousand pages, self-contained, placed where nothing
load-bearing stands — a joke in the SYNOPSIS is a bug; a joke in BUGS is
a feature. **Check:** by review, and by ear — read it aloud; prose that
can't be spoken can't be skimmed, and if you'd be embarrassed to read
your message to the room, the room has told you something. Style is the
sound sense makes.

---

## APPENDIX A — THE SINS

Fifteen named anti-patterns. Naming shames faster than theory. Each entry
carries its detection, because a sin you cannot detect is a sermon.

1. **THE HOSTAGE NOTE.** `i++ // increment i` — a comment proving only
   that the author was present at the keyboard. *Detect:* Rule 16's
   deletion test; partially lintable (comment token-identical to its
   line).
2. **THE AFTERNOON.** "First I looked at X, then I noticed Y…" — the
   author narrating their day instead of stating their conclusion.
   *Detect:* by eye; first-person past-tense narration in a body.
3. **THE UNFALSIFIABLE SUBJECT.** "cleanup," "various fixes,"
   "improvements" — a claim no diff can confirm or deny, worthless as a
   filter. *Detect:* lintable blocklist; the general case by Rule 3's
   one-minute check.
4. **THE TOMBSTONE.** The comment describing what the code used to do.
   History belongs to the log; the comment lies in the present tense.
   *Detect:* by eye; "previously," "used to," "the old version" in
   comments — grep-able.
5. **THE APOLOGY TOUR.** "This is a bit hacky, sorry" — self-deprecation
   standing where the constraint should be. Say why the hack is
   necessary or fix it; shame is not documentation. *Detect:* grep for
   "hacky," "sorry," "ugly, I know."
6. **THE GREENHOUSE.** Docs that only work in the author's environment —
   the example with invisible prerequisites. *Detect:* by CI — run the
   example in a clean environment; that is the entire test.
7. **THE ADJECTIVE STACK.** "Blazingly fast, lightweight, powerful" —
   properties claimed in units that don't exist. Measurements have
   numbers; the rest is weather. *Detect:* by eye — for each adjective
   ask *in what unit?*; a starter blocklist lints.
8. **THE ECHO.** The commit body reciting the diff — "renamed foo to
   bar, updated callers." I have eyes. *Detect:* Rule 5's per-sentence
   test: reconstructible from the diff → delete.
9. **THE DOCS-TO-FOLLOW.** The behavior change merged on a promise of
   future documentation. The follow-up has a documented survival rate of
   nil. *Detect:* lintable string; Rule 19's review grep for the rest.
10. **THE LOAD-BEARING LINK.** "See #4127 for why." The why, outsourced
    to a system with a different lifetime. *Detect:* by eye — delete
    every link mentally and reread; if the why went with them, convicted.
11. **THE THESAURUS.** Node, vertex, element, item — four terms, one
    concept, zero grep. *Detect:* by lint — the Rule 21 dictionary
    check.
12. **THE HEDGE.** "Should probably," "seems to," "I think this fixes."
    If you verified it, say so plainly; if you didn't, say *that*
    plainly. Uncertainty is honest; vagueness about your uncertainty is
    not. *Detect:* grep for hedge phrases; then the honest question —
    verified or not?
13. **THE BADGE WALL.** Twelve shields proving the project is alive
    instead of a first screen saying what it is. *Detect:* by eye — is
    anything above the fold an answer to one of the five questions?
14. **THE ORPHANED WHY.** The constraint documented nowhere near the
    code it constrains — the cliff sign filed in a drawer three buildings
    from the cliff. *Detect:* by review at the cliff: when a diff
    touches an invariant, is its sign in the hunk's neighborhood?
15. **THE CONFIDENT ESSAY.** Length worn as authority; a thousand words,
    wrong in every paragraph. Length reads as diligence and is not
    diligence. *Detect:* the same instrument that catches its opposite —
    falsifiable sentences, checked against the diff. Style doesn't save
    you; verification saves you.

---

## APPENDIX B — THE CONFESSIONS

Nine breaking points, from the authors. A rule book written by people who
never break the rules is written by people who never write. The
confessions are themselves held to Rule 3: each names the rule, the
circumstance, and the price — a checkable exception, not a mood.

**Pike, against Rule 4.** When the mechanism is a landmine for the next
person, name it in the subject even though the effect is small.
`runtime: don't use cgo in the signal handler` — the effect was "fix a
rare crash," but the subject's job that day was to make the *pattern*
radioactive. Sometimes the subject is a warning label, not a summary.

**Kernighan, against Rule 11.** In a book, deliberately. A book can
braid reference and teaching because it has a spine and an index — the
reader can enter twice. The rule is really about documents with one door.

**McIlroy, against Rule 12.** When the concept is dangerous
half-understood, the example does not lead. `rm` does not want an
inviting example at the top of the page. For sharp tools, preconditions
before invitations: the reader you hook is the reader you're responsible
for.

**Thompson, against all of them.** In code written for oneself alone.
The rules price the reader's time above the writer's; when the writer IS
the reader, the price is wrong. The only mistake is forgetting which
kind of code you're in.

**Ritchie, against Rule 16.** For the reader-in-training. In teaching
code, comments that narrate the obvious are the point — the annotated
program is a genre of its own, and the C book's examples do it
shamelessly. Pedagogy licenses what production forbids.

**Cox, against Rule 7.** When the conclusion is unbelievable without the
journey. Some fixes are so strange the reader rejects the summary until
walked to it; those messages read like proofs because the claim looked
insane. The test that keeps this honest: a *derivation* could convince a
stranger; an afternoon only describes the author.

**Bernstein, against Rule 14** — narrowing it. No published suspicions
in security-sensitive documentation; a stated "this area is probably
weak" is a treasure map. Confess deficiencies you'd bet on, or say
nothing. The credential is the confession's accuracy, not its existence.

**de Raadt, against Rule 20.** Every time the background caused the bug.
When code is wrong because a vendor lied or a standard is malignant, say
so, in the commit, with the vendor's name. Posterity deserves the
indictment; softening it would be deleting the lesson.

**White, against Rule 21.** The word the page has repeated twelve times,
at the sentence where the twelfth repetition would deafen the reader to
the one that matters. Even grep forgives a pronoun.

---

## BUGS

This book obeys Rule 14 or it is a fraud. Known deficiencies, dated to
this draft: seventeen of its twenty-two rules are held only by review,
and review is exactly as good as the reviewer's worst day. The Rule 21
dictionary check is crude — it cannot tell a synonym from a citation.
Rule 1's one-second test has no instrument but a colleague, and
colleagues are a scarce resource at midnight. And the book's own
epigraph — *record what evaporates* — is unfalsifiable as stated; it is
kept anyway, under Rule 22, having been paid for by the twenty-one rules
before it.

## Closing

Documentation is the part of the program that runs on people — written,
tested, and deleted to the same standard as the part that runs on
machines. Reviewed like code, versioned like code, held by the cheapest
instrument that can hold it. Every sentence is a promise; make only the
promises you can keep, and keep every one you make. A sentence you
cannot check is a sentence you cannot trust — write checkable sentences.
Say it once, say it true, stop.
