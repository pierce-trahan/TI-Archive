/**
 * Promote a reviewed identity proposal into the entity files.
 *
 *   npm run promote:identities -- ti08 2026-08-06
 *
 * Only run this after a human has reviewed the proposal. The date argument is
 * the date of that review and is recorded as the confirmation date.
 *
 * Provenance is assigned per row, by how the row was actually established:
 *
 *   matched / deduced  ->  the Liquipedia page. The handle came from
 *                          Liquipedia; joining it to an account_id was
 *                          mechanical, not a judgement call.
 *   inferred           ->  owner-confirmation. These were a guess until a
 *                          human looked at them, so the human is the source.
 *
 * Existing entries are preserved. An entry already confirmed for this event is
 * never overwritten — the earlier confirmation wins and is reported as skipped.
 */

import { readFile, writeFile } from 'node:fs/promises';

type Confidence = 'matched' | 'deduced' | 'inferred' | 'ambiguous';

interface Source {
  type: 'owner-confirmation' | 'url';
  date?: string;
  url?: string;
}

interface Proposal {
  _attribution: string;
  teams: {
    team_name: string;
    team_id: number | null;
    coach: string | null;
    qualification: { method: string | null; via: string | null; placement: string | null } | null;
    players: {
      account_id: number | null;
      handle: string;
      role: string;
      confidence: Confidence;
      evidence: string;
    }[];
  }[];
}

interface PlayerEntity {
  account_id: number;
  handles: { event: string; handle: string; source: Source }[];
  opendota_current_name?: string | null;
  real_name: string | null;
  nationality: string | null;
  note?: string;
}

interface TeamEntity {
  team_id: number;
  names: { event: string; name: string; source: Source }[];
  opendota_current_name?: string | null;
  note?: string;
}

interface RosterEntry {
  team_id: number;
  /** Hand-added: positions listed are a default, not a per-game constant. */
  role_flexibility?: unknown;
  notes?: unknown;
}

const ROLE_LABEL: Record<string, string> = {
  '1': 'Carry',
  '2': 'Mid',
  '3': 'Offlane',
  '4': 'Soft Support',
  '5': 'Hard Support',
};

async function readJson<T>(url: URL): Promise<T> {
  return JSON.parse(await readFile(url, 'utf8')) as T;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  const reviewDate = process.argv[3];
  if (!key || !reviewDate) {
    console.error('usage: npm run promote:identities -- <event-key> <YYYY-MM-DD review date>');
    process.exit(1);
  }

  const proposalUrl = new URL(`../data/proposals/${key}.identities.json`, import.meta.url);
  const playersUrl = new URL('../data/entities/players.json', import.meta.url);
  const teamsUrl = new URL('../data/entities/teams.json', import.meta.url);
  const rostersUrl = new URL(`../data/events/${key}.rosters.json`, import.meta.url);
  const eventUrl = new URL('../data/sources/events.json', import.meta.url);

  const proposal = await readJson<Proposal>(proposalUrl);
  const playersFile = await readJson<{ _note: string; _source_types: unknown; players: PlayerEntity[] }>(playersUrl);
  const teamsFile = await readJson<{ _note: string; _source_types: unknown; teams: TeamEntity[] }>(teamsUrl);
  const rostersFile = await readJson<{ _note: string; event: string; rosters: RosterEntry[] }>(rostersUrl);

  // Hand-written annotations on a roster must survive a re-run. Anything a
  // human added — role flexibility, stand-in notes — is carried forward.
  const preserved = new Map<number, Pick<RosterEntry, 'role_flexibility' | 'notes'>>();
  for (const existing of rostersFile.rosters) {
    if (existing.team_id == null) continue;
    if (existing.role_flexibility || existing.notes) {
      preserved.set(existing.team_id, {
        role_flexibility: existing.role_flexibility,
        notes: existing.notes,
      });
    }
  }
  const events = await readJson<{ events: Record<string, { source_url: string }> }>(eventUrl);

  const liquipediaSource: Source = { type: 'url', url: events.events[key]!.source_url };
  const ownerSource: Source = { type: 'owner-confirmation', date: reviewDate };

  const playersById = new Map(playersFile.players.map((p) => [p.account_id, p]));
  const teamsById = new Map(teamsFile.teams.map((t) => [t.team_id, t]));

  let addedPlayers = 0;
  let skippedPlayers = 0;
  let addedTeams = 0;
  const rosters: unknown[] = [];

  for (const team of proposal.teams) {
    if (team.team_id == null) continue;

    // ---- team name as of this event ----
    let teamEntity = teamsById.get(team.team_id);
    if (!teamEntity) {
      teamEntity = { team_id: team.team_id, names: [], real_name: null } as unknown as TeamEntity;
      teamEntity.names = [];
      teamsById.set(team.team_id, teamEntity);
      teamsFile.teams.push(teamEntity);
    }
    if (!teamEntity.names.some((n) => n.event === key)) {
      teamEntity.names.push({ event: key, name: team.team_name, source: liquipediaSource });
      addedTeams++;
    }

    // ---- players ----
    const rosterPlayers: unknown[] = [];
    for (const player of team.players) {
      if (player.account_id == null) continue;

      const source = player.confidence === 'inferred' ? ownerSource : liquipediaSource;

      let entity = playersById.get(player.account_id);
      if (!entity) {
        entity = {
          account_id: player.account_id,
          handles: [],
          real_name: null,
          nationality: null,
        };
        playersById.set(player.account_id, entity);
        playersFile.players.push(entity);
      }

      if (entity.handles.some((h) => h.event === key)) {
        skippedPlayers++;
      } else {
        entity.handles.push({ event: key, handle: player.handle, source });
        addedPlayers++;
      }

      rosterPlayers.push({
        position: Number(player.role),
        role: ROLE_LABEL[player.role] ?? player.role,
        handle: player.handle,
        account_id: player.account_id,
        established_by: player.confidence,
      });
    }

    rosters.push({
      team_id: team.team_id,
      team_name: team.team_name,
      ...(preserved.get(team.team_id) ?? {}),
      coach: team.coach,
      qualification: team.qualification,
      source: liquipediaSource,
      identity_review: { reviewed_by: 'owner', date: reviewDate },
      players: (rosterPlayers as { position: number }[]).sort((a, b) => a.position - b.position),
    });
  }

  playersFile.players.sort((a, b) => a.account_id - b.account_id);
  teamsFile.teams.sort((a, b) => a.team_id - b.team_id);

  await writeFile(playersUrl, `${JSON.stringify(playersFile, null, 2)}\n`, 'utf8');
  await writeFile(teamsUrl, `${JSON.stringify(teamsFile, null, 2)}\n`, 'utf8');
  await writeFile(
    rostersUrl,
    `${JSON.stringify({ ...rostersFile, _attribution: proposal._attribution, rosters }, null, 2)}\n`,
    'utf8',
  );

  console.log(`teams:   ${addedTeams} names added for ${key}`);
  console.log(`players: ${addedPlayers} handles added, ${skippedPlayers} already confirmed (left alone)`);
  console.log(`rosters: ${rosters.length} written to data/events/${key}.rosters.json`);
}

main().catch((error: unknown) => {
  console.error(`\nFAILED: ${(error as Error).message}`);
  process.exit(1);
});
