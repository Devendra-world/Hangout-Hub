/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

/**
 * Schema-aware editor for the Admin "Edit / Add row" form.
 * Pehle har column ek plain text box tha (0/1, JSON text...).
 * Ab har column ke hisaab se dropdown, Yes/No toggle, number box, tag chips,
 * color picker etc. milta hai. Data wahi DB format me save hota hai (0/1, JSON string).
 */

// ---------- Dropdown options (yahan se options edit/add kar sakte ho) ----------
const VIBES = ['Budget Bite & Chill', 'Study & Projects', 'Aesthetic Hangout', 'Board Games & Fun', 'Late Night Hangout'];
const CITIES = ['Ahmedabad', 'Gandhinagar', 'Delhi NCR', 'Bengaluru', 'Mumbai', 'Pune'];
const WIFI = ['Fast & Reliable', 'Decent for Browsing', 'Spotty', 'None'];
const POWER = ['Every Table', 'Select Wall Tables', 'Few / Request Only', 'None'];
const CLOSING_TIMES = [
  '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM', '12:00 AM', '12:30 AM', '1:00 AM', '2:00 AM', '24 Hours'
];
const STATUSES = ['approved', 'pending', 'rejected'];
const ROLES = ['student', 'admin'];
const ACTIONS = ['viewed', 'saved', 'unsaved', 'upvoted'];
const PATTERNS = ['warm', 'botanical', 'minimal', 'geometric', 'terrazzo'];
const ICONS = ['Coffee', 'Laptop', 'Sparkles', 'Gamepad2', 'Users'];

type FieldDef =
  | { type: 'text' | 'textarea' | 'url' | 'email' | 'password' | 'readonly'; label: string; hint?: string }
  | { type: 'number'; label: string; min?: number; max?: number; unit?: string; hint?: string }
  | { type: 'select'; label: string; options: string[]; hint?: string }
  | { type: 'combo'; label: string; options: string[]; hint?: string } // dropdown + apna value type kar sakte ho
  | { type: 'toggle'; label: string; hint?: string }
  | { type: 'tags'; label: string; hint?: string }
  | { type: 'vibes'; label: string; hint?: string }
  | { type: 'theme'; label: string; hint?: string };

