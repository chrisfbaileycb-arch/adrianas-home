import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Globe,
  CreditCard,
  ShieldCheck,
  Zap,
  Palette,
  Layers,
  Copy,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { tenantApi } from '../utils/tenantApi';
import { saveTenantToFirestore } from '../services/firebaseTenants';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTenantCreated: (slug: string) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onTenantCreated,
}) => {
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('yearly');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [sanctuaryName, setSanctuaryName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [familyPin, setFamilyPin] = useState('1984');
  const [activeTheme, setActiveTheme] = useState('sanctuary_warm');
  const [modulesEnabled, setModulesEnabled] = useState<string[]>([
    'scripture',
    'recipes',
    'albums',
    'music',
    'planner',
    'thoughts',
  ]);
  const [googlePhotosUrl, setGooglePhotosUrl] = useState('');

  // Submission / Loading / Success States
  const [isProcessing, setIsProcessing] = useState(false);
  const [provisionResult, setProvisionResult] = useState<{
    slug: string;
    sanctuaryName: string;
    adminSetupUrl: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSlugChange = (raw: string) => {
    const sanitized = raw
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/[^a-z0-9-_]/g, '-');
    setSlug(sanitized);
    setErrorMsg(null);
  };

  const handleToggleModule = (modId: string) => {
    setModulesEnabled((prev) =>
      prev.includes(modId) ? prev.filter((m) => m !== modId) : [...prev, modId]
    );
  };

  const handleLaunchCheckoutAndProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim() || !sanctuaryName.trim() || !ownerEmail.trim()) {
      setErrorMsg('Please fill in Sanctuary Name, Slug, and Email.');
      return;
    }

    if (familyPin.length !== 4) {
      setErrorMsg('Please enter a 4-digit PIN for your family gate.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Stash provisioning details so the /payment/success page can create the
      // sanctuary once Stripe confirms the subscription.
      const pending = {
        slug: slug.trim(),
        sanctuaryName: sanctuaryName.trim(),
        familyPin: familyPin.trim(),
        activeTheme,
        modulesEnabled,
        outboundLinks: { googlePhotosUrl: googlePhotosUrl.trim() || undefined },
        planType,
        ownerEmail: ownerEmail.trim(),
      };
      localStorage.setItem('hearth_pending_tenant', JSON.stringify(pending));

      // Real Stripe Checkout — redirect to Stripe's hosted page.
      const { checkout_url } = await tenantApi.createCheckout(planType, {
        slug: pending.slug,
        sanctuaryName: pending.sanctuaryName,
        familyPin: pending.familyPin,
        activeTheme,
        modulesEnabled: JSON.stringify(modulesEnabled),
        ownerEmail: pending.ownerEmail,
        planType,
      });

      window.location.href = checkout_url;
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connecting to Stripe. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCopyLink = () => {
    if (!provisionResult) return;
    const fullUrl = `${window.location.origin}${provisionResult.adminSetupUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleFinishAndEnter = () => {
    if (!provisionResult) return;
    onTenantCreated(provisionResult.slug);
    onClose();
  };

  const THEMES = [
    { id: 'sanctuary_warm', name: 'Sanctuary Warm', desc: 'Cozy golden tones, linen & hearth warmth', badge: 'Default' },
    { id: 'modern_lounge', name: 'The Modern Lounge', desc: 'Dark mode, neo-brutalist accents, Spotify pills & photo dumps', badge: 'Creator' },
    { id: 'neutral_keepsake', name: 'The Neutral Keepsake', desc: 'Clean, minimalist stone aesthetic for weddings & reunions', badge: 'Minimal' },
    { id: 'sage_garden', name: 'Sage Garden', desc: 'Earthy botanical sage & herbal calmness', badge: 'Serene' },
    { id: 'lofi_dark', name: 'Lo-Fi Dark', desc: 'Moody midnight hearth, cozy evening lights', badge: 'Night' },
    { id: 'retro_y2k', name: 'Retro Expression', desc: 'Playful warm vintage aesthetic with bold type', badge: 'Playful' },
  ];

  const MODULES = [
    { id: 'scripture', label: 'Scripture Verses', desc: 'Curated steadying verses & daily reflections' },
    { id: 'recipes', label: 'Family Recipes', desc: 'Step-by-step cooking checklists & baking traditions' },
    { id: 'albums', label: 'Shared Photo Albums', desc: 'Zero-liability Google & Apple iCloud cloud hyperlinks' },
    { id: 'music', label: 'Curated Audio Loops', desc: 'Proprietary soothing instrumental preview playback' },
    { id: 'planner', label: 'Daily Planner & Chimes', desc: 'Scheduled intentions & audible chime alerts' },
    { id: 'thoughts', label: 'Thoughts & Mood Journal', desc: 'Private experiences with mood tracking' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E8DFD3] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#E8DFD3]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF2ED] border border-[#F2C8B5] text-[10px] font-bold text-[#B84A2A] uppercase tracking-wider">
              <Zap className="w-3 h-3" />
              <span>Multi-Tenant Creator Engine</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2D231C]">
              Spin Up Your Family Sanctuary
            </h2>
            <p className="text-xs text-[#736558]">
              Create an ad-free, private family space with a custom URL, front porch guest PIN, and zero media liability.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8F7F72] hover:text-[#2D231C] p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2 text-xs font-medium text-[#8F7F72]">
          <span className={step === 1 ? 'text-[#B84A2A] font-bold' : step > 1 ? 'text-[#059669]' : ''}>
            1. Plan & Space Info
          </span>
          <span>→</span>
          <span className={step === 2 ? 'text-[#B84A2A] font-bold' : step > 2 ? 'text-[#059669]' : ''}>
            2. Theme & Modules
          </span>
          <span>→</span>
          <span className={step === 3 ? 'text-[#B84A2A] font-bold' : ''}>
            3. Instant Setup
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#DC2626] font-medium">
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Plan Selection & Basic Details */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Stripe Pricing Toggle */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558]">
                Select Subscription Plan
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlanType('monthly')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    planType === 'monthly'
                      ? 'border-[#B84A2A] bg-[#FAF2ED] ring-2 ring-[#B84A2A]/20 shadow-xs'
                      : 'border-[#E8DFD3] hover:border-[#C4B29E]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D231C]">Monthly</span>
                    <span className="text-xs font-mono font-bold text-[#B84A2A]">$5/mo</span>
                  </div>
                  <p className="text-[11px] text-[#736558] mt-1">Billed monthly, cancel anytime</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanType('yearly')}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    planType === 'yearly'
                      ? 'border-[#B84A2A] bg-[#FAF2ED] ring-2 ring-[#B84A2A]/20 shadow-xs'
                      : 'border-[#E8DFD3] hover:border-[#C4B29E]'
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-[#059669] text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                    Save 33%
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D231C]">Annual</span>
                    <span className="text-xs font-mono font-bold text-[#B84A2A]">$40/yr</span>
                  </div>
                  <p className="text-[11px] text-[#736558] mt-1">Equal to $3.33/mo · Best Value</p>
                </button>
              </div>
            </div>

            {/* Sanctuary Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                Sanctuary Name
              </label>
              <input
                type="text"
                value={sanctuaryName}
                onChange={(e) => setSanctuaryName(e.target.value)}
                data-testid="sanctuary-name-input"
                placeholder="e.g. The Miller Family Hearth, Sarah's Sanctuary..."
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                required
              />
            </div>

            {/* Slug Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                Your Personal Subdomain / Slug
              </label>
              <div className="flex items-center rounded-xl bg-[#FAF7F2] border border-[#E0D5C7] px-3 py-2 text-xs focus-within:ring-2 focus-within:ring-[#B84A2A]">
                <span className="text-[#8F7F72] font-mono select-none">familyhearth.me/@</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  data-testid="slug-input"
                  placeholder="miller"
                  className="w-full bg-transparent text-[#2D231C] font-mono font-semibold focus:outline-none pl-0.5"
                  required
                />
              </div>
              <p className="text-[11px] text-[#8F7F72] mt-1">
                Letters, numbers, and hyphens only. This will be your permanent shareable bio link.
              </p>
            </div>

            {/* Owner Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                Owner Email (For Stripe Receipt & Admin Setup)
              </label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                data-testid="owner-email-input"
                placeholder="you@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                required
              />
            </div>

            {/* 4-Digit Family PIN */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                4-Digit Front Porch Family PIN
              </label>
              <div className="relative max-w-[160px]">
                <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8F7F72]" />
                <input
                  type="text"
                  maxLength={4}
                  value={familyPin}
                  onChange={(e) => setFamilyPin(e.target.value.replace(/\D/g, ''))}
                  data-testid="family-pin-input"
                  placeholder="1984"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C] font-mono tracking-widest text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  required
                />
              </div>
              <p className="text-[11px] text-[#8F7F72] mt-1">
                Stored via bcrypt hash. Protects your family space from crawlers while remaining frictionless for relatives.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!sanctuaryName || !slug || !ownerEmail) {
                    setErrorMsg('Please complete all required fields.');
                    return;
                  }
                  setErrorMsg(null);
                  setStep(2);
                }}
                data-testid="continue-to-theme-btn"
                className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#B84A2A] rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
              >
                <span>Continue to Theme & Modules</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Theme, Modules, and Outbound Links */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558]">
                Select Sanctuary Aesthetic Theme
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {THEMES.map((theme) => {
                  const isSelected = activeTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setActiveTheme(theme.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#B84A2A] bg-[#FAF2ED] ring-2 ring-[#B84A2A]/20'
                          : 'border-[#E8DFD3] hover:border-[#C4B29E]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D231C]">{theme.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-white rounded text-[#736558] border border-[#E0D5C7]">
                          {theme.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#736558] mt-1">{theme.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modules Enabled */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558]">
                Enabled Family Modules
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MODULES.map((mod) => {
                  const isEnabled = modulesEnabled.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      onClick={() => handleToggleModule(mod.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        isEnabled
                          ? 'border-[#B84A2A] bg-[#FAF2ED]/60'
                          : 'border-[#E8DFD3] bg-white opacity-70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-[#B84A2A] focus:ring-[#B84A2A]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#2D231C]">{mod.label}</p>
                        <p className="text-[10px] text-[#736558] leading-tight mt-0.5">{mod.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Outbound Shared Album link */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                Outbound Google Photos Album Link (Optional)
              </label>
              <input
                type="url"
                value={googlePhotosUrl}
                onChange={(e) => setGooglePhotosUrl(e.target.value)}
                placeholder="https://photos.app.goo.gl/..."
                className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C]"
              />
              <p className="text-[11px] text-[#8F7F72] mt-0.5">
                Outbound hyperlink eliminates hosting costs and illegal content liability.
              </p>
            </div>

            {/* Checkout CTA */}
            <div className="pt-2 border-t border-[#E8DFD3] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-medium text-[#736558] hover:text-[#2D231C]"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleLaunchCheckoutAndProvision}
                disabled={isProcessing}
                data-testid="subscribe-launch-btn"
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Connecting to Stripe...'
                    : `Subscribe & Launch (${planType === 'yearly' ? '$40/yr' : '$5/mo'})`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Instant Provisioning & Admin Setup Delivery */}
        {step === 3 && provisionResult && (
          <div className="space-y-5 text-center py-2 animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-[#2D231C]">
                {provisionResult.sanctuaryName} is Live!
              </h3>
              <p className="text-xs text-[#736558] max-w-sm mx-auto">
                Your subscription has been confirmed and the sanctuary was provisioned via Stripe webhook.
              </p>
            </div>

            {/* URL Display Card */}
            <div className="bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl p-4 text-left space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F7F72] block">
                  Public Social Bio Link (For Instagram / Facebook):
                </span>
                <p className="font-mono text-xs font-bold text-[#B84A2A] mt-0.5">
                  https://familyhearth.me/@{provisionResult.slug}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E8DFD3]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] block">
                  👑 Secret Owner Admin Setup Link:
                </span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <code className="font-mono text-[11px] text-[#2D231C] truncate bg-white px-2 py-1 rounded border border-[#E0D5C7] flex-1">
                    {window.location.origin}{provisionResult.adminSetupUrl}
                  </code>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#2D231C] bg-white border border-[#E0D5C7] hover:bg-[#F3ECE2] rounded-lg transition-colors shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleFinishAndEnter}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-[#B84A2A] hover:bg-[#A33F23] rounded-xl transition-colors shadow-xs"
              >
                Enter {provisionResult.sanctuaryName} Now
              </button>
            </div>
          </div>
        )}

        {/* Footer Guarantee Badge */}
        <div className="pt-2 border-t border-[#F0E6D9] flex items-center justify-between text-[11px] text-[#8F7F72]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
            <span>Secure Stripe Checkout · 30-Day Guarantee</span>
          </span>
          <span>Zero Server Media Liability</span>
        </div>
      </div>
    </div>
  );
};
