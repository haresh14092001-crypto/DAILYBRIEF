-- Supabase Setup Script for Personal Intelligence System

-- 1. Create Activities Table
CREATE TABLE activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  title text NOT NULL,
  content text,
  url text,
  tag text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Startup Ideas Table
CREATE TABLE startup_ideas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  global_concept text,
  local_adaptation text,
  market_entry text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Row Level Security (RLS) Policies
-- This ensures that only you (the authenticated user) can read or write your data.
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own activities" ON activities
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can only delete their own activities" ON activities
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own ideas" ON startup_ideas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own ideas" ON startup_ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
