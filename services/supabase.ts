import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * Ensure your SUPABASE_URL and SUPABASE_ANON_KEY are set in your environment.
 */

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
  console.error(
    "Supabase Configuration Error: Invalid or missing SUPABASE_URL. " +
    "The 'Failed to fetch' error is likely caused by an invalid project URL."
  );
}

// We export a function to check if the client is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://your-project-id.supabase.co';
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url-please-set-env.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
