/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Plus, Trash2, Check, Share2, Sparkles, MapPin } from 'lucide-react';

interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const GroupBillSplitter: React.FC = () => {
  const [peopleCount, setPeopleCount] = useState(6);
  const [includeGst, setIncludeGst] = useState(true);
  const [serviceFeePercent, setServiceFeePercent] = useState(0);
  const [copied, setCopied] = useState(false);

  // Default Ahmedabad combo
  const [items, setItems] = useState<BillItem[]>([
    { id: '1', name: 'HL Frothy Thick Cold Coffees', price: 55, quantity: 6 },
    { id: '2', name: 'Grilled Cheese Chilli Puffs', price: 40, quantity: 6 },
    { id: '3', name: 'Double Cheese Butter Maggi Bowls', price: 75, quantity: 2 }
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice) return;
    const item: BillItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      price: parseFloat(newItemPrice) || 0,
      quantity: parseInt(newItemQty, 10) || 1
    };
    setItems((prev) => [...prev, item]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemQty('1');
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Ahmedabad student presets
  const applyPreset = (presetName: string) => {
    if (presetName === 'hl') {
      setItems([
        { id: '1', name: 'HL Frothy Cold Coffees', price: 55, quantity: peopleCount },
        { id: '2', name: 'Grilled Cheese Chilli Puffs', price: 40, quantity: peopleCount },
        { id: '3', name: 'Double Cheese Butter Maggi', price: 75, quantity: Math.ceil(peopleCount / 3) }
      ]);
    } else if (presetName === 'gufa') {
      setItems([
        { id: '1', name: 'Ginger Mint Iced Teas / Filter Coffee', price: 60, quantity: peopleCount },
        { id: '2', name: 'Thin Crust Margherita Slices', price: 80, quantity: peopleCount },
        { id: '3', name: 'Crunchy Samosa Plates with Chutney', price: 50, quantity: Math.ceil(peopleCount / 2) }
      ]);
    } else if (presetName === 'sbr') {
      setItems([
        { id: '1', name: '18" Large Wood-Fired Group Pizza', price: 650, quantity: Math.ceil(peopleCount / 4) },
        { id: '2', name: 'Giant Loaded Truffle Fries Platter', price: 280, quantity: 2 },
        { id: '3', name: 'Artisan Cold Brews / Sparklers', price: 180, quantity: peopleCount }
      ]);
    } else if (presetName === 'games') {
      setItems([
        { id: '1', name: 'Unlocked Table Gaming Passes (Mon-Thu)', price: 60, quantity: peopleCount },
        { id: '2', name: 'Loaded Queso Nachos Bowls', price: 210, quantity: 2 },
        { id: '3', name: 'Chocolate Thick Shakes', price: 140, quantity: peopleCount }
      ]);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gstAmount = includeGst ? Math.round(subtotal * 0.05) : 0;
  const serviceAmount = Math.round(subtotal * (serviceFeePercent / 100));
  const grandTotal = subtotal + gstAmount + serviceAmount;
  const rawPerPerson = peopleCount > 0 ? grandTotal / peopleCount : 0;
  const roundedPerPerson = Math.ceil(rawPerPerson);

  const copyBreakdown = () => {
    const text = `☕ *Amdavad Squad Bill Split (via Hangout-Hub)*\n` +
      `👥 Squad Size: ${peopleCount} friends\n` +
      `------------------------------------\n` +
      items.map((i) => `• ${i.name} (x${i.quantity}): ₹${i.price * i.quantity}`).join('\n') +
      `\n------------------------------------\n` +
      `Subtotal: ₹${subtotal}\n` +
      (includeGst ? `GST (5%): ₹${gstAmount}\n` : '') +
      (serviceFeePercent > 0 ? `Service (${serviceFeePercent}%): ₹${serviceAmount}\n` : '') +
      `*Grand Total: ₹${grandTotal}*\n` +
      `👉 *Per Person Share: ₹${roundedPerPerson}* (GPay/PhonePe clean split)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center justify-center gap-2">
          <span>Student Utility</span>
          <span aria-hidden="true">·</span>
          <span>Zero Awkward Math</span>
        </div>
        <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Ahmedabad Squad Bill Splitter & Calculator
        </h2>
        <p className="text-xs sm:text-sm text-stone-600">
          Calculate fair per-head shares with exact restaurant GST (5%) and round-off to the nearest rupee for instant Google Pay and PhonePe requests.
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: People & Items (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs space-y-6">
          
          {/* People Count Slider */}
          <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-700" />
                Number of Friends Splitting:
              </span>
              <span className="text-xl font-extrabold text-stone-900 tabular-nums">
                {peopleCount} <span className="text-xs font-normal text-stone-500">friends</span>
              </span>
            </div>

            <input
              type="range"
              min="2"
              max="20"
              value={peopleCount}
              onChange={(e) => setPeopleCount(parseInt(e.target.value, 10))}
              className="w-full accent-amber-600 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-stone-400">
              <span>2 (Pair)</span>
              <span>6 (Squad)</span>
              <span>12 (Batch)</span>
              <span>20 (Mass Meetup)</span>
            </div>
          </div>

          {/* Quick Preset Buttons for Ahmedabad */}
          <div className="space-y-2 text-xs">
            <span className="text-stone-500 font-bold">Load Popular Amdavad Student Combos:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPreset('hl')}
                className="px-3 py-1.5 bg-amber-50 text-amber-950 border border-amber-200 rounded-xl font-bold hover:bg-amber-100 transition-colors cursor-pointer"
              >
                ☕ HL Cold Coffee & Puffs (~₹95)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('gufa')}
                className="px-3 py-1.5 bg-stone-100 text-stone-900 border border-stone-300 rounded-xl font-bold hover:bg-stone-200 transition-colors cursor-pointer"
              >
                🏛️ Zen Gufa Chai & Pizza (~₹160)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('sbr')}
                className="px-3 py-1.5 bg-red-50 text-red-950 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors cursor-pointer"
              >
                🍕 SBR Courtyard Share (~₹320)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('games')}
                className="px-3 py-1.5 bg-purple-50 text-purple-950 border border-purple-200 rounded-xl font-bold hover:bg-purple-100 transition-colors cursor-pointer"
              >
                🎲 Unlocked Game Pass (~₹240)
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="font-bold text-stone-900">Ordered Food & Drinks ({items.length})</span>
              <span className="text-stone-400 tabular-nums">Subtotal: ₹{subtotal}</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-stone-800">{item.name}</div>
                    <div className="text-[11px] text-stone-500 tabular-nums">
                      ₹{item.price} each × {item.quantity}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-stone-900 tabular-nums">
                      ₹{item.price * item.quantity}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Custom Item Form */}
          <form onSubmit={addItem} className="pt-2 border-t border-stone-100 space-y-2 text-xs">
            <div className="font-bold text-stone-700">Add custom food/drinks:</div>
            <div className="grid grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Item name (e.g. Bun Maska, Frappe)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="col-span-6 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="col-span-3 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
              />
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                className="col-span-2 px-2 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 text-center"
              />
              <button
                type="submit"
                className="col-span-1 p-2 bg-stone-900 text-white rounded-xl hover:bg-stone-800 flex items-center justify-center cursor-pointer"
                title="Add item"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>

        {/* Right Column: Calculations & WhatsApp Copy (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-stone-800 space-y-6">
            
            <div className="space-y-1 border-b border-stone-800 pb-4">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Fair Share Per Person
              </span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-4xl font-extrabold text-amber-300 tabular-nums">
                  ₹{roundedPerPerson}
                </span>
                <span className="text-sm text-stone-400">per friend</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Split evenly among {peopleCount} people. Rounded up to nearest ₹1 for clean Google Pay / PhonePe transfers.
              </p>
            </div>

            {/* Bill Summary Table */}
            <div className="space-y-2.5 text-xs text-stone-300">
              <div className="flex justify-between tabular-nums">
                <span className="text-stone-400">Food & Drinks Subtotal:</span>
                <span className="font-semibold text-white">₹{subtotal}</span>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={includeGst}
                    onChange={(e) => setIncludeGst(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-800 text-amber-500 focus:ring-amber-400 w-3.5 h-3.5"
                  />
                  <span>Restaurant GST (5%):</span>
                </label>
                <span className="font-semibold text-white tabular-nums">₹{gstAmount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400">Service Fee / Tip:</span>
                  <select
                    value={serviceFeePercent}
                    onChange={(e) => setServiceFeePercent(parseInt(e.target.value, 10))}
                    className="bg-stone-800 border border-stone-700 text-white text-[11px] rounded-lg px-2 py-0.5"
                  >
                    <option value="0">0% (None)</option>
                    <option value="5">5% (Tip)</option>
                    <option value="10">10% (Levied)</option>
                  </select>
                </div>
                <span className="font-semibold text-white tabular-nums">₹{serviceAmount}</span>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-between text-sm font-bold text-white tabular-nums">
                <span>Grand Total to Pay:</span>
                <span className="text-amber-400">₹{grandTotal}</span>
              </div>
            </div>

            {/* Copy button */}
            <div className="pt-2">
              <button
                onClick={copyBreakdown}
                className="w-full py-3 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-900" />
                    <span className="text-emerald-950 font-bold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copy Breakdown for WhatsApp Group</span>
                  </>
                )}
              </button>
            </div>

          </div>

          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              Pro-Tip for Ahmedabad Group Outings:
            </span>
            <p className="text-[11px] leading-relaxed text-amber-900">
              Sharing large 18" pizzas at Roastery SBR or Mocha cabanas, or group platters at Zen Cafe drops the cost per person by over 40% compared to ordering individual dishes!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
