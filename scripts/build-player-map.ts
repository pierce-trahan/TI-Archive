/**
 * Build the account_id -> player scaffold for one event.
 *
 *   npm run build:playermap -- ti08
 *
 * Why this exists: OpenDota's pro-player `name` field is null for a large share
 * of players, and `personaname` is a live Steam handle that drifts and is often
 * a joke. `account_id` is the only stable key. See docs/DATA-NOTES.md.
 *
 * This script does NOT decide who anyone is. It collects the evidence — which
 * account played for which team, on which heroes, how often — and records
 * OpenDota's name as a *hint* with its provenance attached. Every entry lands
 * with `verified: false`. A human confirms each one against Liquipedia and flips
 * it, and the verify step refuses to publish anything still unverified.
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fetchHeroes, fetchProPlayers } from './lib/opendota.ts';
import type { MatchDetail } from './lib/opendota.ts';
import { loadEvent, phaseFor } from './lib/events.ts';
import { describeSource, loadEntities } from './lib/entities.ts';

interface TeamAppearance {
  team_id: number | null;
  /** The name as of this event once confirmed; otherwise whatever OpenDota calls it now. */
  team_name: string | null;
  team_name_verified: boolean;
  matches: number;
}

interface PlayerScaffold {
  account_id: number;
  /** Hint only until verified. Null when OpenDota has no pro name for them. */
  nickname: string | null;
  /** Where `nickname` came from. Replace with a Liquipedia URL on verification. */
  nickname_source: string | null;
  verified: boolean;
  real_name: null;
  nationality: null;
  matches: number;
  teams: TeamAppearance[];
  heroes_played: string[];
  /** Recorded as evidence of drift, never for display. */
  personanames_seen: string[];
  /**
   * Every identity string ever observed for this account, from any source.
   * These exist ONLY to join against Liquipedia handles. They are current-day
   * values and must never be displayed as the handle used at an event.
   */
  join_hints: string[];
  /** Farm-priority evidence, used to propose which position an account played. */
  median_gpm: number | null;
  modal_lane_role: number | null;
  _gpm: number[];
  _lanes: number[];
}

