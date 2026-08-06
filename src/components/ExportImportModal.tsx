import React, { useState } from 'react';
import { X, Download, Upload, Check, AlertCircle } from 'lucide-react';
import { PersonalNote, TIVersionId } from '../types';

interface ExportImportModalProps {
  onClose: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({ onClose }) => {
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const tiKeys: TIVersionId[] = [
    'TI1', 'TI2', 'TI3', 'TI4', 'TI5', 'TI6',
    'TI7', 'TI8', 'TI9', 'TI10', 'TI11', 'TI12', 'TI13'
  ];

  const handleExport = () => {
    const allNotes: Record<string, PersonalNote> = {};
    tiKeys.forEach((key) => {
      const saved = localStorage.getItem(`dota_compendium_note_${key}`);
      if (saved) {
        try {
          allNotes[key] = JSON.parse(saved);
        } catch (e) {
          console.warn("Error reading note for " + key, e);
        }
      }
    });

    const exportData = {
      appName: 'The International Compendium Archive',
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      notes: allNotes
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dota_ti_archive_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setStatusMsg({ text: 'Archive Backup downloaded successfully!', type: 'success' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed && parsed.notes) {
          Object.keys(parsed.notes).forEach((key) => {
            localStorage.setItem(`dota_compendium_note_${key}`, JSON.stringify(parsed.notes[key]));
          });
          setStatusMsg({ text: 'Inscriptions restored successfully! Reloading...', type: 'success' });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setStatusMsg({ text: 'Invalid JSON backup format.', type: 'error' });
        }
      } catch (err) {
        setStatusMsg({ text: 'Failed to read JSON file.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0c0e]/90 backdrop-blur-md animate-fadeIn font-space-mono">
      <div className="relative w-full max-w-md bg-[#0c0c0e] border border-[rgba(228,228,231,0.2)] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(228,228,231,0.1)] bg-[rgba(255,255,255,0.02)]">
          <div>
            <span className="meta-label">Data Management</span>
            <h3 className="font-syne text-base font-bold text-[#e4e4e7]">
              ARCHIVE_EXPORT // IMPORT
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-[rgba(228,228,231,0.2)] text-[rgba(228,228,231,0.8)] hover:text-[#ff4d00] hover:border-[#ff4d00] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-[rgba(228,228,231,0.7)] leading-relaxed font-sans">
            Export personal inscriptions, ratings, and notes to JSON format or restore from an existing backup file.
          </p>

          {statusMsg && (
            <div
              className={`p-3 text-xs font-bold flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-[rgba(51,255,153,0.1)] text-[#33ff99] border border-[#33ff99]/40'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}
            >
              {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 p-3 bg-[#ff4d00] hover:bg-[#ff6622] text-[#0c0c0e] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> EXPORT BACKUP (JSON)
            </button>

            <label className="w-full flex items-center justify-center gap-2 p-3 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,77,0,0.1)] border border-[rgba(228,228,231,0.2)] hover:border-[#ff4d00] text-[#e4e4e7] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer">
              <Upload className="w-4 h-4 text-[#ff4d00]" /> IMPORT BACKUP FILE
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};


