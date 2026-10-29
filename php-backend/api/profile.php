<?php
/**
 * Hangout-Hub Profile API (PHP + SQL)
 * Handles getting complete user profile, bookmarks, activity history, and updating profile data.
 */

require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

function formatUserProfile(array $row): array {
    $vibes = [];
    if (!empty($row['favorite_vibes_json'])) {
        $decoded = json_decode($row['favorite_vibes_json'], true);
        if (is_array($decoded)) {
            $vibes = $decoded;
        }
    }

    return [
        'id'              => $row['id'],
        'name'            => $row['name'],
        'email'           => $row['email'],
        'role'            => $row['role'] ?? 'student',
        'college'         => $row['college'] ?? 'Campus Hub',
        'city'            => $row['city'] ?? 'Ahmedabad',
        'preferredBudget' => (int)($row['preferred_budget'] ?? 200),
        'favoriteVibes'   => $vibes,
        'bio'             => $row['bio'] ?? '',
        'avatarColor'     => $row['avatar_color'] ?? '#C85A32',
        'createdAt'       => $row['created_at'] ?? date('Y-m-d')
    ];
}

// 1. GET /api/profile.php?user_id=...
if ($method === 'GET') {
    $userId = $_GET['user_id'] ?? '';
    if (empty($userId)) {
        // Fallback: use first user or Devendra's account
        $stFirst = $pdo->query("SELECT * FROM users ORDER BY created_at ASC LIMIT 1");
        $userRow = $stFirst->fetch();
        if (!$userRow) {
            sendJsonResponse(['success' => false, 'error' => 'No user found'], 404);
        }
        $userId = $userRow['id'];
    } else {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $userId]);
        $userRow = $stmt->fetch();
        if (!$userRow) {
            sendJsonResponse(['success' => false, 'error' => 'User not found'], 404);
        }
    }

    $profile = formatUserProfile($userRow);

    // Fetch user bookmarks (joined with spot summary)
    $bmStmt = $pdo->prepare("
        SELECT b.id AS bookmark_id, b.created_at AS bookmarked_at, s.*
        FROM user_bookmarks b
        JOIN spots s ON b.spot_id = s.id
        WHERE b.user_id = :uid
        ORDER BY b.created_at DESC
    ");
    $bmStmt->execute([':uid' => $userId]);
    $bookmarksRaw = $bmStmt->fetchAll();
    $bookmarks = array_map('formatSpotRow', $bookmarksRaw);

    // Fetch recent user activity history (views, saves, upvotes)
    $histStmt = $pdo->prepare("
        SELECT h.id AS history_id, h.action_type, h.metadata_json, h.created_at AS action_time,
               s.id AS spot_id, s.name AS spot_name, s.neighborhood, s.city, s.vibe_category, s.cost_avg
        FROM user_history h
        LEFT JOIN spots s ON h.spot_id = s.id
        WHERE h.user_id = :uid
        ORDER BY h.created_at DESC
        LIMIT 25
    ");
    $histStmt->execute([':uid' => $userId]);
    $historyRows = $histStmt->fetchAll();

    $history = [];
    foreach ($historyRows as $h) {
        $meta = [];
        if (!empty($h['metadata_json'])) {
            $mDec = json_decode($h['metadata_json'], true);
            if (is_array($mDec)) $meta = $mDec;
        }
        $history[] = [
            'id' => $h['history_id'],
            'actionType' => $h['action_type'],
            'actionTime' => $h['action_time'],
            'spotId' => $h['spot_id'],
            'spotName' => $h['spot_name'] ?? 'Hangout Spot',
            'neighborhood' => $h['neighborhood'] ?? '',
            'city' => $h['city'] ?? '',
            'vibeCategory' => $h['vibe_category'] ?? '',
            'costAvg' => (int)($h['cost_avg'] ?? 150),
            'metadata' => $meta
        ];
    }

    // Stats summary for the user profile
    $stats = [
        'totalSpotsViewed' => count(array_filter($history, fn($item) => $item['actionType'] === 'viewed')),
        'totalBookmarked' => count($bookmarks),
        'totalUpvotesGiven' => count(array_filter($history, fn($item) => $item['actionType'] === 'upvoted')),
        'memberSince' => $profile['createdAt']
    ];

    sendJsonResponse([
        'success' => true,
        'profile' => $profile,
        'bookmarks' => $bookmarks,
        'history' => $history,
        'stats' => $stats
    ]);
}

// 2. POST /api/profile.php - Update user profile
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $userId = $input['user_id'] ?? ($input['id'] ?? '');

    if (empty($userId)) {
        sendJsonResponse(['success' => false, 'error' => 'user_id is required for update'], 400);
    }

    $stmtCheck = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
    $stmtCheck->execute([':id' => $userId]);
    $existing = $stmtCheck->fetch();

    if (!$existing) {
        sendJsonResponse(['success' => false, 'error' => 'User not found to update'], 404);
    }

    $name = trim($input['name'] ?? $existing['name']);
    $college = trim($input['college'] ?? $existing['college']);
    $city = trim($input['city'] ?? $existing['city']);
    $budget = isset($input['preferredBudget']) ? (int)$input['preferredBudget'] : (int)$existing['preferred_budget'];
    $bio = isset($input['bio']) ? trim($input['bio']) : $existing['bio'];
    $avatarColor = $input['avatarColor'] ?? $existing['avatar_color'];

    $vibesJson = $existing['favorite_vibes_json'];
    if (isset($input['favoriteVibes']) && is_array($input['favoriteVibes'])) {
        $vibesJson = json_encode($input['favoriteVibes']);
    }

    $passwordClause = "";
    $params = [
        ':name' => $name,
        ':college' => $college,
        ':city' => $city,
        ':preferred_budget' => $budget,
        ':vibes' => $vibesJson,
        ':bio' => $bio,
        ':avatar_color' => $avatarColor,
        ':id' => $userId
    ];

    if (!empty($input['newPassword'])) {
        $params[':new_password_hash'] = password_hash(trim($input['newPassword']), PASSWORD_DEFAULT);
        $passwordClause = ", password_hash = :new_password_hash";
    }

    $updateSql = "UPDATE users SET
        name = :name,
        college = :college,
        city = :city,
        preferred_budget = :preferred_budget,
        favorite_vibes_json = :vibes,
        bio = :bio,
        avatar_color = :avatar_color
        {$passwordClause},
        updated_at = CURRENT_TIMESTAMP
        WHERE id = :id";

    $stUp = $pdo->prepare($updateSql);
    $stUp->execute($params);

    // Retrieve updated record
    $stmtUpdated = $pdo->prepare("SELECT * FROM users WHERE id = :id");
    $stmtUpdated->execute([':id' => $userId]);
    $updatedRow = $stmtUpdated->fetch();

    sendJsonResponse([
        'success' => true,
        'message' => !empty($input['newPassword'])
            ? 'Profile & password updated and saved to database successfully!'
            : 'Profile updated and saved to database successfully!',
        'profile' => formatUserProfile($updatedRow)
    ]);
}
