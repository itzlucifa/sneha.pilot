// Supabase client via REST API — no npm install needed
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export async function supabaseInsert(table: string, data: any) {
  if (!url || !key) throw new Error('Supabase not configured');
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

export function isSupabaseConfigured(): boolean {
  return !!(url && key);
}