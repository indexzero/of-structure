# The Elements of Documentation — Linting

> A companion to [the guide](./bundle/the-elements-of-documentation.md) and its
> [debate](./DEBATE.md). The guide closes on one rule about enforcement — *lint
> the form; review the truth* — and this file cashes it out: which checks a
> machine can hold today, which tools hold them, and where the deterministic
> layer stops and human (or LLM-judge) review begins. Compiled from a working
> session plus cursory research, July 2026; the tool facts are current as of
> then and will drift.

## The thesis: lint the form, review the truth

Of the guide's twenty-two rules, about five are mechanically checkable — subject
form, trailer spelling, examples that compile, a terminology dictionary, a drift
check. The other seventeen need a reader who has read them. A linter does not
replace that reader; it buys back their attention by clearing the mechanizable
noise first. This file maps the mechanizable layer to real tools and marks —
loudly — the line the tools cannot cross.

## The distinction that decides the toolchain: prose-pattern vs. AST

Prose linters split into two families, and the split matters more than any
feature table. **Pattern tools** match tokens and phrases against the text;
**AST tools** parse the document into a tree and let a rule reason over its
structure — list nodes, table nodes, heading levels. Only the second family can
answer a structural question: *are these bullets parallel? did you prosify a
list? does this list have a lead-in? does this table's columns line up?* A
pattern tool can catch a banned phrase; it cannot see that a paragraph is a list
in disguise.

`write-good` and `proselint` sit in neither family usefully on their own: they
are naïve sentence-level checkers with no markup awareness, so you never adopt
them standalone — you fold them into a real tool as a plugin or a ported style.

## Tools, by layer

The following table places each tool on the axis above and names the layer it
serves best for our purpose (enforcing the Elements):

| Tool / family | Rule model | Best layer | Reaches structure? |
|---|---|---|---|
| Vale | YAML, token/pattern, scope-aware | phrase & terminology (the "form") | shallow — knows scopes, not the tree |
| textlint | JavaScript plugins over the AST | **structure** (the Elements) | yes — traverses list/table/heading nodes |
| remark-lint | unified/remark AST, ~80 rules | structure (if you live in remark) | yes |
| write-good / proselint | naïve prose, no markup | components, folded in | no |
| alex | inclusive-language | orthogonal add-on | n/a |
| Joblint | job-posting slop | irrelevant | n/a |

The layered reading: **Vale for the phrase layer** — cheap, declarative, ships
the Google and Microsoft styles, catches hedges, weasels, "it's worth noting,"
and terminology drift — and **textlint (or remark-lint) for the structure
layer**, the only tools that can express the checks that need the document tree.

## The checks, and where each runs

The mechanizable checks, mapped to their layer. A check is *deterministic* when a
machine can decide it without judging meaning; the rest are heuristics that flag
candidates for a human:

| Check (rule) | Layer / tool | Deterministic? |
|---|---|---|
| Subject form — address, colon, lowercase, no period (R1) | Vale existence/pattern; commitlint | yes |
| Unfalsifiable subject — "cleanup," "various fixes" (R3) | Vale existence (banned list) | yes |
| Trailers exactly spelled — `Fixes #N` (R9) | Vale; commitlint | yes |
| One concept, one word (R21) | textlint-rule-terminology; Vale substitution | yes |
| Adjective stacks, hedges, weasels (sins) | Vale (write-good/proselint ports); slopless | yes |
| Example completeness / compiles (R12) | CI build, not a prose linter | yes |
| Docs change with code (R19) | CI drift check | yes |
| Prosified list — the embedded in-sentence list | textlint AST (custom rule) | heuristic |
| List parallelism — grammar, caps, punctuation | textlint AST (+ POS) | caps/punct yes; grammar heuristic |
| Every list/table has a lead-in | textlint AST (custom rule) | heuristic |
| Table only for 2-D; one-column table → list | textlint / remark AST | yes |

## Prior art worth borrowing before coining

Tools already aim at the AI-slop end of this problem; build on them rather than
beside them:

- `berelevant-ai/slopless` — deterministic textlint rules + CLI for catching
  English prose *slop* in Markdown; the closest existing thing to our
  [AI-smells catalogue](./smells.md).
- `tbhb/vale-ai-tells` — a Vale style for "AI tells."
- `textlint-ja/textlint-rule-preset-ai-writing` — Japanese, but the *approach* (a
  preset that flags AI-ish patterns) ports.
- `sapegin/textlint-rule-terminology` — one-concept-one-word (R21) as a rule.

## The ceiling: what no linter catches

The rhetorical smells need argument-level understanding, not pattern or tree
matching, and no deterministic tool reaches them. From the AI-smells catalogue:

- **THE PROSIFIED LIST** → deterministic-ish (a textlint AST rule: a paragraph of
  N parallel delimited clauses is a list in disguise).
- **hedges / weasels / "it's worth noting" / em-dash-as-filler / terminology
  drift** → deterministic (Vale, slopless, proselint).
- **THE FALSE INVERSION / CHIASTIC KOAN / FOIL FIRST / FLOGGED METAPHOR** → *not
  lintable* — they need a reader who understands the claim.

That last row is the guide's "review the truth." A linter holds perhaps a third
of the catalogue; the rhetorical two-thirds need a reviewer, and the natural
reviewer is an LLM-judge — with the irony intact that the smells are
LLM-produced.

## A starter stack

The pipeline is two deterministic passes feeding one judgment pass:

1. **Vale** with the Google (or Microsoft) package plus a project style for
   banned phrases and terminology — the phrase layer.
2. **textlint** (or remark-lint) with `terminology` and `write-good` plugins plus
   custom AST rules for the structural checks (prosified-list, lead-in,
   parallelism) — the structure layer.
3. **CI** runs both on changed Markdown and fails on form errors — *lint the
   form.*
4. **An LLM-judge pass** prompted with the AI-smells catalogue for the rhetorical
   layer no linter reaches — *review the truth.*

The split is the whole design: mechanize what mechanizes, and spend the reviewer
(human or model) only on what cannot.

## Sources

- [Choosing a Markdown linter for your docs pipeline (DEV)](https://dev.to/adamgordonbell/markdown-linting-5a3)
- [textlint — pluggable natural-language linter](https://textlint.org/)
- [textlint-rule-write-good](https://github.com/textlint-rule/textlint-rule-write-good)
- [textlint-rule-terminology (sapegin)](https://github.com/sapegin/textlint-rule-terminology)
- [Vale — syntax-aware prose linter](https://vale.sh/)
- [Prose linting with Vale (Meilisearch)](https://www.meilisearch.com/blog/prose-linting-with-vale)
- [Lists — Google developer documentation style guide](https://developers.google.com/style/lists)
- [Tables — Google developer documentation style guide](https://developers.google.com/style/tables)
