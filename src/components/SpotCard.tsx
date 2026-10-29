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
      className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden hover:border-amber-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Aesthetic Rich Photo/Art Banner */}
        <AestheticCafeVisual spot={spot} size="card" />

        <div className="p-4 sm:p-5 space-y-3.5">
          
          {/* Header Title & Location */}
          <div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-semibold text-stone-800">{spot.neighborhood}</span>
              {spot.city && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-700 border border-stone-200/80">
                  {spot.city}
                </span>
              )}
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-[11px] text-stone-500 truncate">{spot.distanceToCampus}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors leading-snug line-clamp-1">
              {spot.name}
            </h3>
          </div>

          {/* Key Facilities on Card (Clean Data Binding) */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-2xl border border-stone-200/70 text-stone-700">
            {/* WiFi */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="font-bold text-stone-900 block tabular-nums leading-none text-xs">
                  {spot.amenities.wifiSpeedMbps} Mbps
                </span>
                <span className="text-[10px] text-stone-500 truncate block">
                  {spot.amenities.wifiReliability}
                </span>
              </div>
            </div>

            {/* Power Sockets */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="font-bold text-stone-900 block leading-none text-xs truncate">
                  {spot.amenities.powerOutlets}
                </span>
                <span className="text-[10px] text-stone-500 block">Power Plugs</span>
              </div>
            </div>

            {/* Seating */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="font-bold text-stone-900 block tabular-nums leading-none text-xs">
                  Seats {spot.groupSeating.maxGroupSize}
                </span>
                <span className="text-[10px] text-stone-500 truncate block">
                  {spot.groupSeating.pushTogetherAllowed ? 'Push-together OK' : 'Fixed tables'}
                </span>
              </div>
            </div>

            {/* Noise */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-stone-200/70 text-stone-600 flex items-center justify-center shrink-0">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="font-bold text-stone-900 block tabular-nums leading-none text-xs">
                  {spot.amenities.noiseDecibels} dB
                </span>
                <span className="text-[10px] text-stone-500 truncate block">
                  {spot.amenities.noiseDecibels < 55 ? 'Quiet Study' : 'Lively Buzz'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Facility Badges */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-semibold text-stone-600">
            {spot.amenities.airConditioned && (
              <span className="px-2 py-0.5 bg-stone-100 rounded-md border border-stone-200">
                AC Available
              </span>
            )}
            {spot.amenities.openLateNight && (
              <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded-md border border-purple-200">
                Open till {spot.amenities.closingTime}
              </span>
            )}
            {spot.amenities.outsideCakeAllowed && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                Outside Cake OK
              </span>
            )}
            {spot.amenities.studentDiscountAvailable && (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                Student ID Concession
              </span>
            )}
          </div>

          {/* Tap Prompt to view Reel vs Reality & Menu inside */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-amber-700 group-hover:text-amber-800 transition-colors">
            <span>Tap for Reel vs Reality & Full Info</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>

        </div>
      </div>

      {/* Card Footer: Upvotes, Price, Action */}
      <div className="px-4 sm:px-5 py-3 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between text-xs">
        <button
          onClick={handleVoteClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            voted 
              ? 'bg-amber-100 text-amber-800 font-bold' 
              : 'text-stone-600 hover:bg-stone-200/60'
          }`}
          title="Upvote verified accuracy"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${voted ? 'fill-amber-600 text-amber-600' : ''}`} />
          <span className="tabular-nums font-semibold">{voteCount}</span>
        </button>

        <div className="flex items-center gap-1 font-bold text-stone-900 group-hover:text-amber-700 transition-colors text-xs">
          <span>~₹{spot.realPerPersonCost.avg}/head</span>
          <span className="text-stone-400">·</span>
          <span className="text-amber-700 underline underline-offset-2">View Cafe</span>
        </div>
      </div>
    </article>
  );
};
