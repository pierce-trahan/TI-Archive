import React from 'react';
import { MicroPlay, TIData } from '../types';
import { Play, Volume2 } from 'lucide-react';
import { playCasterCall } from '../utils/audioSynth';

interface MicroTabProps {
  ti: TIData;
  onSelectPlay: (play: MicroPlay) => void;
}

export const MicroTab: React.FC<MicroTabProps> = ({ ti, onSelectPlay }) => {
  return (
    <div className="space-y-6 animate-fadeIn font-space-mono">
      <div className="flex items-center justify-between border-b border-[rgba(228,228,231,0.1)] pb-3">
        <span className="meta-label">Micro Plays: Individual Heroics & Clutch Highlights ({ti.id})</span>
        <span className="text-xs text-[rgba(228,228,231,0.5)]">
          CLICK CARD FOR <strong className="text-[#ff4d00]">THEATRE OVERLAY</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ti.microPlays.map((play) => (
          <div
            key={play.id}
            className="group relative bg-[rgba(255,255,255,0.02)] border border-[rgba(228,228,231,0.1)] hover:border-[#ff4d00] transition-all duration-200 overflow-hidden flex flex-col justify-between"
          >
            {/* Top Card Info */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 bg-[rgba(255,77,0,0.1)] text-[#ff4d00] border border-[#ff4d00]/30 text-xs font-bold">
                  {play.player} [{play.hero}]
                </span>

                {/* Audio Snippet Trigger Button */}
                {play.casterQuote && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playCasterCall(play.audioClipId || 'generic', play.casterQuote!);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-transparent hover:bg-[#ff4d00] text-[#ff4d00] hover:text-[#0c0c0e] border border-[#ff4d00] text-xs font-bold uppercase transition-all cursor-pointer"
                    title="Play Caster Voice Line"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>CASTER_LINE</span>
                  </button>
                )}
              </div>

              <h4 className="font-syne text-lg font-bold text-[#e4e4e7] group-hover:text-[#ff4d00] transition-colors">
                {play.title}
              </h4>

              {/* Caster Quote Line Box */}
              {play.casterQuote && (
                <div className="p-3 bg-[rgba(255,77,0,0.05)] border-l-2 border-[#ff4d00] text-xs text-[#ff4d00] font-semibold italic">
                  &quot;{play.casterQuote}&quot;
                </div>
              )}

              <p className="text-xs text-[rgba(228,228,231,0.7)] leading-relaxed font-sans">
                {play.breakdown}
              </p>
            </div>

            {/* Bottom Action Footer */}
            <div
              onClick={() => onSelectPlay(play)}
              className="px-5 py-3 bg-[rgba(0,0,0,0.4)] border-t border-[rgba(228,228,231,0.1)] flex items-center justify-between text-xs text-[#ff4d00] font-bold cursor-pointer hover:bg-[rgba(255,77,0,0.1)] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-current" /> WATCH IN THEATRE
              </span>
              <span className="text-[10px] text-[rgba(228,228,231,0.4)]">EXPAND</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


