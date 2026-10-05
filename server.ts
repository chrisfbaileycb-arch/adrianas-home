import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------- Helpers ----------------- //

function cleanSlug(raw: string): string {
  return raw.toLowerCase().trim().replace(/^@/, '').replace(/[^a-z0-9\-_]/g, '-');
}

function hashPin(pin: string): string {
  return bcrypt.hashSync(pin, 10);
}

function checkPin(pin: string, pinHash?: string): boolean {
  if (!pinHash) return false;
  try {
    return bcrypt.compareSync(pin, pinHash);
  } catch {
    return false;
  }
}

// ----------------- DB / State ----------------- //

export interface TenantRecord {
  slug: string;
  ownerId: string;
  sanctuaryName: string;
  familyPinHash: string;
  activeTheme: string;
  modulesEnabled: string[];
  outboundLinks: Record<string, string>;
  subscriptionStatus: string;
  planType: string;
  ownerEmail: string;
  createdAt: string;
}

export interface PaymentTransaction {
  session_id: string;
  lookup_key: string;
  plan_type: string;
  metadata: Record<string, any>;
  amount: number;
  currency: string;
  status: string;
  payment_status: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

const tenants = new Map<string, TenantRecord>();
const payments = new Map<string, PaymentTransaction>();

function safeTenant(doc: TenantRecord) {
  return {
    slug: doc.slug,
    ownerId: doc.ownerId || '',
    sanctuaryName: doc.sanctuaryName || '',
    activeTheme: doc.activeTheme || 'sanctuary_warm',
    modulesEnabled: doc.modulesEnabled || [],
    outboundLinks: doc.outboundLinks || {},
    subscriptionStatus: doc.subscriptionStatus || 'active',
    planType: doc.planType || 'yearly',
    ownerEmail: doc.ownerEmail || '',
    createdAt: doc.createdAt || '',
  };
}

function provisionTenant(data: Record<string, any>): TenantRecord {
  const slug = cleanSlug(data.slug || '');
  if (!slug) {
    throw new Error('slug required');
  }

  const existing = tenants.get(slug);
  if (existing) {
    return existing;
  }

  let pin = String(data.familyPin || '1984');
  pin = pin.length === 4 && /^\d+$/.test(pin) ? pin : '1984';

  let modules = data.modulesEnabled;
  if (typeof modules === 'string') {
    try {
      modules = JSON.parse(modules);
    } catch {
      modules = [];
    }
  }
  if (!Array.isArray(modules) || modules.length === 0) {
    modules = ['scripture', 'recipes', 'albums', 'music', 'planner', 'thoughts'];
  }

  const doc: TenantRecord = {
    slug,
    ownerId: `owner-${Date.now()}`,
    sanctuaryName: (data.sanctuaryName || `${slug.charAt(0).toUpperCase() + slug.slice(1)}'s Sanctuary`).trim(),
    familyPinHash: hashPin(pin),
    activeTheme: data.activeTheme || 'sanctuary_warm',
    modulesEnabled: modules,
    outboundLinks: data.outboundLinks || {},
    subscriptionStatus: 'active',
    planType: data.planType === 'monthly' ? 'monthly' : 'yearly',
    ownerEmail: data.ownerEmail || '',
    createdAt: new Date().toISOString(),
  };

  tenants.set(slug, doc);
  return doc;
}

function seedTenants() {
  const seeds = [
    {
      slug: 'adriana',
      sanctuaryName: "Adriana's Home",
      familyPin: '1984',
      activeTheme: 'sanctuary_warm',
      modulesEnabled: ['scripture', 'recipes', 'albums', 'music', 'planner', 'thoughts'],
      outboundLinks: { googlePhotosUrl: 'https://photos.app.goo.gl/adriana-family-cookouts' },
      ownerEmail: 'adriana@familyhearth.me',
      planType: 'yearly',
    },
    {
      slug: 'miller',
      sanctuaryName: 'The Miller Family Sanctuary',
      familyPin: '2024',
      activeTheme: 'sage_garden',
      modulesEnabled: ['recipes', 'albums', 'music', 'planner'],
      outboundLinks: {},
      ownerEmail: 'miller.family@gmail.com',
      planType: 'monthly',
    },
    {
      slug: 'lofi-nest',
      sanctuaryName: 'The Lo-Fi Hearth',
      familyPin: '1234',
      activeTheme: 'lofi_dark',
      modulesEnabled: ['music', 'thoughts', 'albums'],
      outboundLinks: {},
      ownerEmail: 'nest@lofi.dev',
      planType: 'yearly',
    },
  ];

  for (const s of seeds) {
    if (!tenants.has(s.slug)) {
      provisionTenant(s);
    }
  }
}

seedTenants();

// ----------------- Stripe ----------------- //

const stripeApiKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeApiKey ? new Stripe(stripeApiKey) : null;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const LOOKUP_KEYS: Record<string, string> = { monthly: 'hearth_monthly', yearly: 'hearth_yearly' };

function markPaid(sessionId: string, subscriptionId?: string) {
  const rec = payments.get(sessionId);
  if (!rec) return;
  rec.status = 'completed';
  rec.payment_status = 'paid';
  if (subscriptionId) rec.stripe_subscription_id = subscriptionId;
  rec.updated_at = new Date().toISOString();

  const meta = rec.metadata || {};
  if (meta.slug) {
    try {
      provisionTenant(meta);
    } catch (e) {
      console.warn('Provision on payment failed:', e);
    }
  }
}

// ----------------- Server Boot ----------------- //

async function startServer() {
  const app = express();

  app.use(cors());

  // Webhook needs raw body if signature verification is used, so parse json after or use raw for webhook
  app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
  app.use(express.json());

  // ---------- API Routes ---------- //

  app.get(['/api', '/api/'], (_req, res) => {
    res.json({ status: 'ok', service: 'hearth' });
  });

  app.get('/api/tenants', (_req, res) => {
    const items = Array.from(tenants.values()).map((t) => ({
      slug: t.slug,
      sanctuaryName: t.sanctuaryName || '',
      activeTheme: t.activeTheme || 'sanctuary_warm',
      modulesCount: (t.modulesEnabled || []).length,
      planType: t.planType || 'yearly',
      subscriptionStatus: t.subscriptionStatus || 'active',
      createdAt: t.createdAt || '',
    }));
    res.json({ tenants: items });
  });

  app.get('/api/tenants/:slug', (req, res) => {
    const slug = cleanSlug(req.params.slug);
    const t = tenants.get(slug);
    if (!t) {
      res.status(404).json({ detail: `Sanctuary '@${slug}' not found` });
      return;
    }
    res.json({
      tenant: safeTenant(t),
      hasPinSet: Boolean(t.familyPinHash),
    });
  });

  app.post('/api/tenants/:slug/verify-pin', (req, res) => {
    const slug = cleanSlug(req.params.slug);
    const t = tenants.get(slug);
    if (!t) {
      res.status(404).json({ detail: 'Sanctuary not found' });
      return;
    }
    const pin = String(req.body?.pin || '');
    if (checkPin(pin, t.familyPinHash)) {
      res.json({ success: true, message: 'Welcome to the sanctuary' });
      return;
    }
    res.status(401).json({ detail: 'Incorrect 4-digit PIN' });
  });

  app.get('/api/tenants/:slug/verify-pin', (req, res) => {
    const slug = cleanSlug(req.params.slug);
    const t = tenants.get(slug);
    if (!t) {
      res.status(404).json({ detail: 'Sanctuary not found' });
      return;
    }
    const pin = String(req.query.pin || '');
    if (checkPin(pin, t.familyPinHash)) {
      res.json({ success: true, message: 'Welcome to the sanctuary' });
      return;
    }
    res.status(401).json({ detail: 'Incorrect 4-digit PIN' });
  });

  app.post('/api/tenants', (req, res) => {
    const slug = cleanSlug(req.body.slug || '');
    if (!slug || !req.body.sanctuaryName) {
      res.status(400).json({ detail: 'Slug and Sanctuary Name are required' });
      return;
    }
    if (tenants.has(slug)) {
      res.status(409).json({ detail: `Slug '@${slug}' is already taken. Please choose another.` });
      return;
    }
    const doc = provisionTenant(req.body);
    res.json({
      success: true,
      tenant: safeTenant(doc),
      adminSetupUrl: `/@${slug}?role=owner&ownerKey=${doc.ownerId}`,
      message: `Sanctuary @${slug} successfully provisioned!`,
    });
  });

  app.put('/api/tenants/:slug', (req, res) => {
    const slug = cleanSlug(req.params.slug);
    const t = tenants.get(slug);
    if (!t) {
      res.status(404).json({ detail: 'Sanctuary not found' });
      return;
    }
    const body = req.body || {};
    if (body.sanctuaryName) {
      t.sanctuaryName = String(body.sanctuaryName).trim();
    }
    if (body.activeTheme) {
      t.activeTheme = body.activeTheme;
    }
    if (Array.isArray(body.modulesEnabled)) {
      t.modulesEnabled = body.modulesEnabled;
    }
    if (body.outboundLinks && typeof body.outboundLinks === 'object') {
      t.outboundLinks = { ...t.outboundLinks, ...body.outboundLinks };
    }
    if (body.familyPin && String(body.familyPin).length === 4 && /^\d+$/.test(String(body.familyPin))) {
      t.familyPinHash = hashPin(String(body.familyPin));
    }
    res.json({ success: true, tenant: safeTenant(t) });
  });

  // ---------- Payments Routes ---------- //

  app.post('/api/payments/checkout', async (req, res) => {
    const planType = req.body.planType === 'monthly' ? 'monthly' : 'yearly';
    const lookupKey = LOOKUP_KEYS[planType] || LOOKUP_KEYS.yearly;
    const originUrl = req.body.origin_url || 'http://localhost:3000';
    const metadata = { ...(req.body.metadata || {}), planType };

    if (stripe) {
      try {
        const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
        if (prices.data.length > 0) {
          const price = prices.data[0];
          const session = await stripe.checkout.sessions.create({
            line_items: [{ price: price.id, quantity: 1 }],
            mode: 'subscription',
            success_url: `${originUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${originUrl}/payment/cancel`,
            metadata,
          });

          payments.set(session.id, {
            session_id: session.id,
            lookup_key: lookupKey,
            plan_type: planType,
            metadata,
            amount: price.unit_amount || 0,
            currency: price.currency,
            status: 'initiated',
            payment_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          res.json({ checkout_url: session.url, session_id: session.id });
          return;
        }
      } catch (err: any) {
        console.warn('Stripe checkout call encountered error, using fallback session:', err.message);
      }
    }

    // Fallback sandbox / dev session flow
    const sessionId = `cs_dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    payments.set(sessionId, {
      session_id: sessionId,
      lookup_key: lookupKey,
      plan_type: planType,
      metadata,
      amount: planType === 'monthly' ? 500 : 4000,
      currency: 'usd',
      status: 'initiated',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const checkoutUrl = `${originUrl}/payment/success?session_id=${sessionId}`;
    res.json({ checkout_url: checkoutUrl, session_id: sessionId });
  });

  app.get('/api/payments/status/:session_id', async (req, res) => {
    const sessionId = req.params.session_id;
    let rec = payments.get(sessionId);

    if (!rec) {
      rec = {
        session_id: sessionId,
        lookup_key: 'hearth_yearly',
        plan_type: 'yearly',
        metadata: {},
        amount: 4000,
        currency: 'usd',
        status: 'completed',
        payment_status: 'paid',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      payments.set(sessionId, rec);
    }

    if (rec.payment_status !== 'paid') {
      if (stripe && !sessionId.startsWith('cs_dev_')) {
        try {
          const s = await stripe.checkout.sessions.retrieve(sessionId);
          if (s.payment_status === 'paid' || s.status === 'complete') {
            markPaid(sessionId, typeof s.subscription === 'string' ? s.subscription : undefined);
          }
        } catch {}
      } else {
        // Complete mock/dev transaction upon polling
        markPaid(sessionId);
      }
    }

    const updated = payments.get(sessionId) || rec;
    res.json({
      session_id: updated.session_id,
      status: updated.status,
      payment_status: updated.payment_status,
      slug: updated.metadata?.slug || '',
    });
  });

  app.post('/api/stripe/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    if (stripe && STRIPE_WEBHOOK_SECRET && sig) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
      }
    } else {
      try {
        event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      } catch {
        res.status(400).json({ status: 'invalid payload' });
        return;
      }
    }

    const obj = event?.data?.object as any;
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      if (obj?.id) {
        markPaid(obj.id, obj.subscription);
      }
    } else if (event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
      if (obj?.id && payments.has(obj.id)) {
        const item = payments.get(obj.id)!;
        item.status = 'failed';
        item.payment_status = 'failed';
        item.updated_at = new Date().toISOString();
      }
    }

    res.json({ status: 'ok' });
  });

  // ---------- Static / Vite Middleware Setup ---------- //

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hearth sanctuary server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
