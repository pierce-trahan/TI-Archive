/**
 * Per-tournament prize distributions for a season, and each team's earnings.
 *
 *   npm run ingest:prizes -- ti08
 *
 * The season chart records who won each event and its total pool. That is not
 * enough to say what a team earned: finishing 4th at a $1M Major is real money
 * and invisible in a winners-only view. This reads each tournament's prize
 * table and sums per team.
 *
 * RUN THIS LOCALLY — Liquipedia is unreachable from this project's cloud
 * session. Unlike the tier listings this uses `action=query` for wikitext,
 * which is bound by the ordinary 1-request-per-2s limit rather than
 * `action=parse`'s 30-second cap, so ~25 tournaments plus their prizepool
 * subpages runs in a couple of minutes.
 *
 * HOW LIQUIPEDIA STORES PRIZE MONEY, AND WHY THIS IS FIDDLY
 *
 * Three shapes, all present across one season:
 *
 *   1. A literal amount:            |usdprize=100000
 *   2. A percentage of the pool:    |percentprize=44   with the pool elsewhere
 *   3. A formula referencing a page variable, with the pool total transcluded
 *      from a subpage: |prizepoolusd={{:Event/prizepool}}
 *
 * Shape 3 is why `data/events/ti08.placements.json` records a multiplier and a
 * total rather than a bare figure — the page itself does not contain the
 * number. Where the total can be resolved, the amount is computed and both
 * inputs are recorded so any figure can be rechecked. Where it cannot, the
 * slot is reported unresolved and contributes nothing.
 *
 * NOTHING IS ESTIMATED. A tournament whose table cannot be read lowers a
 * team's known earnings and is listed as a gap, because "we could not read
 * this" and "they earned nothing here" must never look the same.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { fetchJsonCached } from './lib/http.ts';
import { findTemplates, parseTemplate, plainText } from './lib/wikitext.ts';

const API = 'https://liquipedia.net/dota2/api.php';
/** Their limit is 1 req / 2s. Sit comfortably outside it. */
const MIN_INTERVAL_MS = 2500;

export const ATTRIBUTION =
  'Tournament prize distributions from Liquipedia, licensed CC-BY-SA 3.0.';

interface WikiResponse {
  query?: {
    pages?: Record<
      string,
      { title?: string; missing?: string; revisions?: { slots: { main: { '*': string } } }[] }
    >;
  };
}

async function fetchWikitext(title: string, cacheDir: string): Promise<string | null> {
  const url =
    `${API}?action=query&prop=revisions&rvprop=content&rvslots=main&format=json` +
    `&titles=${encodeURIComponent(title)}`;
  const { data } = await fetchJsonCached<WikiResponse>(url, {
    cachePath: `${cacheDir}/liquipedia/prizes/${title.replace(/[^A-Za-z0-9]/g, '_')}.json`,
    minIntervalMs: MIN_INTERVAL_MS,
  });
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined) return null;
  return page.revisions?.[0]?.slots.main['*'] ?? null;
}

/** "$1,000,000" / "1000000" -> 1000000. Null when it isn't a plain number. */
function parseAmount(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,\s]/g, '').trim();
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * The pool total, which may be inline or transcluded from a subpage.
 * Mirrors the behaviour already proven in scripts/ingest-liquipedia.ts.
 */
async function resolvePoolTotal(
  wikitext: string,
  cacheDir: string,
): Promise<{ total: number; from: string } | null> {
  const transcluded = /prizepoolusd\s*=\s*\{\{:([^}]+)\}\}/.exec(wikitext)?.[1]?.trim();
  if (transcluded) {
    const raw = (await fetchWikitext(transcluded, cacheDir))?.trim();
    const total = parseAmount(raw);
    if (total) return { total, from: transcluded };
    return null;
  }
  const inline = parseAmount(/prizepoolusd\s*=\s*([^|\n}]+)/.exec(wikitext)?.[1]);
  if (inline) return { total: inline, from: 'inline prizepoolusd' };
  const pool = parseAmount(/\|\s*prizepool\s*=\s*([^|\n}]+)/.exec(wikitext)?.[1]);
  return pool ? { total: pool, from: 'inline prizepool' } : null;
}

