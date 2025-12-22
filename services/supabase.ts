
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * Project: PingSpace (hlvzzjbjrvhxwadrzceg)
 */

const supabaseUrl = 'https://hlvzzjbjrvhxwadrzceg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdnp6amJqcnZoeHdhZHJ6Y2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzMzQxMzAsImV4cCI6MjA4MTkxMDEzMH0.uBJJpWDQWbNg6zOnRSc6oCOPERX65Qh5nSFWK2umOCY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => true;
