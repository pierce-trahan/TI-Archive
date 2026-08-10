# The International Archive — Design Specification

**Status:** design phase. No production work until this is agreed.
**Supersedes:** the AI Studio build and the original Gemini design pass (`TI_Archive_Design_Pass.md`), which this document absorbs and extends.

---

## 1. What this is

A downloadable, offline, open-source history book of The International — one page per TI, from TI1 (2011) to the present — that tells the *stories* around each event, not just the results.

The premise is that this information exists but is scattered: Wikipedia has the bracket and the prize pool, Liquipedia has the rosters, YouTube has the plays, and the actual *history* — the roster manias, the snubs, the rivalries, the community reaction in the moment — lives in dead forums, defunct news sites, and Reddit threads nobody links to anymore. This project is the compilation.

### Principles

1. **Every fact carries a source.** The failure mode of the prototype was confident invention. The data model must make "unknown" cheaper to express than a plausible guess.
2. **Narrative is the product; stats are the frame.** APIs give the frame for free. The narrative is hand-written and hand-edited by someone who was there.
3. **Offline-first, no server.** Clone or download, open, read. No API keys, no runtime network calls, no backend. This was the original plan and it should hold.
4. **The season is part of the event.** A TI page covers the year that led into it, not just the week it happened.
5. **Additive by year.** Adding TI15 should mean dropping in a data file, not editing a union type in five places.
6. **Significance is a finding, not a template.** The page structure is the same every year; what fills it is not. A section exists to hold an answer where one exists, never to demand one. If no item defined a meta, no roster move turned a season, no group-stage day changed anything — the page says so and moves on. Writing a paragraph because the layout has a slot for it is the same failure as inventing a statistic: both put confident prose where the evidence is silent. TI8 has no Wraith Pact, and the archive is better for saying that plainly than for nominating a runner-up.

### Non-goals (explicitly removed)

| Removed | Why |
| --- | --- |
| Personal Notes tab | Never requested. An artifact of the build environment. |
| Export/Import backup modal | Existed only to serve Personal Notes. |
| "Oracle of the Aegis" Gemini endpoint | Never requested, never wired to the UI, and breaks the offline/no-key principle. |
| Web Audio / TTS caster synthesis | A robot voice reading a quote is not a caster call. Either real audio clips or a text quote with attribution — nothing in between. |
| Any runtime call to a third-party API | Conflicts with offline-first. All external data is pre-baked at build time. |

---

## 2. Information architecture

### Global navigation

```
⚜ THE INTERNATIONAL ARCHIVE                              [ 🏛 THE ARCHIVE ]
─────────────────────────────────────────────────────────────────────────────
 TI1  TI2  TI3  TI4  TI5  TI6  TI7  TI8  TI9  TI10  TI11  TI12  TI13  TI14 …
```

Year selector across the top, plus one global cross-year section ("The Archive" — the Hall of Fame page, expanded).

### Per-TI sub-tabs

| # | Tab | Contains |
| --- | --- | --- |
| 1 | **Story** | The long-form narrative. Chaptered: the season, the run-up, the event itself, the aftermath. |
| 2 | **The Road to TI** | Circuit structure for that year (Majors / Minors / DPC / open era), regional season results, qualification path, invites, qualifiers, snubs, roster shuffle before and after. |
| 3 | **Teams & Players** | Every attending team: roster, region, seed, placement, prize, how they got there, how they performed. |
| 4 | **The Game** | Patch, map layout, structural rules of that era, and event-wide statistics. |
| 5 | **Venue & Vibe** | City, arena, production, side content, all-star match, cosplay, memes. |
| 6 | **Series** | Matches and series that generated real community reaction — at any stage of the event. |
| 7 | **Moments & Content** | Individual plays, interviews, and content produced for or around the event. |

Tabs 2, 4, and 6/7 are the substantive changes from the prototype. Rationale follows.

---

## 3. Story (tab 1)

The prototype gave every TI exactly three paragraphs. That is a summary, not a history.

