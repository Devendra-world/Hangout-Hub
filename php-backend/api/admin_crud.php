<?php
/**
 * Hangout-Hub Admin CRUD API (PHP + SQL)
 * Provides authorized table inspection and CRUD operations for Admin users:
 * - List rows from any table
 * - Insert new row
 * - Update existing row by ID
 * - Delete row by ID
 */

require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

$ALLOWED_TABLES = ['spots', 'users', 'survey_responses', 'partnership_proposals', 'user_history', 'user_bookmarks'];

// 1. GET: Fetch table schema & rows
if ($method === 'GET') {
    $table = $_GET['table'] ?? 'spots';
    if (!in_array($table, $ALLOWED_TABLES)) {
        sendJsonResponse(['success' => false, 'error' => 'Invalid table requested'], 400);
    }

    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $search = trim($_GET['search'] ?? '');

    $sql = "SELECT * FROM `{$table}`";
    $params = [];

    if (!empty($search)) {
        if ($table === 'spots') {
            $sql .= " WHERE name LIKE :q OR neighborhood LIKE :q OR city LIKE :q";
            $params[':q'] = "%{$search}%";
        } else if ($table === 'users') {
            $sql .= " WHERE name LIKE :q OR email LIKE :q OR college LIKE :q";
            $params[':q'] = "%{$search}%";
        } else if ($table === 'survey_responses') {
            $sql .= " WHERE student_name LIKE :q OR college_or_campus LIKE :q";
            $params[':q'] = "%{$search}%";
        } else if ($table === 'partnership_proposals') {
            $sql .= " WHERE cafe_name LIKE :q OR owner_name LIKE :q";
            $params[':q'] = "%{$search}%";
        }
    }

    $sql .= " ORDER BY created_at DESC LIMIT {$limit} OFFSET {$offset}";

    try {
        $st = $pdo->prepare($sql);
        $st->execute($params);
        $rows = $st->fetchAll();

        $countSt = $pdo->query("SELECT COUNT(*) as total FROM `{$table}`");
        $total = (int)$countSt->fetch()['total'];

        sendJsonResponse([
            'success' => true,
            'table' => $table,
            'total' => $total,
            'count' => count($rows),
            'rows' => $rows
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Query error: ' . $e->getMessage()], 500);
    }
}

// 2. POST / PUT / DELETE: Perform mutations
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $input['action'] ?? ($_GET['action'] ?? 'read');
$table  = $input['table'] ?? ($_GET['table'] ?? 'spots');

if (!in_array($table, $ALLOWED_TABLES)) {
    sendJsonResponse(['success' => false, 'error' => 'Invalid table target'], 400);
}

// CREATE RECORD
if ($action === 'create') {
    $data = $input['data'] ?? [];
    if (empty($data)) {
        sendJsonResponse(['success' => false, 'error' => 'No data provided to insert'], 400);
    }

    if (empty($data['id'])) {
        $prefix = substr($table, 0, 4);
        $data['id'] = $prefix . '-' . substr(md5(uniqid()), 0, 8);
    }

    // Special handling for passwords
    if ($table === 'users' && !empty($data['password'])) {
        $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
        unset($data['password']);
    }

    // Schema safety defaults for spots
    if ($table === 'spots') {
        $defaults = [
            'name' => 'Campus Cafe',
            'tagline' => 'Student verified campus spot',
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
            'ground_reality_truth' => 'Student verified prices and seating',
            'reality_score' => 90,
            'scout_name' => 'Campus Scout',
            'scout_college' => 'Ahmedabad Student Network',
            'scout_notes' => 'Great place to study and chill.',
            'verified_date' => date('M Y'),
            'upvotes' => 1,
            'tags_json' => json_encode(['Ahmedabad', 'Student Verified', 'Under ₹200'])
        ];
        $data = array_merge($defaults, $data);
    }

    // Schema safety defaults for users
    if ($table === 'users') {
        $defaults = [
            'name' => 'Student Scout',
            'email' => 'scout_' . substr(md5(uniqid()), 0, 6) . '@campus.edu',
            'password_hash' => password_hash('password123', PASSWORD_DEFAULT),
            'role' => 'student',
            'college' => 'Ahmedabad Campus',
            'city' => 'Ahmedabad',
            'preferred_budget' => 180,
            'favorite_vibes_json' => json_encode(['Study & Projects', 'Budget Bite & Chill']),
            'bio' => 'Campus scout reviewer',
            'avatar_color' => '#C85A32',
            'upi_id' => 'scout@oksbi'
        ];
        $data = array_merge($defaults, $data);
    }

    // Schema safety defaults for survey responses
    if ($table === 'survey_responses') {
        $defaults = [
            'student_name' => 'Campus Student',
            'college_or_campus' => 'Ahmedabad University',
            'year_of_study' => 'Undergraduate',
            'monthly_hangout_budget' => '₹2,000 - ₹3,500',
            'primary_frustration' => 'Honest pricing',
            'worst_experience_with_apps' => 'Hidden service charges and unexpected taxes',
            'ideal_spot_priorities_json' => json_encode(['Honest per-head cost', 'Big group table']),
            'max_acceptable_cost_per_head' => 200,
            'average_group_size' => 6,
            'submitted_at' => date('Y-m-d')
        ];
        $data = array_merge($defaults, $data);
    }

    // Schema safety defaults for partnership proposals
    if ($table === 'partnership_proposals') {
        $defaults = [
            'cafe_name' => 'Local Cafe',
            'owner_name' => 'Cafe Manager',
            'contact_email' => 'partner@cafe.com',
            'contact_phone' => '',
            'address' => 'Campus Road, Ahmedabad',
            'proposed_per_person_cost' => 180,
            'group_capacity' => 10,
            'offered_student_discount' => '10% student discount',
            'has_fast_wifi' => 1,
            'notes' => '',
            'submitted_at' => date('Y-m-d')
        ];
        $data = array_merge($defaults, $data);
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
            'id' => $data['id']
        ], 201);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Insert error: ' . $e->getMessage()], 500);
    }
}

