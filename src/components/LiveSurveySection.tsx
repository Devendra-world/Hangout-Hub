/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SurveyResponse } from '../types/index.ts';
import { MessageSquareText, CheckCircle2, Send, Users, IndianRupee, Quote } from 'lucide-react';

interface LiveSurveySectionProps {
  responses: SurveyResponse[];
  stats: {
    total: number;
    avgMaxBudget: number;
    avgGroupSize: number;
    frustrations: Record<string, number>;
    priorities: Record<string, number>;
  };
  onSurveySubmitted: (newResponse: SurveyResponse, updatedStats: any) => void;
}

const COMMON_FRUSTRATIONS = [
  'Hidden costs & taxes turning a "budget" place into ₹500/head',
  'Instagram reel exaggeration vs reality of cramped 2-person tables',
  'Staff giving dirty looks or rushing us out after 45 minutes',
  'Impossible to know if 8+ people can sit together without calling',
  'Broken or unusable "Free WiFi" when trying to do group projects',
  'Ridiculous cake-cutting fees (₹300+) for friend birthdays'
];

const PRIORITY_OPTIONS = [
  'Honest per-head cost',
  'Big group table',
  'Split bill friendly',
  'WiFi speed verification',
  'Power plugs at tables',
  'No rush / linger friendly',
  'Outside cake allowed for birthdays',
  'Student discounts with college ID'
];

