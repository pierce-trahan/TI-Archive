/**
 * The Teams & Players section: every team at an event, in placement order,
 * with each player's photograph, the team's season titles, and their prize.
 *
 *   npm run build:rosters -- ti08
 *   npm run build:rosters -- ti08 --inline    # data URIs, for the CSP'd review page
 *
 * Pulls together four committed sources: rosters and placements from
 * Liquipedia, the season's tier-1/tier-2 tournaments, and the player photo
 * manifest. Nothing here fetches anything.
 *
 * THREE THINGS IT REFUSES TO FUDGE
 *
 * Photographs are often not from the event's year. Liquipedia's galleries are
 * uneven, so a 2018 page may be the best available. Where the photo is
 * off-era the year is shown on the card rather than left to imply it is
 * contemporary, and a player with no photograph gets their generated initials
 * mark — never a stock avatar and never someone else's face.
 *
 * Season titles are aggregated by team name, which breaks across a rename:
 * TNC won China Top 2017 as "TNC Pro Team" and played TI8 as "TNC Predator".
 * data/entities/team-aliases.json carries those, with sources, so the counts
 * are right without the matching being silently generous.
 *
 * Season prize money is NOT computed. We hold each season event's winner and
 * its total pool, but not its full prize distribution, so a team's earnings
 * across the season cannot be derived — only guessed at. It renders as "not
 * recorded" until the per-tournament prize tables are pulled. TI prize money
 * is real and comes from the placements file.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const INLINE = process.argv.includes('--inline');
const inlined = new Map<string, string>();

async function dataUri(relativePath: string): Promise<string | null> {
  const cached = inlined.get(relativePath);
  if (cached) return cached;
  try {
    const bytes = await readFile(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)));
    const ext = relativePath.split('.').pop()?.toLowerCase();
    const mime =
      ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
    const uri = `data:${mime};base64,${bytes.toString('base64')}`;
    inlined.set(relativePath, uri);
    return uri;
  } catch {
    return null;
  }
}

const escapeHtml = (t: string): string =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const usd = (n: number): string => `$${n.toLocaleString('en-US')}`;

interface Player {
  handle: string;
  account_id: number | null;
  position?: number;
  role?: string;
}
interface RosterTeam {
  team_id: number | null;
  team_name: string;
  coach: string | null;
  qualification: { method: string | null; via: string | null } | null;
  players: Player[];
}
interface PhotoRecord {
  account_id: number | null;
  handle: string;
  kind: 'photo' | 'placeholder';
  local_path: string;
  photo_year: number | null;
  off_era: boolean;
}
interface TourRow {
  tier: number;
  tournament: string | null;
  row_classes: string | null;
  winner: { name: string | null };
}
interface Placement {
  placement: string;
  rank_from: number;
  prize_usd: number | null;
  teams: { team_name: string }[];
}

/** Canonical name for a team, following recorded rebrands. */
function buildAliasMap(aliases: {
  aliases?: { canonical: string; also_known_as: string[] }[];
}): Map<string, string> {
  const map = new Map<string, string>();
  for (const a of aliases.aliases ?? []) {
    map.set(a.canonical.toLowerCase(), a.canonical);
    for (const other of a.also_known_as) map.set(other.toLowerCase(), a.canonical);
  }
  return map;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run build:rosters -- <event-key> [--inline]');
    process.exit(1);
  }
  const read = async (p: string, optional = false): Promise<any> => {
    try {
      return JSON.parse(await readFile(fileURLToPath(new URL(`../${p}`, import.meta.url)), 'utf8'));
    } catch (error) {
      if (optional) return null;
      throw new Error(`could not read ${p}: ${(error as Error).message}`);
    }
  };

  const rosters = await read(`data/events/${key}.rosters.json`);
  const placementsFile = await read(`data/events/${key}.placements.json`);
  const tournaments = await read(`data/research/${key}.liquipedia-tournaments.json`, true);
  const photosFile = await read(`data/research/${key}.player-photos.json`, true);
  const aliasFile = (await read('data/entities/team-aliases.json', true)) ?? {};

  const teams: RosterTeam[] = rosters.teams ?? rosters.rosters ?? [];
  const placements: Placement[] = placementsFile.placements ?? [];
  const alias = buildAliasMap(aliasFile);
  const canon = (name: string): string => alias.get(name.toLowerCase()) ?? name;

  // Photos keyed by account_id where present, else by handle.
  const photos = new Map<string, PhotoRecord>();
  for (const p of (photosFile?.players ?? []) as PhotoRecord[]) {
    photos.set(p.account_id != null ? `id:${p.account_id}` : `h:${p.handle.toLowerCase()}`, p);
  }
  const photoFor = (pl: Player): PhotoRecord | undefined =>
    photos.get(`id:${pl.account_id}`) ?? photos.get(`h:${pl.handle.toLowerCase()}`);

  // Season titles, counted against canonical names.
  const titles = new Map<string, { major: number; minor: number; other: number }>();
  for (const row of (tournaments?.rows ?? []) as TourRow[]) {
    const winner = row.winner?.name;
    if (!winner) continue;
    if ((row.tournament ?? '').startsWith('The International')) continue;
    const name = canon(winner);
    const entry = titles.get(name) ?? { major: 0, minor: 0, other: 0 };
    const valve = /row--highlighted/.test(row.row_classes ?? '');
    if (valve) entry[row.tier === 1 ? 'major' : 'minor'] += 1;
    else entry.other += 1;
    titles.set(name, entry);
  }

  // Placement and prize per team.
  const placed = new Map<string, { placement: string; rank: number; prize: number | null }>();
  for (const p of placements) {
    for (const t of p.teams) {
      placed.set(canon(t.team_name), { placement: p.placement, rank: p.rank_from, prize: p.prize_usd });
    }
  }

  const ordered = [...teams].sort(
    (a, b) => (placed.get(canon(a.team_name))?.rank ?? 99) - (placed.get(canon(b.team_name))?.rank ?? 99),
  );

  const blocks: string[] = [];
  for (const team of ordered) {
    const name = canon(team.team_name);
    const place = placed.get(name);
    const won = titles.get(name);

    const cards: string[] = [];
    for (const player of [...team.players].sort((a, b) => (a.position ?? 9) - (b.position ?? 9))) {
      const photo = photoFor(player);
      let src: string | null = null;
      if (photo) src = INLINE ? await dataUri(photo.local_path) : `../../${photo.local_path}`;

      const era =
        photo?.kind === 'photo' && photo.off_era
          ? `<span class="p-era">${photo.photo_year ?? 'year unknown'}</span>`
          : '';
      const img = src
        ? `<img class="p-face${photo?.kind === 'placeholder' ? ' is-mark' : ''}" src="${escapeHtml(src)}" alt="" width="56" height="56" loading="lazy">`
        : `<span class="p-face is-missing" aria-hidden="true"></span>`;

      cards.push(`          <li class="p-card">
            ${img}
            <span class="p-name">${escapeHtml(player.handle)}</span>
            <span class="p-role">${player.position ? `Pos ${player.position}` : escapeHtml(player.role ?? '')}</span>
            ${era}
          </li>`);
    }

    const titleBits: string[] = [];
    if (won?.major) titleBits.push(`<span class="t-chip t-major">${won.major} Major${won.major > 1 ? 's' : ''}</span>`);
    if (won?.minor) titleBits.push(`<span class="t-chip t-minor">${won.minor} Minor${won.minor > 1 ? 's' : ''}</span>`);
    if (won?.other) titleBits.push(`<span class="t-chip t-other">${won.other} other</span>`);
    const titlesHtml = titleBits.length
      ? titleBits.join('')
      : '<span class="t-chip t-none">no titles this season</span>';

    // The owner's format: season earnings, then the total with TI added.
    // Season earnings are genuinely unknown, so they say so.
    const tiPrize = place?.prize ?? null;
    const earnings = tiPrize
      ? `Prize Earnings: <span class="unknown">not recorded</span> &mdash; TI ${usd(tiPrize)} <span class="e-note">(season + TI unavailable until per-event prize tables are pulled)</span>`
      : 'Prize Earnings: <span class="unknown">not recorded</span>';

    const qual = team.qualification
      ? `${escapeHtml(team.qualification.method ?? '')}${team.qualification.via ? ` &middot; ${escapeHtml(team.qualification.via)}` : ''}`
      : 'qualification not recorded';

    blocks.push(`      <article class="team-block${place?.rank === 1 ? ' is-champion' : ''}">
        <header class="team-head">
          <span class="team-place">${escapeHtml(place?.placement ?? '—')}</span>
          <h4>${escapeHtml(name)}</h4>
          <span class="team-qual">${qual}</span>
        </header>
        <div class="team-meta">
          <div class="team-titles">${titlesHtml}</div>
          <div class="team-earnings">${earnings}</div>
          ${team.coach ? `<div class="team-coach">Coach: <strong>${escapeHtml(team.coach)}</strong></div>` : ''}
        </div>
        <ul class="p-grid">
${cards.join('\n')}
        </ul>
      </article>`);
  }

  const withPhoto = photosFile?.photo_count ?? 0;
  const offEra = photosFile?.off_era_count ?? 0;

  const fragment = `<section class="rosters">
  <header class="rosters-head">
    <h3>Teams &amp; players</h3>
    <p class="rosters-sub">All ${teams.length} teams in placement order, with the titles each won during the season.</p>
  </header>
${blocks.join('\n')}
  <p class="rosters-note">Photographs come from Liquipedia and are chosen to fit the event's era where possible; ${withPhoto} of ${photosFile?.player_count ?? teams.length * 5} players have one, and ${offEra} of those are from another year, marked on the card. Players without a photograph show a generated initials mark &mdash; never a stock avatar or another player's face. Season titles count Majors and Minors won between the previous International and this one, following recorded rebrands. Season prize money is not yet computed: we hold each event's winner and total pool but not its full prize distribution, so a team's season earnings would be a guess.</p>
</section>`;

  const outDir = fileURLToPath(new URL(`../data/computed/${key}/`, import.meta.url));
  await mkdir(outDir, { recursive: true });
  const outPath = `${outDir}rosters${INLINE ? '.inline' : ''}.html`;
  await writeFile(outPath, `${fragment}\n`, 'utf8');

  console.log(`${teams.length} teams, ${teams.reduce((n, t) => n + t.players.length, 0)} players`);
  console.log(`  photos: ${withPhoto} (${offEra} off-era)`);
  const noTitles = ordered.filter((t) => !titles.get(canon(t.team_name)));
  console.log(`  teams with no season title: ${noTitles.length}`);
  const rebrands = (aliasFile.aliases ?? []).length;
  if (rebrands) console.log(`  ${rebrands} rebrand(s) applied from team-aliases.json`);
  console.log(`\nwrote ${outPath}`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