**Target: 1,500–3,000 words per TI**, structured in chapters so it reads as a magazine feature rather than a wall of text. Written long deliberately — it is easier to cut than to expand, and Pierce edits from lived memory.

### Chapter structure

| Chapter | Covers |
| --- | --- |
| **The Season** | What happened in the year leading in. Who was dominant, who collapsed, what the circuit looked like. |
| **The Shuffle** | Roster mania. Who moved, who got kicked, who betrayed whom, what it meant. |
| **The Field** | Who made it and who didn't. The snubs. The qualifier runs. |
| **The Event** | Group stage, main event, the bracket as it unfolded. See §3.3. |
| **The Finals** | The grand final in detail. |
| **The Aftermath** | Post-TI shuffle, disbands, retirements, what the result meant in hindsight. |

Every chapter supports inline pull-quotes, embedded media, and a "Community Reaction" block (see §3.2).

### 3.1 Research sourcing — and a real constraint

The intent is to build each narrative from period sources rather than from a model's recollection. Availability as of August 2026:

| Source | Status | Usable how |
| --- | --- | --- |
| **GosuGamers** | **Live.** Feature articles from the TI3–TI13 era are indexed and searchable. | Primary period source. Direct fetch is bot-blocked from this session (HTTP 403); reachable from a local machine with a normal browser/UA. |
| **JoinDota** | **Dead.** Ceased Dota 2 operations 31 March 2022; the domain no longer resolves. | Wayback Machine only. Archive Team has a capture. Requires a local script against `web.archive.org`. |
| **Reddit (r/DotA2 reaction threads)** | **Not accessible to me at all.** Reddit blocks Anthropic's crawler by policy — both search and fetch, not a sandbox issue. | Must be gathered outside this tool: Pierce manually, or a local script using Reddit's OAuth API (personal-use scripts are still permitted at low rate). |
| **Liquipedia** | Live, has an API, but requires a custom User-Agent per their terms. Blocked from this session. | Local ingest script with a proper UA and their rate limits respected. |
| **Wikipedia** | Live and open. | Backbone facts, bracket, prize distribution. |

**Consequence for the plan:** the deep-research pass cannot run inside this session — the environment's egress policy blocks GosuGamers, Liquipedia, archive.org, and OpenDota (403 at the proxy), and Reddit blocks the crawler independently of that. Two options, and this is an open question:

- **(a)** I write the research/ingest scripts here; you run them on your machine and commit the output.
- **(b)** The environment's network policy is widened to allow those hosts, and the pass runs here.

Web *search* works from this session, so I can draft narratives from search results and period reporting summaries in the meantime — usable as a first draft for you to correct, but weaker than reading the actual articles and threads.

### 3.2 Community Reaction blocks

Distinct from narrative prose: a quoted, dated, attributed snapshot of how people felt *at the time*, before hindsight. Sourced from Reddit threads, forum posts, and period articles.

```
┌─ COMMUNITY REACTION ─────────────────────────────────────┐
│ r/DotA2 · 2018-08-25 · thread: "OG vs LGD Grand Finals"  │
│                                                          │
│ "…"                                                      │
│                                                          │
│ [ ↗ source ]                              ~12k upvotes   │
└──────────────────────────────────────────────────────────┘
```

Every block requires a URL, a date, and a platform. If those three don't exist, the block doesn't get made.

### 3.3 The Event chapter — standings by day, and the bracket

A final placement table says who finished where. It cannot say how it felt to be there on the second morning. Two views are required, and the first is the one usually missing:

**Group stage standings after each day.** Not just the final group table — a snapshot at the end of every group-stage day, so the arc within the group stage is visible. OG opened TI8 badly and climbed; that recovery is invisible in a single end-state table, and it is exactly the kind of thing a reader who watched it live remembers. The day-over-day movement (position change, series won/lost that day) is the point.

**The bracket, as it resolved.** The full main-event bracket with scores, upper and lower, so a run can be traced end to end rather than inferred from a placement number.

Data notes, so this is scoped honestly:

