# Step 1 — Template Spec (extracted from `index.html`, "ZINE.04")

Source: `index.html` (single file, inline CSS + 8 lines of JS), assets `assets/img/29-zine-page.jpg`, `assets/img/29-zine-stack.jpg`.
All values below come from the source. Where a value is not in the source it says **[UNKNOWN]**.

---

## 1. Pages & sections (in order)

The template is **one page**. There are no other pages.

| # | Section (class) | Purpose in template | Proposed pilot mapping |
|---|---|---|---|
| 0 | `.grain` + `.ink-bleeds` | Fixed decorative overlays: SVG noise (opacity .18, multiply) and 3 blurred colour blobs | Keep (decorative, `aria-hidden`) |
| 1 | `header` | Wordmark, 5-link nav (centre), primary CTA (right) | Brand + nav + "Join the pilot" CTA |
| 2 | `.hero` | 2-col: stamps, giant h1 with italic sub-line, lead paragraph, 3 stat blocks / rotated cover image + spinning sticker | Hero (name, pitch, CTA, feedback link). **Stat blocks must be removed or replaced with verifiable facts only (e.g. "Android 8.0+ / SDK 26")** — no invented metrics |
| 3 | `.contents#contents` | Section heading + 2-col grid of 8 numbered "TOC" cards | Features (verified only) |
| 4 | `.spread` | 2-col: rotated image + long-form text with drop cap and byline | Screenshots (placeholders with dimensions) |
| 5 | `.pull` | Centered pull-quote with citation | **Drop** — a quote would be an invented review (Step 6) |
| 6 | `.sub#sub` | Pink full-bleed CTA band, 2 pricing "tier" cards | Pilot sign-up form |
| — | (none) | — | Feedback form: **no template equivalent**, will reuse `.sub`/`.tier` styling |
| — | (none) | — | Privacy page: **no template equivalent**, will reuse `.spread .txt` typography |
| 7 | `footer` | Dark band: brand + blurb, 3 link columns, copyright strip | License, repo, contact |

## 2. Typography

Fonts loaded from Google Fonts: **Bowlby One** (400), **Crimson Pro** (400, 600, 400 italic), **Space Grotesk** (400, 500, 700).

Fallbacks in source: Space Grotesk → `sans-serif` (on body only). Bowlby One → `sans-serif` (only on `.brand-z`; elsewhere none). **Crimson Pro → none declared** (falls back to browser default). Will add `Georgia, serif` / `Impact, sans-serif` fallbacks — flagged as an addition.

| Role | Family | Size | Weight | Line height | Letter spacing | Case |
|---|---|---|---|---|---|---|
| Body (base) | Space Grotesk | not set (browser 16px) | 500 | 1.5 | normal | — |
| Header wordmark `.brand-z` | Bowlby One | 32px | 400 | .9 | -.01em | upper |
| Hero H1 | Bowlby One | clamp(72px,12vw,180px); ≤880: clamp(56px,16vw,96px) | 400 | .84 | -.025em | upper |
| Hero H1 sub-line `em` | Crimson Pro italic | .55em | 400 | 1 | -.005em | none |
| Section H2 `.s-head h2` | Bowlby One | clamp(56px,9vw,130px) | 400 | .88 | -.025em | upper |
| Section H2 sub `em` | Crimson Pro italic | .45em | 400 | 1.1 | -.005em | none |
| Spread H3 | Bowlby One | 80px; ≤880: 48px | 400 | .92 | -.025em | upper |
| Spread H3 `em` | Crimson Pro italic | .6em | 400 | 1.05 | — | none |
| CTA band H2 `.sub h2` | Bowlby One | clamp(54px,8vw,108px) | 400 | .95 | -.025em | upper |
| Pull quote | Bowlby One | clamp(40px,6vw,72px) | 400 | 1.05 | -.025em | upper |
| Tier H4 (price) | Bowlby One | 54px | 400 | .9 | -.025em | upper |
| Footer wordmark | Bowlby One | 54px | 400 | .9 | — | upper |
| Card number `.pg` | Bowlby One | 64px | 400 | .85 | -.025em | — |
| Stat number `.hero-meta b` | Bowlby One | 36px | 400 | .95 | -.02em | — |
| Drop cap | Bowlby One | 72px | 400 | .8 | — | — |
| Card H3 `.toc-item h3` | Space Grotesk | 24px | 700 | 1.1 | -.01em | — |
| Hero lead `p` | Crimson Pro italic | 22px | 400 | 1.5 | — | — |
| Spread lead (first p) | Crimson Pro italic | 24px | 400 | 1.4 | — | — |
| Spread body | Crimson Pro | 18px | 400 | 1.65 | — | — |
| CTA band `p` | Crimson Pro italic | 18px | 400 | 1.5 | — | — |
| Card body | Crimson Pro italic | 16px | 400 | 1.5 | — | — |
| Tier list / small | Crimson Pro italic | 15px | 400 | 1.6 | — | — |
| Footer blurb | Crimson Pro italic | 15px | 400 | 1.55 | — | — |
| Primary button `.head-buy` | Space Grotesk | 13px | 700 | — | .04em | upper |
| Nav link | Space Grotesk | 12px | 700 | — | .06em | upper |
| Secondary button `.buy` | Space Grotesk | 12px | 700 | — | .04em | upper |
| Stamp / label | Space Grotesk | 11px | 700 | — | .16em | upper |
| Meta / byline / footer H5 | Space Grotesk | 10–11px | 700 | — | .18em | upper |
| Footer base / copyright | Space Grotesk | 12px / 10px | 500 | — | — / .18em | — / upper |

