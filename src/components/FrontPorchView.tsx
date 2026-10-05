import React, { useState } from 'react';
import { Lock, Sparkles, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

interface FrontPorchViewProps {
  sanctuaryName: string;
  slug: string;
  onUnlock: (pin: string) => Promise<boolean>;
}

export const FrontPorchView: React.FC<FrontPorchViewProps> = ({
  sanctuaryName,
  slug,
  onUnlock,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      setError(null);
      if (next.length === 4) {
        submitPin(next);
      }
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError(null);
  };

  const submitPin = async (inputPin: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const ok = await onUnlock(inputPin);
      if (!ok) {
        setError('Incorrect 4-digit PIN. Please try again.');
        setPin('');
      }
    } catch {
      setError('Unable to verify PIN at this moment.');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQuickUnlock = () => {
    setPin('1984');
    submitPin('1984');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D231C] flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Decorative Warm Blobs - clamped overflow to avoid mobile horizontal scroll */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FAF0E6] blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#FCEBE6] blur-3xl opacity-50 pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 flex items-center justify-between max-w-4xl mx-auto w-full z-10">
        <div className="flex items-center gap-2">
          <span className="text-[#C05621] text-xl" aria-hidden="true">❦</span>
          <span className="font-serif text-2xl font-semibold tracking-tight">Hearth</span>
        </div>
        <span className="text-xs text-[#8F7F72] px-3 py-1 rounded-full bg-white border border-[#E8DFD3]">
          Front Porch Gateway
        </span>
      </header>

      {/* Main Center Keypad Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="bg-white border border-[#E8DFD3] rounded-3xl p-6 sm:p-9 max-w-sm w-full shadow-lg text-center space-y-6">
          
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF2ED] text-[#B84A2A] mx-auto flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2D231C]">
              {sanctuaryName || "Adriana's Home"}
            </h1>
            <p className="text-xs text-[#736558] font-prose-serif">
              A private family haven. Enter the 4-digit PIN to step inside.
            </p>
          </div>

          {/* PIN Indicators */}
          <div className="flex justify-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    isFilled ? 'bg-[#B84A2A] scale-110' : 'bg-[#E8DFD3]'
                  }`}
                />
              );
            })}
          </div>

          {error && (
            <div className="text-xs text-[#DC2626] bg-[#FEF2F2] p-2.5 rounded-xl border border-[#FCA5A5] flex items-center justify-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                disabled={isVerifying}
                className="h-12 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE2] text-lg font-serif font-semibold text-[#2D231C] border border-[#E8DFD3] transition-all active:scale-95 disabled:opacity-50"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPin('')}
              className="h-12 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE2] text-xs font-medium text-[#736558] border border-[#E8DFD3] transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              disabled={isVerifying}
              className="h-12 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE2] text-lg font-serif font-semibold text-[#2D231C] border border-[#E8DFD3] transition-all active:scale-95 disabled:opacity-50"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-12 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE2] text-xs font-medium text-[#736558] border border-[#E8DFD3] transition-all"
            >
              ⌫
            </button>
          </div>

          {/* Quick Demo Button for fast testing */}
          <div className="pt-2 border-t border-[#F0E6D9]">
            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2 px-3 text-xs text-[#736558] hover:text-[#B84A2A] bg-[#FAF7F2] hover:bg-[#F5ECE1] rounded-xl border border-[#E8DFD3] transition-colors flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#B84A2A]" />
              <span>Demo Quick Unlock (PIN: 1984)</span>
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-[11px] text-[#A39284] z-10">
        <span>Protected Family Sanctuary · No Algorithms · Sovereign Data</span>
      </footer>

    </div>
  );
};
