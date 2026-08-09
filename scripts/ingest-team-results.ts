/**
 * Season earnings, read from each team's own Liquipedia Results page.
 *
 *   npm run ingest:results -- ti08
 *
 * Liquipedia keeps a per-team results table — date, placement, tier,
 * tournament, and prize — at e.g. https://liquipedia.net/dota2/OG/Results.
 * One page per team answers "what did they earn this season" directly.
 *
 * WHY THIS RATHER THAN READING EVERY TOURNAMENT'S PRIZE TABLE
 *
 * The obvious route is to walk the season's ~25 tournament pages and parse
 * each prize pool. That works, and scripts/ingest-season-prizes.ts does it,
 * but it is the worse tool for this job: three times the requests, and it
 * inherits Liquipedia's habit of storing a prize as a formula referencing a
 * page variable, which cannot be evaluated and has to be reported as a gap.
 *
 * A team's results table has already resolved every figure to a literal
 * amount. Fewer requests, no formulas, and the aggregation is the page's own
 * subject rather than something reassembled from 25 sources.
 *
 * The tournament route keeps one advantage — it sees every team paid at an
 * event, not just the ones that reached this TI — so it stays for when a
 * complete per-event distribution is wanted. It is not the earnings path.
 *
 * RUN THIS LOCALLY. Liquipedia is unreachable from this project's cloud
 * session. The results table is LPDB-generated and absent from the page's
 * wikitext, so this needs `action=parse` and its 1-per-30s cap: about nine
 * minutes for eighteen teams, once, then cached.
 *
 * WHOSE MONEY IS THIS
 *
 * A Results page belongs to the ORGANISATION. A team that replaced three
 * players mid-season still shows one continuous earnings history. For "what
 * did this team win during the season" that is the right reading, but it is a
 * choice: the money is the org's, not that specific five.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { fetchJsonCached } from './lib/http.ts';

const API = 'https://liquipedia.net/dota2/api.php';
/** action=parse is capped far harder than ordinary queries. */
const PARSE_INTERVAL_MS = 30_000;

export const ATTRIBUTION = 'Team results and prize data from Liquipedia, licensed CC-BY-SA 3.0.';

interface ParseResponse {
  parse?: { text?: { '*': string } };
  error?: { info: string; code?: string };
}

async function fetchRendered(page: string, cacheDir: string): Promise<string | null> {
  const url = `${API}?action=parse&page=${encodeURIComponent(page)}&prop=text&format=json`;
  const { data, cached } = await fetchJsonCached<ParseResponse>(url, {
    cachePath: `${cacheDir}/liquipedia/results/${page.replace(/[^A-Za-z0-9]/g, '_')}.json`,
    minIntervalMs: PARSE_INTERVAL_MS,
  });
  if (data.error) return null;
  const html = data.parse?.text?.['*'];
  if (html) process.stdout.write(cached ? ' (cached)' : ' (fetched)');
  return html ?? null;
}

const decodeEntities = (t: string): string =>
  t
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, c: string) => String.fromCharCode(Number(c)))
    .replace(/&amp;/g, '&');

const stripTags = (html: string): string =>
  decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/** "$1,151,000" -> 1151000. Null for "-", "TBD", or a non-USD figure. */
