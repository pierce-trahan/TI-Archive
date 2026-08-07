/**
 * Cross-check our identity work against a datdota player export.
 *
 *   npm run verify:datdota -- ti08
 *
 * Reads data/sources/datdota/<event>.players.csv.
 *
 * Why this is worth doing: our account_id -> handle mapping is partly inferred
 * from farm priority, which is a guess. datdota computes the same per-player
 * aggregates from its own pipeline, so if the account we labelled "MATUMBAMAN"
 * has the games, win-loss and GPM datdota reports for MATUMBAMAN, two
 * independent sources agree and the label is almost certainly right. Where they
 * disagree, one of us is wrong and it needs a human.
 *
 * Note what this can and cannot do. The export carries no account_id and no
 * team column, so it cannot *make* the join — only test one that already
 * exists. And datdota stores a single current name per player by design, so a
 * player who changed handles since the event appears under the modern one and
 * will not match on name at all. Those are reported separately from real
 * disagreements, because they are a different thing entirely.
 */

import { fileURLToPath } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import { loadEvent, phaseFor } from './lib/events.ts';
import type { MatchDetail } from './lib/opendota.ts';

/** GPM is a mean over many games; a fraction of a point apart is rounding. */
const GPM_TOLERANCE = 0.5;

interface DatdotaRow {
  player: string;
  games: number;
  wins: number;
  losses: number;
  gpm: number;
  xpm: number;
}

