/**
 * Recover articles from a dead site through the Wayback Machine.
 *
 *   npm run research:wayback -- ti08                    # defaults to joindota
 *   npm run research:wayback -- ti08 joindota.com/en/news
 *
 * JoinDota ran Dota 2 coverage for over a decade and shut down in March 2022.
 * Its domain no longer resolves, so the Wayback Machine is the only route to
 * period reporting from TI1 through TI11.
 *
 * Two steps: the CDX index lists every capture matching a URL prefix in a date
 * range, then each capture is fetched from the archive. Rate limiting is
 * deliberate — archive.org is a donated public service, not a CDN.
 */

import { checkRobots } from './lib/robots.ts';
import { cacheFullText, excerpt, writeResearch } from './lib/research.ts';
import type { ResearchItem } from './lib/research.ts';
import { loadEvent } from './lib/events.ts';
import { USER_AGENT } from './lib/http.ts';

const CDX = 'https://web.archive.org/cdx/search/cdx';
/** archive.org is a donated service. Be a good guest. */
const MIN_INTERVAL_MS = 2000;
const MAX_CAPTURES = 400;
/**
 * CDX index queries are slow — a modest prefix query measured at 23 seconds,
 * and a large one is far worse. Snapshot fetches are quick by comparison.
 */
const CDX_TIMEOUT_MS = 180_000;
const SNAPSHOT_TIMEOUT_MS = 45_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastRequest = 0;

async function polite(url: string, timeoutMs = SNAPSHOT_TIMEOUT_MS): Promise<Response> {
  const wait = lastRequest + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
  return fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(timeoutMs) });
}

/**
 * The CDX index is a shared public service and occasionally answers a slow or
 * heavy query with a transient 502/503/504 rather than the actual result.
 * That's overload, not "this query is invalid" — worth a few backed-off
 * retries before giving up and failing loudly.
 */
async function politeCdx(url: string, timeoutMs: number, attempts = 4): Promise<Response> {
  let response: Response;
  for (let attempt = 1; ; attempt++) {
    response = await polite(url, timeoutMs);
    if (response.ok || attempt === attempts) return response;
    const backoffMs = 5000 * 2 ** (attempt - 1); // 5s, 10s, 20s
    console.log(`  CDX index answered ${response.status}; retrying in ${backoffMs / 1000}s (attempt ${attempt}/${attempts})...`);
    await sleep(backoffMs);
  }
}

const decodeEntities = (v: string): string =>
  v
    .replace(/&nbsp;/g, ' ')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));

/** Strips the site's own furniture from a page title: "Story « News « Site.com". */
const cleanTitle = (raw: string): string =>
  decodeEntities(raw).split(/\s*[«»|]\s*/)[0]!.replace(/\s+/g, ' ').trim();

/**
 * joinDOTA bylines render as "posted by <author> , <relative age>", e.g.
 * "posted by raiko_ , 3 years ago". The author is exact and worth keeping.
 *
 * The relative age is recorded verbatim and NEVER converted to a date:
 * "3 years ago" spans a twelve-month window, and turning it into a specific
 * day would manufacture precision that was never there. As a raw string it
 * still does the job that matters — it tells a reader at a glance that an
 * article crawled during our window is actually years older.
 */
function extractByline(text: string): { author: string | null; ageAtCapture: string | null } {
  const match = /posted by\s+([^,]{1,40}?)\s*,\s*(.{0,30})/i.exec(text);
  if (!match) return { author: null, ageAtCapture: null };

  const author = match[1]?.trim() || null;
  const age = /^((?:about\s+)?\d+\s+(?:second|minute|hour|day|week|month|year)s?\s+ago)/i.exec(
    match[2] ?? '',
  )?.[1];

  return { author, ageAtCapture: age ?? null };
}

/** Drops the leading navigation so an excerpt starts at the article. */
function articleBody(text: string): string {
  const byline = /posted by\s+[^,]{1,40},\s*(?:(?:about\s+)?\d+\s+\w+\s+ago\s*)?/i.exec(text);
  return byline ? text.slice(byline.index + byline[0].length).trim() : text;
}

