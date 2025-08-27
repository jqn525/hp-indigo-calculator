#!/usr/bin/env node

// Database Migration Script
// Adds missing columns to quotes table: department, assigned_by

const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from js/supabase.js
const SUPABASE_URL = 'https://kmbwfonentsqnjraukid.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttYndmb25lbnRzcW5qcmF1a2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjI0MDYsImV4cCI6MjA2ODc5ODQwNn0.sdnHp4wUGMF6JP2_UtnPYu6FLWlUJ3Ub1PybpINuNEo';

async function runMigration() {
  console.log('🚀 Starting database migration...');
  
  // Initialize Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    console.log('📡 Connected to Supabase project: kmbwfonentsqnjraukid');
    
    // Execute the ALTER TABLE statements
    const alterSQL = `
      -- Add department and assigned_by columns to quotes table
      ALTER TABLE public.quotes 
      ADD COLUMN IF NOT EXISTS department TEXT,
      ADD COLUMN IF NOT EXISTS assigned_by TEXT;
    `;
    
    console.log('🔧 Executing ALTER TABLE migration...');
    console.log('SQL:', alterSQL);
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: alterSQL 
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      
      // Try alternative approach using raw SQL
      console.log('🔄 Trying alternative approach...');
      
      // Check current table structure first
      const { data: tableInfo, error: tableError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'quotes')
        .eq('table_schema', 'public');
      
      if (tableError) {
        console.error('❌ Cannot check table structure:', tableError);
        return false;
      }
      
      console.log('📋 Current quotes table columns:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
      
      const hasDepartment = tableInfo.some(col => col.column_name === 'department');
      const hasAssignedBy = tableInfo.some(col => col.column_name === 'assigned_by');
      
      if (hasDepartment && hasAssignedBy) {
        console.log('✅ Columns already exist! Migration not needed.');
        return true;
      }
      
      console.error('❌ Columns missing and migration failed. Manual intervention required.');
      console.log('🔧 Please run this SQL in your Supabase dashboard:');
      console.log(alterSQL);
      return false;
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Verify the changes
    const { data: verifyData, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'quotes')
      .eq('table_schema', 'public')
      .in('column_name', ['department', 'assigned_by']);
    
    if (verifyError) {
      console.warn('⚠️ Could not verify migration:', verifyError);
    } else {
      console.log('📋 Verified new columns:');
      verifyData.forEach(col => {
        console.log(`  ✓ ${col.column_name}: ${col.data_type}`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return false;
  }
}

// Run the migration
runMigration()
  .then(success => {
    if (success) {
      console.log('🎉 Migration completed successfully!');
      console.log('📱 You can now test quote saving/loading functionality.');
      process.exit(0);
    } else {
      console.log('❌ Migration failed. Please check the output above.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });