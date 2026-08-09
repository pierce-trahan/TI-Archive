/**
 * DESIGN.md §8.1 rule 7 / §8.4.1 — no entity names in `data/computed/`.
 *
 *   npm run verify:names
 *
 * Computed data carries IDs. Names are resolved at render time, as of the
 * event's date, from the entity layer. This check enforces that.
 *
 * WHY IT EXISTS
 *
 * Building TI8's group standings, seven of eighteen teams came out under
 * their 2026 names — Evil Geniuses as "Shopify Rebellion", Fnatic as
 * "Ascent Esports" — because `matches.index.json` had stored OpenDota's name
 * strings rather than team ids, and OpenDota returns whatever a team is
 * called today. Canonical entities already existed; the pipeline simply
 * walked around them. Nothing in the build noticed.
 *
 * The check is deliberately blunt: any string value under `computed/` that
 * equals a known team name, player handle, or hero name is a failure. A false
 * positive costs a two-minute exemption. The failure it prevents is
 * publishing a 2018 group stage under 2026 branding, which is precisely the
 * confident-looking wrongness this project exists to avoid.
 *
 * SCOPE
 *
 * JSON only. Rendered `.html` fragments under `computed/` are render output —
 * names in them are the correct, resolved result, not stored data. That they
 * live under `data/` at all is a wart worth fixing later; they are exempted
 * explicitly here rather than passing silently.
 */

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const COMPUTED = join(ROOT, 'data', 'computed');
const ENTITIES = join(ROOT, 'data', 'entities');

/**
 * Keys whose values are names by design and are not entity references.
 * Kept short and justified — every entry here is a hole in the check.
 */
const EXEMPT_KEYS = new Set([
  '_note',
  '_generated_by',
  '_generated_at',
  '_attribution',
  '_source',
  '_sources',
  '_licensing',
  '_excluded',
  'source_url',
  'url',
  'basis',
  'incomplete_reason',
]);

interface Finding {
  file: string;
  path: string;
  value: string;
  kind: string;
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/** Every name the entity layer knows, mapped to what kind of entity it is. */
async function loadEntityNames(): Promise<Map<string, string>> {
  const names = new Map<string, string>();
  const add = (value: unknown, kind: string) => {
    if (typeof value === 'string' && value.trim()) names.set(value.trim().toLowerCase(), kind);
  };

  const readJson = async (name: string): Promise<unknown> => {
    try {
      return JSON.parse(await readFile(join(ENTITIES, name), 'utf8'));
    } catch {
      return null;
    }
  };

  const teams = (await readJson('teams.json')) as { teams?: { names?: { name?: string }[] }[] } | null;
  for (const t of teams?.teams ?? []) for (const n of t.names ?? []) add(n.name, 'team name');

  const players = (await readJson('players.json')) as
    | { players?: { handles?: { handle?: string }[]; real_name?: string }[] }
    | null;
  for (const p of players?.players ?? []) {
    for (const h of p.handles ?? []) add(h.handle, 'player handle');
    add(p.real_name, 'player real name');
  }

  const heroes = (await readJson('heroes.json')) as
    | { heroes?: { localized_name?: string; name?: string }[] }
    | null;
  for (const h of heroes?.heroes ?? []) add(h.localized_name, 'hero name');

  return names;
}

/** Walks a parsed JSON value, reporting string leaves that name an entity. */
function scan(
  value: unknown,
  known: Map<string, string>,
  file: string,
  path: string,
  findings: Finding[],
): void {
  if (typeof value === 'string') {
    const kind = known.get(value.trim().toLowerCase());
    if (kind) findings.push({ file, path, value, kind });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => scan(v, known, file, `${path}[${i}]`, findings));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (EXEMPT_KEYS.has(k)) continue;
      scan(v, known, file, path ? `${path}.${k}` : k, findings);
    }
  }
}

async function main(): Promise<void> {
  const known = await loadEntityNames();
  if (!known.size) {
    console.error('No entity names loaded from data/entities/. Nothing to check against.');
    process.exit(1);
  }

  const files = (await walk(COMPUTED)).filter((f) => f.endsWith('.json'));
  const skipped = (await walk(COMPUTED)).filter((f) => f.endsWith('.html'));

  console.log(`DESIGN.md §8.1 rule 7 — no entity names in data/computed/`);
  console.log(`${known.size} known entity names | ${files.length} JSON file(s) checked\n`);

  const findings: Finding[] = [];
  for (const file of files) {
    const rel = relative(ROOT, file);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      console.error(`  ${rel}: not valid JSON — ${(error as Error).message}`);
      process.exit(1);
    }
    scan(parsed, known, rel, '', findings);
  }

  if (skipped.length) {
    console.log(`exempt (render output, names are the resolved result):`);
    for (const f of skipped) console.log(`  ${relative(ROOT, f)}`);
    console.log();
  }

  if (!findings.length) {
    console.log('PASS — no entity names found in computed data.');
    return;
  }

  // Group by file and by the JSON key, so the report names the field to fix
  // rather than listing hundreds of individual occurrences.
  const byFile = new Map<string, Map<string, { count: number; example: Finding }>>();
  for (const f of findings) {
    const field = f.path.replace(/\[\d+\]/g, '[]');
    if (!byFile.has(f.file)) byFile.set(f.file, new Map());
    const fields = byFile.get(f.file)!;
    const entry = fields.get(field);
    if (entry) entry.count += 1;
    else fields.set(field, { count: 1, example: f });
  }

  console.log(`FAIL — ${findings.length} entity name(s) in computed data:\n`);
  for (const [file, fields] of byFile) {
    console.log(`  ${file}`);
    for (const [field, { count, example }] of [...fields].sort((a, b) => b[1].count - a[1].count)) {
      console.log(`      ${field}  ×${count}   e.g. "${example.value}" (${example.kind})`);
    }
    console.log();
  }
  console.log('Store the id and resolve the name at render, as of the event date.');
  console.log('See DESIGN.md §8.4 for why this is a hard failure rather than a warning.');
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
