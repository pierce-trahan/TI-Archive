/**
 * Collect GosuGamers period reporting for an event.
 *
 *   npm run research:gosugamers -- ti08
 *   npm run research:gosugamers -- ti08 --pages 40 --limit 60
 *
 * RUN THIS LOCALLY. GosuGamers sits behind bot protection that refuses
 * datacenter IPs, so it cannot be reached from a cloud session. From a normal
 * connection it is an ordinary site.
 *
 * The site is a Next.js app: each listing page embeds the full article list
 * for that page — title, an exact `publishedAt` epoch, a teaser, and the
 * pagination totals — as a React Flight payload inside a
 * `self.__next_f.push([1, "..."])` script tag. That is parsed directly rather
 * than scraping per-article meta tags, which is what makes exact dates
 * available at all. Listings paginate with `?pageNo=`, not `?page=`.
 *
 * As of writing, GosuGamers' Dota 2 listings run ~1000 pages / ~12000
 * articles deep, newest first, so reaching an old event like TI8 (2018) by
 * walking from page 1 is impractical. Instead this binary-searches the page
 * number using each page's embedded timestamps to jump straight to the
 * event's date window, then walks forward collecting matches.
 *
 * It is deliberately loud: it checks robots.txt first, reports what it
 * extracts as it goes, and refuses to write a file if extraction looks wrong,
 * rather than quietly producing plausible rubbish. `--dump` prints the raw
 * HTML of page 1 so you can see what changed without reading the whole
 * script, if GosuGamers changes its markup again.
 */

import { writeFile } from 'node:fs/promises';
import { checkRobots } from './lib/robots.ts';
import { cacheFullText, excerpt, writeResearch } from './lib/research.ts';
import type { ResearchItem } from './lib/research.ts';
import { loadEvent } from './lib/events.ts';
import { USER_AGENT } from './lib/http.ts';

const ORIGIN = 'https://www.gosugamers.net';
const LISTINGS = ['/dota2/news', '/dota2/features'];
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
    headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
    signal: AbortSignal.timeout(45_000),
  });
}

function listingUrl(listing: string, pageNo: number): string {
  return `${ORIGIN}${listing}${pageNo > 1 ? `?pageNo=${pageNo}` : ''}`;
}

