/**
 * Join Liquipedia rosters to OpenDota account_ids and queue what is ambiguous.
 *
 *   npm run propose:identities -- ti08
 *
 * Liquipedia knows who played, with the handle they used at the time.
 * OpenDota knows the account_ids. Neither knows both, so they have to be joined.
 *
 * Four tiers, and the distinction between them is the entire point:
 *
 *   matched   A normalised handle match. OpenDota's current name happens to
 *             equal the handle used at the event.
 *   deduced   Every other player on the roster matched, one remains on each
 *             side, and both rosters are the same size. That is elimination,
 *             not a guess — but it is only sound while the rosters agree, so
 *             the script refuses to deduce when they do not.
 *   inferred  Proposed by farm priority: Liquipedia's roles run 1 (most farm)
 *             to 5 (least), so ranking unmatched accounts by median GPM
 *             proposes the same ordering. This IS a guess. Carry and mid
 *             invert regularly and a farming support can outpace a
 *             sacrificial offlaner, so every one of these needs a human.
 *   ambiguous No defensible proposal at all — usually a roster-size mismatch,
 *             which is what a stand-in looks like from here.
 *
 * Nothing here writes to data/entities/. It writes a proposal for review, and
 * "inferred" must never be promoted without someone confirming it.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';

interface LiquipediaPlayer {
  handle: string;
  role: string;
}
interface LiquipediaTeam {
  team_name: string;
  players: LiquipediaPlayer[];
  coach: string | null;
  qualification: { method: string | null; via: string | null; placement: string | null } | null;
}
interface ScaffoldPlayer {
  account_id: number;
  nickname: string | null;
  verified: boolean;
  matches: number;
  heroes_played: string[];
  join_hints: string[];
  median_gpm: number | null;
  modal_lane_role: number | null;
  teams: { team_id: number | null; team_name: string | null; team_name_verified: boolean }[];
}

type Confidence = 'matched' | 'deduced' | 'inferred' | 'ambiguous';

interface ProposedIdentity {
  account_id: number | null;
  handle: string;
  role: string;
  confidence: Confidence;
  evidence: string;
}

/**
 * Handles carry decoration that is not part of the identity: trailing dashes and
 * carets, clan marks, CJK suffixes. Strip to comparable letters and digits.
 */
