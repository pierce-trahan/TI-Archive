/**
 * One-off: print picks/bans for the TI8 Grand Finals (OG vs PSG.LGD, 2018-08-25).
 * Run with: npx tsx scripts/tmp-fetch-finals-draft.ts
 * Delete this file after use — it's not part of the maintained pipeline.
 */
import { fetchMatchDetail, fetchHeroes } from './lib/opendota.ts';

const MATCH_IDS = [4080601137, 4080666526, 4080723031, 4080778303, 4080856812];
const CACHE_DIR = 'data/raw/_tmp-finals-draft';

async function main() {
  const heroes = await fetchHeroes(CACHE_DIR);
  const nameOf = (id: number) => heroes.find((h) => h.id === id)?.localized_name ?? `hero_id ${id}`;

  for (const [i, matchId] of MATCH_IDS.entries()) {
    const { match } = await fetchMatchDetail(matchId, CACHE_DIR);
    console.log(`\n=== Game ${i + 1} — match ${matchId} ===`);
    console.log(`radiant_win: ${match.radiant_win}`);

    if (match.picks_bans?.length) {
      for (const pb of match.picks_bans) {
        const side = pb.team === 0 ? 'Radiant' : 'Dire';
        const action = pb.is_pick ? 'PICK' : 'ban';
        console.log(`  ${side.padEnd(7)} ${action.padEnd(4)} ${nameOf(pb.hero_id)}`);
      }
    } else {
      console.log('  (no picks_bans data available for this match)');
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
