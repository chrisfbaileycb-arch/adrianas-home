import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { TenantSanctuary } from '../types';
import { DEFAULT_TENANT } from '../utils/tenantApi';

/**
 * Real-time listener for a tenant document in Firestore
 */
export function subscribeToTenant(
  slug: string,
  onUpdate: (tenant: TenantSanctuary) => void,
  onError?: (error: Error) => void
): () => void {
  const cleanSlug = slug.toLowerCase().replace(/^@/, '');
  const tenantDocRef = doc(db, 'tenants', cleanSlug);

  return onSnapshot(
    tenantDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as TenantSanctuary;
        onUpdate({
          ...DEFAULT_TENANT,
          ...data,
          slug: cleanSlug,
        });
      }
    },
    (error) => {
      console.warn(`Firestore tenant listener for ${cleanSlug}:`, error.message);
      if (onError) onError(error);
    }
  );
}

/**
 * Fetch a single tenant by slug from Firestore
 */
export async function fetchTenantFromFirestore(slug: string): Promise<TenantSanctuary | null> {
  const cleanSlug = slug.toLowerCase().replace(/^@/, '');
  const path = `tenants/${cleanSlug}`;

  try {
    const tenantDocRef = doc(db, 'tenants', cleanSlug);
    const snap = await getDoc(tenantDocRef);

    if (snap.exists()) {
      return {
        ...DEFAULT_TENANT,
        ...(snap.data() as TenantSanctuary),
        slug: cleanSlug,
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save or Provision a new sanctuary in Firestore
 */
export async function saveTenantToFirestore(
  tenant: Partial<TenantSanctuary> & { slug: string; sanctuaryName: string }
): Promise<TenantSanctuary> {
  const cleanSlug = tenant.slug.toLowerCase().replace(/^@/, '');
  const path = `tenants/${cleanSlug}`;

  const currentUid = auth.currentUser?.uid || tenant.ownerId || `owner-${Date.now()}`;

  const fullTenant: TenantSanctuary = {
    ...DEFAULT_TENANT,
    ...tenant,
    slug: cleanSlug,
    ownerId: currentUid,
    activeTheme: tenant.activeTheme || 'sanctuary_warm',
    subscriptionStatus: tenant.subscriptionStatus || 'active',
    planType: tenant.planType || 'monthly',
    createdAt: tenant.createdAt || new Date().toISOString(),
  };

  try {
    const tenantDocRef = doc(db, 'tenants', cleanSlug);
    await setDoc(tenantDocRef, fullTenant, { merge: true });
    return fullTenant;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Update active theme for sanctuary in Firestore
 */
export async function updateTenantThemeInFirestore(
  slug: string,
  theme: TenantSanctuary['activeTheme']
): Promise<void> {
  const cleanSlug = slug.toLowerCase().replace(/^@/, '');
  const path = `tenants/${cleanSlug}`;

  try {
    const tenantDocRef = doc(db, 'tenants', cleanSlug);
    await updateDoc(tenantDocRef, {
      activeTheme: theme,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Update 4-digit PIN hash in Firestore
 */
export async function updateTenantPinInFirestore(slug: string, pinHash: string): Promise<void> {
  const cleanSlug = slug.toLowerCase().replace(/^@/, '');
  const path = `tenants/${cleanSlug}`;

  try {
    const tenantDocRef = doc(db, 'tenants', cleanSlug);
    await updateDoc(tenantDocRef, {
      pinHash,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Fetch all tenants from Firestore
 */
export async function listTenantsFromFirestore(): Promise<TenantSanctuary[]> {
  try {
    const colRef = collection(db, 'tenants');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      await saveTenantToFirestore(DEFAULT_TENANT);
      return [DEFAULT_TENANT];
    }
    return snap.docs.map((d) => ({
      ...DEFAULT_TENANT,
      ...(d.data() as TenantSanctuary),
      slug: d.id,
    }));
  } catch (error) {
    console.warn('Listing tenants from Firestore fallback:', error);
    return [DEFAULT_TENANT];
  }
}
