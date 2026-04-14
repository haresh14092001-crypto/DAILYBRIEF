-- Supabase Ultimate Schema for Intelligence OS v1.0

-- 1. CLEANUP (Optional: Only run if you want to reset)
-- DROP TABLE IF EXISTS activities, clinical_notes, startup_problems, content_posts;

-- 2. Activities Table (The Home Feed)
CREATE TABLE activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL, -- note, link, idea, opportunity
  title text NOT NULL,
  content text,
  url text,
  tag text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Clinical Notes (Study Zone)
CREATE TABLE clinical_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  subject text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  is_high_yield boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Startup Problems (Agadham War Room)
CREATE TABLE startup_problems (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  category text NOT NULL, -- Corporate/Venture, Agadham/Local
  target text, -- Small Animal, Cattle, Buffalo
  title text NOT NULL,
  desc text,
  impact text, -- Critical, High, Medium, Low
  status text, -- Market Gap, Validated, etc.
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Content Posts (Maatu Doctor Hub)
CREATE TABLE content_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL, -- ICAR MCQ, Storytelling, Venture
  title text NOT NULL,
  status text DEFAULT 'Planned', -- Planned, Posted
  performance text,
  reach_score integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SECURITY: Enable RLS on all tables
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;

-- 7. ACCESS POLICIES: 100% Private Access
-- Replace table names for each policy block
DO $$ 
DECLARE 
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
  LOOP
    EXECUTE format('CREATE POLICY "Owner access only" ON %I USING (auth.uid() = user_id);', t);
  END LOOP;
END $$;
