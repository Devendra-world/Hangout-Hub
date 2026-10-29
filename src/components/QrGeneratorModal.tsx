/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Download, Copy, Check, MapPin, IndianRupee, Share2, Sparkles, Coffee, Globe, ExternalLink, CheckCircle2 } from 'lucide-react';
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

  // Hosting Domain configuration (defaulted to user's domain devendra.xo.je)
  const [websiteDomain, setWebsiteDomain] = useState<string>('https://devendra.xo.je');

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

  // Generate QR Code dynamically with 100% clean, error-correction level H and no visual obstructions
  useEffect(() => {
    if (!isOpen) return;

    let payload = '';

    if (mode === 'spot' && activeSpot) {
      if (spotLinkType === 'app') {
        const cleanBase = websiteDomain.trim().replace(/\/+$/, '') || 'https://devendra.xo.je';
        payload = `${cleanBase}/#spot-${activeSpot.id}`;
      } else {
        payload = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          activeSpot.name + ' ' + (activeSpot.neighborhood || '') + ' ' + (activeSpot.city || 'Ahmedabad')
        )}`;
      }
    } else if (mode === 'upi') {
      const cleanUpi = upiId.trim().replace(/\s+/g, '');
      const cleanName = payeeName.trim() || 'Student';
      const cleanAmt = splitAmount.trim() || '0';
      const cleanNote = splitNote.trim() || 'Hangout-Hub bill split';
      // NPCI Standard format: raw @ in pa ensures mobile cameras & UPI apps parse properly
      payload = `upi://pay?pa=${cleanUpi}&pn=${encodeURIComponent(cleanName)}&am=${cleanAmt}&cu=INR&tn=${encodeURIComponent(cleanNote)}`;
    } else {
      payload = customText.trim() || 'https://devendra.xo.je';
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
  }, [isOpen, mode, activeSpot, spotLinkType, websiteDomain, upiId, payeeName, splitAmount, splitNote, customText]);

  if (!isOpen) return null;

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    let filename = 'hangout-hub-qr.png';
    if (mode === 'spot' && activeSpot) {
      filename = `${activeSpot.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-qr.png`;
    } else if (mode === 'upi') {
      filename = `upi-split-${splitAmount}-qr.png`;
    }
    link.href = qrDataUrl;
    link.download = filename;
    link.click();
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(currentPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2A1810]/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] border border-[#E8DFC8] w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#2A1810] text-[#FAF7F2] p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="text-base font-bold font-brand text-[#FAF7F2]">
                Instant QR Code Generator
              </h2>
              <p className="text-xs text-[#E8DFC8]">
                Scannable QR codes for spots, directions & instant UPI student bill splits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#E8DFC8] hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-[#E8DFC8] bg-white text-xs font-bold shrink-0">
          <button
            onClick={() => setMode('spot')}
            className={`flex-1 py-3 px-3 text-center border-b-2 cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'spot'
                ? 'border-[#C85A32] text-[#2A1810] bg-[#FAF8F5]'
                : 'border-transparent text-[#8C6D53] hover:text-[#2A1810]'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Spot & Maps QR</span>
          </button>

          <button
            onClick={() => setMode('upi')}
            className={`flex-1 py-3 px-3 text-center border-b-2 cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'upi'
                ? 'border-[#C85A32] text-[#2A1810] bg-[#FAF8F5]'
                : 'border-transparent text-[#8C6D53] hover:text-[#2A1810]'
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5 text-[#059669]" />
            <span>Squad UPI Bill Split</span>
          </button>

          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-3 px-3 text-center border-b-2 cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'custom'
                ? 'border-[#C85A32] text-[#2A1810] bg-[#FAF8F5]'
                : 'border-transparent text-[#8C6D53] hover:text-[#2A1810]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>Custom / WhatsApp</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* QR Display Card: 100% Unobstructed Standard QR Code */}
          <div className="bg-white border border-[#E8DFC8] rounded-2xl p-5 flex flex-col items-center justify-center shadow-xs">
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-sm flex items-center justify-center">
                <img
                  src={qrDataUrl}
                  alt="Scannable QR Code"
                  className="w-52 h-52 sm:w-60 sm:h-60 object-contain block"
                />
              </div>
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-xs text-[#8C6D53]">
                Generating QR...
              </div>
            )}

            <div className="text-center mt-3 max-w-sm">
              <p className="text-xs font-bold text-[#2A1810]">
                {mode === 'spot' && activeSpot
                  ? activeSpot.name
                  : mode === 'upi'
                  ? `₹${splitAmount} UPI Payment (${payeeName})`
                  : customLabel || 'Custom Link'}
              </p>
              
              {/* Encoded payload preview */}
              <div className="mt-1 px-2.5 py-1 bg-stone-50 border border-stone-200 rounded-lg text-[10px] text-stone-600 font-mono break-all line-clamp-1">
                {currentPayload}
              </div>

              <p className="text-[11px] text-[#8C6D53] mt-1">
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
                onClick={handleDownloadQr}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2A1810] hover:bg-[#C85A32] rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPayload}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#2A1810] bg-[#EFE7DA] hover:bg-[#E5DBCB] rounded-xl border border-[#D9CDB8] transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Form Controls by Mode */}

          {/* MODE 1: SPOT QR CONTROLS */}
          {mode === 'spot' && (
            <div className="space-y-3 bg-[#EFE7DA]/50 p-4 rounded-2xl border border-[#E8DFC8]">
              <div>
                <label className="block text-xs font-bold text-[#2A1810] mb-1">
                  Choose Hangout Spot:
                </label>
                <select
                  value={selectedSpotId}
                  onChange={(e) => setSelectedSpotId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
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
                <label className="block text-xs font-bold text-[#2A1810] mb-1 flex items-center justify-between">
                  <span>Hosting Website URL:</span>
                  <span className="text-[10px] font-normal text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Configured for devendra.xo.je
                  </span>
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-[#8C6D53] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={websiteDomain}
                    onChange={(e) => setWebsiteDomain(e.target.value)}
                    placeholder="https://devendra.xo.je"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32] font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A1810] mb-1">
                  QR Code Action:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSpotLinkType('app')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      spotLinkType === 'app'
                        ? 'bg-[#2A1810] text-white border-[#2A1810]'
                        : 'bg-white text-[#5C4A3A] border-[#D9CDB8] hover:border-[#8C6D53]'
                    }`}
                  >
                    Open devendra.xo.je Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpotLinkType('maps')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      spotLinkType === 'maps'
                        ? 'bg-[#2A1810] text-white border-[#2A1810]'
                        : 'bg-white text-[#5C4A3A] border-[#D9CDB8] hover:border-[#8C6D53]'
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
            <div className="space-y-3 bg-[#EFE7DA]/50 p-4 rounded-2xl border border-[#E8DFC8]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2A1810] mb-1 flex items-center justify-between">
                    <span>Your UPI ID (VPA)</span>
                    {user && (
                      <span className="text-[10px] text-[#059669] font-bold">
                        Linked to {user.name}’s Profile
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. patadiyadevendra5@oksbi"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A1810] mb-1">
                    Payee Name
                  </label>
                  <input
                    type="text"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    placeholder="e.g. Devendra"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A1810] mb-1">
                    Split Amount (₹ per person)
                  </label>
                  <input
                    type="number"
                    value={splitAmount}
                    onChange={(e) => setSplitAmount(e.target.value)}
                    placeholder="180"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2A1810] mb-1">
                    Payment Note
                  </label>
                  <input
                    type="text"
                    value={splitNote}
                    onChange={(e) => setSplitNote(e.target.value)}
                    placeholder="Cafe Bill Split"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-[11px] text-[#059669] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NPCI Scannable: GPay, PhonePe, Paytm, BHIM</span>
                </div>

                <a
                  href={currentPayload}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#059669] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in UPI App</span>
                </a>
              </div>
            </div>
          )}

          {/* MODE 3: CUSTOM / WHATSAPP CONTROLS */}
          {mode === 'custom' && (
            <div className="space-y-3 bg-[#EFE7DA]/50 p-4 rounded-2xl border border-[#E8DFC8]">
              <div>
                <label className="block text-xs font-bold text-[#2A1810] mb-1">
                  Custom Label
                </label>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="e.g. CEPT Weekend Study Squad"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2A1810] mb-1">
                  Destination URL or WhatsApp Group Invite
                </label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                />
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
