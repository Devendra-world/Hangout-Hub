/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { spawn, execSync, ChildProcess } from 'child_process';
import { AHMEDABAD_SPOTS, AHMEDABAD_COMMUNITY_FEED } from './src/data/initialData.ts';
import {
  HangoutSpot,
  SurveyResponse,
  CafePartnershipProposal,
  UserProfile,
  UserActivityItem
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

const PHP_PORT = 8085;
const PHP_HOST = '127.0.0.1';
let phpServerProcess: ChildProcess | null = null;
let isPhpReady = false;
let phpRespawnAttempts = 0;
const MAX_PHP_RESPAWN = 3;

app.use(express.json({ limit: '256kb' }));

// Block direct HTTP access to raw PHP backend files, SQL dumps, or config files
app.use((req: Request, res: Response, next: NextFunction) => {
  const lowerPath = req.path.toLowerCase();
  if (
    lowerPath.startsWith('/php-backend') ||
    lowerPath.startsWith('/config') ||
    lowerPath.startsWith('/.env') ||
    lowerPath.startsWith('/data/')
  ) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Direct access to backend configuration and source files is denied.'
    });
  }
  next();
});

// ======================== PERSISTENT STORE & PASSWORD SECURITY ========================

interface StoredUser extends UserProfile {
  passwordHash: string;
}

interface SessionRecord {
  userId: string;
  role: 'student' | 'admin';
  createdAt: string;
}

interface PersistentState {
  spots: HangoutSpot[];
  surveyResponses: SurveyResponse[];
  partnershipProposals: CafePartnershipProposal[];
  users: StoredUser[];
  sessions: Record<string, SessionRecord>;
  bookmarks: Record<string, string[]>;
  history: Record<string, UserActivityItem[]>;
  votedKeys: string[];
}

