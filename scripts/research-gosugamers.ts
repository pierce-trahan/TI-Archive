/**
 * Collect GosuGamers period reporting for an event.
 *
 *   npm run research:gosugamers -- ti08
 *   npm run research:gosugamers -- ti08 --pages 12 --limit 60
 *
 * RUN THIS LOCALLY. GosuGamers sits behind bot protection that refuses
 * datacenter IPs, so it cannot be reached from a cloud session. From a normal
 * connection it is an ordinary site.
 *
 * UNTESTED against the live site — it was written from a session that could not
 * reach it. It is deliberately loud: it checks robots.txt first, reports what it
 * extracts as it goes, and refuses to write a file if extraction looks wrong,
 * rather than quietly producing plausible rubbish. Expect the listing selectors
 * to need a nudge; `--dump` prints the raw HTML of one page so you can see what
 * changed without reading the whole script.
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

/** Article links off a listing page. Kept broad so a markup change degrades rather than breaks. */
function findArticleLinks(html: string): string[] {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!);
  const articles = hrefs.filter((h) => /\/dota2\/(news|features)\/\d+-/.test(h));
  return [...new Set(articles.map((h) => (h.startsWith('http') ? h : `${ORIGIN}${h}`)))];
}

function extractArticle(html: string): { title: string | null; published: string | null; text: string } {
  const meta = (property: string): string | null =>
    new RegExp(`<meta[^>]+(?:property|name)="${property}"[^>]+content="([^"]*)"`, 'i').exec(html)?.[1] ??
    new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${property}"`, 'i').exec(html)?.[1] ??
    null;

  const title = meta('og:title') ?? /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() ?? null;
  const publishedRaw =
    meta('article:published_time') ??
    meta('datePublished') ??
    /<time[^>]+datetime="([^"]+)"/i.exec(html)?.[1] ??
    null;

  const text = html
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

  return {
    title: title?.replace(/\s+/g, ' ').trim() ?? null,
    published: publishedRaw ? (publishedRaw.slice(0, 10) || null) : null,
    text,
  };
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key || key.startsWith('--')) {
    console.error('usage: npm run research:gosugamers -- <event-key> [--pages N] [--limit N] [--dump]');
    process.exit(1);
  }

  const maxPages = arg('pages', 8);
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
  console.log(`listings: ${LISTINGS.join(', ')}  (max ${maxPages} pages each)\n`);

  const robots = await checkRobots(`${ORIGIN}${LISTINGS[0]}`);
  if (!robots.allowed) throw new Error(`robots.txt disallows the listing path (${robots.rule}). Stopping.`);
  console.log(`robots.txt: allowed${robots.crawlDelaySeconds ? `, crawl-delay ${robots.crawlDelaySeconds}s` : ''}\n`);

  // ---- Collect candidate article URLs ----
  const candidates = new Set<string>();
  for (const listing of LISTINGS) {
    for (let page = 1; page <= maxPages; page++) {
      const url = `${ORIGIN}${listing}${page > 1 ? `?page=${page}` : ''}`;
      const response = await polite(url).catch(() => null);

      if (!response?.ok) {
        console.log(`  ${url} -> ${response?.status ?? 'network error'}; stopping this listing`);
        break;
      }
      const html = await response.text();

      if (process.argv.includes('--dump')) {
        await writeFile('gosugamers-page-dump.html', html, 'utf8');
        console.log('  wrote gosugamers-page-dump.html — inspect it and adjust findArticleLinks()');
        return;
      }

      const links = findArticleLinks(html);
      links.forEach((l) => candidates.add(l));
      console.log(`  ${url} -> ${links.length} article links (${candidates.size} unique so far)`);
      if (!links.length) break;
    }
  }

  if (!candidates.size) {
    throw new Error(
      'No article links found. The listing markup has probably changed — ' +
        're-run with --dump to see the HTML, then adjust findArticleLinks().',
    );
  }

  // ---- Fetch articles, keeping those inside the window ----
  const items: ResearchItem[] = [];
  let outsideWindow = 0;
  let thin = 0;

  for (const url of [...candidates].slice(0, maxArticles * 3)) {
    if (items.length >= maxArticles) break;

    const response = await polite(url).catch(() => null);
    if (!response?.ok) continue;

    const { title, published, text } = extractArticle(await response.text());

    if (text.length < 600) {
      thin++;
      continue;
    }
    if (published) {
      const date = new Date(published);
      if (date < windowFrom || date > windowTo) {
        outsideWindow++;
        continue;
      }
    }

    const id = url.split('/').pop() ?? String(items.length);
    const cachedPath = await cacheFullText(key, 'gosugamers', id, text);

    items.push({
      source: 'gosugamers',
      title: title ?? url,
      url,
      published,
      author: null,
      excerpt: excerpt(text),
      signals: { chars: text.length, dated: published ? 'yes' : 'no' },
      retrieved_at: new Date().toISOString(),
      cached_text_path: cachedPath,
    });

    console.log(`  ${items.length.toString().padStart(3)}  ${published ?? '????-??-??'}  ${(title ?? url).slice(0, 60)}`);
  }

  console.log(`\ncandidates: ${candidates.size} | kept: ${items.length} | outside window: ${outsideWindow} | too thin: ${thin}`);

  if (!items.length) {
    throw new Error(
      'Every article was rejected. Either the date window is wrong or extraction failed — ' +
        'nothing written, rather than writing an empty file that looks like a real result.',
    );
  }
  if (items.filter((i) => i.published).length < items.length / 2) {
    console.log('\n  WARNING: over half the articles have no publication date.');
    console.log('  Date filtering is therefore unreliable for this run — check before quoting.');
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
