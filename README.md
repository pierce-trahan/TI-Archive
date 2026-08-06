# The International Archive

An offline, open-source history book of The International — one page per TI,
covering the season that led into each event as much as the event itself.

The results of every TI are easy to find. The *history* is not: the roster
manias, the snubs, the rivalries, what the community actually felt while it was
happening. That material is scattered across dead forums, defunct news sites and
threads nobody links to any more. This project is the compilation.

**Status: in development.** The design is agreed and the data pipeline is
running against TI8 as a vertical slice. The application in `src/` is a
prototype being replaced — see `docs/DESIGN.md` before building on it.

## Documentation

| File | What it holds |
| --- | --- |
| `docs/DESIGN.md` | The agreed design scope. Read this first. |
| `docs/DATA-NOTES.md` | What the data sources actually return, verified by fetching. |
| `CLAUDE.md` | Working rules, including the one that matters most. |

## The rule

**Never invent data.** A missing fact is fine; a wrong fact is the failure this
project cannot absorb. Absence is representable and renders as "not recorded".
Statistics carry their sample size. Claims carry their source. Where something
is inferred rather than known, it stays outside the data until a human confirms
it.

## Pipeline

```bash
npm install
npm run ingest:matches    -- ti08   # OpenDota: matches, drafts, per-player stats
npm run ingest:liquipedia -- ti08   # Liquipedia: rosters, qualification, placements
npm run build:playermap   -- ti08   # account_id evidence -> roster scaffold
npm run propose:identities -- ti08  # join the two, label confidence, queue the rest
```

Raw API responses cache to `data/raw/` (gitignored), so re-runs cost nothing and
never re-request a source.

## Licensing

This repository is licensed in two parts:

- **Code** — MIT. Everything under `src/`, `scripts/`, and build configuration.
  See [LICENSE](LICENSE).
- **Data** — CC-BY-SA 3.0. Everything under `data/`, because parts of it derive
  from Liquipedia, whose ShareAlike terms carry forward. See
  [LICENSE-DATA](LICENSE-DATA).

Sources are credited in [ATTRIBUTION.md](ATTRIBUTION.md).

Dota 2 and The International are properties of Valve Corporation. This is an
unofficial community archive, not affiliated with or endorsed by Valve.
