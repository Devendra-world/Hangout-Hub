/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Coffee, MapPin, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onOpenSubmitSpot: () => void;
  onOpenPartnerModal: () => void;
  onOpenPhpModal?: () => void;
  isAdmin?: boolean;
  onOpenQrGenerator?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  onOpenSubmitSpot,
  onOpenPartnerModal,
  onOpenPhpModal,
  isAdmin = false,
  onOpenQrGenerator
}) => {
  return (
    <footer className="bg-[#FAF7F2] dark:bg-[#15100C] border-t border-[#E8DFC8] dark:border-[#33271F] mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Brand & Mission (5 cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2A1810] dark:bg-stone-800 text-[#FAF7F2] flex items-center justify-center font-bold shadow-sm">
                <Coffee className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <span className="text-xl font-black text-[#2A1810] dark:text-stone-100 tracking-tight font-brand">
                Hangout-Hub
              </span>
              <span className="text-[10px] font-bold text-[#8C6D53] dark:text-amber-300 tracking-widest uppercase bg-[#EFE7DA] dark:bg-[#29201A] px-2 py-0.5 rounded-md">
                Campus Guide
              </span>
            </div>

            <p className="text-xs text-[#5C4A3A] dark:text-stone-300 leading-relaxed max-w-sm">
              The aesthetic, student-powered guide to campus cafes and group hangout spots — verified with real per-person bills, guaranteed squad seating, tested WiFi speeds, and unedited Instagram reel reality checks.
            </p>

            <div className="text-[11px] text-[#8C6D53] dark:text-stone-400 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#C85A32] dark:text-amber-400" />
              <span>Audited by CEPT, HL, JG, IIM-A, NID, DU, Christ & campus scouts nationwide</span>
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <div className="font-bold text-[#2A1810] dark:text-stone-100 uppercase tracking-wider text-[11px] font-brand">
              Explore Hangout-Hub
            </div>
            <ul className="space-y-2 text-[#5C4A3A] dark:text-stone-300 font-medium">
              <li>
                <button
                  onClick={() => onSelectTab('explorer')}
                  className="hover:text-[#2A1810] dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Campus Spot Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('reels')}
                  className="hover:text-[#2A1810] dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Reel vs Ground Reality Feed
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('deals')}
                  className="hover:text-[#2A1810] dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Student Group Perks & Deals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('splitter')}
                  className="hover:text-[#2A1810] dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Squad Bill Splitter & Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('feedback')}
                  className="hover:text-[#2A1810] dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Community Wishlist & Spot Requests
                </button>
              </li>
              {onOpenQrGenerator && (
                <li>
                  <button
                    onClick={onOpenQrGenerator}
                    className="hover:text-[#2A1810] dark:hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Instant QR Code Generator</span>
                  </button>
                </li>
              )}
              {isAdmin && onOpenPhpModal && (
                <li className="pt-1">
                  <button
                    onClick={onOpenPhpModal}
                    className="text-[#7C3AED] dark:text-purple-400 hover:text-[#5B21B6] dark:hover:text-purple-300 font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin: PHP 8.2 & SQL Database Center</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Scout & Cafe Owner (4 cols) */}
          <div className="md:col-span-4 space-y-3 text-xs">
            <div className="font-bold text-[#2A1810] dark:text-stone-100 uppercase tracking-wider text-[11px] font-brand">
              Campus Scouts & Cafe Owners
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={onOpenSubmitSpot}
                className="px-3.5 py-1.5 bg-[#EFE7DA] dark:bg-[#29201A] hover:bg-[#E5DBCB] dark:hover:bg-[#352921] text-[#2A1810] dark:text-stone-100 border border-transparent dark:border-[#3E3025] rounded-xl font-bold transition-colors cursor-pointer"
              >
                + Submit a Spot
              </button>
              <button
                onClick={onOpenPartnerModal}
                className="px-3.5 py-1.5 bg-[#2A1810] dark:bg-amber-700 hover:bg-[#C85A32] dark:hover:bg-amber-600 text-white rounded-xl font-bold transition-colors cursor-pointer"
              >
                Cafe Owner Promotion
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright notice */}
        <div className="mt-12 pt-6 border-t border-[#E8DFC8] dark:border-[#33271F] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C6D53] dark:text-stone-400">
          <div>
            © 2026 Hangout-Hub · Student Campus Cafe & Hangout Guide.
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
