import React, { useState } from 'react';
import { X, KeyRound, Check } from 'lucide-react';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePin: (pin: string) => Promise<void>;
  currentSlug: string;
}

export const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onSavePin, currentSlug }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    try {
      await onSavePin(pin);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch {
      setError('Unable to update PIN.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-[#E8DFD3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#F0E6D9]">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#B84A2A]" />
            <h2 className="font-serif text-lg font-semibold text-[#2D231C]">
              Change Front Porch PIN
            </h2>
          </div>
          <button onClick={onClose} className="text-xs text-[#8F7F72] hover:text-[#2D231C]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#736558]">
          Set a new 4-digit PIN for family and friends to enter /@{currentSlug}.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[#736558] mb-1">New 4-Digit PIN</label>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(null);
              }}
              placeholder="••••"
              className="w-full text-center tracking-widest text-lg py-2 px-3 bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#736558] mb-1">Confirm PIN</label>
            <input
              type="password"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => {
                setConfirmPin(e.target.value);
                setError(null);
              }}
              placeholder="••••"
              className="w-full text-center tracking-widest text-lg py-2 px-3 bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
              required
            />
          </div>

          {error && <p className="text-xs text-[#DC2626] bg-[#FEF2F2] p-2 rounded-lg">{error}</p>}

          {success && (
            <p className="text-xs text-[#059669] bg-[#ECFDF5] p-2 rounded-lg flex items-center justify-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>PIN updated successfully!</span>
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#736558] hover:text-[#2D231C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#B84A2A] text-white text-xs font-medium rounded-xl hover:bg-[#A33F23] transition-colors"
            >
              Save PIN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
