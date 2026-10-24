<div align="center">
<img width="1200" height="475" alt="SNEHA Banner" src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80" />
</div>

# SNEHA — Pilot Distribution Platform

**Created by Sumit Nawale** · [sumitnawale123456@gmail.com](mailto:sumitnawale123456@gmail.com)

SNEHA is the privacy-first, on-device AI companion for Android 8.0+ (Min SDK 26 · Target SDK 35). This repository contains the official pilot distribution website and the in-app tester companion dashboard — all licensed under **GPLv3**.

> **Project Origin:** Originally scaffolded in Google AI Studio and fully rebuilt, audited, and production-hardened by **Sumit Nawale** for the public pilot release. All credit to the original AI Studio template framework; all engineering, design, and content copyright © 2026 Sumit Nawale.

---

## Features

- **100% On-Device AI** — zero cloud trackers, zero telemetry, zero background data brokers
- **GPLv3 Open Source** — full source code auditability
- **Android 8.0+ (SDK 26) through Android 15 (SDK 35)**
- **Interactive React Dashboard** (`src/App.tsx`) with 4 tabbed views: Pilot Site, App-Side Feedback, Privacy Policy, Feature Audit
- **Hamburger Menu Navigation** — fully responsive across all screen sizes (desktop, tablet, mobile, compact)
- **Scroll Reveal Animations** — sections fade in as you scroll down
- **Interactive Screenshot Lightbox** with 1:1 HD inspector
- **Spinning Audio Sticker Player** — plays "Humdum" by Aditya Rikhari
- **Neo-Brutalist Zine Aesthetic** — Bowlby One, Crimson Pro, Space Grotesk typography

---

## Project Structure

```
sneha---pilot-distribution/
├── src/                    # React application source
│   ├── App.tsx             # Main interactive dashboard (4 tabs + hamburger menu)
│   ├── main.tsx            # React entry point
│   └── index.css           # Tailwind CSS + design tokens + scroll animations
├── public/                 # Static assets served by Vite
│   └── assets/             # Images, video, audio, PDF
├── template-source/        # Original ZINE.04 template reference
├── vercel.json             # Vercel deployment config
├── vite.config.ts          # Vite build configuration
└── package.json            # Dependencies & scripts
```

---

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` (optional, only needed for cloud fallback features):
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000

### Build for Production

```bash
npm run build
npm run preview
```

---

## Deploy to Vercel

This project is pre-configured for Vercel deployment:

1. Push this repository to GitHub
2. Import the repository into [Vercel](https://vercel.com)
3. Vercel automatically detects the `vercel.json` configuration
4. Deploy with default settings — no environment variables required for static hosting

The `vercel.json` configures:
- Build output: `dist/` directory
- Static asset caching headers
- Rewrite rules for the pilot-site static pages

---

## Architecture Notes

- **Build Tool:** Vite 8 with React 19, TypeScript 7, Tailwind CSS 4
- **Styling:** Tailwind CSS v4 + custom CSS custom properties (zine aesthetic)
- **Icons:** lucide-react
- **Animations:** motion (Framer Motion)
- **Form Backend:** Both forms post to `/api/pilot-signup` and `/api/pilot-feedback` placeholder endpoints with zero third-party trackers

---

## Privacy & Zero-Telemetry Guarantee

- Zero third-party trackers or ad networks
- No analytics pixels or crash reporting daemons
- User data remains on-device; transmissions occur strictly upon user-initiated form submission
- Full plain-language privacy policy at `pilot-site/privacy.html`

---

## License

Licensed under the **GNU General Public License v3.0 (GPLv3)**. See the full license text for details.

---

## Contact

- **Maintainer:** Sumit Nawale
- **Email:** [sumitnawale123456@gmail.com](mailto:sumitnawale123456@gmail.com)
- **GitHub:** [github.com/itzlucifa/sneha.pilot](https://github.com/itzlucifa/sneha.pilot)