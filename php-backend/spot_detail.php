<?php
/**
 * Hangout-Hub PHP REST API: /api/spot_detail.php
 * Handles fetching single spot details and upvoting
 */

require_once __DIR__ . '/db.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$id = trim($_GET['id'] ?? '');
$action = trim($_GET['action'] ?? '');

if (empty($id)) {
    sendJsonResponse(['success' => false, 'error' => 'Spot ID is required'], 400);
}

// Upvoting
if ($action === 'vote') {
    try {
        $updateStmt = $pdo->prepare("UPDATE spots SET upvotes = upvotes + 1 WHERE id = :id");
        $updateStmt->execute([':id' => $id]);

        $fetchStmt = $pdo->prepare("SELECT upvotes FROM spots WHERE id = :id");
        $fetchStmt->execute([':id' => $id]);
        $row = $fetchStmt->fetch();

        if (!$row) {
            sendJsonResponse(['success' => false, 'error' => 'Spot not found'], 404);
        }

        sendJsonResponse([
            'success' => true,
            'upvotes' => (int)$row['upvotes']
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

// Single spot details
try {
    $stmt = $pdo->prepare("SELECT * FROM spots WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        sendJsonResponse(['success' => false, 'error' => 'Spot not found'], 404);
    }

    sendJsonResponse([
        'success' => true,
        'spot'    => formatSpotRow($row)
    ]);
} catch (PDOException $e) {
    sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
