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
 * THE PHOTO MUST FIT THE EVENT'S ERA
 *
 * A player page's infobox image is their CURRENT photo. Fly's and Abed's are
 * from 2026. Putting those on a 2018 page is the same error as rendering Evil
 * Geniuses as "Shopify Rebellion" — right subject, wrong decade.
 *
 * Liquipedia pages also carry a dated gallery, which is where an
 * era-appropriate photograph actually lives. This prefers a photo taken at
 * the event itself, then one from the same year, then the nearest available —
 * and records which it used and how far off it is, so a page can say when the
 * picture is from rather than implying it is contemporary.
 *
 * LICENSING — different from team logos, and worth reading.
 *
 * Team logos are trademarks used to identify a team. These are photographs of
 * real people, usually taken by event photographers, with per-file terms.
 *
 * A first version read licences from the imageinfo API's `extmetadata`, which
 * returned nothing for all 55 photos in the first TI8 run — not because they
 * lack licences, but because `extmetadata` comes from the CommonsMetadata
 * extension, which Liquipedia does not appear to run. Fifty-five false alarms
 * from one wrong assumption. Licences now come from each File: page's own
 * wikitext.
 *
 * Worth knowing before publishing any of these: many infobox images carry the
 * comment "the copyright holder of the picture needs to send the picture and
 * permission to use it to photos@liquipedia.net", which suggests Liquipedia
 * hosts them by permission granted to Liquipedia rather than under a licence
 * that travels. Permission to them is not permission to us. Read what each
 * File: page actually says before treating any of this as redistributable.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { fetchJsonCached, USER_AGENT } from './lib/http.ts';
import { loadEvent } from './lib/events.ts';

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
    pages?: Record<string, { missing?: string; imageinfo?: { url: string; thumburl?: string }[] }>;
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

interface PhotoCandidate {
  file: string;
  /** Year the photograph was taken, where the filename or caption states one. */
  year: number | null;
  caption: string | null;
  origin: 'infobox' | 'gallery';
}

/**
 * Every photograph a player's page offers, with the year where it is stated.
 *
 * Two traps here, both found by comparing real pages.
 *
 * The infobox value often carries an HTML comment:
 *
 *     |image=SumaiL 2025 PGL Wallachia Season 3.jpg<!--the copyright holder…-->
 *
 * Reading to the next pipe swallows the comment into the filename, the lookup
 * misses, and the player silently gets a placeholder despite having a photo.
 *
 * More importantly, the infobox photo is the player's CURRENT one — Fly's is
 * from 2026. Putting that on a 2018 page is the same error as rendering Evil
 * Geniuses as "Shopify Rebellion". The dated gallery below it is where an
 * era-appropriate photograph actually lives.
 */
function photoCandidates(wikitext: string): PhotoCandidate[] {
  const candidates: PhotoCandidate[] = [];
  const yearOf = (text: string): number | null => {
    const years = [...text.matchAll(/\b(19[89]\d|20[0-4]\d)\b/g)].map((m) => Number(m[1]));
    // Last wins: "SumaiL2 ESL Frankfurt 2015" — the trailing year is the event's.
    return years.length ? years[years.length - 1]! : null;
  };

  // Stop at "<" so an HTML comment can never become part of the filename.
  const infobox = /\|\s*image\s*=\s*([^|\n}<]+)/i.exec(wikitext)?.[1]?.trim();
  if (infobox) {
    candidates.push({ file: infobox, year: yearOf(infobox), caption: null, origin: 'infobox' });
  }

  // Gallery entries: "File name.jpg|Caption mentioning the event and year".
  for (const line of wikitext.split('\n')) {
    const match = /^\s*([^|\n<>[\]]+\.(?:jpe?g|png|webp|gif))\s*\|(.*)$/i.exec(line);
    if (!match) continue;
    const file = match[1]!.trim();
    const caption = match[2]!.trim();
    if (candidates.some((c) => c.file === file)) continue;
    candidates.push({ file, year: yearOf(`${file} ${caption}`), caption: caption || null, origin: 'gallery' });
  }
  return candidates;
}

