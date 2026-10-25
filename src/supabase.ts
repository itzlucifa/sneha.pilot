// Supabase & Unified Backend Client
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

export async function supabaseSelect(table: string, query: string = 'select=*&order=created_at.desc') {
  if (!url || !key) throw new Error('Supabase not configured');
  const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
    method: 'GET',
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
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

// Unified Submit Helpers (try Express server API first, fall back to direct Supabase REST)
export async function submitSignupUnified(data: { name: string; email: string; androidVersion: string; deviceModel: string }) {
  try {
    const apiRes = await fetch('/api/signups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (apiRes.ok) {
      return await apiRes.json();
    }
  } catch {
    // If Express backend is not running (e.g. static CDN / GitHub Pages), proceed to direct Supabase
  }

  // Direct Supabase fallback
  return supabaseInsert('pilot_signups', {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    android_version: data.androidVersion,
    device_model: data.deviceModel.trim(),
  });
}

export async function submitFeedbackUnified(data: {
  rating: number;
  whatWorked: string;
  whatBroke: string;
  whatToAdd: string;
  testerEmail?: string;
  testerDevice?: string;
}) {
  try {
    const apiRes = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (apiRes.ok) {
      return await apiRes.json();
    }
  } catch {
    // If Express backend is not running, proceed to direct Supabase
  }

  // Direct Supabase fallback
  return supabaseInsert('pilot_feedback', {
    rating: data.rating,
    what_worked: data.whatWorked.trim(),
    what_broke: data.whatBroke.trim(),
    what_to_add: data.whatToAdd.trim(),
    tester_email: data.testerEmail?.trim() || null,
    tester_device: data.testerDevice?.trim() || null,
  });
}
