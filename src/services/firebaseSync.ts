import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import {
  RecipeItem,
  CuratedSharedAlbum,
  ScriptureVerse,
  ThoughtEntry,
  PlanItem,
} from '../types';

/* =========================================================================
   1. RECIPES WORKFLOWS
   ========================================================================= */

export function subscribeToRecipes(
  slug: string,
  onUpdate: (recipes: RecipeItem[]) => void,
  fallbackData?: RecipeItem[]
): () => void {
  const recipesColRef = collection(db, 'tenants', slug, 'recipes');

  return onSnapshot(
    recipesColRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => ({
          ...(d.data() as RecipeItem),
          id: d.id,
        }));
        onUpdate(items);
      } else if (fallbackData && fallbackData.length > 0) {
        onUpdate(fallbackData);
      }
    },
    (error) => {
      console.warn(`Firestore recipes listener failed for ${slug}:`, error.message);
      if (fallbackData) onUpdate(fallbackData);
    }
  );
}

export async function addRecipeToFirestore(
  slug: string,
  recipe: Omit<RecipeItem, 'id'>
): Promise<RecipeItem> {
  const recipeId = `recipe-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const path = `tenants/${slug}/recipes/${recipeId}`;
  const authorId = auth.currentUser?.uid || 'community-hearth';

  const fullRecipe: RecipeItem = {
    ...recipe,
    id: recipeId,
  };

  try {
    const docRef = doc(db, 'tenants', slug, 'recipes', recipeId);
    await setDoc(docRef, {
      ...fullRecipe,
      tenantSlug: slug,
      authorId,
      createdAt: new Date().toISOString(),
    });
    return fullRecipe;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteRecipeFromFirestore(slug: string, recipeId: string): Promise<void> {
  const path = `tenants/${slug}/recipes/${recipeId}`;
  try {
    const docRef = doc(db, 'tenants', slug, 'recipes', recipeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function toggleFavoriteRecipeInFirestore(
  slug: string,
  recipeId: string,
  isFavorite: boolean
): Promise<void> {
  const path = `tenants/${slug}/recipes/${recipeId}`;
  try {
    const docRef = doc(db, 'tenants', slug, 'recipes', recipeId);
    await updateDoc(docRef, { isFavorite });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/* =========================================================================
   2. CURATED SHARED ALBUMS WORKFLOWS
   ========================================================================= */

export function subscribeToAlbums(
  slug: string,
  onUpdate: (albums: CuratedSharedAlbum[]) => void,
  fallbackData?: CuratedSharedAlbum[]
): () => void {
  const albumsColRef = collection(db, 'tenants', slug, 'albums');

  return onSnapshot(
    albumsColRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => ({
          ...(d.data() as CuratedSharedAlbum),
          id: d.id,
        }));
        onUpdate(items);
      } else if (fallbackData && fallbackData.length > 0) {
        onUpdate(fallbackData);
      }
    },
    (error) => {
      console.warn(`Firestore albums listener failed for ${slug}:`, error.message);
      if (fallbackData) onUpdate(fallbackData);
    }
  );
}

export async function addAlbumToFirestore(
  slug: string,
  album: Omit<CuratedSharedAlbum, 'id'>
): Promise<CuratedSharedAlbum> {
  const albumId = `album-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const path = `tenants/${slug}/albums/${albumId}`;
  const authorId = auth.currentUser?.uid || 'community-hearth';

  const fullAlbum: CuratedSharedAlbum = {
    ...album,
    id: albumId,
  };

  try {
    const docRef = doc(db, 'tenants', slug, 'albums', albumId);
    await setDoc(docRef, {
      ...fullAlbum,
      tenantSlug: slug,
      authorId,
      createdAt: new Date().toISOString(),
    });
    return fullAlbum;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleFavoriteAlbumInFirestore(
  slug: string,
  albumId: string,
  isFavorite: boolean
): Promise<void> {
  const path = `tenants/${slug}/albums/${albumId}`;
  try {
    const docRef = doc(db, 'tenants', slug, 'albums', albumId);
    await updateDoc(docRef, { isFavorite });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/* =========================================================================
   3. SCRIPTURES WORKFLOWS
   ========================================================================= */

export function subscribeToScriptures(
  slug: string,
  onUpdate: (scriptures: ScriptureVerse[]) => void,
  fallbackData?: ScriptureVerse[]
): () => void {
  const scripturesColRef = collection(db, 'tenants', slug, 'scriptures');

  return onSnapshot(
    scripturesColRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => ({
          ...(d.data() as ScriptureVerse),
          id: d.id,
        }));
        onUpdate(items);
      } else if (fallbackData && fallbackData.length > 0) {
        onUpdate(fallbackData);
      }
    },
    (error) => {
      console.warn(`Firestore scriptures listener failed for ${slug}:`, error.message);
      if (fallbackData) onUpdate(fallbackData);
    }
  );
}

export async function addScriptureToFirestore(
  slug: string,
  scripture: Omit<ScriptureVerse, 'id'>
): Promise<ScriptureVerse> {
  const scriptureId = `verse-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const path = `tenants/${slug}/scriptures/${scriptureId}`;
  const authorId = auth.currentUser?.uid || 'community-hearth';

  const fullScripture: ScriptureVerse = {
    ...scripture,
    id: scriptureId,
  };

  try {
    const docRef = doc(db, 'tenants', slug, 'scriptures', scriptureId);
    await setDoc(docRef, {
      ...fullScripture,
      tenantSlug: slug,
      authorId,
      createdAt: new Date().toISOString(),
    });
    return fullScripture;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateScriptureInFirestore(
  slug: string,
  scriptureId: string,
  updates: Partial<ScriptureVerse>
): Promise<void> {
  const path = `tenants/${slug}/scriptures/${scriptureId}`;
  try {
    const docRef = doc(db, 'tenants', slug, 'scriptures', scriptureId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteScriptureFromFirestore(
  slug: string,
  scriptureId: string
): Promise<void> {
  const path = `tenants/${slug}/scriptures/${scriptureId}`;
  try {
    const docRef = doc(db, 'tenants', slug, 'scriptures', scriptureId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/* =========================================================================
   4. THOUGHT JOURNAL WORKFLOWS
   ========================================================================= */

export function subscribeToThoughts(
  slug: string,
  onUpdate: (thoughts: ThoughtEntry[]) => void,
  fallbackData?: ThoughtEntry[]
): () => void {
  const thoughtsColRef = collection(db, 'tenants', slug, 'thoughts');

  return onSnapshot(
    thoughtsColRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => ({
          ...(d.data() as ThoughtEntry),
          id: d.id,
        }));
        onUpdate(items);
      } else if (fallbackData && fallbackData.length > 0) {
        onUpdate(fallbackData);
      }
    },
    (error) => {
      console.warn(`Firestore thoughts listener failed for ${slug}:`, error.message);
      if (fallbackData) onUpdate(fallbackData);
    }
  );
}

export async function addThoughtToFirestore(
  slug: string,
  thought: Omit<ThoughtEntry, 'id'>
): Promise<ThoughtEntry> {
  const thoughtId = `thought-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const path = `tenants/${slug}/thoughts/${thoughtId}`;
  const authorId = auth.currentUser?.uid || 'community-hearth';

  const fullThought: ThoughtEntry = {
    ...thought,
    id: thoughtId,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'tenants', slug, 'thoughts', thoughtId);
    await setDoc(docRef, {
      ...fullThought,
      tenantSlug: slug,
      authorId,
    });
    return fullThought;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteThoughtFromFirestore(slug: string, thoughtId: string): Promise<void> {
  const path = `tenants/${slug}/thoughts/${thoughtId}`;
  try {
    const docRef = doc(db, 'tenants', slug, 'thoughts', thoughtId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/* =========================================================================
   5. DAILY PLANNER WORKFLOWS
   ========================================================================= */

export function subscribeToPlanner(
  slug: string,
  onUpdate: (items: PlanItem[]) => void,
  fallbackData?: PlanItem[]
): () => void {
  const plannerColRef = collection(db, 'tenants', slug, 'planner');

  return onSnapshot(
    plannerColRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map((d) => ({
          ...(d.data() as PlanItem),
          id: d.id,
        }));
        onUpdate(items);
      } else if (fallbackData && fallbackData.length > 0) {
        onUpdate(fallbackData);
      }
    },
    (error) => {
      console.warn(`Firestore planner listener failed for ${slug}:`, error.message);
      if (fallbackData) onUpdate(fallbackData);
    }
  );
}

export async function addPlannerItemToFirestore(
  slug: string,
  item: Omit<PlanItem, 'id' | 'createdAt'>
): Promise<PlanItem> {
  const itemId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const path = `tenants/${slug}/planner/${itemId}`;
  const authorId = auth.currentUser?.uid || 'community-hearth';

  const fullItem: PlanItem = {
    ...item,
    id: itemId,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'tenants', slug, 'planner', itemId);
    await setDoc(docRef, {
      ...fullItem,
      tenantSlug: slug,
      authorId,
      createdAt: new Date().toISOString(),
    });
    return fullItem;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function togglePlannerItemInFirestore(
  slug: string,
  itemId: string,
  completed: boolean
): Promise<void> {
  const path = `tenants/${slug}/planner/${itemId}`;
  try {
    const docRef = doc(db, 'tenants', slug, 'planner', itemId);
    await updateDoc(docRef, { completed });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deletePlannerItemFromFirestore(
  slug: string,
  itemId: string
): Promise<void> {
  const path = `tenants/${slug}/planner/${itemId}`;
  try {
    const docRef = doc(db, 'tenants', slug, 'planner', itemId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
