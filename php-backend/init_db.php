<?php
/**
 * Hangout-Hub Database Initializer & Migration Tool
 * 
 * Sets up the database tables (compatible with MySQL and SQLite)
 * and seeds all 15 initial spots, survey feedback, and cafe proposals from JSON seeds.
 */

require_once __DIR__ . '/config/db.php';

$pdo = Database::getConnection();
$driver = Database::getDriver();

echo "Initializing Hangout-Hub Database using driver [{$driver}]...\n";

// 1. Create tables
if ($driver === 'sqlite') {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS spots (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            tagline TEXT NOT NULL,
            city TEXT NOT NULL DEFAULT 'Ahmedabad',
            campus_name TEXT DEFAULT 'Campus Hub',
            neighborhood TEXT NOT NULL,
            distance_to_campus TEXT NOT NULL,
            vibe_category TEXT NOT NULL,
            cost_min INTEGER NOT NULL DEFAULT 100,
            cost_max INTEGER NOT NULL DEFAULT 200,
            cost_avg INTEGER NOT NULL DEFAULT 150,
            popular_order_example TEXT NOT NULL,
            official_claim_cost TEXT NOT NULL,
            max_group_size INTEGER NOT NULL DEFAULT 8,
            seating_description TEXT NOT NULL,
            push_together_allowed INTEGER NOT NULL DEFAULT 1,
            booth_count INTEGER NOT NULL DEFAULT 0,
            reservation_needed INTEGER NOT NULL DEFAULT 0,
            reservation_tip TEXT NOT NULL,
            wifi_speed_mbps INTEGER NOT NULL DEFAULT 40,
            wifi_reliability TEXT NOT NULL,
            power_outlets TEXT NOT NULL,
            noise_decibels INTEGER NOT NULL DEFAULT 65,
            noise_description TEXT NOT NULL,
            board_games_available INTEGER NOT NULL DEFAULT 0,
            outside_cake_allowed INTEGER NOT NULL DEFAULT 1,
            student_discount_available INTEGER NOT NULL DEFAULT 0,
            discount_note TEXT NOT NULL,
            air_conditioned INTEGER NOT NULL DEFAULT 1,
            open_late_night INTEGER NOT NULL DEFAULT 0,
            closing_time TEXT NOT NULL DEFAULT '11:00 PM',
            has_reel INTEGER NOT NULL DEFAULT 1,
            reel_url TEXT,
            reel_creator TEXT,
            reel_hype_claim TEXT,
            ground_reality_truth TEXT,
            reality_score INTEGER NOT NULL DEFAULT 85,
            scout_name TEXT NOT NULL,
            scout_college TEXT NOT NULL,
            scout_notes TEXT NOT NULL,
            verified_date TEXT NOT NULL,
            upvotes INTEGER NOT NULL DEFAULT 0,
            tags_json TEXT NOT NULL,
            visual_theme_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_spots_city ON spots (city);
        CREATE INDEX IF NOT EXISTS idx_spots_vibe ON spots (vibe_category);

        CREATE TABLE IF NOT EXISTS survey_responses (
            id TEXT PRIMARY KEY,
            student_name TEXT NOT NULL,
            college_or_campus TEXT NOT NULL,
            year_of_study TEXT NOT NULL,
            monthly_hangout_budget TEXT NOT NULL,
            primary_frustration TEXT NOT NULL,
            worst_experience_with_apps TEXT NOT NULL,
            ideal_spot_priorities_json TEXT NOT NULL,
            max_acceptable_cost_per_head INTEGER NOT NULL,
            average_group_size INTEGER NOT NULL,
            submitted_at TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS partnership_proposals (
            id TEXT PRIMARY KEY,
            cafe_name TEXT NOT NULL,
            owner_name TEXT NOT NULL,
            contact_email TEXT NOT NULL,
            contact_phone TEXT NOT NULL,
            address TEXT NOT NULL,
            proposed_per_person_cost INTEGER NOT NULL,
            group_capacity INTEGER NOT NULL,
            offered_student_discount TEXT NOT NULL,
            has_fast_wifi INTEGER NOT NULL DEFAULT 1,
            notes TEXT,
            status TEXT NOT NULL DEFAULT 'pending_verification',
            submitted_at TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");
}

// Clear and seed spots from spots_seed.json
$seedFile = __DIR__ . '/data/spots_seed.json';
if (file_exists($seedFile)) {
    $spotsJson = file_get_contents($seedFile);
    $spotsData = json_decode($spotsJson, true);

    if (is_array($spotsData) && count($spotsData) > 0) {
        $pdo->exec("DELETE FROM spots");

        $insertSql = "INSERT INTO spots (
            id, name, tagline, city, campus_name, neighborhood, distance_to_campus,
            vibe_category, cost_min, cost_max, cost_avg, popular_order_example, official_claim_cost,
            max_group_size, seating_description, push_together_allowed, booth_count, reservation_needed, reservation_tip,
            wifi_speed_mbps, wifi_reliability, power_outlets, noise_decibels, noise_description,
            board_games_available, outside_cake_allowed, student_discount_available, discount_note,
            air_conditioned, open_late_night, closing_time, has_reel, reel_url, reel_creator, reel_hype_claim, ground_reality_truth, reality_score,
            scout_name, scout_college, scout_notes, verified_date, upvotes, tags_json, visual_theme_json
        ) VALUES (
            :id, :name, :tagline, :city, :campus_name, :neighborhood, :distance_to_campus,
            :vibe_category, :cost_min, :cost_max, :cost_avg, :popular_order_example, :official_claim_cost,
            :max_group_size, :seating_description, :push_together_allowed, :booth_count, :reservation_needed, :reservation_tip,
            :wifi_speed_mbps, :wifi_reliability, :power_outlets, :noise_decibels, :noise_description,
            :board_games_available, :outside_cake_allowed, :student_discount_available, :discount_note,
            :air_conditioned, :open_late_night, :closing_time, :has_reel, :reel_url, :reel_creator, :reel_hype_claim, :ground_reality_truth, :reality_score,
            :scout_name, :scout_college, :scout_notes, :verified_date, :upvotes, :tags_json, :visual_theme_json
        )";

        $stmt = $pdo->prepare($insertSql);

        foreach ($spotsData as $s) {
            $stmt->execute([
                ':id' => $s['id'],
                ':name' => $s['name'],
                ':tagline' => $s['tagline'],
                ':city' => $s['city'] ?? 'Ahmedabad',
                ':campus_name' => $s['campusName'] ?? 'Campus Hub',
                ':neighborhood' => $s['neighborhood'],
                ':distance_to_campus' => $s['distanceToCampus'],
                ':vibe_category' => $s['vibeCategory'],
                ':cost_min' => (int)($s['realPerPersonCost']['min'] ?? 100),
                ':cost_max' => (int)($s['realPerPersonCost']['max'] ?? 200),
                ':cost_avg' => (int)($s['realPerPersonCost']['avg'] ?? 150),
                ':popular_order_example' => $s['realPerPersonCost']['popularOrderExample'] ?? 'Chai + Snack',
                ':official_claim_cost' => $s['officialClaimCost'] ?? 'Food app claims higher',
                ':max_group_size' => (int)($s['groupSeating']['maxGroupSize'] ?? 8),
                ':seating_description' => $s['groupSeating']['seatingDescription'] ?? 'Seats student groups',
                ':push_together_allowed' => !empty($s['groupSeating']['pushTogetherAllowed']) ? 1 : 0,
                ':booth_count' => (int)($s['groupSeating']['boothCount'] ?? 0),
                ':reservation_needed' => !empty($s['groupSeating']['reservationNeeded']) ? 1 : 0,
                ':reservation_tip' => $s['groupSeating']['reservationTip'] ?? 'Walk-ins welcome',
                ':wifi_speed_mbps' => (int)($s['amenities']['wifiSpeedMbps'] ?? 30),
                ':wifi_reliability' => $s['amenities']['wifiReliability'] ?? 'Decent for Browsing',
                ':power_outlets' => $s['amenities']['powerOutlets'] ?? 'Select Wall Tables',
                ':noise_decibels' => (int)($s['amenities']['noiseDecibels'] ?? 60),
                ':noise_description' => $s['amenities']['noiseDescription'] ?? 'Campus conversation',
                ':board_games_available' => !empty($s['amenities']['boardGamesAvailable']) ? 1 : 0,
                ':outside_cake_allowed' => !empty($s['amenities']['outsideCakeAllowed']) ? 1 : 0,
                ':student_discount_available' => !empty($s['amenities']['studentDiscountAvailable']) ? 1 : 0,
                ':discount_note' => $s['amenities']['discountNote'] ?? 'Show student ID',
                ':air_conditioned' => !empty($s['amenities']['airConditioned']) ? 1 : 0,
                ':open_late_night' => !empty($s['amenities']['openLateNight']) ? 1 : 0,
                ':closing_time' => $s['amenities']['closingTime'] ?? '11:00 PM',
                ':has_reel' => !empty($s['reelRealityCheck']['hasReel']) ? 1 : 0,
                ':reel_url' => $s['reelRealityCheck']['reelUrl'] ?? '',
                ':reel_creator' => $s['reelRealityCheck']['reelCreator'] ?? '@campus_scout',
                ':reel_hype_claim' => $s['reelRealityCheck']['reelHypeClaim'] ?? 'Viral clip claim',
                ':ground_reality_truth' => $s['reelRealityCheck']['groundRealityTruth'] ?? 'Student verified.',
                ':reality_score' => (int)($s['reelRealityCheck']['realityScore'] ?? 88),
                ':scout_name' => $s['scoutReview']['scoutName'] ?? 'Student Scout',
                ':scout_college' => $s['scoutReview']['scoutCollege'] ?? 'Campus Scout',
                ':scout_notes' => $s['scoutReview']['scoutNotes'] ?? 'Verified.',
                ':verified_date' => $s['scoutReview']['verifiedDate'] ?? 'Oct 2026',
                ':upvotes' => (int)($s['scoutReview']['upvotes'] ?? 10),
                ':tags_json' => json_encode($s['tags'] ?? []),
                ':visual_theme_json' => json_encode($s['visualTheme'] ?? [])
            ]);
        }
        echo "Seeded " . count($spotsData) . " campus spots from JSON seed.\n";
    }
}

// Seed survey responses
$surveyFile = __DIR__ . '/data/surveys_seed.json';
if (file_exists($surveyFile)) {
    $surveyJson = file_get_contents($surveyFile);
    $surveyData = json_decode($surveyJson, true);

    if (is_array($surveyData) && count($surveyData) > 0) {
        $pdo->exec("DELETE FROM survey_responses");
        $insertSurvey = "INSERT INTO survey_responses (
            id, student_name, college_or_campus, year_of_study, monthly_hangout_budget,
            primary_frustration, worst_experience_with_apps, ideal_spot_priorities_json,
            max_acceptable_cost_per_head, average_group_size, submitted_at
        ) VALUES (
            :id, :student_name, :college_or_campus, :year_of_study, :monthly_hangout_budget,
            :primary_frustration, :worst_experience_with_apps, :ideal_spot_priorities_json,
            :max_acceptable_cost_per_head, :average_group_size, :submitted_at
        )";
        $st = $pdo->prepare($insertSurvey);
        foreach ($surveyData as $r) {
            $st->execute([
                ':id' => $r['id'],
                ':student_name' => $r['studentName'],
                ':college_or_campus' => $r['collegeOrCampus'],
                ':year_of_study' => $r['yearOfStudy'],
                ':monthly_hangout_budget' => $r['monthlyHangoutBudget'],
                ':primary_frustration' => $r['primaryFrustration'],
                ':worst_experience_with_apps' => $r['worstExperienceWithApps'],
                ':ideal_spot_priorities_json' => json_encode($r['idealSpotPriorities'] ?? []),
                ':max_acceptable_cost_per_head' => (int)($r['maxAcceptableCostPerHead'] ?? 200),
                ':average_group_size' => (int)($r['averageGroupSize'] ?? 6),
                ':submitted_at' => $r['submittedAt'] ?? date('Y-m-d')
            ]);
        }
        echo "Seeded " . count($surveyData) . " student surveys.\n";
    }
}

// Seed partnerships if empty
$stCount = $pdo->query("SELECT COUNT(*) AS total FROM partnership_proposals");
if ((int)$stCount->fetch()['total'] === 0) {
    $insertPart = "INSERT INTO partnership_proposals (
        id, cafe_name, owner_name, contact_email, contact_phone,
        address, proposed_per_person_cost, group_capacity, offered_student_discount,
        has_fast_wifi, notes, status, submitted_at
    ) VALUES (
        :id, :cafe_name, :owner_name, :contact_email, :contact_phone,
        :address, :proposed_per_person_cost, :group_capacity, :offered_student_discount,
        :has_fast_wifi, :notes, :status, :submitted_at
    )";
    $stP = $pdo->prepare($insertPart);
    $stP->execute([
        'id' => 'part-1', 'cafe_name' => 'Zen Cafe @ Amdavad ni Gufa', 'owner_name' => 'Ketan Shah',
        'contact_email' => 'zencafe.amdavad@gmail.com', 'contact_phone' => '+91 98250 12345',
        'address' => 'Opposite CEPT University, University Area, Navrangpura',
        'proposed_per_person_cost' => 160, 'group_capacity' => 18,
        'offered_student_discount' => 'Free iced tea upgrade for student groups on weekdays before 5 PM',
        'has_fast_wifi' => 1, 'notes' => 'We love student art discussions under the neem trees.',
        'status' => 'verified_active', 'submitted_at' => '2026-10-20'
    ]);
    $stP->execute([
        'id' => 'part-2', 'cafe_name' => 'Mocha Cafe & Cabanas', 'owner_name' => 'Nirav Parekh',
        'contact_email' => 'mocha.ahmedabad@gmail.com', 'contact_phone' => '+91 99099 87654',
        'address' => 'Opposite Rajpath Club, Bodakdev / SBR',
        'proposed_per_person_cost' => 330, 'group_capacity' => 16,
        'offered_student_discount' => 'Free garlic pull-apart bread plate + zero outside cake fee for groups of 6+ with college ID',
        'has_fast_wifi' => 1, 'notes' => 'Dedicated student birthday squad cabanas with zero cake-cutting charges.',
        'status' => 'verified_active', 'submitted_at' => '2026-10-22'
    ]);
    echo "Seeded cafe partnership proposals.\n";
}

echo "Database initialization complete! Driver: {$driver}.\n";