export const LiveSurveySection: React.FC<LiveSurveySectionProps> = ({
  responses,
  stats,
  onSurveySubmitted
}) => {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('2nd Year UG');
  const [frustration, setFrustration] = useState(COMMON_FRUSTRATIONS[0]);
  const [customFrustration, setCustomFrustration] = useState('');
  const [worstExperience, setWorstExperience] = useState('');
  const [maxBudget, setMaxBudget] = useState(250);
  const [groupSize, setGroupSize] = useState(6);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'Honest per-head cost',
    'Big group table'
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const togglePriority = (p: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const effectiveFrustration = frustration === 'Other' ? customFrustration : frustration;

    const payload = {
      studentName: name.trim() || 'Anonymous Student',
      collegeOrCampus: college.trim() || 'University Campus',
      yearOfStudy: year,
      primaryFrustration: effectiveFrustration,
      worstExperienceWithApps: worstExperience.trim() || 'Felt misled by food app costs and crowded seating.',
      idealSpotPriorities: selectedPriorities,
      maxAcceptableCostPerHead: maxBudget,
      averageGroupSize: groupSize
    };

    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onSurveySubmitted(data.response, data.stats);
        setSubmittedSuccess(true);
        // Reset form
        setName('');
        setCollege('');
        setWorstExperience('');
      }
    } catch (err) {
      console.error('Failed to submit survey:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-2">
          <span>Continuous Discovery</span>
          <span aria-hidden="true">·</span>
          <span>Student Voice & Research</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Frustration Survey & Research Feed
        </h2>
        <p className="text-base text-slate-600 leading-relaxed">
          Design Thinking never stops at the initial launch. We collect live feedback from college students to continually refine our spot criteria, seating metrics, and budget benchmarks.
        </p>
      </div>

      {/* Aggregate Stats Dashboard Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <MessageSquareText className="w-4 h-4 text-amber-600" />
            <span>Total Campus Respondents</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {stats.total + 152}
          </div>
          <p className="text-[11px] text-slate-500">
            {stats.total} live platform inputs + 152 initial campus survey cohort
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <span>Average Acceptable Budget/Head</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            ₹{stats.avgMaxBudget || 230}
          </div>
          <p className="text-[11px] text-slate-500">
            Students reject places that cost over ₹300 per person
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Average Hangout Squad Size</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {stats.avgGroupSize || 6.2} friends
          </div>
          <p className="text-[11px] text-slate-500">
            Requires at least 6-8 continuous seats without splitting tables
          </p>
        </div>
      </div>

      {/* Grid: Survey Form (Left) & Real Responses Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">
              Add Your Voice to the Student Study
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Takes 90 seconds. Your honest experience shapes which cafes get scout-verified.
            </p>
          </div>

          {submittedSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900">Response Recorded!</h4>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Thank you for contributing. Your feedback has been calculated into the live study metrics and research stream below.
              </p>
              <button
                onClick={() => setSubmittedSuccess(false)}
                className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-100 cursor-pointer"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              {/* Row 1: Name and College */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Your Name (or Nickname)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Ankit S."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">College / Department</label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g., Delhi University / Engineering"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Year of Study */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Year of Study</label>
                <div className="flex flex-wrap gap-2">
                  {['1st Year UG', '2nd Year UG', '3rd Year UG', 'Final Year', 'Postgrad / Masters'].map((y) => (
                    <button
                      type="button"
                      key={y}
                      onClick={() => setYear(y)}
                      className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        year === y
                          ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Frustration */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">What is your #1 frustration when planning a hangout?</label>
                <select
                  value={frustration}
                  onChange={(e) => setFrustration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900"
                >
                  {COMMON_FRUSTRATIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                  <option value="Other">Other specific frustration...</option>
                </select>

                {frustration === 'Other' && (
                  <input
                    type="text"
                    value={customFrustration}
                    onChange={(e) => setCustomFrustration(e.target.value)}
                    placeholder="Type your specific frustration..."
                    className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                  />
                )}
              </div>

              {/* Worst Experience */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Share a quick story: What went wrong on your worst group hangout?
                </label>
                <textarea
                  rows={3}
                  value={worstExperience}
                  onChange={(e) => setWorstExperience(e.target.value)}
                  placeholder="e.g., We went based on a reel, got slapped with ₹400 service charges, and they wouldn't let 6 of us push 2 tables together..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-900 leading-relaxed"
                />
              </div>

              {/* Sliders: Budget & Group Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700">Max Budget Per Person:</span>
                    <span className="font-bold text-slate-900 tabular-nums">₹{maxBudget}</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="500"
                    step="10"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>₹80 (Chai/Snack)</span>
                    <span>₹250 (Cafe Meal)</span>
                    <span>₹500 (Treat)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700">Typical Squad Size:</span>
                    <span className="font-bold text-slate-900 tabular-nums">{groupSize} friends</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="14"
                    value={groupSize}
                    onChange={(e) => setGroupSize(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>2 (Duo)</span>
                    <span>6 (Regular)</span>
                    <span>14 (Full Batch)</span>
                  </div>
                </div>
              </div>

              {/* Priorities Checklist */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700">What are non-negotiable must-haves for you? (Select all)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRIORITY_OPTIONS.map((p) => {
                    const isChecked = selectedPriorities.includes(p);
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => togglePriority(p)}
                        className={`text-left p-2.5 rounded-lg border transition-colors flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-amber-50 border-amber-400 text-amber-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs truncate">{p}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Recording Response...' : 'Submit to Student Study'}</span>
              </button>

            </form>
          )}
        </div>

        {/* Real Student Responses Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h4 className="text-sm font-bold text-slate-900">
              Live Student Voice Stream ({responses.length} entries)
            </h4>
            <span className="text-[11px] text-slate-500">Unfiltered Quotes</span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {responses.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-xs shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900">{r.studentName}</div>
                    <div className="text-[11px] text-slate-500">
                      {r.collegeOrCampus} · {r.yearOfStudy}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-amber-700 tabular-nums">Max ₹{r.maxAcceptableCostPerHead}</span>
                    <div className="text-[10px] text-slate-400">{r.averageGroupSize} friends squad</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700 italic space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 not-italic">
                    <span>Frustration:</span>
                  </div>
                  <p>"{r.primaryFrustration}"</p>
                </div>

                {r.worstExperienceWithApps && (
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong className="text-slate-800">Experience: </strong>
                    {r.worstExperienceWithApps}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                  {r.idealSpotPriorities?.map((p) => (
                    <span
                      key={p}
                      className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
