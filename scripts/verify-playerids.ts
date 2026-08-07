/**
 * Compare Liquipedia's direct account_ids to our confirmed roster mapping.
 *
 *   npm run verify:playerids -- ti08
 *
 * The roster mapping in data/events/<event>.rosters.json is now datdota-
 * validated (90/90 at TI8). This checks whether reading account_id straight off
 * each Liquipedia player page reproduces it. Three independent sources agreeing
 * — OpenDota IDs, datdota figures, Liquipedia player pages — is as sourced as a
 * roster gets.
 *
 * A mismatch is not automatically an error. Liquipedia's `playerid` is the
 * player's CURRENT primary account, and a player with more than one account may
 * have played the event on an older one. So each mismatch is classified by a
 * fact, not a guess: did Liquipedia's account actually appear in this event's
 * matches?
 *
 *   - Liquipedia's account did NOT play  -> benign. It is the player's current
 *     main; the account that played the event is ours, and it is the right one.
 *     This is the present-tense-identity trap again, one layer down.
 *   - Liquipedia's account DID also play  -> a real puzzle. Both accounts are in
 *     the event data, and a human must say which was this player. Reported loud.
 */

import { fileURLToPath } from 'node:url';
import { readFile, readdir } from 'node:fs/promises';
import { loadEvent, phaseFor } from './lib/events.ts';
import type { MatchDetail } from './lib/opendota.ts';

interface PlayerIds {
  players: { handle: string; account_id: number | null; found_in: string | null }[];
}
interface Rosters {
  rosters: { players: { handle: string; account_id: number; established_by: string }[] }[];
}

async function readJson<T>(path: URL): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run verify:playerids -- <event-key>');
    process.exit(1);
  }

  const phases = new Set((process.argv[3] ?? 'group,main').split(','));
  const ids = await readJson<PlayerIds>(new URL(`../data/proposals/${key}.playerids.json`, import.meta.url));
  const rosters = await readJson<Rosters>(new URL(`../data/events/${key}.rosters.json`, import.meta.url));

  // Every account_id that actually appears in this event's matches.
  const event = await loadEvent(key);
  const cacheDir = fileURLToPath(new URL(`../data/raw/${key}/matches`, import.meta.url));
  const played = new Set<number>();
  for (const file of await readdir(cacheDir)) {
    if (!file.endsWith('.json')) continue;
    const m = JSON.parse(await readFile(`${cacheDir}/${file}`, 'utf8')) as MatchDetail;
    const phase = phaseFor(event, m.start_time);
    if (phase === null || !phases.has(phase)) continue;
    for (const p of m.players) if (p.account_id != null) played.add(p.account_id);
  }

  // account_id our (datdota-validated) roster assigns to each handle.
  const ours = new Map<string, { account: number; how: string }>();
  for (const r of rosters.rosters) {
    for (const p of r.players) ours.set(p.handle, { account: p.account_id, how: p.established_by });
  }

  let agree = 0;
  const benign: string[] = [];
  const puzzle: string[] = [];
  const unresolved: string[] = [];

  for (const lp of ids.players) {
    const our = ours.get(lp.handle);
    if (!our) continue;
    if (lp.account_id == null) {
      unresolved.push(`${lp.handle} (Liquipedia page had no id; ours: ${our.account} [${our.how}])`);
      continue;
    }
    if (lp.account_id === our.account) {
      agree++;
      continue;
    }
    // Mismatch: is Liquipedia's account even in the event?
    const liquiPlayed = played.has(lp.account_id);
    const line =
      `${lp.handle}: played on ${our.account} [${our.how}]; ` +
      `Liquipedia lists ${lp.account_id} (${lp.found_in}), which ${liquiPlayed ? 'ALSO played' : 'did not play'} this event`;
    (liquiPlayed ? puzzle : benign).push(line);
  }

  console.log(`${key.toUpperCase()} — Liquipedia player-id vs datdota-validated roster\n`);
  console.log(`  three sources agree:                 ${agree}`);
  console.log(`  Liquipedia lists a different account: ${benign.length + puzzle.length}`);
  console.log(`    - it did not play (benign):        ${benign.length}`);
  console.log(`    - it also played (needs a human):  ${puzzle.length}`);
  console.log(`  no id on Liquipedia:                 ${unresolved.length}`);

  if (benign.length) {
    console.log('\nBENIGN — Liquipedia lists the player\'s CURRENT main, not the account they');
    console.log('played this event on. Our per-event account stands and is the correct one:\n');
    for (const b of benign) console.log(`  ${b}`);
  }
  if (puzzle.length) {
    console.log('\nNEEDS A HUMAN — both accounts appear in this event; which one was the player?\n');
    for (const p of puzzle) console.log(`  ${p}`);
  }
  if (unresolved.length) {
    console.log('\nNO LIQUIPEDIA ID — these rest on the datdota-validated join:\n');
    for (const u of unresolved) console.log(`  ${u}`);
  }
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
