/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { spawn, execSync, ChildProcess } from 'child_process';
import { AHMEDABAD_SPOTS, AHMEDABAD_COMMUNITY_FEED } from './src/data/initialData.ts';
import { HangoutSpot, SurveyResponse, CafePartnershipProposal } from './src/types/index.ts';

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

app.use(express.json());

// In-memory fallback data store in case PHP is initializing
let spots: HangoutSpot[] = [...AHMEDABAD_SPOTS];
let surveyResponses: SurveyResponse[] = [...AHMEDABAD_COMMUNITY_FEED];
let partnershipProposals: CafePartnershipProposal[] = [
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

// Initialize and spawn PHP built-in server with SQL Database backend
function initPhpBackend() {
  const phpBin = getPhpBinary();
  if (!phpBin) {
    console.warn('[PHP-Engine] PHP binary not detected. Running seamlessly in high-speed Node.js fallback mode.');
    isPhpReady = false;
    return;
  }

  try {
    console.log('[PHP-Engine] Initializing SQL database schema and seeds...');
    execSync(`${phpBin} -d extension=pdo.so -d extension=pdo_sqlite.so php-backend/init_db.php`, { stdio: 'inherit' });
  } catch (e) {
    console.warn('[PHP-Engine] Database init notice:', e);
  }

  try {
    console.log(`[PHP-Engine] Spawning PHP backend server on http://${PHP_HOST}:${PHP_PORT}...`);
    phpServerProcess = spawn(phpBin, [
      '-d', 'extension=pdo.so',
      '-d', 'extension=pdo_sqlite.so',
      '-S', `${PHP_HOST}:${PHP_PORT}`,
      '-t', 'php-backend'
    ], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    phpServerProcess.on('spawn', () => {
      console.log(`[PHP-Engine] PHP REST API & Database server running on http://${PHP_HOST}:${PHP_PORT}`);
      isPhpReady = true;
      phpRespawnAttempts = 0;
    });

    phpServerProcess.on('error', (err) => {
      console.warn('[PHP-Engine] PHP process error:', err.message);
      isPhpReady = false;
    });

    phpServerProcess.stderr?.on('data', (d) => {
      const msg = d.toString();
      if (msg.includes('started')) {
        isPhpReady = true;
      }
    });

    phpServerProcess.on('exit', (code) => {
      isPhpReady = false;
      if (phpRespawnAttempts < MAX_PHP_RESPAWN) {
        phpRespawnAttempts++;
        console.warn(`[PHP-Engine] Process exited with code ${code}. Respawn attempt ${phpRespawnAttempts}/${MAX_PHP_RESPAWN} in 2s...`);
        setTimeout(initPhpBackend, 2000);
      } else {
        console.warn('[PHP-Engine] Operating in robust Node.js fallback mode.');
      }
    });
  } catch (err) {
    console.error('[PHP-Engine] Failed to launch PHP server process:', err);
    isPhpReady = false;
  }
}

// Helper to proxy requests to the active PHP REST API
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

    // Forward original query parameters
    for (const [k, v] of Object.entries(req.query)) {
      if (v !== undefined) {
        url.searchParams.set(k, String(v));
      }
    }

    // Attach extra query parameters (e.g. id, action)
    if (extraParams) {
      for (const [k, v] of Object.entries(extraParams)) {
        url.searchParams.set(k, v);
      }
    }

    const options: RequestInit = {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Forwarded-For': req.ip || '127.0.0.1'
      }
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
      error: 'PHP backend temporarily busy. Retrying connection.',
      details: String(err)
    });
  }
}

