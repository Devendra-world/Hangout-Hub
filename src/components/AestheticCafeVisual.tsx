/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HangoutSpot } from '../types/index.ts';
import { Film, MapPin } from 'lucide-react';

interface AestheticCafeVisualProps {
  spot: HangoutSpot;
  size?: 'card' | 'hero' | 'modal' | 'reel';
}

export const AestheticCafeVisual: React.FC<AestheticCafeVisualProps> = ({ spot, size = 'card' }) => {
  const { id, vibeCategory, city, campusName, neighborhood } = spot;

  // Render high-aesthetic vector scene with rich atmosphere
  const renderAtmosphericScene = () => {
    switch (id) {
      case 'spot-zen-gufa':
        // Zen Cafe @ Amdavad ni Gufa (Architectural cave domes, neem trees, open amphitheatre)
        return (
          <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="gufa-sky" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4A3B32" />
                <stop offset="45%" stopColor="#8A5A36" />
                <stop offset="85%" stopColor="#D48B47" />
                <stop offset="100%" stopColor="#E2A668" />
              </linearGradient>
              <radialGradient id="sun-glow" cx="65%" cy="35%" r="45%">
                <stop offset="0%" stopColor="#FFF1D6" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#FFB347" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="gufa-stone" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C9B8A3" />
                <stop offset="60%" stopColor="#A89279" />
                <stop offset="100%" stopColor="#6E5A44" />
              </linearGradient>
            </defs>
            <rect width="600" height="400" fill="url(#gufa-sky)" />
            <circle cx="420" cy="140" r="130" fill="url(#sun-glow)" />
            <path d="M 80 400 C 80 270, 190 230, 270 280 C 330 240, 440 230, 480 320 C 510 290, 570 300, 600 350 L 600 400 Z" fill="url(#gufa-stone)" />
            <ellipse cx="200" cy="270" rx="35" ry="18" fill="#524333" opacity="0.6" />
            <ellipse cx="380" cy="260" rx="42" ry="22" fill="#524333" opacity="0.6" />
            <g fill="#2D3A27" opacity="0.85">
              <circle cx="50" cy="80" r="90" />
              <circle cx="140" cy="50" r="80" />
              <circle cx="220" cy="70" r="70" />
              <circle cx="540" cy="60" r="95" />
              <circle cx="470" cy="40" r="75" />
            </g>
            <path d="M 0 350 Q 300 330 600 350 L 600 400 L 0 400 Z" fill="#2C211A" />
            <rect x="220" y="325" width="160" height="25" rx="5" fill="#8C5C38" />
            <rect x="240" y="310" width="16" height="22" rx="3" fill="#D97736" />
            <rect x="265" y="312" width="14" height="20" rx="3" fill="#D97736" />
            <rect x="330" y="315" width="28" height="15" rx="3" fill="#FAF5EF" />
            <polygon points="420,0 480,0 360,400 280,400" fill="#FFF9E6" opacity="0.08" />
          </svg>
        );

      case 'spot-shambhu-hl':
      case 'spot-pune-goodluck':
        // Shambhu's HL Spot / Goodluck Cafe (Cold coffee glass, chai, street bench)
        return (
          <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="hl-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2A170F" />
                <stop offset="60%" stopColor="#4A2616" />
                <stop offset="100%" stopColor="#1B0C06" />
              </linearGradient>
              <linearGradient id="coffee-flow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E6CDB8" />
                <stop offset="35%" stopColor="#9C6B46" />
                <stop offset="85%" stopColor="#5C361D" />
                <stop offset="100%" stopColor="#3A1C0B" />
              </linearGradient>
            </defs>
            <rect width="600" height="400" fill="url(#hl-bg)" />
            <circle cx="120" cy="90" r="35" fill="#FBBF24" opacity="0.25" />
            <circle cx="210" cy="60" r="45" fill="#F59E0B" opacity="0.2" />
            <circle cx="480" cy="80" r="50" fill="#FBBF24" opacity="0.25" />
            <rect x="0" y="270" width="600" height="130" fill="#24140C" />
            <g transform="translate(230, 90)">
              <path d="M 30 50 L 45 220 C 45 235, 95 235, 95 220 L 110 50 Z" fill="url(#coffee-flow)" stroke="#FFF" strokeWidth="2" strokeOpacity="0.4" />
              <ellipse cx="70" cy="50" rx="40" ry="14" fill="#FDF7F0" />
              <ellipse cx="70" cy="46" rx="35" ry="10" fill="#E8D3BF" />
              <circle cx="60" cy="44" r="2.5" fill="#3D1D0D" />
              <circle cx="75" cy="47" r="2" fill="#3D1D0D" />
              <circle cx="82" cy="43" r="2" fill="#3D1D0D" />
              <line x1="85" y1="15" x2="65" y2="170" stroke="#E11D48" strokeWidth="7" strokeLinecap="round" />
            </g>
            <ellipse cx="140" cy="330" rx="65" ry="22" fill="#FDFBF7" opacity="0.9" />
            <polygon points="110,325 160,310 165,335 125,340" fill="#D97706" />
          </svg>
        );

      case 'spot-caffix-tech':
      case 'spot-blr-thirdwave':
        // Caffix Tech Cafe / Third Wave Loft (Laptop coding, glasshouse windows, coffee)
        return (
          <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="tech-sky" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0B132B" />
                <stop offset="60%" stopColor="#1C2541" />
                <stop offset="100%" stopColor="#0A0E17" />
              </linearGradient>
              <linearGradient id="screen-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#818CF8" />
              </linearGradient>
            </defs>
            <rect width="600" height="400" fill="url(#tech-sky)" />
            <line x1="180" y1="0" x2="180" y2="280" stroke="#334155" strokeWidth="3" />
            <line x1="420" y1="0" x2="420" y2="280" stroke="#334155" strokeWidth="3" />
            <polygon points="0,270 600,270 600,400 0,400" fill="#1E293B" />
            <rect x="0" y="270" width="600" height="15" fill="#334155" />
            <g transform="translate(210, 160)">
              <polygon points="20,20 160,20 170,120 10,120" fill="#0F172A" stroke="#94A3B8" strokeWidth="3" />
              <polygon points="26,26 154,26 164,114 16,114" fill="url(#screen-glow)" opacity="0.9" />
              <polygon points="0,120 180,120 195,145 -15,145" fill="#E2E8F0" />
            </g>
            <rect x="420" y="300" width="130" height="28" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
            <circle cx="445" cy="314" r="5" fill="#22C55E" />
            <circle cx="470" cy="314" r="5" fill="#38BDF8" />
            <circle cx="495" cy="314" r="5" fill="#38BDF8" />
            <rect x="120" y="220" width="38" height="60" rx="8" fill="#5B331A" stroke="#FFF" strokeWidth="1.5" strokeOpacity="0.5" />
          </svg>
        );

      case 'spot-roastery-sbr':
      case 'spot-project-cafe':
        // Roastery SBR / Project Cafe (Brick courtyard, tropical plants, pour-over)
        return (
          <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="sbr-brick" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7F2F20" />
                <stop offset="50%" stopColor="#A8432F" />
                <stop offset="100%" stopColor="#632115" />
              </linearGradient>
            </defs>
            <rect width="600" height="400" fill="#EFE8DE" />
            <path d="M 40 400 L 40 180 Q 300 30 560 180 L 560 400 Z" fill="url(#sbr-brick)" />
            <path d="M 120 400 L 120 220 Q 300 110 480 220 L 480 400 Z" fill="#F7F2EB" />
            <g fill="#1E3A2F" opacity="0.9">
              <path d="M 80 400 C 60 300, 110 240, 180 270 C 130 330, 100 400, 80 400 Z" />
              <path d="M 450 400 C 500 310, 460 250, 400 275 C 430 340, 440 400, 450 400 Z" />
            </g>
            <rect x="180" y="320" width="240" height="80" rx="8" fill="#543725" />
            <g transform="translate(280, 240)">
              <polygon points="10,0 30,0 20,40 35,75 5,75 20,40" fill="#D9822B" stroke="#FFF" strokeWidth="2" strokeOpacity="0.6" />
              <rect x="14" y="35" width="12" height="10" rx="2" fill="#B45309" />
            </g>
          </svg>
        );

      case 'spot-mocha-cabanas':
      case 'spot-delhi-tomuncle':
        // Mocha Cabanas / Late Night Terrace (Twilight cabana, fairy lights)
        return (
          <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="twilight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E1B4B" />
                <stop offset="40%" stopColor="#431407" />
                <stop offset="80%" stopColor="#9A3412" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
            </defs>
            <rect width="600" height="400" fill="url(#twilight)" />
            <line x1="80" y1="0" x2="80" y2="400" stroke="#78350F" strokeWidth="12" />
            <line x1="520" y1="0" x2="520" y2="400" stroke="#78350F" strokeWidth="12" />
            <line x1="40" y1="80" x2="560" y2="80" stroke="#78350F" strokeWidth="14" />
            <path d="M 80 80 Q 140 220 110 400 L 70 400 Z" fill="#FDFBF7" opacity="0.6" />
            <path d="M 520 80 Q 460 220 490 400 L 530 400 Z" fill="#FDFBF7" opacity="0.6" />
            <g fill="#FEF08A">
              <circle cx="130" cy="82" r="8" opacity="0.95" />
              <circle cx="210" cy="82" r="8" opacity="0.95" />
              <circle cx="290" cy="82" r="9" opacity="0.95" />
              <circle cx="370" cy="82" r="8" opacity="0.95" />
            </g>
            <polygon points="120,320 480,320 540,400 60,400" fill="#291A10" />
            <ellipse cx="300" cy="355" rx="90" ry="25" fill="#D97706" />
          </svg>
        );

      case 'spot-unlocked-games':
        // Unlocked Game Den
        return (
          <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="game-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E1035" />
                <stop offset="60%" stopColor="#311855" />
                <stop offset="100%" stopColor="#120824" />
              </linearGradient>
            </defs>
            <rect width="600" height="400" fill="url(#game-bg)" />
            <path d="M 0 50 Q 300 120 600 50" fill="none" stroke="#FDE047" strokeWidth="2" opacity="0.4" />
            <circle cx="100" cy="70" r="10" fill="#FDE047" opacity="0.8" />
            <circle cx="230" cy="88" r="10" fill="#FDE047" opacity="0.8" />
            <circle cx="370" cy="88" r="10" fill="#FDE047" opacity="0.8" />
            <polygon points="40,250 560,250 600,400 0,400" fill="#2E1C47" />
            <polygon points="260,280 290,265 320,280 320,310 290,325 260,310" fill="#EAB308" opacity="0.85" />
            <polygon points="325,280 355,265 385,280 385,310 355,325 325,310" fill="#16A34A" opacity="0.85" />
            <rect x="180" y="300" width="35" height="35" rx="6" fill="#F8FAFC" transform="rotate(15 180 300)" />
          </svg>
        );

      default:
        // Dynamic, high-aesthetic atmospheric backdrop for ANY custom or newly added place based on vibe!
        if (vibeCategory === 'Study & Projects') {
          return (
            <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="gen-study" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0F172A" />
                  <stop offset="60%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#090D16" />
                </linearGradient>
              </defs>
              <rect width="600" height="400" fill="url(#gen-study)" />
              <line x1="200" y1="0" x2="200" y2="300" stroke="#334155" strokeWidth="2" />
              <line x1="400" y1="0" x2="400" y2="300" stroke="#334155" strokeWidth="2" />
              <polygon points="0,290 600,290 600,400 0,400" fill="#1E293B" />
              <rect x="230" y="210" width="140" height="80" rx="8" fill="#38BDF8" opacity="0.85" />
              <circle cx="480" cy="100" r="45" fill="#38BDF8" opacity="0.15" />
            </svg>
          );
        } else if (vibeCategory === 'Budget Bite & Chill') {
          return (
            <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="gen-budget" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#31190D" />
                  <stop offset="60%" stopColor="#5E311B" />
                  <stop offset="100%" stopColor="#221008" />
                </linearGradient>
              </defs>
              <rect width="600" height="400" fill="url(#gen-budget)" />
              <circle cx="150" cy="80" r="60" fill="#F59E0B" opacity="0.25" />
              <circle cx="450" cy="120" r="80" fill="#D97706" opacity="0.2" />
              <rect x="0" y="280" width="600" height="120" fill="#1F0E07" />
              <rect x="250" y="220" width="65" height="100" rx="10" fill="#D97706" opacity="0.9" />
              <line x1="290" y1="180" x2="275" y2="280" stroke="#E11D48" strokeWidth="6" />
            </svg>
          );
        } else if (vibeCategory === 'Late Night Hangout') {
          return (
            <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="gen-night" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0F172A" />
                  <stop offset="50%" stopColor="#2E1065" />
                  <stop offset="100%" stopColor="#0B061A" />
                </linearGradient>
              </defs>
              <rect width="600" height="400" fill="url(#gen-night)" />
              <g fill="#FEF08A">
                <circle cx="80" cy="90" r="12" opacity="0.8" />
                <circle cx="200" cy="110" r="10" opacity="0.9" />
                <circle cx="340" cy="95" r="14" opacity="0.85" />
                <circle cx="490" cy="115" r="12" opacity="0.8" />
              </g>
              <path d="M 0 320 Q 300 280 600 320 L 600 400 L 0 400 Z" fill="#170F2E" />
            </svg>
          );
        } else {
          return (
            <svg className="absolute inset-0 w-full h-full object-cover" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="gen-aesthetic" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B261A" />
                  <stop offset="50%" stopColor="#6C4127" />
                  <stop offset="100%" stopColor="#1E120B" />
                </linearGradient>
              </defs>
              <rect width="600" height="400" fill="url(#gen-aesthetic)" />
              <circle cx="300" cy="140" r="120" fill="#FBBF24" opacity="0.18" />
              <g fill="#213E2E" opacity="0.8">
                <circle cx="100" cy="380" r="100" />
                <circle cx="500" cy="380" r="100" />
              </g>
              <rect x="0" y="320" width="600" height="80" fill="#1C1008" />
            </svg>
          );
        }
    }
  };

  const heightClass = size === 'modal' ? 'h-72 sm:h-80' : 'h-52 sm:h-56';

  // Dynamic sticker tag showing campus and location
  const getAestheticSticker = () => {
    if (campusName) {
      return `${campusName} 🌿`;
    }
    if (city && neighborhood) {
      return `${neighborhood}, ${city} ✨`;
    }
    return `${neighborhood || 'Campus Scout'} ✨`;
  };

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden rounded-t-3xl bg-[#1F150F] flex flex-col justify-between p-5 text-white select-none group`}>
      
      {/* High-Fidelity Atmospheric Scene Graphic */}
      {renderAtmosphericScene()}

      {/* Film Grain & Scrim Overlay for crisp legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/30 pointer-events-none" />

      {/* Top Bar: Aesthetic Sticker & Price Tag */}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FAF8F5]/95 text-[#2E1810] shadow-md tracking-tight backdrop-blur-sm truncate max-w-[260px]">
          <span className="truncate">{getAestheticSticker()}</span>
        </span>

        {/* Real Per-Person Price Badge */}
        <div className="bg-[#1C140E]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-right shadow-lg shrink-0">
          <div className="text-xs font-black text-[#FBBF24] tabular-nums font-heading">
            ₹{spot.realPerPersonCost.avg} <span className="text-[10px] font-normal text-white/80">/head</span>
          </div>
        </div>
      </div>

      {/* For modal: show Title & Tagline in banner */}
      {size === 'modal' ? (
        <>
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="font-bold text-amber-300 tracking-wider uppercase font-heading">
                {spot.vibeCategory}
              </span>
              <span className="text-white/40">·</span>
              <span className="text-white/90 font-medium truncate max-w-[220px]">
                {spot.city ? `${spot.neighborhood}, ${spot.city}` : spot.neighborhood}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-md font-heading line-clamp-1">
              {spot.name}
            </h3>

            <p className="text-xs text-stone-200/90 line-clamp-1 font-medium">
              {spot.tagline}
            </p>
          </div>

          {spot.reelRealityCheck.hasReel && (
            <div className="absolute right-4 bottom-4 z-10 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-white/90">
              <Film className="w-3 h-3 text-amber-400" />
              <span>{spot.reelRealityCheck.realityScore}% Truth</span>
            </div>
          )}
        </>
      ) : (
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[10px] font-bold text-amber-200 tracking-wider uppercase bg-black/45 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/10">
            {spot.vibeCategory}
          </span>
        </div>
      )}

    </div>
  );
};
