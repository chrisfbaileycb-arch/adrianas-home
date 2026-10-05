import React from 'react';

interface TeamLogoProps {
  teamName: string;
  className?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({ teamName, className = 'w-6 h-6' }) => {
  // SVG silhouettes for popular sports teams
  const name = teamName.toLowerCase();

  if (name.includes('broncos')) {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#002244" />
        <path d="M20,65 Q35,35 60,30 Q80,25 85,45 Q75,40 65,45 Q55,50 45,70 Q30,70 20,65 Z" fill="#FB4F14" />
        <circle cx="65" cy="38" r="4" fill="#FFFFFF" />
      </svg>
    );
  }

  if (name.includes('avalanche')) {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#6F263D" />
        <path d="M50,15 L78,75 L62,75 L50,45 L38,75 L22,75 Z" fill="#236192" />
        <path d="M30,55 Q50,40 70,60 Q50,75 30,55 Z" fill="#FFFFFF" opacity="0.8" />
      </svg>
    );
  }

  if (name.includes('rockies')) {
    return (
      <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="#33006F" />
        <polygon points="50,20 20,75 80,75" fill="#C4CED4" />
        <polygon points="50,20 35,45 65,45" fill="#FFFFFF" />
        <circle cx="50" cy="58" r="10" fill="#000000" />
      </svg>
    );
  }

  // Default elegant crest
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="#B84A2A" />
      <path d="M30,30 L70,30 L50,70 Z" fill="#FAF7F2" />
    </svg>
  );
};
