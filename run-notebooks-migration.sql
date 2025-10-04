-- Alacard Notebook Generator Database Migration
-- Run this SQL in your Supabase SQL Editor: https://app.supabase.com/project/ngmflfioyfefmxwtayyk/sql

-- 1. Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create notebooks table
CREATE TABLE IF NOT EXISTS public.notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  share_id TEXT UNIQUE NOT NULL,
  hf_model_id TEXT NOT NULL,
  notebook_content JSONB NOT NULL,
  metadata JSONB,
  download_count INTEGER DEFAULT 0
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS notebooks_share_idx ON public.notebooks(share_id);
CREATE INDEX IF NOT EXISTS notebooks_model_idx ON public.notebooks(hf_model_id);
CREATE INDEX IF NOT EXISTS notebooks_created_idx ON public.notebooks(created_at DESC);

-- 4. Disable RLS for sprint (anonymous access)
ALTER TABLE public.notebooks DISABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT ALL ON public.notebooks TO authenticated;
GRANT ALL ON public.notebooks TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 6. Verify table creation
SELECT 'notebooks table created successfully' as status;

-- 7. Show table structure
\d public.notebooks;