/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SurveyResponse } from '../types/index.ts';
import { MessageSquareText, CheckCircle2, Send, Users, IndianRupee, AlertCircle } from 'lucide-react';

interface StudentFeedbackSectionProps {
  responses: SurveyResponse[];
  stats: {
    total: number;
    avgMaxBudget: number;
    avgGroupSize: number;
    frustrations: Record<string, number>;
    priorities: Record<string, number>;
  };
  onFeedbackSubmitted: (newResponse: SurveyResponse, updatedStats: any) => void;
  onOpenSubmitSpot: () => void;
}

const CAMPUS_TOPICS = [
  'Spot recommendation (hidden budget spot near my campus)',
  'Price discrepancy on a listed spot (actual bill was higher)',
  'Seating issue (staff would not push tables together for squad of 6+)',
  'WiFi / socket audit request (need verified laptop cafes near my college)',
  'Birthday treat / group cake policy without extra charges',
  'Request Hangout-Hub scout verification for our college city'
];

const PRIORITY_OPTIONS = [
  'Honest per-head cost',
  'Big group table (6+)',
  'Split bill friendly',
  'Verified WiFi speed (>40 Mbps)',
  'Power sockets at tables',
  'No rush / linger friendly',
  'Outside cake allowed for birthdays',
  'Student discounts with college ID'
];

