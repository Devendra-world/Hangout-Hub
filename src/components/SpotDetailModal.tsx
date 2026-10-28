/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HangoutSpot } from '../types/index.ts';
import { AestheticCafeVisual } from './AestheticCafeVisual.tsx';
import {
  X,
  Users,
  Wifi,
  Zap,
  Volume2,
  Clock,
  Sparkles,
  ExternalLink,
  ThumbsUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ShieldCheck,
  Tag
} from 'lucide-react';

interface SpotDetailModalProps {
  spot: HangoutSpot | null;
  onClose: () => void;
  onVote: (spotId: string) => void;
}

export const SpotDetailModal: React.FC<SpotDetailModalProps> = ({ spot, onClose, onVote }) => {
  if (!spot) return null;

  const [groupSize, setGroupSize] = useState<number>(Math.min(6, spot.groupSeating.maxGroupSize));
  const [includeSplitTip, setIncludeSplitTip] = useState(false);
  const [voted, setVoted] = useState(false);
  const [upvotes, setUpvotes] = useState(spot.scoutReview.upvotes);

  // Group Bill Calculation
  const baseCostPerHead = spot.realPerPersonCost.avg;
  const subtotal = baseCostPerHead * groupSize;
  const gst = Math.round(subtotal * 0.05); // 5% GST
  const tip = includeSplitTip ? Math.round(subtotal * 0.05) : 0;
  const totalBill = subtotal + gst + tip;
  const calculatedPerHead = Math.round(totalBill / groupSize);

  const handleUpvote = () => {
    if (!voted) {
      setVoted(true);
      setUpvotes((p) => p + 1);
      onVote(spot.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spot-title"
      >
        
        {/* Aesthetic Rich Photo/Art Banner in Modal */}
        <div className="relative">
          <AestheticCafeVisual spot={spot} size="modal" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-white bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-7 divide-y divide-stone-100">
          
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-700">
              <span>{spot.vibeCategory}</span>
              {spot.city && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200 text-[11px] font-semibold">
                    {spot.city}
                  </span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-stone-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                {spot.neighborhood} ({spot.distanceToCampus})
              </span>
            </div>

            <h2 id="spot-title" className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              {spot.name}
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {spot.tagline}
            </p>
          </div>

          {/* Section 1: The Reel Reality Check */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Instagram Reel vs Ground Reality
                </h3>
              </div>

              <span className="font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full text-xs tabular-nums border border-amber-200">
                {spot.reelRealityCheck.realityScore}% Truth Score
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* What Reel Claimed */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/90 space-y-2">
                <div className="flex items-center justify-between text-stone-500">
                  <span className="font-semibold text-stone-700 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    What the Reel Claimed
                  </span>
                  <span className="text-[11px] text-stone-400">{spot.reelRealityCheck.reelCreator}</span>
                </div>
                <p className="text-stone-700 leading-relaxed italic bg-white p-2.5 rounded-xl border border-stone-200/60">
                  "{spot.reelRealityCheck.reelHypeClaim}"
                </p>
                {spot.reelRealityCheck.hasReel && (
                  <div className="pt-1">
                    <a
                      href={spot.reelRealityCheck.reelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline"
                    >
                      <span>View Reel Source Video</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* What Ground Reality Was */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between text-emerald-900">
                  <span className="font-bold flex items-center gap-1 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Ahmedabad Scout Reality
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Campus Audited</span>
                </div>
                <p className="text-stone-800 leading-relaxed bg-white p-2.5 rounded-xl border border-emerald-100">
                  {spot.reelRealityCheck.groundRealityTruth}
                </p>
                <div className="text-[11px] text-emerald-800 font-medium pt-1">
                  Verified by: {spot.scoutReview.scoutName}
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Real Group Bill & Per-Person Calculator */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Squad Bill Splitter & Calculator
                </h3>
              </div>
              <span className="text-xs text-stone-500">Includes food combo & taxes</span>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/90 space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Left slider */}
                <div className="md:col-span-7 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">How many friends are going?</span>
                    <span className="text-base font-extrabold text-stone-900 tabular-nums">
                      {groupSize} friends
                    </span>
                  </div>

                  <input
                    type="range"
                    min="2"
                    max={Math.max(spot.groupSeating.maxGroupSize, 14)}
                    value={groupSize}
                    onChange={(e) => setGroupSize(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />

                  <div className="flex justify-between text-[11px] text-stone-400 tabular-nums">
                    <span>2 (Pair)</span>
                    <span>6 (Regular Squad)</span>
                    <span>10 (Batch)</span>
                    <span>14+ (Full Group)</span>
                  </div>

                  <div className="pt-1 flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-700">
                      <input
                        type="checkbox"
                        checked={includeSplitTip}
                        onChange={(e) => setIncludeSplitTip(e.target.checked)}
                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                      />
                      <span>Include 5% group service/tip share</span>
                    </label>
                  </div>
                </div>

                {/* Right calculated box */}
                <div className="md:col-span-5 bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Net Estimated Per Friend
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-stone-900 tabular-nums">
                      ₹{calculatedPerHead}
                    </span>
                    <span className="text-xs text-stone-500">per person</span>
                  </div>

                  <div className="pt-2 border-t border-stone-100 text-[11px] space-y-1 text-stone-600">
                    <div className="flex justify-between tabular-nums">
                      <span>Total Squad Bill:</span>
                      <span className="font-bold text-stone-900">₹{totalBill}</span>
                    </div>
                    <div className="flex justify-between tabular-nums text-stone-400">
                      <span>Includes 5% GST (₹{gst}) {includeSplitTip ? `+ Tip (₹${tip})` : ''}</span>
                    </div>
                    <div className="pt-1 text-[11px] text-amber-700 italic">
                      Food delivery app claimed: {spot.officialClaimCost}
                    </div>
                  </div>
                </div>

              </div>

              {/* Sample order itemization */}
              <div className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200/70">
                <span className="font-bold text-stone-900">Standard Student Order Formula: </span>
                {spot.realPerPersonCost.popularOrderExample}
              </div>

            </div>
          </div>

          {/* Section 3: Group Seating Viability */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Group Seating Capacity & Layout
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-400 text-[11px]">Max Table Capacity</span>
                <div className="text-lg font-bold text-stone-900 tabular-nums">
                  Up to {spot.groupSeating.maxGroupSize} people
                </div>
                <p className="text-[11px] text-stone-600 leading-tight">
                  {spot.groupSeating.seatingDescription}
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-400 text-[11px]">Push-Together Tables</span>
                <div className="text-lg font-bold text-stone-900">
                  {spot.groupSeating.pushTogetherAllowed ? 'Allowed & Supported' : 'Fixed Seating'}
                </div>
                <p className="text-[11px] text-stone-600 leading-tight">
                  {spot.groupSeating.pushTogetherAllowed
                    ? 'Staff readily joins tables for student friend groups.'
                    : 'Fixed booth seating.'}
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-stone-400 text-[11px]">Reservation & Best Hours</span>
                <div className="text-lg font-bold text-stone-900">
                  {spot.groupSeating.reservationNeeded ? 'Booking Advised' : 'Walk-in Friendly'}
                </div>
                <p className="text-[11px] text-stone-600 leading-tight">
                  {spot.groupSeating.reservationTip}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Amenities Audit */}
          <div className="pt-6 space-y-3">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Audited Amenities & Student Perks
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              
              <div className="p-3.5 bg-white border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                  <Wifi className="w-4 h-4" />
                  <span>WiFi Speed</span>
                </div>
                <div className="text-base font-bold text-stone-900 tabular-nums">
                  {spot.amenities.wifiSpeedMbps} Mbps
                </div>
                <div className="text-[11px] text-stone-500">{spot.amenities.wifiReliability}</div>
              </div>

              <div className="p-3.5 bg-white border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>Power Plugs</span>
                </div>
                <div className="text-base font-bold text-stone-900 truncate">
                  {spot.amenities.powerOutlets}
                </div>
                <div className="text-[11px] text-stone-500">Accessible for laptops</div>
              </div>

              <div className="p-3.5 bg-white border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-stone-700 font-bold">
                  <Volume2 className="w-4 h-4" />
                  <span>Noise Rating</span>
                </div>
                <div className="text-base font-bold text-stone-900 tabular-nums">
                  {spot.amenities.noiseDecibels} dB
                </div>
                <div className="text-[11px] text-stone-500 truncate">{spot.amenities.noiseDescription}</div>
              </div>

              <div className="p-3.5 bg-white border border-stone-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>Closing Hours</span>
                </div>
                <div className="text-base font-bold text-stone-900">
                  {spot.amenities.closingTime}
                </div>
                <div className="text-[11px] text-stone-500">
                  {spot.amenities.openLateNight ? 'Late Night Adda' : 'Evening Closing'}
                </div>
              </div>

            </div>

            {/* Additional student policies */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-700">
              <span className="text-stone-400">Policies:</span>
              <span className="bg-stone-100 px-2.5 py-1 rounded-lg">
                Outside Birthday Cake: {spot.amenities.outsideCakeAllowed ? 'Allowed' : 'Not Allowed'}
              </span>
              <span className="bg-stone-100 px-2.5 py-1 rounded-lg">
                Board Games: {spot.amenities.boardGamesAvailable ? 'Available' : 'None'}
              </span>
              <span className="bg-stone-100 px-2.5 py-1 rounded-lg">
                AC: {spot.amenities.airConditioned ? 'Yes' : 'Open-Air / Fans'}
              </span>
              {spot.amenities.studentDiscountAvailable && (
                <span className="bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-lg">
                  College ID: {spot.amenities.discountNote}
                </span>
              )}
            </div>
          </div>

          {/* Section 5: Scout Review Log */}
          <div className="pt-6 space-y-3">
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Ahmedabad Campus Scout Field Audit</span>
                </span>
                <span className="text-[11px] text-stone-500">{spot.scoutReview.verifiedDate}</span>
              </div>
              <p className="text-xs text-stone-800 leading-relaxed italic">
                "{spot.scoutReview.scoutNotes}"
              </p>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="font-semibold text-stone-700">
                  {spot.scoutReview.scoutName} · {spot.scoutReview.scoutCollege}
                </span>

                <button
                  onClick={handleUpvote}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    voted
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${voted ? 'fill-amber-700 text-amber-700' : ''}`} />
                  <span>{voted ? 'Helpful!' : 'Accurate Audit'}</span>
                  <span className="tabular-nums font-bold">({upvotes})</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-500">
            <Tag className="w-3.5 h-3.5 text-stone-400" />
            <span>Tags: {spot.tags.join(' · ')}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 font-bold text-stone-700 hover:text-stone-900 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
