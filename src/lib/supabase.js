import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.envhttps://njodnertiscjcxdssyat.supabase.co,
  import.meta.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
  {
    auth: {
      persistSession: true,
      storageKey: 'polytrader-auth',  // unique key prevents lock conflicts
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
)