/** Turns archived HTML into something readable, discarding chrome. */
function extractText(html: string): { title: string | null; text: string } {
  const title =
    /<meta property="og:title" content="([^"]+)"/.exec(html)?.[1] ??
    /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() ??
    null;

  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    // The Wayback toolbar is injected into every capture.
    .replace(/<div id="wm-ipp[\s\S]*?<\/div>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  return { title: title ? cleanTitle(title) : null, text: decodeEntities(body) };
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run research:wayback -- <event-key> [url-prefix]');
    process.exit(1);
  }
  const prefix = process.argv[3] ?? 'joindota.com/en/news';
  const sourceName = new URL(`https://${prefix}`).hostname.replace(/^www\./, '').split('.')[0]!;

  const event = await loadEvent(key);
  const first = event.phases[0]?.from ?? `${event.year}-01-01`;
  const last = event.phases.at(-1)?.to ?? `${event.year}-12-31`;
  // Widen either side so run-up and aftermath coverage is included. Real date
  // arithmetic — adding to a YYYYMMDD integer produces invalid dates near a
  // year boundary (20181225 + 200 = 20181425).
  const stamp = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');
  const shift = (iso: string, days: number) => {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
  };
  const fromStamp = stamp(shift(first, -60));
  const toStamp = stamp(shift(last, 60));

  console.log(`${event.name}`);
  console.log(`archive prefix: ${prefix}`);
  console.log(`capture window: ${fromStamp} -> ${toStamp}\n`);

  const robots = await checkRobots(`https://web.archive.org/`);
  if (!robots.allowed) {
    throw new Error(`web.archive.org robots.txt disallows this path (${robots.rule}). Stopping.`);
  }

  const cdxUrl =
    `${CDX}?url=${encodeURIComponent(prefix)}*&output=json&fl=timestamp,original,statuscode` +
    `&filter=statuscode:200&filter=mimetype:text/html&collapse=urlkey` +
    `&from=${fromStamp}&to=${toStamp}&limit=${MAX_CAPTURES}`;

  console.log('querying the CDX index (this is slow — up to a few minutes)...');
  const indexResponse = await politeCdx(cdxUrl, CDX_TIMEOUT_MS);
  if (!indexResponse.ok) throw new Error(`CDX index failed: ${indexResponse.status} (after retries)`);

  const rows = (await indexResponse.json()) as string[][];
  const captures = rows.slice(1); // first row is the column header
  console.log(`${captures.length} captures in range\n`);

  const items: ResearchItem[] = [];
  const seenUrls = new Set<string>();

  for (const [i, row] of captures.entries()) {
    const [timestamp, original] = row;
    if (!timestamp || !original) continue;

    // The same article appears under ?comment_page=2, &3 and so on.
    const canonical = original.replace(/^https?:\/\//, '').split(/[?&]/)[0]!;
    if (seenUrls.has(canonical)) continue;
    seenUrls.add(canonical);

    const snapshotUrl = `https://web.archive.org/web/${timestamp}/${original}`;
    let response: Response;
    try {
      response = await polite(snapshotUrl);
    } catch {
      console.log(`  skip (network) ${original}`);
      continue;
    }
    if (!response.ok) {
      console.log(`  skip (${response.status}) ${original}`);
      continue;
    }

    const { title, text } = extractText(await response.text());
    const { author, ageAtCapture } = extractByline(text);
    // Index and tag pages survive as captures but carry no article.
    if (text.length < 600) continue;

    const cachedPath = await cacheFullText(key, sourceName, `${timestamp}_${i}`, text);

    items.push({
      source: sourceName,
      title: title ?? original,
      // Cite the original URL; record the snapshot actually read.
      url: `https://${canonical}`,
      // NOT the capture date. These pages carry no machine-readable
      // publication date, and the Wayback timestamp is when the crawler
      // visited — an article from 2013 crawled in 2018 would otherwise be
      // labelled 2018. Unknown is the only honest value.
      published: null,
      author,
      // Start the excerpt at the article, not at the site's navigation.
      excerpt: excerpt(articleBody(text)),
      signals: {
        snapshot: snapshotUrl,
        age_at_capture: ageAtCapture,
        captured: `${timestamp.slice(0, 4)}-${timestamp.slice(4, 6)}-${timestamp.slice(6, 8)}`,
        captured_note: 'Date the archive crawled the page, NOT when it was published.',
        chars: text.length,
      },
      retrieved_at: new Date().toISOString(),
      cached_text_path: cachedPath,
    });

    process.stdout.write(`  ${items.length.toString().padStart(3)}  ${(title ?? original).slice(0, 70)}\n`);
  }

  const path = await writeResearch(key, sourceName, items, {
    archive_prefix: prefix,
    capture_window: { from: fromStamp, to: toStamp },
    note: 'Recovered via the Wayback Machine. `url` is the original address; `signals.snapshot` is the capture actually read.',
  });

  console.log(`\n${items.length} articles recovered (${seenUrls.size - items.length} skipped as duplicates or too thin)`);
  const withAge = items.filter((i) => i.signals?.age_at_capture).length;
  const stale = items.filter((i) => /year/.test(String(i.signals?.age_at_capture ?? '')));

  console.log(
    '\n  NOTE: these pages carry no publication date, so `published` is null for every item.\n' +
      '  The date window filtered on CAPTURE date, so older articles that happened to be\n' +
      '  crawled during the window are included. Check the article before dating a claim.',
  );
  console.log(`  ${withAge}/${items.length} carry a relative age from their byline.`);
  if (stale.length) {
    console.log(`  ${stale.length} are years old at capture and almost certainly predate the event:`);
    for (const i of stale.slice(0, 8)) {
      console.log(`      ${String(i.signals?.age_at_capture).padEnd(14)} ${i.title.slice(0, 58)}`);
    }
  }
  console.log(`metadata + excerpts: ${path}`);
  console.log(`full text (gitignored): data/raw/research/${key}/${sourceName}/`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
