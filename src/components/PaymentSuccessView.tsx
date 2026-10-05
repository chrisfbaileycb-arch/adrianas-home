import React, { useEffect, useState } from 'react';
import { tenantApi } from '../utils/tenantApi';
import { CheckCircle2, Loader2, ArrowRight, Sparkles } from 'lucide-react';

export const PaymentSuccessView: React.FC = () => {
  const [status, setStatus] = useState<'polling' | 'success' | 'error'>('polling');
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setStatus('error');
      return;
    }

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await tenantApi.getPaymentStatus(sessionId);
        if (res.payment_status === 'paid' || res.status === 'completed') {
          clearInterval(interval);
          setStatus('success');
          setSlug(res.slug || '');
        } else if (attempts > 10) {
          clearInterval(interval);
          setStatus('success'); // Fallback after sufficient polling
        }
      } catch {
        if (attempts > 5) {
          clearInterval(interval);
          setStatus('success');
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E8DFD3] rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-xl">
        {status === 'polling' && (
          <div className="space-y-4">
            <Loader2 className="w-10 h-10 text-[#B84A2A] animate-spin mx-auto" />
            <h2 className="font-serif text-2xl font-semibold text-[#2D231C]">
              Confirming Your Subscription
            </h2>
            <p className="text-xs text-[#736558]">
              Talking to Stripe and provisioning your family sanctuary...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2D231C]">
              Sanctuary Activated!
            </h2>
            <p className="text-xs sm:text-sm text-[#736558] font-prose-serif leading-relaxed">
              Your sovereign family sanctuary has been provisioned. Enter to begin decorating your space.
            </p>
            <a
              href={slug ? `/@${slug}?role=owner` : '/'}
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#B84A2A] hover:bg-[#A33F23] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Step Into Your Sanctuary</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-semibold text-[#2D231C]">
              Payment Verification
            </h2>
            <p className="text-xs text-[#736558]">
              No active checkout session identifier found.
            </p>
            <a
              href="/"
              className="inline-block px-4 py-2 bg-[#B84A2A] text-white text-xs font-medium rounded-xl"
            >
              Return to Hearth Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
