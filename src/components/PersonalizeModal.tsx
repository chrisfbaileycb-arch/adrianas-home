import React, { useState } from 'react';
import { UserProfile, MusicTrack } from '../types';
import { MUSIC_LIBRARY } from '../data/musicLibrary';
import { TeamLogo } from './TeamLogo';
import {
  X,
  Palette,
  Trophy,
  Music,
  Flower2,
  Layout,
  Plus,
  Trash2,
  Check,
  Play,
  Volume2,
} from 'lucide-react';

interface PersonalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  initialTab?: 'general' | 'teams' | 'music' | 'flower' | 'appearance';
}

const ACCENT_PRESETS = [
  { name: 'Warm Terracotta', hex: '#B84A2A' },
  { name: 'Amber Gold', hex: '#D97706' },
  { name: 'Sage Green', hex: '#059669' },
  { name: 'Mountain Lake', hex: '#2563EB' },
  { name: 'Devotional Plum', hex: '#7C3AED' },
  { name: 'Rose Mist', hex: '#DB2777' },
  { name: 'Linen Slate', hex: '#4B5563' },
  { name: 'Midnight Hearth', hex: '#1E293B' },
];

export const PersonalizeModal: React.FC<PersonalizeModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  initialTab = 'appearance',
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'teams' | 'music' | 'flower' | 'appearance'>(initialTab);
  const [draft, setDraft] = useState<UserProfile>({ ...userProfile });
  const [newTeam, setNewTeam] = useState('');
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleAccentChange = (hex: string) => {
    setDraft((p) => ({ ...p, accentColor: hex }));
    document.documentElement.style.setProperty('--accent', hex);
  };

  const handleSave = () => {
    onSaveProfile(draft);
    onClose();
  };

  const handleCancel = () => {
    document.documentElement.style.setProperty('--accent', userProfile.accentColor || '#B84A2A');
    if (previewAudio) previewAudio.pause();
    onClose();
  };

  const handleAddTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.trim()) return;
    if (!draft.sportsTeams.includes(newTeam.trim())) {
      setDraft((p) => ({ ...p, sportsTeams: [...p.sportsTeams, newTeam.trim()] }));
    }
    setNewTeam('');
  };

  const handleRemoveTeam = (team: string) => {
    setDraft((p) => ({ ...p, sportsTeams: p.sportsTeams.filter((t) => t !== team) }));
  };

  const handleAddMusicFromLibrary = (track: { id: string; title: string; artist: string; previewUrl: string }) => {
    const existing = draft.favoriteMusic.some((m) => m.title === track.title);
    if (!existing) {
      const newM: MusicTrack = {
        id: `track-${Date.now()}`,
        title: track.title,
        artist: track.artist,
        url: track.previewUrl,
      };
      setDraft((p) => ({ ...p, favoriteMusic: [...p.favoriteMusic, newM] }));
    }
  };

  const handleTogglePreview = (url: string, id: string) => {
    if (playingPreview === id) {
      previewAudio?.pause();
      setPlayingPreview(null);
      return;
    }
    if (previewAudio) previewAudio.pause();
    const a = new Audio(url);
    a.play().catch(() => {});
    a.onended = () => setPlayingPreview(null);
    setPreviewAudio(a);
    setPlayingPreview(id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E8DFD3] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E6D9] shrink-0">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B84A2A]">
              Sanctuary Customization
            </span>
            <h2 className="font-serif text-2xl font-semibold text-[#2D231C]">
              Personal Expression Page
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 text-[#8F7F72] hover:text-[#2D231C] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex items-center overflow-x-auto px-6 border-b border-[#F0E6D9] gap-4 scrollbar-none shrink-0 bg-[#FAF7F2]">
          {[
            { id: 'appearance', label: 'Appearance & Accent', icon: Palette },
            { id: 'flower', label: 'Flower Wallpaper', icon: Flower2 },
            { id: 'music', label: 'Music Shelf', icon: Music },
            { id: 'teams', label: 'Sports & Logos', icon: Trophy },
            { id: 'general', label: 'Motto & Layout', icon: Layout },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 text-xs font-medium flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors ${
                  isSel
                    ? 'border-[#B84A2A] text-[#B84A2A] font-semibold'
                    : 'border-transparent text-[#736558] hover:text-[#2D231C]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB: Appearance */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              
              {/* Accent Color Picker */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-[#2D231C]">
                  Sanctuary Accent Color
                </label>
                <p className="text-xs text-[#736558]">
                  Colors your buttons, navigation highlights, badges, and active cards in real time.
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
                  {ACCENT_PRESETS.map((p) => {
                    const isSel = draft.accentColor.toLowerCase() === p.hex.toLowerCase();
                    return (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => handleAccentChange(p.hex)}
                        title={p.name}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                          isSel ? 'ring-2 ring-offset-2 ring-[#2D231C] scale-105' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: p.hex }}
                      >
                        {isSel && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs text-[#736558]">Custom hex:</span>
                  <input
                    type="color"
                    value={draft.accentColor}
                    onChange={(e) => handleAccentChange(e.target.value)}
                    className="w-7 h-7 rounded border border-[#E8DFD3] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={draft.accentColor}
                    onChange={(e) => handleAccentChange(e.target.value)}
                    className="w-24 px-2 py-1 text-xs bg-[#FAF7F2] border border-[#E8DFD3] rounded font-mono uppercase"
                  />
                </div>
              </div>

              {/* Wallpaper Theme */}
              <div className="space-y-3 pt-4 border-t border-[#F0E6D9]">
                <label className="block text-xs font-semibold text-[#2D231C]">
                  Color Tint & Atmosphere
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'linen', name: 'Warm Linen', bg: 'bg-[#FAF7F2]', border: 'border-[#E8DFD3]' },
                    { id: 'parchment', name: 'Golden Parchment', bg: 'bg-[#F7EFE3]', border: 'border-[#DFCBB5]' },
                    { id: 'rose-mist', name: 'Rose Mist', bg: 'bg-[#FAF2F2]', border: 'border-[#ECD2D2]' },
                    { id: 'sage', name: 'Sage Garden', bg: 'bg-[#F2F6F3]', border: 'border-[#CFDFD3]' },
                    { id: 'midnight-warmth', name: 'Midnight Hearth', bg: 'bg-[#211A16] text-white', border: 'border-[#3D312A]' },
                    { id: 'modern-lounge', name: 'Modern Lounge', bg: 'bg-[#F0EFF4]', border: 'border-[#D5D2E2]' },
                    { id: 'neutral-keepsake', name: 'Neutral Keepsake', bg: 'bg-[#F4F1EA]', border: 'border-[#D9D3C7]' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, wallpaperTheme: t.id as any }))}
                      className={`p-3 rounded-2xl border text-left transition-all ${t.bg} ${t.border} ${
                        draft.wallpaperTheme === t.id ? 'ring-2 ring-[#B84A2A] shadow-xs' : 'opacity-85 hover:opacity-100'
                      }`}
                    >
                      <span className="block text-xs font-semibold">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography */}
              <div className="space-y-3 pt-4 border-t border-[#F0E6D9]">
                <label className="block text-xs font-semibold text-[#2D231C]">
                  Typography Feel
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'serif', name: 'Classic Serif', sub: 'Cormorant Garamond' },
                    { id: 'newsreader', name: 'Literary', sub: 'Newsreader' },
                    { id: 'sans', name: 'Clean Sans', sub: 'Plus Jakarta' },
                    { id: 'mono', name: 'Typewriter', sub: 'Monospace' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, fontLayout: f.id as any }))}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        draft.fontLayout === f.id
                          ? 'bg-[#FAF2ED] border-[#B84A2A] font-semibold text-[#B84A2A]'
                          : 'bg-[#FAF7F2] border-[#E8DFD3] text-[#736558] hover:border-[#D1C2B2]'
                      }`}
                    >
                      <p className="font-medium text-[#2D231C]">{f.name}</p>
                      <p className="text-[10px] text-[#8F7F72]">{f.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: Flower Wallpaper */}
          {activeTab === 'flower' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-[#2D231C]">Flower Wallpaper Motifs</h3>
                <p className="text-xs text-[#736558]">Subtle botanical illustrations resting softly behind your cards.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'wild-rose', name: 'Wild Rose', desc: 'Blush pink petals & gentle warmth' },
                  { id: 'lavender', name: 'Hillside Lavender', desc: 'Serene purple stalks & quiet calm' },
                  { id: 'sunflower', name: 'Golden Sunflower', desc: 'Radiant morning cheer & optimism' },
                  { id: 'olive-branch', name: 'Olive Branch', desc: 'Enduring peace & faithful strength' },
                  { id: 'daisy', name: 'Field Daisy', desc: 'Bright innocent joy in simple days' },
                  { id: 'none', name: 'None (Plain)', desc: 'Unembellished minimal canvas' },
                ].map((fl) => (
                  <button
                    key={fl.id}
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, favoriteFlower: fl.id as any }))}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      draft.favoriteFlower === fl.id
                        ? 'bg-[#FAF2ED] border-[#B84A2A] shadow-xs'
                        : 'bg-[#FAF7F2] border-[#E8DFD3] hover:border-[#D1C2B2]'
                    }`}
                  >
                    <span className="block text-xs font-semibold text-[#2D231C]">{fl.name}</span>
                    <span className="block text-[10px] text-[#8F7F72] mt-0.5">{fl.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Music Shelf */}
          {activeTab === 'music' && (
            <div className="space-y-6">
              
              {/* Current Shelf */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-[#2D231C]">Your Music Shelf ({draft.favoriteMusic.length})</h3>
                  <span className="text-[11px] text-[#8F7F72]">Displayed on your sanctuary home</span>
                </div>

                <div className="space-y-2">
                  {draft.favoriteMusic.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="flex items-center justify-between p-2.5 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[#2D231C]">{m.title}</p>
                        <p className="text-[11px] text-[#736558]">{m.artist}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDraft((p) => ({ ...p, favoriteMusic: p.favoriteMusic.filter((_, i) => i !== idx) }))}
                        className="text-[#9E9084] hover:text-[#DC2626] p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Starter Royalty-Free Library */}
              <div className="space-y-3 pt-4 border-t border-[#F0E6D9]">
                <h3 className="text-xs font-semibold text-[#2D231C]">Curated Music Library</h3>
                <p className="text-xs text-[#736558]">Listen to a preview and add tracks directly to your shelf.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MUSIC_LIBRARY.map((item) => {
                    const isAdded = draft.favoriteMusic.some((m) => m.title === item.title);
                    const isPlayingThis = playingPreview === item.id;
                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-white border border-[#E8DFD3] rounded-2xl flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-[#2D231C] truncate">{item.title}</p>
                          <p className="text-[10px] text-[#8F7F72] truncate">{item.artist} · {item.genre}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleTogglePreview(item.previewUrl, item.id)}
                            className="p-1.5 text-[#55473C] bg-[#FAF7F2] hover:bg-[#F3ECE2] rounded-lg transition-colors"
                            title={isPlayingThis ? 'Pause preview' : 'Listen to preview'}
                          >
                            {isPlayingThis ? <Volume2 className="w-3.5 h-3.5 text-[#B84A2A]" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            disabled={isAdded}
                            onClick={() => handleAddMusicFromLibrary(item)}
                            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                              isAdded
                                ? 'bg-[#FAF7F2] text-[#9E9084] cursor-default'
                                : 'bg-[#B84A2A] text-white hover:bg-[#A33F23]'
                            }`}
                          >
                            {isAdded ? 'Added' : 'Add'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB: Sports & Logos */}
          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-semibold text-[#2D231C]">Sports Teams & Crests</h3>
                <p className="text-xs text-[#736558]">Display your beloved teams right on your homepage shelf.</p>
              </div>

              <form onSubmit={handleAddTeam} className="flex gap-2">
                <input
                  type="text"
                  value={newTeam}
                  onChange={(e) => setNewTeam(e.target.value)}
                  placeholder="e.g. Denver Broncos, Colorado Avalanche..."
                  className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#B84A2A] text-white text-xs font-medium rounded-xl hover:bg-[#A33F23] transition-colors shadow-xs"
                >
                  Add Team
                </button>
              </form>

              <div className="space-y-2">
                {draft.sportsTeams.map((team) => (
                  <div
                    key={team}
                    className="flex items-center justify-between p-3 bg-[#FAF7F2] border border-[#E8DFD3] rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <TeamLogo teamName={team} className="w-6 h-6 rounded-md shrink-0 shadow-2xs" />
                      <span className="text-xs font-semibold text-[#2D231C]">{team}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveTeam(team)}
                      className="text-[#9E9084] hover:text-[#DC2626] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: General (Motto & Layout) */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              
              <div>
                <label className="block text-xs font-semibold text-[#2D231C] mb-1">
                  Sanctuary Welcome Motto / Family Verse
                </label>
                <textarea
                  rows={3}
                  value={draft.sanctuaryFocus}
                  onChange={(e) => setDraft((p) => ({ ...p, sanctuaryFocus: e.target.value }))}
                  placeholder="A tender, unhurried space for your plans, family traditions..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2D231C] mb-2">
                  Homepage Organization Layout
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'standard', name: 'Balanced Standard', desc: 'Scripture focus, quick schedule, all 6 spaces' },
                    { id: 'planner-first', name: 'Planner & Intentions', desc: 'Puts today’s schedule and alerts on top' },
                    { id: 'journal-first', name: 'Quiet Reflections', desc: 'Puts recent personal thoughts & gratitude on top' },
                    { id: 'gallery-focus', name: 'Family Gallery', desc: 'Puts shared albums and photo memories on top' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, dailyLayout: l.id as any }))}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        draft.dailyLayout === l.id
                          ? 'bg-[#FAF2ED] border-[#B84A2A] shadow-xs'
                          : 'bg-[#FAF7F2] border-[#E8DFD3] hover:border-[#D1C2B2]'
                      }`}
                    >
                      <p className="text-xs font-semibold text-[#2D231C]">{l.name}</p>
                      <p className="text-[10px] text-[#8F7F72] mt-0.5">{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F0E6D9] flex items-center justify-between shrink-0 bg-[#FAF7F2]">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-xs font-medium text-[#736558] hover:text-[#2D231C]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-medium text-white bg-[#B84A2A] hover:bg-[#A33F23] rounded-xl shadow-xs transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
