/**
 * Build the hero release table, so "which heroes existed at this event" is a
 * sourced fact rather than an assumption.
 *
 *   npm run ingest:heroes
 *
 * Writes data/entities/heroes.json.
 *
 * Why this needs its own ingest: OpenDota's /api/heroes returns TODAY's pool.
 * Computing "unpicked heroes at TI8" against it would report heroes that did
 * not exist in 2018 as though nobody wanted to play them.
 *
 * Liquipedia's "Heroes by release" page is generated from LiquipediaDB, so its
 * wikitext contains only the query — the data exists solely in the rendered
 * output. That makes `action=parse` the correct endpoint here rather than a
 * shortcut around one: it is part of their API, and their terms document its
 * limit as 1 request per 30 seconds, which this respects. Automated access to
 * *rendered pages* outside the API remains off-limits and is not used.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { fetchJsonCached } from './lib/http.ts';

const API = 'https://liquipedia.net/dota2/api.php';
const PAGE = 'Heroes by release';
/** Their documented ceiling for action=parse is 1 per 30s. Sit outside it. */
const PARSE_INTERVAL_MS = 31_000;

interface ParseResponse {
  parse?: { text?: { '*'?: string } };
  error?: { info?: string };
}

interface HeroRelease {
  /**
   * Liquipedia's own row identifier. This is NOT OpenDota's hero_id — their
   * table lists Crystal Maiden as 3 where OpenDota uses 5. Joins must be by
   * name; this is kept only for traceability back to the source table.
   */
  liquipedia_id: number;
  name: string;
  /** ISO date the hero entered Dota 2. The field everything else keys off. */
  released: string | null;
  dota_allstars_released: string | null;
  version_created: string | null;
}

const stripTags = (html: string): string =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

function parseTable(html: string): HeroRelease[] {
  const rows = html.match(/<tr>([\s\S]*?)<\/tr>/g) ?? [];
  const heroes: HeroRelease[] = [];

  for (const row of rows) {
    const cells = (row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g) ?? []).map((cell) =>
      stripTags(cell.replace(/^<t[dh][^>]*>/, '').replace(/<\/t[dh]>$/, '')),
    );
    if (cells.length < 3) continue;

    const id = Number(cells[1]);
    const name = cells[0];
    if (!name || !Number.isInteger(id) || id <= 0) continue; // header and stray rows

    const isoDate = (value: string | undefined): string | null =>
      value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;

    heroes.push({
      liquipedia_id: id,
      name,
      released: isoDate(cells[2]),
      dota_allstars_released: isoDate(cells[4]),
      version_created: cells[5] || null,
    });
  }
  return heroes;
}

async function main(): Promise<void> {
  const cacheDir = new URL('../data/raw/_shared', import.meta.url).pathname;
  const outUrl = new URL('../data/entities/heroes.json', import.meta.url);

  const url = `${API}?action=parse&page=${encodeURIComponent(PAGE)}&prop=text&format=json`;
  const { data, cached } = await fetchJsonCached<ParseResponse>(url, {
    cachePath: `${cacheDir}/liquipedia-heroes-by-release.json`,
    minIntervalMs: PARSE_INTERVAL_MS,
  });

  if (data.error) throw new Error(`Liquipedia API error: ${data.error.info}`);
  const html = data.parse?.text?.['*'];
  if (!html) throw new Error('No rendered text in the parse response.');

  const heroes = parseTable(html).sort((a, b) => a.name.localeCompare(b.name));
  if (!heroes.length) throw new Error('Parsed zero heroes — the table layout has changed.');

  const missingDate = heroes.filter((h) => !h.released);

  await mkdir(new URL('../data/entities/', import.meta.url).pathname, { recursive: true });
  await writeFile(
    outUrl,
    `${JSON.stringify(
      {
        _note:
          'Hero release dates. `released` is the date the hero entered Dota 2 and determines ' +
          'whether a hero could have been picked at a given event — never assume today\'s hero ' +
          'pool applied to a past tournament. NOTE: `liquipedia_id` is NOT OpenDota\'s hero_id ' +
          '(their table has Crystal Maiden as 3, OpenDota uses 5). Join by name.',
        _attribution: 'Hero release data from Liquipedia, licensed CC-BY-SA 3.0.',
        _source: {
          type: 'url',
          url: `https://liquipedia.net/dota2/${PAGE.replace(/ /g, '_')}`,
          retrieved_at: new Date().toISOString(),
        },
        hero_count: heroes.length,
        heroes,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.log(`${cached ? 'cached' : 'fetched'} · ${heroes.length} heroes`);
  console.log(`earliest release: ${heroes.map((h) => h.released).filter(Boolean).sort()[0]}`);
  console.log(`latest release:   ${heroes.map((h) => h.released).filter(Boolean).sort().at(-1)}`);
  if (missingDate.length) {
    console.log(`\n  ${missingDate.length} heroes have no release date and will be excluded`);
    console.log(`  from every pool: ${missingDate.map((h) => h.name).join(', ')}`);
  }
  console.log(`\nwrote ${outUrl.pathname}`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
