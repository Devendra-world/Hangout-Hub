/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { HangoutSpot, SurveyResponse, UserProfile } from './types/index.ts';
import { AHMEDABAD_SPOTS, AHMEDABAD_COMMUNITY_FEED } from './data/initialData.ts';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { SpotExplorer } from './components/SpotExplorer.tsx';
import { SpotDetailModal } from './components/SpotDetailModal.tsx';
import { ReelRealityFeed } from './components/ReelRealityFeed.tsx';
import { CafeDealsSection } from './components/CafeDealsSection.tsx';
import { GroupBillSplitter } from './components/GroupBillSplitter.tsx';
import { StudentFeedbackSection } from './components/StudentFeedbackSection.tsx';
import { LiveSurveySection } from './components/LiveSurveySection.tsx';
import { SubmitSpotModal } from './components/SubmitSpotModal.tsx';
import { CafePartnerModal } from './components/CafePartnerModal.tsx';
import { PhpDatabaseModal } from './components/PhpDatabaseModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { QrGeneratorModal } from './components/QrGeneratorModal.tsx';
import { Footer } from './components/Footer.tsx';
import InstallPrompt from './components/InstallPrompt.tsx';



const CORE_HUB_CITIES = ['Ahmedabad', 'Gandhinagar', 'Delhi NCR', 'Bengaluru', 'Mumbai', 'Pune'];

export function validateAndFormatCityName(raw: string): string | null {
  const collapsed = raw.replace(/\s+/g, ' ').trim();
  if (!collapsed) return null;
  if (collapsed.length < 2 || collapsed.length > 40) return null;
  if (/[<>;"'`\\/{}[\]=]/.test(collapsed)) return null;
  if (!/[a-zA-Z]{2,}/.test(collapsed)) return null;
  return collapsed
    .split(' ')
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'reels' | 'deals' | 'splitter' | 'feedback'>('explorer');
  const [feedbackView, setFeedbackView] = useState<'community' | 'survey'>('community');
  const [spots, setSpots] = useState<HangoutSpot[]>(AHMEDABAD_SPOTS);
  const [selectedSpot, setSelectedSpot] = useState<HangoutSpot | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Custom / Selected Cities persisted by user (validated on load)
  const [customCities, setCustomCities] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('hangout_hub_custom_cities');
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((c) => (typeof c === 'string' ? validateAndFormatCityName(c) : null))
        .filter((c): c is string => Boolean(c));
    } catch {
      return [];
    }
  });

  // User Authentication & Profile (respects explicit logged-out state across reloads)
