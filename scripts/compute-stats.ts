/**
 * Compute event-wide statistics from cached match data.
 *
 *   npm run compute:stats -- ti08
 *
 * Writes data/computed/<event>/stats.json. Generated, never hand-edited.
 *
 * Three rules this file exists to enforce:
 *
 *   1. Unparsed matches are MISSING, not zero. Roshan kills and first blood
 *      come from the replay parse; a match without one contributes nothing and
 *      is excluded from the denominator, which is always reported alongside.
 *   2. Rates carry their sample size, and hero win rates below the threshold
 *      are suppressed. A hero picked twice and winning twice is not "the
 *      strongest hero at TI8".
 *   3. A statistic that cannot be computed honestly is not shipped. Unpicked
 *      heroes needs the hero pool AS OF the event's patch; against today's pool
 *      it would report heroes that did not exist yet as "never picked", so it
 *      emits null with the reason attached.
 */

import { fileURLToPath } from 'node:url';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fetchHeroes, isParsed } from './lib/opendota.ts';
import type { MatchDetail } from './lib/opendota.ts';
import { loadEvent, localDate, phaseFor } from './lib/events.ts';

/** Minimum games before a hero win rate is reported at all. */
const MIN_GAMES_FOR_WINRATE = 5;

interface Sampled<T> {
  value: T;
  /** How many matches actually contributed. */
  sample: number;
  /** How many were available but unusable, and why. */
  excluded?: { count: number; reason: string };
}

function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

const round1 = (n: number | null): number | null => (n == null ? null : Math.round(n * 10) / 10);

