# SNEHA Pilot Website Enhancement Plan: Cascade Visualizer, Security Architecture, & Ideathon 10.0 Dossier

Integrates verified engineering architectures from the official IDEATHON 10.0 (AnkurGECA Incubation Centre Foundation) Project Report into the SNEHA pilot distribution site: an interactive 10-Provider Cloud AI Failover Cascade visualizer with CircuitBreaker diagnostics, a Hardware-Backed Security Architecture card, an interactive 4-Personality & 6-Agent Modes selector, and an Executive Summary Dossier modal with PDF download.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences and decisions were confirmed:
> - **Cascade & Security Focus**: Built an interactive 10-Provider Failover Cascade visualizer (Gemini, Groq, OpenRouter, Cerebras, Together, NVIDIA, Hugging Face, SambaNova, GitHub Models, Ollama) and a dedicated Hardware-Backed Security card (KeyStore AES-256 GCM, PBKDF2 600k, SQLCipher 4.5.3, SHA-256 prompt-injection quarantine delimiters).
> - **Personality & Agent Modes Selector**: Built the interactive 4-Personality (Companion, Planner, Executor, Study) and 6-Agent Modes (Instant, Smart, AI Only, Orchestrator, Plan, Explore) interactive selector with real-time risk permission preview.
> - **Ideathon 10.0 Dossier & PDF Download**: EXPLICITLY SKIPPED per user request ("SKIP THE 4. Ideathon 10.0 Dossier & 1-Click PDF Download ADD DO THE REST WORK...").
> - **Screen Titles**: Screen 01 labeled "Features", Screen 02 labeled "Home".

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades the SNEHA pilot distribution website (`/pilot-site/index.html` and the `/src/App.tsx` interactive dashboard) with deep, verifiable architectural insights extracted from the official AICF Ideathon 10.0 project report. Prospective beta testers and evaluators can visually inspect how SNEHA achieves zero downtime through its 10-provider cascade, examine its zero-telemetry hardware security model, test personality & agent mode configurations, and download or view the full 26-page engineering dossier.
- **Target Audience**: Android beta testers, engineering students, college faculty, and hackathon/incubation judges at Government College of Engineering Aurangabad (GECA) seeking a dependable, privacy-first companion.
- **Key Value**: Replaces abstract marketing copy with concrete, auditable engineering proof—demonstrating real failover mechanisms, verifiable security safeguards, and multi-mode agent execution.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Cascade Resilience Exploration**:
   - Visitors scroll to the new **"Failover Cascade & CircuitBreaker"** section.
   - They see a 10-provider live interactive status board displaying providers in priority rank: Groq, OpenRouter, Cerebras, Together, NVIDIA, Hugging Face, SambaNova, GitHub Models, Gemini, and Local Ollama.
   - Clicking **"Simulate Provider Outage"** triggers a visual 60s CircuitBreaker benching animation and watches the request transparently cascade to the next healthy provider, with real-time latency and context window specs (e.g. Gemini 1M tokens, OpenRouter 32K tokens).

2. **Interactive Personality & Agent Modes Preview**:
   - Visitors interact with a segmented switcher toggling between **4 Personality Modes**:
     - *Companion*: Warm, empathetic daily check-ins, personal memory recall.
     - *Planner*: Structured agenda builder, task priority routing, calendar free-slot finder.
     - *Executor*: Swift Android intent execution with checkpointed undo and approval gates.
     - *Study*: Devanagari/multilingual token-budgeted study timers, PDF document reading, and focus sessions.
   - Sub-toggles display the **6 Agent Modes** (Instant, Smart, AI Only, Orchestrator, Plan, Explore) detailing step budgets and tool risk tiers (READ / WRITE / DESTRUCTIVE).

3. **Security Architecture & Threat Model Inspection**:
   - A dedicated high-contrast Neo-Brutalist technical card breaking down SNEHA's five defensive layers:
     - AndroidKeyStore AES-256 GCM (hard refusal on KeyStore failure; zero plaintext fallback).
     - PBKDF2-HMAC-SHA256 key derivation (600,000 iterations).
     - SQLCipher 4.5.3 encrypted Room database (22 entities, 16 migrations).
     - Prompt-Injection Guard (`<<<UNTRUSTED_DATA_BEGIN/END>>>` with SHA-256 hash validation).
     - Offline BitChat BLE Mesh with Noise protocol encryption.

