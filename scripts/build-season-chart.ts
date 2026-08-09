/**
 * Build the season prize-pool chart as a standalone HTML fragment.
 *
 *   npm run build:chart -- ti08
 *
 * One bar per tier-1/tier-2 LAN in the season leading into the event, in
 * chronological order, sized by total prize pool. Reads
 * data/research/<event>.liquipedia-tournaments.json and, when present,
 * data/research/<event>.logos.json so bars can carry the winner's logo.
 *
 * THE INTERNATIONAL IS DELIBERATELY ABSENT
 *
 * Per the owner: "TI should never be in the graphs, that info is available in
 * the larger page itself, the graph is about the season leading up to TI."
 *
 * That is also what makes the chart readable. TI8's pool was ~17x the
 * season's largest event, so including it would flatten every Major and
 * Minor into a sliver and hide the one thing the chart exists to show. The
 * International bounds the season; it is not a bar in it.
 *
 * Nothing here invents data. An event with no recorded prize pool renders as
 * a marked "not recorded" bar rather than a zero or an estimate.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/**
 * With --inline, logos are embedded as data URIs instead of linked by path.
 * The review artifact is served under a strict CSP that blocks every external
 * request, so a linked image simply never loads there.
 */
const INLINE = process.argv.includes('--inline');
const inlined = new Map<string, string>();

async function dataUri(relativePath: string): Promise<string> {
  const cached = inlined.get(relativePath);
  if (cached) return cached;
  const absolute = fileURLToPath(new URL(`../${relativePath}`, import.meta.url));
  const bytes = await readFile(absolute);
  const uri = `data:image/png;base64,${bytes.toString('base64')}`;
  inlined.set(relativePath, uri);
  return uri;
}

interface TeamRef {
  name: string | null;
  logo_url: string | null;
  logo_variant: string | null;
}

interface TournamentRow {
  tier: number;
  tournament: string | null;
  tournament_url: string | null;
  date: string | null;
  start_date: string | null;
  prizepool: string | null;
  prizepool_usd: number | null;
  location: string | null;
  participants: string | null;
  row_classes: string | null;
  winner: TeamRef;
  runner_up: TeamRef;
}

interface SeasonData {
  event: string;
  season_window?: { from_exclusive: string | null; to_inclusive: string };
  rows: TournamentRow[];
  _attribution?: string;
}

interface LogoRecord {
  team: string;
  file: string;
  local_path: string;
  dark_local_path: string | null;
}

/**
 * "…/thumb/a/a7/Team_Liquid_2017_lightmode.png/50px-…" -> "Team_Liquid_2017_lightmode.png"
 * Mirrors the extraction in fetch-team-logos.ts so the two agree on identity.
 */
function fileNameFromUrl(url: string): string | null {
  const parts = url.split('/').filter(Boolean);
  const name = url.includes('/thumb/') ? parts.at(-2) : parts.at(-1);
  return name ? decodeURIComponent(name) : null;
}

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Valve-sponsored, per Liquipedia's own row highlight. */
const isValve = (row: TournamentRow): boolean => /row--highlighted/.test(row.row_classes ?? '');

/**
 * What an event was in the DPC structure of its year.
 *
 * Tier is Liquipedia's; the Valve highlight is Liquipedia's. The mapping
 * between them and "Major"/"Minor" is this project's reading, and it is
 * stated as a label rather than smuggled in as fact — see the chart legend.
 */
function classify(row: TournamentRow): { label: string; kind: string } {
  if (/^The International/i.test(row.tournament ?? '')) return { label: 'The International', kind: 'ti' };
  if (isValve(row)) {
    return row.tier === 1 ? { label: 'Major', kind: 'major' } : { label: 'Minor', kind: 'minor' };
  }
  // Tier 1 without Valve backing: top-level by field and prize money, but
  // outside the circuit. Rare, and always for a reason worth a note.
  if (row.tier === 1) return { label: 'No Valve backing', kind: 'unbacked' };
  return { label: `Tier ${row.tier}`, kind: 'other' };
}

/**
 * The chart shows the competitive circuit, not every LAN that happened.
 *
 * Per the owner, the non-DPC tier-2 events "clutter up the visual too much" —
 * and they do: a $60k eight-team invitational sits beside a $1M Major and
 * flattens the comparison the chart exists to make. So the bars are the
 * circuit: every tier-1 event, plus the tier-2 events Valve backed, which is
 * what a DPC Minor was. A tier-1 event outside the circuit still appears —
 * being top-tier yet unsanctioned is itself part of the season's story.
 */