- Daily standings are **derivable from OpenDota** — group-stage matches carry `start_time`, and the event's venue-local day bucketing already exists in `phaseFor()`/`localDate()`. Standings are a cumulative fold over those results in date order. No new source needed.
- Bracket structure is **not** in the match data — `series_id` groups the games of one series, but not the tree. This section originally concluded that meant a Liquipedia parser. It didn't: `build:bracket` derives the tree from results alone, using the shape of double elimination. A team seeded into the lower bracket goes out on its first loss and one seeded into the upper bracket survives one, so **loss-count-until-elimination recovers the seeding**, and rounds follow from chronology. Because that is a derivation rather than a reading, it is checked two ways at build time and both are fatal: the derived upper bracket must equal the top four of each group from the standings (different data, different method), and elimination order must be monotonic with final placement. A format that breaks the assumption fails the build instead of drawing a plausible wrong tree.
- Formats changed repeatedly across TIs (group sizes, how many advance, whether the bottom is eliminated, single vs double elimination). The renderer must read the format from the event's data rather than assume TI8's shape.
- Early TIs may not have day-level match data at all. Where they don't, the standings view shows *"not available for this event"* — the §5.2 rule applies unchanged.

---

## 4. The Road to TI (tab 2)

Dota's qualification system has been rebuilt four times. A history book that doesn't explain the structure of each era leaves the reader unable to understand why a given team was or wasn't there.

### Eras

| Era | TIs | Structure |
| --- | --- | --- |
| **Open / invite** | TI1–TI5 (2011–2015) | Direct invites at Valve's discretion + regional qualifiers. Invite criteria opaque — a recurring source of drama. |
| **Valve Majors** | TI6, TI7 (2015–2017) | Fixed-$3M Majors: Frankfurt, Shanghai, Manila (→TI6); Boston, Kiev (→TI7). Still no formal points. |
| **Dota Pro Circuit** | TI8–TI12 (2017–2023) | Points-based. Majors + Minors (2017–18, 2018–19), then regional leagues + Majors (2021–2023). Points determined direct invites. |
| **Post-DPC** | TI13– (2024–) | DPC abolished after TI12. Return to direct invites based on global tournament results, plus regional and open qualifiers. |

### Per-year content

- **Era banner** explaining that year's qualification rules in plain language.
- **Circuit event results** — every Major/Minor that season, with winner, placements, and points where applicable.
- **Regional DPC season tables** (TI10–TI12 era): each region's divisions, standings, and points, since a team's TI slot was decided there.
- **Qualification ledger** — for every attending team: invited / regional qualifier / open qualifier, with the path they took.
- **The snubs** — teams that didn't make it and the argument about why, with period reaction.
- **Roster shuffle, before and after** — as structured moves (`player`, `from`, `to`, `date`, `type`, `source`), not prose, so they can be rendered as a timeline and cross-linked to player pages.

---

## 5. The Game (tab 4)

New. The purpose is contextual: reading year-by-year, you should be able to see the game itself evolving underneath the tournament.

### 5.1 Patch & map

- **Patch version** the event was played on, with a link to the official notes.
- **Map schematic** for that patch era. This is not optional decoration — the map *is* the patch as far as a reader is concerned, and "7.19" means nothing to someone who wants to know what the game looked like that year.
- **Structural feature table** — what existed on the map that year:

  Outposts · Shrines · Bounty rune count and positions · Wisdom/XP runes · Lotus pools · Tormentors · Twin Gates · Roshan pit location and count · Neutral camp count per side · Neutral items · Tomes of Knowledge · Talent trees · Backdoor protection · Buyback rules · Courier rules

  Each entry is `present / absent / introduced this patch / changed this patch`, with a citation to the patch notes that introduced it.

- **"What changed since last TI"** — a diff against the previous year's structural row. This is the feature that makes the evolution legible.

**Implementation note.** Map images should be authored as SVG schematics rather than scraped screenshots: they stay legible at any size, they theme with the page, they carry no licensing ambiguity, and they keep the repo offline. One schematic per structural era (roughly: pre-6.82, 6.82–6.88, 7.00–7.22, 7.23–7.32, 7.33+), not one per patch.

