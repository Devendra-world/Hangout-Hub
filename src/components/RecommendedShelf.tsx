/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, IndianRupee, QrCode, Bookmark, ChevronRight } from 'lucide-react';
import { HangoutSpot, UserProfile, RecommendationItem } from '../types/index.ts';

interface RecommendedShelfProps {
  user: UserProfile | null;
  onSelectSpot: (spot: HangoutSpot) => void;
  onOpenQr: (spot: HangoutSpot) => void;
  onOpenAuth: () => void;
}

export const RecommendedShelf: React.FC<RecommendedShelfProps> = ({
  user,
  onSelectSpot,
  onOpenQr,
  onOpenAuth
}) => {
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const url = user?.id ? `/api/recommendations?user_id=${user.id}` : '/api/recommendations';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.recommendations)) {
        setRecommendations(data.recommendations.slice(0, 4));
      }
    } catch (e) {
      console.log('Error fetching recommendations:', e);
    } finally {
      setLoading(false);
    }
  };

  if (recommendations.length === 0 && !loading) return null;

  return (
    <section className="mb-10 p-5 sm:p-6 bg-[#FAF7F2] border border-[#E8DFC8] rounded-3xl relative overflow-hidden shadow-xs">
      
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#C85A32]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Shelf Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-[#2A1810] text-[#F59E0B] flex items-center justify-center">
              <Sparkles className="w-3 h-3" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C85A32]">
              {user ? `Personalized For ${user.name}` : 'Student Scout Algorithm'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-[#2A1810] font-brand mt-0.5">
            {user
              ? `Recommended According to Your History & ₹${user.preferredBudget} Budget`
              : 'Top Scored Campus Spots & Group Cafes'}
          </h3>
          {!user && (
            <p className="text-xs text-[#8C6D53]">
              Sign in to let Hangout-Hub personalize spots based on your college, squad size, and past visits.
            </p>
          )}
        </div>

        {!user && (
          <button
            onClick={onOpenAuth}
            className="self-start sm:self-center text-xs font-bold text-[#2A1810] hover:text-[#C85A32] underline underline-offset-4 cursor-pointer"
          >
            Sign in for your custom shelf →
          </button>
        )}
      </div>

      {/* Shelf Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        {recommendations.map(({ spot, recommendationScore, primaryReason }) => (
          <div
            key={spot.id}
            onClick={() => onSelectSpot(spot)}
            className="p-3.5 bg-white border border-[#E8DFC8] rounded-2xl hover:border-[#C85A32] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              {/* Score badge & budget */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-extrabold text-[#C85A32] bg-[#FDF0EA] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#F59E0B]" />
                  <span>{recommendationScore}% Match</span>
                </span>
                <span className="text-[11px] font-bold text-[#2A1810]">
                  ~₹{spot.realPerPersonCost.avg}/head
                </span>
              </div>

              <h4 className="text-xs font-bold text-[#2A1810] group-hover:text-[#C85A32] transition-colors line-clamp-1">
                {spot.name}
              </h4>
              <p className="text-[11px] text-[#8C6D53] mt-0.5">
                {spot.neighborhood} • {spot.vibeCategory}
              </p>

              {/* Reasoning Pill */}
              <div className="mt-2 text-[10px] font-medium text-[#5C4A3A] bg-[#FAF8F5] p-1.5 rounded-lg border border-[#F2ECE1] line-clamp-2">
                ★ {primaryReason}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#F2ECE1] text-[11px]">
              <span className="text-[10px] text-[#8C6D53]">
                Seats {spot.groupSeating.maxGroupSize}+ squad
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenQr(spot);
                  }}
                  className="p-1 hover:bg-[#EFE7DA] rounded-md text-[#8C6D53] hover:text-[#2A1810]"
                  title="Generate Spot QR"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
                <span className="text-[#C85A32] font-bold text-[10px] group-hover:underline flex items-center">
                  <span>View</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
