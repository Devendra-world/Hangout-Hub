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

  const navItems = [
    { id: 'explorer', label: 'Explore', icon: Compass, inactiveIconClass: 'text-[#C85A32] dark:text-amber-400' },
    { id: 'reels', label: 'Reels', icon: Film, inactiveIconClass: 'text-indigo-600 dark:text-indigo-400' },
    { id: 'splitter', label: 'Splitter', icon: Calculator, inactiveIconClass: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'deals', label: 'Deals', icon: Tag, inactiveIconClass: 'text-amber-600 dark:text-amber-400' },
    { id: 'feedback', label: 'Wishlist', icon: MessageSquareText, inactiveIconClass: 'text-blue-600 dark:text-blue-400' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 dark:bg-[#181411]/95 backdrop-blur-md border-b border-[#E8DFC8] dark:border-stone-800 transition-all">
      {/* Row 1: Brand + Desktop Center Nav (xl+) + Tablet/Desktop Actions (sm+) + Mobile Controls (<sm) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 h-16 sm:h-17 flex items-center justify-between gap-2 sm:gap-3 xl:gap-5">
        
        {/* Zone 1: Brand Wordmark: Hangout-Hub */}
        <button
          onClick={() => handleNavClick('explorer')}
          className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2A1810] dark:bg-stone-800 text-[#FAF7F2] flex items-center justify-center font-bold shadow-md group-hover:bg-[#C85A32] transition-colors shrink-0">
            <Coffee className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg xl:text-xl font-black tracking-tight text-[#2A1810] dark:text-[#F5EBE1] font-brand leading-none whitespace-nowrap">
              Hangout-Hub
            </span>
            <span className="hidden md:block xl:hidden 2xl:block text-[10px] font-semibold text-[#8C6D53] dark:text-[#B59D89] tracking-wider uppercase mt-0.5 whitespace-nowrap">
              Student Hangout Guide
            </span>
          </div>
        </button>

        {/* Zone 2: Desktop Single-Row Segmented Tabs (xl: >=1280px) */}
        <nav aria-label="Primary desktop navigation" className="hidden xl:flex items-center p-1 bg-[#EFE7DA]/80 dark:bg-stone-900 rounded-xl border border-[#D9CDB8]/80 dark:border-stone-800 shadow-2xs shrink-0 gap-0.5">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showDivider = idx === 3;
            return (
              <React.Fragment key={item.id}>
                {showDivider && (
                  <span aria-hidden="true" className="w-px h-5 bg-[#D9CDB8]/80 dark:bg-stone-700 mx-1" />
                )}
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs 2xl:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#2A1810] text-white dark:bg-amber-600 dark:text-white shadow-xs'
                      : 'text-[#5C4A3A] dark:text-stone-300 hover:text-[#2A1810] dark:hover:text-white hover:bg-white/60 dark:hover:bg-stone-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : item.inactiveIconClass}`} />
                  <span>{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Zone 3: Tablet & Desktop Action Bar (sm: >=640px) */}
        <div className="hidden sm:flex items-center gap-1.5 md:gap-2 xl:gap-2.5 shrink-0">
          {/* Night Mode Toggle Button */}
          {onToggleNightMode && (
            <button
              onClick={onToggleNightMode}
              className="p-2 text-[#5C4A3A] dark:text-stone-200 hover:text-[#2A1810] dark:hover:text-white bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EFE7DA] dark:hover:bg-stone-700 border border-[#D9CDB8] dark:border-stone-700 rounded-xl transition-all cursor-pointer shadow-2xs"
              title={isNightMode ? 'Switch to Light Mode' : 'Switch to Night Mode'}
              aria-label="Toggle Night Mode"
            >
              {isNightMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#7C3AED]" />
              )}
            </button>
          )}

          {/* QR Code Generator Trigger */}
          <button
            onClick={onOpenQrGenerator}
            className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-xs font-bold text-[#2A1810] dark:text-stone-100 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EFE7DA] dark:hover:bg-stone-700 border border-[#D9CDB8] dark:border-stone-700 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            title="Generate QR code for spots & UPI split"
          >
            <QrCode className="w-3.5 h-3.5 text-[#C85A32] dark:text-amber-400 shrink-0" />
            <span className="hidden md:inline">QR Tools</span>
            <span className="md:hidden">QR</span>
          </button>

          {/* PHP DB Modal: STRICTLY HIDDEN from public visitors. ONLY visible to Admin */}
          {isAdmin && onOpenPhpModal && (
            <button
              onClick={onOpenPhpModal}
              className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-xs font-bold text-[#6D28D9] dark:text-purple-300 bg-[#7C3AED]/10 dark:bg-[#7C3AED]/20 hover:bg-[#7C3AED]/20 rounded-xl border border-[#7C3AED]/30 dark:border-[#7C3AED]/40 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              title="Admin Access: PHP & SQL Database CRUD Manager"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-300 shrink-0" />
              <span className="hidden lg:inline">Admin DB</span>
              <span className="lg:hidden">Admin</span>
            </button>
          )}

          {/* Submit Spot Button */}
          <button
            onClick={onOpenSubmitSpot}
            className="flex items-center gap-1.5 px-3 md:px-3.5 py-1.5 text-xs font-bold text-white bg-[#2A1810] dark:bg-amber-700 hover:bg-[#C85A32] dark:hover:bg-amber-600 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Submit Spot</span>
            <span className="md:hidden">+ Spot</span>
          </button>

          {/* User Auth / Profile Badge */}
          {user ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 bg-[#EFE7DA] dark:bg-stone-800 hover:bg-[#E5DBCB] dark:hover:bg-stone-700 border border-[#D9CDB8] dark:border-stone-700 rounded-xl transition-all cursor-pointer shadow-2xs group"
              title="Open your profile, saved spots and history"
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold shadow-xs shrink-0"
                style={{ backgroundColor: user.avatarColor || '#C85A32' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[#2A1810] dark:text-stone-100 group-hover:text-[#C85A32] dark:group-hover:text-amber-400 leading-tight truncate max-w-[76px] lg:max-w-[96px]">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[9px] text-[#8C6D53] dark:text-stone-400 leading-none">
                  {user.role === 'admin' ? 'Admin' : 'Profile'}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2A1810] dark:text-stone-100 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#EFE7DA] dark:hover:bg-stone-700 border border-[#D9CDB8] dark:border-stone-700 rounded-xl transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-[#C85A32] dark:text-amber-400 shrink-0" />
              <span>Sign In</span>
            </button>
          )}
        </div>

        {/* Mobile controls (<640px): Night Mode + Profile/Login + Menu Toggle */}
        <div className="flex sm:hidden items-center gap-1.5">
          {onToggleNightMode && (
            <button
              onClick={onToggleNightMode}
              className="p-1.5 text-[#5C4A3A] dark:text-stone-200 bg-[#EFE7DA] dark:bg-stone-800 rounded-lg cursor-pointer"
              title={isNightMode ? 'Light Mode' : 'Night Mode'}
              aria-label="Toggle Night Mode"
            >
              {isNightMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#7C3AED]" />
              )}
            </button>
          )}

          {user ? (
            <button
              onClick={onOpenProfile}
              aria-label="Open user profile"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-xs cursor-pointer"
              style={{ backgroundColor: user.avatarColor || '#C85A32' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              aria-label="Sign in"
              className="p-1.5 text-xs font-bold text-[#2A1810] dark:text-stone-100 bg-[#EFE7DA] dark:bg-stone-800 rounded-lg cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#2A1810] dark:text-stone-100 hover:text-[#C85A32] focus:outline-none rounded-lg cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Row 2: Mobile & Tablet Full 5-Tab Segmented Navigation Bar (<1280px) */}
      <div className="xl:hidden px-3 sm:px-5 lg:px-6 py-1.5 bg-[#FAF7F2]/95 dark:bg-[#181411]/95 border-t border-[#E8DFC8]/80 dark:border-stone-800">
        <nav
          aria-label="Primary tablet and mobile navigation"
          className="max-w-7xl mx-auto grid grid-cols-5 p-1 bg-[#EFE7DA]/80 dark:bg-stone-900 rounded-xl border border-[#D9CDB8]/70 dark:border-stone-800 gap-1 sm:gap-1.5"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 py-1.5 sm:py-2 px-1 sm:px-2.5 rounded-lg text-[10.5px] sm:text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2A1810] text-white dark:bg-amber-600 dark:text-white shadow-2xs'
                    : 'text-[#5C4A3A] dark:text-stone-300 hover:text-[#2A1810] dark:hover:text-white hover:bg-white/60 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 ${isActive ? 'text-amber-400' : item.inactiveIconClass}`} />
                <span className="leading-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu (<640px) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[#E8DFC8] dark:border-stone-800 bg-[#FAF7F2] dark:bg-[#181411] px-4 pt-3 pb-5 space-y-2">
          {/* User profile row on mobile */}
          {user ? (
            <div className="flex items-center justify-between p-3 bg-[#EFE7DA] dark:bg-stone-900 rounded-2xl border border-[#D9CDB8] dark:border-stone-800 mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0"
                  style={{ backgroundColor: user.avatarColor || '#C85A32' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2A1810] dark:text-stone-100">
                    {user.name} {user.role === 'admin' ? '(Admin)' : ''}
                  </div>
                  <div className="text-[10px] text-[#8C6D53] dark:text-stone-400">{user.college}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenProfile();
                }}
                className="text-xs font-bold text-[#C85A32] dark:text-amber-400 underline cursor-pointer"
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-[#2A1810] dark:text-stone-100 bg-white dark:bg-stone-800 border border-[#D9CDB8] dark:border-stone-700 rounded-xl mb-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#C85A32] dark:text-amber-400" />
              <span>Sign In / Register</span>
            </button>
          )}

          {/* Night Mode Switcher row in mobile drawer */}
          {onToggleNightMode && (
            <div className="flex items-center justify-between px-3 py-2 bg-white/60 dark:bg-stone-900/60 rounded-xl border border-[#E8DFC8] dark:border-stone-800 mb-1">
              <span className="text-xs font-bold text-[#2A1810] dark:text-stone-200 flex items-center gap-2">
                {isNightMode ? <Moon className="w-4 h-4 text-[#7C3AED]" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Night Mode: {isNightMode ? 'On' : 'Off'}</span>
              </span>
              <button
                onClick={onToggleNightMode}
                className="text-xs font-bold text-[#C85A32] dark:text-amber-400 px-2.5 py-1 bg-[#FAF8F5] dark:bg-stone-800 rounded-lg border border-[#D9CDB8] dark:border-stone-700 cursor-pointer"
              >
                {isNightMode ? 'Switch to Light' : 'Switch to Night'}
              </button>
            </div>
          )}

          <button
            onClick={() => handleNavClick('explorer')}
            className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-bold rounded-xl cursor-pointer ${
              activeTab === 'explorer'
                ? 'bg-[#2A1810] text-white dark:bg-amber-600 dark:text-white'
                : 'text-[#2A1810] dark:text-stone-200 hover:bg-[#EFE7DA] dark:hover:bg-stone-800'
            }`}
          >
            <Compass className={`w-4 h-4 ${activeTab === 'explorer' ? 'text-amber-400' : 'text-[#C85A32]'}`} />
            <span>Explore Spots</span>
          </button>
          <button
            onClick={() => handleNavClick('reels')}
            className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-bold rounded-xl cursor-pointer ${
              activeTab === 'reels'
                ? 'bg-[#2A1810] text-white dark:bg-amber-600 dark:text-white'
                : 'text-[#2A1810] dark:text-stone-200 hover:bg-[#EFE7DA] dark:hover:bg-stone-800'
            }`}
          >
            <Film className={`w-4 h-4 ${activeTab === 'reels' ? 'text-amber-400' : 'text-[#C85A32]'}`} />
            <span>Reel vs Reality Feed</span>
          </button>
          <button
            onClick={() => handleNavClick('deals')}
            className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-bold rounded-xl cursor-pointer ${
              activeTab === 'deals'
                ? 'bg-[#2A1810] text-white dark:bg-amber-600 dark:text-white'
                : 'text-[#2A1810] dark:text-stone-200 hover:bg-[#EFE7DA] dark:hover:bg-stone-800'
            }`}
          >
            <Tag className={`w-4 h-4 ${activeTab === 'deals' ? 'text-amber-400' : 'text-[#C85A32]'}`} />
            <span>Student Deals & Perks</span>
          </button>
          <button
            onClick={() => handleNavClick('splitter')}
            className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-bold rounded-xl cursor-pointer ${
              activeTab === 'splitter'
                ? 'bg-[#2A1810] text-white dark:bg-amber-600 dark:text-white'
                : 'text-[#2A1810] dark:text-stone-200 hover:bg-[#EFE7DA] dark:hover:bg-stone-800'
            }`}
          >
            <Calculator className={`w-4 h-4 ${activeTab === 'splitter' ? 'text-amber-400' : 'text-[#C85A32]'}`} />
            <span>Squad Bill Splitter</span>
          </button>
          <button
            onClick={() => handleNavClick('feedback')}
            className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-bold rounded-xl cursor-pointer ${
              activeTab === 'feedback'
                ? 'bg-[#2A1810] text-white dark:bg-amber-600 dark:text-white'
                : 'text-[#2A1810] dark:text-stone-200 hover:bg-[#EFE7DA] dark:hover:bg-stone-800'
            }`}
          >
            <MessageSquareText className={`w-4 h-4 ${activeTab === 'feedback' ? 'text-amber-400' : 'text-[#C85A32]'}`} />
            <span>Student Wishlist & Notes</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenQrGenerator();
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm font-bold text-[#2A1810] dark:text-stone-200 hover:bg-[#EFE7DA] dark:hover:bg-stone-800 rounded-xl cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#C85A32]" />
            <span>QR Code Generator</span>
          </button>

          <div className="pt-2 border-t border-[#E8DFC8] dark:border-stone-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSubmitSpot();
              }}
              className="w-full text-center px-4 py-2.5 text-xs font-bold text-white bg-[#2A1810] dark:bg-amber-700 hover:bg-[#C85A32] dark:hover:bg-amber-600 rounded-xl cursor-pointer"
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
                className="w-full text-center px-4 py-2 text-xs font-bold text-[#6D28D9] dark:text-purple-300 bg-[#7C3AED]/10 dark:bg-[#7C3AED]/20 rounded-xl hover:bg-[#7C3AED]/20 flex items-center justify-center gap-2 border border-[#7C3AED]/30 cursor-pointer"
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
              className="w-full text-center px-4 py-2 text-xs font-semibold text-[#5C4A3A] dark:text-stone-300 bg-[#FAF7F2] dark:bg-stone-800 border border-[#E8DFC8] dark:border-stone-700 rounded-xl hover:bg-[#E5DBCB] dark:hover:bg-stone-700 cursor-pointer"
            >
              Cafe Owner Promotion Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
