<?php
require_once __DIR__ . '/config/db.php';
$pdo = Database::getConnection();
$spots = $pdo->query("SELECT * FROM spots")->fetchAll();

$sqlHeader = file_get_contents(__DIR__ . '/database.sql');
$parts = explode("INSERT INTO `spots`", $sqlHeader);
$baseSchema = $parts[0];

$insertLines = [];
foreach ($spots as $s) {
    $vals = [];
    foreach ($s as $k => $v) {
        if ($k === "created_at") continue;
        if (is_null($v)) {
            $vals[] = "NULL";
        } elseif (is_numeric($v)) {
            $vals[] = $v;
        } else {
            $vals[] = $pdo->quote($v);
        }
    }
    $insertLines[] = "(" . implode(", ", $vals) . ")";
}

$cols = array_keys(array_diff_key($spots[0], ["created_at" => 1]));
$colNames = "`" . implode("`, `", $cols) . "`";

$spotsSql = "INSERT INTO `spots` (" . $colNames . ") VALUES\n" . implode(",\n", $insertLines) . ";\n\n";

$survSql = "-- -----------------------------------------------------------------------------\n-- 5. Seed Data for survey_responses\n-- -----------------------------------------------------------------------------\nINSERT INTO `survey_responses` (`id`, `student_name`, `college_or_campus`, `year_of_study`, `monthly_hangout_budget`, `primary_frustration`, `worst_experience_with_apps`, `ideal_spot_priorities_json`, `max_acceptable_cost_per_head`, `average_group_size`, `submitted_at`) VALUES
('srv-1', 'Dhruv Trivedi', 'CEPT University', '3rd Year Architecture', '₹2,500 - ₹4,000', 'Hidden Service Charges & GST', 'Food app said ₹400 for two, but when 6 of us went, the bill was ₹3,400 due to mandatory platters.', '[\"Honest per-head bill\",\"Can push tables together\",\"Fast WiFi for CAD/Render files\"]', 250, 7, '2026-10-18'),
('srv-2', 'Kinjal Parikh', 'Ahmedabad University (AMSOM)', '2nd Year BBA', '₹1,500 - ₹2,500', 'Reel Aesthetic vs Seating Reality', 'Reel showed huge couch for groups. We reached and were told table is reserved for ₹3000 minimum spend.', '[\"Guaranteed group tables\",\"True student pricing\",\"Outside birthday cake allowed\"]', 200, 8, '2026-10-21'),
('srv-3', 'Yashraj Vaghela', 'Nirma University (IT)', '4th Year B.Tech', '₹2,000 - ₹3,000', 'Dead WiFi & zero power outlets', 'Went for a coding sprint with 5 friends. Only 1 plug point in the entire cafe and manager unplugged our strip.', '[\"Plug at every table\",\"Tested 50+ Mbps WiFi\",\"Zero disturbance from staff\"]', 180, 5, '2026-10-24');

-- -----------------------------------------------------------------------------\n-- 6. Seed Data for partnership_proposals\n-- -----------------------------------------------------------------------------\nINSERT INTO `partnership_proposals` (`id`, `cafe_name`, `owner_name`, `contact_email`, `contact_phone`, `address`, `proposed_per_person_cost`, `group_capacity`, `offered_student_discount`, `has_fast_wifi`, `notes`, `status`, `submitted_at`) VALUES
('part-1', 'Zen Cafe @ Amdavad ni Gufa', 'Ketan Shah', 'zencafe.amdavad@gmail.com', '+91 98250 12345', 'Opposite CEPT University, University Area, Navrangpura', 160, 18, 'Free iced tea upgrade for student groups on weekdays before 5 PM', 1, 'We love student art discussions under the neem trees.', 'verified_active', '2026-10-20'),
('part-2', 'Mocha Cafe & Cabanas', 'Nirav Parekh', 'mocha.ahmedabad@gmail.com', '+91 99099 87654', 'Opposite Rajpath Club, Bodakdev / SBR', 330, 16, 'Free garlic pull-apart bread plate + zero outside cake fee for groups of 6+ with college ID', 1, 'Dedicated student birthday squad cabanas with zero cake-cutting charges.', 'verified_active', '2026-10-22');
";

file_put_contents(__DIR__ . "/database.sql", $baseSchema . $spotsSql . $survSql);
echo "Updated database.sql with all " . count($spots) . " spots successfully!\n";
