/**
 * Download player photographs from Liquipedia for an event's rosters.
 *
 *   npm run fetch:photos -- ti08
 *
 * MOST PLAYERS WILL NOT HAVE ONE, AND THAT IS THE NORMAL CASE.
 *
 * Liquipedia's photo coverage of 2018 is patchy and thinnest exactly where
 * this archive most wants it — SEA and CIS qualifier players, and anyone who
 * left the scene soon after. A design that treats a missing photo as an error
 * state will look broken for a large share of the field forever.
 *
 * So absence is the expected path, not the failure path. Every player gets a
 * `photo` record either way; players without a photograph get a deterministic
 * generated mark instead, and the manifest says which is which. Nothing
 * downstream needs to branch on a missing file, and nothing renders a broken
 * image or a stand-in that could be mistaken for a real person.
 *
 * WHAT THE PLACEHOLDER IS, AND ISN'T
 *
 * It is the player's initials on a colour derived from their account_id, as
 * an inline SVG. Deterministic, so a player looks the same on every page and
 * across rebuilds. Obviously typographic, so nobody mistakes it for a
 * photograph. Per DESIGN.md §8.1 rule 4, absence must be visible rather than
 * papered over — the prototype's habit of substituting one team's logo for
 * another is the exact failure being avoided.
 *
 * It is NOT a stock avatar, a silhouette, or another player's photo.
 *
 * LICENSING — different from team logos, and worth reading.
 *
 * Team logos are trademarks used to identify a team. These are photographs of
 * real people, usually taken by event photographers, and Liquipedia's own
 * file pages carry per-image licence terms that vary. The script records each
 * file's stated licence and author where the API exposes them, and flags any
 * photo whose terms it could not read, so the decision to publish is made
 * per-image rather than in bulk.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { fetchJsonCached, USER_AGENT } from './lib/http.ts';

const DOTA_API = 'https://liquipedia.net/dota2/api.php';
const COMMONS_API = 'https://liquipedia.net/commons/api.php';
const THUMB_WIDTH = 200;
const MIN_INTERVAL_MS = 2000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastDownload = 0;

interface RosterPlayer {
  handle: string;
  account_id: number | null;
  /** Liquipedia page name when it differs from the handle. */
  page?: string | null;
  position?: number;
  role?: string;
}

interface RosterTeam {
  team_id: number | null;
  team_name: string;
  players: RosterPlayer[];
}

interface WikitextResponse {
  query?: { pages?: Record<string, { missing?: string; revisions?: { slots: { main: { '*': string } } }[] }> };
  error?: { info: string };
}

interface ImageInfoResponse {
  query?: {
    pages?: Record<
      string,
      {
        missing?: string;
        imageinfo?: {
          url: string;
          thumburl?: string;
          extmetadata?: Record<string, { value?: string }>;
        }[];
      }
    >;
  };
  error?: { info: string };
}

/** A player's Liquipedia page, for the |image= field. */
async function fetchPlayerWikitext(title: string, cacheDir: string): Promise<string | null> {
  const url =
    `${DOTA_API}?action=query&prop=revisions&rvprop=content&rvslots=main&format=json` +
    `&titles=${encodeURIComponent(title)}`;
  const { data } = await fetchJsonCached<WikitextResponse>(url, {
    cachePath: `${cacheDir}/players/${title.replace(/[^A-Za-z0-9]/g, '_')}.json`,
    minIntervalMs: MIN_INTERVAL_MS,
  });
  if (data.error) return null;
  const page = Object.values(data.query?.pages ?? {})[0];
  if (!page || page.missing !== undefined) return null;
  return page.revisions?.[0]?.slots.main['*'] ?? null;
}

function imageField(wikitext: string): string | null {
  const match = /\|\s*image\s*=\s*([^|\n}]+)/i.exec(wikitext);
  const value = match?.[1]?.trim();
  return value && !/^\s*$/.test(value) ? value : null;
}

interface PhotoMeta {
  thumb_url: string;
  licence: string | null;
  author: string | null;
  credit: string | null;
}