/** Reverses one layer of JSON-string escaping, e.g. the `\r\n` and `\"` left inside a captured field. */
function unescapeOnce(raw: string): string {
  try {
    return JSON.parse(`"${raw}"`) as string;
  } catch {
    return raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
}

interface ListingItem {
  id: string;
  title: string;
  publishedAt: number;
  teaser: string;
  url: string;
}

interface Pagination {
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalRows: number;
}

/**
 * A value inside the embedded (once-escaped) JSON: either an escaped char, or anything but backslash/quote.
 * Non-greedy — otherwise it matches through to the LAST quote in the chunk instead of the next one.
 */
const V = String.raw`(?:\\.|[^\\"])*?`;

function parsePagination(html: string): Pagination | null {
  const m = new RegExp(
    String.raw`\\"pagination\\":\{\\"pageNo\\":(\d+),\\"pageSize\\":(\d+),\\"totalPages\\":(\d+),\\"totalRows\\":(\d+)\}`,
  ).exec(html);
  if (!m) return null;
  return { pageNo: Number(m[1]), pageSize: Number(m[2]), totalPages: Number(m[3]), totalRows: Number(m[4]) };
}

/** Article items embedded in a listing page's React Flight payload. */
function parseListingItems(html: string): ListingItem[] {
  const items: ListingItem[] = [];
  const anchor = /\\"item\\":\{\\"id\\":(\d+)/g;
  let match: RegExpExecArray | null;

  while ((match = anchor.exec(html))) {
    const id = match[1]!;
    // Fields of one item are close together; a bounded window avoids needing a real JSON parse.
    const chunk = html.slice(match.index, match.index + 3000);

    const title = new RegExp(String.raw`\\"title\\":\\"(${V})\\",\\"urlSafeTitle\\"`).exec(chunk)?.[1];
    const publishedAt = new RegExp(String.raw`\\"publishedAt\\":(\d+)`).exec(chunk)?.[1];
    const teaserUrl = new RegExp(String.raw`\\"teaser\\":\\"(${V})\\",\\"url\\":\\"(${V})\\"`).exec(chunk);

    if (!title || !publishedAt || !teaserUrl) continue;

    const url = unescapeOnce(teaserUrl[2]!);
    items.push({
      id,
      title: unescapeOnce(title),
      publishedAt: Number(publishedAt),
      teaser: unescapeOnce(teaserUrl[1]!),
      url: url.startsWith('http') ? url : `${ORIGIN}${url}`,
    });
  }

  return items;
}

/** Full body text of one article page, for local caching. Dates come from the listing, not this. */
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

/** Binary-searches for the smallest pageNo whose oldest item is already at or before `beforeMs`. */
async function findStartPage(listing: string, totalPages: number, beforeMs: number): Promise<number> {
  let lo = 1;
  let hi = totalPages;

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const response = await polite(listingUrl(listing, mid)).catch(() => null);
    if (!response?.ok) {
      // Can't probe this page; assume we need to go further back.
      lo = mid + 1;
      continue;
    }
    const items = parseListingItems(await response.text());
    const oldestOnPage = items.length ? Math.min(...items.map((i) => i.publishedAt)) : Infinity;
    console.log(`  probing page ${mid}: oldest item ${new Date(oldestOnPage).toISOString().slice(0, 10)}`);
    if (oldestOnPage <= beforeMs) hi = mid;
    else lo = mid + 1;
  }

  return lo;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key || key.startsWith('--')) {
    console.error('usage: npm run research:gosugamers -- <event-key> [--pages N] [--limit N] [--dump]');
    process.exit(1);
  }

  const maxPages = arg('pages', 40);
  const maxArticles = arg('limit', 80);
  const event = await loadEvent(key);

  const first = event.phases[0]?.from ?? `${event.year}-01-01`;
  const last = event.phases.at(-1)?.to ?? `${event.year}-12-31`;
  const windowFrom = new Date(`${first}T00:00:00Z`);
  windowFrom.setUTCDate(windowFrom.getUTCDate() - 60);
  const windowTo = new Date(`${last}T23:59:59Z`);
  windowTo.setUTCDate(windowTo.getUTCDate() + 45);

  console.log(`${event.name}`);
  console.log(`window: ${windowFrom.toISOString().slice(0, 10)} -> ${windowTo.toISOString().slice(0, 10)}`);
  console.log(`listings: ${LISTINGS.join(', ')}  (max ${maxPages} pages walked per listing once located)\n`);

  const robots = await checkRobots(`${ORIGIN}${LISTINGS[0]}`);
  if (!robots.allowed) throw new Error(`robots.txt disallows the listing path (${robots.rule}). Stopping.`);
  console.log(`robots.txt: allowed${robots.crawlDelaySeconds ? `, crawl-delay ${robots.crawlDelaySeconds}s` : ''}\n`);

  if (process.argv.includes('--dump')) {
    const response = await polite(listingUrl(LISTINGS[0]!, 1));
    await writeFile('gosugamers-page-dump.html', await response.text(), 'utf8');
    console.log('  wrote gosugamers-page-dump.html — inspect it and adjust parseListingItems()/parsePagination()');
    return;
  }

  // ---- Locate the window in each listing's pagination, then walk it ----
  const candidates = new Map<string, ListingItem>();

  for (const listing of LISTINGS) {
    const first1 = await polite(listingUrl(listing, 1)).catch(() => null);
    if (!first1?.ok) {
      console.log(`  ${listing} -> ${first1?.status ?? 'network error'}; skipping this listing`);
      continue;
    }
    const pagination = parsePagination(await first1.text());
    if (!pagination) {
      console.log(`  ${listing}: could not find pagination info in the page — markup may have changed`);
      continue;
    }
    console.log(`  ${listing}: ${pagination.totalRows} articles across ${pagination.totalPages} pages`);

    const startPage = await findStartPage(listing, pagination.totalPages, windowTo.getTime());
    console.log(`  ${listing}: window starts around page ${startPage}\n`);

    let pagesWalked = 0;
    for (let pageNo = startPage; pageNo <= pagination.totalPages && pagesWalked < maxPages; pageNo++, pagesWalked++) {
      const response = await polite(listingUrl(listing, pageNo)).catch(() => null);
      if (!response?.ok) {
        console.log(`  ${listingUrl(listing, pageNo)} -> ${response?.status ?? 'network error'}; stopping this listing`);
        break;
      }
      const items = parseListingItems(await response.text());
      if (!items.length) {
        console.log(`  page ${pageNo}: no items parsed; stopping this listing`);
        break;
      }

      const inWindow = items.filter((i) => i.publishedAt >= windowFrom.getTime() && i.publishedAt <= windowTo.getTime());
      inWindow.forEach((i) => candidates.set(i.id, i));
      console.log(
        `  page ${pageNo}: ${items.length} items, ${inWindow.length} in window (${candidates.size} unique so far)`,
      );

      const allOlderThanWindow = items.every((i) => i.publishedAt < windowFrom.getTime());
      if (allOlderThanWindow) {
        console.log(`  page ${pageNo}: entirely older than the window; stopping this listing`);
        break;
      }
    }
  }

  if (!candidates.size) {
    throw new Error(
      'No articles found in the date window. Either the window is wrong, or the listing markup has ' +
        'changed — re-run with --dump to see the HTML and adjust parseListingItems()/parsePagination().',
    );
  }

  // ---- Fetch full text for each candidate, respecting --limit ----
  const items: ResearchItem[] = [];
  let thin = 0;

  for (const candidate of [...candidates.values()].slice(0, maxArticles)) {
    const response = await polite(candidate.url).catch(() => null);
    if (!response?.ok) continue;

    const text = extractArticleText(await response.text());
    if (text.length < 600) {
      thin++;
      continue;
    }

    const published = new Date(candidate.publishedAt).toISOString().slice(0, 10);
    const cachedPath = await cacheFullText(key, 'gosugamers', candidate.id, text);

    items.push({
      source: 'gosugamers',
      title: candidate.title,
      url: candidate.url,
      published,
      author: null,
      excerpt: candidate.teaser || excerpt(text),
      signals: { chars: text.length },
      retrieved_at: new Date().toISOString(),
      cached_text_path: cachedPath,
    });

    console.log(`  ${items.length.toString().padStart(3)}  ${published}  ${candidate.title.slice(0, 60)}`);
  }

  console.log(`\ncandidates in window: ${candidates.size} | kept: ${items.length} | too thin: ${thin}`);

  if (!items.length) {
    throw new Error(
      'Every candidate article was rejected as too thin to be useful — nothing written, rather than ' +
        'writing an empty file that looks like a real result.',
    );
  }

  const path = await writeResearch(key, 'gosugamers', items, {
    window: { from: windowFrom.toISOString(), to: windowTo.toISOString() },
    listings: LISTINGS,
  });

  console.log(`\nmetadata + excerpts: ${path}`);
  console.log(`full text (gitignored): data/raw/research/${key}/gosugamers/`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