async function readMatches(cacheDir: string): Promise<MatchDetail[]> {
  let files: string[];
  try {
    files = await readdir(`${cacheDir}/matches`);
  } catch {
    throw new Error(`No cached matches at ${cacheDir}/matches — run ingest:matches first.`);
  }

  const matches: MatchDetail[] = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const raw = await readFile(`${cacheDir}/matches/${file}`, 'utf8');
    matches.push(JSON.parse(raw) as MatchDetail);
  }
  return matches;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run build:playermap -- <event-key>   (e.g. ti08)');
    process.exit(1);
  }

  // Which phases count as "at the event". Qualifiers involve dozens of teams
  // that never attended, so they are excluded from the roster scaffold.
  const eventPhases = new Set((process.argv[3] ?? 'group,main').split(','));

  const event = await loadEvent(key);
  const entities = await loadEntities();
  const cacheDir = new URL(`../data/raw/${key}`, import.meta.url).pathname;
  const outDir = new URL(`../data/entities`, import.meta.url).pathname;

  const heroes = await fetchHeroes(cacheDir);
  // proPlayers covers active pros only, but where it does have a row it often
  // carries an identity string the match records lack (e.g. account 34505203
  // is "mc" in matches but "MinD_ContRoL" here).
  const proPlayers = new Map(
    (await fetchProPlayers(cacheDir)).map((p) => [p.account_id, p]),
  );
  const heroName = new Map(heroes.map((h) => [h.id, h.localized_name]));

  const all = await readMatches(cacheDir);
  const matches = all.filter((m) => {
    const phase = phaseFor(event, m.start_time);
    return phase !== null && eventPhases.has(phase);
  });

  console.log(`${event.name}`);
  console.log(`phases counted as "at the event": ${[...eventPhases].join(', ')}`);
  console.log(`matches in scope: ${matches.length} of ${all.length} cached\n`);

  const players = new Map<number, PlayerScaffold>();
  const teamNames = new Map<number, string>();
  let anonymous = 0;

  for (const match of matches) {
    for (const [id, team] of [
      [match.radiant_team_id, match.radiant_team],
      [match.dire_team_id, match.dire_team],
    ] as const) {
      if (id != null && team?.name) teamNames.set(id, team.name);
    }

    for (const player of match.players) {
      if (player.account_id == null) {
        anonymous++;
        continue;
      }

      // player_slot < 128 is Radiant.
      const isRadiant = player.player_slot < 128;
      const teamId = isRadiant ? match.radiant_team_id : match.dire_team_id;
      const teamNameForMatch = (isRadiant ? match.radiant_team : match.dire_team)?.name ?? null;

      let entry = players.get(player.account_id);
      if (!entry) {
        // A human-confirmed handle for this event wins outright. OpenDota's
        // name is only a hint, and is a *current* handle — see CCnC/Quinn.
        const confirmed = entities.playerHandleAt(player.account_id, key);
        entry = {
          account_id: player.account_id,
          nickname: confirmed?.handle ?? player.name ?? null,
          nickname_source: confirmed
            ? describeSource(confirmed.source)
            : player.name
              ? 'opendota:players[].name'
              : null,
          verified: confirmed != null,
          real_name: null,
          nationality: null,
          matches: 0,
          teams: [],
          heroes_played: [],
          personanames_seen: [],
          join_hints: [],
          median_gpm: null,
          modal_lane_role: null,
          _gpm: [],
          _lanes: [],
        };
        players.set(player.account_id, entry);
      }

      if (typeof player.gold_per_min === 'number') entry._gpm.push(player.gold_per_min);
      const lane = (player as { lane_role?: number | null }).lane_role;
      if (typeof lane === 'number') entry._lanes.push(lane);

      // If a later match supplies a name the first one lacked, take it — still a hint.
      if (!entry.verified && !entry.nickname && player.name) {
        entry.nickname = player.name;
        entry.nickname_source = 'opendota:players[].name';
      }

      entry.matches++;

      // A confirmed name for this event beats whatever the API calls the org today.
      const confirmedTeam = entities.teamNameAt(teamId ?? null, key);
      const nameForEvent = confirmedTeam?.name ?? teamNameForMatch;

      const seenTeam = entry.teams.find((t) => t.team_id === (teamId ?? null));
      if (seenTeam) {
        seenTeam.matches++;
        if (!seenTeam.team_name && nameForEvent) seenTeam.team_name = nameForEvent;
      } else {
        entry.teams.push({
          team_id: teamId ?? null,
          team_name: nameForEvent,
          team_name_verified: confirmedTeam != null,
          matches: 1,
        });
      }

      const hero = heroName.get(player.hero_id);
      if (hero && !entry.heroes_played.includes(hero)) entry.heroes_played.push(hero);

      if (player.personaname && !entry.personanames_seen.includes(player.personaname)) {
        entry.personanames_seen.push(player.personaname);
      }

      const pro = proPlayers.get(player.account_id);
      for (const hint of [player.name, player.personaname, pro?.name, pro?.personaname]) {
        if (hint && !entry.join_hints.includes(hint)) entry.join_hints.push(hint);
      }
    }
  }

  const scaffold = [...players.values()].sort((a, b) => {
    const teamA = a.teams[0]?.team_name ?? 'zzz';
    const teamB = b.teams[0]?.team_name ?? 'zzz';
    return teamA.localeCompare(teamB) || b.matches - a.matches;
  });

  for (const p of scaffold) {
    p.teams.sort((x, y) => y.matches - x.matches);
    p.heroes_played.sort();

    if (p._gpm.length) {
      const sorted = [...p._gpm].sort((a, b) => a - b);
      p.median_gpm = sorted[Math.floor(sorted.length / 2)] ?? null;
    }
    if (p._lanes.length) {
      const tally = new Map<number, number>();
      for (const lane of p._lanes) tally.set(lane, (tally.get(lane) ?? 0) + 1);
      p.modal_lane_role = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    }
    // Samples were only needed to compute the two summaries above.
    p._gpm = [];
    p._lanes = [];
  }

  const needsName = scaffold.filter((p) => !p.nickname);

  await mkdir(outDir, { recursive: true });
  const outPath = `${outDir}/players.${key}.scaffold.json`;
  await writeFile(
    outPath,
    JSON.stringify(
      {
        _generated_by: 'scripts/build-player-map.ts',
        _generated_at: new Date().toISOString(),
        _instructions:
          'Every entry is unverified. Confirm each against Liquipedia, set real_name and ' +
          'nationality, replace nickname_source with the Liquipedia URL, then set verified:true. ' +
          'Entries with nickname:null have no pro name in OpenDota and must be identified by ' +
          'account_id — never from personanames_seen, which are current Steam handles.',
        _liquipedia: event.source_url,
        event: key,
        player_count: scaffold.length,
        missing_nickname_count: needsName.length,
        players: scaffold,
      },
      null,
      2,
    ),
    'utf8',
  );

  // ---- Report, grouped by team, because that is the unit of verification. ----
  const byTeam = new Map<string, PlayerScaffold[]>();
  for (const p of scaffold) {
    const team = p.teams[0]?.team_name ?? '(no team recorded)';
    byTeam.set(team, [...(byTeam.get(team) ?? []), p]);
  }

  const verifiedPlayers = scaffold.filter((p) => p.verified).length;
  const verifiedTeams = new Set(
    scaffold.filter((p) => p.teams[0]?.team_name_verified).map((p) => p.teams[0]?.team_id),
  ).size;

  console.log(`teams seen: ${byTeam.size}  (${verifiedTeams} confirmed, ${byTeam.size - verifiedTeams} outstanding)`);
  console.log(
    `players seen: ${scaffold.length}  (${verifiedPlayers} confirmed, ${scaffold.length - verifiedPlayers} outstanding)`,
  );
  console.log(`players with no name from any source: ${needsName.length}`);
  if (anonymous) console.log(`player-slots with no account_id (private profile): ${anonymous}`);

  console.log('\nroster scaffold   [✓ confirmed · ? unconfirmed hint · — no name at all]');
  for (const [team, roster] of [...byTeam.entries()].sort()) {
    const sizeFlag = roster.length === 5 ? ' ' : '!';
    const teamMark = roster[0]?.teams[0]?.team_name_verified ? '✓' : '?';
    console.log(`${sizeFlag} ${teamMark} ${team}  (${roster.length} players)`);
    for (const p of roster) {
      const mark = p.verified ? '✓' : p.nickname ? '?' : '—';
      const label = p.nickname ?? 'NO NAME';
      console.log(
        `      ${mark} ${String(p.account_id).padEnd(11)} ${label.padEnd(18)} ${p.matches} matches`,
      );
    }
  }

  const oddRosters = [...byTeam.entries()].filter(([, r]) => r.length !== 5);
  if (oddRosters.length) {
    console.log(
      `\n  NOTE: ${oddRosters.length} teams do not have exactly 5 players. ` +
        `Stand-ins and mid-event substitutions are real and must be represented, not smoothed over.`,
    );
  }

  console.log(`\nwrote ${outPath}`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
