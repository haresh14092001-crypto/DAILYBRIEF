-- Master Intelligence Ingestion: Phase 8 (Surgical Precision)

-- 1. STARTUP PROBLEMS (AGADHAM WAR ROOM)
INSERT INTO startup_problems (user_id, category, target, title, desc, impact, status) VALUES
((SELECT id FROM auth.users LIMIT 1), 'Corporate/Venture', 'Small Animal', 'AI Diagnostic Trust Gap', 'Clinicians are skeptical of AI-only diagnosis. Opportunity: "Human-in-the-loop" AI verification platform for Tier-1 practices.', 'Critical', 'Market Gap'),
((SELECT id FROM auth.users LIMIT 1), 'Corporate/Venture', 'General', 'Veterinary Professional Deficit', 'Only 68k qualified vets for a 120k need. Opportunity: Scaling paravet certification through mobile micro-learning.', 'High', 'Validated'),
((SELECT id FROM auth.users LIMIT 1), 'Agadham/Local', 'Cattle', 'The Milk Productivity Paradox', 'India is #1 in milk but low in yield per animal. Gaps found in Fodder logistics (40% cost hike in 2026).', 'High', 'Critical Focus'),
((SELECT id FROM auth.users LIMIT 1), 'Agadham/Local', 'Buffalo', 'Dystocia Response Latency', 'High calf mortality in rural TN due to 4+ hour response times for calving emergencies.', 'Critical', 'Execution Ready');

-- 2. CLINICAL MASTERY (STUDY ZONE)
INSERT INTO clinical_notes (user_id, subject, title, content, is_high_yield) VALUES
((SELECT id FROM auth.users LIMIT 1), 'Veterinary Medicine', 'Metabolic Diseases: The Ketosis Triad', 'Focus on 2026 ICAR PG: Hallmark is Hypoglycemia, Hyperketonemia, and Ketonuria. Treatment: 50% Dextrose + Glucocorticoids.', true),
((SELECT id FROM auth.users LIMIT 1), 'Veterinary Surgery', 'Anaesthesia: Monitoring Volatile Concentration', 'MAC (Minimum Alveolar Concentration) remains the gold standard for potency. Note the effect of age and temperature on MAC.', true),
((SELECT id FROM auth.users LIMIT 1), 'Veterinary Pharmacology', 'Pharmacokinetics: Passive vs Active', '90% of drugs follow Passive Diffusion. Active transport requires ATP and is Saturable (Zero-order kinetics at high doses).', true);

-- 3. CONTENT POSTS (MAATU DOCTOR HUB)
INSERT INTO content_posts (user_id, type, title, status, performance) VALUES
((SELECT id FROM auth.users LIMIT 1), 'ICAR MCQ', 'MCQ: Milk Fever Stages & Calcium Logic', 'Planned', ''),
((SELECT id FROM auth.users LIMIT 1), 'Clinical Storytelling', 'The Case of the Silent Choke (Bovine)', 'Planned', ''),
((SELECT id FROM auth.users LIMIT 1), 'Venture', 'Profit Analysis: Mobile Clinics vs Fixed Centers', 'Planned', '');

-- 4. HOME FEED (ACTIVITIES)
INSERT INTO activities (user_id, type, title, content, tag) VALUES
((SELECT id FROM auth.users LIMIT 1), 'opportunity', 'Venture: Smart Wearables for Livestock', 'Predictive activity tracking can alert 48 hours before clinical Mastitis onset.', 'Venture'),
((SELECT id FROM auth.users LIMIT 1), 'note', 'Clinical: Pyometra Emergency Protocol', 'Ovariohysterectomy is the absolute recommendation for open/closed cervix cases.', 'Clinical');
