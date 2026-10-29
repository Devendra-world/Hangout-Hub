/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle2, Store, Users, IndianRupee, ShieldCheck } from 'lucide-react';
import { CafePartnershipProposal } from '../types/index.ts';

interface CafePartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPartnerSubmitted?: (proposal: CafePartnershipProposal) => void;
}

export const CafePartnerModal: React.FC<CafePartnerModalProps> = ({ isOpen, onClose, onPartnerSubmitted }) => {
  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      cafeName,
      ownerName,
      contactEmail,
      contactPhone,
      address,
      proposedPerPersonCost,
      groupCapacity,
      offeredStudentDiscount,
      hasFastWifi,
      notes
    };

    try {
      const res = await fetch('/partnerships.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (onPartnerSubmitted) onPartnerSubmitted(data.proposal);
        setSuccess(true);
      }
    } catch (err) {
      console.error('Failed to submit partnership:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 uppercase tracking-wide">
              <Store className="w-3.5 h-3.5" />
              <span>Cafe Owner Partner Program</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5">
              Promote Your Spot to Student Squads
            </h3>
            <p className="text-xs text-slate-500">
              Get steady weekday afternoon traffic by offering transparent pricing & group seating.
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
                <h4 className="text-lg font-bold text-emerald-950">Partnership Request Received!</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Our student scout team will contact you at <strong className="text-emerald-950">{contactEmail}</strong> and arrange a 15-minute campus audit visit to verify seating capacity and menu pricing.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Value Proposition Callout */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5 text-slate-700">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Why Partner with Hangout-Hub?
                </span>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  College students regularly struggle to find group seating for 6+ friends between 2:00 PM and 6:00 PM—often your slowest cafe hours. When you offer verified student group perks, our student network directs campus squads straight to you.
                </p>
              </div>

              {/* Cafe & Owner Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Cafe / Spot Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Roasters & Co."
                    value={cafeName}
                    onChange={(e) => setCafeName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Owner / Manager Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Batra"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@cafe.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Phone Number (WhatsApp)</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Complete Address & Landmark</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shop 4, University Metro Complex, Gate 2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              {/* Group Capacity and Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Max Group Capacity at a Single Table / Area
                  </label>
                  <input
                    type="number"
                    required
                    value={groupCapacity}
                    onChange={(e) => setGroupCapacity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Realistic Per-Person Average Spend (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={proposedPerPersonCost}
                    onChange={(e) => setProposedPerPersonCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Offered Perk */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Offered Student Squad Perk / Discount Pledge *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15% discount for groups of 4+ OR Free garlic bread with large coffee"
                  value={offeredStudentDiscount}
                  onChange={(e) => setOfferedStudentDiscount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              {/* Checkboxes */}
              <div className="pt-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                  <input
                    type="checkbox"
                    checked={hasFastWifi}
                    onChange={(e) => setHasFastWifi(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>We offer high-speed WiFi for students</span>
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Additional Notes / Vibe Details</label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your seating arrangements, power outlets, or board game collection..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
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
