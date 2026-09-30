/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  PlanItem,
  GalleryPhoto,
  CuratedSharedAlbum,
  ScriptureVerse,
  ThoughtEntry,
  RecipeItem,
  UserProfile,
  TenantSanctuary,
  UserRole,
} from './types';
import { storage } from './utils/storage';
import { ambientSound } from './utils/audio';
import { tenantApi, DEFAULT_TENANT } from './utils/tenantApi';
import { Navbar } from './components/Navbar';
import { TenantBar } from './components/TenantBar';
import { SubscriptionModal } from './components/SubscriptionModal';
import { MicroAdFlywheelModal } from './components/MicroAdFlywheelModal';
import { FrontPorchView } from './components/FrontPorchView';
import { HomeView } from './components/HomeView';
import { PlanView } from './components/PlanView';
import { GalleryView } from './components/GalleryView';
import { EditorView } from './components/EditorView';
import { ScriptureView } from './components/ScriptureView';
import { ThoughtsView } from './components/ThoughtsView';
import { RecipesView } from './components/RecipesView';
import { Footer } from './components/Footer';
import { BackupModal } from './components/BackupModal';
import { PersonalizeModal } from './components/PersonalizeModal';
import { FlowerWallpaperBackdrop } from './components/FlowerWallpaperBackdrop';
import { BellRing, Check, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [personalizeTab, setPersonalizeTab] = useState<
    'general' | 'teams' | 'music' | 'flower' | 'appearance'
  >('general');

  // Multi-Tenant & Commercial Subscription state
  const [currentSlug, setCurrentSlug] = useState<string>(() => tenantApi.getSlugFromUrl());
  const [currentTenant, setCurrentTenant] = useState<TenantSanctuary>(DEFAULT_TENANT);
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isFlywheelOpen, setIsFlywheelOpen] = useState(false);

  // Load tenant details from API or local fallback
  useEffect(() => {
    let isMounted = true;
    tenantApi.fetchTenant(currentSlug).then((tenant) => {
      if (isMounted && tenant) {
        setCurrentTenant(tenant);
        const isOwner = tenantApi.checkIsOwner(tenant.slug, tenant.ownerId);
        setCurrentRole(isOwner ? 'owner' : 'guest');

        // Apply active theme presets if applicable
        if (tenant.activeTheme === 'lofi_dark') {
          setUserProfile((p) => ({ ...p, wallpaperTheme: 'midnight-warmth', fontLayout: 'mono' }));
        } else if (tenant.activeTheme === 'sage_garden') {
          setUserProfile((p) => ({ ...p, wallpaperTheme: 'sage', favoriteFlower: 'lavender' }));
        } else if (tenant.activeTheme === 'retro_y2k') {
          setUserProfile((p) => ({ ...p, wallpaperTheme: 'rose-mist', fontLayout: 'sans' }));
        } else if (tenant.activeTheme === 'modern_lounge') {
          setUserProfile((p) => ({ ...p, wallpaperTheme: 'modern-lounge', fontLayout: 'mono', favoriteFlower: 'none' }));
        } else if (tenant.activeTheme === 'neutral_keepsake') {
          setUserProfile((p) => ({ ...p, wallpaperTheme: 'neutral-keepsake', fontLayout: 'newsreader', favoriteFlower: 'olive-branch' }));
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentSlug]);

  const handleSwitchTenant = (slug: string) => {
    const clean = slug.toLowerCase().replace(/^@/, '');
    setCurrentSlug(clean);
    const newPath = `/@${clean}`;
    window.history.pushState({}, '', newPath);
  };

  const handleSwitchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    tenantApi.setOwnerMode(currentSlug, newRole === 'owner', currentTenant.ownerId);
  };

  const handleUpdatePin = async (newPin: string) => {
    await tenantApi.updateTenant(currentSlug, { familyPin: newPin });
  };

  // Guest Front Porch Lock State (persisted per session)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      const slug = tenantApi.getSlugFromUrl();
      return (
        sessionStorage.getItem(`hearth_unlocked_${slug}`) === 'true' ||
        sessionStorage.getItem('adrianas_porch_unlocked') === 'true'
      );
    } catch {
      return false;
    }
  });

  // User Profile for customizable personal space
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storage.getProfile());

  // Core application data loaded from LocalStorage
  const [plans, setPlans] = useState<PlanItem[]>(() => storage.getPlans());
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => storage.getPhotos());
  const [sharedAlbums, setSharedAlbums] = useState<CuratedSharedAlbum[]>(() =>
    storage.getSharedAlbums()
  );
  const [scriptures, setScriptures] = useState<ScriptureVerse[]>(() => storage.getScriptures());
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>(() => storage.getThoughts());
  const [recipes, setRecipes] = useState<RecipeItem[]>(() => storage.getRecipes());

  // Navigation context for photo editor
  const [editorInitialPhoto, setEditorInitialPhoto] = useState<GalleryPhoto | null>(null);

  // Scripture index
  const [scriptureIndex, setScriptureIndex] = useState(0);

  // Active Reminder Alert state
  const [activeAlert, setActiveAlert] = useState<PlanItem | null>(null);

  // Notification permission state
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }
  }, []);

  const handleRequestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setNotificationPermission(perm);
      });
    }
  };

  // Sync typography & theme classes directly to the body
  useEffect(() => {
    document.body.className = `antialiased font-choice-${userProfile.fontLayout} theme-${userProfile.wallpaperTheme}`;
  }, [userProfile.fontLayout, userProfile.wallpaperTheme]);

  // Sync to localStorage
  useEffect(() => {
    storage.saveProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    storage.savePlans(plans);
  }, [plans]);

  useEffect(() => {
    storage.savePhotos(photos);
  }, [photos]);

  useEffect(() => {
    storage.saveSharedAlbums(sharedAlbums);
  }, [sharedAlbums]);

  useEffect(() => {
    storage.saveScriptures(scriptures);
  }, [scriptures]);

  useEffect(() => {
    storage.saveThoughts(thoughts);
  }, [thoughts]);

  useEffect(() => {
    storage.saveRecipes(recipes);
  }, [recipes]);

  // Background Daily Planner & Reminder Engine
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;

      plans.forEach((plan) => {
        if (
          plan.reminderEnabled &&
          plan.reminderTime &&
          !plan.completed &&
          !plan.reminderTriggered
        ) {
          if (plan.reminderTime === currentTime) {
            // Trigger Reminder chime
            if (userProfile.reminderSoundEnabled) {
              ambientSound.playChime();
            }

            // Browser Notification
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('Daily Reminder · Adrianas', {
                  body: plan.title,
                });
              } catch {
                // ignore
              }
            }

            // In-app alert
            setActiveAlert(plan);

            // Mark reminderTriggered to avoid loop this minute
            setPlans((prev) =>
              prev.map((p) => (p.id === plan.id ? { ...p, reminderTriggered: true } : p))
            );
          }
        }
      });
    };

    const intervalId = window.setInterval(checkReminders, 20000);
    checkReminders();
    return () => clearInterval(intervalId);
  }, [plans, userProfile.reminderSoundEnabled]);

  // Handle reloads when user restores backup
  const handleDataReloaded = () => {
    setUserProfile(storage.getProfile());
    setPlans(storage.getPlans());
    setPhotos(storage.getPhotos());
    setSharedAlbums(storage.getSharedAlbums());
    setScriptures(storage.getScriptures());
    setThoughts(storage.getThoughts());
    setRecipes(storage.getRecipes());
  };

  // Plan handlers
  const handleAddPlan = (newPlan: Omit<PlanItem, 'id' | 'createdAt'>) => {
    const item: PlanItem = {
      ...newPlan,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPlans((prev) => [item, ...prev]);
  };

  const handleTogglePlan = (id: string) => {
    setPlans((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
    if (activeAlert && activeAlert.id === id) {
      setActiveAlert(null);
    }
  };

  const handleUpdatePlan = (id: string, updates: Partial<PlanItem>) => {
    setPlans((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeletePlan = (id: string) => {
    setPlans((prev) => prev.filter((item) => item.id !== id));
    if (activeAlert && activeAlert.id === id) {
      setActiveAlert(null);
    }
  };

  const handleClearCompletedPlans = () => {
    setPlans((prev) => prev.filter((item) => !item.completed));
  };

  // Photo handlers
  const handleAddPhotos = (newPhotos: GalleryPhoto[]) => {
    setPhotos((prev) => [...newPhotos, ...prev]);
  };

  const handleToggleFavoritePhoto = (id: string) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id ? { ...photo, isFavorite: !photo.isFavorite } : photo
      )
    );
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== id));
  };

  const handleEditPhotoInCanvas = (photo: GalleryPhoto) => {
    setEditorInitialPhoto(photo);
    setActiveTab('editor');
  };

  const handleSaveToGalleryFromEditor = (newPhoto: GalleryPhoto) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  // Curated Shared Album handlers (Zero Hosting Liability)
  const handleAddSharedAlbum = (newAlbum: Omit<CuratedSharedAlbum, 'id'>) => {
    const item: CuratedSharedAlbum = {
      ...newAlbum,
      id: `album-${Date.now()}`,
    };
    setSharedAlbums((prev) => [item, ...prev]);
  };

  const handleToggleFavoriteAlbum = (id: string) => {
    setSharedAlbums((prev) =>
      prev.map((album) =>
        album.id === id ? { ...album, isFavorite: !album.isFavorite } : album
      )
    );
  };

  const handleDeleteSharedAlbum = (id: string) => {
    setSharedAlbums((prev) => prev.filter((album) => album.id !== id));
  };

  const handleLockPorch = () => {
    try {
      sessionStorage.removeItem('adrianas_porch_unlocked');
    } catch {}
    setIsUnlocked(false);
  };

  // Scripture handlers
  const handleNextVerse = () => {
    setScriptureIndex((prev) => (prev + 1) % scriptures.length);
  };

  const handleToggleFavoriteVerse = (id: string) => {
    setScriptures((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isFavorite: !v.isFavorite } : v))
    );
  };

  const handleAddVerse = (newVerse: Omit<ScriptureVerse, 'id'>) => {
    const item: ScriptureVerse = {
      ...newVerse,
      id: `v-${Date.now()}`,
    };
    setScriptures((prev) => [item, ...prev]);
  };

  // Thoughts handlers
  const handleAddThought = (newThought: Omit<ThoughtEntry, 'id'>) => {
    const entry: ThoughtEntry = {
      ...newThought,
      id: `th-${Date.now()}`,
    };
    setThoughts((prev) => [entry, ...prev]);
  };

  const handleDeleteThought = (id: string) => {
    setThoughts((prev) => prev.filter((t) => t.id !== id));
  };

  // Recipe handlers
  const handleAddRecipe = (newRecipe: Omit<RecipeItem, 'id'>) => {
    const recipe: RecipeItem = {
      ...newRecipe,
      id: `rec-${Date.now()}`,
    };
    setRecipes((prev) => [recipe, ...prev]);
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleFavoriteRecipe = (id: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  const handleOpenPersonalizeWithTab = (tab?: 'general' | 'teams' | 'music' | 'flower' | 'appearance') => {
    if (tab) setPersonalizeTab(tab);
    setIsPersonalizeOpen(true);
  };

  const currentDailyVerse = scriptures[scriptureIndex % (scriptures.length || 1)] || scriptures[0];

  // Guest Front-Door Passcode Gate (Aesthetic Front Porch for Social Media Bio Links)
  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
        <TenantBar
          currentTenant={currentTenant}
          currentRole={currentRole}
          onSwitchTenant={handleSwitchTenant}
          onSwitchRole={handleSwitchRole}
          onOpenSubscribe={() => setIsSubscribeOpen(true)}
          onUpdatePin={handleUpdatePin}
          onOpenFlywheel={() => setIsFlywheelOpen(true)}
        />
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
          <FrontPorchView
            onUnlock={() => setIsUnlocked(true)}
            sanctuaryName={currentTenant.sanctuaryName}
            sanctuaryFocus={userProfile.sanctuaryFocus}
            slug={currentTenant.slug}
          />
        </div>
        <SubscriptionModal
          isOpen={isSubscribeOpen}
          onClose={() => setIsSubscribeOpen(false)}
          onTenantCreated={(newSlug) => {
            handleSwitchTenant(newSlug);
            setCurrentRole('owner');
            setIsUnlocked(true);
          }}
        />
        <MicroAdFlywheelModal
          isOpen={isFlywheelOpen}
          onClose={() => setIsFlywheelOpen(false)}
          tenantSlug={currentTenant.slug}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-500">
      
      {/* Commercial Multi-Tenant Control & Switcher Bar */}
      <TenantBar
        currentTenant={currentTenant}
        currentRole={currentRole}
        onSwitchTenant={handleSwitchTenant}
        onSwitchRole={handleSwitchRole}
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
        onUpdatePin={handleUpdatePin}
        onOpenFlywheel={() => setIsFlywheelOpen(true)}
      />

      {/* Flower Wallpaper Background Motif */}
      <FlowerWallpaperBackdrop flower={userProfile.favoriteFlower} />

      {/* In-App Active Reminder Floating Alert */}
      {activeAlert && (
        <div className="fixed top-24 right-4 sm:right-8 z-50 bg-white border-2 border-[#B84A2A] rounded-2xl p-4 shadow-2xl max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-full bg-[#FAF2ED] text-[#B84A2A] shrink-0 mt-0.5">
                <BellRing className="w-4 h-4 animate-bounce" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B84A2A]">
                  Daily Reminder Alert ({activeAlert.reminderTime})
                </span>
                <p className="text-sm font-semibold text-[#2D231C]">{activeAlert.title}</p>
                {activeAlert.notes && (
                  <p className="text-xs text-[#736558] italic">{activeAlert.notes}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveAlert(null)}
              className="p-1 text-[#8F7F72] hover:text-[#2D231C]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-3 mt-3 border-t border-[#F5ECE1] flex items-center justify-end gap-2">
            <button
              onClick={() => setActiveAlert(null)}
              className="px-3 py-1 text-xs text-[#736558] hover:text-[#2D231C]"
            >
              Dismiss
            </button>
            <button
              onClick={() => handleTogglePlan(activeAlert.id)}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-[#059669] hover:bg-[#047857] rounded-lg shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Complete</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenPersonalize={() => handleOpenPersonalizeWithTab('general')}
        onLockPorch={handleLockPorch}
        userName={currentTenant.sanctuaryName || userProfile.name}
        currentRole={currentRole}
        modulesEnabled={currentTenant.modulesEnabled}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4 pb-12 z-10 relative">
        {activeTab === 'home' && (
          <HomeView
            setActiveTab={setActiveTab}
            plans={plans}
            onTogglePlan={handleTogglePlan}
            photos={photos}
            sharedAlbums={sharedAlbums}
            dailyVerse={currentDailyVerse}
            onNextVerse={handleNextVerse}
            thoughts={thoughts}
            recipes={recipes}
            onSelectPhotoForEditor={handleEditPhotoInCanvas}
            userProfile={userProfile}
            onOpenPersonalize={handleOpenPersonalizeWithTab}
          />
        )}

        {activeTab === 'plan' && (
          <PlanView
            plans={plans}
            onAddPlan={handleAddPlan}
            onTogglePlan={handleTogglePlan}
            onUpdatePlan={handleUpdatePlan}
            onDeletePlan={handleDeletePlan}
            onClearCompleted={handleClearCompletedPlans}
            onRequestNotificationPermission={handleRequestNotificationPermission}
            notificationPermission={notificationPermission}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryView
            sharedAlbums={sharedAlbums}
            onAddSharedAlbum={handleAddSharedAlbum}
            onToggleFavoriteAlbum={handleToggleFavoriteAlbum}
            onDeleteSharedAlbum={handleDeleteSharedAlbum}
            onOpenEditor={() => setActiveTab('editor')}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'editor' && (
          <EditorView
            initialPhoto={editorInitialPhoto}
            onSaveToGallery={handleSaveToGalleryFromEditor}
            galleryPhotos={photos}
          />
        )}

        {activeTab === 'scripture' && (
          <ScriptureView
            verses={scriptures}
            currentVerseIndex={scriptureIndex}
            onNextVerse={handleNextVerse}
            onToggleFavoriteVerse={handleToggleFavoriteVerse}
            onAddVerse={handleAddVerse}
            currentRole={currentRole}
          />
        )}

        {activeTab === 'thoughts' && (
          <ThoughtsView
            thoughts={thoughts}
            onAddThought={handleAddThought}
            onDeleteThought={handleDeleteThought}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipesView
            recipes={recipes}
            onAddRecipe={handleAddRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            onToggleFavoriteRecipe={handleToggleFavoriteRecipe}
            currentRole={currentRole}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onOpenBackup={() => setIsBackupOpen(true)} />

      {/* Privacy & Safe Backup Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataReloaded={handleDataReloaded}
      />

      {/* Personal Space Studio Modal */}
      <PersonalizeModal
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        profile={userProfile}
        onSaveProfile={setUserProfile}
        initialTab={personalizeTab}
      />

      {/* Commercial Stripe Multi-Tenant Subscription Modal ($5/mo or $40/yr) */}
      <SubscriptionModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        onTenantCreated={(newSlug) => {
          handleSwitchTenant(newSlug);
          setCurrentRole('owner');
          setIsUnlocked(true);
        }}
      />

      {/* Micro-Ad Flywheel & Creator Growth Modal ($10 Tests & Reinvestment) */}
      <MicroAdFlywheelModal
        isOpen={isFlywheelOpen}
        onClose={() => setIsFlywheelOpen(false)}
        tenantSlug={currentTenant.slug}
      />
    </div>
  );
}
