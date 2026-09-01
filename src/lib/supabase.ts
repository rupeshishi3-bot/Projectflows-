import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase environment variables or client-stored connection info
const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL as string) || '';
const envAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '';


// Allow runtime user override if configured via UI
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('SP_SUPABASE_URL') || '' : '';
const storedAnonKey = typeof window !== 'undefined' ? localStorage.getItem('SP_SUPABASE_ANON_KEY') || '' : '';

export const supabaseUrl = storedUrl || envUrl;
export const supabaseAnonKey = storedAnonKey || envAnonKey;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseUrl.startsWith('http') && 
    !supabaseUrl.includes('your-project-id') &&
    supabaseAnonKey && 
    supabaseAnonKey.length > 20
  );
};

export const setCustomSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url && key) {
      localStorage.setItem('SP_SUPABASE_URL', url.trim());
      localStorage.setItem('SP_SUPABASE_ANON_KEY', key.trim());
    } else {
      localStorage.removeItem('SP_SUPABASE_URL');
      localStorage.removeItem('SP_SUPABASE_ANON_KEY');
    }
    window.location.reload();
  }
};

let client: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
};

export const supabase = isSupabaseConfigured() ? getSupabaseClient()! : (null as unknown as SupabaseClient);
