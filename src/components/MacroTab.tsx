import React from 'react';
import { MacroMoment, TIData } from '../types';
import { Play } from 'lucide-react';

interface MacroTabProps {
  ti: TIData;
  onSelectMoment: (moment: MacroMoment) => void;
}

export const MacroTab: React.FC<MacroTabProps> = ({ ti, onSelectMoment }) => {
  return (
    <div className="space-y-6 animate-fadeIn font-space-mono">
      <div className="flex items-center justify-between border-b border-[rgba(228,228,231,0.1)] pb-3">
        <span className="meta-label">Macro Moments: Legendary Series & Tournament Clashes ({ti.id})</span>
        <span className="text-xs text-[rgba(228,228,231,0.5)]">
          CLICK TO OPEN <strong className="text-[#ff4d00]">THEATRE OVERLAY</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ti.macroMoments.map((moment) => (
          <div
            key={moment.id}
            onClick={() => onSelectMoment(moment)}
            className="group relative overflow-hidden bg-[rgba(255,255,255,0.02)] border border-[rgba(228,228,231,0.1)] hover:border-[#ff4d00] transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            {/* Thumbnail Preview Header */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden border-b border-[rgba(228,228,231,0.1)]">
              <img
                src={`https://img.youtube.com/vi/${moment.youtubeId}/hqdefault.jpg`}
                alt={moment.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-12 h-12 bg-[#ff4d00] text-[#0c0c0e] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              {/* Tag Badge */}
              <div className="absolute top-3 left-3 px-2 py-0.5 bg-[#0c0c0e]/90 border border-[rgba(228,228,231,0.2)] text-[#ff4d00] text-[10px] uppercase font-bold">
                {moment.match}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3">
              <h4 className="font-syne text-base font-bold text-[#e4e4e7] group-hover:text-[#ff4d00] transition-colors">
                {moment.title}
              </h4>

              <p className="text-xs text-[rgba(228,228,231,0.7)] leading-relaxed line-clamp-3 font-sans">
                {moment.whyItMatters}
              </p>

              <div className="pt-3 border-t border-[rgba(228,228,231,0.1)] flex items-center justify-between text-xs text-[#ff4d00] font-bold">
                <span>LAUNCH THEATRE</span>
                <span className="text-[10px] text-[rgba(228,228,231,0.4)]">HD REPLAY</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


