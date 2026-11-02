<?php
/**
 * Hangout-Hub PHP Database Connection Module
 * 
 * Supports both:
 * 1. MySQL / MariaDB (Standard for XAMPP, phpMyAdmin, WAMP, cPanel)
 * 2. SQLite (Self-contained, zero-configuration local database for immediate runtime)
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

class Database {
    private static ?PDO $instance = null;
    private static string $driverUsed = 'none';

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $mysqlHost = getenv('DB_HOST') ?: 'localhost';
        $mysqlDb   = getenv('DB_NAME') ?: 'hangout_hub';
        $mysqlUser = getenv('DB_USER') ?: 'root';
        $mysqlPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
        $forceSqlite = getenv('FORCE_SQLITE') === 'true' || getenv('DB_CONNECTION') === 'sqlite';

        // Try MySQL first if not explicitly forced to SQLite
        if (!$forceSqlite) {
            try {
                $dsn = "mysql:host={$mysqlHost};dbname={$mysqlDb};charset=utf8mb4";
                $pdo = new PDO($dsn, $mysqlUser, $mysqlPass, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::ATTR_TIMEOUT            => 2,
                ]);
                self::$instance = $pdo;
                self::$driverUsed = 'mysql';
                return self::$instance;
            } catch (PDOException $e) {
                // MySQL not running or not configured, smoothly falling back to SQLite
            }
        }

        // SQLite fallback (Zero-config, works everywhere)
        $sqliteDir = dirname(__DIR__) . '/data';
        if (!is_dir($sqliteDir)) {
            @mkdir($sqliteDir, 0777, true);
        }
        $sqlitePath = $sqliteDir . '/hangout_hub.db';

        try {
            $pdo = new PDO("sqlite:" . $sqlitePath, null, null, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            // Enable WAL mode for high performance concurrency
            $pdo->exec('PRAGMA journal_mode = WAL;');
            self::$instance = $pdo;
            self::$driverUsed = 'sqlite';
            return self::$instance;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Database connection failed: ' . $e->getMessage()
            ]);
            exit;
        }
    }

    public static function getDriver(): string {
        if (self::$instance === null) {
            self::getConnection();
        }
        return self::$driverUsed;
    }
}

/**
 * Format a database row from the `spots` table to match the HangoutSpot TypeScript interface
 */
