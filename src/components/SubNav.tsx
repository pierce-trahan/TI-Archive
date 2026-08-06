import React from 'react';
import { SubTab, TIData } from '../types';
import { BookOpen, Users, Shield, MapPin, Video, Zap, FileText } from 'lucide-react';
import { TeamYearLogo } from './TeamYearLogo';

interface SubNavProps {
  currentTi: TIData;
  activeSubTab: SubTab;
  onSelectSubTab: (subTab: SubTab) => void;
}

export const SubNav: React.FC<SubNavProps> = ({
  currentTi,
  activeSubTab,
  onSelectSubTab,
}) => {
  const tabs: { id: SubTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'story', label: 'STORY & META', icon: <BookOpen className="w-3.5 h-3.5 text-[#ff4d00]" /> },
    { id: 'rosters', label: 'ROSTERS & DRAMA', icon: <Users className="w-3.5 h-3.5 text-[#ff4d00]" /> },
    { id: 'teams', label: 'TEAMS & PLAYER STATS', icon: <Shield className="w-3.5 h-3.5 text-[#ff4d00]" /> },
    { id: 'venue', label: 'VENUE & VIBE', icon: <MapPin className="w-3.5 h-3.5 text-[#ff4d00]" /> },
    { id: 'macro', label: 'MACRO MOMENTS', icon: <Video className="w-3.5 h-3.5 text-[#ff4d00]" />, count: currentTi.macroMoments.length },
    { id: 'micro', label: 'MICRO PLAYS', icon: <Zap className="w-3.5 h-3.5 text-[#ff4d00]" />, count: currentTi.microPlays.length },
    { id: 'notes', label: 'PERSONAL NOTES', icon: <FileText className="w-3.5 h-3.5 text-[#ff4d00]" /> },
  ];

  return (
    <div className="bg-[#0c0c0e]/95 border-b border-[rgba(228,228,231,0.1)] py-3 px-4 sticky top-[88px] z-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* TI Active Header Info */}
        <div className="flex items-center gap-3">
          <TeamYearLogo teamName={currentTi.winnerTeam} tiId={currentTi.id} className="w-9 h-9 flex-shrink-0" />
          <div>
            <h2 className="font-syne font-extrabold text-base text-[#e4e4e7] flex items-center gap-2 tracking-tight">
              The International {currentTi.yearNumber}
              <span className="text-xs font-space-mono text-[#ff4d00] bg-[rgba(255,77,0,0.1)] px-1.5 py-0.5 border border-[rgba(255,77,0,0.3)]">
                {currentTi.id}
              </span>
              <span className="text-xs font-space-mono text-[rgba(228,228,231,0.6)] hidden sm:inline-block">
                [{currentTi.location}]
              </span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-[#ff4d00] font-space-mono">
              <span>CHAMPION: <strong className="text-[#e4e4e7] font-bold">{currentTi.winnerTeam}</strong> ({currentTi.winnerScore})</span>
              <span className="text-[rgba(228,228,231,0.2)]">|</span>
              <span className="text-[rgba(228,228,231,0.6)]">PRIZE: {currentTi.totalPrizePool}</span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Button Group */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none font-space-mono text-xs">
          {tabs.map((tab) => {
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onSelectSubTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 transition-all cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'bg-[#e4e4e7] text-[#0c0c0e] border-[#e4e4e7] font-bold'
                    : 'bg-transparent text-[rgba(228,228,231,0.6)] hover:text-[#e4e4e7] border-[rgba(228,228,231,0.1)] hover:border-[rgba(228,228,231,0.3)]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] ${
                      isActive ? 'bg-[#0c0c0e] text-[#e4e4e7]' : 'bg-[rgba(228,228,231,0.1)] text-[#ff4d00]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


