/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HangoutSpot } from '../types/index.ts';
import { Store, Tag, CheckCircle2, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { AestheticCafeVisual } from './AestheticCafeVisual.tsx';

interface CafeDealsSectionProps {
  spots: HangoutSpot[];
  onSelectSpot: (spot: HangoutSpot) => void;
  onOpenPartnerModal: () => void;
}

export const CafeDealsSection: React.FC<CafeDealsSectionProps> = ({
  spots,
  onSelectSpot,
  onOpenPartnerModal
}) => {
  const partnerSpots = spots.filter((s) => s.partnership?.isPartner || s.amenities.studentDiscountAvailable);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-700" />
            <span>Student Verified Perks · Ahmedabad</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Exclusive Amdavad Campus Deals & Group Perks
          </h2>
          <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
            Partnered cafes in Navrangpura, Vastrapur, and SBR officially welcome college friend groups with guaranteed group tables, no hidden cake fees, and discounts when you flash your student ID.
          </p>
        </div>

        <button
          onClick={onOpenPartnerModal}
          className="px-4 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
        >
          Are You an Ahmedabad Cafe Owner? Partner With Us
        </button>
      </div>

      {/* Featured Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {partnerSpots.map((spot) => {
          const offerTitle = spot.partnership?.offerTitle || 'Campus Student ID Concession';
          const offerDetails = spot.partnership?.offerDetails || spot.amenities.discountNote || 'Show student ID for exclusive campus pricing.';

          return (
            <div
              key={spot.id}
              className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:border-amber-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <AestheticCafeVisual spot={spot} size="card" />

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-semibold text-stone-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      {spot.neighborhood}
                    </span>
                    <span className="text-[11px] text-stone-400">{spot.distanceToCampus}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-stone-900">{spot.name}</h3>
                    <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">{spot.tagline}</p>
                  </div>

                  {/* Deal Box */}
                  <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{offerTitle}</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed text-[11px]">
                      {offerDetails}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-1">
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="text-stone-400">Avg Spend: </span>
                      <strong className="text-stone-800 tabular-nums">₹{spot.realPerPersonCost.avg}/head</strong>
                    </div>
                    <div className="bg-stone-50 p-2 rounded-xl">
                      <span className="text-stone-400">Seats Together: </span>
                      <strong className="text-stone-800 tabular-nums">Up to {spot.groupSeating.maxGroupSize}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Campus Verified</span>
                </span>

                <button
                  onClick={() => onSelectSpot(spot)}
                  className="font-bold text-stone-900 hover:text-amber-700 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* For Ahmedabad Cafe Owners Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Store className="w-4 h-4" />
            <span>Two-Way Ahmedabad Cafe Network</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Do you run a cafe near CEPT, HL, IIM-A, or on SBR?
          </h3>

          <p className="text-sm text-stone-300 leading-relaxed">
            Fill your quiet weekday afternoon hours (2 PM – 6 PM) with genuine college friend groups. Offer guaranteed seating for 6+ friends, transparent per-person pricing, and a campus ID perk. In return, Hangout-Hub features your cafe directly to thousands of college students planning group meetups.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenPartnerModal}
              className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              Apply for Cafe Promotion
            </button>
            <span className="text-xs text-stone-400">
              Zero commission · In-person campus scout audit
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
