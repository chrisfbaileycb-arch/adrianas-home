import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle, Copy, Check, ArrowRight } from 'lucide-react';
import { tenantApi } from '../utils/tenantApi';
import { saveTenantToFirestore } from '../services/firebaseTenants';

type Phase = 'verifying' | 'provisioning' | 'done' | 'error';

export const PaymentSuccessView: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('verifying');
  const [message, setMessage] = useState('Confirming your subscription with Stripe…');
  const [slug, setSlug] = useState('');
  const [sanctuaryName, setSanctuaryName] = useState('');
  const [adminUrl, setAdminUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (!sessionId) {
      setPhase('error');
      setMessage('No checkout session was found. Please try subscribing again.');
      return;
    }

    let pending: any = {};
    try {
      pending = JSON.parse(localStorage.getItem('hearth_pending_tenant') || '{}');
    } catch {}

    const finish = async () => {
      setPhase('provisioning');
      setMessage('Building your sovereign family space…');
      const targetSlug = (pending.slug || '').toLowerCase();
      try {
        if (targetSlug) {
          const result = await tenantApi.createTenant({
            slug: targetSlug,
            sanctuaryName: pending.sanctuaryName || `${targetSlug}'s Sanctuary`,
            familyPin: pending.familyPin || '1984',
            activeTheme: pending.activeTheme || 'sanctuary_warm',
            modulesEnabled: pending.modulesEnabled || ['scripture', 'recipes', 'albums', 'music'],
            outboundLinks: pending.outboundLinks || {},
            planType: pending.planType === 'monthly' ? 'monthly' : 'yearly',
            ownerEmail: pending.ownerEmail || '',
          });
          saveTenantToFirestore({
            slug: result.tenant.slug,
            sanctuaryName: result.tenant.sanctuaryName,
            activeTheme: pending.activeTheme || 'sanctuary_warm',
            modulesEnabled: pending.modulesEnabled || [],
            planType: pending.planType === 'monthly' ? 'monthly' : 'yearly',
            subscriptionStatus: 'active',
            ownerEmail: pending.ownerEmail || '',
          }).catch(() => {});
          setSlug(result.tenant.slug);
          setSanctuaryName(result.tenant.sanctuaryName);
          setAdminUrl(`${window.location.origin}${result.adminSetupUrl}`);
          sessionStorage.setItem(`hearth_unlocked_${result.tenant.slug}`, 'true');
        }
        localStorage.removeItem('hearth_pending_tenant');
        setPhase('done');
      } catch (e: any) {
        setPhase('error');
        setMessage(e.message || 'We confirmed your payment but hit a snag setting up. Contact support.');
      }
    };

    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const status = await tenantApi.getPaymentStatus(sessionId);
        if (status.payment_status === 'paid' || status.status === 'completed') {
          await finish();
          return;
        }
        if (status.payment_status === 'failed') {
          setPhase('error');
          setMessage('This payment did not complete. Please try again.');
          return;
        }
      } catch {}
      if (attempts >= 25) {
        setPhase('error');
        setMessage('Still waiting on Stripe. Your space will appear once payment confirms — refresh shortly.');
        return;
      }
      setTimeout(poll, 2000);
    };

    poll();
  }, []);

  const copyAdmin = () => {
    navigator.clipboard.writeText(adminUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-[#FAF7F2]"
      data-testid="payment-success-view"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#E8DFD3] text-center space-y-5">
        {phase !== 'done' && phase !== 'error' && (
          <>
            <Loader2 className="w-10 h-10 text-[#B84A2A] animate-spin mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-[#2D231C]">One moment…</h2>
            <p className="text-sm text-[#736558]">{message}</p>
          </>
        )}

        {phase === 'error' && (
          <>
            <AlertCircle className="w-10 h-10 text-[#B84A2A] mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-[#2D231C]">Almost there</h2>
            <p className="text-sm text-[#736558]">{message}</p>
            <a
              href="/"
              data-testid="payment-home-link"
              className="inline-block px-5 py-2.5 text-xs font-semibold text-white bg-[#B84A2A] rounded-xl hover:bg-[#A33F23]"
            >
              Back to Home
            </a>
          </>
        )}

        {phase === 'done' && (
          <>
            <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#2D231C]">
              {sanctuaryName || 'Your Sanctuary'} is Live!
            </h2>
            <p className="text-sm text-[#736558]">
              Your subscription is confirmed. Share your bio link and keep your owner link private.
            </p>

            <div className="bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl p-4 text-left space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F7F72] block">
                  Public Bio Link
                </span>
                <p className="font-mono text-xs font-bold text-[#B84A2A] mt-0.5" data-testid="public-bio-link">
                  {window.location.origin}/@{slug}
                </p>
              </div>
              <div className="pt-2 border-t border-[#E8DFD3]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#059669] block">
                  Private Owner Link
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="font-mono text-[11px] text-[#2D231C] truncate bg-white px-2 py-1 rounded border border-[#E0D5C7] flex-1">
                    {adminUrl}
                  </code>
                  <button
                    onClick={copyAdmin}
                    data-testid="copy-owner-link-btn"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#2D231C] bg-white border border-[#E0D5C7] hover:bg-[#F3ECE2] rounded-lg shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <a
              href={`/@${slug}?role=owner`}
              data-testid="enter-sanctuary-btn"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-[#B84A2A] rounded-xl hover:bg-[#A33F23]"
            >
              <span>Enter {sanctuaryName || 'your space'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </>
        )}
      </div>
    </div>
  );
};
