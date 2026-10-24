# SNEHA — Pilot Distribution Website

**Created by Sumit Nawale** · [sumitnawale123456@gmail.com](mailto:sumitnawale123456@gmail.com) · [github.com/itzlucifa/sneha.pilot](https://github.com/itzlucifa/sneha.pilot)

This is the standalone pilot distribution and tester intake website for **SNEHA** (`com.sneha.app`), the private on-device AI companion for Android 8.0+ (Min SDK 26, Target SDK 35).

Licensed under **GNU General Public License v3.0 (GPLv3)**.

> Originally scaffolded in Google AI Studio. Fully rebuilt, audited, and production-hardened by **Sumit Nawale** for the public pilot release. All credit to the original AI Studio template framework; all engineering, design, and content copyright © 2026 Sumit Nawale.

---

## 1. How to Deploy

The site in `pilot-site/` is 100% static (HTML, CSS, and vanilla JS). It requires **zero build step**, no Node.js runtime, and no server-side compilation.

### Option A: Cloudflare Pages / Netlify / Vercel
1. Set the publish directory to `pilot-site/` (or upload this folder directly).
2. Set build command to empty / none.
3. Deploy!

### Option B: GitHub Pages
1. Push `pilot-site/` contents to your `gh-pages` branch or the `/docs` folder of your main branch.
2. In your GitHub repository settings, navigate to **Pages** → Source: **Deploy from a branch** → choose `/docs` or root.
3. Save.

### Option C: Traditional Web Host (NGINX / Apache / S3)
Copy `index.html`, `feedback.html`, `privacy.html`, `style.css`, and the `assets/` directory to your web root (`/var/www/html` or public bucket).

---

## 2. Placeholders to Fill Before Public Launch

| File | Current Placeholder | Description & What to Replace With |
|---|---|---|
| `index.html`<br>`feedback.html` | `/api/pilot-signup`<br>`/api/pilot-feedback` | Single endpoint placeholder for form submissions. Replace with your actual endpoint or form service (see Section 3). |
| `index.html` | `assets/img/29-zine-page.jpg` | Replace the striped placeholders with real 1080×2400 Android screenshots once available. |

All GitHub repository URLs have been updated to `https://github.com/itzlucifa/sneha.pilot`. Footer and meta contact is `sumitnawale123456@gmail.com`.

---

## 3. Form Backend Setup

As requested, both forms (`pilot-site/index.html` and `pilot-site/feedback.html`) are wired to post to a single endpoint without third-party trackers.

### Expected Payload Schemas
#### Pilot Sign-Up Form (`POST /api/pilot-signup`):
```json
{
  "name": "Alex Sharma",
  "email": "alex@example.com",
  "androidVersion": "Android 14 (SDK 34)",
  "deviceModel": "Pixel 7"
}
```

#### Pilot Feedback Form (`POST /api/pilot-feedback`):
```json
{
  "rating": "5",
  "whatWorked": "Local intent recognition was fast and accurate.",
  "whatBroke": "Voice trigger timed out once in battery saver mode.",
  "whatToAdd": "Offline translation and custom quick-settings tile.",
  "email": "tester@example.com",
  "device": "Samsung Galaxy S22 / Android 14"
}
```

### Self-Hosted Backend Example (Express / Node.js)
```javascript
app.post('/api/pilot-signup', express.json(), (req, res) => {
  const { name, email, androidVersion, deviceModel } = req.body;
  // Save to database or CSV — store nothing beyond what's needed
  res.json({ ok: true, message: "Sign-up recorded" });
});

app.post('/api/pilot-feedback', express.json(), (req, res) => {
  const { rating, whatWorked, whatBroke, whatToAdd, email, device } = req.body;
  // Store feedback review for developer triage
  res.json({ ok: true, message: "Feedback received" });
});
```

Alternatively, you can plug in any standard form service (e.g. Formspree, Baserow, or self-hosted PocketBase) by simply updating the form `action="..."` attribute.

---

## 4. Privacy & Zero-Telemetry Guarantee
- Zero third-party trackers or ad networks.
- No analytics pixels or crash reporting daemons.
- User data remains on-device; transmissions occur strictly upon user-initiated form submission.