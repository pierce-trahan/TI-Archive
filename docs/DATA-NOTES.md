# Data source notes — what the APIs actually return

Operational findings, verified by fetching. Distinct from `docs/DESIGN.md` (what we intend to build) and `CLAUDE.md` (how to work). Append as we learn; don't record anything here that wasn't observed directly.

Last verified: 2026-08-06, against TI8 (`leagueid 9870`).

---

## Gotcha: Node's `fetch` ignores `HTTPS_PROXY`

Worth knowing before you debug a phantom 403. In a sandboxed environment that routes egress through a proxy, `curl` works and Node's global `fetch` does not — curl reads `HTTPS_PROXY`, undici's default dispatcher does not. Every request goes direct and is refused, and the failure surfaces as `403 Forbidden` from the destination host, which looks exactly like the host blocking you.

Setting `process.env.NODE_USE_ENV_PROXY` inside the script is too late: Node initialises its dispatcher before user code runs.

`scripts/lib/http.ts` handles it by installing an explicit `undici` `ProxyAgent` when `HTTPS_PROXY` is set. On a normal machine the variable is unset and the code path is a no-op, so the scripts behave identically either way.

## OpenDota

No API key required. Free tier is rate-limited — batch politely and cache to disk; a full TI is ~400 detail requests.

### `/api/leagues/{id}/matches` — the match list

Returns a **summary** record only. Fields: `match_id`, `start_time`, `duration`, `radiant_win`, `radiant_score`, `dire_score`, `radiant_team_id`, `radiant_team_name`, `dire_team_id`, `dire_team_name`, `series_id`, `series_type`, `leagueid`.

Three things to know:

1. **A TI league contains far more than the TI.** TI8 returns **401 matches** spanning `2018-06-18 → 2018-08-26`. June is the regional qualifiers; the event itself is August. 55 distinct team IDs appear, against 18 teams at the event. Any per-event stat must filter by phase, not just by league.

   TI8 phase boundaries, from the per-day match counts:

   | Phase | Dates (UTC) | Matches |
   | --- | --- | --- |
   | Regional qualifiers | Jun 18–25 | 206 |
   | Group stage | Aug 15–18 | 146 |
   | Main event / playoffs | Aug 20–26 | 47 |

   This is a feature for the "Road to TI" tab — the qualifier matches are right there.

2. **`radiant_team_name` / `dire_team_name` are frequently `null`** — including for every main-event match at TI8, the grand final among them. Team identity must come from the match detail endpoint, not the list.

3. **Timestamps are UTC and events are not.** The TI8 grand final's last two games land on `2018-08-26` UTC despite being the evening of Aug 25 in Vancouver. Phase and "day of the event" boundaries must be computed in the venue's local timezone, or the last day of every TI will be split in two.

### `/api/matches/{id}` — the match detail

Verified on the TI8 grand final game 4 (`4080778303`):

- **Parsed.** `version: 21` and a populated `objectives` array, so replay-derived data is available. Objective types seen: `building_kill` (33), `CHAT_MESSAGE_ROSHAN_KILL` (4), `CHAT_MESSAGE_AEGIS` (4). **Roshan counts are obtainable.** Not every match is parsed — check `version` before computing, and treat unparsed matches as missing rather than zero.
- `radiant_team.name` / `dire_team.name` are populated here (`LGD Gaming` vs `OG`) even where the list endpoint had nulls.
- `picks_bans` has all 22 entries with `order`, `is_pick`, `team`, `hero_id` — **full draft order is available**, which covers the "draft masterstrokes" content in the design.
- Per-player: `gold_per_min`, `xp_per_min`, `kills`/`deaths`/`assists`, `hero_id`, `account_id`.

### Player identity is the hard problem

In the TI8 grand final, **6 of 10 players had a null `name` field.** `name` is OpenDota's pro-player name and its coverage is partial.

`personaname` is **not** a usable fallback. It is the current Steam persona, so it drifts over time and is often a joke or a non-Latin handle. Observed in that one match: `睪九`, `天地一刀斩`, `nailong`, `minioncheer`, `OiOi.oldandrusty`.

`account_id` is present for all ten and is stable.

**Therefore:** players are keyed on `account_id`, mapped to our own player entities through a curated table that we own and source. Never derive a player's identity from `personaname`, and never fall back to it for display. This is the concrete reason for the entity model in `docs/DESIGN.md` §8.1.

### Heroes

`/api/heroes` returns `id` → `localized_name`. It returned **127 heroes** on the date above — that is *today's* hero pool, not the pool at any past event.

**Trap for the "unpicked heroes" stat:** computing it against the current pool would report heroes that did not yet exist as "never picked at TI8." The hero roster must be resolved per patch, from that patch's notes, before that stat is computed. Until that's done, the stat is not shipped.

### TI1–TI3 have no league entry

Confirmed against the full league list (10,037 entries). No International record exists below `leagueid 600` (TI4). Every low ID in that range is another 2012–13 league — The Defense, Star Series, G-League, SteelSeries Euro Cup, and so on.

Match-level statistics for 2011–2013 are therefore not obtainable from OpenDota by league. Those pages ship narrative-first with stats marked *not available for this event*.

**Future path, not yet attempted:** Dotabuff has these games logged, so the match IDs exist somewhere. Options worth investigating later, in rough order of preference: Valve's official WebAPI by match ID, a curated match-ID list fed to OpenDota's `/api/matches/{id}` directly (which does not require a league entry), or manual transcription. Note that `dotabuff.com` is **not** in the current network allowlist and their terms restrict automated access — check before relying on it.

### Verified league IDs

| Event | leagueid | Event | leagueid |
| --- | --- | --- | --- |
| TI4 (2014) | 600 | TI11 (2022) | 14268 |
| TI5 (2015) | 2733 | TI12 (2023) | 15728 |
| TI6 (2016) | 4664 | TI13 (2024) | 16935 |
| TI7 (2017) | 5401 | TI14 (2025) | 18324 |
| TI8 (2018) | 9870 | TI15 (2026) | 19719 |
| TI9 (2019) | 10749 | | |

**TI10 is ambiguous and must not be guessed.** Both `11625` ("The International 10") and `13256` ("The International 2021") exist. The event was postponed from 2020 to 2021, which broke the until-then reliable convention that the TI number tracked its year — a numbering break that confuses databases and people equally, and one the UI should probably address for readers too. Check which league carries the played matches before using either.

---

## Liquipedia

Reachable, but returns **403 to a default User-Agent**. Their terms require a descriptive custom `User-Agent` identifying the project and a contact, plus rate limiting. Set both before the first request; do not retry into a block.

Not yet exercised. Intended for brackets, placements, prize distribution, and rosters.

## Wikipedia

Reachable (`*.wikipedia.org`). Not yet exercised.

## GosuGamers

Reachable at the network level. Feature articles from the TI3–TI13 era are indexed and searchable. Not yet exercised for bulk fetching — expect bot protection and verify politely.

## JoinDota

Dead. Domain does not resolve. Wayback Machine (`web.archive.org`, allowlisted) is the only route.

## Reddit

Not reachable by any Claude tool, independent of network configuration — Reddit blocks Anthropic's crawler by policy. Reaction threads must be gathered by the owner or by a script using his own OAuth credentials.
