import React, { useState } from 'react';
import { ActiveView, MacroMoment, MicroPlay, SubTab, TIVersionId } from './types';
import { tiDataRecord } from './data/tiData';
import { Header } from './components/Header';
import { SubNav } from './components/SubNav';
import { StoryTab } from './components/StoryTab';
import { RostersTab } from './components/RostersTab';
import { TeamsTab } from './components/TeamsTab';
import { VenueTab } from './components/VenueTab';
import { MacroTab } from './components/MacroTab';
import { MicroTab } from './components/MicroTab';
import { PersonalNotes } from './components/PersonalNotes';
import { HallOfFame } from './components/HallOfFame';
import { TheatreModal } from './components/TheatreModal';
import { ExportImportModal } from './components/ExportImportModal';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('TI3');
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('story');
  const [selectedMoment, setSelectedMoment] = useState<MacroMoment | MicroPlay | null>(null);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  const isHallOfFame = activeView === 'hall-of-fame';
  const currentTi = !isHallOfFame ? tiDataRecord[activeView as TIVersionId] : null;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E2E8F0] font-sans flex flex-col justify-between selection:bg-[#E5B869] selection:text-[#0D1117]">
      {/* Header Bar */}
      <div>
        <Header
          activeView={activeView}
          onSelectView={(view) => {
            setActiveView(view);
            setActiveSubTab('story');
          }}
          tiRecord={tiDataRecord}
          onOpenExportImport={() => setIsExportImportOpen(true)}
        />

        {/* Sub-Navigation if viewing a TI page */}
        {currentTi && (
          <SubNav
            currentTi={currentTi}
            activeSubTab={activeSubTab}
            onSelectSubTab={setActiveSubTab}
          />
        )}

        {/* Main Canvas Body Area */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {isHallOfFame ? (
            <HallOfFame />
          ) : currentTi ? (
            <>
              {activeSubTab === 'story' && <StoryTab ti={currentTi} />}
              {activeSubTab === 'rosters' && <RostersTab ti={currentTi} />}
              {activeSubTab === 'teams' && <TeamsTab ti={currentTi} />}
              {activeSubTab === 'venue' && <VenueTab ti={currentTi} />}
              {activeSubTab === 'macro' && (
                <MacroTab
                  ti={currentTi}
                  onSelectMoment={(moment) => setSelectedMoment(moment)}
                />
              )}
              {activeSubTab === 'micro' && (
                <MicroTab
                  ti={currentTi}
                  onSelectPlay={(play) => setSelectedMoment(play)}
                />
              )}
              {activeSubTab === 'notes' && <PersonalNotes currentTi={currentTi} />}
            </>
          ) : null}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#080A0F] border-t border-[#1E293B] py-8 px-4 text-center text-xs text-[#94A3B8] mt-12 space-y-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#1E293B]/60 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-base">⚜️</span>
            <span className="font-cinzel font-bold text-white tracking-wider text-sm">
              THE INTERNATIONAL COMPENDIUM ARCHIVE
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 font-medium">
            <button
              onClick={() => setActiveView('TI3')}
              className="hover:text-[#E5B869] transition-colors cursor-pointer"
            >
              TI3 El Clásico
            </button>
            <button
              onClick={() => setActiveView('TI8')}
              className="hover:text-[#E5B869] transition-colors cursor-pointer"
            >
              TI8 OG Miracle
            </button>
            <button
              onClick={() => setActiveView('TI10')}
              className="hover:text-[#E5B869] transition-colors cursor-pointer"
            >
              TI10 Spirit $40M
            </button>
            <button
              onClick={() => setActiveView('hall-of-fame')}
              className="hover:text-[#E5B869] transition-colors cursor-pointer text-[#E5B869] font-bold"
            >
              Hall of Fame
            </button>
          </div>
        </div>

        <p className="text-[11px] text-[#64748B] max-w-xl mx-auto leading-relaxed">
          Free & Open-Source Dota 2 Historical Scrapbook. Built with React 19, TypeScript, Tailwind CSS, Web Audio API, and Gemini AI. Dota 2 is a registered trademark of Valve Corporation.
        </p>
      </footer>

      {/* Modals */}
      {selectedMoment && currentTi && (
        <TheatreModal
          item={selectedMoment}
          currentTi={currentTi}
          onClose={() => setSelectedMoment(null)}
        />
      )}

      {isExportImportOpen && (
        <ExportImportModal onClose={() => setIsExportImportOpen(false)} />
      )}
    </div>
  );
}