interface SlotResult {
  place: string | null;
  teams: string[];
  prize_usd: number | null;
  /** How the figure was arrived at, so any number can be rechecked. */
  basis: string;
}

function parsePrizeTable(
  wikitext: string,
  pool: { total: number; from: string } | null,
): SlotResult[] {
  const results: SlotResult[] = [];

  for (const block of findTemplates(wikitext, 'TeamPrizePool')) {
    for (const value of block.positional) {
      if (!value.startsWith('{{')) continue;
      const slot = parseTemplate(value);
      if (slot.name.toLowerCase() !== 'slot') continue;

      const teams = findTemplates(slot.raw, 'Opponent')
        .map((o) => plainText(o.positional[0] ?? ''))
        .filter(Boolean);
      if (!teams.length) continue;

      const place = slot.named.get('place') ?? slot.named.get('freetext') ?? null;

      const literal = parseAmount(slot.named.get('usdprize'));
      if (literal != null) {
        results.push({ place, teams, prize_usd: literal, basis: 'usdprize, stated' });
        continue;
      }

      const percent = Number(slot.named.get('percentprize'));
      if (Number.isFinite(percent) && pool) {
        results.push({
          place,
          teams,
          prize_usd: Math.round((pool.total * percent) / 100),
          basis: `${percent}% of ${pool.total} (pool from ${pool.from})`,
        });
        continue;
      }

      // A formula referencing a page variable. Not evaluated — a guessed
      // multiplier is a fabricated payout.
      results.push({
        place,
        teams,
        prize_usd: null,
        basis: `unresolved: ${(slot.named.get('usdprize') ?? '(no usdprize)').slice(0, 60)}`,
      });
    }
  }
  return results;
}

interface TourRow {
  tournament: string | null;
  tournament_url: string | null;
  start_date: string | null;
  tier: number;
  row_classes: string | null;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run ingest:prizes -- <event-key>   (e.g. ti08)');
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

  const season = await read(`data/research/${key}.liquipedia-tournaments.json`);
  const rosters = await read(`data/events/${key}.rosters.json`);
  const aliasFile = (await read('data/entities/team-aliases.json', true)) ?? {};

  const alias = new Map<string, string>();
  for (const a of aliasFile.aliases ?? []) {
    alias.set(a.canonical.toLowerCase(), a.canonical);
    for (const other of a.also_known_as) alias.set(other.toLowerCase(), a.canonical);
  }
  const canon = (n: string): string => alias.get(n.toLowerCase().trim()) ?? n.trim();

  const attending = new Set<string>(
    (rosters.teams ?? rosters.rosters ?? []).map((t: { team_name: string }) => canon(t.team_name)),
  );

  const cacheDir = fileURLToPath(new URL(`../data/raw/${key}`, import.meta.url));
  const rows = (season.rows ?? []) as TourRow[];

  console.log(`${rows.length} season tournament(s)`);
  console.log('note: ~2 requests each at 2.5s — a couple of minutes.\n');

  const perTournament: {
    tournament: string | null;
    start_date: string | null;
    is_the_international: boolean;
    page: string | null;
    pool_total: number | null;
    slots: SlotResult[];
    unresolved: number;
  }[] = [];

