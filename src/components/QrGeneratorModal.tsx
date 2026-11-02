/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Download, Copy, Check, IndianRupee, Share2, Coffee, Globe, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { HangoutSpot, UserProfile } from '../types/index.ts';

interface QrGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  spot?: HangoutSpot | null;
  spots?: HangoutSpot[];
  user?: UserProfile | null;
}

export const QrGeneratorModal: React.FC<QrGeneratorModalProps> = ({
  isOpen,
  onClose,
  spot: initialSpot,
  spots = [],
  user
}) => {
  const [mode, setMode] = useState<'spot' | 'upi' | 'custom'>('spot');
  const [selectedSpotId, setSelectedSpotId] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentPayload, setCurrentPayload] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Hosting Domain configuration (defaulted to user's domain https://hangout-hub.xo.je/)
  const [websiteDomain, setWebsiteDomain] = useState<string>('https://hangout-hub.xo.je/');

  // UPI Split QR states (initialized from active logged in user profile)
  const [upiId, setUpiId] = useState(user?.upiId || 'patadiyadevendra5@oksbi');
  const [payeeName, setPayeeName] = useState(user?.name || 'Devendra Patadiya');
  const [splitAmount, setSplitAmount] = useState('180');
  const [splitNote, setSplitNote] = useState('Hangout Cafe Bill Split');

  // Sync when user changes
  useEffect(() => {
    if (user) {
      if (user.upiId) setUpiId(user.upiId);
      if (user.name) setPayeeName(user.name);
    }
  }, [user]);

  // Custom QR states
  const [customText, setCustomText] = useState('https://chat.whatsapp.com/squad-hangout-hub');
  const [customLabel, setCustomLabel] = useState('Weekend Hangout Squad Invite');

  // Spot destination type
  const [spotLinkType, setSpotLinkType] = useState<'app' | 'maps'>('app');

  // Set default spot
  useEffect(() => {
    if (initialSpot) {
      setSelectedSpotId(initialSpot.id);
      setMode('spot');
    } else if (spots.length > 0 && !selectedSpotId) {
      setSelectedSpotId(spots[0].id);
    }
  }, [initialSpot, spots]);

  const activeSpot = spots.find((s) => s.id === selectedSpotId) || initialSpot || spots[0];

  const validationError = (() => {
    if (mode === 'upi') {
      const cleanUpi = upiId.trim().replace(/\s+/g, '');
      const amtNum = Number(splitAmount);
      if (!cleanUpi || !/^[\w.\-]+@[\w.\-]+$/.test(cleanUpi)) {
        return 'Please enter a valid UPI ID containing "@" (e.g. student@oksbi).';
      }
      if (!splitAmount.trim() || isNaN(amtNum) || amtNum <= 0 || amtNum > 100000) {
        return 'Split amount must be greater than ₹0 (up to ₹1,00,000).';
      }
    } else if (mode === 'custom') {
      if (!customText.trim()) {
        return 'Please enter a destination URL or invite link to generate a custom QR code.';
      }
    } else if (mode === 'spot' && spotLinkType === 'app' && !websiteDomain.trim()) {
      return 'Please enter a valid base website URL.';
    }
    return null;
  })();

  // Generate QR Code dynamically with 100% clean, error-correction level H and no visual obstructions
  useEffect(() => {
    if (!isOpen || validationError) {
      if (validationError) {
        setQrDataUrl('');
        setCurrentPayload('');
      }
      return;
    }

    let payload = '';

    if (mode === 'spot' && activeSpot) {
      if (spotLinkType === 'app') {
        const cleanBase = websiteDomain.trim().replace(/\/+$/, '');
        payload = `${cleanBase}/#spot-${activeSpot.id}`;
      } else {
        payload = `https://maps.google.com/?q=${encodeURIComponent(
          activeSpot.name + ' ' + (activeSpot.neighborhood || '') + ' ' + (activeSpot.city || 'Ahmedabad')
        )}`;
      }
    } else if (mode === 'upi') {
      const cleanUpi = upiId.trim().replace(/\s+/g, '');
      const cleanName = payeeName.trim() || 'Student';
      const cleanAmt = String(Number(splitAmount));
      const cleanNote = splitNote.trim() || 'Hangout-Hub bill split';
      // NPCI Standard format: raw @ in pa ensures mobile cameras & UPI apps parse properly
      payload = `upi://pay?pa=${cleanUpi}&pn=${encodeURIComponent(cleanName)}&am=${cleanAmt}&cu=INR&tn=${encodeURIComponent(cleanNote)}`;
    } else {
      payload = customText.trim();
    }

    setCurrentPayload(payload);

    // Standard high-contrast, perfectly scannable QR without center blockage
    QRCode.toDataURL(payload, {
      width: 400,
      margin: 3,
      color: {
        dark: '#111827',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.log('QR Generation error:', err));
  }, [isOpen, validationError, mode, activeSpot, spotLinkType, websiteDomain, upiId, payeeName, splitAmount, splitNote, customText]);

  if (!isOpen) return null;

  const handleDownloadQr = () => {
    if (!qrDataUrl || validationError) return;
    let filename = 'hangout-hub-qr.png';
    if (mode === 'spot' && activeSpot) {
      filename = `${activeSpot.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-qr.png`;
    } else if (mode === 'upi') {
      filename = `upi-split-rs-${splitAmount}-qr.png`;
    }
    try {
      const parts = qrDataUrl.split(',');
      const byteString = atob(parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/png' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      const link = document.createElement('a');
      link.href = qrDataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyPayload = async () => {
    if (!currentPayload || validationError) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentPayload);
      } else {
        throw new Error('fallback');
      }
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = currentPayload;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {}
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    'w-full px-3 py-2 text-xs bg-white dark:bg-[#1C1612] border border-[#D9CDB8] dark:border-[#3E3025] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32] dark:focus:ring-amber-500';

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F5] dark:bg-[#1C1612] text-stone-900 dark:text-stone-100 border border-[#E8DFC8] dark:border-[#362920] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        
        {/* Header */}
        <div className="bg-[#2A1810] dark:bg-[#15100C] text-[#FAF7F2] p-5 flex items-center justify-between shrink-0 border-b border-transparent dark:border-[#33271F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <h2 id="qr-modal-title" className="text-base font-bold font-brand text-[#FAF7F2]">
                Instant QR Code Generator
              </h2>
              <p className="text-xs text-[#E8DFC8]">
                Scannable QR codes for spots, directions & instant UPI student bill splits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close QR generator modal"
            className="p-1.5 text-[#E8DFC8] hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-[#E8DFC8] dark:border-[#33271F] bg-white dark:bg-[#241C17] text-xs font-bold shrink-0">
          <button
            onClick={() => setMode('spot')}
            className={`flex-1 py-3 px-3 text-center border-b-2 cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'spot'
                ? 'border-[#C85A32] dark:border-amber-500 text-[#2A1810] dark:text-amber-300 bg-[#FAF8F5] dark:bg-[#1C1612]'
                : 'border-transparent text-[#8C6D53] dark:text-stone-400 hover:text-[#2A1810] dark:hover:text-stone-100'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-[#C85A32] dark:text-amber-400" />
            <span>Spot & Maps QR</span>
          </button>

          <button
            onClick={() => setMode('upi')}
            className={`flex-1 py-3 px-3 text-center border-b-2 cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'upi'
                ? 'border-[#C85A32] dark:border-amber-500 text-[#2A1810] dark:text-amber-300 bg-[#FAF8F5] dark:bg-[#1C1612]'
                : 'border-transparent text-[#8C6D53] dark:text-stone-400 hover:text-[#2A1810] dark:hover:text-stone-100'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5 text-[#059669] dark:text-emerald-400" />
            <span>Squad UPI Bill Split</span>
          </button>

          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-3 px-3 text-center border-b-2 cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'custom'
                ? 'border-[#C85A32] dark:border-amber-500 text-[#2A1810] dark:text-amber-300 bg-[#FAF8F5] dark:bg-[#1C1612]'
                : 'border-transparent text-[#8C6D53] dark:text-stone-400 hover:text-[#2A1810] dark:hover:text-stone-100'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-[#7C3AED] dark:text-purple-400" />
            <span>Custom / WhatsApp</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {validationError && (
            <div role="alert" className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 rounded-xl text-xs font-semibold text-red-700 dark:text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* QR Display Card: 100% Unobstructed Standard QR Code */}
          <div className="bg-white dark:bg-[#251D17] border border-[#E8DFC8] dark:border-[#3A2D23] rounded-2xl p-5 flex flex-col items-center justify-center shadow-xs">
            {validationError ? (
              <div className="w-52 h-52 flex items-center justify-center text-center px-4 text-xs text-red-600 dark:text-red-300 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-dashed border-red-200 dark:border-red-800/50">
                Fix the input above to generate a valid scannable QR code.
              </div>
            ) : qrDataUrl ? (
              <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-sm flex items-center justify-center">
                <img
                  src={qrDataUrl}
                  alt="Scannable QR Code"
                  className="w-52 h-52 sm:w-60 sm:h-60 object-contain block"
                />
              </div>
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-xs text-[#8C6D53] dark:text-stone-400">
                Generating QR...
              </div>
            )}

            <div className="text-center mt-3 max-w-sm">
              <p className="text-xs font-bold text-[#2A1810] dark:text-stone-100">
                {mode === 'spot' && activeSpot
                  ? activeSpot.name
                  : mode === 'upi'
                  ? `₹${splitAmount || '0'} UPI Payment (${payeeName || 'Student'})`
                  : customLabel || 'Custom Link'}
              </p>
              
              {/* Encoded payload preview */}
              <div className="mt-1 px-2.5 py-1 bg-stone-50 dark:bg-[#1B1410] border border-stone-200 dark:border-[#33271F] rounded-lg text-[10px] text-stone-600 dark:text-stone-300 font-mono break-all line-clamp-1">
                {currentPayload || 'Awaiting valid input...'}
              </div>

              <p className="text-[11px] text-[#8C6D53] dark:text-stone-400 mt-1">
                {mode === 'spot'
                  ? 'Scan with any phone camera to open spot details directly'
                  : mode === 'upi'
                  ? 'Scan with Google Pay, PhonePe, or Paytm to pay instantly'
                  : 'Scan with smartphone camera to open link'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                disabled={Boolean(validationError) || !qrDataUrl}
                onClick={handleDownloadQr}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2A1810] dark:bg-amber-700 hover:bg-[#C85A32] dark:hover:bg-amber-600 disabled:opacity-45 disabled:cursor-not-allowed rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>

              <button
                type="button"
                disabled={Boolean(validationError) || !currentPayload}
                onClick={handleCopyPayload}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#2A1810] dark:text-stone-100 bg-[#EFE7DA] dark:bg-[#31261E] hover:bg-[#E5DBCB] dark:hover:bg-[#3C2F25] disabled:opacity-45 disabled:cursor-not-allowed rounded-xl border border-[#D9CDB8] dark:border-[#47372B] transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Form Controls by Mode */}

          {/* MODE 1: SPOT QR CONTROLS */}
          {mode === 'spot' && (
            <div className="space-y-3 bg-[#EFE7DA]/50 dark:bg-[#251D17] p-4 rounded-2xl border border-[#E8DFC8] dark:border-[#3A2D23]">
              <div>
                <label className="block text-xs font-bold text-[#2A1810] dark:text-stone-200 mb-1">
                  Choose Hangout Spot:
                </label>
                <select
                  value={selectedSpotId}
                  onChange={(e) => setSelectedSpotId(e.target.value)}
                  className={inputClass}
                >
                  {spots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.neighborhood} • ~₹{s.realPerPersonCost.avg})
                    </option>
                  ))}
                </select>
              </div>

              {/* Website Hosting Base URL */}
              <div>
                <label className="block text-xs font-bold text-[#2A1810] dark:text-stone-200 mb-1 flex items-center justify-between">
                  <span>Hosting Website URL:</span>
                  <span className="text-[10px] font-normal text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    Configured for hangout-hub.xo.je
                  </span>
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-[#8C6D53] dark:text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={websiteDomain}
                    onChange={(e) => setWebsiteDomain(e.target.value)}
                    placeholder="https://hangout-hub.xo.je/"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-[#1C1612] border border-[#D9CDB8] dark:border-[#3E3025] text-stone-900 dark:text-stone-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A1810] dark:text-stone-200 mb-1">
                  QR Code Action:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpotLinkType('app')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      spotLinkType === 'app'
                        ? 'bg-[#2A1810] dark:bg-amber-700 text-white border-[#2A1810] dark:border-amber-700'
                        : 'bg-white dark:bg-[#1C1612] text-[#5C4A3A] dark:text-stone-300 border-[#D9CDB8] dark:border-[#3E3025] hover:border-[#8C6D53]'
                    }`}
                  >
                    Open hangout-hub.xo.je Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpotLinkType('maps')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      spotLinkType === 'maps'
                        ? 'bg-[#2A1810] dark:bg-amber-700 text-white border-[#2A1810] dark:border-amber-700'
                        : 'bg-white dark:bg-[#1C1612] text-[#5C4A3A] dark:text-stone-300 border-[#D9CDB8] dark:border-[#3E3025] hover:border-[#8C6D53]'
                    }`}
                  >
                    Google Maps Directions
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: UPI SPLIT CONTROLS */}
          {mode === 'upi' && (
            <div className="space-y-3 bg-[#EFE7DA]/50 dark:bg-[#251D17] p-4 rounded-2xl border border-[#E8DFC8] dark:border-[#3A2D23]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2A1810] dark:text-stone-200 mb-1 flex items-center justify-between">
                    <span>Your UPI ID (VPA)</span>
                    {user && (
                      <span className="text-[10px] text-[#059669] dark:text-emerald-400 font-bold">
                        Linked to {user.name}’s Profile
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. patadiyadevendra5@oksbi"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A1810] dark:text-stone-200 mb-1">
                    Payee Name
                  </label>
                  <input
                    type="text"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    placeholder="e.g. Devendra"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A1810] dark:text-stone-200 mb-1">
                    Split Amount (₹ per person)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={splitAmount}
                    onChange={(e) => setSplitAmount(e.target.value)}
                    placeholder="180"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A1810] dark:text-stone-200 mb-1">
                    Payment Note
                  </label>
                  <input
                    type="text"
                    value={splitNote}
                    onChange={(e) => setSplitNote(e.target.value)}
                    placeholder="Cafe Bill Split"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-[11px] text-[#059669] dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>NPCI Scannable: GPay, PhonePe, Paytm, BHIM</span>
                </div>

                <a
                  href={currentPayload}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#059669] dark:text-emerald-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in UPI App</span>
                </a>
              </div>
            </div>
          )}

          {/* MODE 3: CUSTOM / WHATSAPP CONTROLS */}
          {mode === 'custom' && (
            <div className="space-y-3 bg-[#EFE7DA]/50 dark:bg-[#251D17] p-4 rounded-2xl border border-[#E8DFC8] dark:border-[#3A2D23]">
              <div>
                <label className="block text-xs font-bold text-[#2A1810] dark:text-stone-200 mb-1">
                  Custom Label
                </label>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g. CEPT Weekend Study Squad"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A1810] dark:text-stone-200 mb-1">
                  Destination URL or WhatsApp Group Invite
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className={inputClass}
                />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
