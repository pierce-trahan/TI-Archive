/**
 * Collect GosuGamers period reporting for an event.
 *
 *   npm run research:gosugamers -- ti08
 *   npm run research:gosugamers -- ti08 --from 2017-08-12   # whole season
 *   npm run research:gosugamers -- ti08 --limit 60
 *
 * By default the window comes from the event's own phases, widened either
 * side — enough for the event and its run-up. A competitive season is longer
 * than that: it starts when the previous International ends. Use `--from` to
 * cover one, or the narrative for the season's opening months will have no
 * period reporting behind it.
 *
 * RUN THIS LOCALLY. GosuGamers sits behind bot protection that refuses
 * datacenter IPs, so it cannot be reached from a cloud session. From a normal
 * connection it is an ordinary site.
 *
 * The site is a Next.js app whose listing pages (`/dota2/news`) only ever
 * embed page 1's data server-side — the `?pageNo=` query is entirely a
 * client-side concern, so a plain HTTP fetch can never see page 2 onward.
 * Reaching an old event's articles by "paginating" the listing is therefore
 * not just slow, it is impossible.
 *
 * Instead this uses GosuGamers' own sitemap, which is partitioned by quarter
 * (`/sitemap.xml?type=articles&year=Y&quarter=Q`) and goes back to 2003.
 * That is static XML — no client JS involved — so it is a reliable way to
 * enumerate every article URL published in the event's date window without
 * needing pagination at all.
 *
 * Each article page still embeds its own metadata (exact `publishedAt` epoch
 * and title) as a React Flight payload, the same mechanism as the listing
 * pages, so that is parsed directly for accurate dates rather than trusting
 * the sitemap's `<lastmod>` (which reflects edits, not publication). The
 * excerpt itself comes from the rendered article text, not from that payload
 * — see the comment on `extractArticleMeta` for why.
 *
 * It is deliberately loud: it checks robots.txt first, reports what it
 * extracts as it goes, and refuses to write a file if extraction looks wrong,
 * rather than quietly producing plausible rubbish. `--dump` prints the raw
 * XML of the first relevant quarterly sitemap so you can see what changed
 * without reading the whole script, if GosuGamers changes its structure again.
 */

import { writeFile } from 'node:fs/promises';
import { checkRobots } from './lib/robots.ts';
import { cacheFullText, excerpt, writeResearch } from './lib/research.ts';
import type { ResearchItem } from './lib/research.ts';
import { loadEvent } from './lib/events.ts';
import { USER_AGENT } from './lib/http.ts';

const ORIGIN = 'https://www.gosugamers.net';
/** No published crawl-delay, so pick a rate that could not bother anyone. */
const DEFAULT_INTERVAL_MS = 3000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastRequest = 0;
let intervalMs = DEFAULT_INTERVAL_MS;

function arg(name: string, fallback: number): number {
  const i = process.argv.indexOf(`--${name}`);
  const value = i > -1 ? Number(process.argv[i + 1]) : NaN;
  return Number.isFinite(value) ? value : fallback;
}

/**
 * A YYYY-MM-DD override for one edge of the window.
 *
 * The default window is derived from the event's own phases, which covers the
 * event and its run-up but not a full competitive season. A season runs from
 * the previous International, so `--from 2017-08-12` is how you get period
 * reporting for all of it rather than only the closing months.
 *
 * Rejects anything unparseable rather than silently falling back — a typo'd
 * date that quietly reverts to the default would produce a file that looks
 * complete and isn't.
 */
function dateArg(name: string): Date | null {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return null;
  const raw = process.argv[i + 1];
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new Error(`--${name} needs a YYYY-MM-DD date, got: ${raw ?? '(nothing)'}`);
  }
  const parsed = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) throw new Error(`--${name} is not a real date: ${raw}`);
  return parsed;
}

async function polite(url: string): Promise<Response> {
  const verdict = await checkRobots(url);
  if (!verdict.allowed) throw new Error(`robots.txt disallows ${url} (${verdict.rule})`);
  if (verdict.crawlDelaySeconds != null) {
    intervalMs = Math.max(intervalMs, verdict.crawlDelaySeconds * 1000);
  }

  const wait = lastRequest + intervalMs - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();

  return fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
    signal: AbortSignal.timeout(45_000),
  });
}

