/**
 * Pull season-level tier-1 tournament data from Liquipedia: which LAN events
 * counted as Tier 1 that year, when they ran, what the prize pool was, and
 * who won — plus the winning team's real logo, fetched off their own team
 * page rather than guessed from a CDN path pattern (see CLAUDE.md's "never
 * invent data" section for why that guessing pattern is explicitly banned).
 *
 *   npm run research:liquipedia -- ti08 "Dota_Asia_Championships/2018,EPICENTER/2018,MDL/2018/Changsha,ESL_One/Birmingham/2018,China_Dota2_Supermajor,GESC/2018/Thailand"
 *
 * Liquipedia is reachable from a real machine but blocked from this project's
 * cloud dev sandbox, so this is a "run it yourself" script like
 * research-wayback.ts and research-gosugamers.ts. Page titles are a starting
 * guess based on Liquipedia's usual naming convention for these events — if
 * one 404s, the script says so plainly rather than silently skipping it, and
 * the fix is to look up the real title on liquipedia.net and pass it again.
 *
 * This is a first pass at the parser. Liquipedia's wikitext markup for prize
 * pool tables has changed over the years and isn't fully predictable without
 * seeing real output, so where the winner or logo can't be confidently
 * parsed, the script prints the raw wikitext section instead of guessing —
 * read it and tell me what's there, the same way we fixed the GosuGamers and
 * JoinDota scripts against real output earlier.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { checkRobots } from './lib/robots.ts';
import { USER_AGENT } from './lib/http.ts';

const API = 'https://liquipedia.net/dota2/api.php';
/** Liquipedia's API terms ask for at least 2s between requests per client. */
const MIN_INTERVAL_MS = 2000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastRequest = 0;

async function polite(url: string): Promise<Response> {
  const wait = lastRequest + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
  return fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    signal: AbortSignal.timeout(30_000),
  });
}

async function fetchWikitext(page: string): Promise<string | null> {
  const url = `${API}?action=parse&page=${encodeURIComponent(page)}&prop=wikitext&format=json`;
  const response = await polite(url);
  if (!response.ok) {
    console.log(`  [${page}] HTTP ${response.status} — page title is probably wrong, check on liquipedia.net`);
    return null;
  }
  const json = (await response.json()) as { parse?: { wikitext?: { '*': string } }; error?: { info: string } };
  if (json.error) {
    console.log(`  [${page}] API error: ${json.error.info}`);
    return null;
  }
  return json.parse?.wikitext?.['*'] ?? null;
}

async function fetchImageUrl(fileName: string): Promise<string | null> {
  const title = fileName.startsWith('File:') ? fileName : `File:${fileName}`;
  const url = `${API}?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&format=json`;
  const response = await polite(url);
  if (!response.ok) return null;
  const json = (await response.json()) as {
    query?: { pages?: Record<string, { imageinfo?: { url: string }[] }> };
  };
  const pages = json.query?.pages ?? {};
  for (const page of Object.values(pages)) {
    const found = page.imageinfo?.[0]?.url;
    if (found) return found;
  }
  return null;
}

function field(wikitext: string, name: string): string | null {
  const match = new RegExp(`\\|\\s*${name}\\s*=\\s*([^|\\n]+)`, 'i').exec(wikitext);
  return match?.[1]?.trim() || null;
}

interface TierOneEvent {
  page: string;
  name: string | null;
  tier: string | null;
  start_date: string | null;
  end_date: string | null;
  prizepool_total: string | null;
  winner: string | null;
  winner_logo_url: string | null;
  source_url: string;
  retrieved_at: string;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  const pagesArg = process.argv[3];
  if (!key || !pagesArg) {
    console.error(
      'usage: npm run research:liquipedia -- <event-key> "<comma,separated,liquipedia,page,titles>"',
    );
    process.exit(1);
  }
  const pages = pagesArg.split(',').map((p) => p.trim()).filter(Boolean);