**Get the patch number from the data, not from a search.** TI8's patch (7.19) was established during drafting by a live web search, because nothing in the committed dataset recorded it — which is exactly the kind of fact that should never depend on someone remembering to look it up. OpenDota's match detail carries a `patch` field, and `MatchDetail` already declares it; the ingest step should record the patch actually observed across an event's matches and flag any event whose matches disagree. A tournament played across a patch boundary is a real thing and worth surfacing, not averaging away.

### 5.2 Event statistics

All of the following are derivable from OpenDota match data for the event's league ID, computed once at build time and baked into JSON:

| Stat | Source |
| --- | --- |
| Average / median / longest / shortest game | `duration` |
| Average kills per game | `radiant_score + dire_score` |
| Roshan kills per game | `objectives[]` (requires parsed replays) |
| Most picked heroes | `picks_bans` |
| Most banned heroes | `picks_bans` |
| **Unpicked heroes** — heroes that never saw the stage | hero pool for that patch minus picked set |
| Highest / lowest win-rate heroes | `picks_bans` + result, min-games threshold |
| Player GPM / XPM averages and leaders | `players[].gold_per_min`, `xp_per_min` |
| First-blood timing, average | `objectives[]` |

### 5.2.1 Items that defined the meta

Heroes are only half of what a patch felt like. Some events are remembered for an item as much as a hero — TI11 and Wraith Pact being the obvious case, where a single item shaped how teams fought.

**Most years are not TI11, and the section must be willing to say so.** Per principle 6, this exists to hold an answer where one exists. TI8 is the worked example: its most-held items are Power Treads, Black King Bar and Ring of Aquila — ubiquitous in every patch of that era and defining nothing. The honest output for that year is "no item defined this meta", with the numbers shown so a reader can see why, and the interesting material lives in win rates rather than counts. Nominating a runner-up because the section has a heading would be inventing significance, which is the same failure as inventing a fact.

What goes on the page:

- **Most-purchased items** at the event, excluding the consumables and boots every game buys — those are noise, not meta. The exclusion list is explicit and reviewable, not a hardcoded guess.
- **Items new to this patch cycle**, and how heavily they were actually taken up. An item introduced and ignored is as informative as one introduced and abused.
- **Biggest change from the previous TI** — the same diff idea as the map's structural row in §5.1, applied to item usage. This is what makes an item's rise legible as an event rather than a statistic.
- Where an item genuinely defined the event, a short sourced note saying so, in the same shape as the chart note in §3.3 — a claim like "Wraith Pact defined TI11" is narrative and needs a citation, not a computed number wearing a sentence.

Data notes:

- OpenDota match detail carries `players[].item_0`–`item_5`, `backpack_*`, and `purchase_log` where the replay was parsed. **Our `MatchPlayer` interface does not currently read any of them** — adding the fields is the first step.
- Item id → name needs OpenDota's item constants, fetched and cached the same way `fetchHeroes()` already handles heroes.
- Final inventory and purchase history answer different questions. Final inventory undercounts items that were bought and consumed or sold; `purchase_log` catches those but only exists for parsed matches. Pick per stat, and say which is in use.
- Same thresholds as everything else: an item bought three times is not a meta definer. Sample size travels with the number, and where replays are unparsed the display is *"not available for this event"*.

**Two honesty requirements:**

1. **Minimum sample thresholds.** A hero picked twice and winning twice is not "the strongest hero at TI7." Any win-rate display must carry its sample size and suppress below a threshold (proposed: 5 games).
2. **Coverage degrades for early TIs.** TI1 and TI2 predate reliable public match data, and `objectives[]` needs parsed replays that may not exist for older matches. Where a stat can't be computed, the UI shows *"not available for this event"* — never a plausible-looking number. This is the single most important rule in this document.

The "unpicked heroes" stat also needs the hero pool *as of that patch* — a hero that didn't exist yet is not "unpicked." The pipeline must resolve the hero roster per patch.

