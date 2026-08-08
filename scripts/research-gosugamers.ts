/**
 * Collect GosuGamers period reporting for an event.
 *
 *   npm run research:gosugamers -- ti08
 *   npm run research:gosugamers -- ti08 --limit 60
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
 * Each article page still embeds its own metadata (exact `publishedAt`
 * epoch, title, teaser) as a React Flight payload, the same mechanism as the
 * listing pages, so that is parsed directly for accurate dates rather than
 * trusting the sitemap's `<lastmod>` (which reflects edits, not publication).
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

/** Metadata embedded in an article page's own React Flight payload, anchored on its numeric id. */
function extractArticleMeta(html: string, id: string): { title: string | null; publishedAt: number | null; teaser: string | null } {
  const anchor = new RegExp(String.raw`\\"id\\":${id},\\"frontendId\\"`).exec(html);
  if (!anchor) return { title: null, publishedAt: null, teaser: null };

  const chunk = html.slice(anchor.index, anchor.index + 3000);
  const title = new RegExp(String.raw`\\"title\\":\\"(${V})\\",\\"urlSafeTitle\\"`).exec(chunk)?.[1];
  const publishedAt = new RegExp(String.raw`\\"publishedAt\\":(\d+)`).exec(chunk)?.[1];
  const teaser = new RegExp(String.raw`\\"teaser\\":\\"(${V})\\",\\"url\\"`).exec(chunk)?.[1];

  return {
    title: title ? unescapeOnce(title) : null,
    publishedAt: publishedAt ? Number(publishedAt) : null,
    teaser: teaser ? unescapeOnce(teaser) : null,
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

  // High enough that a normal run covers the whole date window rather than exhausting
  // one quarter's worth of candidates and stopping before reaching the others.
  const maxArticles = arg('limit', 600);
  const event = await loadEvent(key);

  const first = event.phases[0]?.from ?? `${event.year}-01-01`;
  const last = event.phases.at(-1)?.to ?? `${event.year}-12-31`;
  const windowFrom = new Date(`${first}T00:00:00Z`);
  windowFrom.setUTCDate(windowFrom.getUTCDate() - 60);
  const windowTo = new Date(`${last}T23:59:59Z`);
  windowTo.setUTCDate(windowTo.getUTCDate() + 45);

  const quarters = quartersInRange(windowFrom, windowTo);

  console.log(`${event.name}`);
  console.log(`window: ${windowFrom.toISOString().slice(0, 10)} -> ${windowTo.toISOString().slice(0, 10)}`);
  console.log(`sitemap quarters: ${quarters.map((q) => `${q.year}Q${q.quarter}`).join(', ')}\n`);

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

  for (const url of [...candidateUrls].slice(0, maxArticles * 2)) {
    if (items.length >= maxArticles) break;

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
      excerpt: meta.teaser || excerpt(text),
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

  const path = await writeResearch(key, 'gosugamers', items, {
    window: { from: windowFrom.toISOString(), to: windowTo.toISOString() },
    sitemap_quarters: quarters.map((q) => `${q.year}Q${q.quarter}`),
  });

  console.log(`\nmetadata + excerpts: ${path}`);
  console.log(`full text (gitignored): data/raw/research/${key}/gosugamers/`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
