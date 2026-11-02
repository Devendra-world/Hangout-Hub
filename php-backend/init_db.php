<?php
/**
 * Hangout-Hub Database Initializer & Migration Tool
 * 
 * Sets up database tables (compatible with MySQL and SQLite):
 * - spots (hangout spots catalog)
 * - survey_responses (student feedback and statistics)
 * - partnership_proposals (cafe promotion submissions)
 * - users (student and admin accounts, profile data, preferences)
 * - user_history (activity log: views, bookmarks, upvotes, bill splits)
 * - user_bookmarks (saved favorite spots for students)
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
            city TEXT NOT NULL,
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

        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student',
            college TEXT NOT NULL,
            city TEXT NOT NULL,
            preferred_budget INTEGER NOT NULL,
            favorite_vibes_json TEXT,
            bio TEXT,
            avatar_color TEXT DEFAULT '#C85A32',
            upi_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS user_history (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            spot_id TEXT NOT NULL,
            action_type TEXT NOT NULL,
            metadata_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_uh_user ON user_history (user_id);
        CREATE INDEX IF NOT EXISTS idx_uh_spot ON user_history (spot_id);

        CREATE TABLE IF NOT EXISTS user_bookmarks (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            spot_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, spot_id)
        );
    ");

    // Legacy SQLite migration: add UPI without any personal/default value.
    try {
        $cols = $pdo->query("PRAGMA table_info(users)")->fetchAll(PDO::FETCH_ASSOC);
        $hasUpi = false;
        foreach ($cols as $col) {
            if ($col['name'] === 'upi_id') { $hasUpi = true; break; }
        }
        if (!$hasUpi) {
            $pdo->exec("ALTER TABLE users ADD COLUMN upi_id TEXT");
            echo "Migrated users table: added empty upi_id column.\n";
        }
        // Remove only the known seeded sample accounts; preserve all other user records.
        $pdo->prepare("DELETE FROM user_history WHERE user_id IN (?, ?, ?)")->execute(['usr_devendra_1', 'usr_admin_1', 'usr_ddabfef44b']);
        $pdo->prepare("DELETE FROM user_bookmarks WHERE user_id IN (?, ?, ?)")->execute(['usr_devendra_1', 'usr_admin_1', 'usr_ddabfef44b']);
        $pdo->prepare("DELETE FROM users WHERE id IN (?, ?, ?) OR LOWER(email) IN (?, ?, ?)")->execute([
            'usr_devendra_1', 'usr_admin_1', 'usr_ddabfef44b',
            'patadiyadevendra5@gmail.com', 'admin@hangouthub.in', 'rohan.test@campus.edu'
        ]);
    } catch (Exception $e) {
        error_log('User cleanup/migration warning: ' . $e->getMessage());
    }
} else {
    // MySQL table definitions
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `users` (
            `id` VARCHAR(64) NOT NULL PRIMARY KEY,
            `name` VARCHAR(255) NOT NULL,
            `email` VARCHAR(255) NOT NULL UNIQUE,
            `password_hash` VARCHAR(255) NOT NULL,
            `role` VARCHAR(32) NOT NULL DEFAULT 'student',
            `college` VARCHAR(255) NOT NULL,
            `city` VARCHAR(100) NOT NULL,
            `preferred_budget` INT NOT NULL,
            `favorite_vibes_json` TEXT,
            `bio` TEXT,
            `avatar_color` VARCHAR(32) DEFAULT '#C85A32',
            `upi_id` VARCHAR(100) NOT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `user_history` (
            `id` VARCHAR(64) NOT NULL PRIMARY KEY,
            `user_id` VARCHAR(64) NOT NULL,
            `spot_id` VARCHAR(64) NOT NULL,
            `action_type` VARCHAR(64) NOT NULL,
            `metadata_json` TEXT,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX (`user_id`),
            INDEX (`spot_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

        CREATE TABLE IF NOT EXISTS `user_bookmarks` (
            `id` VARCHAR(64) NOT NULL PRIMARY KEY,
            `user_id` VARCHAR(64) NOT NULL,
            `spot_id` VARCHAR(64) NOT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY `unique_user_bookmark` (`user_id`, `spot_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");
    // MySQL migration: remove personal defaults from existing installations.
    try {
        $pdo->exec("ALTER TABLE users
            MODIFY college VARCHAR(255) NOT NULL,
            MODIFY city VARCHAR(100) NOT NULL,
            MODIFY preferred_budget INT NOT NULL,
            MODIFY upi_id VARCHAR(100) NOT NULL");
        $pdo->prepare("DELETE FROM user_history WHERE user_id IN (?, ?, ?)")->execute(['usr_devendra_1', 'usr_admin_1', 'usr_ddabfef44b']);
        $pdo->prepare("DELETE FROM user_bookmarks WHERE user_id IN (?, ?, ?)")->execute(['usr_devendra_1', 'usr_admin_1', 'usr_ddabfef44b']);
        $pdo->prepare("DELETE FROM users WHERE id IN (?, ?, ?) OR LOWER(email) IN (?, ?, ?)")->execute([
            'usr_devendra_1', 'usr_admin_1', 'usr_ddabfef44b',
            'patadiyadevendra5@gmail.com', 'admin@hangouthub.in', 'rohan.test@campus.edu'
        ]);
    } catch (Exception $e) {
        error_log('MySQL user cleanup/migration warning: ' . $e->getMessage());
    }
}

// 2. Seed Spots from JSON if empty
$stmt = $pdo->query("SELECT COUNT(*) AS total FROM spots");
$count = (int)$stmt->fetch()['total'];

if ($count === 0) {
    echo "Seeding initial Ahmedabad hangout spots...\n";
    $spotsFile = __DIR__ . '/data/spots_seed.json';
    if (file_exists($spotsFile)) {
        $spotsJson = file_get_contents($spotsFile);
        $spotsData = json_decode($spotsJson, true);

        $insertSql = "INSERT INTO spots (
            id, name, tagline, city, campus_name, neighborhood, distance_to_campus, vibe_category,
            cost_min, cost_max, cost_avg, popular_order_example, official_claim_cost,
            max_group_size, seating_description, push_together_allowed, booth_count,
            reservation_needed, reservation_tip, wifi_speed_mbps, wifi_reliability,
            power_outlets, noise_decibels, noise_description, board_games_available,
            outside_cake_allowed, student_discount_available, discount_note, air_conditioned,
            open_late_night, closing_time, has_reel, reel_url, reel_creator, reel_hype_claim,
            ground_reality_truth, reality_score, scout_name, scout_college, scout_notes,
            verified_date, upvotes, tags_json, visual_theme_json
        ) VALUES (
            :id, :name, :tagline, :city, :campus_name, :neighborhood, :distance_to_campus, :vibe_category,
            :cost_min, :cost_max, :cost_avg, :popular_order_example, :official_claim_cost,
            :max_group_size, :seating_description, :push_together_allowed, :booth_count,
            :reservation_needed, :reservation_tip, :wifi_speed_mbps, :wifi_reliability,
            :power_outlets, :noise_decibels, :noise_description, :board_games_available,
            :outside_cake_allowed, :student_discount_available, :discount_note, :air_conditioned,
            :open_late_night, :closing_time, :has_reel, :reel_url, :reel_creator, :reel_hype_claim,
            :ground_reality_truth, :reality_score, :scout_name, :scout_college, :scout_notes,
            :verified_date, :upvotes, :tags_json, :visual_theme_json
        )";

        $stmtInsert = $pdo->prepare($insertSql);

        foreach ($spotsData as $s) {
            $stmtInsert->execute([
                ':id' => $s['id'],
                ':name' => $s['name'],
                ':tagline' => $s['tagline'],
                ':city' => $s['city'] ?? 'Ahmedabad',
                ':campus_name' => $s['campusName'] ?? 'Ahmedabad Campus Hub',
                ':neighborhood' => $s['neighborhood'],
                ':distance_to_campus' => $s['distanceToCampus'],
                ':vibe_category' => $s['vibeCategory'],
                ':cost_min' => (int)($s['realPerPersonCost']['min'] ?? 100),
                ':cost_max' => (int)($s['realPerPersonCost']['max'] ?? 200),
                ':cost_avg' => (int)($s['realPerPersonCost']['avg'] ?? 150),
                ':popular_order_example' => $s['realPerPersonCost']['popularOrderExample'] ?? 'Cold Coffee + Maska Bun',
                ':official_claim_cost' => $s['officialClaimCost'] ?? 'Lists ₹600 for two on aggregator',
                ':max_group_size' => (int)($s['groupSeating']['maxGroupSize'] ?? 8),
                ':seating_description' => $s['groupSeating']['seatingDescription'] ?? 'Tables available',
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

// 3. Do not create default student/admin accounts.
// Users are created only through validated registration. Admin accounts must be provisioned securely.

// 4. Seed Survey responses if empty
$stCount = $pdo->query("SELECT COUNT(*) AS total FROM survey_responses");
if ((int)$stCount->fetch()['total'] === 0) {
    $surveyFile = __DIR__ . '/data/surveys_seed.json';
    if (file_exists($surveyFile)) {
        $surveyJson = file_get_contents($surveyFile);
        $surveyData = json_decode($surveyJson, true);

        if (is_array($surveyData) && count($surveyData) > 0) {
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
}

// 5. Seed Partnerships if empty
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