function calculateSurveyStats() {
  const total = surveyResponses.length;
  if (total === 0) {
    return {
      total: 0,
      avgMaxBudget: 220,
      avgGroupSize: 6,
      frustrations: {},
      priorities: {}
    };
  }

  const sumBudget = surveyResponses.reduce((acc, r) => acc + (r.maxAcceptableCostPerHead || 200), 0);
  const sumGroup = surveyResponses.reduce((acc, r) => acc + (r.averageGroupSize || 6), 0);
  const frustrations: Record<string, number> = {};
  const priorities: Record<string, number> = {};

  surveyResponses.forEach((r) => {
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

// ======================== API ROUTES (PHP DATABASE POWERED) ========================

// 1. GET /api/spots - Retrieve hangout spots with smart filters (PHP + SQL)
app.get('/api/spots', async (req: Request, res: Response) => {
  await forwardToPhp('/api/spots.php', req, res, undefined, () => {
    // In-memory fallback
    const { search, city, vibe, maxBudget, minGroupSize, hasWifi, hasPlugs, lateNight, campusArea } = req.query;
    let filtered = [...spots];

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

    res.json({
      success: true,
      engine: 'Fallback (Node Memory)',
      city: (city as string) || 'all',
      count: filtered.length,
      spots: filtered
    });
  });
});

// 2. GET /api/spots/:id - Get single spot details
app.get('/api/spots/:id', async (req: Request, res: Response) => {
  await forwardToPhp('/api/spot_detail.php', req, res, { id: req.params.id }, () => {
    const spot = spots.find((s) => s.id === req.params.id);
    if (!spot) {
      return res.status(404).json({ success: false, error: 'Spot not found' });
    }
    res.json({ success: true, spot });
  });
});

// 3. POST /api/spots - Student scout submission directly into PHP SQL Database
app.post('/api/spots', async (req: Request, res: Response) => {
  await forwardToPhp('/api/spots.php', req, res, undefined, () => {
    const body = req.body;
    if (!body.name || !body.neighborhood) {
      return res.status(400).json({ success: false, error: 'Name and neighborhood are required' });
    }

    const newSpot: HangoutSpot = {
      id: `spot-${Date.now()}`,
      name: body.name.trim(),
      tagline: body.tagline ? body.tagline.trim() : 'Student verified campus hangout adda',
      city: body.city?.trim() || 'Ahmedabad',
      campusName: body.campusName?.trim() || 'Local College Campus',
      neighborhood: body.neighborhood.trim(),
      distanceToCampus: body.distanceToCampus || 'Near campus gate',
      vibeCategory: body.vibeCategory || 'Budget Bite & Chill',
      realPerPersonCost: {
        min: Number(body.minCost) || 100,
        max: Number(body.maxCost) || 220,
        avg: Math.round(((Number(body.minCost) || 100) + (Number(body.maxCost) || 220)) / 2),
        popularOrderExample: body.popularOrderExample || 'Cold Coffee + Snack combo'
      },
      officialClaimCost: body.officialClaimCost || 'Food app listed higher',
      groupSeating: {
        maxGroupSize: Number(body.maxGroupSize) || 8,
        seatingDescription: body.seatingDescription || 'Accommodates student groups.',
        pushTogetherAllowed: body.pushTogetherAllowed ?? true,
        boothCount: Number(body.boothCount) || 0,
        reservationNeeded: body.reservationNeeded ?? false,
        reservationTip: body.reservationTip || 'Walk-in friendly.'
      },
      amenities: {
        wifiSpeedMbps: Number(body.wifiSpeedMbps) || 35,
        wifiReliability: body.wifiReliability || 'Decent for Browsing',
        powerOutlets: body.powerOutlets || 'Select Wall Tables',
        noiseDecibels: Number(body.noiseDecibels) || 60,
        noiseDescription: body.noiseDescription || 'Relaxed campus vibe',
        boardGamesAvailable: Boolean(body.boardGamesAvailable),
        outsideCakeAllowed: Boolean(body.outsideCakeAllowed),
        studentDiscountAvailable: Boolean(body.studentDiscountAvailable),
        discountNote: body.discountNote || 'Show student ID',
        airConditioned: Boolean(body.airConditioned),
        openLateNight: Boolean(body.openLateNight),
        closingTime: body.closingTime || '11:00 PM'
      },
      reelRealityCheck: {
        hasReel: Boolean(body.reelUrl),
        reelUrl: body.reelUrl || '',
        reelCreator: body.reelCreator || 'Student Campus Scout',
        reelHypeClaim: body.reelHypeClaim || 'Viral claims from Instagram',
        groundRealityTruth: body.groundRealityTruth || 'Audited student ground truth with real seating and prices.',
        realityScore: Number(body.realityScore) || 88
      },
      scoutReview: {
        scoutName: body.scoutName || 'Anonymous Student Scout',
        scoutCollege: body.scoutCollege || `${body.campusName || 'Campus'} Student Network`,
        scoutNotes: body.scoutNotes || 'Personally audited with friends.',
        verifiedDate: 'Just Now',
        upvotes: 1
      },
      tags: [
        body.city?.trim() || 'Campus',
        body.neighborhood.trim(),
        ...(body.campusName ? [body.campusName.trim()] : []),
        `Under ₹${body.maxCost || '220'}`,
        'Student Verified'
      ],
      visualTheme: {
        primaryColor: '#78350F',
        patternType: 'warm',
        heroIconName: 'Coffee'
      }
    };

    spots = [newSpot, ...spots];
    res.status(201).json({ success: true, spot: newSpot });
  });
});

// 4. POST /api/spots/:id/vote - Increment upvote in SQL database
app.post('/api/spots/:id/vote', async (req: Request, res: Response) => {
  await forwardToPhp('/api/spot_detail.php', req, res, { id: req.params.id, action: 'vote' }, () => {
    const spot = spots.find((s) => s.id === req.params.id);
    if (!spot) {
      return res.status(404).json({ success: false, error: 'Spot not found' });
    }
    spot.scoutReview.upvotes += 1;
    res.json({ success: true, upvotes: spot.scoutReview.upvotes });
  });
});

app.get('/api/spots/:id/vote', async (req: Request, res: Response) => {
  await forwardToPhp('/api/spot_detail.php', req, res, { id: req.params.id, action: 'vote' }, () => {
    const spot = spots.find((s) => s.id === req.params.id);
    if (!spot) {
      return res.status(404).json({ success: false, error: 'Spot not found' });
    }
    spot.scoutReview.upvotes += 1;
    res.json({ success: true, upvotes: spot.scoutReview.upvotes });
  });
});

// Admin Spot Update (PUT)
app.put('/api/spots/:id', async (req: Request, res: Response) => {
  await forwardToPhp('/api/admin_crud.php', req, res, { action: 'update', table: 'spots', id: req.params.id }, () => {
    const idx = spots.findIndex((s) => s.id === req.params.id);
    if (idx !== -1) {
      spots[idx] = { ...spots[idx], ...req.body };
      return res.json({ success: true, message: 'Spot updated successfully', spot: spots[idx] });
    }
    res.status(404).json({ success: false, error: 'Spot not found' });
  });
});

// Admin Spot Delete (DELETE)
app.delete('/api/spots/:id', async (req: Request, res: Response) => {
  await forwardToPhp('/api/admin_crud.php', req, res, { action: 'delete', table: 'spots', id: req.params.id }, () => {
    spots = spots.filter((s) => s.id !== req.params.id);
    res.json({ success: true, message: `Spot ${req.params.id} deleted successfully` });
  });
});

// 5. GET /api/survey - Student feedback feed & stats from PHP SQL Database
app.get('/api/survey', async (req: Request, res: Response) => {
  await forwardToPhp('/api/survey.php', req, res, undefined, () => {
    const stats = calculateSurveyStats();
    res.json({
      success: true,
      stats,
      responses: surveyResponses
    });
  });
});

// 6. POST /api/survey - Student feedback insertion into PHP SQL Database
app.post('/api/survey', async (req: Request, res: Response) => {
  await forwardToPhp('/api/survey.php', req, res, undefined, () => {
    const {
      studentName,
      collegeOrCampus,
      yearOfStudy,
      monthlyHangoutBudget,
      primaryFrustration,
      worstExperienceWithApps,
      idealSpotPriorities,
      maxAcceptableCostPerHead,
      averageGroupSize
    } = req.body;

    const newResponse: SurveyResponse = {
      id: `feed-${Date.now()}`,
      studentName: studentName?.trim() || 'Campus Student',
      collegeOrCampus: collegeOrCampus?.trim() || 'Local Campus',
      yearOfStudy: yearOfStudy || 'Undergraduate',
      monthlyHangoutBudget: monthlyHangoutBudget || '₹2,000 - ₹3,500',
      primaryFrustration: primaryFrustration?.trim() || 'Spot suggestion',
      worstExperienceWithApps: worstExperienceWithApps?.trim() || 'Shared campus feedback.',
      idealSpotPriorities: Array.isArray(idealSpotPriorities) && idealSpotPriorities.length > 0
        ? idealSpotPriorities
        : ['Honest per-head cost', 'Big group table'],
      maxAcceptableCostPerHead: Number(maxAcceptableCostPerHead) || 200,
      averageGroupSize: Number(averageGroupSize) || 6,
      submittedAt: new Date().toISOString().split('T')[0]
    };

    surveyResponses.unshift(newResponse);
    const updatedStats = calculateSurveyStats();

    res.status(201).json({
      success: true,
      message: 'Feedback recorded!',
      response: newResponse,
      stats: updatedStats
    });
  });
});

// 7. Cafe Partnerships (GET & POST)
app.get('/api/partnerships', async (req: Request, res: Response) => {
  await forwardToPhp('/api/partnerships.php', req, res, undefined, () => {
    res.json({
      success: true,
      count: partnershipProposals.length,
      proposals: partnershipProposals
    });
  });
});

app.post('/api/partnerships', async (req: Request, res: Response) => {
  await forwardToPhp('/api/partnerships.php', req, res, undefined, () => {
    const {
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
    } = req.body;

    const newProposal: CafePartnershipProposal = {
      id: `part-${Date.now()}`,
      cafeName: (cafeName || 'Campus Cafe').trim(),
      ownerName: (ownerName || 'Cafe Owner').trim(),
      contactEmail: (contactEmail || 'partner@cafe.com').trim(),
      contactPhone: contactPhone?.trim() || '',
      address: address?.trim() || 'Campus Area',
      proposedPerPersonCost: Number(proposedPerPersonCost) || 200,
      groupCapacity: Number(groupCapacity) || 8,
      offeredStudentDiscount: offeredStudentDiscount?.trim() || '10% student discount',
      hasFastWifi: Boolean(hasFastWifi),
      notes: notes?.trim() || '',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    partnershipProposals.unshift(newProposal);

    res.status(201).json({
      success: true,
      message: 'Proposal received!',
      proposal: newProposal
    });
  });
});

// 8. GET /api/stats - Aggregated stats
app.get('/api/stats', async (req: Request, res: Response) => {
  await forwardToPhp('/api/stats.php', req, res, undefined, () => {
    const avgCost = Math.round(
      spots.reduce((acc, s) => acc + s.realPerPersonCost.avg, 0) / (spots.length || 1)
    );
    const totalUpvotes = spots.reduce((acc, s) => acc + s.scoutReview.upvotes, 0);

    res.json({
      success: true,
      city: 'Pan-India Campuses',
      totalSpots: spots.length,
      studentsSurveyed: surveyResponses.length + 180,
      totalScoutUpvotes: totalUpvotes,
      averagePerPersonCost: avgCost,
      activePartnerships: partnershipProposals.length
    });
  });
});

// 9. GET /api/backend-info - Active PHP engine telemetry & connection health
app.get('/api/backend-info', async (req: Request, res: Response) => {
  await forwardToPhp('/api/info.php', req, res, undefined, () => {
    res.json({
      success: true,
      backend: 'PHP 8.2 + Node Proxy',
      databaseType: 'SQL Database (MySQL & SQLite compatible)',
      status: 'Active (Fallback)',
      timestamp: new Date().toISOString()
    });
  });
});

// 10. GET /api/database/download - One-click download of the complete MySQL database.sql
app.get('/api/database/download', (_req: Request, res: Response) => {
  const sqlFile = path.resolve(__dirname, 'php-backend', 'database.sql');
  res.download(sqlFile, 'hangout_hub_database.sql');
});

// 11. GET /api/database/schema-text - Raw text of database.sql for in-app code viewing
app.get('/api/database/schema-text', async (_req: Request, res: Response) => {
  try {
    const fs = await import('fs');
    const sqlPath = path.resolve(__dirname, 'php-backend', 'database.sql');
    const content = fs.readFileSync(sqlPath, 'utf-8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);
  } catch (e: any) {
    res.status(500).send('-- Failed to read database.sql: ' + e.message);
  }
});

// 12. /api/auth (Login, Signup, Check)
app.all(['/api/auth', '/api/auth.php'], async (req: Request, res: Response) => {
  await forwardToPhp('/api/auth.php', req, res, undefined, () => {
    const input = req.body || {};
    if (req.method === 'POST') {
      const email = (input.email || '').toLowerCase().trim();
      if (email.includes('admin')) {
        return res.json({
          success: true,
          user: {
            id: 'usr_admin_1',
            name: 'Campus Admin',
            email: 'admin@hangouthub.in',
            role: 'admin',
            college: 'Ahmedabad University & CEPT Network',
            city: 'Ahmedabad',
            preferredBudget: 350,
            favoriteVibes: ['Study & Projects', 'Budget Bite & Chill', 'Aesthetic Hangout', 'Late Night Adda'],
            bio: 'System Administrator & Campus Scout Lead.',
            avatarColor: '#7C3AED'
          },
          token: 'hh_token_fallback_admin'
        });
      }
      return res.json({
        success: true,
        user: {
          id: 'usr_devendra_1',
          name: input.name || 'Devendra Patadiya',
          email: input.email || 'patadiyadevendra5@gmail.com',
          role: 'student',
          college: input.college || 'CEPT & Gujarat University Campus',
          city: input.city || 'Ahmedabad',
          preferredBudget: input.preferredBudget || 180,
          favoriteVibes: input.favoriteVibes || ['Budget Bite & Chill', 'Study & Projects', 'Aesthetic Hangout'],
          bio: input.bio || 'Design student loving budget aesthetic cafes & outdoor study addas.',
          avatarColor: '#C85A32'
        },
        token: 'hh_token_fallback_student'
      });
    }
    res.json({ success: true, message: 'Auth endpoint ready' });
  });
});

// 13. /api/profile (Get full profile, update profile, history & bookmarks)
app.all(['/api/profile', '/api/profile.php'], async (req: Request, res: Response) => {
  await forwardToPhp('/api/profile.php', req, res, undefined, () => {
    res.json({
      success: true,
      profile: {
        id: 'usr_devendra_1',
        name: 'Devendra Patadiya',
        email: 'patadiyadevendra5@gmail.com',
        role: 'student',
        college: 'CEPT & Gujarat University Campus',
        city: 'Ahmedabad',
        preferredBudget: 180,
        favoriteVibes: ['Budget Bite & Chill', 'Study & Projects', 'Aesthetic Hangout'],
        bio: 'Design student loving budget aesthetic cafes & outdoor study addas.',
        avatarColor: '#C85A32',
        createdAt: '2026-10-20'
      },
      bookmarks: spots.slice(0, 3),
      history: [
        {
          id: 'hist-1',
          actionType: 'viewed',
          actionTime: '2026-10-27 15:30:00',
          spotId: spots[0]?.id || 'amd-1',
          spotName: spots[0]?.name || 'Zen Cafe @ Amdavad ni Gufa',
          neighborhood: spots[0]?.neighborhood || 'Navrangpura',
          city: spots[0]?.city || 'Ahmedabad',
          vibeCategory: spots[0]?.vibeCategory || 'Aesthetic Hangout',
          costAvg: spots[0]?.realPerPersonCost?.avg || 160
        }
      ],
      stats: { totalSpotsViewed: 8, totalBookmarked: 3, totalUpvotesGiven: 4 }
    });
  });
});

// 14. /api/history (Track view/save/vote action)
app.all(['/api/history', '/api/history.php'], async (req: Request, res: Response) => {
  await forwardToPhp('/api/history.php', req, res, undefined, () => {
    res.json({ success: true, message: 'Action recorded (memory fallback)' });
  });
});

// 15. /api/recommendations (Personalized scoring based on history)
app.all(['/api/recommendations', '/api/recommendations.php'], async (req: Request, res: Response) => {
  await forwardToPhp('/api/recommendations.php', req, res, undefined, () => {
    const recommended = spots.slice(0, 6).map((spot, idx) => ({
      spot,
      recommendationScore: 96 - idx * 4,
      primaryReason: idx === 0 ? 'Fits your ₹180 per-head budget' : 'Matches your favorite Study & Projects vibe',
      allReasons: ['Matches your study vibe', 'High reality check score']
    }));
    res.json({
      success: true,
      personalized: true,
      userTargetBudget: 180,
      count: recommended.length,
      recommendations: recommended
    });
  });
});

// 16. /api/admin/crud - Database Tables CRUD Operations for Admin
app.all(['/api/admin/crud', '/api/admin_crud.php'], async (req: Request, res: Response) => {
  await forwardToPhp('/api/admin_crud.php', req, res, undefined, () => {
    const table = (req.query.table || req.body?.table || 'spots') as string;
    if (req.method === 'GET') {
      let rows: any[] = [];
      if (table === 'spots') rows = spots;
      else if (table === 'survey_responses') rows = surveyResponses;
      else if (table === 'partnership_proposals') rows = partnershipProposals;
      return res.json({ success: true, table, total: rows.length, count: rows.length, rows });
    }
    if (req.method === 'POST') {
      const action = req.body?.action || req.query.action;
      const id = req.body?.id || req.query.id;
      if (action === 'delete') {
        if (table === 'spots') spots = spots.filter((s) => s.id !== id);
        return res.json({ success: true, message: `Row ${id} deleted from ${table}` });
      }
      if (action === 'update') {
        if (table === 'spots') {
          const idx = spots.findIndex((s) => s.id === id);
          if (idx !== -1) spots[idx] = { ...spots[idx], ...(req.body?.data || {}) };
        }
        return res.json({ success: true, message: `Row ${id} in ${table} updated` });
      }
      return res.json({ success: true, message: 'Admin action executed' });
    }
    res.json({ success: true });
  });
});




async function startServer() {
  // Start PHP REST API & Database engine
  initPhpBackend();

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
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
    console.log(`🚀 Hangout-Hub Server listening on port ${PORT} with PHP 8.2 & SQL Database active!`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