function inChart(row: TournamentRow): boolean {
  const { kind } = classify(row);
  return kind === 'major' || kind === 'minor' || kind === 'unbacked';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2018-03-15" -> "Mar 2018". Chronological grouping label. */
function monthLabel(iso: string): string {
  const [year, month] = iso.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

const usd = (value: number): string => `$${value.toLocaleString('en-US')}`;

function compactUsd(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `$${millions >= 10 ? millions.toFixed(1) : millions.toFixed(2)}M`;
  }
  return `$${Math.round(value / 1000)}k`;
}

/**
 * Logos keyed by FILE, not by team name.
 *
 * A team can have more than one logo across a season — Evil Geniuses changed
 * theirs mid-2018, and Liquipedia uses the era-appropriate mark per event.
 * Keying by team name collapses those to whichever was read last, silently
 * showing the wrong-era logo on some events. The row already names the exact
 * file it referenced, so resolve on that.
 */
async function loadLogos(key: string): Promise<Map<string, LogoRecord>> {
  const path = fileURLToPath(new URL(`../data/research/${key}.logos.json`, import.meta.url));
  const map = new Map<string, LogoRecord>();
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8')) as { logos?: LogoRecord[] };
    for (const logo of parsed.logos ?? []) map.set(logo.file, logo);
  } catch {
    // No manifest yet. Bars fall back to the team's name, which is the
    // honest degradation — a missing logo must not become a wrong logo.
  }
  return map;
}

/** The logo a row actually referenced, or undefined when it isn't downloaded. */
function logoFor(team: TeamRef, logos: Map<string, LogoRecord>): LogoRecord | undefined {
  if (!team.logo_url) return undefined;
  const file = fileNameFromUrl(team.logo_url);
  return file ? logos.get(file) : undefined;
}

