# Agent Confusion Log — auto-okf / vault-ld usability under six concurrent writers

**Experiment** (2026-07-29): six subagents, each with a distinct editorial
stance, competed to write a first draft of *The Elements of Documentation*
(source: [DEBATE.md](./DEBATE.md)), all delivering into ONE shared auto-okf
vault (`./vault`, bundle `./bundle`). Agents were pointed at the
`hyperwiki2` repo docs but deliberately given **no commands** — they had to
learn the tooling from its READMEs, first contact. Each agent's brief
required a verbatim self-reported confusion log; this file compiles those
six logs plus the orchestrator's observations. A seventh agent (the judge)
ran afterward to synthesize the final draft.

**Control:** before any agent ran, the orchestrator verified
`init → ingest → materialize` round-trips cleanly on this vault. Everything
below is therefore attributable to usability, not a broken substrate.

**Constraints in force:** packages not published to npm (absolute
repo-local paths only); six writers concurrent on one vault; agents told
both auto-okf and vault-ld exist, and that the vault was auto-okf.

---

## Headline findings

### F1. The whole-bundle ingest sweep — the experiment's best finding

The CLI `ingest <vault> <bundle>` has **no per-file form** (confirmed via
`ingest --help` by the Teacher). Under concurrent writers this produced a
complete, three-perspective incident:

- **The Stylist (predicted it):** refused to run whole-bundle ingest
  "to avoid folding other agents' possibly half-written pending files,"
  and instead wrote a one-off Node script using the library API
  (`createIngestWatcher(..., { watch: false }).ingestFile(relpath)`) to
  ingest only its own file. Verdict from its log: "a real CLI gap for
  concurrent-writer politeness."
- **The Teacher (enacted it):** its ingest output read
  `ingested drafts/the-clerk.md: create-concept, set-field, set-body ...
  ingest complete: 6 op(s) from 2 file(s)` — it folded ANOTHER agent's
  pending draft into the log as a side effect. Its own assessment: "If
  the-clerk's file had been mid-write, I would have ingested a partial
  draft."
- **The Clerk (was swept):** its own ingest of its brand-new file returned
  `ingest complete: 0 op(s) from 0 file(s)` — which "looked like a silent
  failure." Diagnosing that the file was *already in the vault* (hash match
  in `.okf-manifest.json`) versus *never seen* required reading
  `okf/faces/lib/ingest.js` source (line ~245, the manifest/hash guard).

**Tool recommendations:** (a) a per-file ingest form
(`ingest <vault> <bundle> [paths...]`); (b) make the 0-op message
distinguish "N file(s) already up to date in the log" from "no files
found."

### F2. "There is NO content-write command" — counterintuitive design, rescued by its docs