## 3. Colour tokens

Declared on `:root`:

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f5ecd4` | Background, card surface, text on dark/pink |
| `--paper2` | `#eedcb4` | Alt surface (spread band, card hover), muted text on dark |
| `--ink` | `#1f1a0e` | Primary text, borders, hard shadows, footer background |
| `--pink` | `#ff4a8a` | Primary accent: CTA fill, CTA band, highlights, bylines |
| `--blue` | `#0e4dff` | Secondary accent: italic emphasis, labels, text-shadow |
| `--orange` | `#ff7028` | Tertiary accent: hover fill, sticker, decoration |

Hardcoded in components (not tokenised): `#3a3320` (card body text), `#2a2515` (long-form body), `#5a4f30` (muted small text), `#fff` (selection text), `rgba(245,236,212,.3)` (footer divider = paper @30%).

- Border: = `--ink` (2px / 3px). No separate border token.
- Muted text: three hardcoded browns above; no token.
- **Success: [UNKNOWN]** · **Error: [UNKNOWN]** · **Focus ring: [UNKNOWN]**
- **Dark mode: none in template.**

**Contrast notes, worked out by hand (still to confirm in Step 7):**
- ink on paper ≈ 15:1 ✅ · blue on paper ≈ 5.1:1 ✅ · ink on pink ≈ 5.4:1 ✅ · pink on ink ≈ 5.4:1 ✅
- **pink `#ff4a8a` on paper ≈ 2.7:1 ❌** (template uses it for 10px bylines and 36px stat numbers)
- **orange `#ff7028` on paper ≈ 2.4:1 ❌** (template uses it for an 11px byline)
- **paper text on pink band ≈ 2.7:1 ❌** (template's `.sub p`, 18px italic)

## 4. Layout, spacing, shape

- **Spacing scale:** no formal scale. Values used: 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 24, 28, 32, 36, 48, 60, 80, 100 px.
- **Section padding:** desktop 60–100px vertical × 28px horizontal; ≤880: 40–60px × 18px.
- **Containers:** 1400px (main), 1100px (pull quote), 880px (CTA band inner), 680px (tier grid), 480–520px (paragraph measure).
- **Grids:** hero 1.4fr/1fr gap 48 · cards 2-col gap 24 · spread 1fr/1fr gap 48 · tiers 1fr/1fr gap 18 · footer 2fr/1fr/1fr/1fr gap 32.
- **Breakpoints:** **one, `max-width: 880px`** → everything goes to one column, nav is hidden, footer goes to 2-col. There is no separate tablet layout (768 uses the ≤880 layout).
- **Radii:** 0 everywhere; 50% only for circles (sticker, blobs).
- **Borders:** 3px solid ink (cards, header bottom, images), 2px solid ink (stamps, buttons), 3px dashed ink (section dividers), 2px dashed (bylines, footer).
- **Shadows (hard offset, no blur):** 3px 3px (stamp), 4px→6px (button rest→hover), 6px→10px (card rest→hover), 14px→18px (hero image), 14px pink (spread image). Text shadows: layered offsets 2–6px in blue/orange/pink.
- **Rotation as style:** stamps −2°/+2°, hero image +2°, spread image −2°, nav hover −2°.

## 5. Components & states

| Component | Rest | Hover | Focus | Active | Disabled |
|---|---|---|---|---|---|
| Primary button `.head-buy` | pink fill, ink 2px border, 4px shadow | translate(−2,−2), 6px shadow, orange fill | **[UNKNOWN]** | **[UNKNOWN]** | **[UNKNOWN]** |
| Secondary button `.buy` | ink fill, paper text | pink fill | [UNKNOWN] | [UNKNOWN] | [UNKNOWN] |
| Nav link | plain | ink fill, paper text, rotate −2° | [UNKNOWN] | — | — |
| Card `.toc-item` / `.tier` | paper, 3px border, 6px shadow | translate(−3,−3), 10px shadow, (toc) paper2 | [UNKNOWN] | — | — |
| Stamp / badge | paper, 2px border, 3px shadow, −2°; `.alt` = blue fill | — | — | — | — |
| Sticker | 140px orange circle, spinning (110px ≤880) | — | — | — | — |
| Footer link | paper2 | pink | [UNKNOWN] | — | — |
| Divider | 3px dashed ink / 2px dashed | — | — | — | — |
| **Form inputs / labels / select / radio / error text** | **[UNKNOWN] — the template has no forms** | | | | |
| **Mobile nav** | **[UNKNOWN] — nav is just hidden ≤880, nothing replaces it** | | | | |
| Icons | **None.** Typographic glyphs only: `→`, `●`, `//` | | | | |

## 6. Imagery & motion

- **Imagery:** two photos of printed zines, 3:4, 3px ink border, hard offset shadow, slight rotation. Plus SVG noise and blurred multiply blobs. No illustrations.
- **Motion:**
  - `.reveal`: opacity 0→1, translateY(36px) rotate(−1°)→none, `.7s cubic-bezier(.34,1.56,.64,1)`, set off by IntersectionObserver (threshold .1).
  - Sticker: `spin 18s linear infinite`.
  - Hovers: `transition: .2s` (buttons, nav, links) / `.4s` (cards, hero image) on *all* properties.
  - **No `prefers-reduced-motion` handling** (I'll add it).
- The design doesn't need motion to work: content is readable with it off. Note that `.reveal` content starts at opacity 0, so it stays hidden if JS doesn't run. I'll fix that.

## 7. Copy tone & placeholders

- Tone: warm, wry, editorial, a bit self-deprecating ("we keep the mistakes"). Pattern: a loud uppercase headline, then an italic serif sub-line starting with "—". Labels start with `// `, CTAs end with `→`.
- Placeholders: every nav and footer link is `href="#"`; email is `hello@zine04.example`; all names, prices, counts and quotes are fictional.

---

## [UNKNOWN] list

**Template values**
1. Success colour
2. Error colour
3. Focus-ring style
4. Active / pressed button state
5. Disabled button state
6. Form-field styling (input, select, radio, label, help/error text)
7. Mobile navigation pattern (nav is hidden ≤880 with nothing in its place)
8. Distinct tablet layout (only one breakpoint, 880px)
9. Dark-mode palette (none)
10. Body base font size (not declared; inherits 16px)

**Inputs from your brief — still empty**
11. `[APP_NAME]`
12. `[PACKAGE]`
13. `[TARGET]` SDK
14. `[ONE-LINE PITCH]` + feature list
15. Repo path / URL (**Step 2 is blocked without it**)
16. `[FORM SERVICE]` / `[API ENDPOINT]`
17. License (GPLv3 not confirmed yet)
18. Contact address

More than three values are unknown, so I'm stopping here as you asked.
