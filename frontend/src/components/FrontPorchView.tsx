import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, KeyRound, ShieldCheck, Heart, Sparkles, Delete, ArrowRight } from 'lucide-react';
import { ambientSound } from '../utils/audio';
import { tenantApi } from '../utils/tenantApi';

interface FrontPorchViewProps {
  onUnlock: () => void;
  sanctuaryName?: string;
  sanctuaryFocus?: string;
  slug?: string;
}

export const FrontPorchView: React.FC<FrontPorchViewProps> = ({
  onUnlock,
  sanctuaryName = "Adriana's Sanctuary",
  sanctuaryFocus = 'A quiet, unhurried space for daily peace and gentle intentions',
  slug = 'adriana',
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Check entered PIN via backend bcrypt API with local fallback
  const checkPin = async (enteredPin: string) => {
    const isVerified = await tenantApi.verifyPin(slug, enteredPin);

    if (isVerified) {
      setIsSuccess(true);
      setErrorMsg(null);
      try {
        ambientSound.playChime();
      } catch (e) {}

      // Store in sessionStorage so family only enters it once per session
      sessionStorage.setItem(`hearth_unlocked_${slug}`, 'true');
      sessionStorage.setItem('adrianas_porch_unlocked', 'true');

      setTimeout(() => {
        onUnlock();
      }, 500);
    } else {
      setIsShaking(true);
      setErrorMsg('Incorrect PIN. Please try again or tap the guest hint below.');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 700);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (isSuccess || pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMsg(null);

    if (newPin.length === 4) {
      setTimeout(() => checkPin(newPin), 150);
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg(null);
    }
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg(null);
  };

  const handleQuickUnlock = () => {
    setPin('1984');
    setTimeout(() => checkPin('1984'), 200);
  };

  // Keyboard support for desktop visitors
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isSuccess]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
      
      {/* Delicate background ambient botanical glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#EAD8C7] blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#E8DDD0] blur-3xl" />
      </div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Main Porch Welcome Card */}
        <div className="bg-white/95 backdrop-blur-md border border-[#E8DFD3] rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 text-center">
          
          {/* Porch Visual Header */}
          <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-[#D9C4B0] shadow-sm bg-[#F5EFE6] flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80"
              alt="The Front Porch"
              className="w-full h-full object-cover scale-105"
            />
            <div className="absolute inset-0 bg-[#35251B]/20 flex items-center justify-center">
              {isSuccess ? (
                <Unlock className="w-8 h-8 text-white drop-shadow-md animate-bounce" />
              ) : (
                <Lock className="w-7 h-7 text-white drop-shadow-md" />
              )}
            </div>
          </div>

          {/* Title & Custom Greeting */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2ED] border border-[#F2C8B5] text-[11px] font-semibold text-[#B84A2A] uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>The Front Porch Gate</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2D231C]">
              {sanctuaryName}
            </h1>
            
            <p className="text-xs text-[#736558] max-w-xs mx-auto font-prose-serif leading-relaxed">
              A private daily sanctuary for family and dear friends. Please enter your 4-digit family PIN to step inside.
            </p>
          </div>

          {/* 4-Digit Display Indicator Slots */}
          <div className={`space-y-3 ${isShaking ? 'animate-shake' : ''}`}>
            <div className="flex items-center justify-center gap-3.5 pt-1">
              {[0, 1, 2, 3].map((index) => {
                const isFilled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-2 flex items-center justify-center transition-all ${
                      isFilled
                        ? isSuccess
                          ? 'border-[#059669] bg-[#ECFDF5] text-[#059669] scale-105 shadow-xs'
                          : 'border-[#B84A2A] bg-[#FAF2ED] text-[#B84A2A] scale-105 shadow-xs'
                        : 'border-[#E8DFD3] bg-[#FAF7F2] text-transparent'
                    }`}
                  >
                    {isFilled ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-current block" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C8B8A6] block" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <p className="text-xs text-[#DC2626] font-medium animate-in fade-in">
                {errorMsg}
              </p>
            )}

            {isSuccess && (
              <p className="text-xs text-[#059669] font-medium flex items-center justify-center gap-1">
                <span>Welcome home! Stepping onto the porch...</span>
              </p>
            )}
          </div>

          {/* Interactive Numeric Keypad (Safe for Facebook/Instagram In-App Browser) */}
          <div className="pt-2">
            <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleDigitPress(digit)}
                  className="h-12 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE2] active:bg-[#EADBCC] border border-[#E8DFD3] text-lg font-semibold text-[#2D231C] font-mono transition-all shadow-2xs flex items-center justify-center active:scale-95"
                >
                  {digit}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE2] active:bg-[#EADBCC] border border-[#E8DFD3] text-xs font-medium text-[#736558] transition-all flex items-center justify-center active:scale-95"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handleDigitPress('0')}
                className="h-12 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE2] active:bg-[#EADBCC] border border-[#E8DFD3] text-lg font-semibold text-[#2D231C] font-mono transition-all shadow-2xs flex items-center justify-center active:scale-95"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 rounded-2xl bg-[#FAF7F2] hover:bg-[#F3ECE2] active:bg-[#EADBCC] border border-[#E8DFD3] text-[#736558] transition-all flex items-center justify-center active:scale-95"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Frictionless Guest Unlock CTA */}
          <div className="pt-3 border-t border-[#F0E6D9] space-y-2">
            <button
              type="button"
              onClick={handleQuickUnlock}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-[#B84A2A] bg-[#FAF2ED] border border-[#F2C8B5] hover:bg-[#FBE8DE] transition-colors shadow-2xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Visiting from Social Media? Tap for Guest PIN (1984)</span>
            </button>
            
            <p className="text-[11px] text-[#958577] flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
              <span>Zero-tracking · Safe for Instagram & Facebook bio links</span>
            </p>
          </div>

        </div>

        {/* Loving Footnote */}
        <div className="text-center space-y-1">
          <p className="text-xs text-[#8F7F72] font-serif italic">
            “There is always room on the porch for family.”
          </p>
        </div>

      </div>
    </div>
  );
};
