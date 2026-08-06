/**
 * Resolve an event's placements and prize money.
 *
 *   npm run build:placements -- ti08
 *
 * Liquipedia stores prize money as a formula — `{{#expr: <total> * .44 round 0}}`
 * — against a total transcluded from a subpage. Both halves are sourced, so
 * evaluating them is derivation, not invention: the multiplier comes from the
 * page and the total comes from the page it transcludes. Every amount written
 * out carries the formula and inputs that produced it, so any figure can be
 * checked without re-reading the wikitext.
 *
 * The multiplier is read from the expression, never from the displayed
 * percentage. They are not always the same: TI8's 7th-8th slot displays "2.5%"
 * but computes on .02500112761207746.
 *
 * Placement ranks are derived from slot order and how many teams share a slot:
 * two teams in the fifth slot occupy 5th-6th. Team tags are resolved against
 * the known field by exact, prefix, dotted and initials matching, then by
 * elimination. Anything still unresolved is reported, never guessed.
 */

import { readFile, writeFile } from 'node:fs/promises';

interface Proposal {
  _attribution: string;
  prize_pool: { total_usd: number; source_page: string; raw: string } | null;
  teams: { team_name: string }[];
  placements: {
    slot: number;
    prize_share: string | null;
    prize_usd_expression: string | null;
    teams: { tag: string; last_vs: string | null; last_score: string | null }[];
  }[];
}

const normalise = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Initials of each word: "Evil Geniuses" -> "eg", "VGJ.Storm" -> "vs". */
function initials(name: string): string {
  return name
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((word) => word[0]!.toLowerCase())
    .join('');
}

/**
 * Resolves a Liquipedia short tag to one of the known team names. Returns null
 * when the tag matches zero teams or more than one — ambiguity is reported, not
 * broken arbitrarily.
 */
function resolveTag(tag: string, candidates: string[]): string | null {
  const t = normalise(tag);

  const rules: ((name: string) => boolean)[] = [
    (name) => normalise(name) === t,
    (name) => normalise(name).startsWith(t) && t.length >= 3,
    // "lgd" -> PSG.LGD. Three characters is loose, but every rule here demands
    // a unique hit across the field, so an ambiguous tag still falls through.
    (name) => normalise(name).includes(t) && t.length >= 3,
    (name) => initials(name) === t,
    // "vgj.s" -> VGJ.Storm: leading token matches, trailing initial matches.
    (name) => {
      const [head, tail] = tag.toLowerCase().split('.');
      if (!head || !tail) return false;
      const parts = name.toLowerCase().split('.');
      return (
        parts.length > 1 &&
        normalise(parts[0]!) === normalise(head) &&
        (parts[1] ?? '').startsWith(tail)
      );
    },
  ];

  for (const rule of rules) {
    const hits = candidates.filter(rule);
    if (hits.length === 1) return hits[0]!;
  }
  return null;
}

