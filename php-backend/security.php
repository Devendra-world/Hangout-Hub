<?php
/**
 * Hangout-Hub Security, Session Verification, Moderation & Rate-Limiting Module
 * Works seamlessly on InfinityFree (MySQL/MariaDB), XAMPP, and Local SQLite PDO.
 * Automatically migrates security tables & columns without touching config/db.php.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token, X-Admin-Token');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!function_exists('sendJsonResponse')) {
    function sendJsonResponse(array $payload, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/**
 * Automatically creates security tables (auth_sessions, rate_limits, spot_votes)
 * and ensures spots.status ('approved' | 'pending' | 'rejected') & spots.submitted_by exist.
 * Safe & idempotent on both MySQL (InfinityFree) and SQLite.
 */
function ensureSecuritySchema(PDO $pdo): void {
    static $migrated = false;
    if ($migrated) {
        return;
    }
    $migrated = true;

    $driver = strtolower((string)$pdo->getAttribute(PDO::ATTR_DRIVER_NAME));

    try {
        if ($driver === 'sqlite') {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS auth_sessions (
                    token TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    expires_at INTEGER NOT NULL,
                    ip_hash TEXT DEFAULT '',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);

                CREATE TABLE IF NOT EXISTS rate_limits (
                    rate_key TEXT PRIMARY KEY,
                    attempts INTEGER NOT NULL DEFAULT 1,
                    reset_at INTEGER NOT NULL
                );

                CREATE TABLE IF NOT EXISTS spot_votes (
                    id TEXT PRIMARY KEY,
                    spot_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(spot_id, user_id)
                );
            ");

            $cols = $pdo->query("PRAGMA table_info(spots)")->fetchAll(PDO::FETCH_ASSOC);
            $colNames = array_column($cols, 'name');
            if (!in_array('status', $colNames, true)) {
                $pdo->exec("ALTER TABLE spots ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'");
            }
            if (!in_array('submitted_by', $colNames, true)) {
                $pdo->exec("ALTER TABLE spots ADD COLUMN submitted_by TEXT DEFAULT NULL");
            }
        } else {
            // MySQL / MariaDB (InfinityFree, cPanel, XAMPP)
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `auth_sessions` (
                    `token` VARCHAR(128) NOT NULL PRIMARY KEY,
                    `user_id` VARCHAR(64) NOT NULL,
                    `expires_at` BIGINT NOT NULL,
                    `ip_hash` VARCHAR(64) DEFAULT '',
                    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX `idx_session_user` (`user_id`),
                    INDEX `idx_session_exp` (`expires_at`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `rate_limits` (
                    `rate_key` VARCHAR(128) NOT NULL PRIMARY KEY,
                    `attempts` INT NOT NULL DEFAULT 1,
                    `reset_at` BIGINT NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `spot_votes` (
                    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
                    `spot_id` VARCHAR(64) NOT NULL,
                    `user_id` VARCHAR(64) NOT NULL,
                    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY `uniq_spot_user_vote` (`spot_id`, `user_id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");

            $stStatus = $pdo->query("SHOW COLUMNS FROM `spots` LIKE 'status'");
            if (!$stStatus || !$stStatus->fetch()) {
                $pdo->exec("ALTER TABLE `spots` ADD COLUMN `status` VARCHAR(32) NOT NULL DEFAULT 'approved'");
            }

            $stSub = $pdo->query("SHOW COLUMNS FROM `spots` LIKE 'submitted_by'");
            if (!$stSub || !$stSub->fetch()) {
                $pdo->exec("ALTER TABLE `spots` ADD COLUMN `submitted_by` VARCHAR(64) DEFAULT NULL");
            }
        }
    } catch (Throwable $e) {
        // Non-fatal if user permissions restrict DDL after tables already exist
    }
}

/**
 * Resolve client IP hash for privacy-safe rate limiting.
 */
function getClientIpHash(): string {
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP']
        ?? $_SERVER['HTTP_X_FORWARDED_FOR']
        ?? $_SERVER['REMOTE_ADDR']
        ?? '0.0.0.0';
    if (strpos($ip, ',') !== false) {
        $ip = trim(explode(',', $ip)[0]);
    }
    return hash('sha256', 'hh_rl_v1|' . trim($ip));
}

/**
 * Extracts session token reliably even when shared hosts (InfinityFree Apache/PHP-FPM)
 * strip the HTTP Authorization header. Checks X-Auth-Token, X-Admin-Token,
 * Authorization, getallheaders(), and body/query _auth_token fallback.
 */
function extractAuthToken(?array $body = null): string {
    $candidates = [];

    if (!empty($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        $candidates[] = $_SERVER['HTTP_X_AUTH_TOKEN'];
    }
    if (!empty($_SERVER['REDIRECT_HTTP_X_AUTH_TOKEN'])) {
        $candidates[] = $_SERVER['REDIRECT_HTTP_X_AUTH_TOKEN'];
    }
    if (!empty($_SERVER['HTTP_X_ADMIN_TOKEN'])) {
        $candidates[] = $_SERVER['HTTP_X_ADMIN_TOKEN'];
    }
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $candidates[] = $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $candidates[] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (is_array($headers)) {
            foreach ($headers as $k => $v) {
                $lower = strtolower((string)$k);
                if ($lower === 'x-auth-token' || $lower === 'x-admin-token' || $lower === 'authorization') {
                    $candidates[] = (string)$v;
                }
            }
        }
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (is_array($headers)) {
            foreach ($headers as $k => $v) {
                $lower = strtolower((string)$k);
                if ($lower === 'x-auth-token' || $lower === 'x-admin-token' || $lower === 'authorization') {
                    $candidates[] = (string)$v;
                }
            }
        }
    }

    if (is_array($body) && !empty($body['_auth_token']) && is_string($body['_auth_token'])) {
        $candidates[] = $body['_auth_token'];
    }
    if (!empty($_GET['_auth_token']) && is_string($_GET['_auth_token'])) {
        $candidates[] = $_GET['_auth_token'];
    }

    foreach ($candidates as $raw) {
        $trimmed = trim((string)$raw);
        if (stripos($trimmed, 'Bearer ') === 0) {
            $trimmed = trim(substr($trimmed, 7));
        }
        if (preg_match('/^[a-fA-F0-9_\-]{16,128}$/', $trimmed)) {
            return $trimmed;
        }
    }

    return '';
}

/**
 * Issue a persistent DB-backed session token (valid for 30 days).
 */
function createAuthSession(PDO $pdo, string $userId): string {
    ensureSecuritySchema($pdo);
    $now = time();
    $expiresAt = $now + (30 * 86400);
    $token = bin2hex(random_bytes(24));
    $ipHash = substr(getClientIpHash(), 0, 48);

    try {
        $pdo->prepare("DELETE FROM auth_sessions WHERE expires_at < :now")->execute([':now' => $now]);
        $st = $pdo->prepare("
            INSERT INTO auth_sessions (token, user_id, expires_at, ip_hash)
            VALUES (:token, :user_id, :expires_at, :ip_hash)
        ");
        $st->execute([
            ':token'      => $token,
            ':user_id'    => $userId,
            ':expires_at' => $expiresAt,
            ':ip_hash'    => $ipHash
        ]);
    } catch (Throwable $e) {
        // Fallback if table write fails unexpectedly
    }

    return $token;
}

/**
 * Revoke session token on logout.
 */
function destroyAuthSession(PDO $pdo, ?array $body = null): void {
    ensureSecuritySchema($pdo);
    $token = extractAuthToken($body);
    if ($token !== '') {
        try {
            $st = $pdo->prepare("DELETE FROM auth_sessions WHERE token = :token");
            $st->execute([':token' => $token]);
        } catch (Throwable $e) {
            // Ignore cleanup failure
        }
    }
}

/**
 * Look up the currently logged-in user row (joining live `users` table so role changes
 * in phpMyAdmin take effect immediately) or null if unauthenticated.
 */
function getOptionalAuthUser(PDO $pdo, ?array $body = null): ?array {
    ensureSecuritySchema($pdo);
    $token = extractAuthToken($body);
    if ($token === '') {
        return null;
    }

    try {
        $st = $pdo->prepare("
            SELECT u.*, s.expires_at AS session_expires_at
            FROM auth_sessions s
            INNER JOIN users u ON u.id = s.user_id
            WHERE s.token = :token
            LIMIT 1
        ");
        $st->execute([':token' => $token]);
        $row = $st->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            return null;
        }
        if ((int)$row['session_expires_at'] < time()) {
            $pdo->prepare("DELETE FROM auth_sessions WHERE token = :token")->execute([':token' => $token]);
            return null;
        }
        return $row;
    } catch (Throwable $e) {
        return null;
    }
}

/**
 * Require a valid logged-in user account (Student or Admin). Halts with 401 if missing/expired.
 */
function requireAuthUser(PDO $pdo, ?array $body = null): array {
    $user = getOptionalAuthUser($pdo, $body);
    if (!$user) {
        sendJsonResponse([
            'success' => false,
            'code'    => 'AUTH_REQUIRED',
            'error'   => 'Sign-in required: Please log in to your verified account (or Sign Out and Sign In again if your session expired).'
        ], 401);
    }
    return $user;
}

/**
 * Require a DB-verified Admin session (`users.role = 'admin'`).
 */
function requireAdminUser(PDO $pdo, ?array $body = null): array {
    $user = getOptionalAuthUser($pdo, $body);
    if (!$user) {
        sendJsonResponse([
            'success' => false,
            'code'    => 'ADMIN_AUTH_REQUIRED',
            'error'   => 'Admin session expired or missing. Please Sign Out and Sign In again with your Admin account.'
        ], 401);
    }
    if (strtolower((string)($user['role'] ?? '')) !== 'admin') {
        sendJsonResponse([
            'success' => false,
            'code'    => 'FORBIDDEN',
            'error'   => 'Forbidden: Only verified Campus Administrators can access or modify database records.'
        ], 403);
    }
    return $user;
}

/**
 * Per-IP / per-bucket sliding-window rate limiter stored in SQL (`rate_limits`).
 */
function enforceRateLimit(PDO $pdo, string $bucket, int $maxAttempts, int $windowSeconds): void {
    ensureSecuritySchema($pdo);
    $now = time();
    $rateKey = substr($bucket . ':' . substr(getClientIpHash(), 0, 32), 0, 120);

    try {
        // Occasional expired cleanup
        if (mt_rand(1, 10) === 1) {
            $pdo->prepare("DELETE FROM rate_limits WHERE reset_at < :now")->execute([':now' => $now]);
        }

        $st = $pdo->prepare("SELECT attempts, reset_at FROM rate_limits WHERE rate_key = :k LIMIT 1");
        $st->execute([':k' => $rateKey]);
        $row = $st->fetch(PDO::FETCH_ASSOC);

        if (!$row || (int)$row['reset_at'] <= $now) {
            $pdo->prepare("DELETE FROM rate_limits WHERE rate_key = :k")->execute([':k' => $rateKey]);
            $ins = $pdo->prepare("INSERT INTO rate_limits (rate_key, attempts, reset_at) VALUES (:k, 1, :r)");
            $ins->execute([':k' => $rateKey, ':r' => $now + $windowSeconds]);
            return;
        }

        $attempts = (int)$row['attempts'];
        if ($attempts >= $maxAttempts) {
            $retryAfter = max(1, (int)$row['reset_at'] - $now);
            header('Retry-After: ' . $retryAfter);
            sendJsonResponse([
                'success'    => false,
                'code'       => 'RATE_LIMITED',
                'retryAfter' => $retryAfter,
                'error'      => "Too many requests detected. Please wait {$retryAfter} seconds before trying again."
            ], 429);
        }

        $upd = $pdo->prepare("UPDATE rate_limits SET attempts = attempts + 1 WHERE rate_key = :k");
        $upd->execute([':k' => $rateKey]);
    } catch (Throwable $e) {
        // Do not block legitimate traffic if rate_limits table encounters a transient lock
    }
}

/**
 * Strip HTML tags & control characters cleanly.
 */
function cleanText(mixed $val, int $maxLen = 150): string {
    if (!is_string($val) && !is_numeric($val)) {
        return '';
    }
    $s = strip_tags((string)$val);
    $s = str_replace(['<', '>'], '', $s);
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? $s;
    $s = trim($s);
    return function_exists('mb_substr') ? mb_substr($s, 0, $maxLen) : substr($s, 0, $maxLen);
}

/**
 * Authenticated 1-Vote-Per-User handler shared by spots.php and spot_detail.php.
 */
function recordSpotUpvote(PDO $pdo, string $spotId, ?array $body = null): void {
    $spotId = trim($spotId);
    if ($spotId === '') {
        sendJsonResponse(['success' => false, 'error' => 'Spot ID is required'], 400);
    }

    $authUser = requireAuthUser($pdo, $body);
    enforceRateLimit($pdo, 'spot_vote', 30, 60);

    try {
        $stSpot = $pdo->prepare("SELECT id, upvotes FROM spots WHERE id = :id LIMIT 1");
        $stSpot->execute([':id' => $spotId]);
        $spotRow = $stSpot->fetch(PDO::FETCH_ASSOC);
        if (!$spotRow) {
            sendJsonResponse(['success' => false, 'error' => 'Spot not found'], 404);
        }

        $stCheck = $pdo->prepare("SELECT id FROM spot_votes WHERE spot_id = :sid AND user_id = :uid LIMIT 1");
        $stCheck->execute([':sid' => $spotId, ':uid' => $authUser['id']]);
        if ($stCheck->fetch()) {
            sendJsonResponse([
                'success'      => true,
                'alreadyVoted' => true,
                'upvotes'      => (int)$spotRow['upvotes'],
                'message'      => 'You have already upvoted this spot.'
            ]);
        }

        $voteRowId = 'vote_' . bin2hex(random_bytes(6));
        $insVote = $pdo->prepare("INSERT INTO spot_votes (id, spot_id, user_id) VALUES (:id, :sid, :uid)");
        $insVote->execute([
            ':id'  => $voteRowId,
            ':sid' => $spotId,
            ':uid' => $authUser['id']
        ]);

        $upd = $pdo->prepare("UPDATE spots SET upvotes = upvotes + 1 WHERE id = :id");
        $upd->execute([':id' => $spotId]);

        $stSpot->execute([':id' => $spotId]);
        $updated = $stSpot->fetch(PDO::FETCH_ASSOC);

        sendJsonResponse([
            'success'      => true,
            'alreadyVoted' => false,
            'upvotes'      => (int)($updated['upvotes'] ?? ((int)$spotRow['upvotes'] + 1))
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Could not record vote right now.'], 500);
    }
}
