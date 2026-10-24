# Step 1 — Template Spec (SNEHA Pilot Distribution Edition)

Extracted from template source `index.html` ("ZINE.04") and integrated with SNEHA app specifications.
Brand: **SNEHA**  
Package: `com.sneha.app`  
Target SDK: 35 (Android 15) | Min SDK: 26 (Android 8.0)  
License: GPLv3 (confirmed)  
Contact: sumitnawale123456@gmail.com  
Pitch: *"SNEHA is the AI companion that never goes down, never has to leak your data, and actually does things for you - on a phone you already own, at near-zero infrastructure cost."*

---

## 1. Pages & Sections (in order)

The pilot distribution site consists of three dedicated HTML pages sharing the unified zine design system:
1. `index.html` (Landing Page + Pilot Tester Sign-up)
2. `feedback.html` (Tester Feedback Form)
3. `privacy.html` (Plain-Language Privacy Policy)

### Landing Page (`index.html`) Section Mapping

| # | Section (class) | Purpose in template | SNEHA Pilot Site Implementation |
|---|---|---|---|
| 0 | `.grain` + `.ink-bleeds` | Fixed decorative overlays: SVG noise (opacity .18, multiply) and 3 blurred colour blobs | Retained (`aria-hidden="true"`). Pure CSS & inline SVG data URI, no external dependencies. |
| 1 | `header` | Wordmark, 5-link nav (centre), primary CTA (right) | SNEHA wordmark with ink-drop dot, navigation (`#features`, `#screenshots`, `#signup`, `feedback.html`, `privacy.html`), and primary CTA button ("Join Pilot →"). Mobile nav drawer toggle. |
| 2 | `.hero` | 2-col: stamps, giant h1 with italic sub-line, lead paragraph, 3 stat blocks / rotated cover image + spinning sticker | Hero section featuring: SNEHA title, "Android 8.0+ // Open Source" stamps, one-line pitch, verifiable factual stats (Min SDK 26, Target SDK 35, GPLv3 License, 0 Cloud Trackers), "Join Pilot" CTA + "Send Feedback" text link, rotated screenshot showcase + spinning pilot status sticker. |
| 3 | `.contents#features` | Section heading + 2-col grid of numbered cards | Verified features grid based on Step 2 audit. Numbered cards with feature tags, titles, descriptions, and audit badges (EXISTS / PARTIAL caveats). |
| 4 | `.spread#screenshots` | 2-col: rotated image + long-form editorial feature | App Screenshot Showcase: responsive striped placeholders with clear pixel dimensions (1080×2400 9:19.5 aspect ratio), accompanied by UI architecture narrative and technical overview. |
| 5 | `.pull` | Centered pull-quote | Factual technical pledge: "Built to run locally on the phone in your pocket — zero external telemetry, zero subscription fees, transparent GPLv3 code." (No invented reviews or fake awards). |
| 6 | `.sub#signup` | Pink full-bleed CTA band with 2 tier cards | Pilot Sign-up section: Explanatory intro clarifying that only strictly necessary data is stored, alongside the clean 4-field sign-up form (Name, Email, Android Version, Device Model). |
| 7 | `footer` | Dark ink band: brand + blurb, link columns, copyright strip | Brand summary, verified links to documentation, feedback, privacy, contact (`sumitnawale123456@gmail.com`), GitHub repository placeholder, and GPLv3 Open Source license statement. |

### Feedback Page (`feedback.html`) Section Mapping
- Header matching template with back link to landing page.
- Section with `.sub` & `.tier` card styling for user-initiated review:
  - Rating (1 to 5 buttons / stars)
  - What worked well
  - What broke / bugs encountered
  - What features to add next
  - Tester email and device details
- Post submission to placeholder endpoint `/api/pilot-feedback`. Zero trackers.

### Privacy Page (`privacy.html`) Section Mapping
- Header matching template with navigation back to landing and feedback.
- Styled using `.spread .txt` typography:
  - Exact breakdown of what stays on-device (local model cache, offline memory, app settings, feedback drafts).
  - Exact breakdown of what leaves device (only user-initiated feedback submissions).
  - Explicit declaration of API providers (none default, zero trackers, zero crash reporting SDKs).
  - GPLv3 source code auditing guarantee.

---

## 2. Typography & Hierarchy

Fonts imported via Google Fonts:
- **Bowlby One** (400)
- **Crimson Pro** (400, 600, 400 italic)
- **Space Grotesk** (400, 500, 700)

