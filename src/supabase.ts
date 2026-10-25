// Supabase & Unified Backend Client
// Directly connects to Supabase database for live data and real-time synchronization

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const DEFAULT_SUPABASE_URL = 'https://dhbewzvmtewpmntskrgv.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoYmV3enZtdGV3cG1udHNrcmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NDAyNDcsImV4cCI6MjEwODQxNjI0N30.5WoSV4AOUQCkKEW1-3jN_RqlKGf6plmbOWa3GIHqDWQ';

export const SUPABASE_URL = (envUrl || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
export const SUPABASE_ANON_KEY = envKey || DEFAULT_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return !!(envUrl && envKey);
}

export async function supabaseInsert<T = any>(table: string, data: any): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase not configured');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function supabaseSelect<T = any>(
  table: string,
  query: string = 'select=*&order=created_at.desc',
  pin: string = 'Sneha@143'
): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Supabase not configured');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    method: 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      'x-admin-pin': pin,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

// -------------------------------------------------------------
// Live Admin Data Fetcher (Direct Supabase Connection)
// -------------------------------------------------------------
export async function fetchLiveAdminData(): Promise<{
  signups: any[];
  feedback: any[];
  source: 'supabase' | 'api' | 'offline';
}> {
  // 1. Direct Supabase Query (Primary)
  try {
    const [signups, feedback] = await Promise.all([
      supabaseSelect('pilot_signups', 'select=*&order=created_at.desc'),
      supabaseSelect('pilot_feedback', 'select=*&order=created_at.desc'),
    ]);
    return {
      signups: Array.isArray(signups) ? signups : [],
      feedback: Array.isArray(feedback) ? feedback : [],
      source: 'supabase',
    };
  } catch (supabaseErr) {
    // 2. Express Server API fallback (if server is running on localhost/Cloud Run)
    try {
      const [signupsRes, feedbackRes] = await Promise.all([
        fetch('/api/admin/signups', { headers: { 'x-admin-token': 'Sneha@143' } }),
        fetch('/api/admin/feedback', { headers: { 'x-admin-token': 'Sneha@143' } }),
      ]);
      if (signupsRes.ok && feedbackRes.ok) {
        const signups = await signupsRes.json();
        const feedback = await feedbackRes.json();
        return {
          signups: Array.isArray(signups) ? signups : [],
          feedback: Array.isArray(feedback) ? feedback : [],
          source: 'api',
        };
      }
    } catch {}

    throw supabaseErr;
  }
}

// -------------------------------------------------------------
// Supabase Realtime WebSocket Client (Phoenix Channels Protocol)
// -------------------------------------------------------------
export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export function subscribeToSupabaseRealtime(
  tables: string[],
  onEvent: (table: string, payload: any) => void,
  onStatusChange?: (status: RealtimeStatus) => void
): () => void {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
    return () => {};
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    onStatusChange?.('error');
    return () => {};
  }

  let ws: WebSocket | null = null;
  let heartbeatTimer: any = null;
  let reconnectTimer: any = null;
  let isUnmounted = false;

  const wsUrl = `${SUPABASE_URL.replace(/^http/, 'ws')}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`;

  function connect() {
    if (isUnmounted) return;
    try {
      onStatusChange?.('connecting');
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (isUnmounted) {
          try { ws?.close(); } catch {}
          return;
        }
        onStatusChange?.('connected');

        // Join postgres_changes channel for the specified tables
        const postgres_changes = tables.map((tbl) => ({
          event: '*',
          schema: 'public',
          table: tbl,
        }));

        ws?.send(
          JSON.stringify({
            topic: 'realtime:public',
            event: 'phx_join',
            payload: { config: { postgres_changes } },
            ref: 'join_realtime',
          })
        );

        // Keep-alive heartbeat every 25 seconds
        heartbeatTimer = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                topic: 'phoenix',
                event: 'heartbeat',
                payload: {},
                ref: `hb_${Date.now()}`,
              })
            );
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'postgres_changes' && data.payload) {
            const table = data.payload.data?.table || data.payload.table || '';
            onEvent(table, data.payload);
          }
        } catch {}
      };

      ws.onerror = () => {
        onStatusChange?.('error');
      };

      ws.onclose = () => {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        onStatusChange?.('disconnected');
        if (!isUnmounted) {
          reconnectTimer = setTimeout(connect, 6000);
        }
      };
    } catch {
      onStatusChange?.('error');
    }
  }

  connect();

  return () => {
    isUnmounted = true;
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    if (reconnectTimer) clearTimeout(reconnectTimer);
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            topic: 'realtime:public',
            event: 'phx_leave',
            payload: {},
            ref: 'leave_realtime',
          })
        );
      }
      ws?.close();
    } catch {}
  };
}

// -------------------------------------------------------------
// Unified Submit Helpers (try Express server API, fall back to direct Supabase)
// -------------------------------------------------------------
function notifyDataChange() {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('sneha:data-updated'));
    } catch {}
  }
}

function sanitizeInput(str: any, maxLen: number): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, maxLen);
}

export async function submitSignupUnified(data: {
  name: string;
  email: string;
  androidVersion: string;
  deviceModel: string;
}) {
  const sanitized = {
    name: sanitizeInput(data.name, 100),
    email: sanitizeInput(data.email, 254).toLowerCase(),
    androidVersion: sanitizeInput(data.androidVersion, 60),
    deviceModel: sanitizeInput(data.deviceModel, 120),
  };

  try {
    const apiRes = await fetch('/api/signups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    });
    if (apiRes.ok) {
      notifyDataChange();
      return await apiRes.json();
    }
  } catch {
    // If Express backend is not running, proceed directly to Supabase
  }

  // Direct Supabase insert
  const result = await supabaseInsert('pilot_signups', {
    name: sanitized.name,
    email: sanitized.email,
    android_version: sanitized.androidVersion,
    device_model: sanitized.deviceModel,
  });
  notifyDataChange();
  return result;
}

export async function submitFeedbackUnified(data: {
  rating: number;
  whatWorked: string;
  whatBroke: string;
  whatToAdd: string;
  testerEmail?: string;
  testerDevice?: string;
}) {
  const sanitized = {
    rating: Math.max(1, Math.min(5, Math.floor(Number(data.rating) || 5))),
    whatWorked: sanitizeInput(data.whatWorked, 3000),
    whatBroke: sanitizeInput(data.whatBroke, 3000),
    whatToAdd: sanitizeInput(data.whatToAdd, 3000),
    testerEmail: data.testerEmail ? sanitizeInput(data.testerEmail, 254).toLowerCase() : undefined,
    testerDevice: data.testerDevice ? sanitizeInput(data.testerDevice, 120) : undefined,
  };

  try {
    const apiRes = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    });
    if (apiRes.ok) {
      notifyDataChange();
      return await apiRes.json();
    }
  } catch {
    // If Express backend is not running, proceed directly to Supabase
  }

  // Direct Supabase insert
  const result = await supabaseInsert('pilot_feedback', {
    rating: sanitized.rating,
    what_worked: sanitized.whatWorked,
    what_broke: sanitized.whatBroke,
    what_to_add: sanitized.whatToAdd,
    tester_email: sanitized.testerEmail || null,
    tester_device: sanitized.testerDevice || null,
  });
  notifyDataChange();
  return result;
}
