/**
 * Items that defined an event's meta.
 *
 *   npm run compute:items -- ti08
 *
 * DESIGN.md §5.2.1. Heroes are half of what a patch felt like; some events are
 * remembered for an item as much as a hero. Not every year has a Wraith Pact,
 * but every year has items that separated it from the one before.
 *
 * Runs offline against the match cache in data/raw/<event>/matches/, the same
 * files compute-stats.ts reads. Only the item constants need the network, and
 * they are cached after the first run.
 *
 * WHICH ITEMS COUNT
 *
 * A raw purchase count is worthless: tangoes, branches and observer wards
 * dominate every list. Rather than hand-writing an exclusion list — a guess
 * about what matters dressed as a rule — this filters on OpenDota's own `qual`
 * field, dropping anything Valve classifies as a component or a consumable.
 * A short explicit list handles what that misses: Aegis and Cheese are picked
 * up off the ground, not bought, and a Tome of Knowledge is not a build.
 *
 * FINAL INVENTORY, NOT PURCHASES — AND WHY THAT MATTERS
 *
 * Two different questions live here and they have different answers:
 *
 *   - What did players END games holding?  item_0..5 and backpack_0..2,
 *     present on every match.
 *   - What did players BUY?                purchase_log, present only where
 *     the replay was parsed.
 *
 * Final inventory undercounts anything bought and later sold or consumed — a
 * Bottle carried for twenty minutes and sold is invisible. Purchase log
 * catches those but exists for fewer matches. Both are computed, both are
 * reported with their coverage, and the page must say which it is showing.
 * Presenting one as "most used items" without saying which is how a
 * confident-looking wrong number gets published.
 *
 * WHAT THIS CANNOT DO YET
 *
 * §5.2.1 also asks for items new to the patch cycle, and the biggest change
 * against the previous TI. Neither is possible from one event's data: the
 * first needs per-item patch introduction dates, the second needs the
 * previous event ingested. Both are reported as not computed rather than
 * approximated.
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { fetchItems, isParsed } from './lib/opendota.ts';
import type { ItemConstant, MatchDetail } from './lib/opendota.ts';

/** Below this, a rate is noise. Same threshold the hero stats use. */
const MIN_GAMES = 5;

/**
 * Dropped regardless of `qual`, with the reason each is here.
 * Anything added must have a reason — this is the list that quietly becomes
 * "whatever made the numbers look right" if nobody guards it.
 */
const ALWAYS_EXCLUDE: Record<string, string> = {
  aegis: 'picked up off Roshan, not bought',
  cheese: 'dropped by Roshan',
  refresher_shard: 'dropped by Roshan',
  tome_of_knowledge: 'a rune pickup, not a build',
  ward_dispenser: 'the combined ward stack, not an item choice',
  tpscroll: 'universal, bought every game by everyone',
};

