import React from 'react';
import {
  ActiveTab,
  PlanItem,
  GalleryPhoto,
  CuratedSharedAlbum,
  ScriptureVerse,
  ThoughtEntry,
  RecipeItem,
  UserProfile,
} from '../types';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Heart,
  BookOpen,
  Clock,
  Utensils,
  Feather,
  Sliders,
  Trophy,
  Music,
  Flower2,
  Layout,
  Palette,
  ExternalLink,
  Plus,
  BellRing,
  ShieldCheck,
  Images,
} from 'lucide-react';
import { TeamLogo } from './TeamLogo';
import { DailyScripture } from './DailyScripture';

interface HomeViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  plans: PlanItem[];
  onTogglePlan: (id: string) => void;
  photos: GalleryPhoto[];
  sharedAlbums?: CuratedSharedAlbum[];
  dailyVerse: ScriptureVerse;
  onNextVerse: () => void;
  thoughts: ThoughtEntry[];
  recipes: RecipeItem[];
  onSelectPhotoForEditor: (photo: GalleryPhoto) => void;
  userProfile: UserProfile;
  onOpenPersonalize: (tab?: 'general' | 'teams' | 'music' | 'flower' | 'appearance') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  plans,
  onTogglePlan,
  photos,
  sharedAlbums = [],
  dailyVerse,
  onNextVerse,
  thoughts,
  recipes,
  userProfile,
  onOpenPersonalize,
}) => {
  const completedCount = plans.filter((p) => p.completed).length;
  const recentThoughts = thoughts.slice(0, 1)[0];
  const featuredRecipe = recipes[0];
  const favoritePhotos = photos.filter((p) => p.isFavorite).slice(0, 3);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const upcomingReminders = plans.filter((p) => p.reminderEnabled && !p.completed);

  return (
    <div className="space-y-10 py-2 sm:py-6">
      
      {/* Editorial Welcome Header - Prominently displaying "Your Daily Sanctuary" (no greeting) */}
      <section className="text-center max-w-2xl mx-auto space-y-3 px-2">
        <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-[#9A897B] font-medium">
          <span>{formattedDate}</span>
          <span aria-hidden="true">·</span>
          <span>Adriana's</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#2D231C] text-balance">
          Your Daily Sanctuary
        </h1>
        <p className="text-sm sm:text-base text-[#6C5E53] leading-relaxed font-prose-serif max-w-xl mx-auto italic">
          “{userProfile.sanctuaryFocus || 'A tender, unhurried space for your plans, the faces you cherish, warm recipes, and moments of quiet steadying.'}”
        </p>

        {/* Customized Space Quick Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => onOpenPersonalize('teams')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#524438] bg-white border border-[#E8DFD3] rounded-full hover:border-[#B84A2A] hover:text-[#B84A2A] transition-all shadow-xs"
          >
            <Trophy className="w-3.5 h-3.5 text-[#B84A2A]" />
            <span>Sports Teams & Logos</span>
            {userProfile.sportsTeams.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#FAF2ED] text-[#B84A2A] text-[10px] font-bold flex items-center justify-center">
                {userProfile.sportsTeams.length}
              </span>
            )}
          </button>

          <button
            onClick={() => onOpenPersonalize('music')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#524438] bg-white border border-[#E8DFD3] rounded-full hover:border-[#B84A2A] hover:text-[#B84A2A] transition-all shadow-xs"
          >
            <Music className="w-3.5 h-3.5 text-[#B84A2A]" />
            <span>Favorite Music</span>
            {userProfile.favoriteMusic.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#FAF2ED] text-[#B84A2A] text-[10px] font-bold flex items-center justify-center">
                {userProfile.favoriteMusic.length}
              </span>
            )}
          </button>

          <button
            onClick={() => onOpenPersonalize('flower')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#524438] bg-white border border-[#E8DFD3] rounded-full hover:border-[#B84A2A] hover:text-[#B84A2A] transition-all shadow-xs"
          >
            <Flower2 className="w-3.5 h-3.5 text-[#B84A2A]" />
            <span>Flower Wallpaper</span>
          </button>

          <button
            onClick={() => onOpenPersonalize('general')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#524438] bg-white border border-[#E8DFD3] rounded-full hover:border-[#B84A2A] hover:text-[#B84A2A] transition-all shadow-xs"
          >
            <Layout className="w-3.5 h-3.5 text-[#B84A2A]" />
            <span>Daily Layout</span>
          </button>

          <button
            onClick={() => onOpenPersonalize('appearance')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#524438] bg-white border border-[#E8DFD3] rounded-full hover:border-[#B84A2A] hover:text-[#B84A2A] transition-all shadow-xs"
          >
            <Palette className="w-3.5 h-3.5 text-[#B84A2A]" />
            <span>Theme & Fonts</span>
          </button>
        </div>
      </section>

      {/* Active Sports Teams & Music Shelf Showcase (if customized) */}
      {(userProfile.sportsTeams.length > 0 || userProfile.favoriteMusic.length > 0) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sports Teams Showcase with Official Logos */}
          {userProfile.sportsTeams.length > 0 && (
            <div className="bg-white border border-[#EADBCC] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B84A2A] flex items-center gap-1.5">
                  <Trophy className="w-4 h-4" />
                  <span>My Sports Teams ({userProfile.sportsTeams.length})</span>
                </span>
                <button
                  onClick={() => onOpenPersonalize('teams')}
                  className="text-xs font-medium text-[#B84A2A] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Manage Teams</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {userProfile.sportsTeams.map((teamName) => {
                  const isBroncos = teamName.toLowerCase().includes('bronco');
                  return (
                    <div
                      key={teamName}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                        isBroncos
                          ? 'bg-[#FAF7F2] border-[#FB4F14]/50 shadow-xs'
                          : 'bg-[#FAF7F2] border-[#E8DFD3]'
                      }`}
                    >
                      <TeamLogo teamName={teamName} className="w-8 h-8 rounded-md shrink-0 shadow-2xs" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-[#2D231C] truncate">
                            {teamName}
                          </span>
                        </div>
                        {isBroncos && (
                          <span className="text-[10px] font-bold text-[#FB4F14] block">
                            Adriana's Favorite Team
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Favorite Music Shelf */}
          {userProfile.favoriteMusic.length > 0 && (
            <div className="bg-white border border-[#EADBCC] rounded-2xl p-4 sm:p-5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#B84A2A] flex items-center gap-1.5">
                  <Music className="w-4 h-4" />
                  <span>My Music Shelf ({userProfile.favoriteMusic.length})</span>
                </span>
                <button
                  onClick={() => onOpenPersonalize('music')}
                  className="text-xs text-[#8F7F72] hover:text-[#B84A2A]"
                >
                  Manage
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {userProfile.favoriteMusic.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs"
                  >
                    <span className="font-semibold text-[#2D231C]">{track.title}</span>
                    <span className="text-[11px] text-[#736558]">{track.artist}</span>
                    {track.url && (
                      <a
                        href={track.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#B84A2A] hover:underline flex items-center"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Up-front Daily Planner & Reminder Widget (Featured if Planner-First or if reminders active) */}
      {(userProfile.dailyLayout === 'planner-first' || upcomingReminders.length > 0) && (
        <section className="bg-white border border-[#EADBCC] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#B84A2A]" />
              <h2 className="font-serif text-lg font-semibold text-[#2D231C]">
                Today's Schedule & Reminders
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('plan')}
              className="text-xs font-medium text-[#B84A2A] hover:underline"
            >
              Open Full Planner →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {plans.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onTogglePlan(item.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-2.5 ${
                  item.completed ? 'bg-[#FAF7F2] border-[#ECE4D8] opacity-75' : 'bg-white border-[#E8DFD3] hover:border-[#B84A2A]'
                }`}
              >
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-4 h-4 text-[#BDB0A2] shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium truncate ${item.completed ? 'line-through text-[#9E9084]' : 'text-[#2D231C]'}`}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#8F7F72] mt-0.5">
                    <span>{item.category}</span>
                    {item.time && <span>· {item.time}</span>}
                    {item.reminderEnabled && item.reminderTime && (
                      <span className="text-[#B84A2A] font-semibold flex items-center gap-0.5">
                        <BellRing className="w-2.5 h-2.5" />
                        {item.reminderTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily Inspirational Scripture Component */}
      <DailyScripture
        initialVerse={dailyVerse}
        onExploreAll={() => setActiveTab('scripture')}
      />

      {/* The 6 Core Spaces Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Today's Plan */}
        <div
          onClick={() => setActiveTab('plan')}
          className="group cursor-pointer bg-white border border-[#EADBCC] rounded-2xl p-6 transition-all hover:border-[#C4B29E] hover:shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#8E7E70]">
              <span className="font-medium text-[#2D231C] group-hover:text-[#B84A2A] transition-colors flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#B84A2A]" />
                Daily Planner & Reminders
              </span>
              <span>
                {completedCount} of {plans.length} done
              </span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#2D231C]">
              {plans.length === 0 ? 'Quiet Day Ahead' : 'Daily Schedule & Reminders'}
            </h3>
            <p className="text-xs text-[#706256] leading-relaxed">
              Plan times, set chime alerts, and adjust tasks smoothly throughout your day.
            </p>

            {/* Quick snippet list */}
            <div className="space-y-2 pt-2">
              {plans.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePlan(item.id);
                  }}
                  className="flex items-center gap-2 text-xs py-1 px-2 rounded-md hover:bg-[#FAF7F2] transition-colors"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-[#BDB0A2] shrink-0" />
                  )}
                  <span
                    className={`truncate ${
                      item.completed ? 'line-through text-[#9E9084]' : 'text-[#3D322A]'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.time && (
                    <span className="text-[10px] text-[#8F7F72] ml-auto shrink-0 font-mono">
                      {item.time}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#F5ECE1] flex items-center justify-between text-xs font-medium text-[#B84A2A]">
            <span>Open Planner & Reminders</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Curated Shared Albums (Zero Hosting Liability) */}
        <div
          onClick={() => setActiveTab('gallery')}
          className="group cursor-pointer bg-white border border-[#EADBCC] rounded-2xl p-6 transition-all hover:border-[#C4B29E] hover:shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#8E7E70]">
              <span className="font-medium text-[#2D231C] group-hover:text-[#B84A2A] transition-colors flex items-center gap-1.5">
                <Images className="w-4 h-4 text-[#B84A2A]" />
                Family Albums
              </span>
              <span className="text-[#059669] font-medium text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero Liability
              </span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#2D231C]">
              Curated Shared Albums
            </h3>
            <p className="text-xs text-[#706256] leading-relaxed">
              Curated family albums linked directly to Google Photos and Apple iCloud. Zero hosting liability and safe for social bio links.
            </p>

            {/* Thumbnail preview strip */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {(sharedAlbums.length > 0 ? sharedAlbums.slice(0, 3) : favoritePhotos).map((item, idx) => {
                const imgUrl = 'coverImageUrl' in item ? item.coverImageUrl : item.dataUrl;
                const title = item.title;
                const provider = 'provider' in item ? item.provider : null;
                return (
                  <div
                    key={'id' in item ? item.id : idx}
                    className="relative aspect-square rounded-lg overflow-hidden bg-[#F3ECE2] border border-[#EADBCC] group/thumb"
                  >
                    <img
                      src={imgUrl}
                      alt={title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                    />
                    {provider && (
                      <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white bg-black/60 px-1 py-0.2 rounded-xs">
                        {provider.includes('Google') ? 'Google' : 'Apple'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#F5ECE1] flex items-center justify-between text-xs font-medium text-[#B84A2A]">
            <span>Open Shared Albums ({sharedAlbums.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Photo Editor */}
        <div
          onClick={() => setActiveTab('editor')}
          className="group cursor-pointer bg-white border border-[#EADBCC] rounded-2xl p-6 transition-all hover:border-[#C4B29E] hover:shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#8E7E70]">
              <span className="font-medium text-[#2D231C] group-hover:text-[#B84A2A] transition-colors flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#B84A2A]" />
                Photo Editor
              </span>
              <span>Golden warmth & filters</span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#2D231C]">
              Warmth & Canvas Filters
            </h3>
            <p className="text-xs text-[#706256] leading-relaxed">
              Adjust warmth, brightness, contrast, soft vintage grain, and download in high resolution.
            </p>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#F0E6D9] text-xs text-[#6C5E53] space-y-1.5">
              <div className="flex justify-between">
                <span>Warmth & Sepia</span>
                <span className="font-mono text-[#B84A2A]">+Warmth</span>
              </div>
              <div className="flex justify-between">
                <span>Presets</span>
                <span className="text-[#8E7E70]">Golden Hour · Linen · Film</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#F5ECE1] flex items-center justify-between text-xs font-medium text-[#B84A2A]">
            <span>Open Photo Editor</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Scripture */}
        <div
          onClick={() => setActiveTab('scripture')}
          className="group cursor-pointer bg-white border border-[#EADBCC] rounded-2xl p-6 transition-all hover:border-[#C4B29E] hover:shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#8E7E70]">
              <span className="font-medium text-[#2D231C] group-hover:text-[#B84A2A] transition-colors flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#B84A2A]" />
                Scripture Library
              </span>
              <span>Verses for every season</span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#2D231C]">
              Steadying Verses
            </h3>
            <p className="text-xs text-[#706256] leading-relaxed">
              Curated collections for Peace, Strength, Rest, and Hope. Add your own favorites anytime.
            </p>

            <div className="pt-1 text-xs text-[#6B5A4E] italic font-serif border-l-2 border-[#D9C8B5] pl-3 py-1">
              “Be still, and know that I am God.”
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-[#F5ECE1] flex items-center justify-between text-xs font-medium text-[#B84A2A]">
            <span>Read Verses</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 5: Thoughts & Experiences */}
        <div
          onClick={() => setActiveTab('thoughts')}
          className="group cursor-pointer bg-white border border-[#EADBCC] rounded-2xl p-6 transition-all hover:border-[#C4B29E] hover:shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#8E7E70]">
              <span className="font-medium text-[#2D231C] group-hover:text-[#B84A2A] transition-colors flex items-center gap-1.5">
                <Feather className="w-4 h-4 text-[#B84A2A]" />
                Thoughts & Experiences
              </span>
              <span>{thoughts.length} kept entries</span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#2D231C]">
              Upload Personal Experiences
            </h3>
            <p className="text-xs text-[#706256] leading-relaxed">
              Record personal memories, attach photos, track moods, and keep quiet gratitude.
            </p>

            {recentThoughts ? (
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#F0E6D9] text-xs text-[#6C5E53] line-clamp-2">
                “{recentThoughts.content}”
              </div>
            ) : (
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#F0E6D9] text-xs text-[#8E7E70]">
                Write your first quiet experience or attach a photo...
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-[#F5ECE1] flex items-center justify-between text-xs font-medium text-[#B84A2A]">
            <span>Open Experiences Journal</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 6: Recipes */}
        <div
          onClick={() => setActiveTab('recipes')}
          className="group cursor-pointer bg-white border border-[#EADBCC] rounded-2xl p-6 transition-all hover:border-[#C4B29E] hover:shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#8E7E70]">
              <span className="font-medium text-[#2D231C] group-hover:text-[#B84A2A] transition-colors flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-[#B84A2A]" />
                Family Recipes
              </span>
              <span>{recipes.length} dishes</span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#2D231C]">
              The Meals Your Family Loves
            </h3>
            <p className="text-xs text-[#706256] leading-relaxed">
              Step-by-step cooking checklists, Sunday suppers, warm breads, and baking memories.
            </p>

            {featuredRecipe && (
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#F0E6D9] text-xs space-y-1">
                <div className="font-medium text-[#2D231C] truncate">
                  {featuredRecipe.title}
                </div>
                <div className="text-[#8E7E70] flex items-center gap-2">
                  <span>{featuredRecipe.category}</span>
                  <span>·</span>
                  <span>{featuredRecipe.cookTime}</span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-2 border-t border-[#F5ECE1] flex items-center justify-between text-xs font-medium text-[#B84A2A]">
            <span>Browse Recipes</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </section>

      {/* Loving Footer Note */}
      <section className="text-center py-6 border-t border-[#E8DFD3] text-[#7A6C60] text-xs font-serif italic space-y-1">
        <p>“Where you are, there is home and warm light.”</p>
      </section>
    </div>
  );
};