function normalise(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

async function readJson<T>(path: URL): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

function matchTeams(
  liquipedia: LiquipediaTeam[],
  byTeamId: Map<number, ScaffoldPlayer[]>,
  openDotaName: Map<number, { name: string | null; verified: boolean }>,
): { lp: LiquipediaTeam; teamId: number | null; how: string }[] {
  const used = new Set<number>();
  const pairs: { lp: LiquipediaTeam; teamId: number | null; how: string }[] = [];

  for (const lp of liquipedia) {
    let teamId: number | null = null;
    let how = 'unmatched';

    for (const [id, info] of openDotaName) {
      if (used.has(id) || !info.name) continue;
      if (normalise(info.name) === normalise(lp.team_name)) {
        teamId = id;
        how = info.verified ? 'confirmed name' : 'name match';
        break;
      }
    }

    // A confirmed name is the name AS OF the event, so a match against it is
    // authoritative. Anything else is OpenDota's present-day name and may
    // legitimately differ from what the org was called at the time.
    if (teamId == null) {
      const candidates = [...openDotaName.entries()].filter(([id]) => !used.has(id));
      const prefix = candidates.find(
        ([, info]) =>
          info.name &&
          (normalise(info.name).startsWith(normalise(lp.team_name)) ||
            normalise(lp.team_name).startsWith(normalise(info.name))),
      );
      if (prefix) {
        teamId = prefix[0];
        how = 'prefix match — CHECK';
      }
    }

    if (teamId != null) used.add(teamId);
    pairs.push({ lp, teamId, how });
    void byTeamId;
  }
  return pairs;
}

function joinRoster(lp: LiquipediaTeam, accounts: ScaffoldPlayer[]): ProposedIdentity[] {
  const out: ProposedIdentity[] = [];
  const remainingAccounts = [...accounts];
  const remainingPlayers = [...lp.players];

  // Tier 1: normalised match against ANY identity string observed for the
  // account — the pro name, the Steam persona, or either as reported by
  // proPlayers. Hints are join keys only; the handle we display still comes
  // from Liquipedia, which is the one source that knows the event-time value.
  for (const player of [...remainingPlayers]) {
    let matchedHint: string | null = null;
    const hit = remainingAccounts.find((a) => {
      const hint = [a.nickname, ...(a.join_hints ?? [])]
        .filter((h): h is string => Boolean(h))
        .find((h) => normalise(h) === normalise(player.handle));
      if (hint) matchedHint = hint;
      return Boolean(hint);
    });
    if (!hit) continue;
    out.push({
      account_id: hit.account_id,
      handle: player.handle,
      role: player.role,
      confidence: 'matched',
      evidence: `identity string "${matchedHint}" normalises to "${normalise(player.handle)}"`,
    });
    remainingAccounts.splice(remainingAccounts.indexOf(hit), 1);
    remainingPlayers.splice(remainingPlayers.indexOf(player), 1);
  }

  // Tier 2: one left on each side, and the rosters were the same size to begin
  // with. Only then is elimination sound.
  const rostersAgree = lp.players.length === accounts.length;
  if (rostersAgree && remainingPlayers.length === 1 && remainingAccounts.length === 1) {
    const player = remainingPlayers[0]!;
    const account = remainingAccounts[0]!;
    out.push({
      account_id: account.account_id,
      handle: player.handle,
      role: player.role,
      confidence: 'deduced',
      evidence: `Last unmatched player on a ${lp.players.length}-man roster where the other ${lp.players.length - 1} matched`,
    });
    return out;
  }

  // Tier 3: propose by farm priority. Liquipedia's role numbers run 1 (most
  // farm) to 5 (least); ranking the unmatched accounts by median GPM proposes
  // the same ordering. This is inference, not deduction — carry and mid can
  // invert, and a farming support can outpace a sacrificial offlaner — so it
  // is labelled and carries its evidence for a human to accept or correct.
  const positional = remainingPlayers
    .filter((p) => /^[1-5]$/.test(p.role))
    .sort((a, b) => Number(a.role) - Number(b.role));

  const rankable = remainingAccounts.filter((a) => a.median_gpm != null);

  if (rostersAgree && positional.length === remainingPlayers.length && rankable.length === remainingAccounts.length && positional.length === rankable.length) {
    const byFarm = [...rankable].sort((a, b) => (b.median_gpm ?? 0) - (a.median_gpm ?? 0));
    for (const [i, player] of positional.entries()) {
      const account = byFarm[i]!;
      out.push({
        account_id: account.account_id,
        handle: player.handle,
        role: player.role,
        confidence: 'inferred',
        evidence:
          `Farm-priority rank ${i + 1} of ${byFarm.length} unmatched (median ${account.median_gpm} GPM, ` +
          `modal lane_role ${account.modal_lane_role ?? '?'}). Top heroes: ${account.heroes_played.slice(0, 5).join(', ')}`,
      });
    }
    return out;
  }

  // Tier 4: no defensible proposal. Hand it over with the evidence attached.
  for (const player of remainingPlayers) {
    out.push({
      account_id: null,
      handle: player.handle,
      role: player.role,
      confidence: 'ambiguous',
      evidence: rostersAgree
        ? `${remainingPlayers.length} players and ${remainingAccounts.length} accounts unresolved; ` +
          `candidates: ${remainingAccounts.map((a) => `${a.account_id}(${a.median_gpm ?? '?'}gpm)`).join(', ')}`
        : `Roster size mismatch: Liquipedia ${lp.players.length}, OpenDota ${accounts.length}. Possible stand-in.`,
    });
  }
  return out;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  if (!key) {
    console.error('usage: npm run propose:identities -- <event-key>');
    process.exit(1);
  }

  const lpFile = await readJson<{ teams: LiquipediaTeam[]; _attribution: string }>(
    new URL(`../data/proposals/${key}.liquipedia.json`, import.meta.url),
  );
  const scaffold = await readJson<{ players: ScaffoldPlayer[] }>(
    new URL(`../data/entities/players.${key}.scaffold.json`, import.meta.url),
  );

  const byTeamId = new Map<number, ScaffoldPlayer[]>();
  const openDotaName = new Map<number, { name: string | null; verified: boolean }>();
  for (const player of scaffold.players) {
    const team = player.teams[0];
    if (!team || team.team_id == null) continue;
    byTeamId.set(team.team_id, [...(byTeamId.get(team.team_id) ?? []), player]);
    openDotaName.set(team.team_id, {
      name: team.team_name,
      verified: team.team_name_verified,
    });
  }

  const pairs = matchTeams(lpFile.teams, byTeamId, openDotaName);

  const results: {
    team_name: string;
    team_id: number | null;
    team_match: string;
    coach: string | null;
    qualification: LiquipediaTeam['qualification'];
    players: ProposedIdentity[];
  }[] = [];

  for (const { lp, teamId, how } of pairs) {
    const accounts = teamId != null ? (byTeamId.get(teamId) ?? []) : [];
    results.push({
      team_name: lp.team_name,
      team_id: teamId,
      team_match: how,
      coach: lp.coach,
      qualification: lp.qualification,
      players: teamId != null ? joinRoster(lp, accounts) : [],
    });
  }

  const all = results.flatMap((r) => r.players);
  const counts: Record<Confidence, number> = {
    matched: all.filter((p) => p.confidence === 'matched').length,
    deduced: all.filter((p) => p.confidence === 'deduced').length,
    inferred: all.filter((p) => p.confidence === 'inferred').length,
    ambiguous: all.filter((p) => p.confidence === 'ambiguous').length,
  };

  const outDir = new URL('../data/proposals', import.meta.url).pathname;
  await mkdir(outDir, { recursive: true });
  const outPath = `${outDir}/${key}.identities.json`;
  await writeFile(
    outPath,
    JSON.stringify(
      {
        _generated_by: 'scripts/propose-identities.ts',
        _generated_at: new Date().toISOString(),
        _status:
          'PROPOSAL. "matched" and "deduced" are defensible but unconfirmed; "ambiguous" needs a human. Promote into data/entities/ only after review.',
        _attribution: lpFile._attribution,
        event: key,
        summary: counts,
        teams: results,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`teams joined: ${results.filter((r) => r.team_id != null).length}/${results.length}`);
  console.log(
    `players: ${counts.matched} matched, ${counts.deduced} deduced, ${counts.inferred} inferred, ${counts.ambiguous} ambiguous\n`,
  );

  for (const team of results) {
    const unresolved = team.players.filter((p) => p.confidence === 'ambiguous');
    const flag = team.team_id == null ? '!!' : unresolved.length ? ' ?' : ' ✓';
    console.log(`${flag} ${team.team_name}  [${team.team_match}]`);
    for (const p of team.players) {
      const mark = { matched: '✓', deduced: '~', inferred: '≈', ambiguous: '?' }[p.confidence];
      console.log(
        `      ${mark} ${p.role}  ${p.handle.padEnd(16)} ${p.account_id ?? '— unresolved —'}`,
      );
    }
  }

  // A team that never joined contributes no player rows at all, so its players
  // would otherwise disappear from every count. Say so loudly.
  const unjoined = results.filter((r) => r.team_id == null);
  if (unjoined.length) {
    const lost = unjoined.reduce((n, t) => n + (lpFile.teams.find((x) => x.team_name === t.team_name)?.players.length ?? 0), 0);
    console.log(
      `\n  UNJOINED TEAMS: ${unjoined.map((t) => t.team_name).join(', ')}` +
        `\n  ${lost} players are absent from the counts above entirely, not resolved.` +
        `\n  Add the event-time name to data/entities/teams.json to join them.`,
    );
  }

  const needsHuman = counts.inferred + counts.ambiguous;
  if (needsHuman) {
    console.log(
      `\n${needsHuman} players need confirmation (${counts.inferred} inferred, ${counts.ambiguous} ambiguous).` +
        `\nEvidence for each is in ${outPath}.`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
