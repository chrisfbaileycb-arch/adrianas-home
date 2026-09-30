import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Repeat,
  Target,
  Copy,
  Check,
  X,
  ExternalLink,
  Zap,
  BarChart3,
  ShieldCheck,
  Video,
  Share2,
} from 'lucide-react';

interface MicroAdFlywheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
}

export const MicroAdFlywheelModal: React.FC<MicroAdFlywheelModalProps> = ({
  isOpen,
  onClose,
  tenantSlug,
}) => {
  const [copiedCampaignId, setCopiedCampaignId] = useState<string | null>(null);
  const [testDailyBudget, setTestDailyBudget] = useState(10);
  const [reinvestPercent, setReinvestPercent] = useState(60);

  if (!isOpen) return null;

  const CAMPAIGNS = [
    {
      id: 'anti-feed',
      platform: 'Meta (Instagram & Facebook Reels)',
      hookTitle: 'Anti-Feed Tranquil Spaces',
      demographic: 'Millennial parents & exhausted creators (Ages 28–46)',
      budget: '$10 / day test ad set',
      primaryHook: '“Tired of algorithmic rage bait and infinite ads? We built a quiet front porch for our family.”',
      videoConcept: 'Screen capture begins on a cluttered social feed, then cuts to unlocking @' + tenantSlug + ' with a 4-digit PIN, acoustic guitar playing softly in the background, and grandma’s cobbler recipe displayed cleanly with no ads.',
      callToAction: 'Spin up your private family sanctuary for $5/mo at familyhearth.me/@' + tenantSlug,
      tags: ['#AntiSocialMedia', '#FamilySanctuary', '#DigitalWellbeing', '#SlowLiving'],
      conversionEst: '4.2% bio-click to PIN unlock; $2.40 CAC on $10 test',
    },
    {
      id: 'family-heirloom',
      platform: 'TikTok & Meta Video',
      hookTitle: 'Family Heirloom Vault (Zero Liability)',
      demographic: 'Privacy-focused moms, grandparents & archivists (Ages 24–55)',
      budget: '$10 / day test ad set',
      primaryHook: '“Why we stopped sharing our kids on public feeds and created a private cloud bio link instead.”',
      videoConcept: 'Creator holds up a physical linen photo book: “All our family albums live on Google Photos & Apple iCloud, but our private bio link lets family view them with a PIN and print keepsake books on demand.”',
      callToAction: 'Keep your memories safe and private with zero media liability.',
      tags: ['#FamilyKeepsake', '#PrivateFamily', '#PhotoOrganizing', '#ZeroLiability'],
      conversionEst: '5.8% click rate; drives high-margin $15 linen book affiliate referrals',
    },
    {
      id: 'wedding-reunion',
      platform: 'Pinterest & Instagram',
      hookTitle: 'Wedding & Reunion Keepsake',
      demographic: 'Brides, event hosts & family reunion planners (Ages 22–50)',
      budget: '$10 / day test ad set',
      primaryHook: '“The private wedding guestbook bio link that turns into a hardcover family heirloom.”',
      videoConcept: 'Showcases The Neutral Keepsake theme: champagne minimalist aesthetic, shared photo dumps from guests, and one-click export to print-on-demand custom family cookbooks and photo albums.',
      callToAction: 'Create your wedding or reunion space in 60 seconds.',
      tags: ['#WeddingBioLink', '#FamilyReunion', '#KeepsakeBook', '#MinimalistWedding'],
      conversionEst: '6.1% conversion rate for annual $40 subscriptions',
    },
  ];

  const handleCopyCampaign = (c: typeof CAMPAIGNS[0]) => {
    const text = `CAMPAIGN: ${c.hookTitle} (${c.platform})\nTARGET: ${c.demographic}\nBUDGET: ${c.budget}\nHOOK: ${c.primaryHook}\nCREATIVE CONCEPT:\n${c.videoConcept}\nCTA: ${c.callToAction}\nTAGS: ${c.tags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopiedCampaignId(c.id);
    setTimeout(() => setCopiedCampaignId(null), 2500);
  };

  // Reinvestment Calculations
  const estimatedReferralRevenue = 185; // $8 Lulu cookbook print + $15 Artifact Uprising book referrals
  const estimatedSubRevenue = 200; // $5/mo and $40/yr subscriptions
  const totalCashFlow = estimatedReferralRevenue + estimatedSubRevenue;
  const reinvestmentCash = Math.round((totalCashFlow * reinvestPercent) / 100);
  const testCampaignsFunded = Math.floor(reinvestmentCash / testDailyBudget);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E8DFD3] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#E8DFD3]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF2ED] border border-[#F2C8B5] text-[10px] font-bold text-[#B84A2A] uppercase tracking-wider">
              <TrendingUp className="w-3 h-3" />
              <span>Monetization Flywheel & Acquisition Engine</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2D231C]">
              The Micro-Ad Flywheel ($10 Creative Tests)
            </h2>
            <p className="text-xs text-[#736558] max-w-xl font-prose-serif">
              Run targeted micro-campaigns on Meta and TikTok focusing on anti-feed tranquil spaces and family heirlooms. Reinvest high-margin subscription cash flow and print referrals directly back into winning demographic hooks.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-[#8F7F72] hover:text-[#2D231C]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Flywheel Financial Loop Metrics */}
        <div className="bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B84A2A] flex items-center gap-1.5">
              <Repeat className="w-4 h-4" />
              <span>Self-Sustaining Reinvestment Loop</span>
            </span>
            <span className="text-[11px] font-medium text-[#059669] bg-white px-2 py-0.5 rounded-full border border-[#D1FAE5]">
              Cash Flow Positive
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-white p-3 rounded-xl border border-[#E8DFD3]">
              <span className="text-[10px] text-[#8F7F72] block uppercase font-semibold">Print Referrals</span>
              <span className="font-mono text-base font-bold text-[#2D231C]">${estimatedReferralRevenue}</span>
              <span className="text-[9px] text-[#059669] block">Lulu & Keepsake</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E8DFD3]">
              <span className="text-[10px] text-[#8F7F72] block uppercase font-semibold">Subscription MRR</span>
              <span className="font-mono text-base font-bold text-[#2D231C]">${estimatedSubRevenue}</span>
              <span className="text-[9px] text-[#B84A2A] block">$5/mo & $40/yr</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E8DFD3]">
              <span className="text-[10px] text-[#8F7F72] block uppercase font-semibold">Reinvest Cash</span>
              <span className="font-mono text-base font-bold text-[#059669]">${reinvestmentCash}</span>
              <span className="text-[9px] text-[#736558] block">{reinvestPercent}% of profits</span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E8DFD3]">
              <span className="text-[10px] text-[#8F7F72] block uppercase font-semibold">Funded Ad Sets</span>
              <span className="font-mono text-base font-bold text-[#B84A2A]">{testCampaignsFunded}</span>
              <span className="text-[9px] text-[#736558] block">@ $10/test ad</span>
            </div>
          </div>

          {/* Interactive Reinvestment Slider */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#736558]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span>Reinvest Profit Margin:</span>
              <input
                type="range"
                min="20"
                max="100"
                step="10"
                value={reinvestPercent}
                onChange={(e) => setReinvestPercent(Number(e.target.value))}
                className="w-28 accent-[#B84A2A]"
              />
              <span className="font-bold text-[#2D231C] font-mono">{reinvestPercent}%</span>
            </div>
            <p className="text-[11px] text-[#8F7F72] italic">
              Converts 1 cookbook referral into 1 new test creative.
            </p>
          </div>
        </div>

        {/* 3 Targeted $10 Test Creative Campaigns */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#2D231C] flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#B84A2A]" />
              <span>Targeted $10 Creative Test Packages</span>
            </h3>
            <span className="text-xs text-[#8F7F72]">Ready-to-deploy copy & concepts</span>
          </div>

          <div className="space-y-3">
            {CAMPAIGNS.map((c) => (
              <div
                key={c.id}
                className="p-4 bg-white border border-[#E8DFD3] hover:border-[#B84A2A] rounded-2xl shadow-xs space-y-3 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F0E6D9]">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2D231C]">{c.hookTitle}</span>
                      <span className="text-[10px] px-2 py-0.2 bg-[#FAF7F2] rounded text-[#736558] border border-[#E0D5C7] font-medium">
                        {c.platform}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8F7F72]">Target: {c.demographic}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[11px] font-mono font-bold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                      {c.budget}
                    </span>
                    <button
                      onClick={() => handleCopyCampaign(c)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#2D231C] bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#E8DFD3] rounded-lg transition-colors"
                      title="Copy campaign copy & creative specs"
                    >
                      {copiedCampaignId === c.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#059669]" />
                          <span className="text-[#059669] font-semibold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#8F7F72]" />
                          <span>Copy Specs</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-semibold text-[#B84A2A]">Primary Video Hook: </span>
                    <span className="italic text-[#2D231C] font-prose-serif">{c.primaryHook}</span>
                  </div>

                  <div>
                    <span className="font-semibold text-[#524438]">Visual Storyboard: </span>
                    <span className="text-[#6C5E53]">{c.videoConcept}</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <span key={t} className="text-[10px] text-[#8F7F72] bg-[#FAF7F2] px-1.5 py-0.2 rounded border border-[#EFE5D8]">
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-[#059669] font-medium font-mono">
                      {c.conversionEst}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ad Deployment Action Row */}
        <div className="pt-2 border-t border-[#E8DFD3] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-[#736558]">
            <a
              href="https://adsmanager.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#B84A2A] underline"
            >
              <span>Launch on Meta Ads Manager</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <a
              href="https://ads.tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#B84A2A] underline"
            >
              <span>Launch on TikTok Ads</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-[#B84A2A] hover:bg-[#A33F23] rounded-xl transition-colors shadow-xs"
          >
            Close Flywheel Hub
          </button>
        </div>
      </div>
    </div>
  );
};
