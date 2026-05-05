import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'principal' | 'horizontal' | 'icon';
  color?: 'default' | 'monochrome-black' | 'monochrome-white';
}

export const IZIPISLogo: React.FC<LogoProps> = ({ 
  className = "", 
  variant = 'principal',
  color = 'default' 
}) => {
  const colors = {
    default: {
      primary: '#0D3335',
      secondary: '#1A5F60',
      accent: '#E87A5D'
    },
    'monochrome-black': {
      primary: '#000000',
      secondary: '#000000',
      accent: '#000000'
    },
    'monochrome-white': {
      primary: '#FFFFFF',
      secondary: '#FFFFFF',
      accent: '#FFFFFF'
    }
  };

  const selectedColors = colors[color];

  const Symbol = () => (
    <svg 
      viewBox="0 0 100 100" 
      className="w-full h-full drop-shadow-sm"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={selectedColors.primary} />
          <stop offset="100%" stopColor={selectedColors.secondary} />
        </linearGradient>
      </defs>
      
      {/* Decorative Grid Lines - Technical Look */}
      <g opacity="0.1" stroke={selectedColors.primary} strokeWidth="0.5">
        <line x1="0" y1="20" x2="100" y2="20" />
        <line x1="0" y1="50" x2="100" y2="50" />
        <line x1="0" y1="80" x2="100" y2="80" />
        <line x1="20" y1="0" x2="20" y2="100" />
        <line x1="50" y1="0" x2="50" y2="100" />
        <line x1="80" y1="0" x2="80" y2="100" />
      </g>

      {/* Constructive "Z" */}
      <rect x="20" y="20" width="60" height="12" rx="1" fill="url(#primaryGradient)" />
      <path 
        d="M80 20L20 80H35L95 20H80Z" 
        fill={selectedColors.secondary} 
      />
      <rect x="20" y="68" width="60" height="12" rx="1" fill={selectedColors.primary} />
      
      {/* Precision Detail - The Accent */}
      <circle cx="85" cy="80" r="6" fill={selectedColors.accent} className="animate-pulse" />
      <circle cx="85" cy="80" r="10" stroke={selectedColors.accent} strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`w-10 h-10 ${className}`}>
        <Symbol />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10">
          <Symbol />
        </div>
        <span className="font-heading font-extrabold text-2xl tracking-tighter" style={{ color: selectedColors.primary }}>
          IZIPIS
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="w-20 h-20">
        <Symbol />
      </div>
      <span className="font-heading font-extrabold text-3xl tracking-widest mt-1" style={{ color: selectedColors.primary }}>
        IZIPIS
      </span>
    </div>
  );
};