export const StudentFeedbackSection: React.FC<StudentFeedbackSectionProps> = ({
  responses,
  stats,
  onFeedbackSubmitted,
  onOpenSubmitSpot
}) => {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [year, setYear] = useState('2nd Year UG');
  const [topic, setTopic] = useState(CAMPUS_TOPICS[0]);
  const [feedbackStory, setFeedbackStory] = useState('');
  const [idealBudget, setIdealBudget] = useState(200);
  const [groupSize, setGroupSize] = useState(6);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'Honest per-head cost',
    'Big group table (6+)'
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

    if (name.trim().length < 2 || college.trim().length < 2 || feedbackStory.trim().length < 5) {
      setErrorMsg('Please enter your name, campus, and at least a short note (5+ characters).');
      return;
    }

    setSubmitting(true);

    const payload = {
      studentName: name.trim(),
      collegeOrCampus: college.trim(),
      yearOfStudy: year,
      primaryFrustration: topic,
      worstExperienceWithApps: feedbackStory.trim(),
      idealSpotPriorities: selectedPriorities,
      maxAcceptableCostPerHead: idealBudget,
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
        setErrorMsg(data.error || 'Could not post your campus note. Please try again.');
        return;
      }
      onFeedbackSubmitted(data.response, data.stats);
      setSubmittedSuccess(true);
      setName('');
      setCollege('');
      setFeedbackStory('');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setErrorMsg('Network error: Unable to post your campus note right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 bg-stone-50 dark:bg-[#251D17] border border-stone-200 dark:border-[#3E3025] rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-[#2C221B] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-[#33271F] pb-6">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
            <MessageSquareText className="w-3.5 h-3.5" />
            <span>Campus Community Feed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Student Feedback & Spot Requests
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
            Have a favorite tea stall near CEPT or HL? Or had a bad experience with surprise service charges on SBR? Share your tips with fellow students across campuses.
          </p>
        </div>

        <button
          onClick={onOpenSubmitSpot}
          className="px-4 py-2.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0 shadow-xs"
        >
          + Submit a Campus Spot
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1C1612] p-5 rounded-2xl border border-stone-200 dark:border-[#33271F] shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-medium">
            <MessageSquareText className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Community Tips & Reviews</span>
          </div>
          <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
            {stats.total}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Verified student recommendations recorded across college campuses
          </p>
        </div>

        <div className="bg-white dark:bg-[#1C1612] p-5 rounded-2xl border border-stone-200 dark:border-[#33271F] shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-medium">
            <IndianRupee className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>Campus Budget Benchmark</span>
          </div>
          <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
            ₹{stats.avgMaxBudget || 200}
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Target per-head spend for casual post-class hangouts
          </p>
        </div>

        <div className="bg-white dark:bg-[#1C1612] p-5 rounded-2xl border border-stone-200 dark:border-[#33271F] shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-medium">
            <Users className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <span>Average Squad Table Size</span>
          </div>
          <div className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
            {stats.avgGroupSize || 6.4} friends
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Requires at least 6–8 continuous seats without splitting tables
          </p>
        </div>
      </div>

      {/* Grid: Feedback Form & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1C1612] rounded-3xl border border-stone-200 dark:border-[#33271F] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-stone-100 dark:border-[#2E231C] pb-3">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Share a Spot Tip or Report an Issue
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Your note will be verified by campus scouts and added to the community directory.
            </p>
          </div>

          {submittedSuccess ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-100">Thank You for Your Tip!</h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
                Your suggestion has been added to our scout audit backlog and community feed below.
              </p>
              <button
                onClick={() => setSubmittedSuccess(false)}
                className="px-4 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-white dark:bg-[#251D17] border border-emerald-300 dark:border-emerald-700 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
              >
                Send another note
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-200">Your Name / Nickname</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Yash Patel"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-stone-200">College / Campus & City</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. CEPT (Ahmedabad), PDPU, DU North, Christ (BLR), Mithibai (MUM)"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-200">Topic of Note</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className={inputClass}
                >
                  {CAMPUS_TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-200">
                  Your Note, Spot Name, or Ground Experience
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={500}
                  value={feedbackStory}
                  onChange={(e) => setFeedbackStory(e.target.value)}
                  placeholder="e.g. You guys should check out the new outdoor seating behind Vastrapur lake! ₹70 cold coffee and huge tables that easily fit 8 people..."
                  className={`${inputClass} leading-relaxed`}
                />
              </div>

              {/* Sliders: Budget & Group Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50 dark:bg-[#251D17] p-4 rounded-2xl border border-stone-100 dark:border-[#3A2D23]">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-stone-700 dark:text-stone-200">Ideal Spend/Head:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">₹{idealBudget}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="450"
                    step="10"
                    value={idealBudget}
                    onChange={(e) => setIdealBudget(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-400">
                    <span>₹50 (HL Six Roads)</span>
                    <span>₹200 (Gufa Cafe)</span>
                    <span>₹450 (SBR Treat)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-stone-700 dark:text-stone-200">Typical Squad Size:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">{groupSize} friends</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    value={groupSize}
                    onChange={(e) => setGroupSize(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-400">
                    <span>2</span>
                    <span>6</span>
                    <span>16</span>
                  </div>
                </div>
              </div>

              {/* Priorities Checklist */}
              <div className="space-y-2">
                <label className="font-bold text-stone-700 dark:text-stone-200">What are non-negotiable must-haves for your squad?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRIORITY_OPTIONS.map((p) => {
                    const isChecked = selectedPriorities.includes(p);
                    return (
                      <button
                        type="button"
                        key={p}
                        onClick={() => togglePriority(p)}
                        className={`text-left p-2.5 rounded-xl border transition-colors flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-600 text-amber-950 dark:text-amber-200 font-bold'
                            : 'bg-white dark:bg-[#251D17] border-stone-200 dark:border-[#3A2D23] text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#31261E]'
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
                className="w-full py-3 text-sm font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Post to Campus Scout Feed'}</span>
              </button>

            </form>
          )}
        </div>

        {/* Live Student Community Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-[#33271F] pb-3">
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              Recent Campus Notes & Tips ({responses.length})
            </h4>
            <span className="text-[11px] text-stone-400 dark:text-stone-400">Student Scouts</span>
          </div>

          <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
            {responses.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-[#1C1612] rounded-2xl border border-stone-200 dark:border-[#33271F] p-4 space-y-3 text-xs shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-stone-900 dark:text-stone-100">{r.studentName}</div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      {r.collegeOrCampus} · {r.yearOfStudy}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-amber-700 dark:text-amber-400 tabular-nums">Max ₹{r.maxAcceptableCostPerHead}</span>
                    <div className="text-[10px] text-stone-400 dark:text-stone-400">{r.averageGroupSize} friends squad</div>
                  </div>
                </div>

                <div className="bg-stone-50 dark:bg-[#251D17] p-2.5 rounded-xl border border-stone-100 dark:border-[#3A2D23] text-stone-700 dark:text-stone-300 space-y-1">
                  <div className="text-[11px] font-bold text-stone-900 dark:text-stone-100">
                    {r.primaryFrustration}
                  </div>
                  {r.worstExperienceWithApps && (
                    <p className="text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed italic">
                      "{r.worstExperienceWithApps}"
                    </p>
                  )}
                </div>

                {r.idealSpotPriorities && r.idealSpotPriorities.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pt-1.5 border-t border-stone-100 dark:border-[#2E231C] text-[11px] text-stone-500 dark:text-stone-400">
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
