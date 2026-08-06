import React, { useEffect } from 'react';
import { MacroMoment, MicroPlay, TIData } from '../types';
import { X, Volume2, Film, ExternalLink } from 'lucide-react';
import { playCasterCall } from '../utils/audioSynth';

interface TheatreModalProps {
  item: MacroMoment | MicroPlay | null;
  currentTi: TIData;
  onClose: () => void;
}

export const TheatreModal: React.FC<TheatreModalProps> = ({
  item,
  currentTi,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const isMicro = 'hero' in item;
  const microItem = isMicro ? (item as MicroPlay) : null;
  const macroItem = !isMicro ? (item as MacroMoment) : null;

  const playAudio = () => {
    if (microItem?.casterQuote) {
      playCasterCall(microItem.audioClipId || 'generic', microItem.casterQuote);
    } else {
      playCasterCall('generic', `${item.title} at ${currentTi.id}!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#0c0c0e]/90 backdrop-blur-md animate-fadeIn font-space-mono">
      <div className="relative w-full max-w-4xl bg-[#0c0c0e] border border-[rgba(228,228,231,0.2)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(228,228,231,0.1)] bg-[rgba(255,255,255,0.02)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[rgba(255,77,0,0.1)] text-[#ff4d00] border border-[#ff4d00]/30">
                {isMicro ? '⚡ MICRO_PLAY' : '🎥 MACRO_MOMENT'}
              </span>
              <span className="text-xs text-[rgba(228,228,231,0.5)]">{currentTi.id} ({currentTi.yearNumber})</span>
            </div>
            <h3 className="font-syne text-base sm:text-lg font-bold text-[#e4e4e7] mt-1">
              {item.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border border-[rgba(228,228,231,0.2)] text-[rgba(228,228,231,0.8)] hover:text-[#ff4d00] hover:border-[#ff4d00] transition-all cursor-pointer"
            title="Close Theatre (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Frame Area */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden border-b border-[rgba(228,228,231,0.1)]">
          {item.youtubeId ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
              <Film className="w-12 h-12 text-[#ff4d00]" />
              <p className="text-sm text-[#e4e4e7] font-bold">VIDEO ARCHIVE FRAME</p>
              <a
                href={item.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff4d00] text-[#0c0c0e] font-bold text-xs uppercase"
              >
                Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Breakdown & Context Details */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Match Context Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[rgba(0,0,0,0.3)] border border-[rgba(228,228,231,0.1)] text-xs">
            <span className="text-[#e4e4e7] font-bold">
              MATCH: {isMicro ? microItem?.player + ' [' + microItem?.hero + ']' : macroItem?.match}
            </span>

            {/* Audio Snippet Play Button */}
            {microItem?.casterQuote && (
              <button
                onClick={playAudio}
                className="flex items-center gap-2 px-3 py-1.5 bg-transparent hover:bg-[#ff4d00] text-[#ff4d00] hover:text-[#0c0c0e] border border-[#ff4d00] text-xs font-bold uppercase transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>LISTEN CASTER LINE</span>
              </button>
            )}
          </div>

          {/* Caster Quote Box */}
          {microItem?.casterQuote && (
            <div className="p-3.5 bg-[rgba(255,77,0,0.05)] border-l-2 border-[#ff4d00] italic text-xs text-[#ff4d00] font-bold leading-relaxed">
              &quot;{microItem.casterQuote}&quot;
            </div>
          )}

          {/* Detailed Narrative Breakdown */}
          <div>
            <span className="meta-label mb-1">Breakdown & Impact</span>
            <p className="text-xs sm:text-sm text-[rgba(228,228,231,0.8)] leading-relaxed font-sans">
              {isMicro ? microItem?.breakdown : macroItem?.whyItMatters}
            </p>
          </div>

          {/* Highlights Summary if macro */}
          {macroItem?.highlightsSummary && (
            <div className="p-3 bg-[rgba(0,0,0,0.3)] text-xs text-[rgba(228,228,231,0.6)] border border-[rgba(228,228,231,0.1)] font-sans">
              <strong className="text-[#e4e4e7] font-space-mono">Series Summary: </strong>
              {macroItem.highlightsSummary}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


