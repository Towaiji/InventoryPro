import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ssoeojzfvzlxnsnuqtea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzb2VvanpmdnpseG5zbnVxdGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1NTIwNTAsImV4cCI6MjA2NDEyODA1MH0._PVOTszdcZbY7DiVVwJVLgMINt9D9ZUNbXoSsHEvljg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);