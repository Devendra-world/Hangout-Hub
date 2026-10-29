-- ==============================================================================
-- Hangout-Hub: Student Campus Cafes & Group Adda Database
-- Engine: MySQL 5.7+ / MariaDB / Compatible with phpMyAdmin, XAMPP, WAMP, cPanel
-- Description: Relational database schema with pre-seeded data for college addas,
-- real per-person budgets, group seating audits, WiFi benchmarks, and reviews.
-- ==============================================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `hangout_hub` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `hangout_hub`;

-- -----------------------------------------------------------------------------
-- 1. Table structure for `spots`
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `spots`;
CREATE TABLE `spots` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `tagline` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL DEFAULT 'Ahmedabad',
  `campus_name` VARCHAR(255) DEFAULT 'Campus Hub',
  `neighborhood` VARCHAR(255) NOT NULL,
  `distance_to_campus` VARCHAR(255) NOT NULL,
  `vibe_category` VARCHAR(100) NOT NULL,
  
  -- Real Cost Details
  `cost_min` INT NOT NULL DEFAULT 100,
  `cost_max` INT NOT NULL DEFAULT 200,
  `cost_avg` INT NOT NULL DEFAULT 150,
  `popular_order_example` VARCHAR(255) NOT NULL,
  `official_claim_cost` VARCHAR(255) NOT NULL,

  -- Group Seating Realities
  `max_group_size` INT NOT NULL DEFAULT 8,
  `seating_description` TEXT NOT NULL,
  `push_together_allowed` TINYINT(1) NOT NULL DEFAULT 1,
  `booth_count` INT NOT NULL DEFAULT 0,
  `reservation_needed` TINYINT(1) NOT NULL DEFAULT 0,
  `reservation_tip` VARCHAR(255) NOT NULL,

  -- Amenities & Benchmarks
  `wifi_speed_mbps` INT NOT NULL DEFAULT 40,
  `wifi_reliability` VARCHAR(100) NOT NULL,
  `power_outlets` VARCHAR(100) NOT NULL,
  `noise_decibels` INT NOT NULL DEFAULT 65,
  `noise_description` VARCHAR(255) NOT NULL,
  `board_games_available` TINYINT(1) NOT NULL DEFAULT 0,
  `outside_cake_allowed` TINYINT(1) NOT NULL DEFAULT 1,
  `student_discount_available` TINYINT(1) NOT NULL DEFAULT 0,
  `discount_note` VARCHAR(255) NOT NULL,
  `air_conditioned` TINYINT(1) NOT NULL DEFAULT 1,
  `open_late_night` TINYINT(1) NOT NULL DEFAULT 0,
  `closing_time` VARCHAR(100) NOT NULL DEFAULT '11:00 PM',

  -- Reel Reality Check
  `has_reel` TINYINT(1) NOT NULL DEFAULT 1,
  `reel_url` TEXT,
  `reel_creator` VARCHAR(255),
  `reel_hype_claim` TEXT,
  `ground_reality_truth` TEXT,
  `reality_score` INT NOT NULL DEFAULT 85,

  -- Student Scout Audit
  `scout_name` VARCHAR(255) NOT NULL,
  `scout_college` VARCHAR(255) NOT NULL,
  `scout_notes` TEXT NOT NULL,
  `verified_date` VARCHAR(100) NOT NULL,
  `upvotes` INT NOT NULL DEFAULT 0,

  -- Visual & Tags JSON
  `tags_json` TEXT NOT NULL,
  `visual_theme_json` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_city` (`city`),
  INDEX `idx_vibe` (`vibe_category`),
  INDEX `idx_cost_min` (`cost_min`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table structure for `survey_responses` (Design Thinking Student Voice)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `survey_responses`;
CREATE TABLE `survey_responses` (
  `id` VARCHAR(64) NOT NULL,
  `student_name` VARCHAR(255) NOT NULL,
  `college_or_campus` VARCHAR(255) NOT NULL,
  `year_of_study` VARCHAR(100) NOT NULL,
  `monthly_hangout_budget` VARCHAR(100) NOT NULL,
  `primary_frustration` VARCHAR(255) NOT NULL,
  `worst_experience_with_apps` TEXT NOT NULL,
  `ideal_spot_priorities_json` TEXT NOT NULL,
  `max_acceptable_cost_per_head` INT NOT NULL,
  `average_group_size` INT NOT NULL,
  `submitted_at` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_college` (`college_or_campus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Table structure for `partnership_proposals` (Cafe Owner Inquiries)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `partnership_proposals`;
CREATE TABLE `partnership_proposals` (
  `id` VARCHAR(64) NOT NULL,
  `cafe_name` VARCHAR(255) NOT NULL,
  `owner_name` VARCHAR(255) NOT NULL,
  `contact_email` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(100) NOT NULL,
  `address` TEXT NOT NULL,
  `proposed_per_person_cost` INT NOT NULL,
  `group_capacity` INT NOT NULL,
  `offered_student_discount` TEXT NOT NULL,
  `has_fast_wifi` TINYINT(1) NOT NULL DEFAULT 1,
  `notes` TEXT,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending_verification',
  `submitted_at` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Table structure for `users` (Student Profiles & Admins)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(32) NOT NULL DEFAULT 'student',
  `college` VARCHAR(255) NOT NULL DEFAULT 'Campus Hub',
  `city` VARCHAR(100) NOT NULL DEFAULT 'Ahmedabad',
  `preferred_budget` INT NOT NULL DEFAULT 200,
  `favorite_vibes_json` TEXT,
  `bio` TEXT,
  `avatar_color` VARCHAR(32) DEFAULT '#C85A32',
  `upi_id` VARCHAR(100) DEFAULT 'patadiyadevendra5@oksbi',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. Table structure for `user_history` (Interaction Tracking & Scoring)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `user_history`;
CREATE TABLE `user_history` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `spot_id` VARCHAR(64) NOT NULL,
  `action_type` VARCHAR(64) NOT NULL,
  `metadata_json` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  INDEX (`spot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. Table structure for `user_bookmarks` (Student Saved Addas)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `user_bookmarks`;
CREATE TABLE `user_bookmarks` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `spot_id` VARCHAR(64) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_user_bookmark` (`user_id`, `spot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Seed Data for `spots`
-- -----------------------------------------------------------------------------
INSERT INTO `spots` (`id`, `name`, `tagline`, `city`, `campus_name`, `neighborhood`, `distance_to_campus`, `vibe_category`, `cost_min`, `cost_max`, `cost_avg`, `popular_order_example`, `official_claim_cost`, `max_group_size`, `seating_description`, `push_together_allowed`, `booth_count`, `reservation_needed`, `reservation_tip`, `wifi_speed_mbps`, `wifi_reliability`, `power_outlets`, `noise_decibels`, `noise_description`, `board_games_available`, `outside_cake_allowed`, `student_discount_available`, `discount_note`, `air_conditioned`, `open_late_night`, `closing_time`, `has_reel`, `reel_url`, `reel_creator`, `reel_hype_claim`, `ground_reality_truth`, `reality_score`, `scout_name`, `scout_college`, `scout_notes`, `verified_date`, `upvotes`, `tags_json`, `visual_theme_json`) VALUES
('spot-zen-gufa', 'Zen Cafe @ Amdavad ni Gufa', 'Open-air amphitheatre under neem trees next to M.F. Husain & B.V. Doshi’s architectural cave', 'Ahmedabad', 'CEPT & Gujarat Univ', 'Navrangpura', '0.1 km (2 min walk from CEPT & Gujarat Univ)', 'Aesthetic Hangout', 110, 220, 160, 'Ginger Mint Iced Tea + Thin Crust Margherita Slice + Samosa = ₹160', 'Zomato lists: ₹650 for two (misleading! Tea & quick bites are only ₹80–₹120)', 18, 'Outdoor amphitheatre stone steps + rustic wooden tables. Easily seats 12–18 students together in the open air without feeling cramped.', 1, 0, 0, 'Walk-ins always welcome. Golden hour (5:30 PM to 7:00 PM) has the best sunset light through the neem leaves.', 35, 'Decent for Browsing', 'Select Wall Tables', 54, 'Breezy outdoor campus debates, acoustic guitar strums, and rustling trees', 0, 1, 1, '10% student concession on coffee combos with CEPT / GU / AU ID', 0, 1, '11:00 PM', 1, 'https://instagram.com/reel/amdavad-gufa-cafe', '@ahmedabad_cafe_diaries', 'Secret underground cave dining experience with Paris-style aesthetic!', 'The cave (Gufa) is an art gallery next door, while the cafe is actually open-air under gorgeous neem trees. Incredibly peaceful, zero rush to leave, and arguably the most artistic hangout spot in Ahmedabad.', 92, 'Kavya & Harsh (CEPT Architecture & AU)', 'CEPT University Campus Scout', 'The ultimate student adda in Ahmedabad. We spend 3 hours here discussing studio jury projects. Staff never pushes you to re-order.', 'Oct 2026', 312, '["Near CEPT","Open Air Neem Shade","Architectural Icon","Under \u20b9200","Creative Adda"]', '{"primaryColor":"#78350F","patternType":"warm","heroIconName":"Coffee"}'),
('spot-shambhu-hl', 'Shambhu''s Coffee Bar (HL Adda)', 'The undisputed legendary campus institution for frothy thick cold coffee, grilled puffs & midnight chai', 'Ahmedabad', 'HL Commerce & St. Xavier’s', 'Navrangpura', '0.2 km (3 min walk from HL College & St. Xavier’s)', 'Budget Bite & Chill', 50, 130, 85, 'Iconic Frothy Thick Cold Coffee (₹55) + Cheese Chilli Puff (₹40) = ₹95', 'Google Maps: ₹250 for two (actual per-head cost is under ₹90!)', 20, 'Wide pavement curb seating + outdoor wooden benches and standing tables. Accommodates 15–20 classmates casually around bikes.', 1, 0, 0, 'Never needs reservation. Peak crowd arrives at 11 AM (post-class) and 9:30 PM (night adda).', 20, 'Spotty', 'None', 74, 'Energetic street banter, college laughter, clinking glasses, and revving bikes', 0, 1, 0, 'Prices are already at direct student street rates', 0, 1, '1:30 AM', 1, 'https://instagram.com/reel/hl-cold-coffee', '@amdavad_food_hunt', 'Viral chocolate river cold coffee that will blow your mind for ₹50!', 'The cold coffee is frothy, thick, and genuinely great value. It is a street-side campus cafe, not a luxury AC lounge. If you want pure Ahmedabad student nostalgia and spend under ₹100 with 10 friends, this is unbeatable.', 95, 'Dhruv & Riya (B.Com & BBA)', 'HL College of Commerce', 'Every single exam celebration starts and ends at Shambhu’s. ₹90 per head for cold coffee and cheese puff is the gold standard.', 'Oct 2026', 420, '["Under \u20b9100","HL College Classic","Late Night to 1:30 AM","Cold Coffee","Mass Group Adda"]', '{"primaryColor":"#B45309","patternType":"warm","heroIconName":"Coffee"}'),
('spot-caffix-tech', 'Caffix - The Tech Cafe', 'Minimalist glasshouse work cafe with 120 Mbps fiber and power sockets at every single table', 'Ahmedabad', 'IIM-A & Vastrapur Lake', 'Vastrapur', '0.6 km (7 min from IIM Ahmedabad & Ahmedabad University)', 'Study & Projects', 190, 340, 260, 'Hazelnut Iced Latte + Peri Peri Paneer Panini Melt = ₹265', 'Zomato lists: ₹700 for two (pretty accurate, coffee is premium cafe rate)', 12, 'Two 8-seater shared oak project tables with surge-protected charging hubs directly built into the table surface.', 1, 2, 0, 'Arrive before 2:30 PM on weekdays to grab the large table near the front glass window for group coding.', 120, 'Fast & Reliable', 'Every Table', 48, 'Soft ambient lofi beats, clicking mechanical keyboards, quiet study vibe', 0, 0, 1, '15% discount for IIM-A, CEPT, and AU students with college ID', 1, 0, '11:00 PM', 1, 'https://instagram.com/reel/caffix-tech-cafe', '@workspaces_gujarat', 'The Silicon Valley cafe of Ahmedabad where everyone is building startups and chargers are unlimited!', 'Reel was actually 100% genuine! The WiFi is screaming fast (tested 118 Mbps), there are multi-pin sockets for 8 laptops at the main table, and coffee quality is top-notch. Ideal for hackathons & group presentations.', 98, 'Aman Patel & Squad (Data Science)', 'Ahmedabad University Tech Lead', 'We coded our final year project here for 5 hours straight. Sockets never tripped, AC was icy, and the iced Americano kept us awake.', 'Oct 2026', 215, '["120 Mbps WiFi","Power Hubs Every Table","AC","Silent Study","Vastrapur"]', '{"primaryColor":"#1D4ED8","patternType":"minimal","heroIconName":"Laptop"}'),
('spot-roastery-sbr', 'Roastery Cultur Cafe & Courtyard', 'Sprawling brick-red courtyard with artisan pour-overs, lush monstera plants, and sunset breeze', 'Ahmedabad', 'Sindhu Bhavan (SBR)', 'Bodakdev', '2.5 km (10 min drive from Vastrapur / Drive-In)', 'Aesthetic Hangout', 240, 420, 320, 'Cascara Sparkler + Truffle Fries Platter Share + Sourdough Toast = ₹310/head (for 5 friends)', 'Zomato lists: ₹950 for two (sharing group platters brings per-head cost to ₹310)', 14, 'Wide wooden tables under outdoor brick canopies + indoor AC conservatory. Tables seat 8–10 easily.', 1, 3, 1, 'Friday & Saturday evenings have a 30-min waiting list. Best for group get-togethers on weekday afternoons.', 65, 'Fast & Reliable', 'Select Wall Tables', 58, 'Pleasant hum of espresso grinders, warm courtyard fountain, and indie pop', 0, 1, 1, '10% student concession on weekday afternoons with college ID', 1, 1, '11:30 PM', 1, 'https://instagram.com/reel/roastery-cultur-sbr', '@sbr_hangouts', 'Dreamy European luxury villa cafe with imported beans and aesthetic photo corners!', 'The aesthetics and courtyard architecture are genuinely gorgeous for group photos. Food is high quality. Tip: Sharing their giant truffle fries and 14" pizzas makes it very budget-friendly for a group of 5-6 friends.', 89, 'Sneha Shah & Friends', 'NID & CEPT Postgrads', 'The natural daylight and red-brick backdrop make this our top pick for catching up with friends. Share the platters to keep the bill under ₹350 each.', 'Oct 2026', 198, '["Sindhu Bhavan SBR","Brick Courtyard","Specialty Coffee","Aesthetic Photos","Sunset Vibe"]', '{"primaryColor":"#991B1B","patternType":"botanical","heroIconName":"Sparkles"}'),
('spot-unlocked-games', 'Unlocked - Board Game Lounge', '250+ international board games, comfy couch nooks, and unlimited group game banter', 'Ahmedabad', 'GLS & St. Xavier’s (CG Road)', 'Navrangpura', '0.8 km (8 min walk from GLS & St. Xavier’s)', 'Board Games & Fun', 190, 320, 240, 'Weekday Gaming Pass (₹100) + Loaded Nachos Bowl + Cold Coffee = ₹230', 'Google Maps: ₹750 for two (doesn’t clarify how game cover fee works)', 16, 'Wide low dining tables built specifically for large games like Catan, Ticket to Ride, and Secret Hitler.', 1, 2, 0, 'Walk-ins fine on Mon-Thu. Sunday evenings have college board game tournaments so booking is recommended.', 50, 'Fast & Reliable', 'Every Table', 72, 'Lively dice rolling, cheering, laughter, and animated bluffing debates', 1, 1, 1, '50% off table game rental fee with valid college ID on Mon-Thu', 1, 1, '11:45 PM', 1, 'https://instagram.com/reel/unlocked-ahmedabad', '@amdavadi_hangouts', 'Insane underground den where you can play hundreds of games with unlimited food!', 'Food is not unlimited, but the game masters will sit with your squad and patiently teach you complex games for free. Perfect post-exam stress buster for a group of 6-8 friends.', 84, 'Parth & Team (GLS & Nirma Alumni)', 'GLS University Campus Scout', 'Best spot in Navrangpura when you want something more fun than just sitting and scrolling Instagram. 6 of us spent 3 hours playing Catan and spent ₹230 each.', 'Oct 2026', 188, '["250+ Board Games","Game Masters","AC","Navrangpura","Squad Fun"]', '{"primaryColor":"#7C3AED","patternType":"geometric","heroIconName":"Gamepad2"}'),
('spot-mocha-cabanas', 'Mocha Cafe & Cabanas', 'Boho outdoor cabanas with fairy lights, giant group sizzler platters, and zero cake-cutting fees', 'Ahmedabad', 'Bodakdev & SBR', 'Bodakdev', '2.8 km (12 min transit from Vastrapur)', 'Late Night Adda', 280, 460, 340, '18" Group Margherita Pizza + Mezze Platter + Chocolate Avalanche Share = ₹330/head (for 6 friends)', 'Zomato lists: ₹1,200 for two (misleading! Sharing giant platters drops per-head cost to ₹330)', 16, 'Curtained private cabanas + modular open-air tables that join seamlessly for groups of 12–16.', 1, 5, 1, 'Reserve a cabana 2 hours in advance if planning a friend’s birthday or farewell treat.', 45, 'Decent for Browsing', 'Select Wall Tables', 64, 'Breezy cabana acoustics with upbeat acoustic chill mixes', 1, 1, 1, '15% group discount on total bill exceeding ₹1,800', 1, 1, '1:00 AM', 1, 'https://instagram.com/reel/mocha-ahmedabad-cabanas', '@delish_amdavad', 'Santorini-themed fairy lit cabanas with smoking liquid nitrogen desserts!', 'The cabanas look magical at night with warm string lights. The chocolate avalanche is massive and easily shared by 6 people. Zero fee for bringing your own outside birthday cake, and they give free plates.', 91, 'Ananya & Shrey (IIM-A & Nirma)', 'IIM Ahmedabad & Nirma Squad', 'We celebrated our friend’s 21st birthday here. Saved ₹500 because other cafes charge a "cake cutting fee", but Mocha welcomed us warmly and helped us cut the cake.', 'Oct 2026', 275, '["Outside Cake Allowed","Private Cabanas","Late Night to 1 AM","Birthday Treats","Bodakdev"]', '{"primaryColor":"#059669","patternType":"botanical","heroIconName":"Users"}'),
('spot-kuro-sando', 'Kuro - Japanese Minimalist Cafe', 'Poured concrete, zen bonsai garden, iced ceremonial matcha, and Japanese milk bread sandos', 'Ahmedabad', 'Sindhu Bhavan Road', 'Bodakdev', '3.0 km (12 min ride from University Area)', 'Aesthetic Hangout', 260, 420, 330, 'Ceremonial Iced Matcha Latte + Truffle Egg Sando + Cloud Basque Cheesecake = ₹340', 'Google Maps: ₹1,000 for two', 8, 'Minimalist monolithic wooden tables. Comfortably seats groups of 6 to 8 friends.', 0, 1, 0, 'Weekday mornings and late afternoons are calm. Avoid peak 7 PM weekend rush for group seating.', 80, 'Fast & Reliable', 'Select Wall Tables', 50, 'Tranquil Japanese ambient acoustics, gentle water feature, calm conversation', 0, 0, 1, '10% student concession on all matcha and espresso beverages', 1, 0, '10:30 PM', 1, 'https://instagram.com/reel/kuro-coffee-ahmedabad', '@minimal_spaces_in', 'Transport yourself to a Kyoto coffee garden right here in Ahmedabad!', 'The aesthetic is 10/10 clean and photogenic. Great for 3-6 close friends who appreciate serious specialty matcha and pour-overs. Not for loud rowdy game nights, but superb for intimate deep conversations.', 88, 'Tanvi M. (Design & Visual Arts)', 'National Institute of Design (NID)', 'Unbelievably aesthetic lighting for design portfolio shoots and calm coffee chats. Their iced matcha is authentic ceremonial grade.', 'Oct 2026', 142, '["Japanese Minimalist","Ceremonial Matcha","AC","Zen Bonsai","SBR"]', '{"primaryColor":"#16A34A","patternType":"minimal","heroIconName":"Sparkles"}'),
('spot-project-cafe', 'The Project Cafe', 'Art-gallery cafe in a yellow heritage bungalow with botanical courtyard and curated design wares', 'Ahmedabad', 'NID & Polytech (Ambawadi)', 'Ambawadi', '0.9 km (10 min walk from CEPT & L.D. Arts)', 'Study & Projects', 180, 320, 240, 'Iced Vietnamese Drip + Basil Pesto Penne Bowl = ₹245', 'Zomato lists: ₹750 for two', 12, 'Charming heritage courtyard tables surrounded by art installations. Easily joins for groups of 10–12.', 1, 2, 0, 'Walk-ins fine. Outdoor garden gets breezy under the fan misting systems in the afternoon.', 55, 'Fast & Reliable', 'Select Wall Tables', 52, 'Creative discussions, acoustic indie, artistic vibe', 0, 1, 1, '12% discount for NID, CEPT, and Polytech students with ID', 1, 1, '11:00 PM', 1, 'https://instagram.com/reel/the-project-cafe-ambawadi', '@heritage_spaces_amdavad', 'Yellow heritage mansion where every piece of furniture is a piece of art you can buy!', 'The bungalow is genuinely lovely and artistic. Very welcoming staff, creative college crowd, and peaceful ambiance. Highly recommended for group project discussions without background kitchen clatter.', 93, 'Rohan & Dev (Architecture Sem 6)', 'CEPT & NID Student Scouts', 'We sat in the back verandah table for 3.5 hours working on our drafting sheets. Staff gave us iced water refills continuously without nudging us to leave.', 'Oct 2026', 184, '["Ambawadi","Artisan Bungalow","Near Polytech","AC + Garden","Creative Vibe"]', '{"primaryColor":"#D97706","patternType":"warm","heroIconName":"Coffee"}'),
('spot-gnr-teapost', 'Tea Post & Adda Benches', 'Massive open-air garden adda right outside PDPU & GNLU gates with ₹40 ginger pudina chai & bun maska', 'Gandhinagar', 'PDPU, GNLU & DA-IICT', 'Raysan / Bhaijipura', '0.4 km (5 min walk from PDPU main gate)', 'Budget Bite & Chill', 45, 110, 70, 'Pudina Ginger Chai (₹35) + Fresh Bun Maska (₹35) = ₹70', 'Google Maps: ₹150 for two (leaves out tea refills and student puff combos)', 22, 'Sprawling outdoor stone benches and green lawns. Entire college project groups of 15–20 sit together effortlessly.', 1, 0, 0, 'Never needs reservation. Peak student rush is 4:30 PM to 8:00 PM post-lab sessions.', 25, 'Decent for Browsing', 'Select Wall Tables', 66, 'Breezy campus banter, carom boards, acoustic music', 1, 1, 0, 'Direct budget student pricing', 0, 1, '12:30 AM', 1, 'https://instagram.com/reel/pdpu-tea-adda', '@gandhinagar_diaries', 'Fairytale garden chai lounge with gourmet snacks!', 'It is a friendly, relaxed campus garden adda with endless seating. Perfect for evening de-stress sessions with 15 hostel mates without spending over ₹80 each.', 92, 'Siddharth & Megha (PDPU Energy Studies)', 'PDPU Gandhinagar Scout', 'The go-to adda after 5 PM lectures. Never spent more than ₹80 each even after two cups of chai and hot samosas.', 'Oct 2026', 245, '["Gandhinagar","PDPU","GNLU","Under \u20b9100","Mass Group Seating","Late Night"]', '{"primaryColor":"#059669","patternType":"botanical","heroIconName":"Coffee"}'),
('spot-prahladnagar-shakemaker', 'The Shake Maker & Puffs', 'Vibrant outdoor courtyard with thick milkshakes, loaded wedges, and giant group bench tables', 'Ahmedabad', 'Prahladnagar Garden Hub', 'Prahladnagar', '1.8 km (10 min from SG Highway campuses)', 'Budget Bite & Chill', 75, 160, 110, 'Chocolate Brownie Shake + Peri Peri Cheese Puff = ₹115', 'Zomato lists: ₹350 for two', 14, 'Paved garden promenade with wide wooden benches. Great for groups of 8 to 14 friends.', 1, 0, 0, 'Busiest after 8:30 PM. Walk-ins easily find outdoor bench space.', 30, 'Decent for Browsing', 'Few / Request Only', 68, 'Bustling college crowd, music, evening laughter', 0, 1, 1, '10% student concession with college ID card', 0, 1, '1:00 AM', 1, 'https://instagram.com/reel/prahladnagar-shakes', '@amdavad_night_eats', 'Viral mega monster shakes overflowing with chocolate fudge!', 'The thick shakes are genuinely thick and delicious. Prahladnagar Garden breeze makes evening outdoor seating super comfortable for squads of 8+.', 90, 'Aayush M. (Nirma Univ)', 'Nirma University Scout', 'Great spot to catch up with 6-8 friends after coaching or exams. Outdoor seating is relaxed and nobody rushes you.', 'Oct 2026', 165, '["Prahladnagar","Shakes & Puffs","Late Night","Under \u20b9150","Bench Seating"]', '{"primaryColor":"#D97706","patternType":"warm","heroIconName":"Coffee"}'),
('spot-delhi-tomuncle', 'Tom Uncle''s Maggi Point & Adda', 'Legendary DU North Campus outdoor benches with 50+ varieties of masala maggi & cold coffee', 'Delhi NCR', 'DU North Campus (Hindu & Miranda)', 'University Enclave', '0.2 km (3 min walk from Ramjas & Kirori Mal)', 'Budget Bite & Chill', 60, 140, 90, 'Cheese Butter Peri Peri Maggi + Frothy Cold Coffee = ₹95', 'Google Maps: ₹200 for two', 20, 'Open-air stone benches and lawns under leafy trees. Sits mass student batches of 15–20.', 1, 0, 0, 'Never needs booking. Peak rush right after 1 PM and 4 PM lectures.', 20, 'Decent for Browsing', 'None', 72, 'Bustling college debates, political banter, guitar sessions', 0, 1, 0, 'Subsidized student rates', 0, 1, '11:00 PM', 1, 'https://instagram.com/reel/tom-uncle-du', '@du_campus_food', 'The most iconic Maggi in Asia with giant molten cheese pulls!', 'It is a street campus counter with tree-shaded bench seating. Unmatched North Campus vibes for spending under ₹100 with your entire tutorial group.', 96, 'Priya & Varun (Miranda & Hindu College)', 'Delhi University Scout Network', 'The sacred adda of North Campus. Everyone from freshers to alumni gathers here.', 'Oct 2026', 380, '["Delhi NCR","DU North Campus","Under \u20b9100","Mass Group","Iconic Adda"]', '{"primaryColor":"#B45309","patternType":"warm","heroIconName":"Coffee"}'),
('spot-blr-thirdwave', 'Third Wave Coffee & Loft', 'High-ceiling wooden loft with 150 Mbps fiber, multi-laptop charging hubs, and cold brews', 'Bengaluru', 'Christ University & Koramangala', 'Koramangala 4th Block', '0.8 km (10 min from Christ Main Campus)', 'Study & Projects', 180, 350, 240, 'Classic Cold Brew + Sourdough Toast Share = ₹230', 'Zomato lists: ₹800 for two', 12, 'Two 10-seater shared oak project tables with integrated power strips on every table.', 1, 2, 0, 'Arrive by 2 PM for group seating before evening tech crowd.', 150, 'Fast & Reliable', 'Every Table', 46, 'Soft lofi music, clicking keyboards, focused student buzz', 0, 0, 1, '15% student discount on weekday afternoons with college ID', 1, 1, '12:00 AM', 1, 'https://instagram.com/reel/blr-cafe-loft', '@bengaluru_studyspaces', 'Startup paradise where students and founders build billion dollar ideas!', 'WiFi is reliably 140+ Mbps, power plugs work at every seat, and staff leaves you alone for 4 hours. Top tier study hub for college teams.', 95, 'Karthik R. (Christ University MBA)', 'Christ University Scout', 'Finished our semester capstone report here. Sockets never tripped and WiFi was blazing fast.', 'Oct 2026', 210, '["Bengaluru","Koramangala","150 Mbps WiFi","Power Sockets","AC Study"]', '{"primaryColor":"#1D4ED8","patternType":"minimal","heroIconName":"Laptop"}'),
('spot-pune-goodluck', 'Cafe Goodluck & Benches', 'Heritage 1935 Iranian cafe with melt-in-mouth bun maska, sweet chai, and FC Road college buzz', 'Pune', 'Fergusson College (FC Road)', 'Deccan Gymkhana', '0.1 km (1 min walk from Fergusson College Gate)', 'Budget Bite & Chill', 50, 120, 75, 'Bun Maska (₹35) + Special Iranian Chai (₹30) = ₹65', 'Google Maps: ₹250 for two', 16, 'Marble top tables and wooden chairs that staff happily joins for college friend squads.', 1, 0, 0, 'Always walk-in friendly. Quick table turnaround.', 20, 'Spotty', 'None', 72, 'Clattering cups, hearty laughter, lively Pune college debates', 0, 1, 0, 'Subsidized heritage student rates', 0, 1, '11:30 PM', 1, 'https://instagram.com/reel/pune-goodluck-cafe', '@puneri_foodie', 'The century-old bun maska that shaped generations of Pune students!', 'The bun maska really is that soft and buttery. Unbeatable college atmosphere where ₹75 buys you great chai, history, and a table with friends.', 98, 'Tanmay & Gauri (Fergusson College)', 'Fergusson College Scout', 'The heart and soul of FC Road. Post-lecture discussions always happen over Goodluck chai.', 'Oct 2026', 310, '["Pune","FC Road","Fergusson College","Under \u20b9100","Heritage Adda"]', '{"primaryColor":"#78350F","patternType":"warm","heroIconName":"Coffee"}'),
('spot-mumbai-prithvi', 'Prithvi Cafe & Open Courtyard', 'Fairy-lit open courtyard next to Prithvi Theatre with stuffed parathas, Irish coffee, and lively drama squad debates', 'Mumbai', 'Mithibai, NMIMS & Bhavans (Juhu)', 'Juhu', '1.2 km (8 min auto from Mithibai & NMIMS)', 'Aesthetic Hangout', 120, 260, 180, 'Cutting Chai + Aloo Cheese Paratha + Irish Coffee split = ₹175', 'Zomato lists: ₹700 for two', 18, 'Bamboo chairs and wooden tables under giant green trees with fairy lights. Staff accommodates student circles of 10–18.', 1, 0, 0, 'Arrive right at 4:30 PM for easy walk-in seating before evening theatre shows.', 35, 'Decent for Browsing', 'Select Wall Tables', 64, 'Theatre artists rehearsing lines, college laughter, acoustic ambiance', 0, 1, 0, 'Pocket-friendly student menu pricing', 0, 1, '11:00 PM', 1, 'https://instagram.com/reel/prithvi-cafe-juhu', '@mumbai_campus_bites', 'Celeb spotting cafe with ultra luxury coffee!', 'Not pretentiously priced at all. A cup of legendary chai and parathas is around ₹150. Most welcoming creative courtyard in suburban Mumbai.', 94, 'Rhea & Dev (Mithibai BMM)', 'Mithibai College Scout', 'The legendary Juhu college adda. Our whole college festival committee holds briefings here.', 'Oct 2026', 420, '["Mumbai","Juhu","Mithibai","NMIMS","Aesthetic Courtyard","Under \u20b9200"]', '{"primaryColor":"#B45309","patternType":"warm","heroIconName":"Coffee"}'),
('spot-mumbai-candies', 'Candies @ Pali Hill (Mac Craig)', 'Multi-storey Portuguese villa with mosaic tile terraces, ₹110 iced teas, mini chicken rolls, and sprawling squad rooms', 'Mumbai', 'St. Andrews & National College (Bandra)', 'Bandra West', '0.6 km (5 min walk from St. Andrews)', 'Aesthetic Hangout', 110, 240, 160, 'Iced Lemon Tea (₹90) + Chicken/Paneer Puff (₹60) = ₹150', 'Google Maps: ₹650 for two', 24, '4 floors of mosaic stepped seating, cozy garden rooms, and breezy rooftop sun decks. Fits 20+ students easily.', 1, 4, 0, 'Walk up to the 3rd floor terrace for the emptiest big tables and best sea breeze.', 40, 'Decent for Browsing', 'Select Wall Tables', 58, 'Breezy multi-tier conversation, music, leafy greenery', 1, 1, 1, 'Special after-8-PM half-price bakery clearance on selected pastries', 1, 0, '10:00 PM', 1, 'https://instagram.com/reel/candies-bandra', '@sobo_suburban_eats', 'Viral Portuguese mansion cafe where you will get lost!', 'It genuinely feels like a Mediterranean villa maze. Perfect self-service counter where budget bites like rolls and iced tea cost under ₹150.', 97, 'Arjun S. (St. Xavier’s / Bandra)', 'Bandra Student Network', 'Unmatched scale. You can sit with 15 friends on the terrace and never get asked to order more.', 'Oct 2026', 365, '["Mumbai","Bandra","Villa Terrace","Under \u20b9200","Mass Group Seating"]', '{"primaryColor":"#059669","patternType":"botanical","heroIconName":"Coffee"}');

-- -----------------------------------------------------------------------------
-- 5. Seed Data for survey_responses
-- -----------------------------------------------------------------------------
INSERT INTO `survey_responses` (`id`, `student_name`, `college_or_campus`, `year_of_study`, `monthly_hangout_budget`, `primary_frustration`, `worst_experience_with_apps`, `ideal_spot_priorities_json`, `max_acceptable_cost_per_head`, `average_group_size`, `submitted_at`) VALUES
('srv-1', 'Dhruv Trivedi', 'CEPT University', '3rd Year Architecture', '₹2,500 - ₹4,000', 'Hidden Service Charges & GST', 'Food app said ₹400 for two, but when 6 of us went, the bill was ₹3,400 due to mandatory platters.', '["Honest per-head bill","Can push tables together","Fast WiFi for CAD/Render files"]', 250, 7, '2026-10-18'),
('srv-2', 'Kinjal Parikh', 'Ahmedabad University (AMSOM)', '2nd Year BBA', '₹1,500 - ₹2,500', 'Reel Aesthetic vs Seating Reality', 'Reel showed huge couch for groups. We reached and were told table is reserved for ₹3000 minimum spend.', '["Guaranteed group tables","True student pricing","Outside birthday cake allowed"]', 200, 8, '2026-10-21'),
('srv-3', 'Yashraj Vaghela', 'Nirma University (IT)', '4th Year B.Tech', '₹2,000 - ₹3,000', 'Dead WiFi & zero power outlets', 'Went for a coding sprint with 5 friends. Only 1 plug point in the entire cafe and manager unplugged our strip.', '["Plug at every table","Tested 50+ Mbps WiFi","Zero disturbance from staff"]', 180, 5, '2026-10-24');

-- -----------------------------------------------------------------------------
-- 6. Seed Data for partnership_proposals
-- -----------------------------------------------------------------------------
INSERT INTO `partnership_proposals` (`id`, `cafe_name`, `owner_name`, `contact_email`, `contact_phone`, `address`, `proposed_per_person_cost`, `group_capacity`, `offered_student_discount`, `has_fast_wifi`, `notes`, `status`, `submitted_at`) VALUES
('part-1', 'Zen Cafe @ Amdavad ni Gufa', 'Ketan Shah', 'zencafe.amdavad@gmail.com', '+91 98250 12345', 'Opposite CEPT University, University Area, Navrangpura', 160, 18, 'Free iced tea upgrade for student groups on weekdays before 5 PM', 1, 'We love student art discussions under the neem trees.', 'verified_active', '2026-10-20'),
('part-2', 'Mocha Cafe & Cabanas', 'Nirav Parekh', 'mocha.ahmedabad@gmail.com', '+91 99099 87654', 'Opposite Rajpath Club, Bodakdev / SBR', 330, 16, 'Free garlic pull-apart bread plate + zero outside cake fee for groups of 6+ with college ID', 1, 'Dedicated student birthday squad cabanas with zero cake-cutting charges.', 'verified_active', '2026-10-22');
