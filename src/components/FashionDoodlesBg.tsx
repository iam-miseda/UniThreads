import React from 'react';

export const FashionDoodlesBg: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-[0.06] dark:opacity-[0.12] text-neutral-900 dark:text-neutral-100 transition-opacity duration-300" 
      aria-hidden="true"
    >
      {/* Repeating Fashion Sketches & Atelier Doodles */}
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <defs>
          <pattern id="fashion-doodles-pattern" width="360" height="360" patternUnits="userSpaceOnUse">
            {/* 1. Coat Hanger Doodle */}
            <g transform="translate(30, 25) scale(0.9)" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M40,12 C40,5 34,0 28,0 C22,0 18,5 20,10 C22,14 26,16 26,20" />
              <path d="M26,20 L2,44 L50,44 Z" />
              <line x1="2" y1="44" x2="50" y2="44" strokeWidth="2.2" />
            </g>

            {/* 2. Sneaker / High-Top Doodle */}
            <g transform="translate(200, 30) scale(0.85)" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5,40 L60,40 C65,40 68,36 68,32 L65,18 L50,15 L42,10 L35,10 L30,22 L10,26 C6,27 4,31 5,35 Z" />
              <path d="M8,34 C16,34 35,33 64,33" />
              <line x1="33" y1="18" x2="43" y2="20" />
              <line x1="32" y1="23" x2="40" y2="25" />
              <circle cx="55" cy="24" r="5" strokeWidth="1.2" />
            </g>

            {/* 3. Thread Loop & Needle (UniThread Brand Motif) */}
            <g transform="translate(40, 150) scale(0.95)" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round">
              {/* Needle */}
              <path d="M50,10 L15,45" strokeWidth="2.2" />
              <circle cx="50" cy="10" r="1.5" fill="currentColor" />
              {/* Looping Thread */}
              <path d="M50,10 C65,-5 80,15 70,30 C60,45 35,35 45,55 C55,75 80,60 90,75" strokeDasharray="3 3" />
            </g>

            {/* 4. Denim Jacket Outline */}
            <g transform="translate(220, 160) scale(0.8)" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Collar */}
              <path d="M25,5 L35,18 L45,18 L55,5" />
              {/* Body */}
              <path d="M25,5 L5,18 L10,55 L70,55 L75,18 L55,5" />
              <line x1="40" y1="18" x2="40" y2="55" />
              {/* Chest Pockets */}
              <rect x="18" y="25" width="10" height="10" rx="1" />
              <rect x="52" y="25" width="10" height="10" rx="1" />
            </g>

            {/* 5. Safety Pin Doodle */}
            <g transform="translate(140, 95) scale(0.85) rotate(25)" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5,10 L45,10 C50,10 52,14 48,18 L15,18 C12,18 10,22 14,24 L48,24" />
              <rect x="42" y="7" width="10" height="20" rx="2" />
            </g>

            {/* 6. Tailor Measuring Tape */}
            <g transform="translate(25, 270) scale(0.9)" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round">
              <path d="M5,20 C35,5 65,35 95,20 C125,5 155,30 185,15" />
              <line x1="20" y1="15" x2="20" y2="21" />
              <line x1="35" y1="18" x2="35" y2="24" />
              <line x1="50" y1="24" x2="50" y2="30" />
              <line x1="65" y1="28" x2="65" y2="34" />
              <line x1="80" y1="22" x2="80" y2="28" />
              <line x1="110" y1="12" x2="110" y2="18" />
              <line x1="140" y1="18" x2="140" y2="24" />
            </g>

            {/* 7. Retro Sunglasses Doodle */}
            <g transform="translate(230, 275) scale(0.85)" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="10" width="22" height="15" rx="3" />
              <rect x="37" y="10" width="22" height="15" rx="3" />
              <path d="M27,14 C30,12 34,12 37,14" />
              <line x1="5" y1="12" x2="0" y2="8" />
              <line x1="59" y1="12" x2="64" y2="8" />
            </g>

            {/* 8. Tailor Scissors Doodle */}
            <g transform="translate(130, 210) scale(0.8)" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="15" cy="40" r="7" />
              <circle cx="35" cy="40" r="7" />
              <line x1="18" y1="34" x2="38" y2="10" />
              <line x1="32" y1="34" x2="12" y2="10" />
              <circle cx="25" cy="24" r="1.5" fill="currentColor" />
            </g>

            {/* 9. Fashion Sparkles & Buttons */}
            <g transform="translate(130, 20)">
              <path d="M10,0 L12,7 L19,10 L12,13 L10,20 L8,13 L1,10 L8,7 Z" fill="currentColor" />
            </g>

            <g transform="translate(320, 110)">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="6" cy="6" r="1" fill="currentColor" />
              <circle cx="10" cy="6" r="1" fill="currentColor" />
              <circle cx="6" cy="10" r="1" fill="currentColor" />
              <circle cx="10" cy="10" r="1" fill="currentColor" />
            </g>

            <g transform="translate(180, 310)">
              <path d="M8,0 L9,5 L14,7 L9,9 L8,14 L7,9 L2,7 L7,5 Z" fill="currentColor" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fashion-doodles-pattern)" />
      </svg>
    </div>
  );
};