---

## 6. Series and Moments (tabs 6, 7)

The prototype took "macro" and "micro" as literal technical terms. They were shorthand.

### Tab 6 — Series

Matches and series that **generated real community reaction**, regardless of stage. A group-stage game that blew up on Reddit belongs here as much as a grand final. Selection criterion is *reaction*, not bracket position.

Each entry: teams, stage, date, what happened, why it mattered, why people lost their minds about it, video, and community reaction block.

### Tab 7 — Moments & Content

Three kinds of thing, one tab:

- **Plays** — individual moments of mechanical brilliance. The Dream Coil, the Echo Slam, the Skewer.
- **Interviews** — press conferences, post-game interviews, moments where somebody said something that stuck.
- **Event content** — True Sight episodes, Valve's produced pieces, community videos, the short films, the intro cinematics.

Each entry declares its `kind` so the tab can be filtered, but they share a card format and the theatre modal.

**Media policy.** Video links are stored as structured references (`platform`, `id`, `start`, `end`) and opened in the theatre modal on click — Option A from the original design pass, which the prototype did implement correctly and should be kept. Link rot is explicitly deferred; the schema just needs to be shaped so a `status` or `mirror` field can be added later without migration.

---

## 7. Visual design

### 7.1 What happened

The original design pass locked in **Concept B — "The Ancient Dota Lore Grimoire"**: parchment-textured cards, dark leather borders, wax-seal category icons, warm gold and amber accents, script-style titles, and a per-TI color theme driving the accents.

What was built is a *technical terminal archive*: near-black `#0c0c0e`, hot orange `#ff4d00`, Syne and Space Mono, hard 1px borders, no texture, no gold, no seals, and identical accent color on all thirteen years.

The evidence that this was a silent redesign rather than a misunderstanding is in `src/index.css` — the grimoire's class *names* survived while every value was replaced:

```css
.font-cinzel     { font-family: 'Syne', sans-serif; }   /* the serif is a geometric sans */
.font-cinzel-dec { font-family: 'Syne', sans-serif; }
.bg-leather      { background-color: #0c0c0e; …dot grid… }  /* no leather */
.bg-parchment-dark { background-color: rgba(255,255,255,0.02); }  /* no parchment */
.text-gold-gradient { color: #e4e4e7; }                 /* gold is white */
```

And the per-TI theming was built into the *data* and then never read: `themeColor`, `secondaryColor`, and `glowColor` are defined on all 13 TI records and referenced by **zero** components. `waxSealSymbol` is never rendered; `waxSealName` appears once, as a plain text label.

Three design generations are layered in the codebase simultaneously — `App.tsx` still carries `#E5B869`, the "Dota Gold" from Gemini's very first HTML boilerplate, on its outermost element, where it is overridden by every child component.

### 7.2 Direction

Restore Concept B as specified:

- **Surfaces:** aged parchment card faces on a dark leather field. Real texture, subtle, not skeuomorphic kitsch.
- **Type:** a proper display serif for titles (Cinzel or similar), a readable serif or humanist sans for body copy at 1,500+ words per page, monospace reserved for stat tables.
- **Accents:** warm gold and amber baseline, **shifted per TI by that year's theme color** — the table already exists in the design pass and the values already exist in the data. Emerald for TI3, obsidian purple for TI4, and so on.
- **Wax seals:** the per-year seal as an actual rendered mark on the year header, and seal-style icons for the sub-tab categories.
- **Theatre modal:** keep. It works and it matches the plan.

Two things worth preserving from what was built, on their merits: the **Hall of Fame page structure** (champions wall, prize-pool evolution chart, multi-Aegis shrine) and the **Story tab's editorial hierarchy**. Both are good; they need re-skinning, not redesign.

### 7.3 Open

Pierce has raised possibly using Claude for design tweaking later in the build. Reasonable — but the baseline is the grimoire, and any variation should be a deliberate iteration on it rather than a fresh direction.

---

## 8. Data architecture

### 8.1 Rules

