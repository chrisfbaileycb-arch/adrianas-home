import React, { useState, useRef, useEffect } from 'react';
import {
  UserProfile,
  SportsTeam,
  FavoriteTrack,
  FlowerWallpaper,
  FontChoice,
  WallpaperBackground,
  DailyLayoutChoice,
} from '../types';
import { PREDEFINED_TEAMS, PredefinedTeam } from '../data/sportsTeamsData';
import { MUSIC_LIBRARY, LibraryTrack } from '../data/musicLibrary';
import { TeamLogo } from './TeamLogo';
import {
  Sparkles,
  X,
  Check,
  Trophy,
  Music,
  Flower2,
  Type,
  Layout,
  Palette,
  Plus,
  Trash2,
  ExternalLink,
  Search,
  Upload,
  Image as ImageIcon,
  Play,
  Pause,
  Library,
} from 'lucide-react';

interface PersonalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  initialTab?: 'general' | 'teams' | 'music' | 'flower' | 'appearance';
}

export const PersonalizeModal: React.FC<PersonalizeModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  initialTab = 'general',
}) => {
  const [activeTab, setActiveTab] = useState<
    'general' | 'teams' | 'music' | 'flower' | 'appearance'
  >(initialTab);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Form states
  const [name, setName] = useState(profile.name || '');
  const [focus, setFocus] = useState(profile.sanctuaryFocus || '');
  const [sportsTeams, setSportsTeams] = useState<SportsTeam[]>(profile.sportsTeams || []);
  const [favoriteMusic, setFavoriteMusic] = useState<FavoriteTrack[]>(profile.favoriteMusic || []);
  const [favoriteFlower, setFavoriteFlower] = useState<FlowerWallpaper>(profile.favoriteFlower || 'wild-rose');
  const [fontLayout, setFontLayout] = useState<FontChoice>(profile.fontLayout || 'serif');
  const [wallpaperTheme, setWallpaperTheme] = useState<WallpaperBackground>(profile.wallpaperTheme || 'linen');
  const [dailyLayout, setDailyLayout] = useState<DailyLayoutChoice>(profile.dailyLayout || 'standard');
  const [reminderSoundEnabled, setReminderSoundEnabled] = useState(profile.reminderSoundEnabled ?? true);
  const [accentColor, setAccentColor] = useState(profile.accentColor || '#B84A2A');

  // Music library inline preview
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const togglePreview = (track: LibraryTrack) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setPlayingId(null);
    }
    const audio = audioRef.current;
    if (playingId === track.id) {
      audio.pause();
      setPlayingId(null);
      return;
    }
    audio.src = track.url;
    audio.play().then(() => setPlayingId(track.id)).catch(() => setPlayingId(null));
  };

  const addLibraryTrack = (track: LibraryTrack) => {
    if (favoriteMusic.some((m) => m.title.toLowerCase() === track.title.toLowerCase())) return;
    setFavoriteMusic([
      ...favoriteMusic,
      { id: `lib-${track.id}-${Date.now()}`, title: track.title, artist: track.artist, url: track.url, mood: track.mood, source: 'library' },
    ]);
  };

  const accentPresets = ['#B84A2A', '#7C3AED', '#0E7490', '#15803D', '#BE123C', '#B45309', '#1E3A8A', '#9333EA'];

  // Live accent preview — recolor the space instantly while the modal is open
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.setProperty('--accent', accentColor);
    }
  }, [accentColor, isOpen]);

  // Reset the edited accent to the saved value each time the studio opens
  useEffect(() => {
    if (isOpen) setAccentColor(profile.accentColor || '#B84A2A');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Cancel/close without saving: restore the last-saved accent
  const handleCancel = () => {
    document.documentElement.style.setProperty('--accent', profile.accentColor || '#B84A2A');
    onClose();
  };

  // Sports team search & filter
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [selectedLeagueFilter, setSelectedLeagueFilter] = useState<'ALL' | 'NFL' | 'NBA' | 'MLB' | 'College'>('ALL');
  const [showCustomTeamForm, setShowCustomTeamForm] = useState(false);

  // Custom team form states
  const [customTeamName, setCustomTeamName] = useState('');
  const [customTeamLeague, setCustomTeamLeague] = useState('NFL');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#002244');
  const [customSecondaryColor, setCustomSecondaryColor] = useState('#FB4F14');
  const [customTeamNotes, setCustomTeamNotes] = useState('');
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // New music track input
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackArtist, setNewTrackArtist] = useState('');
  const [newTrackUrl, setNewTrackUrl] = useState('');

  if (!isOpen) return null;

  // Add a team from the predefined library
  const handleAddPredefinedTeam = (team: PredefinedTeam) => {
    if (sportsTeams.some((t) => t.name.toLowerCase() === team.name.toLowerCase())) {
      return;
    }

    const newTeam: SportsTeam = {
      id: `team-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: team.name,
      league: team.league,
      logoUrl: team.logoUrl,
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
      notes: team.name === 'Denver Broncos' ? "Adriana's favorite team · Mile High pride" : undefined,
    };

    setSportsTeams([...sportsTeams, newTeam]);
  };

  // Add custom team
  const handleAddCustomTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTeamName.trim()) return;

    const team: SportsTeam = {
      id: `team-${Date.now()}`,
      name: customTeamName.trim(),
      league: customTeamLeague,
      logoUrl: customLogoUrl.trim() || undefined,
      primaryColor: customPrimaryColor,
      secondaryColor: customSecondaryColor,
      notes: customTeamNotes.trim() || undefined,
    };

    setSportsTeams([...sportsTeams, team]);
    setCustomTeamName('');
    setCustomLogoUrl('');
    setCustomTeamNotes('');
    setShowCustomTeamForm(false);
  };

  const handleCustomLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomLogoUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveTeam = (id: string) => {
    setSportsTeams(sportsTeams.filter((t) => t.id !== id));
  };

  const handleAddMusic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackTitle.trim()) return;

    const track: FavoriteTrack = {
      id: `track-${Date.now()}`,
      title: newTrackTitle.trim(),
      artist: newTrackArtist.trim() || 'Favorite Artist',
      url: newTrackUrl.trim() || undefined,
    };

    setFavoriteMusic([...favoriteMusic, track]);
    setNewTrackTitle('');
    setNewTrackArtist('');
    setNewTrackUrl('');
  };

  const handleRemoveMusic = (id: string) => {
    setFavoriteMusic(favoriteMusic.filter((m) => m.id !== id));
  };

  const handleSaveAll = () => {
    onSaveProfile({
      name: name.trim() || 'My Personal Expression Page',
      sanctuaryFocus: focus.trim() || 'A peaceful, unhurried space for daily plans and cherished memories.',
      sportsTeams,
      favoriteMusic,
      favoriteFlower,
      fontLayout,
      wallpaperTheme,
      dailyLayout,
      reminderSoundEnabled,
      accentColor,
    });
    onClose();
  };

  const flowerChoices: { id: FlowerWallpaper; name: string; desc: string }[] = [
    { id: 'wild-rose', name: 'Wild Rose', desc: 'Soft warm botanical rose blossoms' },
    { id: 'lavender', name: 'French Lavender', desc: 'Calming purple sprigs of wild lavender' },
    { id: 'sunflower', name: 'Golden Sunflower', desc: 'Warm amber petals and summer light' },
    { id: 'peony', name: 'Lush Peony', desc: 'Graceful layered pink blush blooms' },
    { id: 'jasmine', name: 'Star Jasmine', desc: 'Delicate soothing white star petals' },
    { id: 'daisy', name: 'Meadow Daisy', desc: 'Bright sunny field flowers' },
    { id: 'cherry-blossom', name: 'Cherry Blossom', desc: 'Soft floating sakura spring petals' },
    { id: 'olive-branch', name: 'Olive Branch', desc: 'Peaceful Mediterranean olive leaves' },
    { id: 'none', name: 'Clean (No Flowers)', desc: 'Pure neutral canvas without floral watermark' },
  ];

  const fontOptions: { id: FontChoice; label: string; preview: string }[] = [
    { id: 'serif', label: 'Classic Cormorant Serif', preview: 'Warm, timeless literary elegance' },
    { id: 'newsreader', label: 'Newsreader Editorial', preview: 'Refined editorial prose reading' },
    { id: 'sans', label: 'Clean Plus Jakarta Sans', preview: 'Crisp, contemporary readability' },
    { id: 'mono', label: 'Warm Monospace', preview: 'Organized typewriter aesthetic' },
  ];

  const wallpaperOptions: { id: WallpaperBackground; label: string; color: string; border: string }[] = [
    { id: 'linen', label: 'Warm Linen', color: '#FAF7F2', border: '#E8DFD3' },
    { id: 'parchment', label: 'Cozy Parchment', color: '#F5EFE4', border: '#DFD4C3' },
    { id: 'rose-mist', label: 'Rose Mist', color: '#FAF2F0', border: '#ECCDC6' },
    { id: 'sage', label: 'Sage Garden', color: '#F1F6F3', border: '#CDE0D4' },
    { id: 'midnight-warmth', label: 'Midnight Hearth', color: '#1A1614', border: '#3E342E' },
    { id: 'modern-lounge', label: 'Modern Lounge (Dark/Neo)', color: '#121216', border: '#32323E' },
    { id: 'neutral-keepsake', label: 'Neutral Keepsake (Minimal)', color: '#F8F7F4', border: '#DDD8CE' },
  ];

  const layoutOptions: { id: DailyLayoutChoice; title: string; desc: string }[] = [
    { id: 'standard', title: 'Balanced Sanctuary Grid', desc: 'Scripture up top, followed by 6 core interactive spaces' },
    { id: 'planner-first', title: 'Planner First', desc: 'Daily Planner & Reminders featured directly on the home page' },
    { id: 'journal-first', title: 'Reflections & Journal First', desc: 'Personal experiences & thoughts featured right when you open' },
    { id: 'gallery-focus', title: 'Gallery & Memories First', desc: 'Cherished photo moments & family highlights front and center' },
  ];

  const filteredPredefinedTeams = PREDEFINED_TEAMS.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
      t.league.toLowerCase().includes(teamSearchQuery.toLowerCase());
    const matchLeague =
      selectedLeagueFilter === 'ALL' || t.league === selectedLeagueFilter;
    return matchSearch && matchLeague;
  });

  const isBroncosAdded = sportsTeams.some((t) => t.name.toLowerCase().includes('bronco'));

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-[#E8DFD3]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E8DFD3] flex items-center justify-between bg-[#FAF7F2]">
          <div className="space-y-0.5">
            <h2 className="font-serif text-2xl font-bold text-[#2D231C] flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: 'var(--accent, #B84A2A)' }} />
              <span>My Personal Expression Page Studio</span>
            </h2>
            <p className="text-xs text-[#8F7F72]">
              Customize your layout, wallpaper flower, sports teams and logos, favorite music, and typography.
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 text-[#8F7F72] hover:text-[#2D231C] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center overflow-x-auto px-6 py-2 border-b border-[#E8DFD3] gap-2 bg-white scrollbar-none">
          {[
            { id: 'general', label: 'Identity & Layout', icon: Sparkles },
            { id: 'teams', label: 'Sports Teams & Logos', icon: Trophy },
            { id: 'music', label: 'Favorite Music', icon: Music },
            { id: 'flower', label: 'Flower Wallpaper', icon: Flower2 },
            { id: 'appearance', label: 'Theme & Font Layout', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#B84A2A] text-white shadow-xs font-semibold'
                    : 'text-[#6C5E53] hover:text-[#2D231C] hover:bg-[#FAF7F2]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: General Identity */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                  My Personal Expression Page Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name (e.g. Adriana, Sarah, Chris)..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A] text-[#2D231C]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                  Sanctuary Focus or Daily Mantra
                </label>
                <input
                  type="text"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="e.g. A peaceful heart, joyful moments, and gentle grace..."
                  className="w-full px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A] text-[#2D231C]"
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-2">
                  Daily Layout Arrangement
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {layoutOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setDailyLayout(opt.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        dailyLayout === opt.id
                          ? 'border-[#B84A2A] bg-[#FAF2ED]'
                          : 'border-[#E8DFD3] hover:border-[#D1C4B5] bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#2D231C]">{opt.title}</span>
                        {dailyLayout === opt.id && <Check className="w-3.5 h-3.5 text-[#B84A2A]" />}
                      </div>
                      <p className="text-[11px] text-[#736558]">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Sports Teams & Logos */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              
              {/* Featured: Adriana's Favorite Team - Denver Broncos */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#002244] to-[#0D3868] text-white border-2 border-[#FB4F14] shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white p-1 border-2 border-[#FB4F14] shadow-xs flex items-center justify-center shrink-0">
                    <img
                      src="https://a.espncdn.com/i/teamlogos/nfl/500/den.png"
                      alt="Denver Broncos"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-lg font-bold text-white">Denver Broncos</h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FB4F14] text-white">
                        Adriana's Team
                      </span>
                    </div>
                    <p className="text-xs text-[#E0E7FF] mt-0.5">
                      NFL · Official Navy & Orange · Mile High football pride
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!isBroncosAdded) {
                      handleAddPredefinedTeam(PREDEFINED_TEAMS[0]);
                    }
                  }}
                  disabled={isBroncosAdded}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all shadow-xs shrink-0 ${
                    isBroncosAdded
                      ? 'bg-white/20 text-white cursor-default'
                      : 'bg-[#FB4F14] hover:bg-[#E0440E] text-white'
                  }`}
                >
                  {isBroncosAdded ? '✓ Active on My Page' : '+ Set Denver Broncos'}
                </button>
              </div>

              {/* Your Selected Teams List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#736558]">
                    Your Selected Teams ({sportsTeams.length})
                  </span>
                  <span className="text-[11px] text-[#8F7F72]">
                    Add three NFL teams or any multiple sports teams below
                  </span>
                </div>

                {sportsTeams.length === 0 ? (
                  <div className="p-4 text-center rounded-2xl bg-[#FAF7F2] border border-[#E8DFD3] text-xs text-[#8F7F72] italic">
                    No teams added yet. Select Denver Broncos above or choose any team from the catalog below!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {sportsTeams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between gap-2.5 p-3 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <TeamLogo team={team} size="md" />
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-[#2D231C] truncate">{team.name}</p>
                            <span className="text-[10px] px-1.5 py-0.2 bg-white rounded text-[#736558] border border-[#E2D4C3]">
                              {team.league}
                            </span>
                            {team.notes && (
                              <p className="text-[10px] text-[#8F7F72] truncate">{team.notes}</p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTeam(team.id)}
                          className="text-[#9E9084] hover:text-[#DC2626] p-1.5 rounded-lg hover:bg-white transition-colors"
                          title="Remove team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Predefined Teams Library with Search & Leagues */}
              <div className="space-y-3 pt-4 border-t border-[#E8DFD3]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#736558] flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-[#B84A2A]" />
                    <span>Browse & Add Teams with Actual Logos</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowCustomTeamForm(!showCustomTeamForm)}
                    className="text-xs text-[#B84A2A] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Custom Team / Logo</span>
                  </button>
                </div>

                {/* Search & League Filter */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9E9084]" />
                    <input
                      type="text"
                      value={teamSearchQuery}
                      onChange={(e) => setTeamSearchQuery(e.target.value)}
                      placeholder="Search teams (e.g. Broncos, Chiefs, Cowboys, 49ers, Lakers)..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-[#2D231C]"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1">
                    {(['ALL', 'NFL', 'NBA', 'MLB', 'College'] as const).map((league) => (
                      <button
                        key={league}
                        type="button"
                        onClick={() => setSelectedLeagueFilter(league)}
                        className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                          selectedLeagueFilter === league
                            ? 'bg-[#B84A2A] text-white font-semibold'
                            : 'bg-[#FAF7F2] text-[#736558] border border-[#E8DFD3] hover:text-[#2D231C]'
                        }`}
                      >
                        {league === 'ALL' ? 'All Leagues' : league}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Teams Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1 border border-[#E8DFD3] rounded-2xl bg-[#FAF7F2]/50">
                  {filteredPredefinedTeams.map((team) => {
                    const isAdded = sportsTeams.some(
                      (t) => t.name.toLowerCase() === team.name.toLowerCase()
                    );
                    return (
                      <div
                        key={team.name}
                        onClick={() => !isAdded && handleAddPredefinedTeam(team)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          isAdded
                            ? 'bg-white border-[#B84A2A] shadow-xs'
                            : 'bg-white border-[#E8DFD3] hover:border-[#B84A2A] hover:bg-[#FAF2ED]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-white border border-[#E8DFD3] p-0.5 shrink-0 flex items-center justify-center">
                            <img
                              src={team.logoUrl}
                              alt={team.name}
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#2D231C] truncate">{team.name}</p>
                            <span className="text-[10px] text-[#8F7F72]">{team.league}</span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-bold shrink-0 ${
                            isAdded ? 'text-[#B84A2A]' : 'text-[#8F7F72]'
                          }`}
                        >
                          {isAdded ? '✓' : '+'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Team Creator if expanded */}
              {showCustomTeamForm && (
                <form
                  onSubmit={handleAddCustomTeam}
                  className="p-4 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl space-y-3 animate-in fade-in"
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-semibold text-[#2D231C]">
                      Create Custom Team or Upload Custom Logo
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCustomTeamForm(false)}
                      className="text-xs text-[#8F7F72] hover:text-[#2D231C]"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#736558] mb-1">
                        Team Name
                      </label>
                      <input
                        type="text"
                        value={customTeamName}
                        onChange={(e) => setCustomTeamName(e.target.value)}
                        placeholder="e.g. Local Club, European Team..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#736558] mb-1">
                        League / Sport
                      </label>
                      <select
                        value={customTeamLeague}
                        onChange={(e) => setCustomTeamLeague(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                      >
                        <option value="NFL">NFL Football</option>
                        <option value="MLB">MLB Baseball</option>
                        <option value="NBA">NBA Basketball</option>
                        <option value="Soccer">Soccer / Football</option>
                        <option value="College">College Sports</option>
                        <option value="NHL">NHL Hockey</option>
                        <option value="Other">Other Sport</option>
                      </select>
                    </div>
                  </div>

                  {/* Logo URL or Upload */}
                  <div>
                    <label className="block text-xs font-medium text-[#736558] mb-1">
                      Logo Image URL or Local Upload
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customLogoUrl}
                        onChange={(e) => setCustomLogoUrl(e.target.value)}
                        placeholder="Paste image URL (https://...)"
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                      />
                      <input
                        type="file"
                        ref={logoFileInputRef}
                        onChange={handleCustomLogoFile}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#55473C] bg-white border border-[#E0D5C7] rounded-lg hover:border-[#B84A2A] transition-colors whitespace-nowrap"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-medium text-[#736558] mb-1">
                      Game Day Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={customTeamNotes}
                      onChange={(e) => setCustomTeamNotes(e.target.value)}
                      placeholder="e.g. Watch on Saturdays, favorite memory..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-medium text-white bg-[#B84A2A] rounded-lg hover:bg-[#A33F23] transition-colors"
                    >
                      Save Custom Team
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

          {/* TAB 3: Favorite Music */}
          {activeTab === 'music' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-semibold text-[#2D231C] flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-[#B84A2A]" />
                  <span>Your Favorite Music & Playlists</span>
                </h3>
                <p className="text-xs text-[#736558]">
                  Keep your favorite uplifting songs, soothing acoustic playlists, or hymns at your fingertips.
                </p>
              </div>

              {/* Music Creation Affiliate Card */}
              <div className="p-4 bg-gradient-to-r from-[#FAF2ED] to-[#F5EBE1] border border-[#F2C8B5] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B84A2A] bg-white px-2 py-0.2 rounded-full border border-[#F2C8B5]">
                      Music Creation Partner
                    </span>
                    <span className="text-xs font-semibold text-[#2D231C]">
                      Compose Bespoke Family Songs with AI
                    </span>
                  </div>
                  <p className="text-[11px] text-[#736558] max-w-md font-prose-serif leading-relaxed">
                    Turn your family stories, anniversary milestones, or children's lullabies into studio-quality acoustic hymns and personalized songs.
                  </p>
                </div>

                <a
                  href="https://suno.com/?ref=familyhearth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-[#B84A2A] hover:bg-[#A33F23] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap shrink-0"
                >
                  <span>Compose Song ↗</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Hearth Royalty-Free Music Library */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <Library className="w-4 h-4" style={{ color: 'var(--accent, #B84A2A)' }} />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#736558]">
                    Hearth Music Library · Royalty-Free
                  </h4>
                </div>
                <p className="text-[11px] text-[#8F7F72] -mt-1">
                  Preview and add free tracks to your space. Swap in your own original songs anytime.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MUSIC_LIBRARY.map((track) => {
                    const isPlaying = playingId === track.id;
                    const isAdded = favoriteMusic.some(
                      (m) => m.title.toLowerCase() === track.title.toLowerCase()
                    );
                    return (
                      <div
                        key={track.id}
                        className="flex items-center gap-3 p-3 bg-white border border-[#E8DFD3] rounded-2xl shadow-2xs"
                      >
                        <button
                          type="button"
                          onClick={() => togglePreview(track)}
                          data-testid={`library-play-${track.id}`}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 transition-opacity hover:opacity-90"
                          style={{ backgroundColor: 'var(--accent, #B84A2A)' }}
                          aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[#2D231C] truncate">{track.title}</p>
                          <p className="text-[10px] text-[#8F7F72] truncate">{track.mood} · {track.artist}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addLibraryTrack(track)}
                          disabled={isAdded}
                          data-testid={`library-add-${track.id}`}
                          className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-lg shrink-0 flex items-center gap-1 transition-colors ${
                            isAdded
                              ? 'bg-[#F0E9DF] text-[#9E9084] cursor-default'
                              : 'text-white hover:opacity-90'
                          }`}
                          style={isAdded ? {} : { backgroundColor: 'var(--accent, #B84A2A)' }}
                        >
                          {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          <span>{isAdded ? 'Added' : 'Add'}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-[#E8DFD3] pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#736558] mb-2">
                  Or Link Your Own Track
                </p>
              </div>

              {/* Add Music Form */}
              <form onSubmit={handleAddMusic} className="p-4 bg-[#FAF7F2] border border-[#E8DFD3] rounded-2xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#736558] mb-1">
                      Song / Album / Playlist Title
                    </label>
                    <input
                      type="text"
                      value={newTrackTitle}
                      onChange={(e) => setNewTrackTitle(e.target.value)}
                      placeholder="e.g. Peace Like a River, Morning Acoustic..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#736558] mb-1">
                      Artist / Musician
                    </label>
                    <input
                      type="text"
                      value={newTrackArtist}
                      onChange={(e) => setNewTrackArtist(e.target.value)}
                      placeholder="e.g. Lauren Daigle, Instrumental Piano..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#736558] mb-1">
                    Link URL (Spotify, YouTube, Apple Music - Optional)
                  </label>
                  <input
                    type="url"
                    value={newTrackUrl}
                    onChange={(e) => setNewTrackUrl(e.target.value)}
                    placeholder="https://open.spotify.com/... or https://youtube.com/..."
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#E0D5C7] rounded-lg text-[#2D231C]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#B84A2A] rounded-lg hover:bg-[#A33F23] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Music Shelf</span>
                  </button>
                </div>
              </form>

              {/* Music List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#736558] block">
                  Your Music Collection ({favoriteMusic.length})
                </span>
                {favoriteMusic.length === 0 ? (
                  <p className="text-xs text-[#8F7F72] italic bg-[#FAF7F2] p-4 rounded-xl text-center">
                    No music added yet. Add your favorite calming tracks or playlists above!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {favoriteMusic.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between p-3 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-[#2D231C] truncate">{track.title}</p>
                          <p className="text-[11px] text-[#736558] truncate">{track.artist}</p>
                          {track.url && (
                            <a
                              href={track.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-[#B84A2A] hover:underline mt-0.5"
                            >
                              <span>Open Track</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMusic(track.id)}
                          className="text-[#9E9084] hover:text-[#DC2626] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Favorite Flower Wallpaper */}
          {activeTab === 'flower' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-semibold text-[#2D231C] flex items-center gap-1.5">
                  <Flower2 className="w-4 h-4 text-[#B84A2A]" />
                  <span>Choose Your Favorite Flower for the Wallpaper</span>
                </h3>
                <p className="text-xs text-[#736558]">
                  Select the botanical watermark illustration that flourishes softly across your personal sanctuary background.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {flowerChoices.map((flower) => {
                  const isSelected = favoriteFlower === flower.id;
                  return (
                    <div
                      key={flower.id}
                      onClick={() => setFavoriteFlower(flower.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#B84A2A] bg-[#FAF2ED] shadow-xs'
                          : 'border-[#E8DFD3] hover:border-[#D1C4B5] bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif text-sm font-semibold text-[#2D231C]">
                          {flower.name}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#B84A2A]" />}
                      </div>
                      <p className="text-[11px] text-[#736558]">{flower.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: Theme & Font Layout */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Accent Color */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558]">
                  Accent Color
                </label>
                <p className="text-[11px] text-[#8F7F72] -mt-1.5">
                  Your signature color — used across buttons, highlights and your onboarding.
                </p>
                <div className="flex items-center flex-wrap gap-2.5">
                  {accentPresets.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAccentColor(c)}
                      data-testid={`accent-${c}`}
                      className={`w-9 h-9 rounded-full transition-transform hover:scale-110 ${
                        accentColor.toLowerCase() === c.toLowerCase()
                          ? 'ring-2 ring-offset-2 ring-[#2D231C]'
                          : 'ring-1 ring-black/10'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Accent ${c}`}
                    />
                  ))}
                  <label
                    className="w-9 h-9 rounded-full border border-dashed border-[#C4B29E] flex items-center justify-center cursor-pointer overflow-hidden relative"
                    title="Custom color"
                  >
                    <Palette className="w-4 h-4 text-[#8F7F72]" />
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      data-testid="accent-custom"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                  <span
                    className="ml-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    Preview
                  </span>
                </div>
              </div>

              {/* Wallpaper Background Palette */}
              <div className="space-y-3 pt-3 border-t border-[#E8DFD3]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558]">
                  Wallpaper Canvas Tint
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {wallpaperOptions.map((wp) => (
                    <div
                      key={wp.id}
                      onClick={() => setWallpaperTheme(wp.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                        wallpaperTheme === wp.id
                          ? 'border-[#B84A2A] shadow-xs ring-1 ring-[#B84A2A]'
                          : 'border-[#E8DFD3] hover:border-[#C4B29E]'
                      }`}
                      style={{ backgroundColor: wp.color }}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: wp.color }}
                      />
                      <span className={`text-xs font-medium ${wp.id === 'midnight-warmth' ? 'text-white' : 'text-[#2D231C]'}`}>
                        {wp.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Font Layout */}
              <div className="space-y-3 pt-3 border-t border-[#E8DFD3]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558]">
                  Typography & Font Layout
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fontOptions.map((font) => (
                    <div
                      key={font.id}
                      onClick={() => setFontLayout(font.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        fontLayout === font.id
                          ? 'border-[#B84A2A] bg-[#FAF2ED]'
                          : 'border-[#E8DFD3] hover:border-[#D1C4B5] bg-[#FAF7F2]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#2D231C]">{font.label}</span>
                        {fontLayout === font.id && <Check className="w-3.5 h-3.5 text-[#B84A2A]" />}
                      </div>
                      <p className="text-[11px] text-[#736558] italic">{font.preview}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[#E8DFD3] flex items-center justify-between bg-[#FAF7F2]">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-xs text-[#736558] hover:text-[#2D231C]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            style={{ backgroundColor: 'var(--accent, #B84A2A)' }}
            className="px-6 py-2 text-xs font-medium text-white rounded-xl hover:opacity-90 transition-opacity shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save My Personal Expression Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
