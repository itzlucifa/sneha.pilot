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
    badge: 'VISION & MISSION',
    title: 'The On-Device AI Revolution',
    subtitle: 'A 100% private AI companion that lives inside your phone, works without internet, and costs zero rupees in cloud server fees.'
  },
  {
    id: 'problem',
    number: '02',
    badge: 'THE BIG PROBLEM',
    title: 'Why Cloud AI is Broken Today',
    subtitle: 'ChatGPT and Gemini burn billions in server electricity, sell your private conversations, and stop working the moment you lose signal.'
  },
  {
    id: 'solution',
    number: '03',
    badge: 'HOW SNEHA WORKS',
    title: 'SNEHA: True Edge Intelligence',
    subtitle: 'We shrank the AI brain to fit directly onto your everyday Android phone. Fast, battery-friendly, and completely private.'
  },
  {
    id: 'why-now',
    number: '04',
    badge: 'THE MARKET TIMING',
    title: 'Why Right Now in 2026?',
    subtitle: 'Big Tech built AI only for ₹80,000+ luxury phones. We bring private AI to the 600 Million everyday phones they completely ignored.'
  },
  {
    id: 'product',
    number: '05',
    badge: 'REAL WORKING CODE',
    title: 'Code Reality, Not Empty Slides',
    subtitle: 'We already built the app. A 6.2 MB download, compatible with 95% of Android phones, and verified with zero tracking code.'
  },
  {
    id: 'market',
    number: '06',
    badge: 'MARKET SIZE',
    title: 'How Big Can SNEHA Grow?',
    subtitle: 'A ₹160 Crore ($19 Million) annual revenue opportunity in India alone by serving students and privacy-conscious professionals.'
  },
  {
    id: 'unit-economics',
    number: '07',
    badge: 'BUSINESS MODEL',
    title: '90%+ Pure Profit Margins',
    subtitle: 'We charge pocket-friendly rates (₹143/month, ₹799/year). Because compute runs on the user’s phone, our server bill is ₹0.'
  },
  {
    id: 'competition',
    number: '08',
    badge: 'WHY WE WIN',
    title: 'Competitive Superiority Matrix',
    subtitle: 'Why OpenAI, Google, and Apple cannot match our prices or our privacy guarantees without destroying their own business models.'
  },
  {
    id: 'gtm',
    number: '09',
    badge: 'GROWTH STRATEGY',
    title: 'How We Get Our First 100,000 Users',
    subtitle: 'College campus word-of-mouth, direct APK sharing with 0% Google Play cut, and partnerships with regional phone makers.'
  },
  {
    id: 'the-ask',
    number: '10',
    badge: 'THE INVESTMENT ASK',
    title: 'Seed Ask & 12-Month Targets',
    subtitle: 'Raising ₹25 Lakhs to reach 50,000 paid subscribers and ₹3.5 Crore annual revenue at 90%+ gross profit margins.'
  }
];

