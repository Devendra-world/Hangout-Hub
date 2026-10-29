/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HangoutSpot, SurveyResponse } from '../types/index.ts';

export const INITIAL_SPOTS: HangoutSpot[] = [
  // ================= AHMEDABAD & GANDHINAGAR =================
  {
    id: 'spot-zen-gufa',
    name: 'Zen Cafe @ Amdavad ni Gufa',
    tagline: 'Open-air amphitheatre under neem trees next to M.F. Husain & B.V. Doshi’s architectural cave',
    city: 'Ahmedabad',
    campusName: 'CEPT & Gujarat Univ',
    neighborhood: 'Navrangpura',
    distanceToCampus: '0.1 km (2 min walk from CEPT & Gujarat Univ)',
    vibeCategory: 'Aesthetic Hangout',
    realPerPersonCost: {
      min: 110,
      max: 220,
      avg: 160,
      popularOrderExample: 'Ginger Mint Iced Tea + Thin Crust Margherita Slice + Samosa = ₹160'
    },
    officialClaimCost: 'Zomato lists: ₹650 for two (misleading! Tea & quick bites are only ₹80–₹120)',
    groupSeating: {
      maxGroupSize: 18,
      seatingDescription: 'Outdoor amphitheatre stone steps + rustic wooden tables. Easily seats 12–18 students together in the open air without feeling cramped.',
      pushTogetherAllowed: true,
      boothCount: 0,
      reservationNeeded: false,
      reservationTip: 'Walk-ins always welcome. Golden hour (5:30 PM to 7:00 PM) has the best sunset light through the neem leaves.'
    },
    amenities: {
      wifiSpeedMbps: 35,
      wifiReliability: 'Decent for Browsing',
      powerOutlets: 'Select Wall Tables',
      noiseDecibels: 54,
      noiseDescription: 'Breezy outdoor campus debates, acoustic guitar strums, and rustling trees',
      boardGamesAvailable: false,
      outsideCakeAllowed: true,
      studentDiscountAvailable: true,
      discountNote: '10% student concession on coffee combos with CEPT / GU / AU ID',
      airConditioned: false,
      openLateNight: true,
      closingTime: '11:00 PM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/amdavad-gufa-cafe',
      reelCreator: '@ahmedabad_cafe_diaries',
      reelHypeClaim: 'Secret underground cave dining experience with Paris-style aesthetic!',
      groundRealityTruth: 'The cave (Gufa) is an art gallery next door, while the cafe is actually open-air under gorgeous neem trees. Incredibly peaceful, zero rush to leave, and arguably the most artistic hangout spot in Ahmedabad.',
      realityScore: 92
    },
    scoutReview: {
      scoutName: 'Kavya & Harsh (CEPT Architecture & AU)',
      scoutCollege: 'CEPT University Campus Scout',
      scoutNotes: 'The ultimate student hangout in Ahmedabad. We spend 3 hours here discussing studio jury projects. Staff never pushes you to re-order.',
      verifiedDate: 'Oct 2026',
      upvotes: 312
    },
    tags: ['Near CEPT', 'Open Air Neem Shade', 'Architectural Icon', 'Under ₹200', 'Creative Hub'],
    visualTheme: {
      primaryColor: '#78350F',
      patternType: 'warm',
      heroIconName: 'Coffee'
    },
    partnership: {
      isPartner: true,
      offerTitle: 'Design Studio Special',
      offerDetails: 'Free iced tea upgrade for CEPT, NID & AU student groups on weekdays before 5 PM.'
    }
  },
  {
    id: 'spot-shambhu-hl',
    name: "Shambhu's Coffee Bar (HL Six Roads)",
    tagline: 'The undisputed legendary campus institution for frothy thick cold coffee, grilled puffs & midnight chai',
    city: 'Ahmedabad',
    campusName: 'HL Commerce & St. Xavier’s',
    neighborhood: 'Navrangpura',
    distanceToCampus: '0.2 km (3 min walk from HL College & St. Xavier’s)',
    vibeCategory: 'Budget Bite & Chill',
    realPerPersonCost: {
      min: 50,
      max: 130,
      avg: 85,
      popularOrderExample: 'Iconic Frothy Thick Cold Coffee (₹55) + Cheese Chilli Puff (₹40) = ₹95'
    },
    officialClaimCost: 'Google Maps: ₹250 for two (actual per-head cost is under ₹90!)',
    groupSeating: {
      maxGroupSize: 20,
      seatingDescription: 'Wide pavement curb seating + outdoor wooden benches and standing tables. Accommodates 15–20 classmates casually around bikes.',
      pushTogetherAllowed: true,
      boothCount: 0,
      reservationNeeded: false,
      reservationTip: 'Never needs reservation. Peak crowd arrives at 11 AM (post-class) and 9:30 PM (night hangout).'
    },
    amenities: {
      wifiSpeedMbps: 20,
      wifiReliability: 'Spotty',
      powerOutlets: 'None',
      noiseDecibels: 74,
      noiseDescription: 'Energetic street banter, college laughter, clinking glasses, and revving bikes',
      boardGamesAvailable: false,
      outsideCakeAllowed: true,
      studentDiscountAvailable: false,
      discountNote: 'Prices are already at direct student street rates',
      airConditioned: false,
      openLateNight: true,
      closingTime: '1:30 AM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/hl-cold-coffee',
      reelCreator: '@amdavad_food_hunt',
      reelHypeClaim: 'Viral chocolate river cold coffee that will blow your mind for ₹50!',
      groundRealityTruth: 'The cold coffee is frothy, thick, and genuinely great value. It is a street-side campus cafe, not a luxury AC lounge. If you want pure Ahmedabad student nostalgia and spend under ₹100 with 10 friends, this is unbeatable.',
      realityScore: 95
    },
    scoutReview: {
      scoutName: 'Dhruv & Riya (B.Com & BBA)',
      scoutCollege: 'HL College of Commerce',
      scoutNotes: 'Every single exam celebration starts and ends at Shambhu’s. ₹90 per head for cold coffee and cheese puff is the gold standard.',
      verifiedDate: 'Oct 2026',
      upvotes: 420
    },
    tags: ['Under ₹100', 'HL College Classic', 'Late Night to 1:30 AM', 'Cold Coffee', 'Mass Group Hangout'],
    visualTheme: {
      primaryColor: '#B45309',
      patternType: 'warm',
      heroIconName: 'Coffee'
    }
  },
  {
    id: 'spot-caffix-tech',
    name: 'Caffix - The Tech Cafe',
    tagline: 'Minimalist glasshouse work cafe with 120 Mbps fiber and power sockets at every single table',
    city: 'Ahmedabad',
    campusName: 'IIM-A & Vastrapur Lake',
    neighborhood: 'Vastrapur',
    distanceToCampus: '0.6 km (7 min from IIM Ahmedabad & Ahmedabad University)',
    vibeCategory: 'Study & Projects',
    realPerPersonCost: {
      min: 190,
      max: 340,
      avg: 260,
      popularOrderExample: 'Hazelnut Iced Latte + Peri Peri Paneer Panini Melt = ₹265'
    },
    officialClaimCost: 'Zomato lists: ₹700 for two (pretty accurate, coffee is premium cafe rate)',
    groupSeating: {
      maxGroupSize: 12,
      seatingDescription: 'Two 8-seater shared oak project tables with surge-protected charging hubs directly built into the table surface.',
      pushTogetherAllowed: true,
      boothCount: 2,
      reservationNeeded: false,
      reservationTip: 'Arrive before 2:30 PM on weekdays to grab the large table near the front glass window for group coding.'
    },
    amenities: {
      wifiSpeedMbps: 120,
      wifiReliability: 'Fast & Reliable',
      powerOutlets: 'Every Table',
      noiseDecibels: 48,
      noiseDescription: 'Soft ambient lofi beats, clicking mechanical keyboards, quiet study vibe',
      boardGamesAvailable: false,
      outsideCakeAllowed: false,
      studentDiscountAvailable: true,
      discountNote: '15% discount for IIM-A, CEPT, and AU students with college ID',
      airConditioned: true,
      openLateNight: false,
      closingTime: '11:00 PM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/caffix-tech-cafe',
      reelCreator: '@workspaces_gujarat',
      reelHypeClaim: 'The Silicon Valley cafe of Ahmedabad where everyone is building startups and chargers are unlimited!',
      groundRealityTruth: 'Reel was actually 100% genuine! The WiFi is screaming fast (tested 118 Mbps), there are multi-pin sockets for 8 laptops at the main table, and coffee quality is top-notch. Ideal for hackathons & group presentations.',
      realityScore: 98
    },
    scoutReview: {
      scoutName: 'Aman Patel & Squad (Data Science)',
      scoutCollege: 'Ahmedabad University Tech Lead',
      scoutNotes: 'We coded our final year project here for 5 hours straight. Sockets never tripped, AC was icy, and the iced Americano kept us awake.',
      verifiedDate: 'Oct 2026',
      upvotes: 215
    },
    tags: ['120 Mbps WiFi', 'Power Hubs Every Table', 'AC', 'Silent Study', 'Vastrapur'],
    visualTheme: {
      primaryColor: '#1D4ED8',
      patternType: 'minimal',
      heroIconName: 'Laptop'
    },
    partnership: {
      isPartner: true,
      offerTitle: 'Project Squad Pass',
      offerDetails: 'Free cold brew refill for groups of 4+ working on laptops for over 2 hours.'
    }
  },
  {
    id: 'spot-roastery-sbr',
    name: 'Roastery Cultur Cafe & Courtyard',
    tagline: 'Sprawling brick-red courtyard with artisan pour-overs, lush monstera plants, and sunset breeze',
    city: 'Ahmedabad',
    campusName: 'Sindhu Bhavan (SBR)',
    neighborhood: 'Bodakdev',
    distanceToCampus: '2.5 km (10 min drive from Vastrapur / Drive-In)',
    vibeCategory: 'Aesthetic Hangout',
    realPerPersonCost: {
      min: 240,
      max: 420,
      avg: 320,
      popularOrderExample: 'Cascara Sparkler + Truffle Fries Platter Share + Sourdough Toast = ₹310/head (for 5 friends)'
    },
    officialClaimCost: 'Zomato lists: ₹950 for two (sharing group platters brings per-head cost to ₹310)',
    groupSeating: {
      maxGroupSize: 14,
      seatingDescription: 'Wide wooden tables under outdoor brick canopies + indoor AC conservatory. Tables seat 8–10 easily.',
      pushTogetherAllowed: true,
      boothCount: 3,
      reservationNeeded: true,
      reservationTip: 'Friday & Saturday evenings have a 30-min waiting list. Best for group get-togethers on weekday afternoons.'
    },
    amenities: {
      wifiSpeedMbps: 65,
      wifiReliability: 'Fast & Reliable',
      powerOutlets: 'Select Wall Tables',
      noiseDecibels: 58,
      noiseDescription: 'Pleasant hum of espresso grinders, warm courtyard fountain, and indie pop',
      boardGamesAvailable: false,
      outsideCakeAllowed: true,
      studentDiscountAvailable: true,
      discountNote: '10% student concession on weekday afternoons with college ID',
      airConditioned: true,
      openLateNight: true,
      closingTime: '11:30 PM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/roastery-cultur-sbr',
      reelCreator: '@sbr_hangouts',
      reelHypeClaim: 'Dreamy European luxury villa cafe with imported beans and aesthetic photo corners!',
      groundRealityTruth: 'The aesthetics and courtyard architecture are genuinely gorgeous for group photos. Food is high quality. Tip: Sharing their giant truffle fries and 14" pizzas makes it very budget-friendly for a group of 5-6 friends.',
      realityScore: 89
    },
    scoutReview: {
      scoutName: 'Sneha Shah & Friends',
      scoutCollege: 'NID & CEPT Postgrads',
      scoutNotes: 'The natural daylight and red-brick backdrop make this our top pick for catching up with friends. Share the platters to keep the bill under ₹350 each.',
      verifiedDate: 'Oct 2026',
      upvotes: 198
    },
    tags: ['Sindhu Bhavan SBR', 'Brick Courtyard', 'Specialty Coffee', 'Aesthetic Photos', 'Sunset Vibe'],
    visualTheme: {
      primaryColor: '#991B1B',
      patternType: 'botanical',
      heroIconName: 'Sparkles'
    }
  },
  {
    id: 'spot-unlocked-games',
    name: 'Unlocked - Board Game Lounge',
    tagline: '250+ international board games, comfy couch nooks, and unlimited group game banter',
    city: 'Ahmedabad',
    campusName: 'GLS & St. Xavier’s (CG Road)',
    neighborhood: 'Navrangpura',
    distanceToCampus: '0.8 km (8 min walk from GLS & St. Xavier’s)',
    vibeCategory: 'Board Games & Fun',
    realPerPersonCost: {
      min: 190,
      max: 320,
      avg: 240,
      popularOrderExample: 'Weekday Gaming Pass (₹100) + Loaded Nachos Bowl + Cold Coffee = ₹230'
    },
    officialClaimCost: 'Google Maps: ₹750 for two (doesn’t clarify how game cover fee works)',
    groupSeating: {
      maxGroupSize: 16,
      seatingDescription: 'Wide low dining tables built specifically for large games like Catan, Ticket to Ride, and Secret Hitler.',
      pushTogetherAllowed: true,
      boothCount: 2,
      reservationNeeded: false,
      reservationTip: 'Walk-ins fine on Mon-Thu. Sunday evenings have college board game tournaments so booking is recommended.'
    },
    amenities: {
      wifiSpeedMbps: 50,
      wifiReliability: 'Fast & Reliable',
      powerOutlets: 'Every Table',
      noiseDecibels: 72,
      noiseDescription: 'Lively dice rolling, cheering, laughter, and animated bluffing debates',
      boardGamesAvailable: true,
      outsideCakeAllowed: true,
      studentDiscountAvailable: true,
      discountNote: '50% off table game rental fee with valid college ID on Mon-Thu',
      airConditioned: true,
      openLateNight: true,
      closingTime: '11:45 PM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/unlocked-ahmedabad',
      reelCreator: '@amdavadi_hangouts',
      reelHypeClaim: 'Insane underground den where you can play hundreds of games with unlimited food!',
      groundRealityTruth: 'Food is not unlimited, but the game masters will sit with your squad and patiently teach you complex games for free. Perfect post-exam stress buster for a group of 6-8 friends.',
      realityScore: 84
    },
    scoutReview: {
      scoutName: 'Parth & Team (GLS & Nirma Alumni)',
      scoutCollege: 'GLS University Campus Scout',
      scoutNotes: 'Best spot in Navrangpura when you want something more fun than just sitting and scrolling Instagram. 6 of us spent 3 hours playing Catan and spent ₹230 each.',
      verifiedDate: 'Oct 2026',
      upvotes: 188
    },
    tags: ['250+ Board Games', 'Game Masters', 'AC', 'Navrangpura', 'Squad Fun'],
    visualTheme: {
      primaryColor: '#7C3AED',
      patternType: 'geometric',
      heroIconName: 'Gamepad2'
    },
    partnership: {
      isPartner: true,
      offerTitle: 'Student Game Night',
      offerDetails: '50% off game cover charge + free butter popcorn bowl for college groups of 5+.'
    }
  },
  {
    id: 'spot-mocha-cabanas',
    name: 'Mocha Cafe & Cabanas',
    tagline: 'Boho outdoor cabanas with fairy lights, giant group sizzler platters, and zero cake-cutting fees',
    city: 'Ahmedabad',
    campusName: 'Bodakdev & SBR',
    neighborhood: 'Bodakdev',
    distanceToCampus: '2.8 km (12 min transit from Vastrapur)',
    vibeCategory: 'Late Night Adda',
    realPerPersonCost: {
      min: 280,
      max: 460,
      avg: 340,
      popularOrderExample: '18" Group Margherita Pizza + Mezze Platter + Chocolate Avalanche Share = ₹330/head (for 6 friends)'
    },
    officialClaimCost: 'Zomato lists: ₹1,200 for two (misleading! Sharing giant platters drops per-head cost to ₹330)',
    groupSeating: {
      maxGroupSize: 16,
      seatingDescription: 'Curtained private cabanas + modular open-air tables that join seamlessly for groups of 12–16.',
      pushTogetherAllowed: true,
      boothCount: 5,
      reservationNeeded: true,
      reservationTip: 'Reserve a cabana 2 hours in advance if planning a friend’s birthday or farewell treat.'
    },
    amenities: {
      wifiSpeedMbps: 45,
      wifiReliability: 'Decent for Browsing',
      powerOutlets: 'Select Wall Tables',
      noiseDecibels: 64,
      noiseDescription: 'Breezy cabana acoustics with upbeat acoustic chill mixes',
      boardGamesAvailable: true,
      outsideCakeAllowed: true,
      studentDiscountAvailable: true,
      discountNote: '15% group discount on total bill exceeding ₹1,800',
      airConditioned: true,
      openLateNight: true,
      closingTime: '1:00 AM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/mocha-ahmedabad-cabanas',
      reelCreator: '@delish_amdavad',
      reelHypeClaim: 'Santorini-themed fairy lit cabanas with smoking liquid nitrogen desserts!',
      groundRealityTruth: 'The cabanas look magical at night with warm string lights. The chocolate avalanche is massive and easily shared by 6 people. Zero fee for bringing your own outside birthday cake, and they give free plates.',
      realityScore: 91
    },
    scoutReview: {
      scoutName: 'Ananya & Shrey (IIM-A & Nirma)',
      scoutCollege: 'IIM Ahmedabad & Nirma Squad',
      scoutNotes: 'We celebrated our friend’s 21st birthday here. Saved ₹500 because other cafes charge a "cake cutting fee", but Mocha welcomed us warmly and helped us cut the cake.',
      verifiedDate: 'Oct 2026',
      upvotes: 275
    },
    tags: ['Outside Cake Allowed', 'Private Cabanas', 'Late Night to 1 AM', 'Birthday Treats', 'Bodakdev'],
    visualTheme: {
      primaryColor: '#059669',
      patternType: 'botanical',
      heroIconName: 'Users'
    },
    partnership: {
      isPartner: true,
      offerTitle: 'Birthday Squad Deal',
      offerDetails: 'Free garlic pull-apart bread plate + zero outside cake fee for groups of 6+ with college ID.'
    }
  },
  {
    id: 'spot-kuro-sando',
    name: 'Kuro - Japanese Minimalist Cafe',
    tagline: 'Poured concrete, zen bonsai garden, iced ceremonial matcha, and Japanese milk bread sandos',
    city: 'Ahmedabad',
    campusName: 'Sindhu Bhavan Road',
    neighborhood: 'Bodakdev',
    distanceToCampus: '3.0 km (12 min ride from University Area)',
    vibeCategory: 'Aesthetic Hangout',
    realPerPersonCost: {
      min: 260,
      max: 420,
      avg: 330,
      popularOrderExample: 'Ceremonial Iced Matcha Latte + Truffle Egg Sando + Cloud Basque Cheesecake = ₹340'
    },
    officialClaimCost: 'Google Maps: ₹1,000 for two',
    groupSeating: {
      maxGroupSize: 8,
      seatingDescription: 'Minimalist monolithic wooden tables. Comfortably seats groups of 6 to 8 friends.',
      pushTogetherAllowed: false,
      boothCount: 1,
      reservationNeeded: false,
      reservationTip: 'Weekday mornings and late afternoons are calm. Avoid peak 7 PM weekend rush for group seating.'
    },
    amenities: {
      wifiSpeedMbps: 80,
      wifiReliability: 'Fast & Reliable',
      powerOutlets: 'Select Wall Tables',
      noiseDecibels: 50,
      noiseDescription: 'Tranquil Japanese ambient acoustics, gentle water feature, calm conversation',
      boardGamesAvailable: false,
      outsideCakeAllowed: false,
      studentDiscountAvailable: true,
      discountNote: '10% student concession on all matcha and espresso beverages',
      airConditioned: true,
      openLateNight: false,
      closingTime: '10:30 PM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/kuro-coffee-ahmedabad',
      reelCreator: '@minimal_spaces_in',
      reelHypeClaim: 'Transport yourself to a Kyoto coffee garden right here in Ahmedabad!',
      groundRealityTruth: 'The aesthetic is 10/10 clean and photogenic. Great for 3-6 close friends who appreciate serious specialty matcha and pour-overs. Not for loud rowdy game nights, but superb for intimate deep conversations.',
      realityScore: 88
    },
    scoutReview: {
      scoutName: 'Tanvi M. (Design & Visual Arts)',
      scoutCollege: 'National Institute of Design (NID)',
      scoutNotes: 'Unbelievably aesthetic lighting for design portfolio shoots and calm coffee chats. Their iced matcha is authentic ceremonial grade.',
      verifiedDate: 'Oct 2026',
      upvotes: 142
    },
    tags: ['Japanese Minimalist', 'Ceremonial Matcha', 'AC', 'Zen Bonsai', 'SBR'],
    visualTheme: {
      primaryColor: '#16A34A',
      patternType: 'minimal',
      heroIconName: 'Sparkles'
    }
  },
  {
    id: 'spot-project-cafe',
    name: 'The Project Cafe',
    tagline: 'Art-gallery cafe in a yellow heritage bungalow with botanical courtyard and curated design wares',
    city: 'Ahmedabad',
    campusName: 'NID & Polytech (Ambawadi)',
    neighborhood: 'Ambawadi',
    distanceToCampus: '0.9 km (10 min walk from CEPT & L.D. Arts)',
    vibeCategory: 'Study & Projects',
    realPerPersonCost: {
      min: 180,
      max: 320,
      avg: 240,
      popularOrderExample: 'Iced Vietnamese Drip + Basil Pesto Penne Bowl = ₹245'
    },
    officialClaimCost: 'Zomato lists: ₹750 for two',
    groupSeating: {
      maxGroupSize: 12,
      seatingDescription: 'Charming heritage courtyard tables surrounded by art installations. Easily joins for groups of 10–12.',
      pushTogetherAllowed: true,
      boothCount: 2,
      reservationNeeded: false,
      reservationTip: 'Walk-ins fine. Outdoor garden gets breezy under the fan misting systems in the afternoon.'
    },
    amenities: {
      wifiSpeedMbps: 55,
      wifiReliability: 'Fast & Reliable',
      powerOutlets: 'Select Wall Tables',
      noiseDecibels: 52,
      noiseDescription: 'Creative discussions, acoustic indie, artistic vibe',
      boardGamesAvailable: false,
      outsideCakeAllowed: true,
      studentDiscountAvailable: true,
      discountNote: '12% discount for NID, CEPT, and Polytech students with ID',
      airConditioned: true,
      openLateNight: true,
      closingTime: '11:00 PM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/the-project-cafe-ambawadi',
      reelCreator: '@heritage_spaces_amdavad',
      reelHypeClaim: 'Yellow heritage mansion where every piece of furniture is a piece of art you can buy!',
      groundRealityTruth: 'The bungalow is genuinely lovely and artistic. Very welcoming staff, creative college crowd, and peaceful ambiance. Highly recommended for group project discussions without background kitchen clatter.',
      realityScore: 93
    },
    scoutReview: {
      scoutName: 'Rohan & Dev (Architecture Sem 6)',
      scoutCollege: 'CEPT & NID Student Scouts',
      scoutNotes: 'We sat in the back verandah table for 3.5 hours working on our drafting sheets. Staff gave us iced water refills continuously without nudging us to leave.',
      verifiedDate: 'Oct 2026',
      upvotes: 184
    },
    tags: ['Ambawadi', 'Artisan Bungalow', 'Near Polytech', 'AC + Garden', 'Creative Vibe'],
    visualTheme: {
      primaryColor: '#D97706',
      patternType: 'warm',
      heroIconName: 'Coffee'
    }
  },
  {
    id: 'spot-gnr-teapost',
    name: 'Tea Post & Adda Benches',
    tagline: 'Massive open-air garden adda right outside PDPU & GNLU gates with ₹40 ginger pudina chai & bun maska',
    city: 'Gandhinagar',
    campusName: 'PDPU, GNLU & DA-IICT',
    neighborhood: 'Raysan / Bhaijipura',
    distanceToCampus: '0.4 km (5 min walk from PDPU main gate)',
    vibeCategory: 'Budget Bite & Chill',
    realPerPersonCost: {
      min: 45,
      max: 110,
      avg: 70,
      popularOrderExample: 'Pudina Ginger Chai (₹35) + Fresh Bun Maska (₹35) = ₹70'
    },
    officialClaimCost: 'Google Maps: ₹150 for two (leaves out tea refills and student puff combos)',
    groupSeating: {
      maxGroupSize: 22,
      seatingDescription: 'Sprawling outdoor stone benches and green lawns. Entire college project groups of 15–20 sit together effortlessly.',
      pushTogetherAllowed: true,
      boothCount: 0,
      reservationNeeded: false,
      reservationTip: 'Never needs reservation. Peak student rush is 4:30 PM to 8:00 PM post-lab sessions.'
    },
    amenities: {
      wifiSpeedMbps: 25,
      wifiReliability: 'Decent for Browsing',
      powerOutlets: 'Select Wall Tables',
      noiseDecibels: 66,
      noiseDescription: 'Breezy campus banter, carom boards, acoustic music',
      boardGamesAvailable: true,
      outsideCakeAllowed: true,
      studentDiscountAvailable: false,
      discountNote: 'Direct budget student pricing',
      airConditioned: false,
      openLateNight: true,
      closingTime: '12:30 AM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/pdpu-tea-adda',
      reelCreator: '@gandhinagar_diaries',
      reelHypeClaim: 'Fairytale garden chai lounge with gourmet snacks!',
      groundRealityTruth: 'It is a friendly, relaxed campus garden adda with endless seating. Perfect for evening de-stress sessions with 15 hostel mates without spending over ₹80 each.',
      realityScore: 92
    },
    scoutReview: {
      scoutName: 'Siddharth & Megha (PDPU Energy Studies)',
      scoutCollege: 'PDPU Gandhinagar Scout',
      scoutNotes: 'The go-to adda after 5 PM lectures. Never spent more than ₹80 each even after two cups of chai and hot samosas.',
      verifiedDate: 'Oct 2026',
      upvotes: 245
    },
    tags: ['Gandhinagar', 'PDPU', 'GNLU', 'Under ₹100', 'Mass Group Seating', 'Late Night'],
    visualTheme: {
      primaryColor: '#059669',
      patternType: 'botanical',
      heroIconName: 'Coffee'
    }
  },
  {
    id: 'spot-prahladnagar-shakemaker',
    name: 'The Shake Maker & Puffs',
    tagline: 'Vibrant outdoor courtyard with thick milkshakes, loaded wedges, and giant group bench tables',
    city: 'Ahmedabad',
    campusName: 'Prahladnagar Garden Hub',
    neighborhood: 'Prahladnagar',
    distanceToCampus: '1.8 km (10 min from SG Highway campuses)',
    vibeCategory: 'Budget Bite & Chill',
    realPerPersonCost: {
      min: 75,
      max: 160,
      avg: 110,
      popularOrderExample: 'Chocolate Brownie Shake + Peri Peri Cheese Puff = ₹115'
    },
    officialClaimCost: 'Zomato lists: ₹350 for two',
    groupSeating: {
      maxGroupSize: 14,
      seatingDescription: 'Paved garden promenade with wide wooden benches. Great for groups of 8 to 14 friends.',
      pushTogetherAllowed: true,
      boothCount: 0,
      reservationNeeded: false,
      reservationTip: 'Busiest after 8:30 PM. Walk-ins easily find outdoor bench space.'
    },
    amenities: {
      wifiSpeedMbps: 30,
      wifiReliability: 'Decent for Browsing',
      powerOutlets: 'Few / Request Only',
      noiseDecibels: 68,
      noiseDescription: 'Bustling college crowd, music, evening laughter',
      boardGamesAvailable: false,
      outsideCakeAllowed: true,
      studentDiscountAvailable: true,
      discountNote: '10% student concession with college ID card',
      airConditioned: false,
      openLateNight: true,
      closingTime: '1:00 AM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/prahladnagar-shakes',
      reelCreator: '@amdavad_night_eats',
      reelHypeClaim: 'Viral mega monster shakes overflowing with chocolate fudge!',
      groundRealityTruth: 'The thick shakes are genuinely thick and delicious. Prahladnagar Garden breeze makes evening outdoor seating super comfortable for squads of 8+.',
      realityScore: 90
    },
    scoutReview: {
      scoutName: 'Aayush M. (Nirma Univ)',
      scoutCollege: 'Nirma University Scout',
      scoutNotes: 'Great spot to catch up with 6-8 friends after coaching or exams. Outdoor seating is relaxed and nobody rushes you.',
      verifiedDate: 'Oct 2026',
      upvotes: 165
    },
    tags: ['Prahladnagar', 'Shakes & Puffs', 'Late Night', 'Under ₹150', 'Bench Seating'],
    visualTheme: {
      primaryColor: '#D97706',
      patternType: 'warm',
      heroIconName: 'Coffee'
    }
  },

  // ================= NATIONAL CAMPUS SPOTS (SHOWCASING UNIVERSAL REACH) =================
  {
    id: 'spot-delhi-tomuncle',
    name: "Tom Uncle's Maggi Point & Adda",
    tagline: 'Legendary DU North Campus outdoor benches with 50+ varieties of masala maggi & cold coffee',
    city: 'Delhi NCR',
    campusName: 'DU North Campus (Hindu & Miranda)',
    neighborhood: 'University Enclave',
    distanceToCampus: '0.2 km (3 min walk from Ramjas & Kirori Mal)',
    vibeCategory: 'Budget Bite & Chill',
    realPerPersonCost: {
      min: 60,
      max: 140,
      avg: 90,
      popularOrderExample: 'Cheese Butter Peri Peri Maggi + Frothy Cold Coffee = ₹95'
    },
    officialClaimCost: 'Google Maps: ₹200 for two',
    groupSeating: {
      maxGroupSize: 20,
      seatingDescription: 'Open-air stone benches and lawns under leafy trees. Sits mass student batches of 15–20.',
      pushTogetherAllowed: true,
      boothCount: 0,
      reservationNeeded: false,
      reservationTip: 'Never needs booking. Peak rush right after 1 PM and 4 PM lectures.'
    },
    amenities: {
      wifiSpeedMbps: 20,
      wifiReliability: 'Decent for Browsing',
      powerOutlets: 'None',
      noiseDecibels: 72,
      noiseDescription: 'Bustling college debates, political banter, guitar sessions',
      boardGamesAvailable: false,
      outsideCakeAllowed: true,
      studentDiscountAvailable: false,
      discountNote: 'Subsidized student rates',
      airConditioned: false,
      openLateNight: true,
      closingTime: '11:00 PM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/tom-uncle-du',
      reelCreator: '@du_campus_food',
      reelHypeClaim: 'The most iconic Maggi in Asia with giant molten cheese pulls!',
      groundRealityTruth: 'It is a street campus counter with tree-shaded bench seating. Unmatched North Campus vibes for spending under ₹100 with your entire tutorial group.',
      realityScore: 96
    },
    scoutReview: {
      scoutName: 'Priya & Varun (Miranda & Hindu College)',
      scoutCollege: 'Delhi University Scout Network',
      scoutNotes: 'The sacred adda of North Campus. Everyone from freshers to alumni gathers here.',
      verifiedDate: 'Oct 2026',
      upvotes: 380
    },
    tags: ['Delhi NCR', 'DU North Campus', 'Under ₹100', 'Mass Group', 'Iconic Adda'],
    visualTheme: {
      primaryColor: '#B45309',
      patternType: 'warm',
      heroIconName: 'Coffee'
    }
  },
  {
    id: 'spot-blr-thirdwave',
    name: 'Third Wave Coffee & Loft',
    tagline: 'High-ceiling wooden loft with 150 Mbps fiber, multi-laptop charging hubs, and cold brews',
    city: 'Bengaluru',
    campusName: 'Christ University & Koramangala',
    neighborhood: 'Koramangala 4th Block',
    distanceToCampus: '0.8 km (10 min from Christ Main Campus)',
    vibeCategory: 'Study & Projects',
    realPerPersonCost: {
      min: 180,
      max: 350,
      avg: 240,
      popularOrderExample: 'Classic Cold Brew + Sourdough Toast Share = ₹230'
    },
    officialClaimCost: 'Zomato lists: ₹800 for two',
    groupSeating: {
      maxGroupSize: 12,
      seatingDescription: 'Two 10-seater shared oak project tables with integrated power strips on every table.',
      pushTogetherAllowed: true,
      boothCount: 2,
      reservationNeeded: false,
      reservationTip: 'Arrive by 2 PM for group seating before evening tech crowd.'
    },
    amenities: {
      wifiSpeedMbps: 150,
      wifiReliability: 'Fast & Reliable',
      powerOutlets: 'Every Table',
      noiseDecibels: 46,
      noiseDescription: 'Soft lofi music, clicking keyboards, focused student buzz',
      boardGamesAvailable: false,
      outsideCakeAllowed: false,
      studentDiscountAvailable: true,
      discountNote: '15% student discount on weekday afternoons with college ID',
      airConditioned: true,
      openLateNight: true,
      closingTime: '12:00 AM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/blr-cafe-loft',
      reelCreator: '@bengaluru_studyspaces',
      reelHypeClaim: 'Startup paradise where students and founders build billion dollar ideas!',
      groundRealityTruth: 'WiFi is reliably 140+ Mbps, power plugs work at every seat, and staff leaves you alone for 4 hours. Top tier study hub for college teams.',
      realityScore: 95
    },
    scoutReview: {
      scoutName: 'Karthik R. (Christ University MBA)',
      scoutCollege: 'Christ University Scout',
      scoutNotes: 'Finished our semester capstone report here. Sockets never tripped and WiFi was blazing fast.',
      verifiedDate: 'Oct 2026',
      upvotes: 210
    },
    tags: ['Bengaluru', 'Koramangala', '150 Mbps WiFi', 'Power Sockets', 'AC Study'],
    visualTheme: {
      primaryColor: '#1D4ED8',
      patternType: 'minimal',
      heroIconName: 'Laptop'
    }
  },
  {
    id: 'spot-pune-goodluck',
    name: 'Cafe Goodluck & Benches',
    tagline: 'Heritage 1935 Iranian cafe with melt-in-mouth bun maska, sweet chai, and FC Road college buzz',
    city: 'Pune',
    campusName: 'Fergusson College (FC Road)',
    neighborhood: 'Deccan Gymkhana',
    distanceToCampus: '0.1 km (1 min walk from Fergusson College Gate)',
    vibeCategory: 'Budget Bite & Chill',
    realPerPersonCost: {
      min: 50,
      max: 120,
      avg: 75,
      popularOrderExample: 'Bun Maska (₹35) + Special Iranian Chai (₹30) = ₹65'
    },
    officialClaimCost: 'Google Maps: ₹250 for two',
    groupSeating: {
      maxGroupSize: 16,
      seatingDescription: 'Marble top tables and wooden chairs that staff happily joins for college friend squads.',
      pushTogetherAllowed: true,
      boothCount: 0,
      reservationNeeded: false,
      reservationTip: 'Always walk-in friendly. Quick table turnaround.'
    },
    amenities: {
      wifiSpeedMbps: 20,
      wifiReliability: 'Spotty',
      powerOutlets: 'None',
      noiseDecibels: 72,
      noiseDescription: 'Clattering cups, hearty laughter, lively Pune college debates',
      boardGamesAvailable: false,
      outsideCakeAllowed: true,
      studentDiscountAvailable: false,
      discountNote: 'Subsidized heritage student rates',
      airConditioned: false,
      openLateNight: true,
      closingTime: '11:30 PM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/pune-goodluck-cafe',
      reelCreator: '@puneri_foodie',
      reelHypeClaim: 'The century-old bun maska that shaped generations of Pune students!',
      groundRealityTruth: 'The bun maska really is that soft and buttery. Unbeatable college atmosphere where ₹75 buys you great chai, history, and a table with friends.',
      realityScore: 98
    },
    scoutReview: {
      scoutName: 'Tanmay & Gauri (Fergusson College)',
      scoutCollege: 'Fergusson College Scout',
      scoutNotes: 'The heart and soul of FC Road. Post-lecture discussions always happen over Goodluck chai.',
      verifiedDate: 'Oct 2026',
      upvotes: 310
    },
    tags: ['Pune', 'FC Road', 'Fergusson College', 'Under ₹100', 'Heritage Adda'],
    visualTheme: {
      primaryColor: '#78350F',
      patternType: 'warm',
      heroIconName: 'Coffee'
    }
  },
  {
    id: 'spot-mumbai-prithvi',
    name: 'Prithvi Cafe & Open Courtyard',
    tagline: 'Fairy-lit open courtyard next to Prithvi Theatre with stuffed parathas, Irish coffee, and lively drama squad debates',
    city: 'Mumbai',
    campusName: 'Mithibai, NMIMS & Bhavans (Juhu)',
    neighborhood: 'Juhu',
    distanceToCampus: '1.2 km (8 min auto from Mithibai & NMIMS)',
    vibeCategory: 'Aesthetic Hangout',
    realPerPersonCost: {
      min: 120,
      max: 260,
      avg: 180,
      popularOrderExample: 'Cutting Chai + Aloo Cheese Paratha + Irish Coffee split = ₹175'
    },
    officialClaimCost: 'Zomato lists: ₹700 for two',
    groupSeating: {
      maxGroupSize: 18,
      seatingDescription: 'Bamboo chairs and wooden tables under giant green trees with fairy lights. Staff accommodates student circles of 10–18.',
      pushTogetherAllowed: true,
      boothCount: 0,
      reservationNeeded: false,
      reservationTip: 'Arrive right at 4:30 PM for easy walk-in seating before evening theatre shows.'
    },
    amenities: {
      wifiSpeedMbps: 35,
      wifiReliability: 'Decent for Browsing',
      powerOutlets: 'Select Wall Tables',
      noiseDecibels: 64,
      noiseDescription: 'Theatre artists rehearsing lines, college laughter, acoustic ambiance',
      boardGamesAvailable: false,
      outsideCakeAllowed: true,
      studentDiscountAvailable: false,
      discountNote: 'Pocket-friendly student menu pricing',
      airConditioned: false,
      openLateNight: true,
      closingTime: '11:00 PM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/prithvi-cafe-juhu',
      reelCreator: '@mumbai_campus_bites',
      reelHypeClaim: 'Celeb spotting cafe with ultra luxury coffee!',
      groundRealityTruth: 'Not pretentiously priced at all. A cup of legendary chai and parathas is around ₹150. Most welcoming creative courtyard in suburban Mumbai.',
      realityScore: 94
    },
    scoutReview: {
      scoutName: 'Rhea & Dev (Mithibai BMM)',
      scoutCollege: 'Mithibai College Scout',
      scoutNotes: 'The legendary Juhu college adda. Our whole college festival committee holds briefings here.',
      verifiedDate: 'Oct 2026',
      upvotes: 420
    },
    tags: ['Mumbai', 'Juhu', 'Mithibai', 'NMIMS', 'Aesthetic Courtyard', 'Under ₹200'],
    visualTheme: {
      primaryColor: '#B45309',
      patternType: 'warm',
      heroIconName: 'Coffee'
    }
  },
  {
    id: 'spot-mumbai-candies',
    name: 'Candies @ Pali Hill (Mac Craig)',
    tagline: 'Multi-storey Portuguese villa with mosaic tile terraces, ₹110 iced teas, mini chicken rolls, and sprawling squad rooms',
    city: 'Mumbai',
    campusName: 'St. Andrews & National College (Bandra)',
    neighborhood: 'Bandra West',
    distanceToCampus: '0.6 km (5 min walk from St. Andrews)',
    vibeCategory: 'Aesthetic Hangout',
    realPerPersonCost: {
      min: 110,
      max: 240,
      avg: 160,
      popularOrderExample: 'Iced Lemon Tea (₹90) + Chicken/Paneer Puff (₹60) = ₹150'
    },
    officialClaimCost: 'Google Maps: ₹650 for two',
    groupSeating: {
      maxGroupSize: 24,
      seatingDescription: '4 floors of mosaic stepped seating, cozy garden rooms, and breezy rooftop sun decks. Fits 20+ students easily.',
      pushTogetherAllowed: true,
      boothCount: 4,
      reservationNeeded: false,
      reservationTip: 'Walk up to the 3rd floor terrace for the emptiest big tables and best sea breeze.'
    },
    amenities: {
      wifiSpeedMbps: 40,
      wifiReliability: 'Decent for Browsing',
      powerOutlets: 'Select Wall Tables',
      noiseDecibels: 58,
      noiseDescription: 'Breezy multi-tier conversation, music, leafy greenery',
      boardGamesAvailable: true,
      outsideCakeAllowed: true,
      studentDiscountAvailable: true,
      discountNote: 'Special after-8-PM half-price bakery clearance on selected pastries',
      airConditioned: true,
      openLateNight: false,
      closingTime: '10:00 PM'
    },
    reelRealityCheck: {
      hasReel: true,
      reelUrl: 'https://instagram.com/reel/candies-bandra',
      reelCreator: '@sobo_suburban_eats',
      reelHypeClaim: 'Viral Portuguese mansion cafe where you will get lost!',
      groundRealityTruth: 'It genuinely feels like a Mediterranean villa maze. Perfect self-service counter where budget bites like rolls and iced tea cost under ₹150.',
      realityScore: 97
    },
    scoutReview: {
      scoutName: 'Arjun S. (St. Xavier’s / Bandra)',
      scoutCollege: 'Bandra Student Network',
      scoutNotes: 'Unmatched scale. You can sit with 15 friends on the terrace and never get asked to order more.',
      verifiedDate: 'Oct 2026',
      upvotes: 365
    },
    tags: ['Mumbai', 'Bandra', 'Villa Terrace', 'Under ₹200', 'Mass Group Seating'],
    visualTheme: {
      primaryColor: '#059669',
      patternType: 'botanical',
      heroIconName: 'Coffee'
    }
  }
];

