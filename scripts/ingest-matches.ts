/**
 * Pull every match for one event from OpenDota and write a match index.
 *
 *   npm run ingest:matches -- ti08
 *
 * Raw API responses are cached under data/raw/ (gitignored) so re-runs are
 * free. The committed output is data/computed/<event>/matches.index.json.
 *
 * This script derives nothing it cannot observe. Where a value is absent from
 * the API it is written as null, never inferred.
 */

import { fileURLToPath } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
import { fetchLeagueMatches, fetchMatchDetail, isParsed } from './lib/opendota.ts';
import type { MatchDetail } from './lib/opendota.ts';
import { loadEvent, localDate, phaseFor } from './lib/events.ts';

interface IndexedMatch {
  match_id: number;
  start_time: number;
  local_date: string;
  phase: string | null;
  duration: number;
  radiant_win: boolean;
  radiant_score: number;
  dire_score: number;
  radiant_team_id: number | null;
  dire_team_id: number | null;
  series_id: number | null;
  series_type: number | null;
  /** False means replay-derived stats (Roshan, objectives) are unavailable. */
  parsed: boolean;
  has_picks_bans: boolean;
}

/**
 * OpenDota reports a team's CURRENT name, not its name at the time of the
 * event. Those names must never reach `data/computed/` (DESIGN.md §8.1 rule
 * 7) — a 2018 group stage rendered "Shopify Rebellion" because they did.
 *
 * They are still worth keeping: for qualifier teams that never reached the
 * main event, this is often the only name any source gives us. So they go to
 * `data/proposals/` instead, labelled for what they are, where the identity
 * review can date them properly before they become entities.
 */
function teamName(team: MatchDetail['radiant_team'], fallback: string | null): string | null {
  return team?.name ?? fallback ?? null;
}

async function main(): Promise<void> {
  /** team_id -> name as OpenDota reports it today. Routed to proposals, not computed. */
  const observedNames = new Map<number, string>();
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run ingest:matches -- <event-key>   (e.g. ti08)');
    process.exit(1);
  }

  const event = await loadEvent(key);
  const cacheDir = fileURLToPath(new URL(`../data/raw/${key}`, import.meta.url));
  const outDir = fileURLToPath(new URL(`../data/computed/${key}`, import.meta.url));

  console.log(`${event.name}  (leagueid ${event.leagueid})`);
  console.log(`venue timezone: ${event.venue_timezone}`);

  const summaries = await fetchLeagueMatches(event.leagueid, cacheDir);
  console.log(`league match list: ${summaries.length} matches\n`);

  const indexed: IndexedMatch[] = [];
  let fetched = 0;
  let fromCache = 0;

  for (const [i, summary] of summaries.entries()) {
    const { match, cached } = await fetchMatchDetail(summary.match_id, cacheDir);
    cached ? fromCache++ : fetched++;

    // Captured for the identity review; deliberately not written to the index.
    for (const [id, team, fallback] of [
      [match.radiant_team_id, match.radiant_team, summary.radiant_team_name],
      [match.dire_team_id, match.dire_team, summary.dire_team_name],
    ] as const) {
      const name = teamName(team, fallback);
      if (id && name && !observedNames.has(id)) observedNames.set(id, name);
    }

    indexed.push({
      match_id: match.match_id,
      start_time: match.start_time,
      local_date: localDate(match.start_time, event.venue_timezone),
      phase: phaseFor(event, match.start_time),
      duration: match.duration,
      radiant_win: match.radiant_win,
      radiant_score: match.radiant_score,
      dire_score: match.dire_score,
      radiant_team_id: match.radiant_team_id ?? null,
      dire_team_id: match.dire_team_id ?? null,
      series_id: match.series_id ?? null,
      series_type: match.series_type ?? null,
      parsed: isParsed(match),
      has_picks_bans: Array.isArray(match.picks_bans) && match.picks_bans.length > 0,
    });

    if ((i + 1) % 25 === 0 || i === summaries.length - 1) {
      process.stdout.write(`  ${i + 1}/${summaries.length} (${fetched} fetched, ${fromCache} cached)\n`);
    }
  }

  indexed.sort((a, b) => a.start_time - b.start_time);

  await mkdir(outDir, { recursive: true });

  const proposalsDir = fileURLToPath(new URL('../data/proposals', import.meta.url));
  await mkdir(proposalsDir, { recursive: true });
  await writeFile(
    `${proposalsDir}/${key}.teams-from-opendota.json`,
    `${JSON.stringify(
      {
        _note:
          "Team names as OpenDota reports them TODAY, which for a past event is often not what " +
          'the team was called at the time. NOT authoritative and NOT an entity record: this is ' +
          'raw input for the identity review, kept because for qualifier teams that never reached ' +
          'the main event it is frequently the only name any source provides. Date these against ' +
          'Liquipedia before promoting them (DESIGN.md §8.4.2).',
        _generated_by: 'scripts/ingest-matches.ts',
        _generated_at: new Date().toISOString(),
        _source: 'https://api.opendota.com/api/matches/{match_id}',
        _name_as_of: new Date().toISOString().slice(0, 10),
        event: key,
        teams: [...observedNames.entries()]
          .map(([team_id, name]) => ({ team_id, name_now: name }))
          .sort((a, b) => a.team_id - b.team_id),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  await writeFile(
    `${outDir}/matches.index.json`,
    JSON.stringify(
      {
        _generated_by: 'scripts/ingest-matches.ts',
        _generated_at: new Date().toISOString(),
        _source: `https://api.opendota.com/api/leagues/${event.leagueid}/matches`,
        event: key,
        leagueid: event.leagueid,
        venue_timezone: event.venue_timezone,
        match_count: indexed.length,
        matches: indexed,
      },
      null,
      2,
    ),
    'utf8',
  );

  // ---- Report what we got, including what is missing. ----
  const byPhase = new Map<string, IndexedMatch[]>();
  for (const m of indexed) {
    const p = m.phase ?? '(unassigned)';
    byPhase.set(p, [...(byPhase.get(p) ?? []), m]);
  }

  console.log('\nmatches by phase (venue-local dates):');
  for (const phase of [...event.phases.map((p) => p.id), '(unassigned)']) {
    const matches = byPhase.get(phase);
    if (!matches?.length) continue;
    const dates = matches.map((m) => m.local_date).sort();
    const unparsed = matches.filter((m) => !m.parsed).length;
    const noDraft = matches.filter((m) => !m.has_picks_bans).length;
    console.log(
      `  ${phase.padEnd(12)} ${String(matches.length).padStart(3)} matches  ${dates[0]} -> ${dates.at(-1)}` +
        `  [unparsed: ${unparsed}, no draft data: ${noDraft}]`,
    );
  }

  const unassigned = byPhase.get('(unassigned)') ?? [];
  if (unassigned.length) {
    console.log(
      `\n  WARNING: ${unassigned.length} matches fall outside every configured phase window.` +
        `\n  Fix the windows in data/sources/events.json rather than letting them be dropped.`,
    );
  }

  const missingIds = indexed.filter((m) => !m.radiant_team_id || !m.dire_team_id);
  console.log(`\nmatches missing a team id: ${missingIds.length}`);

  console.log(`\nwrote ${outDir}/matches.index.json`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
