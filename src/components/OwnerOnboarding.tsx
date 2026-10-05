import React, { useState } from 'react';
import { Sparkles, Palette, Music, Share2, Check, X } from 'lucide-react';

interface OwnerOnboardingProps {
  slug: string;
  onOpenPersonalizeTab: (tab: 'general' | 'teams' | 'music' | 'flower' | 'appearance') => void;
  onDismiss: () => void;
}

export const OwnerOnboarding: React.FC<OwnerOnboardingProps> = ({
  slug,
  onOpenPersonalizeTab,
  onDismiss,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`hearth_onboard_steps_${slug}`);
      return saved ? JSON.parse(saved) : { spaceLive: true };
    } catch {
      return { spaceLive: true };
    }
  });

  const markStepComplete = (key: string) => {
    const updated = { ...completedSteps, [key]: true };
    setCompletedSteps(updated);
    try {
      localStorage.setItem(`hearth_onboard_steps_${slug}`, JSON.stringify(updated));
    } catch {}
  };

  const handleCopyBioLink = () => {
    const link = `${window.location.origin}/@${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    markStepComplete('shareLink');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleFinish = () => {
    try {
      localStorage.setItem(`hearth_onboard_done_${slug}`, 'true');
    } catch {}
    onDismiss();
  };

  const countCompleted = Object.values(completedSteps).filter(Boolean).length;

  return (
    <section
      data-testid="owner-onboarding"
      className="bg-white border border-[#EADBCC] rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#B84A2A]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Owner Checklist ({countCompleted} of 4 complete)</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2D231C]">
            Welcome to Your Sovereign Sanctuary
          </h2>
          <p className="text-xs sm:text-sm text-[#736558] font-prose-serif">
            A quick setup guide to personalize your space and share your private family bio link.
          </p>
        </div>

        <button
          onClick={handleFinish}
          className="p-1.5 text-[#8F7F72] hover:text-[#2D231C] rounded-lg transition-colors"
          title="Close onboarding"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {/* Step 1: Space Live */}
        <div className="p-3.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#2D231C]">1. Space Live</span>
            <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-xs">
              <Check className="w-3 h-3" />
            </span>
          </div>
          <p className="text-[11px] text-[#736558]">Your sanctuary is claimed at /@{slug} with PIN protection.</p>
        </div>

        {/* Step 2: Customize Look */}
        <div className="p-3.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#2D231C]">2. Customize Look</span>
              {completedSteps.look && (
                <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-xs">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#736558]">Pick your accent color, theme tint, and fonts.</p>
          </div>
          <button
            onClick={() => {
              onOpenPersonalizeTab('appearance');
              markStepComplete('look');
            }}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-white text-[#2D231C] border border-[#E8DFD3] rounded-xl text-xs font-medium hover:border-[#B84A2A] hover:text-[#B84A2A] transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-[#B84A2A]" />
            <span>Customize</span>
          </button>
        </div>

        {/* Step 3: Add Music */}
        <div className="p-3.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#2D231C]">3. Add Music</span>
              {completedSteps.music && (
                <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-xs">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#736558]">Choose ambient tracks for your home shelf.</p>
          </div>
          <button
            onClick={() => {
              onOpenPersonalizeTab('music');
              markStepComplete('music');
            }}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-white text-[#2D231C] border border-[#E8DFD3] rounded-xl text-xs font-medium hover:border-[#B84A2A] hover:text-[#B84A2A] transition-colors"
          >
            <Music className="w-3.5 h-3.5 text-[#B84A2A]" />
            <span>Add Music</span>
          </button>
        </div>

        {/* Step 4: Share Link */}
        <div className="p-3.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#2D231C]">4. Share Bio Link</span>
              {completedSteps.shareLink && (
                <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center text-xs">
                  <Check className="w-3 h-3" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#736558]">Put your sovereign link in your social bio or message family.</p>
          </div>
          <button
            onClick={handleCopyBioLink}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-[#B84A2A] text-white rounded-xl text-xs font-medium hover:bg-[#A33F23] transition-colors shadow-xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Copy Bio Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          onClick={handleFinish}
          className="text-xs font-medium text-[#736558] hover:text-[#B84A2A] transition-colors"
        >
          Dismiss Checklist ✓
        </button>
      </div>
    </section>
  );
};
