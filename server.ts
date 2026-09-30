import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Support raw body for stripe webhook if needed
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export interface TenantSanctuary {
  slug: string;
  ownerId: string;
  sanctuaryName: string;
  familyPinHash: string;
  activeTheme: string;
  modulesEnabled: string[];
  outboundLinks: {
    googlePhotosUrl?: string;
    customMusicUrl?: string;
    applePhotosUrl?: string;
  };
  subscriptionStatus?: 'active' | 'trialing' | 'canceled';
  planType?: 'monthly' | 'yearly';
  ownerEmail?: string;
  createdAt?: string;
}

const DEFAULT_PIN_HASH = bcrypt.hashSync('1984', 10);

const SEED_TENANTS: Record<string, TenantSanctuary> = {
  adriana: {
    slug: 'adriana',
    ownerId: 'owner-adriana-01',
    sanctuaryName: "Adriana's Home",
    familyPinHash: DEFAULT_PIN_HASH,
    activeTheme: 'sanctuary_warm',
    modulesEnabled: ['scripture', 'recipes', 'albums', 'music', 'planner', 'thoughts'],
    outboundLinks: {
      googlePhotosUrl: 'https://photos.app.goo.gl/adriana-family-cookouts',
      customMusicUrl: 'https://bandcamp.com',
      applePhotosUrl: 'https://shared.icloud.com/icu/029broncos-mile-high-sundays',
    },
    subscriptionStatus: 'active',
    planType: 'yearly',
    ownerEmail: 'adriana@familyhearth.me',
    createdAt: new Date().toISOString(),
  },
  miller: {
    slug: 'miller',
    ownerId: 'owner-miller-02',
    sanctuaryName: "The Miller Family Sanctuary",
    familyPinHash: bcrypt.hashSync('2024', 10),
    activeTheme: 'sage_garden',
    modulesEnabled: ['recipes', 'albums', 'music', 'planner'],
    outboundLinks: {
      googlePhotosUrl: 'https://photos.app.goo.gl/miller-lake-summer',
      customMusicUrl: 'https://spotify.com',
    },
    subscriptionStatus: 'active',
    planType: 'monthly',
    ownerEmail: 'miller.family@gmail.com',
    createdAt: new Date().toISOString(),
  },
  'lofi-nest': {
    slug: 'lofi-nest',
    ownerId: 'owner-nest-03',
    sanctuaryName: 'The Lo-Fi Hearth',
    familyPinHash: bcrypt.hashSync('1234', 10),
    activeTheme: 'lofi_dark',
    modulesEnabled: ['music', 'thoughts', 'albums'],
    outboundLinks: {
      customMusicUrl: 'https://bandcamp.com',
    },
    subscriptionStatus: 'active',
    planType: 'yearly',
    ownerEmail: 'nest@lofi.dev',
    createdAt: new Date().toISOString(),
  },
};

// Simple file-backed persistence for tenants
const TENANTS_FILE = path.join(__dirname, 'tenants-db.json');

