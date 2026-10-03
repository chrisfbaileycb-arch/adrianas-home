import React from 'react';
import { Heart, ShieldCheck, TrendingUp, BookOpen } from 'lucide-react';

interface FooterProps {
  onOpenBackup: () => void;
  onOpenFlywheel?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBackup, onOpenFlywheel }) => {
  return (
    <footer className="mt-16 border-t border-[#EADBCC] py-8 text-center text-xs text-[#7A6C60] space-y-3 bg-[#F7F2EB]/50">
      <div className="flex items-center justify-center gap-1.5 font-serif italic text-sm text-[#4E4034]">
        <span>Made with love, kept safely on this device.</span>
        <Heart className="w-3.5 h-3.5 text-[#B84A2A] fill-[#B84A2A]" />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-[#958577]">
        <button
          onClick={onOpenBackup}
          className="hover:text-[#B84A2A] transition-colors flex items-center gap-1"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Device Privacy & Backup</span>
        </button>
        <span aria-hidden="true">·</span>
        {onOpenFlywheel && (
          <>
            <button
              onClick={onOpenFlywheel}
              className="hover:text-[#B84A2A] transition-colors flex items-center gap-1 text-[#B84A2A] font-medium"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Creator Ad Flywheel ($10 Tests)</span>
            </button>
            <span aria-hidden="true">·</span>
          </>
        )}
        <a
          href="https://www.lulu.com/create/cookbooks?ref=familyhearth"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#B84A2A] transition-colors flex items-center gap-1"
        >
          <BookOpen className="w-3 h-3" />
          <span>Cookbook Printing (Lulu)</span>
        </a>
        <span aria-hidden="true">·</span>
        <span>Family Hearth Sanctuary © {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
};