function ordinal(n: number): string {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${n}${suffix}`;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run build:placements -- <event-key>');
    process.exit(1);
  }

  const proposalUrl = new URL(`../data/proposals/${key}.liquipedia.json`, import.meta.url);
  const eventsUrl = new URL('../data/sources/events.json', import.meta.url);
  const outUrl = new URL(`../data/events/${key}.placements.json`, import.meta.url);

  const proposal = JSON.parse(await readFile(proposalUrl, 'utf8')) as Proposal;
  const events = JSON.parse(await readFile(eventsUrl, 'utf8')) as {
    events: Record<string, { source_url: string }>;
  };

  if (!proposal.prize_pool) {
    console.error(
      'No prize pool total in the proposal — prize amounts cannot be derived.\n' +
        'Re-run ingest:liquipedia, or the placements ship without money.',
    );
  }

  const total = proposal.prize_pool?.total_usd ?? null;
  const known = proposal.teams.map((t) => t.team_name);
  const remaining = new Set(known);
  const unresolved: string[] = [];

  let rank = 0;
  const placements = proposal.placements.map((slot) => {
    const from = rank + 1;
    rank += slot.teams.length;
    const to = rank;

    // Multiplier from the expression, not the displayed percentage.
    const multiplierMatch = /\*\s*(\.?\d+(?:\.\d+)?)\s+round/.exec(slot.prize_usd_expression ?? '');
    const multiplier = multiplierMatch?.[1] ? Number(multiplierMatch[1]) : null;
    const prize =
      total != null && multiplier != null ? Math.round(total * multiplier) : null;

    const teams = slot.teams.map((entry) => {
      const resolved = resolveTag(entry.tag, [...remaining]);
      if (resolved) remaining.delete(resolved);
      else unresolved.push(entry.tag);
      return {
        tag: entry.tag,
        team_name: resolved,
        last_opponent_tag: entry.last_vs,
        last_series_score: entry.last_score,
      };
    });

    return {
      placement: from === to ? ordinal(from) : `${ordinal(from)}–${ordinal(to)}`,
      rank_from: from,
      rank_to: to,
      prize_share_displayed: slot.prize_share,
      prize_multiplier: multiplier,
      prize_usd: prize,
      teams,
    };
  });

  // Last chance: a single unresolved tag against a single remaining team is
  // elimination, not a guess.
  if (unresolved.length === 1 && remaining.size === 1) {
    const orphan = unresolved[0]!;
    const only = [...remaining][0]!;
    for (const placement of placements) {
      for (const team of placement.teams) {
        if (team.tag === orphan && team.team_name === null) {
          team.team_name = only;
          remaining.delete(only);
          unresolved.length = 0;
        }
      }
    }
  }

  await writeFile(
    outUrl,
    `${JSON.stringify(
      {
        _note:
          'Placements and prize money. Prize amounts are DERIVED: Liquipedia stores a ' +
          'multiplier per slot and transcludes the pool total from a subpage. Both inputs ' +
          'are recorded here so every figure can be rechecked. Ranks come from slot order ' +
          'and the number of teams sharing a slot.',
        _attribution: proposal._attribution,
        _source: { type: 'url', url: events.events[key]!.source_url },
        event: key,
        prize_pool: proposal.prize_pool,
        prize_formula: 'round(prize_pool.total_usd * prize_multiplier)',
        placements,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  // ---- Report ----
  console.log(
    total != null
      ? `prize pool: $${total.toLocaleString('en-US')} (${proposal.prize_pool?.source_page})\n`
      : 'prize pool: UNKNOWN — amounts omitted\n',
  );

  let allocated = 0;
  for (const p of placements) {
    const money = p.prize_usd != null ? `$${p.prize_usd.toLocaleString('en-US')}` : '—';
    allocated += (p.prize_usd ?? 0) * p.teams.length;
    const names = p.teams.map((t) => t.team_name ?? `?? (${t.tag})`).join(', ');
    console.log(`  ${p.placement.padEnd(9)} ${money.padStart(12)}  ${names}`);
  }

  console.log(`\nteams placed: ${known.length - remaining.size}/${known.length}`);
  if (remaining.size) console.log(`  UNPLACED: ${[...remaining].join(', ')}`);
  if (unresolved.length) console.log(`  UNRESOLVED TAGS: ${unresolved.join(', ')}`);

  if (total != null) {
    const delta = allocated - total;
    console.log(
      `\nallocated $${allocated.toLocaleString('en-US')} of $${total.toLocaleString('en-US')} ` +
        `(${delta >= 0 ? '+' : ''}$${delta.toLocaleString('en-US')})`,
    );
    if (Math.abs(delta) > total * 0.005) {
      console.log('  NOTE: shares do not sum to the pool. Check for a missing slot.');
    } else if (delta !== 0) {
      // Each slot rounds independently and several are shared by 2-4 teams, so
      // a few dollars either way is arithmetic, not a missing team.
      console.log('  (difference is per-slot rounding, as expected)');
    }
  }

  console.log(`\nwrote ${outUrl.pathname}`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
