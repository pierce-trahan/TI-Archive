/**
 * Download the team logos referenced by a season's tournament data.
 *
 *   npm run fetch:logos -- ti08
 *
 * Reads data/research/<event>.liquipedia-tournaments.json, collects every
 * winner and runner-up logo, and saves each one locally. The archive is
 * offline-first, so hotlinking Liquipedia is not an option — and re-fetching
 * their images on every page view would be rude besides.
 *
 * TWO THINGS THIS DOES NOT GUESS AT
 *
 * 1. Dark-theme variants. Liquipedia files carry a theme suffix, and a
 *    "lightmode" logo can vanish against the archive's dark background. The
 *    obvious move is to swap "lightmode" for "darkmode" in the filename and
 *    hope — but a file that doesn't exist yields a broken image, and one that
 *    exists under a different name is missed. So the candidate name is
 *    CHECKED against the API before use, and a team with no darkmode file is
 *    reported rather than quietly left to render badly.
 *
 * 2. Thumbnail size. The tier tables link thumbnails at whatever width suited
 *    that table — 34px, 48px, 100px — which would make the chart's logos a
 *    jumble of resolutions. Rather than rewriting the width into the URL by
 *    hand, this asks the API for a thumbnail at one consistent width.
 *
 * LICENSING — READ BEFORE COMMITTING THE OUTPUT
 *
 * Liquipedia's text is CC-BY-SA 3.0, but team logos are trademarks of their
 * organisations, hosted by Liquipedia under fair use rather than released
 * under that licence. Downloading them for local use is one thing;
 * redistributing them in a public repository is a different question, and it
 * is the owner's call, not this script's. Output therefore goes to
 * data/raw/logos/ (gitignored) by default. Pass --commit to write to
 * data/assets/logos/ instead, once that call has been made.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { fetchJsonCached, USER_AGENT } from './lib/http.ts';

/** Team logos live on Liquipedia Commons, not on the Dota 2 wiki. */
const COMMONS_API = 'https://liquipedia.net/commons/api.php';
/** One width for every logo, so the chart's rows line up. */
const THUMB_WIDTH = 160;
const MIN_INTERVAL_MS = 2000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let lastDownload = 0;

interface TeamRef {
  name: string | null;
  logo_url: string | null;
  logo_variant: string | null;
}

interface TournamentRow {
  tournament: string | null;
  winner: TeamRef;
  runner_up: TeamRef;
}

interface ImageInfoResponse {
  query?: {
    pages?: Record<
      string,
      { title?: string; missing?: string; imageinfo?: { url: string; thumburl?: string }[] }
    >;
  };
  error?: { info: string };
}

/**
 * "https://liquipedia.net/commons/images/thumb/1/1d/Virtus.pro_allmode.png/48px-Virtus.pro_allmode.png"
 * -> "Virtus.pro_allmode.png"
 *
 * Both thumbnail and full-size URLs appear; a thumbnail puts the real file
 * name in the second-to-last path segment, a full-size URL in the last.
 */
function fileNameFromUrl(url: string): string | null {
  const parts = url.split('/').filter(Boolean);
  if (url.includes('/thumb/')) {
    const name = parts.at(-2);
    return name ? decodeURIComponent(name) : null;
  }
  const name = parts.at(-1);
  return name ? decodeURIComponent(name) : null;
}

/**
 * Asks the API for a file's thumbnail at THUMB_WIDTH.
 * Returns null when the file does not exist — which is the point: it lets a
 * darkmode candidate be tested rather than assumed.
 */
async function resolveThumb(fileName: string, cacheDir: string): Promise<string | null> {
  const url =
    `${COMMONS_API}?action=query&titles=${encodeURIComponent(`File:${fileName}`)}` +
    `&prop=imageinfo&iiprop=url&iiurlwidth=${THUMB_WIDTH}&format=json`;
  const { data } = await fetchJsonCached<ImageInfoResponse>(url, {
    cachePath: `${cacheDir}/logo-meta/${fileName.replace(/[^A-Za-z0-9._-]/g, '_')}.json`,
    minIntervalMs: MIN_INTERVAL_MS,
  });
  if (data.error) throw new Error(`imageinfo for ${fileName}: ${data.error.info}`);

  for (const page of Object.values(data.query?.pages ?? {})) {
    if (page.missing !== undefined) return null;
    const info = page.imageinfo?.[0];
    if (info) return info.thumburl ?? info.url;
  }
  return null;
}