// ---------- Har column ka type (column name -> kaisa input) ----------
const FIELDS: Record<string, FieldDef> = {
  // spots: basic
  name: { type: 'text', label: 'Name' },
  tagline: { type: 'text', label: 'Tagline' },
  city: { type: 'combo', label: 'City', options: CITIES, hint: 'List se chuno ya nayi city type karo' },
  campus_name: { type: 'text', label: 'Campus name' },
  neighborhood: { type: 'text', label: 'Neighborhood / Area' },
  distance_to_campus: { type: 'text', label: 'Distance to campus' },
  vibe_category: { type: 'select', label: 'Vibe category', options: VIBES },
  status: { type: 'select', label: 'Status', options: STATUSES, hint: 'approved = live site pe dikhega' },
  // spots: cost
  cost_min: { type: 'number', label: 'Min cost per person', unit: '₹', min: 0 },
  cost_max: { type: 'number', label: 'Max cost per person', unit: '₹', min: 0 },
  cost_avg: { type: 'number', label: 'Average cost per person', unit: '₹', min: 0 },
  popular_order_example: { type: 'text', label: 'Popular order example' },
  official_claim_cost: { type: 'text', label: 'Official claimed cost' },
  // spots: seating
  max_group_size: { type: 'number', label: 'Max group size', min: 1, max: 100 },
  booth_count: { type: 'number', label: 'Booth count', min: 0 },
  push_together_allowed: { type: 'toggle', label: 'Tables can be pushed together?' },
  reservation_needed: { type: 'toggle', label: 'Reservation needed?' },
  seating_description: { type: 'textarea', label: 'Seating description' },
  reservation_tip: { type: 'text', label: 'Reservation tip' },
  // spots: amenities
  wifi_speed_mbps: { type: 'number', label: 'WiFi speed', unit: 'Mbps', min: 0 },
  wifi_reliability: { type: 'select', label: 'WiFi reliability', options: WIFI },
  power_outlets: { type: 'select', label: 'Power outlets', options: POWER },
  noise_decibels: { type: 'number', label: 'Noise level', unit: 'dB', min: 0, max: 130 },
  noise_description: { type: 'text', label: 'Noise description' },
  air_conditioned: { type: 'toggle', label: 'Air conditioned?' },
  board_games_available: { type: 'toggle', label: 'Board games available?' },
  outside_cake_allowed: { type: 'toggle', label: 'Outside cake allowed?' },
  student_discount_available: { type: 'toggle', label: 'Student discount?' },
  discount_note: { type: 'text', label: 'Discount note' },
  open_late_night: { type: 'toggle', label: 'Open late night?' },
  closing_time: { type: 'combo', label: 'Closing time', options: CLOSING_TIMES },
  // spots: reel
  has_reel: { type: 'toggle', label: 'Has Instagram reel?' },
  reel_url: { type: 'url', label: 'Reel URL' },
  reel_creator: { type: 'text', label: 'Reel creator (@handle)' },
  reel_hype_claim: { type: 'textarea', label: 'Reel hype claim' },
  ground_reality_truth: { type: 'textarea', label: 'Ground reality truth' },
  reality_score: { type: 'number', label: 'Reality score', unit: '/ 100', min: 0, max: 100 },
  // spots: scout
  scout_name: { type: 'text', label: 'Scout name' },
  scout_college: { type: 'text', label: 'Scout college' },
  scout_notes: { type: 'textarea', label: 'Scout notes' },
  verified_date: { type: 'text', label: 'Verified date' },
  upvotes: { type: 'number', label: 'Upvotes', min: 0 },
  submitted_by: { type: 'readonly', label: 'Submitted by (user id)' },
  tags_json: { type: 'tags', label: 'Tags', hint: 'Type karo aur Enter dabao' },
  visual_theme_json: { type: 'theme', label: 'Card look (color, pattern, icon)' },

  // users
  email: { type: 'email', label: 'Email' },
  password: { type: 'password', label: 'Password', hint: 'Edit me khali chhodo to purana password rahega' },
  role: { type: 'select', label: 'Role', options: ROLES },
  college: { type: 'text', label: 'College' },
  preferred_budget: { type: 'number', label: 'Preferred budget', unit: '₹', min: 0 },
  favorite_vibes_json: { type: 'vibes', label: 'Favorite vibes' },
  bio: { type: 'textarea', label: 'Bio' },
  avatar_color: { type: 'text', label: 'Avatar color (hex)' },
  upi_id: { type: 'text', label: 'UPI ID' },

  // survey_responses
  student_name: { type: 'text', label: 'Student name' },
  college_or_campus: { type: 'text', label: 'College / Campus' },
  year_of_study: { type: 'text', label: 'Year of study' },
  monthly_hangout_budget: { type: 'text', label: 'Monthly hangout budget' },
  primary_frustration: { type: 'text', label: 'Primary frustration' },
  worst_experience_with_apps: { type: 'textarea', label: 'Worst experience with apps' },
  ideal_spot_priorities_json: { type: 'tags', label: 'Ideal spot priorities', hint: 'Type karo aur Enter dabao' },
  max_acceptable_cost_per_head: { type: 'number', label: 'Max acceptable cost per head', unit: '₹', min: 0 },
  average_group_size: { type: 'number', label: 'Average group size', min: 1 },

  // partnership_proposals
  cafe_name: { type: 'text', label: 'Cafe name' },
  owner_name: { type: 'text', label: 'Owner name' },
  contact_email: { type: 'email', label: 'Contact email' },
  contact_phone: { type: 'text', label: 'Contact phone' },
  address: { type: 'textarea', label: 'Address' },
  proposed_per_person_cost: { type: 'number', label: 'Proposed cost per person', unit: '₹', min: 0 },
  group_capacity: { type: 'number', label: 'Group capacity', min: 1 },
  offered_student_discount: { type: 'text', label: 'Offered student discount' },
  has_fast_wifi: { type: 'toggle', label: 'Has fast WiFi?' },
  notes: { type: 'textarea', label: 'Notes' },

  // user_history
  user_id: { type: 'text', label: 'User ID' },
  spot_id: { type: 'text', label: 'Spot ID' },
  action_type: { type: 'select', label: 'Action', options: ACTIONS },
  metadata_json: { type: 'readonly', label: 'Metadata (JSON)' },

  // read-only system columns
  created_at: { type: 'readonly', label: 'Created at' },
  updated_at: { type: 'readonly', label: 'Updated at' },
  submitted_at: { type: 'readonly', label: 'Submitted at' }
};

