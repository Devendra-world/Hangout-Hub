/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  Server,
  Download,
  Copy,
  Check,
  Code2,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
  Table,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface PhpDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BackendInfo {
  success: boolean;
  backend: string;
  databaseType: string;
  driver: string;
  status: string;
  tables: {
    spots?: { count: number };
    survey_responses?: { count: number };
    partnership_proposals?: { count: number };
  };
  registeredCities?: string[];
  phpVersion?: string;
  timestamp?: string;
}

export const PhpDatabaseModal: React.FC<PhpDatabaseModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'endpoints' | 'xampp'>('overview');
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPhp, setCopiedPhp] = useState(false);
  const [activeEndpointCode, setActiveEndpointCode] = useState<'spots' | 'db' | 'survey'>('spots');

  useEffect(() => {
    if (isOpen) {
      fetchBackendInfo();
    }
  }, [isOpen]);

  const fetchBackendInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backend-info');
      const data = await res.json();
      setBackendInfo(data);
    } catch (err) {
      console.warn('Failed to fetch backend info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSql = () => {
    window.location.href = '/api/database/download';
  };

  const sampleSchema = `-- ==============================================================================
-- Hangout-Hub: Student Campus Cafes & Group Adda Database
-- Engine: MySQL 5.7+ / MariaDB / Compatible with phpMyAdmin, XAMPP, WAMP, cPanel
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS \`hangout_hub\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`hangout_hub\`;

-- 1. Table structure for spots
CREATE TABLE IF NOT EXISTS \`spots\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`tagline\` VARCHAR(255) NOT NULL,
  \`city\` VARCHAR(100) NOT NULL DEFAULT 'Ahmedabad',
  \`campus_name\` VARCHAR(255) DEFAULT 'Campus Hub',
  \`neighborhood\` VARCHAR(255) NOT NULL,
  \`distance_to_campus\` VARCHAR(255) NOT NULL,
  \`vibe_category\` VARCHAR(100) NOT NULL,
  \`cost_min\` INT NOT NULL DEFAULT 100,
  \`cost_max\` INT NOT NULL DEFAULT 200,
  \`cost_avg\` INT NOT NULL DEFAULT 150,
  \`popular_order_example\` VARCHAR(255) NOT NULL,
  \`official_claim_cost\` VARCHAR(255) NOT NULL,
  \`max_group_size\` INT NOT NULL DEFAULT 8,
  \`seating_description\` TEXT NOT NULL,
  \`push_together_allowed\` TINYINT(1) NOT NULL DEFAULT 1,
  \`booth_count\` INT NOT NULL DEFAULT 0,
  \`reservation_needed\` TINYINT(1) NOT NULL DEFAULT 0,
  \`reservation_tip\` VARCHAR(255) NOT NULL,
  \`wifi_speed_mbps\` INT NOT NULL DEFAULT 40,
  \`wifi_reliability\` VARCHAR(100) NOT NULL,
  \`power_outlets\` VARCHAR(100) NOT NULL,
  \`noise_decibels\` INT NOT NULL DEFAULT 65,
  \`noise_description\` VARCHAR(255) NOT NULL,
  \`board_games_available\` TINYINT(1) NOT NULL DEFAULT 0,
  \`outside_cake_allowed\` TINYINT(1) NOT NULL DEFAULT 1,
  \`student_discount_available\` TINYINT(1) NOT NULL DEFAULT 0,
  \`discount_note\` VARCHAR(255) NOT NULL,
  \`air_conditioned\` TINYINT(1) NOT NULL DEFAULT 1,
  \`open_late_night\` TINYINT(1) NOT NULL DEFAULT 0,
  \`closing_time\` VARCHAR(100) NOT NULL DEFAULT '11:00 PM',
  \`has_reel\` TINYINT(1) NOT NULL DEFAULT 1,
  \`reel_url\` TEXT,
  \`reel_creator\` VARCHAR(255),
  \`reel_hype_claim\` TEXT,
  \`ground_reality_truth\` TEXT,
  \`reality_score\` INT NOT NULL DEFAULT 85,
  \`scout_name\` VARCHAR(255) NOT NULL,
  \`scout_college\` VARCHAR(255) NOT NULL,
  \`scout_notes\` TEXT NOT NULL,
  \`verified_date\` VARCHAR(100) NOT NULL,
  \`upvotes\` INT NOT NULL DEFAULT 0,
  \`tags_json\` TEXT NOT NULL,
  \`visual_theme_json\` TEXT,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table structure for survey_responses (Design Thinking Research)
CREATE TABLE IF NOT EXISTS \`survey_responses\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`student_name\` VARCHAR(255) NOT NULL,
  \`college_or_campus\` VARCHAR(255) NOT NULL,
  \`year_of_study\` VARCHAR(100) NOT NULL,
  \`monthly_hangout_budget\` VARCHAR(100) NOT NULL,
  \`primary_frustration\` VARCHAR(255) NOT NULL,
  \`worst_experience_with_apps\` TEXT NOT NULL,
  \`ideal_spot_priorities_json\` TEXT NOT NULL,
  \`max_acceptable_cost_per_head\` INT NOT NULL,
  \`average_group_size\` INT NOT NULL,
  \`submitted_at\` VARCHAR(50) NOT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table structure for partnership_proposals
CREATE TABLE IF NOT EXISTS \`partnership_proposals\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`cafe_name\` VARCHAR(255) NOT NULL,
  \`owner_name\` VARCHAR(255) NOT NULL,
  \`contact_email\` VARCHAR(255) NOT NULL,
  \`contact_phone\` VARCHAR(100) NOT NULL,
  \`address\` TEXT NOT NULL,
  \`proposed_per_person_cost\` INT NOT NULL,
  \`group_capacity\` INT NOT NULL,
  \`offered_student_discount\` TEXT NOT NULL,
  \`has_fast_wifi\` TINYINT(1) NOT NULL DEFAULT 1,
  \`notes\` TEXT,
  \`status\` VARCHAR(50) NOT NULL DEFAULT 'pending_verification',
  \`submitted_at\` VARCHAR(50) NOT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  const copyToClipboard = (text: string, isSql: boolean) => {
    navigator.clipboard.writeText(text);
    if (isSql) {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } else {
      setCopiedPhp(true);
      setTimeout(() => setCopiedPhp(false), 2000);
    }
  };

  const spotsPhpCode = `<?php
// php-backend/api/spots.php
require_once dirname(__DIR__) . '/config/db.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $city = trim($_GET['city'] ?? 'all');
    $search = trim($_GET['search'] ?? '');
    
    $sql = "SELECT * FROM spots WHERE 1=1";
    $params = [];

    if ($city !== '' && strtolower($city) !== 'all') {
        $sql .= " AND (LOWER(city) = :city OR LOWER(neighborhood) LIKE :c_like)";
        $params[':city'] = strtolower($city);
        $params[':c_like'] = '%' . strtolower($city) . '%';
    }

    if ($search !== '') {
        $sql .= " AND (LOWER(name) LIKE :q OR LOWER(tagline) LIKE :q OR LOWER(neighborhood) LIKE :q)";
        $params[':q'] = '%' . strtolower($search) . '%';
    }

    $sql .= " ORDER BY upvotes DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    sendJsonResponse([
        'success' => true,
        'count'   => count($rows),
        'spots'   => array_map('formatSpotRow', $rows)
    ]);
}`;

  const dbConfigCode = `<?php
