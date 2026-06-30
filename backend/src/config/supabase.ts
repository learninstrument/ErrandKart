import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const supabaseAuth = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      flowType: 'pkce',
    },
  }
);
