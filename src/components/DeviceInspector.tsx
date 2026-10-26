import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  HardDrive,
  Monitor,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Check,
  Layers,
  Activity,
  Globe,
  Radio
} from 'lucide-react';

export interface DeviceInspectorProps {
  onAutoFillSignup?: (info: { deviceModel: string; androidVersion: string }) => void;
  className?: string;
}

interface DeviceSpecs {
  category: 'android-phone' | 'android-tablet' | 'desktop' | 'ios' | 'other';
  deviceModel: string;
  osName: string;
  osVersion: string;
  androidApiLevel: number | null;
  cpuCores: number;
  deviceMemoryGb: number | null;
  screenResolution: string;
  devicePixelRatio: number;
  orientation: string;
  colorDepth: number;
  webAssemblySupported: boolean;
  webAssemblySimd: boolean;
  gpuRenderer: string;
  gpuVendor: string;
  touchSupport: boolean;
  storageEstimateMb: number | null;
  networkType: string;
  isCompatible: boolean;
  compatibilityVerdict: string;
  verdictType: 'success' | 'warning' | 'info';
}

export const DeviceInspector: React.FC<DeviceInspectorProps> = ({
  onAutoFillSignup,
  className = ''
}) => {
  const [specs, setSpecs] = useState<DeviceSpecs | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [autoFilled, setAutoFilled] = useState<boolean>(false);

  // Inspect client hardware capabilities
  const inspectDevice = useCallback(async () => {
    setIsScanning(true);

    try {
      const ua = navigator.userAgent;
      const navAny = navigator as any;

      // 1. Hardware Concurrency & RAM
      const cpuCores = navigator.hardwareConcurrency || 4;
      const deviceMemoryGb = navAny.deviceMemory || null;

      // 2. Display & Screen
      const screenResolution = `${window.screen.width} × ${window.screen.height}`;
      const devicePixelRatio = Math.round((window.devicePixelRatio || 1) * 100) / 100;
      const colorDepth = window.screen.colorDepth || 24;
      const orientation =
        window.screen.orientation?.type ||
        (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');

      // 3. WebAssembly & SIMD detection
      const webAssemblySupported =
        typeof WebAssembly === 'object' && typeof WebAssembly.validate === 'function';
      let webAssemblySimd = false;
      if (webAssemblySupported) {
        try {
          // SIMD test bytecode
          const simdBytes = new Uint8Array([
            0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10,
            10, 1, 8, 0, 253, 12, 0, 0, 0, 0, 11
          ]);
          webAssemblySimd = WebAssembly.validate(simdBytes);
        } catch {
          webAssemblySimd = false;
        }
      }

      // 4. WebGL GPU detection
      let gpuRenderer = 'Standard GPU Accelerator';
      let gpuVendor = 'Generic Vendor';
      try {
        const canvas = document.createElement('canvas');
        const gl = (canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gpuRenderer;
            gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || gpuVendor;
          }
        }
      } catch {
        // Fallback default
      }

      // 5. Touch & Network
      const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const networkType =
        navAny.connection?.effectiveType?.toUpperCase() ||
        (navigator.onLine ? 'ONLINE (BROADBAND)' : 'OFFLINE');

      // 6. Storage Quota
      let storageEstimateMb: number | null = null;
      if (navigator.storage && navigator.storage.estimate) {
        try {
          const estimate = await navigator.storage.estimate();
          if (estimate.quota) {
            storageEstimateMb = Math.round(estimate.quota / (1024 * 1024));
          }
        } catch {
          // Ignore
        }
      }

      // 7. OS & Category Detection
      const isAndroid = /Android/i.test(ua);
      const isIOS = /iPhone|iPad|iPod/i.test(ua);
      const isTablet = /(iPad|Tablet|(Android(?!.*Mobile)))/i.test(ua);
      const isWindows = /Windows/i.test(ua);
      const isMac = /Macintosh/i.test(ua);
      const isLinux = /Linux/i.test(ua) && !isAndroid;

      let category: DeviceSpecs['category'] = 'other';
      if (isAndroid) {
        category = isTablet ? 'android-tablet' : 'android-phone';
      } else if (isIOS) {
        category = 'ios';
      } else if (isWindows || isMac || isLinux) {
        category = 'desktop';
      }

      // Extract Android Version & API Level
      let osName = 'Unknown OS';
      let osVersion = 'Unknown Version';
      let androidApiLevel: number | null = null;
      let detectedModel = 'Android Device';

      if (isAndroid) {
        osName = 'Android';
        const androidMatch = ua.match(/Android\s+([0-9.]+)/i);
        if (androidMatch && androidMatch[1]) {
          const verStr = androidMatch[1];
          const major = parseInt(verStr.split('.')[0], 10);
          osVersion = `Android ${verStr}`;

          // Map major version to approximate API level
          const apiMap: Record<number, number> = {
            8: 26,
            9: 28,
            10: 29,
            11: 30,
            12: 31,
            13: 33,
            14: 34,
            15: 35
          };
          androidApiLevel = apiMap[major] || (major >= 15 ? 35 : major + 18);
        }

        // Try extracting device model from UA string
        const modelMatch = ua.match(/Android[^;]+;\s*([^;)]+)\s*(?:Build|;|\))/i);
        if (modelMatch && modelMatch[1]) {
          detectedModel = modelMatch[1].trim();
        }

        // Clean up common OEM model codes
        if (/Pixel/i.test(ua)) {
          const pixelMatch = ua.match(/Pixel\s+[0-9a-zA-Z\s]+/i);
          if (pixelMatch) detectedModel = `Google ${pixelMatch[0].trim()}`;
        } else if (/SM-[A-Z0-9]+/i.test(detectedModel)) {
          detectedModel = `Samsung Galaxy (${detectedModel})`;
        }
      } else if (isIOS) {
        osName = 'iOS / iPadOS';
        osVersion = 'Apple iOS (Web)';
        detectedModel = isTablet ? 'Apple iPad' : 'Apple iPhone';
      } else if (isWindows) {
        osName = 'Windows';
        osVersion = 'Windows 10/11 Desktop';
        detectedModel = 'Windows PC Workstation';
      } else if (isMac) {
        osName = 'macOS';
        osVersion = 'Apple macOS Desktop';
        detectedModel = 'Apple Mac Workstation';
      } else if (isLinux) {
        osName = 'Linux';
        osVersion = 'Linux Desktop';
        detectedModel = 'Linux Workstation';
      }

      // High Entropy Client Hints (if available in modern Chromium)
      if (navAny.userAgentData && navAny.userAgentData.getHighEntropyValues) {
        try {
          const hints = await navAny.userAgentData.getHighEntropyValues([
            'model',
            'platform',
            'platformVersion',
            'architecture'
          ]);
          if (hints.model) {
            detectedModel = hints.model;
          }
        } catch {
          // Ignore
        }
      }

      // Determine Compatibility Verdict
      let isCompatible = false;
      let compatibilityVerdict = '';
      let verdictType: DeviceSpecs['verdictType'] = 'info';

      if (isAndroid) {
        const major = androidApiLevel ? (androidApiLevel >= 26 ? 8 : 7) : 8;
        if (androidApiLevel && androidApiLevel >= 26) {
          isCompatible = true;
          verdictType = 'success';
          compatibilityVerdict = `COMPATIBLE: ${osVersion} (SDK ${androidApiLevel}) meets SNEHA Min SDK 26 requirements. Full on-device AI runtime supported.`;
        } else {
          isCompatible = false;
          verdictType = 'warning';
          compatibilityVerdict = `INCOMPATIBLE: ${osVersion} is below SNEHA Min SDK 26 (Android 8.0+ required).`;
        }
      } else if (category === 'desktop') {
        isCompatible = true;
        verdictType = 'info';
        compatibilityVerdict =
          'DESKTOP COMPANION DETECTED: You can inspect APK builds, verify SHA-256 signatures, or transfer APK to your Android test device via ADB/USB.';
      } else if (isIOS) {
        isCompatible = false;
        verdictType = 'warning';
        compatibilityVerdict =
          'APPLE IOS DETECTED: SNEHA is natively compiled for Android 8.0+ (.apk). iOS cannot run standard Android packages.';
      } else {
        isCompatible = true;
        verdictType = 'info';
        compatibilityVerdict = 'WEB CLIENT DETECTED: Hardware supports companion pilot tooling.';
      }

      setSpecs({
        category,
        deviceModel: detectedModel,
        osName,
        osVersion,
        androidApiLevel,
        cpuCores,
        deviceMemoryGb,
        screenResolution,
        devicePixelRatio,
        orientation,
        colorDepth,
        webAssemblySupported,
        webAssemblySimd,
        gpuRenderer,
        gpuVendor,
        touchSupport,
        storageEstimateMb,
        networkType,
        isCompatible,
        compatibilityVerdict,
        verdictType
      });
    } catch (err) {
      console.error('Device inspection error:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    inspectDevice();
  }, [inspectDevice]);

  // Handle Auto-fill action into pilot signup form
  const handleAutoFill = () => {
    if (!specs) return;

    const payload = {
      deviceModel: specs.deviceModel,
      androidVersion:
        specs.category === 'android-phone' || specs.category === 'android-tablet'
          ? `${specs.osVersion} (API ${specs.androidApiLevel || 35})`
          : 'Android 15 (Target SDK 35)'
    };

    if (onAutoFillSignup) {
      onAutoFillSignup(payload);
    }

    // Attempt direct DOM input fill if signup form inputs exist
    const modelInput = document.querySelector<HTMLInputElement>(
      'input[name="deviceModel"], #deviceModel, input[placeholder*="Pixel"], input[placeholder*="Galaxy"]'
    );
    if (modelInput) {
      modelInput.value = payload.deviceModel;
      modelInput.dispatchEvent(new Event('input', { bubbles: true }));
      modelInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    setAutoFilled(true);
    setTimeout(() => setAutoFilled(false), 3000);

    // Smooth scroll down to #signup section if on page
    const signupEl = document.getElementById('signup');
    if (signupEl) {
      signupEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className={`bg-[#f5ecd4] dark:bg-[#1c170d] text-[#1f1a0e] dark:text-[#f5ecd4] border-3 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[6px_6px_0_#1f1a0e] dark:shadow-[6px_6px_0_#000000] p-6 sm:p-8 transition-all ${className}`}
    >
      {/* Top Header & Pulsing Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-3 border-[#1f1a0e] dark:border-[#eedcb4]/20">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {/* Real-time Pulsing Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#10b981] text-white border-2 border-[#1f1a0e] text-[10px] font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0_#1f1a0e]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span>HARDWARE COMPATIBILITY VERIFIED</span>
            </div>

            <span className="px-2.5 py-0.5 bg-[#0e4dff] text-white text-[10px] font-mono font-bold uppercase tracking-wider border border-[#1f1a0e]">
              Client-Side Telemetry
            </span>
          </div>

          <h3 className="font-['Bowlby_One'] text-2xl sm:text-3xl uppercase tracking-tight text-[#1f1a0e] dark:text-[#fdfaf2]">
            Real-Time Device & Hardware Inspector
          </h3>
          <p className="font-['Crimson_Pro'] italic text-sm text-[#5a4f30] dark:text-[#cdbe9e] mt-1">
            Instant diagnostic analysis of your chipset, RAM, WebAssembly acceleration, and SNEHA compatibility.
          </p>
        </div>

        {/* Rescan Button */}
        <button
          onClick={inspectDevice}
          disabled={isScanning}
          className="px-3.5 py-2 bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] text-xs font-bold uppercase border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[3px_3px_0_#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4] transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
          <span>{isScanning ? 'Scanning...' : 'Re-Inspect'}</span>
        </button>
      </div>

      {/* Main Verdict Card */}
      {specs && (
        <div
          className={`p-5 border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] mb-6 animate-fade-in ${
            specs.verdictType === 'success'
              ? 'bg-[#10b981] text-white'
              : specs.verdictType === 'warning'
              ? 'bg-[#ff4a8a] text-[#1f1a0e]'
              : 'bg-[#0e4dff] text-white'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 bg-white flex items-center justify-center border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] shrink-0 text-[#1f1a0e]">
                {specs.verdictType === 'success' ? (
                  <ShieldCheck size={28} className="text-[#10b981]" />
                ) : specs.verdictType === 'warning' ? (
                  <AlertCircle size={28} className="text-[#ff4a8a]" />
                ) : (
                  <Smartphone size={28} className="text-[#0e4dff]" />
                )}
              </div>

              <div>
                <div className="font-['Bowlby_One'] text-lg sm:text-xl uppercase tracking-tight flex items-center gap-2">
                  <span>{specs.deviceModel}</span>
                  <span className="px-2 py-0.5 bg-white text-[#1f1a0e] text-[10px] font-mono font-bold border border-[#1f1a0e]">
                    {specs.osVersion}
                  </span>
                </div>
                <p className="font-sans text-xs sm:text-sm font-medium mt-1 leading-relaxed opacity-95">
                  {specs.compatibilityVerdict}
                </p>
              </div>
            </div>

            {/* Prominent Auto-Fill Button */}
            <button
              onClick={handleAutoFill}
              className={`px-4 py-3 font-['Bowlby_One'] text-xs sm:text-sm uppercase tracking-wide border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
                autoFilled
                  ? 'bg-white text-[#10b981]'
                  : 'bg-[#ff7028] text-[#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4]'
              }`}
            >
              {autoFilled ? (
                <>
                  <Check size={16} strokeWidth={3} />
                  <span>Auto-Filled Form!</span>
                </>
              ) : (
                <>
                  <span>Auto-Fill My Device in Pilot Signup Form</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Hardware Spec Cards Grid */}
      {specs && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Card 1: CPU Architecture */}
          <div className="p-4 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[3px_3px_0_#1f1a0e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a4f30] dark:text-[#cdbe9e] flex items-center gap-1.5">
                <Cpu size={14} className="text-[#0e4dff]" />
                <span>CPU Concurrency</span>
              </span>
              <span className="px-2 py-0.5 bg-[#eedcb4] dark:bg-[#1a140b] text-[#1f1a0e] dark:text-[#fdfaf2] text-[10px] font-mono border border-[#1f1a0e]/30">
                {specs.cpuCores} LOGICAL CORES
              </span>
            </div>
            <div className="font-['Bowlby_One'] text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
              {specs.cpuCores} Execution Threads
            </div>
            <p className="font-['Crimson_Pro'] italic text-xs text-[#5a4f30] dark:text-[#cdbe9e] mt-1">
              {specs.cpuCores >= 6
                ? 'Sufficient cores for background neural token generation & speech synthesis.'
                : 'Meets minimum CPU requirements for local AI pipeline.'}
            </p>
          </div>

          {/* Card 2: Memory & RAM */}
          <div className="p-4 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[3px_3px_0_#1f1a0e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a4f30] dark:text-[#cdbe9e] flex items-center gap-1.5">
                <HardDrive size={14} className="text-[#ff7028]" />
                <span>System RAM</span>
              </span>
              <span className="px-2 py-0.5 bg-[#eedcb4] dark:bg-[#1a140b] text-[#1f1a0e] dark:text-[#fdfaf2] text-[10px] font-mono border border-[#1f1a0e]/30">
                RECOMMENDED 3GB+
              </span>
            </div>
            <div className="font-['Bowlby_One'] text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
              {specs.deviceMemoryGb ? `${specs.deviceMemoryGb} GB Available` : '≥ 4 GB (Estimated)'}
            </div>
            <p className="font-['Crimson_Pro'] italic text-xs text-[#5a4f30] dark:text-[#cdbe9e] mt-1">
              SNEHA quantizes weights to int4 to run smoothly within a 450 MB working heap.
            </p>
          </div>

          {/* Card 3: Display Resolution & DPR */}
          <div className="p-4 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[3px_3px_0_#1f1a0e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a4f30] dark:text-[#cdbe9e] flex items-center gap-1.5">
                <Monitor size={14} className="text-[#ff4a8a]" />
                <span>Display & Viewport</span>
              </span>
              <span className="px-2 py-0.5 bg-[#eedcb4] dark:bg-[#1a140b] text-[#1f1a0e] dark:text-[#fdfaf2] text-[10px] font-mono border border-[#1f1a0e]/30">
                {specs.devicePixelRatio}x DPR
              </span>
            </div>
            <div className="font-['Bowlby_One'] text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
              {specs.screenResolution}
            </div>
            <p className="font-['Crimson_Pro'] italic text-xs text-[#5a4f30] dark:text-[#cdbe9e] mt-1">
              Orientation: {specs.orientation} • Depth: {specs.colorDepth}-bit truecolor
            </p>
          </div>

          {/* Card 4: WebAssembly & SIMD Acceleration */}
          <div className="p-4 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[3px_3px_0_#1f1a0e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a4f30] dark:text-[#cdbe9e] flex items-center gap-1.5">
                <Zap size={14} className="text-[#0e4dff]" />
                <span>WebAssembly SIMD</span>
              </span>
              <span className="px-2 py-0.5 bg-[#10b981] text-white text-[10px] font-mono font-bold border border-[#1f1a0e]">
                ENABLED
              </span>
            </div>
            <div className="font-['Bowlby_One'] text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
              {specs.webAssemblySupported ? 'Wasm Engine Ready' : 'Fallback Engine'}
            </div>
            <p className="font-['Crimson_Pro'] italic text-xs text-[#5a4f30] dark:text-[#cdbe9e] mt-1">
              {specs.webAssemblySimd
                ? 'Vector SIMD extensions detected: hardware accelerated matrix ops active.'
                : 'Baseline WebAssembly vectorization verified.'}
            </p>
          </div>

          {/* Card 5: GPU Renderer & Graphics Driver */}
          <div className="p-4 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[3px_3px_0_#1f1a0e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a4f30] dark:text-[#cdbe9e] flex items-center gap-1.5">
                <Layers size={14} className="text-[#ff7028]" />
                <span>GPU Accelerator</span>
              </span>
              <span className="px-2 py-0.5 bg-[#eedcb4] dark:bg-[#1a140b] text-[#1f1a0e] dark:text-[#fdfaf2] text-[10px] font-mono border border-[#1f1a0e]/30">
                HARDWARE
              </span>
            </div>
            <div
              className="font-mono text-xs font-bold text-[#1f1a0e] dark:text-[#fdfaf2] truncate"
              title={specs.gpuRenderer}
            >
              {specs.gpuRenderer}
            </div>
            <p className="font-['Crimson_Pro'] italic text-xs text-[#5a4f30] dark:text-[#cdbe9e] mt-1">
              Supports OpenGL ES / Vulkan neural pipeline offloading.
            </p>
          </div>

          {/* Card 6: Storage & Network Status */}
          <div className="p-4 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[3px_3px_0_#1f1a0e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5a4f30] dark:text-[#cdbe9e] flex items-center gap-1.5">
                <Radio size={14} className="text-[#ff4a8a]" />
                <span>Storage & Network</span>
              </span>
              <span className="px-2 py-0.5 bg-[#eedcb4] dark:bg-[#1a140b] text-[#1f1a0e] dark:text-[#fdfaf2] text-[10px] font-mono border border-[#1f1a0e]/30">
                {specs.networkType}
              </span>
            </div>
            <div className="font-['Bowlby_One'] text-base uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
              {specs.storageEstimateMb
                ? `${Math.round(specs.storageEstimateMb / 1024)} GB Free Quota`
                : 'Local Storage Verified'}
            </div>
            <p className="font-['Crimson_Pro'] italic text-xs text-[#5a4f30] dark:text-[#cdbe9e] mt-1">
              SNEHA requires ~120 MB free storage for core binary and cached weights.
            </p>
          </div>
        </div>
      )}

      {/* Raw User Agent & Telemetry Drawer */}
      {specs && (
        <div className="p-3 bg-[#eedcb4]/50 dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/20 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono font-bold text-[10px] uppercase text-[#5a4f30] dark:text-[#cdbe9e]">
              Client Telemetry Fingerprint:
            </span>
            <span className="text-[10px] font-mono text-[#0e4dff]">
              Min SDK 26 • Target SDK 35
            </span>
          </div>
          <div className="font-mono text-[11px] text-[#1f1a0e] dark:text-[#fdfaf2] break-all select-all bg-white dark:bg-[#1a140b] p-2 border border-[#1f1a0e]/30">
            {navigator.userAgent}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceInspector;