function parsePrize(text: string): number | null {
  const match = /^\$\s*([\d,]+)/.exec(text.trim());
  if (!match) return null;
  const value = Number(match[1]!.replace(/,/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
}

interface ResultRow {
  date: string | null;
  place: string | null;
  tier: string | null;
  tournament: string | null;
  tournament_url: string | null;
  prize_usd: number | null;
  prize_displayed: string | null;
}

/**
 * Rows from a rendered Results table.
 *
 * Columns observed: Date | Place | Tier | (icon) | Tournament | Result | Prize.
 * The tournament cell is matched by its link rather than by position, because
 * an icon column shifts the index and that is exactly the off-by-one that put
 * participant counts in a winner column earlier in this project.
 */
function parseResultRows(html: string): ResultRow[] {
  const rows: ResultRow[] = [];

  for (const rowMatch of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const rowHtml = rowMatch[1]!;
    const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => m[1]!);
    if (cells.length < 5) continue;

    const text = cells.map(stripTags);
    const date = text.find((t) => /^\d{4}-\d{2}-\d{2}$/.test(t)) ?? null;
    if (!date) continue; // header, year divider, or a layout row

    // The tournament is a linked cell — but so is the Tier column, which comes
    // first and would win a naive "first link" scan, and so is the opponent in
    // the Result column. Skip the tier links; the tournament is then the first
    // link remaining, ahead of the opponent.
    let tournament: string | null = null;
    let tournamentUrl: string | null = null;
    for (const cell of cells) {
      const link = /<a[^>]+href="(\/dota2\/[^"#?]+)"[^>]*title="([^"]+)"/i.exec(cell);
      if (!link) continue;
      const title = decodeEntities(link[2]!);
      if (/_Tournaments?$/i.test(link[1]!) || /^(Tier \d|Qualifier|Monthly|Weekly|Showmatch|National)$/i.test(title)) {
        continue;
      }
      tournament = title;
      tournamentUrl = `https://liquipedia.net${link[1]}`;
      break;
    }

    const prizeCell = [...text].reverse().find((t) => /^\$|^-$|^–$/.test(t.trim())) ?? null;
    // Ordinal suffix required: a bare "digits - digits" test also matches the
    // ISO date sitting two cells to the left.
    const place = text.find((t) => /^\d+(st|nd|rd|th)\b/i.test(t)) ?? null;
    const tier = text.find((t) => /^(Tier \d|Qualifier|Monthly|Weekly|Showmatch|National)/i.test(t)) ?? null;

    rows.push({
      date,
      place,
      tier,
      tournament,
      tournament_url: tournamentUrl,
      prize_usd: prizeCell ? parsePrize(prizeCell) : null,
      prize_displayed: prizeCell,
    });
  }
  return rows;
}

/** Liquipedia page title for a team, from an override file or its name. */
function pageTitleFor(team: string, overrides: Record<string, string>): string {
  return overrides[team] ?? team.replace(/ /g, '_');
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run ingest:results -- <event-key>   (e.g. ti08)');
    process.exit(1);
  }
  const read = async (p: string, optional = false): Promise<any> => {
    try {
      return JSON.parse(await readFile(fileURLToPath(new URL(`../${p}`, import.meta.url)), 'utf8'));
    } catch (error) {
      if (optional) return null;
      throw new Error(`could not read ${p}: ${(error as Error).message}`);
    }
  };

  const rosters = await read(`data/events/${key}.rosters.json`);
  const season = await read(`data/research/${key}.liquipedia-tournaments.json`);
  const keysFile = (await read('data/entities/team-liquipedia-pages.json', true)) ?? {};
  const overrides: Record<string, string> = keysFile.pages ?? {};

  const teams: string[] = (rosters.teams ?? rosters.rosters ?? []).map(
    (t: { team_name: string }) => t.team_name,
  );

  // The season runs from the previous TI to this one; both bounds already
  // computed and recorded when the tier listings were pulled.
  const from = season.season_window?.from_exclusive ?? null;
  const to = season.season_window?.to_inclusive ?? null;
  if (!from || !to) throw new Error('season_window missing — re-run research:liquipedia first.');

  const cacheDir = fileURLToPath(new URL(`../data/raw/${key}`, import.meta.url));
  console.log(`${teams.length} teams | season window ${from} -> ${to}`);
  console.log(`note: action=parse is 1 request / 30s, so a cold run is ~${Math.ceil((teams.length * 30) / 60)} minutes.\n`);

  const perTeam: {
    team: string;
    page: string;
    found: boolean;
    season_usd: number;
    ti_usd: number;
    rows_in_window: ResultRow[];
    unpriced: ResultRow[];
  }[] = [];
  const missingPages: string[] = [];

  for (const team of teams) {
    const page = `${pageTitleFor(team, overrides)}/Results`;
    process.stdout.write(`  ${team.padEnd(18)}`);
    const html = await fetchRendered(page, cacheDir);

    if (!html) {
      console.log(`  PAGE NOT FOUND (${page})`);
      missingPages.push(team);
      perTeam.push({ team, page, found: false, season_usd: 0, ti_usd: 0, rows_in_window: [], unpriced: [] });
      continue;
    }

    const all = parseResultRows(html);
    const inWindow = all.filter((r) => r.date && r.date > from && r.date <= to);
    const isTi = (r: ResultRow) => /^The International/i.test(r.tournament ?? '');

    const seasonUsd = inWindow
      .filter((r) => !isTi(r))
      .reduce((sum, r) => sum + (r.prize_usd ?? 0), 0);
    const tiUsd = inWindow.filter(isTi).reduce((sum, r) => sum + (r.prize_usd ?? 0), 0);
    // A dash means no prize, which is a fact. A figure we could not read is a gap.
    const unpriced = inWindow.filter(
      (r) => r.prize_usd == null && r.prize_displayed && !/^[-–]$/.test(r.prize_displayed.trim()),
    );

    perTeam.push({ team, page, found: true, season_usd: seasonUsd, ti_usd: tiUsd, rows_in_window: inWindow, unpriced });
    console.log(
      `  ${String(all.length).padStart(3)} rows, ${String(inWindow.length).padStart(2)} in window` +
        `  season $${seasonUsd.toLocaleString('en-US')}${unpriced.length ? `  ${unpriced.length} UNPRICED` : ''}`,
    );
  }

  const outPath = fileURLToPath(new URL(`../data/research/${key}.season-earnings.json`, import.meta.url));
  await writeFile(
    outPath,
    `${JSON.stringify(
      {
        _note:
          "Season earnings per team, read from each team's own Liquipedia Results page. " +
          'season_usd covers the window between the previous International and this one and ' +
          'EXCLUDES The International itself; ti_usd is that event alone. Figures are Liquipedia\'s ' +
          'stated amounts, not derived. A row showing "-" earned nothing and counts as zero; a row ' +
          'whose amount could not be read is listed in `unpriced` and counts as nothing at all, ' +
          'because unknown and zero must not look the same.',
        _whose_money:
          'A Results page belongs to the organisation, so a team that changed players mid-season ' +
          'still shows one continuous history. The money is the org\'s, not that specific five.',
        _attribution: ATTRIBUTION,
        _generated_by: 'scripts/ingest-team-results.ts',
        _generated_at: new Date().toISOString(),
        event: key,
        season_window: { from_exclusive: from, to_inclusive: to },
        teams: perTeam
          .map((t) => ({ ...t, total_usd: t.season_usd + t.ti_usd }))
          .sort((a, b) => b.total_usd - a.total_usd),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log('\nseason earnings (excluding TI) + TI:\n');
  for (const t of [...perTeam].sort((a, b) => b.season_usd + b.ti_usd - (a.season_usd + a.ti_usd))) {
    if (!t.found) continue;
    console.log(
      `  ${t.team.padEnd(18)} $${t.season_usd.toLocaleString('en-US').padStart(10)}` +
        ` — TI ($${(t.season_usd + t.ti_usd).toLocaleString('en-US').padStart(11)} + TI)`,
    );
  }

  if (missingPages.length) {
    console.log(`\n${missingPages.length} team page(s) not found. Add the real titles to`);
    console.log('data/entities/team-liquipedia-pages.json and re-run — only those will be fetched:');
    for (const t of missingPages) console.log(`  "${t}": "Real_Page_Title"`);
  }
  const anyUnpriced = perTeam.filter((t) => t.unpriced.length);
  if (anyUnpriced.length) {
    console.log(`\nrows with an unreadable prize (gaps, not zeroes):`);
    for (const t of anyUnpriced) {
      for (const r of t.unpriced) console.log(`  ${t.team}: ${r.tournament} — "${r.prize_displayed}"`);
    }
  }
  console.log(`\nwrote ${outPath}`);
  console.log(`\n${ATTRIBUTION}`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
