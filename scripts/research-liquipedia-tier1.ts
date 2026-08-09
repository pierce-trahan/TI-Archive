/**
 * Pull one year's Tier 1 LAN tournaments straight off Liquipedia's own
 * "Tier 1 Tournaments" page: https://liquipedia.net/dota2/Tier_1_Tournaments
 *
 * That page already carries exactly what we need per year — tournament,
 * date, prize pool, location, winner (with logo), runner-up (with logo) —
 * classified by Liquipedia itself rather than by our own judgment call. Per
 * the owner: "I want to reflect the history of each year with the years
 * where the Major + Minors existed and the years where they went away from
 * that system" — pulling the tier straight from Liquipedia's own table for
 * that year is what makes that comparison honest instead of a guess.
 *
 *   npm run research:liquipedia -- ti08 2018
 *
 * The table is rendered by a Liquipedia Lua widget, not plain wikitext, so
 * this fetches the PARSED HTML (action=parse&prop=text) rather than
 * wikitext, then locates the year's own section and table.
 *
 * Liquipedia is blocked from this project's cloud dev sandbox, so — like
 * research-wayback.ts and research-gosugamers.ts — this has to run on a real
 * machine. Row parsing is a first pass against a page structure nobody on
 * this project has actually seen the HTML of yet; if it comes back with 0
 * rows, the cached HTML file it prints the path to has the real markup to
 * fix the regex against, the same way we iterated on the other two scripts.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { checkRobots } from './lib/robots.ts';
import { USER_AGENT } from './lib/http.ts';

const API = 'https://liquipedia.net/dota2/api.php';
const PAGE = 'Tier_1_Tournaments';
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

async function fetchRenderedHtml(page: string): Promise<string> {
  const url = `${API}?action=parse&page=${encodeURIComponent(page)}&prop=text&format=json`;
  const response = await polite(url);
  if (!response.ok) throw new Error(`${page} -> HTTP ${response.status}`);
  const json = (await response.json()) as { parse?: { text?: { '*': string } }; error?: { info: string } };
  if (json.error) throw new Error(`${page} -> API error: ${json.error.info}`);
  const html = json.parse?.text?.['*'];
  if (!html) throw new Error(`${page} -> no HTML in response`);
  return html;
}

/** Isolates the section for one year: from its heading to the next h2/h3 heading. */
function extractYearSection(html: string, year: string): string | null {
  const headingRe = new RegExp(`<h[23][^>]*>\\s*<span[^>]*id="${year}"[^>]*>[\\s\\S]*?</h[23]>`, 'i');
  const start = headingRe.exec(html);
  if (!start) return null;
  const from = start.index + start[0].length;
  const nextHeading = /<h[23][^>]*>/i.exec(html.slice(from));
  const to = nextHeading ? from + nextHeading.index : html.length;
  return html.slice(from, to);
}

const stripTags = (html: string): string =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

const absoluteUrl = (src: string): string => (src.startsWith('//') ? `https:${src}` : src);

interface TeamRef {
  name: string | null;
  logo_url: string | null;
}

/** A "winner" or "runner-up" cell: a team-icon image plus a linked team name. */
function extractTeamCell(cellHtml: string): TeamRef {
  const img = /<img[^>]+src="([^"]+)"[^>]*>/i.exec(cellHtml);
  // Prefer the link that isn't the image link itself (team name link, not "File:" link).
  const links = [...cellHtml.matchAll(/<a[^>]+href="[^"]*"[^>]*title="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  const nameLink = links.find((m) => !/^File:/i.test(m[1] ?? '') && stripTags(m[2] ?? '').trim());
  const name = nameLink ? stripTags(nameLink[2] ?? '') : stripTags(cellHtml) || null;
  return {
    name: name || null,
    logo_url: img ? absoluteUrl(img[1]!) : null,
  };
}

interface TierOneRow {
  tournament: string | null;
  tournament_url: string | null;
  date: string | null;
  prizepool: string | null;
  location: string | null;
  winner: TeamRef;
  runner_up: TeamRef;
  source_url: string;
  retrieved_at: string;
}

