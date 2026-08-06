import React, { useState } from 'react';
import { TIData, TITeamProfile } from '../types';
import { tiTeamsDataRecord, getTIAllTeams } from '../data/tiTeamsData';
import { TeamYearLogo } from './TeamYearLogo';
import { PlayerAvatar } from './PlayerAvatar';
import { getHeroImageUrl } from '../utils/heroUtils';
import { Trophy, Shield, Search, Flame } from 'lucide-react';

interface TeamsTabProps {
  ti: TIData;
}

export const TeamsTab: React.FC<TeamsTabProps> = ({ ti }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');

  // Load team profiles for current TI
  const teams: TITeamProfile[] = getTIAllTeams(ti.id);

  // Regions filter options
  const regions = ['ALL', 'EEU', 'WEU', 'CN', 'SEA', 'NA'];

  const filteredTeams = teams.filter((team) => {
    const matchesRegion = selectedRegion === 'ALL' || team.region === selectedRegion;
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.placement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.roster.some(
        (p) =>
          p.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.topHeroes.some((h) => h.heroName.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    return matchesRegion && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn font-space-mono">
      {/* Header Banner */}
      <div className="p-6 bg-[#0c0c0e] border border-[rgba(228,228,231,0.15)] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#ff4d00]/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-[#ff4d00]/10 text-[#ff4d00] border border-[#ff4d00]/30">
                PARTICIPATING TEAMS & HERO STATS
              </span>
              <span className="text-xs text-[rgba(228,228,231,0.5)]">[The International {ti.yearNumber} ({ti.id})]</span>
            </div>
            <h2 className="font-syne text-2xl font-extrabold text-[#e4e4e7] uppercase tracking-tight">
              TEAM ROSTERS & EVENT TOP HEROES
            </h2>
            <p className="text-xs text-[rgba(228,228,231,0.7)] font-sans max-w-2xl mt-1">
              Explore every competing organization at The International {ti.yearNumber} ({ti.id}), complete with historical era team logos, player cards, and signature hero picks from the tournament.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(228,228,231,0.1)] text-center">
              <span className="text-[10px] text-[rgba(228,228,231,0.5)] block">TOTAL PRIZE</span>
              <span className="font-syne text-sm font-bold text-[#33ff99]">{ti.totalPrizePool}</span>
            </div>
            <div className="p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(228,228,231,0.1)] text-center">
              <span className="text-[10px] text-[rgba(228,228,231,0.5)] block">EVENT CHAMPION</span>
              <span className="font-syne text-sm font-bold text-[#ff4d00]">{ti.winnerTeam}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-4 border-t border-[rgba(228,228,231,0.1)] flex flex-wrap items-center justify-between gap-4">
          {/* Search Field */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 text-[rgba(228,228,231,0.4)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by team, player, hero..."
              className="w-full pl-9 pr-4 py-2 bg-[rgba(0,0,0,0.5)] border border-[rgba(228,228,231,0.2)] focus:border-[#ff4d00] text-xs text-[#e4e4e7] placeholder-[rgba(228,228,231,0.3)] outline-none transition-colors"
            />
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <span className="meta-label mr-2 hidden sm:inline-block">REGION:</span>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 transition-all cursor-pointer font-bold border ${
                  selectedRegion === reg
                    ? 'bg-[#ff4d00] text-[#0c0c0e] border-[#ff4d00]'
                    : 'bg-transparent text-[rgba(228,228,231,0.6)] hover:text-[#e4e4e7] border-[rgba(228,228,231,0.15)]'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="space-y-8">
        {filteredTeams.length === 0 ? (
          <div className="p-12 text-center bg-[#0c0c0e] border border-[rgba(228,228,231,0.1)] space-y-2">
            <Shield className="w-8 h-8 text-[rgba(228,228,231,0.3)] mx-auto" />
            <p className="text-xs text-[rgba(228,228,231,0.6)]">No teams found matching query &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          filteredTeams.map((team) => (
            <div
              key={team.id}
              className={`bg-[#0c0c0e] border transition-all ${
                team.placementRank === 1
                  ? 'border-[#ff4d00] shadow-[0_0_20px_rgba(255,77,0,0.15)]'
                  : team.placementRank === 2
                  ? 'border-[rgba(228,228,231,0.4)]'
                  : 'border-[rgba(228,228,231,0.15)]'
              }`}
            >
              {/* Team Top Header */}
              <div className="p-5 border-b border-[rgba(228,228,231,0.1)] bg-[rgba(255,255,255,0.015)] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Era-Specific Team Logo */}
                  <TeamYearLogo
                    teamName={team.name}
                    tiId={ti.id}
                    logoUrl={team.logoUrl}
                    className="w-16 h-16"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(228,228,231,0.2)] text-[rgba(228,228,231,0.8)]">
                        {team.region} REGION
                      </span>
                      {team.placementRank === 1 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ff4d00] text-[#0c0c0e] flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> CHAMPION
                        </span>
                      )}
                    </div>

                    <h3 className="font-syne text-xl font-extrabold text-[#e4e4e7] mt-1 flex items-center gap-2">
                      {team.name}
                    </h3>
                    <p className="text-xs text-[#33ff99] font-bold">{team.placement}</p>
                  </div>
                </div>

                {/* Historic Context Box */}
                <div className="max-w-md p-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(228,228,231,0.1)] text-xs text-[rgba(228,228,231,0.8)] font-sans">
                  <span className="text-[10px] font-space-mono text-[#ff4d00] font-bold block uppercase mb-1">
                    HISTORIC PRE-EVENT SUCCESS:
                  </span>
                  {team.successUpToPoint}
                </div>
              </div>

              {/* Player Roster Cards Grid */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {team.roster.map((player, pIdx) => (
                  <div
                    key={pIdx}
                    className="bg-[#121215] border border-[rgba(228,228,231,0.1)] p-4 flex flex-col justify-between hover:border-[rgba(255,77,0,0.5)] transition-all group"
                  >
                    {/* Top Player Profile Header */}
                    <div>
                      <div className="mb-3 aspect-square border border-[rgba(228,228,231,0.15)] overflow-hidden group-hover:border-[#ff4d00] transition-colors">
                        <PlayerAvatar
                          nickname={player.nickname}
                          realName={player.realName}
                          role={player.role}
                          avatarUrl={player.avatarUrl}
                          countryFlag={player.countryFlag}
                          posIndex={pIdx}
                          tiId={ti.id}
                          className="w-full h-full"
                        />
                      </div>

                      {/* Player Name */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-syne font-bold text-base text-[#e4e4e7] group-hover:text-[#ff4d00] transition-colors">
                            {player.nickname}
                          </h4>
                          <span className="text-[10px] text-[rgba(228,228,231,0.4)]">
                            {player.nationality}
                          </span>
                        </div>
                        <p className="text-[11px] text-[rgba(228,228,231,0.5)] font-sans truncate">
                          {player.realName}
                        </p>
                      </div>
                    </div>

                    {/* Top 5 Heroes Section */}
                    <div className="pt-3 border-t border-[rgba(228,228,231,0.1)] space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-[#ff4d00] font-bold">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-[#ff4d00]" /> TOP 5 HEROES
                        </span>
                        <span className="text-[rgba(228,228,231,0.4)]">WIN%</span>
                      </div>

                      <div className="space-y-1.5">
                        {player.topHeroes.map((hero, hIdx) => (
                          <div
                            key={hIdx}
                            className="p-1 bg-[rgba(0,0,0,0.5)] border border-[rgba(228,228,231,0.08)] flex items-center justify-between text-[11px]"
                          >
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              {/* Hero Portrait Thumbnail */}
                              <img
                                src={getHeroImageUrl(hero.heroName)}
                                alt={hero.heroName}
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                className="w-6 h-4 object-cover border border-white/20 bg-black flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <span className="text-[#e4e4e7] font-medium truncate text-[10px]">
                                {hero.heroName}
                              </span>
                            </div>

                            <div className="text-right flex items-center gap-1">
                              <span className="text-[9px] text-[rgba(228,228,231,0.4)]">
                                ({hero.matchesPlayed}m)
                              </span>
                              <span className="text-[10px] font-bold text-[#33ff99]">
                                {hero.winRate}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

