-- Alacard Arena Database Migration
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/ngmflfioyfefmxwtayyk/sql

-- 1. Create UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  share_id TEXT UNIQUE NOT NULL,
  model_a TEXT NOT NULL,
  model_b TEXT NOT NULL,
  system_prompt TEXT,
  prompts JSONB NOT NULL,
  outputs JSONB,           -- { items: [{prompt, a, b, a_ms, b_ms}] }
  scoring JSONB,           -- { winner: 'A'|'B'|'tie', votes: {...}, rubric: {...} }
  meta JSONB               -- { client_version, notes, recipe: { models: [model_a, model_b], prompts: [p1,p2,p3], title, emoji } }
);

-- 3. Create index for fast lookups
CREATE INDEX IF NOT EXISTS matches_share_idx ON public.matches(share_id);

-- 4. Disable RLS for sprint (anonymous access)
ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT ALL ON public.matches TO authenticated;
GRANT ALL ON public.matches TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 6. Verify table creation
SELECT 'matches table created successfully' as status;

-- 7. Show table structure
\d public.matches;