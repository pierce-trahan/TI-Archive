# TI Archive — working notes for Claude

An offline, open-source history book of The International. One page per TI, covering the season that led into it as much as the event itself. Read **`docs/DESIGN.md`** before doing any work — it holds the agreed design scope and supersedes anything you infer from the existing code.

## Prime directive

**Never invent data.** This project exists because the prototype was built by an agent that filled gaps with plausible-sounding fabrication, and the owner cannot trust it. A missing fact is fine. A wrong fact is the one failure this project cannot absorb.

In practice:

- If a fact isn't in a source you actually fetched, it does not go in the data. Not "probably," not "commonly reported."
- Never write a function that synthesizes entities to reach a target count. The prototype's `getTIAllTeams()` invented ~14 teams per event with identical fake hero stats. That pattern is banned.
- Absence is representable and must render as "not recorded" / "not available for this event" — never a placeholder that looks like real data.
- Win rates and averages carry their sample size. Suppress hero win rates below 5 games.
- Narrative claims, roster moves, and quotes carry `source_url` and `retrieved_at`.
- If you are unsure, say so to the owner rather than resolving it yourself. He watched all of this live and can answer in one line.

## Current state

`src/` holds the AI Studio prototype. **It is reference material, not a foundation.** Its information architecture and its Hall of Fame page are worth keeping; its data, asset handling, and styling are being replaced. Do not extend it — see `docs/DESIGN.md` §7–9 for what replaces it.

Known-bad things in there, so you don't mistake them for intent:

- 24 of 27 "moments" point at the same YouTube ID.
- Team logos are hand-guessed CDN URLs; several unrelated teams share one image, and the unmatched fallback is Na'Vi's logo.
- Player headshot URLs use an invented path (`dota_react/players/…`) that does not exist on Valve's CDN. The hero path (`dota_react/heroes/…`) is real.
- `@types/react` is not installed, so `tsc --noEmit` passes while checking essentially nothing.
- Champion rosters are duplicated across three files and already disagree.
- The grimoire design was replaced by a terminal aesthetic while keeping the old class names (`.font-cinzel` maps to Syne, `.text-gold-gradient` is white). Per-TI theme fields exist in the data and are read by zero components.

## Verified environment facts

Network access is **Custom**. Reachable: `api.opendota.com`, `liquipedia.net`, `*.wikipedia.org`, `web.archive.org`, `archive.org`, `*.gosugamers.net`, plus the default package-manager and GitHub allowlist. Anything else returns `000` / a proxy 403 — report it, don't route around it.

Source notes:

| Source | State |
| --- | --- |
| OpenDota | Works, no key needed. Primary match-data source. |
| Liquipedia | Reachable but returns 403 to a default UA. Their terms require a descriptive custom `User-Agent` and rate limiting. Set both before use. |
| Wikipedia | Works. Backbone facts, brackets, prize distribution. |
| GosuGamers | Reachable. Primary period-reporting source for narrative. |
| JoinDota | Dead — domain does not resolve. Wayback Machine only. |
| Reddit | Not reachable by any Claude tool; blocked by Reddit's policy toward Anthropic's crawler, independent of network config. Reaction threads must come from the owner or a script with his own OAuth credentials. |

### OpenDota league IDs for The International

Verified against `/api/leagues`:

| Event | leagueid | Event | leagueid |
| --- | --- | --- | --- |
| TI4 (2014) | 600 | TI11 (2022) | 14268 |
| TI5 (2015) | 2733 | TI12 (2023) | 15728 |
| TI6 (2016) | 4664 | TI13 (2024) | 16935 |
| TI7 (2017) | 5401 | TI14 (2025) | 18324 |
| TI8 (2018) | 9870 | TI15 (2026) | 19719 |
| TI9 (2019) | 10749 | | |
| TI10 (2021) | 13256 — **verify** | | |

Two things to resolve during ingest, not to guess at:

1. **TI1–TI3 (2011–2013) have no league entry** in OpenDota's list. Match-level stats for those years may not be obtainable at all. If so, the UI shows "not available for this event" — it does not show estimates.
2. **Both `11625` ("The International 10") and `13256` ("The International 2021") exist.** TI10 was postponed from 2020 to 2021. Check which carries the played matches before using either.

TI15 (2026) is already registered, which matters — the archive is expected to track the current year.

## Working agreements

- Branch: `claude/dota-ti-history-scrapbook-crbycd`. Commit and push work; don't open a PR unless asked.
- Design decisions are made with the owner before implementation, not during. He is directing this deliberately.
- Narrative drafts should be written long. He edits down from lived memory — over-length is useful, invented detail is not.
- Prefer showing him a working slice over describing one. He has been burned by an agent that reported success it hadn't achieved.
- When reporting completion, state what you actually verified and what you didn't.

## Build

```
npm install
npm run lint     # currently near-useless; fix by adding @types/react + strict
npm run build
```

Data pipeline scripts (per `docs/DESIGN.md` §8.3) are not written yet. When they are: ingest and compute steps write only to `data/computed/`, and a `verify` step must fail on unknown player references, a player appearing twice at one event, duplicate teams, sub-threshold stats, sourceless claims, and video IDs reused across unrelated moments — the exact failure classes present in the prototype.
