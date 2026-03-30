import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://ajbrgoxsfjcnnomcqrfq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqYnJnb3hzZmpjbm5vbWNxcmZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzY1NjgsImV4cCI6MjA5MDQ1MjU2OH0.NiQe4qIelZG6EJYkG-Y7haAmlrDT6i00ueAn3s6BpMA'
)