export const AHMEDABAD_SPOTS = INITIAL_SPOTS;

export const INITIAL_FEEDBACK_FEED: SurveyResponse[] = [
  {
    id: 'feed-1',
    studentName: 'Aarav Patel',
    collegeOrCampus: 'CEPT University, Navrangpura',
    yearOfStudy: '3rd Year B.Arch',
    monthlyHangoutBudget: '₹2,500 - ₹4,000',
    primaryFrustration: 'Hidden costs & taxes turning a "budget" place into ₹500/head',
    worstExperienceWithApps: 'Zomato said ₹600 for two. We were 7 CEPT architecture students at an SBR cafe, ordered basic cold coffees and pizzas, and the bill came to ₹3,850 with service charge and taxes.',
    idealSpotPriorities: ['Honest per-head cost', 'Big group table', 'Near CEPT & Navrangpura'],
    maxAcceptableCostPerHead: 200,
    averageGroupSize: 7,
    submittedAt: '2026-10-26'
  },
  {
    id: 'feed-2',
    studentName: 'Pooja Trivedi',
    collegeOrCampus: 'HL College of Commerce',
    yearOfStudy: '2nd Year B.Com',
    monthlyHangoutBudget: '₹2,000 - ₹3,000',
    primaryFrustration: 'Instagram reel exaggeration vs reality of cramped 2-person tables',
    worstExperienceWithApps: 'Saw a viral reel about an "aesthetic greenhouse cafe in Bodakdev". Traveled from HL with 8 friends only to find they had 3 tiny round tables and staff refused to push tables together.',
    idealSpotPriorities: ['True group seating capacity', 'Under ₹150 budget', 'Outside cake allowed'],
    maxAcceptableCostPerHead: 150,
    averageGroupSize: 8,
    submittedAt: '2026-10-27'
  },
  {
    id: 'feed-3',
    studentName: 'Kunal & Squad',
    collegeOrCampus: 'IIM Ahmedabad (Vastrapur)',
    yearOfStudy: '1st Year PGP',
    monthlyHangoutBudget: '₹3,500 - ₹5,000',
    primaryFrustration: 'Broken or unusable "Free WiFi" when trying to do group projects',
    worstExperienceWithApps: 'Need spots with multi-pin plugs and real 50+ Mbps fiber for laptop team meetings. Caffix in Vastrapur was a lifesaver, need more spots audited like that!',
    idealSpotPriorities: ['WiFi speed verification', 'Power sockets at tables', 'Split bill friendly'],
    maxAcceptableCostPerHead: 300,
    averageGroupSize: 5,
    submittedAt: '2026-10-28'
  },
  {
    id: 'feed-4',
    studentName: 'Rohan Sharma',
    collegeOrCampus: 'PDPU Gandhinagar',
    yearOfStudy: 'Final Year B.Tech',
    monthlyHangoutBudget: '₹2,000 - ₹3,500',
    primaryFrustration: 'Spots only listed for central Ahmedabad, hard to find spots near Raysan/Gandhinagar',
    worstExperienceWithApps: 'Glad to see Tea Post Raysan added! Added our favorite chai point near PDPU gate with big lawn seating.',
    idealSpotPriorities: ['Big group table', 'Under ₹100 budget', 'Late night friendly'],
    maxAcceptableCostPerHead: 100,
    averageGroupSize: 12,
    submittedAt: '2026-10-28'
  }
];

export const AHMEDABAD_COMMUNITY_FEED = INITIAL_FEEDBACK_FEED;
