/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { AHMEDABAD_SPOTS, AHMEDABAD_COMMUNITY_FEED } from './src/data/initialData.ts';
import { HangoutSpot, SurveyResponse, CafePartnershipProposal } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-memory data store initialized with verified Ahmedabad spots
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

// ======================== API ROUTES ========================

// 1. GET /api/spots - Retrieve hangout spots with smart filters
app.get('/api/spots', (req: Request, res: Response) => {
  const { search, city, vibe, maxBudget, minGroupSize, hasWifi, hasPlugs, lateNight, campusArea } = req.query;

  let filtered = [...spots];

  // City filter (e.g., 'Ahmedabad', 'Gandhinagar', 'Delhi NCR', 'Bengaluru', 'Mumbai', 'Pune', 'all')
  if (city && typeof city === 'string' && city !== 'all') {
    const cLower = city.toLowerCase().trim();
    filtered = filtered.filter(
      (s) =>
        (s.city && s.city.toLowerCase() === cLower) ||
        (s.neighborhood && s.neighborhood.toLowerCase().includes(cLower)) ||
        s.tags.some((t) => t.toLowerCase() === cLower)
    );
  }

  // General text search (matches cafe name, tagline, neighborhood, city, campus name, tags)
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
    city: (city as string) || 'all',
    count: filtered.length,
    spots: filtered
  });
});

// 2. GET /api/spots/:id
app.get('/api/spots/:id', (req: Request, res: Response) => {
  const spot = spots.find((s) => s.id === req.params.id);
  if (!spot) {
    return res.status(404).json({ success: false, error: 'Spot not found' });
  }
  res.json({ success: true, spot });
});

// 3. POST /api/spots - Student scout submission from ANY campus or city
app.post('/api/spots', (req: Request, res: Response) => {
  try {
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
      officialClaimCost: body.officialClaimCost || 'Food app listed ₹500 for two',
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
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/spots/:id/vote
app.post('/api/spots/:id/vote', (req: Request, res: Response) => {
  const spot = spots.find((s) => s.id === req.params.id);
  if (!spot) {
    return res.status(404).json({ success: false, error: 'Spot not found' });
  }
  spot.scoutReview.upvotes += 1;
  res.json({ success: true, upvotes: spot.scoutReview.upvotes });
});

app.get('/api/spots/:id/vote', (req: Request, res: Response) => {
  const spot = spots.find((s) => s.id === req.params.id);
  if (!spot) {
    return res.status(404).json({ success: false, error: 'Spot not found' });
  }
  spot.scoutReview.upvotes += 1;
  res.json({ success: true, upvotes: spot.scoutReview.upvotes });
});

// 5. GET /api/survey
app.get('/api/survey', (_req: Request, res: Response) => {
  const stats = calculateSurveyStats();
  res.json({
    success: true,
    stats,
    responses: surveyResponses
  });
});

// 6. POST /api/survey
app.post('/api/survey', (req: Request, res: Response) => {
  try {
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
      studentName: studentName?.trim() || 'Amdavad Student',
      collegeOrCampus: collegeOrCampus?.trim() || 'Ahmedabad Campus',
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
      message: 'Feedback received for Ahmedabad campus guide!',
      response: newResponse,
      stats: updatedStats
    });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to record response' });
  }
});

// 7. POST /api/partnerships
app.post('/api/partnerships', (req: Request, res: Response) => {
  try {
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
      cafeName: (cafeName || 'Ahmedabad Cafe').trim(),
      ownerName: (ownerName || 'Cafe Owner').trim(),
      contactEmail: (contactEmail || 'partner@cafe.com').trim(),
      contactPhone: contactPhone?.trim() || '',
      address: address?.trim() || 'Ahmedabad',
      proposedPerPersonCost: Number(proposedPerPersonCost) || 200,
      groupCapacity: Number(groupCapacity) || 8,
      offeredStudentDiscount: offeredStudentDiscount?.trim() || '10% student discount for groups of 4+',
      hasFastWifi: Boolean(hasFastWifi),
      notes: notes?.trim() || '',
      submittedAt: new Date().toISOString().split('T')[0]
    };

    partnershipProposals.unshift(newProposal);

    res.status(201).json({
      success: true,
      message: 'Partnership proposal received! Our Ahmedabad scout team will visit your cafe to verify seating and menu pricing within 48 hours.',
      proposal: newProposal
    });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to submit partnership' });
  }
});

app.get('/api/partnerships', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: partnershipProposals.length,
    proposals: partnershipProposals
  });
});

// 8. GET /api/stats
app.get('/api/stats', (_req: Request, res: Response) => {
  const avgCost = Math.round(
    spots.reduce((acc, s) => acc + s.realPerPersonCost.avg, 0) / (spots.length || 1)
  );
  const totalUpvotes = spots.reduce((acc, s) => acc + s.scoutReview.upvotes, 0);

  res.json({
    success: true,
    city: 'Ahmedabad',
    totalSpots: spots.length,
    studentsSurveyed: surveyResponses.length + 180,
    totalScoutUpvotes: totalUpvotes,
    averagePerPersonCost: avgCost,
    activePartnerships: partnershipProposals.length
  });
});

async function startServer() {
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
    console.log(`Server listening on port ${PORT} (Ahmedabad Edition, NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
