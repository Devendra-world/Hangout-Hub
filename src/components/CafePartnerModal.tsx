/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle2, Store, ShieldCheck, AlertCircle } from 'lucide-react';
import { CafePartnershipProposal } from '../types/index.ts';

interface CafePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPartnerSubmitted?: (proposal: CafePartnershipProposal) => void;
}

export const CafePartnerModal: React.FC<CafePartnerModalProps> = ({ isOpen, onClose, onPartnerSubmitted }) => {
  const [cafeName, setCafeName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [proposedPerPersonCost, setProposedPerPersonCost] = useState('200');
  const [groupCapacity, setGroupCapacity] = useState('10');
  const [offeredStudentDiscount, setOfferedStudentDiscount] = useState('15% off for groups of 4+ with college ID');
  const [hasFastWifi, setHasFastWifi] = useState(true);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (cafeName.trim().length < 2 || cafeName.trim().length > 100) {
      setErrorMsg('Please enter a valid cafe name (2–100 characters).');
      return;
    }
    if (ownerName.trim().length < 2 || ownerName.trim().length > 80) {
      setErrorMsg('Please enter the owner or manager name (2–80 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setErrorMsg('Please enter a valid contact email address.');
      return;
    }

    const trimmedPhone = contactPhone.trim();
    if (trimmedPhone) {
      const digitsOnly = trimmedPhone.replace(/\D/g, '');
      if (!/^\+?[0-9\s\-()]{7,18}$/.test(trimmedPhone) || digitsOnly.length < 7 || digitsOnly.length > 15) {
        setErrorMsg('Please enter a valid phone number (7–15 digits, numbers only).');
        return;
      }
    }

    const cap = Number(groupCapacity);
    if (!Number.isFinite(cap) || cap < 2 || cap > 250) {
      setErrorMsg('Group capacity must be between 2 and 250 guests.');
      return;
    }

    const cost = Number(proposedPerPersonCost);
    if (!Number.isFinite(cost) || cost < 20 || cost > 5000) {
      setErrorMsg('Per-person average spend must be between ₹20 and ₹5,000.');
      return;
    }

    if (notes.length > 500) {
      setErrorMsg('Additional notes must be 500 characters or fewer.');
      return;
    }

    setSubmitting(true);

    const payload = {
      cafeName: cafeName.trim(),
      ownerName: ownerName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: trimmedPhone,
      address: address.trim(),
      proposedPerPersonCost: cost,
      groupCapacity: cap,
      offeredStudentDiscount: offeredStudentDiscount.trim(),
      hasFastWifi,
      notes: notes.trim()
    };

    try {
      const res = await fetch('/partnerships.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Could not submit your partnership application. Please verify all fields.');
        return;
      }
      if (onPartnerSubmitted && data.proposal) onPartnerSubmitted(data.proposal);
      setSuccess(true);
    } catch (err) {
      console.error('Failed to submit partnership:', err);
      setErrorMsg('Network error: Unable to reach the server. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2 bg-stone-50 dark:bg-[#251D17] border border-stone-200 dark:border-[#3E3025] rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-[#2C221B] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500';
  const labelClass = 'block font-semibold text-stone-700 dark:text-stone-200';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="partner-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#1C1612] text-stone-900 dark:text-stone-100 rounded-2xl shadow-2xl border border-stone-200 dark:border-[#362920] w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-[#33271F] flex items-center justify-between bg-stone-50 dark:bg-[#241C17]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Store className="w-3.5 h-3.5" />
              <span>Cafe Owner Partner Program</span>
            </div>
            <h3 id="partner-modal-title" className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              Promote Your Spot to Student Squads
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Get steady weekday afternoon traffic by offering transparent pricing & group seating.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-[#31261E] rounded-lg cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 text-xs space-y-6">
          {success ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-8 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">Partnership Request Received!</h4>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto leading-relaxed">
                  Our student scout team will contact you at <strong className="text-emerald-950 dark:text-emerald-100">{contactEmail}</strong> and arrange a 15-minute campus audit visit to verify seating capacity and menu pricing.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div
                  role="alert"
                  className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Value Proposition Callout */}
              <div className="bg-stone-50 dark:bg-[#251D17] p-4 rounded-xl border border-stone-200/80 dark:border-[#3A2D23] space-y-1.5 text-stone-700 dark:text-stone-300">
                <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Why Partner with Hangout-Hub?
                </span>
                <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-300">
                  College students regularly struggle to find group seating for 6+ friends between 2:00 PM and 6:00 PM—often your slowest cafe hours. When you offer verified student group perks, our student network directs campus squads straight to you.
                </p>
              </div>

              {/* Cafe & Owner Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Cafe / Spot Name *</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Roasters & Co."
                    value={cafeName}
                    onChange={(e) => setCafeName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Owner / Manager Name *</label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    placeholder="e.g. Vikram Batra"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Contact Email *</label>
                  <input
                    type="email"
                    required
                    maxLength={120}
                    placeholder="vikram@cafe.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    maxLength={18}
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className={labelClass}>Complete Address & Landmark</label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  placeholder="e.g. Shop 4, University Metro Complex, Gate 2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Group Capacity and Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>
                    Max Group Capacity at a Single Table / Area
                  </label>
                  <input
                    type="number"
                    required
                    min={2}
                    max={250}
                    value={groupCapacity}
                    onChange={(e) => setGroupCapacity(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className={labelClass}>
                    Realistic Per-Person Average Spend (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={20}
                    max={5000}
                    value={proposedPerPersonCost}
                    onChange={(e) => setProposedPerPersonCost(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Offered Perk */}
              <div className="space-y-1">
                <label className={labelClass}>
                  Offered Student Squad Perk / Discount Pledge *
                </label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  placeholder="e.g. 15% discount for groups of 4+ OR Free garlic bread with large coffee"
                  value={offeredStudentDiscount}
                  onChange={(e) => setOfferedStudentDiscount(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Checkboxes */}
              <div className="pt-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-stone-800 dark:text-stone-200">
                  <input
                    type="checkbox"
                    checked={hasFastWifi}
                    onChange={(e) => setHasFastWifi(e.target.checked)}
                    className="rounded accent-emerald-600 w-4 h-4"
                  />
                  <span>We offer high-speed WiFi for students</span>
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className={labelClass}>Additional Notes / Vibe Details</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder="Tell us about your seating arrangements, power outlets, or board game collection..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-stone-200 dark:border-[#33271F] flex justify-end gap-3">
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
                  className="px-5 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting Application...' : 'Apply for Campus Verification'}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
