<?php
/**
 * Hangout-Hub History & Bookmarks API (PHP + SQL)
 * Handles recording spot interactions (viewed, saved, upvoted, bill_split) and toggling bookmarks.
 */

require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $userId = $input['user_id'] ?? '';
    $spotId = $input['spot_id'] ?? '';
    $actionType = $input['action_type'] ?? 'viewed'; // 'viewed', 'saved', 'unsaved', 'upvoted', 'bill_split'
    $metadata = $input['metadata'] ?? [];

    if (empty($userId) || empty($spotId)) {
        sendJsonResponse(['success' => false, 'error' => 'user_id and spot_id are required'], 400);
    }

    $historyId = 'hist-' . substr(md5(uniqid()), 0, 10);
    $metaJson = !empty($metadata) ? json_encode($metadata) : null;

    // Insert history record
    $stHist = $pdo->prepare("
        INSERT INTO user_history (id, user_id, spot_id, action_type, metadata_json, created_at)
        VALUES (:id, :uid, :sid, :action, :meta, CURRENT_TIMESTAMP)
    ");
    $stHist->execute([
        ':id' => $historyId,
        ':uid' => $userId,
        ':sid' => $spotId,
        ':action' => $actionType,
        ':meta' => $metaJson
    ]);

    $isBookmarked = false;

    // Handle bookmark synchronization
    if ($actionType === 'saved') {
        $driver = Database::getDriver();
        $bmId = 'bm-' . substr(md5($userId . '_' . $spotId), 0, 12);
        if ($driver === 'sqlite') {
            $stBm = $pdo->prepare("INSERT OR IGNORE INTO user_bookmarks (id, user_id, spot_id, created_at) VALUES (:id, :uid, :sid, CURRENT_TIMESTAMP)");
        } else {
            $stBm = $pdo->prepare("INSERT IGNORE INTO user_bookmarks (id, user_id, spot_id, created_at) VALUES (:id, :uid, :sid, CURRENT_TIMESTAMP)");
        }
        $stBm->execute([':id' => $bmId, ':uid' => $userId, ':sid' => $spotId]);
        $isBookmarked = true;
    } else if ($actionType === 'unsaved') {
        $stDel = $pdo->prepare("DELETE FROM user_bookmarks WHERE user_id = :uid AND spot_id = :sid");
        $stDel->execute([':uid' => $userId, ':sid' => $spotId]);
        $isBookmarked = false;
    } else {
        // Check current bookmark state
        $stCheck = $pdo->prepare("SELECT id FROM user_bookmarks WHERE user_id = :uid AND spot_id = :sid LIMIT 1");
        $stCheck->execute([':uid' => $userId, ':sid' => $spotId]);
        $isBookmarked = (bool)$stCheck->fetch();
    }

    sendJsonResponse([
        'success' => true,
        'message' => 'Action recorded',
        'actionType' => $actionType,
        'isBookmarked' => $isBookmarked
    ]);
}

if ($method === 'GET') {
    $userId = $_GET['user_id'] ?? '';
    if (empty($userId)) {
        sendJsonResponse(['success' => false, 'error' => 'user_id query parameter is required'], 400);
    }

    $st = $pdo->prepare("
        SELECT h.id, h.action_type, h.created_at, s.id as spot_id, s.name, s.neighborhood, s.vibe_category, s.cost_avg
        FROM user_history h
        LEFT JOIN spots s ON h.spot_id = s.id
        WHERE h.user_id = :uid
        ORDER BY h.created_at DESC
        LIMIT 30
    ");
    $st->execute([':uid' => $userId]);
    $items = $st->fetchAll();

    sendJsonResponse([
        'success' => true,
        'count' => count($items),
        'history' => $items
    ]);
}
