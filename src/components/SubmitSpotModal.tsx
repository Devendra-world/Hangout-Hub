/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, ShieldCheck, LogIn, Clock } from 'lucide-react';
import { HangoutSpot, UserProfile, VibeCategory } from '../types/index.ts';

interface SubmitSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpotAdded: (newSpot: HangoutSpot, pendingModeration?: boolean) => void;
  defaultCity?: string;
  availableCities?: string[];
  user?: UserProfile | null;
  onRequireAuth?: () => void;
}

export const SubmitSpotModal: React.FC<SubmitSpotModalProps> = ({
  isOpen,
  onClose,
  onSpotAdded,
  defaultCity = 'Ahmedabad',
  availableCities = ['Ahmedabad', 'Gandhinagar', 'Delhi NCR', 'Bengaluru', 'Mumbai', 'Pune'],
  user = null,
  onRequireAuth
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState(defaultCity);
  const [campusName, setCampusName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [distanceToCampus, setDistanceToCampus] = useState('');
  const [vibeCategory, setVibeCategory] = useState<VibeCategory>('Budget Bite & Chill');
  const [minCost, setMinCost] = useState('120');
  const [maxCost, setMaxCost] = useState('220');
  const [popularOrderExample, setPopularOrderExample] = useState('');
  const [officialClaimCost, setOfficialClaimCost] = useState('');
  const [maxGroupSize, setMaxGroupSize] = useState('8');
  const [seatingDescription, setSeatingDescription] = useState('');
  const [pushTogetherAllowed, setPushTogetherAllowed] = useState(true);
  const [wifiSpeedMbps, setWifiSpeedMbps] = useState('40');
  const [powerOutlets, setPowerOutlets] = useState<'Every Table' | 'Select Wall Tables' | 'Few / Request Only' | 'None'>('Select Wall Tables');
  const [noiseDecibels, setNoiseDecibels] = useState('60');
  const [openLateNight, setOpenLateNight] = useState(false);
  const [outsideCakeAllowed, setOutsideCakeAllowed] = useState(true);
  const [boardGamesAvailable, setBoardGamesAvailable] = useState(false);
  const [reelUrl, setReelUrl] = useState('');
  const [reelHypeClaim, setReelHypeClaim] = useState('');
  const [groundRealityTruth, setGroundRealityTruth] = useState('');
  const [scoutName, setScoutName] = useState('');
  const [scoutCollege, setScoutCollege] = useState('');
  const [scoutNotes, setScoutNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pendingModeration, setPendingModeration] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const authToken = typeof window !== 'undefined' ? localStorage.getItem('hangout_hub_token') || '' : '';
  const isVerifiedAuthenticated = Boolean(user && authToken);

  useEffect(() => {
    if (isOpen) {
      setCity(defaultCity || 'Ahmedabad');
      setSuccess(false);
      setPendingModeration(false);
      setErrorMsg(null);
      if (user) {
        setScoutName((prev) => prev || user.name || '');
        setScoutCollege((prev) => prev || user.college || '');
      }
    }
  }, [isOpen, defaultCity, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = name.trim();
    const trimmedCity = city.trim();
    const trimmedNeighborhood = neighborhood.trim();
    const minVal = Number(minCost);
    const maxVal = Number(maxCost);
    const groupVal = Number(maxGroupSize);

    if (!trimmedName || trimmedName.length > 80) {
      setErrorMsg('Spot name is required and must be 80 characters or fewer.');
      return;
    }
    if (!trimmedCity || trimmedCity.length > 50 || /[<>]/.test(trimmedCity)) {
      setErrorMsg('Please enter a valid city name (up to 50 characters).');
      return;
    }
    if (!trimmedNeighborhood || trimmedNeighborhood.length > 80) {
      setErrorMsg('Neighborhood / street area is required (up to 80 characters).');
      return;
    }
    if (isNaN(minVal) || minVal < 10 || minVal > 5000) {
      setErrorMsg('Minimum per-head spend must be between ₹10 and ₹5,000.');
      return;
    }
    if (isNaN(maxVal) || maxVal < minVal || maxVal > 10000) {
      setErrorMsg('Maximum per-head spend must be greater than or equal to minimum spend (up to ₹10,000).');
      return;
    }
    if (isNaN(groupVal) || groupVal < 1 || groupVal > 100) {
      setErrorMsg('Max group seating capacity must be between 1 and 100 people.');
      return;
    }

    setSubmitting(true);

    const payload = {
      name: trimmedName,
      city: trimmedCity,
      campusName: campusName.trim() || 'Local College Campus',
      neighborhood: trimmedNeighborhood,
      distanceToCampus: distanceToCampus.trim() || '0.5 km (6 min walk)',
      vibeCategory,
      minCost: minVal,
      maxCost: maxVal,
      popularOrderExample: popularOrderExample.trim() || 'Coffee/Chai + Sandwich combo',
      officialClaimCost: officialClaimCost.trim() || 'Food app listed ₹600 for two',
      maxGroupSize: groupVal,
      seatingDescription: seatingDescription.trim() || 'Tables accommodate student friend groups.',
      pushTogetherAllowed,
      wifiSpeedMbps,
      powerOutlets,
      noiseDecibels,
      openLateNight,
      outsideCakeAllowed,
      boardGamesAvailable,
      reelUrl: reelUrl.trim(),
      reelHypeClaim: reelHypeClaim.trim() || 'Viral cafe hype claims',
      groundRealityTruth: groundRealityTruth.trim() || 'Verified student ground truth with real seating and prices.',
      scoutName: scoutName.trim() || user?.name || 'Campus Student Scout',
      scoutCollege: scoutCollege.trim() || user?.college || 'University Campus Network',
      scoutNotes: scoutNotes.trim() || 'Personally visited and verified.',
      _auth_token: authToken
    };

    try {
      const res = await fetch('/spots.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken
            ? {
                Authorization: `Bearer ${authToken}`,
                'X-Auth-Token': authToken
              }
            : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success && data.spot) {
        const isPending = Boolean(data.pendingModeration);
        setPendingModeration(isPending);
        onSpotAdded(data.spot, isPending);
        setSuccess(true);
        setName('');
        setNeighborhood('');
        setGroundRealityTruth('');
        setScoutNotes('');
      } else {
        if (res.status === 401) {
          try {
            localStorage.removeItem('hangout_hub_token');
          } catch {}
        }
        setErrorMsg(data.error || 'Could not submit spot. Please review your entries and try again.');
      }
    } catch (err) {
      setErrorMsg('Network error while submitting spot. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 bg-stone-50 dark:bg-[#251D17] border border-stone-200 dark:border-[#3E3025] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#2C221B] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500';
  const labelClass = 'block font-semibold text-stone-700 dark:text-stone-200';

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-spot-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1C1612] text-stone-900 dark:text-stone-100 rounded-2xl shadow-2xl border border-stone-200 dark:border-[#362920] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-[#33271F] flex items-center justify-between bg-stone-50 dark:bg-[#241C17]">
          <div>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
              Student Scout Contribution
            </span>
            <h3 id="submit-spot-title" className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              Submit a Campus Hangout Spot
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Provide ground truth numbers: real per-head costs, true table sizes, and unedited reel audits.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-[#31261E] rounded-lg cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 text-xs space-y-6">
          {!isVerifiedAuthenticated ? (
            <div className="bg-amber-50/90 dark:bg-[#251D17] border border-amber-200 dark:border-[#3E3025] rounded-2xl p-6 sm:p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800/60">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                  Verified Student Sign-In Required
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  To protect Hangout-Hub from fake cafe listings and spam bots, only signed-in student scouts can submit new hangout spots. Every student submission is reviewed by a Campus Admin before going live.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-[#1C1612] border border-stone-200 dark:border-[#3E3025] rounded-xl hover:bg-stone-100 dark:hover:bg-[#31261E] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                {onRequireAuth && (
                  <button
                    type="button"
                    onClick={onRequireAuth}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#2A1810] dark:bg-amber-600 hover:bg-[#C85A32] dark:hover:bg-amber-500 rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In / Create Account</span>
                  </button>
                )}
              </div>
            </div>
          ) : success ? (
            <div
              className={`${
                pendingModeration
                  ? 'bg-amber-50 dark:bg-amber-950/35 border-amber-200 dark:border-amber-800/60'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
              } border rounded-xl p-8 text-center space-y-4`}
            >
              {pendingModeration ? (
                <Clock className="w-12 h-12 text-amber-600 dark:text-amber-400 mx-auto" />
              ) : (
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
              )}
              <div className="space-y-1.5">
                <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {pendingModeration
                    ? 'Submitted for Campus Admin Verification!'
                    : 'Spot Published to Live Directory!'}
                </h4>
                <p className="text-xs text-stone-700 dark:text-stone-300 max-w-md mx-auto leading-relaxed">
                  {pendingModeration
                    ? 'Thank you! Your cafe audit is now in the Admin Moderation Queue. As soon as a Campus Admin verifies the details, it will appear publicly on the Explorer.'
                    : 'Your Admin-verified spot is now live and filterable by campus students right away.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer transition-colors"
              >
                Back to Explorer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-3 bg-stone-50 dark:bg-[#251D17] border border-stone-200 dark:border-[#3E3025] rounded-xl flex items-center justify-between gap-2 text-[11px] text-stone-600 dark:text-stone-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Submitting as <strong className="text-stone-900 dark:text-stone-100">{user?.name}</strong> (
                    {user?.role === 'admin' ? 'Auto-Approved Admin' : 'Reviewed by Admin before publishing'})
                  </span>
                </span>
              </div>

              {errorMsg && (
                <div role="alert" className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 rounded-xl text-red-700 dark:text-red-200 flex items-center justify-between gap-2 font-semibold">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                  {onRequireAuth && errorMsg.toLowerCase().includes('sign') && (
                    <button
                      type="button"
                      onClick={onRequireAuth}
                      className="px-3 py-1 text-[11px] font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg shrink-0 cursor-pointer"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              )}

              {/* Basic Details */}
              <div className="space-y-3">
                <div className="font-bold text-stone-900 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                  01. Spot Identity & Location
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Spot / Cafe Name *</label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      placeholder="e.g. Chaayos Corner, The Study Loft"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>City / Metro Region *</label>
                    <input
                      type="text"
                      list="hangout-hub-city-options"
                      required
                      maxLength={50}
                      placeholder="Select or type city (e.g. Ahmedabad, Vadodara, Pune...)"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClass}
                    />
                    <datalist id="hangout-hub-city-options">
                      {availableCities.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Campus / College Name</label>
                    <input
                      type="text"
                      maxLength={80}
                      placeholder="e.g. CEPT, DU North, Christ Univ, Mithibai, etc."
                      value={campusName}
                      onChange={(e) => setCampusName(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Neighborhood / Street Area *</label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      placeholder="e.g. Navrangpura, Hudson Lane, Koramangala, Juhu, etc."
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Distance to Campus</label>
                    <input
                      type="text"
                      placeholder="e.g. 0.3 km (4 min walk from gate)"
                      value={distanceToCampus}
                      onChange={(e) => setDistanceToCampus(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Primary Vibe Category</label>
                    <select
                      value={vibeCategory}
                      onChange={(e) => setVibeCategory(e.target.value as VibeCategory)}
                      className={inputClass}
                    >
                      <option value="Budget Bite & Chill">Budget Bite & Chill</option>
                      <option value="Study & Projects">Study & Projects</option>
                      <option value="Aesthetic Hangout">Aesthetic Hangout</option>
                      <option value="Board Games & Fun">Board Games & Fun</option>
                      <option value="Late Night Hangout">Late Night Hangout</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Real Cost vs Claim */}
              <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-[#2E231C]">
                <div className="font-bold text-stone-900 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                  02. Real Per-Person Math vs Food App Claims
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Min Real Spend/Head (₹)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={5000}
                      value={minCost}
                      onChange={(e) => setMinCost(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Max Real Spend/Head (₹)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={10000}
                      value={maxCost}
                      onChange={(e) => setMaxCost(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Misleading Food App Claim</label>
                    <input
                      type="text"
                      maxLength={100}
                      placeholder="e.g. Zomato says ₹600 for two"
                      value={officialClaimCost}
                      onChange={(e) => setOfficialClaimCost(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Popular Realistic Student Combo</label>
                  <input
                    type="text"
                    maxLength={120}
                    placeholder="e.g. Iced tea + Cheesy Nachos platter = ₹180"
                    value={popularOrderExample}
                    onChange={(e) => setPopularOrderExample(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Group Seating Viability */}
              <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-[#2E231C]">
                <div className="font-bold text-stone-900 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                  03. Group Seating Reality Audit
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>Max Group Seating Together</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      placeholder="e.g. 10"
                      value={maxGroupSize}
                      onChange={(e) => setMaxGroupSize(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Can tables be pushed together?</label>
                    <div className="flex gap-4 pt-2 text-stone-700 dark:text-stone-200">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="pushTogether"
                          checked={pushTogetherAllowed}
                          onChange={() => setPushTogetherAllowed(true)}
                          className="accent-amber-600"
                        />
                        <span>Yes, staff allows it</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="pushTogether"
                          checked={!pushTogetherAllowed}
                          onChange={() => setPushTogetherAllowed(false)}
                          className="accent-amber-600"
                        />
                        <span>No, fixed seating only</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Seating Description & Reservation Tip</label>
                  <input
                    type="text"
                    placeholder="e.g. Long communal oak tables, walk-in fine on weekdays, gets crowded after 5 PM"
                    value={seatingDescription}
                    onChange={(e) => setSeatingDescription(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Instagram Reel Reality Check */}
              <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-[#2E231C]">
                <div className="font-bold text-stone-900 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                  04. Instagram Reel Reality Check
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Related Instagram Reel URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/reel/..."
                    value={reelUrl}
                    onChange={(e) => setReelUrl(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelClass}>What did the reel hype up?</label>
                    <input
                      type="text"
                      placeholder="e.g. Gigantic fairytale garden with ₹50 coffee"
                      value={reelHypeClaim}
                      onChange={(e) => setReelHypeClaim(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>What was the ground truth reality?</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Garden is a small courtyard, but seating fits 8 people comfortably"
                      value={groundRealityTruth}
                      onChange={(e) => setGroundRealityTruth(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Amenities & Scout Attribution */}
              <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-[#2E231C]">
                <div className="font-bold text-stone-900 dark:text-amber-300 uppercase tracking-wider text-[11px]">
                  05. Amenities & Scout Attribution
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-stone-700 dark:text-stone-200">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openLateNight}
                      onChange={(e) => setOpenLateNight(e.target.checked)}
                      className="rounded accent-amber-600"
                    />
                    <span>Open Late Night (&gt;11 PM)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={outsideCakeAllowed}
                      onChange={(e) => setOutsideCakeAllowed(e.target.checked)}
                      className="rounded accent-amber-600"
                    />
                    <span>Outside Cake Allowed</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boardGamesAvailable}
                      onChange={(e) => setBoardGamesAvailable(e.target.checked)}
                      className="rounded accent-amber-600"
                    />
                    <span>Board Games Available</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className={labelClass}>Your Name (Scout Credit)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya & Rahul"
                      value={scoutName}
                      onChange={(e) => setScoutName(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Your College / Campus</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hansraj College Batch '25"
                      value={scoutCollege}
                      onChange={(e) => setScoutCollege(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Scout Notes / Tips for other students</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Staff was friendly, nobody asked us to leave, perfect for splitting fries"
                    value={scoutNotes}
                    onChange={(e) => setScoutNotes(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-stone-200 dark:border-[#33271F] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-semibold text-stone-700 dark:text-stone-200 bg-white dark:bg-[#251D17] border border-stone-200 dark:border-[#3E3025] rounded-lg hover:bg-stone-50 dark:hover:bg-[#31261E] cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Publishing Spot...' : 'Publish to Scout Network'}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