async function bar(row: TournamentRow, maxUsd: number, logos: Map<string, LogoRecord>): Promise<string> {
  const { label, kind } = classify(row);
  const value = row.prizepool_usd;
  const width = value === null ? 0 : Math.max((value / maxUsd) * 100, 1.5);
  const winner = row.winner.name;
  const logo = logoFor(row.winner, logos);

  // A dark counterpart, where one exists, is swapped at runtime — a lightmode
  // mark on a dark ground can be invisible.
  let mark = '';
  if (logo) {
    const light = INLINE ? await dataUri(logo.local_path) : `../../${logo.local_path}`;
    const dark = logo.dark_local_path
      ? INLINE
        ? await dataUri(logo.dark_local_path)
        : `../../${logo.dark_local_path}`
      : null;
    mark =
      `<img class="bar-logo" src="${escapeHtml(light)}"` +
      `${dark ? ` data-dark="${escapeHtml(dark)}"` : ''}` +
      ` alt="" width="20" height="20" loading="lazy">`;
  }
  const winnerCell = winner
    ? `${mark}<span class="bar-winner">${escapeHtml(winner)}</span>`
    : '<span class="bar-winner none">winner not recorded</span>';

  const amount =
    value === null
      ? '<span class="bar-amount none">not recorded</span>'
      : `<span class="bar-amount">${escapeHtml(compactUsd(value))}</span>`;

  const name = row.tournament_url
    ? `<a href="${escapeHtml(row.tournament_url)}">${escapeHtml(row.tournament ?? '?')}</a>`
    : escapeHtml(row.tournament ?? '?');

  const teams = row.participants ? `<span class="bar-teams">${escapeHtml(row.participants)} teams</span>` : '';
  const exactTitle = value === null ? 'Prize pool not recorded' : usd(value);

  return `      <li class="bar-row kind-${kind}${value === null ? ' is-unrecorded' : ''}">
        <div class="bar-head">
          <span class="bar-date">${escapeHtml(row.start_date ?? '')}</span>
          <span class="bar-name">${name}</span>
          <span class="chip chip-${kind}">${escapeHtml(label)}</span>
        </div>
        <div class="bar-track" title="${escapeHtml(exactTitle)}">
          <div class="bar-fill" style="width:${width.toFixed(2)}%"></div>
          <div class="bar-inner">${winnerCell}</div>
        </div>
        <div class="bar-foot">${amount}${teams}</div>
      </li>`;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run build:chart -- <event-key>   (e.g. ti08)');
    process.exit(1);
  }

  const inPath = fileURLToPath(
    new URL(`../data/research/${key}.liquipedia-tournaments.json`, import.meta.url),
  );
  let data: SeasonData;
  try {
    data = JSON.parse(await readFile(inPath, 'utf8')) as SeasonData;
  } catch {
    console.error(`Could not read ${inPath}`);
    console.error('Run `npm run research:liquipedia -- <event-key> <years>` first.');
    process.exit(1);
  }

  const logos = await loadLogos(key);
  const rows = [...data.rows].sort((a, b) => (a.start_date ?? '').localeCompare(b.start_date ?? ''));

  // The International bounds the season rather than appearing in it.
  const ti = rows.filter((r) => classify(r).kind === 'ti');
  const season = rows.filter(inChart);
  const excluded = rows.filter((r) => classify(r).kind === 'other');

  // Unrecorded pools can't set a maximum.
  const seasonMax = Math.max(...season.map((r) => r.prizepool_usd ?? 0), 1);

  // Month rules make the season's rhythm legible — the gaps between events
  // are part of the story, not dead space.
  const bars: string[] = [];
  let lastMonth = '';
  for (const row of season) {
    const month = row.start_date ? monthLabel(row.start_date) : '';
    if (month && month !== lastMonth) {
      bars.push(`      <li class="month-rule"><span>${escapeHtml(month)}</span></li>`);
      lastMonth = month;
    }
    bars.push(await bar(row, seasonMax, logos));
  }

  const counts = {
    major: season.filter((r) => classify(r).kind === 'major').length,
    minor: season.filter((r) => classify(r).kind === 'minor').length,
    unbacked: season.filter((r) => classify(r).kind === 'unbacked').length,
  };

  const finale = ti[0];
  const closing = finale
    ? `<p class="chart-close">The season ends at <strong>${escapeHtml(finale.tournament ?? 'The International')}</strong>` +
      `${finale.start_date ? `, ${escapeHtml(monthLabel(finale.start_date))}` : ''}. ` +
      `Its prize pool sits apart from this chart by an order of magnitude and is covered on the page above.</p>`
    : '';

  /**
   * Editorial prose lives in data/narrative/, not in this script. When a
   * season needs an explanation under its chart — an event that doesn't fit
   * the pattern, a year the structure changed — the note is written there
   * and picked up here, so the owner edits prose without touching code.
   */
  let note = '';
  try {
    const notePath = fileURLToPath(
      new URL(`../data/narrative/${key}.chart-note.html`, import.meta.url),
    );
    note = `\n  <aside class="chart-aside">\n${(await readFile(notePath, 'utf8')).trim()}\n  </aside>\n`;
  } catch {
    // No note for this season. Nothing to explain, or not written yet.
  }

  const unbackedLegend = counts.unbacked
    ? `\n      <li><span class="swatch sw-unbacked"></span>No Valve backing <em>&times;${counts.unbacked}</em></li>`
    : '';

  const fragment = `<section class="season-chart">
  <header class="chart-head">
    <h3>The season, by prize pool</h3>
    <p class="chart-sub">The circuit between the last International and this one, in order: every Major and Minor, plus any top-tier event outside the circuit. Bars are the <strong>total</strong> prize pool, not the winner's share.</p>
    <ul class="chart-legend">
      <li><span class="swatch sw-major"></span>Major <em>&times;${counts.major}</em></li>
      <li><span class="swatch sw-minor"></span>Minor <em>&times;${counts.minor}</em></li>${unbackedLegend}
    </ul>
  </header>

  <ol class="bar-list">
${bars.join('\n')}
  </ol>

  ${closing}
${note}
  <p class="chart-note">Tier and Valve-sponsorship are Liquipedia's own classifications. Mapping those to &ldquo;Major&rdquo; and &ldquo;Minor&rdquo; is this archive's reading of the DPC structure that year &mdash; the underlying tier and highlight are preserved in the data. Smaller non-circuit events are recorded in the data but left off the chart.</p>
</section>`;

  const outDir = fileURLToPath(new URL('../data/computed/', import.meta.url));
  await mkdir(outDir, { recursive: true });
  const outPath = `${outDir}${key}.season-chart${INLINE ? '.inline' : ''}.html`;
  await writeFile(outPath, `${fragment}\n`, 'utf8');

  console.log(`${season.length} event(s) charted`);
  console.log(
    `  Majors: ${counts.major}   Minors: ${counts.minor}   No Valve backing: ${counts.unbacked}`,
  );
  console.log(`  ${note ? 'editorial note attached' : 'no editorial note (data/narrative/' + key + '.chart-note.html)'}`);
  if (excluded.length) {
    console.log(`  ${excluded.length} non-circuit event(s) kept in the data but off the chart:`);
    for (const row of excluded) console.log(`      ${row.start_date}  ${row.tournament}`);
  }
  console.log(`  scale max: ${usd(seasonMax)}`);
  for (const row of ti) {
    console.log(`  excluded from the chart by design: ${row.tournament} (${usd(row.prizepool_usd ?? 0)})`);
  }
  const noPool = season.filter((r) => r.prizepool_usd === null);
  if (noPool.length) {
    console.log(`  ${noPool.length} event(s) render as "not recorded": ${noPool.map((r) => r.tournament).join(', ')}`);
  }
  const noLogo = season.filter((r) => r.winner.name && !logoFor(r.winner, logos));
  if (noLogo.length) {
    console.log(`  ${noLogo.length} event(s) have no local winner logo (bars use the name):`);
    for (const row of noLogo) console.log(`      ${row.winner.name} — ${row.tournament}`);
    console.log('  run `npm run fetch:logos -- <event-key>` to download them');
  }
  // Worth surfacing: it means the org's mark changed mid-season, and the
  // chart is now showing each event's own era rather than one for all.
  const perTeamFiles = new Map<string, Set<string>>();
  for (const row of season) {
    const logo = logoFor(row.winner, logos);
    if (!logo) continue;
    const set = perTeamFiles.get(logo.team) ?? new Set<string>();
    set.add(logo.file);
    perTeamFiles.set(logo.team, set);
  }
  for (const [team, files] of perTeamFiles) {
    if (files.size > 1) {
      console.log(`  ${team} uses ${files.size} different logos this season: ${[...files].join(', ')}`);
    }
  }
  console.log(`\nwrote ${outPath}`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
