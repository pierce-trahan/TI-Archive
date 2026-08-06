import React from 'react';
import { TIData } from '../types';
import { PlayerAvatar } from './PlayerAvatar';

interface RostersTabProps {
  ti: TIData;
}

export const RostersTab: React.FC<RostersTabProps> = ({ ti }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Champions Lineup Showcase */}
      <div className="border border-[rgba(228,228,231,0.1)] p-6 bg-[rgba(255,255,255,0.02)] space-y-4">
        <span className="meta-label">{ti.winnerTeam} Championship Lineup ({ti.id})</span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-space-mono">
          {ti.winnerRoster.map((player, idx) => (
            <div
              key={idx}
              className="p-4 border border-[rgba(228,228,231,0.1)] bg-[rgba(0,0,0,0.3)] space-y-3 flex flex-col justify-between hover:border-[#ff4d00] transition-colors group"
            >
              <div>
                <div className="mb-3 aspect-square border border-[rgba(228,228,231,0.15)] overflow-hidden group-hover:border-[#ff4d00] transition-colors">
                  <PlayerAvatar
                    nickname={player.nickname}
                    realName={player.realName}
                    role={player.role}
                    posIndex={idx}
                    tiId={ti.id}
                    className="w-full h-full"
                  />
                </div>

                <span className="text-[10px] text-[#ff4d00] font-bold block mb-1 uppercase tracking-wider">
                  [{player.role}]
                </span>
                <h4 className="font-syne font-bold text-base text-[#e4e4e7] group-hover:text-[#ff4d00] transition-colors">
                  {player.nickname}
                </h4>
                {player.realName && (
                  <p className="text-[11px] text-[rgba(228,228,231,0.5)] font-sans">{player.realName}</p>
                )}
              </div>

              <div className="pt-2 border-t border-[rgba(228,228,231,0.1)] text-xs">
                <span className="block text-[10px] text-[rgba(228,228,231,0.4)] uppercase">SIGNATURE HERO:</span>
                <span className="font-bold text-[#33ff99]">{player.signatureHero}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invites vs Qualifiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-space-mono">
        {/* Direct Invites */}
        <div className="border border-[rgba(228,228,231,0.1)] p-5 bg-[rgba(255,255,255,0.02)] space-y-3">
          <span className="meta-label">Direct Invites</span>

          <div className="flex flex-wrap gap-2">
            {ti.invites.map((team, idx) => (
              <span
                key={idx}
                className="tag-select"
              >
                {team}
              </span>
            ))}
          </div>
        </div>

        {/* Regional Qualifiers */}
        <div className="border border-[rgba(228,228,231,0.1)] p-5 bg-[rgba(255,255,255,0.02)] space-y-3">
          <span className="meta-label">Regional Qualifiers</span>

          <div className="flex flex-wrap gap-2">
            {ti.qualifiers.map((team, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs border border-[rgba(228,228,231,0.3)] text-[#e4e4e7] bg-[rgba(228,228,231,0.05)]"
              >
                {team}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Snubs & Drama + Post-TI Shuffle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-space-mono">
        {/* Snubs & Pre-TI Drama Card */}
        <div className="border border-[rgba(228,228,231,0.1)] p-5 bg-[rgba(255,255,255,0.02)] space-y-3">
          <span className="meta-label">Snubs & Pre-TI Drama</span>

          <p className="text-xs text-[rgba(228,228,231,0.8)] leading-relaxed font-sans bg-[rgba(0,0,0,0.3)] p-4 border border-[rgba(228,228,231,0.08)]">
            {ti.snubsAndDrama}
          </p>
        </div>

        {/* Post-TI Shuffle Card */}
        <div className="border border-[rgba(228,228,231,0.1)] p-5 bg-[rgba(255,255,255,0.02)] space-y-3">
          <span className="meta-label">Post-TI Shuffle Aftermath</span>

          <p className="text-xs text-[rgba(228,228,231,0.8)] leading-relaxed font-sans bg-[rgba(0,0,0,0.3)] p-4 border border-[rgba(228,228,231,0.08)]">
            {ti.postTIShuffle}
          </p>
        </div>
      </div>
    </div>
  );
};


