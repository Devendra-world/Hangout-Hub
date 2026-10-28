/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Coffee, MapPin } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onOpenSubmitSpot: () => void;
  onOpenPartnerModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  onOpenSubmitSpot,
  onOpenPartnerModal
}) => {
  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E8DFC8] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand & Mission (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2A1810] text-[#FAF7F2] flex items-center justify-center font-bold shadow-sm">
                <Coffee className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <span className="text-xl font-black text-[#2A1810] tracking-tight font-brand">
                Hangout-Hub
              </span>
              <span className="text-[10px] font-bold text-[#8C6D53] tracking-widest uppercase bg-[#EFE7DA] px-2 py-0.5 rounded-md">
                Amdavad
              </span>
            </div>

            <p className="text-xs text-[#5C4A3A] leading-relaxed max-w-sm">
              The aesthetic, student-powered guide to Ahmedabad’s best campus cafes and addas — verified with real per-person bills, guaranteed squad seating, tested WiFi speeds, and unedited Instagram reel reality checks.
            </p>

            <div className="text-[11px] text-[#8C6D53] flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Audited by CEPT, HL, IIM-A, NID & AU student scouts</span>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <div className="font-bold text-[#2A1810] uppercase tracking-wider text-[11px] font-brand">
              Explore Hangout-Hub
            </div>
            <ul className="space-y-2 text-[#5C4A3A] font-medium">
              <li>
                <button
                  onClick={() => onSelectTab('explorer')}
                  className="hover:text-[#2A1810] transition-colors cursor-pointer"
                >
                  Ahmedabad Spot Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('reels')}
                  className="hover:text-[#2A1810] transition-colors cursor-pointer"
                >
                  Reel vs Ground Reality Feed
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('deals')}
                  className="hover:text-[#2A1810] transition-colors cursor-pointer"
                >
                  Student Group Perks & Deals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('splitter')}
                  className="hover:text-[#2A1810] transition-colors cursor-pointer"
                >
                  Squad Bill Splitter & Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('feedback')}
                  className="hover:text-[#2A1810] transition-colors cursor-pointer"
                >
                  Community Wishlist & Spot Requests
                </button>
              </li>
            </ul>
          </div>

          {/* Scout & Cafe Owner (4 cols) */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <div className="font-bold text-[#2A1810] uppercase tracking-wider text-[11px] font-brand">
              Campus Scouts & Cafe Owners
            </div>
            <p className="text-[#5C4A3A] text-xs leading-relaxed font-medium">
              Know an unlisted student adda near your campus? Or manage a cafe near CEPT, HL, Vastrapur, or on Sindhu Bhavan Road?
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={onOpenSubmitSpot}
                className="px-3.5 py-1.5 bg-[#EFE7DA] hover:bg-[#E5DBCB] text-[#2A1810] rounded-xl font-bold transition-colors cursor-pointer"
              >
                + Submit a Spot
              </button>
              <button
                onClick={onOpenPartnerModal}
                className="px-3.5 py-1.5 bg-[#2A1810] hover:bg-[#C85A32] text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                Cafe Owner Promotion
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright notice */}
        <div className="mt-12 pt-6 border-t border-[#E8DFC8] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C6D53]">
          <div>
            © 2026 Hangout-Hub · Ahmedabad Student Cafe & Adda Guide.
          </div>
          <div className="flex items-center gap-4">
            <span>Student Scout Verified</span>
            <span>·</span>
            <span>Zero Sponsored Inflated Menus</span>
            <span>·</span>
            <span>Real Ground Reality</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
