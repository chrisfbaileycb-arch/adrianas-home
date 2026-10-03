import React from 'react';
import { FlowerWallpaper } from '../types';

interface FlowerWallpaperBackdropProps {
  flower: FlowerWallpaper;
}

export const FlowerWallpaperBackdrop: React.FC<FlowerWallpaperBackdropProps> = ({ flower }) => {
  if (flower === 'none') return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-40 transition-opacity duration-700"
      aria-hidden="true"
    >
      {/* Top right botanical accent */}
      <div className="absolute -top-12 -right-12 w-96 h-96 transform rotate-12">
        <FlowerSvg type={flower} />
      </div>

      {/* Bottom left botanical accent */}
      <div className="absolute -bottom-16 -left-16 w-80 h-80 transform -rotate-45">
        <FlowerSvg type={flower} />
      </div>

      {/* Center floating subtle motif */}
      <div className="absolute top-1/3 left-10 w-48 h-48 opacity-25 transform -rotate-12 hidden lg:block">
        <FlowerSvg type={flower} />
      </div>
      <div className="absolute top-2/3 right-12 w-56 h-56 opacity-25 transform rotate-45 hidden lg:block">
        <FlowerSvg type={flower} />
      </div>
    </div>
  );
};

const FlowerSvg: React.FC<{ type: FlowerWallpaper }> = ({ type }) => {
  switch (type) {
    case 'wild-rose':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#C87D6B]">
          <circle cx="100" cy="100" r="16" fill="currentColor" fillOpacity="0.25" />
          <path d="M100 65c-20 0-35 15-35 35s15 35 35 35 35-15 35-35-15-35-35-35z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
          <path d="M100 45c-30 0-55 25-55 55s25 55 55 55 55-25 55-55-25-55-55-55z" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M100 25c-42 0-75 33-75 75s33 75 75 75 75-33 75-75-33-75-75-75z" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.6"/>
          <path d="M60 40c10 20 5 40-5 60M140 40c-10 20-5 40 5 60" stroke="#7A8B6F" strokeWidth="1.2"/>
        </svg>
      );
    case 'lavender':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#7B6E94]">
          <path d="M100 180V40" stroke="#687C63" strokeWidth="2" strokeLinecap="round" />
          <path d="M85 140c8-4 15-4 15 0M115 140c-8-4-15-4-15 0" stroke="#687C63" strokeWidth="1.5" />
          <ellipse cx="94" cy="50" rx="6" ry="10" transform="rotate(-25 94 50)" fill="currentColor" fillOpacity="0.5" />
          <ellipse cx="106" cy="50" rx="6" ry="10" transform="rotate(25 106 50)" fill="currentColor" fillOpacity="0.5" />
          <ellipse cx="93" cy="70" rx="7" ry="11" transform="rotate(-30 93 70)" fill="currentColor" fillOpacity="0.6" />
          <ellipse cx="107" cy="70" rx="7" ry="11" transform="rotate(30 107 70)" fill="currentColor" fillOpacity="0.6" />
          <ellipse cx="92" cy="92" rx="7" ry="12" transform="rotate(-30 92 92)" fill="currentColor" fillOpacity="0.5" />
          <ellipse cx="108" cy="92" rx="7" ry="12" transform="rotate(30 108 92)" fill="currentColor" fillOpacity="0.5" />
          <ellipse cx="94" cy="115" rx="6" ry="10" transform="rotate(-20 94 115)" fill="currentColor" fillOpacity="0.4" />
          <ellipse cx="106" cy="115" rx="6" ry="10" transform="rotate(20 106 115)" fill="currentColor" fillOpacity="0.4" />
          <ellipse cx="100" cy="35" rx="5" ry="9" fill="currentColor" fillOpacity="0.7" />
        </svg>
      );
    case 'sunflower':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#D9822B]">
          <circle cx="100" cy="100" r="32" fill="#5A3A1E" fillOpacity="0.3" stroke="#5A3A1E" strokeWidth="1.5"/>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <path
              key={deg}
              d="M100 64C93 45 93 30 100 20C107 30 107 45 100 64Z"
              transform={`rotate(${deg} 100 100)`}
              fill="currentColor"
              fillOpacity="0.35"
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
        </svg>
      );
    case 'peony':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#D27E8C]">
          <circle cx="100" cy="100" r="24" fill="currentColor" fillOpacity="0.3" />
          <path d="M100 40c-25 0-45 15-45 40 0 35 45 65 45 65s45-30 45-65c0-25-20-40-45-40z" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5"/>
          <path d="M70 65c-20 10-25 35-15 50 15 25 45 35 45 35" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M130 65c20 10 25 35 15 50-15 25-45 35-45 35" stroke="currentColor" strokeWidth="1.2"/>
          <circle cx="100" cy="100" r="48" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 2"/>
        </svg>
      );
    case 'jasmine':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#6D8A74]">
          <circle cx="100" cy="100" r="8" fill="#F5C451" fillOpacity="0.5" />
          {[0, 72, 144, 216, 288].map((deg) => (
            <path
              key={deg}
              d="M100 90C92 65 92 45 100 30C108 45 108 65 100 90Z"
              transform={`rotate(${deg} 100 100)`}
              fill="#FFFFFF"
              fillOpacity="0.5"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          ))}
          <path d="M100 190c-10-30-5-60 0-80" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'daisy':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#E0A838]">
          <circle cx="100" cy="100" r="18" fill="currentColor" fillOpacity="0.7" />
          {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg) => (
            <line
              key={deg}
              x1="100"
              y1="82"
              x2="100"
              y2="45"
              transform={`rotate(${deg} 100 100)`}
              stroke="#A89F91"
              strokeWidth="4"
              strokeLinecap="round"
              strokeOpacity="0.4"
            />
          ))}
        </svg>
      );
    case 'cherry-blossom':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#E491A2]">
          <circle cx="100" cy="100" r="10" fill="#E86A82" fillOpacity="0.4" />
          {[0, 72, 144, 216, 288].map((deg) => (
            <path
              key={deg}
              d="M100 90C90 70 85 55 94 42C100 48 100 48 106 42C115 55 110 70 100 90Z"
              transform={`rotate(${deg} 100 100)`}
              fill="currentColor"
              fillOpacity="0.4"
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
        </svg>
      );
    case 'olive-branch':
      return (
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#5B6E52]">
          <path d="M40 160C80 130 120 90 160 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M80 130c-15-5-25-18-22-30 10 5 20 18 22 30z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
          <path d="M110 100c15-5 25-18 22-30-10 5-20 18-22 30z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
          <path d="M135 70c-15-5-25-18-22-30 10 5 20 18 22 30z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1" />
          <circle cx="95" cy="115" r="5" fill="#3D4538" fillOpacity="0.6" />
          <circle cx="125" cy="85" r="5" fill="#3D4538" fillOpacity="0.6" />
        </svg>
      );
    default:
      return null;
  }
};