Four of six agents (Minimalist, Auditor, Teacher, Clerk) reported arriving
with the same wrong expectation: a CLI `add`/`write`/`create` subcommand.
None ever ran the wrong command, because `okf/cli/README.md` states —
twice, prominently — "there is NO content-write command — content enters
through ingest (edit markdown) or the @auto-okf/store API." This is the
single most counterintuitive design fact in the system, and the
documentation absorbed it completely. (The Stylist's log credits the
READMEs with practicing the guide's own Rules 12 and 13.)

### F3. Materialize exit 1 on pending-ingest reads as failure under concurrency

The Auditor's `materialize` exited 1 with
`pending ingest (unsaved external edit, left in place): drafts/the-stylist.md`
— documented behavior (the tool refusing to clobber another writer's
un-ingested file, correctly leaving it in place), but the Auditor logged
that it "momentarily looked like a failure." Under multi-writer use, a
*normal* state (someone else mid-authoring) surfaces as a non-zero exit on
*your* healthy operation. Recommendation: distinguish "wrote everything I
own; N foreign pending files skipped" (arguably exit 0 + notice) from true
failure.

### F4. Twin-system disambiguation worked — via a marker file

Zero cross-system invocations across all seven agents. Five of six cited
`vault/okf-vault.json` as the deciding evidence that the vault was auto-okf
rather than vault-ld (the storage dir itself just says `CORESTORE`/`db`).
The Teacher noted the counterfactual: "Had that marker file not existed I
would likely have had to guess." Adjacent trap that half-fired: the
**Engineer** found the repo has both `okf/{core,store,faces,cli}` and a
top-level `packages/{core,store,faces,cli}` and could not determine what
`packages/` is — "a less careful reader could grab the wrong bin."
(Orchestrator note: `node_modules/.bin` contains only `autovault-ld`, not
`auto-okf` — an armed trap that never fired because every agent used the
repo-local bin path from the README instead of `.bin`.)

### F5. The scratch-materialize verification idiom — converged on, but doc-gapped

Four agents (Engineer, Stylist, Teacher, Clerk) independently invented the
same verification move: materialize the vault into an empty scratch
directory, so every byte that appears necessarily came from the op log.
It works because the emission manifest (`.okf-manifest.json`) is scoped
per-bundle-directory — but **three** of the four (Stylist, Teacher, Clerk)
had to confirm that scoping by reading `okf/faces` source or README
closely, each independently worrying that a scratch materialize might
disturb the shared bundle's manifest or the vault's notion of "the"
bundle. Recommendation: one README sentence — "a vault has no privileged
bundle directory; the manifest lives in each target dir" — would have
saved three source dives.

### F6. Zero lock/contention errors, zero retries

Across ~17 write-path invocations (6 agents + orchestrator + judge:
ingests, materializes, flags) by concurrent processes on one vault, no
storage-lock, corruption, or contention error occurred. Every command
exited as documented on the first attempt; every agent's retry loop went
unused. `flags` reported 0 (no conflicts/clobbers in the log). The
single-writer-core model (all six agents sharing the genesis writer
identity through the CLI) held up; note the experiment therefore did NOT
exercise true multi-writer (`add-writer`/`join`) paths.

### F7. The npm constraint was absorbed cleanly

No agent attempted `npm`/`pnpm install`; all used the absolute repo-local
bin (`okf/cli/bin/auto-okf.js`) or absolute-path imports
(`okf/store/index.js`, `okf/faces/index.js` — the Stylist's script). The
root README's mention of a repo-local bin plus the brief's warning
sufficed.

---

## Per-agent logs (condensed; verbatim quotes marked)

### The Minimalist — first to land; cleanest window
- Expected a content-write command; "the okf/cli README forestalled the
  wrong guess before I made it."
- No okf/vault-ld confusion (README comparison table + `okf-vault.json` +
  `@auto-okf/cli` naming).
- Noted the README example's `./vault ./bundle` names exactly matching this
  project's layout "removed guesswork" (lucky-or-deliberate).
- Zero contention — ran before other drafts hit the disk.
- Verification: ingest ops + `_id` stamp (writer key + seq) + `log.md`
  "Established" line + **idempotence check** (second ingest → 0 ops).

### The Teacher — the sweeper
- Same content-write expectation, same README rescue.
- Confirmed via `ingest --help` there is no per-file filter, then swept
  the Clerk's pending file into the log (F1).
- Worried the emission manifest might be global; resolved by grepping
  `okf/faces/lib/fsatomic.js` (`MANIFEST_FILE = '.okf-manifest.json'`).
- "The CLI README's worked example ... is itself Rule-12-complete: I pasted
  its shape and it ran."

### The Auditor — the exit-1 witness
- Identified the vault via `okf-vault.json` AND `bundle/.okf-manifest.json`
  (`okf_version: "0.1"`) before running anything — called it "a genuine
  decision point."
- Expected a content-write capability "until corrected by the docs."
- Hit materialize exit 1 on the Stylist's pending file (F3): "Momentarily
  looked like a failure; it was the documented N3 exit."
- Checked clobber semantics in the docs *before* materializing — doc trust
  verified empirically.

### The Stylist — the library-path dissenter
- `initVault` vs `openVault`: "the READMEs' headline examples all use
  `initVault('./vault')` even for what reads like 'open'"; the create-vs-
  reopen distinction is discoverable only in `okf/store`'s README. "Had I
  copied the headline snippet verbatim I might have hit a refusal or
  worse."
- Predicted the whole-bundle ingest hazard and dodged it via
  `ingestFile` (F1).
- Confirmed per-target-dir manifest before scratch materialize (F5).
- Momentary twin-system doubt settled by `okf-vault.json`.
- "Zero runtime errors, zero retries consumed ... I attribute this to
  reading all four READMEs before executing anything."

### The Engineer — the packages/ ambiguity
- Found `okf/*` vs top-level `packages/*` and used okf's bin on the
  strength of the README reference alone; never established what
  `packages/` is (F4 adjacent).
- Root README shows only the JS API; "I briefly weighed writing a Node
  script against node_modules resolution hassles before finding the CLI
  README's ingest workflow."
- First to use the scratch-materialize verification idiom; deliberately
  never materialized the shared bundle.
- Observed the Minimalist's artifacts appear mid-run; "no interference
  either direction."

### The Clerk — the swept
- The `0 op(s) from 0 file(s)` silent-success incident (F1): "the '0
  op(s)' wording gave no hint the file was already ingested vs. never
  seen — I had to read source to distinguish those cases."
- Uniquely proactive on limits: grepped core for `maxOpBytes: 65536` /
  `'oversize-op'` and sized its draft to 41KB *before* writing, so the
  set-body op couldn't be rejected.
- `flags` → 0 as final no-clobber evidence.

### The Judge (post-competition synthesis)
- Confusion log: "None. Both `auto-okf.js ingest` and `materialize`
  succeeded on the first invocation with exit 0 and no warnings; the
  whole-bundle ingest picked up only the one new file as promised."
- Consistent with F1's mechanics: once every file in the bundle is
  already in the log, the whole-bundle sweep is safe — the hazard is
  purely a concurrent-authoring-window problem.

---

## Scorecard

| # | Finding | Agents | Kind |
| --- | --- | --- | --- |
| F1 | No per-file CLI ingest; sweep folds foreign pending files; victim sees "0 op(s)" | Stylist, Teacher, Clerk | design gap + message gap |
| F2 | No content-write command expected by default | Minimalist, Auditor, Teacher, Clerk | counterintuitive design, fully absorbed by docs |
| F3 | materialize exit 1 on foreign pending-ingest reads as failure | Auditor | exit-code semantics under concurrency |
| F4 | Twin-system disambiguation via `okf-vault.json`; `packages/` dir unexplained; `.bin` has only `autovault-ld` | all six; Engineer; orchestrator | good affordance + two latent traps |
| F5 | Scratch-materialize verification requires knowing manifest is per-dir; 3 agents read source to confirm | Engineer, Stylist, Teacher, Clerk | doc gap |
| F6 | Zero locks/contention/retries across ~17 concurrent write-path calls | all | robustness result |
| F7 | npm-unpublished constraint absorbed; absolute paths everywhere | all | non-event |

**Bottom line:** no agent ever ran a wrong command against either system,
and every draft landed and round-trips byte-identically from the log. The
confusion that *did* occur clusters entirely around multi-writer
concurrency at the CLI surface (F1, F3) — the log/CRDT layer beneath it
absorbed everything silently and correctly — plus two documentation gaps
(F5, `initVault`/`openVault` headline ambiguity) and one repo-layout
ambiguity (`packages/`, F4). The READMEs otherwise carried first-contact
usage completely; four agents independently credited them for pre-empting
their first wrong guess.