### Declared Fallbacks (Robust System Fallbacks):
- Bowlby One: `'Bowlby One', Impact, 'Arial Black', sans-serif`
- Crimson Pro: `'Crimson Pro', Georgia, Cambria, 'Times New Roman', serif`
- Space Grotesk: `'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

| Role | Family | Size | Weight | Line Height | Letter Spacing | Case |
|---|---|---|---|---|---|---|
| Body Base | Space Grotesk | 16px (1rem) | 500 | 1.5 | normal | — |
| Brand Wordmark | Bowlby One | 32px | 400 | 0.9 | -0.01em | UPPER |
| Hero H1 | Bowlby One | clamp(56px, 10vw, 140px) | 400 | 0.86 | -0.025em | UPPER |
| Hero H1 Sub-line `em` | Crimson Pro italic | 0.52em | 400 | 1.05 | -0.005em | Normal |
| Section H2 `.s-head h2` | Bowlby One | clamp(44px, 7vw, 104px) | 400 | 0.9 | -0.025em | UPPER |
| Section H2 Sub `em` | Crimson Pro italic | 0.45em | 400 | 1.15 | -0.005em | Normal |
| Section H3 / Card Title | Space Grotesk | 22px | 700 | 1.15 | -0.01em | Normal |
| Editorial Feature H3 | Bowlby One | clamp(36px, 5vw, 64px) | 400 | 0.95 | -0.025em | UPPER |
| Hero Lead `p` | Crimson Pro italic | 21px | 400 | 1.5 | normal | Normal |
| Long-form Body `p` | Crimson Pro | 18px | 400 | 1.65 | normal | Normal |
| Card Body `p` | Crimson Pro italic | 16px | 400 | 1.5 | normal | Normal |
| Input & Button Text | Space Grotesk | 13–14px | 700 | 1.2 | 0.04em | UPPER / Normal |
| Small Tags & Stamps | Space Grotesk | 11px | 700 | 1.0 | 0.16em | UPPER |
| Footer Wordmark | Bowlby One | 48px | 400 | 0.9 | normal | UPPER |
| Footer Text & Meta | Space Grotesk | 11–13px | 500/700 | 1.5 | 0.12em | Normal / UPPER |

---

## 3. Colour Tokens & Contrast Corrections

Declared on `:root`:

```css
:root {
  /* Core Template Tokens */
  --paper: #f5ecd4;       /* Warm background, card surface */
  --paper2: #eedcb4;      /* Alt surface, hover state, secondary container */
  --ink: #1f1a0e;         /* High-contrast primary text, solid borders, shadows */
  --pink: #ff4a8a;        /* Vibrant brand accent, button/badge fill */
  --blue: #0e4dff;        /* Secondary accent, links, emphasis, focus */
  --orange: #ff7028;      /* Tertiary accent, status highlights, hover states */

  /* Derived Tokens for Template Gaps */
  --success-bg: #eedcb4;  /* Paper alt fill with ink text */
  --success-text: #0e4dff;/* Crisp blue on paper (5.1:1 contrast) */
  --error-bg: #ff4a8a;    /* Pink fill */
  --error-text: #1f1a0e;  /* Ink text on pink (5.4:1 contrast) */
  --focus-ring: 3px solid #0e4dff;
  --focus-offset: 2px;

  /* Form Element Tokens */
  --input-bg: #f5ecd4;
  --input-border: 2.5px solid #1f1a0e;
  --input-shadow: 4px 4px 0 #1f1a0e;
}
```

### Contrast Fix Summary (WCAG AA Compliance)
1. **Pink on Paper Fix:** Template used `#ff4a8a` text on `#f5ecd4` (contrast 2.7:1 — FAIL). Switched text to `--ink` (`#1f1a0e`, contrast 15:1 — PASS) or `--blue` (`#0e4dff`, contrast 5.1:1 — PASS). Pink is preserved exclusively as a vibrant solid fill or thick border.
2. **Orange on Paper Fix:** Template used `#ff7028` text on `#f5ecd4` (contrast 2.4:1 — FAIL). Switched text to `--ink` over orange background (contrast 6.1:1 — PASS).
3. **Paper Text on Pink Band Fix:** Template used `#f5ecd4` text on `#ff4a8a` (contrast 2.7:1 — FAIL). Switched text to `--ink` on pink background (contrast 5.4:1 — PASS).

---

## 4. Layout, Spacing, & Responsive Breakpoints

- **Spacing Scale:** 4px, 8px, 12px, 16px, 20px, 24px, 32px, 48px, 64px, 80px, 96px.
- **Max Container Widths:**
  - Main Grid: 1400px
  - Content Text Measure: 720px
  - Form & Pricing Card Container: 780px
- **Responsive Breakpoints:**
  - `Desktop`: > 880px (Multi-column hero, 2-column feature cards, 4-column footer)
  - `Tablet`: 541px – 880px (Stacked hero, single-column features, 2-column footer, visible mobile nav bar)
  - `Mobile Phone`: ≤ 540px / 375px (Compact padding 16px, full-width buttons, accessible 44px+ touch targets, zero horizontal overflow)
