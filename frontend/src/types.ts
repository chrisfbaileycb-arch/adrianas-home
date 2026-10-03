export interface PlanItem {
  id: string;
  title: string;
  category: 'Morning' | 'Afternoon' | 'Evening' | 'Anytime';
  time?: string; // e.g. "09:00 AM" or "14:30"
  reminderTime?: string; // Time to trigger browser & in-app reminder
  reminderEnabled?: boolean;
  reminderTriggered?: boolean;
  completed: boolean;
  priority?: 'gentle' | 'important';
  notes?: string;
  createdAt: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  dataUrl: string;
  date: string;
  caption?: string;
  tags: string[];
  isFavorite: boolean;
}

export interface CuratedSharedAlbum {
  id: string;
  title: string;
  provider: 'Google Photos' | 'Apple iCloud' | 'Amazon Photos' | 'OneDrive' | 'Dropbox';
  albumUrl: string; // Outbound link e.g. photos.app.goo.gl/... or shared.icloud.com/...
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
  photoUrl?: string; // Attached photo to personal experience
  mood?: string;
  createdAt?: string;
}

export interface RecipeItem {
  id: string;
  title: string;
  category: 'Breakfast' | 'Family Dinner' | 'Baking & Sweets' | 'Soups & Stews' | 'Sunday Supper' | 'Tradition';
  prepTime: string;
  cookTime: string;
  servings: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  notes?: string;
  imageUrl?: string;
  isFavorite?: boolean;
}

export interface SportsTeam {
  id: string;
  name: string;
  league: string; // NFL, MLB, NBA, Soccer, College, WNBA, etc.
  logoUrl?: string; // Image URL of actual team logo
  primaryColor?: string;
  secondaryColor?: string;
  notes?: string; // Next game, favorite player, or watch note
}

export interface FavoriteTrack {
  id: string;
  title: string;
  artist: string;
  url?: string;
  mood?: string;
}

export type FlowerWallpaper =
  | 'wild-rose'
  | 'lavender'
  | 'sunflower'
  | 'peony'
  | 'jasmine'
  | 'daisy'
  | 'cherry-blossom'
  | 'olive-branch'
  | 'none';

export type FontChoice = 'serif' | 'newsreader' | 'sans' | 'mono';

export type DailyLayoutChoice = 'standard' | 'planner-first' | 'journal-first' | 'gallery-focus';

export type WallpaperBackground =
  | 'linen'
  | 'parchment'
  | 'rose-mist'
  | 'sage'
  | 'midnight-warmth'
  | 'modern-lounge'
  | 'neutral-keepsake';

export interface UserProfile {
  name: string;
  sanctuaryFocus?: string;
  sportsTeams: SportsTeam[];
  favoriteMusic: FavoriteTrack[];
  favoriteFlower: FlowerWallpaper;
  fontLayout: FontChoice;
  wallpaperTheme: WallpaperBackground;
  dailyLayout: DailyLayoutChoice;
  reminderSoundEnabled: boolean;
}

export type ActiveTab = 'home' | 'plan' | 'gallery' | 'editor' | 'scripture' | 'thoughts' | 'recipes';

export type UserRole = 'owner' | 'guest';

export interface TenantSanctuary {
  slug: string;             // e.g. "adriana"
  ownerId: string;
  sanctuaryName: string;    // "Adriana's Home"
  familyPinHash?: string;   // bcrypt-hashed 4-digit PIN (server-stored)
  activeTheme: string;      // "sanctuary_warm", "retro_y2k", "lofi_dark", etc.
  modulesEnabled: string[]; // ["scripture", "recipes", "albums", "music", "planner", "thoughts"]
  outboundLinks: {
    googlePhotosUrl?: string;
    customMusicUrl?: string;
    applePhotosUrl?: string;
  };
  subscriptionStatus?: 'active' | 'trialing' | 'canceled';
  planType?: 'monthly' | 'yearly'; // $5/mo or $40/yr
  ownerEmail?: string;
  createdAt?: string;
}

