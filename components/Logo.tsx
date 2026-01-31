
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-full h-full" }) => {
  return (
    <svg 
      viewBox="0 0 200 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4d00" />
          <stop offset="100%" stopColor="#ff4d00" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Shield Base */}
      <path 
        d="M20 40 L100 10 L180 40 V120 C180 170 140 210 100 230 C60 210 20 170 20 120 V40Z" 
        fill="#0f172a" 
        stroke="url(#shieldBorder)" 
        strokeWidth="6"
      />
      
      {/* Inner Shield Glow */}
      <path 
        d="M35 55 L100 30 L165 55 V115 C165 155 135 185 100 205 C65 185 35 155 35 115 V55Z" 
        fill="#020617" 
        opacity="0.8"
      />

      {/* Hooded Figure Silhouette */}
      <path 
        d="M100 60 C80 60 65 80 65 110 C65 130 75 160 50 180 L150 180 C125 160 135 130 135 110 C135 80 120 60 100 60Z" 
        fill="#000" 
      />
      <path 
        d="M100 65 C85 65 72 82 72 105 C72 115 78 135 85 145 L115 145 C122 135 128 115 128 105 C128 82 115 65 100 65Z" 
        fill="#0a0a0a" 
      />

      {/* Glowing Eyes */}
      <circle cx="88" cy="100" r="4" fill="#ff4d00" filter="url(#glow)" />
      <circle cx="112" cy="100" r="4" fill="#ff4d00" filter="url(#glow)" />
      
      {/* Central Core Glow */}
      <circle cx="100" cy="145" r="15" fill="#ff4d00" opacity="0.3" filter="url(#glow)" />
      <circle cx="100" cy="145" r="5" fill="#fff" filter="url(#glow)" />

      {/* Horns on the shield corners (Lucifer Style) */}
      <path d="M40 35 L25 15 L55 30 Z" fill="#991b1b" />
      <path d="M160 35 L175 15 L145 30 Z" fill="#991b1b" />
    </svg>
  );
};

export default Logo;