  for (const row of rows) {
    const page = row.tournament_url
      ? decodeURIComponent(new URL(row.tournament_url).pathname.replace(/^\/dota2\//, ''))
      : null;
    if (!page) {
      console.log(`  ${row.tournament}: no page URL — skipped`);
      continue;
    }

    const wikitext = await fetchWikitext(page, cacheDir);
    if (!wikitext) {
      console.log(`  ${row.tournament}: page not found (${page})`);
      perTournament.push({
        tournament: row.tournament,
        start_date: row.start_date,
        is_the_international: /^The International/i.test(row.tournament ?? ''),
        page,
        pool_total: null,
        slots: [],
        unresolved: 0,
      });
      continue;
    }

    const pool = await resolvePoolTotal(wikitext, cacheDir);
    const slots = parsePrizeTable(wikitext, pool);
    const unresolved = slots.filter((s) => s.prize_usd == null).length;
    perTournament.push({
      tournament: row.tournament,
      start_date: row.start_date,
      is_the_international: /^The International/i.test(row.tournament ?? ''),
      page,
      pool_total: pool?.total ?? null,
      slots,
      unresolved,
    });

    const paid = slots.length - unresolved;
    console.log(
      `  ${(row.tournament ?? '?').padEnd(38)} ${String(slots.length).padStart(2)} slots, ` +
        `${paid} priced${unresolved ? `, ${unresolved} UNRESOLVED` : ''}` +
        `${pool ? '' : '  (no pool total)'}`,
    );
  }

  // ---- Aggregate per team ----
  interface Earnings {
    season_usd: number;
    ti_usd: number;
    events_counted: number;
    events_unpriced: string[];
  }
  const byTeam = new Map<string, Earnings>();
  for (const t of perTournament) {
    for (const slot of t.slots) {
      for (const raw of slot.teams) {
        const team = canon(raw);
        if (!attending.has(team)) continue; // only teams that reached this TI
        const entry =
          byTeam.get(team) ?? { season_usd: 0, ti_usd: 0, events_counted: 0, events_unpriced: [] };
        if (slot.prize_usd == null) {
          entry.events_unpriced.push(t.tournament ?? t.page ?? '?');
        } else {
          // Verified, not assumed: a shared slot states the PER-TEAM amount.
          // TI8's 5th-6th slot is 4.5% each, and summing every slot's amount
          // times its team count reaches $25,532,235 against a real pool of
          // $25,532,177 — a $58 rounding gap across 18 slots. Treating these
          // as a shared pot to divide would halve the pairs and undercount.
          if (t.is_the_international) entry.ti_usd += slot.prize_usd;
          else entry.season_usd += slot.prize_usd;
          entry.events_counted += 1;
        }
        byTeam.set(team, entry);
      }
    }
  }

  const outPath = fileURLToPath(new URL(`../data/research/${key}.season-earnings.json`, import.meta.url));
  await mkdir(fileURLToPath(new URL('../data/research/', import.meta.url)), { recursive: true });
  await writeFile(
    outPath,
    `${JSON.stringify(
      {
        _note:
          'Per-tournament prize distributions for the season, and the resulting earnings for each ' +
          'team that reached this International. season_usd EXCLUDES The International; ti_usd is ' +
          'that event alone. Amounts are Liquipedia\'s stated figures, or a stated percentage of a ' +
          'resolved pool total — every one carries the basis it was derived from. Slots whose ' +
          'wikitext holds an unevaluated formula are left null and listed in events_unpriced: a ' +
          'team missing an event there has UNKNOWN earnings for it, not zero.',
        _attribution: ATTRIBUTION,
        _generated_by: 'scripts/ingest-season-prizes.ts',
        _generated_at: new Date().toISOString(),
        event: key,
        tournaments_read: perTournament.length,
        tournaments: perTournament,
        teams: [...byTeam.entries()]
          .map(([team, e]) => ({ team, ...e, total_usd: e.season_usd + e.ti_usd }))
          .sort((a, b) => b.total_usd - a.total_usd),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`\nearnings for ${byTeam.size} of ${attending.size} attending teams:\n`);
  const sorted = [...byTeam.entries()].sort(
    (a, b) => b[1].season_usd + b[1].ti_usd - (a[1].season_usd + a[1].ti_usd),
  );
  for (const [team, e] of sorted) {
    const gaps = e.events_unpriced.length ? `  (${e.events_unpriced.length} event(s) unpriced)` : '';
    console.log(
      `  ${team.padEnd(18)} season $${e.season_usd.toLocaleString('en-US').padStart(10)}  ` +
        `+ TI $${e.ti_usd.toLocaleString('en-US').padStart(11)}${gaps}`,
    );
  }

  const totalUnresolved = perTournament.reduce((n, t) => n + t.unresolved, 0);
  if (totalUnresolved) {
    console.log(`\n${totalUnresolved} prize slot(s) could not be resolved across the season:`);
    for (const t of perTournament.filter((x) => x.unresolved)) {
      console.log(`  ${t.tournament}: ${t.unresolved} slot(s)`);
      const example = t.slots.find((s) => s.prize_usd == null);
      if (example) console.log(`      e.g. ${example.basis}`);
    }
    console.log('  These are gaps, not zeroes. Paste this and the parser can be extended.');
  }
  console.log(`\nwrote ${outPath}`);
  console.log(`\n${ATTRIBUTION}`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
