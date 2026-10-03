import React, { useState } from 'react';
import { SportsTeam } from '../types';
import { Trophy } from 'lucide-react';

interface TeamLogoProps {
  team: SportsTeam;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const TeamLogo: React.FC<TeamLogoProps> = ({ team, className = '', size = 'md' }) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const isBroncos = team.name.toLowerCase().includes('bronco');

  // If Broncos specifically, or if there's no error and we have a logoUrl
  if (team.logoUrl && !hasError) {
    return (
      <div
        className={`${sizeClasses[size]} shrink-0 rounded-full flex items-center justify-center p-1 bg-white border border-[#E8DFD3] shadow-xs ${className}`}
      >
        <img
          src={team.logoUrl}
          alt={`${team.name} official logo`}
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  // Built-in Denver Broncos vector emblem fallback
  if (isBroncos) {
    return (
      <div
        className={`${sizeClasses[size]} shrink-0 rounded-full flex items-center justify-center p-1 bg-[#002244] border-2 border-[#FB4F14] shadow-xs text-white ${className}`}
        title="Denver Broncos Logo"
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Stylized Broncos Horse Head Vector */}
          <path
            d="M20 75C25 55 35 35 60 25C75 18 85 20 85 20C85 20 80 28 72 32C85 30 92 35 92 35C80 44 70 48 55 52C45 55 35 68 32 78L20 75Z"
            fill="white"
          />
          <path
            d="M60 25C65 35 62 45 52 50C62 48 72 44 78 35C72 30 65 26 60 25Z"
            fill="#FB4F14"
          />
          <circle cx="68" cy="28" r="3" fill="#FB4F14" />
          <path
            d="M38 48C45 42 55 38 70 30"
            stroke="#FB4F14"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // Stylized Monogram Badge with Team Colors
  const initials = team.name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  const primary = team.primaryColor || '#002244';
  const secondary = team.secondaryColor || '#FB4F14';

  return (
    <div
      className={`${sizeClasses[size]} shrink-0 rounded-full flex items-center justify-center font-bold font-mono text-xs border shadow-xs ${className}`}
      style={{
        backgroundColor: primary,
        borderColor: secondary,
        color: secondary === '#000000' ? '#FFFFFF' : secondary,
      }}
      title={`${team.name} (${team.league})`}
    >
      <span>{initials}</span>
    </div>
  );
};
