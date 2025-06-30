import { supabase } from '../lib/supabase';

// Debug utility to test database operations
export async function testVideosTable() {
  try {
    console.log('Testing videos table...');
    
    // Test 1: Check if videos table exists and we can select from it
    const { data: testSelect, error: selectError } = await supabase
      .from('videos')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('Error selecting from videos table:', selectError);
      if (selectError.code === 'PGRST116') {
        console.error('❌ Table "videos" does not exist or we do not have permission to access it');
      } else if (selectError.code === '42P01') {
        console.error('❌ Table "videos" does not exist');
      }
      
      // Let's try to see what tables DO exist
      console.log('Checking what tables exist...');
      
      // Try common table names that might exist
      const tables = ['audio_posts', 'profiles', 'users'];
      for (const tableName of tables) {
        try {
          const { error } = await supabase.from(tableName).select('*').limit(1);
          if (!error) {
            console.log(`✅ Table "${tableName}" exists`);
          }
        } catch {
          console.log(`❌ Table "${tableName}" does not exist`);
        }
      }
      
      return false;
    }
    
    console.log('✅ Videos table exists and is accessible');
    console.log('Sample data from videos table:', testSelect);
    
    // Test 2: Get current user to test with valid user_id
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('No authenticated user for testing:', userError);
      return false;
    }
    
    console.log('Current user ID:', user.id);
    
    // Test 3: Try to insert a minimal test record with real user
    const testData = {
      user_id: user.id,
      title: 'Test Video',
      script: 'Test script'
    };
    
    console.log('Attempting minimal test insert with data:', testData);
    
    const { data: insertTest, error: insertError } = await supabase
      .from('videos')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting test record:', insertError);
      console.error('Error details:', {
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
        message: insertError.message
      });
      return false;
    }
    
    console.log('✅ Test insert successful:', insertTest);
    
    // Clean up test record
    const { error: deleteError } = await supabase
      .from('videos')
      .delete()
      .eq('id', insertTest.id);
    
    if (deleteError) {
      console.warn('Could not clean up test record:', deleteError);
    }
    
    console.log('✅ Database test completed successfully');
    return true;
    
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
}

// Function to check database schema
export async function checkVideosSchema() {
  try {
    // Since we can't use RPC functions that don't exist, 
    // let's just try to get column information by doing a select with limit 0
    const { error } = await supabase
      .from('videos')
      .select('*')
      .limit(0);
    
    if (error) {
      console.error('Could not fetch schema info:', error);
    } else {
      console.log('Videos table accessible, no errors');
    }
  } catch (err) {
    console.log('Schema check not available:', err);
  }
}