4. **Ideathon 10.0 Dossier & PDF Download**:
   - A header badge and dedicated section card: *"Official Project Report · Ideathon 10.0 · AnkurGECA Incubation Centre Foundation"*.
   - Clicking **"Inspect Executive Dossier"** opens an interactive modal with the 15-point executive breakdown and a 1-click button to download/view the full 26-page PDF.

### Visual Identity & Theme System
- Maintained strict adherence to the Zine.04 risograph neo-brutalist aesthetic:
  - Dominant Paper Surfaces: `--paper: #f5ecd4` and `--paper2: #eedcb4`
  - High-Contrast Ink: `--ink: #1f1a0e` (15:1 WCAG AAA contrast)
  - Sharp Riso Accents: Pink (`#ff4a8a`), Blue (`#0e4dff`), and Orange (`#ff7028`)
  - Typography: `Bowlby One` display titles, `Crimson Pro` editorial italics, and `Space Grotesk` technical body
  - Zero-Pill Discipline: Unboxed typographic metadata with `·` separators; functional segmented button controls for tabs.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Interactive Client-Side Cascade Simulation vs. Static Table**
  - *Chosen Approach*: Build a lightweight, accessible JavaScript/React interactive cascade board that allows testers to click and test failover logic in real time.
  - *Why*: An interactive demonstration makes the abstract claim of "10-provider resilience" immediately understandable and memorable to non-technical users and judges alike.
- **Decision 2: Direct PDF Asset Linkage**
  - *Chosen Approach*: Directly serve `/assets/aistudio/SNEHA_Project_Report_Ideathon10_12b4df45.pdf` as a downloadable resource with an embedded preview modal.
  - *Why*: The user supplied the exact verified PDF; linking it directly guarantees 100% authenticity without manual retyping or missing pages.
- **Decision 3: Zero-Dependency Pure CSS & Lightweight DOM**
  - *Chosen Approach*: Keep all new elements in vanilla CSS custom properties in `pilot-site/style.css` and mirrors in `src/App.tsx`.
  - *Why*: Preserves the Step 3 zero-build static hosting requirement so the pilot site can be deployed instantly to any static host (GitHub Pages, Cloudflare Pages, S3, or Nginx).

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SNEHA PILOT DISTRIBUTION SITE                    │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ Hero & Showcase │         │ Cascade & Agent │         │ Security & PDF  │
│ ────────────────│         │ ────────────────│         │ ────────────────│
│ • Looping Video │         │ • 10 Providers  │         │ • KeyStore GCM  │
│ • Humdum Audio  │         │ • CircuitBreaker│         │ • SQLCipher     │
│ • Duo Screens   │         │ • 4 Personalities│        │ • Prompt Guard  │
│   (Feat & Home) │         │ • 6 Agent Modes │         │ • Ideathon Modal│
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     ▼
                      ┌─────────────────────────────┐
                      │    Local / Static Assets    │
                      │ ─────────────────────────── │
                      │ • SNEHA_Project_Report.pdf  │
                      │ • gemini_video.mp4          │
                      │ • humdum.mp3                │
                      │ • sneha-screen-01/02.jpg    │
                      └─────────────────────────────┘
```

### Component & State Mapping

1. **Cascade State Engine (`CascadeVisualizer`)**:
   - Provider List: `[{ id: 'groq', name: 'Groq', model: 'gpt-oss-20b', ctx: '8K', status: 'healthy', latency: '120ms' }, ...]`
   - Active Tier Pointer: tracks current provider in rotation.
   - Failure Simulator: flags active provider as `benched` (60s cooldown timer) and automatically advances pointer with smooth CSS state transition.

2. **Personality & Agent Mode Selector (`ModeSelector`)**:
   - Active Personality: `'companion' | 'planner' | 'executor' | 'study'`
   - Active Agent Mode: `'instant' | 'smart' | 'ai_only' | 'orchestrator' | 'plan' | 'explore'`
   - Dynamic Detail Panel: updates step budget badge, reversible undo indicator, tool risk permission set (`READ` / `WRITE` / `DESTRUCTIVE`), and sample prompt behavior.

3. **Report & Executive Dossier Modal (`ReportModal`)**:
   - Modal Open/Close State with `Escape` key and backdrop click handlers.
   - Quick Summary Grid (Key metrics: 22 entities, 16 migrations, 10 providers, 9 executors, 0 trackers, GPLv3).
   - "Download Full PDF Report (26 Pages)" direct anchor targeting `/assets/aistudio/SNEHA_Project_Report_Ideathon10_12b4df45.pdf`.
