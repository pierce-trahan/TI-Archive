/**
 * Read each participant's account_id directly off their Liquipedia page.
 *
 *   npm run ingest:playerids -- ti08
 *
 * Noxville's tip: a Liquipedia player page carries the player's 32-bit Steam ID
 * — which is exactly OpenDota's account_id — in the infobox `playerid` field,
 * and again in the datdota and dotabuff links. Following the page redirect
 * resolves handle changes automatically (CCnC's page redirects to Quinn).
 *
 * That turns the account_id -> handle join from an inference into a direct,
 * sourced lookup: Liquipedia already told us the event-time handle; this reads
 * the account it belongs to from the same source. The farm-priority guess and
 * the datdota cross-check become validation, not the source of truth.
 *
 * Output: data/proposals/<event>.playerids.json — handle, page, account_id and
 * where on the page it was found, for every participant we could resolve.
 */

import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { fetchJsonCached } from './lib/http.ts';
import { loadEvent } from './lib/events.ts';

const API = 'https://liquipedia.net/dota2/api.php';
const MIN_INTERVAL_MS = 2500;

interface Proposal {
  teams: { team_name: string; players: { handle: string; page: string | null; role: string }[] }[];
}

interface WikiResponse {
  query?: {
    redirects?: { from: string; to: string }[];
    pages?: Record<string, { title?: string; missing?: string; revisions?: { slots: { main: { '*': string } } }[] }>;
  };
}

interface Resolved {
  handle: string;
  page: string;
  redirected_to: string | null;
  account_id: number | null;
  found_in: 'playerid' | 'datdota-link' | 'dotabuff-link' | null;
}

/** All three encode the same 32-bit account_id; prefer the explicit field. */
function extractAccountId(wikitext: string): { id: number; where: Resolved['found_in'] } | null {
  const field = /\|\s*playerid\s*=\s*(\d{3,})/i.exec(wikitext);
  if (field?.[1]) return { id: Number(field[1]), where: 'playerid' };

  const datdota = /datdota\.com\/players\/(\d{3,})/i.exec(wikitext);
  if (datdota?.[1]) return { id: Number(datdota[1]), where: 'datdota-link' };

  const dotabuff = /dotabuff\.com\/players\/(\d{3,})/i.exec(wikitext);
  if (dotabuff?.[1]) return { id: Number(dotabuff[1]), where: 'dotabuff-link' };

  return null;
}

async function fetchPage(
  title: string,
  cacheDir: string,
): Promise<{ wikitext: string | null; redirectedTo: string | null }> {
  const url =
    `${API}?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&redirects=1` +
    `&titles=${encodeURIComponent(title)}`;
  const { data } = await fetchJsonCached<WikiResponse>(url, {
    cachePath: `${cacheDir}/liquipedia/player_${title.replace(/[^A-Za-z0-9]/g, '_')}.json`,
    minIntervalMs: MIN_INTERVAL_MS,
  });

  const redirectedTo = data.query?.redirects?.[0]?.to ?? null;
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined || !page.revisions?.[0]) {
    return { wikitext: null, redirectedTo };
  }
  return { wikitext: page.revisions[0].slots.main['*'], redirectedTo };
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run ingest:playerids -- <event-key>');
    process.exit(1);
  }

  const event = await loadEvent(key);
  const cacheDir = fileURLToPath(new URL(`../data/raw/${key}`, import.meta.url));
  const proposal = JSON.parse(
    await import('node:fs/promises').then((fs) =>
      fs.readFile(new URL(`../data/proposals/${key}.liquipedia.json`, import.meta.url), 'utf8'),
    ),
  ) as Proposal;

  const all = proposal.teams.flatMap((t) => t.players);
  console.log(`${event.name} — ${all.length} participants\n`);

  const resolved: Resolved[] = [];
  let found = 0;

  for (const player of all) {
    // The participant template's `link=` overrides the page name; default is the handle.
    const page = player.page ?? player.handle;
    const { wikitext, redirectedTo } = await fetchPage(page, cacheDir);

    const hit = wikitext ? extractAccountId(wikitext) : null;
    if (hit) found++;

    resolved.push({
      handle: player.handle,
      page,
      redirected_to: redirectedTo,
      account_id: hit?.id ?? null,
      found_in: hit?.where ?? null,
    });

    const mark = hit ? '✓' : '·';
    const via = hit ? hit.where : wikitext ? 'no id on page' : 'page missing';
    console.log(`  ${mark} ${player.handle.padEnd(16)} ${hit?.id ?? '—'}  (${via})`);
  }

  await writeFile(
    new URL(`../data/proposals/${key}.playerids.json`, import.meta.url),
    `${JSON.stringify(
      {
        _generated_by: 'scripts/ingest-player-ids.ts',
        _generated_at: new Date().toISOString(),
        _note:
          'account_id read directly from each Liquipedia player page (infobox playerid, ' +
          'or the datdota/dotabuff link). A direct sourced join, not an inference.',
        _attribution: 'Player account IDs from Liquipedia, licensed CC-BY-SA 3.0.',
        event: key,
        resolved: found,
        total: all.length,
        players: resolved,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`\nresolved ${found}/${all.length} account_ids directly from Liquipedia`);
  console.log(`wrote data/proposals/${key}.playerids.json`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
