/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X, User, Mail, School, MapPin, IndianRupee, Edit3, Save, CheckCircle2,
  Clock, Bookmark, ThumbsUp, LogOut, Sparkles, Compass, ShieldCheck, QrCode, KeyRound, AlertCircle
} from 'lucide-react';
import { UserProfile, HangoutSpot, UserActivityItem, RecommendationItem } from '../types/index.ts';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onSelectSpot: (spot: HangoutSpot) => void;
  onOpenQrGenerator: (spot?: HangoutSpot) => void;
}

const ALL_VIBES = [
  'Study & Projects',
  'Budget Bite & Chill',
  'Board Games & Fun',
  'Aesthetic Hangout',
  'Late Night Hangout'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onSelectSpot,
  onOpenQrGenerator
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history' | 'recommendations'>('bookmarks');
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // Edit fields
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [city, setCity] = useState('');
  const [budget, setBudget] = useState(180);
  const [bio, setBio] = useState('');
  const [favoriteVibes, setFavoriteVibes] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Remote data fetched from /api/profile
  const [bookmarks, setBookmarks] = useState<HangoutSpot[]>([]);
  const [history, setHistory] = useState<UserActivityItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Sync state whenever user changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setCollege(user.college);
      setCity(user.city);
      setBudget(user.preferredBudget);
      setBio(user.bio);
      setFavoriteVibes(user.favoriteVibes || []);
      fetchUserData(user.id);
    }
  }, [user]);

  const fetchUserData = async (userId: string) => {
    setDataLoading(true);
    try {
      const [profRes, recRes] = await Promise.all([
        fetch(`/api/profile?user_id=${userId}`),
        fetch(`/api/recommendations?user_id=${userId}`)
      ]);

      const profData = await profRes.json();
      if (profData.success) {
        if (profData.bookmarks) setBookmarks(profData.bookmarks);
        if (profData.history) setHistory(profData.history);
      }

      const recData = await recRes.json();
      if (recData.success && recData.recommendations) {
        setRecommendations(recData.recommendations);
      }
    } catch (e) {
      console.log('Profile data loading error:', e);
    } finally {
      setDataLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    if (newPassword) {
      if (newPassword.length < 4) {
        setSaveErrorMsg('New password must be at least 4 characters long.');
        setSaveLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setSaveErrorMsg('New password and confirm password do not match.');
        setSaveLoading(false);
        return;
      }
    }

    const updatedData: Record<string, any> = {
      user_id: user.id,
      name: name.trim(),
      college: college.trim(),
      city: city.trim(),
      preferredBudget: Number(budget) || 180,
      bio: bio.trim(),
      favoriteVibes,
      avatarColor: user.avatarColor
    };

    if (newPassword) {
      updatedData.newPassword = newPassword;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      const data = await res.json();

      if (data.success && data.profile) {
        onUpdateUser(data.profile);
        setSaveSuccessMsg(
          newPassword
            ? 'Profile and password updated & saved to SQL Database successfully!'
            : 'Profile updated & saved to SQL Database successfully!'
        );
        setIsEditing(false);
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
        setTimeout(() => setSaveSuccessMsg(null), 3500);
      } else {
        // Fallback update local state
        const fallback = { ...user, ...updatedData };
        onUpdateUser(fallback);
        setIsEditing(false);
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
      }
    } catch (err) {
      const fallback = { ...user, ...updatedData };
      onUpdateUser(fallback);
      setIsEditing(false);
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
      setSaveSuccessMsg('Profile updated locally!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleVibe = (vibe: string) => {
    setFavoriteVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const handleRemoveBookmark = async (spotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks((prev) => prev.filter((s) => s.id !== spotId));
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, spot_id: spotId, action_type: 'unsaved' })
      });
    } catch (e) {
      console.log('Unsave error:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2A1810]/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#E8DFC8] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="bg-[#2A1810] text-[#FAF7F2] p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-[#E8DFC8] hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-white/20"
                style={{ backgroundColor: user.avatarColor || '#C85A32' }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold font-brand text-[#FAF7F2]">
                    {user.name}
                  </h2>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-[#7C3AED] text-white'
                        : 'bg-[#C85A32] text-white'
                    }`}
                  >
                    {user.role === 'admin' ? 'Campus Admin' : 'Student Scout'}
                  </span>
                </div>
                <div className="text-xs text-[#E8DFC8] flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#F59E0B]" />
                    {user.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <School className="w-3 h-3 text-[#F59E0B]" />
                    {user.college}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#2A1810] bg-[#FAF8F5] hover:bg-[#EFE7DA] rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#E8DFC8] hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-200 hover:text-red-100 hover:bg-red-500/20 rounded-xl transition-all cursor-pointer"
                title="Log out from session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-[10px] text-[#E8DFC8] block uppercase tracking-wider">Per-Head Budget</span>
              <span className="text-sm font-black text-[#F59E0B]">₹{user.preferredBudget}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-[10px] text-[#E8DFC8] block uppercase tracking-wider">Saved Spots</span>
              <span className="text-sm font-black text-white">{bookmarks.length}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-[10px] text-[#E8DFC8] block uppercase tracking-wider">History Views</span>
              <span className="text-sm font-black text-white">{history.length}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <span className="text-[10px] text-[#E8DFC8] block uppercase tracking-wider">Campus Area</span>
              <span className="text-sm font-black text-white truncate block">{user.city}</span>
            </div>
          </div>
        </div>

        {/* Success message banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 text-emerald-800 text-xs px-4 py-2 border-b border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{saveSuccessMsg}</span>
          </div>
        )}

        {/* Error message banner */}
        {saveErrorMsg && (
          <div className="bg-red-50 text-red-800 text-xs px-4 py-2 border-b border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">{saveErrorMsg}</span>
          </div>
        )}

        {/* Edit Form Mode */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DFC8]">
              <h3 className="text-sm font-bold text-[#2A1810] font-brand">
                Edit & Update Student Profile
              </h3>
              <span className="text-[11px] text-[#8C6D53]">
                Changes persist directly into the PHP SQL Database
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2A1810] mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C6D53] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A1810] mb-1">College or University</label>
                <div className="relative">
                  <School className="w-4 h-4 text-[#8C6D53] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A1810] mb-1">City / Campus Hub</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#8C6D53] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A1810] mb-1">
                  Target Hangout Budget (₹ Per Head)
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-[#8C6D53] absolute left-3 top-2.5" />
                  <input
                    type="number"
                    min="50"
                    max="1000"
                    step="10"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2A1810] mb-1.5">
                Favorite Vibe Preferences (used for your recommendations)
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_VIBES.map((vibe) => {
                  const isSelected = favoriteVibes.includes(vibe);
                  return (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => handleToggleVibe(vibe)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                        isSelected
                          ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-2xs font-bold'
                          : 'bg-white text-[#5C4A3A] border-[#D9CDB8] hover:border-[#8C6D53]'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {vibe}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2A1810] mb-1">
                Bio & Campus Hangout Note
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your favorite group hangout order or study cafe tip..."
                className="w-full px-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
              />
            </div>

            {/* Password Change Option */}
            <div className="p-3.5 bg-[#FAF7F2] border border-[#E8DFC8] rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#C85A32]" />
                  <span className="text-xs font-bold text-[#2A1810]">Change Password</span>
                </div>
                {!showPasswordSection ? (
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(true)}
                    className="text-[11px] font-bold text-[#C85A32] hover:underline cursor-pointer"
                  >
                    + Set New Password
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-[11px] font-semibold text-[#8C6D53] hover:underline cursor-pointer"
                  >
                    Cancel password change
                  </button>
                )}
              </div>

              {showPasswordSection ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 pt-2 border-t border-[#E8DFC8]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2A1810] mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2A1810] mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                    />
                  </div>
                  <p className="text-[10px] text-[#8C6D53] col-span-full">
                    Password will be hashed securely and updated in the SQL Database table <code>users</code>.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-[#8C6D53]">
                  Keep your student or admin account credentials secure. Click above to change password.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setNewPassword('');
                  setConfirmPassword('');
                  setShowPasswordSection(false);
                  setSaveErrorMsg(null);
                }}
                className="px-4 py-2 text-xs font-bold text-[#5C4A3A] bg-[#EFE7DA] rounded-xl hover:bg-[#E5DBCB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-[#2A1810] hover:bg-[#C85A32] rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saveLoading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Normal View Mode with Tabs */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tab navigation */}
            <div className="flex border-b border-[#E8DFC8] bg-white shrink-0">
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'bookmarks'
                    ? 'border-[#C85A32] text-[#2A1810] bg-[#FAF8F5]'
                    : 'border-transparent text-[#8C6D53] hover:text-[#2A1810]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Saved Spots ({bookmarks.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'history'
                    ? 'border-[#C85A32] text-[#2A1810] bg-[#FAF8F5]'
                    : 'border-transparent text-[#8C6D53] hover:text-[#2A1810]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#8C6D53]" />
                <span>Activity History ({history.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('recommendations')}
                className={`flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'recommendations'
                    ? 'border-[#C85A32] text-[#2A1810] bg-[#FAF8F5]'
                    : 'border-transparent text-[#8C6D53] hover:text-[#2A1810]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Recommendations for You ({recommendations.length})</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: SAVED BOOKMARKS */}
              {activeTab === 'bookmarks' && (
                <div>
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-white rounded-2xl border border-[#E8DFC8]">
                      <Bookmark className="w-8 h-8 text-[#8C6D53] mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-bold text-[#2A1810]">No saved spots yet</p>
                      <p className="text-xs text-[#8C6D53] mt-1">
                        Bookmark spots while browsing the catalog to save them for your squad outings.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {bookmarks.map((spot) => (
                        <div
                          key={spot.id}
                          onClick={() => {
                            onClose();
                            onSelectSpot(spot);
                          }}
                          className="p-3.5 bg-white border border-[#E8DFC8] rounded-2xl hover:border-[#C85A32] hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-[#2A1810] group-hover:text-[#C85A32] transition-colors">
                                {spot.name}
                              </h4>
                              <button
                                onClick={(e) => handleRemoveBookmark(spot.id, e)}
                                className="text-[#8C6D53] hover:text-red-600 p-1 text-[11px] font-semibold"
                                title="Remove bookmark"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[11px] text-[#8C6D53] mt-0.5 line-clamp-1">
                              {spot.neighborhood} • {spot.distanceToCampus}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[#F2ECE1] text-[11px]">
                            <span className="font-extrabold text-[#2A1810]">
                              ~₹{spot.realPerPersonCost.avg}/head
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenQrGenerator(spot);
                                }}
                                className="p-1 hover:bg-[#EFE7DA] rounded-md text-[#8C6D53] hover:text-[#2A1810]"
                                title="Generate QR Code"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-[#C85A32] font-semibold text-[10px] group-hover:underline">
                                View Spot →
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ACTIVITY & BROWSING HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-[#2A1810] mb-2 flex items-center justify-between">
                    <span>Recent Actions & Viewed Spots</span>
                    <span className="text-[10px] font-normal text-[#8C6D53]">
                      Logged in SQL table <code>user_history</code>
                    </span>
                  </div>

                  {history.length === 0 ? (
                    <div className="text-center py-10 px-4 bg-white rounded-2xl border border-[#E8DFC8]">
                      <Clock className="w-8 h-8 text-[#8C6D53] mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-bold text-[#2A1810]">No activity recorded yet</p>
                      <p className="text-xs text-[#8C6D53] mt-1">
                        Spots you view, upvote, or save will appear in your live activity stream.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-white border border-[#E8DFC8] rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-[#EFE7DA] text-[#C85A32] flex items-center justify-center shrink-0">
                              {item.actionType === 'saved' ? (
                                <Bookmark className="w-3.5 h-3.5" />
                              ) : item.actionType === 'upvoted' ? (
                                <ThumbsUp className="w-3.5 h-3.5" />
                              ) : (
                                <Compass className="w-3.5 h-3.5" />
                              )}
                            </span>
                            <div>
                              <div className="font-bold text-[#2A1810] flex items-center gap-2">
                                <span>{item.spotName}</span>
                                <span className="text-[10px] font-semibold text-[#8C6D53] uppercase px-1.5 py-0.2 bg-[#FAF8F5] rounded border border-[#E8DFC8]">
                                  {item.actionType}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#8C6D53]">
                                {item.neighborhood || 'Campus'} • ~₹{item.costAvg}/head
                              </div>
                            </div>
                          </div>
                          <div className="text-[10px] text-[#8C6D53] text-right shrink-0">
                            {item.actionTime ? item.actionTime.replace('T', ' ').substring(0, 16) : 'Recently'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: PERSONALIZED RECOMMENDATIONS */}
              {activeTab === 'recommendations' && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#EFE7DA] border border-[#D9CDB8] rounded-xl text-xs text-[#5C4A3A]">
                    <span className="font-bold text-[#2A1810]">Engine Insight: </span>
                    Scored algorithmically for <strong>{user.name}</strong> based on target budget of <strong>₹{user.preferredBudget}</strong>, your vibe history ({user.favoriteVibes.join(', ')}), and Ahmedabad student scout audits.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {recommendations.map(({ spot, recommendationScore, primaryReason }) => (
                      <div
                        key={spot.id}
                        onClick={() => {
                          onClose();
                          onSelectSpot(spot);
                        }}
                        className="p-3.5 bg-white border border-[#E8DFC8] rounded-2xl hover:border-[#C85A32] hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-extrabold text-[#C85A32] bg-[#FDF0EA] px-2 py-0.5 rounded-md">
                              {recommendationScore}% Match
                            </span>
                            <span className="text-[10px] font-bold text-[#059669]">
                              ₹{spot.realPerPersonCost.avg} / head
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#2A1810] group-hover:text-[#C85A32] transition-colors">
                            {spot.name}
                          </h4>
                          <p className="text-[11px] text-[#8C6D53] mt-0.5 line-clamp-1">
                            {spot.neighborhood} • {spot.vibeCategory}
                          </p>
                          <div className="text-[10px] text-[#5C4A3A] mt-1.5 font-medium bg-[#FAF8F5] p-1.5 rounded-lg border border-[#F2ECE1]">
                            ★ {primaryReason}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#F2ECE1] text-[11px]">
                          <span className="text-[10px] text-[#8C6D53]">
                            Reality Score: {spot.reelRealityCheck.realityScore}%
                          </span>
                          <span className="text-[#C85A32] font-semibold text-[10px] group-hover:underline">
                            Explore →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
