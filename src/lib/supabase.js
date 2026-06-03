import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.warn(
    'Supabase env vars not set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY). ' +
    'Create a .env file from .env.example and fill in your project values.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnon || '');
