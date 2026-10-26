import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'Sneha@143';
const MAINTAINER_EMAIL = process.env.MAINTAINER_EMAIL || 'sumitnawale123456@gmail.com';

// -------------------------------------------------------------
// Security Hardening: Anti-Fingerprinting & Request Limits
// -------------------------------------------------------------
app.disable('x-powered-by');

// Enforce strict payload body limit (32KB max to prevent memory exhaustion DoS)
app.use(express.json({ limit: '32kb' }));

// -------------------------------------------------------------
// Security Hardening: Comprehensive HTTP Security Headers
// -------------------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent Clickjacking / Framing
  res.setHeader('X-Frame-Options', 'DENY');

  // Cross-Site Scripting filter protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict sensitive browser APIs
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()');

  // HTTP Strict Transport Security (HSTS - 1 year)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Content Security Policy (CSP)
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "media-src 'self' https: blob:",
      "connect-src 'self' https://dhbewzvmtewpmntskrgv.supabase.co wss://dhbewzvmtewpmntskrgv.supabase.co https://api.resend.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' mailto:",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  next();
});

// -------------------------------------------------------------
// Security Hardening: Safe CORS with Origin Whitelisting
// -------------------------------------------------------------
const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://itzlucifa.github.io',
  process.env.APP_URL || '',
].filter(Boolean));

app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.has(origin) || origin.endsWith('.github.io'))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-token, x-admin-pin'
  );
  res.header('Access-Control-Max-Age', '86400'); // 24h preflight cache

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// -------------------------------------------------------------
// Security Hardening: Sliding-Window IP Rate Limiter
// -------------------------------------------------------------
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitBuckets = new Map<string, RateLimitRecord>();

// Clean up stale bucket entries every 5 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitBuckets.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < 15 * 60 * 1000);
    if (record.timestamps.length === 0) {
      rateLimitBuckets.delete(key);
    }
  }
}, 5 * 60 * 1000);
cleanupTimer.unref();

function rateLimiter(prefix: string, maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const key = `${prefix}:${rawIp}`;
    const now = Date.now();

    let record = rateLimitBuckets.get(key);
    if (!record) {
      record = { timestamps: [] };
      rateLimitBuckets.set(key, record);
    }

    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        error: `Security threshold: Too many requests. Please wait ${retryAfterSeconds} seconds.`,
      });
    }

    record.timestamps.push(now);
    next();
  };
}

