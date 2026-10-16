# The six drafts, and what each one convicts

Six drafts argued the book into existence. The Teacher's text won and governs
the adopted version; the others survive as drafts with grafts adopted on the
floor.

They do not agree about everything. Cite the one that convicts most sharply —
attribution keeps a review honest, gives the author somewhere to argue back,
and stops you presenting a split reading as consensus.

Source: `../../elements-of-documentation/bundle/drafts/`

## the-teacher.md — the adopted base

**Method:** sin and obedience, side by side, then the reasoning. Every rule
leads with a code block you can compare before you read a word of theory.

**Cite it for:** the deletion test in its sharpest form, and the trap-shape
allowance.

> "If a comment would survive being checked against the code by a machine —
> because it says nothing the code doesn't — it should not survive being
> checked by you."

> "When the bug was interesting, spend one sentence on the *shape* of the trap
> — not your day, the trap. It teaches the next reader to see traps of that
> shape, and it is the difference between a log entry and a lesson."

The second is the one that saves a comment you were about to strike. Use it
when history is *almost* a finding.

## the-auditor.md — checkability

**Method:** every rule carries a **Check** line naming the cheapest instrument
that holds it — lint, CI, or review. Opens with an inventory table of all 22.

**Cite it for:** the converse test, which is the most useful single sentence in
the whole bundle for comment review.

> "Could a maintainer violate this comment's claim without noticing? If no
> claim can be violated, no claim was made."

Also its per-rule instruments — Rule 15's *"grep for each literal; more than
one authoritative-looking occurrence is a finding"*, and Rule 17's call-site
test: read only the interface comment, then write a call.

The Auditor is the draft to cite when you want a finding to be *actionable*
rather than merely correct.

## the-clerk.md — the filter principle and the review passes

**Method:** the panel's floor record. Attributes each sin to the author who
named it.

**Cite it for:** the layering principle, adopted verbatim into Chapter I —

> "Every layer of documentation is a filter for the layer below. Subject filters
> body; body filters diff; comment filters code. Each layer must add
> information, or be deleted."

This is the sentence that convicts a comment restating a commit message, or a
test comment restating the source comment above the function it tests.

Also the deletion *pass*, which is a procedure rather than a test:

> "for each sentence, would the document be poorer without it? — sentence by
> sentence, then again paragraph by paragraph; prose has dead code, and plenty
> of true sentences are still needless."

Run it paragraph-by-paragraph on any block comment over ten lines.

## the-engineer.md — mechanical, and hardest on history

**Method:** command, reasoning, obedience, sin. Terse. Gives the mechanical
form before the philosophy.

**Cite it for:** the two placement laws, stated more bluntly here than anywhere
else.

> "History: 'previously this used a linked list' belongs in the log, not the
> comment — the commit message is where the past lives; the comment is where
> the present lives; confusing them is how you get comments that read like
> tombstones."

> "Aspirations: a TODO in code is a tracked item that escaped tracking — no
> owner, no date, mostly false within a year."

When a diff is full of "the reader this replaced" and "before #541", the
Engineer is your citation.

## the-stylist.md — locality, and the cost of copies

**Method:** voice first. The only draft that treats prose economics directly.

**Cite it for:** the four-word verdict on Rule 15 —

> "The copy is the future lie."

— and for locality as a truth claim:

> "Position is part of truth. A comment three lines above the code it describes
> is already lying about something."

Also cost-shifting, which is the fair-minded frame for length disputes:

> "Brevity that locks out the second reader is not economy; it is cost-shifting
> — a paragraph saved, and a thousand strangers each pay an afternoon.
> Verbosity is cost-shifting too."

Cite this when an author defends a long comment. The question is not *long or
short* but *who pays*.

## the-minimalist.md — the length control

**Method:** the whole book in a third of the words. Its Chapter IV is 32 lines.

**Cite it for:** nothing it says uniquely — cite it for what it *is*. When a
comment block runs twenty lines, the Minimalist's treatment of the same subject
in four is the argument.

Use it as the counterfactual: *the Minimalist covers this rule in three
sentences; this comment spends fifteen lines on one constant.* That comparison
lands harder than any adjective.

## Reading the splits

Where the drafts diverge, the divergence is the finding — report it rather than
resolving it.

The three splits that come up most in code review:

**Test files and Ritchie's confession.** The Auditor and the Engineer apply the
deletion test uniformly. The Teacher and the Clerk both record that pedagogy
licenses narration. A test that demonstrates a defect is closer to teaching
than to production, so a comment narrating the obvious there has a defence the
same comment in `src/` does not.

**History that teaches.** The Engineer strikes all of it. The Teacher keeps one
sentence when it names a *trap shape* rather than a sequence of events. The
practical line: does it teach the next reader to recognise this class of bug, or
does it merely record that a bug happened?

**Long comments.** The Minimalist and the Stylist disagree about whether length
is itself a fault. The Stylist's framing is the more useful one — length is not
a fault, unpaid cost-shifting is — but the Minimalist's existence is the
evidence that the shorter version was available.
