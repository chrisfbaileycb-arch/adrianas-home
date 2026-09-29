import React, { useRef, useState } from 'react';
import { storage } from '../utils/storage';
import { Download, Upload, ShieldCheck, X, RefreshCw } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReloaded: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataReloaded,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const json = storage.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adrianas-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const success = storage.importAllData(text);
        if (success) {
          setImportStatus('Backup restored successfully!');
          onDataReloaded();
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          setImportStatus('Could not read file. Please ensure it is a valid backup for Adriana\'s.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Reset back to the original sample entries?')) {
      storage.resetAll();
      onDataReloaded();
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[#E8DFD3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD3]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#B84A2A]" />
            <h2 className="font-serif text-xl font-bold text-[#2D231C]">
              Your Safe Sanctuary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8F7F72] hover:text-[#2D231C] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#6C5E53] leading-relaxed font-prose-serif">
          All your daily plans, thoughts, photos, and recipes are stored securely right here on this device’s local browser memory. Nothing is sent to third-party ad networks or remote servers.
        </p>

        <div className="space-y-3 pt-2">
          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between p-3.5 bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#E8DFD3] rounded-2xl transition-colors text-left"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#2D231C] block">
                Export Backup File
              </span>
              <span className="text-[11px] text-[#8F7F72] block">
                Download a copy of all your notes, recipes, and memories.
              </span>
            </div>
            <Download className="w-4 h-4 text-[#B84A2A] shrink-0" />
          </button>

          {/* Import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-3.5 bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#E8DFD3] rounded-2xl transition-colors text-left"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#2D231C] block">
                Restore From Backup
              </span>
              <span className="text-[11px] text-[#8F7F72] block">
                Load a previously saved Hearth backup file.
              </span>
            </div>
            <Upload className="w-4 h-4 text-[#B84A2A] shrink-0" />
          </button>
        </div>

        {importStatus && (
          <p className="text-xs text-center font-medium text-[#B84A2A] bg-[#FBECE6] p-2 rounded-lg">
            {importStatus}
          </p>
        )}

        <div className="pt-3 border-t border-[#E8DFD3] flex items-center justify-between text-xs text-[#8F7F72]">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 hover:text-[#DC2626] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset sample items</span>
          </button>
          <span>Offline ready</span>
        </div>
      </div>
    </div>
  );
};
