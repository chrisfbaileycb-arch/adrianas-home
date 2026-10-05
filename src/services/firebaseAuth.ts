import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleAuthProvider } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { UserProfile } from '../types';

export interface AuthUserState {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Signs in user with Google popup
 */
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const credential = await signInWithPopup(auth, googleAuthProvider);
    const user = credential.user;

    // Synchronize user profile into Firestore /users/{uid}
    if (user) {
      await syncUserProfileToFirestore(user);
    }
    return user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return null;
    }
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Signs out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

/**
 * Sync user profile to Firestore
 */
export async function syncUserProfileToFirestore(
  user: FirebaseUser,
  customProfile?: Partial<UserProfile>
): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userDocRef);

    if (!existing.exists()) {
      await setDoc(userDocRef, {
        userId: user.uid,
        name: user.displayName || 'Family Member',
        email: user.email || '',
        sanctuaryFocus: customProfile?.sanctuaryFocus || 'Warmth, devotion, and family traditions',
        favoriteFlower: customProfile?.favoriteFlower || 'wild-rose',
        fontLayout: customProfile?.fontLayout || 'serif',
        wallpaperTheme: customProfile?.wallpaperTheme || 'linen',
        dailyLayout: customProfile?.dailyLayout || 'standard',
        reminderSoundEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else if (customProfile) {
      await setDoc(
        userDocRef,
        {
          ...customProfile,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to Auth State changes
 */
export function subscribeToAuth(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}
