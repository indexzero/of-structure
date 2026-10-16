---
_id: a0f9edad7dccb008ed4b0b89e178c5e02eb52fbd1ecc6e64a4ce1c722fa7d05c3
_rev: baa7b3a34c626e8baf3af52fc8c830d2d2e33a0c61cb4436865b04df4e265af6
type: draft
title: "The Elements of Documentation — the minimalist draft"
---

# THE ELEMENTS OF DOCUMENTATION

*rules, and the prices they charge*

For the engineer at midnight, two years from now, who cannot ask us
anything. Every rule in this book is an answer she will need.

> Record what evaporates.

> The bad message wasn't cheaper to write — it was only cheaper to think.

## Preface

Every rule here serves one reader: the engineer bisecting a failure at
midnight, who cannot ask the author anything. Serve her and the novice,
the expert, and the machine are served free. Each rule names its scope;
a rule applied to the wrong reader is a bug wearing a badge of virtue.
Five of these rules a machine can enforce; seventeen live or die in
review. Lint the form; review the truth. And a warning the rules apply
to themselves: concision is a budget, not a vow. A rule may spend words
to forestall a misreading dearer than the words.

---

## Chapter I — The Subject Line

*The fifty characters read a thousand times.*

**Rule 1. Write the subject for the reader who will never open the
commit.** *(subjects)*
The subject is triage: it must let a reader decide, in one second,
whether the commit concerns her. The practice: address, colon, lowercase
claim, no period. The prefix names the territory; the sentence is the
payload; the period claims a finish a heading doesn't owe.
Sin: `Update code`.
Obedience: `net/http: don't crash when the request has no body`

**Rule 2. Use the imperative: name the act, not the aftermath.**
*(subjects)*
The commit is an instruction to the tree, not a diary entry. "Fixed"
asserts a past the commit cannot promise — the bug may outlive it. The
imperative names an intention, which is all a commit honestly has.
Sin: `Fixed the leak`.
Obedience: `fix the leak`

**Rule 3. Make the subject falsifiable.** *(subjects)*
A reader must be able to check the claim against the diff in under a
minute. "cleanup" verifies nothing, so the reader must verify
everything; the message saved her nothing. Unfalsifiable subjects are
forbidden. Decoration invites forgery.
Sin: `various fixes`.
Obedience: `smtpd: reject bare LF`

**Rule 4. State the effect, not the mechanism — unless the mechanism is
the news.** *(subjects)*
The diff already says the mechanism; the subject's job is the behavior
the reader can now rely on. Reverts, renames, and vendoring may name
themselves: there, the mechanism is the news.
Sin: `use sync.Once in dial`.
Obedience: `dial: connect only once per address`

---

## Chapter II — The Body

*For the midnight reader.*

**Rule 5. Record what evaporates.** *(bodies)*
The diff preserves the what forever. The why dies with the author's
attention. The body records exactly the part that evaporates: why this
was necessary, what was tried and rejected, what cost was accepted.
Nothing the reader already holds — no file lists, no diff recital.
A body is owed when the diff leaves a question standing, measured by
consequence, never by size. `spell: fix typo in error message` owes no
body; changing `if (a = b)` to `if (a == b)` owes a paragraph. The
empty body is not an exemption from the standard; it is the standard,
applied.

**Rule 6. State the problem before the solution.** *(bodies)*
Paragraph one earns the reader's belief that a problem exists.
Paragraph two states what invariant now holds. A body that opens with
the fix is a proof with no theorem.

**Rule 7. Write complete sentences, in order of importance.** *(bodies)*
A sentence forces a claim; a fragment gestures at one. "also refactor"
— what, toward what? A sentence would have had to say. Conclusion
first; reasons second; archaeology never. Nobody cares about your
afternoon.

**Rule 8. Address posterity, not the approver.** *(bodies)*
The review dies within the week; the log is forever. No "please check
the locking," no narration of process. And no load-bearing links: the
tracker has a different lifetime. Summarize the verdict in the message;
cite the trial for the archaeology.

**Rule 9. End with the trailers, exactly spelled.** *(bodies)*
`Fixes #4127` closes the issue; misspelled, it closes nothing. Machine
lines at the bottom, in the machine's dialect, one per line.

### Worked example — the commit message

The specimen:

```
Fixed some issues with the connection handling code. First I
noticed that the pool wasn't working right so I investigated and
found it was related to timeouts. Also refactored some stuff in
pool.go to be cleaner going forward. Please review carefully!
Various other small fixes included as well.
```

