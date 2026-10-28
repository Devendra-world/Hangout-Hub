<?php
/**
 * Hangout-Hub PHP REST API: /api/spots.php
 * Handles querying, filtering, and student scout submissions for hangout spots
 */

require_once dirname(__DIR__) . '/config/db.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $search       = trim($_GET['search'] ?? '');
    $city         = trim($_GET['city'] ?? 'all');
    $vibe         = trim($_GET['vibe'] ?? 'all');
    $maxBudget    = isset($_GET['maxBudget']) && is_numeric($_GET['maxBudget']) ? (int)$_GET['maxBudget'] : null;
    $minGroupSize = isset($_GET['minGroupSize']) && is_numeric($_GET['minGroupSize']) ? (int)$_GET['minGroupSize'] : null;
    $hasWifi      = ($_GET['hasWifi'] ?? '') === 'true';
    $hasPlugs     = ($_GET['hasPlugs'] ?? '') === 'true';
    $lateNight    = ($_GET['lateNight'] ?? '') === 'true';
    $campusArea   = trim($_GET['campusArea'] ?? 'all');

    $sql = "SELECT * FROM spots WHERE 1=1";
    $params = [];

    // City Filter
    if ($city !== '' && strtolower($city) !== 'all') {
        $sql .= " AND (LOWER(city) = :city OR LOWER(neighborhood) LIKE :city_like OR tags_json LIKE :city_tag)";
        $params[':city'] = strtolower($city);
        $params[':city_like'] = '%' . strtolower($city) . '%';
        $params[':city_tag'] = '%' . strtolower($city) . '%';
    }

    // Campus / Neighborhood Filter
    if ($campusArea !== '' && strtolower($campusArea) !== 'all') {
        $sql .= " AND (LOWER(neighborhood) LIKE :area OR LOWER(distance_to_campus) LIKE :area OR LOWER(campus_name) LIKE :area)";
        $params[':area'] = '%' . strtolower($campusArea) . '%';
    }

    // Text Search
    if ($search !== '') {
        $sql .= " AND (LOWER(name) LIKE :search OR LOWER(tagline) LIKE :search OR LOWER(neighborhood) LIKE :search OR LOWER(campus_name) LIKE :search OR LOWER(city) LIKE :search OR tags_json LIKE :search)";
        $params[':search'] = '%' . strtolower($search) . '%';
    }

    // Vibe Category
    if ($vibe !== '' && strtolower($vibe) !== 'all') {
        $sql .= " AND vibe_category = :vibe";
        $params[':vibe'] = $vibe;
    }

    // Max Budget
    if ($maxBudget !== null && $maxBudget > 0) {
        $sql .= " AND cost_min <= :maxBudget";
        $params[':maxBudget'] = $maxBudget;
    }

    // Min Group Seating Size
    if ($minGroupSize !== null && $minGroupSize > 0) {
        $sql .= " AND max_group_size >= :minGroupSize";
        $params[':minGroupSize'] = $minGroupSize;
    }

    // WiFi
    if ($hasWifi) {
        $sql .= " AND (wifi_reliability LIKE '%Fast%' OR wifi_speed_mbps >= 40)";
    }

    // Plugs
    if ($hasPlugs) {
        $sql .= " AND (power_outlets LIKE '%Every Table%' OR power_outlets LIKE '%Select Wall Tables%')";
    }

    // Late Night
    if ($lateNight) {
        $sql .= " AND open_late_night = 1";
    }

    $sql .= " ORDER BY upvotes DESC, created_at DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $formattedSpots = array_map('formatSpotRow', $rows);

        sendJsonResponse([
            'success'   => true,
            'engine'    => 'PHP/' . PHP_VERSION . ' (PDO ' . Database::getDriver() . ')',
            'city'      => $city,
            'count'     => count($formattedSpots),
            'spots'     => $formattedSpots
        ]);
    } catch (PDOException $e) {
        sendJsonResponse([
            'success' => false,
            'error'   => 'Database query error: ' . $e->getMessage()
        ], 500);
    }
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);

    if (!is_array($body) || empty($body['name']) || empty($body['neighborhood'])) {
        sendJsonResponse([
            'success' => false,
            'error'   => 'Name and neighborhood are required fields.'
        ], 400);
    }

    $id = 'spot-' . round(microtime(true) * 1000);
    $name = trim($body['name']);
    $tagline = !empty($body['tagline']) ? trim($body['tagline']) : 'Student verified campus hangout adda';
    $city = !empty($body['city']) ? trim($body['city']) : 'Ahmedabad';
    $campusName = !empty($body['campusName']) ? trim($body['campusName']) : 'Local College Campus';
    $neighborhood = trim($body['neighborhood']);
    $distanceToCampus = !empty($body['distanceToCampus']) ? trim($body['distanceToCampus']) : 'Near campus gate';
    $vibeCategory = !empty($body['vibeCategory']) ? trim($body['vibeCategory']) : 'Budget Bite & Chill';

    $costMin = isset($body['minCost']) ? (int)$body['minCost'] : 100;
    $costMax = isset($body['maxCost']) ? (int)$body['maxCost'] : 220;
    $costAvg = (int)round(($costMin + $costMax) / 2);
    $popularOrderExample = !empty($body['popularOrderExample']) ? trim($body['popularOrderExample']) : 'Cold Coffee + Snack combo';
    $officialClaimCost = !empty($body['officialClaimCost']) ? trim($body['officialClaimCost']) : 'Food apps list higher';

    $maxGroupSize = isset($body['maxGroupSize']) ? (int)$body['maxGroupSize'] : 8;
    $seatingDescription = !empty($body['seatingDescription']) ? trim($body['seatingDescription']) : 'Accommodates student groups.';
    $pushTogetherAllowed = isset($body['pushTogetherAllowed']) ? ($body['pushTogetherAllowed'] ? 1 : 0) : 1;
    $boothCount = isset($body['boothCount']) ? (int)$body['boothCount'] : 0;
    $reservationNeeded = isset($body['reservationNeeded']) ? ($body['reservationNeeded'] ? 1 : 0) : 0;
    $reservationTip = !empty($body['reservationTip']) ? trim($body['reservationTip']) : 'Walk-in friendly.';

    $wifiSpeedMbps = isset($body['wifiSpeedMbps']) ? (int)$body['wifiSpeedMbps'] : 35;
    $wifiReliability = !empty($body['wifiReliability']) ? trim($body['wifiReliability']) : 'Decent for Browsing';
    $powerOutlets = !empty($body['powerOutlets']) ? trim($body['powerOutlets']) : 'Select Wall Tables';
    $noiseDecibels = isset($body['noiseDecibels']) ? (int)$body['noiseDecibels'] : 60;
    $noiseDescription = !empty($body['noiseDescription']) ? trim($body['noiseDescription']) : 'Relaxed campus vibe';
    $boardGamesAvailable = !empty($body['boardGamesAvailable']) ? 1 : 0;
    $outsideCakeAllowed = isset($body['outsideCakeAllowed']) ? ($body['outsideCakeAllowed'] ? 1 : 0) : 1;
    $studentDiscountAvailable = !empty($body['studentDiscountAvailable']) ? 1 : 0;
    $discountNote = !empty($body['discountNote']) ? trim($body['discountNote']) : 'Show student ID';
    $airConditioned = isset($body['airConditioned']) ? ($body['airConditioned'] ? 1 : 0) : 1;
    $openLateNight = !empty($body['openLateNight']) ? 1 : 0;
    $closingTime = !empty($body['closingTime']) ? trim($body['closingTime']) : '11:00 PM';

    $hasReel = !empty($body['reelUrl']) ? 1 : 0;
    $reelUrl = trim($body['reelUrl'] ?? '');
    $reelCreator = !empty($body['reelCreator']) ? trim($body['reelCreator']) : '@student_scout';
    $reelHypeClaim = !empty($body['reelHypeClaim']) ? trim($body['reelHypeClaim']) : 'Viral claims from Instagram';
    $groundRealityTruth = !empty($body['groundRealityTruth']) ? trim($body['groundRealityTruth']) : 'Audited student ground truth.';
    $realityScore = isset($body['realityScore']) ? (int)$body['realityScore'] : 88;

    $scoutName = !empty($body['scoutName']) ? trim($body['scoutName']) : 'Student Scout';
    $scoutCollege = !empty($body['scoutCollege']) ? trim($body['scoutCollege']) : ($campusName . ' Student Network');
    $scoutNotes = !empty($body['scoutNotes']) ? trim($body['scoutNotes']) : 'Personally audited with friends.';
    $verifiedDate = 'Just Now';
    $upvotes = 1;

    $tags = [
        $city,
        $neighborhood,
        $campusName,
        'Under ₹' . $costMax,
        'Student Verified'
    ];
    $tagsJson = json_encode($tags);
    $visualThemeJson = json_encode([
        'primaryColor' => '#78350F',
        'patternType'  => 'warm',
        'heroIconName' => 'Coffee'
    ]);

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

    try {
        $stmt = $pdo->prepare($insertSql);
        $stmt->execute([
            ':id' => $id, ':name' => $name, ':tagline' => $tagline, ':city' => $city, ':campus_name' => $campusName,
            ':neighborhood' => $neighborhood, ':distance_to_campus' => $distanceToCampus,
            ':vibe_category' => $vibeCategory, ':cost_min' => $costMin, ':cost_max' => $costMax, ':cost_avg' => $costAvg,
            ':popular_order_example' => $popularOrderExample, ':official_claim_cost' => $officialClaimCost,
            ':max_group_size' => $maxGroupSize, ':seating_description' => $seatingDescription,
            ':push_together_allowed' => $pushTogetherAllowed, ':booth_count' => $boothCount,
            ':reservation_needed' => $reservationNeeded, ':reservation_tip' => $reservationTip,
            ':wifi_speed_mbps' => $wifiSpeedMbps, ':wifi_reliability' => $wifiReliability,
            ':power_outlets' => $powerOutlets, ':noise_decibels' => $noiseDecibels, ':noise_description' => $noiseDescription,
            ':board_games_available' => $boardGamesAvailable, ':outside_cake_allowed' => $outsideCakeAllowed,
            ':student_discount_available' => $studentDiscountAvailable, ':discount_note' => $discountNote,
            ':air_conditioned' => $airConditioned, ':open_late_night' => $openLateNight, ':closing_time' => $closingTime,
            ':has_reel' => $hasReel, ':reel_url' => $reelUrl, ':reel_creator' => $reelCreator,
            ':reel_hype_claim' => $reelHypeClaim, ':ground_reality_truth' => $groundRealityTruth,
            ':reality_score' => $realityScore, ':scout_name' => $scoutName, ':scout_college' => $scoutCollege,
            ':scout_notes' => $scoutNotes, ':verified_date' => $verifiedDate, ':upvotes' => $upvotes,
            ':tags_json' => $tagsJson, ':visual_theme_json' => $visualThemeJson
        ]);

        // Fetch inserted spot
        $fetchStmt = $pdo->prepare("SELECT * FROM spots WHERE id = :id");
        $fetchStmt->execute([':id' => $id]);
        $row = $fetchStmt->fetch();

        sendJsonResponse([
            'success' => true,
            'message' => 'Spot successfully saved to PHP Database!',
            'spot'    => formatSpotRow($row)
        ], 201);
    } catch (PDOException $e) {
        sendJsonResponse([
            'success' => false,
            'error'   => 'Failed to insert spot into database: ' . $e->getMessage()
        ], 500);
    }
}

sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
