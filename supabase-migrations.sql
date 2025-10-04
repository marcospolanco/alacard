-- Supabase migration for Alacard Arena
-- Create extension for UUID generation
create extension if not exists pgcrypto;

-- Create matches table for storing model comparisons
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  share_id text unique not null,
  model_a text not null,
  model_b text not null,
  system_prompt text,
  prompts jsonb not null,
  outputs jsonb,           -- { items: [{prompt, a, b, a_ms, b_ms}] }
  scoring jsonb,           -- { winner: 'A'|'B'|'tie', votes: {...}, rubric: {...} }
  meta jsonb               -- { client_version, notes, recipe: { models: [model_a, model_b], prompts: [p1,p2,p3], title, emoji } }
);

-- Create index for fast share_id lookups
create index if not exists matches_share_idx on public.matches(share_id);

-- Disable RLS for sprint (anonymous access)
alter table public.matches disable row level security;