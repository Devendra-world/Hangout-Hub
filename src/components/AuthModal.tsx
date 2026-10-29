/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Mail, User, School, MapPin, IndianRupee, Sparkles, LogIn, UserPlus, QrCode } from 'lucide-react';
import { UserProfile } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('CEPT & Gujarat University');
  const [city, setCity] = useState('Ahmedabad');
  const [budget, setBudget] = useState(180);
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanUpi = upiId.trim() || (email.includes('@') ? `${email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '')}@oksbi` : 'patadiyadevendra5@oksbi');
      const payload = mode === 'login'
        ? { action: 'login', email: email.trim(), password: password.trim() }
        : {
            action: 'signup',
            name: name.trim(),
            email: email.trim(),
            password: password.trim(),
            college: college.trim(),
            city: city.trim(),
            preferredBudget: Number(budget) || 200,
            favoriteVibes: ['Budget Bite & Chill', 'Study & Projects'],
            upiId: cleanUpi
          };

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Authentication failed. Please verify your email and password.');
      }
    } catch (err: any) {
      setError('Connection to server failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1810]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#E8DFC8] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#2A1810] text-[#FAF7F2] p-5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold font-brand flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              {mode === 'login' ? 'Account Sign In' : 'Join Hangout-Hub Community'}
            </h2>
            <p className="text-xs text-[#E8DFC8] mt-0.5">
              Personalized hangout recommendations, saved spots & squad tools
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#E8DFC8] hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#E8DFC8] bg-white">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 cursor-pointer transition-colors ${
              mode === 'login'
                ? 'border-[#C85A32] text-[#2A1810] bg-[#FAF8F5]'
                : 'border-transparent text-[#8C6D53] hover:text-[#2A1810]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 cursor-pointer transition-colors ${
              mode === 'signup'
                ? 'border-[#C85A32] text-[#2A1810] bg-[#FAF8F5]'
                : 'border-transparent text-[#8C6D53] hover:text-[#2A1810]'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
              {error}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-[#2A1810] mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C6D53] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Devendra Patadiya"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2A1810] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C6D53] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. name@campus.edu or your email"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2A1810] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C6D53] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#2A1810] mb-1">College / Campus</label>
                  <div className="relative">
                    <School className="w-3.5 h-3.5 text-[#8C6D53] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="CEPT / JG / AU / HL"
                      className="w-full pl-8 pr-2 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A1810] mb-1">City</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-[#8C6D53] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ahmedabad"
                      className="w-full pl-8 pr-2 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A1810] mb-1">
                  Ideal Hangout Budget (₹ per person)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-[#8C6D53] absolute left-3 top-3" />
                  <input
                    type="number"
                    min="50"
                    max="1500"
                    step="10"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>
                <span className="text-[10px] text-[#8C6D53] mt-0.5 block">
                  Hangout-Hub recommends cafes matching your exact budget preferences.
                </span>
              </div>

              {/* Payment QR / UPI ID Field */}
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E8DFC8] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2A1810] flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>Payment UPI ID (for Squad Bill Split QR)</span>
                  </label>
                  <span className="text-[10px] font-extrabold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Auto-QR
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-[#C85A32]">UPI</span>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. devendra@okaxis or yourname@oksbi"
                    className="w-full pl-11 pr-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>
                <p className="text-[10px] text-[#8C6D53] leading-relaxed">
                  Generates your personal payment QR code in the Squad Split tool so friends can scan & pay you directly via Google Pay, PhonePe, Paytm, or BHIM. You can change this anytime later in your profile!
                </p>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-[#2A1810] hover:bg-[#C85A32] rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Save Profile</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-[#8C6D53]">
              {mode === 'login'
                ? "Admin access? Use your admin credentials above to unlock full website authorization and database tables."
                : "Already have an account? Switch to Log In above."}
            </span>
          </div>
        </form>

      </div>
    </div>
  );
};
