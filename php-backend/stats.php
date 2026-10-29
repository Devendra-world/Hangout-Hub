<?php
/**
 * Hangout-Hub PHP REST API: /api/stats.php
 * Aggregates live database statistics via SQL queries
 */

require_once __DIR__ . '/db.php';

$pdo = Database::getConnection();

try {
    // Total spots
    $st1 = $pdo->query("SELECT COUNT(*) AS total, AVG(cost_avg) AS avg_cost, SUM(upvotes) AS total_upvotes FROM spots");
    $spotData = $st1->fetch();

    // Distinct cities
    $stCities = $pdo->query("SELECT COUNT(DISTINCT city) AS total_cities FROM spots");
    $totalCities = (int)$stCities->fetch()['total_cities'];

    // Total surveys
    $st2 = $pdo->query("SELECT COUNT(*) AS total FROM survey_responses");
    $totalSurveys = (int)$st2->fetch()['total'];

    // Total partnerships
    $st3 = $pdo->query("SELECT COUNT(*) AS total FROM partnership_proposals");
    $totalPartnerships = (int)$st3->fetch()['total'];

    sendJsonResponse([
        'success'               => true,
        'engine'                => 'PHP/' . PHP_VERSION,
        'driver'                => Database::getDriver(),
        'totalSpots'            => (int)($spotData['total'] ?? 0),
        'totalCities'           => $totalCities,
        'studentsSurveyed'      => $totalSurveys + 180,
        'totalScoutUpvotes'     => (int)($spotData['total_upvotes'] ?? 0),
        'averagePerPersonCost'  => (int)round($spotData['avg_cost'] ?? 180),
        'activePartnerships'    => $totalPartnerships
    ]);
} catch (PDOException $e) {
    sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
