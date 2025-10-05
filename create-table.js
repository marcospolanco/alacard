const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = 'https://ngmflfioyfefmxwtayyk.supabase.co'
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in your .env file')
}

const supabase = createClient(supabaseUrl, serviceKey)

async function createTable() {
  console.log('Creating matches table...')

  try {
    // Method 1: Try direct SQL via PostgreSQL client emulation
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'matches')
      .single()

    if (error && error.code === 'PGRST116') {
      console.log('Table does not exist, need to create it via SQL Editor')
      console.log('Please run the following SQL in your Supabase SQL Editor:')
      console.log('\n--- COPY FROM HERE ---')

      const sql = `
-- Create extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create matches table
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

-- Create index
CREATE INDEX IF NOT EXISTS matches_share_idx ON public.matches(share_id);

-- Disable RLS for sprint
ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.matches TO authenticated;
GRANT ALL ON public.matches TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verify creation
SELECT 'Table created successfully' as result;
      `

      console.log(sql)
      console.log('--- COPY TO HERE ---')
      console.log('\nSQL Editor URL: https://app.supabase.com/project/ngmflfioyfefmxwtayyk/sql')

    } else if (data) {
      console.log('✅ Table already exists!')

      // Test table access
      const { data: testData, error: testError } = await supabase
        .from('matches')
        .select('count')
        .limit(1)

      if (testError) {
        console.log('❌ Table access test failed:', testError.message)
      } else {
        console.log('✅ Table is accessible!')
      }
    }

  } catch (error) {
    console.error('Error:', error.message)
  }
}

createTable()