# Running the research scripts locally

The narrative work needs period sources — what people wrote and said *at the time*, before hindsight tidied it up. Three of those sources cannot be reached from a cloud session, so these scripts are built to run on your machine.

| Script | Source | Why it must run locally |
| --- | --- | --- |
| `research:reddit` | r/DotA2 threads | Reddit blocks Anthropic's crawler by policy. No network change fixes this; it needs your credentials. |
| `research:gosugamers` | GosuGamers articles | Bot protection refuses datacenter IPs. From a normal connection it is an ordinary site. |
| `research:wayback` | JoinDota via the Wayback Machine | JoinDota shut down in March 2022 and its domain no longer resolves. |

The OpenDota and Liquipedia ingests run anywhere and do not need this.

## Setup

```bash
git clone <repo> && cd TI-Archive
npm install
cp .env.example .env      # then fill in the Reddit credentials
```

Reddit needs a "script" app from <https://www.reddit.com/prefs/apps>. The client id is the string under the app name. Nothing else needs credentials.

## Running

```bash
npm run research:reddit      -- ti08
npm run research:wayback     -- ti08
npm run research:gosugamers  -- ti08
```

Each takes an event key from `data/sources/events.json` and derives its date window from that event's phases, widened 60 days before and 45 days after so the run-up and the aftermath are included.

Useful variations:

```bash
# Override the Reddit search terms
npm run research:reddit -- ti08 "OG,PSG.LGD,Ceb,roster shuffle"

# A different dead site, or a different section of JoinDota
npm run research:wayback -- ti08 joindota.com/en/features

# Go deeper, or see what the listing markup actually looks like
npm run research:gosugamers -- ti08 --pages 15 --limit 120
npm run research:gosugamers -- ti08 --dump
```

## What lands where, and why

Two directories, split on purpose:

| Path | Contents | Committed? |
| --- | --- | --- |
| `data/raw/research/<event>/<source>/` | Full article and thread text | **No** — gitignored |
| `data/research/<event>.<source>.json` | Title, URL, date, author, signals, short excerpt | Yes |

News articles and Reddit comments are the copyrighted work of the people who wrote them. This project **cites and quotes** them; it does not host them. Full text is cached locally so a narrative can be written from real sources, and only metadata plus an excerpt capped at 400 characters is committed — enough to find the piece again and quote it with attribution.

Keep that split. It is the difference between an archive with sources and a mirror of someone else's writing.

## Expectations

**GosuGamers is untested.** It was written from a session that could not reach the site, so the listing selectors are a best guess at markup nobody could inspect. It is built to fail loudly rather than quietly: it refuses to write a file if every article is rejected, warns when over half lack a publication date, and `--dump` saves one page of raw HTML so you can fix `findArticleLinks()` without reading the whole script. If it breaks, that is expected — send me the dump.

**Reddit search cannot filter by date.** It returns by relevance, so the scripts pull up to three pages per query and filter by timestamp afterwards. Some genuinely relevant threads will be missed. Extra search terms are usually the fix.

**Wayback coverage is uneven.** Some months of JoinDota were captured thoroughly and others barely at all. Fewer results for a given TI means the crawler visited less often, not that less was written.

**Wayback results have no publication date, and this matters.** JoinDota's article pages carry no machine-readable date — no meta tag, no `<time>` element. The only date available is the Wayback *capture* timestamp, which is when the crawler visited, not when the piece was written. The first run of this script used it as the publication date and confidently dated a 2013 article about Alliance forming to August 2018.

So `published` is now `null` for every Wayback item, and the capture date lives in `signals.captured` clearly labelled as such. The date window filters on capture date, which means **older articles that happened to be crawled during the window will appear in the results**. Read the piece before dating a claim from it.

JoinDota bylines read "posted by <author>", sometimes followed by a relative age. The **author is recovered for every article** — real staff bylines like Malystryx.GDS and Nahaz — which is a genuine win for citation.

The relative age is kept verbatim in `signals.age_at_capture` and never converted to a date: "3 years ago" spans a twelve-month window, and turning it into a specific day would manufacture precision the source never had.

**But be clear about how little that helps.** Only 1 of 79 TI8 articles carried a relative age at all. The rest have no date signal of any kind, so a 2013 article crawled in 2018 is still indistinguishable from a 2018 one without reading it. The staleness warning at the end of a run catches the rare labelled case and nothing else. Treat every undated Wayback item as undated.

**All three are polite by design** — 1.2s between Reddit calls, 2s for archive.org, 3s for GosuGamers, plus a `robots.txt` check before fetching. Please leave those alone. Getting this project blocked would cost far more than the time saved.

## After a run

The committed JSON is the index; the gitignored text is the reading material. From there the narrative gets written with a `source_url` beside every claim, per the rule in `CLAUDE.md`.