async function fetchPhotoMeta(fileName: string, cacheDir: string): Promise<PhotoMeta | null> {
  const title = fileName.startsWith('File:') ? fileName : `File:${fileName}`;
  const url =
    `${COMMONS_API}?action=query&titles=${encodeURIComponent(title)}` +
    `&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=${THUMB_WIDTH}&format=json`;
  const { data } = await fetchJsonCached<ImageInfoResponse>(url, {
    cachePath: `${cacheDir}/photo-meta/${fileName.replace(/[^A-Za-z0-9._-]/g, '_')}.json`,
    minIntervalMs: MIN_INTERVAL_MS,
  });
  if (data.error) return null;
  for (const page of Object.values(data.query?.pages ?? {})) {
    if (page.missing !== undefined) return null;
    const info = page.imageinfo?.[0];
    if (!info) return null;
    const meta = info.extmetadata ?? {};
    const strip = (v?: string) => (v ? v.replace(/<[^>]+>/g, '').trim() || null : null);
    return {
      thumb_url: info.thumburl ?? info.url,
      licence: strip(meta['LicenseShortName']?.value) ?? strip(meta['License']?.value),
      author: strip(meta['Artist']?.value),
      credit: strip(meta['Credit']?.value),
    };
  }
  return null;
}

async function download(url: string, destination: string): Promise<number> {
  const wait = lastDownload + MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastDownload = Date.now();
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`${url} -> ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, bytes);
  return bytes.length;
}

/**
 * Up to two initials from a handle: "Topson" -> "TO", "s4" -> "S4",
 * "Fear" -> "FE", "N0tail" -> "N0". Handles are not names, so this takes
 * leading characters rather than trying to find word boundaries that mostly
 * do not exist.
 */
function initials(handle: string): string {
  const cleaned = handle.replace(/[^A-Za-z0-9]/g, '');
  if (!cleaned) return '??';
  const parts = handle.split(/[\s._-]+/).filter(Boolean);
  if (parts.length > 1) {
    const a = parts[0]![0];
    const b = parts[1]![0];
    if (a && b) return (a + b).toUpperCase();
  }
  return cleaned.slice(0, 2).toUpperCase();
}

/**
 * A deterministic mark for a player with no photograph.
 *
 * Hue comes from the account_id so it is stable across rebuilds and identical
 * everywhere the player appears. Colours are given as CSS custom properties
 * with fallbacks, so the mark themes with the page instead of fighting it.
 */
function placeholderSvg(handle: string, accountId: number | null): string {
  const hue = accountId != null ? accountId % 360 : 0;
  const text = initials(handle);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="No photograph available for ${handle
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')}">
  <rect width="96" height="96" rx="6" fill="hsl(${hue} 22% 82%)"/>
  <text x="48" y="48" text-anchor="middle" dominant-baseline="central"
        font-family="ui-monospace, Consolas, monospace" font-size="34" font-weight="600"
        fill="hsl(${hue} 30% 30%)">${text}</text>
</svg>
`;
}