function hashPassword(password: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return `${actualSalt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'fallback_store.json');

const INITIAL_PARTNERSHIPS: CafePartnershipProposal[] = [
  {
    id: 'part-1',
    cafeName: 'Zen Cafe @ Amdavad ni Gufa',
    ownerName: 'Ketan Shah',
    contactEmail: 'zencafe.amdavad@gmail.com',
    contactPhone: '+91 98250 12345',
    address: 'Opposite CEPT University, University Area, Navrangpura',
    proposedPerPersonCost: 160,
    groupCapacity: 18,
    offeredStudentDiscount: 'Free iced tea upgrade for CEPT, NID & AU student groups on weekdays before 5 PM',
    hasFastWifi: true,
    notes: 'We love student art discussions under the neem trees.',
    submittedAt: '2026-10-20'
  },
  {
    id: 'part-2',
    cafeName: 'Mocha Cafe & Cabanas',
    ownerName: 'Nirav Parekh',
    contactEmail: 'mocha.ahmedabad@gmail.com',
    contactPhone: '+91 99099 87654',
    address: 'Opposite Rajpath Club, Bodakdev / SBR',
    proposedPerPersonCost: 330,
    groupCapacity: 16,
    offeredStudentDiscount: 'Free garlic pull-apart bread plate + zero outside cake fee for groups of 6+ with college ID',
    hasFastWifi: true,
    notes: 'Dedicated student birthday squad cabanas with zero cake-cutting charges.',
    submittedAt: '2026-10-22'
  }
];

function createDefaultState(): PersistentState {
  const seedSpots = [...AHMEDABAD_SPOTS];
  const firstSpot = seedSpots[0];
  const secondSpot = seedSpots[1];
  const defaultBookmarks = [firstSpot?.id, secondSpot?.id].filter(Boolean) as string[];

  return {
    spots: seedSpots,
    surveyResponses: [...AHMEDABAD_COMMUNITY_FEED],
    partnershipProposals: [...INITIAL_PARTNERSHIPS],
    users: [
      {
        id: 'usr_devendra_1',
        name: 'Devendra Patadiya',
        email: 'patadiyadevendra5@gmail.com',
        role: 'student',
        college: 'CEPT & Gujarat University Campus',
        city: 'Ahmedabad',
        preferredBudget: 180,
        favoriteVibes: ['Budget Bite & Chill', 'Study & Projects', 'Aesthetic Hangout'],
        bio: 'Design student loving budget aesthetic cafes, outdoor neem tree shade & fast Wi-Fi for group study.',
        avatarColor: '#C85A32',
        upiId: 'patadiyadevendra5@oksbi',
        createdAt: '2026-10-20',
        passwordHash: hashPassword('Student@2026!')
      },
      {
        id: 'usr_admin_1',
        name: 'Campus Admin',
        email: 'admin@hangouthub.in',
        role: 'admin',
        college: 'Ahmedabad University & CEPT Network',
        city: 'Ahmedabad',
        preferredBudget: 350,
        favoriteVibes: ['Study & Projects', 'Budget Bite & Chill', 'Aesthetic Hangout', 'Late Night Hangout'],
        bio: 'System Administrator & Campus Scout Lead.',
        avatarColor: '#7C3AED',
        upiId: 'admin@okaxis',
        createdAt: '2026-10-18',
        passwordHash: hashPassword('Admin@Hangout2026!')
      }
    ],
    sessions: {},
    bookmarks: {
      usr_devendra_1: defaultBookmarks
    },
    history: {
      usr_devendra_1: firstSpot
        ? [
            {
              id: 'hist-seed-1',
              actionType: 'viewed',
              actionTime: '2026-10-27 15:30:00',
              spotId: firstSpot.id,
              spotName: firstSpot.name,
              neighborhood: firstSpot.neighborhood,
              city: firstSpot.city || 'Ahmedabad',
              vibeCategory: firstSpot.vibeCategory,
              costAvg: firstSpot.realPerPersonCost.avg
            }
          ]
        : []
    },
    votedKeys: []
  };
}

function loadState(): PersistentState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      const defaults = createDefaultState();
      return {
        spots: Array.isArray(parsed.spots) && parsed.spots.length > 0 ? parsed.spots : defaults.spots,
        surveyResponses: Array.isArray(parsed.surveyResponses) ? parsed.surveyResponses : defaults.surveyResponses,
        partnershipProposals: Array.isArray(parsed.partnershipProposals)
          ? parsed.partnershipProposals
          : defaults.partnershipProposals,
        users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : defaults.users,
        sessions: parsed.sessions && typeof parsed.sessions === 'object' ? parsed.sessions : {},
        bookmarks: parsed.bookmarks && typeof parsed.bookmarks === 'object' ? parsed.bookmarks : defaults.bookmarks,
        history: parsed.history && typeof parsed.history === 'object' ? parsed.history : defaults.history,
        votedKeys: Array.isArray(parsed.votedKeys) ? parsed.votedKeys : []
      };
    }
  } catch (err) {
    console.warn('[Store] Failed to load fallback store, initializing fresh state:', err);
  }
  const initial = createDefaultState();
  saveState(initial);
  return initial;
}

function saveState(nextState: PersistentState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(nextState, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Store] Failed to persist fallback store:', err);
  }
}

const store: PersistentState = loadState();

function stripPassword(user: StoredUser): UserProfile {
  const { passwordHash: _pw, ...publicProfile } = user;
  return publicProfile;
}

const rateLimitBuckets = new Map<string, { attempts: number; resetAt: number }>();

function checkRateLimit(req: Request, res: Response, bucket: string, maxAttempts: number, windowSeconds: number): boolean {
  const now = Date.now();
  const rawIp = String(req.headers['x-forwarded-for'] || req.ip || '127.0.0.1').split(',')[0].trim();
  const key = `${bucket}:${rawIp}`;
  const entry = rateLimitBuckets.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitBuckets.set(key, { attempts: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }

  if (entry.attempts >= maxAttempts) {
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({
      success: false,
      code: 'RATE_LIMITED',
      retryAfter,
      error: `Too many requests detected. Please wait ${retryAfter} seconds before trying again.`
    });
    return false;
  }

  entry.attempts += 1;
  return true;
}

function extractTokenFromReq(req: Request): string {
  const candidates: unknown[] = [
    req.headers['x-auth-token'],
    req.headers['x-admin-token'],
    req.headers.authorization,
    req.body?._auth_token,
    req.query?._auth_token
  ];

  for (const raw of candidates) {
    if (typeof raw !== 'string') continue;
    let trimmed = raw.trim();
    if (/^Bearer\s+/i.test(trimmed)) {
      trimmed = trimmed.replace(/^Bearer\s+/i, '').trim();
    }
    if (/^[a-fA-F0-9_\-]{16,128}$/.test(trimmed)) {
      return trimmed;
    }
  }
  return '';
}

function getAuthUserFromReq(req: Request): StoredUser | null {
  const token = extractTokenFromReq(req);
  if (!token) return null;
  const session = store.sessions[token];
  if (!session) return null;
  const liveUser = store.users.find((u) => u.id === session.userId);
  return liveUser || null;
}

function requireUserAuth(req: Request, res: Response): StoredUser | null {
  const user = getAuthUserFromReq(req);
  if (!user) {
    res.status(401).json({
      success: false,
      code: 'AUTH_REQUIRED',
      error: 'Sign-in required: Please log in to your verified account (or Sign Out and Sign In again if your session expired).'
    });
    return null;
  }
  return user;
}

function requireAdminAuth(req: Request, res: Response): StoredUser | null {
  const user = getAuthUserFromReq(req);
  if (!user) {
    res.status(401).json({
      success: false,
      code: 'ADMIN_AUTH_REQUIRED',
      error: 'Admin session expired or missing. Please Sign Out and Sign In again with your Admin account.'
    });
    return null;
  }
  if (user.role !== 'admin') {
    res.status(403).json({
      success: false,
      code: 'FORBIDDEN',
      error: 'Forbidden: Only verified Campus Administrators can access or modify database records.'
    });
    return null;
  }
  return user;
}

// ======================== PHP ENGINE SPAWN & FORWARDING ========================

function getPhpBinary(): string | null {
  const candidates = ['/usr/local/bin/php', '/usr/bin/php8.2', '/usr/bin/php', 'php'];
  for (const bin of candidates) {
    try {
      execSync(`${bin} -v`, { stdio: 'ignore' });
      return bin;
    } catch {}
  }
  return null;
}

function initPhpBackend() {
  const phpBin = getPhpBinary();
  if (!phpBin) {
    console.warn('[PHP-Engine] PHP binary not detected. Running seamlessly in persistent Node.js SQL-compatible mode.');
    isPhpReady = false;
    return;
  }

  try {
    execSync(`${phpBin} -d extension=pdo.so -d extension=pdo_sqlite.so php-backend/init_db.php`, { stdio: 'inherit' });
  } catch (e) {
    console.warn('[PHP-Engine] Database init notice:', e);
  }

  try {
    phpServerProcess = spawn(phpBin, [
      '-d', 'extension=pdo.so',
      '-d', 'extension=pdo_sqlite.so',
      '-S', `${PHP_HOST}:${PHP_PORT}`,
      '-t', 'php-backend'
    ], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    phpServerProcess.on('spawn', () => {
      isPhpReady = true;
      phpRespawnAttempts = 0;
    });

    phpServerProcess.on('error', () => {
      isPhpReady = false;
    });

    phpServerProcess.stderr?.on('data', (d) => {
      if (d.toString().includes('started')) {
        isPhpReady = true;
      }
    });

    phpServerProcess.on('exit', () => {
      isPhpReady = false;
      if (phpRespawnAttempts < MAX_PHP_RESPAWN) {
        phpRespawnAttempts++;
        setTimeout(initPhpBackend, 2000);
      }
    });
  } catch {
    isPhpReady = false;
  }
}

async function forwardToPhp(
  endpointPath: string,
  req: Request,
  res: Response,
  extraParams?: Record<string, string>,
  fallback?: () => void
) {
  if (!isPhpReady && fallback) {
    return fallback();
  }
  try {
    const url = new URL(`http://${PHP_HOST}:${PHP_PORT}${endpointPath}`);
    for (const [k, v] of Object.entries(req.query)) {
      if (v !== undefined) {
        url.searchParams.set(k, String(v));
      }
    }
    if (extraParams) {
      for (const [k, v] of Object.entries(extraParams)) {
        url.searchParams.set(k, v);
      }
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Forwarded-For': req.ip || '127.0.0.1'
    };
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    if (typeof req.headers['x-auth-token'] === 'string') {
      headers['X-Auth-Token'] = req.headers['x-auth-token'];
    }
    if (typeof req.headers['x-admin-token'] === 'string') {
      headers['X-Admin-Token'] = req.headers['x-admin-token'];
    }

    const options: RequestInit = {
      method: req.method,
      headers
    };

    if (req.method === 'POST' || req.method === 'PUT') {
      options.body = JSON.stringify(req.body);
    }

    const phpRes = await fetch(url.toString(), options);
    const contentType = phpRes.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const json = await phpRes.json();
      return res.status(phpRes.status).json(json);
    } else {
      const text = await phpRes.text();
      return res.status(phpRes.status).send(text);
    }
  } catch (err) {
    if (fallback) {
      return fallback();
    }
    return res.status(503).json({
      success: false,
      error: 'Backend service temporarily unavailable.'
    });
  }
}

// ======================== SHARED BUSINESS LOGIC HANDLERS ========================

