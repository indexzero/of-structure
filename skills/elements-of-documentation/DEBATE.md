# The Elements of Documentation — The Debate

> **A note on provenance.** What follows is a *staged, fictional debate* — an
> emulation, produced as a writing exercise, of the voices of real people
> (several deceased). No line below is an actual quotation of any of them.
> The positions are extrapolated from their public work and writing; the
> words are invented. It was transcribed from a 50-step staged deliberation
> whose goal was to compile a Strunk & White–style guide to commit messages
> and technical documentation. The transcript is the input to that guide's
> first draft.

## Dramatis personae

- **E.B. WHITE** — moderator; co-author of the original *Elements of Style*; gentle but exacting
- **ROB PIKE** — Plan 9, Go; terse, aphoristic
- **BRIAN KERNIGHAN** — the teacher; warmth, examples
- **DOUG McILROY** — pipes; ruthless economy
- **KEN THOMPSON** — says little, lands hard
- **DENNIS RITCHIE** — the K&R voice; precision with modesty
- **RUSS COX** — Go; the long-form commit message as design doc
- **DAN BERNSTEIN (djb)** — austerity; correctness as style
- **THEO DE RAADT** — OpenBSD; salt; bluntness as honesty

## Agenda

I. the subject line · II. the body — why over what · III. omit needless
words · IV. reference vs tutorial · V. audience and tone · VI. comments
and docs that lie · VII. process — rewriting and review · VIII. objections
and limits · then the distillation of numbered rules.

---

## Opening

**WHITE:** Gentlemen. My co-author reduced English composition to sixty-six pages by refusing to say anything twice. Tonight we attempt the same for the writing that surrounds programs. The rule I carry in the door: "Omit needless words." Mr. Pike, you first — what is a commit message?

**PIKE:** A commit message is a caption. Not the picture. The diff is the picture.

## Round I — The Subject Line

**KERNIGHAN:** A caption, yes — but a caption that must survive alone. `git log --oneline` strips everything else away. The subject line is read a hundred times for every time the body is read, and a thousand times for every time the diff is read. Write it for the reader who will never open the commit.

**COX:** Which is why Go pins the form: package prefix, colon, lowercase summary, no period. `net/http: don't crash when the request has no body.` The prefix is the address; the sentence is the payload. The reader scanning five hundred subjects is doing triage, and triage needs uniformity more than it needs elegance.

**McILROY:** Uniformity is elegance, at that scale. A pipeline works because every stage agrees on the format of a line. `git log --oneline` *is* a pipeline stage. Write subjects that grep well.

**WHITE:** Strunk would ask: why lowercase? Why no period?

**COX:** The period claims the sentence is finished. A subject is a heading, and headings don't take periods — your own book doesn't put one after "Omit needless words" in the table of contents. Lowercase after the colon because the prefix already did the capital's job of starting the line.

**THOMPSON:** Also it's one less character.

**WHITE:** Mr. Thompson has given us our first rule and it fits on a fortune cookie.

### The imperative mood

**WHITE:** Convention says write "fix the leak," not "fixed the leak" or "fixes the leak." Defend the imperative.

**PIKE:** The commit isn't a diary entry. It's an instruction to the tree: apply this and the leak is fixed. "Fix the leak" reads as the name of an act, like a function name. `fixLeak()`, not `leakWasFixed()`.

**RITCHIE:** There's also honest humility in it. "Fixed" announces a fact about the past that the commit cannot actually promise — the bug may outlive the commit. The imperative names an intention. C's documentation had this property by accident: "returns the number of characters transmitted" — present tense, a contract, not a boast.

**DE RAADT:** You're all dancing. The real rule is: the subject must let me decide whether to read further in under a second. I read thousands of these. If your subject is "various fixes" I already know your diff is careless, because your sentence was.

**KERNIGHAN:** Theo's point generalizes and it's the heart of the book we're writing: every layer of documentation is a filter for the layer below. Subject filters body; body filters diff; comment filters code. A layer that repeats the layer below has failed — it filtered nothing.

**McILROY:** Rule: each layer must add information, or be deleted.

**WHITE:** That one goes in the book verbatim.

### What the subject must contain

**BERNSTEIN:** Nobody has said the obvious: the subject line is a security boundary. It is the only part of the change most people will ever audit. If it says "improve error handling" and the diff quietly widens a buffer, the subject lied by omission. I hold subjects to the standard of an interface declaration: it must be *checkable* against the diff. "qmail-smtpd: reject bare LF" — you can verify that claim in thirty seconds. "cleanup" — you cannot verify anything, so you must verify everything, so the message saved you nothing.

**WHITE:** So a subject is falsifiable or it is decoration.

**BERNSTEIN:** Yes. Decoration invites forgery.

**PIKE:** Related: never name the mechanism when you can name the effect. "use sync.Once in dial" tells me what I'd learn from the diff in ten seconds anyway. "dial: connect only once per address" tells me the thing the diff can't say — the behavior I can now rely on.

**COX:** Unless the mechanism *is* the point — a revert, a vendoring bump, a rename. Then say the mechanism plainly. "runtime: revert CL 12345" is a fine subject. The rule underneath both: say the thing the reader cannot get elsewhere.

**KERNIGHAN:** Which is Strunk's Rule 17 wearing a beard. Omit needless words — and a word the diff already says is needless.

## Round II — The Body: Why Over What

**WHITE:** The body, then. Mr. Cox, you are notorious. Some of your commit messages run to a thousand words. Strunk would have fainted.

**COX:** Strunk said omit *needless* words, not words. The question is only ever: needless to whom? My reader is the engineer two years from now, bisecting a failure at midnight, who finds my commit at the bottom. She cannot ask me anything. The message is the only interview I will ever give her. So it must answer: why was this necessary, what else did we try, why not the obvious alternative, what breaks if you revert it. That can take a thousand words. Every one is load-bearing.

**McILROY:** I'll grant the midnight reader. I won't grant the essay as default. Most changes don't have a thousand words of why. When the why is "the test was wrong," write that, and stop. The essay is earned by the change, not owed to it.

**PIKE:** The failure mode Russ defends against is real, though. The what ages perfectly — the diff is right there, eternally. The why evaporates the moment the author forgets. So the body's job is to record precisely the part that evaporates. Nothing else keeps.

**THOMPSON:** When Dennis and I did the early Unix commits there was no body. We paid for that. People still email me asking why a flag exists. The flag is three characters. The email thread is forty years long.

**WHITE:** The archive laughs last.

### Complete sentences

**KERNIGHAN:** A craft point. Fragments in the body — "fixed leak. also refactor. tests pass" — read fast to write and slow to read. Complete sentences are not formality; they force the writer to commit to a subject and a verb, which is to say, to a claim. Fragments let you gesture at a claim without making one. "also refactor" — what was refactored? Toward what? A sentence would have had to say.

**RITCHIE:** The C Reference Manual survived because every sentence in it can be read as a promise. "The operators && and || guarantee left-to-right evaluation." Subject, verb, guarantee. When we wrote loosely, bugs grew in the slack. Kernighan is right that the sentence is the unit of accountability — in documentation more than anywhere, because documentation is promises made in prose.

