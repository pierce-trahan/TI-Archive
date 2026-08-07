# How the data pipeline works

A guide to the scripts in `scripts/` — how to run them, the one idea that ties
them together, and what each one does. Written for someone directing the project
who wants to understand the machinery, not just operate it.

For the *why* behind specific decisions, see `docs/DATA-NOTES.md`. For running
the local-only research scripts, see `docs/RESEARCH.md`.

---

## 1. How running a script works

Every script runs through `npm run`. The `"scripts"` block in `package.json` is
a list of **aliases**. When you type:

```bash
npm run compute:stats -- ti08
```

npm looks up `compute:stats`, finds `tsx scripts/compute-stats.ts`, and runs it.
Three pieces:

- **`tsx`** runs a TypeScript file directly. TypeScript normally has to be
  compiled to JavaScript first; `tsx` does that on the fly. It's a dev
  dependency, already installed by `npm install`.
- **`--`** means "everything after this goes to the script, not to npm." So
  `ti08` is passed *into* the script. Without the `--`, npm would try to
  interpret `ti08` itself.
- **`ti08`** is the **event key**. Almost every script takes one, and looks it
  up in `data/sources/events.json` to learn the league ID, venue timezone, and
  dates for that TI.

The pattern is always: `npm run <name> -- <event-key> [extra args]`.

One special case: `research:reddit` runs as `tsx --env-file-if-exists=.env` so it
can load your Reddit credentials from a `.env` file. The others need no secrets.

---

## 2. The one mental model

**Every script does exactly one thing: it reads some files and writes other
files.** No database, no server, no magic. Data flows through directories, and
*which directory a file lives in tells you how much to trust it.* Four tiers:

```
data/raw/         ← what an API literally returned. Cached. GITIGNORED.
      │              (never trusted, never committed, always re-downloadable)
      ▼
data/proposals/   ← a machine's best GUESS. Committed, but labeled "not truth."
      │              (e.g. "I think this account is Ame, on this evidence")
      ▼
data/entities/    ← CONFIRMED facts. A human or an independent source signed off.
data/events/         (the real data the app will use)
      │
      ▼
data/computed/    ← STATISTICS derived from confirmed data. Regenerable.
                     (marked "generated, do not hand-edit")
```

A fact has to earn its way down the ladder. Nothing jumps from "an API said so"
to "the archive states this as true." That laddering **is** the project — it's
the structural answer to the prototype's habit of inventing things, because
"I'm not sure" has a real place to live (proposals) instead of being forced to
look like a fact.

Two properties fall out of this, both worth knowing as concepts:

- **Caching.** Every network script checks `data/raw/` first. If the response is
  already on disk, it uses that instead of re-downloading. That's why the TI8
  match ingest took ~4 minutes the first time and is instant afterwards. It also
  means you can re-run freely without hammering anyone's API.
- **Idempotency.** Running a script twice gives the same result as running it
  once. `promote:identities` re-run reports "0 added, 90 already there." You
  never have to track whether you already ran something.

---

## 3. The scripts, grouped by job

Twenty scripts, five jobs. Listed in the order you'd run them for a fresh TI.

### ① Ingest — pull raw data in  (writes `data/raw/` + a proposal)

| Script | Does |
| --- | --- |
| `ingest:matches` | Every match from OpenDota for the event's league |
| `ingest:liquipedia` | Rosters, coaches, qualification paths, prize pool from Liquipedia |
| `ingest:heroes` | Hero release dates (to know which heroes existed that year) |
| `ingest:playerids` | Each player's account_id straight off their Liquipedia page |

### ② Join & propose — connect the sources, make guesses  (writes `data/proposals/`)

| Script | Does |
| --- | --- |
| `build:playermap` | Collects which account played for which team, with GPM/hero evidence |
| `propose:identities` | The big one. Joins Liquipedia handles to OpenDota accounts in four confidence tiers (matched / deduced / inferred / ambiguous) |
| `review:identities` | Turns the proposal into a readable checklist to review |

### ③ Confirm — a human or third source signs off  (writes `data/entities/`, `data/events/`)

