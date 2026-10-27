/**
 * @license
 * Proprietary — SNEHA Commercial Pilot Distribution Platform
 * Investor Pitch Deck & Venture Executive Presentation Engine
 * All Rights Reserved
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Presentation,
  FileText,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  Cpu,
  Smartphone,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Sliders,
  ChevronDown,
  ChevronUp,
  Layers,
  Award,
  Database
} from 'lucide-react';

export interface PitchDeckProps {
  onNavigateTab: (
    tab: 'pilot-site' | 'download' | 'compatibility' | 'audit' | 'in-app-feedback' | 'admin'
  ) => void;
}

interface SlideMeta {
  id: string;
  number: string;
  badge: string;
  title: string;
  subtitle: string;
}

const SLIDES: SlideMeta[] = [
  {
    id: 'vision',
    number: '01',
    badge: 'VISION & CATEGORY',
    title: 'The On-Device AI Revolution',
    subtitle: 'The 100% Private, On-Device AI Companion for the 90% of Users Big Tech Ignored'
  },
  {
    id: 'problem',
    number: '02',
    badge: 'THE PAIN POINT',
    title: 'The Fatal Cloud AI Trap',
    subtitle: 'Why Cloud Chatbots Burn Millions in Server Bills and Harvest User Data'
  },
  {
    id: 'solution',
    number: '03',
    badge: 'THE ARCHITECTURE',
    title: 'SNEHA: True Edge Intelligence',
    subtitle: 'Zero Cloud GPU Costs · Zero Data Leakage · Real Device Automation'
  },
  {
    id: 'why-now',
    number: '04',
    badge: 'MARKET TIMING',
    title: 'Why Right Now in 2026?',
    subtitle: 'Small Language Model Quantization Meets the Flagship Exclusion Gap'
  },
  {
    id: 'product',
    number: '05',
    badge: 'LIVE PROOF',
    title: 'Code Reality, Not Slides',
    subtitle: 'Audited Min SDK 26 Runtime, 6.2 MB Binary, and Direct Sideload Engine'
  },
  {
    id: 'market',
    number: '06',
    badge: 'MARKET POTENTIAL',
    title: 'TAM · SAM · SOM Sizing',
    subtitle: 'A ₹160 Crore ($19M) ARR Addressable Opportunity in India Alone'
  },
  {
    id: 'unit-economics',
    number: '07',
    badge: 'BUSINESS MODEL',
    title: '90%+ Gross Margin Economics',
    subtitle: 'Impulse Pricing (₹143/mo, ₹799/yr) Powered by ₹0 Marginal Compute Overhead'
  },
  {
    id: 'competition',
    number: '08',
    badge: 'DEFENSIVE MOAT',
    title: 'Competitive Superiority Matrix',
    subtitle: 'Why OpenAI, Gemini, and Apple Cannot Replicate SNEHA’s Cost Structure'
  },
  {
    id: 'gtm',
    number: '09',
    badge: 'GO-TO-MARKET',
    title: 'Zero-CAC Campus-to-Scale Engine',
    subtitle: 'Viral Pilot Distribution Bypassing the 30% Google Play Store Tax'
  },
  {
    id: 'the-ask',
    number: '10',
    badge: 'CAPITAL & MILESTONES',
    title: 'The Seed Ask & Growth Targets',
    subtitle: 'Accelerating to 50,000 Paid Subscribers and ₹3.5 Crore ARR'
  }
];

export const PitchDeck: React.FC<PitchDeckProps> = ({ onNavigateTab }) => {
  // Presentation Controls
  const [viewMode, setViewMode] = useState<'presentation' | 'memo'>('presentation');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pitch Timer (e.g., 3 min or 5 min competition time limit)
  const [timerDuration, setTimerDuration] = useState<number>(300); // 5 min default
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Interactive Unit Economics Simulator
  const [simUsers, setSimUsers] = useState<number>(50000);
  const [planMix, setPlanMix] = useState<'balanced' | 'annual' | 'monthly'>('balanced');

  // Interactive Hardware Exclusion Selector
  const [selectedHardwareFilter, setSelectedHardwareFilter] = useState<'all' | 'flagship' | 'budget'>('all');

  // Judge Q&A Defense Drawer
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Touch Swipe coordinates
  const touchStartXRef = useRef<number>(0);
  const touchEndXRef = useRef<number>(0);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft]);

  const handleResetTimer = (duration: number = timerDuration) => {
    setIsTimerRunning(false);
    setTimerDuration(duration);
    setTimerSecondsLeft(duration);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Keyboard navigation for presentation mode
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < SLIDES.length - 1 ? prev + 1 : prev));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'presentation') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlide(SLIDES.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, nextSlide, prevSlide]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (viewMode !== 'presentation') return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  // Financial Simulator Calculations
  const calculatedFinances = useMemo(() => {
    let monthlyRatio = 0.3;
    let sixMonthRatio = 0.35;
    let annualRatio = 0.35;

    if (planMix === 'annual') {
      monthlyRatio = 0.15;
      sixMonthRatio = 0.25;
      annualRatio = 0.6;
    } else if (planMix === 'monthly') {
      monthlyRatio = 0.6;
      sixMonthRatio = 0.25;
      annualRatio = 0.15;
    }

    // Effective monthly revenue per user
    const monthlyRevFromMonthlyUsers = simUsers * monthlyRatio * 143;
    const monthlyRevFromSixMonthUsers = simUsers * sixMonthRatio * (499 / 6);
    const monthlyRevFromAnnualUsers = simUsers * annualRatio * (799 / 12);

    const monthlyTotalRevenue = monthlyRevFromMonthlyUsers + monthlyRevFromSixMonthUsers + monthlyRevFromAnnualUsers;
    const annualRunRate = monthlyTotalRevenue * 12;

    // SNEHA Unit Economics
    const snehaCloudComputeCost = 0; // 100% on-device!
    const snehaPaymentGatewayFee = monthlyTotalRevenue * 0.02; // 2% gateway
    const snehaOpsDistribution = monthlyTotalRevenue * 0.05; // 5% ops/CDN
    const snehaGrossProfit = monthlyTotalRevenue - (snehaCloudComputeCost + snehaPaymentGatewayFee + snehaOpsDistribution);
    const snehaGrossMarginPct = Math.round((snehaGrossProfit / monthlyTotalRevenue) * 100);

    // Competitor Cloud AI (e.g. OpenAI GPT-4o-mini / Claude 3.5 API)
    // 15 user requests/day = 450 requests/month @ approx ₹0.20 per query compute overhead = ₹90/user/month
    const cloudAiComputeCostPerMonth = simUsers * 90;
    const cloudAiGrossProfit = monthlyTotalRevenue - (cloudAiComputeCostPerMonth + snehaPaymentGatewayFee + snehaOpsDistribution);
    const cloudAiGrossMarginPct = Math.round((cloudAiGrossProfit / monthlyTotalRevenue) * 100);

    return {
      monthlyTotalRevenue,
      annualRunRate,
      snehaGrossProfit,
      snehaGrossMarginPct,
      cloudAiComputeCostPerMonth,
      cloudAiGrossProfit,
      cloudAiGrossMarginPct,
      annualSavingsVsCloud: (cloudAiComputeCostPerMonth - snehaCloudComputeCost) * 12
    };
  }, [simUsers, planMix]);

  const activeSlideMeta = SLIDES[currentSlide];

  return (
    <div
      ref={containerRef}
      className={`w-full min-h-screen bg-[#f5ecd4] dark:bg-[#120e07] text-[#1f1a0e] dark:text-[#fdfaf2] transition-colors select-none ${
        isFullscreen ? 'p-4 sm:p-8 flex flex-col justify-between' : 'pb-16'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* -------------------------------------------------------------
          TOP BAR: Presentation Controls, Mode Switcher, & Pitch Timer
          ------------------------------------------------------------- */}
      <section aria-label="Deck controls" className="sticky top-0 z-40 bg-[#f5ecd4]/95 dark:bg-[#120e07]/95 backdrop-blur-sm border-b-3 border-[#1f1a0e] dark:border-[#eedcb4]/30 px-3 sm:px-6 py-2.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Deck Branding & Slide Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="px-2.5 py-1 bg-[#ff4a8a] text-[#1f1a0e] font-['Bowlby_One'] text-xs uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
              PITCH DECK
            </span>
            <span className="hidden sm:inline-block font-mono text-xs font-bold text-[#5a4f30] dark:text-[#cdbe9e]">
              Venture Pitch &amp; Investment Dossier · 2026
            </span>
            {viewMode === 'presentation' && (
              <span className="font-mono text-xs font-bold bg-[#1f1a0e] text-[#f5ecd4] dark:bg-[#fdfaf2] dark:text-[#1f1a0e] px-2 py-0.5 border border-[#1f1a0e]">
                SLIDE {activeSlideMeta.number} / 10
              </span>
            )}
          </div>

          {/* Center: Stage Pitch Countdown Timer */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#eedcb4] dark:bg-[#271f13] px-2.5 py-1 border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
            <Clock size={13} className="text-[#1f1a0e] dark:text-[#fdfaf2]" />
            <span
              className={`font-mono text-xs sm:text-sm font-black tracking-wider ${
                timerSecondsLeft <= 30
                  ? 'text-[#ff4a8a] animate-pulse'
                  : timerSecondsLeft <= 60
                  ? 'text-[#ff7028]'
                  : 'text-[#10b981]'
              }`}
            >
              {formatTimer(timerSecondsLeft)}
            </span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              title={isTimerRunning ? 'Pause Pitch Timer' : 'Start Pitch Timer'}
              className="p-1 hover:bg-[#1f1a0e]/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isTimerRunning ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button
              onClick={() => handleResetTimer(timerDuration)}
              title="Reset Timer"
              className="p-1 hover:bg-[#1f1a0e]/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
            </button>
            <div className="hidden md:flex items-center gap-1 pl-1 border-l border-[#1f1a0e]/20 text-[10px] font-mono">
              <button
                onClick={() => handleResetTimer(180)}
                className={`px-1 py-0.5 border border-[#1f1a0e] ${
                  timerDuration === 180 ? 'bg-[#ff7028] text-[#1f1a0e] font-bold' : 'bg-transparent'
                }`}
              >
                3m
              </button>
              <button
                onClick={() => handleResetTimer(300)}
                className={`px-1 py-0.5 border border-[#1f1a0e] ${
                  timerDuration === 300 ? 'bg-[#ff7028] text-[#1f1a0e] font-bold' : 'bg-transparent'
                }`}
              >
                5m
              </button>
            </div>
          </div>

          {/* Right: View Mode & Fullscreen Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] overflow-hidden text-xs font-bold uppercase">
              <button
                onClick={() => setViewMode('presentation')}
                className={`px-2.5 py-1 flex items-center gap-1 transition-colors ${
                  viewMode === 'presentation'
                    ? 'bg-[#0e4dff] text-white'
                    : 'bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] hover:bg-white'
                }`}
              >
                <Presentation size={13} />
                <span className="hidden sm:inline">Slides</span>
              </button>
              <button
                onClick={() => setViewMode('memo')}
                className={`px-2.5 py-1 flex items-center gap-1 transition-colors border-l-2 border-[#1f1a0e] ${
                  viewMode === 'memo'
                    ? 'bg-[#0e4dff] text-white'
                    : 'bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] hover:bg-white'
                }`}
              >
                <FileText size={13} />
                <span className="hidden sm:inline">Memo</span>
              </button>
            </div>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Presentation Mode (Press F)'}
              className="p-1.5 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#ff7028] transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>

        {/* Slide Quick-Jump Pills (visible in Presentation mode) */}
        {viewMode === 'presentation' && (
          <div className="max-w-7xl mx-auto pt-2 overflow-x-auto no-scrollbar flex items-center gap-1">
            {SLIDES.map((s, idx) => {
              const isCurrent = currentSlide === idx;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-2 py-1 font-mono text-[10px] font-bold uppercase whitespace-nowrap border-2 border-[#1f1a0e] transition-all cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'bg-[#ff4a8a] text-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] -translate-y-0.5'
                      : 'bg-[#eedcb4]/60 dark:bg-[#271f13]/60 text-[#5a4f30] dark:text-[#cdbe9e] hover:bg-white dark:hover:bg-[#342a1a]'
                  }`}
                >
                  <span className="mr-1">{s.number}</span>
                  <span className="hidden md:inline">{s.badge}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* -------------------------------------------------------------
          VIEW MODE A: THEATER / KEYNOTE PRESENTATION SLIDES
          ------------------------------------------------------------- */}
      {viewMode === 'presentation' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex-1 flex flex-col justify-between">
          {/* Active Slide Canvas */}
          <div className="bg-[#f5ecd4] dark:bg-[#1a140b] border-4 border-[#1f1a0e] dark:border-[#eedcb4]/40 shadow-[10px_10px_0_#1f1a0e] dark:shadow-[10px_10px_0_#000] p-6 sm:p-10 min-h-[580px] flex flex-col justify-between relative transition-all">
            {/* Slide Header Pill & Number Watermark */}
            <div>
              <div className="flex items-center justify-between border-b-3 border-[#1f1a0e] dark:border-[#eedcb4]/20 pb-4 mb-6">
                <div>
                  <span className="inline-block px-3 py-1 bg-[#ff7028] text-[#1f1a0e] font-['Bowlby_One'] text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] mb-2">
                    {activeSlideMeta.number} // {activeSlideMeta.badge}
                  </span>
                  <h1 className="font-['Bowlby_One'] text-2xl sm:text-4xl uppercase tracking-tight text-[#1f1a0e] dark:text-[#fdfaf2] leading-tight">
                    {activeSlideMeta.title}
                  </h1>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="font-['Bowlby_One'] text-4xl sm:text-5xl text-[#1f1a0e]/15 dark:text-[#fdfaf2]/10 select-none">
                    #{activeSlideMeta.number}
                  </span>
                </div>
              </div>
              <p className="font-['Crimson_Pro'] italic text-base sm:text-lg text-[#2a2515] dark:text-[#cdbe9e] mb-6">
                {activeSlideMeta.subtitle}
              </p>
            </div>

            {/* Slide Content Dynamic Renderer */}
            <div className="flex-1 my-2">
              {/* SLIDE 01: VISION & CATEGORY HOOK */}
              {currentSlide === 0 && (
                <div className="space-y-6">
                  <div className="p-5 sm:p-7 bg-[#eedcb4]/70 dark:bg-[#271f13] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                    <span className="text-xs font-mono font-bold text-[#0e4dff] uppercase tracking-wider block mb-2">
                      The Category-Defining Thesis
                    </span>
                    <blockquote className="font-['Bowlby_One'] text-xl sm:text-3xl uppercase leading-snug text-[#1f1a0e] dark:text-[#fdfaf2]">
                      “SNEHA is the first on-device AI companion built for everyday Androids: zero GPU server cost, zero data harvesting, and 100% operational offline.”
                    </blockquote>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <div className="w-8 h-8 bg-[#ff4a8a] text-[#1f1a0e] flex items-center justify-center border border-[#1f1a0e] font-black mb-2">
                        <DollarSign size={16} />
                      </div>
                      <h2 className="font-['Bowlby_One'] text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                        ₹0 Marginal Cost
                      </h2>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#5a4f30] dark:text-[#cdbe9e] mt-1">
                        Inference executes on the user's phone, not your AWS GPU bill. 90%+ gross margins from day one.
                      </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <div className="w-8 h-8 bg-[#0e4dff] text-white flex items-center justify-center border border-[#1f1a0e] font-black mb-2">
                        <Shield size={16} />
                      </div>
                      <h2 className="font-['Bowlby_One'] text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                        100% Privacy
                      </h2>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#5a4f30] dark:text-[#cdbe9e] mt-1">
                        Zero telemetry, zero cloud logging. Fully compliant with India DPDP Act and global GDPR.
                      </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <div className="w-8 h-8 bg-[#10b981] text-white flex items-center justify-center border border-[#1f1a0e] font-black mb-2">
                        <Zap size={16} />
                      </div>
                      <h2 className="font-['Bowlby_One'] text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                        Works Offline
                      </h2>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#5a4f30] dark:text-[#cdbe9e] mt-1">
                        Zero internet dependency. Seamless interaction in trains, flights, basements, or remote villages.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 02: THE FATAL CLOUD AI TRAP */}
              {currentSlide === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#ff4a8a]/15 dark:bg-[#ff4a8a]/10 border-3 border-[#ff4a8a] shadow-[3px_3px_0_#ff4a8a]">
                      <span className="text-[10px] font-mono font-bold text-[#ff4a8a] uppercase tracking-wider block mb-1">
                        Trap 01 // Financial
                      </span>
                      <h2 className="font-['Bowlby_One'] text-base uppercase mb-1">GPU Bankruptcy</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e]">
                        Cloud LLMs charge $0.01 to $0.05 per prompt. Consumer AI startups going viral immediately face ₹20–50 Lakh monthly cloud bills that extinguish their seed runway.
                      </p>
                    </div>

                    <div className="p-4 bg-[#ff7028]/15 dark:bg-[#ff7028]/10 border-3 border-[#ff7028] shadow-[3px_3px_0_#ff7028]">
                      <span className="text-[10px] font-mono font-bold text-[#ff7028] uppercase tracking-wider block mb-1">
                        Trap 02 // Surveillance
                      </span>
                      <h2 className="font-['Bowlby_One'] text-base uppercase mb-1">The Ad Harvester</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e]">
                        Big Tech offers "free" cloud AI in exchange for harvesting private conversation transcripts, photos, and live screen contexts to build hyper-targeted ad dossiers.
                      </p>
                    </div>

                    <div className="p-4 bg-[#0e4dff]/15 dark:bg-[#0e4dff]/10 border-3 border-[#0e4dff] shadow-[3px_3px_0_#0e4dff]">
                      <span className="text-[10px] font-mono font-bold text-[#0e4dff] uppercase tracking-wider block mb-1">
                        Trap 03 // Reliability
                      </span>
                      <h2 className="font-['Bowlby_One'] text-base uppercase mb-1">Cloud Fragility</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e]">
                        The moment an Indian user enters a metro tunnel, flight, basement office, or rural zone without reliable 5G, cloud AI immediately renders unusable and dies.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] text-xs font-mono flex items-center justify-between">
                    <span className="font-bold uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                      Key Takeaway for Investors:
                    </span>
                    <span className="text-[#0e4dff] dark:text-[#38bdf8] font-bold">
                      SNEHA decouples user growth from server inference costs.
                    </span>
                  </div>
                </div>
              )}

              {/* SLIDE 03: THE ARCHITECTURE */}
              {currentSlide === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white dark:bg-[#1f180d] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                      <h2 className="font-['Bowlby_One'] text-base uppercase text-[#0e4dff] mb-2 flex items-center gap-1.5">
                        <Cpu size={16} />
                        Edge Neural Pipeline
                      </h2>
                      <ul className="text-xs space-y-1.5 font-sans">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={13} className="text-[#10b981] shrink-0 mt-0.5" />
                          <span><strong>Quantized Model Execution:</strong> 2-bit &amp; 4-bit weights optimized for ARM64-v8a.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={13} className="text-[#10b981] shrink-0 mt-0.5" />
                          <span><strong>Direct Intent Parser:</strong> Sub-100ms local execution for calls, alarms, and settings.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={13} className="text-[#10b981] shrink-0 mt-0.5" />
                          <span><strong>Zero Network Roundtrips:</strong> Prompts never leave RAM buffer.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 bg-white dark:bg-[#1f180d] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                      <h2 className="font-['Bowlby_One'] text-base uppercase text-[#ff4a8a] mb-2 flex items-center gap-1.5">
                        <Smartphone size={16} />
                        Universal Android Range
                      </h2>
                      <ul className="text-xs space-y-1.5 font-sans">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={13} className="text-[#10b981] shrink-0 mt-0.5" />
                          <span><strong>Min SDK 26 (Android 8.0 Oreo):</strong> Compatible with 95%+ of active devices.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={13} className="text-[#10b981] shrink-0 mt-0.5" />
                          <span><strong>Target SDK 35 (Android 15):</strong> Future-proofed for latest NPU neural extensions.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={13} className="text-[#10b981] shrink-0 mt-0.5" />
                          <span><strong>6.2 MB Starter Binary:</strong> Ultra-lean install footprint vs multi-gigabyte bloat.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 bg-[#eedcb4]/60 dark:bg-[#271f13] border-2 border-dashed border-[#1f1a0e] flex items-center justify-between text-xs">
                    <span className="font-['Crimson_Pro'] italic text-[#5a4f30] dark:text-[#cdbe9e]">
                      Want to inspect the device compatibility breakdown live?
                    </span>
                    <button
                      onClick={() => onNavigateTab('compatibility')}
                      className="px-2.5 py-1 bg-[#ff7028] text-[#1f1a0e] font-bold text-[10px] uppercase border border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#ff4a8a] transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Open Compatibility Matrix</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 04: WHY RIGHT NOW IN 2026? */}
              {currentSlide === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-[#1f180d] border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#ff7028] uppercase tracking-wider block mb-1">
                        Breakthrough 01
                      </span>
                      <h2 className="font-['Bowlby_One'] text-base uppercase mb-1">SLM Quantization</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e]">
                        Recent algorithmic breakthroughs in 2-bit/4-bit quantization allow compact language models to execute with full coherence on modest 4GB/6GB RAM chipsets without frying device thermals.
                      </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-[#1f180d] border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#ff4a8a] uppercase tracking-wider block mb-1">
                        Breakthrough 02
                      </span>
                      <h2 className="font-['Bowlby_One'] text-base uppercase mb-1">The Flagship Gap</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e]">
                        Apple Intelligence and Google Gemini Nano require ₹80,000+ luxury flagships (iPhone 15 Pro, Pixel 9 Pro). Over 85% of Indian consumers are locked out by Big Tech.
                      </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-[#1f180d] border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#0e4dff] uppercase tracking-wider block mb-1">
                        Breakthrough 03
                      </span>
                      <h2 className="font-['Bowlby_One'] text-base uppercase mb-1">Privacy Statutes</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e]">
                        India’s Digital Personal Data Protection (DPDP) Act and EU AI Acts impose massive penalties for cloud data leaks. Enterprise and student users actively demand local-first software.
                      </p>
                    </div>
                  </div>

                  {/* Flagship Exclusion Interactive Visualizer */}
                  <div className="p-3 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e]">
                    <div className="flex items-center justify-between text-xs font-bold uppercase mb-2">
                      <span>Indian Smartphone Market Coverage Reality:</span>
                      <div className="flex gap-1 text-[10px]">
                        <button
                          onClick={() => setSelectedHardwareFilter('flagship')}
                          className={`px-1.5 py-0.5 border border-[#1f1a0e] ${
                            selectedHardwareFilter === 'flagship' ? 'bg-[#ff4a8a] text-white' : 'bg-white text-[#1f1a0e]'
                          }`}
                        >
                          Apple &amp; Gemini Nano (5.5%)
                        </button>
                        <button
                          onClick={() => setSelectedHardwareFilter('budget')}
                          className={`px-1.5 py-0.5 border border-[#1f1a0e] ${
                            selectedHardwareFilter === 'budget' ? 'bg-[#10b981] text-white' : 'bg-white text-[#1f1a0e]'
                          }`}
                        >
                          SNEHA Market (94.5%)
                        </button>
                      </div>
                    </div>

                    <div className="w-full bg-[#1f1a0e]/20 h-5 border border-[#1f1a0e] flex overflow-hidden">
                      <div
                        className="bg-[#ff4a8a] flex items-center justify-center text-[9px] font-black text-white"
                        style={{ width: '5.5%' }}
                        title="Apple Intelligence / Gemini Nano (5.5% of Indian Phones)"
                      >
                        5%
                      </div>
                      <div
                        className="bg-[#10b981] flex items-center justify-center text-[10px] font-black text-white"
                        style={{ width: '94.5%' }}
                        title="SNEHA Addressable Android Hardware (94.5% of Indian Phones)"
                      >
                        SNEHA MASS MARKET REACH (94.5% OF SMARTPHONES)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 05: CODE REALITY, NOT SLIDES */}
              {currentSlide === 4 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <b className="font-['Bowlby_One'] text-2xl text-[#0e4dff] block leading-none mb-1">SDK 26</b>
                      <span className="font-mono text-[10px] font-bold uppercase">Android 8.0+ Verified</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <b className="font-['Bowlby_One'] text-2xl text-[#ff4a8a] block leading-none mb-1">0 Trackers</b>
                      <span className="font-mono text-[10px] font-bold uppercase">Audited Codebase</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <b className="font-['Bowlby_One'] text-2xl text-[#ff7028] block leading-none mb-1">6.2 MB</b>
                      <span className="font-mono text-[10px] font-bold uppercase">Pilot APK Binary</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <b className="font-['Bowlby_One'] text-2xl text-[#10b981] block leading-none mb-1">50/50</b>
                      <span className="font-mono text-[10px] font-bold uppercase">Passing Tests</span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#eedcb4]/80 dark:bg-[#271f13] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                        Live Interactive Platform Already Operational
                      </h2>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#2a2515] dark:text-[#cdbe9e] mt-0.5">
                        Test our QR sideloading flow, SHA-256 build checksum validator, or live tester sentiment analytics right now.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => onNavigateTab('download')}
                        className="px-3 py-1.5 bg-[#ff4a8a] text-[#1f1a0e] font-bold text-xs uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#ff7028] transition-all cursor-pointer"
                      >
                        APK Sideload Hub →
                      </button>
                      <button
                        onClick={() => onNavigateTab('audit')}
                        className="px-3 py-1.5 bg-[#0e4dff] text-white font-bold text-xs uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#1f1a0e] transition-all cursor-pointer"
                      >
                        Code Audit Table →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 06: TAM · SAM · SOM SIZING */}
              {currentSlide === 5 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-[#1f180d] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#5a4f30] dark:text-[#cdbe9e] uppercase tracking-wider block mb-1">
                        Total Addressable Market (TAM)
                      </span>
                      <b className="font-['Bowlby_One'] text-3xl text-[#1f1a0e] dark:text-[#fdfaf2] block mb-1">
                        3.5 Billion
                      </b>
                      <span className="text-xs font-bold uppercase text-[#0e4dff] block mb-2">Global Android Devices</span>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#2a2515] dark:text-[#cdbe9e]">
                        A $150 Billion worldwide consumer software and AI assistant ecosystem transitioning toward edge-local computing.
                      </p>
                    </div>

                    <div className="p-4 bg-white dark:bg-[#1f180d] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#5a4f30] dark:text-[#cdbe9e] uppercase tracking-wider block mb-1">
                        Serviceable Available Market (SAM)
                      </span>
                      <b className="font-['Bowlby_One'] text-3xl text-[#ff7028] block mb-1">
                        650 Million
                      </b>
                      <span className="text-xs font-bold uppercase text-[#1f1a0e] dark:text-[#fdfaf2] block mb-2">Indian Android Handsets</span>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#2a2515] dark:text-[#cdbe9e]">
                        India is the world's second-largest smartphone market with ₹26,000 Crore+ ($3.2B) annual consumer digital spend.
                      </p>
                    </div>

                    <div className="p-4 bg-[#10b981]/15 dark:bg-[#10b981]/10 border-3 border-[#10b981] shadow-[4px_4px_0_#10b981]">
                      <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-wider block mb-1">
                        Serviceable Obtainable (SOM - Year 1–2)
                      </span>
                      <b className="font-['Bowlby_One'] text-3xl text-[#10b981] block mb-1">
                        2 Million
                      </b>
                      <span className="text-xs font-bold uppercase text-[#1f1a0e] dark:text-[#fdfaf2] block mb-2">Active Indian Subscribers</span>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#2a2515] dark:text-[#cdbe9e]">
                        Capturing just 0.3% of Indian users yields <strong>₹160 Crore ($19.2M) ARR</strong> at our blended ₹799/yr annual tier.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] text-xs font-mono flex items-center justify-between">
                    <span>Bottom-up conversion math:</span>
                    <span className="font-bold text-[#ff4a8a]">
                      40M Indian University Students &amp; Developers $\times$ 5% target adoption = 2.0M users.
                    </span>
                  </div>
                </div>
              )}

              {/* SLIDE 07: 90%+ GROSS MARGIN ECONOMICS (LIVE SIMULATOR) */}
              {currentSlide === 6 && (
                <div className="space-y-4">
                  {/* Interactive Controls Bar */}
                  <div className="p-4 bg-[#eedcb4] dark:bg-[#271f13] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Sliders size={16} className="text-[#0e4dff]" />
                        <span className="font-['Bowlby_One'] text-xs uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                          Interactive Financial &amp; Unit Economics Simulator:
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold">Active User Base:</span>
                        <span className="px-2 py-0.5 bg-[#1f1a0e] text-[#f5ecd4] dark:bg-[#fdfaf2] dark:text-[#1f1a0e] font-mono text-xs font-bold">
                          {simUsers.toLocaleString()} Users
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={10000}
                      max={200000}
                      step={5000}
                      value={simUsers}
                      onChange={(e) => setSimUsers(Number(e.target.value))}
                      className="w-full accent-[#ff4a8a] cursor-pointer"
                    />

                    <div className="flex justify-between text-[10px] font-mono mt-1 text-[#5a4f30] dark:text-[#cdbe9e]">
                      <span>10,000 (Early Scale)</span>
                      <span>50,000 (12-Mo Target)</span>
                      <span>100,000 (Growth)</span>
                      <span>200,000 (Category Leader)</span>
                    </div>
                  </div>

                  {/* Financial Comparison Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* SNEHA Economics */}
                    <div className="p-4 bg-[#10b981]/15 dark:bg-[#10b981]/10 border-3 border-[#10b981] shadow-[4px_4px_0_#10b981]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-['Bowlby_One'] text-sm uppercase text-[#10b981]">
                          SNEHA (On-Device Architecture)
                        </span>
                        <span className="px-2 py-0.5 bg-[#10b981] text-white font-['Bowlby_One'] text-[10px] uppercase">
                          {calculatedFinances.snehaGrossMarginPct}% GROSS MARGIN
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span>Annual Revenue (ARR):</span>
                          <strong className="text-base text-[#1f1a0e] dark:text-[#fdfaf2]">
                            ₹{(calculatedFinances.annualRunRate / 10000000).toFixed(2)} Cr
                          </strong>
                        </div>
                        <div className="flex justify-between text-[#10b981]">
                          <span>Cloud GPU Inference Costs:</span>
                          <strong>₹0 (Runs on device)</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Gateway &amp; Ops (7%):</span>
                          <span>₹{((calculatedFinances.monthlyTotalRevenue * 0.07 * 12) / 100000).toFixed(1)} Lakhs</span>
                        </div>
                        <div className="pt-2 border-t border-[#10b981]/40 flex justify-between font-bold text-sm text-[#10b981]">
                          <span>Annual Gross Profit:</span>
                          <span>₹{((calculatedFinances.snehaGrossProfit * 12) / 10000000).toFixed(2)} Cr</span>
                        </div>
                      </div>
                    </div>

                    {/* Competitor Cloud AI Economics */}
                    <div className="p-4 bg-[#ff4a8a]/15 dark:bg-[#ff4a8a]/10 border-3 border-[#ff4a8a] shadow-[4px_4px_0_#ff4a8a]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-['Bowlby_One'] text-sm uppercase text-[#ff4a8a]">
                          Typical Cloud AI (API Wrapper)
                        </span>
                        <span className="px-2 py-0.5 bg-[#ff4a8a] text-white font-['Bowlby_One'] text-[10px] uppercase">
                          {calculatedFinances.cloudAiGrossMarginPct}% MARGIN
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span>Annual Revenue (ARR):</span>
                          <span>₹{(calculatedFinances.annualRunRate / 10000000).toFixed(2)} Cr</span>
                        </div>
                        <div className="flex justify-between text-[#ff4a8a]">
                          <span>Cloud GPU Server Bills:</span>
                          <strong>
                            -₹{((calculatedFinances.cloudAiComputeCostPerMonth * 12) / 10000000).toFixed(2)} Cr
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Gateway &amp; Ops:</span>
                          <span>₹{((calculatedFinances.monthlyTotalRevenue * 0.07 * 12) / 100000).toFixed(1)} Lakhs</span>
                        </div>
                        <div className="pt-2 border-t border-[#ff4a8a]/40 flex justify-between font-bold text-sm text-[#ff4a8a]">
                          <span>Annual Gross Profit:</span>
                          <span>₹{((calculatedFinances.cloudAiGrossProfit * 12) / 10000000).toFixed(2)} Cr</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-[#1f180d] border border-[#1f1a0e] text-center text-xs font-mono">
                    <strong className="text-[#0e4dff]">SNEHA Structural Moat:</strong> Saves ₹
                    {(calculatedFinances.annualSavingsVsCloud / 10000000).toFixed(2)} Crores every year in cloud inference expenses at {simUsers.toLocaleString()} active users!
                  </div>
                </div>
              )}

              {/* SLIDE 08: COMPETITIVE SUPERIORITY MATRIX */}
              {currentSlide === 7 && (
                <div className="space-y-4">
                  <div className="overflow-x-auto border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] bg-white dark:bg-[#1f180d]">
                    <table className="w-full text-left border-collapse text-xs min-w-[650px]">
                      <thead>
                        <tr className="bg-[#1f1a0e] text-[#f5ecd4] font-['Bowlby_One'] text-[10px] uppercase tracking-wider">
                          <th className="p-2.5 border-r border-[#3a3320]">Competitive Metric</th>
                          <th className="p-2.5 border-r border-[#3a3320] bg-[#ff4a8a] text-[#1f1a0e]">SNEHA</th>
                          <th className="p-2.5 border-r border-[#3a3320]">ChatGPT Plus</th>
                          <th className="p-2.5 border-r border-[#3a3320]">Google Gemini</th>
                          <th className="p-2.5">Apple Intelligence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1f1a0e]/20 font-sans">
                        <tr className="hover:bg-[#eedcb4]/30">
                          <td className="p-2.5 font-bold border-r border-[#1f1a0e]/20">Marginal Compute Cost</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 font-bold text-[#10b981] bg-[#10b981]/10">₹0 (On-Device)</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">~$0.02 / query</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">Cloud compute burn</td>
                          <td className="p-2.5 text-[#ff7028]">Hybrid Cloud Server</td>
                        </tr>
                        <tr className="hover:bg-[#eedcb4]/30">
                          <td className="p-2.5 font-bold border-r border-[#1f1a0e]/20">100% Offline Capable</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 font-bold text-[#10b981] bg-[#10b981]/10">YES (Always)</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">NO (Dead offline)</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">NO (Requires Cloud)</td>
                          <td className="p-2.5 text-[#ff7028]">Partial</td>
                        </tr>
                        <tr className="hover:bg-[#eedcb4]/30">
                          <td className="p-2.5 font-bold border-r border-[#1f1a0e]/20">Zero Data Harvesting</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 font-bold text-[#10b981] bg-[#10b981]/10">100% Verified</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">Cloud logged</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">Ad profile ingestion</td>
                          <td className="p-2.5 text-[#ff7028]">PCC Cloud server</td>
                        </tr>
                        <tr className="hover:bg-[#eedcb4]/30">
                          <td className="p-2.5 font-bold border-r border-[#1f1a0e]/20">Hardware Accessibility</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 font-bold text-[#10b981] bg-[#10b981]/10">Android 8.0+ (95%+)</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20">Any (Needs 5G)</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">₹70k+ Flagships only</td>
                          <td className="p-2.5 text-[#ff4a8a]">₹80k+ iPhone 15 Pro+</td>
                        </tr>
                        <tr className="hover:bg-[#eedcb4]/30">
                          <td className="p-2.5 font-bold border-r border-[#1f1a0e]/20">Consumer Price in India</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 font-bold text-[#0e4dff] bg-[#0e4dff]/10">₹66–₹143 / mo</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">₹1,999 / mo ($20)</td>
                          <td className="p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">₹1,950 / mo</td>
                          <td className="p-2.5 text-[#ff4a8a]">₹1,30,000 Device</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] text-xs font-mono flex items-center justify-between">
                    <span>The Unassailable Moat:</span>
                    <strong className="text-[#0e4dff]">
                      Zero marginal cost allows SNEHA to price 10x cheaper than cloud AI while earning 4x higher margins.
                    </strong>
                  </div>
                </div>
              )}

              {/* SLIDE 09: GO-TO-MARKET (GTM) STRATEGY */}
              {currentSlide === 8 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-[#1f180d] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#ff4a8a] uppercase tracking-wider block mb-1">
                        Phase 01 // Viral Pilot
                      </span>
                      <h2 className="font-['Bowlby_One'] text-base uppercase mb-1">Campus Ground Game</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e] mb-2">
                        Now through Dec 1, 2026. Free pilot launch targeting engineering colleges and student tech hubs across India.
                      </p>
                      <div className="p-2 bg-[#eedcb4] dark:bg-[#271f13] border border-[#1f1a0e] text-[10px] font-mono">
                        • Top 100 bug reporters receive lifetime free license.<br />
                        • QR posters across campus labs.
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-[#1f180d] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#0e4dff] uppercase tracking-wider block mb-1">
                        Phase 02 // Direct Rollout
                      </span>
                      <h2 className="font-['Bowlby_One'] text-base uppercase mb-1">0% App Store Cut</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e] mb-2">
                        Direct APK sideload distribution saves the mandatory 30% Google Play Commission, passing savings to consumers.
                      </p>
                      <div className="p-2 bg-[#eedcb4] dark:bg-[#271f13] border border-[#1f1a0e] text-[10px] font-mono">
                        • 1-Click UPI payment (PhonePe, GPay).<br />
                        • Locked-in Founder lifetime pricing renewals.
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-[#1f180d] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-wider block mb-1">
                        Phase 03 // Scale Moat
                      </span>
                      <h2 className="font-['Bowlby_One'] text-base uppercase mb-1">OEM Pre-loads</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e] mb-2">
                        Partnerships with regional smartphone brands (Lava, Micromax) and refurbished mobile distributors.
                      </p>
                      <div className="p-2 bg-[#eedcb4] dark:bg-[#271f13] border border-[#1f1a0e] text-[10px] font-mono">
                        • Factory pre-install as private on-device assistant.<br />
                        • Revenue-share with hardware vendors.
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] text-xs font-mono flex items-center justify-between">
                    <span>Customer Acquisition Cost (CAC) Advantage:</span>
                    <strong className="text-[#10b981]">
                      Blended CAC under ₹45 via peer-to-peer APK sharing and campus student ambassadors.
                    </strong>
                  </div>
                </div>
              )}

              {/* SLIDE 10: THE ASK & MILESTONES */}
              {currentSlide === 9 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* The Ask */}
                    <div className="p-5 bg-white dark:bg-[#1f180d] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                      <span className="text-xs font-mono font-bold text-[#ff4a8a] uppercase tracking-wider block mb-1">
                        Seed Capital Ask
                      </span>
                      <h2 className="font-['Bowlby_One'] text-3xl uppercase text-[#1f1a0e] dark:text-[#fdfaf2] mb-3">
                        ₹25 Lakhs
                      </h2>
                      <span className="font-mono text-xs font-bold text-[#5a4f30] dark:text-[#cdbe9e] block mb-3">
                        Use of Proceeds &amp; Allocation:
                      </span>
                      <ul className="text-xs space-y-2 font-mono">
                        <li className="flex items-center justify-between p-2 bg-[#eedcb4]/50 dark:bg-[#271f13] border border-[#1f1a0e]">
                          <span>50% Model Quantization &amp; NPU Tuning:</span>
                          <strong>₹12.5 Lakhs</strong>
                        </li>
                        <li className="flex items-center justify-between p-2 bg-[#eedcb4]/50 dark:bg-[#271f13] border border-[#1f1a0e]">
                          <span>30% Campus Growth &amp; Referral Bounties:</span>
                          <strong>₹7.5 Lakhs</strong>
                        </li>
                        <li className="flex items-center justify-between p-2 bg-[#eedcb4]/50 dark:bg-[#271f13] border border-[#1f1a0e]">
                          <span>20% OEM Compatibility Test Lab:</span>
                          <strong>₹5.0 Lakhs</strong>
                        </li>
                      </ul>
                    </div>

                    {/* Milestones */}
                    <div className="p-5 bg-[#10b981]/15 dark:bg-[#10b981]/10 border-3 border-[#10b981] shadow-[4px_4px_0_#10b981]">
                      <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider block mb-1">
                        12-Month Execution Roadmap
                      </span>
                      <h2 className="font-['Bowlby_One'] text-2xl uppercase text-[#1f1a0e] dark:text-[#fdfaf2] mb-3">
                        Milestones &amp; Targets
                      </h2>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="p-2 bg-white dark:bg-[#1f180d] border border-[#10b981]">
                          <strong className="text-[#0e4dff]">Month 03:</strong> 15,000 Active Pilot Testers &amp; Bug Bounty completion.
                        </div>
                        <div className="p-2 bg-white dark:bg-[#1f180d] border border-[#10b981]">
                          <strong className="text-[#ff7028]">Month 06:</strong> Commercial Launch, ₹50 Lakhs ARR run-rate achieved.
                        </div>
                        <div className="p-2 bg-white dark:bg-[#1f180d] border border-[#10b981]">
                          <strong className="text-[#10b981]">Month 12:</strong> 50,000 Paid Subscribers, ₹3.5 Crore ARR at 90%+ Gross Margin.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] text-center">
                    <span className="font-['Bowlby_One'] text-sm uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                      SNEHA: True Personal AI · 100% Private · The Future of Edge Computing
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Slide Navigation Footer Bar */}
            <div className="pt-4 border-t-3 border-[#1f1a0e] dark:border-[#eedcb4]/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentSlide === 0}
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="px-3.5 py-1.5 bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] font-bold text-xs uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#ff7028] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  disabled={currentSlide === SLIDES.length - 1}
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="px-4 py-1.5 bg-[#ff4a8a] text-[#1f1a0e] font-bold text-xs uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#ff7028] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-[#5a4f30] dark:text-[#cdbe9e]">
                <span>Navigate with</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#271f13] border border-[#1f1a0e] font-bold text-[10px]">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#271f13] border border-[#1f1a0e] font-bold text-[10px]">→</kbd>
                <span>or</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#271f13] border border-[#1f1a0e] font-bold text-[10px]">Space</kbd>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-bold text-[#1f1a0e] dark:text-[#fdfaf2]">
                  Slide {currentSlide + 1} of {SLIDES.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          VIEW MODE B: EXECUTIVE INVESTOR MEMO (CONTINUOUS SCROLL)
          ------------------------------------------------------------- */}
      {viewMode === 'memo' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {/* Memo Executive Masthead */}
          <div className="p-6 sm:p-8 bg-white dark:bg-[#1a140b] border-4 border-[#1f1a0e] dark:border-[#eedcb4]/40 shadow-[8px_8px_0_#1f1a0e]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1f1a0e]/20 pb-3 mb-4 text-xs font-mono">
              <span className="font-bold uppercase text-[#0e4dff]">INVESTMENT MEMORANDUM // CONFIDENTIAL</span>
              <span>DATE: OCTOBER 2026</span>
            </div>
            <h1 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight text-[#1f1a0e] dark:text-[#fdfaf2] mb-3">
              SNEHA: The On-Device AI Investment Memo
            </h1>
            <p className="font-['Crimson_Pro'] italic text-base sm:text-lg text-[#2a2515] dark:text-[#cdbe9e] leading-relaxed">
              Executive summary, unit economics analysis, and venture defensibility for SNEHA — the 100% on-device AI companion operating without cloud GPU overhead.
            </p>
          </div>

          {/* Sequential 10-Module Executive Dossier */}
          {SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className="p-6 bg-[#f5ecd4] dark:bg-[#1a140b] border-3 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[6px_6px_0_#1f1a0e]"
            >
              <div className="flex items-center justify-between border-b-2 border-[#1f1a0e]/20 pb-2 mb-3">
                <span className="font-['Bowlby_One'] text-sm uppercase text-[#ff4a8a]">
                  SECTION {slide.number} // {slide.badge}
                </span>
                <span className="font-mono text-xs font-bold text-[#5a4f30]">REF #{slide.number}</span>
              </div>
              <h2 className="font-['Bowlby_One'] text-xl sm:text-2xl uppercase mb-2 text-[#1f1a0e] dark:text-[#fdfaf2]">
                {slide.title}
              </h2>
              <p className="font-['Crimson_Pro'] italic text-sm text-[#2a2515] dark:text-[#cdbe9e] mb-4">
                {slide.subtitle}
              </p>

              {/* Memo Section Summaries */}
              {idx === 0 && (
                <div className="space-y-2 text-xs font-sans leading-relaxed">
                  <p>
                    Consumer AI faces a looming margin collapse. While OpenAI and Anthropic charge monthly subscriptions, the underlying cloud GPU compute cost consumes the vast majority of gross revenues. SNEHA introduces a paradigm shift: executing neural inference directly on the user's Android phone hardware, reducing marginal compute cost to zero while protecting user privacy.
                  </p>
                </div>
              )}

              {idx === 1 && (
                <div className="space-y-2 text-xs font-sans leading-relaxed">
                  <p>
                    Cloud AI architectures inherently suffer from three fatal flaws: high inference burn rates, ad-monetization surveillance models, and total dependency on cellular connectivity. SNEHA circumvents all three by operating as an edge-native APK application.
                  </p>
                </div>
              )}

              {idx === 6 && (
                <div className="p-3 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] text-xs font-mono space-y-1">
                  <div className="font-bold uppercase text-[#10b981]">Unit Economics Benchmark at 50,000 Subscribers:</div>
                  <div>• Gross Revenue: ₹4.80 Crores ($575,000 ARR)</div>
                  <div>• Cloud GPU Server Burn: ₹0 (Zero)</div>
                  <div>• Gross Margin: 93% Net Operational Margin</div>
                  <div>• Cloud AI Competitor Equivalent: -12.5% Margin (₹60 Lakhs Net Loss)</div>
                </div>
              )}

              {idx === 7 && (
                <div className="p-3 bg-white dark:bg-[#1f180d] border border-[#1f1a0e] text-xs font-mono space-y-1">
                  <strong>The Defensive Moat:</strong> SNEHA’s zero marginal compute cost enables pricing 10x lower than ChatGPT Plus (₹799/year vs ₹24,000/year) while maintaining 90%+ gross margins that venture-backed API wrappers cannot match.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* -------------------------------------------------------------
          BOTTOM DRAWER: JUDGE Q&A DEFENSE (SPEAKER CHEAT SHEET)
          ------------------------------------------------------------- */}
      <section aria-label="Judge Q&A Defense" className="max-w-6xl mx-auto px-4 sm:px-8 mt-10">
        <div className="p-5 sm:p-6 bg-[#eedcb4] dark:bg-[#1f180d] border-4 border-[#1f1a0e] dark:border-[#eedcb4]/40 shadow-[8px_8px_0_#1f1a0e]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-[#ff4a8a]" />
              <h2 className="font-['Bowlby_One'] text-base sm:text-lg uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                Judge Q&amp;A Defense · Battle-Tested Answers
              </h2>
            </div>
            <span className="font-mono text-xs font-bold text-[#5a4f30] dark:text-[#cdbe9e]">
              Speaker Cheat Sheet for Tough Panel Questions
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Q1. Can cheap budget phones really execute AI models without severe thermal throttling or battery drain?',
                a: 'Yes. SNEHA does not run a bloated 7B parameter cloud model continuously. We utilize INT4 quantized Small Language Models paired with an intelligent Intent Router. For 80% of everyday actions (alarms, contacts, notes, app automation), execution takes under 100ms and immediately idles the neural engine, consuming less battery than scrolling a social media feed.'
              },
              {
                q: 'Q2. What prevents Google or Apple from expanding Gemini Nano or Apple Intelligence to cheaper phones?',
                a: 'Structural business disincentives. Google generates over $200 Billion annually from cloud search ads. Their business model requires capturing user telemetry, voice queries, and shopping intents in the cloud to profile users. SNEHA is architecturally zero-telemetry and runs 100% offline. Google cannot eliminate cloud tracking without cannibalizing their core ad revenue.'
              },
              {
                q: 'Q3. Why distribute as a sideloaded APK instead of launching exclusively on the Google Play Store?',
                a: 'Two strategic reasons: 1) Economics: Google Play extracts a mandatory 15% to 30% toll on every subscription. By distributing directly, we pass 100% of those savings to Indian students and founders at ₹143/mo and ₹799/yr. 2) Speed of Innovation: Direct APK distribution enables instant hotfixes without multi-day Play Store review delays. We will list on Google Play in Phase 2 for mainstream trust.'
              },
              {
                q: 'Q4. How will you prevent software piracy or unauthorized APK copying?',
                a: 'Each SNEHA install generates a device-unique cryptographic Android Keystore token bound to hardware identifiers. Paid subscriptions issue a signed, offline-validating time-locked license certificate that cryptographically binds to the specific device without needing persistent cloud phone-home verification.'
              }
            ].map((item, qIdx) => {
              const isExpanded = expandedFaqIndex === qIdx;
              return (
                <div
                  key={qIdx}
                  className="bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] transition-all"
                >
                  <button
                    onClick={() => setExpandedFaqIndex(isExpanded ? null : qIdx)}
                    className="w-full p-3 text-left font-['Bowlby_One'] text-xs sm:text-sm uppercase flex items-center justify-between gap-3 cursor-pointer hover:bg-[#eedcb4]/40"
                  >
                    <span>{item.q}</span>
                    {isExpanded ? <ChevronUp size={16} className="shrink-0" /> : <ChevronDown size={16} className="shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-[#1f1a0e]/15 font-['Crimson_Pro'] italic text-xs sm:text-sm text-[#2a2515] dark:text-[#cdbe9e] leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PitchDeck;

