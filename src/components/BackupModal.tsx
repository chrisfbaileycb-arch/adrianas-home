import React, { useState } from 'react';
import { storage } from '../utils/storage';
import { Download, Upload, Check, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReloaded: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose, onDataReloaded }) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const jsonStr = storage.exportFullBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hearth-sanctuary-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = storage.importBackup(text);
        if (ok) {
          setImportStatus('success');
          onDataReloaded();
          setTimeout(() => {
            setImportStatus('idle');
            onClose();
          }, 1500);
        } else {
          setImportStatus('error');
          setErrorMessage('File could not be parsed as a valid Hearth backup.');
        }
      } catch (err: any) {
        setImportStatus('error');
        setErrorMessage(err.message || 'Error importing backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-xl border border-[#E8DFD3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D9]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#B84A2A]" />
            <h2 className="font-serif text-2xl font-semibold text-[#2D231C]">
              Safe Storage & Backup
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8F7F72] hover:text-[#2D231C] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#736558] font-prose-serif leading-relaxed">
          Your memories, recipes, reflections, and plans belong entirely to you. You can export a full JSON archive anytime, or restore it onto any device.
        </p>

        <div className="space-y-4 pt-2">
          {/* Export Box */}
          <div className="p-4 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold text-[#2D231C]">Export Sovereign Backup</h3>
              <p className="text-[11px] text-[#8F7F72]">Download all recipes, plans, reflections, and albums as a JSON file.</p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#B84A2A] text-white text-xs font-medium rounded-xl hover:bg-[#A33F23] transition-colors shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Import Box */}
          <div className="p-4 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-semibold text-[#2D231C]">Restore Sanctuary Backup</h3>
              <p className="text-[11px] text-[#8F7F72]">Upload a previously downloaded Hearth JSON file.</p>
            </div>
            <label className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#2D231C] border border-[#E8DFD3] text-xs font-medium rounded-xl hover:border-[#B84A2A] hover:text-[#B84A2A] transition-colors shrink-0 cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {importStatus === 'success' && (
          <div className="p-3 bg-[#E8F5E9] text-[#2E7D32] rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Sanctuary restored successfully! Refreshing view...</span>
          </div>
        )}

        {importStatus === 'error' && (
          <div className="p-3 bg-[#FFEBEE] text-[#C62828] rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#736558] hover:text-[#2D231C]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