interface ItemCount {
  item: string;
  display: string;
  cost: number | null;
  /** Player-games ending with the item held. */
  held: number;
  held_wins: number;
  /** Player-games in which it was bought at least once (parsed replays only). */
  bought: number;
  bought_wins: number;
}

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
    console.error('usage: npm run compute:items -- <event-key>   (e.g. ti08)');
    process.exit(1);
  }

  const cacheDir = fileURLToPath(new URL(`../data/raw/${key}`, import.meta.url));
  const index = JSON.parse(
    await readFile(fileURLToPath(new URL(`../data/computed/${key}/matches.index.json`, import.meta.url)), 'utf8'),
  ) as { matches: { match_id: number; phase: string }[] };

  // Only the event itself. Qualifier games are a different meta on a different
  // patch and would quietly pad every count.
  const eventPhases = new Set(['group', 'main']);
  const inEvent = new Set(
    index.matches.filter((m) => eventPhases.has(m.phase)).map((m) => m.match_id),
  );

  const items = await fetchItems(cacheDir);
  const byId = new Map<number, { key: string } & ItemConstant>();
  for (const [k, v] of Object.entries(items)) {
    if (v && typeof v.id === 'number') byId.set(v.id, { key: k, ...v });
  }

  const all = await readMatches(cacheDir);
  const matches = all.filter((m) => inEvent.has(m.match_id));
  const parsedMatches = matches.filter(isParsed);
  console.log(`${matches.length} event matches (${parsedMatches.length} with parsed replays)`);
  console.log(`${byId.size} items in the constants table\n`);

  const counts = new Map<string, ItemCount>();

  /** Returns the counter for an item, or null if the item is excluded. */
  const ensure = (k: string): ItemCount | null => {
    const constant = items[k];
    if (!constant) return null;
    if (ALWAYS_EXCLUDE[k]) return null;
    if (constant.qual === 'component' || constant.qual === 'consumable') return null;
    if (!counts.has(k)) {
      counts.set(k, {
        item: k,
        display: constant.dname ?? k,
        cost: constant.cost ?? null,
        held: 0,
        held_wins: 0,
        bought: 0,
        bought_wins: 0,
      });
    }
    return counts.get(k)!;
  };

  let playerGames = 0;
  let parsedPlayerGames = 0;

  for (const match of matches) {
    for (const p of match.players) {
      playerGames += 1;
      const isRadiant = p.isRadiant ?? p.player_slot < 128;
      const won = isRadiant === match.radiant_win;

      // Final inventory: main slots plus backpack.
      const slots = [p.item_0, p.item_1, p.item_2, p.item_3, p.item_4, p.item_5,
                     p.backpack_0, p.backpack_1, p.backpack_2];
      const heldKeys = new Set<string>();
      for (const id of slots) {
        if (!id) continue;
        const constant = byId.get(id);
        if (constant) heldKeys.add(constant.key);
      }
      for (const k of heldKeys) {
        const entry = ensure(k);
        if (entry) { entry.held += 1; if (won) entry.held_wins += 1; }
      }

      // Purchases, where the replay was parsed.
      if (Array.isArray(p.purchase_log)) {
        parsedPlayerGames += 1;
        const boughtKeys = new Set(p.purchase_log.map((e) => e.key));
        for (const k of boughtKeys) {
          const entry = ensure(k);
          if (entry) { entry.bought += 1; if (won) entry.bought_wins += 1; }
        }
      }
    }
  }

  const rows = [...counts.values()].filter((c) => c.held > 0 || c.bought > 0);
  const byHeld = [...rows].sort((a, b) => b.held - a.held);
  const byBought = [...rows].sort((a, b) => b.bought - a.bought);

  const rate = (wins: number, games: number): number | null =>
    games >= MIN_GAMES ? Math.round((wins / games) * 1000) / 10 : null;

  console.log(`most held at the final buzzer (of ${playerGames} player-games):`);
  for (const c of byHeld.slice(0, 15)) {
    const wr = rate(c.held_wins, c.held);
    console.log(
      `  ${c.display.padEnd(24)} ${String(c.held).padStart(4)} games` +
        `${wr == null ? '' : `   ${wr}% win`}`,
    );
  }

  if (parsedPlayerGames) {
    console.log(`\nmost purchased (of ${parsedPlayerGames} parsed player-games):`);
    for (const c of byBought.slice(0, 15)) {
      const wr = rate(c.bought_wins, c.bought);
      console.log(
        `  ${c.display.padEnd(24)} ${String(c.bought).padStart(4)} games` +
          `${wr == null ? '' : `   ${wr}% win`}`,
      );
    }

    // The gap between the two lists is the interesting part: an item bought
    // far more often than it is held is one that gets sold or consumed.
    const gaps = rows
      .filter((c) => c.bought >= MIN_GAMES && c.bought > c.held * 1.5)
      .sort((a, b) => b.bought - a.bought)
      .slice(0, 8);
    if (gaps.length) {
      console.log('\nbought far more often than held at the end — sold, consumed, or built away:');
      for (const c of gaps) {
        console.log(`  ${c.display.padEnd(24)} bought ${c.bought}, held ${c.held}`);
      }
    }
  } else {
    console.log('\nno parsed replays: purchase counts unavailable, final inventory only.');
  }

  const outDir = fileURLToPath(new URL(`../data/computed/${key}/`, import.meta.url));
  await mkdir(outDir, { recursive: true });
  await writeFile(
    `${outDir}items.json`,
    `${JSON.stringify(
      {
        _note:
          '"held" counts player-games ENDING with the item in inventory or backpack; it ' +
          'undercounts anything sold or consumed. "bought" counts player-games in which it was ' +
          'purchased at least once, and exists only for parsed replays. They answer different ' +
          'questions and a page must say which it is showing. Win rates below the minimum sample ' +
          'are null, never rounded into existence.',
        _excluded:
          "Items Valve's own constants classify as component or consumable, plus a short " +
          'explicit list of things picked up rather than bought. Each exclusion carries a reason.',
        _not_computed: {
          new_this_patch:
            'Needs per-item patch introduction dates, which this project does not hold yet.',
          change_since_previous_ti:
            'Needs the previous International ingested. Not approximated from one event.',
        },
        _generated_by: 'scripts/compute-item-meta.ts',
        _generated_at: new Date().toISOString(),
        event: key,
        min_games: MIN_GAMES,
        matches: matches.length,
        parsed_matches: parsedMatches.length,
        player_games: playerGames,
        parsed_player_games: parsedPlayerGames,
        always_excluded: ALWAYS_EXCLUDE,
        items: byHeld.map((c) => ({
          ...c,
          held_win_rate: rate(c.held_wins, c.held),
          bought_win_rate: rate(c.bought_wins, c.bought),
        })),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  console.log(`\nwrote ${outDir}items.json`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
