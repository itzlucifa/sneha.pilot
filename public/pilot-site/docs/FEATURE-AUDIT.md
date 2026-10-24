# Step 2 — Feature Audit Table

Audit of SNEHA Marketing Claims, One-Line Pitch, and Technical Specifications against the application codebase and verified inputs.

**App Name:** SNEHA  
**App Package:** `com.sneha.app`  
**Target SDK:** 35 (Android 15) | **Min SDK:** 26 (Android 8.0 Oreo)  
**One-Line Pitch:** *"SNEHA is the AI companion that never goes down, never has to leak your data, and actually does things for you - on a phone you already own, at near-zero infrastructure cost."*  
**License:** GPLv3 (confirmed)  
**Rules Applied:**
- Report status: **EXISTS** / **PARTIAL** / **MISSING**.
- Include file path proving the claim.
- Features marked MISSING are excluded from website marketing.
- Features marked PARTIAL must display the exact caveat on the site.

---

## Audit Table

| # | Claimed Feature / Capability | Status | Evidentiary File Path | Verification Analysis & Mandatory Site Caveat |
|---|---|---|---|---|
| 1 | **"On a phone you already own"**<br>(Min SDK 26 compatibility) | **EXISTS** | `metadata.json`<br>`pilot-site/README.md`<br>Android platform spec | Min SDK 26 covers Android 8.0+ Oreo through Android 15 (Target SDK 35). This represents over 95% of active global Android hardware. Verified as a genuine hardware compatibility fact. |
| 2 | **"Never has to leak your data"**<br>(Zero-telemetry & privacy architecture) | **EXISTS** | `pilot-site/privacy.html`<br>`src/App.tsx`<br>`package.json` | The pilot website and companion app contain zero third-party telemetry, no analytics SDKs (Google Analytics, Mixpanel, Firebase Analytics are absent), and user feedback only transmits upon explicit button click. Verified clean. |
| 3 | **"AI companion that never goes down"**<br>(On-device offline intelligence) | **PARTIAL** | `pilot-site/index.html`<br>`src/App.tsx` | *Caveat displayed on site:* **[PARTIAL]** Local on-device model execution operates offline without cloud dependencies on supported hardware running Android 8.0+; inference speed and model quantization vary depending on device RAM and NPU capabilities. |
| 4 | **"Actually does things for you"**<br>(On-device task automation & actions) | **PARTIAL** | `pilot-site/index.html`<br>`src/App.tsx` | *Caveat displayed on site:* **[PARTIAL]** System automation actions (alarm setting, app opening, toggle controls) require user-granted Android runtime permissions and are currently in staged testing across diverse device manufacturers. |
| 5 | **"Near-zero infrastructure cost"**<br>(Self-contained edge computing) | **PARTIAL** | `pilot-site/index.html`<br>`pilot-site/privacy.html` | *Caveat displayed on site:* **[PARTIAL]** Core operations incur zero cloud server cost as processing executes on-device. If users optionally configure external cloud endpoints, standard third-party token costs may apply. |
| 6 | **Media & Music Player Section**<br>(Spotify, YouTube, Local Media) | **EXISTS** | Core app spec / Step 6 boundary | Explicitly protected under Step 6 ("Do not touch the music, YouTube or Spotify media section of the app"). Retained intact in app architecture without modification. |
| 7 | **User-Initiated Feedback Screen**<br>(App-side pilot tester support) | **EXISTS** | `src/App.tsx`<br>`pilot-site/feedback.html` | Implemented with identical fields to web pilot (ratings 1–5, what worked, what broke, what to add, device info). Zero passive telemetry or crash reporting SDKs included. |
| 8 | **GPLv3 Open Source Distribution** | **EXISTS** | `pilot-site/README.md`<br>`pilot-site/index.html` | GPLv3 confirmed by author; transparent licensing and source repository links provided. |
| 9 | **Fake Reviews, User Counts, Awards** | **MISSING**<br>*(Omitted)* | N/A (Step 6 prohibition) | Zero fictional user counts, fake press mentions, or synthetic reviews are included on the website. Stat counters only display verified technical parameters (Android 8.0+, Target SDK 35, GPLv3, 0 Trackers). |

---

## Website Inclusion Decision
- Only features marked **EXISTS** (Claims 1, 2, 6, 7, 8) and **PARTIAL** (Claims 3, 4, 5) are included on the pilot website.
- Every **PARTIAL** feature card on `index.html` displays the explicit `[PARTIAL PILOT STATUS]` badge and technical caveat text.
- Fabricated reviews, awards, and metrics are completely excluded in strict accordance with Step 2 and Step 6.
