<?php
/**
 * Hangout-Hub Auth API (PHP + SQL)
 * Handles Student & Admin Login, Registration, Session check, and Logout
 */

require_once __DIR__ . '/../config/db.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];

function formatUser(array $row): array {
    $vibes = [];
    if (!empty($row['favorite_vibes_json'])) {
        $decoded = json_decode($row['favorite_vibes_json'], true);
        if (is_array($decoded)) {
            $vibes = $decoded;
        }
    }

    return [
        'id'              => $row['id'],
        'name'            => $row['name'],
        'email'           => $row['email'],
        'role'            => $row['role'] ?? 'student',
        'college'         => $row['college'] ?? 'Campus Hub',
        'city'            => $row['city'] ?? 'Ahmedabad',
        'preferredBudget' => (int)($row['preferred_budget'] ?? 200),
        'favoriteVibes'   => $vibes,
        'bio'             => $row['bio'] ?? '',
        'avatarColor'     => $row['avatar_color'] ?? '#C85A32',
        'upiId'           => $row['upi_id'] ?? 'patadiyadevendra5@oksbi',
        'createdAt'       => $row['created_at'] ?? date('Y-m-d')
    ];
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $input['action'] ?? ($_GET['action'] ?? 'login');

    if ($action === 'login') {
        $email = trim($input['email'] ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($email)) {
            sendJsonResponse(['success' => false, 'error' => 'Email is required'], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1");
        $stmt->execute([':email' => $email]);
        $userRow = $stmt->fetch();

        if (!$userRow) {
            sendJsonResponse(['success' => false, 'error' => 'No account found with this email. Please sign up.'], 404);
        }

        // Verify password (allow matching hash or direct password in demo mode)
        $valid = false;
        if (!empty($userRow['password_hash'])) {
            if (password_verify($password, $userRow['password_hash']) || $password === 'admin123' || $password === 'student123' || $password === $userRow['password_hash']) {
                $valid = true;
            }
        } else {
            $valid = true;
        }

        if (!$valid) {
            sendJsonResponse(['success' => false, 'error' => 'Invalid password. Try "student123" or "admin123".'], 401);
        }

        $user = formatUser($userRow);
        sendJsonResponse([
            'success' => true,
            'message' => 'Logged in successfully',
            'user' => $user,
            'token' => 'hh_token_' . md5($user['id'] . time())
        ]);
    }

    if ($action === 'signup') {
        $email = trim($input['email'] ?? '');
        $name = trim($input['name'] ?? '');
        $password = trim($input['password'] ?? 'student123');
        $college = trim($input['college'] ?? 'Campus Hub');
        $city = trim($input['city'] ?? 'Ahmedabad');
        $budget = (int)($input['preferredBudget'] ?? 200);
        $role = ($input['role'] === 'admin') ? 'admin' : 'student';

        if (empty($email) || empty($name)) {
            sendJsonResponse(['success' => false, 'error' => 'Name and email are required'], 400);
        }

        // Check if email already registered
        $stmt = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1");
        $stmt->execute([':email' => $email]);
        if ($stmt->fetch()) {
            sendJsonResponse(['success' => false, 'error' => 'An account with this email already exists. Please log in.'], 409);
        }

        $upiId = trim($input['upiId'] ?? '');
        if (empty($upiId)) {
            // Default based on username or email
            $prefix = preg_replace('/[^a-zA-Z0-9]/', '', strtolower(explode('@', $email)[0]));
            $upiId = $prefix . '@oksbi';
        }

        $userId = 'usr_' . substr(md5(uniqid()), 0, 10);
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $vibes = $input['favoriteVibes'] ?? ['Budget Bite & Chill', 'Study & Projects'];
        $avatarColors = ['#C85A32', '#B45309', '#059669', '#1D4ED8', '#7C3AED'];
        $chosenColor = $avatarColors[array_rand($avatarColors)];

        $insert = "INSERT INTO users (
            id, name, email, password_hash, role, college, city, preferred_budget,
            favorite_vibes_json, bio, avatar_color, upi_id
        ) VALUES (
            :id, :name, :email, :password_hash, :role, :college, :city, :preferred_budget,
            :favorite_vibes_json, :bio, :avatar_color, :upi_id
        )";

        $stmtIns = $pdo->prepare($insert);
        $stmtIns->execute([
            ':id' => $userId,
            ':name' => $name,
            ':email' => $email,
            ':password_hash' => $hash,
            ':role' => $role,
            ':college' => $college,
            ':city' => $city,
            ':preferred_budget' => $budget,
            ':favorite_vibes_json' => json_encode($vibes),
            ':bio' => trim($input['bio'] ?? 'Student scout exploring student-friendly cafes.'),
            ':avatar_color' => $chosenColor,
            ':upi_id' => $upiId
        ]);

        $stmtGet = $pdo->prepare("SELECT * FROM users WHERE id = :id");
        $stmtGet->execute([':id' => $userId]);
        $newUserRow = $stmtGet->fetch();

        sendJsonResponse([
            'success' => true,
            'message' => 'Account created successfully!',
            'user' => formatUser($newUserRow),
            'token' => 'hh_token_' . md5($userId . time())
        ], 201);
    }

    if ($action === 'logout') {
        sendJsonResponse([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    sendJsonResponse(['success' => false, 'error' => 'Invalid action'], 400);
}

if ($method === 'GET') {
    $userId = $_GET['user_id'] ?? '';
    if (empty($userId)) {
        // Return active users count or current session user
        sendJsonResponse([
            'success' => true,
            'availableDemoAccounts' => [
                ['email' => 'admin@hangouthub.in', 'role' => 'admin', 'password' => 'admin123', 'name' => 'Campus Admin'],
                ['email' => 'patadiyadevendra5@gmail.com', 'role' => 'student', 'password' => 'student123', 'name' => 'Devendra Patadiya']
            ]
        ]);
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $userId]);
    $userRow = $stmt->fetch();

    if (!$userRow) {
        sendJsonResponse(['success' => false, 'error' => 'User not found'], 404);
    }

    sendJsonResponse([
        'success' => true,
        'user' => formatUser($userRow)
    ]);
}
