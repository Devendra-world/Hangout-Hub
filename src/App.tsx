/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { SubmitSpotModal } from './components/SubmitSpotModal.tsx';
import { CafePartnerModal } from './components/CafePartnerModal.tsx';
import { PhpDatabaseModal } from './components/PhpDatabaseModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ProfileModal } from './components/ProfileModal.tsx';
import { QrGeneratorModal } from './components/QrGeneratorModal.tsx';
import { Footer } from './components/Footer.tsx';

const DEFAULT_USER: UserProfile = {
  id: 'usr_devendra_1',
  name: 'Devendra Patadiya',
  email: 'patadiyadevendra5@gmail.com',
  role: 'student',
  college: 'CEPT & Gujarat University Campus',
  city: 'Ahmedabad',
  preferredBudget: 180,
  favoriteVibes: ['Budget Bite & Chill', 'Study & Projects', 'Aesthetic Hangout'],
  bio: 'Design student loving budget aesthetic cafes, outdoor neem tree shade & fast Wi-Fi for group study.',
  avatarColor: '#C85A32',
  upiId: 'patadiyadevendra5@oksbi'
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'reels' | 'deals' | 'splitter' | 'feedback'>('explorer');
  const [spots, setSpots] = useState<HangoutSpot[]>(AHMEDABAD_SPOTS);
  const [selectedSpot, setSelectedSpot] = useState<HangoutSpot | null>(null);
  
  // User Authentication & Profile
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('hangout_hub_user');
      return stored ? JSON.parse(stored) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // User bookmarked spot IDs for fast lookup
  const [bookmarkedSpotIds, setBookmarkedSpotIds] = useState<string[]>(['spot-zen-gufa', 'spot-mocha-cabanas']);

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

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('hangout_hub_user', JSON.stringify(user));
      } catch (e) {
        console.log('localStorage error:', e);
      }
    } else {
      localStorage.removeItem('hangout_hub_user');
    }
  }, [user]);

  // Fetch initial spots & survey from PHP database backend
  useEffect(() => {
    fetch('/spots.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.spots) && data.spots.length > 0) {
          setSpots(data.spots);
        }
      })
      .catch((err) => console.log('Using initial seed spots:', err));

    fetch('/survey.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.responses) {
          setSurveyResponses(data.responses);
          if (data.stats) setSurveyStats(data.stats);
        }
      })
      .catch((err) => console.log('Using initial seed survey:', err));
  }, []);

  // Fetch user bookmarks from PHP database if user is logged in
  useEffect(() => {
    if (user?.id) {
      fetch(`/profile.php?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.bookmarks)) {
            setBookmarkedSpotIds(data.bookmarks.map((b: any) => b.id));
          }
        })
        .catch((e) => console.log('Bookmarks fetch notice:', e));
    }
  }, [user?.id]);

  // Handle spot selection & record view in database history
  const handleSelectSpot = (spot: HangoutSpot) => {
    setSelectedSpot(spot);

    // Record view in SQL history for recommendations engine
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
    setSpots((prev) =>
      prev.map((s) =>
        s.id === spotId
          ? {
              ...s,
              scoutReview: {
                ...s.scoutReview,
                upvotes: s.scoutReview.upvotes + 1
              }
            }
          : s
      )
    );

    try {
      await fetch(`/spots.php?action=vote&id=${encodeURIComponent(spotId)}`, { method: 'POST' });

      // If user logged in, log upvote in user_history
      if (user?.id) {
        fetch('/history.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            spot_id: spotId,
            action_type: 'upvoted'
          })
        }).catch((e) => console.log('History vote error:', e));
      }
    } catch (e) {
      console.log('Vote network error:', e);
    }
  };

  const handleSpotAdded = (newSpot: HangoutSpot) => {
    setSpots((prev) => [newSpot, ...prev]);
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
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-amber-100 selection:text-amber-900 font-sans transition-colors duration-200">
      
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
          <GroupBillSplitter currentUser={user} />
        )}

        {activeTab === 'feedback' && (
          <StudentFeedbackSection
            responses={surveyResponses}
            stats={surveyStats}
            onFeedbackSubmitted={handleFeedbackSubmitted}
            onOpenSubmitSpot={() => setIsSubmitSpotOpen(true)}
          />
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
        />
      )}

      {/* User Login & Signup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(newUser) => {
          setUser(newUser);
        }}
      />

      {/* User Profile, Saved Spots & History Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateUser={(updated) => setUser(updated)}
        onLogout={() => setUser(null)}
        onSelectSpot={handleSelectSpot}
        onOpenQrGenerator={handleOpenQrForSpot}
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

    </div>
  );
}
