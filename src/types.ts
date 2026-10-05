export type ActiveTab = 'home' | 'plan' | 'gallery' | 'editor' | 'scripture' | 'thoughts' | 'recipes';

export type UserRole = 'owner' | 'guest';

export interface PlanItem {
  id: string;
  title: string;
  category: 'Home' | 'Family' | 'Errand' | 'Health' | 'Devotion' | 'Quiet';
  completed: boolean;
  time?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  reminderTriggered?: boolean;
  notes?: string;
  createdAt: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  dataUrl: string;
  date: string;
  caption?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface CuratedSharedAlbum {
  id: string;
  title: string;
  provider: 'Google Photos' | 'Apple iCloud' | 'Dropbox' | 'OneDrive' | 'Family Vault';
  albumUrl: string;
  coverImageUrl: string;
  photoCount: number | string;
  date: string;
  caption?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface ScriptureVerse {
  id: string;
  verse: string;
  reference: string;
  category: 'Peace' | 'Strength' | 'Comfort' | 'Family & Love' | 'Gratitude' | 'Rest';
  reflection?: string;
  isFavorite?: boolean;
}

export interface ThoughtEntry {
  id: string;
  date: string;
  title?: string;
  content: string;
  prompt?: string;
  tag?: string;
  photoUrl?: string;
  mood?: string;
  createdAt?: string;
}

export interface RecipeItem {
  id: string;
  title: string;
  category: 'Baking & Sweets' | 'Family Dinners' | 'Soups & Stews' | 'Sides & Salads' | 'Hearth Traditions';
  prepTime: string;
  cookTime: string;
  servings: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  memoryNote?: string;
  isFavorite?: boolean;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url?: string;
}

export interface UserProfile {
  name: string;
  sanctuaryFocus: string;
  favoriteFlower: 'lavender' | 'wild-rose' | 'sunflower' | 'olive-branch' | 'daisy' | 'none';
  fontLayout: 'serif' | 'newsreader' | 'sans' | 'mono';
  wallpaperTheme: 'linen' | 'parchment' | 'rose-mist' | 'sage' | 'midnight-warmth' | 'modern-lounge' | 'neutral-keepsake';
  accentColor: string;
  dailyLayout: 'standard' | 'planner-first' | 'journal-first' | 'gallery-focus';
  reminderSoundEnabled: boolean;
  sportsTeams: string[];
  favoriteMusic: MusicTrack[];
}

export interface TenantSanctuary {
  slug: string;
  ownerId: string;
  sanctuaryName: string;
  activeTheme: 'sanctuary_warm' | 'sage_garden' | 'lofi_dark' | 'retro_y2k' | 'modern_lounge' | 'neutral_keepsake';
  modulesEnabled: string[];
  outboundLinks: Record<string, string>;
  subscriptionStatus: 'active' | 'trial' | 'past_due' | 'canceled';
  planType: 'monthly' | 'yearly';
  ownerEmail?: string;
  createdAt: string;
}