// Spots form ko sections me dikhane ke liye
const SPOT_SECTIONS: { title: string; fields: string[] }[] = [
  { title: '📍 Basic info', fields: ['name', 'tagline', 'city', 'campus_name', 'neighborhood', 'distance_to_campus', 'vibe_category', 'status'] },
  { title: '💰 Cost', fields: ['cost_min', 'cost_max', 'cost_avg', 'popular_order_example', 'official_claim_cost'] },
  { title: '🪑 Group seating', fields: ['max_group_size', 'booth_count', 'push_together_allowed', 'reservation_needed', 'seating_description', 'reservation_tip'] },
  { title: '📶 Amenities', fields: ['wifi_speed_mbps', 'wifi_reliability', 'power_outlets', 'noise_decibels', 'noise_description', 'air_conditioned', 'board_games_available', 'outside_cake_allowed', 'student_discount_available', 'discount_note', 'open_late_night', 'closing_time'] },
  { title: '🎬 Reel vs reality', fields: ['has_reel', 'reel_url', 'reel_creator', 'reel_hype_claim', 'ground_reality_truth', 'reality_score'] },
  { title: '🧑‍🎓 Scout audit', fields: ['scout_name', 'scout_college', 'scout_notes', 'verified_date', 'upvotes', 'submitted_by'] },
  { title: '🏷️ Tags & card look', fields: ['tags_json', 'visual_theme_json'] }
];

// Ye columns form me dikhane hi nahi (sensitive)
const HIDDEN = new Set(['password_hash']);

// ---------- Helpers ----------
const isOn = (v: any) => v === true || v === 1 || v === '1' || v === 'true';

const parseList = (v: any): string[] => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v !== 'string' || !v.trim()) return [];
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p.map(String) : [];
  } catch {
    return [];
  }
};

const parseTheme = (v: any) => {
  let obj: any = {};
  if (v && typeof v === 'object') obj = v;
  else if (typeof v === 'string' && v.trim()) {
    try { obj = JSON.parse(v) || {}; } catch { obj = {}; }
  }
  return {
    primaryColor: /^#[0-9a-fA-F]{6}$/.test(obj.primaryColor || '') ? obj.primaryColor : '#78350F',
    patternType: obj.patternType || 'warm',
    heroIconName: obj.heroIconName || 'Coffee'
  };
};

// ---------- Styles ----------
const INPUT_CLS =
  'w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#1C1612] text-[#2A1810] dark:text-stone-100 border border-[#D9CDB8] dark:border-[#3E3025] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32] dark:focus:ring-amber-500';
const READONLY_CLS =
  'w-full px-2.5 py-1.5 text-xs bg-[#EFE7DA]/50 dark:bg-[#17120F] border border-[#D9CDB8] dark:border-[#33271F] rounded-xl text-gray-500 dark:text-stone-500 cursor-not-allowed';
const LABEL_CLS = 'block text-[11px] font-bold text-[#2A1810] dark:text-stone-200 mb-1';
const HINT_CLS = 'mt-1 text-[10px] text-[#8C6D53] dark:text-stone-500';

// ---------- Single field ----------
interface FieldProps {
  name: string;
  value: any;
  onChange: (v: any) => void;
  isNewRow: boolean;
  extraCities?: string[];
}

