<?php
/**
 * Hangout-Hub PHP REST API: /api/info.php
 * Returns database engine status and active backend telemetry
 */

require_once dirname(__DIR__) . '/config/db.php';

$pdo = Database::getConnection();

try {
    $driver = Database::getDriver();

    $stmtSpots = $pdo->query("SELECT COUNT(*) as c FROM spots");
    $totalSpots = (int)$stmtSpots->fetch()['c'];

    $stmtCities = $pdo->query("SELECT DISTINCT city FROM spots ORDER BY city ASC");
    $cities = $stmtCities->fetchAll(PDO::FETCH_COLUMN);

    $stmtSurv = $pdo->query("SELECT COUNT(*) as c FROM survey_responses");
    $totalSurveys = (int)$stmtSurv->fetch()['c'];

    $stmtPart = $pdo->query("SELECT COUNT(*) as c FROM partnership_proposals");
    $totalPart = (int)$stmtPart->fetch()['c'];

    sendJsonResponse([
        'success'         => true,
        'backend'         => 'PHP 8.2 (REST API)',
        'databaseType'    => $driver === 'mysql' ? 'MySQL / MariaDB' : 'SQLite (Zero-Config SQL Database)',
        'driver'          => $driver,
        'status'          => 'Operational & Connected',
        'tables'          => [
            'spots'                 => ['count' => $totalSpots],
            'survey_responses'      => ['count' => $totalSurveys],
            'partnership_proposals' => ['count' => $totalPart]
        ],
        'registeredCities' => $cities,
        'phpVersion'      => PHP_VERSION,
        'pdoDrivers'      => PDO::getAvailableDrivers(),
        'timestamp'       => date('c')
    ]);
} catch (PDOException $e) {
    sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
