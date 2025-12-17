// Supabase Configuration
// This file initializes the Supabase client for SFU Document Solutions

// Supabase credentials - these are public keys safe to include in client-side code
// Anonymous keys are designed to be public and don't expose sensitive data
const SUPABASE_URL = 'https://kmbwfonentsqnjraukid.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttYndmb25lbnRzcW5qcmF1a2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMjI0MDYsImV4cCI6MjA2ODc5ODQwNn0.sdnHp4wUGMF6JP2_UtnPYu6FLWlUJ3Ub1PybpINuNEo';

// Check if we're using placeholder values
if (SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('⚠️ Supabase credentials not configured. Please update js/supabase.js with your project details.');
  console.warn('Visit https://app.supabase.com to create a project and get your credentials.');
}

// Initialize Supabase client
let supabase = null;

// Only initialize if we have valid credentials
if (SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {
  // Load Supabase from CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.47.10';
  script.onload = () => {
    // Initialize client after script loads
    const { createClient } = window.supabase;
    window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    
    console.log('✅ Supabase client initialized');
    
    // Dispatch event to notify other scripts
    window.dispatchEvent(new Event('supabaseReady'));
  };
  document.head.appendChild(script);
} else {
  // Fallback mode - app works without Supabase
  console.log('📱 Running in offline mode - Supabase not configured');
  window.supabaseClient = null;
}

// Helper function to check if Supabase is available
function isSupabaseConfigured() {
  return window.supabaseClient !== null;
}

// Export for use in other modules
window.isSupabaseConfigured = isSupabaseConfigured;