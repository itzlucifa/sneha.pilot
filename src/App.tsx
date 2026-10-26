/**
 * @license
 * Proprietary — SNEHA Commercial Pilot Distribution Platform
 * All Rights Reserved
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Pause,
  Menu,
  X,
  Download,
  HelpCircle,
  Cpu,
  ScrollText,
  Copy,
  Moon,
  Sun,
  Check,
  ChevronDown,
  ChevronUp,
  Upload,
  Lock,
  Unlock,
  RefreshCw,
  Database,
  DownloadCloud,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import {
  supabaseInsert,
  supabaseSelect,
  submitSignupUnified,
  submitFeedbackUnified,
  isSupabaseConfigured,
  fetchLiveAdminData,
  subscribeToSupabaseRealtime,
  SUPABASE_URL
} from './supabase';
import {
  QRCodeModal,
  ChecksumValidator,
  SideloadWizard,
  DeviceInspector,
  AdminAnalytics,
  FeedbackStatusBadge,
} from './components';

// Reusable Copyable Badge with instant feedback
export function CopyableBadge({
  text,
  label,
  className = ''
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={"Click to copy: " + text}
      className={"inline-flex items-center gap-1 cursor-pointer transition-all hover:opacity-85 active:scale-95 " + className}
    >
      <span>{label || text}</span>
      {copied ? (
        <span className="inline-flex items-center text-[10px] bg-[#0e4dff] text-white px-1.5 py-0.5 border border-[#1f1a0e] font-sans font-bold shadow-[1px_1px_0_#1f1a0e]">
          <Check size={11} className="mr-0.5" /> Copied!
        </span>
      ) : (
        <Copy size={12} className="opacity-70 hover:opacity-100" />
      )}
    </button>
  );
}

// Error Boundary - prevents one tab crash from blanking the whole dashboard
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onReset?: () => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onReset?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-12 text-center" role="alert">
          <div className="p-6 sm:p-8 bg-[#f5ecd4] border-3 border-[#ff4a8a] shadow-[8px_8px_0_#1f1a0e]">
            <h1 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight text-[#ff4a8a] mb-4">
              SOMETHING WENT WRONG
            </h1>
            <p className="font-['Crimson_Pro'] italic text-base text-[#1f1a0e] mb-6">
              This dashboard section encountered an issue. You can try recovering or switch to another tab.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={this.reset}
                className="px-5 py-2 bg-[#ff4a8a] text-[#1f1a0e] font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4] transition-all"
              >
                Try Again ↻
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 bg-[#1f1a0e] text-[#f5ecd4] font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[4px_4px_0_#0e4dff] hover:bg-[#0e4dff] hover:text-white transition-all"
              >
                Reload Page →
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'pilot-site' | 'in-app-feedback' | 'privacy' | 'audit' | 'faq' | 'download' | 'compatibility' | 'changelog' | 'admin'>('pilot-site');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile' | 'compact'>('desktop');
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sneha_theme') === 'dark';
    } catch {
      return false;
    }
  });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Custom APK file upload state
  const [customApkInfo, setCustomApkInfo] = useState<{ name: string; size: string; url: string } | null>(null);

  // Refs for outside click and modal focus trap
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const modalCloseBtnRef = useRef<HTMLButtonElement | null>(null);

  // Song audio state for hero spinning sticker
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Screenshots View Mode & Lightbox
  const [screenshotView, setScreenshotView] = useState<'duo' | 'screen-1' | 'screen-2'>('duo');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; subtitle: string; caption: string } | null>(null);

  // QR Code Modal for Mobile Phone Sideloading
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Admin Portal State (Section 4)
  const [adminPin, setAdminPin] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sneha_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [adminSignups, setAdminSignups] = useState<any[]>([]);
  const [adminFeedback, setAdminFeedback] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<'signups' | 'feedback' | 'offline' | 'analytics'>('signups');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminFeedbackRatingFilter, setAdminFeedbackRatingFilter] = useState<number | 'all'>('all');
  const [adminOfflineQueue, setAdminOfflineQueue] = useState<{ signups: any[]; feedback: any[] }>({ signups: [], feedback: [] });
  const [adminSyncNotice, setAdminSyncNotice] = useState('');
  const [adminRealtimeActive, setAdminRealtimeActive] = useState(true);
  const [adminLastSyncedAt, setAdminLastSyncedAt] = useState<Date | null>(null);
  const [adminDataSource, setAdminDataSource] = useState<'supabase' | 'offline'>('supabase');
  const [adminWsStatus, setAdminWsStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [adminFailedAttempts, setAdminFailedAttempts] = useState(0);
  const [adminLockoutSeconds, setAdminLockoutSeconds] = useState(0);

  // Scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    const timer = setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    }, 100);

    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [activeTab]);

  // Close menu on route change, scroll to top, and stop audio if leaving pilot-site
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (activeTab !== 'pilot-site' && isPlayingSong) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingSong(false);
    }
  }, [activeTab]);

  // Dark mode class on document and local storage persistence
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try { localStorage.setItem('sneha_theme', 'dark'); } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try { localStorage.setItem('sneha_theme', 'light'); } catch {}
    }
  }, [darkMode]);

  // Close hamburger on outside click (proper ref checking)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!menuOpen) return;
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Keyboard navigation: Escape key + Tab trapping in modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImage) setLightboxImage(null);
        if (menuOpen) setMenuOpen(false);
      }

      // Tab trapping inside modal
      if (e.key === 'Tab' && lightboxImage && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage, menuOpen]);

  // Lock body scroll and focus modal close button when lightbox opens
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
      if (modalCloseBtnRef.current) {
        modalCloseBtnRef.current.focus();
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxImage]);

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

  // Helper to save offline queue in localStorage
  const queueOfflineSubmission = (queueName: string, data: Record<string, any>) => {
    try {
      const existing = JSON.parse(localStorage.getItem(queueName) || '[]');
      existing.push({ ...data, queued_at: new Date().toISOString() });
      localStorage.setItem(queueName, JSON.stringify(existing));
    } catch (err) {
      console.warn('Offline storage failed:', err);
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
  const [signupOfflineNotice, setSignupOfflineNotice] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // In-App Feedback state (Step 5 App-Side Support)
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [whatWorked, setWhatWorked] = useState('');
  const [whatBroke, setWhatBroke] = useState('');
  const [whatToAdd, setWhatToAdd] = useState('');
  const [testerEmail, setTesterEmail] = useState('');
  const [testerDevice, setTesterDevice] = useState('Pixel 7 / Android 14');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackOfflineNotice, setFeedbackOfflineNotice] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Form validation helpers
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim());
  };

  const validateSignupForm = () => {
    if (!signupForm.name.trim() || signupForm.name.trim().length < 2) {
      return 'Please enter your full name (at least 2 characters).';
    }
    if (!signupForm.email.trim()) {
      return 'Please enter your email address.';
    }
    if (!validateEmail(signupForm.email)) {
      return 'Please enter a valid email address (e.g. name@example.com).';
    }
    if (!signupForm.deviceModel.trim() || signupForm.deviceModel.trim().length < 2) {
      return 'Please enter your device model (e.g. Pixel 7, Galaxy S21).';
    }
    return null;
  };

  const validateFeedbackForm = () => {
    if (feedbackRating < 1 || feedbackRating > 5) {
      return 'Please select an overall rating from 1 to 5 stars.';
    }
    if (!whatWorked.trim() || whatWorked.trim().length < 5) {
      return 'Please describe what worked well (at least 5 characters).';
    }
    if (!whatBroke.trim() || whatBroke.trim().length < 5) {
      return 'Please describe what broke or failed (at least 5 characters).';
    }
    if (!whatToAdd.trim() || whatToAdd.trim().length < 3) {
      return 'Please describe what features to add (at least 3 characters).';
    }
    if (testerEmail.trim() && !validateEmail(testerEmail)) {
      return 'Please enter a valid email address if providing one.';
    }
    return null;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateSignupForm();
    if (validationError) {
      setSignupError(validationError);
      return;
    }

    setSignupError('');

    // Fallback when Supabase isn't configured
    if (!isSupabaseConfigured()) {
      queueOfflineSubmission('sneha_pending_signups', signupForm);
      setSignupOfflineNotice(true);
      setSignupSuccess(true);
      try {
        window.location.href = "mailto:sumitnawale123456@gmail.com?subject=" + encodeURIComponent("SNEHA Pilot Signup (" + signupForm.name + ")") + "&body=" + encodeURIComponent("Name: " + signupForm.name + "\nEmail: " + signupForm.email + "\nAndroid: " + signupForm.androidVersion + "\nDevice: " + signupForm.deviceModel);
      } catch {}
      return;
    }

    setSignupLoading(true);
    try {
      await submitSignupUnified(signupForm);
      setSignupSuccess(true);
      setSignupOfflineNotice(false);
      setSignupForm({ name: '', email: '', androidVersion: 'Android 15 (Target SDK 35)', deviceModel: '' });
    } catch (err: any) {
      queueOfflineSubmission('sneha_pending_signups', signupForm);
      setSignupOfflineNotice(true);
      setSignupSuccess(true);
      try {
        window.location.href = "mailto:sumitnawale123456@gmail.com?subject=" + encodeURIComponent("SNEHA Pilot Signup (" + signupForm.name + ")") + "&body=" + encodeURIComponent("Name: " + signupForm.name + "\nEmail: " + signupForm.email + "\nAndroid: " + signupForm.androidVersion + "\nDevice: " + signupForm.deviceModel);
      } catch {}
    } finally {
      setSignupLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateFeedbackForm();
    if (validationError) {
      setFeedbackError(validationError);
      return;
    }

    setFeedbackError('');

    // Fallback when Supabase isn't configured
    if (!isSupabaseConfigured()) {
      const feedbackPayload = {
        rating: feedbackRating,
        what_worked: whatWorked,
        what_broke: whatBroke,
        what_to_add: whatToAdd,
        tester_email: testerEmail || 'Anonymous',
        tester_device: testerDevice || 'Unspecified',
      };
      queueOfflineSubmission('sneha_pending_feedback', feedbackPayload);
      setFeedbackOfflineNotice(true);
      setFeedbackSubmitted(true);
      window.location.href = "mailto:sumitnawale123456@gmail.com?subject=" + encodeURIComponent("SNEHA Pilot Feedback (" + feedbackRating + " Stars)") + "&body=" + encodeURIComponent("Rating: " + feedbackRating + "/5\nWhat Worked: " + whatWorked + "\nWhat Broke: " + whatBroke + "\nWhat to Add: " + whatToAdd + "\nEmail: " + testerEmail + "\nDevice: " + testerDevice);
      return;
    }

    setFeedbackLoading(true);
    try {
      await submitFeedbackUnified({
        rating: feedbackRating,
        whatWorked,
        whatBroke,
        whatToAdd,
        testerEmail,
        testerDevice,
      });
      setFeedbackSubmitted(true);
      setFeedbackOfflineNotice(false);
      setWhatWorked('');
      setWhatBroke('');
      setWhatToAdd('');
    } catch (err: any) {
      const feedbackPayload = {
        rating: feedbackRating,
        what_worked: whatWorked,
        what_broke: whatBroke,
        what_to_add: whatToAdd,
        tester_email: testerEmail || 'Anonymous',
        tester_device: testerDevice || 'Unspecified',
      };
      queueOfflineSubmission('sneha_pending_feedback', feedbackPayload);
      setFeedbackOfflineNotice(true);
      setFeedbackSubmitted(true);
      try {
        window.location.href = "mailto:sumitnawale123456@gmail.com?subject=" + encodeURIComponent("SNEHA Pilot Feedback (" + feedbackRating + " Stars)") + "&body=" + encodeURIComponent("Rating: " + feedbackRating + "/5\nWhat Worked: " + whatWorked + "\nWhat Broke: " + whatBroke + "\nWhat to Add: " + whatToAdd + "\nEmail: " + testerEmail + "\nDevice: " + testerDevice);
      } catch {}
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleCustomApkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security check: Extension whitelist (.apk only)
    if (!file.name.toLowerCase().endsWith('.apk')) {
      alert('Security validation: Only valid Android application packages (.apk) are accepted.');
      e.target.value = '';
      return;
    }

    // Security check: Max file size (250MB limit)
    if (file.size > 250 * 1024 * 1024) {
      alert('Security validation: File size exceeds the maximum allowed limit of 250 MB.');
      e.target.value = '';
      return;
    }

    if (customApkInfo?.url) {
      URL.revokeObjectURL(customApkInfo.url);
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const url = URL.createObjectURL(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    setCustomApkInfo({
      name: safeName,
      size: sizeMb,
      url,
    });
  };

  const navigateToSection = (sectionId: string) => {
    setActiveTab('pilot-site');
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  const handleAutoFillSignup = useCallback((info: { deviceModel: string; androidVersion: string }) => {
    setSignupForm((prev) => ({
      ...prev,
      deviceModel: info.deviceModel || prev.deviceModel,
      androidVersion: info.androidVersion || prev.androidVersion,
    }));
    setActiveTab('pilot-site');
    setTimeout(() => {
      const el = document.getElementById('signup');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 80);
  }, []);

  // Reliability: Auto-resync queued offline items when device reconnects online
  useEffect(() => {
    const handleOnline = () => {
      if (adminOfflineQueue.signups.length > 0 || adminOfflineQueue.feedback.length > 0) {
        syncOfflineQueue();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [adminOfflineQueue]);

  // -------------------------------------------------------------
  // Admin Portal Logic (Section 4) - Direct Supabase Real-time
  // -------------------------------------------------------------
  const fetchAdminData = useCallback(async (isBackground: boolean = false) => {
    if (!isBackground) {
      setAdminLoading(true);
      setAdminAuthError('');
    }

    try {
      // 1. Load pending local offline queues
      let offlineSignups: any[] = [];
      let offlineFeedback: any[] = [];
      try {
        offlineSignups = JSON.parse(localStorage.getItem('sneha_pending_signups') || '[]');
        offlineFeedback = JSON.parse(localStorage.getItem('sneha_pending_feedback') || '[]');
      } catch {}
      setAdminOfflineQueue({ signups: offlineSignups, feedback: offlineFeedback });

      // 2. Direct Supabase Query (Live Data)
      const { signups, feedback, source } = await fetchLiveAdminData();
      setAdminSignups(Array.isArray(signups) ? signups : []);
      setAdminFeedback(Array.isArray(feedback) ? feedback : []);
      setAdminDataSource(source === 'supabase' ? 'supabase' : 'offline');
      setAdminLastSyncedAt(new Date());
    } catch (err: any) {
      // Fallback gracefully to offline queue
      let offlineSignups: any[] = [];
      let offlineFeedback: any[] = [];
      try {
        offlineSignups = JSON.parse(localStorage.getItem('sneha_pending_signups') || '[]');
        offlineFeedback = JSON.parse(localStorage.getItem('sneha_pending_feedback') || '[]');
      } catch {}
      setAdminSignups(offlineSignups);
      setAdminFeedback(offlineFeedback);
      setAdminDataSource('offline');
      if (!isBackground) {
        setAdminAuthError(err.message || 'Unable to connect to live Supabase.');
      }
    } finally {
      if (!isBackground) {
        setAdminLoading(false);
      }
    }
  }, []);

  // Real-time live synchronization engine
  useEffect(() => {
    if (activeTab !== 'admin' || !isAdminAuthenticated) return;

    // 1. Immediate live fetch
    fetchAdminData(false);

    // 2. Direct Supabase WebSocket Real-Time Subscription
    let unsubscribeWs = () => {};
    if (adminRealtimeActive) {
      unsubscribeWs = subscribeToSupabaseRealtime(
        ['pilot_signups', 'pilot_feedback'],
        () => {
          fetchAdminData(true);
        },
        (status) => {
          setAdminWsStatus(status === 'connected' ? 'connected' : 'disconnected');
        }
      );
    }

    // 3. Real-time background sync interval (every 5 seconds)
    let pollTimer: any = null;
    if (adminRealtimeActive) {
      pollTimer = setInterval(() => {
        fetchAdminData(true);
      }, 5000);
    }

    // 4. Tab Focus & Visibility sync
    const handleSyncOnVisible = () => {
      if (document.visibilityState === 'visible') {
        fetchAdminData(true);
      }
    };
    window.addEventListener('focus', handleSyncOnVisible);
    document.addEventListener('visibilitychange', handleSyncOnVisible);

    // 5. Custom event when tester signs up or submits feedback in this browser
    const handleLocalDataChange = () => {
      fetchAdminData(true);
    };
    window.addEventListener('sneha:data-updated', handleLocalDataChange);

    return () => {
      unsubscribeWs();
      if (pollTimer) clearInterval(pollTimer);
      window.removeEventListener('focus', handleSyncOnVisible);
      document.removeEventListener('visibilitychange', handleSyncOnVisible);
      window.removeEventListener('sneha:data-updated', handleLocalDataChange);
    };
  }, [activeTab, isAdminAuthenticated, adminRealtimeActive, fetchAdminData]);

  // Security Hardening: Anti-brute-force lockout countdown timer
  useEffect(() => {
    if (adminLockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setAdminLockoutSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [adminLockoutSeconds]);

  // Security Hardening: Auto session timeout after 15 minutes of inactivity
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    let timer: any = null;

    const resetInactivity = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleAdminLogout();
      }, 15 * 60 * 1000);
    };

    resetInactivity();
    const userEvents = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
    userEvents.forEach((evt) => window.addEventListener(evt, resetInactivity, { passive: true }));

    return () => {
      clearTimeout(timer);
      userEvents.forEach((evt) => window.removeEventListener(evt, resetInactivity));
    };
  }, [isAdminAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLockoutSeconds > 0) {
      setAdminAuthError(`Security Lockout active: Please wait ${adminLockoutSeconds}s before retrying.`);
      return;
    }
    if (!adminPin.trim()) {
      setAdminAuthError('Please enter maintainer PIN.');
      return;
    }
    // Maintainer PIN: Sneha@143
    if (adminPin.trim() === 'Sneha@143') {
      try {
        sessionStorage.setItem('sneha_admin_auth', 'true');
        sessionStorage.setItem('sneha_admin_token', adminPin.trim());
      } catch {}
      setAdminFailedAttempts(0);
      setAdminLockoutSeconds(0);
      setIsAdminAuthenticated(true);
      fetchAdminData(false);
    } else {
      const nextCount = adminFailedAttempts + 1;
      setAdminFailedAttempts(nextCount);
      if (nextCount >= 5) {
        setAdminLockoutSeconds(60);
        setAdminAuthError('Security Alert: 5 incorrect PIN attempts. Admin portal locked for 60 seconds.');
      } else {
        setAdminAuthError(`Incorrect PIN. ${5 - nextCount} attempt(s) remaining before security lockout.`);
      }
    }
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('sneha_admin_auth');
      sessionStorage.removeItem('sneha_admin_token');
    } catch {}
    setIsAdminAuthenticated(false);
    setAdminPin('');
    setAdminSignups([]);
    setAdminFeedback([]);
    setAdminWsStatus('disconnected');
    setAdminLastSyncedAt(null);
  };

  const exportSignupsCSV = () => {
    if (!adminSignups.length) return;
    const headers = ['ID', 'Date', 'Name', 'Email', 'Android Version', 'Device Model'];
    const rows = adminSignups.map((s, idx) => [
      s.id || idx + 1,
      `"${s.created_at || s.queued_at || ''}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.android_version || '').replace(/"/g, '""')}"`,
      `"${(s.device_model || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sneha-signups-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportFeedbackCSV = () => {
    if (!adminFeedback.length) return;
    const headers = ['ID', 'Date', 'Rating', 'Device', 'Email', 'What Worked', 'What Broke', 'What to Add'];
    const rows = adminFeedback.map((f, idx) => [
      f.id || idx + 1,
      `"${f.created_at || f.queued_at || ''}"`,
      f.rating || 0,
      `"${(f.tester_device || '').replace(/"/g, '""')}"`,
      `"${(f.tester_email || '').replace(/"/g, '""')}"`,
      `"${(f.what_worked || '').replace(/"/g, '""')}"`,
      `"${(f.what_broke || '').replace(/"/g, '""')}"`,
      `"${(f.what_to_add || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sneha-feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const syncOfflineQueue = async () => {
    let signups: any[] = [];
    let feedback: any[] = [];
    try {
      signups = JSON.parse(localStorage.getItem('sneha_pending_signups') || '[]');
      feedback = JSON.parse(localStorage.getItem('sneha_pending_feedback') || '[]');
    } catch {}

    if (!signups.length && !feedback.length) {
      setAdminSyncNotice('No pending offline submissions to sync.');
      return;
    }

    setAdminLoading(true);
    let syncedCount = 0;

    for (const s of signups) {
      try {
        await submitSignupUnified({
          name: s.name,
          email: s.email,
          androidVersion: s.androidVersion || s.android_version,
          deviceModel: s.deviceModel || s.device_model,
        });
        syncedCount++;
      } catch {}
    }

    for (const f of feedback) {
      try {
        await submitFeedbackUnified({
          rating: f.rating,
          whatWorked: f.whatWorked || f.what_worked,
          whatBroke: f.whatBroke || f.what_broke,
          whatToAdd: f.whatToAdd || f.what_to_add,
          testerEmail: f.testerEmail || f.tester_email,
          testerDevice: f.testerDevice || f.tester_device,
        });
        syncedCount++;
      } catch {}
    }

    try {
      localStorage.removeItem('sneha_pending_signups');
      localStorage.removeItem('sneha_pending_feedback');
    } catch {}

    setAdminSyncNotice(`Successfully synced ${syncedCount} offline items to database!`);
    await fetchAdminData();
  };

  useEffect(() => {
    if (activeTab === 'admin' && isAdminAuthenticated) {
      fetchAdminData();
    }
  }, [activeTab, isAdminAuthenticated]);

  const filteredSignups = adminSignups.filter((s) => {
    if (!adminSearchQuery.trim()) return true;
    const q = adminSearchQuery.toLowerCase();
    return (
      (s.name && String(s.name).toLowerCase().includes(q)) ||
      (s.email && String(s.email).toLowerCase().includes(q)) ||
      (s.device_model && String(s.device_model).toLowerCase().includes(q)) ||
      (s.android_version && String(s.android_version).toLowerCase().includes(q))
    );
  });

  const filteredFeedback = adminFeedback.filter((f) => {
    if (adminFeedbackRatingFilter === 'all') return true;
    return f.rating === adminFeedbackRatingFilter;
  });

  return (
    <div className="min-h-screen bg-[#f5ecd4] text-[#1f1a0e] font-sans selection:bg-[#1f1a0e] selection:text-[#f5ecd4] relative">
      {/* Subtle Ambient Bleeds without GPU blur or mix-blend to preserve 100% crisp text */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30 dark:opacity-10" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#ff4a8a]/20 to-transparent" />
        <div className="absolute top-1/2 -left-24 w-80 h-80 rounded-full bg-gradient-to-tr from-[#0e4dff]/15 to-transparent" />
        <div className="absolute -bottom-16 right-1/4 w-72 h-72 rounded-full bg-gradient-to-tl from-[#ff7028]/15 to-transparent" />
      </div>

      {/* Header with Hamburger Menu */}
      <header className="sticky top-0 z-50 bg-[#f5ecd4] text-[#1f1a0e] border-b-4 border-[#1f1a0e] shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab('pilot-site'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="bg-[#ff4a8a] text-[#1f1a0e] px-2 py-0.5 border-2 border-[#1f1a0e] font-black text-sm cursor-pointer hover:bg-[#ff7028] transition-colors"
              title="Return to SNEHA Pilot Overview"
            >
              SNEHA.4U
            </button>
          </div>

          {/* Hamburger Toggle - visible on all screens, opens drawer */}
          <div className="flex items-center gap-2">
            <button
              ref={menuButtonRef}
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col justify-center items-center w-10 h-10 bg-[#ff4a8a] text-[#1f1a0e] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_#1f1a0e] transition-all"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="flex flex-col justify-center items-center w-10 h-10 bg-[#ff4a8a] text-[#1f1a0e] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0_#1f1a0e] transition-all"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Menu Drawer - full overlay, matches website style */}
        {menuOpen && (
          <div ref={menuRef} className="absolute top-full left-0 right-0 bg-[#f5ecd4] border-b-4 border-[#1f1a0e] shadow-2xl z-50 animate-[fade-in_0.2s_ease-out]">
            <div className="flex flex-col">
              <button onClick={() => { setActiveTab('pilot-site'); setMenuOpen(false); }} className="px-5 py-4 text-left text-[#1f1a0e] font-['Bowlby_One'] text-lg border-b-3 border-[#1f1a0e] hover:bg-[#ff4a8a] hover:text-[#f5ecd4] transition-all">
                1. Pilot Site
              </button>
              <button onClick={() => { setActiveTab('pilot-site'); setMenuOpen(false); setTimeout(() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }, 150); }} className="px-5 py-4 text-left text-[#1f1a0e] font-['Bowlby_One'] text-lg border-b-3 border-[#1f1a0e] hover:bg-[#ff7028] hover:text-[#1f1a0e] transition-all flex items-center justify-between">
                <span>💰 Founder Pricing</span>
                <span className="text-[10px] font-mono uppercase bg-[#10b981] text-white px-2 py-0.5 border border-[#1f1a0e]">Free Till Dec 1</span>
              </button>
              <button onClick={() => { setActiveTab('in-app-feedback'); setMenuOpen(false); }} className="px-5 py-4 text-left text-[#1f1a0e] font-['Bowlby_One'] text-lg border-b-3 border-[#1f1a0e] hover:bg-[#0e4dff] hover:text-white transition-all">
                2. App-Side Feedback
              </button>
              <button onClick={() => { setActiveTab('privacy'); setMenuOpen(false); }} className="px-5 py-4 text-left text-[#1f1a0e] font-['Bowlby_One'] text-lg border-b-3 border-[#1f1a0e] hover:bg-[#ff7028] hover:text-[#1f1a0e] transition-all">
                3. Privacy Policy
              </button>
              <button onClick={() => { setActiveTab('audit'); setMenuOpen(false); }} className="px-5 py-4 text-left text-[#1f1a0e] font-['Bowlby_One'] text-lg border-b-3 border-[#1f1a0e] hover:bg-[#eedcb4] hover:text-[#1f1a0e] transition-all">
                4. Security &amp; Privacy Audit
              </button>
              <button onClick={() => { setActiveTab('changelog'); setMenuOpen(false); }} className="px-5 py-4 text-left text-[#1f1a0e] font-['Bowlby_One'] text-lg border-b-3 border-[#1f1a0e] hover:bg-[#0e4dff] hover:text-white transition-all">
                5. Changelog
              </button>
              <button onClick={() => { setActiveTab('download'); setMenuOpen(false); }} className="px-5 py-4 text-left text-[#1f1a0e] font-['Bowlby_One'] text-lg border-b-3 border-[#1f1a0e] hover:bg-[#ff4a8a] hover:text-[#f5ecd4] transition-all">
                6. Download APK
              </button>
              <button onClick={() => { setActiveTab('compatibility'); setMenuOpen(false); }} className="px-5 py-4 text-left text-[#1f1a0e] font-['Bowlby_One'] text-lg border-b-3 border-[#1f1a0e] hover:bg-[#ff7028] hover:text-[#1f1a0e] transition-all">
                7. Device Compatibility
              </button>
              <button onClick={() => { setActiveTab('faq'); setMenuOpen(false); }} className="px-5 py-4 text-left text-[#1f1a0e] font-['Bowlby_One'] text-lg border-b-3 border-[#1f1a0e] hover:bg-[#eedcb4] hover:text-[#1f1a0e] transition-all">
                8. FAQ
              </button>
              <button onClick={() => { setActiveTab('admin'); setMenuOpen(false); }} className="px-5 py-4 text-left text-[#1f1a0e] font-['Bowlby_One'] text-lg border-b-3 border-[#1f1a0e] hover:bg-[#0e4dff] hover:text-white transition-all flex items-center justify-between">
                <span>9. Admin Portal</span>
                <span className="text-[10px] font-mono uppercase bg-[#1f1a0e] text-[#f5ecd4] px-2 py-0.5 border border-[#1f1a0e]">Maintainer</span>
              </button>

              {/* Viewport Testing inside hamburger */}
              <div className="px-5 py-4 border-b-3 border-[#1f1a0e]">
                <span className="text-xs font-bold uppercase tracking-widest text-[#5a4f30] block mb-2">Live Viewport Testing</span>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => { setViewportMode('desktop'); setMenuOpen(false); }} className={`px-2.5 py-2 border-2 border-[#1f1a0e] font-bold text-xs uppercase transition-all ${viewportMode === 'desktop' ? 'bg-[#1f1a0e] text-[#f5ecd4]' : 'bg-[#eedcb4] hover:bg-white'}`}>
                    Desktop
                  </button>
                  <button onClick={() => { setViewportMode('tablet'); setMenuOpen(false); }} className={`px-2.5 py-2 border-2 border-[#1f1a0e] font-bold text-xs uppercase transition-all ${viewportMode === 'tablet' ? 'bg-[#1f1a0e] text-[#f5ecd4]' : 'bg-[#eedcb4] hover:bg-white'}`}>
                    Tablet
                  </button>
                  <button onClick={() => { setViewportMode('mobile'); setMenuOpen(false); }} className={`px-2.5 py-2 border-2 border-[#1f1a0e] font-bold text-xs uppercase transition-all ${viewportMode === 'mobile' ? 'bg-[#1f1a0e] text-[#f5ecd4]' : 'bg-[#eedcb4] hover:bg-white'}`}>
                    Phone
                  </button>
                  <button onClick={() => { setViewportMode('compact'); setMenuOpen(false); }} className={`px-2.5 py-2 border-2 border-[#1f1a0e] font-bold text-xs uppercase transition-all ${viewportMode === 'compact' ? 'bg-[#1f1a0e] text-[#f5ecd4]' : 'bg-[#eedcb4] hover:bg-white'}`}>
                    Compact
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area Based on Active Tab */}
      <main className="relative z-10">
        <ErrorBoundary>
        {activeTab === 'pilot-site' && (
          <div>
            <div className={`mx-auto transition-[max-width] duration-200 ease-out ${
              viewportMode === 'compact' ? 'max-w-[320px] border-x-4 border-[#1f1a0e] shadow-2xl my-6 bg-[#f5ecd4]' :
              viewportMode === 'mobile' ? 'max-w-[375px] border-x-4 border-[#1f1a0e] shadow-2xl my-6 bg-[#f5ecd4]' :
              viewportMode === 'tablet' ? 'max-w-[768px] border-x-4 border-[#1f1a0e] shadow-2xl my-6 bg-[#f5ecd4]' :
              'w-full'
            }`}>
              {/* Hero Section */}
              <section className="px-4 sm:px-8 py-10 sm:py-16 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center" id="hero">
                <div className="lg:col-span-7">
                  <div className="flex flex-wrap gap-2.5 sm:gap-3 mb-6">
                    <span className="inline-flex items-center px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-[#1f1a0e] bg-[#ff4a8a] text-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] font-sans">
                      THE AI WHICH ACTUALLY CARES
                    </span>
                    <span className="inline-flex items-center px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-[#1f1a0e] bg-[#0e4dff] text-white shadow-[3px_3px_0_#1f1a0e] font-sans">
                      MADE WITH LOVE ❤️
                    </span>
                    <span className="inline-flex items-center px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-[#1f1a0e] bg-[#10b981] text-white shadow-[3px_3px_0_#1f1a0e] font-sans">
                      FREE TILL DEC 1 ⚡
                    </span>
                  </div>

                  <h1 className="font-['Bowlby_One'] text-4xl sm:text-6xl md:text-7xl leading-[0.88] uppercase tracking-tight mb-6">
                    LOCAL,<br />
                    <span className="text-[#ff4a8a] drop-shadow-[2px_2px_0_#0e4dff]">PRIVATE,</span><br />
                    <span className="text-transparent active-hero-stroke">ACTIVE.</span>
                    <em className="block font-['Crimson_Pro'] italic font-normal text-xl sm:text-2xl text-[#0e4dff] tracking-normal mt-2 lowercase">
                      — the AI companion that actually does things on your phone.
                    </em>
                  </h1>

                  <p className="font-['Crimson_Pro'] italic text-lg sm:text-xl text-[#1f1a0e] leading-relaxed mb-6 max-w-xl">
                    “SNEHA is the AI companion that never goes down, never has to leak your data, and actually does things for you — on a phone you already own, at near-zero infrastructure cost.”
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <a
                      href="#signup"
                      className="px-5 py-3 bg-[#ff4a8a] text-[#1f1a0e] font-bold text-sm uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#1f1a0e] transition-all"
                    >
                      Join Free Pilot →
                    </a>
                    <a
                      href="#pricing"
                      className="px-4 py-3 bg-[#eedcb4] text-[#1f1a0e] font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4] transition-all"
                    >
                      💰 Founder Pricing Roadmap
                    </a>
                    <button
                      onClick={() => setActiveTab('in-app-feedback')}
                      className="text-xs font-bold uppercase tracking-wider text-[#0e4dff] hover:text-[#1f1a0e] border-b-2 border-dashed border-[#0e4dff] pb-0.5 transition-all"
                    >
                      Existing tester? Submit Reviews //
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
                      <b className="block font-['Bowlby_One'] text-2xl text-[#ff4a8a] leading-none mb-1">DEC 1</b>
                      Free Till Launch
                    </div>
                  </div>
                </div>

                {/* Hero Right: Showcase frame with dimensions */}
                <div className="lg:col-span-5 relative flex justify-center">
                  <div className="relative w-full max-w-[340px]">
                    {/* Audio element for Humdum song */}
                    <audio
                      ref={audioRef}
                      src="./assets/aistudio/Humdum_-_Aditya_Rikhari_320_Kbps_2add91c3.mp3"
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
                          src="./assets/aistudio/gemini_generated_video_0db2fe7e_8318c5ea.mp4"
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
                <div className="mb-8" data-reveal="features-header">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-reveal="features-grid">
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
                      Computes locally on your hardware, eliminating expensive cloud server overhead and allowing us to offer ultra-affordable pricing instead of greedy $20/month SaaS subscriptions.
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
                            src: './assets/aistudio/WhatsApp_Image_2026-10-24_at_12.50.46_PM_346a1911.jpeg',
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
                              src="./assets/aistudio/WhatsApp_Image_2026-10-24_at_12.50.46_PM_346a1911.jpeg"
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
                            src: './assets/aistudio/WhatsApp_Image_2026-10-24_at_12.51.04_PM_66268e2f.jpeg',
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
                              src="./assets/aistudio/WhatsApp_Image_2026-10-24_at_12.51.04_PM_66268e2f.jpeg"
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
                  <div className="lg:col-span-6" data-reveal="screenshots-right">
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
                      Package: com.sneha.app · Min SDK 26 · Target SDK 35 · Independent Privacy Core
                    </div>
                  </div>
                </div>
              </section>

              {/* Founder Pricing & Commercial Roadmap Section */}
              <section className="px-4 sm:px-8 py-16 max-w-6xl mx-auto" id="pricing">
                <div className="mb-10 text-center max-w-3xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff7028] text-[#1f1a0e] text-xs font-['Bowlby_One'] uppercase tracking-widest border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] mb-3">
                    <span>💰 COMMERCIAL ROADMAP &amp; FOUNDER ACCESS</span>
                  </div>
                  <h2 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight leading-tight mb-3">
                    FREE UNTIL <span className="text-[#ff4a8a]">DECEMBER 1</span>.
                  </h2>
                  <p className="font-['Crimson_Pro'] italic text-base sm:text-lg text-[#2a2515] leading-relaxed">
                    Big Tech gives you "free" cloud AI so they can harvest your private voice, screen, and questions to sell targeted ads. SNEHA is 100% private and runs offline on your phone. To guarantee we never sell user data or add tracking SDKs, SNEHA will transition to a modest, ultra-affordable fee after December 1, 2026.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Tier 1: 1 Month Pass */}
                  <div className="p-6 bg-[#f5ecd4] dark:bg-[#1c170d] border-3 border-[#1f1a0e] dark:border-[#eedcb4]/40 shadow-[6px_6px_0_#1f1a0e] flex flex-col justify-between relative">
                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#10b981] text-white font-['Bowlby_One'] text-[10px] uppercase tracking-wider border-2 border-[#1f1a0e]">
                      FREE TILL DEC 1
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-[#0e4dff] uppercase tracking-wider block mb-1">
                        Tier 01 // Monthly Pass
                      </span>
                      <h3 className="font-['Bowlby_One'] text-xl uppercase mb-2">1 Month Pass</h3>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="font-['Bowlby_One'] text-4xl text-[#1f1a0e] dark:text-[#fdfaf2]">₹143</span>
                        <span className="text-xs font-bold uppercase text-[#5a4f30]">/ month</span>
                      </div>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#2a2515] dark:text-[#cdbe9e] mb-4">
                        The "143" Starter Companion. Full on-device neural engine. 100% free through Dec 1, 2026.
                      </p>
                      <ul className="space-y-2 text-xs font-medium text-[#1f1a0e] dark:text-[#fdfaf2] border-t-2 border-[#1f1a0e]/15 pt-3 mb-6">
                        <li className="flex items-center gap-2">✓ Full On-Device AI Neural Runtime</li>
                        <li className="flex items-center gap-2">✓ Offline Voice &amp; Automation Intents</li>
                        <li className="flex items-center gap-2">✓ Direct APK Updates &amp; Hotfixes</li>
                        <li className="flex items-center gap-2">✓ Zero Recurring Commitments</li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('download');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 bg-[#1f1a0e] text-[#f5ecd4] hover:bg-[#0e4dff] hover:text-white font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] transition-all text-center block cursor-pointer"
                    >
                      Download Free Pilot APK →
                    </button>
                  </div>

                  {/* Tier 2: 6 Months Pass */}
                  <div className="p-6 bg-[#eedcb4] dark:bg-[#271f13] border-3 border-[#1f1a0e] dark:border-[#eedcb4]/40 shadow-[6px_6px_0_#1f1a0e] flex flex-col justify-between relative">
                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#0e4dff] text-white font-['Bowlby_One'] text-[10px] uppercase tracking-wider border-2 border-[#1f1a0e]">
                      SAVE 42%
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-[#0e4dff] uppercase tracking-wider block mb-1">
                        Tier 02 // Semi-Annual Pass
                      </span>
                      <h3 className="font-['Bowlby_One'] text-xl uppercase mb-2">6 Months Pass</h3>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="font-['Bowlby_One'] text-4xl text-[#0e4dff]">₹499</span>
                        <span className="text-xs font-bold uppercase text-[#5a4f30]">/ 6 months</span>
                        <span className="text-[10px] font-bold text-[#1f1a0e] bg-white/70 px-1.5 py-0.5 border border-[#1f1a0e]">~₹83/mo</span>
                      </div>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#2a2515] dark:text-[#cdbe9e] mb-4">
                        Under ₹500 psychological barrier! Save ₹359 vs monthly. 100% free through Dec 1, 2026.
                      </p>
                      <ul className="space-y-2 text-xs font-medium text-[#1f1a0e] dark:text-[#fdfaf2] border-t-2 border-[#1f1a0e]/15 pt-3 mb-6">
                        <li className="flex items-center gap-2">✓ 6 Months Continuous Offline AI Runtime</li>
                        <li className="flex items-center gap-2">✓ Priority APK Hotfixes &amp; Neural Updates</li>
                        <li className="flex items-center gap-2">✓ Direct Line to Core Developers</li>
                        <li className="flex items-center gap-2">✓ Locked-in Founder Renewal Rights</li>
                      </ul>
                    </div>
                    <a
                      href="#signup"
                      className="w-full py-2.5 bg-[#0e4dff] text-white hover:bg-[#1f1a0e] hover:text-[#f5ecd4] font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] transition-all text-center block cursor-pointer"
                    >
                      Reserve 6-Month Pass →
                    </a>
                  </div>

                  {/* Tier 3: 1 Year Founder Pass */}
                  <div className="p-6 bg-[#ff4a8a]/15 dark:bg-[#ff4a8a]/10 border-3 border-[#ff4a8a] shadow-[6px_6px_0_#ff4a8a] flex flex-col justify-between relative">
                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#ff4a8a] text-[#1f1a0e] font-['Bowlby_One'] text-[10px] uppercase tracking-wider border-2 border-[#1f1a0e]">
                      ⭐ BEST VALUE · 53% OFF
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-[#ff4a8a] uppercase tracking-wider block mb-1">
                        Tier 03 // Annual Founder Pass
                      </span>
                      <h3 className="font-['Bowlby_One'] text-xl uppercase mb-2">1 Year Pass</h3>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="font-['Bowlby_One'] text-4xl text-[#ff4a8a]">₹799</span>
                        <span className="text-xs font-bold uppercase text-[#5a4f30]">/ year</span>
                        <span className="text-xs font-bold uppercase text-[#5a4f30] line-through">₹1,716</span>
                      </div>
                      <p className="font-['Crimson_Pro'] italic text-xs text-[#2a2515] dark:text-[#cdbe9e] mb-4">
                        Effective ₹66/month (~₹2.20/day). Only ₹300 more than 6 months! 5+ months completely free.
                      </p>
                      <ul className="space-y-2 text-xs font-medium text-[#1f1a0e] dark:text-[#fdfaf2] border-t-2 border-[#1f1a0e]/15 pt-3 mb-6">
                        <li className="flex items-center gap-2">✓ Full 12 Months Offline Neural Engine</li>
                        <li className="flex items-center gap-2">✓ Permanent Grandfathered Founder Renewal</li>
                        <li className="flex items-center gap-2">✓ Free for Top 100 Bug Reporters</li>
                        <li className="flex items-center gap-2">✓ VIP Early Access to New Automation Skills</li>
                      </ul>
                    </div>
                    <a
                      href="#signup"
                      className="w-full py-2.5 bg-[#ff4a8a] text-[#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4] font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] transition-all text-center block cursor-pointer"
                    >
                      Claim 1-Year Founder Deal →
                    </a>
                  </div>
                </div>

                {/* Active Tester Bounty Box */}
                <div className="p-4 sm:p-5 bg-[#eedcb4] dark:bg-[#271f13] border-3 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[4px_4px_0_#1f1a0e] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#ff7028] text-white flex items-center justify-center border-2 border-[#1f1a0e] font-['Bowlby_One'] text-lg shrink-0">
                      🎁
                    </div>
                    <div>
                      <h4 className="font-['Bowlby_One'] text-sm sm:text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                        Want SNEHA 100% Free for Life?
                      </h4>
                      <p className="font-['Crimson_Pro'] italic text-xs sm:text-sm text-[#2a2515] dark:text-[#cdbe9e] mt-0.5">
                        Submit at least 2 verified bug reports or hardware logs through the App-Side Feedback tab before Dec 1st. Our top 100 active tester contributors will receive a complimentary, permanent Lifetime License!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('in-app-feedback');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 bg-[#0e4dff] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#1f1a0e] transition-all shrink-0 cursor-pointer"
                  >
                    Submit Feedback Now →
                  </button>
                </div>
              </section>

              {/* Technical Factual Pledge */}
              <section className="px-4 sm:px-8 py-12 text-center max-w-4xl mx-auto">
                <blockquote className="font-['Bowlby_One'] text-2xl sm:text-4xl uppercase leading-snug tracking-tight text-[#1f1a0e] mb-3">
                  “Built to run locally on the phone in your pocket — <span className="text-[#ff4a8a]">zero external telemetry</span>, 100% free till Dec 1, and independent <span className="text-[#0e4dff]">privacy-first</span> engineering.”
                </blockquote>
                <cite className="font-bold text-xs uppercase tracking-widest text-[#0e4dff] not-italic block">
                  // SNEHA Pilot Commercial Integrity Pledge · sumitnawale123456@gmail.com
                </cite>
              </section>

              {/* Pilot Sign-Up Section */}
              <section className="px-4 sm:px-8 py-16 bg-[#ff4a8a] text-[#1f1a0e] border-t-3 border-[#1f1a0e]" id="signup">
                <div className="max-w-2xl mx-auto text-center">
                  <div className="inline-block px-3 py-1 bg-[#1f1a0e] text-[#f5ecd4] text-xs font-['Bowlby_One'] uppercase tracking-widest border-2 border-[#1f1a0e] mb-3 shadow-[2px_2px_0_#f5ecd4]">
                    FOUNDER REGISTRATION · CLOSES DEC 1
                  </div>
                  <h2 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight mb-3 text-[#1f1a0e] drop-shadow-[2px_2px_0_#f5ecd4]">
                    Join the SNEHA Pilot.
                  </h2>
                  <p className="font-['Crimson_Pro'] italic text-base sm:text-lg text-[#1f1a0e] font-semibold mb-8">
                    Get 100% free early access until December 1st. Everyone who registers now locks in Founder Status, giving you grandfathered rates across all plans (₹143/mo, ₹499/6-mo, or ₹799/yr) and eligibility for a free lifetime pass!
                  </p>

                  <div className="p-6 sm:p-8 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e] text-left">
                    {/* Founder Benefit Callout Banner */}
                    <div className="mb-5 p-3.5 bg-[#0e4dff] text-white border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] text-xs font-bold uppercase tracking-wider flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎁</span>
                        <span>Register now to lock in Founder Rates: ₹143/mo · ₹499/6-mo · ₹799/yr on Dec 1st!</span>
                      </div>
                      <span className="hidden sm:inline-block px-2 py-0.5 bg-white text-[#0e4dff] text-[10px] font-mono font-bold shrink-0">
                        FREE PASS
                      </span>
                    </div>
                    {signupSuccess && (
                      <div className="mb-4 p-3 bg-[#eedcb4] border-2 border-[#0e4dff] text-[#0e4dff] text-xs font-bold flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} />
                          Thank you! Your pilot sign-up has been recorded.
                        </div>
                        {signupOfflineNotice && (
                          <div className="text-[11px] text-[#2a2515] font-['Crimson_Pro'] italic">
                            (Supabase not configured: submission queued in local storage and opened in your email client to send to maintainer sumitnawale123456@gmail.com).
                          </div>
                        )}
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
                          maxLength={100}
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
                          maxLength={254}
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
                            maxLength={120}
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

                      {signupError && (
                        <div className="p-3 bg-[#ff4a8a]/15 border-2 border-[#ff4a8a] text-[#ff4a8a] text-xs font-bold flex items-center gap-2">
                          <AlertTriangle size={14} /> {signupError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={signupLoading}
                        className={`w-full py-3 font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[4px_4px_0_#0e4dff] transition-all ${
                          signupLoading
                            ? 'bg-[#eedcb4] text-[#5a4f30] cursor-not-allowed'
                            : 'bg-[#1f1a0e] text-[#f5ecd4] hover:bg-[#0e4dff] hover:text-white'
                        }`}
                      >
                        {signupLoading ? 'Submitting...' : 'Submit Pilot Application →'}
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
                      Package: <CopyableBadge text="com.sneha.app" className="font-mono text-[11px] text-[#eedcb4]" /> · Target SDK 35 · Min SDK 26
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-[11px] text-[#ff4a8a] tracking-widest uppercase mb-3">// PAGES</h5>
                    <ul className="space-y-1.5 text-[#eedcb4]">
                      <li><button onClick={() => navigateToSection('hero')} className="hover:text-[#ff4a8a] transition-colors text-left cursor-pointer">Overview</button></li>
                      <li><button onClick={() => navigateToSection('features')} className="hover:text-[#ff4a8a] transition-colors text-left cursor-pointer">Verified Features</button></li>
                      <li><button onClick={() => navigateToSection('screenshots')} className="hover:text-[#ff4a8a] transition-colors text-left cursor-pointer">Screenshots</button></li>
                      <li><button onClick={() => navigateToSection('signup')} className="hover:text-[#ff4a8a] transition-colors text-left cursor-pointer">Pilot Sign-up</button></li>
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
                        <button onClick={() => setActiveTab('admin')} className="hover:text-[#ff4a8a] transition-colors text-left flex items-center gap-1.5 cursor-pointer">
                          <span>Admin Portal (Maintainer)</span>
                        </button>
                      </li>
                      <li>
                        <CopyableBadge text="sumitnawale123456@gmail.com" className="text-[#eedcb4] hover:text-[#ff4a8a]" />
                      </li>
                      <li className="text-[11px] text-[#eedcb4]/70 pt-1">
                        Independent Commercial Software · Free Pilot Till Dec 1
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="max-w-6xl mx-auto pt-6 border-t border-[#eedcb4]/20 flex flex-wrap justify-between items-center gap-4 text-[11px] text-[#eedcb4]">
                  <span>© SNEHA PILOT DISTRIBUTION · 2026 · ALL RIGHTS RESERVED</span>
                  <span>PROPRIETARY ON-DEVICE AI · ZERO TRACKERS · FREE PILOT TILL DEC 1</span>
                </div>
              </footer>
            </div>
          </div>
        )}

        {/* Tab 2: In-App Feedback Screen (Step 5 App-Side Support) */}
        {activeTab === 'in-app-feedback' && (
          <div className="max-w-3xl mx-auto px-4 py-12" data-reveal="feedback-section">
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
                <div className="mb-6 p-4 bg-[#eedcb4] border-2 border-[#0e4dff] text-[#0e4dff] text-sm font-bold flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    Thank you! Your feedback has been received.
                  </div>
                  {feedbackOfflineNotice && (
                    <div className="text-xs text-[#2a2515] font-['Crimson_Pro'] italic">
                      (Supabase not configured: feedback saved in local storage and opened in your email client for sumitnawale123456@gmail.com).
                    </div>
                  )}
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
                        aria-label={`${val} Star${val > 1 ? 's' : ''}`}
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
                    maxLength={3000}
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
                    maxLength={3000}
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
                    maxLength={3000}
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
                      maxLength={254}
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
                      maxLength={120}
                      value={testerDevice}
                      onChange={(e) => setTesterDevice(e.target.value)}
                      placeholder="e.g. Pixel 7 / Android 14"
                      className="w-full p-2.5 bg-[#f5ecd4] border-2 border-[#1f1a0e] text-sm focus:border-[#0e4dff] focus:outline-none shadow-[2px_2px_0_#1f1a0e]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#eedcb4] border-2 border-dashed border-[#1f1a0e] text-xs font-['Crimson_Pro'] italic text-[#2a2515]">
                  <strong>User-Initiated Transmission Only:</strong> This screen submits only what you explicitly type to Supabase. Screenshot uploads are omitted per Step 3.5.
                </div>

                {feedbackError && (
                  <div className="p-3 bg-[#ff4a8a]/15 border-2 border-[#ff4a8a] text-[#ff4a8a] text-xs font-bold flex items-center gap-2">
                    <AlertTriangle size={14} /> {feedbackError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className={`w-full py-3 font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] transition-all ${
                    feedbackLoading
                      ? 'bg-[#eedcb4] text-[#5a4f30] cursor-not-allowed'
                      : 'bg-[#0e4dff] text-white hover:bg-[#1f1a0e]'
                  }`}
                >
                  {feedbackLoading ? 'Sending...' : 'Send Feedback to Maintainer →'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 3: Plain-Language Privacy Policy */}
        {activeTab === 'privacy' && (
          <div className="max-w-3xl mx-auto px-4 py-12" data-reveal="privacy-section">
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
                <h3 className="font-['Bowlby_One'] text-xl uppercase mb-2">4. Commercial Integrity &amp; Independent Privacy Architecture</h3>
                <p className="font-['Crimson_Pro'] text-base text-[#2a2515] leading-relaxed mb-2">
                  SNEHA is independently developed proprietary software. We are 100% free with unlimited access through December 1, 2026, after which we charge a modest, user-funded commercial fee specifically so we never have to monetize user data, sell ad tracking pixels, or compromise your personal privacy.
                </p>
                <p className="font-['Crimson_Pro'] text-base text-[#2a2515] leading-relaxed">
                  You can independently verify our zero-telemetry claims anytime via our cryptographic Checksum Validator and on-device packet inspection.
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

            <div className="border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e] bg-[#f5ecd4]">
              <div className="overflow-x-auto max-w-full">
                <table className="w-full text-left border-collapse text-xs min-w-[700px]">
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
          </div>
        )}

        {/* Tab 5: Changelog */}
        {activeTab === 'changelog' && (
          <div className="max-w-3xl mx-auto px-4 py-12" data-reveal="changelog-section">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border-2 border-[#1f1a0e] bg-[#eedcb4] text-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] mb-2">
                  Release History
                </span>
                <h1 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight">
                  <span className="text-[#ff4a8a]">Changelog</span>.
                </h1>
                <p className="font-['Crimson_Pro'] italic text-base text-[#2a2515] mt-1">
                  Every pilot build, listed newest first. No silent updates — every change is disclosed.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e] space-y-4">
              <div className="border-l-4 border-[#ff4a8a] pl-4 py-3 bg-[#eedcb4]/40">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-['Bowlby_One'] text-lg text-[#ff4a8a] uppercase tracking-tight">v1.0.1</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1f1a0e] border-2 border-[#1f1a0e] px-2 py-0.5 bg-[#f5ecd4]">2026-10-25</span>
                </div>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-[#2a2515] font-['Crimson_Pro'] italic">
                  <li>Added Changelog, Download APK, Device Compatibility, and FAQ pages to pilot dashboard.</li>
                  <li>Hamburger menu now renders all 8 tabs with matching views.</li>
                  <li>Fixed missing tab views so every menu item navigates to its page.</li>
                </ul>
              </div>

              <div className="border-l-4 border-[#0e4dff] pl-4 py-3 bg-[#eedcb4]/40">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-['Bowlby_One'] text-lg text-[#0e4dff] uppercase tracking-tight">v1.0.0</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1f1a0e] border-2 border-[#1f1a0e] px-2 py-0.5 bg-[#f5ecd4]">2026-10-24</span>
                </div>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-[#2a2515] font-['Crimson_Pro'] italic">
                  <li>Initial pilot distribution release for SNEHA (com.sneha.app).</li>
                  <li>Pilot Site with hero, verified features, screenshots, and sign-up form.</li>
                  <li>In-App Feedback form (Step 5) for tester reviews and bug reports.</li>
                  <li>Plain-Language Privacy Policy with zero-telemetry guarantee.</li>
                  <li>Feature Audit Table (Step 2) with EXISTS / PARTIAL / MISSING statuses.</li>
                  <li>Supabase-backed pilot_signups and pilot_feedback tables.</li>
                  <li>Spinning audio sticker player with "Humdum" by Aditya Rikhari.</li>
                  <li>Live viewport testing (desktop / tablet / mobile / compact) in hamburger menu.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Download APK */}
        {activeTab === 'download' && (
          <div className="max-w-3xl mx-auto px-4 py-12" data-reveal="download-section">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border-2 border-[#1f1a0e] bg-[#ff4a8a] text-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] mb-2">
                  Step 7 // Pilot Build Distribution
                </span>
                <h1 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight">
                  Download <span className="text-[#0e4dff]">APK</span>.
                </h1>
                <p className="font-['Crimson_Pro'] italic text-base text-[#2a2515] mt-1">
                  Grab the latest pilot build for SNEHA. Android 8.0+ (Min SDK 26) through Android 15 (Target SDK 35).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="px-4 py-2 bg-[#ff4a8a] text-[#1f1a0e] font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] hover:bg-[#ff7028] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>📱</span> Scan QR on Phone
              </button>
            </div>

            <div className="p-6 sm:p-8 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e]">
              <div className="mb-6 p-3 bg-[#eedcb4] border-2 border-dashed border-[#1f1a0e] text-xs font-['Crimson_Pro'] italic text-[#2a2515]">
                <strong>Important:</strong> This is an unsigned pilot build for testers only. Installing from unknown sources must be enabled on your device. We do not auto-update — check this page for new builds.
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                  <div>
                    <span className="font-['Bowlby_One'] text-lg text-[#1f1a0e] uppercase">sneha-pilot-1.0.1.apk</span>
                    <p className="text-xs text-[#5a4f30] mt-1 font-['Crimson_Pro'] italic">com.sneha.app · Min SDK 26 · Target SDK 35 · Arm64-v8a</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1f1a0e] border-2 border-[#1f1a0e] px-2 py-0.5">6.2 MB</span>
                    <a
                      href="./assets/sneha-pilot-1.0.1.apk"
                      download="sneha-pilot-1.0.1.apk"
                      onClick={() => {
                        fetch('./assets/sneha-pilot-1.0.1.apk', { method: 'HEAD' })
                          .then((r) => { if (!r.ok) window.open('https://github.com/itzlucifa/sneha.pilot/releases/latest', '_blank'); })
                          .catch(() => window.open('https://github.com/itzlucifa/sneha.pilot/releases/latest', '_blank'));
                      }}
                      className="mt-2 inline-block px-5 py-2 bg-[#1f1a0e] text-[#f5ecd4] font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[4px_4px_0_#0e4dff] hover:bg-[#0e4dff] hover:text-white transition-all cursor-pointer"
                    >
                      Download APK →
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                  <div>
                    <span className="font-['Bowlby_One'] text-lg text-[#1f1a0e] uppercase">sneha-pilot-1.0.0.apk</span>
                    <p className="text-xs text-[#5a4f30] mt-1 font-['Crimson_Pro'] italic">com.sneha.app · Min SDK 26 · Target SDK 35 · Arm64-v8a</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1f1a0e] border-2 border-[#1f1a0e] px-2 py-0.5">5.9 MB</span>
                    <a
                      href="./assets/sneha-pilot-1.0.0.apk"
                      download="sneha-pilot-1.0.0.apk"
                      onClick={() => {
                        fetch('./assets/sneha-pilot-1.0.0.apk', { method: 'HEAD' })
                          .then((r) => { if (!r.ok) window.open('https://github.com/itzlucifa/sneha.pilot/releases/latest', '_blank'); })
                          .catch(() => window.open('https://github.com/itzlucifa/sneha.pilot/releases/latest', '_blank'));
                      }}
                      className="mt-2 inline-block px-5 py-2 bg-[#eedcb4] text-[#1f1a0e] font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4] transition-all cursor-pointer"
                    >
                      Download APK →
                    </a>
                  </div>
                </div>

                {/* Sideload / Custom APK File Upload Flow */}
                <div className="mt-6 p-4 bg-[#eedcb4]/60 border-2 border-dashed border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                  <h4 className="font-['Bowlby_One'] text-sm uppercase text-[#1f1a0e] mb-1">
                    Tester Sideload / Custom APK Upload Flow
                  </h4>
                  <p className="text-xs font-['Crimson_Pro'] italic text-[#5a4f30] mb-3">
                    Have a custom development APK build? Select or drop your .apk file below to inspect headers and sideload directly:
                  </p>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#0e4dff] bg-[#f5ecd4] hover:bg-[#eedcb4] cursor-pointer transition-all">
                    <Upload size={24} className="text-[#0e4dff] mb-1" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1f1a0e]">Choose or Drop .APK Build</span>
                    <span className="text-[10px] text-[#5a4f30] mt-0.5">Loads package locally into browser memory</span>
                    <input
                      type="file"
                      accept=".apk"
                      onChange={handleCustomApkUpload}
                      className="hidden"
                    />
                  </label>
                  {customApkInfo && (
                    <div className="mt-3 p-3 bg-[#f5ecd4] border-2 border-[#1f1a0e] flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs uppercase block text-[#1f1a0e]">{customApkInfo.name}</span>
                        <span className="text-[11px] text-[#5a4f30]">Size: {customApkInfo.size} · Ready for device testing</span>
                      </div>
                      <a
                        href={customApkInfo.url}
                        download={customApkInfo.name}
                        className="px-3 py-1 bg-[#0e4dff] text-white text-xs font-bold uppercase border border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#1f1a0e]"
                      >
                        Download / Install
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-[#eedcb4] border-2 border-[#1f1a0e] text-xs font-['Crimson_Pro'] italic text-[#2a2515]">
                  <strong>How to install:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Download the APK file above.</li>
                    <li>On your Android device, go to Settings &gt; Apps &gt; Special app access &gt; Install unknown apps.</li>
                    <li>Enable installs from your browser or file manager.</li>
                    <li>Open the downloaded APK and tap Install.</li>
                  </ol>
                </div>

                {/* Cryptographic APK Checksum Validator */}
                <div className="mt-8">
                  <ChecksumValidator
                    expectedHash="c7a409f9e160ef5212384918e90e768393e5066db293bb859c253456860d5e1b"
                    fileName="sneha-pilot-1.0.1.apk"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Device Compatibility */}
        {activeTab === 'compatibility' && (
          <div className="max-w-4xl mx-auto px-4 py-12" data-reveal="compatibility-section">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border-2 border-[#1f1a0e] bg-[#ff7028] text-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] mb-2">
                  Device Compatibility Matrix
                </span>
                <h1 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight">
                  Supported <span className="text-[#0e4dff]">Devices</span>.
                </h1>
                <p className="font-['Crimson_Pro'] italic text-base text-[#2a2515] mt-1">
                  SNEHA runs on Android 8.0+ (Min SDK 26) through Android 15 (Target SDK 35). Compatibility verified across OEM skins.
                </p>
              </div>
            </div>

            {/* Real-Time Hardware Capability Inspector */}
            <div className="mb-8">
              <DeviceInspector onAutoFillSignup={handleAutoFillSignup} />
            </div>

            <div className="p-4 sm:p-8 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[6px_6px_0_#1f1a0e] sm:shadow-[8px_8px_0_#1f1a0e]">
              <div className="overflow-x-auto max-w-full">
                <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-[#1f1a0e] text-[#f5ecd4] font-['Bowlby_One'] text-[11px] uppercase tracking-wider">
                    <th className="p-3 border-r border-[#3a3320]">Android Version</th>
                    <th className="p-3 border-r border-[#3a3320]">SDK</th>
                    <th className="p-3 border-r border-[#3a3320]">Status</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#1f1a0e] font-sans">
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Android 15</td>
                    <td className="p-3 border-r border-[#1f1a0e]">SDK 35</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] font-bold border border-[#1f1a0e]">TARGET</span></td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Primary development target. Full feature support.</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Android 14</td>
                    <td className="p-3 border-r border-[#1f1a0e]">SDK 34</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] font-bold border border-[#1f1a0e]">SUPPORTED</span></td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Verified on Pixel 7. All intents functional.</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Android 13</td>
                    <td className="p-3 border-r border-[#1f1a0e]">SDK 33</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] font-bold border border-[#1f1a0e]">SUPPORTED</span></td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Verified on Pixel 6. Notification permissions handled.</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Android 12</td>
                    <td className="p-3 border-r border-[#1f1a0e]">SDK 31</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] font-bold border border-[#1f1a0e]">SUPPORTED</span></td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Verified on Samsung Galaxy S21 (OneUI).</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Android 11</td>
                    <td className="p-3 border-r border-[#1f1a0e]">SDK 30</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] font-bold border border-[#1f1a0e]">SUPPORTED</span></td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Scoped storage compatible. Local media access verified.</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Android 10</td>
                    <td className="p-3 border-r border-[#1f1a0e]">SDK 29</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] font-bold border border-[#1f1a0e]">SUPPORTED</span></td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Minimum tested version. Dark theme support confirmed.</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Android 9 Pie</td>
                    <td className="p-3 border-r border-[#1f1a0e]">SDK 28</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#eedcb4] text-[#0e4dff] font-bold border border-[#1f1a0e]">SUPPORTED</span></td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Background execution limits apply per OS.</td>
                  </tr>
                  <tr className="hover:bg-[#eedcb4]/50">
                    <td className="p-3 font-bold border-r border-[#1f1a0e]">Android 8.0 / 8.1 Oreo</td>
                    <td className="p-3 border-r border-[#1f1a0e]">SDK 26</td>
                    <td className="p-3 border-r border-[#1f1a0e]"><span className="px-2 py-0.5 bg-[#ff7028] text-[#1f1a0e] font-bold border border-[#1f1a0e]">MIN SDK</span></td>
                    <td className="p-3 font-['Crimson_Pro'] italic text-sm">Minimum supported version. Notification channels required.</td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#eedcb4] border-2 border-dashed border-[#1f1a0e] text-xs font-['Crimson_Pro'] italic text-[#2a2515]">
              <strong>OEM Notes:</strong> System automation features (alarms, reminders, intents) require runtime user permissions and are undergoing staged testing across OEM variations (OneUI, Pixel OS, HyperOS, MIPS). Offline inference speed varies by device RAM and NPU.
            </div>

            {/* Interactive Step-by-Step Sideloading Walkthrough Guide */}
            <div className="mt-8">
              <SideloadWizard />
            </div>
          </div>
        )}

        {/* Tab 8: FAQ */}
        {activeTab === 'faq' && (
          <div className="max-w-3xl mx-auto px-4 py-12" data-reveal="faq-section">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border-2 border-[#1f1a0e] bg-[#eedcb4] text-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] mb-2">
                  Frequently Asked Questions
                </span>
                <h1 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight">
                  <span className="text-[#ff4a8a]">FAQ</span>.
                </h1>
                <p className="font-['Crimson_Pro'] italic text-base text-[#2a2515] mt-1">
                  Straight answers about SNEHA, privacy, and the pilot program. Still have questions? Email us.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e] space-y-3">
              {[
                {
                  q: 'What is SNEHA?',
                  a: 'SNEHA is a privacy-first, on-device AI companion for Android 8.0+. It runs entirely on your phone — zero cloud trackers, zero background telemetry, and 100% free for all testers until December 1, 2026.',
                },
                {
                  q: 'Does SNEHA collect my data?',
                  a: 'No. Conversations, intent history, and automation preferences stay inside the private Android sandbox (/data/data/com.sneha.app). Nothing leaves your device unless you explicitly tap submit on a form.',
                },
                {
                  q: 'Is SNEHA free forever? Why will it charge after December 1st?',
                  a: 'SNEHA is 100% free with unlimited access for all users throughout the pilot until December 1, 2026! After December 1st, SNEHA will transition to 3 ultra-affordable passes: 1 Month @ ₹143, 6 Months @ ₹499 (save 42%), and 1 Year @ ₹799 (best value, save 53%!). Early pilot testers who register now get locked-in grandfathered perks, and active bug reporters can earn a free lifetime pass.',
                },
                {
                  q: 'What is the Founder Early Adopter Discount?',
                  a: 'Anyone who joins and registers during the pilot period locks in Founder Status, giving you grandfathered rates across all passes (₹143/mo, ₹499 for 6 months, and ₹799 for 1 year). In addition, active testers who submit 2 or more verified bug reports qualify for a 100% Free Lifetime License!',
                },
                {
                  q: 'Is SNEHA open source?',
                  a: 'SNEHA is built on proprietary, independently developed on-device neural runtime technology. However, our zero-telemetry claims are 100% auditable: our APK contains zero analytics SDKs, zero background network calls, and you can verify the SHA-256 cryptographic digest directly on this website.',
                },
                {
                  q: 'What Android versions are supported?',
                  a: 'Android 8.0 (Min SDK 26) through Android 15 (Target SDK 35). See the Device Compatibility page for details.',
                },
                {
                  q: 'How do I join the pilot program?',
                  a: 'Fill out the Pilot Sign-up form on the Pilot Site tab with your name, email, Android version, and device model. We will email your build invitation.',
                },
                {
                  q: 'How do I install the pilot APK?',
                  a: 'Download the APK from the Download tab, enable installs from unknown sources on your device, then open the APK and tap Install.',
                },
                {
                  q: 'Are there ads or trackers in SNEHA?',
                  a: 'None. Zero advertising SDKs, zero analytics pixels, zero background data brokers. Full stop.',
                },
                {
                  q: 'Who do I contact for support?',
                  a: 'Email sumitnawale123456@gmail.com or use the App-Side Feedback tab to submit reviews and bug reports.',
                },
              ].map((item, idx) => {
                const isExpanded = expandedFaq === idx;
                return (
                  <div key={idx} className="border-2 border-[#1f1a0e] bg-[#f5ecd4] shadow-[4px_4px_0_#1f1a0e] hover:shadow-[6px_6px_0_#0e4dff] transition-all overflow-hidden">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      className="p-3 bg-[#eedcb4] border-b-2 border-[#1f1a0e] flex justify-between items-center cursor-pointer transition-all select-none"
                      onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpandedFaq(isExpanded ? null : idx);
                        }
                      }}
                    >
                      <span className="font-['Bowlby_One'] text-sm text-[#ff4a8a] uppercase tracking-wider">
                        Q{idx + 1}. {item.q}
                      </span>
                      <span className={"text-xs font-bold text-[#1f1a0e] transition-transform duration-200 " + (isExpanded ? "rotate-180" : "")}>
                        ▾
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="p-3 bg-[#f5ecd4] text-sm text-[#2a2515] font-['Crimson_Pro'] italic border-t border-[#1f1a0e]/20">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="mt-6 pt-6 border-t-3 border-dashed border-[#1f1a0e] text-center">
                <p className="text-sm text-[#2a2515] font-['Crimson_Pro'] italic mb-3">
                  Still have a question not listed here?
                </p>
                <a
                  href="mailto:sumitnawale123456@gmail.com"
                  className="px-5 py-2 bg-[#1f1a0e] text-[#f5ecd4] font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[4px_4px_0_#0e4dff] hover:bg-[#0e4dff] hover:text-white transition-all"
                >
                  Email the Maintainer →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 9: Admin Portal (Section 4) */}
        {activeTab === 'admin' && (
          <div className="max-w-5xl mx-auto px-4 py-12" data-reveal="admin-section">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest border-2 border-[#1f1a0e] bg-[#ff4a8a] text-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] mb-2">
                  Section 4 // Maintainer Access Gate
                </span>
                <h1 className="font-['Bowlby_One'] text-3xl sm:text-5xl uppercase tracking-tight">
                  Admin <span className="text-[#0e4dff]">Portal</span>.
                </h1>
                <p className="font-['Crimson_Pro'] italic text-base text-[#2a2515] mt-1">
                  Inspect verified device compatibility logs, tester reviews, and download metrics.
                </p>
              </div>

              {isAdminAuthenticated && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchAdminData()}
                    disabled={adminLoading}
                    className="px-3 py-1.5 bg-[#eedcb4] text-[#1f1a0e] border-2 border-[#1f1a0e] text-xs font-bold uppercase hover:bg-white flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw size={14} className={adminLoading ? "animate-spin" : ""} />
                    Refresh
                  </button>
                  <button
                    onClick={handleAdminLogout}
                    className="px-3 py-1.5 bg-[#1f1a0e] text-[#f5ecd4] border-2 border-[#1f1a0e] text-xs font-bold uppercase hover:bg-[#ff4a8a] hover:text-[#1f1a0e] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Lock size={14} />
                    Lock Portal
                  </button>
                </div>
              )}
            </div>

            {!isAdminAuthenticated ? (
              /* PIN Lock Screen */
              <div className="p-8 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e] max-w-md mx-auto text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#ff4a8a] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] flex items-center justify-center text-[#1f1a0e]">
                  <Lock size={32} />
                </div>
                <h2 className="font-['Bowlby_One'] text-2xl uppercase mb-2">Maintainer Lock</h2>
                <p className="font-['Crimson_Pro'] italic text-sm text-[#5a4f30] mb-6">
                  Enter your maintainer PIN to unlock the live submissions dashboard, bug reports, and CSV exports.
                </p>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      disabled={adminLockoutSeconds > 0}
                      maxLength={64}
                      placeholder={adminLockoutSeconds > 0 ? `Locked for ${adminLockoutSeconds}s...` : 'Enter Admin PIN...'}
                      className="w-full p-3 bg-[#f5ecd4] dark:bg-[#2a2418] text-[#1f1a0e] dark:text-[#f5ecd4] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/40 text-center font-mono font-bold tracking-widest text-lg shadow-[2px_2px_0_#1f1a0e] focus:border-[#0e4dff] focus:outline-none disabled:opacity-50"
                    />
                  </div>

                  {adminAuthError && (
                    <div className="p-2.5 bg-[#ff4a8a]/15 border-2 border-[#ff4a8a] text-[#ff4a8a] text-xs font-bold flex items-center justify-center gap-1.5">
                      <AlertTriangle size={14} /> {adminAuthError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={adminLockoutSeconds > 0}
                    className="w-full py-3 bg-[#0e4dff] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] hover:bg-[#ff4a8a] hover:text-[#1f1a0e] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {adminLockoutSeconds > 0 ? `Security Lockout (${adminLockoutSeconds}s)` : 'Unlock Admin Dashboard →'}
                  </button>
                </form>
              </div>
            ) : (
              /* Authenticated Admin Dashboard */
              <div className="space-y-6">
                {/* Live Real-Time Connection Bar */}
                <div className="p-3 bg-[#f5ecd4] dark:bg-[#2a2418] border-3 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[4px_4px_0_#1f1a0e] dark:shadow-[4px_4px_0_#000] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        {adminRealtimeActive && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${adminRealtimeActive ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      </span>
                      <span className="font-['Bowlby_One'] text-xs uppercase tracking-wider text-[#1f1a0e] dark:text-[#f5ecd4]">
                        {adminRealtimeActive ? 'Direct Supabase Real-Time' : 'Live Sync Paused'}
                      </span>
                    </div>

                    <span className="hidden md:inline-block px-2 py-0.5 bg-[#eedcb4] dark:bg-[#3d3420] text-[#1f1a0e] dark:text-[#f5ecd4] border border-[#1f1a0e] dark:border-[#eedcb4]/30 font-mono text-[10px] font-bold">
                      {SUPABASE_URL.replace('https://', '')}
                    </span>

                    {adminLastSyncedAt && (
                      <span className="text-[11px] font-['Crimson_Pro'] italic text-[#5a4f30] dark:text-[#c4b998]">
                        Synced {adminLastSyncedAt.toLocaleTimeString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAdminRealtimeActive(!adminRealtimeActive)}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase border-2 border-[#1f1a0e] dark:border-[#eedcb4]/40 transition-all cursor-pointer ${
                        adminRealtimeActive
                          ? 'bg-emerald-500 text-white shadow-[2px_2px_0_#1f1a0e]'
                          : 'bg-[#eedcb4] dark:bg-[#3d3420] text-[#1f1a0e] dark:text-[#f5ecd4]'
                      }`}
                      title={adminRealtimeActive ? 'Click to pause auto-sync' : 'Click to enable real-time auto-sync'}
                    >
                      {adminRealtimeActive ? '● Real-Time: ON' : '○ Real-Time: OFF'}
                    </button>

                    <button
                      type="button"
                      onClick={() => fetchAdminData(false)}
                      disabled={adminLoading}
                      className="px-3 py-1 bg-[#0e4dff] text-white border-2 border-[#1f1a0e] dark:border-[#eedcb4]/40 text-xs font-bold uppercase shadow-[2px_2px_0_#1f1a0e] hover:bg-[#ff4a8a] hover:text-[#1f1a0e] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Fetch live records directly from Supabase"
                    >
                      <RefreshCw size={12} className={adminLoading ? 'animate-spin' : ''} />
                      Sync Now
                    </button>
                  </div>
                </div>

                {/* 1. Metric Overview Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a4f30] block mb-1">Total Registrations</span>
                    <b className="font-['Bowlby_One'] text-3xl text-[#0e4dff]">{adminSignups.length}</b>
                    <small className="block text-[10px] text-[#2a2515] mt-1 font-['Crimson_Pro'] italic">Tested handsets</small>
                  </div>

                  <div className="p-4 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a4f30] block mb-1">Feedback Reviews</span>
                    <b className="font-['Bowlby_One'] text-3xl text-[#ff4a8a]">{adminFeedback.length}</b>
                    <small className="block text-[10px] text-[#2a2515] mt-1 font-['Crimson_Pro'] italic">Audited test reports</small>
                  </div>

                  <div className="p-4 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a4f30] block mb-1">Average Rating</span>
                    <b className="font-['Bowlby_One'] text-3xl text-[#ff7028]">
                      {adminFeedback.length > 0
                        ? (adminFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / adminFeedback.length).toFixed(1)
                        : '5.0'} ★
                    </b>
                    <small className="block text-[10px] text-[#2a2515] mt-1 font-['Crimson_Pro'] italic">Overall satisfaction</small>
                  </div>

                  <div className="p-4 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a4f30] block mb-1">Offline Pending</span>
                    <b className="font-['Bowlby_One'] text-3xl text-[#1f1a0e]">
                      {adminOfflineQueue.signups.length + adminOfflineQueue.feedback.length}
                    </b>
                    <small className="block text-[10px] text-[#2a2515] mt-1 font-['Crimson_Pro'] italic">Browser queue items</small>
                  </div>
                </div>

                {/* Sync notice banner */}
                {adminSyncNotice && (
                  <div className="p-3 bg-[#eedcb4] border-2 border-[#0e4dff] text-[#0e4dff] text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {adminSyncNotice}</span>
                    <button onClick={() => setAdminSyncNotice('')} className="underline text-xs cursor-pointer">Dismiss</button>
                  </div>
                )}

                {/* Sub-nav & Action Bar */}
                <div className="p-4 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[6px_6px_0_#1f1a0e] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setAdminActiveSubTab('analytics')}
                      className={`px-3 py-1.5 border-2 border-[#1f1a0e] text-xs font-bold uppercase transition-all cursor-pointer ${
                        adminActiveSubTab === 'analytics'
                          ? 'bg-[#10b981] text-white shadow-[2px_2px_0_#1f1a0e]'
                          : 'bg-[#eedcb4] text-[#1f1a0e] hover:bg-white'
                      }`}
                    >
                      Visual Analytics
                    </button>
                    <button
                      onClick={() => setAdminActiveSubTab('signups')}
                      className={`px-3 py-1.5 border-2 border-[#1f1a0e] text-xs font-bold uppercase transition-all cursor-pointer ${
                        adminActiveSubTab === 'signups'
                          ? 'bg-[#0e4dff] text-white shadow-[2px_2px_0_#1f1a0e]'
                          : 'bg-[#eedcb4] text-[#1f1a0e] hover:bg-white'
                      }`}
                    >
                      Sign-ups ({adminSignups.length})
                    </button>
                    <button
                      onClick={() => setAdminActiveSubTab('feedback')}
                      className={`px-3 py-1.5 border-2 border-[#1f1a0e] text-xs font-bold uppercase transition-all cursor-pointer ${
                        adminActiveSubTab === 'feedback'
                          ? 'bg-[#ff4a8a] text-[#1f1a0e]'
                          : 'bg-[#eedcb4] text-[#1f1a0e] hover:bg-white'
                      }`}
                    >
                      Reviews & Bugs ({adminFeedback.length})
                    </button>
                    <button
                      onClick={() => setAdminActiveSubTab('offline')}
                      className={`px-3 py-1.5 border-2 border-[#1f1a0e] text-xs font-bold uppercase transition-all cursor-pointer ${
                        adminActiveSubTab === 'offline'
                          ? 'bg-[#ff7028] text-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]'
                          : 'bg-[#eedcb4] text-[#1f1a0e] hover:bg-white'
                      }`}
                    >
                      Offline Queue ({adminOfflineQueue.signups.length + adminOfflineQueue.feedback.length})
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {adminActiveSubTab === 'signups' && (
                      <button
                        onClick={exportSignupsCSV}
                        className="px-3 py-1.5 bg-[#1f1a0e] text-[#f5ecd4] border-2 border-[#1f1a0e] text-xs font-bold uppercase hover:bg-[#0e4dff] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download size={14} /> Export Signups CSV
                      </button>
                    )}
                    {adminActiveSubTab === 'feedback' && (
                      <button
                        onClick={exportFeedbackCSV}
                        className="px-3 py-1.5 bg-[#1f1a0e] text-[#f5ecd4] border-2 border-[#1f1a0e] text-xs font-bold uppercase hover:bg-[#ff4a8a] hover:text-[#1f1a0e] flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download size={14} /> Export Feedback CSV
                      </button>
                    )}
                    {adminActiveSubTab === 'offline' && (
                      <button
                        onClick={syncOfflineQueue}
                        disabled={adminLoading || (!adminOfflineQueue.signups.length && !adminOfflineQueue.feedback.length)}
                        className="px-3 py-1.5 bg-[#ff7028] text-[#1f1a0e] border-2 border-[#1f1a0e] text-xs font-bold uppercase hover:bg-white flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Upload size={14} /> Sync All Offline Items
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-view: Visual Analytics */}
                {adminActiveSubTab === 'analytics' && (
                  <AdminAnalytics signups={adminSignups} feedback={adminFeedback} />
                )}

                {/* Sub-view: Signups */}
                {adminActiveSubTab === 'signups' && (
                  <div className="p-6 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e] space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="relative flex-1 max-w-sm">
                        <input
                          type="text"
                          value={adminSearchQuery}
                          onChange={(e) => setAdminSearchQuery(e.target.value)}
                          placeholder="Search by name, email, or device..."
                          className="w-full p-2 bg-[#f5ecd4] border-2 border-[#1f1a0e] text-xs focus:border-[#0e4dff] focus:outline-none"
                        />
                      </div>
                      <span className="text-xs font-['Crimson_Pro'] italic text-[#5a4f30]">
                        Showing {filteredSignups.length} of {adminSignups.length} entries
                      </span>
                    </div>

                    <div className="overflow-x-auto border-2 border-[#1f1a0e]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#1f1a0e] text-[#f5ecd4] font-['Bowlby_One'] text-[10px] uppercase">
                            <th className="p-2.5 border-r border-[#3a3320]">Date</th>
                            <th className="p-2.5 border-r border-[#3a3320]">Name</th>
                            <th className="p-2.5 border-r border-[#3a3320]">Email Address</th>
                            <th className="p-2.5 border-r border-[#3a3320]">Device Model</th>
                            <th className="p-2.5">Android Target</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y border-t border-[#1f1a0e]">
                          {filteredSignups.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-6 text-center font-['Crimson_Pro'] italic text-sm text-[#5a4f30]">
                                No pilot sign-ups found.
                              </td>
                            </tr>
                          ) : (
                            filteredSignups.map((s, idx) => (
                              <tr key={s.id || idx} className="hover:bg-[#eedcb4]/50 transition-colors">
                                <td className="p-2.5 border-r border-[#1f1a0e]/20 font-mono text-[10px]">
                                  {s.id && (
                                    <span className="mr-1.5 px-1 py-0.5 bg-[#0e4dff]/10 text-[#0e4dff] font-bold border border-[#0e4dff]/30 text-[9px]">
                                      #{s.id}
                                    </span>
                                  )}
                                  {s.created_at ? new Date(s.created_at).toLocaleDateString() : (s.queued_at || 'Recent')}
                                </td>
                                <td className="p-2.5 border-r border-[#1f1a0e]/20 font-bold">{s.name}</td>
                                <td className="p-2.5 border-r border-[#1f1a0e]/20">
                                  <CopyableBadge text={s.email} className="font-mono text-[11px]" />
                                </td>
                                <td className="p-2.5 border-r border-[#1f1a0e]/20 font-semibold">{s.device_model}</td>
                                <td className="p-2.5 font-['Crimson_Pro'] italic">{s.android_version}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sub-view: Feedback */}
                {adminActiveSubTab === 'feedback' && (
                  <div className="p-6 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1f1a0e]">Filter Rating:</span>
                        {['all', 5, 4, 3, 2, 1].map((r) => (
                          <button
                            key={r}
                            onClick={() => setAdminFeedbackRatingFilter(r as any)}
                            className={`px-2 py-0.5 text-xs font-bold border border-[#1f1a0e] uppercase transition-all cursor-pointer ${
                              adminFeedbackRatingFilter === r
                                ? 'bg-[#ff4a8a] text-[#1f1a0e]'
                                : 'bg-[#eedcb4] text-[#1f1a0e] hover:bg-white'
                            }`}
                          >
                            {r === 'all' ? 'All' : `${r}★`}
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-['Crimson_Pro'] italic text-[#5a4f30]">
                        {filteredFeedback.length} reviews matching filter
                      </span>
                    </div>

                    <div className="space-y-3">
                      {filteredFeedback.length === 0 ? (
                        <div className="p-8 text-center font-['Crimson_Pro'] italic text-[#5a4f30] border-2 border-dashed border-[#1f1a0e]">
                          No reviews found matching this filter.
                        </div>
                      ) : (
                        filteredFeedback.map((f, idx) => (
                          <div key={f.id || idx} className="p-4 bg-[#eedcb4]/40 border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] space-y-2">
                            <div className="flex items-center justify-between border-b border-[#1f1a0e]/20 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-[#ff4a8a] text-[#1f1a0e] font-['Bowlby_One'] text-xs border border-[#1f1a0e]">
                                  {f.rating} ★
                                </span>
                                <span className="font-bold text-xs uppercase text-[#1f1a0e]">
                                  {f.tester_device || 'Unspecified Device'}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-[#5a4f30]">
                                {(f.created_at || f.queued_at || '').slice(0, 10)}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                              <div>
                                <strong className="text-[#0e4dff] block mb-0.5 font-bold uppercase tracking-wider text-[10px]">What Worked Well:</strong>
                                <p className="font-['Crimson_Pro'] italic text-[#2a2515]">{f.what_worked}</p>
                              </div>
                              <div>
                                <strong className="text-[#ff4a8a] block mb-0.5 font-bold uppercase tracking-wider text-[10px]">What Broke / Failed:</strong>
                                <p className="font-['Crimson_Pro'] italic text-[#2a2515]">{f.what_broke}</p>
                              </div>
                              <div>
                                <strong className="text-[#ff7028] block mb-0.5 font-bold uppercase tracking-wider text-[10px]">What to Add:</strong>
                                <p className="font-['Crimson_Pro'] italic text-[#2a2515]">{f.what_to_add}</p>
                              </div>
                            </div>

                            <div className="pt-2 text-[10px] text-[#5a4f30] flex flex-wrap items-center justify-between gap-2 border-t border-[#1f1a0e]/10">
                              <div className="flex items-center gap-1">
                                {f.tester_email ? (
                                  <>
                                    <span>Tester:</span>
                                    <CopyableBadge text={f.tester_email} className="font-mono text-[10px]" />
                                  </>
                                ) : (
                                  <span className="font-mono italic text-[10px]">Anonymous Tester</span>
                                )}
                              </div>
                              <FeedbackStatusBadge
                                feedbackId={f.id || idx}
                                testerEmail={f.tester_email}
                                rating={f.rating}
                                whatWorked={f.what_worked}
                                whatBroke={f.what_broke}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-view: Offline Queue Inspector */}
                {adminActiveSubTab === 'offline' && (
                  <div className="p-6 bg-[#f5ecd4] border-3 border-[#1f1a0e] shadow-[8px_8px_0_#1f1a0e] space-y-4">
                    <h3 className="font-['Bowlby_One'] text-base uppercase text-[#1f1a0e]">
                      Local Storage Offline Queue Buffer
                    </h3>
                    <p className="text-xs font-['Crimson_Pro'] italic text-[#5a4f30]">
                      Submissions recorded while disconnected from Supabase or during network interruptions. Stored safely inside browser memory.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-[#eedcb4] border-2 border-[#1f1a0e]">
                        <h4 className="font-bold text-xs uppercase mb-2">Pending Sign-ups ({adminOfflineQueue.signups.length})</h4>
                        {adminOfflineQueue.signups.length === 0 ? (
                          <span className="text-xs font-['Crimson_Pro'] italic text-[#5a4f30]">No pending signups.</span>
                        ) : (
                          <ul className="text-xs space-y-1 font-mono">
                            {adminOfflineQueue.signups.map((s, idx) => (
                              <li key={idx} className="p-1.5 bg-[#f5ecd4] border border-[#1f1a0e]">
                                {s.name} ({s.email}) — {s.deviceModel}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="p-3 bg-[#eedcb4] border-2 border-[#1f1a0e]">
                        <h4 className="font-bold text-xs uppercase mb-2">Pending Feedback ({adminOfflineQueue.feedback.length})</h4>
                        {adminOfflineQueue.feedback.length === 0 ? (
                          <span className="text-xs font-['Crimson_Pro'] italic text-[#5a4f30]">No pending reviews.</span>
                        ) : (
                          <ul className="text-xs space-y-1 font-mono">
                            {adminOfflineQueue.feedback.map((f, idx) => (
                              <li key={idx} className="p-1.5 bg-[#f5ecd4] border border-[#1f1a0e]">
                                {f.rating}★ — {f.what_worked?.slice(0, 30)}...
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </ErrorBoundary>
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
            ref={modalRef}
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
                ref={modalCloseBtnRef}
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

      {/* 2D QR Code Sideloading Modal */}
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        url="https://itzlucifa.github.io/sneha.pilot/assets/sneha-pilot-1.0.1.apk"
        title="Scan to Download SNEHA APK"
      />
    </div>
  );
}