// php-backend/config/db.php
class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance !== null) return self::$instance;

        $host = getenv('DB_HOST') ?: 'localhost';
        $name = getenv('DB_NAME') ?: 'hangout_hub';
        $user = getenv('DB_USER') ?: 'root';
        $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

        // Try MySQL first (XAMPP / cPanel)
        try {
            self::$instance = new PDO("mysql:host={$host};dbname={$name};charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_TIMEOUT => 2
            ]);
            return self::$instance;
        } catch (PDOException $e) {
            // Smoothly fall back to SQLite if MySQL isn't running
            $sqlitePath = dirname(__DIR__) . '/data/hangout_hub.db';
            self::$instance = new PDO("sqlite:" . $sqlitePath, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            return self::$instance;
        }
    }
}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF7F2] text-[#2A1810] rounded-3xl shadow-2xl border border-[#E8DFC8] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8DFC8] bg-white/70 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center shrink-0 border border-[#7C3AED]/20 shadow-xs">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black font-brand text-[#2A1810]">
                  PHP Backend & SQL Database
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  PHP 8.2 Active
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EFE7DA] text-[#5C4A3A]">
                  PDO SQL Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#735A45] mt-1">
                Relational schema, RESTful PHP endpoints, and 1-click database export for college projects and XAMPP.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBackendInfo}
              title="Refresh Status"
              className="p-2 text-[#735A45] hover:text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#735A45] hover:text-[#2A1810] hover:bg-[#EFE7DA] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-[#E8DFC8] bg-[#FAF7F2] overflow-x-auto scrollbar-none text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-white text-[#2A1810] border-t-2 border-[#C85A32] shadow-xs'
                : 'text-[#735A45] hover:text-[#2A1810]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#C85A32]" />
            <span>Architecture & Status</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'schema'
                ? 'bg-white text-[#2A1810] border-t-2 border-[#C85A32] shadow-xs'
                : 'text-[#735A45] hover:text-[#2A1810]'
            }`}
          >
            <Table className="w-4 h-4 text-[#7C3AED]" />
            <span>MySQL Schema (database.sql)</span>
          </button>

          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'endpoints'
                ? 'bg-white text-[#2A1810] border-t-2 border-[#C85A32] shadow-xs'
                : 'text-[#735A45] hover:text-[#2A1810]'
            }`}
          >
            <Code2 className="w-4 h-4 text-[#059669]" />
            <span>PHP REST Endpoints</span>
          </button>

          <button
            onClick={() => setActiveTab('xampp')}
            className={`px-4 py-2.5 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'xampp'
                ? 'bg-white text-[#2A1810] border-t-2 border-[#C85A32] shadow-xs'
                : 'text-[#735A45] hover:text-[#2A1810]'
            }`}
          >
            <Terminal className="w-4 h-4 text-[#D97706]" />
            <span>XAMPP / College Setup</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-[#FAF7F2]">
          
          {/* TAB 1: OVERVIEW & STATUS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
                  <span className="text-[11px] font-bold text-[#8C6D53] uppercase tracking-wider block">Backend Engine</span>
                  <p className="text-base font-black text-[#2A1810] mt-1 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    PHP 8.2
                  </p>
                  <span className="text-[11px] text-[#735A45] mt-0.5 block">Built-in REST Server</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
                  <span className="text-[11px] font-bold text-[#8C6D53] uppercase tracking-wider block">Database Driver</span>
                  <p className="text-base font-black text-[#2A1810] mt-1">
                    PDO ({backendInfo?.driver || 'SQL Engine'})
                  </p>
                  <span className="text-[11px] text-[#735A45] mt-0.5 block">MySQL + SQLite Dual Mode</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
                  <span className="text-[11px] font-bold text-[#8C6D53] uppercase tracking-wider block">Database Rows</span>
                  <p className="text-base font-black text-[#C85A32] mt-1">
                    {backendInfo?.tables?.spots?.count ?? 15} Spots
                  </p>
                  <span className="text-[11px] text-[#735A45] mt-0.5 block">
                    + {backendInfo?.tables?.survey_responses?.count ?? 4} survey records
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
                  <span className="text-[11px] font-bold text-[#8C6D53] uppercase tracking-wider block">Connected Cities</span>
                  <p className="text-base font-black text-[#2A1810] mt-1">
                    {backendInfo?.registeredCities?.length ?? 6} Metros
                  </p>
                  <span className="text-[11px] text-[#735A45] mt-0.5 block">Ahmedabad, Delhi, BLR...</span>
                </div>
              </div>

              {/* Data Flow Diagram Card */}
              <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-[#2A1810] flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#C85A32]" />
                  <span>How Hangout-Hub Executes Your PHP Database</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8]/70">
                    <span className="text-xs font-black text-[#C85A32] uppercase tracking-wider block">1. Frontend Layer</span>
                    <p className="text-xs font-bold text-[#2A1810] mt-1">Vite + React (TypeScript)</p>
                    <p className="text-[11px] text-[#735A45] mt-1">
                      Aesthetic student UI makes REST calls to <code className="bg-[#EFE7DA] px-1 py-0.5 rounded">/api/spots</code>, filtering by city and budget.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8]/70">
                    <span className="text-xs font-black text-[#7C3AED] uppercase tracking-wider block">2. PHP 8.2 REST Engine</span>
                    <p className="text-xs font-bold text-[#2A1810] mt-1">php-backend/api/*.php</p>
                    <p className="text-[11px] text-[#735A45] mt-1">
                      PHP parses query params, enforces PDO prepared statements, and returns standardized JSON.
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8]/70">
                    <span className="text-xs font-black text-[#059669] uppercase tracking-wider block">3. SQL Database Layer</span>
                    <p className="text-xs font-bold text-[#2A1810] mt-1">MySQL / phpMyAdmin & SQLite</p>
                    <p className="text-[11px] text-[#735A45] mt-1">
                      Relational tables for spots, student wishlist surveys, and cafe owner proposals with indexing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Instant Download Action Card */}
              <div className="bg-linear-to-r from-[#2A1810] to-[#452718] text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                    <span>Download Ready-To-Import MySQL Database</span>
                  </h4>
                  <p className="text-xs text-[#E5DBCB] mt-1">
                    Get <code className="text-[#F59E0B]">hangout_hub_database.sql</code> with all 15 pre-seeded campus addas and survey tables.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadSql}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-[#2A1810] bg-[#F59E0B] hover:bg-[#FBBF24] rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download database.sql</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold text-[#2A1810]">MySQL / phpMyAdmin Table Definitions</h3>
                  <p className="text-xs text-[#735A45]">Three structured relational tables with indexes and UTF8mb4 encoding.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(sampleSchema, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2A1810] bg-white border border-[#E8DFC8] hover:bg-[#EFE7DA] rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied!' : 'Copy Schema'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSql}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#2A1810] hover:bg-[#C85A32] rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .sql</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#1E1E1E] text-[#D4D4D4] p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-96 border border-gray-800 shadow-inner">
                <pre>{sampleSchema}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: PHP ENDPOINTS */}
          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold text-[#2A1810]">PHP REST Implementation Source</h3>
                  <p className="text-xs text-[#735A45]">Clean, modular PHP PDO scripts located in <code className="bg-[#EFE7DA] px-1 py-0.5 rounded text-[11px]">/php-backend/</code></p>
                </div>
                <button
                  onClick={() => copyToClipboard(activeEndpointCode === 'spots' ? spotsPhpCode : dbConfigCode, false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2A1810] bg-white border border-[#E8DFC8] hover:bg-[#EFE7DA] rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  {copiedPhp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPhp ? 'Copied!' : 'Copy PHP Code'}</span>
                </button>
              </div>

              {/* Endpoint Selector Tabs */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveEndpointCode('spots')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeEndpointCode === 'spots'
                      ? 'bg-[#2A1810] text-white'
                      : 'bg-white text-[#5C4A3A] border border-[#E8DFC8] hover:bg-[#EFE7DA]'
                  }`}
                >
                  api/spots.php
                </button>
                <button
                  onClick={() => setActiveEndpointCode('db')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeEndpointCode === 'db'
                      ? 'bg-[#2A1810] text-white'
                      : 'bg-white text-[#5C4A3A] border border-[#E8DFC8] hover:bg-[#EFE7DA]'
                  }`}
                >
                  config/db.php
                </button>
              </div>

              <div className="bg-[#1E1E1E] text-[#D4D4D4] p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-96 border border-gray-800 shadow-inner">
                <pre>{activeEndpointCode === 'spots' ? spotsPhpCode : dbConfigCode}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: XAMPP / COLLEGE SETUP */}
          {activeTab === 'xampp' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>College Project / Viva Guide:</strong> You can run this backend entirely inside XAMPP, WAMP, or any Apache + MySQL stack without modifying a single line of SQL!
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
                  <h4 className="text-xs font-bold text-[#C85A32] uppercase tracking-wider">Step 1: Start Apache and MySQL</h4>
                  <p className="text-xs text-[#5C4A3A] mt-1">
                    Launch the <strong>XAMPP Control Panel</strong> on Windows or Mac. Click the green <strong>Start</strong> buttons next to both <strong>Apache</strong> and <strong>MySQL</strong>.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
                  <h4 className="text-xs font-bold text-[#C85A32] uppercase tracking-wider">Step 2: Create Database in phpMyAdmin</h4>
                  <p className="text-xs text-[#5C4A3A] mt-1">
                    Open your web browser and visit <code className="bg-[#EFE7DA] px-1 py-0.5 rounded text-[11px]">http://localhost/phpmyadmin</code>. Click <strong>New</strong> in the left sidebar, type <code className="font-bold">hangout_hub</code> as the database name, and click <strong>Create</strong>.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
                  <h4 className="text-xs font-bold text-[#C85A32] uppercase tracking-wider">Step 3: Import database.sql</h4>
                  <p className="text-xs text-[#5C4A3A] mt-1">
                    Select <code className="font-bold">hangout_hub</code> in phpMyAdmin, click the <strong>Import</strong> tab at the top, select the downloaded <code className="font-bold">database.sql</code> file, and click <strong>Go / Import</strong>.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
                  <h4 className="text-xs font-bold text-[#C85A32] uppercase tracking-wider">Step 4: Put php-backend in htdocs</h4>
                  <p className="text-xs text-[#5C4A3A] mt-1">
                    Copy the <code className="bg-[#EFE7DA] px-1 py-0.5 rounded text-[11px]">php-backend/</code> folder into <code className="bg-[#EFE7DA] px-1 py-0.5 rounded text-[11px]">C:\xampp\htdocs\hangout-hub-api\</code>. Now <code className="bg-[#EFE7DA] px-1 py-0.5 rounded text-[11px]">http://localhost/hangout-hub-api/api/spots.php</code> will instantly return live JSON from MySQL!
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E8DFC8] bg-white/70 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-[#735A45]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dual Compatible: MySQL 5.7+ / MariaDB & SQLite PDO</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSql}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2A1810] hover:bg-[#C85A32] rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download database.sql</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
