import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pzvjqrjcbnnjitjtjjba.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dmpxcmpjYm5uaml0anRqamJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNjM4NjUsImV4cCI6MjA1MTczOTg2NX0.r4hxhSrUkAnpnI1nXPDV4gBBluPujHCxVkgnkLl-dhE";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    }
  }
);