/** The darkmode counterpart of a lightmode file, if one actually exists. */
async function findDarkVariant(fileName: string, cacheDir: string): Promise<string | null> {
  if (!/lightmode/i.test(fileName)) return null;
  const candidate = fileName.replace(/lightmode/gi, 'darkmode');
  const thumb = await resolveThumb(candidate, cacheDir);
  return thumb ? candidate : null;
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

interface LogoRecord {
  team: string;
  /** The file as referenced by the tournament table. */
  file: string;
  variant: string | null;
  local_path: string;
  source_url: string;
  /** Present only when a darkmode file was confirmed to exist. */
  dark_file: string | null;
  dark_local_path: string | null;
  dark_source_url: string | null;
  retrieved_at: string;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  const commit = process.argv.includes('--commit');
  if (!key) {
    console.error('usage: npm run fetch:logos -- <event-key> [--commit]');
    process.exit(1);
  }

  const inPath = fileURLToPath(
    new URL(`../data/research/${key}.liquipedia-tournaments.json`, import.meta.url),
  );
  let parsed: { rows?: TournamentRow[] };
  try {
    parsed = JSON.parse(await readFile(inPath, 'utf8')) as { rows?: TournamentRow[] };
  } catch {
    console.error(`Could not read ${inPath}`);
    console.error('Run `npm run research:liquipedia -- <event-key> <years>` first.');
    process.exit(1);
  }
  const rows = parsed.rows ?? [];

  // One entry per distinct file; a team that won five events is downloaded once.
  const wanted = new Map<string, { team: string; variant: string | null }>();
  for (const row of rows) {
    for (const team of [row.winner, row.runner_up]) {
      if (!team?.logo_url || !team.name) continue;
      const file = fileNameFromUrl(team.logo_url);
      if (file && !wanted.has(file)) wanted.set(file, { team: team.name, variant: team.logo_variant });
    }
  }

  const outDir = fileURLToPath(
    new URL(commit ? '../data/assets/logos/' : '../data/raw/logos/', import.meta.url),
  );
  await mkdir(outDir, { recursive: true });
  const cacheDir = fileURLToPath(new URL(`../data/raw/${key}`, import.meta.url));

  console.log(`${rows.length} tournament row(s); ${wanted.size} distinct logo file(s)`);
  console.log(`writing to ${outDir}${commit ? '' : '  (gitignored — pass --commit to change)'}\n`);

  const records: LogoRecord[] = [];
  const noDark: string[] = [];
  const failed: string[] = [];

  for (const [file, { team, variant }] of wanted) {
    try {
      const thumb = await resolveThumb(file, cacheDir);
      if (!thumb) {
        console.log(`  MISSING  ${team} — ${file} does not exist on Liquipedia Commons`);
        failed.push(`${team} (${file})`);
        continue;
      }

      const localName = file.replace(/[^A-Za-z0-9._-]/g, '_');
      const size = await download(thumb, `${outDir}${localName}`);

      let darkFile: string | null = null;
      let darkLocal: string | null = null;
      let darkThumb: string | null = null;
      if (variant === 'lightmode') {
        darkFile = await findDarkVariant(file, cacheDir);
        if (darkFile) {
          darkThumb = await resolveThumb(darkFile, cacheDir);
          if (darkThumb) {
            darkLocal = darkFile.replace(/[^A-Za-z0-9._-]/g, '_');
            await download(darkThumb, `${outDir}${darkLocal}`);
          }
        } else {
          noDark.push(`${team} (${file})`);
        }
      }

      records.push({
        team,
        file,
        variant,
        local_path: `${commit ? 'data/assets/logos/' : 'data/raw/logos/'}${localName}`,
        source_url: thumb,
        dark_file: darkFile,
        dark_local_path: darkLocal ? `${commit ? 'data/assets/logos/' : 'data/raw/logos/'}${darkLocal}` : null,
        dark_source_url: darkThumb,
        retrieved_at: new Date().toISOString(),
      });

      const darkNote = darkLocal ? ' + darkmode' : variant === 'lightmode' ? ' (NO darkmode found)' : '';
      console.log(`  ${team.padEnd(22)} ${(size / 1024).toFixed(1).padStart(6)} KB${darkNote}`);
    } catch (error) {
      console.log(`  FAILED   ${team} — ${(error as Error).message}`);
      failed.push(`${team} (${file})`);
    }
  }

  const manifestPath = fileURLToPath(new URL(`../data/research/${key}.logos.json`, import.meta.url));
  await writeFile(
    manifestPath,
    `${JSON.stringify(
      {
        _note:
          'Team logo files downloaded from Liquipedia Commons at a single consistent width. ' +
          'dark_file is populated only where a darkmode file was CONFIRMED to exist — it is ' +
          'never derived from the lightmode name without checking.',
        _licensing:
          "Liquipedia's text is CC-BY-SA 3.0, but team logos are the trademarks of their " +
          'organisations and are hosted there under fair use, not under that licence. Confirm ' +
          'redistribution is acceptable before committing these files to a public repository.',
        _generated_by: 'scripts/fetch-team-logos.ts',
        _generated_at: new Date().toISOString(),
        event: key,
        thumb_width: THUMB_WIDTH,
        committed: commit,
        logo_count: records.length,
        logos: records,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`\n${records.length} logo(s) saved`);
  if (noDark.length) {
    console.log(`\n${noDark.length} lightmode logo(s) have NO darkmode counterpart on Liquipedia:`);
    for (const item of noDark) console.log(`  ${item}`);
    console.log('  These need a background treatment in the UI rather than a swapped file.');
  }
  if (failed.length) {
    console.log(`\n${failed.length} failed:`);
    for (const item of failed) console.log(`  ${item}`);
  }
  console.log(`\nmanifest -> ${manifestPath}`);
  if (!commit) {
    console.log(
      '\nFiles are in a gitignored directory. Read the _licensing note in the manifest before ' +
        're-running with --commit.',
    );
  }
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
