/**
 * The patch an event was actually played on.
 *
 *   npm run compute:patch -- ti08
 *
 * DESIGN.md §5.1. TI8's patch (7.19) reached the draft via a live web search
 * because nothing in the committed dataset recorded it. That is the kind of
 * fact that must not depend on someone remembering to look it up — every match
 * OpenDota returns carries a `patch` field, so the answer is already in the
 * cache and only needs reading.
 *
 * Runs offline against data/raw/<event>/matches/. Only the patch constants
 * need the network, and they cache after the first run.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 *
 * It does not pick "the" patch and discard the rest. A tournament played
 * across a patch boundary is a real thing — qualifiers months earlier are
 * almost always on an older build, and some events have shipped a patch
 * mid-run. So this counts matches per patch per phase and per day, names the
 * dominant patch of the MAIN EVENT specifically, and flags any phase whose
 * matches disagree. An event with a boundary inside it says so.
 *
 * TWO READINGS OF THE SAME FIELD
 *
 * OpenDota does not document whether a match's `patch` is the index into
 * /api/constants/patch or the `id` of an entry in it. Historically they are
 * the same number. This resolves by both and fails loudly if they diverge,
 * rather than picking the one that produces a plausible-looking version
 * string. A wrong patch label is worse than none: it would silently
 * mis-describe the map, the item pool and the hero pool of an entire year.
 *
 * THE DATE CHECK
 *
 * Each patch constant carries its release date. Every match should start on or
 * after the release date of the patch it is labelled with. Any match that does
 * not is reported — that is the signal that the mapping above is wrong, and it
 * is checkable without knowing anything about Dota.
 */

import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { fetchPatches } from './lib/opendota.ts';
import type { MatchDetail, PatchConstant } from './lib/opendota.ts';

interface IndexEntry {
  match_id: number;
  phase: string;
  local_date: string;
}

