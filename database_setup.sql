-- ============================================================
--  VetDesk Intelligence OS — Supabase Schema + Seed Data
--  Paste this entire file into Supabase SQL Editor and Run
-- ============================================================

-- ─── 1. ENABLE UUID EXTENSION ────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─── 2. CREATE TABLES ────────────────────────────────────────

-- Activities (Home Feed captures)
CREATE TABLE IF NOT EXISTS public.activities (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'note',  -- note | link | idea | opportunity | alert
  title       TEXT NOT NULL,
  content     TEXT,
  url         TEXT,
  tag         TEXT DEFAULT 'Inbox',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Startup Problems (Agadham War Room)
CREATE TABLE IF NOT EXISTS public.startup_problems (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category    TEXT,                           -- Corporate/Venture | Agadham/Local
  target      TEXT,                           -- Small Animal | Cattle | General
  title       TEXT NOT NULL,
  description TEXT,
  impact      TEXT DEFAULT 'Medium',          -- Critical | High | Medium | Low
  status      TEXT DEFAULT 'Validation Phase',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content Posts (Maatu Doctor Pipeline / Hub)
CREATE TABLE IF NOT EXISTS public.content_posts (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'Study Snippet', -- ICAR MCQ | Clinical Storytelling | Venture | Study Snippet
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'Planned',       -- Planned | Posted
  performance TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clinical Notes (Study Zone)
CREATE TABLE IF NOT EXISTS public.clinical_notes (
  id            BIGSERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject       TEXT,                         -- e.g. Veterinary Medicine
  title         TEXT NOT NULL,
  content       TEXT,
  is_high_yield BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── 3. ROW LEVEL SECURITY ────────────────────────────────────

ALTER TABLE public.activities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes   ENABLE ROW LEVEL SECURITY;

-- activities
CREATE POLICY "Users see own activities"
  ON public.activities FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- startup_problems
CREATE POLICY "Users see own problems"
  ON public.startup_problems FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- content_posts
CREATE POLICY "Users see own posts"
  ON public.content_posts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- clinical_notes
CREATE POLICY "Users see own notes"
  ON public.clinical_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─── 4. INDEXES (for speed) ──────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_activities_user       ON public.activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_problems_user         ON public.startup_problems(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user            ON public.content_posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user            ON public.clinical_notes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_subject         ON public.clinical_notes(user_id, subject);


-- ─── 5. SEED DATA (runs only if the table is empty) ──────────
--  Wrapped in a DO block so it doesn't re-insert on re-runs.

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Grab the first signed-up user (you, Haresh)
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;

  -- Only seed if this user has no data yet
  IF v_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.startup_problems WHERE user_id = v_user_id
  ) THEN

    -- STARTUP PROBLEMS (Agadham War Room)
    INSERT INTO public.startup_problems (user_id, category, target, title, description, impact, status) VALUES
      (v_user_id, 'Corporate/Venture', 'Small Animal',
       'AI Diagnostic Trust Gap',
       'Clinicians are skeptical of AI-only diagnosis. Opportunity: Human-in-the-loop AI verification platform for Tier-1 practices.',
       'Critical', 'Market Gap'),
      (v_user_id, 'Corporate/Venture', 'General',
       'Fragmented Clinic Tech Stack',
       'Clinics use 5–7 apps for scheduling, payroll, and PCR that don''t talk to each other. Opportunity: Workflow-first OS for clinics.',
       'Critical', 'Validated'),
      (v_user_id, 'Agadham/Local', 'Cattle & Buffalo',
       '9PM–6AM Emergency Blackout',
       'Zero reliable emergency vet access in rural TN during peak calving hours. High mortality from dystocia.',
       'Critical', 'Validated'),
      (v_user_id, 'Agadham/Local', 'Cattle',
       'Milk Productivity Paradox',
       'India is #1 in milk production but low in yield per animal. 40% fodder cost hike in 2026. Logistics gap is the lever.',
       'High', 'Critical Focus');

    -- CONTENT POSTS (Maatu Doctor Pipeline)
    INSERT INTO public.content_posts (user_id, type, title, status, performance) VALUES
      (v_user_id, 'ICAR MCQ',            'MCQ: Bovine Ketosis Hallmark & Triad',                 'Planned', ''),
      (v_user_id, 'Clinical Storytelling','The Case of the Silent Choke (Bovine #104)',           'Planned', ''),
      (v_user_id, 'ICAR MCQ',            'MCQ: MAC Potency & Anaesthesia Monitoring',            'Planned', ''),
      (v_user_id, 'Venture',             'Revenue: Mobile Clinics vs Fixed Centers 2026',         'Planned', ''),
      (v_user_id, 'ICAR MCQ',            'MCQ: Milk Fever Stages & Calcium Therapy Logic',       'Planned', '');

    -- CLINICAL NOTES (Study Zone)
    INSERT INTO public.clinical_notes (user_id, subject, title, content, is_high_yield) VALUES
      (v_user_id, 'Veterinary Medicine',
       'Metabolic: Ketosis Pathophysiology',
       'HALLMARK: Hypoglycemia + Hyperketonemia + Ketonuria. Secondary ketosis more common than primary. Tx: 50% Dextrose IV + Glucocorticoids.',
       TRUE),
      (v_user_id, 'Veterinary Surgery & Radiology',
       'Anaesthesia: MAC & Volatile Agents',
       'MAC = Minimum Alveolar Concentration = gold standard for potency. Decreases with age, hypothermia, opioids. Increases with hyperthermia.',
       TRUE),
      (v_user_id, 'Veterinary Pharmacology & Toxicology',
       'Pharmacokinetics: Passive vs Active Transport',
       '90% of drugs use Passive Diffusion. Active transport requires ATP, is saturable → Zero-order kinetics at high doses.',
       TRUE),
      (v_user_id, 'Veterinary Gynaecology & Obstetrics',
       'Dystocia: Emergency Protocol',
       'Assess fetal viability first. Lubrication + correction of malposture. If unresolvable: C-section. Reduce time-to-intervention.',
       TRUE);

    -- HOME FEED (Activity log)
    INSERT INTO public.activities (user_id, type, title, content, tag) VALUES
      (v_user_id, 'opportunity',
       'Venture Opportunity: AI Triage Platform',
       'Ingested intelligence on Small Animal Corporate Tech Gaps. Trust gap = product entry point.',
       'Venture'),
      (v_user_id, 'note',
       'Study Seed: Bovine Ketosis Triad',
       'High-yield clinical protocol added to Study Zone. ICAR PG exam priority.',
       'Study'),
      (v_user_id, 'idea',
       'Distribution Idea: WhatsApp-first booking for rural vets',
       'Low-cost entry for Agadham clinics. No app download needed. SMS fallback for network-poor areas.',
       'Agadham');

  END IF;
END $$;


-- ─── 6. VERIFY (optional check — remove before final run) ────
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
