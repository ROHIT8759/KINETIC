import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  showText = true,
  size = 'md'
}) => {
  const dimensions = {
    sm: { svg: 24, text: 'text-lg' },
    md: { svg: 32, text: 'text-xl' },
    lg: { svg: 48, text: 'text-3xl' }
  };

  const { svg, text } = dimensions[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Kinetic Logo Icon - Lightning bolt forming a "K" */}
      <svg
        width={svg}
        height={svg}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="kinetic-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF8C00" />
            <stop offset="50%" stopColor="#FF6600" />
            <stop offset="100%" stopColor="#FF4500" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Left lightning stroke - forming the "K" */}
        <path
          d="M6 2L15 16L6 30H11L20 16L11 2H6Z"
          fill="url(#kinetic-gradient)"
          filter="url(#glow)"
        />
        
        {/* Right lightning stroke - adding energy/motion */}
        <path
          d="M17 2L26 16L17 30H22L31 16L22 2H17Z"
          fill="url(#kinetic-gradient)"
          fillOpacity="0.7"
          filter="url(#glow)"
        />
        
        {/* Center spark - representing the "play" element */}
        <circle cx="16" cy="16" r="2" fill="#00D9FF" opacity="0.8">
          <animate 
            attributeName="opacity" 
            values="0.8;1;0.8" 
            dur="2s" 
            repeatCount="indefinite" 
          />
        </circle>
      </svg>

      {/* Brand Text */}
      {showText && (
        <span className={`font-mono font-bold tracking-wider ${text}`}>
          <span className="text-neon-orange">KINE</span>
          <span className="text-electric-blue">TIC</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