**DE RAADT:** And write the sentences in order of importance, not in order of discovery. Half the commit bodies I reject are archaeology — "first I looked at X, then I noticed Y" — the author narrating their own afternoon. Nobody cares about your afternoon. State the conclusion. State why it's right. Stop.

**WHITE:** Strunk: "Use the active voice. Put statements in positive form." Your afternoon is passive voice at paragraph scale.

**McILROY:** Well said. The journey is scaffolding. Tear it down before you ship the building.

### The shape of a good body

**COX:** Let me give the skeleton I actually use. Paragraph one: the problem, stated so a reader who lacks context believes the problem exists. Paragraph two: the fix, at the level of intent — what invariant is now true that wasn't. Paragraph three, only if needed: alternatives rejected and why, costs accepted knowingly, and what to look at if this turns out wrong. Then the trailers — Fixes #N — machine-readable, at the bottom, where machines look.

**BERNSTEIN:** Note what's absent from Russ's skeleton: instructions to the reviewer. "Please look carefully at the locking" belongs in review discussion, not the permanent record. The commit message outlives the review by decades. Address posterity, not the approver.

**PIKE:** Also absent: the file list. The diff stat exists. Reciting "modified foo.c, added bar.h" is reading the reader their own eyes.

**KERNIGHAN:** I'd add one grace note to the skeleton: if the bug was interesting, one sentence on why it was hard to see. Not your afternoon, Theo — the *shape* of the trap. "The race only fires when the timer wraps" teaches the next person to see traps of that shape. That sentence is the difference between a log entry and a lesson.

**WHITE:** The book gains a rule: a commit body states the problem, the intent of the fix, and the reasoning that will evaporate — and nothing the reader already holds in her hands.

## Round III — Omit Needless Words, and Its Limits

**WHITE:** Round three. My co-author's most famous rule, and the one most abused. Mr. McIlroy, you once reviewed Don Knuth's showcase program by replacing it with six commands. Make the case for ruthlessness.

**McILROY:** The six commands weren't the insult people remember them as. They were a demonstration that the problem, correctly factored, needed almost no prose because it needed almost no novelty. Documentation debt is usually design debt wearing a disguise. When I find myself writing a paragraph to explain a function, my first move is not to polish the paragraph — it is to suspect the function. The best documentation is the documentation made unnecessary.

**PIKE:** Data structures over flowcharts, prose edition. If the design is right, the doc is a caption; if the doc is an epic, the design is wrong.

**BERNSTEIN:** I run my docs the way I run my code: smallest attack surface. Every sentence in documentation is a claim that can rot. Sentences you don't write can't rot. My man pages state preconditions, postconditions, and failure modes. They do not state philosophy.

**KERNIGHAN:** And yet djb's software is famously hard to approach, and I'd argue the austerity is why. There is a reader for whom the precondition list is everything — and a reader for whom it is a wall. Brevity that locks out the second reader isn't economy. It's cost-shifting: you saved a paragraph and a thousand strangers each pay an afternoon.

### The Kernighan–Bernstein exchange sharpens

**BERNSTEIN:** Cost-shifting cuts both ways, Brian. The tutorial that walks the second reader through by the hand also buries the load-bearing sentence on page nine, where the first reader — the one under attack at 3 a.m. — cannot find it. Verbosity is cost-shifting too. You've moved the afternoon from the novice to the expert.

**KERNIGHAN:** Which is why the answer was never one document. It's the oldest solution we have: the man page and the paper. Reference and narrative, separated, cross-linked, each pure. `awk(1)` is austere and complete; *The AWK Programming Language* is warm and long. Neither apologizes for the other. The sin is the hybrid that alternates modes paragraph by paragraph — reference interrupted by pep talk — which serves neither reader and lies to both about what it is.

**WHITE:** Strunk again: "Choose a suitable design and hold to it." The design of a document is the reader it selects.

**McILROY:** Then the rule writes itself. Decide which reader you are serving *before the first sentence*, say so in the first sentence, and refuse the other reader entrance. "This page is the reference for X; for the tutorial see Y." One line. Both readers routed. No document tries to be a hallway and a room at once.

**THOMPSON:** The Unix manual had that rule implicitly. SYNOPSIS for the expert. EXAMPLES for everyone else. Sections are routing.

### What "needless" actually means

**RITCHIE:** May I defend a word that looks needless? In the C book we wrote, "C is not a big language, and it is not well served by a big book." The second clause is deducible from the first — strictly needless. We kept it because it does work deduction doesn't: it tells the reader what kind of book they're holding and what kind of authors wrote it. Tone is information. Strunk knew this; his own book is full of voice, which is why people finished it.

**WHITE:** Guilty. E.B. White's revision of Strunk added an entire chapter of voice. We called it "An Approach to Style" and it contradicts nothing and duplicates nothing in the rules before it.

**PIKE:** The distinction I'd draw: voice is compression, ornament is padding. "C is not well served by a big book" compresses a design philosophy into nine words — that's the highest information density in the preface. Ornament is the sentence that could be deleted with the reader losing nothing but time. The test is deletion: strike the sentence, reread, and if nothing is missing, it was ornament.

**McILROY:** The deletion test, yes — sentence by sentence, then again paragraph by paragraph. Prose has dead code. Nobody runs the elimination pass.

**COX:** We do, actually. It's called review, when review is done right. More on that in round seven, I suspect.

## Round IV — Reference Versus Tutorial

**WHITE:** Round four: the kinds of documentation. Mr. Kernighan, you are the century's best example of the example. Make the case.

**KERNIGHAN:** Every technical explanation should lead with a worked example, for a reason that isn't pedagogical fashion: an example is the one form of documentation the author cannot fake. Prose can bluff. "The tool handles errors gracefully" — no such sentence in an example. The example either runs or it doesn't. In *The C Programming Language* we made a bet: put "hello, world" on page one, before a single word of theory. Forty years of imitators say the bet paid. The reader who has run something believes you; the reader who has read four pages of abstractions is still deciding whether to.

**BERNSTEIN:** Agreed, with a condition that everyone violates: the example must be complete. Not "..." elided, not "assuming the setup from chapter 2." A reader must be able to select, paste, run. An example with invisible prerequisites is worse than none — it fails and teaches the reader to distrust the whole document.

**PIKE:** Go's convention made this mechanical: example functions compile with the package and run under the test suite. The documentation is in the build. If the example rots, CI says so before a reader does.

**McILROY:** Executable examples are the doc equivalent of my rule from round one — each layer checkable against the layer below. Bravo. Prose that can be tested should be.

### The man page anatomy

**THOMPSON:** The man page format is fifty years old and nobody has beaten it. NAME, SYNOPSIS, DESCRIPTION, EXAMPLES, BUGS. Want to know why it survived? Every section answers exactly one question a reader arrives with. What is this. How do I invoke it. What does it do. Show me. What will bite me.

**DE RAADT:** And OpenBSD still treats the man page as part of the program. A feature without a man page doesn't merge. Not policy for policy's sake — it's a forcing function: if you can't document the flag in a sentence, the flag is wrong. We have deleted features because their documentation revealed them to be indefensible. The doc is the design review.