Every claim unfalsifiable (Rule 3). The afternoon narrated (Rule 7).
The approver addressed (Rule 8). "Various other small fixes" confesses
one commit should be two. The cure — split, then:

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

The rewrite cost nothing. Every sentence came from knowledge the
original author held and withheld.

---

## Chapter III — Documentation

*READMEs, references, tutorials, man pages.*

**Rule 10. First sentence: X is a Y that Z.** *(all documents)*
Category and distinguishing property, before virtues, before history,
before comparison. Never what it isn't — negation is not identity. A
reader who stops after one sentence stops informed.
Sin: `Flowlite is a blazingly fast, lightweight, developer-first
framework`.
Obedience: `Flowlite runs data pipelines defined as plain Python
functions, on one machine, without a scheduler service.`

**Rule 11. One document, one reader.** *(all documents)*
Declare in the opening line whether this is reference or teaching, and
route the other reader away by link. The hybrid serves nobody and lies
to everybody. In reference, say it once; in teaching, say it twice,
differently, on purpose — and let the second telling know it is one.
The changelog is the same rule at another door: it addresses the
operator, not the maintainer. Its grammar: what changed for you, what
you must do about it, nothing else. Do not generate it from the commit
log; that is two readers force-fed one document.

**Rule 12. Lead with a worked example, and make it complete.**
*(teaching)*
An example is the one form of prose that cannot bluff: it runs or it
doesn't. Complete means paste-and-run — no ellipses, no invisible
prerequisites, no "assuming chapter 2." Where tooling allows, examples
compile in CI: prose under test.

**Rule 13. Answer the five questions in order.** *(reference)*
What is it. How do I invoke it. What does it do. Show me. What will
bite me. NAME, SYNOPSIS, DESCRIPTION, EXAMPLES, BUGS — fifty years of
proof the order is right. A README answering the five in its first
screen is complete; everything after is appendix.

**Rule 14. Keep the BUGS section, and tell the truth in it.**
*(reference)*
Known deficiencies, stated plainly, dated if possible. A document that
admits one true fault is believed about the rest. The confession is the
credential.

*A genre note: the deprecation notice.* It is written to someone you
are actively inconveniencing; write it so. Four lines: what stops
working; when; the replacement shown, old call above new; the escape
hatch where the mapping isn't one-to-one. "Deprecated" without a date
is a mood. Announce, date, remove — the reader plans around dates. The
migration guide ships in the breaking change, same commit, same review;
if it is too much work to write, you have measured the pain you are
about to ship.

### Worked example — the README first screen

The specimen: a logo, twelve badges, `blazingly fast, lightweight,
developer-first`, and "We believe data engineering should spark joy."
Zero distinguishing properties; the reader still doesn't know what it
does. The cure, in four sentences:

> Flowlite runs data pipelines defined as plain Python functions, on
> one machine, without a scheduler service. A pipeline is a function; a
> dependency is an argument. If you need distributed execution or a UI,
> use Airflow — Flowlite is for the case where Airflow is too much.

Category, property, boundary, and the wrong reader honestly routed.
What it refuses to do is the roadmap in reverse, and checkable today.

---

## Chapter IV — Comments and the Placement of Truth

*Where facts live so they cannot lie.*

**Rule 15. Give every fact one home; let every other mention point.**
*(all prose)*
The moment a value appears in the code, the comment, the README, and
the wiki, three of the four are future lies — you don't yet know which
three. State the fact once, where it is checkable — code, test,
generated reference — and let prose refer.

**Rule 16. Comment what the code cannot say.** *(comments)*
Intent, invariant, the reason the simpler way fails. Never what the
code already says slower.
Sin: `i++ // increment i`.
Obedience: `// assumes the caller holds mu`

**Rule 17. Spend your prose at the interface.** *(comments)*
The declaration's comment is the contract; the code is one
implementation of it. Callers compile against your sentence, not your
body. It gets the maintenance budget. Preconditions or silence.

**Rule 18. Sign the cliffs; skip the coastline.** *(comments)*
Internals stay undocumented except at the boundary of surprise — the
sorted array that must stay sorted, the field that aliases another —
stated at the exact line it governs. A warning sign at the cliff, not a
travelogue of the coastline. Not history ("previously a linked list" —
the past has a subsystem, git), not aspiration (a TODO is a tracked
item that escaped tracking).

**Rule 19. A change to behavior changes its documentation in the same
commit.** *(all prose)*
"Docs to follow" is where docs go to not exist. Enforce by review;
better, by check — let CI blush for you.

---

## Chapter V — An Approach to Style

