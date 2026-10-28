/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HangoutSpot } from '../types/index.ts';
import { AestheticCafeVisual } from './AestheticCafeVisual.tsx';
import { Users, Wifi, Zap, ThumbsUp, ArrowUpRight, Volume2, Sparkles, MapPin } from 'lucide-react';

interface SpotCardProps {
  spot: HangoutSpot;
  onSelect: (spot: HangoutSpot) => void;
  onVote: (spotId: string) => void;
}

export const SpotCard: React.FC<SpotCardProps> = ({ spot, onSelect, onVote }) => {
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(spot.scoutReview.upvotes);

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!voted) {
      setVoted(true);
      setVoteCount((prev) => prev + 1);
      onVote(spot.id);
    }
  };

  return (
    <article 
      onClick={() => onSelect(spot)}
      className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden hover:border-amber-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Aesthetic Rich Photo/Art Banner */}
        <AestheticCafeVisual spot={spot} size="card" />

        <div className="p-5 space-y-4">
          
          {/* Header Title & Tagline */}
          <div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-semibold text-stone-800">{spot.neighborhood}</span>
              {spot.city && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200/80">
                  {spot.city}
                </span>
              )}
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-[11px] text-stone-500 truncate">{spot.distanceToCampus}</span>
            </div>

            <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-snug">
              {spot.name}
            </h3>

            <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
              {spot.tagline}
            </p>
          </div>

          {/* Popular Student Combo Formula */}
          <div className="text-xs text-stone-700 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/60 space-y-0.5">
            <span className="font-bold text-amber-950 text-[11px] uppercase tracking-wide">
              Realistic Student Order:
            </span>
            <div className="text-[11px] text-stone-800">
              {spot.realPerPersonCost.popularOrderExample}
            </div>
          </div>

          {/* Group Seating Viability Strip */}
          <div className="pt-1 flex items-start gap-2.5 text-xs text-stone-700">
            <Users className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-stone-900">
                Group Seating: Up to {spot.groupSeating.maxGroupSize} friends together
              </div>
              <div className="text-[11px] text-stone-500 line-clamp-1">
                {spot.groupSeating.seatingDescription}
              </div>
            </div>
          </div>

          {/* Key Student Amenities: WiFi, Power, Noise */}
          <div className="grid grid-cols-3 gap-2 text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            <div className="flex items-center gap-1.5 truncate">
              <Wifi className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate font-medium">{spot.amenities.wifiSpeedMbps} Mbps</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate font-medium">{spot.amenities.powerOutlets}</span>
            </div>
            <div className="flex items-center gap-1.5 truncate">
              <Volume2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span className="truncate font-medium">{spot.amenities.noiseDecibels} dB</span>
            </div>
          </div>

          {/* Reel Reality Check snippet */}
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Reel Ground Truth</span>
              </span>
              <span className="font-bold text-amber-700 tabular-nums">
                {spot.reelRealityCheck.realityScore}% Verified
              </span>
            </div>
            <p className="text-[11px] text-stone-600 italic line-clamp-2">
              "{spot.reelRealityCheck.groundRealityTruth}"
            </p>
          </div>

          {/* Special offer banner if partner */}
          {spot.partnership?.isPartner && (
            <div className="text-xs text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/80 flex items-center justify-between">
              <span className="font-bold text-[11px]">{spot.partnership.offerTitle}</span>
              <span className="text-[11px] text-emerald-700 truncate max-w-[150px]">{spot.partnership.offerDetails}</span>
            </div>
          )}

        </div>
      </div>

      {/* Card Footer: Scout attribution, upvotes, action */}
      <div className="px-5 py-3.5 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between text-xs">
        <button
          onClick={handleVoteClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            voted 
              ? 'bg-amber-100 text-amber-800 font-bold' 
              : 'text-stone-600 hover:bg-stone-200/60'
          }`}
          title="Upvote verified accuracy"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${voted ? 'fill-amber-600 text-amber-600' : ''}`} />
          <span className="tabular-nums font-semibold">{voteCount}</span>
        </button>

        <span className="inline-flex items-center gap-1 text-stone-900 font-bold group-hover:text-amber-700 transition-colors">
          <span>Table Details & Splitter</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </div>
    </article>
  );
};
