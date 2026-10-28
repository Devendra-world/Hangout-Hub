<?php
/**
 * Hangout-Hub PHP REST API: /api/partnerships.php
 * Handles cafe owner partnership submissions and inquiries
 */

require_once dirname(__DIR__) . '/config/db.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM partnership_proposals ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();

        $proposals = array_map(function($r) {
            return [
                'id' => $r['id'],
                'cafeName' => $r['cafe_name'],
                'ownerName' => $r['owner_name'],
                'contactEmail' => $r['contact_email'],
                'contactPhone' => $r['contact_phone'],
                'address' => $r['address'],
                'proposedPerPersonCost' => (int)$r['proposed_per_person_cost'],
                'groupCapacity' => (int)$r['group_capacity'],
                'offeredStudentDiscount' => $r['offered_student_discount'],
                'hasFastWifi' => (bool)$r['has_fast_wifi'],
                'notes' => $r['notes'],
                'status' => $r['status'],
                'submittedAt' => $r['submitted_at']
            ];
        }, $rows);

        sendJsonResponse([
            'success'   => true,
            'count'     => count($proposals),
            'proposals' => $proposals
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);

    if (!is_array($body) || empty($body['cafeName']) || empty($body['ownerName'])) {
        sendJsonResponse(['success' => false, 'error' => 'Cafe name and owner name are required'], 400);
    }

    $id = 'part-' . round(microtime(true) * 1000);
    $cafeName = trim($body['cafeName']);
    $ownerName = trim($body['ownerName']);
    $contactEmail = !empty($body['contactEmail']) ? trim($body['contactEmail']) : 'contact@cafe.com';
    $contactPhone = !empty($body['contactPhone']) ? trim($body['contactPhone']) : '';
    $address = !empty($body['address']) ? trim($body['address']) : 'Campus Area';
    $cost = isset($body['proposedPerPersonCost']) ? (int)$body['proposedPerPersonCost'] : 200;
    $capacity = isset($body['groupCapacity']) ? (int)$body['groupCapacity'] : 8;
    $discount = !empty($body['offeredStudentDiscount']) ? trim($body['offeredStudentDiscount']) : '10% student group discount';
    $wifi = !empty($body['hasFastWifi']) ? 1 : 0;
    $notes = !empty($body['notes']) ? trim($body['notes']) : '';
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
            ':id' => $id,
            ':cafe_name' => $cafeName,
            ':owner_name' => $ownerName,
            ':contact_email' => $contactEmail,
            ':contact_phone' => $contactPhone,
            ':address' => $address,
            ':proposed_per_person_cost' => $cost,
            ':group_capacity' => $capacity,
            ':offered_student_discount' => $discount,
            ':has_fast_wifi' => $wifi,
            ':notes' => $notes,
            ':status' => $status,
            ':submitted_at' => $submittedAt
        ]);

        sendJsonResponse([
            'success' => true,
            'message' => 'Partnership proposal saved to PHP SQL Database! Student scout team will visit to verify.',
            'proposal' => [
                'id' => $id,
                'cafeName' => $cafeName,
                'ownerName' => $ownerName,
                'contactEmail' => $contactEmail,
                'contactPhone' => $contactPhone,
                'address' => $address,
                'proposedPerPersonCost' => $cost,
                'groupCapacity' => $capacity,
                'offeredStudentDiscount' => $discount,
                'hasFastWifi' => (bool)$wifi,
                'notes' => $notes,
                'status' => $status,
                'submittedAt' => $submittedAt
            ]
        ], 201);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
