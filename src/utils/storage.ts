import { PlanItem, GalleryPhoto, ScriptureVerse, ThoughtEntry, RecipeItem, UserProfile, SportsTeam } from '../types';
import { INITIAL_PLANS, INITIAL_PHOTOS, SCRIPTURE_COLLECTION, INITIAL_THOUGHTS, INITIAL_RECIPES } from '../data/initialData';

const KEYS = {
  PLANS: 'hearth_plans_v1',
  PHOTOS: 'hearth_photos_v1',
  SCRIPTURES: 'hearth_scriptures_v1',
  THOUGHTS: 'hearth_thoughts_v1',
  RECIPES: 'hearth_recipes_v1',
  SETTINGS: 'hearth_settings_v1',
  PROFILE: 'adrianas_profile_v1',
};

export const storage = {
  getProfile(): UserProfile {
    const defaults: UserProfile = {
      name: 'Adriana',
      sanctuaryFocus: 'A quiet, unhurried space for daily peace and gentle intentions',
      sportsTeams: [
        {
          id: 'team-broncos',
          name: 'Denver Broncos',
          league: 'NFL',
          logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png',
          primaryColor: '#002244',
          secondaryColor: '#FB4F14',
          notes: "Adriana's favorite team · Mile High pride",
        },
      ],
      favoriteMusic: [
        { id: 'track-1', title: 'Peace Like a River', artist: 'Acoustic Hymn' },
        { id: 'track-2', title: 'Morning Light', artist: 'Instrumental Piano' },
      ],
      favoriteFlower: 'wild-rose',
      fontLayout: 'serif',
      wallpaperTheme: 'linen',
      dailyLayout: 'standard',
      reminderSoundEnabled: true,
    };
    try {
      const data = localStorage.getItem(KEYS.PROFILE);
      if (!data) return defaults;
      const parsed = JSON.parse(data);
      let teams = parsed.sportsTeams || defaults.sportsTeams;
      if (Array.isArray(teams) && !teams.some((t: SportsTeam) => t.name.toLowerCase().includes('bronco'))) {
        teams = [defaults.sportsTeams[0], ...teams.filter((t: SportsTeam) => !t.name.toLowerCase().includes('chiefs'))];
      }
      return {
        ...defaults,
        ...parsed,
        sportsTeams: teams,
        favoriteMusic: parsed.favoriteMusic || defaults.favoriteMusic,
        favoriteFlower: parsed.favoriteFlower || defaults.favoriteFlower,
        fontLayout: parsed.fontLayout || defaults.fontLayout,
        wallpaperTheme: parsed.wallpaperTheme || defaults.wallpaperTheme,
        dailyLayout: parsed.dailyLayout || defaults.dailyLayout,
      };
    } catch {
      return defaults;
    }
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Error saving profile to storage', e);
    }
  },

  getPlans(): PlanItem[] {
    try {
      const data = localStorage.getItem(KEYS.PLANS);
      return data ? JSON.parse(data) : INITIAL_PLANS;
    } catch {
      return INITIAL_PLANS;
    }
  },

  savePlans(plans: PlanItem[]): void {
    try {
      localStorage.setItem(KEYS.PLANS, JSON.stringify(plans));
    } catch (e) {
      console.error('Error saving plans to storage', e);
    }
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
    } catch (e) {
      console.error('Error saving photos to storage', e);
    }
  },

  getScriptures(): ScriptureVerse[] {
    try {
      const data = localStorage.getItem(KEYS.SCRIPTURES);
      return data ? JSON.parse(data) : SCRIPTURE_COLLECTION;
    } catch {
      return SCRIPTURE_COLLECTION;
    }
  },

  saveScriptures(verses: ScriptureVerse[]): void {
    try {
      localStorage.setItem(KEYS.SCRIPTURES, JSON.stringify(verses));
    } catch (e) {
      console.error('Error saving scriptures to storage', e);
    }
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
    } catch (e) {
      console.error('Error saving thoughts to storage', e);
    }
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
    } catch (e) {
      console.error('Error saving recipes to storage', e);
    }
  },

  exportAllData(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      plans: this.getPlans(),
      photos: this.getPhotos(),
      scriptures: this.getScriptures(),
      thoughts: this.getThoughts(),
      recipes: this.getRecipes(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.profile) this.saveProfile(parsed.profile);
      if (parsed.plans) this.savePlans(parsed.plans);
      if (parsed.photos) this.savePhotos(parsed.photos);
      if (parsed.scriptures) this.saveScriptures(parsed.scriptures);
      if (parsed.thoughts) this.saveThoughts(parsed.thoughts);
      if (parsed.recipes) this.saveRecipes(parsed.recipes);
      return true;
    } catch (e) {
      console.error('Failed to import backup data', e);
      return false;
    }
  },

  resetAll(): void {
    try {
      localStorage.removeItem(KEYS.PROFILE);
      localStorage.removeItem(KEYS.PLANS);
      localStorage.removeItem(KEYS.PHOTOS);
      localStorage.removeItem(KEYS.SCRIPTURES);
      localStorage.removeItem(KEYS.THOUGHTS);
      localStorage.removeItem(KEYS.RECIPES);
    } catch (e) {
      console.error('Reset error', e);
    }
  },
};