**WHITE:** Documentation as the test the design must pass. Strunk's ghost approves; he believed writing was thinking made visible, so bad writing was bad thinking caught in the act.

**RITCHIE:** The BUGS section deserves its own defense before it dies of embarrassment. Modern documentation omits known deficiencies as if omission fixed them. The old BUGS sections — "this command is slow and stupid about tabs" — bought reader trust at the price of author vanity, and it was the best purchase in the manual. A document that admits one true fault is believed about everything else.

**KERNIGHAN:** The confession is the credential. Write that down.

### READMEs and the first paragraph

**COX:** The README is the modern man page and it has lost the anatomy. Most READMEs open with a logo, six badges, and a paragraph of adjectives. The reader's questions are Ken's five, unchanged: what is this, how do I invoke it, what does it do, show me, what bites. A README that answers those in the first screen is complete; everything after is appendix.

**PIKE:** First sentence rule. The first sentence of any document must say what the thing *is*, in the form "X is a Y that Z." Not what it enables, not what it believes in, not how it compares. "Vault-LD is a multi-writer wiki on autobee." Subject, category, distinguishing property. A reader who stops there stops informed.

**WHITE:** Strunk's Rule 12 — "Choose a suitable design" — began the same way; his Rule 9: "the paragraph begins with a topic sentence." You've rediscovered the topic sentence at repository scale.

**McILROY:** And the anti-pattern is naming what it ISN'T. "X is not a framework." Negation is not identity. Tell me what it is; I'll work out the complement myself.

**BERNSTEIN:** Also strike the roadmap from the first screen. Promises about the future are the least checkable claims in the document. Ship documentation of what runs today; the rest is marketing wearing documentation's clothes.

**DE RAADT:** Badges are marketing wearing engineering's clothes. While we're at it.

## Round V — Audience and Tone

**WHITE:** Round five. Tone. Mr. de Raadt, you are Exhibit A for salt. Is rudeness a style?

**DE RAADT:** Bluntness, not rudeness — the distinction matters and my critics collapse it. When a commit note says "this code was wrong for nine years and nobody noticed because the test was also wrong," that's not rudeness, that's the fact pattern. Softening it — "there was an opportunity to improve historical correctness" — doesn't spare the original author; it deletes the lesson. The blunt sentence teaches; the padded one apologizes for teaching.

**KERNIGHAN:** I'll accept blunt about code and draw the line at blunt about people. "The code was wrong" — fact. "Whoever wrote this was careless" — speculation, in the permanent record, about a person who may have written it under constraints you can't see from here. The git log is not the place to lose an argument with a ghost.

**WHITE:** Strunk: "Place yourself in the background." The writing should expose the change, not the temperament of its author.

**COX:** Go's review culture encodes Brian's line: critique the code in the code's terms. Not because feelings outrank truth — because ad hominem in a log entry is *noise*. Two years later, nobody bisecting cares who was careless. The blame layer is `git blame`, and even that names lines, not character.

**THOMPSON:** Strong opinions, weakly held, tersely put.

**WHITE:** Mr. Thompson continues to write the book for us in fortune cookies.

### Jargon and the second audience

**RITCHIE:** On jargon. A technical term is a contract: use "idempotent" and you've promised the reader that the precise meaning is required — that "safe to retry" would have lost something. Most uses fail that test. The writer reached for the term to join a club, not to make a claim. When precision is required, use the term and use it correctly; when it isn't, the plain phrase is not dumbing down, it is telling the truth about how much precision the sentence contains.

**McILROY:** Corollary: never define a term the reader can't check. If your document says "we use optimistic concurrency," link or cite or define — in one clause — what you take that to mean. Half the fights in software are two people using one word for two things.

**KERNIGHAN:** And remember the second audience: the reader for whom English is a second language. They are, at this point, the majority of programmers. Idioms — "this is a footgun," "we punt on that" — cost them what jargon costs the novice. Plain sentences travel. Short words travel farther.

**WHITE:** Strunk: "Avoid fancy words." He'd have added: avoid clubby ones.

**BERNSTEIN:** One more audience nobody writes for: the machine. Grep is a reader. Name things consistently — one term per concept, every occurrence spelled the same — or the searching reader finds half your document and trusts all of it.

**PIKE:** One concept, one word. The thesaurus is where documentation goes to die.

### Humor and humanity

**WHITE:** A delicate one. Humor. The BUGS section of `tunefs(8)` famously ended: "You can tune a file system, but you can't tune a fish." It survived decades of solemn committees trying to delete it. Was it needless words?

**THOMPSON:** We fought to keep that line. Correct call. A manual is written by people for people, and one line that admits it costs nothing and buys the reader's affection for a thousand dry pages.

**McILROY:** I'll allow exactly that ratio. One fish per thousand pages. Humor in documentation compounds badly — the second joke halves the first one's charm and the tenth makes the reader wonder if the SYNOPSIS is also kidding.

**PIKE:** The rule is placement. Never in the load-bearing sentence. The fish lived in BUGS, the one section already licensed for confession and slouching. A joke in the SYNOPSIS is a bug; a joke in BUGS is a feature.

**KERNIGHAN:** And never humor that requires context the reader may lack — which is nearly all humor. The fish pun survives because it's self-contained. In-jokes in docs are the clubby words Strunk warned about, wearing a red nose.

**WHITE:** My co-author would grumble and then quote himself: "The whole duty of a writer is to please and satisfy himself." Even Strunk's rules bent for a good sentence. One fish, then. Placed with care.

## Round VI — Comments, and Docs That Lie

**WHITE:** Round six: the comment — documentation embedded in the code itself. Mr. Pike, Go took strong positions here.

**PIKE:** The comment's great vice is that it can't be executed, so it can't be caught lying. The compiler checks the code; nothing checks the comment against the code. Every comment therefore starts life as a small debt: it will drift unless maintained by hand. So the bar for writing one must be high — a comment should say what the code *cannot*: intent, invariant, the reason a simpler approach fails. `i++ // increment i` is not documentation, it's a hostage note proving the author was alive at the keyboard.

**McILROY:** The drift argument argues for position, too. A comment three lines above the code it describes is already lying about something — locality is a claim. Put the why on the line it governs or in the doc comment of the unit it governs. Nothing in between.

**RITCHIE:** In C we learned the special case that matters most: the interface comment. The comment on the declaration is the contract; the code is merely one implementation of it. That comment isn't drift-prone decoration — it's the most load-bearing prose in the system, because callers compile against your sentence, not your body. Spend your maintenance budget there.

**BERNSTEIN:** My version: comment the preconditions or don't bother. "This function assumes the lock is held" prevents a category of bug. "This loops over the array" prevents nothing.

### Where the truth lives — duplication and drift

**COX:** The general law under Rob's point: every fact wants exactly one authoritative home, and every other mention should be a pointer, not a copy. The moment a timeout value appears in the code, the comment, the README, and the wiki, three of the four are future lies — you just don't know which three yet. Write the fact once where it's checkable — code, or test, or generated reference — and let prose point.

