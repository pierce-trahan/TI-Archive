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
  radiant_team_name: string | null;
  dire_team_id: number | null;
  dire_team_name: string | null;
  series_id: number | null;
  series_type: number | null;
  /** False means replay-derived stats (Roshan, objectives) are unavailable. */
  parsed: boolean;
  has_picks_bans: boolean;
}

function teamName(team: MatchDetail['radiant_team'], fallback: string | null): string | null {
  return team?.name ?? fallback ?? null;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run ingest:matches -- <event-key>   (e.g. ti08)');
    process.exit(1);
  }

  const event = await loadEvent(key);
  const cacheDir = new URL(`../data/raw/${key}`, import.meta.url).pathname;
  const outDir = new URL(`../data/computed/${key}`, import.meta.url).pathname;

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
      // The list endpoint's team names are frequently null; detail is authoritative.
      radiant_team_name: teamName(match.radiant_team, summary.radiant_team_name),
      dire_team_id: match.dire_team_id ?? null,
      dire_team_name: teamName(match.dire_team, summary.dire_team_name),
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

  const missingTeams = indexed.filter((m) => !m.radiant_team_name || !m.dire_team_name);
  console.log(`\nmatches still missing a team name after detail lookup: ${missingTeams.length}`);

  console.log(`\nwrote ${outDir}/matches.index.json`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
