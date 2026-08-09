/**
 * Group-stage standings after each day of an event.
 *
 *   npm run build:standings -- ti08
 *
 * A final group table says who finished where. It cannot show a team opening
 * badly and climbing — which at TI8 is OG's whole story, and the kind of thing
 * a reader who watched it live remembers. So this emits a standings snapshot
 * at the end of every group-stage day, with each team's movement against the
 * previous day. See docs/DESIGN.md §3.3.
 *
 * TEAM NAMES DO NOT COME FROM THE MATCH DATA.
 *
 * OpenDota returns a team's CURRENT name, not its name at the time of the
 * event. In the committed TI8 index, seven of the eighteen group-stage teams
 * are wrong for 2018: Evil Geniuses appears as "Shopify Rebellion", Fnatic as
 * "Ascent Esports", PSG.LGD as "LGD Gaming", and OpTic Gaming has no name at
 * all. Rendering those would put 2026 branding on a 2018 group stage.
 *
 * So names are joined from data/events/<event>.rosters.json by team_id — the
 * Liquipedia-sourced, owner-reviewed roster for that event — and any id that
 * does not resolve is a hard failure rather than a fallback to whatever the
 * API happened to say today.
 *
 * SCORING. TI8's group stage was a Bo2 round robin where each game won is a
 * point, so points and game wins are the same number. That is not true of
 * every format, so it is stated in the output rather than assumed by a reader.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

interface IndexMatch {
  match_id: number;
  local_date: string;
  phase: string;
  radiant_win: boolean;
  radiant_team_id: number | null;
  dire_team_id: number | null;
  series_id: number | null;
}

interface RosterTeam {
  team_id: number | null;
  team_name: string;
}

interface DayRow {
  team_id: number;
  /**
   * Present in memory for rendering and reporting only. Stripped before the
   * JSON is written — computed data carries ids, not names (DESIGN.md §8.1
   * rule 7). The HTML fragment is render output, so it keeps them.
   */
  team: string;
  wins: number;
  losses: number;
  played: number;
  /** Same as wins under a one-point-per-game format; see the header. */
  points: number;
  rank: number;
  /** Rank change since the previous day. Positive is upward. Null on day 1. */
  movement: number | null;
}

const escapeHtml = (t: string): string =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Splits the round robin from the tiebreakers played after it.
 *
 * A group's table is its round-robin record. Folding tiebreaker games into it
 * silently changes the numbers and hides the thing worth showing: at TI8,
 * Newbee, OpTic and Team Secret all finished the round robin 8-8, and
 * Invictus Gaming and Winstrike both finished 4-12 — ties that decided who
 * went home. Counted together, those records read 9-8, 8-10 and 4-14, match
 * no published table, and the ties vanish.
 *
 * Each pairing plays a fixed series in the round robin (two games in a Bo2
 * format); anything beyond that, in match order, is a tiebreaker.
 */
function splitTiebreakers(
  matches: IndexMatch[],
  seriesLength: number,
): { roundRobin: IndexMatch[]; tiebreakers: IndexMatch[] } {
  const byPair = new Map<string, IndexMatch[]>();
  for (const m of matches) {
    const key = [m.radiant_team_id, m.dire_team_id].sort((a, b) => (a ?? 0) - (b ?? 0)).join('-');
    if (!byPair.has(key)) byPair.set(key, []);
    byPair.get(key)!.push(m);
  }

  const roundRobin: IndexMatch[] = [];
  const tiebreakers: IndexMatch[] = [];
  for (const games of byPair.values()) {
    // match_id increases with time, so the round-robin series comes first.
    const ordered = [...games].sort((a, b) => a.match_id - b.match_id);
    roundRobin.push(...ordered.slice(0, seriesLength));
    tiebreakers.push(...ordered.slice(seriesLength));
  }
  return { roundRobin, tiebreakers };
}

/** Teams that played each other in the group stage form one group. */
function findGroups(matches: IndexMatch[]): number[][] {
  const adjacency = new Map<number, Set<number>>();
  const link = (a: number, b: number) => {
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    adjacency.get(a)!.add(b);
  };
  for (const m of matches) {
    if (m.radiant_team_id == null || m.dire_team_id == null) continue;
    link(m.radiant_team_id, m.dire_team_id);
    link(m.dire_team_id, m.radiant_team_id);
  }

  const seen = new Set<number>();
  const groups: number[][] = [];
  for (const start of adjacency.keys()) {
    if (seen.has(start)) continue;
    const stack = [start];
    const component: number[] = [];
    while (stack.length) {
      const node = stack.pop()!;
      if (seen.has(node)) continue;
      seen.add(node);
      component.push(node);
      for (const next of adjacency.get(node) ?? []) if (!seen.has(next)) stack.push(next);
    }
    groups.push(component);
  }
  return groups;
}

