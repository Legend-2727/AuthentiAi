import { supabase } from '../lib/supabase';

// Function to create the videos table if it doesn't exist
export async function createVideosTable() {
  try {
    console.log('Creating videos table...');
    
    // SQL to create the videos table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS videos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        script TEXT NOT NULL,
        video_url TEXT,
        status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'generating')),
        replica_id TEXT,
        replica_type TEXT CHECK (replica_type IN ('user', 'system')),
        tavus_video_id TEXT,
        tags TEXT[] DEFAULT '{}',
        thumbnail_url TEXT,
        duration INTEGER,
        generation_type TEXT NOT NULL DEFAULT 'upload' CHECK (generation_type IN ('personal_replica', 'stock_replica', 'upload')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('Error creating videos table:', error);
      return false;
    }
    
    console.log('✅ Videos table created successfully');
    
    // Create indexes
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
      CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
      CREATE INDEX IF NOT EXISTS idx_videos_generation_type ON videos(generation_type);
      CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
    `;
    
    const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSQL });
    
    if (indexError) {
      console.warn('Could not create indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully');
    }
    
    return true;
    
  } catch (error) {
    console.error('Failed to create videos table:', error);
    return false;
  }
}

// Function to check if we can execute SQL
export async function testSQLExecution() {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1 as test;' });
    
    if (error) {
      console.error('Cannot execute SQL:', error);
      return false;
    }
    
    console.log('✅ SQL execution available:', data);
    return true;
    
  } catch (error) {
    console.error('SQL execution test failed:', error);
    return false;
  }
}