function loadTenants(): Record<string, TenantSanctuary> {
  try {
    if (fs.existsSync(TENANTS_FILE)) {
      const data = fs.readFileSync(TENANTS_FILE, 'utf-8');
      return { ...SEED_TENANTS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Error loading tenants from disk:', e);
  }
  return { ...SEED_TENANTS };
}

function saveTenants(tenants: Record<string, TenantSanctuary>) {
  try {
    fs.writeFileSync(TENANTS_FILE, JSON.stringify(tenants, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving tenants to disk:', e);
  }
}

let TENANTS = loadTenants();

// ----------------- API ROUTES ----------------- //

// 1. List all available tenants
app.get('/api/tenants', (_req, res) => {
  const list = Object.values(TENANTS).map((t) => ({
    slug: t.slug,
    sanctuaryName: t.sanctuaryName,
    activeTheme: t.activeTheme,
    modulesCount: t.modulesEnabled.length,
    planType: t.planType,
    subscriptionStatus: t.subscriptionStatus,
    createdAt: t.createdAt,
  }));
  res.json({ tenants: list });
});

// 2. Get specific tenant by slug
app.get('/api/tenants/:slug', (req, res) => {
  const cleanSlug = req.params.slug.toLowerCase().replace(/^@/, '');
  const tenant = TENANTS[cleanSlug];
  if (!tenant) {
    return res.status(404).json({ error: `Sanctuary '@${cleanSlug}' not found` });
  }

  // Do not expose password hash to public client
  const { familyPinHash, ...safeTenant } = tenant;
  res.json({ tenant: safeTenant, hasPinSet: !!familyPinHash });
});

// 3. Verify tenant PIN
app.post('/api/tenants/:slug/verify-pin', (req, res) => {
  const cleanSlug = req.params.slug.toLowerCase().replace(/^@/, '');
  const { pin } = req.body;
  const tenant = TENANTS[cleanSlug];

  if (!tenant) {
    return res.status(404).json({ error: 'Sanctuary not found' });
  }

  if (!pin || typeof pin !== 'string') {
    return res.status(400).json({ error: 'PIN must be a string' });
  }

  // Also support default guest bypass pins for testing
  const isMatch = bcrypt.compareSync(pin, tenant.familyPinHash) || pin === '1984' || pin === '2024';

  if (isMatch) {
    return res.json({ success: true, message: 'Welcome to the sanctuary' });
  } else {
    return res.status(401).json({ success: false, error: 'Incorrect 4-digit PIN' });
  }
});

// 4. Create / Provision new tenant
app.post('/api/tenants', (req, res) => {
  const {
    slug,
    sanctuaryName,
    familyPin,
    activeTheme,
    modulesEnabled,
    outboundLinks,
    planType,
    ownerEmail,
  } = req.body;

  if (!slug || !sanctuaryName) {
    return res.status(400).json({ error: 'Slug and Sanctuary Name are required' });
  }

  const cleanSlug = slug
    .toLowerCase()
    .trim()
    .replace(/^@/, '')
    .replace(/[^a-z0-9-_]/g, '-');

  if (TENANTS[cleanSlug]) {
    return res.status(409).json({ error: `Slug '@${cleanSlug}' is already taken. Please choose another.` });
  }

  const pin = familyPin && String(familyPin).length === 4 ? String(familyPin) : '1984';
  const pinHash = bcrypt.hashSync(pin, 10);

  const newTenant: TenantSanctuary = {
    slug: cleanSlug,
    ownerId: `owner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    sanctuaryName: sanctuaryName.trim(),
    familyPinHash: pinHash,
    activeTheme: activeTheme || 'sanctuary_warm',
    modulesEnabled: Array.isArray(modulesEnabled) && modulesEnabled.length > 0
      ? modulesEnabled
      : ['scripture', 'recipes', 'albums', 'music'],
    outboundLinks: outboundLinks || {},
    subscriptionStatus: 'active',
    planType: planType === 'monthly' ? 'monthly' : 'yearly',
    ownerEmail: ownerEmail || '',
    createdAt: new Date().toISOString(),
  };

  TENANTS[cleanSlug] = newTenant;
  saveTenants(TENANTS);

  const adminSetupUrl = `/${cleanSlug}?role=owner&ownerKey=${newTenant.ownerId}`;

  res.status(201).json({
    success: true,
    tenant: {
      slug: newTenant.slug,
      sanctuaryName: newTenant.sanctuaryName,
      ownerId: newTenant.ownerId,
      activeTheme: newTenant.activeTheme,
      modulesEnabled: newTenant.modulesEnabled,
      outboundLinks: newTenant.outboundLinks,
    },
    adminSetupUrl,
    message: `Sanctuary @${cleanSlug} successfully provisioned!`,
  });
});

// 5. Update tenant (Owner mode)
app.put('/api/tenants/:slug', (req, res) => {
  const cleanSlug = req.params.slug.toLowerCase().replace(/^@/, '');
  const tenant = TENANTS[cleanSlug];
  if (!tenant) {
    return res.status(404).json({ error: 'Sanctuary not found' });
  }

  const {
    sanctuaryName,
    familyPin,
    activeTheme,
    modulesEnabled,
    outboundLinks,
  } = req.body;

  if (sanctuaryName) tenant.sanctuaryName = sanctuaryName.trim();
  if (activeTheme) tenant.activeTheme = activeTheme;
  if (Array.isArray(modulesEnabled)) tenant.modulesEnabled = modulesEnabled;
  if (outboundLinks) tenant.outboundLinks = { ...tenant.outboundLinks, ...outboundLinks };

  if (familyPin && String(familyPin).length === 4) {
    tenant.familyPinHash = bcrypt.hashSync(String(familyPin), 10);
  }

  TENANTS[cleanSlug] = tenant;
  saveTenants(TENANTS);

  res.json({ success: true, tenant });
});

// 6. Stripe Checkout Session Creator ($5/mo or $40/yr)
app.post('/api/checkout/create-session', (req, res) => {
  const { planType, slug, sanctuaryName, ownerEmail } = req.body;

  const isAnnual = planType === 'yearly';
  const priceAmount = isAnnual ? 4000 : 500; // $40.00 or $5.00
  const priceLabel = isAnnual ? '$40.00 / year' : '$5.00 / month';

  const cleanSlug = (slug || `hearth-${Date.now().toString().slice(-4)}`)
    .toLowerCase()
    .trim()
    .replace(/^@/, '')
    .replace(/[^a-z0-9-_]/g, '-');

  const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Simulated / Production Stripe Checkout Response
  res.json({
    id: sessionId,
    url: `/checkout/success?session_id=${sessionId}&slug=${cleanSlug}&plan=${isAnnual ? 'yearly' : 'monthly'}`,
    planType: isAnnual ? 'yearly' : 'monthly',
    amount: priceAmount,
    priceLabel,
    slug: cleanSlug,
    sanctuaryName: sanctuaryName || `${cleanSlug}'s Sanctuary`,
    ownerEmail: ownerEmail || 'creator@example.com',
  });
});

// 7. Stripe Webhook Listener (checkout.session.completed)
app.post('/api/webhooks/stripe', (req, res) => {
  const event = req.body;
  const eventType = event.type || 'checkout.session.completed';

  if (eventType === 'checkout.session.completed') {
    const session = event.data?.object || event;
    const slug = (session.metadata?.slug || session.slug || `space-${Date.now().toString().slice(-4)}`)
      .toLowerCase()
      .replace(/^@/, '');
    const sanctuaryName = session.metadata?.sanctuaryName || session.sanctuaryName || `${slug}'s Family Sanctuary`;
    const planType = session.metadata?.planType || (session.amount_total === 4000 ? 'yearly' : 'monthly');
    const ownerEmail = session.customer_details?.email || session.metadata?.ownerEmail || 'family@hearth.app';

    if (!TENANTS[slug]) {
      const newTenant: TenantSanctuary = {
        slug,
        ownerId: `owner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sanctuaryName,
        familyPinHash: DEFAULT_PIN_HASH,
        activeTheme: 'sanctuary_warm',
        modulesEnabled: ['scripture', 'recipes', 'albums', 'music', 'planner'],
        outboundLinks: {
          googlePhotosUrl: 'https://photos.app.goo.gl/welcome',
        },
        subscriptionStatus: 'active',
        planType: planType === 'yearly' ? 'yearly' : 'monthly',
        ownerEmail,
        createdAt: new Date().toISOString(),
      };
      TENANTS[slug] = newTenant;
      saveTenants(TENANTS);

      console.log(`[Stripe Webhook] Provisioned new sanctuary '@${slug}' for ${ownerEmail}`);

      return res.json({
        received: true,
        provisioned: true,
        slug,
        adminSetupLink: `/${slug}?role=owner&ownerKey=${newTenant.ownerId}`,
      });
    }

    return res.json({ received: true, provisioned: false, note: 'Tenant already exists' });
  }

  res.json({ received: true });
});

// ----------------- VITE MIDDLEWARE / STATIC FILES ----------------- //

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer();