interface PhotoRecord {
  account_id: number | null;
  handle: string;
  team: string;
  /** "photo" or "placeholder" — every player has one of the two. */
  kind: 'photo' | 'placeholder';
  local_path: string;
  source_url: string | null;
  licence: string | null;
  author: string | null;
  credit: string | null;
  retrieved_at: string;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run fetch:photos -- <event-key>   (e.g. ti08)');
    process.exit(1);
  }

  const rosters = JSON.parse(
    await readFile(fileURLToPath(new URL(`../data/events/${key}.rosters.json`, import.meta.url)), 'utf8'),
  ) as { teams?: RosterTeam[]; rosters?: RosterTeam[] };
  const teams = rosters.teams ?? rosters.rosters ?? [];

  const photoDir = fileURLToPath(new URL('../data/assets/players/', import.meta.url));
  const placeholderDir = fileURLToPath(new URL('../data/assets/players/placeholder/', import.meta.url));
  await mkdir(photoDir, { recursive: true });
  await mkdir(placeholderDir, { recursive: true });
  const cacheDir = fileURLToPath(new URL(`../data/raw/${key}`, import.meta.url));

  const players = teams.flatMap((t) => t.players.map((p) => ({ ...p, team: t.team_name })));
  console.log(`${teams.length} teams, ${players.length} players\n`);

  const records: PhotoRecord[] = [];
  let withPhoto = 0;
  let placeheld = 0;
  const unclearLicence: string[] = [];

  for (const player of players) {
    const slug = `${player.handle.replace(/[^A-Za-z0-9._-]/g, '_')}${
      player.account_id ? `_${player.account_id}` : ''
    }`;
    const base: Omit<PhotoRecord, 'kind' | 'local_path' | 'source_url' | 'licence' | 'author' | 'credit'> = {
      account_id: player.account_id ?? null,
      handle: player.handle,
      team: player.team,
      retrieved_at: new Date().toISOString(),
    };

    let meta: PhotoMeta | null = null;
    try {
      const wikitext = await fetchPlayerWikitext(player.page || player.handle, cacheDir);
      const file = wikitext ? imageField(wikitext) : null;
      if (file) meta = await fetchPhotoMeta(file, cacheDir);
    } catch (error) {
      console.log(`  ! ${player.handle}: lookup failed (${(error as Error).message}) — using placeholder`);
    }

    if (meta) {
      try {
        const name = `${slug}.png`;
        const size = await download(meta.thumb_url, `${photoDir}${name}`);
        records.push({
          ...base,
          kind: 'photo',
          local_path: `data/assets/players/${name}`,
          source_url: meta.thumb_url,
          licence: meta.licence,
          author: meta.author,
          credit: meta.credit,
        });
        withPhoto += 1;
        if (!meta.licence) unclearLicence.push(player.handle);
        console.log(
          `  ${player.handle.padEnd(16)} photo ${(size / 1024).toFixed(1).padStart(6)} KB  ${
            meta.licence ?? 'LICENCE NOT STATED'
          }`,
        );
        continue;
      } catch (error) {
        console.log(`  ! ${player.handle}: download failed (${(error as Error).message}) — using placeholder`);
      }
    }

    const name = `${slug}.svg`;
    await writeFile(`${placeholderDir}${name}`, placeholderSvg(player.handle, player.account_id ?? null), 'utf8');
    records.push({
      ...base,
      kind: 'placeholder',
      local_path: `data/assets/players/placeholder/${name}`,
      source_url: null,
      licence: null,
      author: null,
      credit: null,
    });
    placeheld += 1;
    console.log(`  ${player.handle.padEnd(16)} placeholder (${initials(player.handle)})`);
  }

  const manifestPath = fileURLToPath(new URL(`../data/research/${key}.player-photos.json`, import.meta.url));
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        _note:
          'One record per player, always. `kind` is "photo" or "placeholder"; a placeholder is a ' +
          "generated initials mark, never a stock avatar and never another player's photograph. " +
          'Missing photos are the normal case for 2018 and are not an error state.',
        _licensing:
          'Photographs are of real people and their licence terms vary per file, unlike team ' +
          'logos. Each record carries the licence, author and credit Liquipedia states. Review ' +
          'any record whose licence is null before publishing that image.',
        _generated_by: 'scripts/fetch-player-photos.ts',
        _generated_at: new Date().toISOString(),
        event: key,
        thumb_width: THUMB_WIDTH,
        player_count: records.length,
        photo_count: withPhoto,
        placeholder_count: placeheld,
        players: records,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  const pct = records.length ? Math.round((withPhoto / records.length) * 100) : 0;
  console.log(`\n${withPhoto} photo(s), ${placeheld} placeholder(s) — ${pct}% coverage`);
  if (unclearLicence.length) {
    console.log(`\n${unclearLicence.length} photo(s) have NO stated licence. Review before publishing:`);
    for (const h of unclearLicence) console.log(`  ${h}`);
  }
  console.log(`\nmanifest -> ${manifestPath}`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
