<?php
/**
 * Hangout-Hub PHP REST API: /spots.php
 * - Public GET returns only approved spots (`status = 'approved'`)
 * - POST (new spot) requires a logged-in account, enforces spam rate-limiting,
 *   and places student submissions into `status = 'pending'` until Admin approval
 *   (Admin submissions are auto-approved).
 * - POST (?action=vote) enforces 1-vote-per-authenticated-user via `spot_votes`.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';

$pdo = Database::getConnection();
ensureSecuritySchema($pdo);
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

    // Only approved spots (or legacy rows prior to status column) appear on public Explorer
    $sql = "SELECT * FROM spots WHERE (status IS NULL OR status = '' OR status = 'approved')";
    $params = [];

    if ($city !== '' && strtolower($city) !== 'all') {
        $sql .= " AND (LOWER(city) = :city OR LOWER(neighborhood) LIKE :city_like OR tags_json LIKE :city_tag)";
        $params[':city'] = strtolower($city);
        $params[':city_like'] = '%' . strtolower($city) . '%';
        $params[':city_tag'] = '%' . strtolower($city) . '%';
    }

    if ($campusArea !== '' && strtolower($campusArea) !== 'all') {
        $sql .= " AND (LOWER(neighborhood) LIKE :area OR LOWER(distance_to_campus) LIKE :area OR LOWER(campus_name) LIKE :area)";
        $params[':area'] = '%' . strtolower($campusArea) . '%';
    }

    if ($search !== '') {
        $sql .= " AND (LOWER(name) LIKE :search OR LOWER(tagline) LIKE :search OR LOWER(neighborhood) LIKE :search OR LOWER(campus_name) LIKE :search OR LOWER(city) LIKE :search OR tags_json LIKE :search)";
        $params[':search'] = '%' . strtolower($search) . '%';
    }

    if ($vibe !== '' && strtolower($vibe) !== 'all') {
        $sql .= " AND vibe_category = :vibe";
        $params[':vibe'] = $vibe;
    }

    if ($maxBudget !== null && $maxBudget > 0) {
        $sql .= " AND cost_min <= :maxBudget";
        $params[':maxBudget'] = $maxBudget;
    }

    if ($minGroupSize !== null && $minGroupSize > 0) {
        $sql .= " AND max_group_size >= :minGroupSize";
        $params[':minGroupSize'] = $minGroupSize;
    }

    if ($hasWifi) {
        $sql .= " AND (wifi_reliability LIKE '%Fast%' OR wifi_speed_mbps >= 40)";
    }

    if ($hasPlugs) {
        $sql .= " AND (power_outlets LIKE '%Every Table%' OR power_outlets LIKE '%Select Wall Tables%')";
    }

    if ($lateNight) {
        $sql .= " AND open_late_night = 1";
    }

    $sql .= " ORDER BY upvotes DESC, created_at DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $formattedSpots = array_map(function(array $r) {
            $spot = formatSpotRow($r);
            $spot['status'] = $r['status'] ?? 'approved';
            return $spot;
        }, $rows);

        sendJsonResponse([
            'success' => true,
            'engine'  => 'PHP/' . PHP_VERSION . ' (PDO ' . Database::getDriver() . ')',
            'city'    => $city,
            'count'   => count($formattedSpots),
            'spots'   => $formattedSpots
        ]);
    } catch (PDOException $e) {
        sendJsonResponse([
            'success' => false,
            'error'   => 'Database query error while loading spots.'
        ], 500);
    }
}

if ($method === 'POST') {
    $action = $_GET['action'] ?? '';
    $idParam = $_GET['id'] ?? '';
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);

    // 1. Authenticated 1-Vote-Per-User Upvote
    if ($action === 'vote' || (is_array($body) && ($body['action'] ?? '') === 'vote')) {
        $voteId = $idParam ?: (is_array($body) ? (string)($body['id'] ?? '') : '');
        recordSpotUpvote($pdo, $voteId, is_array($body) ? $body : null);
    }

    // 2. Require Verified Logged-In Account for Submitting a New Cafe / Spot
    $authUser = requireAuthUser($pdo, is_array($body) ? $body : null);

    // Rate-limit spot submissions (max 5/hour per user & max 8/hour per IP)
    enforceRateLimit($pdo, 'spot_submit_u_' . $authUser['id'], 5, 3600);
    enforceRateLimit($pdo, 'spot_submit_ip', 8, 3600);

    if (!is_array($body)) {
        sendJsonResponse(['success' => false, 'error' => 'Invalid JSON request payload.'], 400);
    }

    $name = cleanText($body['name'] ?? '', 80);
    $neighborhood = cleanText($body['neighborhood'] ?? '', 80);
    $city = cleanText($body['city'] ?? 'Ahmedabad', 50) ?: 'Ahmedabad';

    if ($name === '' || $neighborhood === '') {
        sendJsonResponse([
            'success' => false,
            'error'   => 'Spot name and neighborhood are required fields.'
        ], 400);
    }

    $costMin = isset($body['minCost']) ? (int)$body['minCost'] : 100;
    $costMax = isset($body['maxCost']) ? (int)$body['maxCost'] : 220;
    $maxGroupSize = isset($body['maxGroupSize']) ? (int)$body['maxGroupSize'] : 8;

    if ($costMin < 10 || $costMin > 5000 || $costMax < $costMin || $costMax > 10000) {
        sendJsonResponse([
            'success' => false,
            'error'   => 'Please enter realistic student per-head costs (₹10 to ₹10,000, with max >= min).'
        ], 400);
    }
    if ($maxGroupSize < 1 || $maxGroupSize > 100) {
        sendJsonResponse([
            'success' => false,
            'error'   => 'Max group seating capacity must be between 1 and 100 people.'
        ], 400);
    }

    $id = 'spot-' . round(microtime(true) * 1000) . '-' . substr(bin2hex(random_bytes(2)), 0, 4);
    $tagline = cleanText($body['tagline'] ?? '', 140) ?: 'Student verified campus hangout spot';
    $campusName = cleanText($body['campusName'] ?? '', 80) ?: 'Local College Campus';
    $distanceToCampus = cleanText($body['distanceToCampus'] ?? '', 60) ?: 'Near campus gate';
    $allowedVibes = [
        'Budget Bite & Chill',
        'Study & Projects',
        'Aesthetic Hangout',
        'Board Games & Fun',
        'Late Night Hangout'
    ];
    $rawVibe = cleanText($body['vibeCategory'] ?? '', 50);
    $vibeCategory = in_array($rawVibe, $allowedVibes, true) ? $rawVibe : 'Budget Bite & Chill';

    $costAvg = (int)round(($costMin + $costMax) / 2);
    $popularOrderExample = cleanText($body['popularOrderExample'] ?? '', 140) ?: 'Cold Coffee + Snack combo';
    $officialClaimCost = cleanText($body['officialClaimCost'] ?? '', 120) ?: 'Food apps list higher';

    $seatingDescription = cleanText($body['seatingDescription'] ?? '', 240) ?: 'Accommodates student groups.';
    $pushTogetherAllowed = isset($body['pushTogetherAllowed']) ? ($body['pushTogetherAllowed'] ? 1 : 0) : 1;
    $boothCount = max(0, min(50, (int)($body['boothCount'] ?? 0)));
    $reservationNeeded = isset($body['reservationNeeded']) ? ($body['reservationNeeded'] ? 1 : 0) : 0;
    $reservationTip = cleanText($body['reservationTip'] ?? '', 140) ?: 'Walk-in friendly.';

    $wifiSpeedMbps = max(0, min(1000, (int)($body['wifiSpeedMbps'] ?? 35)));
    $wifiReliability = cleanText($body['wifiReliability'] ?? '', 50) ?: 'Decent for Browsing';
    $powerOutlets = cleanText($body['powerOutlets'] ?? '', 50) ?: 'Select Wall Tables';
    $noiseDecibels = max(20, min(120, (int)($body['noiseDecibels'] ?? 60)));
    $noiseDescription = cleanText($body['noiseDescription'] ?? '', 120) ?: 'Relaxed campus vibe';
    $boardGamesAvailable = !empty($body['boardGamesAvailable']) ? 1 : 0;
    $outsideCakeAllowed = isset($body['outsideCakeAllowed']) ? ($body['outsideCakeAllowed'] ? 1 : 0) : 1;
    $studentDiscountAvailable = !empty($body['studentDiscountAvailable']) ? 1 : 0;
    $discountNote = cleanText($body['discountNote'] ?? '', 120) ?: 'Show student ID';
    $airConditioned = isset($body['airConditioned']) ? ($body['airConditioned'] ? 1 : 0) : 1;
    $openLateNight = !empty($body['openLateNight']) ? 1 : 0;
    $closingTime = cleanText($body['closingTime'] ?? '', 40) ?: '11:00 PM';

    $reelUrl = cleanText($body['reelUrl'] ?? '', 250);
    $hasReel = $reelUrl !== '' ? 1 : 0;
    $reelCreator = cleanText($body['reelCreator'] ?? '', 80) ?: '@student_scout';
    $reelHypeClaim = cleanText($body['reelHypeClaim'] ?? '', 240) ?: 'Viral claims from Instagram';
    $groundRealityTruth = cleanText($body['groundRealityTruth'] ?? '', 300) ?: 'Audited student ground truth.';
    $realityScore = max(10, min(100, (int)($body['realityScore'] ?? 88)));

    $scoutName = cleanText($body['scoutName'] ?? '', 80) ?: cleanText($authUser['name'] ?? 'Student Scout', 80);
    $scoutCollege = cleanText($body['scoutCollege'] ?? '', 100) ?: cleanText($authUser['college'] ?? ($campusName . ' Student Network'), 100);
    $scoutNotes = cleanText($body['scoutNotes'] ?? '', 300) ?: 'Personally audited with friends.';

    // Moderation Queue: Admins publish immediately; students enter 'pending' review
    $isAdmin = strtolower((string)($authUser['role'] ?? 'student')) === 'admin';
    $spotStatus = $isAdmin ? 'approved' : 'pending';
    $verifiedDate = $isAdmin ? 'Admin Verified' : 'Pending Admin Audit';
    $upvotes = 1;

    $tags = [
        $city,
        $neighborhood,
        $campusName,
        'Under ₹' . $costMax,
        $isAdmin ? 'Admin Verified' : 'Scout Submitted'
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
        scout_name, scout_college, scout_notes, verified_date, upvotes, tags_json, visual_theme_json,
        status, submitted_by
    ) VALUES (
        :id, :name, :tagline, :city, :campus_name, :neighborhood, :distance_to_campus,
        :vibe_category, :cost_min, :cost_max, :cost_avg, :popular_order_example, :official_claim_cost,
        :max_group_size, :seating_description, :push_together_allowed, :booth_count, :reservation_needed, :reservation_tip,
        :wifi_speed_mbps, :wifi_reliability, :power_outlets, :noise_decibels, :noise_description,
        :board_games_available, :outside_cake_allowed, :student_discount_available, :discount_note,
        :air_conditioned, :open_late_night, :closing_time, :has_reel, :reel_url, :reel_creator, :reel_hype_claim, :ground_reality_truth, :reality_score,
        :scout_name, :scout_college, :scout_notes, :verified_date, :upvotes, :tags_json, :visual_theme_json,
        :status, :submitted_by
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
            ':tags_json' => $tagsJson, ':visual_theme_json' => $visualThemeJson,
            ':status' => $spotStatus, ':submitted_by' => $authUser['id']
        ]);

        // Record initial creator vote in spot_votes so submitter cannot double-vote
        try {
            $pdo->prepare("INSERT INTO spot_votes (id, spot_id, user_id) VALUES (:vid, :sid, :uid)")
                ->execute([':vid' => 'vote_' . bin2hex(random_bytes(6)), ':sid' => $id, ':uid' => $authUser['id']]);
        } catch (Throwable $e) {}

        $fetchStmt = $pdo->prepare("SELECT * FROM spots WHERE id = :id");
        $fetchStmt->execute([':id' => $id]);
        $row = $fetchStmt->fetch();
        $formatted = formatSpotRow($row);
        $formatted['status'] = $spotStatus;

        sendJsonResponse([
            'success'           => true,
            'pendingModeration' => !$isAdmin,
            'status'            => $spotStatus,
            'message'           => $isAdmin
                ? 'Spot published directly to the live directory!'
                : 'Spot submitted for Campus Admin verification! It will appear publicly once approved.',
            'spot'              => $formatted
        ], 201);
    } catch (PDOException $e) {
        sendJsonResponse([
            'success' => false,
            'error'   => 'Failed to save spot submission. Please try again.'
        ], 500);
    }
}

sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
