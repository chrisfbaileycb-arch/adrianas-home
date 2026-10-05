import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  UserRole,
  PlanItem,
  GalleryPhoto,
  CuratedSharedAlbum,
  ScriptureVerse,
  ThoughtEntry,
  RecipeItem,
  UserProfile,
  TenantSanctuary,
} from './types';
import { storage } from './utils/storage';
import { tenantApi, DEFAULT_TENANT } from './utils/tenantApi';
import { testFirestoreConnection, auth } from './firebase';
import {
  signInWithGoogle,
  signOutUser,
  subscribeToAuth,
} from './services/firebaseAuth';
import {
  subscribeToTenant,
  saveTenantToFirestore,
  updateTenantThemeInFirestore,
  updateTenantPinInFirestore,
} from './services/firebaseTenants';
import {
  subscribeToRecipes,
  addRecipeToFirestore,
  deleteRecipeFromFirestore,
  toggleFavoriteRecipeInFirestore,
  subscribeToAlbums,
  addAlbumToFirestore,
  toggleFavoriteAlbumInFirestore,
  subscribeToScriptures,
  addScriptureToFirestore,
  deleteScriptureFromFirestore,
  subscribeToThoughts,
  addThoughtToFirestore,
  deleteThoughtFromFirestore,
  subscribeToPlanner,
  addPlannerItemToFirestore,
  togglePlannerItemInFirestore,
  deletePlannerItemFromFirestore,
} from './services/firebaseSync';

