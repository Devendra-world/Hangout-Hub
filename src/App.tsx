/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HangoutSpot, SurveyResponse } from './types/index.ts';
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
import { Footer } from './components/Footer.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'reels' | 'deals' | 'splitter' | 'feedback'>('explorer');
  const [spots, setSpots] = useState<HangoutSpot[]>(AHMEDABAD_SPOTS);
  const [selectedSpot, setSelectedSpot] = useState<HangoutSpot | null>(null);
  const [isSubmitSpotOpen, setIsSubmitSpotOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isPhpModalOpen, setIsPhpModalOpen] = useState(false);

  // Community survey responses & stats
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>(AHMEDABAD_COMMUNITY_FEED);
  const [surveyStats, setSurveyStats] = useState({
    total: AHMEDABAD_COMMUNITY_FEED.length,
    avgMaxBudget: 215,
    avgGroupSize: 6.6,
    frustrations: {},
    priorities: {}
  });

  // Fetch initial spots from backend API
  useEffect(() => {
    fetch('/api/spots')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.spots) && data.spots.length > 0) {
          setSpots(data.spots);
        }
      })
      .catch((err) => console.log('Using initial seed spots:', err));

    fetch('/api/survey')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.responses) {
          setSurveyResponses(data.responses);
          if (data.stats) setSurveyStats(data.stats);
        }
      })
      .catch((err) => console.log('Using initial seed survey:', err));
  }, []);

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
      await fetch(`/api/spots/${spotId}/vote`, { method: 'POST' });
    } catch (e) {
      console.log('Vote network error:', e);
    }
  };

  const handleSpotAdded = (newSpot: HangoutSpot) => {
    setSpots((prev) => [newSpot, ...prev]);
    setSelectedSpot(newSpot); // open the new spot directly to inspect
  };

  const handleFeedbackSubmitted = (newResponse: SurveyResponse, updatedStats: any) => {
    setSurveyResponses((prev) => [newResponse, ...prev]);
    if (updatedStats) {
      setSurveyStats(updatedStats);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      
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
                onSelectSpot={(spot) => setSelectedSpot(spot)}
                onVoteSpot={handleVoteSpot}
                onOpenSubmitSpot={() => setIsSubmitSpotOpen(true)}
              />
            </div>
          </>
        )}

        {activeTab === 'reels' && (
          <ReelRealityFeed
            spots={spots}
            onSelectSpot={(spot) => setSelectedSpot(spot)}
          />
        )}

        {activeTab === 'deals' && (
          <CafeDealsSection
            spots={spots}
            onSelectSpot={(spot) => setSelectedSpot(spot)}
            onOpenPartnerModal={() => setIsPartnerModalOpen(true)}
          />
        )}

        {activeTab === 'splitter' && (
          <GroupBillSplitter />
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

      {/* Modals & Dialogs */}
      <SpotDetailModal
        spot={selectedSpot}
        onClose={() => setSelectedSpot(null)}
        onVote={handleVoteSpot}
      />

      <SubmitSpotModal
        isOpen={isSubmitSpotOpen}
        onClose={() => setIsSubmitSpotOpen(false)}
        onSpotAdded={handleSpotAdded}
      />

      <CafePartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />

      <PhpDatabaseModal
        isOpen={isPhpModalOpen}
        onClose={() => setIsPhpModalOpen(false)}
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
      />

    </div>
  );
}
