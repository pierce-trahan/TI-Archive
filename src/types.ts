export type TIVersionId =
  | 'TI1'
  | 'TI2'
  | 'TI3'
  | 'TI4'
  | 'TI5'
  | 'TI6'
  | 'TI7'
  | 'TI8'
  | 'TI9'
  | 'TI10'
  | 'TI11'
  | 'TI12'
  | 'TI13';

export type ActiveView = TIVersionId | 'hall-of-fame';

export type SubTab = 'story' | 'rosters' | 'teams' | 'venue' | 'macro' | 'micro' | 'notes';

export interface TopHeroStat {
  heroName: string;
  matchesPlayed: number;
  winRate: string; // e.g. "80% (8-2)"
}

export interface PlayerProfile {
  nickname: string;
  realName: string;
  role: string;
  nationality: string;
  countryFlag: string;
  avatarUrl?: string;
  topHeroes: TopHeroStat[];
}

export interface TITeamProfile {
  id: string;
  name: string;
  logoUrl?: string;
  placement: string;
  placementRank: number;
  successUpToPoint: string;
  region: string;
  roster: PlayerProfile[];
}

export interface PlayerRoster {
  nickname: string;
  realName?: string;
  role: string; // e.g. "Pos 1 (Carry)", "Pos 2 (Mid)", "Pos 3 (Offlane)", "Pos 4 (Soft Support)", "Pos 5 (Hard Support)"
  signatureHero: string;
  countryFlag?: string;
}

export interface MacroMoment {
  id: string;
  title: string;
  match: string; // e.g. "Grand Finals: Alliance vs Na'Vi (Game 5)"
  whyItMatters: string;
  videoUrl: string;
  youtubeId: string;
  timestamp?: string;
  highlightsSummary: string;
  draftNotes?: string;
}

export interface MicroPlay {
  id: string;
  title: string;
  player: string;
  hero: string;
  breakdown: string;
  videoUrl: string;
  youtubeId: string;
  casterQuote?: string;
  audioClipId?: string;
  timestamp?: string;
}

export interface SoundClip {
  id: string;
  title: string;
  caster: string;
  match: string;
  quote: string;
  transcription: string;
  audioSynthType: string; // e.g. 'ceeb' | 'dreamcoil' | 'fountainhook' | 'echoslam' | 'dingding' | 'lakad' | 'disastah'
}

export interface TIData {
  id: TIVersionId;
  yearNumber: number;
  dates: string;
  location: string;
  arena: string;
  themeColor: string; // Hex color for primary theme
  secondaryColor: string; // Hex color for secondary accent
  glowColor: string;
  waxSealName: string; // e.g. "Fiery Crimson", "Forest Emerald", "Golden Aegis"
  waxSealSymbol: string;
  patchVersion: string;
  totalPrizePool: string;
  crowdFundedPercentage?: string;
  
  // Champions
  winnerTeam: string;
  winnerScore: string;
  runnerUpTeam: string;
  winnerRoster: PlayerRoster[];
  coach?: string;

  // Story & Meta
  storyHeadline: string;
  storyParagraphs: string[];
  metaSnapshot: string;
  topPickedHeroes: string[];
  topBannedHeroes: string[];

  // Rosters & Drama
  invites: string[];
  qualifiers: string[];
  snubsAndDrama: string;
  postTIShuffle: string;

  // Venue & Vibe
  venueDescription: string;
  atmosphere: string;
  memesAndSideContent: string[];

  // Moments
  macroMoments: MacroMoment[];
  microPlays: MicroPlay[];

  // All Participating Teams & Top 5 Hero Stats
  teams?: TITeamProfile[];
}

export interface PersonalNote {
  tiId: TIVersionId;
  userNote: string;
  favoritePlayer: string;
  rating: number; // 1-5 stars
  updatedAt: string;
}

export interface HallOfFameChampion {
  year: TIVersionId;
  yearNum: number;
  teamName: string;
  score: string;
  runnerUp: string;
  roster: string[];
  prizePool: string;
  location: string;
  definingStrategy: string;
}
