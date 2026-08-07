/**
 * Apply a datdota cross-check to the identity data.
 *
 *   npm run apply:datdota -- ti08 2026-08-06
 *
 * Runs the same comparison as verify:datdota and then acts on it. Two effects,
 * both provenance-improving:
 *
 *   1. SWAPS. When two accounts hold each other's datdota figures exactly —
 *      same games, same win-loss, GPM values that are each other's — their
 *      labels are swapped. datdota computed those aggregates from its own
 *      pipeline, so a mirror-image match is not a coincidence; it is two
 *      independent sources agreeing that we joined the pair backwards. The
 *      event-time HANDLES come from Liquipedia and are correct; only which
 *      account_id each attaches to is fixed, and the roster POSITIONS are left
 *      untouched (this is the carry/mid farm inversion the GPM guess gets wrong).
 *
 *   2. CORROBORATION. Every account datdota confirms — by name, or by figures
 *      under a since-changed name — gets a datdota cross-check stamped onto its
 *      roster row. An "inferred" join that an independent source agrees with is
 *      no longer a bare guess, and the data should say so.
 *
 * A figures CONFLICT that is not a clean swap is never touched. It is reported
 * and left for a human, because the script cannot tell which source is wrong.
 */

import { fileURLToPath } from 'node:url';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { loadEvent, phaseFor } from './lib/events.ts';
import type { MatchDetail } from './lib/opendota.ts';

const GPM_TOLERANCE = 0.5;
const DATDOTA_SOURCE_URL = 'https://www.datdota.com/';

interface DatdotaRow {
  player: string;
  games: number;
  wins: number;
  losses: number;
  gpm: number;
}
interface Mine {
  games: number;
  wins: number;
  losses: number;
  gpmTotal: number;
}

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
    } else if (ch === ',' && !quoted) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function parseCsv(text: string): DatdotaRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = splitCsvLine(lines[0]!).map((h) => h.trim());
  const idx = (n: string) => header.indexOf(n);
  return lines.slice(1).map((line) => {
    const c = splitCsvLine(line);
    return {
      player: c[idx('Player')]!,
      games: Number(c[idx('Games')]),
      wins: Number(c[idx('W')]),
      losses: Number(c[idx('L')]),
      gpm: Number(c[idx('GPM')]),
    };
  });
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

interface PlayerEntity {
  account_id: number;
  handles: { event: string; handle: string; source: unknown }[];
  opendota_current_name?: string | null;
}
interface RosterPlayer {
  position: number;
  role: string;
  handle: string;
  account_id: number;
  established_by: string;
  cross_check?: unknown;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  const reviewDate = process.argv[3];
  if (!key || !reviewDate) {
    console.error('usage: npm run apply:datdota -- <event-key> <YYYY-MM-DD>');
    process.exit(1);
  }
  const phases = new Set((process.argv[4] ?? 'group,main').split(','));

  const event = await loadEvent(key);
  const rows = parseCsv(
    await readFile(new URL(`../data/sources/datdota/${key}.players.csv`, import.meta.url), 'utf8'),
  );

  // ---- recompute our per-account figures ----
  const dir = fileURLToPath(new URL(`../data/raw/${key}/matches`, import.meta.url));
  const mine = new Map<number, Mine>();
  for (const file of await readdir(dir)) {
    if (!file.endsWith('.json')) continue;
    const m = JSON.parse(await readFile(`${dir}/${file}`, 'utf8')) as MatchDetail;
    const phase = phaseFor(event, m.start_time);
    if (phase === null || !phases.has(phase)) continue;
    for (const p of m.players) {
      if (p.account_id == null) continue;
      const row = mine.get(p.account_id) ?? { games: 0, wins: 0, losses: 0, gpmTotal: 0 };
      row.games++;
      row.gpmTotal += p.gold_per_min;
      if ((p.player_slot < 128) === m.radiant_win) row.wins++;
      else row.losses++;
      mine.set(p.account_id, row);
    }
  }

  const statsMatch = (o: Mine, r: DatdotaRow) =>
    o.games === r.games &&
    o.wins === r.wins &&
    o.losses === r.losses &&
    Math.abs(o.gpmTotal / o.games - r.gpm) < GPM_TOLERANCE;

  const playersUrl = new URL('../data/entities/players.json', import.meta.url);
  const rostersUrl = new URL(`../data/events/${key}.rosters.json`, import.meta.url);
  const playersFile = JSON.parse(await readFile(playersUrl, 'utf8')) as {
    players: PlayerEntity[];
    [k: string]: unknown;
  };
  const rostersFile = JSON.parse(await readFile(rostersUrl, 'utf8')) as {
    rosters: { players: RosterPlayer[]; [k: string]: unknown }[];
    [k: string]: unknown;
  };

