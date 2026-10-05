import {
  UserProfile,
  PlanItem,
  GalleryPhoto,
  CuratedSharedAlbum,
  ScriptureVerse,
  ThoughtEntry,
  RecipeItem,
} from '../types';
import {
  DEFAULT_USER_PROFILE,
  INITIAL_PHOTOS,
  INITIAL_SHARED_ALBUMS,
  SCRIPTURE_COLLECTION,
  INITIAL_THOUGHTS,
  INITIAL_RECIPES,
} from '../data/initialData';

const KEYS = {
  PROFILE: 'hearth_user_profile',
  PLANS: 'hearth_plans',
  PHOTOS: 'hearth_photos',
  SHARED_ALBUMS: 'hearth_shared_albums',
  SCRIPTURES: 'hearth_scriptures',
  THOUGHTS: 'hearth_thoughts',
  RECIPES: 'hearth_recipes',
};

export const storage = {
  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      return data ? { ...DEFAULT_USER_PROFILE, ...JSON.parse(data) } : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch {}
  },

  getPlans(): PlanItem[] {
    try {
      const data = localStorage.getItem(KEYS.PLANS);
      return data ? JSON.parse(data) : [
        {
          id: 'plan-1',
          title: 'Morning devotion & hot spiced tea',
          category: 'Devotion',
          completed: true,
          time: '07:30 AM',
          reminderEnabled: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'plan-2',
          title: 'Bake honey sourdough artisan loaf',
          category: 'Home',
          completed: false,
          time: '10:00 AM',
          reminderEnabled: true,
          reminderTime: '09:55 AM',
          notes: 'Preheat cast-iron Dutch oven to 450°F.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'plan-3',
          title: 'Afternoon walk through the park trail',
          category: 'Family',
          completed: false,
          time: '03:30 PM',
          reminderEnabled: false,
          createdAt: new Date().toISOString(),
        },
      ];
    } catch {
      return [];
    }
  },

  savePlans(plans: PlanItem[]): void {
    try {
      localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
    } catch {}
  },

  getPhotos(): GalleryPhoto[] {
    try {
      const data = localStorage.getItem(KEYS.PHOTOS);
      return data ? JSON.parse(data) : INITIAL_PHOTOS;
    } catch {
      return INITIAL_PHOTOS;
    }
  },

  savePhotos(photos: GalleryPhoto[]): void {
    try {
      localStorage.setItem(KEYS.PHOTOS, JSON.stringify(photos));
    } catch {}
  },

  getSharedAlbums(): CuratedSharedAlbum[] {
    try {
      const data = localStorage.getItem(KEYS.SHARED_ALBUMS);
      return data ? JSON.parse(data) : INITIAL_SHARED_ALBUMS;
    } catch {
      return INITIAL_SHARED_ALBUMS;
    }
  },

  saveSharedAlbums(albums: CuratedSharedAlbum[]): void {
    try {
      localStorage.setItem(KEYS.SHARED_ALBUMS, JSON.stringify(albums));
    } catch {}
  },

  getScriptures(): ScriptureVerse[] {
    try {
      const data = localStorage.getItem(KEYS.SCRIPTURES);
      return data ? JSON.parse(data) : SCRIPTURE_COLLECTION;
    } catch {
      return SCRIPTURE_COLLECTION;
    }
  },

  saveScriptures(scriptures: ScriptureVerse[]): void {
    try {
      localStorage.setItem(KEYS.SCRIPTURES, JSON.stringify(scriptures));
    } catch {}
  },

  getThoughts(): ThoughtEntry[] {
    try {
      const data = localStorage.getItem(KEYS.THOUGHTS);
      return data ? JSON.parse(data) : INITIAL_THOUGHTS;
    } catch {
      return INITIAL_THOUGHTS;
    }
  },

  saveThoughts(thoughts: ThoughtEntry[]): void {
    try {
      localStorage.setItem(KEYS.THOUGHTS, JSON.stringify(thoughts));
    } catch {}
  },

  getRecipes(): RecipeItem[] {
    try {
      const data = localStorage.getItem(KEYS.RECIPES);
      return data ? JSON.parse(data) : INITIAL_RECIPES;
    } catch {
      return INITIAL_RECIPES;
    }
  },

  saveRecipes(recipes: RecipeItem[]): void {
    try {
      localStorage.setItem(KEYS.RECIPES, JSON.stringify(recipes));
    } catch {}
  },

  exportFullBackup(): string {
    const backup = {
      profile: this.getProfile(),
      plans: this.getPlans(),
      photos: this.getPhotos(),
      sharedAlbums: this.getSharedAlbums(),
      scriptures: this.getScriptures(),
      thoughts: this.getThoughts(),
      recipes: this.getRecipes(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) this.saveProfile(data.profile);
      if (data.plans) this.savePlans(data.plans);
      if (data.photos) this.savePhotos(data.photos);
      if (data.sharedAlbums) this.saveSharedAlbums(data.sharedAlbums);
      if (data.scriptures) this.saveScriptures(data.scriptures);
      if (data.thoughts) this.saveThoughts(data.thoughts);
      if (data.recipes) this.saveRecipes(data.recipes);
      return true;
    } catch {
      return false;
    }
  },
};
