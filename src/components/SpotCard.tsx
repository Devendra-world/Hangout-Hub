/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HangoutSpot } from '../types/index.ts';
import { AestheticCafeVisual } from './AestheticCafeVisual.tsx';
import { Users, Wifi, Zap, ThumbsUp, ArrowUpRight, Volume2, MapPin } from 'lucide-react';

interface SpotCardProps {
  spot: HangoutSpot;
  onSelect: (spot: HangoutSpot) => void;
  onVote: (spotId: string) => void;
}

export const SpotCard: React.FC<SpotCardProps> = ({ spot, onSelect, onVote }) => {
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(spot.scoutReview.upvotes);

  useEffect(() => {
    setVoteCount(spot.scoutReview.upvotes);
  }, [spot.scoutReview.upvotes]);

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!voted) {
      setVoted(true);
      onVote(spot.id);
    }
  };

  return (
    <article
      onClick={() => onSelect(spot)}
      className="bg-white dark:bg-[#1C1612] rounded-3xl border border-stone-200/90 dark:border-[#33271F] overflow-hidden hover:border-amber-400 dark:hover:border-amber-500/80 hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Aesthetic Rich Photo/Art Banner */}
        <AestheticCafeVisual spot={spot} size="card" />

        <div className="p-4 sm:p-5 space-y-3.5">
          
          {/* Header Title & Location */}
          <div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-semibold text-stone-800 dark:text-stone-200">{spot.neighborhood}</span>
              {spot.city && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#29201A] text-stone-700 dark:text-stone-200 border border-stone-200/80 dark:border-[#3D2F25]">
                  {spot.city}
                </span>
              )}
              <span aria-hidden="true" className="text-stone-300 dark:text-stone-600">·</span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{spot.distanceToCampus}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-1">
              {spot.name}
            </h3>

            {spot.tagline && (
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                {spot.tagline}
              </p>
            )}
          </div>

          {/* Key Facilities on Card (Clean Data Binding) */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-[#251D17] p-2.5 rounded-2xl border border-stone-200/70 dark:border-[#382B22] text-stone-700 dark:text-stone-300">
            {/* WiFi */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="font-bold text-stone-900 dark:text-stone-100 block tabular-nums leading-none text-xs">
                  {spot.amenities.wifiSpeedMbps} Mbps
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block mt-0.5">
                  {spot.amenities.wifiReliability}
                </span>
              </div>
            </div>

            {/* Power Sockets */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="font-bold text-stone-900 dark:text-stone-100 block leading-none text-xs truncate">
                  {spot.amenities.powerOutlets}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">Power Plugs</span>
              </div>
            </div>

            {/* Seating */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="font-bold text-stone-900 dark:text-stone-100 block tabular-nums leading-none text-xs">
                  Seats {spot.groupSeating.maxGroupSize}
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block mt-0.5">
                  {spot.groupSeating.pushTogetherAllowed ? 'Push-together OK' : 'Fixed tables'}
                </span>
              </div>
            </div>

            {/* Noise */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center shrink-0">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <span className="font-bold text-stone-900 dark:text-stone-100 block tabular-nums leading-none text-xs">
                  {spot.amenities.noiseDecibels} dB
                </span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block mt-0.5">
                  {spot.amenities.noiseDecibels < 55 ? 'Quiet Study' : 'Lively Buzz'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Facility Badges */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-semibold">
            {spot.amenities.airConditioned && (
              <span className="px-2 py-0.5 bg-stone-100 dark:bg-[#29201A] text-stone-700 dark:text-stone-200 rounded-md border border-stone-200 dark:border-[#3D2F25]">
                AC Available
              </span>
            )}
            {spot.amenities.openLateNight && (
              <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-200 rounded-md border border-purple-200 dark:border-purple-800/60">
                Open till {spot.amenities.closingTime}
              </span>
            )}
            {spot.amenities.outsideCakeAllowed && (
              <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 rounded-md border border-amber-200 dark:border-amber-800/60">
                Outside Cake OK
              </span>
            )}
            {spot.amenities.studentDiscountAvailable && (
              <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                Student ID Concession
              </span>
            )}
          </div>

          {spot.tags && spot.tags.length > 0 && (
            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
              {spot.tags.slice(0, 4).join(' · ')}
            </div>
          )}

          {/* Tap Prompt to view Reel vs Reality & Menu inside */}
          <div className="pt-2 border-t border-stone-100 dark:border-[#2E231C] flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
            <span>Tap for Reel vs Reality & Full Info</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>

        </div>
      </div>

      {/* Card Footer: Upvotes, Price, Action */}
      <div className="px-4 sm:px-5 py-3 bg-stone-50/80 dark:bg-[#16110E] border-t border-stone-100 dark:border-[#2E231C] flex items-center justify-between text-xs">
        <button
          onClick={handleVoteClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            voted
              ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-bold'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-[#29201A]'
          }`}
          title="Upvote verified accuracy"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${voted ? 'fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
          <span className="tabular-nums font-semibold">{voteCount}</span>
        </button>

        <div className="flex items-center gap-1 font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors text-xs">
          <span className="tabular-nums">~₹{spot.realPerPersonCost.avg}/head</span>
          <span className="text-stone-400 dark:text-stone-500">·</span>
          <span className="text-amber-700 dark:text-amber-400 underline underline-offset-2">View Cafe</span>
        </div>
      </div>
    </article>
  );
};
