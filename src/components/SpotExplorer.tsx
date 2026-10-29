/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { HangoutSpot, VibeCategory, UserProfile } from '../types/index.ts';
import { SpotCard } from './SpotCard.tsx';
import { RecommendedShelf } from './RecommendedShelf.tsx';
import { Search, SlidersHorizontal, RotateCcw, Sparkles, MapPin, Globe, PlusCircle } from 'lucide-react';

interface SpotExplorerProps {
  spots: HangoutSpot[];
  onSelectSpot: (spot: HangoutSpot) => void;
  onVoteSpot: (spotId: string) => void;
  onOpenSubmitSpot: () => void;
  user?: UserProfile | null;
  onOpenQr?: (spot: HangoutSpot) => void;
  onOpenAuth?: () => void;
}

const CITY_CAMPUS_AREAS: Record<string, { label: string; value: string }[]> = {
  Ahmedabad: [
    { label: 'All Ahmedabad', value: 'all' },
    { label: 'Navrangpura (CEPT / HL / GU)', value: 'Navrangpura' },
    { label: 'Vastrapur (IIM-A & Lake)', value: 'Vastrapur' },
    { label: 'Sindhu Bhavan (SBR / Bodakdev)', value: 'Sindhu Bhavan' },
    { label: 'Ambawadi (NID / Polytech)', value: 'Ambawadi' },
    { label: 'Prahladnagar', value: 'Prahladnagar' }
  ],
  Gandhinagar: [
    { label: 'All Gandhinagar', value: 'all' },
    { label: 'Raysan / PDPU', value: 'Raysan' },
    { label: 'GNLU / Infocity', value: 'GNLU' },
    { label: 'Kudasan / DA-IICT', value: 'Kudasan' }
  ],
  'Delhi NCR': [
    { label: 'All Delhi NCR', value: 'all' },
    { label: 'DU North Campus (Hindu / Miranda / Ramjas)', value: 'North Campus' },
    { label: 'South Campus (Venkateshwara)', value: 'South Campus' },
    { label: 'Hauz Khas / IIT Delhi', value: 'Hauz Khas' }
  ],
  Bengaluru: [
    { label: 'All Bengaluru', value: 'all' },
    { label: 'Koramangala (Christ Univ)', value: 'Koramangala' },
    { label: 'Indiranagar', value: 'Indiranagar' },
    { label: 'Church Street', value: 'Church Street' }
  ],
  Mumbai: [
    { label: 'All Mumbai', value: 'all' },
    { label: 'Juhu (Mithibai & NMIMS)', value: 'Juhu' },
    { label: 'Bandra (St. Andrews & National)', value: 'Bandra' },
    { label: 'Churchgate (HR & KC College)', value: 'Churchgate' }
  ],
  Pune: [
    { label: 'All Pune', value: 'all' },
    { label: 'FC Road (Fergusson College)', value: 'FC Road' },
    { label: 'Viman Nagar (Symbiosis)', value: 'Viman Nagar' },
    { label: 'Shivajinagar (COEP)', value: 'Shivajinagar' }
  ]
};

const VIBE_CATEGORIES: (VibeCategory | 'All')[] = [
  'All',
  'Budget Bite & Chill',
  'Study & Projects',
  'Aesthetic Hangout',
  'Board Games & Fun',
  'Late Night Hangout'
];

