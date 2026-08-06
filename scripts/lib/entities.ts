/**
 * Human-confirmed identity, loaded by the scaffold generator so it reports
 * only what is still unknown.
 *
 * OpenDota is authoritative for IDs and match facts, never for names. These
 * files are the other half: what a team or player was called AS OF an event.
 */

import { readFile } from 'node:fs/promises';

export interface Source {
  type: 'owner-confirmation' | 'url';
  date?: string;
  url?: string;
}

interface NameAtEvent {
  event: string;
  name: string;
  source: Source;
}

interface HandleAtEvent {
  event: string;
  handle: string;
  source: Source;
}

export interface TeamEntity {
  team_id: number;
  names: NameAtEvent[];
  opendota_current_name: string | null;
}

export interface PlayerEntity {
  account_id: number;
  handles: HandleAtEvent[];
  opendota_current_name: string | null;
  real_name: string | null;
  nationality: string | null;
}

export interface Entities {
  teamNameAt(teamId: number | null, event: string): { name: string; source: Source } | null;
  playerHandleAt(accountId: number, event: string): { handle: string; source: Source } | null;
}

async function readJsonIfPresent<T>(url: URL): Promise<T | null> {
  try {
    return JSON.parse(await readFile(url, 'utf8')) as T;
  } catch {
    return null;
  }
}

export async function loadEntities(): Promise<Entities> {
  const teamsFile = await readJsonIfPresent<{ teams: TeamEntity[] }>(
    new URL('../../data/entities/teams.json', import.meta.url),
  );
  const playersFile = await readJsonIfPresent<{ players: PlayerEntity[] }>(
    new URL('../../data/entities/players.json', import.meta.url),
  );

  const teams = new Map((teamsFile?.teams ?? []).map((t) => [t.team_id, t]));
  const players = new Map((playersFile?.players ?? []).map((p) => [p.account_id, p]));

  return {
    teamNameAt(teamId, event) {
      if (teamId == null) return null;
      const entry = teams.get(teamId)?.names.find((n) => n.event === event);
      return entry ? { name: entry.name, source: entry.source } : null;
    },
    playerHandleAt(accountId, event) {
      const entry = players.get(accountId)?.handles.find((h) => h.event === event);
      return entry ? { handle: entry.handle, source: entry.source } : null;
    },
  };
}

/** Renders a source for console output and for the `nickname_source` field. */
export function describeSource(source: Source): string {
  return source.type === 'url' ? (source.url ?? 'url') : `owner-confirmation:${source.date ?? ''}`;
}