interface PhaseTally {
  phase: string;
  matches: number;
  /** patch name -> match count, descending. */
  patches: { patch: string; matches: number }[];
  /** True when more than one patch appears in this phase. */
  split: boolean;
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

function descend(counts: Map<string, number>): { patch: string; matches: number }[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([patch, matches]) => ({ patch, matches }));
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run compute:patch -- <event-key>   (e.g. ti08)');
    process.exit(1);
  }

  const cacheDir = fileURLToPath(new URL(`../data/raw/${key}`, import.meta.url));
  const index = JSON.parse(
    await readFile(
      fileURLToPath(new URL(`../data/computed/${key}/matches.index.json`, import.meta.url)),
      'utf8',
    ),
  ) as { matches: IndexEntry[] };
  const meta = new Map(index.matches.map((m) => [m.match_id, m]));

  const patches = await fetchPatches(cacheDir);
  const byIndex = new Map<number, PatchConstant>(patches.map((p, i) => [i, p]));
  const byId = new Map<number, PatchConstant>(patches.map((p) => [p.id, p]));
  console.log(`${patches.length} patches in the constants table`);

  const matches = await readMatches(cacheDir);
  console.log(`${matches.length} cached matches for ${key}\n`);

  /** Matches where reading `patch` as an index and as an id give different answers. */
  const ambiguous: { match_id: number; as_index: string | null; as_id: string | null }[] = [];
  /** Matches that started before their own patch was released. */
  const impossible: { match_id: number; date: string; patch: string; released: string }[] = [];
  /** Matches with no patch field at all — absence, not a guess. */
  const unlabelled: number[] = [];

  const perPhase = new Map<string, Map<string, number>>();
  const perDay = new Map<string, Map<string, number>>();
  let labelled = 0;

  for (const match of matches) {
    const entry = meta.get(match.match_id);
    if (!entry) continue; // not part of this event's index

    if (match.patch == null) {
      unlabelled.push(match.match_id);
      continue;
    }

    const asIndex = byIndex.get(match.patch) ?? null;
    const asId = byId.get(match.patch) ?? null;
    if (asIndex?.name !== asId?.name) {
      ambiguous.push({
        match_id: match.match_id,
        as_index: asIndex?.name ?? null,
        as_id: asId?.name ?? null,
      });
      continue;
    }
    const patch = asIndex;
    if (!patch) {
      unlabelled.push(match.match_id);
      continue;
    }
    labelled += 1;

    const started = new Date(match.start_time * 1000).toISOString().slice(0, 10);
    const released = patch.date.slice(0, 10);
    if (started < released) {
      impossible.push({ match_id: match.match_id, date: started, patch: patch.name, released });
    }

    const phase = perPhase.get(entry.phase) ?? new Map<string, number>();
    phase.set(patch.name, (phase.get(patch.name) ?? 0) + 1);
    perPhase.set(entry.phase, phase);

    const day = perDay.get(entry.local_date) ?? new Map<string, number>();
    day.set(patch.name, (day.get(patch.name) ?? 0) + 1);
    perDay.set(entry.local_date, day);
  }

  // The mapping is either trustworthy or it is not; there is no partial credit
  // on a field that labels an entire year of the archive.
  if (ambiguous.length) {
    console.error(`\n${ambiguous.length} matches resolve differently as index vs id, e.g.:`);
    for (const a of ambiguous.slice(0, 5)) {
      console.error(`  ${a.match_id}: as index=${a.as_index ?? 'none'}, as id=${a.as_id ?? 'none'}`);
    }
    throw new Error(
      'OpenDota patch ids and array indices have diverged. Resolve which reading is correct ' +
        'before recording a patch — a wrong label mis-describes the map, items and heroes of a whole event.',
    );
  }
  if (impossible.length) {
    console.error(`\n${impossible.length} matches started before their labelled patch was released, e.g.:`);
    for (const m of impossible.slice(0, 5)) {
      console.error(`  ${m.match_id} played ${m.date}, labelled ${m.patch} released ${m.released}`);
    }
    throw new Error('Patch labels fail their own release-date check. Not recording a patch from this.');
  }

  const phases: PhaseTally[] = [...perPhase.entries()].map(([phase, counts]) => {
    const rows = descend(counts);
    return { phase, matches: rows.reduce((n, r) => n + r.matches, 0), patches: rows, split: rows.length > 1 };
  });

  for (const p of phases) {
    console.log(`${p.phase} (${p.matches} matches)${p.split ? '  — SPLIT ACROSS PATCHES' : ''}`);
    for (const r of p.patches) console.log(`  ${r.patch.padEnd(8)} ${String(r.matches).padStart(4)}`);
  }

  // The headline number is the main event's, not the whole league's. Qualifiers
  // ran months earlier on an older build and would drag the average backwards.
  const mainEvent = phases.filter((p) => p.phase === 'group' || p.phase === 'main');
  const mainCounts = new Map<string, number>();
  for (const p of mainEvent) {
    for (const r of p.patches) mainCounts.set(r.patch, (mainCounts.get(r.patch) ?? 0) + r.matches);
  }
  const mainRows = descend(mainCounts);
  const eventPatch = mainRows[0]?.patch ?? null;
  const eventPatchDate = eventPatch ? (patches.find((p) => p.name === eventPatch)?.date ?? null) : null;

  console.log(
    `\nmain event patch: ${eventPatch ?? 'NOT RECORDED — no labelled group or main-event match'}` +
      (mainRows.length > 1 ? `  (event crossed a patch boundary: ${mainRows.map((r) => `${r.patch}×${r.matches}`).join(', ')})` : ''),
  );
  if (unlabelled.length) {
    console.log(`${unlabelled.length} matches carry no patch field; recorded as unlabelled, not assigned.`);
  }

  const outDir = fileURLToPath(new URL(`../data/computed/${key}/`, import.meta.url));
  await mkdir(outDir, { recursive: true });
  await writeFile(
    `${outDir}patch.json`,
    `${JSON.stringify(
      {
        _note:
          'The patch each match was played on, read from OpenDota\'s per-match `patch` field — ' +
          'not from a web search. event_patch is the dominant patch of the GROUP and MAIN stages ' +
          'only; qualifiers ran earlier on older builds and are tallied separately. Where a stage ' +
          'spans more than one patch, split is true and every patch is listed with its match count.',
        _resolution:
          "OpenDota does not document whether a match's `patch` is the index into " +
          '/api/constants/patch or an entry id. Both readings are computed and must agree, and ' +
          'every match must have started on or after its patch\'s release date. This file is only ' +
          'written when both hold.',
        _generated_by: 'scripts/compute-patch.ts',
        _generated_at: new Date().toISOString(),
        event: key,
        event_patch: eventPatch,
        event_patch_released: eventPatchDate,
        event_patch_split: mainRows.length > 1,
        main_event_patches: mainRows,
        labelled_matches: labelled,
        unlabelled_matches: unlabelled.length,
        phases,
        by_day: [...perDay.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, counts]) => ({ date, patches: descend(counts) })),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  console.log(`\nwrote ${outDir}patch.json`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
