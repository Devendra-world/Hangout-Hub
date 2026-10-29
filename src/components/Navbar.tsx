/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Menu, X, PlusCircle, Compass, Film, Tag, Calculator, MessageSquareText,
  Coffee, Database, QrCode, User, LogIn, Sparkles, ShieldCheck, Sun, Moon
} from 'lucide-react';
import { UserProfile } from '../types/index.ts';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSubmitSpot: () => void;
  onOpenPartnerModal: () => void;
  onOpenPhpModal?: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenQrGenerator: () => void;
  isNightMode?: boolean;
  onToggleNightMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSubmitSpot,
  onOpenPartnerModal,
  onOpenPhpModal,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenQrGenerator,
  isNightMode = false,
  onToggleNightMode
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFC8] transition-all">
      {/* Container: flexible and overflow protected */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-4 lg:gap-6">
        
        {/* Zone 1: Brand Wordmark: Hangout-Hub */}
        <button
          onClick={() => handleNavClick('explorer')}
          className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2A1810] text-[#FAF7F2] flex items-center justify-center font-bold shadow-md group-hover:bg-[#C85A32] transition-colors">
            <Coffee className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-black tracking-tight text-[#2A1810] font-brand leading-none">
              Hangout-Hub
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-[#8C6D53] tracking-wider uppercase mt-0.5">
              Student Hangout Guide
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (responsive to prevent overflow on mid-size screens) */}
        <nav className="hidden xl:flex items-center gap-5 2xl:gap-6 text-xs sm:text-sm font-semibold text-[#5C4A3A]">
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

        {/* Compact nav links for medium screens (lg to xl) */}
        <nav className="hidden lg:flex xl:hidden items-center gap-3 text-xs font-semibold text-[#5C4A3A]">
          <button
            onClick={() => handleNavClick('explorer')}
            className={`whitespace-nowrap hover:text-[#2A1810] cursor-pointer ${
              activeTab === 'explorer' ? 'text-[#2A1810] font-bold underline' : ''
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => handleNavClick('reels')}
            className={`whitespace-nowrap hover:text-[#2A1810] cursor-pointer ${
              activeTab === 'reels' ? 'text-[#2A1810] font-bold underline' : ''
            }`}
          >
            Reels
          </button>
          <button
            onClick={() => handleNavClick('splitter')}
            className={`whitespace-nowrap hover:text-[#2A1810] cursor-pointer ${
              activeTab === 'splitter' ? 'text-[#2A1810] font-bold underline' : ''
            }`}
          >
            Splitter
          </button>
        </nav>

        {/* Zone 3: Actions, Night Mode Toggle, Admin, and Auth */}
        <div className="hidden sm:flex items-center gap-2 lg:gap-2.5 shrink-0">
          
          {/* Night Mode Toggle Button */}
          {onToggleNightMode && (
            <button
              onClick={onToggleNightMode}
              className="p-1.5 sm:p-2 text-[#5C4A3A] hover:text-[#2A1810] bg-[#FAF8F5] hover:bg-[#EFE7DA] border border-[#D9CDB8] rounded-xl transition-all cursor-pointer shadow-2xs"
              title={isNightMode ? 'Switch to Light Mode' : 'Switch to Night Mode'}
              aria-label="Toggle Night Mode"
            >
              {isNightMode ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-[#7C3AED]" />
              )}
            </button>
          )}

          {/* QR Code Generator Trigger */}
          <button
            onClick={onOpenQrGenerator}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#2A1810] bg-[#FAF8F5] hover:bg-[#EFE7DA] border border-[#D9CDB8] rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            title="Generate QR code for spots & UPI split"
          >
            <QrCode className="w-3.5 h-3.5 text-[#C85A32]" />
            <span className="hidden md:inline">QR Tools</span>
            <span className="md:hidden">QR</span>
          </button>

          {/* PHP DB Modal: STRICTLY HIDDEN from public visitors. ONLY visible to Admin */}
          {isAdmin && onOpenPhpModal && (
            <button
              onClick={onOpenPhpModal}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-[#6D28D9] bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 rounded-xl border border-[#7C3AED]/30 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              title="Admin Access: PHP & SQL Database CRUD Manager"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden lg:inline">Admin DB</span>
              <span className="lg:hidden">Admin</span>
            </button>
          )}

          {/* Submit Spot Button */}
          <button
            onClick={onOpenSubmitSpot}
            className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-[#2A1810] hover:bg-[#C85A32] rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Submit Spot</span>
            <span className="md:hidden">+ Spot</span>
          </button>

          {/* User Auth / Profile Badge */}
          {user ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 pr-2.5 sm:pr-3 py-1 bg-[#EFE7DA] hover:bg-[#E5DBCB] border border-[#D9CDB8] rounded-xl transition-all cursor-pointer shadow-2xs group"
              title="Open your profile, saved spots and history"
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shadow-xs shrink-0"
                style={{ backgroundColor: user.avatarColor || '#C85A32' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#2A1810] group-hover:text-[#C85A32] leading-tight truncate max-w-[80px]">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-[#8C6D53] leading-none">
                  {user.role === 'admin' ? 'Admin' : 'Profile'}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2A1810] bg-[#FAF8F5] hover:bg-[#EFE7DA] border border-[#D9CDB8] rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Sign In</span>
            </button>
          )}

        </div>

        {/* Mobile controls: Night Mode + Profile/Login + Menu Toggle */}
        <div className="flex lg:hidden items-center gap-1.5">
          {onToggleNightMode && (
            <button
              onClick={onToggleNightMode}
              className="p-1.5 text-[#5C4A3A] bg-[#EFE7DA] rounded-lg"
              title={isNightMode ? 'Light Mode' : 'Night Mode'}
              aria-label="Toggle Night Mode"
            >
              {isNightMode ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-[#7C3AED]" />
              )}
            </button>
          )}

          {user ? (
            <button
              onClick={onOpenProfile}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs"
              style={{ backgroundColor: user.avatarColor || '#C85A32' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="p-1.5 text-xs font-bold text-[#2A1810] bg-[#EFE7DA] rounded-lg"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 text-[#2A1810] hover:text-[#C85A32] focus:outline-none rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#E8DFC8] bg-[#FAF7F2] px-4 pt-3 pb-5 space-y-2">
          {/* User profile row on mobile */}
          {user ? (
            <div className="flex items-center justify-between p-3 bg-[#EFE7DA] rounded-2xl mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs"
                  style={{ backgroundColor: user.avatarColor || '#C85A32' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2A1810]">
                    {user.name} {user.role === 'admin' ? '(Admin)' : ''}
                  </div>
                  <div className="text-[10px] text-[#8C6D53]">{user.college}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfile();
                }}
                className="text-xs font-bold text-[#C85A32] underline"
              >
                View Profile
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-[#2A1810] bg-white border border-[#D9CDB8] rounded-xl mb-2"
            >
              <LogIn className="w-4 h-4 text-[#C85A32]" />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Night Mode Switcher row in mobile drawer */}
          {onToggleNightMode && (
            <div className="flex items-center justify-between px-3 py-2 bg-white/60 rounded-xl border border-[#E8DFC8] mb-1">
              <span className="text-xs font-bold text-[#2A1810] flex items-center gap-2">
                {isNightMode ? <Moon className="w-4 h-4 text-[#7C3AED]" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Night Mode: {isNightMode ? 'On' : 'Off'}</span>
              </span>
              <button
                onClick={onToggleNightMode}
                className="text-xs font-bold text-[#C85A32] px-2.5 py-1 bg-[#FAF8F5] rounded-lg border border-[#D9CDB8]"
              >
                {isNightMode ? 'Switch to Light' : 'Switch to Night'}
              </button>
            </div>
          )}

          <button
            onClick={() => handleNavClick('explorer')}
            className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-bold text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl"
          >
            <Compass className="w-4 h-4 text-[#C85A32]" />
            <span>Explore Spots</span>
          </button>
          <button
            onClick={() => handleNavClick('reels')}
            className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-bold text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl"
          >
            <Film className="w-4 h-4 text-[#C85A32]" />
            <span>Reel vs Reality Feed</span>
          </button>
          <button
            onClick={() => handleNavClick('deals')}
            className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-bold text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl"
          >
            <Tag className="w-4 h-4 text-[#C85A32]" />
            <span>Student Deals & Perks</span>
          </button>
          <button
            onClick={() => handleNavClick('splitter')}
            className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-bold text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl"
          >
            <Calculator className="w-4 h-4 text-[#C85A32]" />
            <span>Squad Bill Splitter</span>
          </button>
          <button
            onClick={() => handleNavClick('feedback')}
            className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-bold text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl"
          >
            <MessageSquareText className="w-4 h-4 text-[#C85A32]" />
            <span>Student Wishlist & Notes</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenQrGenerator();
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-bold text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl"
          >
            <QrCode className="w-4 h-4 text-[#C85A32]" />
            <span>QR Code Generator</span>
          </button>

          <div className="pt-2 border-t border-[#E8DFC8] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSubmitSpot();
              }}
              className="w-full text-center px-4 py-2.5 text-xs font-bold text-white bg-[#2A1810] hover:bg-[#C85A32] rounded-xl"
            >
              + Submit a Campus Spot
            </button>

            {/* Admin only PHP DB link on mobile */}
            {isAdmin && onOpenPhpModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenPhpModal();
                }}
                className="w-full text-center px-4 py-2 text-xs font-bold text-[#6D28D9] bg-[#7C3AED]/10 rounded-xl hover:bg-[#7C3AED]/20 flex items-center justify-center gap-2 border border-[#7C3AED]/30"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
                <span>Admin: Database Tables & PHP Backend</span>
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