import { Navbar } from './components/Navbar';
import { TenantBar } from './components/TenantBar';
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
import { OwnerOnboarding } from './components/OwnerOnboarding';
import { SubscribeModal } from './components/SubscribeModal';
import { FlywheelModal } from './components/FlywheelModal';
import { PinModal } from './components/PinModal';
import { FlowerWallpaperBackdrop } from './components/FlowerWallpaperBackdrop';
import { BellRing, Check, X } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [personalizeTab, setPersonalizeTab] = useState<
    'general' | 'teams' | 'music' | 'flower' | 'appearance'
  >('appearance');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [isFlywheelOpen, setIsFlywheelOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Multi-Tenant state
  const [currentSlug, setCurrentSlug] = useState<string>(() => tenantApi.getSlugFromUrl());
  const [currentTenant, setCurrentTenant] = useState<TenantSanctuary>(DEFAULT_TENANT);
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');

  // Front Porch Lock State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      const slug = tenantApi.getSlugFromUrl();
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'owner') return true;
      return sessionStorage.getItem(`hearth_unlocked_${slug}`) === 'true';
    } catch {
      return true;
    }
  });

  // Firebase Auth & Cloud Sync States
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);

  // Application Data States
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storage.getProfile());
  const [plans, setPlans] = useState<PlanItem[]>(() => storage.getPlans());
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() => storage.getPhotos());
  const [sharedAlbums, setSharedAlbums] = useState<CuratedSharedAlbum[]>(() =>
    storage.getSharedAlbums()
  );
  const [scriptures, setScriptures] = useState<ScriptureVerse[]>(() => storage.getScriptures());
  const [thoughts, setThoughts] = useState<ThoughtEntry[]>(() => storage.getThoughts());
  const [recipes, setRecipes] = useState<RecipeItem[]>(() => storage.getRecipes());
  const [scriptureIndex, setScriptureIndex] = useState(0);
  const [editorInitialPhoto, setEditorInitialPhoto] = useState<GalleryPhoto | null>(null);
  const [activeAlert, setActiveAlert] = useState<PlanItem | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');

  // Check Notification permission
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

  // 1. Initial Firestore connection test & Auth listener
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsCloudSynced(connected);
    });

    const unsubscribeAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user && currentTenant.ownerId === user.uid) {
        setCurrentRole('owner');
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [currentTenant.ownerId]);

  // Load tenant details from API or local fallback
  useEffect(() => {
    let isMounted = true;
    tenantApi.fetchTenant(currentSlug).then((tenant) => {
      if (isMounted && tenant) {
        setCurrentTenant(tenant);
        const isOwner = tenantApi.checkIsOwner(tenant.slug, tenant.ownerId);
        setCurrentRole(isOwner ? 'owner' : 'guest');
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentSlug]);

  // Real-time Firestore synchronizer for current sanctuary tenant & collections
  useEffect(() => {
    if (!currentSlug) return;
    const clean = currentSlug.toLowerCase().replace(/^@/, '');
    const unsubs: (() => void)[] = [];

    unsubs.push(
      subscribeToTenant(clean, (cloudTenant) => {
        setCurrentTenant(cloudTenant);
      })
    );

    unsubs.push(
      subscribeToRecipes(clean, (cloudRecipes) => {
        setRecipes(cloudRecipes);
        storage.saveRecipes(cloudRecipes);
      })
    );

    unsubs.push(
      subscribeToAlbums(clean, (cloudAlbums) => {
        setSharedAlbums(cloudAlbums);
        storage.saveSharedAlbums(cloudAlbums);
      })
    );

    unsubs.push(
      subscribeToScriptures(clean, (cloudScriptures) => {
        setScriptures(cloudScriptures);
        storage.saveScriptures(cloudScriptures);
      })
    );

    unsubs.push(
      subscribeToThoughts(clean, (cloudThoughts) => {
        setThoughts(cloudThoughts);
        storage.saveThoughts(cloudThoughts);
      })
    );

    unsubs.push(
      subscribeToPlanner(clean, (cloudPlanner) => {
        setPlans(cloudPlanner);
        storage.savePlans(cloudPlanner);
      })
    );

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [currentSlug]);

  // Sync typography & theme classes directly to the body
  useEffect(() => {
    document.body.className = `antialiased font-choice-${userProfile.fontLayout} theme-${userProfile.wallpaperTheme}`;
    document.documentElement.style.setProperty('--accent', userProfile.accentColor || '#B84A2A');
  }, [userProfile.fontLayout, userProfile.wallpaperTheme, userProfile.accentColor]);

  // Show onboarding for owners
  useEffect(() => {
    if (isUnlocked && currentRole === 'owner') {
      const flag = localStorage.getItem(`hearth_onboard_done_${currentSlug}`);
      setShowOnboarding(flag !== 'true');
    } else {
      setShowOnboarding(false);
    }
  }, [isUnlocked, currentRole, currentSlug]);

  // Reminder alert interval check
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMins}`;

      plans.forEach((plan) => {
        if (
          plan.reminderEnabled &&
          plan.reminderTime === currentTimeStr &&
          !plan.completed &&
          !plan.reminderTriggered
        ) {
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification("Daily Reminder · Hearth", {
                body: plan.title,
              });
            } catch {}
          }
          setActiveAlert(plan);
          setPlans((prev) =>
            prev.map((p) => (p.id === plan.id ? { ...p, reminderTriggered: true } : p))
          );
        }
      });
    };

    const intervalId = window.setInterval(checkReminders, 20000);
    checkReminders();
    return () => clearInterval(intervalId);
  }, [plans]);

  // Data reload
  const handleDataReloaded = () => {
    setUserProfile(storage.getProfile());
    setPlans(storage.getPlans());
    setPhotos(storage.getPhotos());
    setSharedAlbums(storage.getSharedAlbums());
    setScriptures(storage.getScriptures());
    setThoughts(storage.getThoughts());
    setRecipes(storage.getRecipes());
  };

  // Auth Handlers
  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.warn('Google sign-in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  };

  // Porch Unlock
  const handlePorchUnlock = async (pin: string): Promise<boolean> => {
    const ok = await tenantApi.verifyPin(currentSlug, pin);
    if (ok) {
      try {
        sessionStorage.setItem(`hearth_unlocked_${currentSlug}`, 'true');
      } catch {}
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  const handleLockPorch = () => {
    try {
      sessionStorage.removeItem(`hearth_unlocked_${currentSlug}`);
    } catch {}
    setIsUnlocked(false);
  };

  // Plan handlers
  const handleAddPlan = (newPlan: Omit<PlanItem, 'id' | 'createdAt'>) => {
    const item: PlanItem = {
      ...newPlan,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPlans((prev) => [item, ...prev]);
    storage.savePlans([item, ...plans]);
    addPlannerItemToFirestore(currentSlug, newPlan).catch(() => {});
  };

  const handleTogglePlan = (id: string) => {
    let nextCompleted = false;
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          nextCompleted = !p.completed;
          return { ...p, completed: nextCompleted };
        }
        return p;
      })
    );
    togglePlannerItemInFirestore(currentSlug, id, nextCompleted).catch(() => {});
  };

  const handleDeletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    deletePlannerItemFromFirestore(currentSlug, id).catch(() => {});
  };

  const handleClearCompletedPlans = () => {
    setPlans((prev) => prev.filter((p) => !p.completed));
  };

  // Album handlers
  const handleAddSharedAlbum = (newAlbum: Omit<CuratedSharedAlbum, 'id'>) => {
    const item: CuratedSharedAlbum = {
      ...newAlbum,
      id: `album-${Date.now()}`,
    };
    setSharedAlbums((prev) => [item, ...prev]);
    storage.saveSharedAlbums([item, ...sharedAlbums]);
    addAlbumToFirestore(currentSlug, newAlbum).catch(() => {});
  };

  const handleToggleFavoriteAlbum = (id: string) => {
    let nextFav = false;
    setSharedAlbums((prev) =>
      prev.map((album) => {
        if (album.id === id) {
          nextFav = !album.isFavorite;
          return { ...album, isFavorite: nextFav };
        }
        return album;
      })
    );
    toggleFavoriteAlbumInFirestore(currentSlug, id, nextFav).catch(() => {});
  };

  const handleDeleteSharedAlbum = (id: string) => {
    setSharedAlbums((prev) => prev.filter((album) => album.id !== id));
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
    storage.saveScriptures([item, ...scriptures]);
    addScriptureToFirestore(currentSlug, newVerse).catch(() => {});
  };

  // Thoughts handlers
  const handleAddThought = (newThought: Omit<ThoughtEntry, 'id'>) => {
    const entry: ThoughtEntry = {
      ...newThought,
      id: `th-${Date.now()}`,
    };
    setThoughts((prev) => [entry, ...prev]);
    storage.saveThoughts([entry, ...thoughts]);
    addThoughtToFirestore(currentSlug, newThought).catch(() => {});
  };

  const handleDeleteThought = (id: string) => {
    setThoughts((prev) => prev.filter((t) => t.id !== id));
    deleteThoughtFromFirestore(currentSlug, id).catch(() => {});
  };

  // Recipe handlers
  const handleAddRecipe = (newRecipe: Omit<RecipeItem, 'id'>) => {
    const rec: RecipeItem = {
      ...newRecipe,
      id: `rec-${Date.now()}`,
    };
    setRecipes((prev) => [rec, ...prev]);
    storage.saveRecipes([rec, ...recipes]);
    addRecipeToFirestore(currentSlug, newRecipe).catch(() => {});
  };

  const handleToggleFavoriteRecipe = (id: string) => {
    let nextFav = false;
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          nextFav = !r.isFavorite;
          return { ...r, isFavorite: nextFav };
        }
        return r;
      })
    );
    toggleFavoriteRecipeInFirestore(currentSlug, id, nextFav).catch(() => {});
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    deleteRecipeFromFirestore(currentSlug, id).catch(() => {});
  };

  // Profile save
  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    storage.saveProfile(newProfile);
  };

  const handleSavePin = async (newPin: string) => {
    await tenantApi.updateTenant(currentSlug, { familyPin: newPin } as any);
    await updateTenantPinInFirestore(currentSlug, newPin);
  };

  const currentDailyVerse = scriptures[scriptureIndex % scriptures.length] || scriptures[0];

  // If locked, render Front Porch Keypad
  if (!isUnlocked) {
    return (
      <FrontPorchView
        sanctuaryName={currentTenant.sanctuaryName || "Adriana's Home"}
        slug={currentSlug}
        onUnlock={handlePorchUnlock}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative selection:bg-[#F2D7CA] selection:text-[#2D231C]">
      
      {/* Botanical Wallpaper Motif */}
      <FlowerWallpaperBackdrop flower={userProfile.favoriteFlower} />

      {/* Owner Top Strip Bar */}
      <TenantBar
        currentTenant={currentTenant}
        currentRole={currentRole}
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
        onOpenFlywheel={() => setIsFlywheelOpen(true)}
        onSwitchTenant={(slug) => {
          window.location.href = `/@${slug}?role=owner`;
        }}
        onLockPorch={handleLockPorch}
        onChangePin={() => setIsPinModalOpen(true)}
      />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenPersonalize={() => {
          setPersonalizeTab('appearance');
          setIsPersonalizeOpen(true);
        }}
        onLockPorch={handleLockPorch}
        userName={currentTenant.sanctuaryName || userProfile.name}
        currentRole={currentRole}
        modulesEnabled={currentTenant.modulesEnabled}
        currentUser={currentUser}
        onSignInGoogle={handleSignInGoogle}
        onSignOut={handleSignOut}
        isCloudSynced={isCloudSynced}
      />

      {/* Audible Chime / In-App Notification Toast */}
      {activeAlert && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white border border-[#B84A2A] rounded-2xl p-4 shadow-xl animate-in slide-in-from-top">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="p-2 rounded-xl bg-[#FAF2ED] text-[#B84A2A]">
                <BellRing className="w-5 h-5 animate-bounce" />
              </span>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#B84A2A] tracking-wider">
                  Reminder Chime
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
              onClick={() => {
                handleTogglePlan(activeAlert.id);
                setActiveAlert(null);
              }}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-[#059669] hover:bg-[#047857] rounded-lg shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Complete</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content View */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4 pb-12 z-10 relative">
        
        {/* Guided Owner Onboarding */}
        {showOnboarding && (
          <div className="mb-8">
            <OwnerOnboarding
              slug={currentSlug}
              onOpenPersonalizeTab={(tab) => {
                setPersonalizeTab(tab);
                setIsPersonalizeOpen(true);
              }}
              onDismiss={() => setShowOnboarding(false)}
            />
          </div>
        )}

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
            onSelectPhotoForEditor={(p) => {
              setEditorInitialPhoto(p);
              setActiveTab('editor');
            }}
            userProfile={userProfile}
            onOpenPersonalize={(tab) => {
              if (tab) setPersonalizeTab(tab);
              setIsPersonalizeOpen(true);
            }}
          />
        )}

        {activeTab === 'plan' && (
          <PlanView
            plans={plans}
            onAddPlan={handleAddPlan}
            onTogglePlan={handleTogglePlan}
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
            onSaveToGallery={(p) => {
              setPhotos((prev) => [p, ...prev]);
              storage.savePhotos([p, ...photos]);
            }}
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
            currentRole={currentRole}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipesView
            recipes={recipes}
            onAddRecipe={handleAddRecipe}
            onToggleFavoriteRecipe={handleToggleFavoriteRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            currentRole={currentRole}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPersonalize={() => {
          setPersonalizeTab('appearance');
          setIsPersonalizeOpen(true);
        }}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      {/* Modals */}
      <PersonalizeModal
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        initialTab={personalizeTab}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataReloaded={handleDataReloaded}
      />

      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        currentSlug={currentSlug}
      />

      <FlywheelModal
        isOpen={isFlywheelOpen}
        onClose={() => setIsFlywheelOpen(false)}
        slug={currentSlug}
      />

      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSavePin={handleSavePin}
        currentSlug={currentSlug}
      />

    </div>
  );
}