/**
 * Picks the photograph closest to the event, preferring one taken at the
 * event itself.
 *
 * The owner's instruction: "from that TI or if one is available from that
 * year use that." So exact-event beats same-year beats nearest-year, and how
 * far off the chosen photo is gets recorded rather than hidden — a reader
 * looking at a 2018 page deserves to know when the picture is from 2021.
 */
function pickPhoto(
  candidates: PhotoCandidate[],
  eventYear: number,
  eventName: string,
): { choice: PhotoCandidate; reason: string } | null {
  if (!candidates.length) return null;

  const atEvent = candidates.find(
    (c) =>
      c.year === eventYear &&
      new RegExp(eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(
        `${c.file} ${c.caption ?? ''}`,
      ),
  );
  if (atEvent) return { choice: atEvent, reason: 'taken at this event' };

  const sameYear = candidates.filter((c) => c.year === eventYear);
  if (sameYear.length) return { choice: sameYear[0]!, reason: `same year (${eventYear})` };

  const dated = candidates.filter((c) => c.year != null);
  if (dated.length) {
    const nearest = dated.reduce((best, c) =>
      Math.abs(c.year! - eventYear) < Math.abs(best.year! - eventYear) ? c : best,
    );
    const delta = nearest.year! - eventYear;
    return {
      choice: nearest,
      reason: `nearest available (${nearest.year}, ${delta > 0 ? '+' : ''}${delta} years)`,
    };
  }

  // Undated, so almost certainly the current infobox photo. Usable, but the
  // manifest must say the year is unknown rather than implying it fits.
  return { choice: candidates[0]!, reason: 'undated — year unknown' };
}

interface PhotoMeta {
  thumb_url: string;
  licence: string | null;
  author: string | null;
  credit: string | null;
}

/**
 * A file's licence, read from its own File: page.
 *
 * The first version of this read `extmetadata` from the imageinfo API, which
 * returned nothing for all 55 photos in the first TI8 run. That is not
 * Liquipedia stating "no licence" — `extmetadata` comes from the
 * CommonsMetadata extension, which their wiki does not appear to run, so the
 * field is simply absent. Reporting 55 photos as licence-unknown on that
 * basis was a false alarm generated entirely by this script.
 *
 * The File: page's own wikitext is where the terms actually live.
 */
async function fetchFileLicence(
  fileName: string,
  cacheDir: string,
): Promise<{ licence: string | null; author: string | null; raw: string | null }> {
  const title = fileName.startsWith('File:') ? fileName : `File:${fileName}`;
  const url =
    `${COMMONS_API}?action=query&prop=revisions&rvprop=content&rvslots=main&format=json` +
    `&titles=${encodeURIComponent(title)}`;
  try {
    const { data } = await fetchJsonCached<WikitextResponse>(url, {
      cachePath: `${cacheDir}/file-pages/${fileName.replace(/[^A-Za-z0-9._-]/g, '_')}.json`,
      minIntervalMs: MIN_INTERVAL_MS,
    });
    const page = Object.values(data.query?.pages ?? {})[0];
    const wikitext = page?.revisions?.[0]?.slots.main['*'];
    if (!wikitext) return { licence: null, author: null, raw: null };

    const licence =
      /\|\s*licen[cs]e\s*=\s*([^|\n}]+)/i.exec(wikitext)?.[1]?.trim() ??
      /\{\{\s*(cc-[^|}\s]+|fairuse|permission[^|}\s]*)/i.exec(wikitext)?.[1]?.trim() ??
      null;
    const author =
      /\|\s*(?:author|photographer|source)\s*=\s*([^|\n}]+)/i.exec(wikitext)?.[1]?.trim() ?? null;
    return { licence, author, raw: wikitext.slice(0, 400) };
  } catch {
    return { licence: null, author: null, raw: null };
  }
}

