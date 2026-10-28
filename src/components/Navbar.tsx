/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, PlusCircle, Compass, Film, Tag, Calculator, MessageSquareText, Coffee, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSubmitSpot: () => void;
  onOpenPartnerModal: () => void;
  onOpenPhpModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSubmitSpot,
  onOpenPartnerModal,
  onOpenPhpModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFC8] transition-all">
      {/* Strict Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark: Hangout-Hub */}
        <button
          onClick={() => handleNavClick('explorer')}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#2A1810] text-[#FAF7F2] flex items-center justify-center font-bold shadow-md group-hover:bg-[#C85A32] transition-colors">
            <Coffee className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-[#2A1810] font-brand leading-none">
              Hangout-Hub
            </span>
            <span className="text-[10px] font-semibold text-[#8C6D53] tracking-wider uppercase mt-0.5">
              Campus Adda Guide
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 concise single-line text links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#5C4A3A]">
          <button
            onClick={() => handleNavClick('explorer')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#2A1810] cursor-pointer ${
              activeTab === 'explorer'
                ? 'text-[#2A1810] font-bold underline underline-offset-8 decoration-2 decoration-[#C85A32]'
                : ''
            }`}
          >
            Explore Spots
          </button>

          <button
            onClick={() => handleNavClick('reels')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#2A1810] cursor-pointer ${
              activeTab === 'reels'
                ? 'text-[#2A1810] font-bold underline underline-offset-8 decoration-2 decoration-[#C85A32]'
                : ''
            }`}
          >
            Reel vs Reality
          </button>

          <button
            onClick={() => handleNavClick('deals')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#2A1810] cursor-pointer ${
              activeTab === 'deals'
                ? 'text-[#2A1810] font-bold underline underline-offset-8 decoration-2 decoration-[#C85A32]'
                : ''
            }`}
          >
            Student Deals
          </button>

          <button
            onClick={() => handleNavClick('splitter')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#2A1810] cursor-pointer ${
              activeTab === 'splitter'
                ? 'text-[#2A1810] font-bold underline underline-offset-8 decoration-2 decoration-[#C85A32]'
                : ''
            }`}
          >
            Bill Splitter
          </button>

          <button
            onClick={() => handleNavClick('feedback')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#2A1810] cursor-pointer ${
              activeTab === 'feedback'
                ? 'text-[#2A1810] font-bold underline underline-offset-8 decoration-2 decoration-[#C85A32]'
                : ''
            }`}
          >
            Student Wishlist
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          {onOpenPhpModal && (
            <button
              onClick={onOpenPhpModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2A1810] bg-[#EFE7DA] hover:bg-[#E5DBCB] rounded-xl border border-[#D9CDB8] transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              title="View PHP & SQL Database architecture and export SQL"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Database className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>PHP + SQL DB</span>
            </button>
          )}

          <button
            onClick={onOpenSubmitSpot}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#2A1810] hover:bg-[#C85A32] rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Submit Spot</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#2A1810] hover:text-[#C85A32] focus:outline-none rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E8DFC8] bg-[#FAF7F2] px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => handleNavClick('explorer')}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-bold text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl"
          >
            <Compass className="w-4 h-4 text-[#C85A32]" />
            <span>Explore Spots</span>
          </button>
          <button
            onClick={() => handleNavClick('reels')}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-bold text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl"
          >
            <Film className="w-4 h-4 text-[#C85A32]" />
            <span>Reel vs Reality Feed</span>
          </button>
          <button
            onClick={() => handleNavClick('deals')}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-bold text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl"
          >
            <Tag className="w-4 h-4 text-[#C85A32]" />
            <span>Student Deals & Perks</span>
          </button>
          <button
            onClick={() => handleNavClick('splitter')}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-bold text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl"
          >
            <Calculator className="w-4 h-4 text-[#C85A32]" />
            <span>Squad Bill Splitter</span>
          </button>
          <button
            onClick={() => handleNavClick('feedback')}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm font-bold text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl"
          >
            <MessageSquareText className="w-4 h-4 text-[#C85A32]" />
            <span>Student Wishlist & Notes</span>
          </button>
          <div className="pt-2 border-t border-[#E8DFC8] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSubmitSpot();
              }}
              className="w-full text-center px-4 py-2.5 text-xs font-bold text-white bg-[#2A1810] hover:bg-[#C85A32] rounded-xl"
            >
              + Submit an Ahmedabad Spot
            </button>
            {onOpenPhpModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPhpModal();
                }}
                className="w-full text-center px-4 py-2 text-xs font-bold text-[#2A1810] bg-[#EFE7DA] rounded-xl hover:bg-[#E5DBCB] flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <Database className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>PHP 8.2 & SQL Database Center</span>
              </button>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPartnerModal();
              }}
              className="w-full text-center px-4 py-2 text-xs font-semibold text-[#5C4A3A] bg-[#FAF7F2] border border-[#E8DFC8] rounded-xl hover:bg-[#E5DBCB]"
            >
              Cafe Owner Promotion Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
