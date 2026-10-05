import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, DollarSign, CheckCircle2 } from 'lucide-react';

interface FlywheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

export const FlywheelModal: React.FC<FlywheelModalProps> = ({ isOpen, onClose, slug }) => {
  const [budget, setBudget] = useState(10);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simComplete, setSimComplete] = useState(false);

  if (!isOpen) return null;

  const handleRunTest = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimComplete(true);
    }, 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E8DFD3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D9]">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B84A2A]">
              Creator Growth Engine
            </span>
            <h2 className="font-serif text-2xl font-semibold text-[#2D231C]">
              Micro-Ad Flywheel ($10 Tests)
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#8F7F72] hover:text-[#2D231C]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-[#736558] font-prose-serif leading-relaxed">
          Test traffic channels with self-funding $10 experiments. Drive targeted bio-link traffic directly to /@{slug} without relying on algorithm whims.
        </p>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl">
            <span className="block text-[10px] text-[#8F7F72] uppercase">Budget</span>
            <span className="text-base font-bold text-[#2D231C]">${budget}</span>
          </div>
          <div className="p-3 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl">
            <span className="block text-[10px] text-[#8F7F72] uppercase">Est. Clicks</span>
            <span className="text-base font-bold text-[#B84A2A]">~45-70</span>
          </div>
          <div className="p-3 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl">
            <span className="block text-[10px] text-[#8F7F72] uppercase">Conversion</span>
            <span className="text-base font-bold text-[#059669]">~3.8%</span>
          </div>
        </div>

        {simComplete ? (
          <div className="p-4 bg-[#E8F5E9] text-[#2E7D32] rounded-2xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Experiment Simulated Successfully</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Target audience: family creators & faith communities. Projected 52 sovereign bio visitors with zero tracking pixels on personal sanctuary cards.
            </p>
          </div>
        ) : (
          <button
            type="button"
            disabled={isSimulating}
            onClick={handleRunTest}
            className="w-full py-3 bg-[#B84A2A] hover:bg-[#A33F23] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{isSimulating ? 'Simulating Traffic Flywheel...' : 'Launch $10 Micro-Campaign Test'}</span>
          </button>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="text-xs text-[#736558] hover:text-[#2D231C] font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
