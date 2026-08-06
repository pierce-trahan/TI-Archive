import React from 'react';
import { TIData } from '../types';

interface StoryTabProps {
  ti: TIData;
}

export const StoryTab: React.FC<StoryTabProps> = ({ ti }) => {
  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Hero Section */}
      <div className="hero-section grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-end border-b border-[rgba(228,228,231,0.1)] pb-8">
        <div className="space-y-2">
          <span className="meta-label">Tournament Chronicle</span>
          <h2 className="font-syne text-5xl sm:text-7xl font-extrabold tracking-tighter text-transparent stroke-text" style={{ WebkitTextStroke: '1px #e4e4e7' }}>
            {ti.id}//{ti.yearNumber}
          </h2>
          <div className="font-syne text-4xl sm:text-6xl font-black text-[#ff4d00] tracking-tight">
            {ti.winnerTeam.toUpperCase()}
          </div>

          {/* Stats Strip */}
          <div className="flex flex-wrap gap-6 pt-6 mt-4 border-t border-[rgba(228,228,231,0.1)] font-space-mono text-xs">
            <div className="stat-box">
              <span className="block text-[10px] text-[rgba(228,228,231,0.5)] mb-1">SCORE</span>
              <span className="text-[#e4e4e7] font-bold text-sm">{ti.winnerScore} VS {ti.runnerUpTeam.toUpperCase()}</span>
            </div>
            <div className="stat-box">
              <span className="block text-[10px] text-[rgba(228,228,231,0.5)] mb-1">PRIZE POOL</span>
              <span className="text-[#e4e4e7] font-bold text-sm">{ti.totalPrizePool}</span>
            </div>
            <div className="stat-box">
              <span className="block text-[10px] text-[rgba(228,228,231,0.5)] mb-1">PATCH</span>
              <span className="text-[#e4e4e7] font-bold text-sm">v{ti.patchVersion}</span>
            </div>
            <div className="stat-box">
              <span className="block text-[10px] text-[rgba(228,228,231,0.5)] mb-1">LOCATION</span>
              <span className="text-[#e4e4e7] font-bold text-sm">{ti.location.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Championship Roster Card */}
        <div className="border border-[rgba(228,228,231,0.1)] p-5 bg-[rgba(255,255,255,0.02)] space-y-3 font-space-mono">
          <span className="meta-label">Championship Roster</span>
          <div className="divide-y divide-[rgba(228,228,231,0.1)]">
            {ti.winnerRoster.map((player, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 text-xs">
                <span className="text-[#e4e4e7] font-bold">{player.nickname}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[rgba(228,228,231,0.5)]">{player.role}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(255,77,0,0.1)] text-[#ff4d00] border border-[#ff4d00]/30 font-bold">
                    {player.signatureHero}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {ti.coach && (
            <div className="pt-2 text-[10px] text-[rgba(228,228,231,0.5)] border-t border-[rgba(228,228,231,0.1)]">
              COACH: <span className="text-[#e4e4e7]">{ti.coach}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Narrative Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* Editorial Story */}
        <div className="space-y-4">
          <span className="meta-label">Historical Record</span>
          <h3 className="font-syne text-xl font-bold text-[#e4e4e7]">
            {ti.storyHeadline}
          </h3>
          <div className="space-y-4 text-sm leading-relaxed text-[rgba(228,228,231,0.7)] font-sans">
            {ti.storyParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* Metadata Pane */}
        <div className="space-y-6 font-space-mono">
          <span className="meta-label">Meta Data & Draft Trends</span>

          <div className="border border-[rgba(228,228,231,0.1)] p-4 bg-[rgba(0,0,0,0.3)] space-y-3">
            <span className="text-xs text-[rgba(228,228,231,0.5)] block">Gameplay Meta Chronicle</span>
            <p className="text-xs text-[rgba(228,228,231,0.8)] leading-relaxed font-sans">
              {ti.metaSnapshot}
            </p>
          </div>

          <div>
            <p className="text-xs text-[rgba(228,228,231,0.5)] mb-2 uppercase">Draft Picks (Select)</p>
            <div className="flex flex-wrap gap-1.5">
              {ti.topPickedHeroes.map((hero, idx) => (
                <span key={idx} className="tag-select">
                  {hero}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-[rgba(228,228,231,0.5)] mb-2 uppercase">Primary Bans (Prohibit)</p>
            <div className="flex flex-wrap gap-1.5">
              {ti.topBannedHeroes.map((hero, idx) => (
                <span key={idx} className="tag-prohibit">
                  {hero}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