export const SpotExplorer: React.FC<SpotExplorerProps> = ({
  spots,
  onSelectSpot,
  onVoteSpot,
  onOpenSubmitSpot,
  user,
  onOpenQr,
  onOpenAuth
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedVibe, setSelectedVibe] = useState<VibeCategory | 'All'>('All');
  const [budgetTier, setBudgetTier] = useState<number | 'any'>('any');
  const [minGroupSize, setMinGroupSize] = useState<number | 'any'>('any');
  const [requireFastWifi, setRequireFastWifi] = useState(false);
  const [requirePowerPlugs, setRequirePowerPlugs] = useState(false);
  const [requireLateNight, setRequireLateNight] = useState(false);
  const [requireOutsideCake, setRequireOutsideCake] = useState(false);

  // Dynamically compute all available cities including user submissions
  const availableCities = useMemo(() => {
    const citySet = new Set<string>();
    // Pre-populate prominent hub cities
    ['Ahmedabad', 'Gandhinagar', 'Delhi NCR', 'Bengaluru', 'Mumbai', 'Pune'].forEach((c) =>
      citySet.add(c)
    );
    // Add any custom cities from spots
    spots.forEach((s) => {
      if (s.city && s.city.trim()) {
        citySet.add(s.city.trim());
      }
    });
    return Array.from(citySet);
  }, [spots]);

  // Compute areas for the selected city
  const activeAreas = useMemo(() => {
    if (selectedCity === 'all') {
      return [
        { label: 'All Campus Hubs', value: 'all' },
        { label: 'CEPT & HL (Ahmedabad)', value: 'Navrangpura' },
        { label: 'IIM-A & Vastrapur (Ahmedabad)', value: 'Vastrapur' },
        { label: 'PDPU & GNLU (Gandhinagar)', value: 'Raysan' },
        { label: 'DU North Campus (Delhi)', value: 'DU North' },
        { label: 'Christ Univ (Bengaluru)', value: 'Koramangala' },
        { label: 'Mithibai & NMIMS (Mumbai)', value: 'Juhu' },
        { label: 'Bandra West (Mumbai)', value: 'Bandra' },
        { label: 'Fergusson / FC Road (Pune)', value: 'FC Road' }
      ];
    }

    if (CITY_CAMPUS_AREAS[selectedCity]) {
      return CITY_CAMPUS_AREAS[selectedCity];
    }

    // Custom city added by student
    const customAreas = new Set<string>();
    spots
      .filter((s) => s.city?.toLowerCase() === selectedCity.toLowerCase())
      .forEach((s) => {
        if (s.neighborhood) customAreas.add(s.neighborhood);
      });

    return [
      { label: `All ${selectedCity}`, value: 'all' },
      ...Array.from(customAreas).map((area) => ({ label: area, value: area }))
    ];
  }, [selectedCity, spots]);

  // Filtered spots calculation
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      // City filter
      if (selectedCity !== 'all') {
        const spotCity = spot.city?.toLowerCase() || '';
        const selectedCityLower = selectedCity.toLowerCase();
        if (spotCity !== selectedCityLower && !spot.tags.some((t) => t.toLowerCase() === selectedCityLower)) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = spot.name.toLowerCase().includes(q);
        const matchTagline = spot.tagline.toLowerCase().includes(q);
        const matchArea = spot.neighborhood.toLowerCase().includes(q);
        const matchCity = spot.city ? spot.city.toLowerCase().includes(q) : false;
        const matchCampus = spot.campusName ? spot.campusName.toLowerCase().includes(q) : false;
        const matchDistance = spot.distanceToCampus.toLowerCase().includes(q);
        const matchTag = spot.tags.some((t) => t.toLowerCase().includes(q));

        if (!matchName && !matchTagline && !matchArea && !matchCity && !matchCampus && !matchDistance && !matchTag) {
          return false;
        }
      }

      // Campus area filter
      if (selectedArea !== 'all') {
        const areaLower = selectedArea.toLowerCase();
        const inNeighborhood = spot.neighborhood.toLowerCase().includes(areaLower);
        const inDistance = spot.distanceToCampus.toLowerCase().includes(areaLower);
        const inCampusName = spot.campusName ? spot.campusName.toLowerCase().includes(areaLower) : false;
        const inTags = spot.tags.some((t) => t.toLowerCase().includes(areaLower));

        if (!inNeighborhood && !inDistance && !inCampusName && !inTags) {
          return false;
        }
      }

      // Vibe filter
      if (selectedVibe !== 'All' && spot.vibeCategory !== selectedVibe) {
        return false;
      }

      // Budget per person limit
      if (budgetTier !== 'any') {
        if (spot.realPerPersonCost.min > budgetTier) {
          return false;
        }
      }

      // Minimum group size
      if (minGroupSize !== 'any') {
        if (spot.groupSeating.maxGroupSize < minGroupSize) {
          return false;
        }
      }

      // Amenities
      if (requireFastWifi && spot.amenities.wifiSpeedMbps < 40) {
        return false;
      }

      if (requirePowerPlugs && spot.amenities.powerOutlets === 'None') {
        return false;
      }

      if (requireLateNight && !spot.amenities.openLateNight) {
        return false;
      }

      if (requireOutsideCake && !spot.amenities.outsideCakeAllowed) {
        return false;
      }

      return true;
    });
  }, [
    spots,
    selectedCity,
    searchQuery,
    selectedArea,
    selectedVibe,
    budgetTier,
    minGroupSize,
    requireFastWifi,
    requirePowerPlugs,
    requireLateNight,
    requireOutsideCake
  ]);

  const resetFilters = () => {
    setSelectedCity('all');
    setSearchQuery('');
    setSelectedArea('all');
    setSelectedVibe('All');
    setBudgetTier('any');
    setMinGroupSize('any');
    setRequireFastWifi(false);
    setRequirePowerPlugs(false);
    setRequireLateNight(false);
    setRequireOutsideCake(false);
  };

  const hasActiveFilters =
    selectedCity !== 'all' ||
    searchQuery.trim() !== '' ||
    selectedArea !== 'all' ||
    selectedVibe !== 'All' ||
    budgetTier !== 'any' ||
    minGroupSize !== 'any' ||
    requireFastWifi ||
    requirePowerPlugs ||
    requireLateNight ||
    requireOutsideCake;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-body">
      
      {/* City Switcher Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700 uppercase tracking-wide">
            <Globe className="w-4 h-4 text-amber-700" />
            <span>Select Campus Region / City:</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">
              Showing spots in:{' '}
              <strong className="text-stone-900 font-bold">
                {selectedCity === 'all' ? 'All Cities (Pan-India)' : selectedCity}
              </strong>
            </span>
          </div>
        </div>

        {/* City Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              setSelectedCity('all');
              setSelectedArea('all');
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              selectedCity === 'all'
                ? 'bg-amber-800 text-white shadow-xs font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            All Cities (Pan-India)
          </button>

          {availableCities.map((city) => (
            <button
              key={city}
              onClick={() => {
                setSelectedCity(city);
                setSelectedArea('all');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCity === city
                  ? 'bg-stone-900 text-white shadow-xs font-bold'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {city}
            </button>
          ))}

          <button
            onClick={onOpenSubmitSpot}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 ml-auto"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
            <span>+ Add Your College Spot</span>
          </button>
        </div>
      </div>

      {/* Personalized AI & History Recommendations Shelf */}
      <RecommendedShelf
        user={user || null}
        onSelectSpot={onSelectSpot}
        onOpenQr={onOpenQr || (() => {})}
        onOpenAuth={onOpenAuth || (() => {})}
      />

      {/* Header & Section Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {selectedCity === 'all'
                ? 'Pan-India Student Hangout Directory'
                : `${selectedCity} Student Hangout Guide`}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1 font-heading">
            {selectedCity === 'all'
              ? 'Campus Cafes & Student Hangouts Nationwide'
              : `Famous ${selectedCity} Hangouts & Student Cafes`}
          </h2>

          <p className="text-sm text-stone-600 mt-1 max-w-2xl font-body">
            {selectedCity === 'all'
              ? 'From CEPT & HL in Ahmedabad to DU North Campus, Christ in Bengaluru, Mithibai in Mumbai & FC Road in Pune — audited with real per-head bills and true group seating.'
              : `Verified student spots in ${selectedCity} with guaranteed squad table capacities, tested WiFi speeds, and unedited reel reality checks.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSubmitSpot}
            className="px-4 py-2.5 text-xs font-bold text-stone-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            + Submit {selectedCity === 'all' ? 'Any Campus' : selectedCity} Spot
          </button>
        </div>
      </div>

      {/* Campus Area Quick Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wide shrink-0 mr-1">
          Campus / Hub:
        </span>
        {activeAreas.map((area) => (
          <button
            key={area.value}
            onClick={() => setSelectedArea(area.value)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              selectedArea === area.value
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {area.label}
          </button>
        ))}
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-5 shadow-xs">
        
        {/* Top Search + Budget Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Universal Search Box (6 cols) */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any cafe, campus (CEPT, DU, Christ, Mithibai...), city, or neighborhood..."
              className="w-full pl-10 pr-12 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900 placeholder:text-stone-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Budget Limit Segmented Control (6 cols) */}
          <div className="md:col-span-6 flex items-center justify-start md:justify-end gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-medium text-stone-500 shrink-0">Budget/head:</span>
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl shrink-0">
              <button
                onClick={() => setBudgetTier('any')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  budgetTier === 'any'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Any
              </button>
              <button
                onClick={() => setBudgetTier(120)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  budgetTier === 120
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Under ₹120
              </button>
              <button
                onClick={() => setBudgetTier(250)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  budgetTier === 250
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Under ₹250
              </button>
              <button
                onClick={() => setBudgetTier(350)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  budgetTier === 350
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Under ₹350
              </button>
            </div>
          </div>

        </div>

        {/* Vibe Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-stone-100">
          <span className="text-xs font-medium text-stone-500 shrink-0 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Vibe:</span>
          </span>
          {VIBE_CATEGORIES.map((vibe) => (
            <button
              key={vibe}
              onClick={() => setSelectedVibe(vibe)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedVibe === vibe
                  ? 'bg-stone-900 text-white font-bold'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              {vibe}
            </button>
          ))}
        </div>

        {/* Group Size & Student Priorities Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          
          {/* Group Capacity Selector */}
          <div className="flex items-center gap-2">
            <span className="text-stone-500 font-medium">Squad Table:</span>
            <div className="flex items-center gap-1">
              {[
                { label: 'Any', value: 'any' },
                { label: '6+ friends', value: 6 },
                { label: '10+ friends', value: 10 },
                { label: '14+ batch', value: 14 }
              ].map((g) => (
                <button
                  key={g.label}
                  onClick={() => setMinGroupSize(g.value as any)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                    minGroupSize === g.value
                      ? 'bg-amber-600 border-amber-600 text-white font-bold'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-stone-700 hover:text-stone-900">
              <input
                type="checkbox"
                checked={requireFastWifi}
                onChange={(e) => setRequireFastWifi(e.target.checked)}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
              />
              <span>Fast WiFi (&gt;40 Mbps)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-stone-700 hover:text-stone-900">
              <input
                type="checkbox"
                checked={requirePowerPlugs}
                onChange={(e) => setRequirePowerPlugs(e.target.checked)}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
              />
              <span>Power Sockets</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-stone-700 hover:text-stone-900">
              <input
                type="checkbox"
                checked={requireLateNight}
                onChange={(e) => setRequireLateNight(e.target.checked)}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
              />
              <span>Late Night (&gt;11 PM)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-stone-700 hover:text-stone-900">
              <input
                type="checkbox"
                checked={requireOutsideCake}
                onChange={(e) => setRequireOutsideCake(e.target.checked)}
                className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
              />
              <span>Outside Cake OK</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-amber-700 font-bold hover:text-amber-800 ml-2 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <div>
          Showing <span className="font-bold text-stone-900 tabular-nums">{filteredSpots.length}</span> of{' '}
          <span className="font-semibold text-stone-700 tabular-nums">{spots.length}</span> verified campus spots
          {selectedCity !== 'all' && (
            <span> in <strong className="text-stone-800 font-semibold">{selectedCity}</strong></span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Sort: Student Value & Reality Score</span>
        </div>
      </div>

      {/* Spots Grid */}
      {filteredSpots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpots.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              onSelect={onSelectSpot}
              onVote={onVoteSpot}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900">
              {searchQuery.trim()
                ? `No spots found matching "${searchQuery}"`
                : `No audited spots found for this filter in ${selectedCity === 'all' ? 'any city' : selectedCity}`}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Hangout-Hub is 100% student powered! You can be the first scout to add your favorite college hangout, chai tapri, or project loft.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenSubmitSpot}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              + Submit Spot for {selectedCity === 'all' ? 'Your Campus' : selectedCity}
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