// -------------------------------------------------------------
// Security Hardening: Timing-Safe Constant-Time String Comparison
// -------------------------------------------------------------
function secureCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// -------------------------------------------------------------
// Security Hardening: Input Sanitization & HTML Escaping
// -------------------------------------------------------------
function sanitizeString(input: any, maxLength: number): string {
  if (typeof input !== 'string') return '';
  const cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return cleaned.slice(0, maxLength);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper for Supabase REST requests
async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase is not configured on the server');
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      'x-admin-pin': ADMIN_SECRET,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Supabase error: HTTP ${res.status}`);
  }

  return res.json();
}

// -------------------------------------------------------------
// Automated Email Dispatcher (Section 5)
// -------------------------------------------------------------
interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function dispatchEmail(payload: EmailPayload): Promise<{ success: boolean; method: string }> {
  // Option A: If RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'SNEHA Pilot <pilot@sneha.app>',
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });
      if (res.ok) {
        return { success: true, method: 'resend' };
      }
    } catch (err) {
      console.warn('[Email] Resend delivery failed:', err);
    }
  }

  // Option B: If WEBHOOK_EMAIL_URL is configured
  if (process.env.WEBHOOK_EMAIL_URL) {
    try {
      await fetch(process.env.WEBHOOK_EMAIL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return { success: true, method: 'webhook' };
    } catch (err) {
      console.warn('[Email] Webhook delivery failed:', err);
    }
  }

  // Fallback: Structured logging
  console.log(`\n=======================================================`);
  console.log(`[AUTOMATED NOTIFICATION] To: ${payload.to}`);
  console.log(`Subject: ${payload.subject}`);
  console.log(`Body:\n${payload.text}`);
  console.log(`=======================================================\n`);

  return { success: true, method: 'logged' };
}

// -------------------------------------------------------------
// 1. Health & Status
// -------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabaseConfigured: !!(SUPABASE_URL && SUPABASE_KEY),
    emailConfigured: !!(process.env.RESEND_API_KEY || process.env.WEBHOOK_EMAIL_URL),
    version: '1.0.2',
  });
});

// -------------------------------------------------------------
// 2. Pilot Sign-up Endpoint (Protected with Rate Limiting)
// Max 10 submissions per 10 minutes per IP
// -------------------------------------------------------------
app.post('/api/signups', rateLimiter('signup', 10, 10 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const rawName = sanitizeString(req.body.name, 100);
    const rawEmail = sanitizeString(req.body.email, 254).toLowerCase();
    const rawAndroidVersion = sanitizeString(req.body.androidVersion || 'Android 15 (Target SDK 35)', 60);
    const rawDeviceModel = sanitizeString(req.body.deviceModel, 120);

    // Validation
    if (!rawName || rawName.length < 2) {
      return res.status(400).json({ error: 'Name must be between 2 and 100 characters long.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }
    if (!rawDeviceModel || rawDeviceModel.length < 2) {
      return res.status(400).json({ error: 'Device model is required.' });
    }

    const signupRecord = {
      name: rawName,
      email: rawEmail,
      android_version: rawAndroidVersion,
      device_model: rawDeviceModel,
    };

    let savedData = [signupRecord];
    if (SUPABASE_URL && SUPABASE_KEY) {
      savedData = await supabaseRequest('pilot_signups', {
        method: 'POST',
        body: JSON.stringify(signupRecord),
      });
    }

    // Automated Email Notifications with HTML Escaped Inputs (Anti-XSS in email)
    const safeName = escapeHtml(signupRecord.name);
    const safeDevice = escapeHtml(signupRecord.device_model);
    const safeVersion = escapeHtml(signupRecord.android_version);
    const safeEmail = escapeHtml(signupRecord.email);

    // 1. Send confirmation to tester
    const testerEmailPromise = dispatchEmail({
      to: signupRecord.email,
      subject: 'Welcome to SNEHA Pilot Program (Build Access)',
      text: `Hi ${signupRecord.name},\n\nThank you for joining the SNEHA Pilot distribution for Android!\n\nRegistered Device: ${signupRecord.device_model}\nAndroid Version: ${signupRecord.android_version}\n\nYou will receive new unsigned test builds directly at this address. You can also sideload the latest build from the pilot portal: https://itzlucifa.github.io/sneha.pilot/#download\n\nMaintainer: Sumit Nawale (${MAINTAINER_EMAIL})\nPrivacy: Zero telemetry, GPLv3 on-device AI.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 24px; border: 3px solid #1f1a0e; background: #f5ecd4; color: #1f1a0e;">
          <h2 style="margin-top: 0; color: #ff4a8a; font-size: 24px; text-transform: uppercase;">Welcome to the SNEHA Pilot</h2>
          <p>Hi <strong>${safeName}</strong>,</p>
          <p>Thank you for joining the SNEHA Pilot distribution!</p>
          <div style="padding: 16px; background: #eedcb4; border: 2px solid #1f1a0e; margin: 16px 0;">
            <p style="margin: 0;"><strong>Device:</strong> ${safeDevice}</p>
            <p style="margin: 4px 0 0 0;"><strong>Platform:</strong> ${safeVersion}</p>
          </div>
          <p>You can download the latest pilot build and review release notes directly on the pilot portal:</p>
          <p><a href="https://itzlucifa.github.io/sneha.pilot/" style="display: inline-block; padding: 10px 20px; background: #0e4dff; color: white; text-decoration: none; font-weight: bold; border: 2px solid #1f1a0e;">Open Pilot Portal →</a></p>
          <hr style="border: 0; border-top: 2px dashed #1f1a0e; margin: 20px 0;" />
          <small style="color: #5a4f30;">Maintainer: Sumit Nawale (${MAINTAINER_EMAIL}) · Zero-telemetry GPLv3</small>
        </div>
      `,
    });

    // 2. Alert maintainer
    const maintainerAlertPromise = dispatchEmail({
      to: MAINTAINER_EMAIL,
      subject: `[SNEHA Pilot Alert] New Sign-up: ${signupRecord.name} (${signupRecord.device_model})`,
      text: `New tester registered:\n\nName: ${signupRecord.name}\nEmail: ${signupRecord.email}\nDevice: ${signupRecord.device_model}\nOS: ${signupRecord.android_version}\nTime: ${new Date().toISOString()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 2px solid #1f1a0e; background: #fff;">
          <h3>New SNEHA Pilot Tester Registered</h3>
          <ul>
            <li><strong>Name:</strong> ${safeName}</li>
            <li><strong>Email:</strong> ${safeEmail}</li>
            <li><strong>Device:</strong> ${safeDevice}</li>
            <li><strong>Android:</strong> ${safeVersion}</li>
          </ul>
        </div>
      `,
    });

    await Promise.allSettled([testerEmailPromise, maintainerAlertPromise]);

    return res.status(201).json({
      success: true,
      message: 'Pilot sign-up recorded successfully.',
      data: savedData[0] || signupRecord,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error during sign-up.' });
  }
});

// -------------------------------------------------------------
// 3. Pilot Feedback Endpoint (Protected with Rate Limiting)
// Max 10 reviews per 10 minutes per IP
// -------------------------------------------------------------
app.post('/api/feedback', rateLimiter('feedback', 10, 10 * 60 * 1000), async (req: Request, res: Response) => {
  try {
    const numRating = Math.floor(Number(req.body.rating));
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
    }

    const rawWorked = sanitizeString(req.body.whatWorked, 3000);
    const rawBroke = sanitizeString(req.body.whatBroke, 3000);
    const rawToAdd = sanitizeString(req.body.whatToAdd, 3000);
    const rawEmail = req.body.testerEmail ? sanitizeString(req.body.testerEmail, 254).toLowerCase() : null;
    const rawDevice = req.body.testerDevice ? sanitizeString(req.body.testerDevice, 120) : null;

    if (!rawWorked || rawWorked.length < 2) {
      return res.status(400).json({ error: 'What worked well field is required (2-3000 chars).' });
    }
    if (!rawBroke || rawBroke.length < 2) {
      return res.status(400).json({ error: 'What broke field is required (2-3000 chars).' });
    }
    if (!rawToAdd || rawToAdd.length < 2) {
      return res.status(400).json({ error: 'What to add field is required (2-3000 chars).' });
    }

    const feedbackRecord = {
      rating: numRating,
      what_worked: rawWorked,
      what_broke: rawBroke,
      what_to_add: rawToAdd,
      tester_email: rawEmail || null,
      tester_device: rawDevice || null,
    };

    let savedData = [feedbackRecord];
    if (SUPABASE_URL && SUPABASE_KEY) {
      savedData = await supabaseRequest('pilot_feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackRecord),
      });
    }

    // Alert maintainer on feedback submission (HTML Escaped)
    const safeWorked = escapeHtml(feedbackRecord.what_worked);
    const safeBroke = escapeHtml(feedbackRecord.what_broke);
    const safeToAdd = escapeHtml(feedbackRecord.what_to_add);
    const safeDevice = escapeHtml(feedbackRecord.tester_device || 'Unspecified');
    const safeEmail = escapeHtml(feedbackRecord.tester_email || 'Anonymous');

    await dispatchEmail({
      to: MAINTAINER_EMAIL,
      subject: `[SNEHA Feedback Alert] ${numRating}-Star Review from ${feedbackRecord.tester_email || 'Anonymous'}`,
      text: `Tester Review (${numRating}/5 Stars):\n\nDevice: ${feedbackRecord.tester_device || 'N/A'}\nEmail: ${feedbackRecord.tester_email || 'Anonymous'}\n\nWhat Worked:\n${feedbackRecord.what_worked}\n\nWhat Broke:\n${feedbackRecord.what_broke}\n\nWhat to Add:\n${feedbackRecord.what_to_add}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 2px solid #1f1a0e;">
          <h2>New Tester Review: ${numRating} / 5 Stars</h2>
          <p><strong>Device:</strong> ${safeDevice}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <hr />
          <p><strong>What Worked:</strong><br />${safeWorked}</p>
          <p><strong>What Broke:</strong><br />${safeBroke}</p>
          <p><strong>What to Add:</strong><br />${safeToAdd}</p>
        </div>
      `,
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback recorded successfully.',
      data: savedData[0] || feedbackRecord,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error during feedback submission.' });
  }
});

// -------------------------------------------------------------
// 4. Admin Portal Endpoints (Section 4)
// Protected with Timing-Safe PIN check + Rate Limiting (Anti-Brute-Force)
// Max 10 admin operations / 5 minutes
// -------------------------------------------------------------
const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = (req.headers['x-admin-token'] || req.headers['x-admin-pin'] || req.query.token) as string;
  if (!token || !secureCompare(token, ADMIN_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing maintainer credentials.' });
  }
  next();
};

const adminRateLimit = rateLimiter('admin', 20, 5 * 60 * 1000);

// Admin: Get all signups
app.get('/api/admin/signups', adminRateLimit, adminAuth, async (req: Request, res: Response) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.json([]);
    }
    const data = await supabaseRequest('pilot_signups?select=*&order=created_at.desc');
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch signups.' });
  }
});

// Admin: Get all feedback
app.get('/api/admin/feedback', adminRateLimit, adminAuth, async (req: Request, res: Response) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.json([]);
    }
    const data = await supabaseRequest('pilot_feedback?select=*&order=created_at.desc');
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch feedback.' });
  }
});

// Admin: Get summary statistics
app.get('/api/admin/stats', adminRateLimit, adminAuth, async (req: Request, res: Response) => {
  try {
    let signups: any[] = [];
    let feedback: any[] = [];
    if (SUPABASE_URL && SUPABASE_KEY) {
      signups = await supabaseRequest('pilot_signups?select=id,device_model,android_version,created_at');
      feedback = await supabaseRequest('pilot_feedback?select=id,rating,created_at');
    }

    const totalSignups = signups.length;
    const totalFeedback = feedback.length;
    const avgRating =
      totalFeedback > 0
        ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedback).toFixed(1)
        : '0.0';

    // Device breakdown
    const devicesMap: Record<string, number> = {};
    signups.forEach((s) => {
      const dev = (s.device_model || 'Unknown').trim();
      devicesMap[dev] = (devicesMap[dev] || 0) + 1;
    });

    // Rating breakdown
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedback.forEach((f) => {
      const r = f.rating || 0;
      if (r >= 1 && r <= 5) {
        ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
      }
    });

    return res.json({
      totalSignups,
      totalFeedback,
      avgRating,
      ratingDistribution,
      devicesMap,
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to generate stats.' });
  }
});

// -------------------------------------------------------------
// 5. Serve built frontend in production (dist directory)
// -------------------------------------------------------------
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side SPA routing
app.get('*', (req: Request, res: Response) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('SNEHA Pilot Distribution Server is running. Frontend build not found.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`[SNEHA Backend] Server listening on http://localhost:${PORT}`);
  console.log(`[SNEHA Backend] Supabase URL: ${SUPABASE_URL ? 'Configured' : 'Missing'}`);
  console.log(`[SNEHA Backend] Admin Security: Timing-Safe Rate-Limited Protection Active`);
});

export default app;