/** Cumulative standings through `upTo`, ranked by points then win difference. */
function standingsThrough(
  matches: IndexMatch[],
  teamIds: number[],
  names: Map<number, string>,
  upTo: string,
): Omit<DayRow, 'movement'>[] {
  const tally = new Map<number, { wins: number; losses: number }>();
  for (const id of teamIds) tally.set(id, { wins: 0, losses: 0 });

  for (const m of matches) {
    if (m.local_date > upTo) continue;
    const { radiant_team_id: r, dire_team_id: d } = m;
    if (r == null || d == null) continue;
    if (!tally.has(r) || !tally.has(d)) continue;
    const winner = m.radiant_win ? r : d;
    const loser = m.radiant_win ? d : r;
    tally.get(winner)!.wins += 1;
    tally.get(loser)!.losses += 1;
  }

  return [...tally.entries()]
    .map(([team_id, t]) => ({
      team_id,
      team: names.get(team_id)!,
      wins: t.wins,
      losses: t.losses,
      played: t.wins + t.losses,
      points: t.wins,
      rank: 0,
    }))
    // Ties are left tied — a tiebreaker the data doesn't record must not be
    // invented by sort order. Alphabetical only makes the display stable.
    .sort((a, b) => b.points - a.points || a.team.localeCompare(b.team))
    .map((row, i, all) => {
      const tiedWithBetter = all.findIndex((x) => x.points === row.points);
      return { ...row, rank: tiedWithBetter + 1 };
    });
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run build:standings -- <event-key>   (e.g. ti08)');
    process.exit(1);
  }
  const read = async (p: string) =>
    JSON.parse(await readFile(fileURLToPath(new URL(`../${p}`, import.meta.url)), 'utf8'));

  const index = (await read(`data/computed/${key}/matches.index.json`)) as { matches: IndexMatch[] };
  const rosters = (await read(`data/events/${key}.rosters.json`)) as {
    teams?: RosterTeam[];
    rosters?: RosterTeam[];
  };

  const names = new Map<number, string>();
  for (const t of rosters.teams ?? rosters.rosters ?? []) {
    if (t.team_id != null) names.set(t.team_id, t.team_name);
  }

  const group = index.matches.filter((m) => m.phase === 'group');
  if (!group.length) {
    console.error(`No group-stage matches for ${key}. Nothing to build.`);
    process.exit(1);
  }

  // Fail loudly rather than render a team under whatever OpenDota calls it now.
  const unresolved = new Set<number>();
  for (const m of group) {
    for (const id of [m.radiant_team_id, m.dire_team_id]) {
      if (id == null || !names.has(id)) unresolved.add(id ?? -1);
    }
  }
  if (unresolved.size) {
    console.error(`\n${unresolved.size} group-stage team id(s) are not in the roster file:`);
    for (const id of unresolved) console.error(`   ${id}`);
    console.error(
      '\nNames must come from the event roster, not from the match index — OpenDota returns a\n' +
        "team's current name, which for an old event is simply wrong. Add these to\n" +
        `data/events/${key}.rosters.json before building.`,
    );
    process.exit(1);
  }

  const days = [...new Set(group.map((m) => m.local_date))].sort();
  const groups = findGroups(group).sort((a, b) => b.length - a.length);

  // Group letters are a claim about the world, so they come from data with a
  // citation, not from whichever component the traversal happened to find first.
  let anchors: { label: string; team: string; source_url?: string }[] = [];
  try {
    const loaded = (await read(`data/events/${key}.groups.json`)) as {
      anchors: { label: string; team: string; source_url?: string }[];
    };
    anchors = loaded.anchors ?? [];
  } catch {
    // No anchors: groups stay numbered rather than being guessed into letters.
  }

  const labelFor = (ids: number[], fallbackIndex: number): string => {
    const members = new Set(ids.map((id) => names.get(id)!));
    const hit = anchors.find((a) => members.has(a.team));
    return hit ? hit.label : `Group ${fallbackIndex + 1}`;
  };

  /** Games per round-robin pairing. TI-era group stages are Bo2. */
  const SERIES_LENGTH = 2;

  const output = groups.map((ids, i) => {
    const label = labelFor(ids, i);
    const all = group.filter(
      (m) => ids.includes(m.radiant_team_id!) && ids.includes(m.dire_team_id!),
    );
    const { roundRobin, tiebreakers } = splitTiebreakers(all, SERIES_LENGTH);

    let previous: Omit<DayRow, 'movement'>[] | null = null;
    const byDay = days.map((day) => {
      const rows = standingsThrough(roundRobin, ids, names, day);
      const withMovement: DayRow[] = rows.map((row) => {
        const before = previous?.find((p) => p.team_id === row.team_id);
        return { ...row, movement: before ? before.rank - row.rank : null };
      });
      previous = rows;
      return { day, standings: withMovement };
    });

    return {
      label,
      team_count: ids.length,
      round_robin_games: roundRobin.length,
      days: byDay,
      tiebreakers: tiebreakers.map((m) => ({
        date: m.local_date,
        winner_team_id: m.radiant_win ? m.radiant_team_id! : m.dire_team_id!,
        loser_team_id: m.radiant_win ? m.dire_team_id! : m.radiant_team_id!,
      })),
    };
  });

  // ---- Report ----
  for (const g of output) {
    console.log(`\n${g.label} — ${g.team_count} teams, ${g.round_robin_games} round-robin games`);
    const final = g.days.at(-1)!;
    for (const row of final.standings) {
      console.log(`  ${String(row.rank).padStart(2)}. ${row.team.padEnd(18)} ${row.wins}-${row.losses}`);
    }
    if (g.tiebreakers.length) {
      console.log(`     tiebreakers (excluded from the table above):`);
      for (const t of g.tiebreakers) {
        console.log(`       ${t.date}  ${names.get(t.winner_team_id)} beat ${names.get(t.loser_team_id)}`);
      }
    }
  }
  const movers = output
    .flatMap((g) => g.days.flatMap((d) => d.standings.map((s) => ({ ...s, day: d.day, group: g.label }))))
    .filter((s) => s.movement != null && Math.abs(s.movement) >= 3);
  if (movers.length) {
    console.log('\nbiggest single-day moves (3+ places):');
    for (const m of movers) {
      console.log(`  ${m.day}  ${m.group}  ${m.team}: ${m.movement! > 0 ? '+' : ''}${m.movement}`);
    }
  }
  if (!anchors.length) {
    console.log(
      `\nNOTE: groups are numbered, not lettered. Add data/events/${key}.groups.json with a ` +
        'sourced anchor team per letter to label them.',
    );
  }

  // ---- Write ----
  const outDir = fileURLToPath(new URL(`../data/computed/${key}/`, import.meta.url));
  await mkdir(outDir, { recursive: true });
  await writeFile(
    `${outDir}group-standings.json`,
    `${JSON.stringify(
      {
        _note:
          'Group-stage ROUND-ROBIN standings after each day. Tiebreaker games played after the ' +
          'round robin are listed separately and excluded from the tables, because folding them in ' +
          'changes the records and hides the ties they existed to resolve. Points equal game wins ' +
          'under a one-point-per-game Bo2 format; confirm the format before reusing this for ' +
          'another event. Team names are ' +
          'joined from the event roster by team_id, NEVER from the match index — OpenDota returns ' +
          "a team's current name, which for a past event is wrong.",
        _generated_by: 'scripts/build-group-standings.ts',
        _generated_at: new Date().toISOString(),
        event: key,
        days,
        group_labels_sourced: anchors.length > 0,
        // Names stripped here, not upstream: they are needed to build the HTML
        // above and to sort ties stably, but must not land in computed data.
        groups: output.map((g) => ({
          ...g,
          days: g.days.map((d) => ({
            ...d,
            standings: d.standings.map(({ team, ...rest }) => rest),
          })),
        })),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  // ---- HTML fragment ----
  const html = output
    .map((g) => {
      const dayTables = g.days
        .map(({ day, standings }) => {
          const rows = standings
            .map((r) => {
              const move =
                r.movement == null
                  ? '<span class="mv none">—</span>'
                  : r.movement > 0
                    ? `<span class="mv up">▲${r.movement}</span>`
                    : r.movement < 0
                      ? `<span class="mv down">▼${Math.abs(r.movement)}</span>`
                      : '<span class="mv flat">·</span>';
              return `            <tr><td class="rk">${r.rank}</td><td class="mvc">${move}</td><td class="tm">${escapeHtml(r.team)}</td><td class="rec">${r.wins}–${r.losses}</td></tr>`;
            })
            .join('\n');
          return `        <div class="day-col">
          <h5>${escapeHtml(day)}</h5>
          <table class="standings">
            <thead><tr><th>#</th><th></th><th>Team</th><th>W–L</th></tr></thead>
            <tbody>
${rows}
            </tbody>
          </table>
        </div>`;
        })
        .join('\n');
      const tb = g.tiebreakers.length
        ? `\n      <p class="tiebreak"><strong>Tiebreakers</strong> — played after the round robin and not counted in the tables above: ${g.tiebreakers
            .map((t) => `${escapeHtml(names.get(t.winner_team_id)!)} beat ${escapeHtml(names.get(t.loser_team_id)!)}`)
            .join('; ')}.</p>`
        : '';
      return `    <div class="group-block">
      <h4>${escapeHtml(g.label)}</h4>
      <div class="day-grid">
${dayTables}
      </div>${tb}
    </div>`;
    })
    .join('\n');

  await writeFile(
    `${outDir}group-standings.html`,
    `<section class="group-standings">
  <header class="gs-head">
    <h3>Group stage, day by day</h3>
    <p class="gs-sub">Standings after each day, with movement against the day before. One point per game won.</p>
  </header>
${html}
</section>\n`,
    'utf8',
  );

  console.log(`\nwrote ${outDir}group-standings.json`);
  console.log(`wrote ${outDir}group-standings.html`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
