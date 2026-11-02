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
  Tag,
  QrCode,
  Bookmark
} from 'lucide-react';

interface SpotDetailModalProps {
  spot: HangoutSpot | null;
  onClose: () => void;
  onVote: (spotId: string) => void;
  onOpenQr?: (spot: HangoutSpot) => void;
  onToggleSave?: (spot: HangoutSpot) => void;
  isSaved?: boolean;
}

export const SpotDetailModal: React.FC<SpotDetailModalProps> = ({
  spot,
  onClose,
  onVote,
  onOpenQr,
  onToggleSave,
  isSaved = false
}) => {
  if (!spot) return null;

  const [groupSize, setGroupSize] = useState<number>(Math.min(6, spot.groupSeating.maxGroupSize));
  const [includeSplitTip, setIncludeSplitTip] = useState(false);
  const [voted, setVoted] = useState(false);
  const [upvotes, setUpvotes] = useState(spot.scoutReview.upvotes);

  React.useEffect(() => {
    setUpvotes(spot.scoutReview.upvotes);
  }, [spot.id, spot.scoutReview.upvotes]);

  React.useEffect(() => {
    setVoted(false);
    setGroupSize(Math.min(6, spot.groupSeating.maxGroupSize));
  }, [spot.id, spot.groupSeating.maxGroupSize]);

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
      onVote(spot.id);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      
      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1C1612] text-stone-900 dark:text-stone-100 rounded-3xl shadow-2xl border border-stone-200 dark:border-[#362920] w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spot-title"
      >
        
        {/* Aesthetic Rich Photo/Art Banner in Modal */}
        <div className="relative">
          <AestheticCafeVisual spot={spot} size="modal" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-white bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-7 divide-y divide-stone-100 dark:divide-[#2E231C]">
          
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
              <span>{spot.vibeCategory}</span>
              {spot.city && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-[#29201A] text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-[#3D2F25] text-[11px] font-semibold">
                    {spot.city}
                  </span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {spot.neighborhood} ({spot.distanceToCampus})
              </span>
            </div>

            <h2 id="spot-title" className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              {spot.name}
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {spot.tagline}
            </p>
          </div>

          {/* Section 1: The Reel Reality Check */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                  Instagram Reel vs Ground Reality
                </h3>
              </div>

              <span className="font-extrabold text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full text-xs tabular-nums border border-amber-200 dark:border-amber-800/60">
                {spot.reelRealityCheck.realityScore}% Truth Score
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* What Reel Claimed */}
              <div className="bg-stone-50 dark:bg-[#251D17] p-4 rounded-2xl border border-stone-200/90 dark:border-[#3A2D23] space-y-2">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                    What the Reel Claimed
                  </span>
                  <span className="text-[11px] text-stone-400 dark:text-stone-400">{spot.reelRealityCheck.reelCreator}</span>
                </div>
                <p className="text-stone-700 dark:text-stone-200 leading-relaxed italic bg-white dark:bg-[#1B1410] p-2.5 rounded-xl border border-stone-200/60 dark:border-[#33271F]">
                  "{spot.reelRealityCheck.reelHypeClaim}"
                </p>
                {spot.reelRealityCheck.hasReel && (
                  <div className="pt-1">
                    <a
                      href={spot.reelRealityCheck.reelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline"
                    >
                      <span>View Reel Source Video</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* What Ground Reality Was */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/35 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 space-y-2">
                <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold flex items-center gap-1 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Scout Ground Reality
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Campus Audited</span>
                </div>
                <p className="text-stone-800 dark:text-stone-200 leading-relaxed bg-white dark:bg-[#1B1410] p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                  {spot.reelRealityCheck.groundRealityTruth}
                </p>
                <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium pt-1">
                  Verified by: {spot.scoutReview.scoutName}
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Real Group Bill & Per-Person Calculator */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                  Squad Bill Splitter & Calculator
                </h3>
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400">Includes food combo & taxes</span>
            </div>

            <div className="bg-stone-50 dark:bg-[#251D17] rounded-2xl p-5 border border-stone-200/90 dark:border-[#3A2D23] space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Left slider */}
                <div className="md:col-span-7 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800 dark:text-stone-200">How many friends are going?</span>
                    <span className="text-base font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
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

                  <div className="flex justify-between text-[11px] text-stone-400 dark:text-stone-400 tabular-nums">
                    <span>2 (Pair)</span>
                    <span>6 (Regular Squad)</span>
                    <span>10 (Batch)</span>
                    <span>14+ (Full Group)</span>
                  </div>

                  <div className="pt-1 flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 dark:text-stone-300">
                      <input
                        type="checkbox"
                        checked={includeSplitTip}
                        onChange={(e) => setIncludeSplitTip(e.target.checked)}
                        className="rounded border-stone-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                      />
                      <span>Include 5% group service/tip share</span>
                    </label>
                  </div>
                </div>

                {/* Right calculated box */}
                <div className="md:col-span-5 bg-white dark:bg-[#1B1410] p-4 rounded-xl border border-stone-200 dark:border-[#33271F] shadow-xs space-y-2">
                  <div className="text-[11px] font-bold text-stone-400 dark:text-stone-400 uppercase tracking-wider">
                    Net Estimated Per Friend
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-stone-900 dark:text-amber-300 tabular-nums">
                      ₹{calculatedPerHead}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">per person</span>
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-[#2E231C] text-[11px] space-y-1 text-stone-600 dark:text-stone-300">
                    <div className="flex justify-between tabular-nums">
                      <span>Total Squad Bill:</span>
                      <span className="font-bold text-stone-900 dark:text-stone-100">₹{totalBill}</span>
                    </div>
                    <div className="flex justify-between tabular-nums text-stone-400 dark:text-stone-400">
                      <span>Includes 5% GST (₹{gst}) {includeSplitTip ? `+ Tip (₹${tip})` : ''}</span>
                    </div>
                    <div className="pt-1 text-[11px] text-amber-700 dark:text-amber-400 italic">
                      Food delivery app claimed: {spot.officialClaimCost}
                    </div>
                  </div>
                </div>

              </div>

              {/* Sample order itemization */}
              <div className="text-xs text-stone-700 dark:text-stone-200 bg-white dark:bg-[#1B1410] p-3 rounded-xl border border-stone-200/70 dark:border-[#33271F]">
                <span className="font-bold text-stone-900 dark:text-stone-100">Standard Student Order Formula: </span>
                {spot.realPerPersonCost.popularOrderExample}
              </div>

            </div>
          </div>

          {/* Section 3: Group Seating Viability */}
          <div className="pt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                Group Seating Capacity & Layout
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-stone-50 dark:bg-[#251D17] p-4 rounded-2xl border border-stone-200 dark:border-[#3A2D23] space-y-1">
                <span className="text-stone-400 dark:text-stone-400 text-[11px]">Max Table Capacity</span>
                <div className="text-lg font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  Up to {spot.groupSeating.maxGroupSize} people
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-tight">
                  {spot.groupSeating.seatingDescription}
                </p>
              </div>

              <div className="bg-stone-50 dark:bg-[#251D17] p-4 rounded-2xl border border-stone-200 dark:border-[#3A2D23] space-y-1">
                <span className="text-stone-400 dark:text-stone-400 text-[11px]">Push-Together Tables</span>
                <div className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {spot.groupSeating.pushTogetherAllowed ? 'Allowed & Supported' : 'Fixed Seating'}
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-tight">
                  {spot.groupSeating.pushTogetherAllowed
                    ? 'Staff readily joins tables for student friend groups.'
                    : 'Fixed booth seating.'}
                </p>
              </div>

              <div className="bg-stone-50 dark:bg-[#251D17] p-4 rounded-2xl border border-stone-200 dark:border-[#3A2D23] space-y-1">
                <span className="text-stone-400 dark:text-stone-400 text-[11px]">Reservation & Best Hours</span>
                <div className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {spot.groupSeating.reservationNeeded ? 'Booking Advised' : 'Walk-in Friendly'}
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-tight">
                  {spot.groupSeating.reservationTip}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Amenities Audit */}
          <div className="pt-6 space-y-3">
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Audited Amenities & Student Perks
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              
              <div className="p-3.5 bg-white dark:bg-[#251D17] border border-stone-200 dark:border-[#3A2D23] rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold">
                  <Wifi className="w-4 h-4" />
                  <span>WiFi Speed</span>
                </div>
                <div className="text-base font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  {spot.amenities.wifiSpeedMbps} Mbps
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">{spot.amenities.wifiReliability}</div>
              </div>

              <div className="p-3.5 bg-white dark:bg-[#251D17] border border-stone-200 dark:border-[#3A2D23] rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>Power Plugs</span>
                </div>
                <div className="text-base font-bold text-stone-900 dark:text-stone-100 truncate">
                  {spot.amenities.powerOutlets}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">Accessible for laptops</div>
              </div>

              <div className="p-3.5 bg-white dark:bg-[#251D17] border border-stone-200 dark:border-[#3A2D23] rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-bold">
                  <Volume2 className="w-4 h-4" />
                  <span>Noise Rating</span>
                </div>
                <div className="text-base font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  {spot.amenities.noiseDecibels} dB
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{spot.amenities.noiseDescription}</div>
              </div>

              <div className="p-3.5 bg-white dark:bg-[#251D17] border border-stone-200 dark:border-[#3A2D23] rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>Closing Hours</span>
                </div>
                <div className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {spot.amenities.closingTime}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  {spot.amenities.openLateNight ? 'Late Night Hangout' : 'Evening Closing'}
                </div>
              </div>

            </div>

            {/* Additional student policies */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-700 dark:text-stone-200">
              <span className="text-stone-400 dark:text-stone-400">Policies:</span>
              <span className="bg-stone-100 dark:bg-[#29201A] border border-stone-200/70 dark:border-[#3D2F25] px-2.5 py-1 rounded-lg">
                Outside Birthday Cake: {spot.amenities.outsideCakeAllowed ? 'Allowed' : 'Not Allowed'}
              </span>
              <span className="bg-stone-100 dark:bg-[#29201A] border border-stone-200/70 dark:border-[#3D2F25] px-2.5 py-1 rounded-lg">
                Board Games: {spot.amenities.boardGamesAvailable ? 'Available' : 'None'}
              </span>
              <span className="bg-stone-100 dark:bg-[#29201A] border border-stone-200/70 dark:border-[#3D2F25] px-2.5 py-1 rounded-lg">
                AC: {spot.amenities.airConditioned ? 'Yes' : 'Open-Air / Fans'}
              </span>
              {spot.amenities.studentDiscountAvailable && (
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60 font-bold px-2.5 py-1 rounded-lg">
                  College ID: {spot.amenities.discountNote}
                </span>
              )}
            </div>
          </div>

          {/* Section 5: Scout Review Log */}
          <div className="pt-6 space-y-3">
            <div className="bg-amber-50/70 dark:bg-amber-950/35 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Campus Scout Field Audit</span>
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">{spot.scoutReview.verifiedDate}</span>
              </div>
              <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed italic">
                "{spot.scoutReview.scoutNotes}"
              </p>
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {spot.scoutReview.scoutName} · {spot.scoutReview.scoutCollege}
                </span>

                <button
                  onClick={handleUpvote}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    voted
                      ? 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100'
                      : 'bg-white dark:bg-[#251D17] text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-[#3E3025] hover:bg-stone-100 dark:hover:bg-[#31261E]'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${voted ? 'fill-amber-700 text-amber-700 dark:fill-amber-200 dark:text-amber-200' : ''}`} />
                  <span>{voted ? 'Helpful!' : 'Accurate Audit'}</span>
                  <span className="tabular-nums font-bold">({upvotes})</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-[#33271F] bg-stone-50/80 dark:bg-[#16110E] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
            <Tag className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
            <span>Tags: {spot.tags.join(' · ')}</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenQr && (
              <button
                type="button"
                onClick={() => onOpenQr(spot)}
                className="flex items-center gap-1.5 px-3.5 py-2 font-bold text-[#2A1810] dark:text-stone-100 bg-[#EFE7DA] dark:bg-[#29201A] hover:bg-[#E5DBCB] dark:hover:bg-[#352921] border border-[#D9CDB8] dark:border-[#3E3025] rounded-xl transition-all cursor-pointer shadow-2xs"
                title="Generate QR code for this spot"
              >
                <QrCode className="w-3.5 h-3.5 text-[#C85A32] dark:text-amber-400" />
                <span>Spot QR</span>
              </button>
            )}

            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(spot)}
                className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                  isSaved
                    ? 'bg-[#C85A32] text-white border-[#C85A32]'
                    : 'bg-white dark:bg-[#251D17] text-stone-800 dark:text-stone-200 border-stone-200 dark:border-[#3E3025] hover:bg-stone-100 dark:hover:bg-[#31261E]'
                }`}
                title="Save spot to your profile bookmarks"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save Spot'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2 font-bold text-stone-700 dark:text-stone-200 hover:text-stone-900 dark:hover:text-white bg-white dark:bg-[#251D17] border border-stone-200 dark:border-[#3E3025] rounded-xl hover:bg-stone-50 dark:hover:bg-[#31261E] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
