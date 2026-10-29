<?php
/**
 * Hangout-Hub PHP REST API: /api/survey.php
 * Handles student design thinking surveys & community feedback
 */

require_once __DIR__ . '/db.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM survey_responses ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();
        $formattedResponses = array_map('formatSurveyRow', $rows);

        // Calculate statistics via SQL
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

        sendJsonResponse([
            'success'   => true,
            'engine'    => 'PHP/' . PHP_VERSION,
            'stats'     => [
                'total'        => $total,
                'avgMaxBudget' => $avgBudget,
                'avgGroupSize' => $avgGroup,
                'frustrations' => $frustrations,
                'priorities'   => $priorities
            ],
            'responses' => $formattedResponses
        ]);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

if ($method === 'POST') {
    $action = $_GET['action'] ?? '';
    $idParam = $_GET['id'] ?? '';
    $rawInput = file_get_contents('php://input');
    $body = json_decode($rawInput, true);

    if ($action === 'like' || (is_array($body) && ($body['action'] ?? '') === 'like')) {
        sendJsonResponse(['success' => true, 'message' => 'Feedback endorsed!']);
    }

    if (!is_array($body)) {
        sendJsonResponse(['success' => false, 'error' => 'Invalid JSON'], 400);
    }

    $id = 'feed-' . round(microtime(true) * 1000);
    $studentName = !empty($body['studentName']) ? trim($body['studentName']) : 'Campus Student';
    $collegeOrCampus = !empty($body['collegeOrCampus']) ? trim($body['collegeOrCampus']) : 'Local College';
    $yearOfStudy = !empty($body['yearOfStudy']) ? trim($body['yearOfStudy']) : 'Undergraduate';
    $monthlyHangoutBudget = !empty($body['monthlyHangoutBudget']) ? trim($body['monthlyHangoutBudget']) : '₹2,000 - ₹3,500';
    $primaryFrustration = !empty($body['primaryFrustration']) ? trim($body['primaryFrustration']) : 'Hidden costs';
    $worstExperienceWithApps = !empty($body['worstExperienceWithApps']) ? trim($body['worstExperienceWithApps']) : 'Bill was much higher than app said.';
    $priorities = is_array($body['idealSpotPriorities'] ?? null) && count($body['idealSpotPriorities']) > 0
        ? $body['idealSpotPriorities']
        : ['Honest per-head cost', 'Big group table'];
    $maxCost = isset($body['maxAcceptableCostPerHead']) ? (int)$body['maxAcceptableCostPerHead'] : 200;
    $avgGroup = isset($body['averageGroupSize']) ? (int)$body['averageGroupSize'] : 6;
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
            ':id' => $id,
            ':student_name' => $studentName,
            ':college_or_campus' => $collegeOrCampus,
            ':year_of_study' => $yearOfStudy,
            ':monthly_hangout_budget' => $monthlyHangoutBudget,
            ':primary_frustration' => $primaryFrustration,
            ':worst_experience_with_apps' => $worstExperienceWithApps,
            ':ideal_spot_priorities_json' => json_encode($priorities),
            ':max_acceptable_cost_per_head' => $maxCost,
            ':average_group_size' => $avgGroup,
            ':submitted_at' => $submittedAt
        ]);

        $newResponse = [
            'id' => $id,
            'studentName' => $studentName,
            'collegeOrCampus' => $collegeOrCampus,
            'yearOfStudy' => $yearOfStudy,
            'monthlyHangoutBudget' => $monthlyHangoutBudget,
            'primaryFrustration' => $primaryFrustration,
            'worstExperienceWithApps' => $worstExperienceWithApps,
            'idealSpotPriorities' => $priorities,
            'maxAcceptableCostPerHead' => $maxCost,
            'averageGroupSize' => $avgGroup,
            'submittedAt' => $submittedAt
        ];

        sendJsonResponse([
            'success'  => true,
            'message'  => 'Feedback saved to PHP SQL Database!',
            'response' => $newResponse
        ], 201);
    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
    }
}

sendJsonResponse(['success' => false, 'error' => 'Method not allowed'], 405);