1. **Entities, not strings.** Players and teams are records with stable IDs, referenced by ID everywhere. `Dendi` is one entity that appears across TI1–TI7, not seven unrelated strings. This makes player pages, cross-year queries, and corrections possible — and it structurally prevents the "same player, two different real names" class of error the prototype has.
2. **One source of truth per fact.** The prototype stores champion rosters in three files that already disagree. Champion roster is derived from the team record, not duplicated.
3. **Provenance is mandatory on non-obvious facts.** Narrative claims, roster moves, and reaction quotes carry `source_url` and `retrieved_at`.
4. **Absence is representable and visible.** Optional fields are genuinely optional and the UI renders "not recorded" rather than a placeholder. **No generator may invent an entity.** `getTIAllTeams()` is deleted, not fixed.
5. **Data lives in JSON, not TypeScript.** Content is editable by a non-programmer and diffable in review. Types are validated against the JSON at build time, not hand-maintained alongside it.
6. **Years are data.** No `TIVersionId` union. A new TI is a new file plus an index entry.
7. **`computed/` holds IDs, never names.** No file under `computed/` may contain a team name, player handle, or hero name. Only `team_id`, `account_id`, `hero_id`, resolved at render time against the entity layer. This is rule 1 with teeth — see §8.4 for why it needed them.

### 8.2 Shape

```
data/
  entities/
    players.json          # account_id, dated handles, real name, nationality, source
    teams.json            # team_id, dated names, region, source
    rosters.json          # dated lineups: team_id + players + valid_from/valid_to
    roster-changes.json   # atomic joins/leaves with date_precision and source
    team-keys.json        # team_id <-> Liquipedia page title (see §8.4.5 step 3)
    heroes.json           # id, name, localized name, introduced-in patch
  events/
    ti03.json             # event meta, narrative, teams+placements, series, moments
    ti14.json
  circuit/
    2022-23.json          # DPC/Major/Minor season: events, regional tables, points
  patches/
    7.33.json             # structural map features + citations
  computed/               # generated by pipeline, never hand-edited; IDs only
    ti03.stats.json
```

`computed/` is generated and committed so the app stays offline, but it is regenerable and clearly marked as machine-written. Nothing hand-authored ever lands there, and per §8.1 rule 7 nothing *named* lands there either — only IDs, resolved at render. The four identity files above are the reason that rule is enforceable; §8.4 explains what went wrong without them.

### 8.3 Pipeline

Build-time scripts, run by a human, output committed:

| Script | Pulls | Produces |
| --- | --- | --- |
| `ingest:matches` | OpenDota, by league ID | Match records for each event |
| `ingest:liquipedia` | Liquipedia API (custom UA, rate-limited) | Brackets, placements, prize distribution, rosters |
| `compute:stats` | Local match records | `computed/*.stats.json` per §5.2 |
| `verify` | Local data | Referential integrity, missing sources, threshold violations, orphaned entities |

`verify` is the guard rail that the prototype lacked. It should fail on: a roster referencing an unknown player ID, a player in two rosters at the same event, a duplicate team at one event, a win-rate below sample threshold, a narrative claim without a source, or a video reference reused across unrelated moments — the exact failure classes already present in the prototype's data.

Two checks added after the failure described in §8.4, both of which would have caught it:

- **A name in `computed/`** — §8.1 rule 7. The check that turns "entities, not strings" from an intention into something the build enforces.
- **A dated lookup with no covering record** — resolving a team's name on a date outside every validity range in its entity record. Silence there is how a stale name gets rendered as if it were correct.

### 8.4 The identity layer

**Why this section exists.**

Building TI8's day-by-day group standings surfaced a bug worth recording in full, because the lesson is not the one it first looks like.

Seven of the eighteen group-stage teams came out under the wrong name. Evil Geniuses rendered as **"Shopify Rebellion"**, Fnatic as **"Ascent Esports"**, PSG.LGD as **"LGD Gaming"**, and OpTic Gaming had no name at all. OpenDota returns a team's *current* name; the index had been generated in 2026, so a 2018 group stage was about to be published carrying 2026 branding.

