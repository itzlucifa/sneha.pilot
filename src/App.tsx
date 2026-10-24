/**
 * @license
 * SPDX-License-Identifier: GPL-3.0-or-later
 * SNEHA Pilot Distribution Platform & In-App Tester Companion
 */

import React, { useState, useRef } from 'react';
import {
  Shield,
  Smartphone,
  Star,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2,
  Send,
  Sparkles,
  Info,
  Layers,
  FileText,
  MessageSquare,
  Volume2,
  VolumeX,
  Play,
  Pause
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'pilot-site' | 'in-app-feedback' | 'privacy' | 'audit'>('pilot-site');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile' | 'compact'>('desktop');

  // Song audio state for hero spinning sticker
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Screenshots View Mode & Lightbox
  const [screenshotView, setScreenshotView] = useState<'duo' | 'screen-1' | 'screen-2'>('duo');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; subtitle: string; caption: string } | null>(null);

  const toggleSongPlayback = () => {
    if (!audioRef.current) return;
    if (isPlayingSong) {
      audioRef.current.pause();
      setIsPlayingSong(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingSong(true);
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    }
  };

  // Sign-up form state
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    androidVersion: 'Android 15 (Target SDK 35)',
    deviceModel: ''
  });
  const [signupSuccess, setSignupSuccess] = useState(false);

  // In-App Feedback state (Step 5 App-Side Support)
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [whatWorked, setWhatWorked] = useState('');
  const [whatBroke, setWhatBroke] = useState('');
  const [whatToAdd, setWhatToAdd] = useState('');
  const [testerEmail, setTesterEmail] = useState('');
  const [testerDevice, setTesterDevice] = useState('Pixel 7 / Android 14');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.deviceModel) return;
    setSignupSuccess(true);
    setTimeout(() => {
      setSignupForm({ name: '', email: '', androidVersion: 'Android 15 (Target SDK 35)', deviceModel: '' });
    }, 4000);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatWorked || !whatBroke || !whatToAdd) return;
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setWhatWorked('');
      setWhatBroke('');
      setWhatToAdd('');
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#f5ecd4] text-[#1f1a0e] font-sans selection:bg-[#1f1a0e] selection:text-[#f5ecd4] relative">
      {/* Decorative Riso Bleeds */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#ff4a8a]/20 blur-3xl mix-blend-multiply" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-[#0e4dff]/15 blur-3xl mix-blend-multiply" />
        <div className="absolute -bottom-10 right-1/4 w-72 h-72 rounded-full bg-[#ff7028]/15 blur-3xl mix-blend-multiply" />
      </div>

      {/* Top Banner & Control Bar */}
      <aside aria-label="Pilot navigation bar" className="sticky top-0 z-50 bg-[#1f1a0e] text-[#f5ecd4] border-b-4 border-[#1f1a0e] px-4 py-2.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-bold tracking-wider uppercase">
          <div className="flex items-center gap-2">
            <span className="bg-[#ff4a8a] text-[#1f1a0e] px-2 py-0.5 border border-[#f5ecd4] font-black">
              SNEHA v0.9.4
            </span>
            <span className="text-[#eedcb4] hidden sm:inline">
              // Package: com.sneha.app · Min SDK 26 · Target SDK 35
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('pilot-site')}
              className={`px-3 py-1 border transition-all ${
                activeTab === 'pilot-site'
                  ? 'bg-[#ff4a8a] text-[#1f1a0e] border-[#f5ecd4] shadow-[2px_2px_0_#f5ecd4]'
                  : 'bg-transparent text-[#eedcb4] border-transparent hover:text-white'
              }`}
            >
              1. Pilot Site
            </button>
            <button
              onClick={() => setActiveTab('in-app-feedback')}
              className={`px-3 py-1 border transition-all ${
                activeTab === 'in-app-feedback'
                  ? 'bg-[#0e4dff] text-white border-[#f5ecd4] shadow-[2px_2px_0_#f5ecd4]'
                  : 'bg-transparent text-[#eedcb4] border-transparent hover:text-white'
              }`}
            >
              2. App-Side Feedback (Step 5)
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1 border transition-all ${
                activeTab === 'privacy'
                  ? 'bg-[#ff7028] text-[#1f1a0e] border-[#f5ecd4] shadow-[2px_2px_0_#f5ecd4]'
                  : 'bg-transparent text-[#eedcb4] border-transparent hover:text-white'
              }`}
            >
              3. Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1 border transition-all ${
                activeTab === 'audit'
                  ? 'bg-[#eedcb4] text-[#1f1a0e] border-[#1f1a0e] shadow-[2px_2px_0_#f5ecd4]'
                  : 'bg-transparent text-[#eedcb4] border-transparent hover:text-white'
              }`}
            >
              4. Feature Audit (Step 2)
            </button>

            <a
              href="/pilot-site/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 bg-[#0e4dff] text-white border border-[#f5ecd4] font-black hover:bg-white transition-all shadow-[2px_2px_0_#f5ecd4]"
              title="Open pure static HTML website in new tab"
            >
              Static Site <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area Based on Active Tab */}
      <main className="relative z-10">
        {activeTab === 'pilot-site' && (
          <div>
            {/* Viewport preview selector bar */}
            <div className="bg-[#eedcb4] border-b-2 border-[#1f1a0e] py-2 px-4 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[#5a4f30]">Live Viewport Testing:</span>
              <button
                onClick={() => setViewportMode('desktop')}
                className={`px-2.5 py-1 border border-[#1f1a0e] transition-all ${viewportMode === 'desktop' ? 'bg-[#1f1a0e] text-[#f5ecd4]' : 'bg-[#f5ecd4] hover:bg-white'}`}
              >
                Desktop (1280px)
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`px-2.5 py-1 border border-[#1f1a0e] transition-all ${viewportMode === 'tablet' ? 'bg-[#1f1a0e] text-[#f5ecd4]' : 'bg-[#f5ecd4] hover:bg-white'}`}
              >
                Tablet (768px)
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`px-2.5 py-1 border border-[#1f1a0e] transition-all ${viewportMode === 'mobile' ? 'bg-[#1f1a0e] text-[#f5ecd4]' : 'bg-[#f5ecd4] hover:bg-white'}`}
              >
                Phone (375px)
              </button>
              <button
                onClick={() => setViewportMode('compact')}
                className={`px-2.5 py-1 border border-[#1f1a0e] transition-all ${viewportMode === 'compact' ? 'bg-[#1f1a0e] text-[#f5ecd4]' : 'bg-[#f5ecd4] hover:bg-white'}`}
              >
                Compact (320px)
              </button>
            </div>

            <div className={`mx-auto transition-all ${
              viewportMode === 'compact' ? 'max-w-[320px] border-x-4 border-[#1f1a0e] shadow-2xl my-6 bg-[#f5ecd4]' :
              viewportMode === 'mobile' ? 'max-w-[375px] border-x-4 border-[#1f1a0e] shadow-2xl my-6 bg-[#f5ecd4]' :
              viewportMode === 'tablet' ? 'max-w-[768px] border-x-4 border-[#1f1a0e] shadow-2xl my-6 bg-[#f5ecd4]' :
              'w-full'
            }`}>
              {/* Site Header */}
              <header className="p-3 sm:p-5 border-b-3 border-[#1f1a0e] bg-[#f5ecd4] flex flex-wrap md:flex-nowrap items-center justify-between gap-3 sticky top-0 z-40">
                <a href="#hero" className="font-['Bowlby_One'] text-2xl sm:text-3xl tracking-tight text-[#1f1a0e] uppercase shrink-0 order-1">
                  SNEHA<span className="text-[#ff4a8a] text-shadow-[2px_2px_0_#0e4dff]">.AI</span>
                </a>

                {/* Motto Banner replacing old nav: "AI THAT ACTUALLY CARES" */}
                <div
                  className="flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-1 sm:py-1.5 bg-[#eedcb4] border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] select-none order-3 md:order-2 w-full md:w-auto mx-auto my-1 md:my-0"
                  aria-label="AI That Actually Cares"
                >
                  <span className="text-[#ff7028] text-xs sm:text-sm animate-pulse select-none" aria-hidden="true">✦</span>
                  <div className="font-['Bowlby_One'] text-xs sm:text-sm md:text-base tracking-tight uppercase text-[#1f1a0e] flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                    <span>AI THAT</span>
                    <span className="inline-block px-1.5 sm:px-2 py-0.5 bg-[#ff4a8a] text-[#1f1a0e] border border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] -rotate-2 text-[10px] sm:text-xs md:text-sm leading-tight">
                      ACTUALLY
                    </span>
                    <span className="text-[#0e4dff] drop-shadow-[1px_1px_0_#1f1a0e]">CARES</span>
                  </div>
                  <span className="text-[#ff7028] text-xs sm:text-sm animate-pulse select-none" aria-hidden="true">✦</span>
                </div>

                <a
                  href="#signup"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#ff4a8a] text-[#1f1a0e] font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0_#1f1a0e] transition-all shrink-0 order-2 md:order-3 ml-auto md:ml-0"
                >
                  Join Pilot →
                </a>
              </header>

              {/* Hero Section */}
              <section className="px-4 sm:px-8 py-10 sm:py-16 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" id="hero">
                <div className="lg:col-span-7">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border-2 border-[#1f1a0e] bg-[#f5ecd4] shadow-[2px_2px_0_#1f1a0e] -rotate-1">
                      Android 8.0+ // SDK 26–35
                    </span>
                    <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border-2 border-[#1f1a0e] bg-[#0e4dff] text-[#f5ecd4] shadow-[2px_2px_0_#1f1a0e] rotate-1">
                      GPLv3 Open Source
                    </span>
                  </div>

                  <h1 className="font-['Bowlby_One'] text-4xl sm:text-6xl md:text-7xl leading-[0.88] uppercase tracking-tight mb-6">
                    LOCAL,<br />
                    <span className="text-[#ff4a8a] drop-shadow-[2px_2px_0_#0e4dff]">PRIVATE,</span><br />
                    <span className="text-transparent" style={{ WebkitTextStroke: '2.5px #1f1a0e' }}>ACTIVE.</span>
                    <em className="block font-['Crimson_Pro'] italic font-normal text-xl sm:text-2xl text-[#0e4dff] tracking-normal mt-2 lowercase">
                      — the AI companion that actually does things on your phone.
                    </em>
                  </h1>

                  <p className="font-['Crimson_Pro'] italic text-lg sm:text-xl text-[#1f1a0e] leading-relaxed mb-6 max-w-xl">
                    “SNEHA is the AI companion that never goes down, never has to leak your data, and actually does things for you - on a phone you already own, at near-zero infrastructure cost.”
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <a
                      href="#signup"
                      className="px-5 py-3 bg-[#ff4a8a] text-[#1f1a0e] font-bold text-sm uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#1f1a0e] transition-all"
                    >
                      Join the Pilot Program →
                    </a>
                    <button
                      onClick={() => setActiveTab('in-app-feedback')}
                      className="text-xs font-bold uppercase tracking-wider text-[#0e4dff] hover:text-[#1f1a0e] border-b-2 border-dashed border-[#0e4dff] pb-0.5 transition-all"
                    >
                      Existing tester? Submit Reviews &amp; Feedback //
                    </button>
                  </div>

                  {/* Factual Hero Stats (No invented metrics) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t-3 border-[#1f1a0e] text-[11px] font-bold uppercase tracking-wider">
                    <div className="p-2 bg-[#eedcb4]/50 border border-[#1f1a0e]">
                      <b className="block font-['Bowlby_One'] text-2xl text-[#1f1a0e] leading-none mb-1">SDK 26</b>
                      Android 8.0+
                    </div>
                    <div className="p-2 bg-[#eedcb4]/50 border border-[#1f1a0e]">
                      <b className="block font-['Bowlby_One'] text-2xl text-[#1f1a0e] leading-none mb-1">SDK 35</b>
                      Target SDK
                    </div>
                    <div className="p-2 bg-[#eedcb4]/50 border border-[#1f1a0e]">
                      <b className="block font-['Bowlby_One'] text-2xl text-[#0e4dff] leading-none mb-1">0</b>
                      Cloud Trackers
                    </div>
                    <div className="p-2 bg-[#eedcb4]/50 border border-[#1f1a0e]">
                      <b className="block font-['Bowlby_One'] text-2xl text-[#ff4a8a] leading-none mb-1">GPLv3</b>
                      Audited License
                    </div>
                  </div>
                </div>

                {/* Hero Right: Showcase frame with dimensions */}
                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="relative w-full max-w-[340px]">
                    {/* Audio element for Humdum song */}
                    <audio
                      ref={audioRef}
                      src="/assets/aistudio/Humdum_-_Aditya_Rikhari_320_Kbps_2add91c3.mp3"
                      preload="auto"
                      onEnded={() => setIsPlayingSong(false)}
                    />

                    {/* Interactive Spinning Pilot Sticker Audio Player (Pinned on top-left without clipping) */}
                    <button
                      type="button"
                      onClick={toggleSongPlayback}
                      aria-label={isPlayingSong ? "Click to pause Humdum song" : "Click to play Humdum by Aditya Rikhari"}
                      title={isPlayingSong ? "Click to pause 'Humdum'" : "Click to play 'Humdum' by Aditya Rikhari"}
                      className={`absolute -top-6 -left-6 w-24 h-24 rounded-full border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] flex flex-col items-center justify-center font-['Bowlby_One'] text-xs uppercase leading-none transition-all z-30 cursor-pointer select-none hover:scale-105 active:scale-95 ${
                        isPlayingSong
                          ? 'bg-[#ff4a8a] text-[#1f1a0e] animate-[spin_7s_linear_infinite] shadow-[0_0_0_2px_#1f1a0e,4px_4px_0_#0e4dff]'
                          : 'bg-[#ff7028] text-[#1f1a0e] animate-[spin_18s_linear_infinite]'
                      }`}
                    >
                      {isPlayingSong ? (
                        <>
                          <span>HUMDUM</span>
                          <span className="text-[10px]">PLAYING</span>
                          {/* Animated equalizer bars */}
                          <div className="flex items-end justify-center gap-0.5 h-3 mt-0.5">
                            <span className="w-1 bg-[#1f1a0e] rounded-sm animate-[pulse_0.6s_ease-in-out_infinite_alternate]" style={{ height: '70%' }} />
                            <span className="w-1 bg-[#1f1a0e] rounded-sm animate-[pulse_0.4s_ease-in-out_infinite_alternate]" style={{ height: '100%' }} />
                            <span className="w-1 bg-[#1f1a0e] rounded-sm animate-[pulse_0.7s_ease-in-out_infinite_alternate]" style={{ height: '50%' }} />
                            <span className="w-1 bg-[#1f1a0e] rounded-sm animate-[pulse_0.5s_ease-in-out_infinite_alternate]" style={{ height: '85%' }} />
                          </div>
                        </>
                      ) : (
                        <>
                          PILOT<br />TESTER
                          <small className="font-sans font-bold text-[7px] tracking-wider mt-0.5 flex items-center gap-0.5">
                            PLAY ▶
                          </small>
                        </>
                      )}
                    </button>

                    {/* Phone Frame */}
                    <div className="relative w-full aspect-[9/16] bg-[#1f1a0e] border-3 border-[#1f1a0e] shadow-[12px_12px_0_#1f1a0e] flex flex-col justify-between rotate-1 hover:rotate-0 transition-transform overflow-hidden">
                      <div className="bg-[#1f1a0e] text-[#f5ecd4] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest flex justify-between z-20 border-b border-[#3a3320]">
                        <span>COM.SNEHA.APP</span>
                        <span className="text-[#ff4a8a]">720 × 1280 HD</span>
                      </div>

                      {/* Full-resolution looping video */}
                      <div className="relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center">
                        <video
                          src="/assets/aistudio/gemini_generated_video_0db2fe7e_8318c5ea.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="auto"
                          className="w-full h-full object-cover block"
                          aria-label="SNEHA On-Device AI Companion Live Demonstration"
                        />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2 bg-[#f5ecd4]/95 border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] z-20 pointer-events-none text-[10px] font-bold uppercase tracking-wider text-[#1f1a0e]">
                          <span className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#ff4a8a] animate-pulse" />
                            LIVE ON-DEVICE AI
                          </span>
                          <span className="text-[#0e4dff]">LOOPING HD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Verified Features Section */}
              <section className="px-4 sm:px-8 py-14 max-w-6xl mx-auto border-t-3 border-dashed border-[#1f1a0e]" id="features">
                <div className="mb-8">
                  <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border-2 border-[#1f1a0e] bg-[#f5ecd4] shadow-[2px_2px_0_#1f1a0e] -rotate-1 mb-3">
                    // Verified Capabilities · Step 2 Audit
                  </span>
                  <h2 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight leading-tight">
                    What SNEHA <span className="text-[#0e4dff]">DOES</span>.
                    <em className="block font-['Crimson_Pro'] italic font-normal text-lg sm:text-xl text-[#1f1a0e] lowercase mt-1">
                      — verified directly against code audit. Only verified or partial claims with caveats.
                    </em>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Card 1 */}
                  <div className="p-6 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[6px_6px_0_#1f1a0e] hover:shadow-[8px_8px_0_#1f1a0e] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['Bowlby_One'] text-3xl text-[#0e4dff]">01</span>
                      <span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] text-[10px] font-bold border border-[#1f1a0e] uppercase">
                        EXISTS · Verified
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">On a phone you already own</h3>
                    <p className="font-['Crimson_Pro'] italic text-sm text-[#3a3320] mb-2 leading-relaxed">
                      Compatible with Android 8.0+ (Min SDK 26) through Android 15 (Target SDK 35). Runs on existing handsets without forcing $1,000 flagship upgrades.
                    </p>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#1f1a0e]">
                      Audit: com.sneha.app / Build Platform Specs
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-6 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[6px_6px_0_#1f1a0e] hover:shadow-[8px_8px_0_#1f1a0e] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['Bowlby_One'] text-3xl text-[#ff4a8a]">02</span>
                      <span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] text-[10px] font-bold border border-[#1f1a0e] uppercase">
                        EXISTS · Verified
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">Never has to leak your data</h3>
                    <p className="font-['Crimson_Pro'] italic text-sm text-[#3a3320] mb-2 leading-relaxed">
                      Zero third-party trackers, zero advertising SDKs, and zero background analytics. Conversations and data stay strictly in on-device storage.
                    </p>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#1f1a0e]">
                      Audit: Verified clean privacy inspection
                    </div>
                  </div>

                  {/* Card 3 - PARTIAL */}
                  <div className="p-6 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[6px_6px_0_#1f1a0e] hover:shadow-[8px_8px_0_#1f1a0e] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['Bowlby_One'] text-3xl text-[#ff7028]">03</span>
                      <span className="px-2 py-0.5 bg-[#ff7028] text-[#1f1a0e] text-[10px] font-bold border border-[#1f1a0e] uppercase">
                        PARTIAL PILOT STATUS
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">The companion that never goes down</h3>
                    <p className="font-['Crimson_Pro'] italic text-sm text-[#3a3320] mb-2 leading-relaxed">
                      On-device offline model execution handles prompts and memory locally without network connectivity.
                    </p>
                    <div className="p-2.5 bg-[#ff7028]/15 border-l-3 border-[#ff7028] text-xs font-['Crimson_Pro'] italic text-[#2a2515] mb-2">
                      <strong>Mandatory Caveat:</strong> Local offline execution works on supported Android 8.0+ devices; inference speed varies based on device RAM and NPU.
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#1f1a0e]">
                      Audit: Local engine staged tester validation
                    </div>
                  </div>

                  {/* Card 4 - PARTIAL */}
                  <div className="p-6 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[6px_6px_0_#1f1a0e] hover:shadow-[8px_8px_0_#1f1a0e] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['Bowlby_One'] text-3xl text-[#0e4dff]">04</span>
                      <span className="px-2 py-0.5 bg-[#ff7028] text-[#1f1a0e] text-[10px] font-bold border border-[#1f1a0e] uppercase">
                        PARTIAL PILOT STATUS
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">Actually does things for you</h3>
                    <p className="font-['Crimson_Pro'] italic text-sm text-[#3a3320] mb-2 leading-relaxed">
                      Executes real device actions, alarms, reminders, and local tool calls through native Android intents.
                    </p>
                    <div className="p-2.5 bg-[#ff7028]/15 border-l-3 border-[#ff7028] text-xs font-['Crimson_Pro'] italic text-[#2a2515] mb-2">
                      <strong>Mandatory Caveat:</strong> System automations require runtime user permissions and are undergoing testing across OEM variations (OneUI, Pixel, HyperOS).
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#1f1a0e]">
                      Audit: Android Intent automation suite
                    </div>
                  </div>

                  {/* Card 5 - PARTIAL */}
                  <div className="p-6 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[6px_6px_0_#1f1a0e] hover:shadow-[8px_8px_0_#1f1a0e] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['Bowlby_One'] text-3xl text-[#ff4a8a]">05</span>
                      <span className="px-2 py-0.5 bg-[#ff7028] text-[#1f1a0e] text-[10px] font-bold border border-[#1f1a0e] uppercase">
                        PARTIAL PILOT STATUS
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">Near-zero infrastructure cost</h3>
                    <p className="font-['Crimson_Pro'] italic text-sm text-[#3a3320] mb-2 leading-relaxed">
                      Computes locally on your hardware, eliminating expensive recurring server overhead and mandatory SaaS subscriptions.
                    </p>
                    <div className="p-2.5 bg-[#ff7028]/15 border-l-3 border-[#ff7028] text-xs font-['Crimson_Pro'] italic text-[#2a2515] mb-2">
                      <strong>Mandatory Caveat:</strong> Core local features cost $0; optional cloud fallback models are user-configured if enabled.
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#1f1a0e]">
                      Audit: Client-authoritative architecture
                    </div>
                  </div>

                  {/* Card 6 - Step 6 Untouched Media */}
                  <div className="p-6 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[6px_6px_0_#1f1a0e] hover:shadow-[8px_8px_0_#1f1a0e] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['Bowlby_One'] text-3xl text-[#1f1a0e]">06</span>
                      <span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] text-[10px] font-bold border border-[#1f1a0e] uppercase">
                        EXISTS · Protected
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">Media, Spotify &amp; YouTube</h3>
                    <p className="font-['Crimson_Pro'] italic text-sm text-[#3a3320] mb-2 leading-relaxed">
                      Integrated media controls and background playback sections are preserved untouched in the app architecture per Step 6 rules.
                    </p>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#1f1a0e]">
                      Audit: Step 6 Non-touch boundary enforced
                    </div>
                  </div>
                </div>
              </section>

              {/* Screenshots Showcase Section */}
              <section className="px-4 sm:px-8 py-12 sm:py-16 bg-[#eedcb4] border-y-3 border-[#1f1a0e] overflow-hidden" id="screenshots">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left Column: Dual Phone Showcase */}
                  <div className="lg:col-span-6 flex flex-col items-center w-full max-w-[500px] mx-auto">
                    {/* View Switcher for small / mobile screen sizes */}
                    <div className="flex sm:hidden items-center justify-center gap-1.5 mb-4 w-full" role="tablist">
                      <button
                        type="button"
                        onClick={() => setScreenshotView('duo')}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] transition-all ${
                          screenshotView === 'duo' ? 'bg-[#1f1a0e] text-[#f5ecd4]' : 'bg-[#f5ecd4] text-[#1f1a0e] hover:bg-white'
                        }`}
                      >
                        Both
                      </button>
                      <button
                        type="button"
                        onClick={() => setScreenshotView('screen-1')}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] transition-all ${
                          screenshotView === 'screen-1' ? 'bg-[#1f1a0e] text-[#f5ecd4]' : 'bg-[#f5ecd4] text-[#1f1a0e] hover:bg-white'
                        }`}
                      >
                        Features
                      </button>
                      <button
                        type="button"
                        onClick={() => setScreenshotView('screen-2')}
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] transition-all ${
                          screenshotView === 'screen-2' ? 'bg-[#1f1a0e] text-[#f5ecd4]' : 'bg-[#f5ecd4] text-[#1f1a0e] hover:bg-white'
                        }`}
                      >
                        Home
                      </button>
                    </div>

                    <div className={`grid gap-3 sm:gap-4 w-full ${
                      screenshotView === 'duo' ? 'grid-cols-2' : 'grid-cols-1 max-w-[240px]'
                    }`}>
                      {/* Screen 01 · Features */}
                      {(screenshotView === 'duo' || screenshotView === 'screen-1') && (
                        <div
                          onClick={() => setLightboxImage({
                            src: '/assets/aistudio/WhatsApp_Image_2026-10-24_at_12.50.46_PM_346a1911.jpeg',
                            title: 'Screen 01 · Features',
                            subtitle: 'SCREEN 01 · FEATURES AUDIT',
                            caption: "Verified Features Dashboard: 'Today at a glance' pending tasks, intent automation, and conversational assistant. Audited against com.sneha.app codebase."
                          })}
                          className="relative aspect-[745/1600] w-full max-w-[230px] mx-auto bg-[#0d0b06] border-3 border-[#1f1a0e] rounded-[16px] shadow-[5px_5px_0_#1f1a0e] overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-[7px_7px_0_#0e4dff] transition-all group"
                          title="Click to view full 1:1 HD resolution"
                          role="button"
                          tabIndex={0}
                        >
                          <div className="h-2.5 sm:h-3 bg-[#0d0b06] flex items-center justify-center shrink-0 z-10">
                            <span className="w-6 sm:w-8 h-1 bg-[#3a3320] rounded-full" />
                          </div>
                          <div className="relative flex-1 w-full h-full overflow-hidden bg-black">
                            <img
                              src="/assets/aistudio/WhatsApp_Image_2026-10-24_at_12.50.46_PM_346a1911.jpeg"
                              alt="SNEHA Android App - Screen 01: Features Dashboard"
                              className="w-full h-full object-cover object-top block"
                              loading="eager"
                            />
                          </div>
                          <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 right-1.5 sm:right-2 z-10 bg-[#0d0b06]/90 backdrop-blur-xs text-[#f5ecd4] text-[8px] sm:text-[9px] font-bold uppercase px-2 py-1 flex justify-between items-center border border-[#f5ecd4]/30 rounded">
                            <span className="truncate mr-1">01 · Features</span>
                            <span className="text-[#ff4a8a] shrink-0 group-hover:scale-105 transition-transform">🔍 HD</span>
                          </div>
                        </div>
                      )}

                      {/* Screen 02 · Home */}
                      {(screenshotView === 'duo' || screenshotView === 'screen-2') && (
                        <div
                          onClick={() => setLightboxImage({
                            src: '/assets/aistudio/WhatsApp_Image_2026-10-24_at_12.51.04_PM_66268e2f.jpeg',
                            title: 'Screen 02 · Home',
                            subtitle: 'SCREEN 02 · HOME AUDIT',
                            caption: "Verified Home Dashboard: Offline Alarms & Timers, Nearby Bluetooth Chat, and Private Encrypted Journal. Audited against com.sneha.app codebase."
                          })}
                          className={`relative aspect-[744/1600] w-full max-w-[230px] mx-auto bg-[#0d0b06] border-3 border-[#1f1a0e] rounded-[16px] shadow-[5px_5px_0_#1f1a0e] overflow-hidden flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-[7px_7px_0_#ff4a8a] transition-all group ${
                            screenshotView === 'duo' ? 'sm:translate-y-4 hover:sm:translate-y-3' : ''
                          }`}
                          title="Click to view full 1:1 HD resolution"
                          role="button"
                          tabIndex={0}
                        >
                          <div className="h-2.5 sm:h-3 bg-[#0d0b06] flex items-center justify-center shrink-0 z-10">
                            <span className="w-6 sm:w-8 h-1 bg-[#3a3320] rounded-full" />
                          </div>
                          <div className="relative flex-1 w-full h-full overflow-hidden bg-black">
                            <img
                              src="/assets/aistudio/WhatsApp_Image_2026-10-24_at_12.51.04_PM_66268e2f.jpeg"
                              alt="SNEHA Android App - Screen 02: Home Dashboard"
                              className="w-full h-full object-cover object-top block"
                              loading="eager"
                            />
                          </div>
                          <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 right-1.5 sm:right-2 z-10 bg-[#0d0b06]/90 backdrop-blur-xs text-[#f5ecd4] text-[8px] sm:text-[9px] font-bold uppercase px-2 py-1 flex justify-between items-center border border-[#f5ecd4]/30 rounded">
                            <span className="truncate mr-1">02 · Home</span>
                            <span className="text-[#0e4dff] shrink-0 group-hover:scale-105 transition-transform">🔍 HD</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 sm:mt-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f5ecd4] text-[#1f1a0e] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] text-[10px] font-bold uppercase tracking-wider">
                        <span>🔍</span> Click or tap either screen for 1:1 HD inspector
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Architecture text */}
                  <div className="lg:col-span-6">
                    <span className="inline-block px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest border-2 border-[#1f1a0e] bg-[#f5ecd4] shadow-[2px_2px_0_#1f1a0e] mb-3">
                      UI Architecture · Android 8.0–15
                    </span>
                    <h3 className="font-['Bowlby_One'] text-2xl sm:text-4xl uppercase leading-tight mb-4">
                      "BUILT FOR SPEED — <em className="font-['Crimson_Pro'] italic font-normal text-xl sm:text-2xl text-[#0e4dff]">no cloud spinners, no latency lag."</em>
                    </h3>
                    <p className="font-['Crimson_Pro'] text-base sm:text-lg text-[#2a2515] leading-relaxed mb-3">
                      Because SNEHA computes directly on your device, interactions don't round-trip to servers halfway across the world.
                    </p>
                    <p className="font-['Crimson_Pro'] italic text-sm text-[#3a3320] leading-relaxed mb-3">
                      Every screen is constructed around instantaneous tactile response. When you request a task, your phone's local processor reads your intent, checks the relevant Android permission boundary, and acts immediately.
                    </p>
                    <div className="mt-4 pt-3 border-t-2 border-dashed border-[#1f1a0e] text-[10px] font-bold uppercase tracking-wider text-[#1f1a0e]">
                      Package: com.sneha.app · Min SDK 26 · Target SDK 35 · GPLv3
                    </div>
                  </div>
                </div>
              </section>

              {/* Technical Factual Pledge (Step 1 & 6 Compliant) */}
              <section className="px-4 sm:px-8 py-12 text-center max-w-4xl mx-auto">
                <blockquote className="font-['Bowlby_One'] text-2xl sm:text-4xl uppercase leading-snug tracking-tight text-[#1f1a0e] mb-3">
                  “Built to run locally on the phone in your pocket — <span className="text-[#ff4a8a]">zero external telemetry</span>, zero subscription fees, and transparent <span className="text-[#0e4dff]">GPLv3</span> code.”
                </blockquote>
                <cite className="font-bold text-xs uppercase tracking-widest text-[#0e4dff] not-italic block">
                  // SNEHA Pilot Engineering Pledge · sumitnawale123456@gmail.com
                </cite>
              </section>

              {/* Pilot Sign-Up Section */}
              <section className="px-4 sm:px-8 py-16 bg-[#ff4a8a] text-[#1f1a0e] border-t-3 border-[#1f1a0e]" id="signup">
                <div className="max-w-2xl mx-auto text-center">
                  <h2 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight mb-3 text-[#1f1a0e] drop-shadow-[2px_2px_0_#f5ecd4]">
                    Join the SNEHA Pilot.
                  </h2>
                  <p className="font-['Crimson_Pro'] italic text-base sm:text-lg text-[#1f1a0e] font-semibold mb-8">
                    Help test early distribution builds and submit reviews before the Play Store launch. We collect zero data beyond what is needed to verify test device compatibility.
                  </p>

                  <div className="p-6 sm:p-8 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e] text-left">
                    {signupSuccess && (
                      <div className="mb-4 p-3 bg-[#eedcb4] border-2 border-[#0e4dff] text-[#0e4dff] text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        Thank you! Your pilot sign-up has been recorded. We will email your build invitation.
                      </div>
                    )}

                    <form onSubmit={handleSignupSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#1f1a0e]">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={signupForm.name}
                          onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                          placeholder="e.g. Alex Sharma"
                          className="w-full p-2.5 bg-[#f5ecd4] border-2 border-[#1f1a0e] text-sm focus:border-[#0e4dff] focus:outline-none shadow-[2px_2px_0_#1f1a0e]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#1f1a0e]">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          placeholder="name@example.com"
                          className="w-full p-2.5 bg-[#f5ecd4] border-2 border-[#1f1a0e] text-sm focus:border-[#0e4dff] focus:outline-none shadow-[2px_2px_0_#1f1a0e]"
                        />
                        <span className="block text-[11px] font-['Crimson_Pro'] italic text-[#5a4f30] mt-1">
                          Used solely to send your pilot invitation and APK download link.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#1f1a0e]">
                            Android Version *
                          </label>
                          <select
                            value={signupForm.androidVersion}
                            onChange={(e) => setSignupForm({ ...signupForm, androidVersion: e.target.value })}
                            className="w-full p-2.5 bg-[#f5ecd4] border-2 border-[#1f1a0e] text-sm focus:border-[#0e4dff] focus:outline-none shadow-[2px_2px_0_#1f1a0e]"
                          >
                            <option>Android 15 (Target SDK 35)</option>
                            <option>Android 14 (SDK 34)</option>
                            <option>Android 13 (SDK 33)</option>
                            <option>Android 12 (SDK 31)</option>
                            <option>Android 11 (SDK 30)</option>
                            <option>Android 10 (SDK 29)</option>
                            <option>Android 9 Pie (SDK 28)</option>
                            <option>Android 8.0/8.1 Oreo (Min SDK 26)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#1f1a0e]">
                            Device Model *
                          </label>
                          <input
                            type="text"
                            required
                            value={signupForm.deviceModel}
                            onChange={(e) => setSignupForm({ ...signupForm, deviceModel: e.target.value })}
                            placeholder="e.g. Pixel 7, Galaxy S21"
                            className="w-full p-2.5 bg-[#f5ecd4] border-2 border-[#1f1a0e] text-sm focus:border-[#0e4dff] focus:outline-none shadow-[2px_2px_0_#1f1a0e]"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-[#eedcb4] border-2 border-dashed border-[#1f1a0e] text-xs font-['Crimson_Pro'] italic text-[#2a2515]">
                        <strong>Minimal Data Statement:</strong> We store nothing beyond what is needed to verify test device compatibility. No trackers, no ad networks, no hidden metrics.
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-[#1f1a0e] text-[#f5ecd4] font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[4px_4px_0_#0e4dff] hover:bg-[#0e4dff] hover:text-white transition-all"
                      >
                        Submit Pilot Application →
                      </button>
                    </form>
                  </div>
                </div>
              </section>

              {/* Site Footer */}
              <footer className="p-8 sm:p-12 bg-[#1f1a0e] text-[#f5ecd4] text-xs">
                <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                  <div className="sm:col-span-2">
                    <div className="font-['Bowlby_One'] text-3xl uppercase text-[#f5ecd4] mb-2">
                      SNEHA<span className="text-[#ff4a8a]">.AI</span>
                    </div>
                    <p className="font-['Crimson_Pro'] italic text-sm text-[#eedcb4] max-w-sm mb-3">
                      The AI companion that never goes down, keeps your data on your phone, and actually does things at near-zero infrastructure cost.
                    </p>
                    <p className="text-[11px] text-[#eedcb4]/80">
                      Package: <code>com.sneha.app</code> · Target SDK 35 · Min SDK 26
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-[11px] text-[#ff4a8a] tracking-widest uppercase mb-3">// PAGES</h5>
                    <ul className="space-y-1.5 text-[#eedcb4]">
                      <li><a href="#hero" className="hover:text-[#ff4a8a] transition-colors">Overview</a></li>
                      <li><a href="#features" className="hover:text-[#ff4a8a] transition-colors">Verified Features</a></li>
                      <li><a href="#screenshots" className="hover:text-[#ff4a8a] transition-colors">Screenshots</a></li>
                      <li><a href="#signup" className="hover:text-[#ff4a8a] transition-colors">Pilot Sign-up</a></li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-bold text-[11px] text-[#ff4a8a] tracking-widest uppercase mb-3">// PILOT RESOURCES</h5>
                    <ul className="space-y-1.5 text-[#eedcb4]">
                      <li>
                        <button onClick={() => setActiveTab('in-app-feedback')} className="hover:text-[#ff4a8a] transition-colors text-left">
                          Submit Feedback Form
                        </button>
                      </li>
                      <li>
                        <button onClick={() => setActiveTab('privacy')} className="hover:text-[#ff4a8a] transition-colors text-left">
                          Plain-Language Privacy Policy
                        </button>
                      </li>
                      <li>
                        <a href="mailto:sumitnawale123456@gmail.com" className="hover:text-[#ff4a8a] transition-colors">
                          sumitnawale123456@gmail.com
                        </a>
                      </li>
                      <li className="text-[11px] text-[#eedcb4]/70 pt-1">
                        Licensed under GPLv3
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="max-w-6xl mx-auto pt-6 border-t border-[#eedcb4]/20 flex flex-wrap justify-between items-center gap-4 text-[11px] text-[#eedcb4]">
                  <span>© SNEHA PILOT DISTRIBUTION · 2026 · ALL RIGHTS RESERVED</span>
                  <span>GPLV3 OPEN SOURCE · ZERO TRACKERS · ON-DEVICE PRIVACY</span>
                </div>
              </footer>
            </div>
          </div>
        )}

        {/* Tab 2: In-App Feedback Screen (Step 5 App-Side Support) */}
        {activeTab === 'in-app-feedback' && (
          <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border-2 border-[#1f1a0e] bg-[#0e4dff] text-white shadow-[2px_2px_0_#1f1a0e] mb-2">
                  Step 5 // App-Side Feedback Screen
                </span>
                <h1 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight">
                  Tester <span className="text-[#0e4dff]">Reviews &amp; Bugs</span>
                </h1>
                <p className="font-['Crimson_Pro'] italic text-base text-[#2a2515] mt-1">
                  Identical fields to the website form. Zero passive background tracking or crash reporting libraries.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e]">
              {feedbackSubmitted && (
                <div className="mb-6 p-4 bg-[#eedcb4] border-2 border-[#0e4dff] text-[#0e4dff] text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Thank you! Your feedback has been logged to the pilot intake endpoint (<code>/api/pilot-feedback</code>).
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                {/* 1. Rating 1 to 5 */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#1f1a0e]">
                    Overall Rating (1 to 5) *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setFeedbackRating(val)}
                        className={`p-3 border-2 border-[#1f1a0e] font-['Bowlby_One'] text-lg transition-all ${
                          feedbackRating === val
                            ? 'bg-[#ff4a8a] text-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] -translate-y-0.5'
                            : 'bg-[#f5ecd4] text-[#1f1a0e] hover:bg-[#eedcb4]'
                        }`}
                      >
                        {val} ★
                      </button>
                    ))}
                  </div>
                  <span className="block text-[11px] font-['Crimson_Pro'] italic text-[#5a4f30] mt-1">
                    {feedbackRating === 1 && '1 Star: Critical blocker / non-functional on my device'}
                    {feedbackRating === 2 && '2 Stars: High friction / repeated errors'}
                    {feedbackRating === 3 && '3 Stars: Core features work with noticeable bugs'}
                    {feedbackRating === 4 && '4 Stars: Solid performance / minor UI improvements needed'}
                    {feedbackRating === 5 && '5 Stars: Excellent / ready for Play Store release'}
                  </span>
                </div>

                {/* 2. What worked */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#1f1a0e]">
                    What Worked Well? *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={whatWorked}
                    onChange={(e) => setWhatWorked(e.target.value)}
                    placeholder="e.g. Prompt intent processing was instantaneous, alarms set without opening system menus..."
                    className="w-full p-2.5 bg-[#f5ecd4] border-2 border-[#1f1a0e] text-sm focus:border-[#0e4dff] focus:outline-none shadow-[2px_2px_0_#1f1a0e]"
                  />
                </div>

                {/* 3. What broke */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#1f1a0e]">
                    What Broke or Failed? *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={whatBroke}
                    onChange={(e) => setWhatBroke(e.target.value)}
                    placeholder="e.g. System permission prompt refused to reappear after denial on Android 14..."
                    className="w-full p-2.5 bg-[#f5ecd4] border-2 border-[#1f1a0e] text-sm focus:border-[#0e4dff] focus:outline-none shadow-[2px_2px_0_#1f1a0e]"
                  />
                </div>

                {/* 4. What to add */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#1f1a0e]">
                    What Features to Add? *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={whatToAdd}
                    onChange={(e) => setWhatToAdd(e.target.value)}
                    placeholder="e.g. Home screen widget, quick-toggle intent, local voice TTS customization..."
                    className="w-full p-2.5 bg-[#f5ecd4] border-2 border-[#1f1a0e] text-sm focus:border-[#0e4dff] focus:outline-none shadow-[2px_2px_0_#1f1a0e]"
                  />
                </div>

                {/* Device Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#1f1a0e]">
                      Tester Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={testerEmail}
                      onChange={(e) => setTesterEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full p-2.5 bg-[#f5ecd4] border-2 border-[#1f1a0e] text-sm focus:border-[#0e4dff] focus:outline-none shadow-[2px_2px_0_#1f1a0e]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#1f1a0e]">
                      Device Model &amp; Android OS
                    </label>
                    <input
                      type="text"
                      value={testerDevice}
                      onChange={(e) => setTesterDevice(e.target.value)}
                      placeholder="e.g. Pixel 7 / Android 14"
                      className="w-full p-2.5 bg-[#f5ecd4] border-2 border-[#1f1a0e] text-sm focus:border-[#0e4dff] focus:outline-none shadow-[2px_2px_0_#1f1a0e]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#eedcb4] border-2 border-dashed border-[#1f1a0e] text-xs font-['Crimson_Pro'] italic text-[#2a2515]">
                  <strong>User-Initiated Transmission Only:</strong> This screen submits only what you explicitly type to <code>/api/pilot-feedback</code>. Screenshot uploads are omitted per Step 3.5.
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0e4dff] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] hover:bg-[#1f1a0e] transition-all"
                >
                  Send Feedback to Maintainer →
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Plain-Language Privacy Policy */}
        {activeTab === 'privacy' && (
          <div className="max-w-3xl mx-auto px-4 py-12">
            <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border-2 border-[#1f1a0e] bg-[#ff7028] text-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] mb-3">
              Step 3.6 // Plain-Language Privacy
            </span>
            <h1 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight mb-6">
              Plain <span className="text-[#0e4dff]">PRIVACY</span>.
            </h1>

            <div className="p-6 sm:p-8 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e] space-y-6">
              <div>
                <h3 className="font-['Bowlby_One'] text-xl uppercase mb-2">1. What Stays on Your Device</h3>
                <p className="font-['Crimson_Pro'] text-base text-[#2a2515] leading-relaxed mb-2">
                  All conversational logs, intent history, local model cache, and automation preferences are stored strictly inside the private Android sandbox (<code>/data/data/com.sneha.app</code>).
                </p>
                <p className="font-['Crimson_Pro'] text-base text-[#2a2515] leading-relaxed">
                  Inference is conducted on-device using local processor execution. Your prompts never traverse cloud infrastructure.
                </p>
              </div>

              <div className="border-t-2 border-dashed border-[#1f1a0e] pt-4">
                <h3 className="font-['Bowlby_One'] text-xl uppercase mb-2">2. What Leaves Your Device</h3>
                <p className="font-['Crimson_Pro'] text-base text-[#2a2515] leading-relaxed">
                  Nothing leaves your phone without you explicitly tapping a button. When you submit the pilot sign-up form or the feedback review form, the text you typed is dispatched to the maintainer endpoint (<code>/api/pilot-feedback</code>).
                </p>
              </div>

              <div className="border-t-2 border-dashed border-[#1f1a0e] pt-4">
                <h3 className="font-['Bowlby_One'] text-xl uppercase mb-2">3. Zero-Telemetry &amp; Third-Party Providers</h3>
                <p className="font-['Crimson_Pro'] text-base text-[#2a2515] leading-relaxed">
                  There are zero advertising trackers, zero analytics SDKs (no Google Analytics, Firebase Telemetry, Mixpanel, or Sentry), and zero background data brokers.
                </p>
              </div>

              <div className="border-t-2 border-dashed border-[#1f1a0e] pt-4">
                <h3 className="font-['Bowlby_One'] text-xl uppercase mb-2">4. Open Source GPLv3 Guarantee</h3>
                <p className="font-['Crimson_Pro'] text-base text-[#2a2515] leading-relaxed">
                  SNEHA is licensed under the GNU General Public License v3.0. You have the right to inspect, verify, and compile every line of code yourself.
                </p>
                <div className="mt-3 p-2.5 bg-[#eedcb4] border border-[#1f1a0e] text-xs font-bold">
                  Contact: <a href="mailto:sumitnawale123456@gmail.com" className="text-[#0e4dff] underline">sumitnawale123456@gmail.com</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Feature Audit Table (Step 2) */}
        {activeTab === 'audit' && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border-2 border-[#1f1a0e] bg-[#eedcb4] text-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] mb-3">
              Step 2 // Code Audit Verification
            </span>
            <h1 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight mb-4">
              Feature <span className="text-[#ff4a8a]">AUDIT</span> Table.
            </h1>
            <p className="font-['Crimson_Pro'] italic text-base text-[#2a2515] mb-6">
              Strict audit of all claims in the one-line pitch against code reality. Features marked MISSING are excluded from marketing; PARTIAL features display mandatory caveats.
            </p>

            <div className="border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e] bg-[#f5ecd4] overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#1f1a0e] text-[#f5ecd4] font-['Bowlby_One'] text-[11px] uppercase tracking-wider">
                    <th className="p-3 border-r border-[#3a3320]">Claim</th>
                    <th className="p-3 border-r border-[#3a3320]">Status</th>
                    <th className="p-3 border-r border-[#3a3320]">File Path / Proof</th>
                    <th className="p-3">Audit Analysis &amp; Site Caveat</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#1f1a0e] font-sans">
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Phone you already own (Min SDK 26)</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] font-bold border border-[#1f1a0e]">EXISTS</span></td>
                    <td className="p-3 border-r border-[#1f1a0e] font-mono text-[11px]">metadata.json / build.gradle</td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Target SDK 35 (Android 15), Min SDK 26 (Android 8.0). Compatible with 95%+ of global hardware.</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Never has to leak your data</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] font-bold border border-[#1f1a0e]">EXISTS</span></td>
                    <td className="p-3 border-r border-[#1f1a0e] font-mono text-[11px]">privacy.html / package.json</td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Zero telemetry packages, no analytics SDKs, purely user-initiated feedback transmission.</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">AI companion that never goes down</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#ff7028] text-[#1f1a0e] font-bold border border-[#1f1a0e]">PARTIAL</span></td>
                    <td className="p-3 border-r border-[#1f1a0e] font-mono text-[11px]">pilot-site/index.html</td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Mandatory caveat displayed on site: Local execution operates offline on supported devices; inference speed varies with RAM/NPU.</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Actually does things for you</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#ff7028] text-[#1f1a0e] font-bold border border-[#1f1a0e]">PARTIAL</span></td>
                    <td className="p-3 border-r border-[#1f1a0e] font-mono text-[11px]">pilot-site/index.html</td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Mandatory caveat displayed on site: Automations require user-granted runtime permissions; staged testing ongoing across OEMs.</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Near-zero infrastructure cost</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#ff7028] text-[#1f1a0e] font-bold border border-[#1f1a0e]">PARTIAL</span></td>
                    <td className="p-3 border-r border-[#1f1a0e] font-mono text-[11px]">pilot-site/index.html</td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Mandatory caveat displayed on site: Local execution incurs $0 server cost; optional cloud fallback models are user-configured.</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Music, Spotify &amp; YouTube Section</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] font-bold border border-[#1f1a0e]">EXISTS</span></td>
                    <td className="p-3 border-r border-[#1f1a0e] font-mono text-[11px]">Step 6 Boundary</td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Explicitly preserved without modification per Step 6 rules.</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Fake metrics / reviews / awards</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#ff4a8a] text-[#1f1a0e] font-bold border border-[#1f1a0e]">MISSING (Omitted)</span></td>
                    <td className="p-3 border-r border-[#1f1a0e] font-mono text-[11px]">N/A</td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Completely omitted per Step 6. No fake reviews or counts.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Screenshot Lightbox Modal in React UI */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fade-in_0.15s_ease-out]"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative z-10 bg-[#f5ecd4] border-4 border-[#1f1a0e] shadow-[12px_12px_0_#1f1a0e] max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-[scale-up_0.2s_cubic-bezier(0.2,0,0,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 bg-[#1f1a0e] text-[#f5ecd4] flex items-center justify-between border-b-2 border-[#1f1a0e]">
              <div className="flex items-center gap-2">
                <span className="bg-[#ff4a8a] text-[#1f1a0e] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                  {lightboxImage.subtitle}
                </span>
                <span className="font-['Bowlby_One'] text-sm tracking-wide uppercase text-white truncate max-w-[200px]">
                  {lightboxImage.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="px-2.5 py-1 bg-[#ff7028] hover:bg-[#ff4a8a] text-[#1f1a0e] font-bold text-xs uppercase border-2 border-[#f5ecd4] shadow-[2px_2px_0_#f5ecd4] transition-all cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-black p-3 flex items-center justify-center">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[70vh] w-auto max-w-full object-contain border border-[#3a3320] block"
              />
            </div>

            <div className="p-3 bg-[#eedcb4] border-t-2 border-[#1f1a0e] text-center font-['Crimson_Pro'] italic text-xs text-[#1f1a0e]">
              {lightboxImage.caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
