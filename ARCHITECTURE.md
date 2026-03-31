import { createClient } from "@supabase/supabase-js";
import { env, hasSupabase } from "./env.js";

let client = null;

export function getSupabaseAdmin() {
  if (!hasSupabase()) return null;
  if (client) return client;
  client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return client;
}
