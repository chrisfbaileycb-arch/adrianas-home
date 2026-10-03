import React, { useState } from 'react';
import { Sparkles, Check, Palette, Music, LinkIcon, X, Copy, PartyPopper } from 'lucide-react';

interface OwnerOnboardingProps {
  slug: string;
  sanctuaryName: string;
  accent: string;
  bioLink: string;
  onOpenPersonalize: (tab: 'appearance' | 'music') => void;
  onFinish: () => void;
}

export const OwnerOnboarding: React.FC<OwnerOnboardingProps> = ({
  slug,
  sanctuaryName,
  accent,
  bioLink,
  onOpenPersonalize,
  onFinish,
}) => {
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(`hearth_onboard_steps_${slug}`) || '{"claim":true}');
    } catch {
      return { claim: true };
    }
  });
  const [copied, setCopied] = useState(false);

  const mark = (key: string) => {
    const next = { ...done, [key]: true };
    setDone(next);
    try {
      localStorage.setItem(`hearth_onboard_steps_${slug}`, JSON.stringify(next));
    } catch {}
  };

  const copyLink = () => {
    navigator.clipboard.writeText(bioLink);
    setCopied(true);
    mark('share');
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { key: 'claim', icon: Check, title: `Your space is live at @${slug}`, action: null as null | (() => void), cta: '' },
    { key: 'look', icon: Palette, title: 'Make it feel like you', sub: 'Theme, color, font & layout', action: () => { onOpenPersonalize('appearance'); mark('look'); }, cta: 'Customize' },
    { key: 'music', icon: Music, title: 'Add music to your space', sub: 'Pick from the free library', action: () => { onOpenPersonalize('music'); mark('music'); }, cta: 'Add music' },
    { key: 'share', icon: LinkIcon, title: 'Copy your bio link', sub: 'Paste it in your social bios', action: copyLink, cta: copied ? 'Copied!' : 'Copy link' },
  ];

  const completedCount = steps.filter((s) => done[s.key]).length;
  const pct = Math.round((completedCount / steps.length) * 100);
  const allDone = completedCount === steps.length;

  return (
    <div
      className="fixed z-40 bottom-0 left-0 right-0 sm:left-auto sm:right-5 sm:bottom-5 sm:w-[360px] animate-in slide-in-from-bottom-4 fade-in"
      data-testid="owner-onboarding"
    >
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8DFD3] overflow-hidden">
        <div className="p-4 flex items-start justify-between gap-2" style={{ background: `${accent}10` }}>
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: accent }}
            >
              {allDone ? <PartyPopper className="w-4.5 h-4.5" /> : <Sparkles className="w-4.5 h-4.5" />}
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#2D231C] leading-tight">
                {allDone ? 'Beautifully done!' : 'Welcome home'}
              </h3>
              <p className="text-[11px] text-[#8F7F72]">
                {allDone ? `${sanctuaryName} is ready to share` : 'Let’s set up your sanctuary'}
              </p>
            </div>
          </div>
          <button
            onClick={onFinish}
            data-testid="onboarding-close-btn"
            className="p-1 text-[#9E9084] hover:text-[#2D231C] rounded-md"
            aria-label="Dismiss onboarding"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* progress */}
        <div className="px-4 pt-3">
          <div className="h-1.5 w-full bg-[#F0E9DF] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: accent }}
            />
          </div>
          <p className="text-[10px] text-[#9E9084] mt-1">{completedCount} of {steps.length} complete</p>
        </div>

        <div className="p-4 pt-3 space-y-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const isDone = done[s.key];
            return (
              <div
                key={s.key}
                className="flex items-center gap-3 p-2.5 rounded-2xl border border-[#F0E9DF] bg-[#FAF7F2]"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isDone ? accent : '#fff',
                    color: isDone ? '#fff' : accent,
                    border: isDone ? 'none' : `1px solid ${accent}40`,
                  }}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold ${isDone ? 'text-[#8F7F72] line-through' : 'text-[#2D231C]'}`}>
                    {s.title}
                  </p>
                  {s.sub && !isDone && <p className="text-[10px] text-[#9E9084]">{s.sub}</p>}
                </div>
                {s.action && (
                  <button
                    onClick={s.action}
                    data-testid={`onboarding-${s.key}-btn`}
                    className="px-3 py-1.5 text-[11px] font-semibold rounded-lg text-white shrink-0 transition-opacity hover:opacity-90 flex items-center gap-1"
                    style={{ backgroundColor: accent }}
                  >
                    {s.key === 'share' && (copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />)}
                    <span>{s.cta}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={onFinish}
            data-testid="onboarding-finish-btn"
            className="w-full py-2.5 text-xs font-bold rounded-xl transition-opacity hover:opacity-90"
            style={{
              backgroundColor: allDone ? accent : 'transparent',
              color: allDone ? '#fff' : '#8F7F72',
              border: allDone ? 'none' : '1px solid #E8DFD3',
            }}
          >
            {allDone ? 'Enter my sanctuary' : 'Skip for now'}
          </button>
        </div>
      </div>
    </div>
  );
};
