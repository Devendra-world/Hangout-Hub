<?php
/**
 * Hangout-Hub Recommendations Engine (PHP + SQL)
 * Delivers personalized spot recommendations scored according to user's browsing history,
 * saved hangouts, budget preferences, and campus location.
 */

require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = Database::getConnection();

$userId = $_GET['user_id'] ?? '';
$cityFilter = $_GET['city'] ?? '';

// Default preferences for anonymous visitors
$preferredBudget = 200;
$favoriteVibes = ['Budget Bite & Chill', 'Study & Projects'];
$userCity = 'Ahmedabad';
$viewedSpotIds = [];
$savedSpotIds = [];
$userFound = false;

if (!empty($userId)) {
    $stU = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
    $stU->execute([':id' => $userId]);
    $userRow = $stU->fetch();

    if ($userRow) {
        $userFound = true;
        $preferredBudget = (int)($userRow['preferred_budget'] ?? 200);
        $userCity = $userRow['city'] ?? 'Ahmedabad';
        if (!empty($userRow['favorite_vibes_json'])) {
            $dec = json_decode($userRow['favorite_vibes_json'], true);
            if (is_array($dec) && count($dec) > 0) {
                $favoriteVibes = $dec;
            }
        }

        // Fetch history and bookmarks
        $stH = $pdo->prepare("SELECT spot_id, action_type FROM user_history WHERE user_id = :uid");
        $stH->execute([':uid' => $userId]);
        $hist = $stH->fetchAll();
        foreach ($hist as $h) {
            if ($h['action_type'] === 'viewed') $viewedSpotIds[] = $h['spot_id'];
            if ($h['action_type'] === 'saved') $savedSpotIds[] = $h['spot_id'];
        }
    }
}

// Fetch all spots
$query = "SELECT * FROM spots";
$params = [];
if (!empty($cityFilter) && $cityFilter !== 'all') {
    $query .= " WHERE LOWER(city) = LOWER(:city)";
    $params[':city'] = $cityFilter;
}
$stmt = $pdo->prepare($query);
$stmt->execute($params);
$allSpots = $stmt->fetchAll();

$recommended = [];

foreach ($allSpots as $row) {
    $spot = formatSpotRow($row);
    $score = 50; // base score
    $reasons = [];

    // 1. Budget Alignment Scoring (+25 max)
    $avgCost = $spot['realPerPersonCost']['avg'];
    if ($avgCost <= $preferredBudget) {
        $score += 25;
        $reasons[] = "Fits your ₹{$preferredBudget} per-head budget";
    } else if ($avgCost <= $preferredBudget * 1.25) {
        $score += 15;
        $reasons[] = "Slightly above ₹{$preferredBudget} (great for splurges)";
    } else {
        $score -= 10;
    }

    // 2. Vibe Affinity Scoring (+25 max)
    if (in_array($spot['vibeCategory'], $favoriteVibes)) {
        $score += 25;
        $reasons[] = "Matches your favorite vibe: {$spot['vibeCategory']}";
    }

    // 3. User History Affinity
    if (in_array($spot['id'], $savedSpotIds)) {
        $score += 20;
        $reasons[] = "Saved in your favorites wishlist";
    } else if (in_array($spot['id'], $viewedSpotIds)) {
        $score += 10;
        $reasons[] = "Based on your recent viewing history";
    }

    // 4. Ground Reality Check Quality (+15 max)
    $realityScore = $spot['reelRealityCheck']['realityScore'];
    if ($realityScore >= 90) {
        $score += 15;
        $reasons[] = "High reality check score ({$realityScore}% true to Instagram)";
    } else if ($realityScore >= 80) {
        $score += 8;
    }

    // 5. High Student Upvotes (+10 max)
    $upvotes = $spot['scoutReview']['upvotes'];
    if ($upvotes > 200) {
        $score += 10;
        $reasons[] = "Endorsed by {$upvotes}+ campus student scouts";
    }

    // 6. Group Seating Capacity (+10 max)
    if ($spot['groupSeating']['maxGroupSize'] >= 12) {
        $score += 8;
        $reasons[] = "Huge group friendly (seats {$spot['groupSeating']['maxGroupSize']}+)";
    }

    // Cap score at 99
    $finalScore = min(99, max(40, $score));

    $recommended[] = [
        'spot' => $spot,
        'recommendationScore' => $finalScore,
        'primaryReason' => $reasons[0] ?? 'Popular Ahmedabad campus spot',
        'allReasons' => array_slice($reasons, 0, 3)
    ];
}

// Sort by recommendationScore descending
usort($recommended, function($a, $b) {
    return $b['recommendationScore'] <=> $a['recommendationScore'];
});

sendJsonResponse([
    'success' => true,
    'personalized' => $userFound,
    'userTargetBudget' => $preferredBudget,
    'userTargetVibes' => $favoriteVibes,
    'count' => count($recommended),
    'recommendations' => array_slice($recommended, 0, 8)
]);
