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
  /**
   * Final inventory at the end of the match, as item ids; 0 means an empty
   * slot. This is what the player was holding when it ended, NOT everything
   * they bought — an item sold or consumed mid-game leaves no trace here.
   */
  item_0?: number;
  item_1?: number;
  item_2?: number;
  item_3?: number;
  item_4?: number;
  item_5?: number;
  backpack_0?: number;
  backpack_1?: number;
  backpack_2?: number;
  /** Present only on parsed replays. Catches what final inventory misses. */
  purchase_log?: { time: number; key: string }[] | null;
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

/**
 * An entry from /api/constants/items, keyed by the item's short name.
 *
 * `qual` is how the meta list separates real items from noise: "component"
 * and "consumable" flood any purchase count with branches and tangoes. Using
 * the field rather than a hand-written exclusion list means the rule is
 * Valve's own classification, not our guess about what counts.
 */
export interface ItemConstant {
  id: number;
  dname?: string;
  cost?: number | null;
  qual?: string;
}

export async function fetchItems(cacheDir: string): Promise<Record<string, ItemConstant>> {
  const { data } = await fetchJsonCached<Record<string, ItemConstant>>(`${BASE}/constants/items`, {
    cachePath: `${cacheDir}/constants-items.json`,
  });
  return data;
}

/**
 * An entry from /api/constants/patch — the game's version history.
 *
 * `date` is the patch's release timestamp, which is what makes this usable as
 * a check rather than a lookup: a match played before its own patch's release
 * date means the mapping is wrong, and that is worth failing on.
 *
 * The relationship between a match's `patch` field and this table is not
 * documented by OpenDota. It has historically been the array INDEX, and `id`
 * has historically equalled the index, so both readings agree — but only
 * historically. compute-patch.ts resolves by both and reports a disagreement
 * instead of silently preferring one.
 */
export interface PatchConstant {
  id: number;
  name: string;
  date: string;
}

export async function fetchPatches(cacheDir: string): Promise<PatchConstant[]> {
  const { data } = await fetchJsonCached<PatchConstant[]>(`${BASE}/constants/patch`, {
    cachePath: `${cacheDir}/constants-patch.json`,
  });
  return data;
}

export async function fetchHeroes(cacheDir: string): Promise<Hero[]> {
  const { data } = await fetchJsonCached<Hero[]>(`${BASE}/heroes`, {
    cachePath: `${cacheDir}/heroes.json`,
  });
  return data;
}
