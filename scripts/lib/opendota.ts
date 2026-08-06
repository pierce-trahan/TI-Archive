/**
 * OpenDota endpoints we use, and only the fields we actually read.
 *
 * See docs/DATA-NOTES.md for verified behaviour of these endpoints — in
 * particular that team names are frequently null on the match list, and that
 * player `name` is null for a large share of pros.
 */

import { fetchJsonCached } from './http.ts';

const BASE = 'https://api.opendota.com/api';

/** Summary record from /api/leagues/{id}/matches. */
export interface LeagueMatchSummary {
  match_id: number;
  start_time: number;
  duration: number;
  radiant_win: boolean;
  radiant_score: number;
  dire_score: number;
  radiant_team_id: number | null;
  /** Frequently null, including for every TI8 main-event match. */
  radiant_team_name: string | null;
  dire_team_id: number | null;
  dire_team_name: string | null;
  series_id: number | null;
  series_type: number | null;
  leagueid: number;
}

export interface MatchPlayer {
  /** The stable identity key. Everything else about a player can drift. */
  account_id: number | null;
  /** OpenDota's pro-player name. Null for a large share of players. */
  name: string | null;
  /** Current Steam persona. Drifts over time; never use as identity. */
  personaname: string | null;
  hero_id: number;
  player_slot: number;
  isRadiant?: boolean;
  kills: number;
  deaths: number;
  assists: number;
  gold_per_min: number;
  xp_per_min: number;
  last_hits: number;
  hero_damage: number | null;
  tower_damage: number | null;
  hero_healing: number | null;
}

export interface PickBan {
  is_pick: boolean;
  hero_id: number;
  /** 0 = radiant, 1 = dire. */
  team: number;
  order: number;
}

export interface Objective {
  type: string;
  time: number;
  slot?: number;
  key?: string | number;
  player_slot?: number;
  team?: number;
}

export interface MatchTeam {
  team_id: number;
  name: string | null;
  tag: string | null;
  logo_url?: string | null;
}

export interface MatchDetail {
  match_id: number;
  leagueid: number;
  start_time: number;
  duration: number;
  radiant_win: boolean;
  radiant_score: number;
  dire_score: number;
  radiant_team_id: number | null;
  dire_team_id: number | null;
  radiant_team: MatchTeam | null;
  dire_team: MatchTeam | null;
  players: MatchPlayer[];
  picks_bans: PickBan[] | null;
  objectives: Objective[] | null;
  series_id: number | null;
  series_type: number | null;
  patch?: number | null;
  /** Present only when the replay was parsed. Absence means "unknown", not zero. */
  version: number | null;
}

export interface Hero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: string;
  attack_type: string;
  roles: string[];
}

/** A match is only safe to derive replay-based stats from when it was parsed. */
export function isParsed(match: MatchDetail): boolean {
  return match.version != null && Array.isArray(match.objectives);
}

export async function fetchLeagueMatches(
  leagueId: number,
  cacheDir: string,
): Promise<LeagueMatchSummary[]> {
  const { data } = await fetchJsonCached<LeagueMatchSummary[]>(
    `${BASE}/leagues/${leagueId}/matches`,
    { cachePath: `${cacheDir}/league-${leagueId}-matches.json` },
  );
  return data;
}

export async function fetchMatchDetail(
  matchId: number,
  cacheDir: string,
): Promise<{ match: MatchDetail; cached: boolean }> {
  const { data, cached } = await fetchJsonCached<MatchDetail>(`${BASE}/matches/${matchId}`, {
    cachePath: `${cacheDir}/matches/${matchId}.json`,
  });
  return { match: data, cached };
}

export interface ProPlayer {
  account_id: number;
  name: string | null;
  personaname: string | null;
}

/**
 * Only *currently active* pros appear here — retired players are absent, which
 * is why this cannot close the identity gap on its own. Useful as an extra
 * source of join hints, never as a display name.
 */
export async function fetchProPlayers(cacheDir: string): Promise<ProPlayer[]> {
  const { data } = await fetchJsonCached<ProPlayer[]>(`${BASE}/proPlayers`, {
    cachePath: `${cacheDir}/proPlayers.json`,
  });
  return data;
}

export async function fetchHeroes(cacheDir: string): Promise<Hero[]> {
  const { data } = await fetchJsonCached<Hero[]>(`${BASE}/heroes`, {
    cachePath: `${cacheDir}/heroes.json`,
  });
  return data;
}
