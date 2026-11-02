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
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Search,
  AlertTriangle,
  Save,
  ShieldCheck
} from 'lucide-react';
import { AdminRecordFields } from './AdminFieldInput.tsx';

interface PhpDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged?: () => void;
  onRequireReauth?: () => void;
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

type TableName = 'spots' | 'users' | 'survey_responses' | 'partnership_proposals' | 'user_history';

export const PhpDatabaseModal: React.FC<PhpDatabaseModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
  onRequireReauth
}) => {
  const [activeTab, setActiveTab] = useState<'crud' | 'overview' | 'schema' | 'endpoints' | 'xampp'>('crud');
  const [backendInfo, setBackendInfo] = useState<BackendInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedPhp, setCopiedPhp] = useState(false);
  const [activeEndpointCode, setActiveEndpointCode] = useState<'spots' | 'db' | 'survey'>('spots');

  // CRUD State
  const [selectedTable, setSelectedTable] = useState<TableName>('spots');
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [crudNotice, setCrudNotice] = useState<string | null>(null);
  const [crudError, setCrudError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state for editing or creating
  const [formData, setFormData] = useState<Record<string, any>>({});

  const getAdminToken = (): string => localStorage.getItem('hangout_hub_token') || '';

  const getAdminHeaders = (): Record<string, string> => {
    const token = getAdminToken();
    return {
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
            'X-Auth-Token': token,
            'X-Admin-Token': token
          }
        : {})
    };
  };

  useEffect(() => {
    if (isOpen) {
      fetchBackendInfo();
      fetchTableData(selectedTable);
    }
  }, [isOpen, selectedTable]);

  const fetchBackendInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/info.php');
      const data = await res.json();
      setBackendInfo(data);
    } catch (err) {
      console.warn('Failed to fetch backend info:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (tbl: TableName) => {
    setTableLoading(true);
    setCrudError(null);
    setIsAuthError(false);
    try {
      const token = getAdminToken();
      const tokenQuery = token ? `&_auth_token=${encodeURIComponent(token)}` : '';
      const res = await fetch(`/admin_crud.php?table=${tbl}${tokenQuery}`, {
        headers: getAdminHeaders()
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.rows)) {
        setTableRows(data.rows);
      } else {
        setTableRows([]);
        if (res.status === 401 || res.status === 403) {
          setIsAuthError(true);
        }
        if (!res.ok || data.error) {
          setCrudError(data.error || `Unauthorized (${res.status}): Admin session required.`);
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch table ${tbl}:`, err);
      setTableRows([]);
      setCrudError('Network error loading table records.');
    } finally {
      setTableLoading(false);
    }
  };

  const handleDownloadSql = () => {
    window.location.href = '/export_sql.php';
  };

  const showNotification = (msg: string) => {
    setCrudNotice(msg);
    setTimeout(() => setCrudNotice(null), 3500);
  };

  // Start Editing
  const handleOpenEdit = (row: any) => {
    setEditingRow(row);
    setIsAddingNew(false);
    // password_hash form me nahi dikhate; users ke liye optional "new password" field milta hai
    const { password_hash, ...rest } = row;
    setFormData(selectedTable === 'users' ? { ...rest, password: '' } : { ...rest });
  };

  // Start Adding
  const handleOpenAdd = () => {
    setIsAddingNew(true);
    setEditingRow(null);
    if (selectedTable === 'spots') {
      setFormData({
        name: '',
        neighborhood: '',
        city: 'Ahmedabad',
        vibe_category: 'Budget Bite & Chill',
        cost_avg: 150,
        tagline: 'Student verified hangout spot',
        reality_score: 90
      });
    } else if (selectedTable === 'users') {
      setFormData({
        name: '',
        email: '',
        role: 'student',
        college: 'Ahmedabad Campus',
        city: 'Ahmedabad',
        preferred_budget: 180,
        password: ''
      });
    } else if (selectedTable === 'survey_responses') {
      setFormData({
        student_name: '',
        college_or_campus: 'Ahmedabad University',
        monthly_hangout_budget: '₹2,000 - ₹3,500',
        max_acceptable_cost_per_head: 200,
        primary_frustration: 'Misleading prices'
      });
    } else if (selectedTable === 'partnership_proposals') {
      setFormData({
        cafe_name: '',
        owner_name: '',
        contact_email: '',
        proposed_per_person_cost: 160,
        group_capacity: 8
      });
    } else {
      setFormData({
        action_type: 'viewed',
        user_id: 'usr_devendra_1',
        spot_id: 'amd-1'
      });
    }
  };

  // Submit Edit or Create
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudError(null);
    const token = getAdminToken();
    try {
      if (isAddingNew) {
        const res = await fetch('/admin_crud.php', {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify({
            action: 'create',
            table: selectedTable,
            data: formData,
            _auth_token: token
          })
        });
        const d = await res.json();
        if (res.ok && d.success) {
          showNotification(`New record added to ${selectedTable} successfully!`);
          setIsAddingNew(false);
          setFormData({});
          fetchTableData(selectedTable);
          fetchBackendInfo();
          if (selectedTable === 'spots') onDataChanged?.();
        } else {
          if (res.status === 401 || res.status === 403) setIsAuthError(true);
          setCrudError(d.error || 'Failed to add record');
        }
      } else if (editingRow) {
        const res = await fetch('/admin_crud.php', {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify({
            action: 'update',
            table: selectedTable,
            id: editingRow.id,
            data: formData,
            _auth_token: token
          })
        });
        const d = await res.json();
        if (res.ok && d.success) {
          showNotification(`Record ${editingRow.id} updated in ${selectedTable} successfully!`);
          setEditingRow(null);
          setFormData({});
          fetchTableData(selectedTable);
          if (selectedTable === 'spots') onDataChanged?.();
        } else {
          if (res.status === 401 || res.status === 403) setIsAuthError(true);
          setCrudError(d.error || 'Failed to update record');
        }
      }
    } catch (err: any) {
      setCrudError(`Request failed: ${err.message}`);
    }
  };

  // Quick 1-Click Spot Moderation (Approve / Set Pending)
  const handleQuickModerateSpot = async (id: string, nextStatus: 'approved' | 'pending') => {
    setCrudError(null);
    const token = getAdminToken();
    try {
      const res = await fetch('/admin_crud.php', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'update',
          table: 'spots',
          id,
          data: { status: nextStatus },
          _auth_token: token
        })
      });
      const d = await res.json();
      if (res.ok && d.success) {
        showNotification(
          nextStatus === 'approved'
            ? `Spot ${id} approved & published to live Explorer!`
            : `Spot ${id} moved back to Pending Moderation.`
        );
        fetchTableData('spots');
        onDataChanged?.();
      } else {
        if (res.status === 401 || res.status === 403) setIsAuthError(true);
        setCrudError(d.error || 'Could not update moderation status');
      }
    } catch (err: any) {
      setCrudError(`Moderation failed: ${err.message}`);
    }
  };

  // Delete Row
  const handleDeleteRow = async (id: string) => {
    setCrudError(null);
    const token = getAdminToken();
    try {
      const res = await fetch('/admin_crud.php', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'delete',
          table: selectedTable,
          id,
          _auth_token: token
        })
      });
      const d = await res.json();
      if (res.ok && d.success) {
        showNotification(`Row ${id} deleted from ${selectedTable}`);
        setDeleteConfirmId(null);
        fetchTableData(selectedTable);
        fetchBackendInfo();
        if (selectedTable === 'spots') onDataChanged?.();
      } else {
        if (res.status === 401 || res.status === 403) setIsAuthError(true);
        setCrudError(d.error || 'Could not delete row');
      }
    } catch (err: any) {
      setCrudError(`Delete failed: ${err.message}`);
    }
  };

  // Filter rows
  const filteredRows = tableRows.filter((row) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(q)
    );
  });

  const sampleSchema = `-- ==============================================================================
-- Hangout-Hub: Student Campus Cafes & Hangout Spots Database
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

-- 2. Table structure for users
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(255) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(32) NOT NULL DEFAULT 'student',
  \`college\` VARCHAR(255) DEFAULT 'Campus Hub',
  \`city\` VARCHAR(100) DEFAULT 'Ahmedabad',
  \`preferred_budget\` INT DEFAULT 180,
  \`favorite_vibes_json\` TEXT,
  \`bio\` TEXT,
  \`avatar_color\` VARCHAR(32) DEFAULT '#C85A32',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  const spotsPhpCode = `<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $search = $_GET['search'] ?? '';
    $city   = $_GET['city'] ?? 'all';
    $vibe   = $_GET['vibe'] ?? 'all';
    
    $where = [];
    $params = [];
    
    if ($city !== 'all') {
        $where[] = "(city = :city OR neighborhood LIKE :cityLike)";
        $params[':city'] = $city;
        $params[':cityLike'] = "%$city%";
    }
    
    $sql = "SELECT * FROM spots" . ($where ? " WHERE " . implode(" AND ", $where) : "");
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true, 'spots' => $stmt->fetchAll()]);
}`;

  const dbConfigCode = `<?php
class Database {
    private static ?PDO $instance = null;
    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $sqlitePath = __DIR__ . '/../data/hangout_hub.sqlite';
            self::$instance = new PDO("sqlite:" . $sqlitePath, null, null, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
        }
        return self::$instance;
    }
}`;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-db-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-[#FAF7F2] dark:bg-[#1C1612] text-[#2A1810] dark:text-stone-100 rounded-3xl shadow-2xl border border-[#E8DFC8] dark:border-[#33271F] w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-[#E8DFC8] dark:border-[#33271F] bg-white/80 dark:bg-[#17120F] flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#7C3AED]/10 dark:bg-[#7C3AED]/20 text-[#7C3AED] dark:text-purple-300 flex items-center justify-center shrink-0 border border-[#7C3AED]/20 dark:border-purple-500/30 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="admin-db-modal-title" className="text-base sm:text-lg lg:text-xl font-black font-brand text-[#2A1810] dark:text-stone-100">
                  Database Administration
                </h2>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  · Admin CRUD
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#735A45] dark:text-stone-400 mt-0.5">
                Authenticated CRUD control over SQL tables, REST endpoints, and schema exports.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto sm:ml-0">
            <button
              onClick={() => {
                fetchBackendInfo();
                fetchTableData(selectedTable);
              }}
              aria-label="Refresh Status and Tables"
              title="Refresh Status & Tables"
              className="p-1.5 sm:p-2 text-[#735A45] dark:text-stone-400 hover:text-[#2A1810] dark:hover:text-stone-100 hover:bg-[#EFE7DA] dark:hover:bg-[#251D17] rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${tableLoading || loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close Database Administration modal"
              className="p-1.5 sm:p-2 text-[#735A45] dark:text-stone-400 hover:text-[#2A1810] dark:hover:text-stone-100 hover:bg-[#EFE7DA] dark:hover:bg-[#251D17] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Responsive, prevents overflow) */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 pt-2 border-b border-[#E8DFC8] dark:border-[#33271F] bg-[#FAF7F2] dark:bg-[#17120F] overflow-x-auto scrollbar-thin text-xs font-bold">
          <button
            onClick={() => setActiveTab('crud')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'crud'
                ? 'bg-white dark:bg-[#251D17] text-[#2A1810] dark:text-stone-100 border-t-2 border-[#C85A32] dark:border-amber-400 shadow-xs'
                : 'text-[#735A45] dark:text-stone-400 hover:text-[#2A1810] dark:hover:text-stone-200'
            }`}
          >
            <Table className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C85A32] dark:text-amber-400" />
            <span>CRUD Tables</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-[#251D17] text-[#2A1810] dark:text-stone-100 border-t-2 border-[#C85A32] dark:border-amber-400 shadow-xs'
                : 'text-[#735A45] dark:text-stone-400 hover:text-[#2A1810] dark:hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7C3AED] dark:text-purple-400" />
            <span>Health & Status</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'bg-white dark:bg-[#251D17] text-[#2A1810] dark:text-stone-100 border-t-2 border-[#C85A32] dark:border-amber-400 shadow-xs'
                : 'text-[#735A45] dark:text-stone-400 hover:text-[#2A1810] dark:hover:text-stone-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#059669] dark:text-emerald-400" />
            <span>MySQL Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'endpoints'
                ? 'bg-white dark:bg-[#251D17] text-[#2A1810] dark:text-stone-100 border-t-2 border-[#C85A32] dark:border-amber-400 shadow-xs'
                : 'text-[#735A45] dark:text-stone-400 hover:text-[#2A1810] dark:hover:text-stone-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D97706] dark:text-amber-400" />
            <span>PHP Database Scripts</span>
          </button>

          <button
            onClick={() => setActiveTab('xampp')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'xampp'
                ? 'bg-white dark:bg-[#251D17] text-[#2A1810] dark:text-stone-100 border-t-2 border-[#C85A32] dark:border-amber-400 shadow-xs'
                : 'text-[#735A45] dark:text-stone-400 hover:text-[#2A1810] dark:hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2563EB] dark:text-blue-400" />
            <span>Hosting Guide</span>
          </button>
        </div>

        {/* Notice alert */}
        {crudNotice && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-800/60 px-4 sm:px-5 py-2 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">{crudNotice}</span>
          </div>
        )}
        {crudError && (
          <div role="alert" className="bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-b border-rose-200 dark:border-rose-800/60 px-4 sm:px-5 py-2.5 text-xs flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="font-semibold">{crudError}</span>
            </div>
            {isAuthError && onRequireReauth && (
              <button
                type="button"
                onClick={onRequireReauth}
                className="px-3 py-1 rounded-lg text-[11px] font-bold bg-rose-700 hover:bg-rose-800 text-white cursor-pointer transition-colors"
              >
                Sign In Again to Refresh Admin Token
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 lg:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 bg-[#FAF7F2] dark:bg-[#1C1612]">
          
          {/* TAB 1: INTERACTIVE CRUD ON DATABASE TABLES */}
          {activeTab === 'crud' && (
            <div className="space-y-4">
              {/* Table Selector & Top Action Bar (Two-tier flex, zero overflow) */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 bg-white dark:bg-[#251D17] p-3 sm:p-3.5 rounded-2xl border border-[#E8DFC8] dark:border-[#33271F]">
                {/* Tables Buttons */}
                <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                  {(['spots', 'users', 'survey_responses', 'partnership_proposals', 'user_history'] as TableName[]).map((tbl) => (
                    <button
                      key={tbl}
                      onClick={() => {
                        setSelectedTable(tbl);
                        setEditingRow(null);
                        setIsAddingNew(false);
                      }}
                      className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl cursor-pointer transition-all whitespace-nowrap ${
                        selectedTable === tbl
                          ? 'bg-[#2A1810] dark:bg-amber-600 text-[#FAF7F2] dark:text-white shadow-xs'
                          : 'bg-[#FAF8F5] dark:bg-[#1C1612] text-[#5C4A3A] dark:text-stone-300 border border-transparent dark:border-[#3E3025] hover:bg-[#EFE7DA] dark:hover:bg-[#31261E]'
                      }`}
                    >
                      <code>{tbl}</code>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  {/* Search filter */}
                  <div className="relative flex-1 md:w-48 lg:w-56">
                    <Search className="w-3.5 h-3.5 text-[#8C6D53] dark:text-stone-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder={`Search ${selectedTable}...`}
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#FAF8F5] dark:bg-[#1C1612] text-[#2A1810] dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 border border-[#D9CDB8] dark:border-[#3E3025] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C85A32] dark:focus:ring-amber-500"
                    />
                  </div>

                  {/* Add record button */}
                  <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#C85A32] dark:bg-amber-600 hover:bg-[#A84520] dark:hover:bg-amber-500 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add</span>
                  </button>
                </div>
              </div>

              {/* Edit / Add Modal Form (Inline) */}
              {(isAddingNew || editingRow) && (
                <div className="bg-white dark:bg-[#251D17] p-5 rounded-2xl border-2 border-[#C85A32]/40 dark:border-amber-500/40 shadow-lg animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E8DFC8] dark:border-[#33271F]">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#2A1810] dark:text-stone-100">
                        {isAddingNew
                          ? `Add New Row into table "${selectedTable}"`
                          : `Edit Row (ID: ${editingRow.id}) in table "${selectedTable}"`}
                      </h4>
                    </div>
                    <button
                      onClick={() => {
                        setIsAddingNew(false);
                        setEditingRow(null);
                        setFormData({});
                      }}
                      className="text-xs text-[#8C6D53] dark:text-stone-400 hover:text-[#2A1810] dark:hover:text-stone-100 cursor-pointer"
                    >
                      ✕ Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveForm} className="space-y-3">
                    <AdminRecordFields
                      table={selectedTable}
                      formData={formData}
                      setFormData={setFormData}
                      isNewRow={isAddingNew}
                      extraCities={backendInfo?.registeredCities}
                    />

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F2ECE1] dark:border-[#33271F]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNew(false);
                          setEditingRow(null);
                          setFormData({});
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-[#5C4A3A] dark:text-stone-300 bg-[#EFE7DA] dark:bg-[#1C1612] border border-transparent dark:border-[#3E3025] rounded-xl hover:bg-[#E5DBCB] dark:hover:bg-[#31261E] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#2A1810] dark:bg-amber-600 hover:bg-[#C85A32] dark:hover:bg-amber-500 rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isAddingNew ? 'Insert Record' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Data Table */}
              <div className="bg-white dark:bg-[#251D17] rounded-2xl border border-[#E8DFC8] dark:border-[#33271F] overflow-hidden shadow-xs">
                <div className="p-3 border-b border-[#E8DFC8] dark:border-[#33271F] bg-[#FAF8F5] dark:bg-[#17120F] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2A1810] dark:text-stone-100">
                    Table: <code>{selectedTable}</code> ({filteredRows.length} rows)
                  </span>
                  <span className="text-[11px] text-[#8C6D53] dark:text-stone-400">
                    Connected to PHP SQLite & MySQL PDO
                  </span>
                </div>

                {tableLoading ? (
                  <div className="py-12 text-center text-xs text-[#8C6D53] dark:text-stone-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#C85A32] dark:text-amber-400" />
                    <span>Loading rows from SQL database...</span>
                  </div>
                ) : filteredRows.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#8C6D53] dark:text-stone-400">
                    <span>No records found in table {selectedTable}.</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[380px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#FAF8F5] dark:bg-[#17120F] text-[#5C4A3A] dark:text-stone-300 uppercase text-[10px] tracking-wider sticky top-0 border-b border-[#E8DFC8] dark:border-[#33271F] z-10">
                        <tr>
                          <th className="p-2.5 font-bold">Actions</th>
                          {Object.keys(filteredRows[0] || {})
                            .slice(0, 7)
                            .map((col) => (
                              <th key={col} className="p-2.5 font-bold whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2ECE1] dark:divide-[#33271F]">
                        {filteredRows.map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-[#FAF8F5] dark:hover:bg-[#1C1612] transition-colors">
                            {/* Actions Column */}
                            <td className="p-2.5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                {selectedTable === 'spots' && (
                                  (row.status || 'approved') === 'pending' ? (
                                    <button
                                      type="button"
                                      onClick={() => handleQuickModerateSpot(row.id, 'approved')}
                                      className="px-2 py-0.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer"
                                      title="Approve & publish this student spot"
                                    >
                                      ✓ Approve
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleQuickModerateSpot(row.id, 'pending')}
                                      className="px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 rounded-md transition-colors cursor-pointer"
                                      title="Unpublish and move back to Pending Review"
                                    >
                                      Hide
                                    </button>
                                  )
                                )}
                                <button
                                  onClick={() => handleOpenEdit(row)}
                                  className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors cursor-pointer"
                                  title="Edit row"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                {deleteConfirmId === row.id ? (
                                  <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 p-1 rounded-md border border-red-200 dark:border-red-800/60">
                                    <button
                                      onClick={() => handleDeleteRow(row.id)}
                                      className="text-[10px] font-bold text-red-700 dark:text-red-200 bg-red-200 dark:bg-red-800/70 px-1.5 py-0.5 rounded cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="text-[10px] text-gray-500 dark:text-stone-400 hover:text-black dark:hover:text-white cursor-pointer"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmId(row.id)}
                                    className="p-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors cursor-pointer"
                                    title="Delete row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Data Columns */}
                            {Object.keys(filteredRows[0] || {})
                              .slice(0, 7)
                              .map((col) => {
                                const val = row[col];
                                const displayVal =
                                  typeof val === 'object' && val !== null
                                    ? JSON.stringify(val).substring(0, 30) + '...'
                                    : String(val ?? '');
                                return (
                                  <td
                                    key={col}
                                    className="p-2.5 max-w-[200px] truncate text-[#2A1810] dark:text-stone-200"
                                    title={String(val)}
                                  >
                                    {col === 'id' ? (
                                      <code className="text-[11px] font-bold text-[#C85A32] dark:text-amber-400">
                                        {displayVal}
                                      </code>
                                    ) : col === 'status' ? (
                                      <span
                                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                                          displayVal === 'pending' || displayVal === 'pending_verification'
                                            ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50'
                                            : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/50'
                                        }`}
                                      >
                                        {displayVal || 'approved'}
                                      </span>
                                    ) : (
                                      displayVal
                                    )}
                                  </td>
                                );
                              })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & HEALTH */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-[#251D17] p-3.5 rounded-2xl border border-[#E8DFC8] dark:border-[#33271F]">
                  <span className="text-[10px] font-bold text-[#8C6D53] dark:text-stone-400 uppercase tracking-wider block">Backend Engine</span>
                  <p className="text-sm font-black text-[#2A1810] dark:text-stone-100 mt-1">
                    {backendInfo?.backend || 'REST Server Active'}
                  </p>
                  <span className="text-[10px] text-[#735A45] dark:text-stone-400 mt-0.5 block">Authenticated API Layer</span>
                </div>

                <div className="bg-white dark:bg-[#251D17] p-3.5 rounded-2xl border border-[#E8DFC8] dark:border-[#33271F]">
                  <span className="text-[10px] font-bold text-[#8C6D53] dark:text-stone-400 uppercase tracking-wider block">Database Driver</span>
                  <p className="text-sm font-black text-[#2A1810] dark:text-stone-100 mt-1">
                    PDO ({backendInfo?.driver || 'SQL Engine'})
                  </p>
                  <span className="text-[10px] text-[#735A45] dark:text-stone-400 mt-0.5 block">MySQL + SQLite Dual Mode</span>
                </div>

                <div className="bg-white dark:bg-[#251D17] p-3.5 rounded-2xl border border-[#E8DFC8] dark:border-[#33271F]">
                  <span className="text-[10px] font-bold text-[#8C6D53] dark:text-stone-400 uppercase tracking-wider block">Spots In Database</span>
                  <p className="text-sm font-black text-[#C85A32] dark:text-amber-400 mt-1">
                    {backendInfo?.tables?.spots?.count || tableRows.length || 10} Cafes
                  </p>
                  <span className="text-[10px] text-[#735A45] dark:text-stone-400 mt-0.5 block">Full Ground Reality Records</span>
                </div>

                <div className="bg-white dark:bg-[#251D17] p-3.5 rounded-2xl border border-[#E8DFC8] dark:border-[#33271F]">
                  <span className="text-[10px] font-bold text-[#8C6D53] dark:text-stone-400 uppercase tracking-wider block">Admin Authorization</span>
                  <p className="text-sm font-black text-[#7C3AED] dark:text-purple-400 mt-1">
                    Granted (CRUD)
                  </p>
                  <span className="text-[10px] text-[#735A45] dark:text-stone-400 mt-0.5 block">hangout-hub.xo.je admin mode</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#251D17] p-4 rounded-2xl border border-[#E8DFC8] dark:border-[#33271F] space-y-2 text-xs">
                <h4 className="font-bold text-[#2A1810] dark:text-stone-100 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Security & Permissions Architecture</span>
                </h4>
                <p className="text-[#5C4A3A] dark:text-stone-300">
                  This backend is equipped with dual operational capability: running directly inside PHP with SQLite PDO storage, and instantly exportable into standard MySQL / phpMyAdmin via the included <code>database.sql</code> file.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: MYSQL SCHEMA */}
          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2A1810] dark:text-stone-100">
                  php-backend/database.sql (MySQL 5.7+ & MariaDB Ready)
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(sampleSchema);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#2A1810] dark:text-stone-100 bg-white dark:bg-[#251D17] hover:bg-[#EFE7DA] dark:hover:bg-[#31261E] border border-[#D9CDB8] dark:border-[#3E3025] rounded-xl transition-all cursor-pointer shadow-2xs"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#8C6D53] dark:text-stone-400" />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
                </button>
              </div>

              <div className="bg-[#1E1E1E] text-[#D4D4D4] p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-96 border border-gray-800 shadow-inner">
                <pre>{sampleSchema}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: PHP DATABASE SCRIPTS */}
          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveEndpointCode('spots')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeEndpointCode === 'spots'
                      ? 'bg-[#2A1810] dark:bg-amber-600 text-white'
                      : 'bg-white dark:bg-[#251D17] text-[#5C4A3A] dark:text-stone-300 border border-[#E8DFC8] dark:border-[#3E3025] hover:bg-[#EFE7DA] dark:hover:bg-[#31261E]'
                  }`}
                >
                  spots.php
                </button>
                <button
                  onClick={() => setActiveEndpointCode('db')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    activeEndpointCode === 'db'
                      ? 'bg-[#2A1810] dark:bg-amber-600 text-white'
                      : 'bg-white dark:bg-[#251D17] text-[#5C4A3A] dark:text-stone-300 border border-[#E8DFC8] dark:border-[#3E3025] hover:bg-[#EFE7DA] dark:hover:bg-[#31261E]'
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

          {/* TAB 5: XAMPP / COLLEGE SETUP */}
          {activeTab === 'xampp' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Hosting on hangout-hub.xo.je or XAMPP:</strong> You can upload this backend folder <code>php-backend/</code> to any Apache / PHP host (like cPanel, InfinityFree, XAMPP, or 000webhost).
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white dark:bg-[#251D17] p-4 rounded-2xl border border-[#E8DFC8] dark:border-[#33271F] shadow-xs">
                  <h4 className="text-xs font-bold text-[#C85A32] dark:text-amber-400 uppercase tracking-wider">Step 1: Start Apache and MySQL</h4>
                  <p className="text-xs text-[#5C4A3A] dark:text-stone-300 mt-1">
                    Launch the <strong className="text-[#2A1810] dark:text-stone-100">XAMPP Control Panel</strong> on Windows or Mac. Click the green <strong className="text-[#2A1810] dark:text-stone-100">Start</strong> buttons next to both <strong className="text-[#2A1810] dark:text-stone-100">Apache</strong> and <strong className="text-[#2A1810] dark:text-stone-100">MySQL</strong>.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#251D17] p-4 rounded-2xl border border-[#E8DFC8] dark:border-[#33271F] shadow-xs">
                  <h4 className="text-xs font-bold text-[#C85A32] dark:text-amber-400 uppercase tracking-wider">Step 2: Create Database in phpMyAdmin</h4>
                  <p className="text-xs text-[#5C4A3A] dark:text-stone-300 mt-1">
                    Open your web browser and visit <code className="bg-[#EFE7DA] dark:bg-[#1C1612] text-[#2A1810] dark:text-stone-200 px-1 py-0.5 rounded text-[11px]">http://localhost/phpmyadmin</code>. Click <strong className="text-[#2A1810] dark:text-stone-100">New</strong> in the left sidebar, type <code className="font-bold text-[#2A1810] dark:text-amber-300">hangout_hub</code> as the database name, and click <strong className="text-[#2A1810] dark:text-stone-100">Create</strong>.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#251D17] p-4 rounded-2xl border border-[#E8DFC8] dark:border-[#33271F] shadow-xs">
                  <h4 className="text-xs font-bold text-[#C85A32] dark:text-amber-400 uppercase tracking-wider">Step 3: Import database.sql</h4>
                  <p className="text-xs text-[#5C4A3A] dark:text-stone-300 mt-1">
                    Select <code className="font-bold text-[#2A1810] dark:text-amber-300">hangout_hub</code> in phpMyAdmin, click the <strong className="text-[#2A1810] dark:text-stone-100">Import</strong> tab at the top, select the downloaded <code className="font-bold text-[#2A1810] dark:text-amber-300">database.sql</code> file, and click <strong className="text-[#2A1810] dark:text-stone-100">Go / Import</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#E8DFC8] dark:border-[#33271F] bg-white/80 dark:bg-[#17120F] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-[#735A45] dark:text-stone-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Dual Compatible: MySQL 5.7+ / MariaDB & SQLite PDO</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSql}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#2A1810] dark:bg-amber-600 hover:bg-[#C85A32] dark:hover:bg-amber-500 rounded-xl transition-all shadow-xs cursor-pointer"
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