/** Reverses one layer of JSON-string escaping, e.g. the `\r\n` and `\"` left inside a captured field. */
function unescapeOnce(raw: string): string {
  try {
    return JSON.parse(`"${raw}"`) as string;
  } catch {
    return raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
}

/**
 * A value inside the embedded (once-escaped) JSON: either an escaped char, or anything but backslash/quote.
 * Non-greedy — otherwise it matches through to the LAST quote in the page instead of the next one.
 */
const V = String.raw`(?:\\.|[^\\"])*?`;

function quartersInRange(from: Date, to: Date): Array<{ year: number; quarter: number }> {
  const quarters: Array<{ year: number; quarter: number }> = [];
  let year = from.getUTCFullYear();
  let quarter = Math.floor(from.getUTCMonth() / 3) + 1;
  const endYear = to.getUTCFullYear();
  const endQuarter = Math.floor(to.getUTCMonth() / 3) + 1;

  while (year < endYear || (year === endYear && quarter <= endQuarter)) {
    quarters.push({ year, quarter });
    quarter++;
    if (quarter > 4) {
      quarter = 1;
      year++;
    }
  }
  return quarters;
}

function sitemapUrl(year: number, quarter: number): string {
  return `${ORIGIN}/sitemap.xml?type=articles&year=${year}&quarter=${quarter}`;
}

async function fetchSitemapArticleUrls(year: number, quarter: number): Promise<string[]> {
  const response = await polite(sitemapUrl(year, quarter)).catch(() => null);
  if (!response?.ok) return [];
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
}

/**
 * Metadata embedded in an article page's own React Flight payload, anchored on its numeric id.
 *
 * Deliberately does NOT extract `teaser` here. That field exists on the listing-page schema
 * (where it's a short plain string immediately followed by `"url"`) but individual article
 * pages embed a different object shape — their `teaser`-keyed value there is a full HTML
 * paragraph with no nearby `"url"` to terminate on, so the same regex ran past it and captured
 * the article's raw internal JSON along with it. `excerpt(text)` below is HTML-stripped and
 * length-capped by construction, so it's used unconditionally instead of trusting this field.
 */
function extractArticleMeta(html: string, id: string): { title: string | null; publishedAt: number | null } {
  const anchor = new RegExp(String.raw`\\"id\\":${id},\\"frontendId\\"`).exec(html);
  if (!anchor) return { title: null, publishedAt: null };

  const chunk = html.slice(anchor.index, anchor.index + 3000);
  const title = new RegExp(String.raw`\\"title\\":\\"(${V})\\",\\"urlSafeTitle\\"`).exec(chunk)?.[1];
  const publishedAt = new RegExp(String.raw`\\"publishedAt\\":(\d+)`).exec(chunk)?.[1];

  return {
    title: title ? unescapeOnce(title) : null,
    publishedAt: publishedAt ? Number(publishedAt) : null,
  };
}

/** Full body text of one article page, for local caching. */
function extractArticleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key || key.startsWith('--')) {
    console.error('usage: npm run research:gosugamers -- <event-key> [--limit N] [--dump]');
    process.exit(1);
  }

  const event = await loadEvent(key);

  const first = event.phases[0]?.from ?? `${event.year}-01-01`;
  const last = event.phases.at(-1)?.to ?? `${event.year}-12-31`;

  const fromOverride = dateArg('from');
  const toOverride = dateArg('to');

  let windowFrom: Date;
  if (fromOverride) {
    windowFrom = fromOverride;
  } else {
    windowFrom = new Date(`${first}T00:00:00Z`);
    windowFrom.setUTCDate(windowFrom.getUTCDate() - 60);
  }

  let windowTo: Date;
  if (toOverride) {
    windowTo = new Date(toOverride);
    windowTo.setUTCHours(23, 59, 59, 999);
  } else {
    windowTo = new Date(`${last}T23:59:59Z`);
    windowTo.setUTCDate(windowTo.getUTCDate() + 45);
  }

  if (windowFrom >= windowTo) {
    throw new Error(
      `window start (${windowFrom.toISOString().slice(0, 10)}) is not before its end ` +
        `(${windowTo.toISOString().slice(0, 10)}).`,
    );
  }

  const quarters = quartersInRange(windowFrom, windowTo);

  // Scaled to the window: the cap exists to bound a run, but a fixed one
  // silently truncates a long window — the failure that dropped the actual
  // tournament month from an earlier run. Roughly 200 articles per quarter
  // clears GosuGamers' real publishing rate with room to spare.
  const maxArticles = arg('limit', Math.max(600, quarters.length * 200));

  console.log(`${event.name}`);
  console.log(
    `window: ${windowFrom.toISOString().slice(0, 10)} -> ${windowTo.toISOString().slice(0, 10)}` +
      `${fromOverride || toOverride ? '  (overridden)' : '  (from event phases)'}`,
  );
  console.log(`sitemap quarters: ${quarters.map((q) => `${q.year}Q${q.quarter}`).join(', ')}`);
  console.log(`article cap: ${maxArticles}\n`);

  const robots = await checkRobots(`${ORIGIN}/sitemap.xml`);
  if (!robots.allowed) throw new Error(`robots.txt disallows the sitemap (${robots.rule}). Stopping.`);
  console.log(`robots.txt: allowed${robots.crawlDelaySeconds ? `, crawl-delay ${robots.crawlDelaySeconds}s` : ''}\n`);

  if (process.argv.includes('--dump')) {
    const first_ = quarters[0]!;
    const response = await polite(sitemapUrl(first_.year, first_.quarter));
    await writeFile('gosugamers-sitemap-dump.xml', await response.text(), 'utf8');
    console.log('  wrote gosugamers-sitemap-dump.xml — inspect it and adjust the <loc> parsing');
    return;
  }

  // ---- Enumerate Dota 2 article URLs from the relevant quarterly sitemaps ----
  const candidateUrls = new Set<string>();
  for (const { year, quarter } of quarters) {
    const urls = await fetchSitemapArticleUrls(year, quarter);
    const dota2Urls = urls.filter((u) => /\/dota2\/(news|features)\//.test(u));
    dota2Urls.forEach((u) => candidateUrls.add(u));
    console.log(`  ${year}Q${quarter}: ${urls.length} articles total, ${dota2Urls.length} in /dota2/`);
  }

  if (!candidateUrls.size) {
    throw new Error(
      'No /dota2/ articles found in the sitemaps for this date range. Either the window is wrong, or the ' +
        'sitemap structure has changed — re-run with --dump to see the XML.',
    );
  }
  console.log(`\n${candidateUrls.size} candidate Dota 2 articles across ${quarters.length} quarter(s)\n`);

  // ---- Fetch each article, extract its own embedded metadata, filter by exact date ----
  const items: ResearchItem[] = [];
  let outsideWindow = 0;
  let thin = 0;
  let undated = 0;

  // Two ways this run can quietly come up short, both tracked so the summary
  // can say so. A truncated run that reports success is the exact failure that
  // once dropped the tournament month itself from a TI8 pull.
  const candidateBudget = maxArticles * 2;
  const candidatesTruncated = candidateUrls.size > candidateBudget;
  let hitCap = false;

  for (const url of [...candidateUrls].slice(0, candidateBudget)) {
    if (items.length >= maxArticles) {
      hitCap = true;
      break;
    }

    const response = await polite(url).catch(() => null);
    if (!response?.ok) continue;
    const html = await response.text();

    const idMatch = /\/(\d+)-/.exec(url);
    const id = idMatch?.[1] ?? url.split('/').pop() ?? String(items.length);
    const meta = extractArticleMeta(html, id);

    if (meta.publishedAt != null) {
      if (meta.publishedAt < windowFrom.getTime() || meta.publishedAt > windowTo.getTime()) {
        outsideWindow++;
        continue;
      }
    } else {
      undated++;
    }

    const text = extractArticleText(html);
    if (text.length < 600) {
      thin++;
      continue;
    }

    const published = meta.publishedAt != null ? new Date(meta.publishedAt).toISOString().slice(0, 10) : null;
    const cachedPath = await cacheFullText(key, 'gosugamers', id, text);

    items.push({
      source: 'gosugamers',
      title: meta.title ?? url,
      url,
      published,
      author: null,
      excerpt: excerpt(text),
      signals: { chars: text.length },
      retrieved_at: new Date().toISOString(),
      cached_text_path: cachedPath,
    });

    console.log(`  ${items.length.toString().padStart(3)}  ${published ?? '????-??-??'}  ${(meta.title ?? url).slice(0, 60)}`);
  }

  console.log(
    `\ncandidates: ${candidateUrls.size} | kept: ${items.length} | outside window: ${outsideWindow} | too thin: ${thin} | undated: ${undated}`,
  );

  if (!items.length) {
    throw new Error(
      'Every candidate article was rejected — nothing written, rather than writing an empty file that ' +
        'looks like a real result.',
    );
  }
  if (undated > items.length / 2) {
    console.log('\n  WARNING: over half the kept articles have no extractable publish date.');
    console.log('  Date filtering is therefore unreliable for this run — check before quoting.');
  }

  // ---- Did this run actually cover the window it was asked for? ----
  const dated = items.map((i) => i.published).filter((d): d is string => !!d).sort();
  const earliest = dated[0] ?? null;
  const latest = dated.at(-1) ?? null;
  const askedFrom = windowFrom.toISOString().slice(0, 10);
  const askedTo = windowTo.toISOString().slice(0, 10);

  console.log(`\nrequested window: ${askedFrom} -> ${askedTo}`);
  console.log(`actual coverage:  ${earliest ?? '?'} -> ${latest ?? '?'}`);

  if (hitCap || candidatesTruncated) {
    console.log(`\n  ${'='.repeat(68)}`);
    console.log('  THIS RUN IS INCOMPLETE. The output covers only part of the window.');
    if (hitCap) {
      console.log(`  Stopped at the ${maxArticles}-article cap${earliest ? `, having reached back to ${earliest}` : ''}.`);
    }
    if (candidatesTruncated) {
      console.log(`  Only ${candidateBudget} of ${candidateUrls.size} candidate URLs were even considered.`);
    }
    console.log(`  Re-run with a higher cap, e.g.  --limit ${Math.ceil((candidateUrls.size * 1.2) / 100) * 100}`);
    console.log(`  ${'='.repeat(68)}`);
  } else if (earliest) {
    // The cap wasn't the limit, so a short front edge means GosuGamers simply
    // published nothing earlier — worth distinguishing from truncation.
    const gapDays = Math.round(
      (new Date(`${earliest}T00:00:00Z`).getTime() - windowFrom.getTime()) / 86_400_000,
    );
    if (gapDays > 21) {
      console.log(
        `\n  NOTE: earliest article is ${gapDays} days after the window opens. Not a truncation — ` +
          `the cap was not reached — so the sitemap simply had nothing earlier in /dota2/.`,
      );
    }
  }

  const path = await writeResearch(key, 'gosugamers', items, {
    window: { from: windowFrom.toISOString(), to: windowTo.toISOString() },
    sitemap_quarters: quarters.map((q) => `${q.year}Q${q.quarter}`),
    // Terminal output scrolls away; whether a pull was complete must be
    // answerable from the file months later, without re-running anything.
    coverage: {
      requested_from: askedFrom,
      requested_to: askedTo,
      earliest_article: earliest,
      latest_article: latest,
      complete: !hitCap && !candidatesTruncated,
      article_cap: maxArticles,
      candidates_found: candidateUrls.size,
      candidates_considered: Math.min(candidateUrls.size, candidateBudget),
      ...(hitCap || candidatesTruncated
        ? {
            incomplete_reason: hitCap
              ? `Stopped at the ${maxArticles}-article cap; coverage begins at ${earliest ?? 'unknown'} rather than ${askedFrom}.`
              : `Only ${candidateBudget} of ${candidateUrls.size} candidate URLs were considered.`,
          }
        : {}),
    },
  });

  console.log(`\nmetadata + excerpts: ${path}`);
  console.log(`full text (gitignored): data/raw/research/${key}/gosugamers/`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
