import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://avxgduktxkorwfmccwbs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2eGdkdWt0eGtvcndmbWNjd2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NDYyNTYsImV4cCI6MjA1MDEyMjI1Nn0.1cxWtJ4-UOq2S2X0Nsw82EFTscaD3dgsysK7p4RwE54";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_PUBLISHABLE_KEY
    },
  },
});