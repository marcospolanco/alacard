#!/bin/bash

# Alacard Database Setup Script
# Usage: ./setup-database.sh <SUPABASE_URL> <SERVICE_ROLE_KEY>

if [ $# -ne 2 ]; then
    echo "Usage: $0 <SUPABASE_URL> <SERVICE_ROLE_KEY>"
    echo "Example: $0 https://ngmflfioyfefmxwtayyk.supabase.co your-service-role-key"
    exit 1
fi

SUPABASE_URL="$1"
SERVICE_KEY="$2"

echo "Setting up Alacard database schema for project: $SUPABASE_URL"

# SQL statements
SQL='
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  share_id TEXT UNIQUE NOT NULL,
  model_a TEXT NOT NULL,
  model_b TEXT NOT NULL,
  system_prompt TEXT,
  prompts JSONB NOT NULL,
  outputs JSONB,
  scoring JSONB,
  meta JSONB
);

CREATE INDEX IF NOT EXISTS matches_share_idx ON public.matches(share_id);

ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;

GRANT ALL ON public.matches TO authenticated;
GRANT ALL ON public.matches TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
'

# Execute SQL via Supabase REST API
echo "Executing SQL migration..."
RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": $(echo "$SQL" | jq -Rs .)}")

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo "Response: $RESPONSE"
else
    echo "❌ Migration failed"
    echo "Response: $RESPONSE"
    exit 1
fi

# Test table creation
echo "Testing table access..."
TEST_RESPONSE=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/matches?select=count&limit=1" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}")

if [ $? -eq 0 ]; then
    echo "✅ Table is accessible!"
    echo "Test response: $TEST_RESPONSE"
else
    echo "❌ Table access test failed"
    echo "Test response: $TEST_RESPONSE"
fi

echo "Database setup complete!"