import React, { useState } from 'react';
import { hallOfFameChampions, prizePoolData, multiTimeChampions } from '../data/hallOfFameData';
import { soundboardClips } from '../data/soundboardData';
import { playCasterCall } from '../utils/audioSynth';
import { Volume2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TeamYearLogo } from './TeamYearLogo';

export const HallOfFame: React.FC = () => {
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);

  const handlePlaySound = (clip: typeof soundboardClips[0]) => {
    setActiveSoundId(clip.id);
    playCasterCall(clip.audioSynthType, clip.quote);
    setTimeout(() => setActiveSoundId(null), 3000);
  };

  return (
    <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto px-4 py-6 font-space-mono">
      {/* Hall of Fame Header Banner */}
      <div className="text-center space-y-3 p-8 sm:p-10 bg-[rgba(255,255,255,0.02)] border border-[rgba(228,228,231,0.1)] relative">
        <span className="meta-label">Technical Archive // Grand Aegis Sanctuary</span>

        <h2 className="font-syne text-3xl sm:text-5xl font-extrabold text-[#e4e4e7]">
          HALL OF CHAMPIONS & LORE
        </h2>

        <p className="text-xs sm:text-sm text-[rgba(228,228,231,0.6)] max-w-2xl mx-auto leading-relaxed font-sans">
          Permanent chronicle of world champion dynasties, prize pool evolution, caster audio glyphs, and multi-time Aegis victors.
        </p>
      </div>

      {/* Multi-Time Champions Shrine */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(228,228,231,0.1)] pb-3">
          <span className="meta-label">Multi-Time Aegis Dynasty Shrine</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {multiTimeChampions.map((item, idx) => (
            <div
              key={idx}
              className="p-5 bg-[rgba(255,255,255,0.02)] border border-[rgba(228,228,231,0.1)] hover:border-[#ff4d00] transition-all space-y-2"
            >
              <span className="text-xs font-bold text-[#ff4d00] block uppercase">
                [{item.titles}]
              </span>
              <h4 className="font-syne font-bold text-lg text-[#e4e4e7]">{item.org}</h4>
              <p className="text-xs font-semibold text-[rgba(228,228,231,0.8)]">{item.players}</p>
              <p className="text-[11px] text-[rgba(228,228,231,0.5)] pt-2 border-t border-[rgba(228,228,231,0.1)] leading-relaxed font-sans">
                {item.legacy}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Prize Pool Growth Recharts Chart */}
      <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(228,228,231,0.1)] space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(228,228,231,0.1)] pb-3">
          <span className="meta-label">Prize Pool Growth Evolution ($ Millions)</span>
          <span className="text-xs text-[#ff4d00] font-bold">
            PEAK: $40.01M (TI10)
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={prizePoolData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(228,228,231,0.1)" />
              <XAxis dataKey="year" stroke="rgba(228,228,231,0.6)" fontSize={11} fontFamily="Space Mono" />
              <YAxis stroke="rgba(228,228,231,0.6)" fontSize={11} unit="M" fontFamily="Space Mono" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0c0c0e', borderColor: '#ff4d00', borderRadius: '0px', color: '#e4e4e7', fontSize: '11px', fontFamily: 'Space Mono' }}
                formatter={(value: any) => [`$${value} Million USD`, 'Prize Pool']}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="prizeMillions"
                stroke="#ff4d00"
                strokeWidth={2}
                dot={{ fill: '#ff4d00', r: 4 }}
                activeDot={{ r: 6, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Caster Soundboard Vault */}
      <div className="p-6 bg-[rgba(255,255,255,0.02)] border border-[rgba(228,228,231,0.1)] space-y-5">
        <div className="flex items-center justify-between border-b border-[rgba(228,228,231,0.1)] pb-3">
          <span className="meta-label">Caster Soundboard Vault</span>
          <span className="text-xs text-[rgba(228,228,231,0.5)]">
            CLICK TO TRIGGER <strong className="text-[#ff4d00]">ARENA CASTER SYNTH</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {soundboardClips.map((clip) => {
            const isPlaying = activeSoundId === clip.id;

            return (
              <button
                key={clip.id}
                onClick={() => handlePlaySound(clip)}
                className={`p-4 border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-2 ${
                  isPlaying
                    ? 'bg-[#ff4d00] text-[#0c0c0e] border-[#ff4d00]'
                    : 'bg-[rgba(0,0,0,0.3)] border-[rgba(228,228,231,0.1)] hover:border-[#ff4d00] text-[#e4e4e7]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-syne font-bold text-sm flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    {clip.title}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 uppercase border ${isPlaying ? 'bg-[#0c0c0e] text-[#ff4d00] border-[#0c0c0e]' : 'bg-[rgba(228,228,231,0.1)] text-[#ff4d00] border-[rgba(228,228,231,0.2)]'}`}>
                    {clip.caster}
                  </span>
                </div>

                <p className="text-xs italic font-bold line-clamp-2">
                  &quot;{clip.quote}&quot;
                </p>

                <p className="text-[10px] opacity-60 border-t border-[rgba(228,228,231,0.1)] pt-2 uppercase">
                  {clip.match}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Wall of Champions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[rgba(228,228,231,0.1)] pb-3">
          <span className="meta-label">Wall of Aegis Victories (All 13 Grand Finals)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hallOfFameChampions.map((champ) => (
            <div
              key={champ.year}
              className="p-5 bg-[rgba(255,255,255,0.02)] border border-[rgba(228,228,231,0.1)] hover:border-[#ff4d00] transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-[rgba(255,77,0,0.1)] text-[#ff4d00] text-xs font-bold border border-[#ff4d00]/30">
                    {champ.year} ({champ.yearNum})
                  </span>
                  <span className="text-xs text-[rgba(228,228,231,0.6)] font-bold">{champ.prizePool}</span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <TeamYearLogo teamName={champ.teamName} tiId={champ.yearNum} className="w-12 h-12 flex-shrink-0" />
                  <div>
                    <h4 className="font-syne font-bold text-lg text-[#e4e4e7]">{champ.teamName}</h4>
                    <p className="text-xs text-[rgba(228,228,231,0.6)]">
                      GRAND FINALS: <strong className="text-[#ff4d00]">{champ.score}</strong> vs {champ.runnerUp}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[rgba(228,228,231,0.1)]">
                <div className="text-xs text-[rgba(228,228,231,0.8)]">
                  <span className="text-[10px] text-[rgba(228,228,231,0.4)] block uppercase">ROSTER:</span>
                  <span>{champ.roster.join(' • ')}</span>
                </div>

                <div className="text-[11px] text-[#ff4d00] italic bg-[rgba(0,0,0,0.3)] p-2 border border-[rgba(228,228,231,0.1)] font-sans">
                  {champ.definingStrategy}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