  const robots = await checkRobots('https://liquipedia.net/');
  if (!robots.allowed) {
    throw new Error(`liquipedia.net robots.txt disallows this path (${robots.rule}). Stopping.`);
  }

  const rawDir = fileURLToPath(new URL(`../data/raw/research/${key}/liquipedia/`, import.meta.url));
  await mkdir(rawDir, { recursive: true });

  const results: TierOneEvent[] = [];

  for (const page of pages) {
    console.log(`\n=== ${page} ===`);
    const wikitext = await fetchWikitext(page);
    if (!wikitext) continue;

    await writeFile(`${rawDir}${page.replace(/\//g, '_')}.wikitext`, wikitext, 'utf8');

    const tier = field(wikitext, 'liquipediatier');
    const name = field(wikitext, 'name');
    const start = field(wikitext, 'sdate') ?? field(wikitext, 'date');
    const end = field(wikitext, 'edate');
    const prizepool = field(wikitext, 'prizepool') ?? field(wikitext, 'prizepoolusd');
    const winnerField = field(wikitext, 'winner');

    console.log(`  tier: ${tier ?? '(not found)'}`);
    console.log(`  name: ${name ?? '(not found)'}`);
    console.log(`  dates: ${start ?? '?'} -> ${end ?? '?'}`);
    console.log(`  prizepool field: ${prizepool ?? '(not found)'}`);

    let winner = winnerField;
    if (!winner) {
      // Winner usually isn't in the infobox — it's the first-place row of the
      // prize pool table. Print the neighborhood of "place=1" so a human (or
      // the next iteration of this script, once we see real markup) can read
      // off the actual team name instead of guessing at a template shape.
      const placeOne = /place\s*=\s*1\b[\s\S]{0,300}/i.exec(wikitext);
      if (placeOne) {
        console.log('  could not auto-parse winner. Raw context around "place=1":');
        console.log(`    ${placeOne[0].replace(/\n/g, ' ').slice(0, 280)}`);
      } else {
        console.log('  could not auto-parse winner, and no "place=1" pattern found either.');
      }
    } else {
      console.log(`  winner (from infobox): ${winner}`);
    }

    let logoUrl: string | null = null;
    if (winner) {
      const teamWikitext = await fetchWikitext(winner);
      if (teamWikitext) {
        const image = field(teamWikitext, 'image');
        if (image) {
          logoUrl = await fetchImageUrl(image);
          console.log(`  winner logo: ${logoUrl ?? '(image field found but URL lookup failed: ' + image + ')'}`);
        } else {
          console.log(`  winner's team page has no |image= field found`);
        }
      }
    }

    results.push({
      page,
      name,
      tier,
      start_date: start,
      end_date: end,
      prizepool_total: prizepool,
      winner,
      winner_logo_url: logoUrl,
      source_url: `https://liquipedia.net/dota2/${page}`,
      retrieved_at: new Date().toISOString(),
    });
  }

  const outDir = fileURLToPath(new URL('../data/research/', import.meta.url));
  await mkdir(outDir, { recursive: true });
  const outPath = `${outDir}${key}.liquipedia-tier1.json`;
  await writeFile(
    outPath,
    `${JSON.stringify(
      {
        _note:
          'Tier-1 LAN season data pulled from Liquipedia infoboxes. Fields left null were not ' +
          'auto-parseable from the wikitext on this pass — check the raw wikitext cached under ' +
          'data/raw/research/<event>/liquipedia/ before filling them in by hand.',
        _generated_at: new Date().toISOString(),
        event: key,
        events: results,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`\nwrote ${results.length} event records -> ${outPath}`);
  console.log(`raw wikitext cached (gitignored) -> ${rawDir}`);
  const incomplete = results.filter((r) => !r.winner || !r.winner_logo_url);
  if (incomplete.length) {
    console.log(
      `\n${incomplete.length}/${results.length} events are missing a winner and/or logo. Paste this ` +
        `script's output back and I'll fix the parser against the real wikitext, same as we did for GosuGamers.`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
