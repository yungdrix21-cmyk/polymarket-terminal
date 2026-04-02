import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://njodnertiscjcxdssyat.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qb2RuZXJ0aXNjamN4ZHNzeWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjc1ODYsImV4cCI6MjA5MDY0MzU4Nn0.VPaBdBnHvW-yGth-U7SSIpywnJGiQVZtP6E3WRUaQJg'

export const supabase = createClient(supabaseUrl, supabaseKey)