<?php
/**
 * Hangout-Hub PHP REST API: /spot_detail.php
 * Handles fetching single approved spot details and authenticated 1-vote-per-user upvoting
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';

$pdo = Database::getConnection();
ensureSecuritySchema($pdo);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$rawInput = $method === 'POST' ? file_get_contents('php://input') : '';
$body = $rawInput !== '' ? json_decode($rawInput, true) : null;

$id = trim((string)($_GET['id'] ?? (is_array($body) ? ($body['id'] ?? '') : '')));
$action = trim((string)($_GET['action'] ?? (is_array($body) ? ($body['action'] ?? '') : '')));

if ($id === '') {
    sendJsonResponse(['success' => false, 'error' => 'Spot ID is required'], 400);
}

// Authenticated 1-Vote-Per-User Upvoting
if ($action === 'vote') {
    recordSpotUpvote($pdo, $id, is_array($body) ? $body : null);
}

// Single spot details (approved spots publicly; pending visible to Admin)
try {
    $optUser = getOptionalAuthUser($pdo, is_array($body) ? $body : null);
    $isAdmin = $optUser && strtolower((string)($optUser['role'] ?? '')) === 'admin';

    $sql = $isAdmin
        ? "SELECT * FROM spots WHERE id = :id"
        : "SELECT * FROM spots WHERE id = :id AND (status IS NULL OR status = '' OR status = 'approved')";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $id]);
    $row = $stmt->fetch();

    if (!$row) {
        sendJsonResponse(['success' => false, 'error' => 'Spot not found or pending verification'], 404);
    }

    $formatted = formatSpotRow($row);
    $formatted['status'] = $row['status'] ?? 'approved';

    sendJsonResponse([
        'success' => true,
        'spot'    => $formatted
    ]);
} catch (PDOException $e) {
    sendJsonResponse(['success' => false, 'error' => 'Failed to load spot details'], 500);
}
