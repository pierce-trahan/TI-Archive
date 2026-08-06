import React from 'react';
import { ActiveView, TIData, TIVersionId } from '../types';
import { Trophy, Download } from 'lucide-react';

interface HeaderProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  tiRecord: Record<TIVersionId, TIData>;
  onOpenExportImport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  tiRecord,
  onOpenExportImport,
}) => {
  const currentTi = activeView !== 'hall-of-fame' ? tiRecord[activeView] : null;

  const tiKeys: TIVersionId[] = [
    'TI1', 'TI2', 'TI3', 'TI4', 'TI5', 'TI6',
    'TI7', 'TI8', 'TI9', 'TI10', 'TI11', 'TI12', 'TI13'
  ];

  return (
    <header className="border-b border-[rgba(228,228,231,0.1)] bg-[#0c0c0e]/90 backdrop-blur-md sticky top-0 z-30">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Title / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#e4e4e7] text-[#0c0c0e] font-syne font-extrabold text-lg flex items-center justify-center border border-[#e4e4e7]">
            01
          </div>
          <div>
            <h1 className="font-syne text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#e4e4e7] flex items-center gap-2">
              Archive.01
              <span className="text-[#ff4d00] font-space-mono text-[10px] px-1.5 py-0.5 border border-[#ff4d00]/40 bg-[#ff4d00]/10 tracking-widest uppercase hidden sm:inline-block">
                TI_GRIMOIRE
              </span>
            </h1>
            <p className="font-space-mono text-[10px] text-[rgba(228,228,231,0.6)] uppercase tracking-wider">
              The International Compendium Archive
            </p>
          </div>
        </div>

        {/* Global Tools: DATA_HUB & HALL_OF_FAME */}
        <div className="flex items-center gap-2 sm:gap-3 font-space-mono text-xs">
          <button
            onClick={onOpenExportImport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-[rgba(228,228,231,0.3)] hover:border-[#e4e4e7] text-[#e4e4e7] font-bold uppercase transition-colors cursor-pointer"
            title="Backup or Restore your Scrapbook Notes"
          >
            <Download className="w-3.5 h-3.5 text-[#ff4d00]" />
            <span className="hidden md:inline">DATA_HUB</span>
          </button>

          <button
            onClick={() => onSelectView('hall-of-fame')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-bold uppercase transition-colors cursor-pointer border ${
              activeView === 'hall-of-fame'
                ? 'bg-[#e4e4e7] text-[#0c0c0e] border-[#e4e4e7]'
                : 'bg-transparent border-[rgba(228,228,231,0.3)] hover:border-[#e4e4e7] text-[#e4e4e7]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-[#ff4d00]" />
            <span>HALL_OF_FAME</span>
          </button>
        </div>
      </div>

      {/* Chronology Pills Bar */}
      <div className="bg-[#08080a] border-t border-[rgba(228,228,231,0.1)] px-4 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-1.5 min-w-max">
          {tiKeys.map((key) => {
            const item = tiRecord[key];
            const isActive = activeView === key;

            return (
              <button
                key={key}
                onClick={() => onSelectView(key)}
                className={`px-3 py-1 text-xs font-space-mono transition-all duration-150 flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? 'bg-[#e4e4e7] text-[#0c0c0e] border-[#e4e4e7] font-bold'
                    : 'bg-transparent border-[rgba(228,228,231,0.1)] text-[rgba(228,228,231,0.6)] hover:border-[rgba(228,228,231,0.4)] hover:text-[#e4e4e7]'
                }`}
              >
                <span>{key}</span>
                <span className={`text-[10px] ${isActive ? 'text-[#0c0c0e]' : 'text-[#ff4d00]'}`}>
                  {item.yearNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active TI Theme Accent Line */}
      {currentTi && (
        <div className="h-[2px] w-full bg-[#ff4d00]" />
      )}
    </header>
  );
};


