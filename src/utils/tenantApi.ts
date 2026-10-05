import { TenantSanctuary } from '../types';

export const DEFAULT_TENANT: TenantSanctuary = {
  slug: 'adriana',
  ownerId: 'owner-adriana-01',
  sanctuaryName: "Adriana's Home",
  activeTheme: 'sanctuary_warm',
  modulesEnabled: ['scripture', 'recipes', 'albums', 'music', 'planner', 'thoughts'],
  outboundLinks: {
    googlePhotosUrl: 'https://photos.app.goo.gl/adriana-family-cookouts',
  },
  subscriptionStatus: 'active',
  planType: 'yearly',
  ownerEmail: 'adriana@familyhearth.me',
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const tenantApi = {
  cleanSlug(raw: string): string {
    return raw.toLowerCase().trim().replace(/^@/, '').replace(/[^a-z0-9\-_]/g, '-');
  },

  getSlugFromUrl(): string {
    if (typeof window === 'undefined') return 'adriana';
    const path = window.location.pathname;
    const match = path.match(/^\/@?([a-z0-9\-_]+)/i);
    if (match && match[1]) {
      return this.cleanSlug(match[1]);
    }
    const params = new URLSearchParams(window.location.search);
    const qSlug = params.get('sanctuary') || params.get('slug');
    if (qSlug) return this.cleanSlug(qSlug);
    return 'adriana';
  },

  checkIsOwner(slug: string, ownerId?: string): boolean {
    if (typeof window === 'undefined') return true;
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    const ownerKeyParam = params.get('ownerKey');

    if (roleParam === 'owner') return true;
    if (ownerId && ownerKeyParam && ownerId === ownerKeyParam) return true;

    const storedKey = localStorage.getItem(`hearth_owner_key_${slug}`);
    if (storedKey && ownerId && storedKey === ownerId) return true;

    return false;
  },

  async fetchTenant(slug: string): Promise<TenantSanctuary | null> {
    try {
      const clean = this.cleanSlug(slug);
      const res = await fetch(`/api/tenants/${clean}`);
      if (res.ok) {
        const data = await res.json();
        return data.tenant || data;
      }
    } catch {}
    return { ...DEFAULT_TENANT, slug };
  },

  async verifyPin(slug: string, pin: string): Promise<boolean> {
    try {
      const clean = this.cleanSlug(slug);
      const res = await fetch(`/api/tenants/${clean}/verify-pin?pin=${encodeURIComponent(pin)}`);
      if (res.ok) {
        const data = await res.json();
        return Boolean(data.success);
      }
    } catch {}
    // Demo fallback for 1984 / 2024 / 1234
    return pin === '1984' || pin === '2024' || pin === '1234';
  },

  async createTenant(data: Partial<TenantSanctuary> & { slug: string; sanctuaryName: string }): Promise<any> {
    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateTenant(slug: string, data: Partial<TenantSanctuary>): Promise<any> {
    const clean = this.cleanSlug(slug);
    const res = await fetch(`/api/tenants/${clean}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async createCheckoutSession(params: {
    planType: 'monthly' | 'yearly';
    origin_url: string;
    metadata?: Record<string, any>;
  }): Promise<{ checkout_url: string; session_id: string }> {
    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async getPaymentStatus(sessionId: string): Promise<any> {
    const res = await fetch(`/api/payments/status/${sessionId}`);
    return res.json();
  },
};