The obvious diagnosis — "we need canonical entities" — is wrong, because **we already had them.** `data/entities/teams.json` existed, keyed by `team_id`, recording names per event with sources. §8.1 rule 1 already said "Entities, not strings." An entire propose → review → promote identity pipeline already existed.

The bug happened because `matches.index.json` stored OpenDota's *name strings* rather than storing `team_id` and resolving names at render. The entity layer was there and the pipeline walked around it.

That distinction drives everything below. **Populating more years of an architecture that downstream steps bypass reproduces this bug at greater scale.** The rule comes first; the data comes second.

#### 8.4.1 The rule that prevents recurrence

§8.1 rule 7: no file under `computed/` may contain a team name, player handle, or hero name.

`verify` enforces it by scanning every `computed/` file for string values matching any known entity name and failing on a hit. This is deliberately blunt — a false positive is a two-minute fix, and the failure it prevents is publishing a fabricated-looking history.

Names are resolved at render time, as of the event's date, from the entity layer.

#### 8.4.2 Attributes are dated, not event-keyed

The current shape records a name per event:

```json
{ "team_id": 15, "names": [{ "event": "ti08", "name": "PSG.LGD" }] }
```

That answers "what were they called at TI8" and nothing else. It cannot answer "what were they called on 2018-01-13" — which is what the 23 tier-1 and tier-2 season tournaments need, and what the season chart already needed. Move to validity ranges:

```json
{
  "team_id": 15,
  "names": [
    { "name": "LGD Gaming", "valid_from": null,         "valid_to": "2018-04-18", "source": { … } },
    { "name": "PSG.LGD",    "valid_from": "2018-04-19", "valid_to": null,         "source": { … } }
  ]
}
```

`null` means open-ended, not unknown. A genuinely unknown boundary is recorded as `"unknown"` and the renderer shows the nearest confirmed name with the uncertainty visible — never a silent guess. The same shape applies to player handles.

#### 8.4.3 Org, roster, and roster change are three different things

The hardest part of this, and the part with no purely technical answer. Team Liquid in 2012, 2018 and 2026 share a `team_id` and share almost no players. OpTic Gaming's roster was sold. VGJ.Storm and VGJ.Thunder were two teams under one banner. Without an explicit policy, "how many Majors did Team Liquid win that season" has no defined answer.

The policy:

- **`team`** — identity follows the stable `team_id`. An organisation that renames is the same team; the name is a dated attribute per §8.4.2.
- **`roster`** — a dated lineup: `{ team_id, players[], valid_from, valid_to, source }`. A roster belongs to a team but is not the team. Continuity of *players* is a property of rosters, never of teams.
- **`roster_change`** — an event: `{ team_id, player, direction: joined|left|role_change, date, date_precision, source }`. This is the atomic record; rosters are derivable from a team's ordered changes, and where both exist they must agree or `verify` fails.

`date_precision` is required and is one of `exact`, `month`, `approximate`. A move known only as "around May 23" — the Aui_2000 coaching change, dated from a Wayback capture rather than a publication — is `approximate`, and no consumer may treat it as `exact`.

#### 8.4.4 Roster windows date undated documents

The identity layer is also a **dating tool**, and this is the strongest argument for building it before the bulk research passes rather than after.

JoinDota is dead and its Wayback captures carry no publication date. The capture date is when the crawler visited, which for an article about January events crawled in August is off by seven months. Today those items are dated `null`, and the caveat travels with them everywhere.

But roster validity windows bound them. An article mentioning Universe on Fnatic must postdate 2018-01-13. One mentioning Ohaiyo on Fnatic predates it. Entity mentions in an undated document, intersected against roster windows, produce a **date range** — not a date. That range is honest in a way a capture date never was.

Recorded as:

```json
{ "published": null,
  "published_bounds": { "not_before": "2018-01-13", "not_after": "2018-02-06",
                        "basis": "mentions Universe on Fnatic; mentions Ohaiyo not yet on LFY",
                        "method": "roster-window inference" } }
```

