/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { HangoutSpot, VibeCategory, UserProfile } from '../types/index.ts';
import { SpotCard } from './SpotCard.tsx';
import { RecommendedShelf } from './RecommendedShelf.tsx';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  MapPin,
  Globe,
  Plus,
  ChevronDown,
  Check,
  X
} from 'lucide-react';

interface SpotExplorerProps {
  spots: HangoutSpot[];
  selectedCity: string;
  availableCities: string[];
  onSelectCity: (city: string) => void;
  onAddOrSelectCity: (city: string) => boolean | void;
  onSelectSpot: (spot: HangoutSpot) => void;
  onVoteSpot: (spotId: string) => void;
  onOpenSubmitSpot: () => void;
  user?: UserProfile | null;
  onOpenQr?: (spot: HangoutSpot) => void;
  onOpenAuth?: () => void;
}

const POPULAR_INDIAN_CAMPUS_CITIES = [
  'Vadodara',
  'Surat',
  'Rajkot',
  'Anand (VV Nagar)',
  'Jaipur',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Manipal',
  'Vellore',
  'Indore',
  'Chandigarh',
  'Lucknow',
  'Bhopal',
  'Kochi',
  'Dehradun',
  'Nagpur',
  'Coimbatore',
  'Mysuru',
  'Udaipur',
  'Guwahati',
  'Bhubaneswar'
];

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
  selectedCity,
  availableCities,
  onSelectCity,
  onAddOrSelectCity,
  onSelectSpot,
  onVoteSpot,
  onOpenSubmitSpot,
  user,
  onOpenQr,
  onOpenAuth
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedVibe, setSelectedVibe] = useState<VibeCategory | 'All'>('All');
  const [budgetTier, setBudgetTier] = useState<number | 'any'>('any');
  const [minGroupSize, setMinGroupSize] = useState<number | 'any'>('any');
  const [requireFastWifi, setRequireFastWifi] = useState(false);
  const [requirePowerPlugs, setRequirePowerPlugs] = useState(false);
  const [requireLateNight, setRequireLateNight] = useState(false);
  const [requireOutsideCake, setRequireOutsideCake] = useState(false);

  // Add / Select City panel state
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');
  const [cityInputError, setCityInputError] = useState<string | null>(null);
  const [cityFilterSearch, setCityFilterSearch] = useState('');

  const allSelectableCities = useMemo(() => {
    const map = new Map<string, string>();
    availableCities.forEach((c) => map.set(c.toLowerCase(), c));
    POPULAR_INDIAN_CAMPUS_CITIES.forEach((c) => {
      if (!map.has(c.toLowerCase())) {
        map.set(c.toLowerCase(), c);
      }
    });
    return Array.from(map.values());
  }, [availableCities]);

  const filteredDirectoryCities = useMemo(() => {
    if (!cityFilterSearch.trim()) return allSelectableCities;
    const q = cityFilterSearch.toLowerCase().trim();
    return allSelectableCities.filter((c) => c.toLowerCase().includes(q));
  }, [allSelectableCities, cityFilterSearch]);

  const handleCustomCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customCityInput.replace(/\s+/g, ' ').trim();
    if (!cleaned) {
      setCityInputError('Please enter a city name.');
      return;
    }
    if (cleaned.length < 2 || cleaned.length > 40) {
      setCityInputError('City name must be between 2 and 40 characters.');
      return;
    }
    if (/[<>;"'`\\/{}[\]=]/.test(cleaned) || !/[a-zA-Z]{2,}/.test(cleaned)) {
      setCityInputError('Please enter a valid city name using letters (no scripts or HTML tags).');
      return;
    }
    const accepted = onAddOrSelectCity(cleaned);
    if (accepted === false) {
      setCityInputError('Please enter a valid city name.');
      return;
    }
    setCityInputError(null);
    setSelectedArea('all');
    setCustomCityInput('');
    setIsCityPickerOpen(false);
  };

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
    onSelectCity('all');
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
      <div className="bg-white dark:bg-[#1C1612] rounded-2xl border border-stone-200/90 dark:border-[#33271F] p-4 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-[#2E231C] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wide">
            <Globe className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Select Campus Region / City:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Showing spots in:{' '}
              <strong className="text-stone-900 dark:text-stone-100 font-bold">
                {selectedCity === 'all' ? 'All Cities (Pan-India)' : selectedCity}
              </strong>
            </span>

            {/* Quick Select City Dropdown */}
            <div className="relative">
              <select
                aria-label="Quick select campus city"
                value={selectedCity}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__add_new__') {
                    setIsCityPickerOpen(true);
                  } else {
                    onAddOrSelectCity(val);
                    setSelectedArea('all');
                  }
                }}
                className="pl-2.5 pr-7 py-1 text-xs font-semibold rounded-lg bg-stone-50 dark:bg-[#261E18] text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-[#3E3025] focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">All Cities (Pan-India)</option>
                <optgroup label="Active Hub Cities">
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="More Campus Cities">
                  {POPULAR_INDIAN_CAMPUS_CITIES.filter(
                    (c) => !availableCities.some((ac) => ac.toLowerCase() === c.toLowerCase())
                  ).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
                <option value="__add_new__">+ Add Custom City...</option>
              </select>
            </div>
          </div>
        </div>

        {/* City Pills + Add / Select City Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              onSelectCity('all');
              setSelectedArea('all');
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              selectedCity === 'all'
                ? 'bg-amber-700 text-white shadow-xs font-bold'
                : 'bg-stone-100 dark:bg-[#261E18] text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-[#32271F] border border-stone-200 dark:border-[#3E3025]'
            }`}
          >
            All Cities (Pan-India)
          </button>

          {availableCities.map((city) => (
            <button
              key={city}
              onClick={() => {
                onSelectCity(city);
                setSelectedArea('all');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCity === city
                  ? 'bg-stone-900 dark:bg-amber-600 text-white shadow-xs font-bold'
                  : 'bg-stone-50 dark:bg-[#241C17] text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#30251E] border border-stone-200 dark:border-[#3A2D23]'
              }`}
            >
              {city}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setIsCityPickerOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 ml-auto border ${
              isCityPickerOpen
                ? 'bg-amber-700 text-white border-amber-700'
                : 'text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-amber-200/80 dark:border-amber-700/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isCityPickerOpen ? 'Close City Selector' : '+ Add / Select City'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCityPickerOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expandable Add / Select City Panel */}
        {isCityPickerOpen && (
          <div className="pt-3 mt-2 border-t border-stone-200 dark:border-[#33271F] bg-stone-50/80 dark:bg-[#241C17] rounded-xl p-4 space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              {/* Add Custom City Input */}
              <form onSubmit={handleCustomCitySubmit} className="flex-1 space-y-1.5">
                <label htmlFor="custom-city-input" className="block text-xs font-bold text-stone-800 dark:text-stone-100">
                  Add a New Campus City
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="custom-city-input"
                      type="text"
                      maxLength={40}
                      value={customCityInput}
                      onChange={(e) => {
                        setCustomCityInput(e.target.value);
                        if (cityInputError) setCityInputError(null);
                      }}
                      placeholder="Type your city (e.g. Vadodara, Surat, Jaipur, Manipal...)"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-[#1C1612] border border-stone-200 dark:border-[#3E3025] rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add & Select</span>
                  </button>
                </div>
                {cityInputError && (
                  <p role="alert" className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                    {cityInputError}
                  </p>
                )}
              </form>

              {/* Filter Directory Cities */}
              <div className="w-full md:w-64 space-y-1.5">
                <label htmlFor="filter-directory-cities" className="block text-xs font-bold text-stone-800 dark:text-stone-100">
                  Quick Filter Cities
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="filter-directory-cities"
                    type="text"
                    value={cityFilterSearch}
                    onChange={(e) => setCityFilterSearch(e.target.value)}
                    placeholder="Filter city list..."
                    className="w-full pl-8 pr-7 py-2 text-xs bg-white dark:bg-[#1C1612] border border-stone-200 dark:border-[#3E3025] rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {cityFilterSearch && (
                    <button
                      type="button"
                      onClick={() => setCityFilterSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Selectable Campus Cities Grid */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Or Select from Campus Cities Across India:
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredDirectoryCities.map((city) => {
                  const isActive = selectedCity.toLowerCase() === city.toLowerCase();
                  const spotCount = spots.filter(
                    (s) => s.city?.toLowerCase() === city.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        onAddOrSelectCity(city);
                        setSelectedArea('all');
                        setIsCityPickerOpen(false);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-amber-700 text-white border-amber-700 font-bold'
                          : 'bg-white dark:bg-[#1C1612] text-stone-700 dark:text-stone-200 border-stone-200 dark:border-[#3A2D23] hover:border-amber-400 dark:hover:border-amber-500'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3" />}
                      <span>{city}</span>
                      {spotCount > 0 && (
                        <span
                          className={`text-[10px] tabular-nums ${
                            isActive ? 'text-amber-100' : 'text-stone-400 dark:text-stone-400'
                          }`}
                        >
                          ({spotCount})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Personalized AI & History Recommendations Shelf */}
      <RecommendedShelf
        user={user || null}
        onSelectSpot={onSelectSpot}
        onOpenQr={onOpenQr || (() => {})}
        onOpenAuth={onOpenAuth || (() => {})}
      />

      {/* Header & Section Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-[#33271F] pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {selectedCity === 'all'
                ? 'Pan-India Student Hangout Directory'
                : `${selectedCity} Student Hangout Guide`}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 font-heading">
            {selectedCity === 'all'
              ? 'Campus Cafes & Student Hangouts Nationwide'
              : `Famous ${selectedCity} Hangouts & Student Cafes`}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSubmitSpot}
            className="px-4 py-2.5 text-xs font-bold text-stone-900 dark:text-amber-100 bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 dark:hover:bg-amber-800/60 border border-amber-300 dark:border-amber-700/70 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            + Submit {selectedCity === 'all' ? 'Any Campus' : selectedCity} Spot
          </button>
        </div>
      </div>

      {/* Campus Area Quick Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wide shrink-0 mr-1">
          Campus / Hub:
        </span>
        {activeAreas.map((area) => (
          <button
            key={area.value}
            onClick={() => setSelectedArea(area.value)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              selectedArea === area.value
                ? 'bg-stone-900 dark:bg-amber-600 text-white shadow-xs font-bold'
                : 'bg-white dark:bg-[#1C1612] text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#29201A] border border-stone-200 dark:border-[#382B22]'
            }`}
          >
            {area.label}
          </button>
        ))}
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white dark:bg-[#1C1612] rounded-2xl border border-stone-200/90 dark:border-[#33271F] p-5 space-y-5 shadow-xs transition-colors">
        
        {/* Top Search + Budget Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Universal Search Box (6 cols) */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Search campus cafes, colleges, cities, or neighborhoods"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any cafe, campus (CEPT, DU, Christ, Mithibai...), city, or neighborhood..."
              className="w-full pl-10 pr-12 py-2.5 text-sm bg-stone-50 dark:bg-[#251D17] border border-stone-200 dark:border-[#3E3025] rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#2C221B] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Budget Limit Segmented Control (6 cols) */}
          <div className="md:col-span-6 flex items-center justify-start md:justify-end gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 shrink-0">Budget/head:</span>
            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-[#261E18] border border-stone-200/60 dark:border-[#382B22] rounded-xl shrink-0">
              <button
                onClick={() => setBudgetTier('any')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  budgetTier === 'any'
                    ? 'bg-white dark:bg-amber-600 text-stone-900 dark:text-white shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Any
              </button>
              <button
                onClick={() => setBudgetTier(120)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  budgetTier === 120
                    ? 'bg-white dark:bg-amber-600 text-stone-900 dark:text-white shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Under ₹120
              </button>
              <button
                onClick={() => setBudgetTier(250)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  budgetTier === 250
                    ? 'bg-white dark:bg-amber-600 text-stone-900 dark:text-white shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Under ₹250
              </button>
              <button
                onClick={() => setBudgetTier(350)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  budgetTier === 350
                    ? 'bg-white dark:bg-amber-600 text-stone-900 dark:text-white shadow-xs font-bold'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                Under ₹350
              </button>
            </div>
          </div>

        </div>

        {/* Vibe Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-stone-100 dark:border-[#2E231C]">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 shrink-0 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Vibe:</span>
          </span>
          {VIBE_CATEGORIES.map((vibe) => (
            <button
              key={vibe}
              onClick={() => setSelectedVibe(vibe)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedVibe === vibe
                  ? 'bg-stone-900 dark:bg-amber-600 text-white font-bold'
                  : 'bg-stone-50 dark:bg-[#251D17] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#31261E] border border-stone-200/80 dark:border-[#3A2D23]'
              }`}
            >
              {vibe}
            </button>
          ))}
        </div>

        {/* Group Size & Student Priorities Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-[#2E231C] text-xs">
          
          {/* Group Capacity Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-stone-500 dark:text-stone-400 font-medium">Squad Table:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { label: 'Any', value: 'any' },
                { label: '6+ friends', value: 6 },
                { label: '10+ friends', value: 10 },
                { label: '14+ batch', value: 14 }
              ].map((g) => (
                <button
                  key={g.label}
                  onClick={() => setMinGroupSize(g.value as any)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                    minGroupSize === g.value
                      ? 'bg-amber-600 border-amber-600 text-white font-bold'
                      : 'bg-white dark:bg-[#251D17] border-stone-200 dark:border-[#3A2D23] text-stone-600 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white">
              <input
                type="checkbox"
                checked={requireFastWifi}
                onChange={(e) => setRequireFastWifi(e.target.checked)}
                className="rounded border-stone-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
              />
              <span>Fast WiFi (&gt;40 Mbps)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white">
              <input
                type="checkbox"
                checked={requirePowerPlugs}
                onChange={(e) => setRequirePowerPlugs(e.target.checked)}
                className="rounded border-stone-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
              />
              <span>Power Sockets</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white">
              <input
                type="checkbox"
                checked={requireLateNight}
                onChange={(e) => setRequireLateNight(e.target.checked)}
                className="rounded border-stone-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
              />
              <span>Late Night (&gt;11 PM)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white">
              <input
                type="checkbox"
                checked={requireOutsideCake}
                onChange={(e) => setRequireOutsideCake(e.target.checked)}
                className="rounded border-stone-300 dark:border-stone-600 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
              />
              <span>Outside Cake OK</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 font-bold hover:text-amber-800 dark:hover:text-amber-300 ml-2 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
        <div>
          Showing <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">{filteredSpots.length}</span> of{' '}
          <span className="font-semibold text-stone-700 dark:text-stone-300 tabular-nums">{spots.length}</span> verified campus spots
          {selectedCity !== 'all' && (
            <span> in <strong className="text-stone-800 dark:text-stone-200 font-semibold">{selectedCity}</strong></span>
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
        <div className="bg-white dark:bg-[#1C1612] rounded-2xl border border-dashed border-stone-300 dark:border-[#3E3025] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {searchQuery.trim()
                ? `No spots found matching "${searchQuery}"`
                : `No audited spots yet in ${selectedCity === 'all' ? 'this filter' : selectedCity}`}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Hangout-Hub is 100% student powered! Be the first campus scout to submit your favorite hangout, chai tapri, or study cafe in {selectedCity === 'all' ? 'your city' : selectedCity}.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-semibold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-[#29201A] hover:bg-stone-200 dark:hover:bg-[#352921] rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenSubmitSpot}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              + Submit Spot for {selectedCity === 'all' ? 'Your Campus' : selectedCity}
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
