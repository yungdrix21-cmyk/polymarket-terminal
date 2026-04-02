import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://njodnertiscjcxdssyat.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  {
    auth: {
      persistSession: true,
      storageKey: 'polytrader-auth',
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)