/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HangoutSpot } from '../types/index.ts';
import { AestheticCafeVisual } from './AestheticCafeVisual.tsx';
import { ExternalLink, AlertCircle, CheckCircle2, ArrowRight, Film, MapPin } from 'lucide-react';

interface ReelRealityFeedProps {
  spots: HangoutSpot[];
  onSelectSpot: (spot: HangoutSpot) => void;
}

export const ReelRealityFeed: React.FC<ReelRealityFeedProps> = ({ spots, onSelectSpot }) => {
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'hype'>('all');

  const reelSpots = spots.filter((s) => s.reelRealityCheck.hasReel);

  const filteredReelSpots = reelSpots.filter((s) => {
    if (filterType === 'verified') return s.reelRealityCheck.realityScore >= 88;
    if (filterType === 'hype') return s.reelRealityCheck.realityScore < 88;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-[#33271F] pb-6">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            <span>Campus Social Media Reality Audits</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-heading">
            Instagram Reel vs Ground Reality
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed font-body">
            30-second viral reels often use ultra-wide 0.5x lenses and color filters to make cramped 2-person tables look like sprawling spaces. Here is what campus student scouts found when walking in with real squads of 6+.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-[#241C17] border border-stone-200/70 dark:border-[#382B22] p-1 rounded-xl shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-white dark:bg-amber-600 text-stone-900 dark:text-white font-bold shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            All Reels ({reelSpots.length})
          </button>
          <button
            onClick={() => setFilterType('verified')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'verified'
                ? 'bg-white dark:bg-amber-600 text-stone-900 dark:text-white font-bold shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            High Reality (88%+)
          </button>
          <button
            onClick={() => setFilterType('hype')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === 'hype'
                ? 'bg-white dark:bg-amber-600 text-stone-900 dark:text-white font-bold shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Hype Discrepancies
          </button>
        </div>
      </div>

      {/* Reel Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReelSpots.map((spot) => {
          const isHighReality = spot.reelRealityCheck.realityScore >= 88;

          return (
            <div
              key={spot.id}
              className="bg-white dark:bg-[#1C1612] rounded-3xl border border-stone-200/90 dark:border-[#33271F] overflow-hidden shadow-xs hover:border-amber-400 dark:hover:border-amber-500/80 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              {/* Top Visual Component */}
              <AestheticCafeVisual spot={spot} size="card" />

              {/* Reel Card Header */}
              <div className="p-5 border-b border-stone-100 dark:border-[#2E231C] flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{spot.neighborhood}</span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                    {spot.name}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold tabular-nums border ${
                      isHighReality
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
                    }`}
                  >
                    {spot.reelRealityCheck.realityScore}% Truth
                  </span>
                  <div className="text-[10px] text-stone-400 dark:text-stone-400 mt-0.5">
                    {isHighReality ? 'Scout Verified' : 'Hype Alert'}
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison Box */}
              <div className="p-5 space-y-4">
                
                {/* Reel Claim Box */}
                <div className="bg-stone-50 dark:bg-[#251D17] rounded-2xl p-4 border border-stone-200/90 dark:border-[#3A2D23] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                    <span className="font-bold text-stone-700 dark:text-stone-200 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                      What the Viral Reel Claimed:
                    </span>
                    <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-400">
                      {spot.reelRealityCheck.reelCreator}
                    </span>
                  </div>
                  <p className="text-stone-800 dark:text-stone-200 italic bg-white dark:bg-[#1B1410] p-2.5 rounded-xl border border-stone-200/60 dark:border-[#33271F] leading-relaxed">
                    "{spot.reelRealityCheck.reelHypeClaim}"
                  </p>
                </div>

                {/* Ground Truth Box */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/35 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      What Campus Scouts Found:
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      Field Audited
                    </span>
                  </div>
                  <p className="text-stone-800 dark:text-stone-200 bg-white dark:bg-[#1B1410] p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50 leading-relaxed">
                    {spot.reelRealityCheck.groundRealityTruth}
                  </p>
                </div>

                {/* Key Numbers Strip */}
                <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="bg-stone-50 dark:bg-[#251D17] p-2.5 rounded-xl border border-stone-100 dark:border-[#3A2D23]">
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">Real Per-Person Bill</div>
                    <div className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                      ₹{spot.realPerPersonCost.avg}{' '}
                      <span className="text-[11px] font-normal text-stone-500 dark:text-stone-400">net/head</span>
                    </div>
                  </div>

                  <div className="bg-stone-50 dark:bg-[#251D17] p-2.5 rounded-xl border border-stone-100 dark:border-[#3A2D23]">
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">Real Group Seating</div>
                    <div className="text-sm font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                      Up to {spot.groupSeating.maxGroupSize} friends
                    </div>
                  </div>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-stone-50/80 dark:bg-[#16110E] border-t border-stone-100 dark:border-[#2E231C] flex items-center justify-between text-xs">
                {spot.reelRealityCheck.reelUrl ? (
                  <a
                    href={spot.reelRealityCheck.reelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-bold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
                  >
                    <span>Watch Reel Source Video</span>
                    <ExternalLink className="w-3 h-3 text-stone-400 dark:text-stone-400" />
                  </a>
                ) : (
                  <span className="text-stone-400 dark:text-stone-500">Word-of-mouth spot</span>
                )}

                <button
                  onClick={() => onSelectSpot(spot)}
                  className="inline-flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <span>View Table Details & Splitter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