**DE RAADT:** Which convicts most wikis. A wiki is a place where facts go to escape review. No diff, no reviewer, no test, no owner. We deleted ours. The documentation lives in the tree, versioned with the code it describes, or it lives nowhere. If the doc can't drift *separately* from the code — same commit, same review — it drifts less.

**KERNIGHAN:** Same commit is the mechanism, and it earns a rule in the book: a change that alters behavior alters its documentation in the same change, or the change is incomplete. Not "docs to follow." The follow-up commit is where documentation goes to not exist.

**THOMPSON:** We enforced that with embarrassment. The manual was typeset and on everyone's desk. Shipping a flag the manual didn't mention was public.

**WHITE:** Then the modern task is rebuilding that embarrassment. CI can blush on your behalf: the drift check, the doc lint, the example that compiles. Machines checking prose — Strunk would have bought one.

### What not to document

**WHITE:** The inverse question. What should NOT be written?

**McILROY:** The implementation narrative, first against the wall. Documentation of *how it currently happens to work inside* freezes the very thing you most need free to change. Document the contract; let the implementation breathe. The reader who needs the internals has the source, which is always current, being the thing itself.

**PIKE:** History, second. "Previously this used a linked list" — the reader holds the present; the past has a whole subsystem, git, staffed and indexed. The commit message is where the past lives. The comment is where the present lives. Confusing the two is how you get comments that read like tombstones.

**BERNSTEIN:** Aspirations, third. TODO comments are the roadmap problem again, miniaturized: unverifiable claims about intent, with no owner and no date, mostly false within a year. If it must be done, file it where undone work is tracked and counted. A TODO in code is a tracked item that escaped tracking.

**RITCHIE:** I'll defend one exception to Doug: document the internals at the *boundary of surprise*. Where the implementation does something a maintainer would never guess — the sorted array that must stay sorted, the field that aliases another — write it down, precisely there. Not narrative. A warning sign at the cliff, not a travelogue of the whole coastline.

**DE RAADT:** "Sign the cliffs, skip the coastline." Fine. That's the rule.

## Round VII — Process: Rewriting and Review

**WHITE:** Round seven. Process. Nobody writes well; some people rewrite well. How does prose get good in a repository?

**KERNIGHAN:** Same way code does: a working draft, then passes. My honest process on every book — write it wrong, completely, to the end; then rewrite sentence by sentence asking Strunk's question of each. The fatal error is polishing page one for a week. A complete bad draft can be fixed; a perfect fragment cannot be finished. This is "make it work, then make it right" — we had it in prose before we had it in code.

**COX:** For commit messages the pass structure is enforceable: write the message *before* the final self-review of the diff, then read the diff against your own message as if reviewing a stranger. Every time I do this I find either a sentence the diff doesn't support or a hunk the message doesn't confess. The message is a spec; the diff is the implementation; review them against each other.

**PIKE:** Reading aloud, unironically. Prose that can't be spoken can't be skimmed. The ear catches the clause pile-up the eye slides over. If you're embarrassed to read your commit message to the room, the room has told you something.

**WHITE:** My entire trade in one secret. The ear is the better editor.

**THOMPSON:** My pass is cheaper. Wait a day. Yesterday's prose reviews itself.

### Review of prose

**DE RAADT:** Reviewers must reject prose the way they reject code. I return diffs for the commit message alone, and I am told this is pedantry. It is the opposite. The message is the only part of the commit every future maintainer is guaranteed to read; it deserves the strictest review, not the laxest. "LGTM, fix the message" is a contradiction — the message IS the part you were most qualified to judge, since you just did the work of understanding the change that the message will have to do for everyone after you.

**BERNSTEIN:** The reviewer's checklist is short. Is the subject falsifiable and true? Does the body say why? Does anything in the message contradict the diff? Does anything in the diff surprise a reader of the message? Four checks, two minutes, permanent value.

**McILROY:** Add the deletion pass: for each sentence, would the document be poorer without it? Reviewers add; good reviewers also subtract. Nobody ever got a review comment saying "delete this true sentence" and that's a defect in our culture — plenty of true sentences are still needless.

**RITCHIE:** And review the examples by running them. An example nobody has run since the author is a promise nobody has kept recently.

**WHITE:** I notice the panel keeps arriving at the same coast from different ships: prose held to the code's standard. Reviewed like code, tested like code, versioned like code, deleted like code.

**PIKE:** Because it is code. It runs on people.

## Round VIII — Objections and Limits

**WHITE:** Round eight. The panel has been suspiciously agreeable. Let us find the real disagreements before we legislate. Mr. Cox, attack Mr. McIlroy's minimalism honestly.

**COX:** All right. Doug's deletion test has a blind spot: it evaluates sentences one at a time, but redundancy across sentences is sometimes the point. Teaching requires saying important things twice — once abstractly, once concretely. Every good lecture repeats itself on purpose; so does every good tutorial. Run the deletion test over the K&R book and you'd delete half the examples as "redundant with the text." The test is right for reference and commit messages, wrong for pedagogy. The book we're writing must scope its rules by document kind or it will be obeyed into blandness.

**McILROY:** ...Accepted, with the caveat that the second telling must know it's a second telling. "Concretely:" is honest repetition. Restating because you forgot you said it is the other kind. Scope the rule: in reference, say it once; in teaching, say it twice, differently, on purpose.

**KERNIGHAN:** This is the true Strunk lesson, by the way — the one the cargo cult misses. Strunk's rules were for *one genre*, the undergraduate essay. White knew it; his chapter says style "is nondetachable." Our book must say on page one: these rules serve the reader named at the top of each rule, and a rule applied to the wrong reader is a bug wearing a badge of virtue.

### Thompson challenged

**WHITE:** Mr. Thompson, you've been the panel's fortune cookie. Someone should attack the cookies. Mr. Kernighan — is terseness a luxury of genius?

**KERNIGHAN:** It is, and Ken knows it. Ken's one-liners land because forty years of context stand behind them, and because the people in this room can decompress them. A new engineer cannot. When the staff engineer writes "obviously wrong, revert" she is being Ken; the junior who reads it learns only fear. Terseness is a dialect of experts, and a codebase's documentation is read mostly by people still earning the dialect. Default to the longer plain sentence; earn the aphorism.

**THOMPSON:** Fair. I'll say the quiet part: I could be terse because Dennis was thorough. The system worked because both documents existed. My style is not a policy; it's a role in a division of labor. Don't staff a project with nine Kens.

**RITCHIE:** One Ken is plenty.

*[laughter]*

**DE RAADT:** The converse deserves its shot too: thoroughness as camouflage. I've reviewed thousand-word messages that were wrong in every paragraph and *looked* authoritative because of the word count. Length reads as diligence and it is not diligence. Brian's junior engineer is also fooled by the confident essay — more fooled, maybe. The defense against both failure modes is the same: falsifiable sentences, checked against the diff. Style doesn't save you. Verification saves you.

**WHITE:** Salt, but the good kind. Noted for the book: length is not a virtue; neither is its absence.

### Bernstein challenged; the machine reader

**WHITE:** Mr. Bernstein — the panel's turn to attack austerity's champion. Mr. Ritchie?

