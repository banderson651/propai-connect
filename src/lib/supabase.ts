
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const runtimeEnv = typeof process !== 'undefined' ? process.env : undefined;

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL ?? runtimeEnv?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? runtimeEnv?.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
