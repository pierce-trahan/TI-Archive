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
 * WHY THE SCALE IS SPLIT
 *
 * The International's pool dwarfs the rest of the season by more than an
 * order of magnitude — $25.5M against a $300k Minor at TI8. On one linear
 * scale every other bar collapses into a sliver, which hides precisely the
 * thing the chart is for: the shape of the season. So the season's events
 * share a scale of their own and The International is drawn separately at
 * full width, with its true multiple stated. That is a presentational
 * choice, not a distortion of the numbers — every bar is labelled with its
 * real figure, and the break is called out on the chart itself.
 *
 * Nothing here invents data. An event with no recorded prize pool renders as
 * a marked "not recorded" bar rather than a zero or an estimate.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

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
  local_path: string;
  dark_local_path: string | null;
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
  return { label: `Tier ${row.tier}`, kind: 'other' };
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

async function loadLogos(key: string): Promise<Map<string, LogoRecord>> {
  const path = fileURLToPath(new URL(`../data/research/${key}.logos.json`, import.meta.url));
  const map = new Map<string, LogoRecord>();
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8')) as { logos?: LogoRecord[] };
    for (const logo of parsed.logos ?? []) map.set(logo.team, logo);
  } catch {
    // No manifest yet. Bars fall back to the team's name, which is the
    // honest degradation — a missing logo must not become a wrong logo.
  }
  return map;
}

function bar(row: TournamentRow, maxUsd: number, logos: Map<string, LogoRecord>): string {
  const { label, kind } = classify(row);
  const value = row.prizepool_usd;
  const width = value === null ? 0 : Math.max((value / maxUsd) * 100, 1.5);
  const winner = row.winner.name;
  const logo = winner ? logos.get(winner) : undefined;

  const mark = logo
    ? `<img class="bar-logo" src="${escapeHtml(`../../${logo.local_path}`)}" alt="" width="20" height="20">`
    : '';
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

  const ti = rows.filter((r) => classify(r).kind === 'ti');
  const season = rows.filter((r) => classify(r).kind !== 'ti');

  // The season's own scale excludes The International, for the reason in the
  // file header. Unrecorded pools can't set a maximum.
  const seasonMax = Math.max(...season.map((r) => r.prizepool_usd ?? 0), 1);
  const tiTotal = ti[0]?.prizepool_usd ?? null;
  const multiple = tiTotal ? tiTotal / seasonMax : null;

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
    bars.push(bar(row, seasonMax, logos));
  }

  const counts = {
    major: season.filter((r) => classify(r).kind === 'major').length,
    minor: season.filter((r) => classify(r).kind === 'minor').length,
    other: season.filter((r) => classify(r).kind === 'other').length,
  };

  const tiBlock = ti
    .map((row) => {
      const winner = row.winner.name;
      const logo = winner ? logos.get(winner) : undefined;
      const mark = logo
        ? `<img class="bar-logo" src="${escapeHtml(`../../${logo.local_path}`)}" alt="" width="24" height="24">`
        : '';
      return `      <li class="bar-row kind-ti is-finale">
        <div class="bar-head">
          <span class="bar-date">${escapeHtml(row.start_date ?? '')}</span>
          <span class="bar-name">${escapeHtml(row.tournament ?? '')}</span>
          <span class="chip chip-ti">The International</span>
        </div>
        <div class="bar-track" title="${escapeHtml(row.prizepool_usd ? usd(row.prizepool_usd) : 'not recorded')}">
          <div class="bar-fill" style="width:100%"></div>
          <div class="bar-inner">${mark}<span class="bar-winner">${escapeHtml(winner ?? 'not recorded')}</span></div>
        </div>
        <div class="bar-foot">
          <span class="bar-amount">${escapeHtml(row.prizepool_usd ? compactUsd(row.prizepool_usd) : 'not recorded')}</span>
          ${row.participants ? `<span class="bar-teams">${escapeHtml(row.participants)} teams</span>` : ''}
        </div>
      </li>`;
    })
    .join('\n');

  const fragment = `<section class="season-chart">
  <header class="chart-head">
    <h3>The season, by prize pool</h3>
    <p class="chart-sub">Every tier-1 and tier-2 LAN from the end of the previous International to this one, in order. Bars are the <strong>total</strong> prize pool, not the winner's share.</p>
    <ul class="chart-legend">
      <li><span class="swatch sw-major"></span>Major <em>&times;${counts.major}</em></li>
      <li><span class="swatch sw-minor"></span>Minor <em>&times;${counts.minor}</em></li>
      <li><span class="swatch sw-other"></span>Non-DPC <em>&times;${counts.other}</em></li>
      <li><span class="swatch sw-ti"></span>The International</li>
    </ul>
  </header>

  <ol class="bar-list">
${bars.join('\n')}
  </ol>

  <div class="scale-break">
    <span>scale break</span>
    <p>${
      multiple
        ? `The International's pool is <strong>${multiple.toFixed(1)}&times;</strong> the season's largest. Drawn at full width so the bars above stay readable.`
        : 'The International is drawn separately.'
    }</p>
  </div>

  <ol class="bar-list bar-list-finale">
${tiBlock}
  </ol>

  <p class="chart-note">Tier and Valve-sponsorship are Liquipedia's own classifications. Mapping those to &ldquo;Major&rdquo; and &ldquo;Minor&rdquo; is this archive's reading of the DPC structure that year &mdash; the underlying tier and highlight are preserved in the data.</p>
</section>`;

  const outDir = fileURLToPath(new URL('../data/computed/', import.meta.url));
  await mkdir(outDir, { recursive: true });
  const outPath = `${outDir}${key}.season-chart.html`;
  await writeFile(outPath, `${fragment}\n`, 'utf8');

  console.log(`${season.length} season event(s) + ${ti.length} International`);
  console.log(`  Majors: ${counts.major}   Minors: ${counts.minor}   Non-DPC: ${counts.other}`);
  console.log(`  season scale max: ${usd(seasonMax)}`);
  if (tiTotal) console.log(`  The International: ${usd(tiTotal)} (${multiple!.toFixed(1)}x the season max)`);
  const noPool = season.filter((r) => r.prizepool_usd === null);
  if (noPool.length) {
    console.log(`  ${noPool.length} event(s) render as "not recorded": ${noPool.map((r) => r.tournament).join(', ')}`);
  }
  const noLogo = [...new Set(season.map((r) => r.winner.name).filter(Boolean))].filter((n) => !logos.has(n!));
  if (noLogo.length) {
    console.log(`  ${noLogo.length} winner(s) have no local logo (bars use the name): ${noLogo.join(', ')}`);
    console.log('  run `npm run fetch:logos -- <event-key>` to download them');
  }
  console.log(`\nwrote ${outPath}`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