**RITCHIE:** Dan, your documentation optimizes for the reader who audits. But most readers arrive not to audit; they arrive lost. Your precondition lists are lighthouses — precise, unhelpful about which way the harbor is. A single orienting paragraph — what this is for, what it sits next to, what it refuses to do — would cost you thirty falsifiable-adjacent words and save each stranger the hour of inferring your intentions from your interfaces. Even a contract benefits from a preamble.

**BERNSTEIN:** I accept the thirty words. I dispute "falsifiable-adjacent" — purpose IS checkable: "qmail exists because sendmail's trust model was unfixable" is a claim history judges. Fine. One orienting paragraph, claims and all. Not two.

**COX:** Before we distill — the audience nobody here grew up with: the machine reader. Half the consumers of documentation now are models and tools. My position: this changes nothing. Everything this panel wants for the human — one term per concept, falsifiable sentences, facts stated once at an authoritative home, examples that run, structure that routes — is precisely what retrieval and generation need. Write for the tired human at midnight and the machine is served free. The reverse is not true; write for the machine's parser and you get keyword soup no human trusts.

**PIKE:** The midnight engineer remains the design center. Everyone else — novice, expert, machine — is served by serving her.

**WHITE:** Then she goes on the dedication page.

## Interlude — The Shape of the Book

**WHITE:** We have circled the field; now we must fence it. I propose the book take my co-author's architecture, because it worked: numbered rules, each stated as a command in one line, each followed by a paragraph of reasoning and one example of obedience and one of sin. Five chapters, by the reader's situation, not by topic fashion: Chapter I, The Subject Line — rules for the fifty characters read a thousand times. Chapter II, The Body — rules for the midnight reader. Chapter III, Documentation — READMEs, references, tutorials, man pages. Chapter IV, Comments and the Placement of Truth — where facts live so they cannot lie. Chapter V, An Approach to Style — the unlegislatable residue: voice, tone, salt, fish. Objections to the shape?

**McILROY:** Only that Chapter V must stay short, or it becomes the thing Chapters I through IV forbid.

**WHITE:** Chapter V will be one page, and it will earn it.

**COX:** Each rule should name its scope — "(reference)," "(teaching)," "(all prose)" — per the round-eight settlement.

**KERNIGHAN:** And each rule gets its example pair. A rule without an example is advice; with one, it's a test you can run against your own draft.

**WHITE:** Agreed. Now we legislate. I'll take rules from the floor, one at a time, and the panel bargains each into its final wording.

## Distillation — Chapter I: The Subject Line (Rules 1–4)

**WHITE:** Chapter One. First rule from the floor.

**COX:** "Begin with the address, then the claim." Prefix names the territory — package, subsystem, area — colon, then a lowercase summary, no terminal period.

**McILROY:** Too mechanical for rule one. The mechanics are a consequence. Rule one should be Theo's triage principle: the subject must let a reader decide, in one second, whether this commit concerns her.

**DE RAADT:** "Write the subject for the reader who will never open the commit." That's the principle. Russ's mechanics become the paragraph under it.

**WHITE:** Adopted as RULE 1, with the address-claim form as its practice. Next.

**PIKE:** RULE 2: "Use the imperative: name the act, not the aftermath." 'fix the leak,' not 'fixed' or 'fixes.' The commit is an instruction to the tree.

**WHITE:** Adopted; Mr. Ritchie's humility argument goes in the paragraph. Next.

**BERNSTEIN:** RULE 3: "Make the subject falsifiable." A reader must be able to check the claim against the diff in under a minute. 'cleanup' and 'various fixes' are unfalsifiable, therefore forbidden.

**WHITE:** Adopted with the word 'forbidden' kept — Strunk enjoyed a forbidding. Next.

**PIKE:** RULE 4: "State the effect, not the mechanism — unless the mechanism is the news." 'dial: connect only once per address,' not 'use sync.Once in dial.' Reverts and renames may name themselves.

**WHITE:** Adopted. Four rules; the chapter breathes already.

## Distillation — Chapter II: The Body (Rules 5–9)

**WHITE:** Chapter Two. The body.

**PIKE:** RULE 5, the chapter's spine: "Record what evaporates." The diff preserves the what forever; the why dies with the author's attention. Body = the why, the rejected alternatives, the accepted costs. Nothing the reader already holds.

**WHITE:** Adopted, and I'd like it as the book's epigraph as well. Next.

**COX:** RULE 6: "State the problem before the solution." Paragraph one earns the reader's belief that a problem exists; paragraph two states what invariant now holds. A body that opens with the fix is a proof with no theorem.

**WHITE:** Adopted. Next.

**KERNIGHAN:** RULE 7: "Write complete sentences, in order of importance." A sentence forces a claim; a fragment gestures at one. Conclusion first, archaeology never — the reader wants the verdict, not the afternoon.

**DE RAADT:** Insist the paragraph under it keeps 'nobody cares about your afternoon.'

**WHITE:** The paragraph keeps it. Next.

**BERNSTEIN:** RULE 8: "Address posterity, not the approver." Nothing for the reviewer — no 'please check the locking' — and nothing about the process that produced the change. The review dies; the log is forever.

**WHITE:** Adopted. And the machine's due?

**COX:** RULE 9: "End with the trailers, exactly spelled." 'Fixes #311' closes issues; misspelled, it closes nothing. Machine lines at the bottom, in the machine's dialect, one per line.

**WHITE:** Adopted. Five rules; the midnight reader is armed.

## Distillation — Chapter III: Documentation (Rules 10–14)

**WHITE:** Chapter Three. The documents proper.

**PIKE:** RULE 10: "First sentence: X is a Y that Z." Category and distinguishing property, before virtues, before history, before comparison. The reader who stops after one sentence stops informed.

**WHITE:** Adopted — it is my co-author's topic sentence, promoted to institution. Next.

**McILROY:** RULE 11: "One document, one reader." Declare in the opening line whether this is reference or teaching, and route the other reader away by link. The hybrid serves nobody and lies to everybody. Scope tag: (all documents).

**WHITE:** Adopted. Next.

**KERNIGHAN:** RULE 12: "Lead with a worked example, and make it complete." Paste-and-run complete — no ellipses, no invisible prerequisites. The example is the one sentence that cannot bluff. Where the tooling allows, examples compile in CI: prose under test.

**WHITE:** Adopted. Next.

**THOMPSON:** RULE 13: "Answer the five questions in order." What is it. How do I invoke it. What does it do. Show me. What will bite me. NAME, SYNOPSIS, DESCRIPTION, EXAMPLES, BUGS — fifty years of proof the order is right.

**WHITE:** Adopted, anatomy and all. And the confession?

**RITCHIE:** RULE 14: "Keep the BUGS section, and tell the truth in it." A document that admits one true fault is believed about the rest. Known deficiencies, stated plainly, dated if possible. The confession is the credential.

**WHITE:** Adopted — Brian's phrase survives into print.

## Distillation — Chapter IV: Comments and the Placement of Truth (Rules 15–19)

**WHITE:** Chapter Four. Where facts live.

**COX:** RULE 15, the chapter's law: "Give every fact one home; let every other mention point." The copy is the future lie. State the fact where it is checkable — code, test, generated reference — and let prose refer.