const Field: React.FC<FieldProps> = ({ name, value, onChange, isNewRow, extraCities = [] }) => {
  const [tagDraft, setTagDraft] = useState('');
  const def: FieldDef = FIELDS[name] ?? { type: 'text', label: name };
  const isPrimaryKey = name === 'id' && !isNewRow;
  const label = isPrimaryKey ? 'id (Primary Key)' : def.label;
  const wide = ['textarea', 'tags', 'vibes', 'theme'].includes(def.type);
  const listId = `dl-${name}`;
  const safeValue = value === undefined || value === null ? '' : value;

  let control: React.ReactNode;

  if (isPrimaryKey || def.type === 'readonly') {
    control = <input type="text" disabled value={String(safeValue)} className={READONLY_CLS} />;
  } else if (def.type === 'select') {
    // Agar DB me aisi value hai jo list me nahi, usse bhi dikhao (data lose na ho)
    const opts = safeValue !== '' && !def.options.includes(String(safeValue)) ? [String(safeValue), ...def.options] : def.options;
    control = (
      <select value={String(safeValue)} onChange={(e) => onChange(e.target.value)} className={INPUT_CLS}>
        {safeValue === '' && <option value="">— Select —</option>}
        {opts.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  } else if (def.type === 'combo') {
    const opts = name === 'city' ? Array.from(new Set([...def.options, ...extraCities])) : def.options;
    control = (
      <>
        <input list={listId} type="text" value={String(safeValue)} onChange={(e) => onChange(e.target.value)} className={INPUT_CLS} placeholder="Select ya type karo" />
        <datalist id={listId}>
          {opts.map((o) => <option key={o} value={o} />)}
        </datalist>
      </>
    );
  } else if (def.type === 'number') {
    control = (
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={def.min}
          max={def.max}
          value={safeValue}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className={INPUT_CLS}
        />
        {def.unit && <span className="text-[11px] font-semibold text-[#8C6D53] dark:text-stone-400 whitespace-nowrap">{def.unit}</span>}
      </div>
    );
  } else if (def.type === 'toggle') {
    const hasValue = value !== undefined && value !== null && value !== '';
    const on = isOn(value);
    const base = 'px-4 py-1.5 text-xs font-bold transition-colors cursor-pointer';
    const active = 'bg-[#2A1810] dark:bg-amber-600 text-white';
    const idle = 'bg-white dark:bg-[#1C1612] text-[#5C4A3A] dark:text-stone-300 hover:bg-[#EFE7DA] dark:hover:bg-[#31261E]';
    control = (
      <div role="group" aria-label={label} className="inline-flex rounded-xl overflow-hidden border border-[#D9CDB8] dark:border-[#3E3025]">
        <button type="button" onClick={() => onChange(1)} className={`${base} ${hasValue && on ? active : idle}`}>Yes</button>
        <button type="button" onClick={() => onChange(0)} className={`${base} ${hasValue && !on ? active : idle}`}>No</button>
      </div>
    );
  } else if (def.type === 'textarea') {
    control = <textarea rows={3} value={String(safeValue)} onChange={(e) => onChange(e.target.value)} className={INPUT_CLS} />;
  } else if (def.type === 'tags') {
    const tags = parseList(value);
    const addTag = () => {
      const t = tagDraft.trim();
      if (t && !tags.includes(t)) onChange(JSON.stringify([...tags, t]));
      setTagDraft('');
    };
    control = (
      <div>
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[#EFE7DA] dark:bg-[#31261E] text-[#2A1810] dark:text-stone-100">
              {t}
              <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(JSON.stringify(tags.filter((x) => x !== t)))} className="text-[#C85A32] dark:text-amber-400 cursor-pointer">✕</button>
            </span>
          ))}
          {tags.length === 0 && <span className="text-[11px] text-[#8C6D53] dark:text-stone-500">Koi tag nahi</span>}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addTag(); }
            }}
            placeholder="Naya tag likho, Enter dabao"
            className={INPUT_CLS}
          />
          <button type="button" onClick={addTag} className="px-3 text-xs font-bold text-white bg-[#2A1810] dark:bg-amber-600 rounded-xl cursor-pointer">Add</button>
        </div>
      </div>
    );
  } else if (def.type === 'vibes') {
    const chosen = parseList(value);
    control = (
      <div className="flex flex-wrap gap-2">
        {VIBES.map((v) => {
          const on = chosen.includes(v);
          return (
            <button
              key={v}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(JSON.stringify(on ? chosen.filter((x) => x !== v) : [...chosen, v]))}
              className={`px-3 py-1 text-[11px] font-bold rounded-full border cursor-pointer transition-colors ${
                on
                  ? 'bg-[#2A1810] dark:bg-amber-600 text-white border-transparent'
                  : 'bg-white dark:bg-[#1C1612] text-[#5C4A3A] dark:text-stone-300 border-[#D9CDB8] dark:border-[#3E3025]'
              }`}
            >
              {v}
            </button>
          );
        })}
      </div>
    );
  } else if (def.type === 'theme') {
    const t = parseTheme(value);
    const set = (patch: Partial<typeof t>) => onChange(JSON.stringify({ ...t, ...patch }));
    control = (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <span className="block text-[10px] font-semibold text-[#8C6D53] dark:text-stone-400 mb-1">Main color</span>
          <input type="color" value={t.primaryColor} onChange={(e) => set({ primaryColor: e.target.value })} className="h-8 w-full rounded-lg border border-[#D9CDB8] dark:border-[#3E3025] cursor-pointer bg-transparent" />
        </div>
        <div>
          <span className="block text-[10px] font-semibold text-[#8C6D53] dark:text-stone-400 mb-1">Pattern</span>
          <select value={t.patternType} onChange={(e) => set({ patternType: e.target.value })} className={INPUT_CLS}>
            {(PATTERNS.includes(t.patternType) ? PATTERNS : [t.patternType, ...PATTERNS]).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <span className="block text-[10px] font-semibold text-[#8C6D53] dark:text-stone-400 mb-1">Hero icon</span>
          <select value={t.heroIconName} onChange={(e) => set({ heroIconName: e.target.value })} className={INPUT_CLS}>
            {(ICONS.includes(t.heroIconName) ? ICONS : [t.heroIconName, ...ICONS]).map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>
    );
  } else {
    const inputType = def.type === 'url' ? 'url' : def.type === 'email' ? 'email' : def.type === 'password' ? 'password' : 'text';
    control = (
      <input
        type={inputType}
        value={String(safeValue)}
        autoComplete={def.type === 'password' ? 'new-password' : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLS}
      />
    );
  }

  return (
    <div className={wide ? 'sm:col-span-2 md:col-span-3' : ''}>
      <label className={LABEL_CLS}>{label}</label>
      {control}
      {def.hint && !isPrimaryKey && <p className={HINT_CLS}>{def.hint}</p>}
    </div>
  );
};

// ---------- Whole record form body ----------
interface AdminRecordFieldsProps {
  table: string;
  formData: Record<string, any>;
  setFormData: (d: Record<string, any>) => void;
  isNewRow: boolean;
  extraCities?: string[];
}

export const AdminRecordFields: React.FC<AdminRecordFieldsProps> = ({ table, formData, setFormData, isNewRow, extraCities }) => {
  const update = (key: string, v: any) => setFormData({ ...formData, [key]: v });

  const renderField = (key: string) => (
    <Field key={key} name={key} value={formData[key]} onChange={(v) => update(key, v)} isNewRow={isNewRow} extraCities={extraCities} />
  );

  // Spots: sab fields sections me (add mode me bhi poore dropdowns dikhte hain)
  if (table === 'spots') {
    const covered = new Set(SPOT_SECTIONS.flatMap((s) => s.fields));
    const others = Object.keys(formData).filter((k) => !covered.has(k) && !HIDDEN.has(k));
    return (
      <div className="space-y-5">
        {SPOT_SECTIONS.map((section) => (
          <fieldset key={section.title} className="space-y-3">
            <legend className="text-[11px] font-extrabold uppercase tracking-wider text-[#C85A32] dark:text-amber-400 pb-1 border-b border-[#F2ECE1] dark:border-[#33271F] w-full">
              {section.title}
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {section.fields.map(renderField)}
            </div>
          </fieldset>
        ))}
        {others.length > 0 && (
          <fieldset className="space-y-3">
            <legend className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C6D53] dark:text-stone-400 pb-1 border-b border-[#F2ECE1] dark:border-[#33271F] w-full">
              Other
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">{others.map(renderField)}</div>
          </fieldset>
        )}
      </div>
    );
  }

  // Baaki tables: formData ke keys ke hisaab se
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {Object.keys(formData).filter((k) => !HIDDEN.has(k)).map(renderField)}
    </div>
  );
};