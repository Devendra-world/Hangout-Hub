/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, ShieldCheck, Users, IndianRupee, Wifi, Film, Calculator, MapPin, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onExploreClick: () => void;
  onReelsClick: () => void;
  onSplitterClick: () => void;
  totalSpotsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onReelsClick,
  onSplitterClick,
  totalSpotsCount
}) => {
  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] border-b border-stone-200/90 pt-12 pb-14 lg:pt-16 lg:pb-18">
      {/* Subtle warm architectural texture */}
      <div 
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#78350F 1.2px, transparent 1.2px)`,
          backgroundSize: '24px 24px'
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Proposition & Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Unboxed editorial kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-wide text-amber-800 uppercase">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                Universal Student Hangout Network
              </span>
              <span aria-hidden="true">·</span>
              <span>Ahmedabad · Gandhinagar · Delhi NCR · Bengaluru · Mumbai · Pune</span>
            </div>

            {/* Headline with balanced wrap */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-[1.14] font-heading" style={{ textWrap: 'balance' }}>
              Real per-head bills. True group seating. For every student campus.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl font-body">
              Finding a hangout spot for your college squad shouldn't mean guessing if 8 people can sit together or getting shocked by unexpected taxes. Hangout-Hub gives you <strong className="text-stone-900 font-bold">real per-person math</strong>, <strong className="text-stone-900 font-bold">guaranteed group table capacities</strong>, <strong className="text-stone-900 font-bold">verified WiFi</strong>, and <strong className="text-stone-900 font-bold">unedited Instagram reel reality checks</strong> for campuses nationwide.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-amber-700 rounded-xl hover:bg-amber-800 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>Explore {totalSpotsCount} Campus Spots</span>
              </button>

              <button
                onClick={onReelsClick}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-stone-800 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                <Film className="w-4 h-4 text-amber-700" />
                <span>Reel vs Reality Feed</span>
              </button>

              <button
                onClick={onSplitterClick}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Calculator className="w-4 h-4" />
                <span>Bill Splitter</span>
              </button>
            </div>

            {/* Clean metadata strip */}
            <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500">
              <span className="flex items-center gap-1.5 font-bold text-stone-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Audited by Student Campus Scouts
              </span>
              <span aria-hidden="true">·</span>
              <span>CEPT, HL & JG · PDPU · DU North · Christ · Mithibai · FC Road</span>
            </div>
          </div>

          {/* Right Column: Visual Focal Carrier / Interactive Mini Reality Check Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div>
                    <span className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Student Ground Reality</span>
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">
                      Food App Claims vs Hangout-Hub
                    </h3>
                  </div>
                  <span className="text-xs text-stone-400">Audited Oct 2026</span>
                </div>

                {/* Side by side comparison */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700/60 space-y-1.5">
                    <span className="text-stone-400 font-medium">Food Delivery Apps</span>
                    <div className="text-xl font-bold text-stone-200 tabular-nums">
                      ₹750 <span className="text-xs font-normal text-stone-400">for two</span>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-tight">
                      ✕ Excludes 5% GST & 10% Service Fee<br />
                      ✕ Assumes 1 pasta + 2 coffees<br />
                      ✕ No seating capacity listed
                    </p>
                  </div>

                  <div className="bg-amber-950/40 p-3.5 rounded-2xl border border-amber-600/40 space-y-1.5">
                    <span className="text-amber-400 font-bold">Hangout-Hub Scout</span>
                    <div className="text-xl font-bold text-amber-300 tabular-nums">
                      ₹160 <span className="text-xs font-normal text-amber-400/80">/person net</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-tight">
                      ✓ Real student combo: Tea + Pizza Slice + Samosa<br />
                      ✓ Sits group of 14 on amphitheatre steps<br />
                      ✓ 35 Mbps WiFi checked
                    </p>
                  </div>
                </div>

                {/* Local quote */}
                <div className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/40 text-xs text-stone-300 italic">
                  "At Amdavad ni Gufa and HL Six Roads, you can sit with 10 classmates and spend under ₹100–₹160 per person without anyone telling you to leave."
                  <div className="not-italic text-[11px] font-bold text-amber-400 mt-1">
                    — CEPT, HL & JG College Scout Network
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 4 Quantitative Proof Metrics */}
        <div className="mt-12 pt-8 border-t border-stone-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-2xl font-extrabold text-stone-900 tabular-nums">
              <Users className="w-5 h-5 text-amber-700" />
              <span>Up to 20</span>
            </div>
            <div className="text-xs font-bold text-stone-900">True Group Seating</div>
            <div className="text-[11px] text-stone-500">Amphitheatre steps, long benches & cabanas</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-2xl font-extrabold text-stone-900 tabular-nums">
              <IndianRupee className="w-5 h-5 text-emerald-700" />
              <span>₹55 – ₹340</span>
            </div>
            <div className="text-xs font-bold text-stone-900">Real Per-Person Net Spend</div>
            <div className="text-[11px] text-stone-500">From HL frothy cold coffee to SBR courtyards</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-2xl font-extrabold text-stone-900 tabular-nums">
              <Film className="w-5 h-5 text-indigo-700" />
              <span>100% Unedited</span>
            </div>
            <div className="text-xs font-bold text-stone-900">Instagram Reel Truth Audits</div>
            <div className="text-[11px] text-stone-500">No 0.5x wide lens or filter deception</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-2xl font-extrabold text-stone-900 tabular-nums">
              <Wifi className="w-5 h-5 text-blue-700" />
              <span>120 Mbps</span>
            </div>
            <div className="text-xs font-bold text-stone-900">Verified Fiber & Sockets</div>
            <div className="text-[11px] text-stone-500">Tested at Vastrapur & Navrangpura study spots</div>
          </div>

        </div>

      </div>
    </section>
  );
};
