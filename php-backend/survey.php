<?php
/**
 * Hangout-Hub PHP REST API: /survey.php
 * Handles student design thinking surveys & community feedback with spam rate-limiting
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/security.php';

$pdo = Database::getConnection();
ensureSecuritySchema($pdo);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function computeSurveyStats(array $formattedResponses): array {
    $total = count($formattedResponses);
    $avgBudget = 220;
    $avgGroup = 6;
    $frustrations = [];
    $priorities = [];

    if ($total > 0) {
        $sumBudget = array_sum(array_column($formattedResponses, 'maxAcceptableCostPerHead'));
        $sumGroup = array_sum(array_column($formattedResponses, 'averageGroupSize'));
        $avgBudget = (int)round($sumBudget / $total);
        $avgGroup = round($sumGroup / $total, 1);

        foreach ($formattedResponses as $r) {
            if (!empty($r['primaryFrustration'])) {
                $f = $r['primaryFrustration'];
                $frustrations[$f] = ($frustrations[$f] ?? 0) + 1;
            }
            if (is_array($r['idealSpotPriorities'])) {
                foreach ($r['idealSpotPriorities'] as $p) {
                    $priorities[$p] = ($priorities[$p] ?? 0) + 1;
                }
            }
        }
    }

    return [
        'total'        => $total,
        'avgMaxBudget' => $avgBudget,
        'avgGroupSize' => $avgGroup,
        'frustrations' => $frustrations,
        'priorities'   => $priorities
    ];
}

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM survey_responses ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();
        $formattedResponses = array_map('formatSurveyRow', $rows);

        sendJsonResponse([
            'success'   => true,
            'engine'    => 'PHP/' . PHP_VERSION,
            'stats'     => computeSurveyStats($formattedResponses),
            'responses' => $formattedResponses
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Failed to load community responses'], 500);
    }
}

if ($method === 'POST') {
    $action = $_GET['action'] ?? '';
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);

    if ($action === 'like' || (is_array($body) && ($body['action'] ?? '') === 'like')) {
        enforceRateLimit($pdo, 'survey_like', 25, 60);
        sendJsonResponse(['success' => true, 'message' => 'Feedback endorsed!']);
    }

    // Rate-limit survey/community submissions (max 6 per hour per IP)
    enforceRateLimit($pdo, 'survey_submit', 6, 3600);

    if (!is_array($body)) {
        sendJsonResponse(['success' => false, 'error' => 'Invalid JSON'], 400);
    }

    $studentName = cleanText($body['studentName'] ?? '', 80);
    $collegeOrCampus = cleanText($body['collegeOrCampus'] ?? '', 100);
    if (strlen($studentName) < 2 || strlen($collegeOrCampus) < 2) {
        sendJsonResponse(['success' => false, 'error' => 'Student name and college/campus are required.'], 400);
    }

    $id = 'feed-' . round(microtime(true) * 1000) . '-' . substr(bin2hex(random_bytes(2)), 0, 4);
    $yearOfStudy = cleanText($body['yearOfStudy'] ?? '', 50) ?: 'Undergraduate';
    $monthlyHangoutBudget = cleanText($body['monthlyHangoutBudget'] ?? '', 50) ?: '₹2,000 - ₹3,500';
    $primaryFrustration = cleanText($body['primaryFrustration'] ?? '', 200) ?: 'Hidden costs';
    $worstExperienceWithApps = cleanText($body['worstExperienceWithApps'] ?? '', 500) ?: 'Bill was much higher than app said.';
    $priorities = is_array($body['idealSpotPriorities'] ?? null) && count($body['idealSpotPriorities']) > 0
        ? array_values(array_filter(array_map(fn($p) => cleanText($p, 60), $body['idealSpotPriorities'])))
        : ['Honest per-head cost', 'Big group table'];
    $maxCost = max(30, min(2000, (int)($body['maxAcceptableCostPerHead'] ?? 200)));
    $avgGroup = max(1, min(30, (int)($body['averageGroupSize'] ?? 6)));
    $submittedAt = date('Y-m-d');

    $sql = "INSERT INTO survey_responses (
        id, student_name, college_or_campus, year_of_study, monthly_hangout_budget,
        primary_frustration, worst_experience_with_apps, ideal_spot_priorities_json,
        max_acceptable_cost_per_head, average_group_size, submitted_at
    ) VALUES (
        :id, :student_name, :college_or_campus, :year_of_study, :monthly_hangout_budget,
        :primary_frustration, :worst_experience_with_apps, :ideal_spot_priorities_json,
        :max_acceptable_cost_per_head, :average_group_size, :submitted_at
    )";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'                           => $id,
            ':student_name'                 => $studentName,
            ':college_or_campus'            => $collegeOrCampus,
            ':year_of_study'                => $yearOfStudy,
            ':monthly_hangout_budget'       => $monthlyHangoutBudget,
            ':primary_frustration'          => $primaryFrustration,
            ':worst_experience_with_apps'   => $worstExperienceWithApps,
            ':ideal_spot_priorities_json'   => json_encode($priorities),
            ':max_acceptable_cost_per_head' => $maxCost,
            ':average_group_size'           => $avgGroup,
            ':submitted_at'                 => $submittedAt
        ]);

        $stmtAll = $pdo->query("SELECT * FROM survey_responses ORDER BY created_at DESC");
        $allFormatted = array_map('formatSurveyRow', $stmtAll->fetchAll());

        $newResponse = [
            'id'                       => $id,
            'studentName'              => $studentName,
            'collegeOrCampus'          => $collegeOrCampus,
            'yearOfStudy'              => $yearOfStudy,
            'monthlyHangoutBudget'     => $monthlyHangoutBudget,
            'primaryFrustration'       => $primaryFrustration,
            'worstExperienceWithApps'  => $worstExperienceWithApps,
            'idealSpotPriorities'      => $priorities,
            'maxAcceptableCostPerHead' => $maxCost,
            'averageGroupSize'         => $avgGroup,
            'submittedAt'              => $submittedAt
        ];

        sendJsonResponse([
            'success'  => true,
            'message'  => 'Feedback saved!',
            'response' => $newResponse,
            'stats'    => computeSurveyStats($allFormatted)
        ], 201);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Could not save response right now.'], 500);
    }
}

sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
