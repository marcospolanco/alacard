create extension if not exists pgcrypto;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  share_id text unique not null,
  model_a text not null,
  model_b text not null,
  system_prompt text,
  prompts jsonb not null,
  outputs jsonb,
  scoring jsonb,
  meta jsonb
);

create index if not exists matches_share_idx on public.matches(share_id);

