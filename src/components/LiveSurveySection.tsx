/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SurveyResponse } from '../types/index.ts';
import { MessageSquareText, CheckCircle2, Send, Users, IndianRupee, AlertCircle } from 'lucide-react';

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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const togglePriority = (p: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const effectiveFrustration = (frustration === 'Other' ? customFrustration : frustration).trim();
    if (name.trim().length < 2 || college.trim().length < 2 || !effectiveFrustration) {
      setErrorMsg('Please enter your name, college/department, and primary frustration.');
      return;
    }

    setSubmitting(true);

    const payload = {
      studentName: name.trim(),
      collegeOrCampus: college.trim(),
      yearOfStudy: year,
      primaryFrustration: effectiveFrustration,
      worstExperienceWithApps: worstExperience.trim() || 'Shared group hangout preferences.',
      idealSpotPriorities: selectedPriorities,
      maxAcceptableCostPerHead: maxBudget,
      averageGroupSize: groupSize
    };

    try {
      const res = await fetch('/survey.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Could not record your survey response. Please try again.');
        return;
      }
      onSurveySubmitted(data.response, data.stats);
      setSubmittedSuccess(true);
      setName('');
      setCollege('');
      setWorstExperience('');
    } catch (err) {
      console.error('Failed to submit survey:', err);
      setErrorMsg('Network error: Unable to record your response right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
          <span>Continuous Discovery</span>
          <span aria-hidden="true">·</span>
          <span>Student Voice & Research</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-stone-100 tracking-tight">
          Student Frustration Survey & Research Feed
        </h2>
        <p className="text-base text-slate-600 dark:text-stone-400 leading-relaxed">
          Design Thinking never stops at the initial launch. We collect live feedback from college students to continually refine our spot criteria, seating metrics, and budget benchmarks.
        </p>
      </div>

      {/* Aggregate Stats Dashboard Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1C1612] p-5 rounded-xl border border-slate-200 dark:border-[#33271F] shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-stone-400 text-xs font-medium">
            <MessageSquareText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Total Campus Respondents</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-stone-100 tabular-nums">
            {stats.total}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-stone-400">
            {stats.total} verified student responses recorded in database
          </p>
        </div>

        <div className="bg-white dark:bg-[#1C1612] p-5 rounded-xl border border-slate-200 dark:border-[#33271F] shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-stone-400 text-xs font-medium">
            <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Average Acceptable Budget/Head</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-stone-100 tabular-nums">
            ₹{stats.avgMaxBudget || 230}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-stone-400">
            Students reject places that cost over ₹300 per person
          </p>
        </div>

        <div className="bg-white dark:bg-[#1C1612] p-5 rounded-xl border border-slate-200 dark:border-[#33271F] shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-slate-500 dark:text-stone-400 text-xs font-medium">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Average Hangout Squad Size</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-stone-100 tabular-nums">
            {stats.avgGroupSize || 6.2} friends
          </div>
          <p className="text-[11px] text-slate-500 dark:text-stone-400">
            Requires at least 6-8 continuous seats without splitting tables
          </p>
        </div>
      </div>

      {/* Grid: Survey Form (Left) & Real Responses Stream (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1C1612] rounded-2xl border border-slate-200 dark:border-[#33271F] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-[#33271F] pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-stone-100">
              Add Your Voice to the Student Study
            </h3>
            <p className="text-xs text-slate-500 dark:text-stone-400 mt-1">
              Takes 90 seconds. Your honest experience shapes which cafes get scout-verified.
            </p>
          </div>

          {submittedSuccess ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">Response Recorded!</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                Thank you for contributing. Your feedback has been calculated into the live study metrics and research stream below.
              </p>
              <button
                onClick={() => setSubmittedSuccess(false)}
                className="px-4 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-white dark:bg-[#251D17] border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {errorMsg && (
                <div
                  role="alert"
                  className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Row 1: Name and College */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-stone-200">Your Name (or Nickname)</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Ankit S."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#251D17] border border-slate-200 dark:border-[#3E3025] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#1C1612] text-slate-900 dark:text-stone-100 placeholder-slate-400 dark:placeholder-stone-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-stone-200">College / Department</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g., Delhi University / Engineering"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#251D17] border border-slate-200 dark:border-[#3E3025] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#1C1612] text-slate-900 dark:text-stone-100 placeholder-slate-400 dark:placeholder-stone-500"
                  />
                </div>
              </div>

              {/* Year of Study */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-stone-200">Year of Study</label>
                <div className="flex flex-wrap gap-2">
                  {['1st Year UG', '2nd Year UG', '3rd Year UG', 'Final Year', 'Postgrad / Masters'].map((y) => (
                    <button
                      type="button"
                      key={y}
                      onClick={() => setYear(y)}
                      className={`px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        year === y
                          ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                          : 'bg-slate-50 dark:bg-[#251D17] text-slate-700 dark:text-stone-300 border-slate-200 dark:border-[#3E3025] hover:bg-slate-100 dark:hover:bg-[#31261E]'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Frustration */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-stone-200">What is your #1 frustration when planning a hangout?</label>
                <select
                  value={frustration}
                  onChange={(e) => setFrustration(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#251D17] border border-slate-200 dark:border-[#3E3025] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#1C1612] text-slate-900 dark:text-stone-100"
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
                    className="w-full mt-2 px-3 py-2 bg-slate-50 dark:bg-[#251D17] border border-slate-200 dark:border-[#3E3025] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-stone-100 placeholder-slate-400 dark:placeholder-stone-500"
                  />
                )}
              </div>

              {/* Worst Experience */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-stone-200">
                  Share a quick story: What went wrong on your worst group hangout?
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={worstExperience}
                  onChange={(e) => setWorstExperience(e.target.value)}
                  placeholder="e.g., We went based on a reel, got slapped with ₹400 service charges, and they wouldn't let 6 of us push 2 tables together..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#251D17] border border-slate-200 dark:border-[#3E3025] rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#1C1612] text-slate-900 dark:text-stone-100 placeholder-slate-400 dark:placeholder-stone-500 leading-relaxed"
                />
              </div>

              {/* Sliders: Budget & Group Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 dark:bg-[#251D17] p-4 rounded-xl border border-slate-100 dark:border-[#3E3025]">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700 dark:text-stone-200">Max Budget Per Person:</span>
                    <span className="font-bold text-slate-900 dark:text-amber-400 tabular-nums">₹{maxBudget}</span>
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
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-stone-400">
                    <span>₹80 (Chai/Snack)</span>
                    <span>₹250 (Cafe Meal)</span>
                    <span>₹500 (Treat)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700 dark:text-stone-200">Typical Squad Size:</span>
                    <span className="font-bold text-slate-900 dark:text-amber-400 tabular-nums">{groupSize} friends</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="14"
                    value={groupSize}
                    onChange={(e) => setGroupSize(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-stone-400">
                    <span>2 (Duo)</span>
                    <span>6 (Regular)</span>
                    <span>14 (Full Batch)</span>
                  </div>
                </div>
              </div>

              {/* Priorities Checklist */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 dark:text-stone-200">What are non-negotiable must-haves for you? (Select all)</label>
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
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 font-semibold'
                            : 'bg-white dark:bg-[#251D17] border-slate-200 dark:border-[#3E3025] text-slate-600 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-[#31261E]'
                        }`}
                      >
                        <span className="text-xs truncate">{p}</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-sm font-semibold text-white bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-500 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Recording Response...' : 'Submit to Student Study'}</span>
              </button>

            </form>
          )}
        </div>

        {/* Real Student Responses Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#33271F] pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-stone-100">
              Live Student Voice Stream ({responses.length} entries)
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-stone-400">Unfiltered Quotes</span>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {responses.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-[#1C1612] rounded-xl border border-slate-200 dark:border-[#33271F] p-4 space-y-3 text-xs shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-stone-100">{r.studentName}</div>
                    <div className="text-[11px] text-slate-500 dark:text-stone-400">
                      {r.collegeOrCampus} · {r.yearOfStudy}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-amber-700 dark:text-amber-400 tabular-nums">Max ₹{r.maxAcceptableCostPerHead}</span>
                    <div className="text-[10px] text-slate-400 dark:text-stone-400">{r.averageGroupSize} friends squad</div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#251D17] p-2.5 rounded-lg border border-slate-100 dark:border-[#3E3025] text-slate-700 dark:text-stone-300 italic space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 not-italic">
                    <span>Frustration:</span>
                  </div>
                  <p>"{r.primaryFrustration}"</p>
                </div>

                {r.worstExperienceWithApps && (
                  <p className="text-slate-600 dark:text-stone-300 text-[11px] leading-relaxed">
                    <strong className="text-slate-800 dark:text-stone-100">Experience: </strong>
                    {r.worstExperienceWithApps}
                  </p>
                )}

                {r.idealSpotPriorities && r.idealSpotPriorities.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pt-1.5 border-t border-slate-100 dark:border-[#33271F] text-[11px] text-slate-500 dark:text-stone-400">
                    {r.idealSpotPriorities.map((p, idx) => (
                      <React.Fragment key={p}>
                        {idx > 0 && <span aria-hidden="true">·</span>}
                        <span>{p}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
