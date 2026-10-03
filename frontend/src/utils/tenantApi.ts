import { TenantSanctuary } from '../types';

const API = (import.meta.env.REACT_APP_BACKEND_URL as string) || '';

export const DEFAULT_TENANT: TenantSanctuary = {
  slug: 'adriana',
  ownerId: 'owner-adriana-01',
  sanctuaryName: "Adriana's Home",
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
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const tenantApi = {
  getSlugFromUrl(): string {
    if (typeof window === 'undefined') return 'adriana';

    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get('s') || params.get('sanctuary') || params.get('slug');
    if (querySlug) {
      return querySlug.toLowerCase().replace(/^@/, '');
    }

    const path = window.location.pathname.replace(/^\/+/, '');
    if (path && path !== 'index.html' && !path.startsWith('api/')) {
      const firstSegment = path.split('/')[0].toLowerCase().replace(/^@/, '');
      if (firstSegment && firstSegment !== 'checkout' && firstSegment !== 'payment') {
        return firstSegment;
      }
    }

    return 'adriana';
  },

  checkIsOwner(slug: string, tenantOwnerId?: string): boolean {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    const ownerKeyParam = params.get('ownerKey');
    const storedKey =
      sessionStorage.getItem(`hearth_owner_${slug}`) || localStorage.getItem(`hearth_owner_${slug}`);

    if (roleParam === 'owner' || (tenantOwnerId && ownerKeyParam === tenantOwnerId)) {
      if (tenantOwnerId) sessionStorage.setItem(`hearth_owner_${slug}`, tenantOwnerId);
      return true;
    }
    if (storedKey && (!tenantOwnerId || storedKey === tenantOwnerId)) return true;
    return false;
  },

  setOwnerMode(slug: string, isOwner: boolean, ownerId = 'owner-authenticated') {
    if (typeof window === 'undefined') return;
    if (isOwner) {
      sessionStorage.setItem(`hearth_owner_${slug}`, ownerId);
    } else {
      sessionStorage.removeItem(`hearth_owner_${slug}`);
    }
  },

  async fetchTenant(slug: string): Promise<TenantSanctuary> {
    const cleanSlug = slug.toLowerCase().replace(/^@/, '');
    try {
      const res = await fetch(`${API}/api/tenants/${cleanSlug}`);
      if (res.ok) {
        const data = await res.json();
        return data.tenant;
      }
    } catch (e) {
      console.warn(`Could not reach /api/tenants/${cleanSlug}, using local fallback:`, e);
    }

    if (cleanSlug === 'adriana') return DEFAULT_TENANT;
    try {
      const local = localStorage.getItem(`tenant_${cleanSlug}`);
      if (local) return JSON.parse(local);
    } catch {}

    return {
      ...DEFAULT_TENANT,
      slug: cleanSlug,
      sanctuaryName: `${cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1)}'s Sanctuary`,
    };
  },

  async fetchTenantsList(): Promise<
    { slug: string; sanctuaryName: string; activeTheme: string; planType?: string }[]
  > {
    try {
      const res = await fetch(`${API}/api/tenants`);
      if (res.ok) {
        const data = await res.json();
        return data.tenants;
      }
    } catch {}

    return [
      { slug: 'adriana', sanctuaryName: "Adriana's Home", activeTheme: 'sanctuary_warm', planType: 'yearly' },
      { slug: 'miller', sanctuaryName: 'The Miller Family Sanctuary', activeTheme: 'sage_garden', planType: 'monthly' },
      { slug: 'lofi-nest', sanctuaryName: 'The Lo-Fi Hearth', activeTheme: 'lofi_dark', planType: 'yearly' },
    ];
  },

  async verifyPin(slug: string, pin: string): Promise<boolean> {
    try {
      const res = await fetch(`${API}/api/tenants/${slug}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.success === true;
      }
    } catch {}
    return false;
  },

  async createTenant(data: {
    slug: string;
    sanctuaryName: string;
    familyPin: string;
    activeTheme: string;
    modulesEnabled: string[];
    outboundLinks: { googlePhotosUrl?: string; customMusicUrl?: string; applePhotosUrl?: string };
    planType: 'monthly' | 'yearly';
    ownerEmail: string;
  }): Promise<{ success: boolean; tenant: TenantSanctuary; adminSetupUrl: string }> {
    try {
      const res = await fetch(`${API}/api/tenants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        localStorage.setItem(`tenant_${result.tenant.slug}`, JSON.stringify(result.tenant));
        sessionStorage.setItem(`hearth_owner_${result.tenant.slug}`, result.tenant.ownerId);
        return result;
      } else if (res.status === 409) {
        // Already provisioned (e.g. by Stripe webhook) — treat as success.
        const existing = await this.fetchTenant(data.slug);
        sessionStorage.setItem(`hearth_owner_${data.slug}`, existing.ownerId);
        return {
          success: true,
          tenant: existing,
          adminSetupUrl: `/@${data.slug}?role=owner&ownerKey=${existing.ownerId}`,
        };
      } else {
        const err = await res.json();
        throw new Error(err.detail || err.error || 'Failed to create tenant');
      }
    } catch (e: any) {
      throw e;
    }
  },

  async updateTenant(
    slug: string,
    updates: Partial<TenantSanctuary> & { familyPin?: string }
  ): Promise<boolean> {
    try {
      const res = await fetch(`${API}/api/tenants/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(`tenant_${slug}`, JSON.stringify(data.tenant));
        return true;
      }
    } catch {}
    try {
      const existing = await this.fetchTenant(slug);
      const merged = { ...existing, ...updates };
      localStorage.setItem(`tenant_${slug}`, JSON.stringify(merged));
      return true;
    } catch {
      return false;
    }
  },

  // Real Stripe checkout — returns the hosted checkout URL to redirect to.
  async createCheckout(
    planType: 'monthly' | 'yearly',
    metadata: Record<string, string>
  ): Promise<{ checkout_url: string; session_id: string }> {
    const res = await fetch(`${API}/api/payments/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType, origin_url: window.location.origin, metadata }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Could not start checkout');
    }
    return res.json();
  },

  async getPaymentStatus(
    sessionId: string
  ): Promise<{ status: string; payment_status: string; slug: string }> {
    const res = await fetch(`${API}/api/payments/status/${sessionId}`);
    if (!res.ok) throw new Error('Could not fetch payment status');
    return res.json();
  },
};