  const handleFor = new Map<number, string>();
  for (const p of playersFile.players) {
    const h = p.handles.find((x) => x.event === key);
    if (h) handleFor.set(p.account_id, h.handle);
  }
  const byName = new Map(rows.map((r) => [norm(r.player), r]));

  // ---- classify each account ----
  const conflicts: { account: number; handle: string; ours: Mine; theirs: DatdotaRow }[] = [];
  const confirmations = new Map<number, { via: 'name' | 'stats'; datdotaName: string }>();

  for (const [account, ours] of mine) {
    const handle = handleFor.get(account);
    if (!handle) continue;
    const named = byName.get(norm(handle));
    if (named) {
      if (statsMatch(ours, named)) confirmations.set(account, { via: 'name', datdotaName: named.player });
      else conflicts.push({ account, handle, ours, theirs: named });
      continue;
    }
    const byStats = rows.filter((r) => statsMatch(ours, r));
    if (byStats.length === 1) confirmations.set(account, { via: 'stats', datdotaName: byStats[0]!.player });
  }

  // ---- pair conflicts into swaps ----
  const swaps: [number, number][] = [];
  const used = new Set<number>();
  for (const a of conflicts) {
    if (used.has(a.account)) continue;
    // b is the conflict whose figures equal a's, and whose figures a holds.
    const b = conflicts.find(
      (x) =>
        !used.has(x.account) &&
        x.account !== a.account &&
        statsMatch(a.ours, x.theirs) &&
        statsMatch(x.ours, a.theirs),
    );
    if (b) {
      swaps.push([a.account, b.account]);
      used.add(a.account);
      used.add(b.account);
    }
  }
  const unpaired = conflicts.filter((c) => !used.has(c.account));

  // ---- apply swaps ----
  const datdotaSource = { type: 'url', url: DATDOTA_SOURCE_URL, retrieved_at: reviewDate };
  for (const [accA, accB] of swaps) {
    const nameA = handleFor.get(accA)!;
    const nameB = handleFor.get(accB)!;

    for (const p of playersFile.players) {
      if (p.account_id !== accA && p.account_id !== accB) continue;
      const h = p.handles.find((x) => x.event === key);
      if (!h) continue;
      h.handle = p.account_id === accA ? nameB : nameA;
      h.source = datdotaSource;
    }

    // Roster: keep positions, move the account_id under the correct handle.
    for (const roster of rostersFile.rosters) {
      for (const pl of roster.players) {
        if (pl.handle === nameA) {
          pl.account_id = accB;
          pl.established_by = 'datdota';
        } else if (pl.handle === nameB) {
          pl.account_id = accA;
          pl.established_by = 'datdota';
        }
      }
    }
    handleFor.set(accA, nameB);
    handleFor.set(accB, nameA);
  }

  // ---- stamp corroboration on every confirmed roster row ----
  let stamped = 0;
  for (const roster of rostersFile.rosters) {
    for (const pl of roster.players) {
      const conf = confirmations.get(pl.account_id);
      if (!conf) continue;
      pl.cross_check = {
        source: 'datdota',
        matched_on: conf.via,
        datdota_name: conf.datdotaName,
        date: reviewDate,
      };
      stamped++;
    }
  }

  await writeFile(playersUrl, `${JSON.stringify(playersFile, null, 2)}\n`, 'utf8');
  await writeFile(rostersUrl, `${JSON.stringify(rostersFile, null, 2)}\n`, 'utf8');

  // ---- report ----
  console.log(`${event.name} — applied datdota cross-check\n`);
  if (swaps.length) {
    console.log(`swapped ${swaps.length} mislabelled pair(s):`);
    for (const [a, b] of swaps) {
      console.log(`  ${handleFor.get(a)} <-> ${handleFor.get(b)}  (accounts ${a}, ${b})`);
    }
  } else {
    console.log('no swaps needed');
  }
  console.log(`\ncorroboration stamped on ${stamped} roster rows`);
  if (unpaired.length) {
    console.log(`\n${unpaired.length} unresolved conflict(s) left for a human:`);
    for (const c of unpaired) {
      console.log(
        `  ${c.handle}: ours ${(c.ours.gpmTotal / c.ours.games).toFixed(1)} gpm vs datdota ${c.theirs.gpm.toFixed(1)}`,
      );
    }
  }
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
