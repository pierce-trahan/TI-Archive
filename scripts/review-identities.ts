/**
 * Render the identity proposal as a review sheet.
 *
 *   npm run review:identities -- ti08
 *
 * Writes data/proposals/<event>.review.md — readable on GitHub, on a phone,
 * anywhere. Only rows that need a human appear; settled rows are summarised.
 */

import { readFile, writeFile } from 'node:fs/promises';

interface Identity {
  account_id: number | null;
  handle: string;
  role: string;
  confidence: 'matched' | 'deduced' | 'inferred' | 'ambiguous';
  evidence: string;
}
interface TeamResult {
  team_name: string;
  team_id: number | null;
  team_match: string;
  coach: string | null;
  players: Identity[];
}

const ROLE_LABEL: Record<string, string> = {
  '1': 'Carry',
  '2': 'Mid',
  '3': 'Offlane',
  '4': 'Soft sup',
  '5': 'Hard sup',
};

/** Pulls the numbers back out of the evidence string for a compact table. */
function evidenceBits(evidence: string): { gpm: string; lane: string; heroes: string } {
  const gpm = /median (\d+) GPM/.exec(evidence)?.[1] ?? '—';
  const lane = /modal lane_role (\d+|\?)/.exec(evidence)?.[1] ?? '—';
  const heroes = /Top heroes: (.*)$/.exec(evidence)?.[1] ?? '';
  return { gpm, lane, heroes };
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run review:identities -- <event-key>');
    process.exit(1);
  }

  const path = new URL(`../data/proposals/${key}.identities.json`, import.meta.url);
  const proposal = JSON.parse(await readFile(path, 'utf8')) as {
    summary: Record<string, number>;
    teams: TeamResult[];
  };

  const lines: string[] = [];
  lines.push(`# ${key.toUpperCase()} — identity review`);
  lines.push('');
  lines.push(
    'Rows below are **proposals**, not data. Nothing here reaches `data/entities/` ' +
      'until it is confirmed. Reply with corrections; anything you do not correct is ' +
      'taken as confirmed.',
  );
  lines.push('');
  lines.push(
    `Settled without review: **${proposal.summary.matched} matched** (handle matched an ` +
      `identity string on the account) and **${proposal.summary.deduced} deduced** ` +
      `(last player left on a roster where everyone else matched).`,
  );
  lines.push('');
  lines.push(
    `Needing review: **${proposal.summary.inferred} inferred**` +
      (proposal.summary.ambiguous ? ` and **${proposal.summary.ambiguous} ambiguous**` : '') +
      '.',
  );
  lines.push('');
  lines.push(
    '> Inferred rows are ranked by median GPM against Liquipedia\'s role numbers ' +
      '(1 = most farm). **Carry/mid and offlane/soft-support are the pairs that ' +
      'invert most often** — those are worth the closest look.',
  );
  lines.push('');
  lines.push('`lane_role`: 1 = safe lane, 2 = mid, 3 = off lane, 4 = jungle.');
  lines.push('');

  const needy = proposal.teams.filter((t) =>
    t.players.some((p) => p.confidence === 'inferred' || p.confidence === 'ambiguous'),
  );

  for (const team of needy) {
    const open = team.players.filter(
      (p) => p.confidence === 'inferred' || p.confidence === 'ambiguous',
    );
    const settled = team.players.filter(
      (p) => p.confidence === 'matched' || p.confidence === 'deduced',
    );

    lines.push(`## ${team.team_name}`);
    lines.push('');
    if (settled.length) {
      lines.push(
        `Already settled: ${settled
          .sort((a, b) => a.role.localeCompare(b.role))
          .map((p) => `**${p.handle}** (${ROLE_LABEL[p.role] ?? p.role})`)
          .join(' · ')}`,
      );
      lines.push('');
    }

    lines.push('| Role | Proposed | account_id | Median GPM | lane_role | Heroes played |');
    lines.push('| --- | --- | --- | ---: | :---: | --- |');
    for (const p of open.sort((a, b) => a.role.localeCompare(b.role))) {
      const { gpm, lane, heroes } = evidenceBits(p.evidence);
      lines.push(
        `| ${ROLE_LABEL[p.role] ?? p.role} | **${p.handle}** | \`${p.account_id ?? '—'}\` | ${gpm} | ${lane} | ${heroes} |`,
      );
    }
    lines.push('');
  }

  const outPath = new URL(`../data/proposals/${key}.review.md`, import.meta.url).pathname;
  await writeFile(outPath, lines.join('\n'), 'utf8');
  console.log(`${needy.length} teams need review`);
  console.log(`wrote ${outPath}`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
