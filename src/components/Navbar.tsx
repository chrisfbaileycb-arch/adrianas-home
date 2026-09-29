import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { Volume2, VolumeX, Flame, CloudRain } from 'lucide-react';
import { ambientSound } from '../utils/audio';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenBackup: () => void;
  onOpenPersonalize: () => void;
  userName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBackup,
  onOpenPersonalize,
  userName,
}) => {
  const [soundMode, setSoundMode] = useState<'off' | 'hearth' | 'rain'>('off');

  const navLinks: { id: ActiveTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'plan', label: "Today's Plan" },
    { id: 'gallery', label: 'Gallery' },
    { id: 'editor', label: 'Photo Editor' },
    { id: 'scripture', label: 'Scripture' },
    { id: 'thoughts', label: 'Thoughts' },
    { id: 'recipes', label: 'Recipes' },
  ];

  const cycleSound = () => {
    if (soundMode === 'off') {
      ambientSound.play('hearth');
      setSoundMode('hearth');
    } else if (soundMode === 'hearth') {
      ambientSound.play('rain');
      setSoundMode('rain');
    } else {
      ambientSound.stop();
      setSoundMode('off');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD3] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Zone 1: Single text element Brand Zone */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className="text-left font-serif text-2xl font-semibold tracking-tight text-[#2D231C] hover:text-[#B84A2A] transition-colors flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B84A2A] rounded-sm"
          >
            <span className="text-[#C05621] text-xl" aria-hidden="true">❦</span>
            <span>Adrianas</span>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
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

        {/* Zone 3: Primary Actions (Personalize Space, Ambient Sound Toggle & Backup) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenPersonalize}
            title="Open My Personal Expression Page"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-[#2D231C] border border-[#E8DFD3] rounded-full hover:border-[#B84A2A] hover:text-[#B84A2A] transition-all whitespace-nowrap shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#B84A2A]" />
            <span className="hidden sm:inline">My Personal Expression Page</span>
            <span className="sm:hidden font-semibold">Expression Page</span>
          </button>

          <button
            onClick={cycleSound}
            title={
              soundMode === 'off'
                ? 'Play ambient hearth sounds'
                : soundMode === 'hearth'
                ? 'Switch to gentle rain'
                : 'Turn off ambient sound'
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
              soundMode !== 'off'
                ? 'bg-[#FBECE6] text-[#B84A2A] border-[#F2C8B5]'
                : 'bg-white/80 text-[#695C51] border-[#E8DFD3] hover:text-[#2D231C] hover:border-[#D1C4B5]'
            }`}
          >
            {soundMode === 'hearth' && <Flame className="w-3.5 h-3.5 text-[#C05621] animate-pulse" />}
            {soundMode === 'rain' && <CloudRain className="w-3.5 h-3.5 text-[#4B7E8C] animate-pulse" />}
            {soundMode === 'off' && <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">
              {soundMode === 'hearth' ? 'Hearth Fire' : soundMode === 'rain' ? 'Gentle Rain' : 'Ambient'}
            </span>
          </button>

          <button
            onClick={onOpenBackup}
            className="px-3 py-1.5 text-xs font-medium text-[#2D231C] bg-white border border-[#E8DFD3] rounded-full hover:bg-[#F5EFE6] transition-colors whitespace-nowrap shadow-xs hidden sm:inline-block"
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
