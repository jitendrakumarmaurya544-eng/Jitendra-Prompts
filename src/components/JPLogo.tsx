import React from 'react';

interface JPLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
}

export const JPLogo: React.FC<JPLogoProps> = ({ size = 'md', withText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const textClasses = {
    sm: 'text-sm font-semibold tracking-wider',
    md: 'text-lg font-bold tracking-widest',
    lg: 'text-2xl font-black tracking-widest',
    xl: 'text-3xl font-black tracking-widest',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 3D Metallic Gold Monogram Badge */}
      <div
        className={`relative ${sizeClasses[size]} rounded-xl flex items-center justify-center font-display font-black tracking-tighter shadow-[0_4px_20px_rgba(212,175,55,0.35)] transition-transform duration-300 hover:scale-105`}
        style={{
          background: 'linear-gradient(135deg, #18140B 0%, #080704 100%)',
          border: '1.5px solid rgba(245, 215, 122, 0.6)',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.25), inset 0 1px 1px rgba(255, 241, 197, 0.4)',
        }}
      >
        {/* Subtle gold inner glow ring */}
        <div className="absolute inset-0.5 rounded-[10px] border border-[#D4AF37]/30 pointer-events-none" />

        {/* JP Text with Metallic Gold Gradient */}
        <span
          className="relative z-10 font-black gold-text-gradient-bright drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          style={{ letterSpacing: '-0.05em' }}
        >
          JP
        </span>

        {/* Mini crown/star sparkle accent at top corner */}
        <span className="absolute -top-1 -right-1 text-[8px] text-[#F5D77A] drop-shadow-[0_0_4px_#F5D77A]">
          ✦
        </span>
      </div>

      {withText && (
        <div className="flex flex-col">
          <span className={`font-display font-extrabold uppercase text-white tracking-widest flex items-center gap-1.5 ${textClasses[size]}`}>
            JITENDRA <span className="gold-text-gradient">PROMPTS</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#A5A5A5] font-medium -mt-0.5">
            Create Better. Prompt Smarter.
          </span>
        </div>
      )}
    </div>
  );
};