Never collapsed to a single date. A bounded range is a finding; a midpoint is a fabrication.

Scope note: this applies to roughly 77 JoinDota captures. **GosuGamers articles already carry exact publication dates**, extracted from each page's own embedded `publishedAt`. The undated problem is far smaller than it appears.

#### 8.4.5 Build order

Entities are the cheap pull and the detail is the expensive one, so they are sequenced accordingly. Five-year segments are a convenient way to schedule the *detail* work; they are not an architectural boundary, and using them as one would put seams mid-history wherever a team renamed across a segment edge.

1. **Rule first.** §8.1 rule 7 and its `verify` check. Cheap, and prevents the whole class from recurring while later steps land.
2. **Entity spine, all years at once.** OpenDota `/teams` and `/proPlayers` are one request each. Liquipedia supplies as-of-event names per event page. This is the layer everything else joins to, so seams in it are expensive and it is cheap to do whole.
3. **Key mapping.** OpenDota `team_id` and Liquipedia page titles are different key spaces. TI8 only resolved because `rosters.json` happened to carry both. A `team_id` ↔ Liquipedia-title table is its own artefact with its own review.
4. **Roster history**, from Liquipedia per event plus the roster-change reporting already sitting in the research sets.
5. **Per-event detail** in whatever batches suit — matches, brackets, prize tables, stats.
6. **Re-date the Wayback corpus** using §8.4.4, once roster windows exist.

#### 8.4.6 Known limits

- **TI1–TI3 have no OpenDota league entry.** Their entity spine is Liquipedia-only and will be thinner. Where a fact cannot be established, the UI shows "not available for this event" per §5.2 — the rule does not bend for early years.
- **Identity genuinely is ambiguous sometimes.** A sold roster, a disbanded org whose players regroup under a new tag. Where the answer is a judgment call, it is recorded as a judgment call with its reasoning, in data, reviewable — not resolved silently in code.
- **This does not fix bad sources.** It makes disagreements between sources *visible and located*. Two sources disagreeing about a roster date becomes a flagged conflict on a specific record rather than a number that quietly differs between two pages.

---

## 9. Technical

- **Offline-first.** No server, no API keys, no runtime fetches. The Express server and the `@google/genai` dependency are removed.
- **Assets vendored.** Fonts, logos, hero icons, and map schematics live in the repo. No hotlinking to Steam's CDN, no hand-guessed URLs, no shared image standing in for four different teams. Where a logo cannot be sourced under acceptable terms, the fallback is a deliberate typographic mark, not another team's logo.
- **Real type checking.** `@types/react` and `@types/react-dom` installed, `strict` enabled. The prototype's `lint` script passes while checking nothing, which is part of why breakage went unnoticed.
- **Routing.** URLs per TI and per tab, so a specific page can be linked and shared.
- **Licensing.** Settled: split license. Code is MIT (`LICENSE`); everything under `data/` is CC-BY-SA 3.0 (`LICENSE-DATA`), because parts derive from Liquipedia and its ShareAlike term carries forward. Sources are credited in `ATTRIBUTION.md`, and Valve's trademark is noted there and in the README.

---

## 10. Open questions

1. **Research execution** (§3.1) — do I write the ingest scripts for you to run locally, or do we widen this environment's network policy?
2. **Reddit** — how do you want reaction threads gathered, given the crawler block? Manual collection, or a local script with your own API credentials?
3. **Rebuild vs. port.** My read is: new data layer, new markup, but keep the IA and the Hall of Fame structure as reference. Confirm.
4. **Scope of first build.** All 14 TIs shallow, or 2–3 TIs at full intended depth as a vertical slice? I'd recommend the slice — it proves the design before 14× the content work.
5. **Does "The Game" earn its own tab,** or should patch/map/stats live inside Story?
6. **TI14 (2025, Hamburg, Team Falcons over Xtreme Gaming 3–2)** is absent entirely and TI15 is imminent. Confirm the archive tracks the current year as it happens, or only completed events.
