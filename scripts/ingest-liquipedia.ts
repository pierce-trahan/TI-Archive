/**
 * Pull an event's rosters, qualification paths and placements from Liquipedia.
 *
 *   npm run ingest:liquipedia -- ti08
 *
 * Output is a *proposal*, not truth: data/proposals/<event>.liquipedia.json.
 * Nothing here promotes itself into data/entities/. A separate step joins these
 * proposals to OpenDota account_ids and queues whatever is ambiguous.
 *
 * Terms of use (https://liquipedia.net/api-terms-of-use), all observed here:
 *   - MediaWiki API only. Automated access to rendered HTML pages is forbidden.
 *   - Max 1 request per 2 seconds; action=parse max 1 per 30s (we do not use it).
 *   - Custom User-Agent identifying the project, with contact information.
 *   - Client must accept gzip. Undici does this automatically.
 *   - Cache results and do not re-request the same data. data/raw/ does this.
 *   - Content is CC-BY-SA 3.0 and MUST be attributed wherever it is displayed.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { fetchJsonCached } from './lib/http.ts';
import { findTemplates, parseTemplate, plainText } from './lib/wikitext.ts';
import { loadEvent } from './lib/events.ts';

const API = 'https://liquipedia.net/dota2/api.php';
/** Their limit is 1 req / 2s. Sit comfortably outside it. */
const MIN_INTERVAL_MS = 2500;

export const ATTRIBUTION =
  'Roster, qualification and placement data from Liquipedia, licensed CC-BY-SA 3.0.';

interface ProposedPlayer {
  /** Liquipedia's handle AS OF this event — the value we actually want. */
  handle: string;
  /** Wiki page name when it differs from the handle (e.g. No[o]ne -> Noone). */
  page: string | null;
  /** "1".."5" for positions, or "coach". */
  role: string;
}

interface ProposedTeam {
  team_name: string;
  players: ProposedPlayer[];
  coach: string | null;
  qualification: {
    method: string | null;
    via: string | null;
    placement: string | null;
  } | null;
}

interface ProposedPlacement {
  /** 1-based index of the prize slot, not a resolved rank. */
  slot: number;
  prize_share: string | null;
  /** Left unresolved: the wikitext holds a formula, not a number. */
  prize_usd_expression: string | null;
  teams: { tag: string; last_vs: string | null; last_score: string | null }[];
}

interface WikiResponse {
  query?: {
    pages?: Record<
      string,
      { title?: string; missing?: string; revisions?: { slots: { main: { '*': string } } }[] }
    >;
  };
}

async function fetchWikitext(title: string, cacheDir: string): Promise<string> {
  const url =
    `${API}?action=query&prop=revisions&rvprop=content&rvslots=main&format=json` +
    `&titles=${encodeURIComponent(title)}`;

  const { data } = await fetchJsonCached<WikiResponse>(url, {
    cachePath: `${cacheDir}/liquipedia/${title.replace(/[^A-Za-z0-9]/g, '_')}.json`,
    minIntervalMs: MIN_INTERVAL_MS,
  });

  const pages = data.query?.pages ?? {};
  const page = Object.values(pages)[0];
  if (!page || page.missing !== undefined || !page.revisions?.[0]) {
    throw new Error(`Liquipedia page not found: ${title}`);
  }
  return page.revisions[0].slots.main['*'];
}

/**
 * The prize pool total is transcluded from a subpage (`{{:.../prizepool}}`)
 * rather than written inline, so the per-slot `{{#expr:}}` formulas reference
 * a variable this page never states. Fetch the subpage and we have the real
 * input; without it the formulas are unevaluable and the amounts stay unknown.
 */
async function fetchPrizePool(
  wikitext: string,
  cacheDir: string,
): Promise<{ total_usd: number; source_page: string; raw: string } | null> {
  const match = /prizepoolusd\s*=\s*\{\{:([^}]+)\}\}/.exec(wikitext);
  if (!match?.[1]) return null;

  const page = match[1].trim();
  const raw = (await fetchWikitext(page, cacheDir)).trim();

  // Expect a bare formatted number such as "25,532,177".
  const total = Number(raw.replace(/,/g, ''));
  if (!Number.isFinite(total) || total <= 0) return null;

  return { total_usd: total, source_page: page, raw };
}