async function fetchPhotoMeta(fileName: string, cacheDir: string): Promise<PhotoMeta | null> {
  const title = fileName.startsWith('File:') ? fileName : `File:${fileName}`;
  const url =
    `${COMMONS_API}?action=query&titles=${encodeURIComponent(title)}` +
    `&prop=imageinfo&iiprop=url&iiurlwidth=${THUMB_WIDTH}&format=json`;
  const { data } = await fetchJsonCached<ImageInfoResponse>(url, {
    cachePath: `${cacheDir}/photo-meta/${fileName.replace(/[^A-Za-z0-9._-]/g, '_')}.json`,
    minIntervalMs: MIN_INTERVAL_MS,
  });
  if (data.error) return null;
  for (const page of Object.values(data.query?.pages ?? {})) {
    if (page.missing !== undefined) return null;
    const info = page.imageinfo?.[0];
    if (!info) return null;
    const licence = await fetchFileLicence(fileName, cacheDir);
    return {
      thumb_url: info.thumburl ?? info.url,
      licence: licence.licence,
      author: licence.author,
      credit: licence.raw,
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
  /** Year the photograph was taken, where the source states one. */
  photo_year: number | null;
  /** Why this photo was chosen over the others on the player's page. */
  photo_choice: string | null;
  /** True when the photo is from a different year than the event. */
  off_era: boolean;
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

  const event = await loadEvent(key);
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
  const offEraPhotos: string[] = [];

  for (const player of players) {
    const slug = `${player.handle.replace(/[^A-Za-z0-9._-]/g, '_')}${
      player.account_id ? `_${player.account_id}` : ''
    }`;
    const base: Pick<PhotoRecord, 'account_id' | 'handle' | 'team' | 'retrieved_at'> = {
      account_id: player.account_id ?? null,
      handle: player.handle,
      team: player.team,
      retrieved_at: new Date().toISOString(),
    };

    let meta: PhotoMeta | null = null;
    let picked: { choice: PhotoCandidate; reason: string } | null = null;
    try {
      const wikitext = await fetchPlayerWikitext(player.page || player.handle, cacheDir);
      if (wikitext) {
        picked = pickPhoto(photoCandidates(wikitext), event.year, event.name);
        if (picked) meta = await fetchPhotoMeta(picked.choice.file, cacheDir);
      }
    } catch (error) {
      console.log(`  ! ${player.handle}: lookup failed (${(error as Error).message}) — using placeholder`);
    }

    if (meta && picked) {
      try {
        const ext = /\.([a-z0-9]+)$/i.exec(meta.thumb_url)?.[1]?.toLowerCase() ?? 'png';
        const name = `${slug}.${ext}`;
        const size = await download(meta.thumb_url, `${photoDir}${name}`);
        const year = picked.choice.year;
        const offEra = year != null && year !== event.year;
        records.push({
          ...base,
          kind: 'photo',
          local_path: `data/assets/players/${name}`,
          photo_year: year,
          photo_choice: picked.reason,
          off_era: offEra,
          source_url: meta.thumb_url,
          licence: meta.licence,
          author: meta.author,
          credit: meta.credit,
        });
        withPhoto += 1;
        if (!meta.licence) unclearLicence.push(player.handle);
        if (offEra || year == null) offEraPhotos.push(`${player.handle} — ${picked.reason}`);
        console.log(
          `  ${player.handle.padEnd(16)} ${(size / 1024).toFixed(1).padStart(6)} KB  ` +
            `${(picked.reason).padEnd(30)} ${meta.licence ?? 'licence unread'}`,
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
      photo_year: null,
      photo_choice: null,
      off_era: false,
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
        event_year: event.year,
        thumb_width: THUMB_WIDTH,
        off_era_count: offEraPhotos.length,
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
  if (offEraPhotos.length) {
    console.log(
      `\n${offEraPhotos.length} photo(s) are NOT from ${event.year}. Usable, but the page should ` +
        `say when the picture is from:`,
    );
    for (const p of offEraPhotos) console.log(`  ${p}`);
  }
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
