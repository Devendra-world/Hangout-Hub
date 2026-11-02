<?php
/**
 * Hangout-Hub Admin CRUD API (PHP + SQL)
 * Verifies Admin session token against SQL `auth_sessions` + `users.role = 'admin'`,
 * supports InfinityFree X-Auth-Token / Authorization headers, and enforces strict column whitelisting.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = Database::getConnection();
ensureSecuritySchema($pdo);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

$rawBody = $method === 'POST' || $method === 'PUT' || $method === 'DELETE'
    ? file_get_contents('php://input')
    : '';
$input = $rawBody !== '' ? (json_decode($rawBody, true) ?? []) : [];

// Verify token in DB `auth_sessions` AND verify `users.role === 'admin'`
$adminUser = requireAdminUser($pdo, is_array($input) ? $input : null);

$ALLOWED_COLUMNS = [
    'spots' => [
        'id', 'status', 'submitted_by', 'name', 'tagline', 'city', 'campus_name', 'neighborhood', 'distance_to_campus',
        'vibe_category', 'cost_min', 'cost_max', 'cost_avg', 'popular_order_example',
        'official_claim_cost', 'max_group_size', 'seating_description', 'push_together_allowed',
        'booth_count', 'reservation_needed', 'reservation_tip', 'wifi_speed_mbps',
        'wifi_reliability', 'power_outlets', 'noise_decibels', 'noise_description',
        'board_games_available', 'outside_cake_allowed', 'student_discount_available',
        'discount_note', 'air_conditioned', 'open_late_night', 'closing_time', 'has_reel',
        'reel_url', 'reel_creator', 'reel_hype_claim', 'ground_reality_truth', 'reality_score',
        'scout_name', 'scout_college', 'scout_notes', 'verified_date', 'upvotes', 'tags_json',
        'visual_theme_json'
    ],
    'users' => [
        'id', 'name', 'email', 'password_hash', 'role', 'college', 'city',
        'preferred_budget', 'favorite_vibes_json', 'bio', 'avatar_color', 'upi_id'
    ],
    'survey_responses' => [
        'id', 'student_name', 'college_or_campus', 'year_of_study', 'monthly_hangout_budget',
        'primary_frustration', 'worst_experience_with_apps', 'ideal_spot_priorities_json',
        'max_acceptable_cost_per_head', 'average_group_size', 'submitted_at'
    ],
    'partnership_proposals' => [
        'id', 'status', 'cafe_name', 'owner_name', 'contact_email', 'contact_phone', 'address',
        'proposed_per_person_cost', 'group_capacity', 'offered_student_discount',
        'has_fast_wifi', 'notes', 'submitted_at'
    ],
    'user_history' => [
        'id', 'user_id', 'spot_id', 'action_type', 'metadata_json'
    ],
    'user_bookmarks' => [
        'id', 'user_id', 'spot_id'
    ]
];

$ALLOWED_TABLES = array_keys($ALLOWED_COLUMNS);

function filterAllowedData(array $data, array $allowedCols): array {
    $clean = [];
    foreach ($data as $col => $val) {
        if (is_string($col) && preg_match('/^[a-zA-Z0-9_]+$/', $col) && in_array($col, $allowedCols, true)) {
            $clean[$col] = $val;
        }
    }
    return $clean;
}

if ($method === 'GET') {
    $table = $_GET['table'] ?? 'spots';
    if (!in_array($table, $ALLOWED_TABLES, true)) {
        sendJsonResponse(['success' => false, 'error' => 'Invalid table requested'], 400);
    }

    $limit = max(1, min(500, isset($_GET['limit']) ? (int)$_GET['limit'] : 100));
    $offset = max(0, isset($_GET['offset']) ? (int)$_GET['offset'] : 0);
    $search = trim($_GET['search'] ?? '');

    $sql = "SELECT * FROM `{$table}`";
    $params = [];

    if ($search !== '') {
        if ($table === 'spots') {
            $sql .= " WHERE name LIKE :q OR neighborhood LIKE :q OR city LIKE :q OR status LIKE :q";
            $params[':q'] = "%{$search}%";
        } elseif ($table === 'users') {
            $sql .= " WHERE name LIKE :q OR email LIKE :q OR college LIKE :q";
            $params[':q'] = "%{$search}%";
        } elseif ($table === 'survey_responses') {
            $sql .= " WHERE student_name LIKE :q OR college_or_campus LIKE :q";
            $params[':q'] = "%{$search}%";
        } elseif ($table === 'partnership_proposals') {
            $sql .= " WHERE cafe_name LIKE :q OR owner_name LIKE :q";
            $params[':q'] = "%{$search}%";
        }
    }

    if ($table === 'spots') {
        $sql .= " ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, created_at DESC LIMIT {$limit} OFFSET {$offset}";
    } else {
        $sql .= " ORDER BY created_at DESC LIMIT {$limit} OFFSET {$offset}";
    }

    try {
        $st = $pdo->prepare($sql);
        $st->execute($params);
        $rows = $st->fetchAll();

        if ($table === 'users') {
            foreach ($rows as &$r) {
                unset($r['password_hash']);
            }
            unset($r);
        }

        // Put `status` near the front of `spots` columns so Admins see Pending/Approved right away
        if ($table === 'spots') {
            foreach ($rows as &$r) {
                $statusVal = $r['status'] ?? 'approved';
                unset($r['status']);
                $r = array_merge(['id' => $r['id'], 'status' => $statusVal], $r);
            }
            unset($r);
        }

        $countSt = $pdo->query("SELECT COUNT(*) as total FROM `{$table}`");
        $total = (int)$countSt->fetch()['total'];

        sendJsonResponse([
            'success' => true,
            'table'   => $table,
            'total'   => $total,
            'count'   => count($rows),
            'rows'    => $rows
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Database query failed'], 500);
    }
}

$action = $input['action'] ?? ($_GET['action'] ?? 'read');
$table  = $input['table'] ?? ($_GET['table'] ?? 'spots');

if (!in_array($table, $ALLOWED_TABLES, true)) {
    sendJsonResponse(['success' => false, 'error' => 'Invalid table target'], 400);
}

if ($action === 'create') {
    $rawData = is_array($input['data'] ?? null) ? $input['data'] : [];
    if (empty($rawData)) {
        sendJsonResponse(['success' => false, 'error' => 'No data provided to insert'], 400);
    }

    if ($table === 'users' && !empty($rawData['password'])) {
        $rawData['password_hash'] = password_hash((string)$rawData['password'], PASSWORD_DEFAULT);
        unset($rawData['password']);
    }

    // Strict MySQL NOT NULL safety defaults when creating records via quick Admin form
    if ($table === 'spots') {
        $defaults = [
            'status' => 'approved',
            'submitted_by' => $adminUser['id'],
            'name' => 'Campus Cafe',
            'tagline' => 'Admin verified campus spot',
            'city' => 'Ahmedabad',
            'campus_name' => 'Local Campus',
            'neighborhood' => 'Navrangpura',
            'distance_to_campus' => 'Near campus gate',
            'vibe_category' => 'Budget Bite & Chill',
            'cost_min' => 100,
            'cost_max' => 200,
            'cost_avg' => 150,
            'popular_order_example' => 'Chai + Snack combo',
            'official_claim_cost' => '₹250 for two',
            'max_group_size' => 8,
            'seating_description' => 'Comfortable group seating',
            'push_together_allowed' => 1,
            'booth_count' => 0,
            'reservation_needed' => 0,
            'reservation_tip' => 'Walk-in friendly',
            'wifi_speed_mbps' => 40,
            'wifi_reliability' => 'Decent for Browsing',
            'power_outlets' => 'Select Wall Tables',
            'noise_decibels' => 65,
            'noise_description' => 'Pleasant campus banter',
            'board_games_available' => 0,
            'outside_cake_allowed' => 1,
            'student_discount_available' => 0,
            'discount_note' => 'Show college ID',
            'air_conditioned' => 1,
            'open_late_night' => 0,
            'closing_time' => '11:00 PM',
            'has_reel' => 0,
            'reel_url' => '',
            'reel_creator' => '',
            'reel_hype_claim' => '',
            'ground_reality_truth' => 'Admin verified prices and seating',
            'reality_score' => 90,
            'scout_name' => $adminUser['name'] ?? 'Campus Admin',
            'scout_college' => 'Hangout-Hub Admin',
            'scout_notes' => 'Verified and published by Admin.',
            'verified_date' => date('M Y'),
            'upvotes' => 1,
            'tags_json' => json_encode(['Student Verified', 'Admin Audited'])
        ];
        $rawData = array_merge($defaults, $rawData);
    } elseif ($table === 'users') {
        $defaults = [
            'name' => 'Student User',
            'email' => 'student_' . bin2hex(random_bytes(3)) . '@campus.edu',
            'password_hash' => password_hash('Student@2026!', PASSWORD_DEFAULT),
            'role' => 'student',
            'college' => 'Campus Hub',
            'city' => 'Ahmedabad',
            'preferred_budget' => 180,
            'favorite_vibes_json' => json_encode(['Budget Bite & Chill'])
        ];
        $rawData = array_merge($defaults, $rawData);
    } elseif ($table === 'survey_responses') {
        $defaults = [
            'student_name' => 'Campus Student',
            'college_or_campus' => 'Campus Hub',
            'year_of_study' => 'Undergraduate',
            'monthly_hangout_budget' => '₹2,000 - ₹3,500',
            'primary_frustration' => 'Misleading prices',
            'worst_experience_with_apps' => 'Recorded via Admin Console',
            'ideal_spot_priorities_json' => json_encode(['Honest per-head cost']),
            'max_acceptable_cost_per_head' => 200,
            'average_group_size' => 6,
            'submitted_at' => date('Y-m-d')
        ];
        $rawData = array_merge($defaults, $rawData);
    } elseif ($table === 'partnership_proposals') {
        $defaults = [
            'cafe_name' => 'Partner Cafe',
            'owner_name' => 'Cafe Manager',
            'contact_email' => 'owner@cafe.com',
            'contact_phone' => '',
            'address' => 'Campus Area',
            'proposed_per_person_cost' => 180,
            'group_capacity' => 10,
            'offered_student_discount' => '10% student discount',
            'has_fast_wifi' => 1,
            'notes' => '',
            'status' => 'pending_verification',
            'submitted_at' => date('Y-m-d')
        ];
        $rawData = array_merge($defaults, $rawData);
    }

    if (empty($rawData['id'])) {
        $prefix = substr($table, 0, 4);
        $rawData['id'] = $prefix . '-' . bin2hex(random_bytes(4));
    }

    $data = filterAllowedData($rawData, $ALLOWED_COLUMNS[$table]);
    if (empty($data)) {
        sendJsonResponse(['success' => false, 'error' => 'No valid columns provided'], 400);
    }

    $columns = array_keys($data);
    $placeholders = array_map(fn($col) => ":{$col}", $columns);
    $sql = "INSERT INTO `{$table}` (" . implode(', ', array_map(fn($c) => "`{$c}`", $columns)) . ") VALUES (" . implode(', ', $placeholders) . ")";

    try {
        $st = $pdo->prepare($sql);
        $execParams = [];
        foreach ($data as $col => $val) {
            $execParams[":{$col}"] = is_array($val) ? json_encode($val) : $val;
        }
        $st->execute($execParams);

        sendJsonResponse([
            'success' => true,
            'message' => "Record created in table {$table}!",
            'id'      => $data['id']
        ], 201);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Insert operation failed: ' . $e->getMessage()], 500);
    }
}

if ($action === 'update') {
    $id = trim((string)($input['id'] ?? ($input['data']['id'] ?? '')));
    $rawData = is_array($input['data'] ?? null) ? $input['data'] : [];

    if ($id === '' || empty($rawData)) {
        sendJsonResponse(['success' => false, 'error' => 'id and data are required to update'], 400);
    }

    if ($table === 'users' && !empty($rawData['password'])) {
        $rawData['password_hash'] = password_hash((string)$rawData['password'], PASSWORD_DEFAULT);
        unset($rawData['password']);
    }

    if ($table === 'spots' && ($rawData['status'] ?? '') === 'approved' && empty($rawData['verified_date'])) {
        $rawData['verified_date'] = 'Admin Verified (' . date('M Y') . ')';
    }

    unset($rawData['id']);
    $data = filterAllowedData($rawData, $ALLOWED_COLUMNS[$table]);

    if (empty($data)) {
        sendJsonResponse(['success' => false, 'error' => 'No valid columns to update'], 400);
    }

    $sets = [];
    $execParams = [':id' => $id];
    foreach ($data as $col => $val) {
        $sets[] = "`{$col}` = :{$col}";
        $execParams[":{$col}"] = is_array($val) ? json_encode($val) : $val;
    }

    $sql = "UPDATE `{$table}` SET " . implode(', ', $sets) . " WHERE id = :id";

    try {
        $st = $pdo->prepare($sql);
        $st->execute($execParams);

        sendJsonResponse([
            'success' => true,
            'message' => "Record {$id} in table {$table} updated successfully!",
            'id'      => $id
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Update operation failed'], 500);
    }
}

if ($action === 'delete') {
    $id = trim((string)($input['id'] ?? ($_GET['id'] ?? '')));
    if ($id === '') {
        sendJsonResponse(['success' => false, 'error' => 'Record id is required to delete'], 400);
    }

    try {
        $st = $pdo->prepare("DELETE FROM `{$table}` WHERE id = :id");
        $st->execute([':id' => $id]);

        if ($table === 'spots') {
            // Also clean up orphan votes & bookmarks for the deleted cafe
            try {
                $pdo->prepare("DELETE FROM spot_votes WHERE spot_id = :id")->execute([':id' => $id]);
                $pdo->prepare("DELETE FROM user_bookmarks WHERE spot_id = :id")->execute([':id' => $id]);
            } catch (Throwable $e) {}
        }

        sendJsonResponse([
            'success' => true,
            'message' => "Record {$id} deleted from table {$table} successfully!",
            'id'      => $id
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Delete operation failed'], 500);
    }
}

sendJsonResponse(['success' => false, 'error' => 'Invalid action requested'], 400);