// UPDATE RECORD
if ($action === 'update') {
    $id = $input['id'] ?? ($input['data']['id'] ?? '');
    $data = $input['data'] ?? [];

    if (empty($id) || empty($data)) {
        sendJsonResponse(['success' => false, 'error' => 'id and data are required to update'], 400);
    }

    // Special handling for users password update
    if ($table === 'users' && !empty($data['password'])) {
        $data['password_hash'] = password_hash($data['password'], PASSWORD_DEFAULT);
        unset($data['password']);
    }

    unset($data['id']); // Do not overwrite ID

    $sets = [];
    $execParams = [':id' => $id];
    foreach ($data as $col => $val) {
        $sets[] = "`{$col}` = :{$col}";
        $execParams[":{$col}"] = is_array($val) ? json_encode($val) : $val;
    }

    if (empty($sets)) {
        sendJsonResponse(['success' => false, 'error' => 'No columns to update'], 400);
    }

    $sql = "UPDATE `{$table}` SET " . implode(', ', $sets) . " WHERE id = :id";

    try {
        $st = $pdo->prepare($sql);
        $st->execute($execParams);

        sendJsonResponse([
            'success' => true,
            'message' => "Record {$id} in table {$table} updated successfully!",
            'id' => $id
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Update error: ' . $e->getMessage()], 500);
    }
}

// DELETE RECORD
if ($action === 'delete') {
    $id = $input['id'] ?? ($_GET['id'] ?? '');
    if (empty($id)) {
        sendJsonResponse(['success' => false, 'error' => 'Record id is required to delete'], 400);
    }

    try {
        $st = $pdo->prepare("DELETE FROM `{$table}` WHERE id = :id");
        $st->execute([':id' => $id]);

        sendJsonResponse([
            'success' => true,
            'message' => "Record {$id} deleted from table {$table} successfully!",
            'id' => $id
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Delete error: ' . $e->getMessage()], 500);
    }
}

sendJsonResponse(['success' => false, 'error' => 'Invalid action requested'], 400);
