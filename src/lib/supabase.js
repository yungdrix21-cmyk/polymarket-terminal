import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://njodnertiscjcxdssyat.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qb2RuZXJ0aXNjamN4ZHNzeWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjc1ODYsImV4cCI6MjA5MDY0MzU4Nn0.VPaBdBnHvW-yGth-U7SSIpywnJGiQVZtP6E3WRUaQJg'

// Prevent multiple instances in React Strict Mode
const globalKey = '__supabase_client__'
if (!window[globalKey]) {
  window[globalKey] = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      lock: 'none', // disable lock to prevent Strict Mode conflicts
    },
  })
}

export const supabase = window[globalKey]