function parseRows(sectionHtml: string): TierOneRow[] {
  const rows: TierOneRow[] = [];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRe.exec(sectionHtml))) {
    const rowHtml = rowMatch[1]!;
    const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => m[1]!);
    if (cells.length < 5) continue; // header row or a malformed row

    const tournamentCell = cells[0] ?? '';
    const nameMatch = /<a[^>]+href="([^"]+)"[^>]*title="([^"]+)"[^>]*>/i.exec(tournamentCell);
    const tournament = nameMatch ? nameMatch[2]! : stripTags(tournamentCell) || null;
    const tournamentUrl = nameMatch ? `https://liquipedia.net${nameMatch[1]}` : null;

    rows.push({
      tournament,
      tournament_url: tournamentUrl,
      date: stripTags(cells[1] ?? '') || null,
      prizepool: stripTags(cells[2] ?? '') || null,
      location: stripTags(cells[3] ?? '') || null,
      winner: extractTeamCell(cells[5] ?? ''),
      runner_up: extractTeamCell(cells[6] ?? ''),
      source_url: `https://liquipedia.net/dota2/${PAGE}`,
      retrieved_at: new Date().toISOString(),
    });
  }
  return rows;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  const year = process.argv[3];
  if (!key || !year) {
    console.error('usage: npm run research:liquipedia -- <event-key> <year>');
    process.exit(1);
  }

  const robots = await checkRobots('https://liquipedia.net/');
  if (!robots.allowed) {
    throw new Error(`liquipedia.net robots.txt disallows this path (${robots.rule}). Stopping.`);
  }

  console.log(`fetching ${PAGE} (this is one big page — may take a moment)...`);
  const html = await fetchRenderedHtml(PAGE);

  const rawDir = fileURLToPath(new URL(`../data/raw/research/${key}/liquipedia/`, import.meta.url));
  await mkdir(rawDir, { recursive: true });
  const cachedPath = `${rawDir}${PAGE}.html`;
  await writeFile(cachedPath, html, 'utf8');
  console.log(`cached full page (gitignored) -> ${cachedPath}`);

  const section = extractYearSection(html, year);
  if (!section) {
    console.log(`\ncould not find a "${year}" heading in the page. Check ${cachedPath} for the real heading id/structure.`);
    process.exit(1);
  }

  const rows = parseRows(section);
  console.log(`\nparsed ${rows.length} row(s) for ${year}:\n`);
  for (const row of rows) {
    console.log(`  ${(row.date ?? '?').padEnd(22)} ${(row.tournament ?? '?').padEnd(28)} ${row.prizepool ?? '?'}`);
    console.log(`    winner: ${row.winner.name ?? '(not parsed)'}  logo: ${row.winner.logo_url ?? '(none)'}`);
    console.log(`    runner-up: ${row.runner_up.name ?? '(not parsed)'}`);
  }

  if (rows.length === 0) {
    console.log(
      `\n0 rows parsed even though the "${year}" section was found — the table markup doesn't match what this ` +
        `script expects. Paste a chunk of ${cachedPath} around the ${year} heading and I'll fix the row regex.`,
    );
  }

  const outDir = fileURLToPath(new URL('../data/research/', import.meta.url));
  await mkdir(outDir, { recursive: true });
  const outPath = `${outDir}${key}.liquipedia-tier1.json`;
  await writeFile(
    outPath,
    `${JSON.stringify(
      {
        _note:
          'Tier-1 tournament rows pulled from Liquipedia\'s own Tier_1_Tournaments page for the given ' +
          'year — tier classification, prize pool, winner, and logos are Liquipedia\'s, not inferred.',
        _generated_at: new Date().toISOString(),
        event: key,
        year,
        source_url: `https://liquipedia.net/dota2/${PAGE}`,
        rows,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  console.log(`\nwrote ${rows.length} row(s) -> ${outPath}`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
