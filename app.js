let supabaseClient = null;

export async function getSupabaseClient() {
  const config = window.LifeSyncConfig || {};
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
  if (supabaseClient) return supabaseClient;
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
  supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
  return supabaseClient;
}

export async function getSessionToken() {
  const client = await getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data?.session?.access_token || null;
}

export async function getUserSession() {
  const client = await getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data?.session || null;
}

export async function signInWithPassword(email, password) {
  const client = await getSupabaseClient();
  if (!client) throw new Error("Supabase chưa cấu hình");
  const result = await client.auth.signInWithPassword({ email, password });
  if (result.error) throw result.error;
  return result.data;
}

export async function signUpWithPassword(email, password, fullName) {
  const client = await getSupabaseClient();
  if (!client) throw new Error("Supabase chưa cấu hình");
  const result = await client.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });
  if (result.error) throw result.error;
  return result.data;
}

export async function signOut() {
  const client = await getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}