function calculateSurveyStats() {
  const total = store.surveyResponses.length;
  if (total === 0) {
    return {
      total: 0,
      avgMaxBudget: 220,
      avgGroupSize: 6,
      frustrations: {},
      priorities: {}
    };
  }

  const sumBudget = store.surveyResponses.reduce((acc, r) => acc + (r.maxAcceptableCostPerHead || 200), 0);
  const sumGroup = store.surveyResponses.reduce((acc, r) => acc + (r.averageGroupSize || 6), 0);
  const frustrations: Record<string, number> = {};
  const priorities: Record<string, number> = {};

  store.surveyResponses.forEach((r) => {
    if (r.primaryFrustration) {
      frustrations[r.primaryFrustration] = (frustrations[r.primaryFrustration] || 0) + 1;
    }
    if (Array.isArray(r.idealSpotPriorities)) {
      r.idealSpotPriorities.forEach((p) => {
        priorities[p] = (priorities[p] || 0) + 1;
      });
    }
  });

  return {
    total,
    avgMaxBudget: Math.round(sumBudget / total),
    avgGroupSize: Number((sumGroup / total).toFixed(1)),
    frustrations,
    priorities
  };
}

function handleGetSpots(req: Request, res: Response) {
  const { search, city, vibe, maxBudget, minGroupSize, hasWifi, hasPlugs, lateNight, campusArea } = req.query;
  // Only show approved (or legacy unset) spots publicly
  let filtered = store.spots.filter((s) => !s.status || s.status === 'approved');

  if (city && typeof city === 'string' && city !== 'all') {
    const cLower = city.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        (s.city && s.city.toLowerCase() === cLower) ||
        (s.neighborhood && s.neighborhood.toLowerCase().includes(cLower)) ||
        s.tags.some((t) => t.toLowerCase() === cLower)
    );
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.neighborhood.toLowerCase().includes(q) ||
        (s.city && s.city.toLowerCase().includes(q)) ||
        (s.campusName && s.campusName.toLowerCase().includes(q)) ||
        s.distanceToCampus.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (campusArea && typeof campusArea === 'string' && campusArea !== 'all') {
    const areaLower = campusArea.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.neighborhood.toLowerCase().includes(areaLower) ||
        s.distanceToCampus.toLowerCase().includes(areaLower) ||
        (s.campusName && s.campusName.toLowerCase().includes(areaLower)) ||
        s.tags.some((t) => t.toLowerCase().includes(areaLower))
    );
  }

  if (vibe && typeof vibe === 'string' && vibe !== 'all') {
    filtered = filtered.filter((s) => s.vibeCategory === vibe);
  }

  if (maxBudget && !isNaN(Number(maxBudget))) {
    const maxVal = Number(maxBudget);
    filtered = filtered.filter((s) => s.realPerPersonCost.min <= maxVal);
  }

  if (minGroupSize && !isNaN(Number(minGroupSize))) {
    const minSize = Number(minGroupSize);
    filtered = filtered.filter((s) => s.groupSeating.maxGroupSize >= minSize);
  }

  if (hasWifi === 'true') {
    filtered = filtered.filter((s) => s.amenities.wifiReliability === 'Fast & Reliable' || s.amenities.wifiSpeedMbps >= 40);
  }

  if (hasPlugs === 'true') {
    filtered = filtered.filter((s) => s.amenities.powerOutlets === 'Every Table' || s.amenities.powerOutlets === 'Select Wall Tables');
  }

  if (lateNight === 'true') {
    filtered = filtered.filter((s) => s.amenities.openLateNight);
  }

  return res.json({
    success: true,
    engine: 'Persistent Store',
    city: (city as string) || 'all',
    count: filtered.length,
    spots: filtered
  });
}

function sanitizeText(val: unknown, maxLen = 120): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLen);
}

function handleCreateSpot(req: Request, res: Response) {
  const authUser = requireUserAuth(req, res);
  if (!authUser) return;
  if (!checkRateLimit(req, res, 'spot_submit', 8, 3600)) return;

  const body = req.body || {};
  const name = sanitizeText(body.name, 80);
  const neighborhood = sanitizeText(body.neighborhood, 80);
  const city = sanitizeText(body.city, 50) || 'Ahmedabad';

  if (!name || !neighborhood) {
    return res.status(400).json({ success: false, error: 'Spot name and neighborhood are required.' });
  }

  const rawMin = body.minCost ?? body.costMin ?? body.realPerPersonCost?.min ?? body.costAvg;
  const rawMax = body.maxCost ?? body.costMax ?? body.realPerPersonCost?.max ?? body.costAvg ?? rawMin;
  const minCostNum = Number(rawMin);
  const maxCostNum = Number(rawMax);
  const maxGroupNum = Number(body.maxGroupSize ?? body.groupSeating?.maxGroupSize ?? 8);

  if (rawMin === undefined || rawMin === '' || isNaN(minCostNum) || minCostNum < 10 || minCostNum > 5000) {
    return res.status(400).json({ success: false, error: 'Minimum per-person spend must be between ₹10 and ₹5,000.' });
  }
  if (rawMax === undefined || rawMax === '' || isNaN(maxCostNum) || maxCostNum < minCostNum || maxCostNum > 10000) {
    return res.status(400).json({ success: false, error: 'Maximum spend must be greater than or equal to minimum spend (up to ₹10,000).' });
  }
  if (isNaN(maxGroupNum) || maxGroupNum < 1 || maxGroupNum > 100) {
    return res.status(400).json({ success: false, error: 'Group seating capacity must be between 1 and 100 people.' });
  }

  const isAdmin = authUser.role === 'admin';
  const spotStatus: 'approved' | 'pending' = isAdmin ? 'approved' : 'pending';

  const newSpot: HangoutSpot = {
    id: `spot-${Date.now()}`,
    status: spotStatus,
    submittedBy: authUser.id,
    name,
    tagline: sanitizeText(body.tagline, 140) || 'Student verified campus hangout spot',
    city,
    campusName: sanitizeText(body.campusName, 80) || 'Local College Campus',
    neighborhood,
    distanceToCampus: sanitizeText(body.distanceToCampus, 60) || 'Near campus gate',
    vibeCategory: body.vibeCategory || 'Budget Bite & Chill',
    realPerPersonCost: {
      min: Math.round(minCostNum),
      max: Math.round(maxCostNum),
      avg: Math.round((minCostNum + maxCostNum) / 2),
      popularOrderExample: sanitizeText(body.popularOrderExample, 120) || 'Cold Coffee + Snack combo'
    },
    officialClaimCost: sanitizeText(body.officialClaimCost, 100) || 'Food app listed higher',
    groupSeating: {
      maxGroupSize: Math.round(maxGroupNum),
      seatingDescription: sanitizeText(body.seatingDescription, 200) || 'Accommodates student groups.',
      pushTogetherAllowed: body.pushTogetherAllowed ?? true,
      boothCount: Math.max(0, Number(body.boothCount) || 0),
      reservationNeeded: Boolean(body.reservationNeeded),
      reservationTip: sanitizeText(body.reservationTip, 120) || 'Walk-in friendly.'
    },
    amenities: {
      wifiSpeedMbps: Math.max(0, Math.min(1000, Number(body.wifiSpeedMbps) || 35)),
      wifiReliability: body.wifiReliability || 'Decent for Browsing',
      powerOutlets: body.powerOutlets || 'Select Wall Tables',
      noiseDecibels: Math.max(20, Math.min(120, Number(body.noiseDecibels) || 60)),
      noiseDescription: sanitizeText(body.noiseDescription, 100) || 'Relaxed campus vibe',
      boardGamesAvailable: Boolean(body.boardGamesAvailable),
      outsideCakeAllowed: Boolean(body.outsideCakeAllowed),
      studentDiscountAvailable: Boolean(body.studentDiscountAvailable),
      discountNote: sanitizeText(body.discountNote, 100) || 'Show student ID',
      airConditioned: body.airConditioned !== undefined ? Boolean(body.airConditioned) : true,
      openLateNight: Boolean(body.openLateNight),
      closingTime: sanitizeText(body.closingTime, 40) || '11:00 PM'
    },
    reelRealityCheck: {
      hasReel: Boolean(body.reelUrl),
      reelUrl: sanitizeText(body.reelUrl, 250),
      reelCreator: sanitizeText(body.reelCreator, 80) || 'Student Campus Scout',
      reelHypeClaim: sanitizeText(body.reelHypeClaim, 240) || 'Viral claims from Instagram',
      groundRealityTruth:
        sanitizeText(body.groundRealityTruth, 300) || 'Audited student ground truth with real seating and prices.',
      realityScore: Math.max(10, Math.min(100, Number(body.realityScore) || 88))
    },
    scoutReview: {
      scoutName: sanitizeText(body.scoutName, 80) || 'Campus Student Scout',
      scoutCollege: sanitizeText(body.scoutCollege, 100) || `${city} Student Network`,
      scoutNotes: sanitizeText(body.scoutNotes, 300) || 'Personally audited with friends.',
      verifiedDate: 'Just Now',
      upvotes: 1
    },
    tags: [
      city,
      neighborhood,
      ...(body.campusName ? [sanitizeText(body.campusName, 40)] : []),
      `Under ₹${Math.round(maxCostNum)}`,
      'Student Verified'
    ],
    visualTheme: {
      primaryColor: '#78350F',
      patternType: 'warm',
      heroIconName: 'Coffee'
    }
  };

  store.spots = [newSpot, ...store.spots];
  store.votedKeys.push(`${authUser.id}::${newSpot.id}`);
  saveState(store);
  return res.status(201).json({
    success: true,
    pendingModeration: !isAdmin,
    status: spotStatus,
    message: isAdmin
      ? 'Spot published directly to the live directory!'
      : 'Spot submitted for Campus Admin verification! It will appear publicly once approved.',
    spot: newSpot
  });
}

function handleVoteSpot(spotId: string, req: Request, res: Response) {
  const authUser = requireUserAuth(req, res);
  if (!authUser) return;
  if (!checkRateLimit(req, res, 'spot_vote', 30, 60)) return;

  const spot = store.spots.find((s) => s.id === spotId);
  if (!spot) {
    return res.status(404).json({ success: false, error: 'Spot not found' });
  }

  const voteKey = `${authUser.id}::${spotId}`;
  if (store.votedKeys.includes(voteKey)) {
    return res.json({
      success: true,
      alreadyVoted: true,
      upvotes: spot.scoutReview.upvotes,
      message: 'You have already upvoted this spot.'
    });
  }

  spot.scoutReview.upvotes += 1;
  store.votedKeys.push(voteKey);
  saveState(store);
  return res.json({ success: true, alreadyVoted: false, upvotes: spot.scoutReview.upvotes });
}

function handleAuth(req: Request, res: Response) {
  if (req.method === 'GET') {
    const qAction = String(req.query.action || '').toLowerCase();
    if (qAction === 'me') {
      const authUser = requireUserAuth(req, res);
      if (!authUser) return;
      return res.json({ success: true, user: stripPassword(authUser) });
    }

    const userId = String(req.query.user_id || '').trim();
    if (!userId) {
      return res.json({ success: true, message: 'Authentication service online' });
    }
    const found = store.users.find((u) => u.id === userId);
    if (!found) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    return res.json({ success: true, user: stripPassword(found) });
  }

  const input = req.body || {};
  const action = String(input.action || req.query.action || 'login').toLowerCase();

  if (action === 'logout') {
    const token = extractTokenFromReq(req);
    if (token && store.sessions[token]) {
      delete store.sessions[token];
      saveState(store);
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  }

  if (action === 'login') {
    if (!checkRateLimit(req, res, 'auth_login', 12, 600)) return;
    const email = String(input.email || '').trim().toLowerCase();
    const password = String(input.password || '');

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    const found = store.users.find((u) => u.email.toLowerCase() === email);
    if (!found) {
      return res.status(404).json({ success: false, error: 'No account found with this email. Please sign up first.' });
    }

    if (!verifyPassword(password, found.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Incorrect email or password.' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    store.sessions[token] = {
      userId: found.id,
      role: found.role,
      createdAt: new Date().toISOString()
    };
    saveState(store);

    return res.json({
      success: true,
      message: 'Logged in successfully',
      user: stripPassword(found),
      token
    });
  }

  if (action === 'signup') {
    if (!checkRateLimit(req, res, 'auth_signup', 5, 3600)) return;
    const email = String(input.email || '').trim().toLowerCase();
    const name = sanitizeText(input.name, 80);
    const password = String(input.password || '');

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Full name and email are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const exists = store.users.some((u) => u.email.toLowerCase() === email);
    if (exists) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists. Please log in.' });
    }

    const prefix = email.split('@')[0].replace(/[^a-z0-9]/g, '') || 'student';
    const cleanUpi = sanitizeText(input.upiId, 80) || `${prefix}@oksbi`;
    const budget = Math.max(50, Math.min(5000, Number(input.preferredBudget) || 200));
    const avatarColors = ['#C85A32', '#B45309', '#059669', '#1D4ED8', '#7C3AED'];
    const avatarColor = avatarColors[store.users.length % avatarColors.length];

    const newUser: StoredUser = {
      id: `usr_${crypto.randomBytes(6).toString('hex')}`,
      name,
      email,
      role: 'student', // Strictly student on public signup
      college: sanitizeText(input.college, 100) || 'Campus Hub',
      city: sanitizeText(input.city, 60) || 'Ahmedabad',
      preferredBudget: budget,
      favoriteVibes: Array.isArray(input.favoriteVibes)
        ? input.favoriteVibes.map((v: unknown) => sanitizeText(v, 40)).filter(Boolean)
        : ['Budget Bite & Chill', 'Study & Projects'],
      bio: sanitizeText(input.bio, 300) || 'Student scout exploring student-friendly cafes.',
      avatarColor,
      upiId: cleanUpi,
      createdAt: new Date().toISOString().split('T')[0],
      passwordHash: hashPassword(password)
    };

    store.users.push(newUser);
    store.bookmarks[newUser.id] = [];
    store.history[newUser.id] = [];

    const token = crypto.randomBytes(24).toString('hex');
    store.sessions[token] = {
      userId: newUser.id,
      role: 'student',
      createdAt: new Date().toISOString()
    };
    saveState(store);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: stripPassword(newUser),
      token
    });
  }

  return res.status(400).json({ success: false, error: 'Invalid auth action.' });
}

function handleProfile(req: Request, res: Response) {
  if (req.method === 'GET') {
    const userId = String(req.query.user_id || 'usr_devendra_1').trim();
    const found = store.users.find((u) => u.id === userId) || store.users[0];
    if (!found) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const userBookmarkIds = store.bookmarks[found.id] || [];
    const bookmarkedSpots = userBookmarkIds
      .map((id) => store.spots.find((s) => s.id === id))
      .filter(Boolean) as HangoutSpot[];
    const userHistory = store.history[found.id] || [];

    return res.json({
      success: true,
      savedInDb: true,
      profile: stripPassword(found),
      bookmarks: bookmarkedSpots,
      history: userHistory,
      stats: {
        totalSpotsViewed: userHistory.filter((h) => h.actionType === 'viewed').length,
        totalBookmarked: bookmarkedSpots.length,
        totalUpvotesGiven: userHistory.filter((h) => h.actionType === 'upvoted').length
      }
    });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const userId = String(body.user_id || '').trim();
    const idx = store.users.findIndex((u) => u.id === userId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    const existing = store.users[idx];
    const updatedName = sanitizeText(body.name, 80) || existing.name;
    const updatedCollege = sanitizeText(body.college, 120) || existing.college;
    const updatedCity = sanitizeText(body.city, 60) || existing.city;
    const updatedBudget = Math.max(50, Math.min(5000, Number(body.preferredBudget) || existing.preferredBudget));
    const updatedBio = body.bio !== undefined ? sanitizeText(body.bio, 350) : existing.bio;
    const updatedUpi = sanitizeText(body.upiId, 80) || existing.upiId;
    const updatedVibes = Array.isArray(body.favoriteVibes)
      ? body.favoriteVibes.map((v: unknown) => sanitizeText(v, 40)).filter(Boolean)
      : existing.favoriteVibes;

    if (updatedUpi && !/^[\w.\-]+@[\w.\-]+$/.test(updatedUpi)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid UPI ID (e.g., name@oksbi).' });
    }

    let nextPasswordHash = existing.passwordHash;
    if (body.newPassword) {
      const pw = String(body.newPassword);
      if (pw.length < 6) {
        return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
      }
      nextPasswordHash = hashPassword(pw);
    }

    store.users[idx] = {
      ...existing,
      name: updatedName,
      college: updatedCollege,
      city: updatedCity,
      preferredBudget: updatedBudget,
      bio: updatedBio,
      upiId: updatedUpi,
      favoriteVibes: updatedVibes,
      passwordHash: nextPasswordHash
    };
    saveState(store);

    return res.json({
      success: true,
      savedInDb: true,
      message: 'Profile updated successfully!',
      profile: stripPassword(store.users[idx])
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

function handleHistory(req: Request, res: Response) {
  if (req.method === 'GET') {
    const qUserId = String(req.query.user_id || '').trim();
    const bookmarkIds = qUserId ? store.bookmarks[qUserId] || [] : [];
    const bookmarkedSpots = bookmarkIds
      .map((id) => store.spots.find((s) => s.id === id))
      .filter(Boolean);
    return res.json({
      success: true,
      bookmarks: bookmarkedSpots,
      history: qUserId ? store.history[qUserId] || [] : []
    });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  const body = req.body || {};
  const userId = String(body.user_id || '').trim();
  const spotId = String(body.spot_id || '').trim();
  const actionType = String(body.action_type || 'viewed') as 'viewed' | 'saved' | 'unsaved' | 'upvoted';

  if (!userId || !spotId) {
    return res.status(400).json({ success: false, error: 'user_id and spot_id are required' });
  }

  const spot = store.spots.find((s) => s.id === spotId);
  if (!store.bookmarks[userId]) store.bookmarks[userId] = [];
  if (!store.history[userId]) store.history[userId] = [];

  if (actionType === 'saved') {
    if (!store.bookmarks[userId].includes(spotId)) {
      store.bookmarks[userId].unshift(spotId);
    }
  } else if (actionType === 'unsaved') {
    store.bookmarks[userId] = store.bookmarks[userId].filter((id) => id !== spotId);
  }

  const entry: UserActivityItem = {
    id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actionType,
    actionTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    spotId,
    spotName: spot?.name || sanitizeText(body.metadata?.name, 80) || 'Campus Spot',
    neighborhood: spot?.neighborhood || 'Campus',
    city: spot?.city || 'Ahmedabad',
    vibeCategory: spot?.vibeCategory || sanitizeText(body.metadata?.vibe, 40) || 'Aesthetic Hangout',
    costAvg: spot?.realPerPersonCost?.avg || Number(body.metadata?.cost) || 180
  };

  // Deduplicate consecutive identical viewed events at top of history
  const top = store.history[userId][0];
  if (!(top && top.spotId === spotId && top.actionType === actionType && actionType === 'viewed')) {
    store.history[userId].unshift(entry);
    if (store.history[userId].length > 50) {
      store.history[userId] = store.history[userId].slice(0, 50);
    }
  }

  saveState(store);
  return res.json({
    success: true,
    bookmarks: store.bookmarks[userId],
    entry
  });
}

function handleRecommendations(req: Request, res: Response) {
  const userId = String(req.query.user_id || '').trim();
  const user = store.users.find((u) => u.id === userId);
  const targetBudget = user?.preferredBudget || 200;
  const favVibes = user?.favoriteVibes || ['Budget Bite & Chill', 'Study & Projects'];
  const viewedIds = new Set((user ? store.history[user.id] || [] : []).map((h) => h.spotId));

  const approvedSpots = store.spots.filter((s) => !s.status || s.status === 'approved');
  const scored = approvedSpots.map((spot) => {
    let score = 74;
    const reasons: string[] = [];

    if (spot.realPerPersonCost.avg <= targetBudget) {
      score += 12;
      reasons.push(`Fits your ₹${targetBudget} per-head budget`);
    }
    if (favVibes.includes(spot.vibeCategory)) {
      score += 9;
      reasons.push(`Matches your ${spot.vibeCategory} preference`);
    }
    if (user?.city && spot.city?.toLowerCase() === user.city.toLowerCase()) {
      score += 4;
      reasons.push(`Top-rated in ${spot.city}`);
    }
    if (viewedIds.has(spot.id)) {
      score += 2;
    }
    score = Math.min(99, score);

    return {
      spot,
      recommendationScore: score,
      primaryReason: reasons[0] || `High ${spot.reelRealityCheck.realityScore}% student reality score`,
      allReasons: reasons.length > 0 ? reasons : ['High student reality score', 'Squad table verified']
    };
  });

  scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

  return res.json({
    success: true,
    personalized: Boolean(user),
    userTargetBudget: targetBudget,
    count: Math.min(6, scored.length),
    recommendations: scored.slice(0, 6)
  });
}

function handleSurvey(req: Request, res: Response) {
  if (req.method === 'GET') {
    return res.json({
      success: true,
      stats: calculateSurveyStats(),
      responses: store.surveyResponses
    });
  }

  if (!checkRateLimit(req, res, 'survey_submit', 6, 3600)) return;
  const body = req.body || {};
  const studentName = sanitizeText(body.studentName, 80);
  const collegeOrCampus = sanitizeText(body.collegeOrCampus, 100);
  const primaryFrustration = sanitizeText(body.primaryFrustration, 200);
  const worstExperienceWithApps = sanitizeText(body.worstExperienceWithApps, 500);

  if (!studentName || !collegeOrCampus) {
    return res.status(400).json({ success: false, error: 'Name and college/campus are required.' });
  }

  const newResponse: SurveyResponse = {
    id: `feed-${Date.now()}`,
    studentName,
    collegeOrCampus,
    yearOfStudy: sanitizeText(body.yearOfStudy, 40) || 'Undergraduate',
    monthlyHangoutBudget: sanitizeText(body.monthlyHangoutBudget, 40) || '₹2,000 - ₹3,500',
    primaryFrustration: primaryFrustration || 'Spot suggestion',
    worstExperienceWithApps: worstExperienceWithApps || 'Shared campus feedback.',
    idealSpotPriorities:
      Array.isArray(body.idealSpotPriorities) && body.idealSpotPriorities.length > 0
        ? body.idealSpotPriorities.map((p: unknown) => sanitizeText(p, 60)).filter(Boolean)
        : ['Honest per-head cost', 'Big group table'],
    maxAcceptableCostPerHead: Math.max(30, Math.min(2000, Number(body.maxAcceptableCostPerHead) || 200)),
    averageGroupSize: Math.max(1, Math.min(30, Number(body.averageGroupSize) || 6)),
    submittedAt: new Date().toISOString().split('T')[0]
  };

  store.surveyResponses.unshift(newResponse);
  saveState(store);
  const updatedStats = calculateSurveyStats();

  return res.status(201).json({
    success: true,
    message: 'Feedback recorded!',
    response: newResponse,
    stats: updatedStats
  });
}

function handlePartnerships(req: Request, res: Response) {
  if (req.method === 'GET') {
    const optUser = getAuthUserFromReq(req);
    const isAdmin = optUser?.role === 'admin';
    const proposals = store.partnershipProposals.map((p) => ({
      ...p,
      ownerName: isAdmin ? p.ownerName : 'Verified Partner',
      contactEmail: isAdmin ? p.contactEmail : '',
      contactPhone: isAdmin ? p.contactPhone : ''
    }));
    return res.json({
      success: true,
      count: proposals.length,
      proposals
    });
  }

  if (!checkRateLimit(req, res, 'partnership_submit', 5, 3600)) return;
  const body = req.body || {};
  const cafeName = sanitizeText(body.cafeName, 100);
  const ownerName = sanitizeText(body.ownerName, 80);
  const contactEmail = String(body.contactEmail || '').trim();
  const contactPhone = sanitizeText(body.contactPhone, 30);
  const address = sanitizeText(body.address, 200);
  const offeredStudentDiscount = sanitizeText(body.offeredStudentDiscount, 200);

  if (!cafeName || !ownerName || !contactEmail || !address || !offeredStudentDiscount) {
    return res.status(400).json({ success: false, error: 'Please complete all required partnership fields.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid contact email address.' });
  }
  if (contactPhone) {
    const digitsOnly = contactPhone.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15 || /[a-zA-Z]/.test(contactPhone)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid numeric phone number (7–15 digits).' });
    }
  }

  const groupCapacity = Number(body.groupCapacity);
  const proposedCost = Number(body.proposedPerPersonCost);
  if (isNaN(groupCapacity) || groupCapacity < 2 || groupCapacity > 250) {
    return res.status(400).json({ success: false, error: 'Group capacity must be between 2 and 250 guests.' });
  }
  if (isNaN(proposedCost) || proposedCost < 20 || proposedCost > 5000) {
    return res.status(400).json({ success: false, error: 'Per-person average spend must be between ₹20 and ₹5,000.' });
  }

  const newProposal: CafePartnershipProposal = {
    id: `part-${Date.now()}`,
    cafeName,
    ownerName,
    contactEmail,
    contactPhone,
    address,
    proposedPerPersonCost: Math.round(proposedCost),
    groupCapacity: Math.round(groupCapacity),
    offeredStudentDiscount,
    hasFastWifi: Boolean(body.hasFastWifi),
    notes: sanitizeText(body.notes, 500),
    submittedAt: new Date().toISOString().split('T')[0]
  };

  store.partnershipProposals.unshift(newProposal);
  saveState(store);

  return res.status(201).json({
    success: true,
    message: 'Proposal received!',
    proposal: newProposal
  });
}

function handleBackendInfo(_req: Request, res: Response) {
  return res.json({
    success: true,
    backend: isPhpReady ? 'PHP 8.2 + SQLite PDO' : 'Node + Persistent SQL Store',
    databaseType: 'SQL Database (MySQL & SQLite compatible)',
    driver: isPhpReady ? 'pdo_sqlite' : 'json_sql_compat',
    status: 'Active',
    tables: {
      spots: { count: store.spots.length },
      survey_responses: { count: store.surveyResponses.length },
      partnership_proposals: { count: store.partnershipProposals.length }
    },
    timestamp: new Date().toISOString()
  });
}

function handleAdminCrud(req: Request, res: Response) {
  if (!requireAdminAuth(req, res)) return;

  const allowedTables = ['spots', 'users', 'survey_responses', 'partnership_proposals', 'user_history'];
  const table = String(req.query.table || req.body?.table || 'spots');
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ success: false, error: 'Invalid table requested.' });
  }

  if (req.method === 'GET') {
    let rows: any[] = [];
    if (table === 'spots') {
      rows = [...store.spots]
        .sort((a, b) => ((a.status || 'approved') === 'pending' ? -1 : (b.status || 'approved') === 'pending' ? 1 : 0))
        .map(({ id, status, ...rest }) => ({ id, status: status || 'approved', ...rest }));
    } else if (table === 'users') rows = store.users.map(stripPassword);
    else if (table === 'survey_responses') rows = store.surveyResponses;
    else if (table === 'partnership_proposals') rows = store.partnershipProposals;
    else if (table === 'user_history') {
      rows = Object.entries(store.history).flatMap(([uid, items]) =>
        items.map((item) => ({ user_id: uid, ...item }))
      );
    }
    return res.json({ success: true, table, total: rows.length, count: rows.length, rows });
  }

  if (req.method === 'POST') {
    const action = String(req.body?.action || req.query.action || '');
    const id = String(req.body?.id || req.query.id || '').trim();
    const rawData = req.body?.data && typeof req.body.data === 'object' ? req.body.data : {};

    // Reject invalid SQL identifier keys
    for (const key of Object.keys(rawData)) {
      if (!/^[a-zA-Z0-9_]+$/.test(key)) {
        return res.status(400).json({ success: false, error: `Invalid column identifier: ${key}` });
      }
    }

    if (action === 'delete') {
      if (!id) return res.status(400).json({ success: false, error: 'Record id is required' });
      if (table === 'spots') store.spots = store.spots.filter((s) => s.id !== id);
      else if (table === 'users') store.users = store.users.filter((u) => u.id !== id);
      else if (table === 'survey_responses') store.surveyResponses = store.surveyResponses.filter((r) => r.id !== id);
      else if (table === 'partnership_proposals')
        store.partnershipProposals = store.partnershipProposals.filter((p) => p.id !== id);
      saveState(store);
      return res.json({ success: true, message: `Row ${id} deleted from ${table}` });
    }

    if (action === 'update') {
      if (!id) return res.status(400).json({ success: false, error: 'Record id is required' });
      if (table === 'spots') {
        const idx = store.spots.findIndex((s) => s.id === id);
        if (idx !== -1) store.spots[idx] = { ...store.spots[idx], ...rawData, id };
      } else if (table === 'users') {
        const idx = store.users.findIndex((u) => u.id === id);
        if (idx !== -1) {
          const { password, passwordHash: _ignore, ...safeFields } = rawData;
          store.users[idx] = {
            ...store.users[idx],
            ...safeFields,
            id,
            passwordHash: password ? hashPassword(String(password)) : store.users[idx].passwordHash
          };
        }
      } else if (table === 'survey_responses') {
        const idx = store.surveyResponses.findIndex((r) => r.id === id);
        if (idx !== -1) store.surveyResponses[idx] = { ...store.surveyResponses[idx], ...rawData, id };
      } else if (table === 'partnership_proposals') {
        const idx = store.partnershipProposals.findIndex((p) => p.id === id);
        if (idx !== -1) store.partnershipProposals[idx] = { ...store.partnershipProposals[idx], ...rawData, id };
      }
      saveState(store);
      return res.json({ success: true, message: `Row ${id} in ${table} updated` });
    }

    if (action === 'create') {
      const newId = rawData.id || `${table.slice(0, 4)}-${Date.now()}`;
      if (table === 'spots') {
        const created: HangoutSpot = {
          ...AHMEDABAD_SPOTS[0],
          id: newId,
          name: sanitizeText(rawData.name, 80) || 'Campus Spot',
          neighborhood: sanitizeText(rawData.neighborhood, 80) || 'Navrangpura',
          city: sanitizeText(rawData.city, 50) || 'Ahmedabad',
          tagline: sanitizeText(rawData.tagline, 140) || 'Student verified spot'
        };
        store.spots.unshift(created);
      } else if (table === 'users') {
        store.users.push({
          id: newId,
          name: sanitizeText(rawData.name, 80) || 'Student User',
          email: String(rawData.email || `user_${Date.now()}@campus.edu`).trim(),
          role: rawData.role === 'admin' ? 'admin' : 'student',
          college: sanitizeText(rawData.college, 100) || 'Campus',
          city: sanitizeText(rawData.city, 50) || 'Ahmedabad',
          preferredBudget: Number(rawData.preferred_budget || rawData.preferredBudget) || 180,
          favoriteVibes: ['Budget Bite & Chill'],
          bio: '',
          avatarColor: '#C85A32',
          upiId: 'student@oksbi',
          passwordHash: hashPassword(String(rawData.password || 'Student@2026!'))
        });
      }
      saveState(store);
      return res.status(201).json({ success: true, id: newId, message: `Created record in ${table}` });
    }

    return res.status(400).json({ success: false, error: 'Unsupported admin CRUD action' });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

// ======================== UNIFIED PHP COMPATIBILITY ROUTES (/*.php) ========================

app.all('/*.php', async (req: Request, res: Response) => {
  const scriptPath = req.path;

  // Enforce admin auth before forwarding admin_crud.php anywhere
  if (scriptPath === '/admin_crud.php' || scriptPath === '/api/admin_crud.php') {
    return forwardToPhp(scriptPath, req, res, undefined, () => handleAdminCrud(req, res));
  }

  return forwardToPhp(scriptPath, req, res, undefined, () => {
    if (scriptPath === '/spots.php' || scriptPath === '/api/spots.php') {
      if (req.query.action === 'vote' && req.query.id) {
        return handleVoteSpot(String(req.query.id), req, res);
      }
      if (req.method === 'GET') return handleGetSpots(req, res);
      if (req.method === 'POST') return handleCreateSpot(req, res);
    }

    if (scriptPath === '/spot_detail.php' || scriptPath === '/api/spot_detail.php') {
      const id = String(req.query.id || '');
      if (req.query.action === 'vote') return handleVoteSpot(id, req, res);
      const spot = store.spots.find((s) => s.id === id);
      if (!spot) return res.status(404).json({ success: false, error: 'Spot not found' });
      return res.json({ success: true, spot });
    }

    if (scriptPath === '/survey.php' || scriptPath === '/api/survey.php') {
      return handleSurvey(req, res);
    }

    if (scriptPath === '/partnerships.php' || scriptPath === '/api/partnerships.php') {
      return handlePartnerships(req, res);
    }

    if (scriptPath === '/auth.php' || scriptPath === '/api/auth.php') {
      return handleAuth(req, res);
    }

    if (scriptPath === '/profile.php' || scriptPath === '/api/profile.php') {
      return handleProfile(req, res);
    }

    if (scriptPath === '/history.php' || scriptPath === '/api/history.php') {
      return handleHistory(req, res);
    }

    if (scriptPath === '/recommendations.php' || scriptPath === '/api/recommendations.php') {
      return handleRecommendations(req, res);
    }

    if (scriptPath === '/info.php' || scriptPath === '/api/info.php') {
      return handleBackendInfo(req, res);
    }

    if (scriptPath === '/export_sql.php') {
      const sqlFile = path.resolve(__dirname, 'php-backend', 'database.sql');
      return res.download(sqlFile, 'hangout_hub_database.sql');
    }

    return res.status(404).json({ success: false, error: `Endpoint ${scriptPath} not found` });
  });
});

// ======================== REST API ROUTES (/api/*) ========================

app.get('/api/spots', async (req: Request, res: Response) => {
  await forwardToPhp('/api/spots.php', req, res, undefined, () => handleGetSpots(req, res));
});

app.get('/api/spots/:id', async (req: Request, res: Response) => {
  await forwardToPhp('/api/spot_detail.php', req, res, { id: req.params.id }, () => {
    const spot = store.spots.find((s) => s.id === req.params.id);
    if (!spot) return res.status(404).json({ success: false, error: 'Spot not found' });
    res.json({ success: true, spot });
  });
});

app.post('/api/spots', async (req: Request, res: Response) => {
  await forwardToPhp('/api/spots.php', req, res, undefined, () => handleCreateSpot(req, res));
});

app.post('/api/spots/:id/vote', async (req: Request, res: Response) => {
  await forwardToPhp('/api/spot_detail.php', req, res, { id: req.params.id, action: 'vote' }, () =>
    handleVoteSpot(req.params.id, req, res)
  );
});

app.get('/api/spots/:id/vote', async (req: Request, res: Response) => {
  await forwardToPhp('/api/spot_detail.php', req, res, { id: req.params.id, action: 'vote' }, () =>
    handleVoteSpot(req.params.id, req, res)
  );
});

app.put('/api/spots/:id', async (req: Request, res: Response) => {
  if (!requireAdminAuth(req, res)) return;
  await forwardToPhp('/api/admin_crud.php', req, res, { action: 'update', table: 'spots', id: req.params.id }, () => {
    const idx = store.spots.findIndex((s) => s.id === req.params.id);
    if (idx !== -1) {
      store.spots[idx] = { ...store.spots[idx], ...req.body, id: req.params.id };
      saveState(store);
      return res.json({ success: true, message: 'Spot updated successfully', spot: store.spots[idx] });
    }
    res.status(404).json({ success: false, error: 'Spot not found' });
  });
});

app.delete('/api/spots/:id', async (req: Request, res: Response) => {
  if (!requireAdminAuth(req, res)) return;
  await forwardToPhp('/api/admin_crud.php', req, res, { action: 'delete', table: 'spots', id: req.params.id }, () => {
    store.spots = store.spots.filter((s) => s.id !== req.params.id);
    saveState(store);
    res.json({ success: true, message: `Spot ${req.params.id} deleted successfully` });
  });
});

app.get('/api/survey', async (req: Request, res: Response) => {
  await forwardToPhp('/api/survey.php', req, res, undefined, () => handleSurvey(req, res));
});

app.post('/api/survey', async (req: Request, res: Response) => {
  await forwardToPhp('/api/survey.php', req, res, undefined, () => handleSurvey(req, res));
});

app.get('/api/partnerships', async (req: Request, res: Response) => {
  await forwardToPhp('/api/partnerships.php', req, res, undefined, () => handlePartnerships(req, res));
});

app.post('/api/partnerships', async (req: Request, res: Response) => {
  await forwardToPhp('/api/partnerships.php', req, res, undefined, () => handlePartnerships(req, res));
});

app.get('/api/stats', async (req: Request, res: Response) => {
  await forwardToPhp('/api/stats.php', req, res, undefined, () => {
    const avgCost = Math.round(
      store.spots.reduce((acc, s) => acc + s.realPerPersonCost.avg, 0) / (store.spots.length || 1)
    );
    const totalUpvotes = store.spots.reduce((acc, s) => acc + s.scoutReview.upvotes, 0);

    res.json({
      success: true,
      city: 'Pan-India Campuses',
      totalSpots: store.spots.length,
      studentsSurveyed: store.surveyResponses.length,
      totalScoutUpvotes: totalUpvotes,
      averagePerPersonCost: avgCost,
      activePartnerships: store.partnershipProposals.length
    });
  });
});

app.get('/api/backend-info', async (req: Request, res: Response) => {
  await forwardToPhp('/api/info.php', req, res, undefined, () => handleBackendInfo(req, res));
});

app.get('/api/database/download', (_req: Request, res: Response) => {
  const sqlFile = path.resolve(__dirname, 'php-backend', 'database.sql');
  res.download(sqlFile, 'hangout_hub_database.sql');
});

app.get('/api/database/schema-text', (_req: Request, res: Response) => {
  try {
    const sqlPath = path.resolve(__dirname, 'php-backend', 'database.sql');
    const content = fs.readFileSync(sqlPath, 'utf-8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);
  } catch (e: any) {
    res.status(500).send('-- Failed to read database.sql: ' + e.message);
  }
});

app.all('/api/auth', async (req: Request, res: Response) => {
  await forwardToPhp('/api/auth.php', req, res, undefined, () => handleAuth(req, res));
});

app.all('/api/profile', async (req: Request, res: Response) => {
  await forwardToPhp('/api/profile.php', req, res, undefined, () => handleProfile(req, res));
});

app.all('/api/history', async (req: Request, res: Response) => {
  await forwardToPhp('/api/history.php', req, res, undefined, () => handleHistory(req, res));
});

app.all('/api/recommendations', async (req: Request, res: Response) => {
  await forwardToPhp('/api/recommendations.php', req, res, undefined, () => handleRecommendations(req, res));
});

app.all('/api/admin/crud', async (req: Request, res: Response) => {
  await forwardToPhp('/api/admin_crud.php', req, res, undefined, () => handleAdminCrud(req, res));
});

// Serve generated End-to-End QA Report PDF
app.get(['/Hangout-Hub-QA-Report.pdf', '/api/qa-report.pdf'], (_req: Request, res: Response) => {
  const reportPdfPath = path.resolve(__dirname, 'public', 'Hangout-Hub-QA-Report.pdf');
  if (fs.existsSync(reportPdfPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Hangout-Hub-QA-Report.pdf"');
    return res.sendFile(reportPdfPath);
  }
  return res.status(404).json({ error: 'QA Report PDF not found' });
});

// Catch-all for unknown /api/* routes so JSON is returned instead of SPA HTML
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ success: false, error: `API route ${req.path} not found` });
});

async function startServer() {
  initPhpBackend();

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        fs: {
          deny: ['**/php-backend/**', '**/config/**', '**/.env*', '**/data/**']
        }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hangout-Hub Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