async function readMatches(cacheDir: string): Promise<MatchDetail[]> {
  const files = await readdir(`${cacheDir}/matches`);
  const out: MatchDetail[] = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    out.push(JSON.parse(await readFile(`${cacheDir}/matches/${file}`, 'utf8')) as MatchDetail);
  }
  return out;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run compute:stats -- <event-key>');
    process.exit(1);
  }
  const phases = new Set((process.argv[3] ?? 'group,main').split(','));

  const event = await loadEvent(key);
  const cacheDir = fileURLToPath(new URL(`../data/raw/${key}`, import.meta.url));
  const outDir = fileURLToPath(new URL(`../data/computed/${key}`, import.meta.url));

  const heroes = await fetchHeroes(cacheDir);
  const heroName = new Map(heroes.map((h) => [h.id, h.localized_name]));

  // Hero pool AS OF this event, from sourced release dates. Without this the
  // unpicked list would include heroes that did not exist yet.
  const heroPoolFile = JSON.parse(
    await readFile(new URL('../data/entities/heroes.json', import.meta.url), 'utf8'),
  ) as { _source: { url: string }; heroes: { name: string; released: string | null }[] };

  const all = await readMatches(cacheDir);
  const matches = all.filter((m) => {
    const phase = phaseFor(event, m.start_time);
    return phase !== null && phases.has(phase);
  });

  // The event's first day, in venue-local time — the cutoff for "did this hero
  // exist yet". A hero released mid-event is excluded, which is the correct
  // reading of what the field could have drafted on day one.
  const eventStart = matches
    .map((m) => localDate(m.start_time, event.venue_timezone))
    .sort()[0]!;

  // Join by NAME: Liquipedia's id column is its own, not OpenDota's hero_id.
  const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]/g, '');
  const idByName = new Map(heroes.map((h) => [norm(h.localized_name), h.id]));

  const heroPool = heroPoolFile.heroes
    .filter((h) => h.released != null && h.released <= eventStart)
    .map((h) => ({ ...h, id: idByName.get(norm(h.name)) ?? null }));

  // A release-table name that matches no OpenDota hero cannot be checked
  // against the draft, so it is reported rather than silently dropped.
  const unjoinableHeroes = heroPool.filter((h) => h.id == null).map((h) => h.name);
  const poolIds = new Set(heroPool.map((h) => h.id).filter((id): id is number => id != null));

  const parsed = matches.filter(isParsed);
  const unparsedNote = {
    count: matches.length - parsed.length,
    reason: 'replay not parsed by OpenDota; objective data unavailable',
  };

  // ---- Duration and kills: available for every match ----
  const durations = matches.map((m) => m.duration);
  const kills = matches.map((m) => m.radiant_score + m.dire_score);
  const longest = matches.reduce((a, b) => (b.duration > a.duration ? b : a));
  const shortest = matches.reduce((a, b) => (b.duration < a.duration ? b : a));

  // ---- Objectives: parsed matches only ----
  const roshanPerGame = parsed.map(
    (m) => (m.objectives ?? []).filter((o) => o.type === 'CHAT_MESSAGE_ROSHAN_KILL').length,
  );
  const firstBloodTimes = parsed
    .map((m) => (m.objectives ?? []).find((o) => o.type === 'CHAT_MESSAGE_FIRSTBLOOD')?.time)
    .filter((t): t is number => typeof t === 'number');

  // ---- Draft ----
  const picks = new Map<number, { picked: number; won: number }>();
  const bans = new Map<number, number>();
  let matchesWithDraft = 0;

  for (const match of matches) {
    if (!match.picks_bans?.length) continue;
    matchesWithDraft++;
    for (const entry of match.picks_bans) {
      if (entry.is_pick) {
        const row = picks.get(entry.hero_id) ?? { picked: 0, won: 0 };
        row.picked++;
        // team 0 is Radiant.
        if ((entry.team === 0) === match.radiant_win) row.won++;
        picks.set(entry.hero_id, row);
      } else {
        bans.set(entry.hero_id, (bans.get(entry.hero_id) ?? 0) + 1);
      }
    }
  }

  const heroRows = [...picks.entries()].map(([id, row]) => ({
    hero: heroName.get(id) ?? `hero_${id}`,
    picked: row.picked,
    won: row.won,
    banned: bans.get(id) ?? 0,
    win_rate: row.picked >= MIN_GAMES_FOR_WINRATE ? row.won / row.picked : null,
  }));

  const rated = heroRows.filter((h) => h.win_rate != null);

  // Heroes that existed but never appeared in a pick.
  const unpicked = heroPool.filter((h) => h.id != null && !picks.has(h.id));
  // A hero picked at the event but absent from the pool means the release date
  // or the cutoff is wrong. Report it rather than silently dropping it.
  const outsidePool = [...picks.keys()]
    .filter((id) => !poolIds.has(id))
    .map((id) => heroName.get(id) ?? `hero_${id}`);

  // ---- Players ----
  const players = new Map<number, { gpm: number[]; xpm: number[] }>();
  for (const match of matches) {
    for (const p of match.players) {
      if (p.account_id == null) continue;
      const row = players.get(p.account_id) ?? { gpm: [], xpm: [] };
      if (typeof p.gold_per_min === 'number') row.gpm.push(p.gold_per_min);
      if (typeof p.xp_per_min === 'number') row.xpm.push(p.xp_per_min);
      players.set(p.account_id, row);
    }
  }

  // Handles come from the confirmed entity file, never from the match records.
  const entityFile = JSON.parse(
    await readFile(new URL('../data/entities/players.json', import.meta.url), 'utf8'),
  ) as { players: { account_id: number; handles: { event: string; handle: string }[] }[] };
  const handleFor = new Map(
    entityFile.players.map((p) => [
      p.account_id,
      p.handles.find((h) => h.event === key)?.handle ?? null,
    ]),
  );

  const playerRows = [...players.entries()]
    .map(([account_id, row]) => ({
      account_id,
      games: row.gpm.length,
      avg_gpm: round1(mean(row.gpm)),
      avg_xpm: round1(mean(row.xpm)),
    }))
    .filter((p) => p.games >= MIN_GAMES_FOR_WINRATE);

  const byGpm = [...playerRows].sort((a, b) => (b.avg_gpm ?? 0) - (a.avg_gpm ?? 0));
  const byXpm = [...playerRows].sort((a, b) => (b.avg_xpm ?? 0) - (a.avg_xpm ?? 0));

  const stats = {
    _generated_by: 'scripts/compute-stats.ts',
    _generated_at: new Date().toISOString(),
    _note:
      'Generated. Do not hand-edit. Every rate carries its sample size; ' +
      'objective statistics exclude unparsed matches rather than counting them as zero.',
    event: key,
    phases: [...phases],
    matches: {
      total: matches.length,
      parsed: parsed.length,
      unparsed: unparsedNote.count,
      with_draft_data: matchesWithDraft,
    },

    duration: {
      mean_seconds: round1(mean(durations)),
      median_seconds: median(durations),
      longest: { match_id: longest.match_id, seconds: longest.duration },
      shortest: { match_id: shortest.match_id, seconds: shortest.duration },
      sample: durations.length,
    },

    kills_per_game: { value: round1(mean(kills)), sample: kills.length } satisfies Sampled<number | null>,

    roshan_kills_per_game: {
      value: round1(mean(roshanPerGame)),
      sample: roshanPerGame.length,
      excluded: unparsedNote,
    } satisfies Sampled<number | null>,

    first_blood_seconds: {
      value: round1(mean(firstBloodTimes)),
      sample: firstBloodTimes.length,
      excluded: {
        count: parsed.length - firstBloodTimes.length,
        reason: 'no first-blood event recorded in the parsed objectives',
      },
    } satisfies Sampled<number | null>,

    heroes: {
      distinct_picked: heroRows.length,
      most_picked: [...heroRows].sort((a, b) => b.picked - a.picked).slice(0, 15),
      most_banned: [...heroRows].sort((a, b) => b.banned - a.banned).slice(0, 15),
      win_rate_threshold_games: MIN_GAMES_FOR_WINRATE,
      strongest: [...rated].sort((a, b) => b.win_rate! - a.win_rate!).slice(0, 10),
      weakest: [...rated].sort((a, b) => a.win_rate! - b.win_rate!).slice(0, 10),
      suppressed_below_threshold: heroRows.length - rated.length,
      pool: {
        size: heroPool.length,
        as_of: eventStart,
        source: heroPoolFile._source.url,
        note:
          'Heroes released on or before the event\'s first day. Computed from sourced ' +
          'release dates, not from today\'s hero list.',
      },
      unpicked: unpicked.map((h) => ({
        hero: h.name,
        banned: bans.get(h.id!) ?? 0,
        released: h.released,
      })),
      never_touched: unpicked.filter((h) => !bans.get(h.id!)).map((h) => h.name),
      picked_outside_pool: outsidePool,
      unjoinable_release_names: unjoinableHeroes,
    },

    players: {
      min_games: MIN_GAMES_FOR_WINRATE,
      counted: playerRows.length,
      top_gpm: byGpm.slice(0, 10),
      top_xpm: byXpm.slice(0, 10),
    },
  };

  await mkdir(outDir, { recursive: true });
  await writeFile(`${outDir}/stats.json`, `${JSON.stringify(stats, null, 2)}\n`, 'utf8');

  // ---- Report ----
  const mmss = (s: number | null) =>
    s == null ? '—' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

  console.log(`${event.name} — ${matches.length} matches (${parsed.length} parsed)\n`);
  console.log(`  average game        ${mmss(stats.duration.mean_seconds)}`);
  console.log(`  median game         ${mmss(stats.duration.median_seconds)}`);
  console.log(`  longest             ${mmss(stats.duration.longest.seconds)}  (match ${stats.duration.longest.match_id})`);
  console.log(`  shortest            ${mmss(stats.duration.shortest.seconds)}  (match ${stats.duration.shortest.match_id})`);
  console.log(`  kills per game      ${stats.kills_per_game.value}`);
  console.log(
    `  Roshan per game     ${stats.roshan_kills_per_game.value}   (${stats.roshan_kills_per_game.sample} parsed matches; ${unparsedNote.count} excluded)`,
  );
  console.log(
    `  first blood at      ${mmss(stats.first_blood_seconds.value)}   (${stats.first_blood_seconds.sample} matches)`,
  );

  console.log(`\n  most picked:  ${stats.heroes.most_picked.slice(0, 5).map((h) => `${h.hero} (${h.picked})`).join(', ')}`);
  console.log(`  most banned:  ${stats.heroes.most_banned.slice(0, 5).map((h) => `${h.hero} (${h.banned})`).join(', ')}`);
  console.log(
    `  strongest:    ${stats.heroes.strongest.slice(0, 5).map((h) => `${h.hero} ${Math.round(h.win_rate! * 100)}% (${h.won}-${h.picked - h.won})`).join(', ')}`,
  );
  console.log(
    `  weakest:      ${stats.heroes.weakest.slice(0, 5).map((h) => `${h.hero} ${Math.round(h.win_rate! * 100)}% (${h.won}-${h.picked - h.won})`).join(', ')}`,
  );
  console.log(
    `  ${stats.heroes.distinct_picked} heroes picked; ${stats.heroes.suppressed_below_threshold} suppressed below ${MIN_GAMES_FOR_WINRATE} games`,
  );

  console.log('\n  top GPM:');
  for (const p of stats.players.top_gpm.slice(0, 5)) {
    // Handle is for this report only — the stats file itself carries the id.
    const shown = handleFor.get(p.account_id) ?? `account ${p.account_id}`;
    console.log(`      ${shown.padEnd(16)} ${p.avg_gpm} gpm over ${p.games} games`);
  }

  console.log(
    `\n  hero pool as of ${eventStart}: ${heroPool.length} heroes; ${stats.heroes.unpicked.length} never picked`,
  );
  for (const h of stats.heroes.unpicked) {
    console.log(`      ${h.hero.padEnd(20)} ${h.banned ? `banned ${h.banned}x` : 'never picked or banned'}`);
  }
  if (outsidePool.length) {
    console.log(`\n  WARNING: picked but not in pool: ${outsidePool.join(', ')}`);
  }
  if (unjoinableHeroes.length) {
    console.log(`  WARNING: release-table names with no OpenDota match: ${unjoinableHeroes.join(', ')}`);
  }
  console.log(`\nwrote ${outDir}/stats.json`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
