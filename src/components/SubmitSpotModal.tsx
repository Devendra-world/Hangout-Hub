/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { HangoutSpot, VibeCategory } from '../types/index.ts';

interface SubmitSpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpotAdded: (newSpot: HangoutSpot) => void;
}

export const SubmitSpotModal: React.FC<SubmitSpotModalProps> = ({ isOpen, onClose, onSpotAdded }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [city, setCity] = useState('Ahmedabad');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name,
      city: city.trim() || 'Ahmedabad',
      campusName: campusName.trim() || 'Local College Campus',
      neighborhood,
      distanceToCampus: distanceToCampus || '0.5 km (6 min walk)',
      vibeCategory,
      minCost,
      maxCost,
      popularOrderExample: popularOrderExample || 'Coffee/Chai + Sandwich combo',
      officialClaimCost: officialClaimCost || 'Food app listed ₹600 for two',
      maxGroupSize,
      seatingDescription: seatingDescription || 'Tables accommodate student friend groups.',
      pushTogetherAllowed,
      wifiSpeedMbps,
      powerOutlets,
      noiseDecibels,
      openLateNight,
      outsideCakeAllowed,
      boardGamesAvailable,
      reelUrl,
      reelHypeClaim: reelHypeClaim || 'Viral cafe hype claims',
      groundRealityTruth: groundRealityTruth || 'Verified student ground truth with real seating and prices.',
      scoutName: scoutName || 'Campus Student Scout',
      scoutCollege: scoutCollege || 'University Campus Network',
      scoutNotes: scoutNotes || 'Personally visited and verified.'
    };

    try {
      const res = await fetch('/api/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onSpotAdded(data.spot);
        setSuccess(true);
      }
    } catch (err) {
      console.error('Failed to submit spot:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Student Scout Contribution
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              Submit a Campus Hangout Spot
            </h3>
            <p className="text-xs text-slate-500">
              Provide ground truth numbers: real per-head costs, true table sizes, and unedited reel audits.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 text-xs space-y-6">
          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-emerald-950">Spot Added to Live Directory!</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Thank you! Your scout submission is now live and can be filtered by fellow campus students looking for budget group spots.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Back to Explorer
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Details */}
              <div className="space-y-3">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  01. Spot Identity & Location
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Spot / Cafe Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chaayos Corner, The Study Loft"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">City / Metro Region *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ahmedabad, Gandhinagar, Delhi NCR, Bengaluru, Mumbai, Pune, etc."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Campus / College Name</label>
                    <input
                      type="text"
                      placeholder="e.g. CEPT, DU North, Christ Univ, Mithibai, etc."
                      value={campusName}
                      onChange={(e) => setCampusName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Neighborhood / Street Area *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Navrangpura, Hudson Lane, Koramangala, Juhu, etc."
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Distance to Campus</label>
                    <input
                      type="text"
                      placeholder="e.g. 0.3 km (4 min walk from gate)"
                      value={distanceToCampus}
                      onChange={(e) => setDistanceToCampus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Primary Vibe Category</label>
                    <select
                      value={vibeCategory}
                      onChange={(e) => setVibeCategory(e.target.value as VibeCategory)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
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
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  02. Real Per-Person Math vs Food App Claims
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Min Real Spend/Head (₹)</label>
                    <input
                      type="number"
                      required
                      value={minCost}
                      onChange={(e) => setMinCost(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Max Real Spend/Head (₹)</label>
                    <input
                      type="number"
                      required
                      value={maxCost}
                      onChange={(e) => setMaxCost(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Misleading Food App Claim</label>
                    <input
                      type="text"
                      placeholder="e.g. Zomato says ₹600 for two"
                      value={officialClaimCost}
                      onChange={(e) => setOfficialClaimCost(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Popular Realistic Student Combo</label>
                  <input
                    type="text"
                    placeholder="e.g. Iced tea + Cheesy Nachos platter = ₹180"
                    value={popularOrderExample}
                    onChange={(e) => setPopularOrderExample(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Group Seating Viability */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  03. Group Seating Reality Audit
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Max Group Seating Together</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 10"
                      value={maxGroupSize}
                      onChange={(e) => setMaxGroupSize(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Can tables be pushed together?</label>
                    <div className="flex gap-4 pt-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="pushTogether"
                          checked={pushTogetherAllowed}
                          onChange={() => setPushTogetherAllowed(true)}
                          className="text-amber-600"
                        />
                        <span>Yes, staff allows it</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="pushTogether"
                          checked={!pushTogetherAllowed}
                          onChange={() => setPushTogetherAllowed(false)}
                          className="text-amber-600"
                        />
                        <span>No, fixed seating only</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Seating Description & Reservation Tip</label>
                  <input
                    type="text"
                    placeholder="e.g. Long communal oak tables, walk-in fine on weekdays, gets crowded after 5 PM"
                    value={seatingDescription}
                    onChange={(e) => setSeatingDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Instagram Reel Reality Check */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  04. Instagram Reel Reality Check
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Related Instagram Reel URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/reel/..."
                    value={reelUrl}
                    onChange={(e) => setReelUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">What did the reel hype up?</label>
                    <input
                      type="text"
                      placeholder="e.g. Gigantic fairytale garden with ₹50 coffee"
                      value={reelHypeClaim}
                      onChange={(e) => setReelHypeClaim(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">What was the ground truth reality?</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Garden is a small courtyard, but seating fits 8 people comfortably"
                      value={groundRealityTruth}
                      onChange={(e) => setGroundRealityTruth(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities & Scout Attribution */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  05. Amenities & Scout Attribution
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openLateNight}
                      onChange={(e) => setOpenLateNight(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>Open Late Night (&gt;11 PM)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={outsideCakeAllowed}
                      onChange={(e) => setOutsideCakeAllowed(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>Outside Cake Allowed</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={boardGamesAvailable}
                      onChange={(e) => setBoardGamesAvailable(e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>Board Games Available</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Your Name (Scout Credit)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya & Rahul"
                      value={scoutName}
                      onChange={(e) => setScoutName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Your College / Campus</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hansraj College Batch '25"
                      value={scoutCollege}
                      onChange={(e) => setScoutCollege(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Scout Notes / Tips for other students</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Staff was friendly, nobody asked us to leave, perfect for splitting fries"
                    value={scoutNotes}
                    onChange={(e) => setScoutNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
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
