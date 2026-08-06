import React, { useState, useEffect } from 'react';
import { PersonalNote, TIData } from '../types';
import { Save, Star, Check, Trash2 } from 'lucide-react';

interface PersonalNotesProps {
  currentTi: TIData;
}

export const PersonalNotes: React.FC<PersonalNotesProps> = ({ currentTi }) => {
  const storageKey = `dota_compendium_note_${currentTi.id}`;

  const [noteText, setNoteText] = useState('');
  const [favPlayer, setFavPlayer] = useState('');
  const [rating, setRating] = useState(5);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: PersonalNote = JSON.parse(saved);
        setNoteText(parsed.userNote || '');
        setFavPlayer(parsed.favoritePlayer || '');
        setRating(parsed.rating || 5);
      } else {
        setNoteText('');
        setFavPlayer('');
        setRating(5);
      }
    } catch (err) {
      console.warn("Failed loading notes from localStorage", err);
    }
  }, [currentTi.id, storageKey]);

  const handleSave = () => {
    const noteData: PersonalNote = {
      tiId: currentTi.id,
      userNote: noteText,
      favoritePlayer: favPlayer,
      rating,
      updatedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };

    localStorage.setItem(storageKey, JSON.stringify(noteData));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear your archive entry for " + currentTi.id + "?")) {
      localStorage.removeItem(storageKey);
      setNoteText('');
      setFavPlayer('');
      setRating(5);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto font-space-mono">
      <div className="p-6 sm:p-8 bg-[rgba(255,255,255,0.02)] border border-[rgba(228,228,231,0.1)] space-y-6">
        <div className="flex items-center justify-between border-b border-[rgba(228,228,231,0.1)] pb-4">
          <div>
            <span className="meta-label">Personal Archive Page // {currentTi.id}</span>
            <h3 className="font-syne text-xl font-bold text-[#e4e4e7]">
              Inscriptions & Tournament Notes ({currentTi.yearNumber})
            </h3>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[rgba(51,255,153,0.1)] text-[#33ff99] border border-[#33ff99]/40 text-xs font-bold">
              <Check className="w-4 h-4" /> INSCRIBED_OK
            </div>
          )}
        </div>

        {/* Favorite Player & Star Rating Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#ff4d00] uppercase mb-1.5">
              FAVORED HEROIST OR MOMENT
            </label>
            <input
              type="text"
              value={favPlayer}
              onChange={(e) => setFavPlayer(e.target.value)}
              placeholder="e.g. Dendi Fountain Hook or s4 Dream Coil"
              className="w-full px-3.5 py-2.5 bg-[rgba(0,0,0,0.4)] border border-[rgba(228,228,231,0.2)] focus:border-[#ff4d00] text-[#e4e4e7] text-xs outline-none transition-colors font-space-mono placeholder:text-[rgba(228,228,231,0.3)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#ff4d00] uppercase mb-1.5">
              TOURNAMENT RATING
            </label>
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-lg transition-transform hover:scale-125 cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating
                        ? 'text-[#ff4d00] fill-current'
                        : 'text-[rgba(228,228,231,0.2)]'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-[#e4e4e7] font-bold ml-2">
                {rating}/5 STARS
              </span>
            </div>
          </div>
        </div>

        {/* Note Textarea */}
        <div>
          <label className="block text-xs font-bold text-[#ff4d00] uppercase mb-1.5">
            PERSONAL NOTES & MEMORIES
          </label>
          <textarea
            rows={7}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={`Record your memories of watching ${currentTi.id}, favorite team runs, strategies, or quotes...`}
            className="w-full p-4 bg-[rgba(0,0,0,0.4)] border border-[rgba(228,228,231,0.2)] focus:border-[#ff4d00] text-[#e4e4e7] text-xs outline-none transition-colors leading-relaxed font-sans placeholder:text-[rgba(228,228,231,0.3)]"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(228,228,231,0.1)]">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-transparent hover:bg-red-500/10 text-[rgba(228,228,231,0.6)] hover:text-red-400 text-xs font-bold uppercase transition-colors cursor-pointer border border-[rgba(228,228,231,0.2)]"
          >
            <Trash2 className="w-3.5 h-3.5" /> ERASE_ENTRY
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-[#ff4d00] hover:bg-[#ff6622] text-[#0c0c0e] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> SAVE_INCRIPTION
          </button>
        </div>
      </div>
    </div>
  );
};