- **Hard Shadows (Zero-blur Neo-Brutalist offset):**
  - Buttons: `4px 4px 0 var(--ink)` (hover `6px 6px 0 var(--ink)`)
  - Cards: `6px 6px 0 var(--ink)` (hover `10px 10px 0 var(--ink)`)
  - Images / Frames: `12px 12px 0 var(--ink)` (hover `16px 16px 0 var(--ink)`)
- **Rotations:** Stamps `-2°` / `+2°`, hero cards `+1.5°`, sticker continuous 18s rotation.

---

## 5. Components & State Specifications

- **Primary Button (`.head-buy` / `.btn-primary`):**
  - *Rest:* Pink fill, ink 2.5px border, 4px hard shadow.
  - *Hover:* Orange fill, -2px translate, 6px hard shadow.
  - *Focus:* 3px solid `--blue` outline with 2px offset.
  - *Active:* 2px translate, 2px hard shadow.
  - *Disabled:* 50% opacity, pointer-events none, grayscale tint.
- **Secondary Button (`.btn-secondary`):**
  - *Rest:* Ink fill, paper text, 2.5px border.
  - *Hover:* Blue fill, -2px translate, 6px shadow.
- **Form Controls (Text inputs, select, textarea):**
  - 2.5px solid ink border, paper background, 100% width, padding 12px 14px, Space Grotesk font.
  - *Focus:* 4px 4px 0 var(--blue), outline 2px solid var(--blue).
  - *Labels:* Bold uppercase Space Grotesk, 12px with `.14em` letter-spacing.
  - *Helper/Privacy Note:* Crimson Pro italic, 14px, explicitly stating: "We only collect this to verify Android test compatibility. Never sold or shared."
- **Screenshot Placeholders:**
  - High-contrast SVG striped pattern with explicit overlay dimension tags (e.g. `1080 × 2400 px — On-Device Chat & Intent Engine`).

---

## 6. Imagery, Motion & Accessibility

- **Motion:**
  - IntersectionObserver `.reveal` transition with fallback to visible if JavaScript is disabled.
  - Reduced Motion Support: `@media (prefers-reduced-motion: reduce)` disables all transforms, spins, and transitions, keeping content instantly visible.
- **Accessibility:**
  - Full semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
  - Visible focus indicators on all interactive elements.
  - Accessible labels on all form controls (`for` / `id` associations).

---

## 7. Resolution of the 18 [UNKNOWN] Items

1. **Success Colour:** Resolved to `#0e4dff` (blue) border/icon with `#eedcb4` (paper2) surface and `#1f1a0e` (ink) text.
2. **Error Colour:** Resolved to `#ff4a8a` (pink) background with `#1f1a0e` (ink) text (5.4:1 contrast).
3. **Focus-Ring Style:** Resolved to `3px solid #0e4dff` with `2px` offset.
4. **Active/Pressed Button State:** Resolved to `translate(2px, 2px)` with shadow reduced to 2px.
5. **Disabled Button State:** Resolved to `opacity: 0.5; cursor: not-allowed`.
6. **Form-Field Styling:** Created complete form design system adhering to the ink/paper/pink aesthetic.
7. **Mobile Navigation:** Added accessible mobile navigation drawer with hamburger toggle for screens ≤ 880px.
8. **Distinct Tablet Layout:** Calibrated 768px tablet layout with balanced padding, 2-column footer, and fluid typography.
9. **Dark-Mode Palette:** Template is intentionally an authentic riso-printed paper publication; dark mode is not part of the physical riso zine idiom and paper theme is enforced with high contrast.
10. **Body Base Font Size:** Standardized to 16px (1rem).
11. **`[APP_NAME]`:** Confirmed as **SNEHA**.
12. **`[PACKAGE]`:** Confirmed as `com.sneha.app`.
13. **`[TARGET]` SDK:** Confirmed as 35 (Android 15) with Min SDK 26 (Android 8.0).
14. **`[ONE-LINE PITCH]`:** Confirmed: *"SNEHA is the AI companion that never goes down, never has to leak your data, and actually does things for you - on a phone you already own, at near-zero infrastructure cost."*
15. **Repo Path / URL:** Audited against workspace and repository specifications; verified claims documented in Feature Audit.
16. **`[FORM SERVICE] / [API ENDPOINT]`:** Configured single placeholder endpoint `/api/pilot-feedback` and `/api/pilot-signup` with zero external trackers.
17. **License:** Confirmed as **GPLv3**.
18. **Contact Address:** Confirmed as `sumitnawale123456@gmail.com`.
