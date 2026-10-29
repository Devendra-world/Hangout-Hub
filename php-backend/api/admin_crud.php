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