function formatSpotRow(array $row): array {
    $tags = [];
    if (!empty($row['tags_json'])) {
        $decoded = json_decode($row['tags_json'], true);
        if (is_array($decoded)) {
            $tags = $decoded;
        }
    }

    $visualTheme = [
        'primaryColor' => '#78350F',
        'patternType'  => 'warm',
        'heroIconName' => 'Coffee'
    ];
    if (!empty($row['visual_theme_json'])) {
        $decodedTheme = json_decode($row['visual_theme_json'], true);
        if (is_array($decodedTheme)) {
            $visualTheme = array_merge($visualTheme, $decodedTheme);
        }
    }

    return [
        'id'               => $row['id'],
        'name'             => $row['name'],
        'tagline'          => $row['tagline'],
        'city'             => $row['city'] ?? 'Ahmedabad',
        'campusName'       => $row['campus_name'] ?? 'Campus Hub',
        'neighborhood'     => $row['neighborhood'],
        'distanceToCampus' => $row['distance_to_campus'],
        'vibeCategory'     => $row['vibe_category'],
        'realPerPersonCost' => [
            'min'                 => (int)($row['cost_min'] ?? 100),
            'max'                 => (int)($row['cost_max'] ?? 200),
            'avg'                 => (int)($row['cost_avg'] ?? 150),
            'popularOrderExample' => $row['popular_order_example'] ?? 'Chai + Snack combo'
        ],
        'officialClaimCost' => $row['official_claim_cost'] ?? 'Food app claims higher',
        'groupSeating' => [
            'maxGroupSize'        => (int)($row['max_group_size'] ?? 8),
            'seatingDescription' => $row['seating_description'] ?? 'Group friendly',
            'pushTogetherAllowed' => (bool)($row['push_together_allowed'] ?? 1),
            'boothCount'          => (int)($row['booth_count'] ?? 0),
            'reservationNeeded'   => (bool)($row['reservation_needed'] ?? 0),
            'reservationTip'      => $row['reservation_tip'] ?? 'Walk-ins welcome'
        ],
        'amenities' => [
            'wifiSpeedMbps'           => (int)($row['wifi_speed_mbps'] ?? 30),
            'wifiReliability'         => $row['wifi_reliability'] ?? 'Decent for Browsing',
            'powerOutlets'            => $row['power_outlets'] ?? 'Select Wall Tables',
            'noiseDecibels'           => (int)($row['noise_decibels'] ?? 60),
            'noiseDescription'        => $row['noise_description'] ?? 'Normal chatter',
            'boardGamesAvailable'     => (bool)($row['board_games_available'] ?? 0),
            'outsideCakeAllowed'      => (bool)($row['outside_cake_allowed'] ?? 1),
            'studentDiscountAvailable'=> (bool)($row['student_discount_available'] ?? 0),
            'discountNote'            => $row['discount_note'] ?? 'Show student ID',
            'airConditioned'          => (bool)($row['air_conditioned'] ?? 1),
            'openLateNight'           => (bool)($row['open_late_night'] ?? 0),
            'closingTime'             => $row['closing_time'] ?? '11:00 PM'
        ],
        'reelRealityCheck' => [
            'hasReel'            => (bool)($row['has_reel'] ?? 1),
            'reelUrl'            => $row['reel_url'] ?? '',
            'reelCreator'        => $row['reel_creator'] ?? '@campus_scout',
            'reelHypeClaim'      => $row['reel_hype_claim'] ?? 'Aesthetic Instagram clip',
            'groundRealityTruth' => $row['ground_reality_truth'] ?? 'Student audited ground truth.',
            'realityScore'       => (int)($row['reality_score'] ?? 88)
        ],
        'scoutReview' => [
            'scoutName'     => $row['scout_name'] ?? 'Student Scout',
            'scoutCollege'  => $row['scout_college'] ?? 'Campus Network',
            'scoutNotes'    => $row['scout_notes'] ?? 'Audited with friends.',
            'verifiedDate'  => $row['verified_date'] ?? 'Recently Verified',
            'upvotes'       => (int)($row['upvotes'] ?? 0)
        ],
        'tags'        => $tags,
        'visualTheme' => $visualTheme
    ];
}

/**
 * Format a database row from the `survey_responses` table
 */
function formatSurveyRow(array $row): array {
    $priorities = [];
    if (!empty($row['ideal_spot_priorities_json'])) {
        $decoded = json_decode($row['ideal_spot_priorities_json'], true);
        if (is_array($decoded)) {
            $priorities = $decoded;
        }
    }

    return [
        'id'                      => $row['id'],
        'studentName'             => $row['student_name'],
        'collegeOrCampus'         => $row['college_or_campus'],
        'yearOfStudy'             => $row['year_of_study'],
        'monthlyHangoutBudget'    => $row['monthly_hangout_budget'],
        'primaryFrustration'      => $row['primary_frustration'],
        'worstExperienceWithApps' => $row['worst_experience_with_apps'],
        'idealSpotPriorities'     => $priorities,
        'maxAcceptableCostPerHead'=> (int)($row['max_acceptable_cost_per_head'] ?? 200),
        'averageGroupSize'        => (int)($row['average_group_size'] ?? 6),
        'submittedAt'             => $row['submitted_at']
    ];
}

/**
 * Send JSON response with headers
 */
function sendJsonResponse(array $payload, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Powered-By: PHP/8.2 PDO Database Engine');
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}
