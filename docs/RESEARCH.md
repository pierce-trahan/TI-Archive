# Running the research scripts locally

The narrative work needs period sources — what people wrote and said *at the time*, before hindsight tidied it up. Two of those sources cannot be reached from a cloud session, so these scripts are built to run on your machine.

| Script | Source | Why it must run locally |
| --- | --- | --- |
| `research:gosugamers` | GosuGamers articles | Bot protection refuses datacenter IPs. From a normal connection it is an ordinary site. |
| `research:wayback` | JoinDota via the Wayback Machine | JoinDota shut down in March 2022 and its domain no longer resolves. |

The OpenDota and Liquipedia ingests run anywhere and do not need this.

**Reddit is not a source here.** A `research:reddit` script existed but Reddit denied the API access request required to run it (a vague form-letter denial, no stated reason, no specifics on what was missing). Don't re-attempt the same registration path without a reason to think it'd go differently.

## Setup

```bash
git clone <repo> && cd TI-Archive
npm install
```

## Running

```bash
npm run research:wayback     -- ti08
npm run research:gosugamers  -- ti08
```

Each takes an event key from `data/sources/events.json` and derives its date window from that event's phases, widened 60 days before and 45 days after so the run-up and the aftermath are included.

**That default window is not a season.** It covers the event and the months immediately before it — for TI8 that is April onward. A competitive season starts when the previous International ends, so writing about a season's opening months against the default window means writing with no period reporting behind them. Set `--from` to the day after the previous TI finished:

```bash
# The whole 2017-18 season, not just its closing months.
# TI7 ended 2017-08-12.
npm run research:gosugamers -- ti08 --from 2017-08-12
```

The article cap scales with the window (about 200 per quarter), so a longer window doesn't silently truncate. `--from` and `--to` reject anything that isn't `YYYY-MM-DD` rather than falling back to the default — a typo'd date that quietly reverted would produce a file that looks complete and isn't.

Useful variations:

```bash
# A different dead site, or a different section of JoinDota
npm run research:wayback -- ti08 joindota.com/en/features

# Cap it lower for a quick test run — the default is high enough to cover the
# whole date window; a low --limit will stop partway through (skewed toward
# whichever quarter's candidates it reaches first) rather than sampling evenly.
npm run research:gosugamers -- ti08 --limit 40

# See what the sitemap XML actually looks like
npm run research:gosugamers -- ti08 --dump
```

## What lands where, and why

Two directories, split on purpose:

| Path | Contents | Committed? |
| --- | --- | --- |
| `data/raw/research/<event>/<source>/` | Full article and thread text | **No** — gitignored |
| `data/research/<event>.<source>.json` | Title, URL, date, author, signals, short excerpt | Yes |

News articles are the copyrighted work of the people who wrote them. This project **cites and quotes** them; it does not host them. Full text is cached locally so a narrative can be written from real sources, and only metadata plus an excerpt capped at 400 characters is committed — enough to find the piece again and quote it with attribution.

Keep that split. It is the difference between an archive with sources and a mirror of someone else's writing.

## Expectations

**GosuGamers pulls candidate URLs from the site's own sitemap, not its listing pages.** An earlier version tried to paginate `/dota2/news`, but GosuGamers' listing pages only ever server-render page 1's data — the `?pageNo=` query is a client-side-only concern, invisible to a plain HTTP fetch. The sitemap (`/sitemap.xml?type=articles&year=Y&quarter=Q`, static XML going back to 2003) sidesteps that entirely. Each article's own page still embeds its exact publish date, title, and a teaser as structured data, which is parsed directly rather than trusted from the sitemap's `<lastmod>` (which reflects edits, not publication). It is built to fail loudly rather than quietly: it refuses to write a file if every article is rejected, warns when over half lack an extractable date, and `--dump` saves one quarter's raw sitemap XML so you can check the structure without reading the whole script. If GosuGamers changes its markup again, that is expected — send me the dump.

**Wayback coverage is uneven.** Some months of JoinDota were captured thoroughly and others barely at all. Fewer results for a given TI means the crawler visited less often, not that less was written.

**Wayback results have no publication date, and this matters.** JoinDota's article pages carry no machine-readable date — no meta tag, no `<time>` element. The only date available is the Wayback *capture* timestamp, which is when the crawler visited, not when the piece was written. The first run of this script used it as the publication date and confidently dated a 2013 article about Alliance forming to August 2018.

So `published` is now `null` for every Wayback item, and the capture date lives in `signals.captured` clearly labelled as such. The date window filters on capture date, which means **older articles that happened to be crawled during the window will appear in the results**. Read the piece before dating a claim from it.

JoinDota bylines read "posted by <author>", sometimes followed by a relative age. The **author is recovered for every article** — real staff bylines like Malystryx.GDS and Nahaz — which is a genuine win for citation.

The relative age is kept verbatim in `signals.age_at_capture` and never converted to a date: "3 years ago" spans a twelve-month window, and turning it into a specific day would manufacture precision the source never had.

**But be clear about how little that helps.** Only 1 of 79 TI8 articles carried a relative age at all. The rest have no date signal of any kind, so a 2013 article crawled in 2018 is still indistinguishable from a 2018 one without reading it. The staleness warning at the end of a run catches the rare labelled case and nothing else. Treat every undated Wayback item as undated.

**Both are polite by design** — 2s between archive.org calls, 3s for GosuGamers, plus a `robots.txt` check before fetching. Please leave those alone. Getting this project blocked would cost far more than the time saved.

## After a run

The committed JSON is the index; the gitignored text is the reading material. From there the narrative gets written with a `source_url` beside every claim, per the rule in `CLAUDE.md`.
