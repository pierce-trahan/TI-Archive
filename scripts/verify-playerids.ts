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
 * A mismatch here is worth attention: it means Liquipedia's own player page and
 * our match-derived join disagree about who an account belongs to.
 */

import { readFile } from 'node:fs/promises';

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

  const ids = await readJson<PlayerIds>(new URL(`../data/proposals/${key}.playerids.json`, import.meta.url));
  const rosters = await readJson<Rosters>(new URL(`../data/events/${key}.rosters.json`, import.meta.url));

  // account_id our (datdota-validated) roster assigns to each handle.
  const ours = new Map<string, { account: number; how: string }>();
  for (const r of rosters.rosters) {
    for (const p of r.players) ours.set(p.handle, { account: p.account_id, how: p.established_by });
  }

  let agree = 0;
  const mismatch: string[] = [];
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
    } else {
      mismatch.push(
        `${lp.handle}: Liquipedia ${lp.account_id} (${lp.found_in}) vs ours ${our.account} [${our.how}]`,
      );
    }
  }

  console.log(`${key.toUpperCase()} — Liquipedia player-id vs datdota-validated roster\n`);
  console.log(`  agree:              ${agree}`);
  console.log(`  MISMATCH:           ${mismatch.length}`);
  console.log(`  no id on Liquipedia: ${unresolved.length}`);

  if (mismatch.length) {
    console.log('\nMISMATCHES — Liquipedia and our join disagree, worth a look:\n');
    for (const m of mismatch) console.log(`  ${m}`);
  }
  if (unresolved.length) {
    console.log('\nNO LIQUIPEDIA ID — these still rest on the datdota-validated join:\n');
    for (const u of unresolved) console.log(`  ${u}`);
  }
  if (!mismatch.length && !unresolved.length) {
    console.log('\nThree independent sources agree on every account. As sourced as it gets.');
  }
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
