import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://avxgduktxkorwfmccwbs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2eGdkdWt0eGtvcndmbWNjd2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDMyODk2MDAsImV4cCI6MjAxODg2NTYwMH0.1LJjrHxMvZzHk_GBB8-3iWbxJQKXF9Hxf1xDQBPFVeI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});