**WHITE:** Adopted. Next.

**PIKE:** RULE 16: "Comment what the code cannot say." Intent, invariant, the reason the simpler way fails. Never what the code already says slower. The comment that translates code into English insults two languages at once.

**WHITE:** Adopted. Next.

**RITCHIE:** RULE 17: "Spend your prose at the interface." The declaration's comment is the contract callers build against; it outranks all other commentary and gets the maintenance budget. Bernstein's amendment: preconditions or silence.

**BERNSTEIN:** Seconded as amended.

**WHITE:** Adopted. Next.

**McILROY:** RULE 18: "Sign the cliffs; skip the coastline." Internals stay undocumented except at the boundary of surprise — the invariant a maintainer would never guess, stated at the exact line it governs. No travelogues.

**WHITE:** Adopted, Theo's phrasing and all. And the same-change law?

**KERNIGHAN:** RULE 19: "A change to behavior changes its documentation in the same commit." 'Docs to follow' is where docs go to not exist. Enforce by review; better, by check — let CI blush for you.

**WHITE:** Adopted. The chapter is a courthouse; good.

## Distillation — Chapter V: An Approach to Style (Rules 20–22)

**WHITE:** Chapter Five, one page, my jurisdiction. I'll propose, the panel may heckle.

RULE 20: "Place yourself in the background." The record exposes the change, not the author's temperament. Blunt about code, silent about character; the log is not the place to win an argument with a ghost. — Objections?

**DE RAADT:** Keep 'blunt about code' load-bearing. Softness about wrongness is its own vanity.

**WHITE:** It stays. RULE 21: "One concept, one word, everywhere." The thesaurus is where documentation goes to die; grep is a reader; the second-language reader is the majority. Plain words travel. — Objections?

**BERNSTEIN:** None. It's the only rule here a machine could enforce today.

**WHITE:** RULE 22, and the book closes on it: "Earn the aphorism." Default to the plain long sentence; compression is a dialect of experts, and most readers are still learning it. But when a sentence can carry a chapter — one fish per thousand pages, placed where nothing load-bearing stands — let it. Style is the sound sense makes.

**THOMPSON:** I'd have cut that last clause.

**WHITE:** I know you would, Ken. It stays. Some words are needless and kept anyway; that's the one liberty the last rule buys, having paid for it with the first twenty-one.

**McILROY:** Chapter Five is one page. Passed.

## Cross-examination — The Trivial Commit

**WHITE:** Before we adjourn to examples: stress the rules. Mr. Thompson, break one.

**THOMPSON:** Rule 6. "State the problem before the solution." My commit is `spell: fix typo in error message`. There is no problem statement. There is no body at all. Am I in violation?

**COX:** No — and the book must say so plainly or it will be mocked into irrelevance. The body records what evaporates; when nothing evaporates, no body. A typo fix's why is self-evident for exactly as long as the diff exists, which is forever. Rules 5 through 9 govern bodies *when a body is owed*. The test for owing one: would a competent reader of the diff still have a question? For the typo, no. For "increase timeout to 30s" — yes, always, and the one-line body 'the CI runners got slower after the migration to arm64' pays the debt.

**McILROY:** So the empty body is not an exemption from the standard; it IS the standard, applied. Omission of the needless message.

**DE RAADT:** I want the inverse in print too: the trivial-looking commit that owes a body and skips it. One-character diffs have shipped root holes. If the one character matters, the message says why. `if (a = b)` to `if (a == b)` deserves a paragraph.

**WHITE:** Noted as Rule 5's paragraph: the body is owed when the diff leaves a question standing — measured by the diff's consequence, never by its size.

## Worked Example I — The Commit Message

**WHITE:** Practice, then. I have brought a specimen from the wild. Read it and keep your composure.

```
Fixed some issues with the connection handling code. There were
several problems that this PR addresses. First I noticed that the
pool wasn't working right so I investigated and found that it was
related to how we were handling timeouts. Also refactored some
stuff in pool.go to be cleaner and more maintainable going forward.
Please review carefully since this touches critical code!
Various other small fixes included as well.
```

**BERNSTEIN:** Every sentence unfalsifiable. "Some issues." "Several problems." "Working right." "Some stuff." Six claims, zero checkable.

**KERNIGHAN:** Past tense narrating the afternoon — "First I noticed... so I investigated." Archaeology, not conclusion.

**PIKE:** "Cleaner and more maintainable going forward" — three phrases, no information. And "going forward," which is where time already goes.

**COX:** "Please review carefully" — addressed to the approver, dead within the week. "Various other small fixes" — the confession that the commit should have been three commits.

**DE RAADT:** The subject is "Fixed some issues," which tells me to read the whole diff myself. The message has saved me nothing. Net documentation: zero. Net cost: I now also distrust the author.

**WHITE:** Diagnosis complete. Now the cure — gentlemen, rewrite it aloud.

**COX:** First, the split. "Various other small fixes" means this is two commits minimum: the timeout bug, and the refactor. The refactor rides separately — Rule 3 can't hold a subject over a mixed diff.

**PIKE:** Commit one. Subject, address then claim, effect not mechanism: `pool: return connections to the pool after idle timeout`.

**KERNIGHAN:** Body, problem first: "Connections that hit the idle timeout were closed but never removed from the pool's active count, so the pool eventually reported itself full while holding no live connections. New requests then blocked forever in Get."

**BERNSTEIN:** Falsifiable, good — a reader can find that counter in the diff. Now the invariant: "The timeout path now releases the slot through the same put() as the normal path, so the count can no longer drift from the live set."

**McILROY:** One sentence on the trap's shape, per Brian's grace note: "The leak was invisible in tests because the test pool's timeout exceeded the test duration."

**COX:** Trailer: `Fixes #4127`. Done. Commit two: `pool: hoist dial retry out of Get` — its own message, its own why: "no behavior change" stated as the claim it is, checkable by the reader.

**WHITE:** Read the pair back... Notice what the rewrite cost: nothing. Every sentence came from knowledge the original author held and withheld. The bad message wasn't cheaper to write — it was only cheaper to think.

**THOMPSON:** That last sentence goes in the book.

## Worked Example II — The README First Screen

**WHITE:** Second specimen. The opening of a README, genus modern.

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

**PIKE:** "X is a Y that Z" — where Y is "framework" and Z is a row of adjectives. `blazingly fast` — compared to what, measured how? `lightweight` — in what unit? `developer-first` — as opposed to the frameworks built for non-developers? Zero distinguishing properties. I still don't know what it DOES.

**McILROY:** "No bloat. Batteries included." Two slogans, contradicting each other, three words apart.

**KERNIGHAN:** The rewrite: "Flowlite runs data pipelines defined as plain Python functions, on one machine, without a scheduler service. A pipeline is a function; a dependency is an argument. If you need distributed execution or a UI, use Airflow — Flowlite is for the case where Airflow is too much." Category, property, boundary, and the honest routing of the wrong reader, four sentences.

**BERNSTEIN:** Note the rewrite states what it refuses to do — the roadmap in reverse, and checkable today.

**WHITE:** And "spark joy" returns to the drawer whence it came. Next witness.

## Scope Boundaries — Changelogs, Links, Deprecation

**WHITE:** Two boundary disputes before closing statements. First: the changelog. Is it the commit log wearing a suit?

**COX:** No, and conflating them ruins both. The commit log addresses the maintainer of the code; the changelog addresses the operator of the software. Different reader, different unit: the commit's unit is a change to the tree; the changelog's unit is a change to the *user's world* — a flag added, a default altered, a behavior gone. Most commits produce no changelog line; some changelog lines summarize forty commits. Generating one from the other is Rule 11 violated by machine: two readers, force-fed one document.

**McILROY:** The changelog entry has its own grammar, worth a rule in the paragraph: "what changed for you, what you must do about it, nothing else." 'Upgraded internal parser' is a commit fact; the changelog line is 'dates before 1970 no longer parse as errors.'

**WHITE:** Second dispute: the issue thread. Mr. Bernstein, you distrust links.

**BERNSTEIN:** I distrust *load-bearing* links. "See the discussion in #4127 for why" — the tracker is a different system with a different lifetime; the day it's migrated, the why is gone. The rule: the commit message must stand alone on the why; the link is for the archaeology — repro logs, benchmarks, dead ends — the extras, never the essence.

**KERNIGHAN:** Summarize the verdict, cite the trial. Both readers served.

**WHITE:** Adopted into Rule 8's commentary.

**RITCHIE:** One more genre with its own reader: the deprecation notice. It is the only documentation written *to* someone you are actively inconveniencing, and it is usually written as if to someone you are rid of. "Deprecated: use NewThing instead" — that sentence has never once contained enough information to act on.

**KERNIGHAN:** The complete form has four parts, and it fits in four lines: what stops working; when it stops; the one-to-one replacement, shown not named — old call above, new call below; and the escape hatch when the mapping isn't one-to-one. "Deprecated" without a date is a mood, not a notice.

**DE RAADT:** And have the courage to finish the sentence. A deprecation that lives five years is a lie about your intentions — you've documented a decision you declined to make. Announce, date, remove. The reader plans around dates, not around vibes.

**COX:** Go's proverb-in-practice: the migration guide is part of the breaking change, same commit, same review — Rule 19 applied to the future. If writing the migration table is too much work, you have measured exactly the pain you're about to ship multiplied by your user count, and you should reconsider the break.

**WHITE:** The cost of the prose as the measure of the change. Strunk would call that writing as thinking; I call it the panel's most quietly radical idea, twice now.

## The Sins — A Taxonomy of Named Anti-patterns

**WHITE:** Strunk's book worked because errors had names — the dangling participle shamed better than a paragraph of theory. Name the sins, gentlemen. I'll keep the ledger.

**PIKE:** THE HOSTAGE NOTE. `i++ // increment i`. A comment proving only that the author was present at the keyboard.

**McILROY:** THE AFTERNOON. "First I looked at X, then I noticed Y..." The author narrating their day instead of stating their conclusion.

**BERNSTEIN:** THE UNFALSIFIABLE SUBJECT. "cleanup," "various fixes," "improvements." A claim no diff can confirm or deny, therefore worthless as a filter.

**COX:** THE TOMBSTONE. The comment describing what the code used to do. History belongs to the log; the comment lies in the present tense.

**DE RAADT:** THE APOLOGY TOUR. "This is a bit hacky, sorry" — self-deprecation standing where the actual constraint should be. Either say WHY the hack is necessary or fix it. Shame is not documentation.

**KERNIGHAN:** THE GREENHOUSE. Docs that only work in the author's environment — the example with invisible prerequisites, the setup that "assumes chapter 2."

**RITCHIE:** THE ADJECTIVE STACK. "Blazingly fast, lightweight, powerful" — properties claimed in units that don't exist. Measurements have numbers; the rest is weather.

**WHITE:** Seven sins. More.

**THOMPSON:** THE ECHO. The commit body that recites the diff. "Renamed foo to bar, updated callers." I have eyes.

**COX:** THE DOCS-TO-FOLLOW. The behavior change merged with a promise of future documentation. The follow-up has a documented survival rate of nil.

**BERNSTEIN:** THE LOAD-BEARING LINK. "See #4127 for why." The why, outsourced to a system with a different lifetime. When the tracker dies, the commit becomes a locked box labeled 'key elsewhere.'

**PIKE:** THE THESAURUS. The document that says node, vertex, element, and item, and means one thing. Four terms, one concept, zero grep.

**McILROY:** THE HEDGE. "Should probably," "seems to," "I think this fixes." If you verified it, say so plainly; if you didn't, say THAT plainly. Uncertainty is honest; vagueness about your uncertainty is not.

**DE RAADT:** THE BADGE WALL. Twelve shields announcing CI status, coverage, chat channels — the first screen spent proving the project is alive instead of saying what it is.

**KERNIGHAN:** THE ORPHANED WHY. The constraint documented nowhere near the code it constrains — the invariant in a wiki, the warning in a README, the cliff sign filed in a drawer three buildings from the cliff.

**RITCHIE:** And THE CONFIDENT ESSAY — Theo's own contribution from round eight, may I note. Length worn as authority; a thousand words, wrong in every paragraph.

**WHITE:** Fifteen sins. A healthy parish. The appendix writes itself.

## The Confessions — Which Rule Would You Break?

**WHITE:** Last exercise before closing. Strunk broke his own rules when the sentence demanded it; a rule book written by people who never break the rules is written by people who never write. Each of you: the rule you'd break, and the circumstance. Mr. Pike.

**PIKE:** Rule 4 — effect over mechanism. When the mechanism is a landmine for the next person, I name it in the subject even though the effect is small. `runtime: don't use cgo in the signal handler` — the effect was 'fix a rare crash,' but the subject's job that day was to make the *pattern* radioactive. Sometimes the subject is a warning label, not a summary.

**KERNIGHAN:** Rule 11 — one document, one reader. In a book, deliberately. A book can braid reference and teaching because it has a spine and an index — the reader can enter twice. The rule is really about documents with one door.

**McILROY:** Rule 12, lead with the example — when the concept is dangerous half-understood. `rm` does not want an inviting example at the top of the page. For sharp tools, preconditions before invitations. The reader you hook is the reader you're responsible for.

**THOMPSON:** All of them, in code I write for myself. The rules price the reader's time above the writer's. When the writer IS the reader, the price is wrong. The mistake is only forgetting which kind of code you're in.

**WHITE:** Honest men. Second half.

**RITCHIE:** Rule 16 — comment what the code cannot say. I'd break it for the reader-in-training: in teaching code, comments that narrate the obvious are the point; the annotated program is a genre of its own. The C book's examples do it shamelessly. Scope, again: pedagogy licenses what production forbids.

**COX:** Rule 7's "conclusion first." When the conclusion is unbelievable without the journey, the journey earns its place — some fixes are so strange the reader rejects the summary until walked to it. I've written commit messages that read like proofs precisely because the claim looked insane. The afternoon is forbidden; the *derivation* is not. The difference: a derivation could convince a stranger; an afternoon only describes the author.

