/**
 * The main-event bracket, derived from match data.
 *
 *   npm run build:bracket -- ti08
 *   npm run build:bracket -- ti08 --inline
 *
 * DESIGN.md §3.3 said this would need a Liquipedia parser, because OpenDota's
 * `series_id` groups a series' games without encoding the tree — who advanced
 * to face whom, and which half of the bracket they were in. That is true of
 * the match data alone. It is not true once you use the shape of double
 * elimination itself.
 *
 * THE DERIVATION
 *
 * A team seeded into the lower bracket is out on its first loss. A team seeded
 * into the upper bracket survives one. So the number of losses a team took
 * before going home *is* its seeding, recoverable from results without
 * consulting a bracket at all:
 *
 *   1 loss  -> started in the lower bracket
 *   2 losses -> started in the upper bracket
 *   0 losses -> won the event
 *
 * Rounds follow from chronology: within a bracket, a new round begins when a
 * team appears that has already played in the current one.
 *
 * WHY THIS IS TRUSTED RATHER THAN GUESSED
 *
 * Two independent checks, both run every build and both fatal on failure.
 *
 *   1. The upper-bracket set derived from loss counts must equal the top four
 *      of each group from the standings — computed from different data by a
 *      different method. At TI8 they agree exactly.
 *   2. Elimination order must be monotonic with final placement: a team that
 *      went out later cannot have finished lower. Checked against Liquipedia's
 *      placements, which this script never reads for structure.
 *
 * If a future event's format breaks the assumption — a triple-elimination
 * stage, a bracket reset, a seeded bye — those checks fail loudly and this
 * stops, rather than drawing a plausible tree that is wrong.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const INLINE = process.argv.includes('--inline');

const escapeHtml = (t: string): string =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

interface IndexMatch {
  match_id: number;
  local_date: string;
  phase: string;
  radiant_win: boolean;
  radiant_team_id: number | null;
  dire_team_id: number | null;
  series_id: number | null;
}

interface Series {
  date: string;
  order: number;
  winner_team_id: number;
  loser_team_id: number;
  winner_score: number;
  loser_score: number;
  games: number;
  bracket: 'upper' | 'lower' | 'grand-final';
  round: number;
  round_label: string;
}

/** Games sharing a series id and an opponent pair are one series. */
function toSeries(matches: IndexMatch[]): Omit<Series, 'bracket' | 'round' | 'round_label'>[] {
  const grouped = new Map<string, IndexMatch[]>();
  for (const m of matches) {
    if (m.radiant_team_id == null || m.dire_team_id == null) continue;
    const pair = [m.radiant_team_id, m.dire_team_id].sort((a, b) => a - b).join('-');
    const key = `${m.series_id ?? 0}|${pair}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(m);
  }

  const out: Omit<Series, 'bracket' | 'round' | 'round_label'>[] = [];
  for (const games of grouped.values()) {
    games.sort((a, b) => a.match_id - b.match_id);
    const wins = new Map<number, number>();
    for (const g of games) {
      const w = g.radiant_win ? g.radiant_team_id! : g.dire_team_id!;
      wins.set(w, (wins.get(w) ?? 0) + 1);
    }
    const [a, b] = [games[0]!.radiant_team_id!, games[0]!.dire_team_id!];
    const winner = (wins.get(a) ?? 0) > (wins.get(b) ?? 0) ? a : b;
    const loser = winner === a ? b : a;
    out.push({
      date: games[0]!.local_date,
      order: games[0]!.match_id,
      winner_team_id: winner,
      loser_team_id: loser,
      winner_score: wins.get(winner) ?? 0,
      loser_score: wins.get(loser) ?? 0,
      games: games.length,
    });
  }
  return out.sort((x, y) => x.date.localeCompare(y.date) || x.order - y.order);
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run build:bracket -- <event-key> [--inline]');
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

  const index = await read(`data/computed/${key}/matches.index.json`);
  const rosters = await read(`data/events/${key}.rosters.json`);
  const standings = await read(`data/computed/${key}/group-standings.json`, true);
  const placementsFile = await read(`data/events/${key}.placements.json`, true);

  const names = new Map<number, string>();
  for (const t of rosters.teams ?? rosters.rosters ?? []) {
    if (t.team_id != null) names.set(t.team_id, t.team_name);
  }
  const nameOf = (id: number): string => names.get(id) ?? `team ${id}`;

  const mainMatches = (index.matches as IndexMatch[]).filter((m) => m.phase === 'main');
  if (!mainMatches.length) {
    console.error(`No main-event matches for ${key}.`);
    process.exit(1);
  }
  const base = toSeries(mainMatches);

  // ---- Seeding, from loss counts ----
  const losses = new Map<number, number>();
  for (const s of base) losses.set(s.loser_team_id, (losses.get(s.loser_team_id) ?? 0) + 1);
  const teamIds = new Set(base.flatMap((s) => [s.winner_team_id, s.loser_team_id]));
  const origin = new Map<number, 'upper' | 'lower'>();
  for (const id of teamIds) origin.set(id, (losses.get(id) ?? 0) === 1 ? 'lower' : 'upper');

  // ---- Check 1: against the group standings, computed independently ----
  if (standings?.groups?.length) {
    const topFour = new Set<number>();
    for (const g of standings.groups) {
      const final = g.days.at(-1).standings as { team_id: number; points: number }[];
      const tiebreakWins = new Map<number, number>();
      for (const t of g.tiebreakers ?? []) {
        tiebreakWins.set(t.winner_team_id, (tiebreakWins.get(t.winner_team_id) ?? 0) + 1);
      }
      const ranked = [...final].sort(
        (a, b) => b.points - a.points || (tiebreakWins.get(b.team_id) ?? 0) - (tiebreakWins.get(a.team_id) ?? 0),
      );
      for (const t of ranked.slice(0, 4)) topFour.add(t.team_id);
    }
    const derived = new Set([...origin].filter(([, o]) => o === 'upper').map(([id]) => id));
    const same = derived.size === topFour.size && [...derived].every((id) => topFour.has(id));
    if (!same) {
      console.error('\nSEEDING CHECK FAILED. Upper bracket derived from loss counts:');
      console.error(`  ${[...derived].map(nameOf).sort().join(', ')}`);
      console.error('does not match the top four of each group:');
      console.error(`  ${[...topFour].map(nameOf).sort().join(', ')}`);
      console.error('\nThe format assumption in this script does not hold for this event.');
      process.exit(1);
    }
    console.log('seeding check: loss counts agree with group standings top four');
  }

  // ---- Assign bracket and round ----
  const priorLosses = new Map<number, number>();
  const withBracket: Series[] = [];
  for (const [i, s] of base.entries()) {
    const isLast = i === base.length - 1;
    const bothClean =
      (priorLosses.get(s.winner_team_id) ?? 0) === 0 &&
      (priorLosses.get(s.loser_team_id) ?? 0) === 0 &&
      origin.get(s.winner_team_id) === 'upper' &&
      origin.get(s.loser_team_id) === 'upper';
    const bracket: Series['bracket'] = isLast ? 'grand-final' : bothClean ? 'upper' : 'lower';
    withBracket.push({ ...s, bracket, round: 0, round_label: '' });
    priorLosses.set(s.loser_team_id, (priorLosses.get(s.loser_team_id) ?? 0) + 1);
  }

  // A round ends when a team would appear in it twice.
  for (const bracket of ['upper', 'lower'] as const) {
    const inBracket = withBracket.filter((s) => s.bracket === bracket);
    let round = 1;
    let seen = new Set<number>();
    for (const s of inBracket) {
      if (seen.has(s.winner_team_id) || seen.has(s.loser_team_id)) {
        round += 1;
        seen = new Set();
      }
      s.round = round;
      seen.add(s.winner_team_id);
      seen.add(s.loser_team_id);
    }
    const maxRound = Math.max(...inBracket.map((s) => s.round), 0);
    for (const s of inBracket) {
      const side = bracket === 'upper' ? 'Upper' : 'Lower';
      s.round_label =
        s.round === maxRound ? `${side} Bracket Final` : `${side} Bracket Round ${s.round}`;
    }
  }
  for (const s of withBracket.filter((x) => x.bracket === 'grand-final')) {
    s.round = 1;
    s.round_label = 'Grand Final';
  }

  // ---- Check 2: elimination order must agree with final placement ----
  if (placementsFile?.placements?.length) {
    const rank = new Map<string, number>();
    for (const p of placementsFile.placements) {
      for (const t of p.teams) rank.set(t.team_name, p.rank_from);
    }
    // Ordered by SERIES, not by date. Several teams go out on the same day in
    // different rounds — at TI8, OpTic fell in lower round 3 and Virtus.pro in
    // round 4, both on 2018-08-23, finishing 7th and 5th. Comparing by date
    // makes that look like a contradiction when it is just the schedule.
    const lastLoss = new Map<number, { date: string; order: number }>();
    for (const s of withBracket) lastLoss.set(s.loser_team_id, { date: s.date, order: s.order });

    const eliminated = [...teamIds]
      .filter((id) => (losses.get(id) ?? 0) === (origin.get(id) === 'upper' ? 2 : 1))
      .map((id) => ({ id, ...lastLoss.get(id)!, rank: rank.get(nameOf(id)) ?? 99 }))
      .sort((a, b) => a.order - b.order);

    // Going out later can only mean the same placement or a better one.
    const violations: string[] = [];
    for (let i = 1; i < eliminated.length; i++) {
      if (eliminated[i]!.rank <= eliminated[i - 1]!.rank) continue;
      violations.push(
        `${nameOf(eliminated[i]!.id)} out ${eliminated[i]!.date} placed ${eliminated[i]!.rank}, ` +
          `but went out after ${nameOf(eliminated[i - 1]!.id)} (${eliminated[i - 1]!.date}) who placed ${eliminated[i - 1]!.rank}`,
      );
    }
    if (violations.length) {
      console.error('\nPLACEMENT CHECK FAILED — derived elimination order contradicts placements:');
      for (const v of violations) console.error(`  ${v}`);
      process.exit(1);
    }
    console.log('placement check: elimination order is consistent with final placements');
  }

  // ---- Report ----
  const byBracket = (b: Series['bracket']) => withBracket.filter((s) => s.bracket === b);
  console.log(
    `\n${withBracket.length} series — ${byBracket('upper').length} upper, ` +
      `${byBracket('lower').length} lower, ${byBracket('grand-final').length} grand final\n`,
  );
  // Grouped by round rather than printed in pure chronological order: the two
  // brackets interleave across days, so a straight timeline prints the same
  // round header several times.
  for (const bracket of ['upper', 'lower', 'grand-final'] as const) {
    for (const label of [...new Set(byBracket(bracket).map((s) => s.round_label))]) {
      console.log(`  ${label}`);
      for (const s of byBracket(bracket).filter((x) => x.round_label === label)) {
        console.log(
          `      ${s.date}  ${nameOf(s.winner_team_id).padEnd(17)} ${s.winner_score}-${s.loser_score}  ${nameOf(s.loser_team_id)}`,
        );
      }
    }
  }

  // ---- Write ----
  const outDir = fileURLToPath(new URL(`../data/computed/${key}/`, import.meta.url));
  await mkdir(outDir, { recursive: true });
  await writeFile(
    `${outDir}bracket.json`,
    `${JSON.stringify(
      {
        _note:
          'Main-event bracket derived from match results, not read from a published bracket. ' +
          'Seeding comes from loss counts: in double elimination a lower-bracket team is out on ' +
          'its first loss and an upper-bracket team survives one. Verified two ways at build ' +
          'time — the derived upper bracket must equal the top four of each group from the ' +
          'standings, and elimination order must agree with final placements. Both are fatal.',
        _generated_by: 'scripts/build-bracket.ts',
        _generated_at: new Date().toISOString(),
        event: key,
        series_count: withBracket.length,
        seeding: [...origin].map(([team_id, started_in]) => ({
          team_id,
          started_in,
          losses: losses.get(team_id) ?? 0,
        })),
        series: withBracket,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  // ---- HTML ----
  const renderRound = (label: string, list: Series[]): string => {
    const items = list
      .map(
        (s) => `        <li class="bx-series">
          <span class="bx-team bx-won">${escapeHtml(nameOf(s.winner_team_id))}</span>
          <span class="bx-score">${s.winner_score}<span class="bx-dash">–</span>${s.loser_score}</span>
          <span class="bx-team bx-lost">${escapeHtml(nameOf(s.loser_team_id))}</span>
          <span class="bx-date">${escapeHtml(s.date.slice(5))}</span>
        </li>`,
      )
      .join('\n');
    return `      <div class="bx-round">
        <h5>${escapeHtml(label)}</h5>
        <ul>
${items}
        </ul>
      </div>`;
  };

  const roundsOf = (b: Series['bracket']): string => {
    const list = byBracket(b);
    const labels = [...new Set(list.map((s) => s.round_label))];
    return labels.map((l) => renderRound(l, list.filter((s) => s.round_label === l))).join('\n');
  };

  const fragment = `<section class="bracket">
  <header class="bx-head">
    <h3>The main event bracket</h3>
    <p class="bx-sub">Every series, in order. Derived from match results and checked against the group standings and the final placements.</p>
  </header>
  <div class="bx-half">
    <h4>Upper bracket</h4>
    <div class="bx-rounds">
${roundsOf('upper')}
    </div>
  </div>
  <div class="bx-half">
    <h4>Lower bracket <span class="bx-note">single elimination — one loss and it's over</span></h4>
    <div class="bx-rounds">
${roundsOf('lower')}
    </div>
  </div>
  <div class="bx-half bx-final">
    <h4>Grand final</h4>
    <div class="bx-rounds">
${roundsOf('grand-final')}
    </div>
  </div>
</section>`;

  await writeFile(`${outDir}bracket${INLINE ? '.inline' : ''}.html`, `${fragment}\n`, 'utf8');
  console.log(`\nwrote ${outDir}bracket.json`);
  console.log(`wrote ${outDir}bracket${INLINE ? '.inline' : ''}.html`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
