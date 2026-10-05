import React, { useState } from 'react';
import { tenantApi } from '../utils/tenantApi';
import { Check, Sparkles, X, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlug: string;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose, currentSlug }) => {
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('yearly');
  const [newSlug, setNewSlug] = useState('');
  const [sanctuaryName, setSanctuaryName] = useState('');
  const [familyPin, setFamilyPin] = useState('1984');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetSlug = tenantApi.cleanSlug(newSlug || currentSlug);
    if (!targetSlug) {
      setError('Please choose a sanctuary URL slug.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const origin = window.location.origin;
      const res = await tenantApi.createCheckoutSession({
        planType,
        origin_url: origin,
        metadata: {
          slug: targetSlug,
          sanctuaryName: sanctuaryName || `${targetSlug.charAt(0).toUpperCase() + targetSlug.slice(1)}'s Sanctuary`,
          familyPin: familyPin || '1984',
        },
      });

      if (res.checkout_url) {
        window.location.href = res.checkout_url;
      } else {
        setError('Unable to initiate Stripe checkout. Please try again.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Checkout error.');
      setIsLoading(false);
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
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E8DFD3]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F0E6D9]">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B84A2A]">
              Sovereign Ownership
            </span>
            <h2 className="font-serif text-2xl font-semibold text-[#2D231C]">
              Spin Up a Family Sanctuary
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#8F7F72] hover:text-[#2D231C]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPlanType('yearly')}
            className={`p-4 rounded-2xl border text-left transition-all relative ${
              planType === 'yearly'
                ? 'bg-[#FAF2ED] border-[#B84A2A] shadow-xs ring-1 ring-[#B84A2A]'
                : 'bg-[#FAF7F2] border-[#E8DFD3]'
            }`}
          >
            <span className="absolute top-2 right-2 text-[10px] font-bold text-white bg-[#B84A2A] px-2 py-0.5 rounded-full">
              Best Value
            </span>
            <p className="text-xs font-semibold text-[#2D231C]">Yearly Sovereign</p>
            <p className="font-serif text-2xl font-bold text-[#B84A2A] mt-1">$40 <span className="text-xs font-normal text-[#736558]">/ year</span></p>
            <p className="text-[11px] text-[#059669] font-medium mt-0.5">Save $20 annually</p>
          </button>

          <button
            type="button"
            onClick={() => setPlanType('monthly')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              planType === 'monthly'
                ? 'bg-[#FAF2ED] border-[#B84A2A] shadow-xs ring-1 ring-[#B84A2A]'
                : 'bg-[#FAF7F2] border-[#E8DFD3]'
            }`}
          >
            <p className="text-xs font-semibold text-[#2D231C]">Monthly Flexible</p>
            <p className="font-serif text-2xl font-bold text-[#2D231C] mt-1">$5 <span className="text-xs font-normal text-[#736558]">/ month</span></p>
            <p className="text-[11px] text-[#736558] mt-0.5">Cancel anytime</p>
          </button>
        </div>

        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#736558] mb-1">
              Sanctuary Name
            </label>
            <input
              type="text"
              value={sanctuaryName}
              onChange={(e) => setSanctuaryName(e.target.value)}
              placeholder="e.g. The Miller Family Haven"
              className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#736558] mb-1">
                Sanctuary Slug / Bio Link
              </label>
              <div className="flex items-center bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl px-2.5">
                <span className="text-xs text-[#8F7F72]">/@</span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="miller"
                  className="w-full py-2 px-1 text-xs bg-transparent focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#736558] mb-1">
                4-Digit Family PIN
              </label>
              <input
                type="text"
                maxLength={4}
                value={familyPin}
                onChange={(e) => setFamilyPin(e.target.value)}
                placeholder="1984"
                className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-[#DC2626] bg-[#FEF2F2] p-2.5 rounded-xl border border-[#FCA5A5]">
              {error}
            </p>
          )}

          <div className="p-3 bg-[#FAF7F2] rounded-2xl text-[11px] text-[#736558] space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-[#2D231C]">
              <ShieldCheck className="w-4 h-4 text-[#059669]" />
              <span>Full Sovereign Guarantee</span>
            </div>
            <p>Direct Stripe checkout with automatic tax & instantaneous sanctuary provisioning.</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#B84A2A] hover:bg-[#A33F23] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to Stripe...</span>
              </>
            ) : (
              <>
                <span>Continue to Secure Checkout (${planType === 'yearly' ? '40' : '5'})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
