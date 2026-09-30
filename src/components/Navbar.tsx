import React, { useState, useEffect } from 'react';
import { ActiveTab, UserRole } from '../types';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Music,
  ExternalLink,
  Lock,
  Sparkles,
  Crown,
} from 'lucide-react';
import { ambientSound, CURATED_TRACKS, AudioTrack } from '../utils/audio';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenBackup: () => void;
  onOpenPersonalize: () => void;
  onLockPorch: () => void;
  userName: string;
  currentRole?: UserRole;
  modulesEnabled?: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBackup,
  onOpenPersonalize,
  onLockPorch,
  userName,
  currentRole = 'owner',
  modulesEnabled = ['scripture', 'recipes', 'albums', 'music', 'planner', 'thoughts'],
}) => {
  const [audioState, setAudioState] = useState<{
    isPlaying: boolean;
    currentTrack: AudioTrack;
    volume: number;
  }>({
    isPlaying: false,
    currentTrack: CURATED_TRACKS[0],
    volume: 0.65,
  });

  const [showTrackMenu, setShowTrackMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = ambientSound.subscribe((state) => {
      setAudioState(state);
    });
    return () => unsubscribe();
  }, []);

  const allNavLinks: { id: ActiveTab; label: string; moduleKey?: string; ownerOnly?: boolean }[] = [
    { id: 'home', label: 'Home' },
    { id: 'gallery', label: 'Family Albums', moduleKey: 'albums' },
    { id: 'plan', label: "Today's Plan", moduleKey: 'planner' },
    { id: 'scripture', label: 'Scripture', moduleKey: 'scripture' },
    { id: 'thoughts', label: 'Thoughts', moduleKey: 'thoughts' },
    { id: 'recipes', label: 'Recipes', moduleKey: 'recipes' },
    { id: 'editor', label: 'Photo Editor', ownerOnly: true },
  ];

  const navLinks = allNavLinks.filter((link) => {
    if (link.ownerOnly && currentRole !== 'owner') return false;
    if (link.moduleKey && !modulesEnabled.includes(link.moduleKey)) return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD3] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Zone 1: Single text element Brand Zone */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className="text-left font-serif text-2xl font-semibold tracking-tight text-[#2D231C] hover:text-[#B84A2A] transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B84A2A] rounded-sm"
          >
            <span className="text-[#C05621] text-xl" aria-hidden="true">❦</span>
            <span>Adrianas</span>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`relative py-1 text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B84A2A] rounded-sm ${
                  isActive ? 'text-[#B84A2A] font-semibold' : 'text-[#695C51] hover:text-[#2D231C]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B84A2A] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Curated Audio Preview Pill & CTAs */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Audio Player Pill & Bandcamp/Spotify CTA */}
          <div className="relative">
            <div className="flex items-center bg-white border border-[#E8DFD3] hover:border-[#D1C4B5] rounded-full shadow-2xs p-1 gap-1">
              
              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={() => ambientSound.togglePlay()}
                className={`p-1.5 rounded-full transition-colors ${
                  audioState.isPlaying
                    ? 'bg-[#B84A2A] text-white'
                    : 'bg-[#FAF7F2] text-[#55473C] hover:bg-[#F3ECE2]'
                }`}
                title={audioState.isPlaying ? 'Pause preview loop' : 'Play preview loop'}
              >
                {audioState.isPlaying ? (
                  <Pause className="w-3.5 h-3.5" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
              </button>

              {/* Track Title and Menu Trigger */}
              <button
                type="button"
                onClick={() => setShowTrackMenu(!showTrackMenu)}
                className="text-left px-1.5 py-0.5 max-w-[100px] sm:max-w-[130px] lg:max-w-[150px] truncate"
                title={`${audioState.currentTrack.title} · Click for tracks & streaming`}
              >
                <span className="block text-[11px] font-semibold text-[#2D231C] truncate">
                  {audioState.currentTrack.title}
                </span>
                <span className="block text-[9px] text-[#8F7F72] truncate -mt-0.5">
                  {audioState.isPlaying ? 'Playing Preview' : 'Proprietary Track'}
                </span>
              </button>

              {/* Skip Next Track */}
              <button
                type="button"
                onClick={() => ambientSound.nextTrack()}
                className="p-1 text-[#8F7F72] hover:text-[#2D231C] rounded-full transition-colors hidden sm:inline-flex"
                title="Next preview track"
              >
                <SkipForward className="w-3 h-3" />
              </button>
            </div>

            {/* Audio Dropdown Menu with Bandcamp / Spotify CTA */}
            {showTrackMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl border border-[#E8DFD3] shadow-xl p-3 space-y-3 z-50 animate-in fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD3]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#B84A2A] flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    <span>Curated Audio Loops</span>
                  </span>
                  <button
                    onClick={() => setShowTrackMenu(false)}
                    className="text-xs text-[#8F7F72] hover:text-[#2D231C]"
                  >
                    ✕
                  </button>
                </div>

                {/* Track Selector List */}
                <div className="space-y-1">
                  {CURATED_TRACKS.map((track) => {
                    const isSelected = track.id === audioState.currentTrack.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          ambientSound.selectTrack(track.id);
                          if (!audioState.isPlaying) ambientSound.play();
                        }}
                        className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between text-xs ${
                          isSelected
                            ? 'bg-[#FAF2ED] border border-[#F2C8B5] text-[#2D231C] font-semibold'
                            : 'hover:bg-[#FAF7F2] text-[#6C5E53]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="truncate">{track.title}</p>
                          <p className="text-[10px] text-[#8F7F72] font-normal truncate">
                            {track.subtitle}
                          </p>
                        </div>
                        {isSelected && audioState.isPlaying && (
                          <span className="text-[10px] text-[#B84A2A] font-bold animate-pulse">
                            Playing
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Streaming & Ownership CTA */}
                <div className="pt-2 border-t border-[#F0E6D9] space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#2D231C] block">
                    Full Studio Recording:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={audioState.currentTrack.bandcampUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#E8DFD3] rounded-lg text-[10px] font-medium text-[#2D231C] text-center flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Buy on Bandcamp</span>
                      <ExternalLink className="w-2.5 h-2.5 text-[#B84A2A]" />
                    </a>

                    <a
                      href={audioState.currentTrack.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-[#F3ECE2] border border-[#E8DFD3] rounded-lg text-[10px] font-medium text-[#2D231C] text-center flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Stream Spotify</span>
                      <ExternalLink className="w-2.5 h-2.5 text-[#059669]" />
                    </a>
                  </div>

                  <a
                    href="https://bandcamp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#B84A2A] hover:underline flex items-center justify-center gap-1 pt-1 font-medium"
                  >
                    <span>Own the full song on Bandcamp / Stream on Spotify ↗</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Direct CTA next to audio pill */}
          <a
            href="https://bandcamp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center gap-1 text-[11px] font-medium text-[#B84A2A] hover:text-[#A33F23] hover:underline whitespace-nowrap bg-white/60 hover:bg-white px-2.5 py-1 rounded-full border border-[#E8DFD3] transition-colors shadow-2xs"
            title="Own the full song on Bandcamp / Stream on Spotify"
          >
            <span>Own the full song on Bandcamp / Stream on Spotify ↗</span>
          </a>

          {/* My Personal Expression Page */}
          <button
            onClick={onOpenPersonalize}
            title="Open My Personal Expression Page Studio"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-[#2D231C] border border-[#E8DFD3] rounded-full hover:border-[#B84A2A] hover:text-[#B84A2A] transition-all whitespace-nowrap shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#B84A2A]" />
            <span className="hidden sm:inline">My Personal Expression Page</span>
            <span className="sm:hidden font-semibold">Expression Page</span>
          </button>

          {/* Guest Lock Porch Gateway Toggle Button */}
          <button
            onClick={onLockPorch}
            title="Lock Front Porch Gate (Require PIN to re-enter)"
            className="p-1.5 text-[#736558] hover:text-[#B84A2A] bg-white border border-[#E8DFD3] rounded-full hover:bg-[#F5EFE6] transition-colors shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>

          {/* Safe Storage Backup */}
          <button
            onClick={onOpenBackup}
            className="px-3 py-1.5 text-xs font-medium text-[#2D231C] bg-white border border-[#E8DFD3] rounded-full hover:bg-[#F5EFE6] transition-colors whitespace-nowrap shadow-2xs hidden lg:inline-block"
          >
            Safe Storage
          </button>

        </div>
      </div>

      {/* Mobile Secondary Scrollable Tab Strip for small screens */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-[#F0E6D9] gap-4 scrollbar-none bg-[#FAF7F2]/90">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`text-xs font-medium whitespace-nowrap py-1 transition-colors ${
                isActive ? 'text-[#B84A2A] border-b-2 border-[#B84A2A] font-semibold' : 'text-[#695C51]'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
