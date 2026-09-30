import { TenantSanctuary } from '../types';

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
  // Extract slug from URL pathname (e.g. /@adriana or /adriana or ?sanctuary=adriana)
  getSlugFromUrl(): string {
    if (typeof window === 'undefined') return 'adriana';
    
    // Check search params first
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get('s') || params.get('sanctuary') || params.get('slug');
    if (querySlug) {
      return querySlug.toLowerCase().replace(/^@/, '');
    }

    // Check pathname
    const path = window.location.pathname.replace(/^\/+/, '');
    if (path && path !== 'index.html' && !path.startsWith('api/')) {
      const firstSegment = path.split('/')[0].toLowerCase().replace(/^@/, '');
      if (firstSegment && firstSegment !== 'checkout') {
        return firstSegment;
      }
    }

    return 'adriana';
  },

  // Check if current user is owner (via query param, sessionStorage, or local key)
  checkIsOwner(slug: string, tenantOwnerId?: string): boolean {
    if (typeof window === 'undefined') return false;

    // Check query param e.g. ?role=owner&ownerKey=...
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    const ownerKeyParam = params.get('ownerKey');

    const storedKey = sessionStorage.getItem(`hearth_owner_${slug}`) || localStorage.getItem(`hearth_owner_${slug}`);

    if (roleParam === 'owner' || (tenantOwnerId && ownerKeyParam === tenantOwnerId)) {
      if (tenantOwnerId) {
        sessionStorage.setItem(`hearth_owner_${slug}`, tenantOwnerId);
      }
      return true;
    }

    if (storedKey && (!tenantOwnerId || storedKey === tenantOwnerId)) {
      return true;
    }

    // Default: adriana is owner if locally set, or for prototype convenience if owner toggle clicked
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
      const res = await fetch(`/api/tenants/${cleanSlug}`);
      if (res.ok) {
        const data = await res.json();
        return data.tenant;
      }
    } catch (e) {
      console.warn(`Could not reach /api/tenants/${cleanSlug}, using local fallback:`, e);
    }

    // Fallback if backend route not reached or during client-only transition
    if (cleanSlug === 'adriana') return DEFAULT_TENANT;
    
    // Check localStorage fallback for created tenants
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

  async fetchTenantsList(): Promise<{ slug: string; sanctuaryName: string; activeTheme: string; planType?: string }[]> {
    try {
      const res = await fetch('/api/tenants');
      if (res.ok) {
        const data = await res.json();
        return data.tenants;
      }
    } catch {}

    return [
      { slug: 'adriana', sanctuaryName: "Adriana's Home", activeTheme: 'sanctuary_warm', planType: 'yearly' },
      { slug: 'miller', sanctuaryName: "The Miller Family Sanctuary", activeTheme: 'sage_garden', planType: 'monthly' },
      { slug: 'lofi-nest', sanctuaryName: 'The Lo-Fi Hearth', activeTheme: 'lofi_dark', planType: 'yearly' },
    ];
  },

  async verifyPin(slug: string, pin: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/tenants/${slug}/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.success === true;
      }
    } catch {}

    // Fallback checks
    return pin === '1984' || pin === '2024' || pin === '1234';
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
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        // Also cache locally for instant client access
        localStorage.setItem(`tenant_${result.tenant.slug}`, JSON.stringify(result.tenant));
        sessionStorage.setItem(`hearth_owner_${result.tenant.slug}`, result.tenant.ownerId);
        return result;
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create tenant');
      }
    } catch (e: any) {
      console.warn('Backend createTenant failed, using local simulation:', e);
      // Client-side simulation fallback
      const newTenant: TenantSanctuary = {
        slug: data.slug,
        ownerId: `owner-${Date.now()}`,
        sanctuaryName: data.sanctuaryName,
        activeTheme: data.activeTheme,
        modulesEnabled: data.modulesEnabled,
        outboundLinks: data.outboundLinks,
        planType: data.planType,
        ownerEmail: data.ownerEmail,
        subscriptionStatus: 'active',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(`tenant_${data.slug}`, JSON.stringify(newTenant));
      sessionStorage.setItem(`hearth_owner_${data.slug}`, newTenant.ownerId);
      return {
        success: true,
        tenant: newTenant,
        adminSetupUrl: `/${data.slug}?role=owner&ownerKey=${newTenant.ownerId}`,
      };
    }
  },

  async updateTenant(slug: string, updates: Partial<TenantSanctuary> & { familyPin?: string }): Promise<boolean> {
    try {
      const res = await fetch(`/api/tenants/${slug}`, {
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

    // Fallback: save to localStorage
    try {
      const existing = await this.fetchTenant(slug);
      const merged = { ...existing, ...updates };
      localStorage.setItem(`tenant_${slug}`, JSON.stringify(merged));
      return true;
    } catch {
      return false;
    }
  },

  async createCheckoutSession(data: {
    planType: 'monthly' | 'yearly';
    slug: string;
    sanctuaryName: string;
    ownerEmail: string;
  }): Promise<{ id: string; url: string; priceLabel: string }> {
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    const isAnnual = data.planType === 'yearly';
    return {
      id: `cs_sim_${Date.now()}`,
      url: `/checkout/success?slug=${data.slug}&plan=${data.planType}`,
      priceLabel: isAnnual ? '$40.00 / year' : '$5.00 / month',
    };
  },

  async triggerStripeWebhookSimulation(slug: string, sanctuaryName: string, planType: 'monthly' | 'yearly', email: string): Promise<any> {
    try {
      const res = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkout.session.completed',
          data: {
            object: {
              metadata: { slug, sanctuaryName, planType, ownerEmail: email },
              amount_total: planType === 'yearly' ? 4000 : 500,
              customer_details: { email },
            },
          },
        }),
      });
      return await res.json();
    } catch {
      return { received: true, simulated: true };
    }
  },
};
