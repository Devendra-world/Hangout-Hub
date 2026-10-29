<?php
/**
 * Hangout-Hub PHP Local Database Connector
 * Direct PDO SQL connection for localhost PHP / shared hosting
 */

if (file_exists(__DIR__ . '/config/db.php')) {
    require_once __DIR__ . '/config/db.php';
} else {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    
    class Database {
        private static ?PDO $instance = null;
        public static function getConnection(): PDO {
            if (self::$instance !== null) return self::$instance;
            $sqlitePath = __DIR__ . '/data/hangout_hub.db';
            self::$instance = new PDO("sqlite:" . $sqlitePath, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            return self::$instance;
        }
    }
}
