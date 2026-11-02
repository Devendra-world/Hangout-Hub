<?php
/**
 * Hangout-Hub PHP REST API: /partnerships.php
 * Handles cafe owner partnership submissions with spam rate-limiting & PII protection
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';

$pdo = Database::getConnection();
ensureSecuritySchema($pdo);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    try {
        $optUser = getOptionalAuthUser($pdo);
        $isAdmin = $optUser && strtolower((string)($optUser['role'] ?? '')) === 'admin';

        $sql = $isAdmin
            ? "SELECT * FROM partnership_proposals ORDER BY created_at DESC"
            : "SELECT * FROM partnership_proposals WHERE status = 'verified_active' ORDER BY created_at DESC";

        $stmt = $pdo->query($sql);
        $rows = $stmt->fetchAll();

        $proposals = array_map(function($r) use ($isAdmin) {
            return [
                'id'                     => $r['id'],
                'cafeName'               => $r['cafe_name'],
                'ownerName'              => $isAdmin ? $r['owner_name'] : 'Verified Partner',
                'contactEmail'           => $isAdmin ? $r['contact_email'] : '',
                'contactPhone'           => $isAdmin ? $r['contact_phone'] : '',
                'address'                => $r['address'],
                'proposedPerPersonCost'  => (int)$r['proposed_per_person_cost'],
                'groupCapacity'          => (int)$r['group_capacity'],
                'offeredStudentDiscount' => $r['offered_student_discount'],
                'hasFastWifi'            => (bool)$r['has_fast_wifi'],
                'notes'                  => $r['notes'],
                'status'                 => $r['status'],
                'submittedAt'            => $r['submitted_at']
            ];
        }, $rows);

        sendJsonResponse([
            'success'   => true,
            'count'     => count($proposals),
            'proposals' => $proposals
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Failed to load partnerships'], 500);
    }
}

if ($method === 'POST') {
    // Max 5 partnership submissions per hour per IP (blocks spam bots)
    enforceRateLimit($pdo, 'partnership_submit', 5, 3600);

    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);

    if (!is_array($body)) {
        sendJsonResponse(['success' => false, 'error' => 'Invalid JSON payload'], 400);
    }

    $cafeName = cleanText($body['cafeName'] ?? '', 100);
    $ownerName = cleanText($body['ownerName'] ?? '', 80);
    $contactEmail = trim((string)($body['contactEmail'] ?? ''));
    $contactPhone = cleanText($body['contactPhone'] ?? '', 30);
    $address = cleanText($body['address'] ?? '', 200);
    $discount = cleanText($body['offeredStudentDiscount'] ?? '', 200);

    if (strlen($cafeName) < 2 || strlen($ownerName) < 2 || $contactEmail === '' || $address === '' || $discount === '') {
        sendJsonResponse(['success' => false, 'error' => 'Please complete all required partnership fields.'], 400);
    }
    if (!filter_var($contactEmail, FILTER_VALIDATE_EMAIL)) {
        sendJsonResponse(['success' => false, 'error' => 'Please enter a valid contact email address.'], 400);
    }

    $cost = (int)($body['proposedPerPersonCost'] ?? 200);
    $capacity = (int)($body['groupCapacity'] ?? 8);
    if ($cost < 20 || $cost > 5000 || $capacity < 2 || $capacity > 250) {
        sendJsonResponse(['success' => false, 'error' => 'Please enter realistic per-person cost and group seating capacity.'], 400);
    }

    $id = 'part-' . round(microtime(true) * 1000) . '-' . substr(bin2hex(random_bytes(2)), 0, 4);
    $wifi = !empty($body['hasFastWifi']) ? 1 : 0;
    $notes = cleanText($body['notes'] ?? '', 500);
    $status = 'pending_verification';
    $submittedAt = date('Y-m-d');

    $sql = "INSERT INTO partnership_proposals (
        id, cafe_name, owner_name, contact_email, contact_phone,
        address, proposed_per_person_cost, group_capacity, offered_student_discount,
        has_fast_wifi, notes, status, submitted_at
    ) VALUES (
        :id, :cafe_name, :owner_name, :contact_email, :contact_phone,
        :address, :proposed_per_person_cost, :group_capacity, :offered_student_discount,
        :has_fast_wifi, :notes, :status, :submitted_at
    )";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'                        => $id,
            ':cafe_name'                 => $cafeName,
            ':owner_name'                => $ownerName,
            ':contact_email'             => substr($contactEmail, 0, 150),
            ':contact_phone'             => $contactPhone,
            ':address'                   => $address,
            ':proposed_per_person_cost'  => $cost,
            ':group_capacity'            => $capacity,
            ':offered_student_discount'  => $discount,
            ':has_fast_wifi'             => $wifi,
            ':notes'                     => $notes,
            ':status'                    => $status,
            ':submitted_at'              => $submittedAt
        ]);

        sendJsonResponse([
            'success'  => true,
            'message'  => 'Partnership proposal received! Our campus scout team will review and verify.',
            'proposal' => [
                'id'                     => $id,
                'cafeName'               => $cafeName,
                'ownerName'              => $ownerName,
                'contactEmail'           => $contactEmail,
                'contactPhone'           => $contactPhone,
                'address'                => $address,
                'proposedPerPersonCost'  => $cost,
                'groupCapacity'          => $capacity,
                'offeredStudentDiscount' => $discount,
                'hasFastWifi'            => (bool)$wifi,
                'notes'                  => $notes,
                'status'                 => $status,
                'submittedAt'            => $submittedAt
            ]
        ], 201);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Failed to save partnership proposal.'], 500);
    }
}

sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