function parseParticipants(wikitext: string): ProposedTeam[] {
  const blocks = findTemplates(wikitext, 'TeamParticipants');
  const teams: ProposedTeam[] = [];

  for (const block of blocks) {
    for (const value of block.positional) {
      if (!value.startsWith('{{')) continue;
      const opponent = parseTemplate(value);
      if (opponent.name.toLowerCase() !== 'opponent') continue;

      const teamName = plainText(opponent.positional[0] ?? '');
      if (!teamName) continue;

      const players: ProposedPlayer[] = [];
      let coach: string | null = null;

      const personsRaw = opponent.named.get('players');
      if (personsRaw) {
        for (const person of findTemplates(personsRaw, 'Person')) {
          const role = person.named.get('role') ?? '';
          const handle = plainText(person.positional[0] ?? '');
          if (!handle) continue;
          if (role === 'coach') {
            coach = handle;
            continue;
          }
          players.push({ handle, page: person.named.get('link') ?? null, role });
        }
      }

      let qualification: ProposedTeam['qualification'] = null;
      const qualRaw = opponent.named.get('qualification');
      if (qualRaw) {
        const qual = findTemplates(qualRaw, 'Qualification')[0];
        if (qual) {
          qualification = {
            method: qual.named.get('method') ?? null,
            via: qual.named.get('text') ?? qual.named.get('page') ?? null,
            placement: qual.named.get('placement') ?? null,
          };
        }
      }

      teams.push({ team_name: teamName, players, coach, qualification });
    }
  }
  return teams;
}

function parsePrizePool(wikitext: string): ProposedPlacement[] {
  const blocks = findTemplates(wikitext, 'TeamPrizePool');
  const placements: ProposedPlacement[] = [];
  let slot = 0;

  for (const block of blocks) {
    for (const value of block.positional) {
      if (!value.startsWith('{{')) continue;
      const slotTemplate = parseTemplate(value);
      if (slotTemplate.name.toLowerCase() !== 'slot') continue;
      slot++;

      const teams = findTemplates(slotTemplate.raw, 'Opponent').map((opponent) => ({
        tag: plainText(opponent.positional[0] ?? ''),
        last_vs: opponent.named.get('lastvs') ?? null,
        last_score: opponent.named.get('lastvsscore') ?? null,
      }));

      placements.push({
        slot,
        prize_share: slotTemplate.named.get('freetext') ?? null,
        // Deliberately unresolved — the wikitext holds a formula referencing a
        // page variable, and evaluating it here would be a guess.
        prize_usd_expression: slotTemplate.named.get('usdprize') ?? null,
        teams,
      });
    }
  }
  return placements;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run ingest:liquipedia -- <event-key>   (e.g. ti08)');
    process.exit(1);
  }

  const event = await loadEvent(key);
  const cacheDir = new URL(`../data/raw/${key}`, import.meta.url).pathname;
  const outDir = new URL(`../data/proposals`, import.meta.url).pathname;

  const title = new URL(event.source_url).pathname.replace(/^\/dota2\//, '').replace(/_/g, ' ');
  console.log(`${event.name}`);
  console.log(`liquipedia page: ${title}\n`);

  const wikitext = await fetchWikitext(title, cacheDir);
  console.log(`wikitext: ${wikitext.length} chars`);

  const teams = parseParticipants(wikitext);
  const placements = parsePrizePool(wikitext);
  const prizePool = await fetchPrizePool(wikitext, cacheDir);

  await mkdir(outDir, { recursive: true });
  const outPath = `${outDir}/${key}.liquipedia.json`;
  await writeFile(
    outPath,
    JSON.stringify(
      {
        _generated_by: 'scripts/ingest-liquipedia.ts',
        _generated_at: new Date().toISOString(),
        _status: 'PROPOSAL — not authoritative. Join to account_ids and confirm before use.',
        _attribution: ATTRIBUTION,
        _source: { type: 'url', url: event.source_url, retrieved_at: new Date().toISOString() },
        event: key,
        team_count: teams.length,
        prize_pool: prizePool,
        teams,
        placements,
      },
      null,
      2,
    ),
    'utf8',
  );

  // ---- Report ----
  console.log(`\nteams parsed: ${teams.length}`);
  const badRosters = teams.filter((t) => t.players.length !== 5);
  const noQual = teams.filter((t) => !t.qualification);

  console.log(`teams without exactly 5 players: ${badRosters.length}`);
  console.log(`teams without a qualification path: ${noQual.length}`);
  console.log(`prize slots parsed: ${placements.length}`);
  console.log(
    prizePool
      ? `prize pool total: $${prizePool.total_usd.toLocaleString('en-US')} (from ${prizePool.source_page})\n`
      : 'prize pool total: NOT FOUND — per-slot amounts cannot be computed\n',
  );

  for (const team of teams) {
    const roster = team.players
      .sort((a, b) => a.role.localeCompare(b.role))
      .map((p) => `${p.role}:${p.handle}`)
      .join('  ');
    const qual = team.qualification
      ? `${team.qualification.method}${team.qualification.placement ? ` #${team.qualification.placement}` : ''}`
      : 'NO QUALIFICATION DATA';
    console.log(`  ${team.team_name}`);
    console.log(`      ${roster}`);
    console.log(`      coach: ${team.coach ?? '—'}   via: ${qual}`);
  }

  console.log(`\nwrote ${outPath}`);
  console.log(`\n${ATTRIBUTION}`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