*One page.*

**Rule 20. Place yourself in the background.** *(all prose)*
The record exposes the change, not the author's temperament. Blunt
about code — "this was wrong for nine years" is the fact pattern, and
softening it deletes the lesson. Silent about character: the log is not
the place to win an argument with a ghost.

**Rule 21. One concept, one word, everywhere.** *(all prose)*
Grep is a reader; find half the occurrences, trust all of them. The
second-language reader is the majority; plain words travel, short words
travel farther. The thesaurus is where documentation goes to die.

**Rule 22. Earn the aphorism.** *(all prose)*
Compression is a dialect of experts, and most readers are still
learning it. Default to the plain long sentence. But when a sentence
can carry a chapter, let it — one fish per thousand pages, placed where
nothing load-bearing stands. Style is the sound sense makes.

Omit needless words; the words that remain, make true; of the true
words, keep the ones the reader cannot get anywhere else.

---

## Appendix A — The Sins

Fifteen anti-patterns, named so they can be shamed.

1. **The Hostage Note.** `i++ // increment i` — proof only that the
   author was present at the keyboard.
2. **The Afternoon.** "First I looked at X, then I noticed Y…" — the
   day narrated instead of the conclusion stated.
3. **The Unfalsifiable Subject.** "cleanup," "various fixes" — a claim
   no diff can confirm or deny, worthless as a filter.
4. **The Tombstone.** The comment describing what the code used to do.
   History belongs to the log.
5. **The Apology Tour.** "A bit hacky, sorry" — shame standing where
   the constraint should be. Shame is not documentation.
6. **The Greenhouse.** The example that only runs in the author's
   environment; invisible prerequisites teach distrust.
7. **The Adjective Stack.** "Blazingly fast, lightweight, powerful" —
   properties claimed in units that don't exist.
8. **The Echo.** The body reciting the diff. "Renamed foo to bar,
   updated callers." The reader has eyes.
9. **The Docs-to-Follow.** The behavior change merged on a promise of
   future documentation. Survival rate: nil.
10. **The Load-Bearing Link.** "See #4127 for why." When the tracker
    dies, the commit is a locked box labeled *key elsewhere*.
11. **The Thesaurus.** Node, vertex, element, item — four terms, one
    concept, zero grep.
12. **The Hedge.** "Should probably," "I think this fixes." If you
    verified it, say so plainly; if you didn't, say that plainly.
13. **The Badge Wall.** Twelve shields proving the project is alive
    instead of one sentence saying what it is.
14. **The Orphaned Why.** The invariant filed in a wiki, three
    buildings from the cliff it signs.
15. **The Confident Essay.** Length worn as authority — a thousand
    words, wrong in every paragraph. Verification saves you; style
    doesn't.

---

## Appendix B — The Confessions

Each author, the rule he breaks, and the price he pays knowingly. A
rule book by people who never break the rules is by people who never
write.

1. **Pike breaks Rule 4.** When the mechanism is a landmine, he names
   it in the subject — `runtime: don't use cgo in the signal handler`
   — to make the pattern radioactive. Sometimes the subject is a
   warning label, not a summary.
2. **Kernighan breaks Rule 11.** A book braids reference and teaching
   because it has a spine and an index; the reader can enter twice.
   The rule is really about documents with one door.
3. **McIlroy breaks Rule 12.** For sharp tools — `rm` — preconditions
   before invitations. The reader you hook is the reader you're
   responsible for.
4. **Thompson breaks all of them,** in code he writes for himself. The
   rules price the reader's time above the writer's; when writer and
   reader are one, the price is wrong. The mistake is only forgetting
   which kind of code you're in.
5. **Ritchie breaks Rule 16.** In teaching code, narrating the obvious
   is the point; the annotated program is a genre. Pedagogy licenses
   what production forbids.
6. **Cox breaks Rule 7.** When the conclusion is unbelievable without
   the journey, the derivation earns its place. A derivation could
   convince a stranger; an afternoon only describes the author.
7. **Bernstein narrows Rule 14.** No published suspicions in
   security-sensitive docs — a stated weakness is a treasure map.
   Confess deficiencies you'd bet on, or say nothing; the credential
   is the confession's accuracy.
8. **de Raadt breaks Rule 20** whenever the background caused the bug.
   When a vendor lied or a standard is malignant, the commit says so,
   by name. Posterity deserves the indictment.
9. **White breaks Rule 21** at the sentence where the twelfth
   repetition would deafen the reader to the one that matters. Even
   grep forgives a pronoun.
