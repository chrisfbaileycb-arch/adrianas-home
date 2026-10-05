import React from 'react';
import { Heart } from 'lucide-react';

interface FooterProps {
  onOpenPersonalize?: () => void;
  onOpenBackup?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPersonalize, onOpenBackup }) => {
  return (
    <footer className="border-t border-[#E8DFD3] bg-[#FAF7F2] py-8 text-center text-xs text-[#8A796C] space-y-2">
      <div className="flex items-center justify-center gap-1.5 font-medium text-[#4A3C31]">
        <span>Hearth</span>
        <span>·</span>
        <span>A Sovereign Private Sanctuary</span>
      </div>
      <p className="max-w-md mx-auto text-[#8F7E70] px-4 font-prose-serif italic text-xs leading-relaxed">
        “No algorithms, no tracking ads, and zero liability media hosting. Just genuine connection, quiet thoughts, and enduring family warmth.”
      </p>
      <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-[#A39284]">
        {onOpenPersonalize && (
          <button onClick={onOpenPersonalize} className="hover:text-[#B84A2A] transition-colors">
            Personalize Space
          </button>
        )}
        <span>·</span>
        {onOpenBackup && (
          <button onClick={onOpenBackup} className="hover:text-[#B84A2A] transition-colors">
            Safe Storage Backup
          </button>
        )}
      </div>
    </footer>
  );
};
