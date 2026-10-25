import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'sneha2026';
const MAINTAINER_EMAIL = process.env.MAINTAINER_EMAIL || 'sumitnawale123456@gmail.com';

app.use(express.json({ limit: '1mb' }));

// CORS configuration for local Vite development (port 3000 -> 3001)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-token');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper for Supabase REST requests
async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase is not configured on the server');
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
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
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
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

  // Fallback: Structured logging with ready-to-send payload
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
    version: '1.0.1',
  });
});

// -------------------------------------------------------------
// 2. Pilot Sign-up Endpoint
// -------------------------------------------------------------
app.post('/api/signups', async (req: Request, res: Response) => {
  try {
    const { name, email, androidVersion, deviceModel } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }
    if (!deviceModel || typeof deviceModel !== 'string' || deviceModel.trim().length < 2) {
      return res.status(400).json({ error: 'Device model is required.' });
    }

    const signupRecord = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      android_version: androidVersion || 'Android 15 (Target SDK 35)',
      device_model: deviceModel.trim(),
    };

    let savedData = [signupRecord];
    if (SUPABASE_URL && SUPABASE_KEY) {
      savedData = await supabaseRequest('pilot_signups', {
        method: 'POST',
        body: JSON.stringify(signupRecord),
      });
    }

    // Automated Email Notification (Section 5)
    // 1. Send confirmation to tester
    const testerEmailPromise = dispatchEmail({
      to: signupRecord.email,
      subject: 'Welcome to SNEHA Pilot Program (Build Access)',
      text: `Hi ${signupRecord.name},\n\nThank you for joining the SNEHA Pilot distribution for Android!\n\nRegistered Device: ${signupRecord.device_model}\nAndroid Version: ${signupRecord.android_version}\n\nYou will receive new unsigned test builds directly at this address. You can also sideload the latest build from the pilot portal: https://itzlucifa.github.io/sneha.pilot/#download\n\nMaintainer: Sumit Nawale (${MAINTAINER_EMAIL})\nPrivacy: Zero telemetry, GPLv3 on-device AI.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 24px; border: 3px solid #1f1a0e; background: #f5ecd4; color: #1f1a0e;">
          <h2 style="margin-top: 0; color: #ff4a8a; font-size: 24px; text-transform: uppercase;">Welcome to the SNEHA Pilot</h2>
          <p>Hi <strong>${signupRecord.name}</strong>,</p>
          <p>Thank you for joining the SNEHA Pilot distribution!</p>
          <div style="padding: 16px; background: #eedcb4; border: 2px solid #1f1a0e; margin: 16px 0;">
            <p style="margin: 0;"><strong>Device:</strong> ${signupRecord.device_model}</p>
            <p style="margin: 4px 0 0 0;"><strong>Platform:</strong> ${signupRecord.android_version}</p>
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
            <li><strong>Name:</strong> ${signupRecord.name}</li>
            <li><strong>Email:</strong> ${signupRecord.email}</li>
            <li><strong>Device:</strong> ${signupRecord.device_model}</li>
            <li><strong>Android:</strong> ${signupRecord.android_version}</li>
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
    console.error('Sign-up handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during sign-up.' });
  }
});

// -------------------------------------------------------------
// 3. Pilot Feedback Endpoint
// -------------------------------------------------------------
app.post('/api/feedback', async (req: Request, res: Response) => {
  try {
    const { rating, whatWorked, whatBroke, whatToAdd, testerEmail, testerDevice } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }
    if (!whatWorked || typeof whatWorked !== 'string' || whatWorked.trim().length < 2) {
      return res.status(400).json({ error: 'What worked well field is required.' });
    }
    if (!whatBroke || typeof whatBroke !== 'string' || whatBroke.trim().length < 2) {
      return res.status(400).json({ error: 'What broke field is required.' });
    }
    if (!whatToAdd || typeof whatToAdd !== 'string' || whatToAdd.trim().length < 2) {
      return res.status(400).json({ error: 'What to add field is required.' });
    }

    const feedbackRecord = {
      rating: numRating,
      what_worked: whatWorked.trim(),
      what_broke: whatBroke.trim(),
      what_to_add: whatToAdd.trim(),
      tester_email: testerEmail ? String(testerEmail).trim().toLowerCase() : null,
      tester_device: testerDevice ? String(testerDevice).trim() : null,
    };

    let savedData = [feedbackRecord];
    if (SUPABASE_URL && SUPABASE_KEY) {
      savedData = await supabaseRequest('pilot_feedback', {
        method: 'POST',
        body: JSON.stringify(feedbackRecord),
      });
    }

    // Alert maintainer on feedback submission
    await dispatchEmail({
      to: MAINTAINER_EMAIL,
      subject: `[SNEHA Feedback Alert] ${numRating}★ Review from ${feedbackRecord.tester_email || 'Anonymous'}`,
      text: `Tester Review (${numRating}/5 Stars):\n\nDevice: ${feedbackRecord.tester_device || 'N/A'}\nEmail: ${feedbackRecord.tester_email || 'Anonymous'}\n\nWhat Worked:\n${feedbackRecord.what_worked}\n\nWhat Broke:\n${feedbackRecord.what_broke}\n\nWhat to Add:\n${feedbackRecord.what_to_add}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 2px solid #1f1a0e;">
          <h2>New Tester Review: ${numRating} / 5 Stars</h2>
          <p><strong>Device:</strong> ${feedbackRecord.tester_device || 'Unspecified'}</p>
          <p><strong>Email:</strong> ${feedbackRecord.tester_email || 'Anonymous'}</p>
          <hr />
          <p><strong>What Worked:</strong><br />${feedbackRecord.what_worked}</p>
          <p><strong>What Broke:</strong><br />${feedbackRecord.what_broke}</p>
          <p><strong>What to Add:</strong><br />${feedbackRecord.what_to_add}</p>
        </div>
      `,
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback recorded successfully.',
      data: savedData[0] || feedbackRecord,
    });
  } catch (error: any) {
    console.error('Feedback handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error during feedback submission.' });
  }
});

// -------------------------------------------------------------
// 4. Admin Portal Endpoints (Section 4)
// Protected with x-admin-token or query param ?token=
// -------------------------------------------------------------
const adminAuth = (req: Request, res: Response, next: () => void) => {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!token || token !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing admin token.' });
  }
  next();
};

// Admin: Get all signups
app.get('/api/admin/signups', adminAuth, async (req: Request, res: Response) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.json([]);
    }
    const data = await supabaseRequest('pilot_signups?select=*&order=created_at.desc');
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch signups.' });
  }
});

// Admin: Get all feedback
app.get('/api/admin/feedback', adminAuth, async (req: Request, res: Response) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.json([]);
    }
    const data = await supabaseRequest('pilot_feedback?select=*&order=created_at.desc');
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch feedback.' });
  }
});

// Admin: Get summary statistics
app.get('/api/admin/stats', adminAuth, async (req: Request, res: Response) => {
  try {
    let signups: any[] = [];
    let feedback: any[] = [];
    if (SUPABASE_URL && SUPABASE_KEY) {
      signups = await supabaseRequest('pilot_signups?select=id,device_model,android_version,created_at');
      feedback = await supabaseRequest('pilot_feedback?select=id,rating,created_at');
    }

    const totalSignups = signups.length;
    const totalFeedback = feedback.length;
    const avgRating = totalFeedback > 0
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
    return res.status(500).json({ error: error.message || 'Failed to generate stats.' });
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
  console.log(`[SNEHA Backend] Admin Secret: Configured (default: sneha2026)`);
});

export default app;