**BERNSTEIN:** Rule 14, the honest BUGS section — I'd narrow it. I don't publish suspicions in security-sensitive documentation; a stated 'this area is probably weak' is a treasure map. Confess deficiencies you'd bet on, or say nothing. The credential is the confession's *accuracy*, not its existence.

**DE RAADT:** I break Rule 20 — author in the background — every time the background caused the bug. When code is wrong because a vendor lied or a standard is malignant, I say so, in the commit, with the vendor's name. Posterity deserves the indictment. Softening it would be — what was the phrase — deleting the lesson.

**WHITE:** For myself: I'd break 21. One concept, one word — except the word the whole page has repeated twelve times, at the sentence where the twelfth repetition would deafen the reader to the one that matters. Even grep forgives a pronoun. The panel's confessions confirm the book's honest subtitle: rules, and the prices they charge.

## Front Matter — Settled

**WHITE:** Housekeeping a book deserves. The dedication.

**COX:** We named her in round eight: the engineer two years from now, bisecting a failure at midnight, who cannot ask the author anything.

**WHITE:** Then: "For the engineer at midnight, two years from now, who cannot ask us anything. Every rule in this book is an answer she will need." — The epigraph. I proposed Rule 5's spine; any challengers?

**PIKE:** "Record what evaporates" as epigraph, seconded. It compresses the book.

**McILROY:** Counter-proposal for a second epigraph, from the worked example: "The bad message wasn't cheaper to write — it was only cheaper to think."

**KERNIGHAN:** Keep both. First page, facing pages. The first tells you what to write; the second tells you why you didn't.

**WHITE:** Adopted. Title. The obvious candidate: "The Elements of Documentation."

**DE RAADT:** Obvious is correct. The allusion does routing work — the reader knows the genre, the length, and the temperament before opening it. Rule 10 applied to a spine.

**RITCHIE:** Subtitle from your closing line, then: "The Elements of Documentation: rules, and the prices they charge." It promises the confessions chapter, which is the part no imitation of Strunk has had the nerve to include.

**WHITE:** Carried without objection — a first, tonight.

## The Table of Contents — Read-back

**WHITE:** The read-back, so the record holds the whole shape. "THE ELEMENTS OF DOCUMENTATION — rules, and the prices they charge."

Front matter: the dedication; two epigraphs; a one-page preface stating the design center — every rule serves the midnight reader, and every rule names its scope.

**CHAPTER I — THE SUBJECT LINE.** Rule 1: Write the subject for the reader who will never open the commit. Rule 2: Use the imperative: name the act, not the aftermath. Rule 3: Make the subject falsifiable. Rule 4: State the effect, not the mechanism — unless the mechanism is the news.

**CHAPTER II — THE BODY.** Rule 5: Record what evaporates. Rule 6: State the problem before the solution. Rule 7: Write complete sentences, in order of importance. Rule 8: Address posterity, not the approver. Rule 9: End with the trailers, exactly spelled.

**CHAPTER III — DOCUMENTATION.** Rule 10: First sentence: X is a Y that Z. Rule 11: One document, one reader. Rule 12: Lead with a worked example, and make it complete. Rule 13: Answer the five questions in order. Rule 14: Keep the BUGS section, and tell the truth in it.

**CHAPTER IV — COMMENTS AND THE PLACEMENT OF TRUTH.** Rule 15: Give every fact one home; let every other mention point. Rule 16: Comment what the code cannot say. Rule 17: Spend your prose at the interface. Rule 18: Sign the cliffs; skip the coastline. Rule 19: A change to behavior changes its documentation in the same commit.

**CHAPTER V — AN APPROACH TO STYLE** (one page). Rule 20: Place yourself in the background. Rule 21: One concept, one word, everywhere. Rule 22: Earn the aphorism.

Appendix A: The Sins — fifteen named anti-patterns. Appendix B: The Confessions — each rule's honest breaking point, from the authors. Worked examples threaded through Chapters I–III.

Objections to the shape? ... Silence. In this room, the highest praise.

## A Last Dispute — The Rules' Own Prose, and Who Checks the Checkers

**McILROY:** One unresolved matter before closing statements. The book's own sentences. Strunk's rules obey themselves — "Omit needless words" omits them. Ours must survive the same audit. "A change to behavior changes its documentation in the same commit" — thirteen words, none removable, passes. But Rule 4 carries a subordinate clause with an em-dash, and Rule 12 has a compound imperative. I move we let them stand — and record WHY: a rule may spend words to forestall the misreading that would be more expensive than the words. Concision is a budget, not a vow.

**WHITE:** Seconded with relief; my co-author's Rule 17 was eleven words and one of them was "vigorous." Even the commandments had subordinate clauses.

**BERNSTEIN:** Then I raise the enforcement question the book must answer honestly: who checks the checkers? A style guide unenforced becomes folklore in eighteen months. My inventory of what machines can hold today: subject length and form — trivially lintable. Trailer spelling — lintable. Examples that run — CI. One-term-per-concept — a dictionary check, crude but real. The drift rule — checkable where docs are generated or annotated. That's five of twenty-two mechanized; the other seventeen live or die in review.

**COX:** Which the book should state as a feature, not a gap: the mechanizable rules buy the reviewer's attention back for the seventeen that need a human. Lint the form; review the truth.

**DE RAADT:** "Lint the form; review the truth." Print that on the reviewer's desk.

## Closing Statements

**WHITE:** Closing statements. One sentence each, for the preface. It may not be a fortune cookie, Ken. It will be a fortune cookie. Mr. McIlroy first, as the panel's conscience.

**McILROY:** Documentation is the part of the program that runs on people — write it, test it, and delete it to the same standard.

**KERNIGHAN:** Write so that the reader who knows least loses least, and the reader who knows most loses nothing.

**RITCHIE:** Every sentence of documentation is a promise; make only the promises you can keep, and keep every one you make.

**PIKE:** The diff says what; the message says why; anything else, one of you is lying.

**THOMPSON:** Say it once, say it true, stop.

**WHITE:** Five in. Mr. Cox, Mr. Bernstein, Mr. de Raadt — and then, I'm told, the transcriptionist's hand is cramping, which in this company counts as a review comment on our concision.

**COX:** Write for the reader who cannot ask you anything, because soon every reader is that reader.

**BERNSTEIN:** A sentence you cannot check is a sentence you cannot trust — write checkable sentences.

**DE RAADT:** If the documentation is embarrassing to write, the design is what's embarrassing — fix that, then write.

**WHITE:** And the moderator claims the last word, as moderators do. Gentlemen, my co-author spent his classroom career shouting three words at undergraduates, and tonight I watched eight engineers spend an evening deriving them from first principles, which he would have found hilarious and correct. The book stands. Omit needless words; the words that remain, make true; and of the true words, keep the ones the reader cannot get anywhere else. Everything we adopted tonight is one of those three commandments wearing work clothes.

The transcript closes here. What follows for the record: the rules as adopted, the sins as named, the confessions as given — material for the drafting committee, who are instructed to write the first draft in competition, as we debated in competition, and may the plainest prose win.

**[ADJOURNED]**