/** Splits a CSV line, honouring quoted fields. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
      continue;
    }
    if (ch === ',' && !quoted) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out;
}

function parseCsv(text: string): DatdotaRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = splitCsvLine(lines[0]!).map((h) => h.trim());
  const col = (name: string) => header.indexOf(name);

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return {
      player: cells[col('Player')]!,
      games: Number(cells[col('Games')]),
      wins: Number(cells[col('W')]),
      losses: Number(cells[col('L')]),
      gpm: Number(cells[col('GPM')]),
      xpm: Number(cells[col('XPM')]),
    };
  });
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run verify:datdota -- <event-key>');
    process.exit(1);
  }
  const phases = new Set((process.argv[3] ?? 'group,main').split(','));

  const event = await loadEvent(key);
  const csvPath = new URL(`../data/sources/datdota/${key}.players.csv`, import.meta.url);
  const rows = parseCsv(await readFile(csvPath, 'utf8'));

  // ---- Our numbers, recomputed per account from the raw matches ----
  const cacheDir = fileURLToPath(new URL(`../data/raw/${key}/matches`, import.meta.url));
  const files = await readdir(cacheDir);

  interface Mine {
    games: number;
    wins: number;
    losses: number;
    gpmTotal: number;
  }
  const mine = new Map<number, Mine>();

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const match = JSON.parse(await readFile(`${cacheDir}/${file}`, 'utf8')) as MatchDetail;
    const phase = phaseFor(event, match.start_time);
    if (phase === null || !phases.has(phase)) continue;

    for (const p of match.players) {
      if (p.account_id == null) continue;
      const row = mine.get(p.account_id) ?? { games: 0, wins: 0, losses: 0, gpmTotal: 0 };
      row.games++;
      row.gpmTotal += p.gold_per_min;
      // player_slot < 128 is Radiant.
      if ((p.player_slot < 128) === match.radiant_win) row.wins++;
      else row.losses++;
      mine.set(p.account_id, row);
    }
  }

  // ---- The handle we assigned each account for this event ----
  const players = JSON.parse(
    await readFile(new URL('../data/entities/players.json', import.meta.url), 'utf8'),
  ) as { players: { account_id: number; handles: { event: string; handle: string }[] }[] };

  const handleFor = new Map<number, string>();
  for (const p of players.players) {
    const h = p.handles.find((x) => x.event === key);
    if (h) handleFor.set(p.account_id, h.handle);
  }

  const establishedBy = new Map<number, string>();
  const rosters = JSON.parse(
    await readFile(new URL(`../data/events/${key}.rosters.json`, import.meta.url), 'utf8'),
  ) as { rosters: { players: { account_id: number; established_by: string }[] }[] };
  for (const r of rosters.rosters) {
    for (const p of r.players) establishedBy.set(p.account_id, p.established_by);
  }

  const byName = new Map(rows.map((r) => [norm(r.player), r]));

  // ---- Compare ----
  const agree: string[] = [];
  const disagree: string[] = [];
  // Confirmed by stats even though the name did not match — datdota carries a
  // different current name for the same account. Its name is worth recording.
  const nameDiff: { handle: string; account: number; datdotaName: string; how: string }[] = [];
  // Genuinely no datdota row matches by name OR by figures.
  const absent: { handle: string; account: number; how: string }[] = [];

  const statsMatch = (ours: Mine, r: DatdotaRow): boolean =>
    ours.games === r.games &&
    ours.wins === r.wins &&
    ours.losses === r.losses &&
    Math.abs(ours.gpmTotal / ours.games - r.gpm) < GPM_TOLERANCE;

  for (const [account, ours] of mine) {
    const handle = handleFor.get(account);
    if (!handle) continue;
    const how = establishedBy.get(account) ?? '?';

    const theirs = byName.get(norm(handle));
    if (theirs) {
      if (statsMatch(ours, theirs)) {
        agree.push(handle);
      } else {
        disagree.push(
          `${handle.padEnd(16)} account ${account}  [${how}]\n` +
            `      ours:    ${ours.games} games  ${ours.wins}-${ours.losses}  ${(ours.gpmTotal / ours.games).toFixed(1)} gpm\n` +
            `      datdota: ${theirs.games} games  ${theirs.wins}-${theirs.losses}  ${theirs.gpm.toFixed(1)} gpm`,
        );
      }
      continue;
    }

    // No name match. Try to find datdota's row for this account by its figures —
    // a unique stats match is strong evidence it is the same player under a
    // different name, which both confirms our account and tells us datdota's.
    const byStats = rows.filter((r) => statsMatch(ours, r));
    if (byStats.length === 1) {
      nameDiff.push({ handle, account, datdotaName: byStats[0]!.player, how });
    } else {
      absent.push({ handle, account, how });
    }
  }

  console.log(`${event.name} — cross-check against datdota\n`);
  console.log(`datdota rows: ${rows.length}   our accounts: ${mine.size}\n`);
  const confirmed = agree.length + nameDiff.length;
  console.log(`  confirmed by datdota (name or stats): ${confirmed} / ${mine.size}`);
  console.log(`    - agree on name + figures:          ${agree.length}`);
  console.log(`    - figures match, name differs:      ${nameDiff.length}`);
  console.log(`  DISAGREE (figures conflict):          ${disagree.length}`);
  console.log(`  no datdota row at all:                ${absent.length}`);

  if (disagree.length) {
    console.log('\nDISAGREEMENTS — one of the two sources is wrong, and a human must decide:\n');
    for (const d of disagree) console.log(`  ${d}\n`);

    // Two rows whose figures are each other's are a swapped pair, not two
    // independent errors, and saying so makes the fix obvious.
    console.log('  If two entries above hold each other\'s numbers, the labels are swapped.');
  }

  if (nameDiff.length) {
    console.log('\nCONFIRMED BY STATS, name differs — same account, datdota carries a different');
    console.log('current name. Our event-time handle stands; this just cross-checks the account:\n');
    for (const n of nameDiff) {
      console.log(`  ours "${n.handle}"  ==  datdota "${n.datdotaName}"   account ${n.account}  [${n.how}]`);
    }
  }

  if (absent.length) {
    console.log('\nNO DATDOTA MATCH — neither name nor figures. Worth a look:\n');
    for (const a of absent) console.log(`  ${a.handle.padEnd(16)} account ${a.account}  [${a.how}]`);
  }
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
