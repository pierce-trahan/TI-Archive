import React from 'react';
import { TIData } from '../types';

interface VenueTabProps {
  ti: TIData;
}

export const VenueTab: React.FC<VenueTabProps> = ({ ti }) => {
  return (
    <div className="space-y-8 animate-fadeIn font-space-mono">
      {/* Location & Arena Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-[rgba(228,228,231,0.1)] p-6 bg-[rgba(255,255,255,0.02)] space-y-3">
          <span className="meta-label">Host Arena & Location</span>

          <h3 className="font-syne text-2xl font-bold text-[#e4e4e7]">
            {ti.arena}
          </h3>

          <p className="text-xs text-[#ff4d00]">
            LOCATION: {ti.location}
          </p>

          <p className="text-xs text-[rgba(228,228,231,0.8)] leading-relaxed pt-3 border-t border-[rgba(228,228,231,0.1)] font-sans">
            {ti.venueDescription}
          </p>
        </div>

        {/* Atmosphere & Crowd Energy */}
        <div className="border border-[rgba(228,228,231,0.1)] p-6 bg-[rgba(255,255,255,0.02)] space-y-3">
          <span className="meta-label">Stadium Atmosphere & Tone</span>

          <div className="p-4 bg-[rgba(0,0,0,0.3)] border border-[rgba(228,228,231,0.1)] space-y-2">
            <span className="text-xs text-[#ff4d00] block uppercase">
              [{ti.waxSealName}] Atmosphere
            </span>
            <p className="text-xs text-[rgba(228,228,231,0.8)] leading-relaxed font-sans">
              {ti.atmosphere}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-[rgba(228,228,231,0.6)] pt-2 border-t border-[rgba(228,228,231,0.1)]">
            <span>CROWDFUNDED: <strong className="text-[#e4e4e7]">{ti.crowdFundedPercentage || 'VALVE DIRECT'}</strong></span>
            <span>DATES: <strong className="text-[#e4e4e7]">{ti.dates}</strong></span>
          </div>
        </div>
      </div>

      {/* Memes & Side Content Card */}
      <div className="border border-[rgba(228,228,231,0.1)] p-6 bg-[rgba(255,255,255,0.02)] space-y-4">
        <span className="meta-label">Lore Chronicles & Memes</span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ti.memesAndSideContent.map((item, idx) => (
            <div
              key={idx}
              className="p-4 border border-[rgba(228,228,231,0.1)] bg-[rgba(0,0,0,0.3)] text-xs text-[rgba(228,228,231,0.8)] flex items-start gap-3"
            >
              <span className="text-[#ff4d00] font-bold">[#0{idx + 1}]</span>
              <p className="leading-relaxed font-sans">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


