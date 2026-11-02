<?php
/**
 * Hangout-Hub Auth API (PHP + SQL)
 * Handles Student & Admin Login, Registration, DB-backed Session Tokens, Rate Limiting & Logout
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';

header('Content-Type: application/json; charset=utf-8');

$pdo = Database::getConnection();
ensureSecuritySchema($pdo);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

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
        'college'         => $row['college'] ?? '',
        'city'            => $row['city'] ?? '',
        'preferredBudget' => isset($row['preferred_budget']) ? (int)$row['preferred_budget'] : null,
        'favoriteVibes'   => $vibes,
        'bio'             => $row['bio'] ?? '',
        'avatarColor'     => $row['avatar_color'] ?? '#C85A32',
        'upiId'           => $row['upi_id'] ?? '',
        'createdAt'       => $row['created_at'] ?? date('Y-m-d')
    ];
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = strtolower(trim((string)($input['action'] ?? ($_GET['action'] ?? 'login'))));

    if ($action === 'login') {
        // Max 12 login attempts per 10 minutes per IP (prevents password brute-forcing)
        enforceRateLimit($pdo, 'auth_login', 12, 600);

        $email = trim((string)($input['email'] ?? ''));
        $password = (string)($input['password'] ?? '');

        if ($email === '' || $password === '') {
            sendJsonResponse(['success' => false, 'error' => 'Email and password are required'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendJsonResponse(['success' => false, 'error' => 'Please enter a valid email address'], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1");
        $stmt->execute([':email' => $email]);
        $userRow = $stmt->fetch();

        if (!$userRow) {
            sendJsonResponse(['success' => false, 'error' => 'No account found with this email. Please sign up first.'], 404);
        }

        if (empty($userRow['password_hash']) || !password_verify($password, $userRow['password_hash'])) {
            sendJsonResponse(['success' => false, 'error' => 'Incorrect email or password.'], 401);
        }

        $user = formatUser($userRow);
        $token = createAuthSession($pdo, (string)$userRow['id']);

        sendJsonResponse([
            'success' => true,
            'message' => 'Logged in successfully',
            'user'    => $user,
            'token'   => $token
        ]);
    }

    if ($action === 'signup') {
        // Max 5 new account registrations per hour per IP (prevents fake bot signups)
        enforceRateLimit($pdo, 'auth_signup', 5, 3600);

        $email = trim((string)($input['email'] ?? ''));
        $name = cleanText($input['name'] ?? '', 100);
        $password = (string)($input['password'] ?? '');
        $college = cleanText($input['college'] ?? '', 150);
        $city = cleanText($input['city'] ?? '', 80);
        $budgetInput = $input['preferredBudget'] ?? null;
        // Strictly student on public signup; Admin role can only be granted in DB
        $role = 'student';

        if ($email === '' || strlen($name) < 2 || $college === '' || $city === '' ||
            $budgetInput === null || $budgetInput === '' || !is_numeric($budgetInput)) {
            sendJsonResponse(['success' => false, 'error' => 'Name, email, college, city and preferred budget are required'], 400);
        }
        $budget = (int)$budgetInput;
        if ($budget < 50 || $budget > 5000) {
            sendJsonResponse(['success' => false, 'error' => 'Preferred budget must be between 50 and 5000'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendJsonResponse(['success' => false, 'error' => 'Please enter a valid email address'], 400);
        }

        if (strlen($password) < 6) {
            sendJsonResponse(['success' => false, 'error' => 'Password must be at least 6 characters long'], 400);
        }

        $stmt = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1");
        $stmt->execute([':email' => $email]);
        if ($stmt->fetch()) {
            sendJsonResponse(['success' => false, 'error' => 'An account with this email already exists. Please log in.'], 409);
        }

        $upiId = cleanText($input['upiId'] ?? '', 100);
        if ($upiId === '' || !preg_match('/^[a-zA-Z0-9._-]{2,}@[a-zA-Z0-9.-]{2,}$/', $upiId)) {
            sendJsonResponse(['success' => false, 'error' => 'A valid UPI ID is required'], 400);
        }

        $userId = 'usr_' . bin2hex(random_bytes(6));
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $vibes = is_array($input['favoriteVibes'] ?? null)
            ? array_values(array_filter(array_map(fn($v) => cleanText($v, 50), $input['favoriteVibes'])))
            : ['Budget Bite & Chill', 'Study & Projects'];
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
            ':id'                  => $userId,
            ':name'                => $name,
            ':email'               => substr($email, 0, 150),
            ':password_hash'       => $hash,
            ':role'                => $role,
            ':college'             => $college,
            ':city'                => $city,
            ':preferred_budget'    => $budget,
            ':favorite_vibes_json' => json_encode($vibes),
            ':bio'                 => cleanText($input['bio'] ?? 'Student scout exploring student-friendly cafes.', 400),
            ':avatar_color'        => $chosenColor,
            ':upi_id'              => $upiId
        ]);

        $stmtGet = $pdo->prepare("SELECT * FROM users WHERE id = :id");
        $stmtGet->execute([':id' => $userId]);
        $newUserRow = $stmtGet->fetch();

        $token = createAuthSession($pdo, $userId);

        sendJsonResponse([
            'success' => true,
            'message' => 'Account created successfully!',
            'user'    => formatUser($newUserRow),
            'token'   => $token
        ], 201);
    }

    if ($action === 'logout') {
        destroyAuthSession($pdo, is_array($input) ? $input : null);
        sendJsonResponse([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    sendJsonResponse(['success' => false, 'error' => 'Invalid action'], 400);
}

if ($method === 'GET') {
    $action = strtolower(trim((string)($_GET['action'] ?? '')));
    if ($action === 'me') {
        $authUser = requireAuthUser($pdo);
        sendJsonResponse([
            'success' => true,
            'user'    => formatUser($authUser)
        ]);
    }

    $userId = trim((string)($_GET['user_id'] ?? ''));
    if ($userId === '') {
        sendJsonResponse([
            'success' => true,
            'message' => 'Authentication service online'
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
        'user'    => formatUser($userRow)
    ]);
}
