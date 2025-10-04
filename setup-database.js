const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function setupDatabase() {
  console.log('Setting up Alacard database schema...')

  try {
    // Create extension
    console.log('Creating pgcrypto extension...')
    await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS pgcrypto;'
    })

    // Create matches table
    console.log('Creating matches table...')
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    if (tableError) {
      console.error('Error creating table:', tableError)
      return
    }

    // Create index
    console.log('Creating index on share_id...')
    await supabase.rpc('exec_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS matches_share_idx ON public.matches(share_id);'
    })

    // Disable RLS
    console.log('Disabling RLS...')
    await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;'
    })

    // Grant permissions
    console.log('Setting permissions...')
    await supabase.rpc('exec_sql', {
      sql: `
        GRANT ALL ON public.matches TO authenticated;
        GRANT ALL ON public.matches TO anon;
        GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
      `
    })

    console.log('✅ Database setup completed successfully!')

    // Test the setup
    console.log('Testing table creation...')
    const { data, error } = await supabase
      .from('matches')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ Test failed:', error)
    } else {
      console.log('✅ Table is accessible!')
    }

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupDatabase()