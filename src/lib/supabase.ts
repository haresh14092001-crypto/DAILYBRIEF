import { createClient } from '@supabase/supabase-js';

// We use an empty string fallback so the app still completely builds in CI/Netlify checks
// without crashing, although data fetches will fail until keys are inputted.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
