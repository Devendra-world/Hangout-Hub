# Hangout-Hub: PHP & MySQL Database Architecture Guide

This folder contains the complete, production-grade **PHP REST API** and **MySQL / MariaDB database** for Hangout-Hub, designed for college project submissions, viva presentations, and local deployment with **XAMPP / WAMP / LAMP / cPanel**.

---

## 🗄️ Database Structure (`database.sql`)

The database is named `hangout_hub` and includes three main relational tables:

1. **`spots`**: Contains all student-verified hangout spots, budget breakdowns, group seating limits, WiFi speeds, power outlet availability, and unedited Instagram reel reality audits.
2. **`survey_responses`**: Records student survey data (Design Thinking research on hidden bills, seat shortages, and priorities).
3. **`partnership_proposals`**: Stores cafe owner collaboration proposals for student group discounts and cabanas.

---

## 🚀 How to Run Locally with XAMPP (Windows / Mac / Linux)

### Step 1: Start Apache and MySQL
1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **Apache**.
3. Click **Start** next to **MySQL**.

### Step 2: Import the Database in phpMyAdmin
1. Open your browser and navigate to: `http://localhost/phpmyadmin`
2. Click **New** in the left sidebar.
3. Enter database name: `hangout_hub` and click **Create** (Collation: `utf8mb4_unicode_ci`).
4. Click on the newly created `hangout_hub` database.
5. In the top navigation bar, click **Import**.
6. Click **Choose File** and select `php-backend/database.sql`.
7. Click **Import** (or **Go**) at the bottom.
8. All tables (`spots`, `survey_responses`, `partnership_proposals`) and seed data are now ready!

### Step 3: Place PHP Files in `htdocs`
1. Copy the `php-backend` folder into your XAMPP web root:
   - **Windows**: `C:\xampp\htdocs\hangout-hub-api\`
   - **Mac**: `/Applications/XAMPP/xamppfiles/htdocs/hangout-hub-api/`
   - **Linux**: `/opt/lampp/htdocs/hangout-hub-api/`
2. Test the connection in your browser:
   - `http://localhost/hangout-hub-api/api/spots.php`
   - `http://localhost/hangout-hub-api/api/stats.php`

---

## 🔌 Available PHP REST Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/spots.php` | Filter spots by `city`, `search`, `vibe`, `maxBudget`, `minGroupSize`, `hasWifi` |
| `POST` | `/api/spots.php` | Student scout submission (inserts new spot with validation into SQL table) |
| `GET` | `/api/spot_detail.php?id=amd-1` | Get full details of a specific spot |
| `POST` | `/api/spot_detail.php?id=amd-1&action=vote` | Increment verified scout upvote counter |
| `GET` | `/api/survey.php` | Get student feedback feed and aggregated statistics |
| `POST` | `/api/survey.php` | Submit new student survey response |
| `GET` | `/api/partnerships.php` | List cafe partnership proposals |
| `POST` | `/api/partnerships.php` | Submit new cafe owner collaboration proposal |
| `GET` | `/api/stats.php` | Get live aggregated numbers from SQL database |
| `GET` | `/api/info.php` | Check PHP version, active PDO driver, and table row counts |

---

## ⚙️ Configuration (`config/db.php`)

By default, `config/db.php` connects to MySQL at:
- **Host**: `localhost`
- **Database**: `hangout_hub`
- **User**: `root`
- **Password**: *(empty by default in XAMPP)*

If MySQL is offline, it automatically falls back to the embedded zero-config SQLite database (`data/hangout_hub.db`), guaranteeing zero broken screens.