| Script | Does |
| --- | --- |
| `promote:identities` | Moves reviewed proposals into the confirmed tier |
| `verify:datdota` | Cross-checks the join against a datdota player export |
| `apply:datdota` | Applies datdota's verdict — fixes swaps, stamps corroboration |
| `verify:playerids` | Three-way check: OpenDota + datdota + Liquipedia agree? |

### ④ Derive — compute facts from confirmed data  (writes `data/computed/`)

| Script | Does |
| --- | --- |
| `build:placements` | Turns Liquipedia's prize *formulas* into dollar amounts |
| `compute:stats` | Game length, kills, Roshan, hero win rates, unpicked heroes |

### ⑤ Research — gather narrative sources  (writes `data/research/`, run locally)

| Script | Does |
| --- | --- |
| `research:reddit` | r/DotA2 reaction threads (needs your Reddit app credentials) |
| `research:wayback` | Dead-site articles via the Wayback Machine (JoinDota) |
| `research:gosugamers` | GosuGamers period articles |

`typecheck:scripts` and the `verify:*` scripts are **safety nets** — they don't
change data, they check it and complain if something is wrong.

---

## 4. The shared toolbox (`scripts/lib/`)

The scripts don't each reinvent the basics. Common code lives in `lib/` and gets
imported. Write the fiddly, careful code **once**, in a place with a name.

| File | Holds |
| --- | --- |
| `http.ts` | The polite, cached downloader: rate limiting, 429 backoff, the `HTTPS_PROXY` fix |
| `opendota.ts` | The OpenDota endpoints, typed |
| `wikitext.ts` | Parses Liquipedia's `{{template}}` markup |
| `events.ts` | Loads event config; does the venue-local date math |
| `entities.ts` | Loads confirmed identity data |
| `research.ts` | Storage rules for research (the raw/committed copyright split) |
| `robots.ts` | Checks `robots.txt` before fetching |

When the `HTTPS_PROXY` bug was fixed in `http.ts`, all eight network scripts were
fixed at once. That's the payoff of the shared toolbox.

---

## 5. Building a whole TI, start to finish

For a new year — say TI9 — first add a `ti09` entry to
`data/sources/events.json` (league ID, venue, timezone, dates). Then:

```bash
# ① ingest
npm run ingest:matches     -- ti09      # ~5 min first time, cached after
npm run ingest:liquipedia  -- ti09
npm run ingest:playerids   -- ti09      # ~4 min, one page per player
npm run ingest:heroes                   # no event arg — same hero list every year

# ② join & propose
npm run build:playermap    -- ti09
npm run propose:identities -- ti09      # produces the proposal
npm run review:identities  -- ti09      # → a checklist you read

# ... review the checklist; datdota confirms ...

# ③ confirm
npm run verify:datdota     -- ti09
npm run apply:datdota      -- ti09 <today's-date>
npm run promote:identities -- ti09 <today's-date>
npm run verify:playerids   -- ti09      # three-way agreement check

# ④ derive
npm run build:placements   -- ti09
npm run compute:stats      -- ti09
```

That is the whole data layer for one year. The research scripts (⑤) run whenever,
independently of this sequence.

The date argument to `apply:datdota` and `promote:identities` is the date of the
review — it becomes the confirmation date recorded in the provenance.

---

## 6. How to read a script yourself

They're all built the same way and read top to bottom:

1. **A comment block at the top** — what it does and *why*. Often the most useful
   part. `compute-stats.ts` opens with the three rules it enforces.
2. **Type definitions** (`interface Foo {...}`) — the *shape* of the data, like a
   labeled form. Good for understanding what's being handled.
3. **Helper functions** — small named operations.
4. **`async function main()`** at the bottom — the actual sequence of steps, in
   order. This is the recipe. Start here and read upward when you hit something
   unfamiliar.

Good first reads, by length:

- `ingest-hero-pool.ts` (~130 lines) — one request, parse a table, write a file.
- `propose-identities.ts` — where the four confidence tiers live in code. The
  most instructive if you want to see a fuzzy idea ("how sure am I?") become
  concrete logic.
- `compute-stats.ts` — the meatiest, if you want to see real statistical logic
  with the honesty rules (sample sizes, suppression, missing-not-zero) enforced.
