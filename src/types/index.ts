/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type VibeCategory = 
  | 'Study & Projects' 
  | 'Budget Bite & Chill' 
  | 'Board Games & Fun' 
  | 'Aesthetic Hangout' 
  | 'Late Night Hangout';

export interface HangoutSpot {
  id: string;
  name: string;
  tagline: string;
  city?: string; // e.g. "Ahmedabad", "Delhi NCR", "Bengaluru", "Pune", or any city
  campusName?: string; // e.g. "CEPT / Gujarat Univ", "IIM-A / Vastrapur", "PDPU / Gandhinagar", "DU North Campus"
  neighborhood: string;
  distanceToCampus: string; // e.g. "0.4 km (5 min walk)"
  vibeCategory: VibeCategory;
  realPerPersonCost: {
    min: number;
    max: number;
    avg: number;
    popularOrderExample: string;
  };
  officialClaimCost: string; // e.g. "Zomato lists: ₹700 for 2, excludes 5% GST and service charge"
  groupSeating: {
    maxGroupSize: number;
    seatingDescription: string;
    pushTogetherAllowed: boolean;
    boothCount: number;
    reservationNeeded: boolean;
    reservationTip: string;
  };
  amenities: {
    wifiSpeedMbps: number;
    wifiReliability: 'Fast & Reliable' | 'Decent for Browsing' | 'Spotty' | 'None';
    powerOutlets: 'Every Table' | 'Select Wall Tables' | 'Few / Request Only' | 'None';
    noiseDecibels: number; // e.g. 48 for quiet, 72 for lively
    noiseDescription: string;
    boardGamesAvailable: boolean;
    outsideCakeAllowed: boolean;
    studentDiscountAvailable: boolean;
    discountNote?: string;
    airConditioned: boolean;
    openLateNight: boolean;
    closingTime: string;
  };
  reelRealityCheck: {
    hasReel: boolean;
    reelUrl: string;
    reelCreator: string;
    reelHypeClaim: string;
    groundRealityTruth: string;
    realityScore: number; // out of 100
  };
  scoutReview: {
    scoutName: string;
    scoutCollege: string;
    scoutNotes: string;
    verifiedDate: string;
    upvotes: number;
  };
  tags: string[];
  visualTheme: {
    primaryColor: string;
    patternType: 'terrazzo' | 'geometric' | 'botanical' | 'minimal' | 'warm';
    heroIconName: string;
  };
  partnership?: {
    isPartner: boolean;
    offerTitle: string;
    offerDetails: string;
  };
}

export interface SurveyResponse {
  id: string;
  studentName: string;
  collegeOrCampus: string;
  yearOfStudy: string;
  monthlyHangoutBudget: string;
  primaryFrustration: string;
  worstExperienceWithApps: string;
  idealSpotPriorities: string[];
  maxAcceptableCostPerHead: number;
  averageGroupSize: number;
  submittedAt: string;
}

export interface StudentPersona {
  id: string;
  name: string;
  role: string;
  quote: string;
  typicalGroupSize: string;
  budgetPerHead: string;
  frustrations: string[];
  mustHaves: string[];
  idealHangoutScenario: string;
}

export interface DesignThinkingInsight {
  metric: string;
  label: string;
  source: string;
}

export interface CafePartnershipProposal {
  id: string;
  cafeName: string;
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  proposedPerPersonCost: number;
  groupCapacity: number;
  offeredStudentDiscount: string;
  hasFastWifi: boolean;
  notes: string;
  submittedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  college: string;
  city: string;
  preferredBudget: number;
  favoriteVibes: string[];
  bio: string;
  avatarColor: string;
  upiId?: string;
  paymentQrNote?: string;
  createdAt?: string;
}

export interface UserActivityItem {
  id: string;
  actionType: 'viewed' | 'saved' | 'upvoted' | 'bill_split';
  actionTime: string;
  spotId: string;
  spotName: string;
  neighborhood: string;
  city: string;
  vibeCategory: string;
  costAvg: number;
  metadata?: Record<string, any>;
}

export interface RecommendationItem {
  spot: HangoutSpot;
  recommendationScore: number;
  primaryReason: string;
  allReasons: string[];
}

