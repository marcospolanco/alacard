-- Initial migration for Alacard Arena
-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create matches table for storing model comparisons
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

-- Create index for fast share_id lookups
CREATE INDEX IF NOT EXISTS matches_share_idx ON public.matches(share_id);

-- Disable RLS for sprint (anonymous access)
ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.matches TO authenticated;
GRANT ALL ON public.matches TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;