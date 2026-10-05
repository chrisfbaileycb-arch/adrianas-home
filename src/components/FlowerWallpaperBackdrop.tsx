import React from 'react';
import { UserProfile } from '../types';

interface FlowerWallpaperBackdropProps {
  flower: UserProfile['favoriteFlower'];
}

export const FlowerWallpaperBackdrop: React.FC<FlowerWallpaperBackdropProps> = ({ flower }) => {
  if (flower === 'none') return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 select-none"
    >
      {flower === 'wild-rose' && (
        <>
          <div className="absolute top-12 -left-20 w-80 h-80 rounded-full bg-[#FCEBE6] blur-3xl" />
          <div className="absolute top-96 -right-20 w-96 h-96 rounded-full bg-[#FAF0E6] blur-3xl" />
          <svg className="absolute top-6 left-4 w-40 h-40 text-[#E89E88] opacity-25" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="15" />
            <path d="M50,15 C40,25 40,40 50,45 C60,40 60,25 50,15 Z" />
            <path d="M85,50 C75,40 60,40 55,50 C60,60 75,60 85,50 Z" />
            <path d="M50,85 C60,75 60,60 50,55 C40,60 40,75 50,85 Z" />
            <path d="M15,50 C25,60 40,60 45,50 C40,40 25,40 15,50 Z" />
          </svg>
        </>
      )}

      {flower === 'lavender' && (
        <>
          <div className="absolute top-10 -left-16 w-80 h-80 rounded-full bg-[#F1EEF8] blur-3xl" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-[#EAE4F4] blur-3xl" />
          <svg className="absolute top-8 right-6 w-32 h-64 text-[#9F8AB8] opacity-25" viewBox="0 0 50 100" fill="currentColor">
            <line x1="25" y1="95" x2="25" y2="15" stroke="currentColor" strokeWidth="2" />
            <ellipse cx="20" cy="30" rx="5" ry="8" />
            <ellipse cx="30" cy="35" rx="5" ry="8" />
            <ellipse cx="20" cy="45" rx="5" ry="8" />
            <ellipse cx="30" cy="50" rx="5" ry="8" />
            <ellipse cx="20" cy="60" rx="5" ry="8" />
            <ellipse cx="30" cy="65" rx="5" ry="8" />
          </svg>
        </>
      )}

      {flower === 'sunflower' && (
        <>
          <div className="absolute top-8 left-10 w-96 h-96 rounded-full bg-[#FFF9E6] blur-3xl" />
          <svg className="absolute top-12 left-12 w-48 h-48 text-[#EAB308] opacity-20" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="16" fill="#713F12" />
            {[...Array(12)].map((_, i) => (
              <ellipse key={i} cx="50" cy="18" rx="6" ry="14" transform={`rotate(${i * 30} 50 50)`} />
            ))}
          </svg>
        </>
      )}

      {flower === 'olive-branch' && (
        <>
          <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-[#EFF5EB] blur-3xl" />
          <svg className="absolute bottom-10 left-8 w-40 h-40 text-[#4B6B38] opacity-25" viewBox="0 0 100 100" fill="currentColor">
            <path d="M10,90 Q50,60 90,10" stroke="currentColor" strokeWidth="2" fill="none" />
            <ellipse cx="30" cy="68" rx="5" ry="10" transform="rotate(-30 30 68)" />
            <ellipse cx="48" cy="52" rx="5" ry="10" transform="rotate(35 48 52)" />
            <ellipse cx="65" cy="35" rx="5" ry="10" transform="rotate(-25 65 35)" />
            <ellipse cx="80" cy="20" rx="5" ry="10" transform="rotate(40 80 20)" />
          </svg>
        </>
      )}

      {flower === 'daisy' && (
        <>
          <div className="absolute top-14 left-1/3 w-80 h-80 rounded-full bg-[#FAF8F2] blur-3xl" />
          <svg className="absolute top-16 right-16 w-36 h-36 text-[#E2D9C8] opacity-35" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="12" fill="#F59E0B" />
            {[...Array(8)].map((_, i) => (
              <ellipse key={i} cx="50" cy="22" rx="7" ry="14" transform={`rotate(${i * 45} 50 50)`} />
            ))}
          </svg>
        </>
      )}
    </div>
  );
};