// User Authentication & Profile (login nahi hai to null → Login / Sign Up dikhega)
const [user, setUser] = useState<UserProfile | null>(() => {
  try {
    if (localStorage.getItem('hangout_hub_logged_out') === 'true') {
      return null;
    }
    const stored = localStorage.getItem('hangout_hub_user');
    return stored ? JSON.parse(stored) : null;   // ✅ pehle yahan DEFAULT_USER tha
  } catch {
    return null;                                  // ✅ yahan bhi
  }
});

  // User bookmarked spot IDs for fast lookup
  const [bookmarkedSpotIds, setBookmarkedSpotIds] = useState<string[]>([]);

  // Modals state
  const [isSubmitSpotOpen, setIsSubmitSpotOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isPhpModalOpen, setIsPhpModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrSpotTarget, setQrSpotTarget] = useState<HangoutSpot | null>(null);

  // Community survey responses & stats
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>(AHMEDABAD_COMMUNITY_FEED);
  const [surveyStats, setSurveyStats] = useState({
    total: AHMEDABAD_COMMUNITY_FEED.length,
    avgMaxBudget: 215,
    avgGroupSize: 6.6,
    frustrations: {},
    priorities: {}
  });

  // Night Mode state
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('hangout_hub_night_mode');
      return stored !== null ? stored === 'true' : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isNightMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('hangout_hub_night_mode', String(isNightMode));
    } catch (e) {
      console.warn('Could not persist theme:', e);
    }
  }, [isNightMode]);

  // Global Escape key listener to close topmost open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isQrModalOpen) {
        setIsQrModalOpen(false);
        setQrSpotTarget(null);
      } else if (isProfileModalOpen) {
        setIsProfileModalOpen(false);
      } else if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
      } else if (isPhpModalOpen) {
        setIsPhpModalOpen(false);
      } else if (isPartnerModalOpen) {
        setIsPartnerModalOpen(false);
      } else if (isSubmitSpotOpen) {
        setIsSubmitSpotOpen(false);
      } else if (selectedSpot) {
        setSelectedSpot(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isQrModalOpen,
    isProfileModalOpen,
    isAuthModalOpen,
    isPhpModalOpen,
    isPartnerModalOpen,
    isSubmitSpotOpen,
    selectedSpot
  ]);

  useEffect(() => {
    try {
      localStorage.setItem('hangout_hub_custom_cities', JSON.stringify(customCities));
    } catch (e) {
      console.warn('Could not persist custom cities:', e);
    }
  }, [customCities]);

  const availableCities = useMemo(() => {
    const cityMap = new Map<string, string>();
    const addCityNormalized = (c: string) => {
      const trimmed = c.trim();
      if (!trimmed) return;
      const key = trimmed.toLowerCase();
      if (!cityMap.has(key)) {
        cityMap.set(key, trimmed);
      }
    };
    CORE_HUB_CITIES.forEach(addCityNormalized);
    spots.forEach((s) => {
      if (s.city) addCityNormalized(s.city);
    });
    customCities.forEach(addCityNormalized);
    return Array.from(cityMap.values());
  }, [spots, customCities]);

  const handleAddOrSelectCity = (cityInput: string): boolean => {
    const clean = cityInput.trim();
    if (!clean) return false;
    if (clean.toLowerCase() === 'all') {
      setSelectedCity('all');
      return true;
    }
    const existing = availableCities.find((c) => c.toLowerCase() === clean.toLowerCase());
    if (existing) {
      setSelectedCity(existing);
      return true;
    }
    const formatted = validateAndFormatCityName(clean);
    if (!formatted) {
      return false;
    }
    const existingFormatted = availableCities.find((c) => c.toLowerCase() === formatted.toLowerCase());
    if (existingFormatted) {
      setSelectedCity(existingFormatted);
      return true;
    }
    setCustomCities((prev) => [...prev, formatted]);
    setSelectedCity(formatted);
    return true;
  };

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('hangout_hub_user', JSON.stringify(user));
        localStorage.removeItem('hangout_hub_logged_out');
      } catch (e) {
        console.log('localStorage error:', e);
      }
    } else {
      localStorage.removeItem('hangout_hub_user');
    }
  }, [user]);

  const handleLoginSuccess = (newUser: UserProfile, token?: string) => {
    try {
      localStorage.removeItem('hangout_hub_logged_out');
      if (token) {
        localStorage.setItem('hangout_hub_token', token);
      }
    } catch {}
    setUser(newUser);
  };

  const handleLogout = () => {
    const token = localStorage.getItem('hangout_hub_token');
    try {
      localStorage.setItem('hangout_hub_logged_out', 'true');
      localStorage.removeItem('hangout_hub_user');
      localStorage.removeItem('hangout_hub_token');
    } catch {}
    setUser(null);
    setBookmarkedSpotIds([]);
    fetch('/auth.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
              'X-Auth-Token': token
            }
          : {})
      },
      body: JSON.stringify({ action: 'logout', _auth_token: token || '' })
    }).catch(() => {});
  };

  const refreshSpots = () => {
    fetch('/spots.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.spots)) {
          setSpots(data.spots);
        }
      })
      .catch((err) => console.log('Using initial seed spots:', err));
  };

  // Fetch initial approved spots, survey & verify live DB session on mount
  useEffect(() => {
    refreshSpots();

    fetch('/survey.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.responses) {
          setSurveyResponses(data.responses);
          if (data.stats) setSurveyStats(data.stats);
        }
      })
      .catch((err) => console.log('Using initial seed survey:', err));

    const existingToken = localStorage.getItem('hangout_hub_token');
    if (existingToken) {
      fetch(`/auth.php?action=me&_auth_token=${encodeURIComponent(existingToken)}`, {
        headers: {
          Authorization: `Bearer ${existingToken}`,
          'X-Auth-Token': existingToken
        }
      })
        .then(async (res) => {
          if (res.status === 401) {
            localStorage.removeItem('hangout_hub_token');
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data?.success && data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Fetch user bookmarks & synced profile from backend if user is logged in
useEffect(() => {
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (window.navigator as any).standalone === true;

  if (!isStandalone) return;

  let exitTimer: number;

  const timer = window.setTimeout(() => {
    const splash = document.getElementById("startup-splash");

    if (!splash) {
      document.documentElement.classList.add("app-visible");
      return;
    }

    document.documentElement.classList.add("splash-exit");

    exitTimer = window.setTimeout(() => {
      splash.remove();
      document.documentElement.classList.add("app-visible");
    }, 700);
  }, 4000);

  return () => {
    window.clearTimeout(timer);
    window.clearTimeout(exitTimer);
  };
}, []);

  // Handle spot selection & record view in database history
  const handleSelectSpot = (spot: HangoutSpot) => {
    setSelectedSpot(spot);

    if (user?.id) {
      fetch('/history.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          spot_id: spot.id,
          action_type: 'viewed',
          metadata: { name: spot.name, vibe: spot.vibeCategory, cost: spot.realPerPersonCost.avg }
        })
      }).catch((e) => console.log('History view log error:', e));
    }
  };

  // Handle toggling bookmark/save
  const handleToggleBookmark = (spot: HangoutSpot) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const isAlreadySaved = bookmarkedSpotIds.includes(spot.id);
    const newAction = isAlreadySaved ? 'unsaved' : 'saved';

    setBookmarkedSpotIds((prev) =>
      isAlreadySaved ? prev.filter((id) => id !== spot.id) : [...prev, spot.id]
    );

    fetch('/history.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        spot_id: spot.id,
        action_type: newAction
      })
    }).catch((e) => console.log('Bookmark error:', e));
  };

  const handleVoteSpot = async (spotId: string) => {
    const token = localStorage.getItem('hangout_hub_token') || '';
    if (!user || !token) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/spots.php?action=vote&id=${encodeURIComponent(spotId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'vote',
          id: spotId,
          user_id: user.id,
          _auth_token: token
        })
      });
      if (res.status === 401) {
        localStorage.removeItem('hangout_hub_token');
        setIsAuthModalOpen(true);
        return;
      }
      const data = await res.json();

      if (data.success && typeof data.upvotes === 'number') {
        setSpots((prev) =>
          prev.map((s) =>
            s.id === spotId
              ? {
                  ...s,
                  scoutReview: {
                    ...s.scoutReview,
                    upvotes: data.upvotes
                  }
                }
              : s
          )
        );
        setSelectedSpot((prev) =>
          prev && prev.id === spotId
            ? {
                ...prev,
                scoutReview: {
                  ...prev.scoutReview,
                  upvotes: data.upvotes
                }
              }
            : prev
        );

        if (user?.id && !data.alreadyVoted) {
          fetch('/history.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              spot_id: spotId,
              action_type: 'upvoted'
            })
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.log('Vote network error:', e);
    }
  };

  const handleSpotAdded = (newSpot: HangoutSpot, pendingModeration?: boolean) => {
    if (pendingModeration) {
      // Held in moderation queue until an Admin approves it
      return;
    }
    setSpots((prev) => [newSpot, ...prev]);
    if (newSpot.city) {
      handleAddOrSelectCity(newSpot.city);
    }
    setSelectedSpot(newSpot);
  };

  const handleFeedbackSubmitted = (newResponse: SurveyResponse, updatedStats: any) => {
    setSurveyResponses((prev) => [newResponse, ...prev]);
    if (updatedStats) {
      setSurveyStats(updatedStats);
    }
  };

  const handleOpenQrForSpot = (spot?: HangoutSpot) => {
    setQrSpotTarget(spot || null);
    setIsQrModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#120E0B] text-stone-900 dark:text-stone-100 selection:bg-amber-100 selection:text-amber-900 dark:selection:bg-amber-900 dark:selection:text-amber-100 font-sans transition-colors duration-200">
      

      {/* Navigation Top Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSubmitSpot={() => setIsSubmitSpotOpen(true)}
        onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        onOpenPhpModal={() => setIsPhpModalOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenQrGenerator={() => handleOpenQrForSpot()}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode((prev) => !prev)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {activeTab === 'explorer' && (
          <>
            <HeroSection
              onExploreClick={() => {
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onReelsClick={() => {
                setActiveTab('reels');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSplitterClick={() => {
                setActiveTab('splitter');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              totalSpotsCount={spots.length}
            />

            <div id="catalog-section">
              <SpotExplorer
                spots={spots}
                selectedCity={selectedCity}
                availableCities={availableCities}
                onSelectCity={setSelectedCity}
                onAddOrSelectCity={handleAddOrSelectCity}
                onSelectSpot={handleSelectSpot}
                onVoteSpot={handleVoteSpot}
                onOpenSubmitSpot={() => setIsSubmitSpotOpen(true)}
                user={user}
                onOpenQr={handleOpenQrForSpot}
                onOpenAuth={() => setIsAuthModalOpen(true)}
              />
            </div>
          </>
        )}

        {activeTab === 'reels' && (
          <ReelRealityFeed
            spots={spots}
            onSelectSpot={handleSelectSpot}
          />
        )}

        {activeTab === 'deals' && (
          <CafeDealsSection
            spots={spots}
            onSelectSpot={handleSelectSpot}
            onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
          />
        )}

        {activeTab === 'splitter' && (
          <GroupBillSplitter currentUser={user} selectedCity={selectedCity} />
        )}

        {activeTab === 'feedback' && (
          <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              <div className="inline-flex items-center p-1 bg-[#EFE7DA] dark:bg-[#1C1612] border border-[#D9CDB8] dark:border-[#33271F] rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setFeedbackView('community')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    feedbackView === 'community'
                      ? 'bg-[#2A1810] dark:bg-amber-600 text-white shadow-2xs'
                      : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  Community Tips & Wishlist
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackView('survey')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    feedbackView === 'survey'
                      ? 'bg-[#2A1810] dark:bg-amber-600 text-white shadow-2xs'
                      : 'text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  Campus Hangout Survey Poll
                </button>
              </div>
            </div>

            {feedbackView === 'community' ? (
              <StudentFeedbackSection
                responses={surveyResponses}
                stats={surveyStats}
                onFeedbackSubmitted={handleFeedbackSubmitted}
                onOpenSubmitSpot={() => setIsSubmitSpotOpen(true)}
              />
            ) : (
              <LiveSurveySection
                responses={surveyResponses}
                stats={surveyStats}
                onSurveySubmitted={handleFeedbackSubmitted}
              />
            )}
          </div>
        )}
      </main>

      {/* Spot Detail Modal with QR & Save Spot */}
      <SpotDetailModal
        spot={selectedSpot}
        onClose={() => setSelectedSpot(null)}
        onVote={handleVoteSpot}
        onOpenQr={handleOpenQrForSpot}
        onToggleSave={handleToggleBookmark}
        isSaved={selectedSpot ? bookmarkedSpotIds.includes(selectedSpot.id) : false}
      />

      {/* Student Spot Submission Modal */}
      <SubmitSpotModal
        isOpen={isSubmitSpotOpen}
        onClose={() => setIsSubmitSpotOpen(false)}
        onSpotAdded={handleSpotAdded}
        defaultCity={selectedCity !== 'all' ? selectedCity : 'Ahmedabad'}
        availableCities={availableCities}
        user={user}
        onRequireAuth={() => {
          setIsSubmitSpotOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Cafe Partner Proposal Modal */}
      <CafePartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />

      {/* PHP & SQL Database Center: STRICTLY ADMIN ONLY */}
      {user?.role === 'admin' && (
        <PhpDatabaseModal
          isOpen={isPhpModalOpen}
          onClose={() => setIsPhpModalOpen(false)}
          onDataChanged={refreshSpots}
          onRequireReauth={() => {
            setIsPhpModalOpen(false);
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {/* User Login & Signup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* User Profile, Saved Spots & History Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser(updated)}
        onLogout={handleLogout}
        onSelectSpot={handleSelectSpot}
        onOpenQrGenerator={handleOpenQrForSpot}
        onBookmarkRemoved={(spotId) =>
          setBookmarkedSpotIds((prev) => prev.filter((id) => id !== spotId))
        }
      />

      {/* QR Code Generator Modal (Spots & UPI Bill Splits) */}
      <QrGeneratorModal
        isOpen={isQrModalOpen}
        onClose={() => {
          setIsQrModalOpen(false);
          setQrSpotTarget(null);
        }}
        spot={qrSpotTarget}
        spots={spots}
        user={user}
      />

      {/* Footer */}
      <Footer
        onSelectTab={(tab) => {
          setActiveTab(tab as any);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSubmitSpot={() => setIsSubmitSpotOpen(true)}
        onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
        onOpenPhpModal={() => setIsPhpModalOpen(true)}
        isAdmin={user?.role === 'admin'}
        onOpenQrGenerator={() => handleOpenQrForSpot()}
      />

          <InstallPrompt />

    </div>
  );
}