export const PitchDeck: React.FC<PitchDeckProps> = ({ onNavigateTab }) => {
  // Presentation Controls
  const [viewMode, setViewMode] = useState<'presentation' | 'memo'>('presentation');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pitch Timer (e.g. 3m or 5m competition limits)
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

  // Touch coordinates for mobile swipe
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

  // Keyboard Navigation
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

  // Touch swipe support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (viewMode !== 'presentation') return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(diff) > 40) {
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

    const monthlyRevFromMonthlyUsers = simUsers * monthlyRatio * 143;
    const monthlyRevFromSixMonthUsers = simUsers * sixMonthRatio * (499 / 6);
    const monthlyRevFromAnnualUsers = simUsers * annualRatio * (799 / 12);

    const monthlyTotalRevenue = monthlyRevFromMonthlyUsers + monthlyRevFromSixMonthUsers + monthlyRevFromAnnualUsers;
    const annualRunRate = monthlyTotalRevenue * 12;

    // SNEHA Unit Economics (On-Device compute = ₹0 server costs)
    const snehaCloudComputeCost = 0;
    const snehaPaymentGatewayFee = monthlyTotalRevenue * 0.02; // 2% gateway
    const snehaOpsDistribution = monthlyTotalRevenue * 0.05; // 5% download bandwidth & basic ops
    const snehaGrossProfit = monthlyTotalRevenue - (snehaCloudComputeCost + snehaPaymentGatewayFee + snehaOpsDistribution);
    const snehaGrossMarginPct = Math.round((snehaGrossProfit / monthlyTotalRevenue) * 100);

    // Typical Cloud AI (e.g. calling OpenAI / Claude API at ~15 prompts/day = ₹90/month per active user)
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
        isFullscreen ? 'p-2 sm:p-6 flex flex-col justify-between' : 'pb-16'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* -------------------------------------------------------------
          TOP BAR: Presentation Controls, Mode Switcher, & Pitch Timer
          Hardened for clean display on 320px–375px mobile screens
          ------------------------------------------------------------- */}
      <section aria-label="Deck controls" className="sticky top-0 z-40 bg-[#f5ecd4]/95 dark:bg-[#120e07]/95 backdrop-blur-sm border-b-3 border-[#1f1a0e] dark:border-[#eedcb4]/30 px-2.5 sm:px-6 py-2 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Row 1 on mobile: Logo + Slide counter + Pitch Timer */}
          <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="px-2 py-0.5 bg-[#ff4a8a] text-[#1f1a0e] font-['Bowlby_One'] text-[11px] sm:text-xs uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                PITCH DECK
              </span>
              {viewMode === 'presentation' && (
                <span className="font-mono text-[10px] sm:text-xs font-bold bg-[#1f1a0e] text-[#f5ecd4] dark:bg-[#fdfaf2] dark:text-[#1f1a0e] px-1.5 py-0.5 border border-[#1f1a0e]">
                  SLIDE {activeSlideMeta.number} / 10
                </span>
              )}
            </div>

            {/* Pitch Countdown Timer */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-[#eedcb4] dark:bg-[#271f13] px-2 py-0.5 border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
              <Clock size={12} className="text-[#1f1a0e] dark:text-[#fdfaf2] shrink-0" />
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
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                title={isTimerRunning ? 'Pause Pitch Timer' : 'Start Pitch Timer'}
                className="p-1 hover:bg-[#1f1a0e]/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isTimerRunning ? <Pause size={11} /> : <Play size={11} />}
              </button>
              <button
                type="button"
                onClick={() => handleResetTimer(timerDuration)}
                title="Reset Timer"
                className="p-1 hover:bg-[#1f1a0e]/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} />
              </button>
              <div className="hidden md:flex items-center gap-1 pl-1 border-l border-[#1f1a0e]/20 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => handleResetTimer(180)}
                  className={`px-1 py-0.2 border border-[#1f1a0e] ${
                    timerDuration === 180 ? 'bg-[#ff7028] text-[#1f1a0e] font-bold' : 'bg-transparent'
                  }`}
                >
                  3m
                </button>
                <button
                  type="button"
                  onClick={() => handleResetTimer(300)}
                  className={`px-1 py-0.2 border border-[#1f1a0e] ${
                    timerDuration === 300 ? 'bg-[#ff7028] text-[#1f1a0e] font-bold' : 'bg-transparent'
                  }`}
                >
                  5m
                </button>
              </div>
            </div>
          </div>

          {/* Row 2 on mobile / Right on desktop: View Switcher & Fullscreen */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-1 sm:pt-0 border-t border-[#1f1a0e]/10 sm:border-t-0">
            <span className="sm:hidden font-mono text-[10px] text-[#5a4f30] dark:text-[#cdbe9e] truncate max-w-[160px]">
              {activeSlideMeta.badge}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
              <div className="flex border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] overflow-hidden text-[11px] font-bold uppercase">
                <button
                  type="button"
                  onClick={() => setViewMode('presentation')}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 flex items-center gap-1 transition-colors ${
                    viewMode === 'presentation'
                      ? 'bg-[#0e4dff] text-white'
                      : 'bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] hover:bg-white'
                  }`}
                >
                  <Presentation size={12} />
                  <span>Slides</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('memo')}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 flex items-center gap-1 transition-colors border-l-2 border-[#1f1a0e] ${
                    viewMode === 'memo'
                      ? 'bg-[#0e4dff] text-white'
                      : 'bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] hover:bg-white'
                  }`}
                >
                  <FileText size={12} />
                  <span>Memo</span>
                </button>
              </div>

              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Presentation Mode (Press F)'}
                className="p-1 sm:p-1.5 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#ff7028] transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
          </div>
        </div>

        {/* Slide Quick-Jump Bar (Horizontal scrollable with smooth touch) */}
        {viewMode === 'presentation' && (
          <div className="max-w-7xl mx-auto pt-1.5 overflow-x-auto no-scrollbar flex items-center gap-1 touch-pan-x">
            {SLIDES.map((s, idx) => {
              const isCurrent = currentSlide === idx;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`px-2 py-0.5 font-mono text-[9px] sm:text-[10px] font-bold uppercase whitespace-nowrap border-2 border-[#1f1a0e] transition-all cursor-pointer shrink-0 ${
                    isCurrent
                      ? 'bg-[#ff4a8a] text-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] -translate-y-0.5'
                      : 'bg-[#eedcb4]/60 dark:bg-[#271f13]/60 text-[#5a4f30] dark:text-[#cdbe9e] hover:bg-white dark:hover:bg-[#342a1a]'
                  }`}
                >
                  <span className="mr-0.5">{s.number}</span>
                  <span className="hidden sm:inline">{s.badge}</span>
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
        <div className="max-w-6xl mx-auto px-2.5 sm:px-6 md:px-8 py-4 sm:py-6 flex-1 flex flex-col justify-between">
          {/* Active Slide Canvas Container */}
          <div className="bg-[#f5ecd4] dark:bg-[#1a140b] border-3 sm:border-4 border-[#1f1a0e] dark:border-[#eedcb4]/40 shadow-[6px_6px_0_#1f1a0e] sm:shadow-[10px_10px_0_#1f1a0e] dark:shadow-[6px_6px_0_#000] p-4 sm:p-7 md:p-8 min-h-0 sm:min-h-[540px] flex flex-col justify-between relative transition-all">
            {/* Slide Header: Badge, Title & Plain English Subtitle */}
            <div>
              <div className="flex items-start justify-between border-b-2 sm:border-b-3 border-[#1f1a0e] dark:border-[#eedcb4]/20 pb-3 mb-3 sm:mb-5">
                <div className="min-w-0 flex-1 pr-2">
                  <span className="inline-block px-2.5 py-0.5 bg-[#ff7028] text-[#1f1a0e] font-['Bowlby_One'] text-[10px] sm:text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] mb-1.5">
                    {activeSlideMeta.number} // {activeSlideMeta.badge}
                  </span>
                  <h1 className="font-['Bowlby_One'] text-xl sm:text-3xl md:text-4xl uppercase tracking-tight text-[#1f1a0e] dark:text-[#fdfaf2] leading-tight break-words">
                    {activeSlideMeta.title}
                  </h1>
                </div>
                <div className="text-right hidden sm:block shrink-0">
                  <span className="font-['Bowlby_One'] text-3xl sm:text-5xl text-[#1f1a0e]/15 dark:text-[#fdfaf2]/10 select-none">
                    #{activeSlideMeta.number}
                  </span>
                </div>
              </div>
              <p className="font-['Crimson_Pro'] italic text-sm sm:text-base md:text-lg text-[#2a2515] dark:text-[#cdbe9e] mb-4 sm:mb-6 leading-relaxed">
                {activeSlideMeta.subtitle}
              </p>
            </div>

            {/* Dynamic Slide Content (Detailed & 100% Plain English) */}
            <div className="flex-1 my-1">
              {/* SLIDE 01: THE VISION & SIMPLE CORE PROMISE */}
              {currentSlide === 0 && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="p-3.5 sm:p-5 bg-[#eedcb4]/70 dark:bg-[#271f13] border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-[#0e4dff] uppercase tracking-wider block mb-1">
                      Our Core Belief in Plain Words
                    </span>
                    <blockquote className="font-['Bowlby_One'] text-lg sm:text-2xl md:text-3xl uppercase leading-snug text-[#1f1a0e] dark:text-[#fdfaf2] break-words">
                      “AI should be like a calculator: it should live inside your phone, work without internet, and never send your private life to corporate cloud servers.”
                    </blockquote>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#ff4a8a] text-[#1f1a0e] flex items-center justify-center border border-[#1f1a0e] font-black mb-1.5">
                        <DollarSign size={15} />
                      </div>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                        ₹0 Server Bills
                      </h2>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#5a4f30] dark:text-[#cdbe9e] mt-0.5 leading-relaxed">
                        Every question is calculated by your phone's processor. We do not pay big server companies, which means we keep over ₹90 of every ₹100 we earn as pure profit.
                      </p>
                    </div>

                    <div className="p-3 sm:p-4 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#0e4dff] text-white flex items-center justify-center border border-[#1f1a0e] font-black mb-1.5">
                        <Shield size={15} />
                      </div>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                        100% Private
                      </h2>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#5a4f30] dark:text-[#cdbe9e] mt-0.5 leading-relaxed">
                        Your private conversations, homework notes, and bank receipts never leave your phone. Nobody can read them, hack them, or use them to sell you targeted ads.
                      </p>
                    </div>

                    <div className="p-3 sm:p-4 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#10b981] text-white flex items-center justify-center border border-[#1f1a0e] font-black mb-1.5">
                        <Zap size={15} />
                      </div>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                        Always Works
                      </h2>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#5a4f30] dark:text-[#cdbe9e] mt-0.5 leading-relaxed">
                        On a flight, inside a Delhi or Mumbai metro tunnel, or in a village with no 5G signal — SNEHA answers your questions instantly with zero lag.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 02: WHY CLOUD AI IS BROKEN */}
              {currentSlide === 1 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="p-3.5 sm:p-4 bg-[#ff4a8a]/15 dark:bg-[#ff4a8a]/10 border-2 sm:border-3 border-[#ff4a8a] shadow-[2px_2px_0_#ff4a8a]">
                      <span className="text-[10px] font-mono font-bold text-[#ff4a8a] uppercase tracking-wider block mb-1">
                        Flaw 01 // The Cost Trap
                      </span>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase mb-1">Burning Cash on Servers</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e]">
                        Every time someone asks ChatGPT or Claude a question, it costs the company real money for supercomputers and electricity. When an app gets millions of users, their server bills blow up to ₹50 Lakhs a month. That is why they must charge expensive ₹1,999/month subscriptions.
                      </p>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-[#ff7028]/15 dark:bg-[#ff7028]/10 border-2 sm:border-3 border-[#ff7028] shadow-[2px_2px_0_#ff7028]">
                      <span className="text-[10px] font-mono font-bold text-[#ff7028] uppercase tracking-wider block mb-1">
                        Flaw 02 // Snooping on You
                      </span>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase mb-1">You Are the Product</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e]">
                        Big Tech gives you "free" cloud AI so they can ingest your screen, personal photos, and sensitive voice notes. They feed your words into massive databases so advertisers can target you with ads. With cloud AI, true privacy does not exist.
                      </p>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-[#0e4dff]/15 dark:bg-[#0e4dff]/10 border-2 sm:border-3 border-[#0e4dff] shadow-[2px_2px_0_#0e4dff]">
                      <span className="text-[10px] font-mono font-bold text-[#0e4dff] uppercase tracking-wider block mb-1">
                        Flaw 03 // The Signal Blocker
                      </span>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase mb-1">Useless Without Wi-Fi</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e]">
                        What happens when you are on a train between cities or in a basement office with no mobile network? Cloud AI gives you a spinning wheel of death and crashes. A true assistant should work whenever you need it, anywhere on Earth.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] text-xs font-mono flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="font-bold uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                      What this means for our business:
                    </span>
                    <span className="text-[#0e4dff] dark:text-[#38bdf8] font-bold">
                      Our costs stay at ₹0 while cloud competitors bleed cash every day.
                    </span>
                  </div>
                </div>
              )}

              {/* SLIDE 03: HOW SNEHA WORKS IN SIMPLE WORDS */}
              {currentSlide === 2 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1f180d] border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase text-[#0e4dff] mb-2 flex items-center gap-1.5">
                        <Cpu size={16} />
                        How the Smart Brain Works
                      </h2>
                      <ul className="text-xs space-y-2 font-sans text-[#2a2515] dark:text-[#e8deca]">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-[#10b981] shrink-0 mt-0.5" />
                          <span><strong>Shrunk Down by 80%:</strong> We use new mathematical compression (called quantization) so a full AI brain fits into standard phone memory without slowing down the phone.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-[#10b981] shrink-0 mt-0.5" />
                          <span><strong>Instant 0.1-Second Speed:</strong> Because questions don't travel to America and back across the internet, SNEHA responds almost instantly.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-[#10b981] shrink-0 mt-0.5" />
                          <span><strong>Zero Battery Drain:</strong> The AI wakes up, finishes the answer in 0.1 seconds, and immediately goes back to sleep so your battery stays cool.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1f180d] border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase text-[#ff4a8a] mb-2 flex items-center gap-1.5">
                        <Smartphone size={16} />
                        Runs on Phones You Already Own
                      </h2>
                      <ul className="text-xs space-y-2 font-sans text-[#2a2515] dark:text-[#e8deca]">
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-[#10b981] shrink-0 mt-0.5" />
                          <span><strong>Works on Android 8.0 up to Android 15:</strong> Compatible with almost every phone sold in the last 8 years (over 95% of all phones in India).</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-[#10b981] shrink-0 mt-0.5" />
                          <span><strong>Tiny 6.2 MB Download:</strong> Takes up less space than 2 photos on your phone. Easy to download over mobile data.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-[#10b981] shrink-0 mt-0.5" />
                          <span><strong>Controls Your Phone:</strong> Actually sets alarms, looks up contacts, and opens apps directly through native Android intents.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-3 bg-[#eedcb4]/60 dark:bg-[#271f13] border-2 border-dashed border-[#1f1a0e] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <span className="font-['Crimson_Pro'] italic text-[#5a4f30] dark:text-[#cdbe9e]">
                      See our verified phone compatibility matrix live:
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('compatibility')}
                      className="px-2.5 py-1 bg-[#ff7028] text-[#1f1a0e] font-bold text-[10px] uppercase border border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#ff4a8a] transition-all cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Open Compatibility Matrix</span>
                      <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              )}

              {/* SLIDE 04: WHY RIGHT NOW IN 2026? */}
              {currentSlide === 3 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1f180d] border-2 sm:border-3 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#ff7028] uppercase tracking-wider block mb-1">
                        Breakthrough 01
                      </span>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase mb-1">AI Became Tiny</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e]">
                        Two years ago, running AI needed a ₹2,00,000 graphics card. Today, small language models can run smoothly on a standard ₹10,000 phone with 4GB of RAM. The technology finally arrived.
                      </p>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1f180d] border-2 sm:border-3 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#ff4a8a] uppercase tracking-wider block mb-1">
                        Breakthrough 02
                      </span>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase mb-1">Big Tech Ignored India</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e]">
                        Apple Intelligence and Google Gemini Nano require ₹80,000+ luxury phones (iPhone 15 Pro, Pixel 9). Only 5% of people in India buy those phones. Big Tech left 600 Million people behind. SNEHA is built for the remaining 95%.
                      </p>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1f180d] border-2 sm:border-3 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#0e4dff] uppercase tracking-wider block mb-1">
                        Breakthrough 03
                      </span>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase mb-1">Strict Privacy Laws</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e]">
                        India just passed the DPDP Act with massive penalties for companies that leak user data. Students, lawyers, doctors, and businesses are actively searching for tools that never upload confidential documents to the cloud.
                      </p>
                    </div>
                  </div>

                  {/* Flagship vs SNEHA Coverage Visualizer (Fully responsive for mobile) */}
                  <div className="p-3 sm:p-4 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e]">
                    <span className="block text-xs font-bold uppercase mb-2 text-[#1f1a0e] dark:text-[#fdfaf2]">
                      Indian Smartphone Market Reality:
                    </span>

                    {/* Progress bar */}
                    <div className="w-full bg-[#1f1a0e]/20 h-6 border-2 border-[#1f1a0e] flex overflow-hidden mb-2.5">
                      <div
                        className="bg-[#ff4a8a] flex items-center justify-center text-[9px] font-black text-white"
                        style={{ width: '6%' }}
                        title="Apple & Google Flagships (5.5%)"
                      >
                        5%
                      </div>
                      <div
                        className="bg-[#10b981] flex items-center justify-center text-[10px] font-black text-white px-2 truncate"
                        style={{ width: '94%' }}
                        title="SNEHA Addressable Market (94.5%)"
                      >
                        SNEHA MASS MARKET (94.5% OF PHONES)
                      </div>
                    </div>

                    {/* 2 Comparison Cards on Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-white dark:bg-[#1f180d] border border-[#ff4a8a] flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-[#ff4a8a] shrink-0" />
                        <span><strong>Apple &amp; Gemini Nano:</strong> Only ₹70,000+ phones (5.5% of market).</span>
                      </div>
                      <div className="p-2 bg-white dark:bg-[#1f180d] border border-[#10b981] flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-[#10b981] shrink-0" />
                        <span><strong>SNEHA Opportunity:</strong> Any ₹8,000+ Android phone (94.5% of market = 600M+ users).</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 05: CODE REALITY, NOT EMPTY SLIDES */}
              {currentSlide === 4 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
                    <div className="p-2.5 sm:p-3 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <b className="font-['Bowlby_One'] text-xl sm:text-2xl text-[#0e4dff] block leading-none mb-1">SDK 26</b>
                      <span className="font-mono text-[10px] font-bold uppercase block">Android 8.0+ Ready</span>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <b className="font-['Bowlby_One'] text-xl sm:text-2xl text-[#ff4a8a] block leading-none mb-1">0 Trackers</b>
                      <span className="font-mono text-[10px] font-bold uppercase block">Verified by Code Audit</span>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <b className="font-['Bowlby_One'] text-xl sm:text-2xl text-[#ff7028] block leading-none mb-1">6.2 MB</b>
                      <span className="font-mono text-[10px] font-bold uppercase block">Ultra-Lean APK Binary</span>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-white dark:bg-[#1f180d] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
                      <b className="font-['Bowlby_One'] text-xl sm:text-2xl text-[#10b981] block leading-none mb-1">58/58</b>
                      <span className="font-mono text-[10px] font-bold uppercase block">Passing Test Suites</span>
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-4 bg-[#eedcb4]/80 dark:bg-[#271f13] border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                        This is an Active Product You Can Test Today
                      </h2>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#2a2515] dark:text-[#cdbe9e] mt-0.5">
                        We didn't just design wireframes in Figma. You can scan our QR code right now, download the APK, verify the SHA-256 code checksum, and inspect live feedback logs.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onNavigateTab('download')}
                        className="px-3 py-1.5 bg-[#ff4a8a] text-[#1f1a0e] font-bold text-xs uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#ff7028] transition-all cursor-pointer text-center"
                      >
                        APK Download Hub →
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateTab('audit')}
                        className="px-3 py-1.5 bg-[#0e4dff] text-white font-bold text-xs uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#1f1a0e] transition-all cursor-pointer text-center"
                      >
                        Code Audit Table →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SLIDE 06: TAM · SAM · SOM MARKET SIZING */}
              {currentSlide === 5 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1f180d] border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#5a4f30] dark:text-[#cdbe9e] uppercase tracking-wider block mb-1">
                        Worldwide Market (TAM)
                      </span>
                      <b className="font-['Bowlby_One'] text-2xl sm:text-3xl text-[#1f1a0e] dark:text-[#fdfaf2] block mb-1">
                        3.5 Billion
                      </b>
                      <span className="text-xs font-bold uppercase text-[#0e4dff] block mb-1.5">Android Phones Globally</span>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#2a2515] dark:text-[#cdbe9e]">
                        A massive $150 Billion global market transitioning away from slow cloud apps toward fast, local phone software.
                      </p>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1f180d] border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#5a4f30] dark:text-[#cdbe9e] uppercase tracking-wider block mb-1">
                        India Market (SAM)
                      </span>
                      <b className="font-['Bowlby_One'] text-2xl sm:text-3xl text-[#ff7028] block mb-1">
                        650 Million
                      </b>
                      <span className="text-xs font-bold uppercase text-[#1f1a0e] dark:text-[#fdfaf2] block mb-1.5">Indian Android Handsets</span>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#2a2515] dark:text-[#cdbe9e]">
                        India is the 2nd largest smartphone market in the world with over ₹26,000 Crores spent annually on mobile software.
                      </p>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-[#10b981]/15 dark:bg-[#10b981]/10 border-2 sm:border-3 border-[#10b981] shadow-[3px_3px_0_#10b981]">
                      <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-wider block mb-1">
                        Our 2-Year Target (SOM)
                      </span>
                      <b className="font-['Bowlby_One'] text-2xl sm:text-3xl text-[#10b981] block mb-1">
                        2 Million
                      </b>
                      <span className="text-xs font-bold uppercase text-[#1f1a0e] dark:text-[#fdfaf2] block mb-1.5">Active Subscribers in India</span>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#2a2515] dark:text-[#cdbe9e]">
                        Getting just 0.3% of Indian users on our ₹799/year pass produces <strong>₹160 Crore ($19.2 Million) in annual recurring revenue</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] text-xs font-mono flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span>How we reach 2 Million users:</span>
                    <span className="font-bold text-[#ff4a8a]">
                      There are 40 Million college students &amp; coders in India. We only need 1 out of 20 to use SNEHA.
                    </span>
                  </div>
                </div>
              )}

              {/* SLIDE 07: 90%+ PURE PROFIT MARGINS (SIMULATOR) */}
              {currentSlide === 6 && (
                <div className="space-y-3 sm:space-y-4">
                  {/* Slider Control Box */}
                  <div className="p-3 sm:p-4 bg-[#eedcb4] dark:bg-[#271f13] border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Sliders size={15} className="text-[#0e4dff]" />
                        <span className="font-['Bowlby_One'] text-xs uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                          Interactive Profit Simulator:
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold">Projected Users:</span>
                        <span className="px-2 py-0.5 bg-[#1f1a0e] text-[#f5ecd4] dark:bg-[#fdfaf2] dark:text-[#1f1a0e] font-mono text-xs font-bold">
                          {simUsers.toLocaleString('en-IN')} Users
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

                    <div className="flex justify-between text-[9px] sm:text-[10px] font-mono mt-1 text-[#5a4f30] dark:text-[#cdbe9e]">
                      <span>10k (Pilot)</span>
                      <span>50k (Year 1 Goal)</span>
                      <span>100k (Growth)</span>
                      <span>200k (Scale)</span>
                    </div>
                  </div>

                  {/* Comparison Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* SNEHA Economics */}
                    <div className="p-3.5 sm:p-4 bg-[#10b981]/15 dark:bg-[#10b981]/10 border-2 sm:border-3 border-[#10b981] shadow-[3px_3px_0_#10b981]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-['Bowlby_One'] text-xs sm:text-sm uppercase text-[#10b981]">
                          SNEHA (Runs on Phone)
                        </span>
                        <span className="px-2 py-0.5 bg-[#10b981] text-white font-['Bowlby_One'] text-[9px] sm:text-[10px] uppercase">
                          {calculatedFinances.snehaGrossMarginPct}% PURE PROFIT
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span>Total Revenue (ARR):</span>
                          <strong className="text-sm sm:text-base text-[#1f1a0e] dark:text-[#fdfaf2]">
                            ₹{(calculatedFinances.annualRunRate / 10000000).toFixed(2)} Crores
                          </strong>
                        </div>
                        <div className="flex justify-between text-[#10b981]">
                          <span>Cloud Server Costs:</span>
                          <strong>₹0 (User phone does the math)</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Gateway (2%):</span>
                          <span>₹{((calculatedFinances.monthlyTotalRevenue * 0.02 * 12) / 100000).toFixed(1)} Lakhs</span>
                        </div>
                        <div className="pt-2 border-t border-[#10b981]/40 flex justify-between font-bold text-sm text-[#10b981]">
                          <span>Annual Gross Profit:</span>
                          <span>₹{((calculatedFinances.snehaGrossProfit * 12) / 10000000).toFixed(2)} Crores</span>
                        </div>
                      </div>
                    </div>

                    {/* Competitor Cloud AI */}
                    <div className="p-3.5 sm:p-4 bg-[#ff4a8a]/15 dark:bg-[#ff4a8a]/10 border-2 sm:border-3 border-[#ff4a8a] shadow-[3px_3px_0_#ff4a8a]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-['Bowlby_One'] text-xs sm:text-sm uppercase text-[#ff4a8a]">
                          Typical Cloud AI Wrapper
                        </span>
                        <span className="px-2 py-0.5 bg-[#ff4a8a] text-white font-['Bowlby_One'] text-[9px] sm:text-[10px] uppercase">
                          {calculatedFinances.cloudAiGrossMarginPct}% MARGIN
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between">
                          <span>Total Revenue (ARR):</span>
                          <span>₹{(calculatedFinances.annualRunRate / 10000000).toFixed(2)} Crores</span>
                        </div>
                        <div className="flex justify-between text-[#ff4a8a]">
                          <span>Cloud GPU Server Bills:</span>
                          <strong>
                            -₹{((calculatedFinances.cloudAiComputeCostPerMonth * 12) / 10000000).toFixed(2)} Crores
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Gateway:</span>
                          <span>₹{((calculatedFinances.monthlyTotalRevenue * 0.02 * 12) / 100000).toFixed(1)} Lakhs</span>
                        </div>
                        <div className="pt-2 border-t border-[#ff4a8a]/40 flex justify-between font-bold text-sm text-[#ff4a8a]">
                          <span>Annual Gross Profit:</span>
                          <span>₹{((calculatedFinances.cloudAiGrossProfit * 12) / 10000000).toFixed(2)} Crores</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-[#1f180d] border border-[#1f1a0e] text-center text-xs font-mono">
                    <strong className="text-[#0e4dff]">The Secret:</strong> SNEHA saves ₹
                    {(calculatedFinances.annualSavingsVsCloud / 10000000).toFixed(2)} Crores every year in cloud server bills because the computation happens locally!
                  </div>
                </div>
              )}

              {/* SLIDE 08: COMPETITOR MATRIX (WHY WE WIN) */}
              {currentSlide === 7 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] bg-white dark:bg-[#1f180d]">
                    {/* Mobile swipe hint */}
                    <div className="sm:hidden px-3 py-1 bg-[#eedcb4] text-[10px] font-mono text-[#5a4f30] border-b border-[#1f1a0e] flex items-center justify-between">
                      <span>Comparison Table</span>
                      <span>Swipe sideways to view →</span>
                    </div>

                    <div className="overflow-x-auto max-w-full">
                      <table className="w-full text-left border-collapse text-xs min-w-[620px]">
                        <thead>
                          <tr className="bg-[#1f1a0e] text-[#f5ecd4] font-['Bowlby_One'] text-[10px] uppercase tracking-wider">
                            <th className="p-2 sm:p-2.5 border-r border-[#3a3320]">What Matters to Users</th>
                            <th className="p-2 sm:p-2.5 border-r border-[#3a3320] bg-[#ff4a8a] text-[#1f1a0e]">SNEHA</th>
                            <th className="p-2 sm:p-2.5 border-r border-[#3a3320]">ChatGPT Plus</th>
                            <th className="p-2 sm:p-2.5 border-r border-[#3a3320]">Google Gemini</th>
                            <th className="p-2 sm:p-2.5">Apple Intelligence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1f1a0e]/20 font-sans">
                          <tr className="hover:bg-[#eedcb4]/30">
                            <td className="p-2 sm:p-2.5 font-bold border-r border-[#1f1a0e]/20">Server Cost per Question</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 font-bold text-[#10b981] bg-[#10b981]/10">₹0 (Zero)</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">Burns ~$0.02 every prompt</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">Expensive cloud GPU</td>
                            <td className="p-2 sm:p-2.5 text-[#ff7028]">Hybrid Cloud Server</td>
                          </tr>
                          <tr className="hover:bg-[#eedcb4]/30">
                            <td className="p-2 sm:p-2.5 font-bold border-r border-[#1f1a0e]/20">Works Without Internet</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 font-bold text-[#10b981] bg-[#10b981]/10">YES (100% Offline)</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">NO (Completely Dead)</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">NO (Requires Cloud)</td>
                            <td className="p-2 sm:p-2.5 text-[#ff7028]">Partial only</td>
                          </tr>
                          <tr className="hover:bg-[#eedcb4]/30">
                            <td className="p-2 sm:p-2.5 font-bold border-r border-[#1f1a0e]/20">Guaranteed Privacy</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 font-bold text-[#10b981] bg-[#10b981]/10">100% Locked on Phone</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">Chats stored on servers</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">Used to sell ads</td>
                            <td className="p-2 sm:p-2.5 text-[#ff7028]">Cloud server backups</td>
                          </tr>
                          <tr className="hover:bg-[#eedcb4]/30">
                            <td className="p-2 sm:p-2.5 font-bold border-r border-[#1f1a0e]/20">Hardware Needed</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 font-bold text-[#10b981] bg-[#10b981]/10">Any Android 8.0+ (₹8,000+)</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20">Needs fast 5G data</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">₹70k+ Flagships only</td>
                            <td className="p-2 sm:p-2.5 text-[#ff4a8a]">₹80k+ iPhone 15 Pro+</td>
                          </tr>
                          <tr className="hover:bg-[#eedcb4]/30">
                            <td className="p-2 sm:p-2.5 font-bold border-r border-[#1f1a0e]/20">Price in India</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 font-bold text-[#0e4dff] bg-[#0e4dff]/10">₹66 to ₹143 / month</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">₹1,999 / month</td>
                            <td className="p-2 sm:p-2.5 border-r border-[#1f1a0e]/20 text-[#ff4a8a]">₹1,950 / month</td>
                            <td className="p-2 sm:p-2.5 text-[#ff4a8a]">₹1,30,000 device cost</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] text-xs font-mono flex items-center justify-between">
                    <span>Our Unfair Advantage:</span>
                    <strong className="text-[#0e4dff]">
                      We are 10 times cheaper than ChatGPT while making 4 times higher profit margins.
                    </strong>
                  </div>
                </div>
              )}

              {/* SLIDE 09: GO-TO-MARKET (HOW WE SCALE) */}
              {currentSlide === 8 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1f180d] border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#ff4a8a] uppercase tracking-wider block mb-1">
                        Step 01 // Campus Virality
                      </span>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase mb-1">Colleges &amp; Coders</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e] mb-2">
                        Now through Dec 1, 2026. Free pilot launch targeting engineering colleges and student tech clubs.
                      </p>
                      <div className="p-2 bg-[#eedcb4] dark:bg-[#271f13] border border-[#1f1a0e] text-[10px] font-mono space-y-1">
                        <div>• Top 100 bug reporters get a lifetime free pass.</div>
                        <div>• QR code posters in campus libraries and labs.</div>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1f180d] border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#0e4dff] uppercase tracking-wider block mb-1">
                        Step 02 // Direct Distribution
                      </span>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase mb-1">0% Google Play Cut</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e] mb-2">
                        Direct download via WhatsApp and QR codes saves the mandatory 30% Google Play tax.
                      </p>
                      <div className="p-2 bg-[#eedcb4] dark:bg-[#271f13] border border-[#1f1a0e] text-[10px] font-mono space-y-1">
                        <div>• 1-Click UPI payments (GPay, PhonePe, Paytm).</div>
                        <div>• Savings passed directly to Indian students.</div>
                      </div>
                    </div>

                    <div className="p-3.5 sm:p-4 bg-white dark:bg-[#1f180d] border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-wider block mb-1">
                        Step 03 // Handset Partnerships
                      </span>
                      <h2 className="font-['Bowlby_One'] text-sm sm:text-base uppercase mb-1">Pre-Installed on Phones</h2>
                      <p className="font-['Crimson_Pro'] italic text-xs leading-relaxed text-[#2a2515] dark:text-[#cdbe9e] mb-2">
                        Partnerships with regional phone brands (Lava, Micromax) and refurbished phone sellers.
                      </p>
                      <div className="p-2 bg-[#eedcb4] dark:bg-[#271f13] border border-[#1f1a0e] text-[10px] font-mono space-y-1">
                        <div>• Pre-loaded on new phones out of the box.</div>
                        <div>• Revenue share with device makers.</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] text-xs font-mono flex items-center justify-between">
                    <span>Our Acquisition Advantage:</span>
                    <strong className="text-[#10b981]">
                      Customer acquisition cost under ₹45 via peer-to-peer student recommendations.
                    </strong>
                  </div>
                </div>
              )}

              {/* SLIDE 10: THE ASK & 12-MONTH TARGETS */}
              {currentSlide === 9 && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* The Ask */}
                    <div className="p-4 sm:p-5 bg-white dark:bg-[#1f180d] border-2 sm:border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                      <span className="text-xs font-mono font-bold text-[#ff4a8a] uppercase tracking-wider block mb-1">
                        Seed Capital / Prize Grant Ask
                      </span>
                      <h2 className="font-['Bowlby_One'] text-2xl sm:text-3xl uppercase text-[#1f1a0e] dark:text-[#fdfaf2] mb-2 sm:mb-3">
                        ₹25 Lakhs
                      </h2>
                      <span className="font-mono text-xs font-bold text-[#5a4f30] dark:text-[#cdbe9e] block mb-2">
                        Exactly where every rupee goes:
                      </span>
                      <ul className="text-xs space-y-2 font-mono">
                        <li className="flex items-center justify-between p-2 bg-[#eedcb4]/50 dark:bg-[#271f13] border border-[#1f1a0e]">
                          <span>50% Model Compression &amp; Tuning:</span>
                          <strong>₹12.5 Lakhs</strong>
                        </li>
                        <li className="flex items-center justify-between p-2 bg-[#eedcb4]/50 dark:bg-[#271f13] border border-[#1f1a0e]">
                          <span>30% Campus Growth &amp; College Bounties:</span>
                          <strong>₹7.5 Lakhs</strong>
                        </li>
                        <li className="flex items-center justify-between p-2 bg-[#eedcb4]/50 dark:bg-[#271f13] border border-[#1f1a0e]">
                          <span>20% Device Testing Lab (20 test phones):</span>
                          <strong>₹5.0 Lakhs</strong>
                        </li>
                      </ul>
                    </div>

                    {/* Milestones */}
                    <div className="p-4 sm:p-5 bg-[#10b981]/15 dark:bg-[#10b981]/10 border-2 sm:border-3 border-[#10b981] shadow-[3px_3px_0_#10b981]">
                      <span className="text-xs font-mono font-bold text-[#10b981] uppercase tracking-wider block mb-1">
                        12-Month Roadmap
                      </span>
                      <h2 className="font-['Bowlby_One'] text-xl sm:text-2xl uppercase text-[#1f1a0e] dark:text-[#fdfaf2] mb-2 sm:mb-3">
                        Clear Growth Milestones
                      </h2>
                      <div className="space-y-2 text-xs font-mono">
                        <div className="p-2 bg-white dark:bg-[#1f180d] border border-[#10b981]">
                          <strong className="text-[#0e4dff]">Month 03:</strong> 15,000 active pilot testers and full bug bounty completion.
                        </div>
                        <div className="p-2 bg-white dark:bg-[#1f180d] border border-[#10b981]">
                          <strong className="text-[#ff7028]">Month 06:</strong> Commercial rollout, reaching ₹50 Lakhs annual run-rate.
                        </div>
                        <div className="p-2 bg-white dark:bg-[#1f180d] border border-[#10b981]">
                          <strong className="text-[#10b981]">Month 12:</strong> 50,000 paid subscribers (₹3.5 Crore ARR) at 90%+ gross profit margin.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] text-center">
                    <span className="font-['Bowlby_One'] text-xs sm:text-sm uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                      SNEHA: True Personal AI · 100% Private · Built for Everyone
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Slide Navigation Footer Bar (Responsive touch targets) */}
            <div className="pt-3 sm:pt-4 border-t-2 sm:border-t-3 border-[#1f1a0e] dark:border-[#eedcb4]/20 flex items-center justify-between gap-2 mt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentSlide === 0}
                  onClick={prevSlide}
                  aria-label="Previous Slide"
                  className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] font-bold text-xs uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#ff7028] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  disabled={currentSlide === SLIDES.length - 1}
                  onClick={nextSlide}
                  aria-label="Next Slide"
                  className="px-3.5 py-1.5 sm:px-4 sm:py-1.5 bg-[#ff4a8a] text-[#1f1a0e] font-bold text-xs uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#ff7028] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="hidden md:flex items-center gap-1 font-mono text-[11px] text-[#5a4f30] dark:text-[#cdbe9e]">
                <span>Navigate with</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#271f13] border border-[#1f1a0e] font-bold text-[10px]">←</kbd>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#271f13] border border-[#1f1a0e] font-bold text-[10px]">→</kbd>
                <span>or</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#271f13] border border-[#1f1a0e] font-bold text-[10px]">Space</kbd>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-bold text-[#1f1a0e] dark:text-[#fdfaf2]">
                  {currentSlide + 1} / {SLIDES.length}
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
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Memo Executive Masthead */}
          <div className="p-4 sm:p-8 bg-white dark:bg-[#1a140b] border-3 sm:border-4 border-[#1f1a0e] dark:border-[#eedcb4]/40 shadow-[6px_6px_0_#1f1a0e] sm:shadow-[8px_8px_0_#1f1a0e]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1f1a0e]/20 pb-3 mb-3 text-xs font-mono">
              <span className="font-bold uppercase text-[#0e4dff]">INVESTMENT MEMORANDUM // CONFIDENTIAL</span>
              <span>DATE: OCTOBER 2026</span>
            </div>
            <h1 className="font-['Bowlby_One'] text-2xl sm:text-4xl md:text-5xl uppercase tracking-tight text-[#1f1a0e] dark:text-[#fdfaf2] mb-3 break-words">
              SNEHA: The On-Device AI Investment Memo
            </h1>
            <p className="font-['Crimson_Pro'] italic text-sm sm:text-base md:text-lg text-[#2a2515] dark:text-[#cdbe9e] leading-relaxed">
              Complete business breakdown, unit economics calculations, and market advantage for SNEHA — the 100% on-device AI companion operating with zero cloud server bills.
            </p>
          </div>

          {/* Sequential 10-Module Executive Dossier */}
          {SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className="p-4 sm:p-6 bg-[#f5ecd4] dark:bg-[#1a140b] border-2 sm:border-3 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[4px_4px_0_#1f1a0e] sm:shadow-[6px_6px_0_#1f1a0e]"
            >
              <div className="flex items-center justify-between border-b-2 border-[#1f1a0e]/20 pb-2 mb-2 sm:mb-3">
                <span className="font-['Bowlby_One'] text-xs sm:text-sm uppercase text-[#ff4a8a]">
                  SECTION {slide.number} // {slide.badge}
                </span>
                <span className="font-mono text-xs font-bold text-[#5a4f30]">REF #{slide.number}</span>
              </div>
              <h2 className="font-['Bowlby_One'] text-lg sm:text-2xl uppercase mb-1.5 text-[#1f1a0e] dark:text-[#fdfaf2] break-words">
                {slide.title}
              </h2>
              <p className="font-['Crimson_Pro'] italic text-xs sm:text-sm text-[#2a2515] dark:text-[#cdbe9e] mb-3 leading-relaxed">
                {slide.subtitle}
              </p>

              {/* Memo Section Detailed Summaries in Plain English */}
              {idx === 0 && (
                <div className="space-y-2 text-xs font-sans leading-relaxed text-[#2a2515] dark:text-[#e8deca]">
                  <p>
                    Most consumer AI companies are trapped in a deadly financial model: every time a user chats with their bot, the company pays cloud fees to OpenAI or Microsoft. If their app goes viral, their server bills blow up and they go bankrupt. SNEHA solves this completely by moving all the computation onto the phone the user already owns.
                  </p>
                </div>
              )}

              {idx === 1 && (
                <div className="space-y-2 text-xs font-sans leading-relaxed text-[#2a2515] dark:text-[#e8deca]">
                  <p>
                    Cloud AI has three fatal problems today: 1) Massive server electricity bills, 2) Snooping on private user messages to sell targeted advertisements, and 3) Failing completely whenever a user is in a metro tunnel, flight, or village with no internet. SNEHA runs locally as an independent Android app with zero cloud dependency.
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
                  <strong>The Defensive Moat:</strong> Because our server costs are zero, SNEHA can charge 10 times less than ChatGPT Plus (₹799/year vs ₹24,000/year) while maintaining 90%+ pure profit margins that cloud wrappers cannot copy.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* -------------------------------------------------------------
          BOTTOM DRAWER: JUDGE Q&A DEFENSE (SPEAKER CHEAT SHEET)
          Written in simple, powerful English
          ------------------------------------------------------------- */}
      <section aria-label="Judge Q&A Defense" className="max-w-6xl mx-auto px-2.5 sm:px-6 md:px-8 mt-6 sm:mt-10">
        <div className="p-4 sm:p-6 bg-[#eedcb4] dark:bg-[#1f180d] border-3 sm:border-4 border-[#1f1a0e] dark:border-[#eedcb4]/40 shadow-[6px_6px_0_#1f1a0e] sm:shadow-[8px_8px_0_#1f1a0e]">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-[#ff4a8a] shrink-0" />
              <h2 className="font-['Bowlby_One'] text-sm sm:text-lg uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                Judge Q&amp;A Defense · Clear Answers for Tough Questions
              </h2>
            </div>
            <span className="font-mono text-[10px] sm:text-xs font-bold text-[#5a4f30] dark:text-[#cdbe9e]">
              Cheat Sheet for Panel Questions
            </span>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {[
              {
                q: 'Q1. Can a cheap ₹10,000 phone really run an AI without heating up or draining the battery?',
                a: 'Yes, because SNEHA does not run a giant cloud model constantly in the background. We use tiny, compressed models paired with a smart intent router. When you ask SNEHA to take notes, set an alarm, or draft a text, it calculates the answer in less than 100 milliseconds and instantly puts the processor back to sleep. It consumes less battery than watching a 30-second YouTube reel.'
              },
              {
                q: 'Q2. What stops Google or Apple from bringing this to cheaper phones and crushing you?',
                a: 'Their business model stops them. Google makes over $200 Billion a year from cloud search ads. To sell targeted ads, Google needs your search queries and voice notes sent to their cloud servers. SNEHA is built to be 100% offline with zero cloud tracking. Google cannot copy our zero-cloud model without hurting their own advertising business.'
              },
              {
                q: 'Q3. Why are you distributing as an APK download instead of putting it on the Google Play Store?',
                a: 'Two reasons: 1) The 30% Google Tax: Google forces apps to give them 30% of every subscription. By distributing directly, we keep our costs ultra-low and pass those savings to students at ₹143/month and ₹799/year. 2) Speed of Updates: We can ship instant fixes to users without waiting days for app store approvals. Once we have strong brand loyalty, we will launch on the Play Store too.'
              },
              {
                q: 'Q4. What stops someone from copying your APK file and sharing it for free without paying?',
                a: 'Every time SNEHA is installed, it creates a unique digital fingerprint bound to that specific phone’s hardware chip (using Android Keystore). When a user buys a pass, our system issues a cryptographically signed license file that only works on their specific phone. If someone copies the APK file to a different phone, it refuses to unlock without a new license.'
              }
            ].map((item, qIdx) => {
              const isExpanded = expandedFaqIndex === qIdx;
              return (
                <div
                  key={qIdx}
                  className="bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqIndex(isExpanded ? null : qIdx)}
                    className="w-full p-2.5 sm:p-3 text-left font-['Bowlby_One'] text-xs sm:text-sm uppercase flex items-center justify-between gap-2 sm:gap-3 cursor-pointer hover:bg-[#eedcb4]/40"
                  >
                    <span className="leading-snug">{item.q}</span>
                    {isExpanded ? <ChevronUp size={16} className="shrink-0" /> : <ChevronDown size={16} className="shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="px-2.5 pb-2.5 pt-1 sm:px-3 sm:pb-3 border-t border-[#1f1a0e]/15 font-['Crimson_Pro'] italic text-xs sm:text-sm text-[#2a2515] dark:text-[#cdbe9e] leading-relaxed">
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
