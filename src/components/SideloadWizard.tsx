import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ExternalLink,
  ShieldAlert,
  Sliders,
  RotateCcw,
  Search,
  Sparkles,
  Download,
  Info,
  Check,
  Layers,
  Cpu
} from 'lucide-react';

export interface SideloadWizardProps {
  className?: string;
  defaultVersion?: 'android-14-15' | 'android-12-13' | 'android-8-11';
  defaultOem?: 'pixel' | 'samsung' | 'xiaomi' | 'oneplus';
}

type AndroidVersionKey = 'android-14-15' | 'android-12-13' | 'android-8-11';
type OemKey = 'pixel' | 'samsung' | 'xiaomi' | 'oneplus';

interface StepInfo {
  id: string;
  number: string;
  title: string;
  description: string;
  settingsPath: string;
  note?: string;
  mockupType?: 'play-protect' | 'source-toggle' | 'samsung-blocker' | 'xiaomi-timer' | 'package-installer';
}

interface TroubleshootingItem {
  id: string;
  title: string;
  tags: string[];
  symptom: string;
  cause: string;
  solution: string[];
}

const OS_TABS = [
  { id: 'android-14-15' as AndroidVersionKey, label: 'Android 14 & 15', badge: 'API 34-35 (Target)' },
  { id: 'android-12-13' as AndroidVersionKey, label: 'Android 12 & 13', badge: 'API 31-33' },
  { id: 'android-8-11' as AndroidVersionKey, label: 'Android 8.0 - 11', badge: 'API 26-30 (Min SDK)' }
];

const OEM_TABS = [
  { id: 'pixel' as OemKey, label: 'Google Pixel' },
  { id: 'samsung' as OemKey, label: 'Samsung Galaxy (One UI)' },
  { id: 'xiaomi' as OemKey, label: 'Xiaomi / Poco (HyperOS)' },
  { id: 'oneplus' as OemKey, label: 'OnePlus / OxygenOS' }
];

const TROUBLESHOOTING_GUIDES: TroubleshootingItem[] = [
  {
    id: 'play-protect-blocked',
    title: 'Blocked by Google Play Protect / "Unsafe App Blocked"',
    tags: ['Play Protect', 'Google', 'Pixel', 'Security'],
    symptom: 'A full-screen red or orange modal appears stating "Blocked by Play Protect - SNEHA is an unrecognized app".',
    cause: 'SNEHA is an unreleased internal pilot build distributed outside the Google Play Store, so Play Protect triggers its standard precaution prompt for new developer binaries.',
    solution: [
      'On the Play Protect dialog, look for the small "More details" dropdown link (do NOT tap "OK").',
      'Tap "More details" to reveal the hidden developer bypass link.',
      'Tap "Install anyway (unsafe)" to proceed with installation.',
      'Optional: If blocked entirely, open Google Play Store > Profile Icon > Play Protect > Gear Icon (Settings) > temporarily toggle off "Scan apps with Play Protect".'
    ]
  },
  {
    id: 'samsung-auto-blocker',
    title: 'Samsung Auto Blocker Prevents Sideloading (One UI 6 & 7)',
    tags: ['Samsung', 'One UI', 'Galaxy S23/S24'],
    symptom: 'Tapping the APK shows "Auto Blocker is on. To install this app, turn off Auto Blocker in Settings".',
    cause: 'Samsung introduced Auto Blocker in One UI 6 (Android 14) which actively prevents all APK sideloading outside Samsung Galaxy Store and Google Play.',
    solution: [
      'Open Settings on your Samsung Galaxy device.',
      'Navigate to "Security and privacy" > "Auto Blocker".',
      'Toggle the main switch to OFF (you will need to verify your PIN or fingerprint).',
      'Return to My Files or Chrome Downloads and tap sneha-v1.0.2-release.apk again to install.',
      'You may re-enable Auto Blocker after SNEHA installation is complete.'
    ]
  },
  {
    id: 'app-not-installed',
    title: '"App Not Installed" or Package Signature Conflict',
    tags: ['Conflict', 'Signature', 'Keystore'],
    symptom: 'Installation finishes with an error message: "App not installed as package appears to be invalid" or "conflicts with an existing package".',
    cause: 'You already have an older preview or debug build of SNEHA (com.sneha.app) installed on your device that was signed with a different debug keystore.',
    solution: [
      'Go to device Settings > Apps > SNEHA (or search for SNEHA on your home screen).',
      'Tap "Uninstall" to completely remove the old version.',
      'Reboot your device or clear Package Installer cache if prompted.',
      'Re-open the downloaded sneha-v1.0.2-release.apk and tap Install.'
    ]
  },
  {
    id: 'parse-error',
    title: '"Parse Error: There was a problem parsing the package"',
    tags: ['Parse Error', 'Android Version', 'Min SDK'],
    symptom: 'Tapping the APK immediately displays "Parse error: There was a problem parsing the package" before any install screen appears.',
    cause: 'Either your Android OS version is below the minimum required SDK (Android 8.0 Oreo / SDK 26), or the APK file was only partially downloaded due to network interruption.',
    solution: [
      'Verify your Android version: Settings > About phone > Android version. SNEHA requires Android 8.0 or newer.',
      'Check file size: sneha-v1.0.2-release.apk should be ~48-52 MB.',
      'Use the Checksum Validator tool on this site to confirm the SHA-256 fingerprint.',
      'Delete the partial file from your Downloads folder and re-download over a stable Wi-Fi connection.'
    ]
  },
  {
    id: 'xiaomi-countdown',
    title: 'Xiaomi / Poco 10-Second Risk Warning Dialog',
    tags: ['Xiaomi', 'MIUI', 'HyperOS', 'Poco'],
    symptom: 'Xiaomi displays a high-risk full-screen warning with a 10-second countdown timer blocking the "OK" button.',
    cause: 'HyperOS / MIUI imposes mandatory wait times for third-party APK permissions to prevent accidental user clicks.',
    solution: [
      'Wait for the 10-second countdown timer to reach 0.',
      'Check the disclaimer box: "I am aware of the possible risks and assume all consequences voluntarily".',
      'Tap the now-enabled "OK" / "Confirm" button.',
      'Tap Back to return to installation.'
    ]
  }
];

export const SideloadWizard: React.FC<SideloadWizardProps> = ({
  className = '',
  defaultVersion = 'android-14-15',
  defaultOem = 'pixel'
}) => {
  const [selectedVersion, setSelectedVersion] = useState<AndroidVersionKey>(defaultVersion);
  const [selectedOem, setSelectedOem] = useState<OemKey>(defaultOem);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [openTroubleshootId, setOpenTroubleshootId] = useState<string | null>('play-protect-blocked');
  const [troubleshootSearch, setTroubleshootSearch] = useState<string>('');
  const [simulatedDetailsExpanded, setSimulatedDetailsExpanded] = useState<boolean>(false);

  // Generate steps based on version & OEM
  const steps: StepInfo[] = React.useMemo(() => {
    if (selectedVersion === 'android-14-15') {
      const oemSpecifics: Record<OemKey, { path: string; note: string; mockup: StepInfo['mockupType'] }> = {
        pixel: {
          path: 'Settings > Apps > Special app access > Install unknown apps > Chrome > "Allow from this source"',
          note: 'Google Pixel runs pure Android. Play Protect will show a bottom sheet banner on first install.',
          mockup: 'play-protect'
        },
        samsung: {
          path: 'Settings > Security and privacy > Auto Blocker > Turn OFF, then Settings > Apps > Special access > Install unknown apps',
          note: 'Samsung One UI 6 & 7: You must temporarily disable "Auto Blocker" to install third-party developer APKs.',
          mockup: 'samsung-blocker'
        },
        xiaomi: {
          path: 'Settings > Apps > Manage apps > Chrome > Install apps from unknown sources > Allow',
          note: 'HyperOS will present a 10-second safety countdown. Check the acknowledgment box once timer elapses.',
          mockup: 'xiaomi-timer'
        },
        oneplus: {
          path: 'Settings > Security & privacy > More security settings > Installation sources > Toggle Chrome ON',
          note: 'OxygenOS will perform a rapid security scan before revealing the install button.',
          mockup: 'source-toggle'
        }
      };

      const currentOem = oemSpecifics[selectedOem];

      return [
        {
          id: 'step-1',
          number: '01',
          title: 'Download Official SNEHA APK Build',
          description: 'Download sneha-v1.0.2-release.apk using Google Chrome or your device default browser. Save the file directly to your local device Downloads folder.',
          settingsPath: 'Browser: Downloads → sneha-v1.0.2-release.apk',
          note: 'Recommended: Check the SHA-256 fingerprint in the Checksum Validator before installing.',
          mockupType: 'package-installer'
        },
        {
          id: 'step-2',
          number: '02',
          title: `Enable "Install Unknown Apps" for ${selectedOem === 'samsung' ? 'One UI' : 'Browser'}`,
          description: `Android 14 & 15 require granular per-app sideload permissions. Authorize the browser or file manager that holds the APK.`,
          settingsPath: currentOem.path,
          note: currentOem.note,
          mockupType: currentOem.mockup
        },
        {
          id: 'step-3',
          number: '03',
          title: 'Bypass Google Play Protect Warning Sheet',
          description: 'When tapping Install, Google Play Protect will flag SNEHA as an unrecognized pilot developer build.',
          settingsPath: 'Dialog: Tap "More details" → Tap "Install anyway (unsafe)"',
          note: 'Do NOT tap "OK" or "Got it" as that will abort the installation and delete the cached installer.',
          mockupType: 'play-protect'
        },
        {
          id: 'step-4',
          number: '04',
          title: 'Launch SNEHA & Complete Onboarding',
          description: 'Tap "Open". On first launch, SNEHA will initialize its local on-device neural weights. Grant Microphone and Accessibility permissions if prompted for offline voice assistant workflows.',
          settingsPath: 'App Drawer: SNEHA → Welcome to Pilot Edition',
          note: 'All voice synthesis and speech recognition run 100% locally on your device without cloud telemetry.',
          mockupType: 'package-installer'
        }
      ];
    } else if (selectedVersion === 'android-12-13') {
      return [
        {
          id: 'step-1',
          number: '01',
          title: 'Download APK to Local Storage',
          description: 'Download sneha-v1.0.2-release.apk to your Android 12 or 13 device. Look for the download notification in your notification tray.',
          settingsPath: 'Downloads → sneha-v1.0.2-release.apk',
          mockupType: 'package-installer'
        },
        {
          id: 'step-2',
          number: '02',
          title: 'Grant "Allow From This Source" Permission',
          description: 'Tap the downloaded file. Chrome will prompt: "For your security, your phone is not allowed to install unknown apps from this source".',
          settingsPath: 'Tap Settings on prompt → Toggle "Allow from this source" to ON → Press Back button',
          note: 'This permission is tied specifically to Chrome and only needs to be granted once.',
          mockupType: 'source-toggle'
        },
        {
          id: 'step-3',
          number: '03',
          title: 'Confirm Package Installer Dialog',
          description: 'The standard Android Package Installer will open asking "Do you want to install this app?". Tap Install.',
          settingsPath: 'Package Installer → Install',
          mockupType: 'package-installer'
        },
        {
          id: 'step-4',
          number: '04',
          title: 'Verify & Launch SNEHA',
          description: 'Once installed, tap Open or locate SNEHA in your app drawer. You are now running SNEHA Pilot Edition.',
          settingsPath: 'App Drawer → SNEHA',
          mockupType: 'package-installer'
        }
      ];
    } else {
      // Android 8.0 - 11
      return [
        {
          id: 'step-1',
          number: '01',
          title: 'Download SNEHA Package',
          description: 'Download the APK file onto your Android 8.0 - 11 device (Oreo, Pie, Android 10, or Android 11). SNEHA minimum SDK is 26 (Android 8.0).',
          settingsPath: 'Browser → Downloads folder',
          mockupType: 'package-installer'
        },
        {
          id: 'step-2',
          number: '02',
          title: 'Enable Unknown Sources in System Settings',
          description: 'On Android 8-11, navigate to Settings and enable installation permission for your File Manager or Browser.',
          settingsPath: 'Settings → Apps & Notifications → Special app access → Install unknown apps',
          note: 'On older Android 8.0 skins, this can also be found under Settings > Security > Unknown Sources.',
          mockupType: 'source-toggle'
        },
        {
          id: 'step-3',
          number: '03',
          title: 'Run Package Installer',
          description: 'Open your File Manager or Downloads app, locate sneha-v1.0.2-release.apk, and tap it to launch the Android Package Installer.',
          settingsPath: 'Files / Downloads → sneha-v1.0.2-release.apk → Install',
          mockupType: 'package-installer'
        },
        {
          id: 'step-4',
          number: '04',
          title: 'App Installed Successfully',
          description: 'Tap Open to start SNEHA. SNEHA is optimized for Android 8.0+ devices with 2GB+ RAM.',
          settingsPath: 'App Drawer → SNEHA',
          mockupType: 'package-installer'
        }
      ];
    }
  }, [selectedVersion, selectedOem]);

  // Step toggle handler
  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const resetProgress = () => {
    setCompletedSteps({});
  };

  const completedCount = steps.filter((s) => completedSteps[s.id]).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  // Filtered troubleshooting guides
  const filteredTroubleshoot = TROUBLESHOOTING_GUIDES.filter((item) => {
    if (!troubleshootSearch.trim()) return true;
    const q = troubleshootSearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.symptom.toLowerCase().includes(q) ||
      item.cause.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className={`bg-[#f5ecd4] dark:bg-[#1c170d] text-[#1f1a0e] dark:text-[#f5ecd4] border-3 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[6px_6px_0_#1f1a0e] dark:shadow-[6px_6px_0_#000000] p-4 sm:p-6 lg:p-8 transition-all overflow-hidden ${className}`}
    >
      {/* Top Header & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-3 border-[#1f1a0e] dark:border-[#eedcb4]/20">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-[#ff7028] text-[#1f1a0e] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#1f1a0e]">
              Tester Onboarding Guide
            </span>
            <span className="px-2.5 py-0.5 bg-[#0e4dff] text-white text-[10px] font-mono font-bold uppercase tracking-wider border border-[#1f1a0e]">
              OEM-Specific Instructions
            </span>
          </div>
          <h3 className="font-['Bowlby_One'] text-xl sm:text-3xl uppercase tracking-tight text-[#1f1a0e] dark:text-[#fdfaf2] break-words">
            Interactive Android Sideload Wizard
          </h3>
          <p className="font-['Crimson_Pro'] italic text-xs sm:text-sm text-[#5a4f30] dark:text-[#cdbe9e] mt-1">
            Foolproof step-by-step walkthrough for sideloading SNEHA APK across Android versions & manufacturer skins.
          </p>
        </div>

        {/* Progress Pill & Reset */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[2px_2px_0_#1f1a0e] text-xs font-mono font-bold text-[#1f1a0e] dark:text-[#fdfaf2]">
            {completedCount}/{steps.length} COMPLETED ({progressPercent}%)
          </div>
          {completedCount > 0 && (
            <button
              onClick={resetProgress}
              title="Reset progress"
              className="p-1.5 bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[2px_2px_0_#1f1a0e] hover:bg-[#ff4a8a] transition-all cursor-pointer"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-3 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] overflow-hidden">
          <div
            className="h-full bg-[#10b981] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {progressPercent === 100 && (
          <div className="mt-2 p-2 bg-[#10b981] text-white border-2 border-[#1f1a0e] text-xs font-['Bowlby_One'] uppercase tracking-wider text-center animate-fade-in flex items-center justify-center gap-2">
            <Sparkles size={16} />
            <span>ALL STEPS COMPLETED • SNEHA IS READY TO USE!</span>
          </div>
        )}
      </div>

      {/* Primary Filter Tabs: Android OS Version */}
      <div className="mb-4">
        <label className="text-xs font-bold uppercase tracking-wider text-[#1f1a0e] dark:text-[#fdfaf2] block mb-2 flex items-center gap-1.5">
          <Sliders size={14} className="text-[#0e4dff]" />
          <span>Select Your Android OS Version:</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {OS_TABS.map((tab) => {
            const isSelected = selectedVersion === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedVersion(tab.id)}
                className={`p-3 text-left border-2 border-[#1f1a0e] transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0e4dff] text-white shadow-[4px_4px_0_#1f1a0e]'
                    : 'bg-[#eedcb4]/60 dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] hover:bg-white dark:hover:bg-[#342a1a] shadow-[2px_2px_0_#1f1a0e]'
                }`}
              >
                <div className="font-['Bowlby_One'] text-sm uppercase">{tab.label}</div>
                <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#5a4f30] dark:text-[#cdbe9e]'}`}>
                  {tab.badge}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filter Tabs: Manufacturer / OEM Skin */}
      <div className="mb-6">
        <label className="text-xs font-bold uppercase tracking-wider text-[#1f1a0e] dark:text-[#fdfaf2] block mb-2 flex items-center gap-1.5">
          <Smartphone size={14} className="text-[#ff7028]" />
          <span>Select Device Manufacturer / Skin:</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {OEM_TABS.map((oem) => {
            const isSelected = selectedOem === oem.id;
            return (
              <button
                key={oem.id}
                onClick={() => setSelectedOem(oem.id)}
                className={`p-2.5 text-center border-2 border-[#1f1a0e] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#ff4a8a] text-[#1f1a0e] font-bold shadow-[3px_3px_0_#1f1a0e]'
                    : 'bg-white dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] hover:bg-[#eedcb4] dark:hover:bg-[#342a1a] shadow-[2px_2px_0_#1f1a0e]'
                }`}
              >
                {oem.id === 'pixel' && <Smartphone size={13} className="shrink-0" />}
                {oem.id === 'samsung' && <Layers size={13} className="shrink-0" />}
                {oem.id === 'xiaomi' && <Cpu size={13} className="shrink-0" />}
                {oem.id === 'oneplus' && <Sparkles size={13} className="shrink-0" />}
                <span className="text-xs font-bold uppercase tracking-tight">{oem.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Cards List */}
      <div className="space-y-4 mb-8">
        {steps.map((step) => {
          const isDone = !!completedSteps[step.id];

          return (
            <div
              key={step.id}
              className={`p-5 border-3 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[4px_4px_0_#1f1a0e] transition-all ${
                isDone
                  ? 'bg-[#10b981]/10 dark:bg-[#10b981]/15 border-[#10b981]'
                  : 'bg-white dark:bg-[#1a140b]'
              }`}
            >
              {/* Step Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2.5 py-1 text-xs font-['Bowlby_One'] uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] ${
                      isDone
                        ? 'bg-[#10b981] text-white'
                        : 'bg-[#0e4dff] text-white'
                    }`}
                  >
                    STEP {step.number}
                  </span>
                  <h4 className="font-['Bowlby_One'] text-base sm:text-lg uppercase tracking-tight text-[#1f1a0e] dark:text-[#fdfaf2]">
                    {step.title}
                  </h4>
                </div>

                {/* Interactive Checkbox */}
                <button
                  onClick={() => toggleStep(step.id)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] flex items-center gap-1.5 cursor-pointer transition-all ${
                    isDone
                      ? 'bg-[#10b981] text-white'
                      : 'bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] hover:bg-[#ff7028] hover:text-[#1f1a0e]'
                  }`}
                >
                  {isDone ? (
                    <>
                      <Check size={14} strokeWidth={3} />
                      <span>Completed</span>
                    </>
                  ) : (
                    <span>Mark Done</span>
                  )}
                </button>
              </div>

              {/* Description */}
              <p className="font-sans text-xs sm:text-sm text-[#2a2515] dark:text-[#e8deca] leading-relaxed mb-3">
                {step.description}
              </p>

              {/* Settings Breadcrumbs Path */}
              <div className="p-2.5 bg-[#eedcb4]/50 dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/20 font-mono text-xs text-[#1f1a0e] dark:text-[#fdfaf2] mb-3 flex items-center gap-2">
                <span className="text-[#0e4dff] font-bold">PATH:</span>
                <span className="font-medium">{step.settingsPath}</span>
              </div>

              {/* Note / Pro-tip */}
              {step.note && (
                <div className="text-xs font-['Crimson_Pro'] italic text-[#5a4f30] dark:text-[#cdbe9e] mb-3">
                  <strong>Note:</strong> {step.note}
                </div>
              )}

              {/* Realistic Android Dialog Mockup */}
              {step.mockupType === 'play-protect' && (
                <div className="mt-3 p-4 bg-[#202124] text-white border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                  <div className="flex items-center gap-2 text-[#f28b82] mb-2">
                    <ShieldAlert size={18} />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Google Play Protect Dialog Simulation
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mb-1">
                    Blocked by Play Protect
                  </div>
                  <div className="text-xs text-gray-300 mb-3">
                    SNEHA is recognized as an unverified developer build. Sideloading apps from unknown developers may pose risks.
                  </div>

                  {/* Expandable details link */}
                  <div className="border-t border-gray-700 pt-2">
                    <button
                      onClick={() => setSimulatedDetailsExpanded(!simulatedDetailsExpanded)}
                      className="text-xs text-[#8ab4f8] hover:underline flex items-center gap-1 cursor-pointer mb-2"
                    >
                      <span>More details</span>
                      {simulatedDetailsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {simulatedDetailsExpanded ? (
                      <div className="p-2 bg-[#2d2e30] border border-gray-600 mb-3 text-[11px] text-gray-300">
                        Package: com.sneha.app • Developer: SNEHA Release Team • Signature: Pilot Test Keystore
                        <div className="mt-2">
                          <span className="inline-block px-3 py-1 bg-[#d93025] text-white font-bold text-xs rounded-sm cursor-default">
                            Install anyway (unsafe)
                          </span>
                          <span className="text-[10px] text-gray-400 ml-2">← TAP THIS BUTTON</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 italic block mb-2">
                        (Tap "More details" above to reveal the hidden "Install anyway" button)
                      </span>
                    )}

                    <div className="flex justify-end gap-2">
                      <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-sm">
                        OK
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {step.mockupType === 'samsung-blocker' && (
                <div className="mt-3 p-4 bg-[#1e232d] text-white border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                  <div className="flex items-center gap-2 text-[#ff7028] mb-1">
                    <AlertTriangle size={18} />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Samsung One UI 6 & 7 "Auto Blocker" Warning
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1 mb-2">
                    "Auto Blocker is on. To install this app, turn off Auto Blocker in Settings &gt; Security and privacy &gt; Auto Blocker."
                  </div>
                  <div className="p-2 bg-[#2a303e] border border-gray-600 text-[11px] text-[#8ab4f8] font-mono">
                    Fix: Settings → Security and privacy → Auto Blocker → Toggle [ OFF ]
                  </div>
                </div>
              )}

              {step.mockupType === 'xiaomi-timer' && (
                <div className="mt-3 p-4 bg-[#231b1b] text-white border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e]">
                  <div className="flex items-center gap-2 text-[#ff4a8a] mb-1">
                    <ShieldAlert size={18} />
                    <span className="text-xs font-bold uppercase tracking-wide">
                      Xiaomi / HyperOS Security Warning
                    </span>
                  </div>
                  <div className="text-xs text-gray-300 mb-2">
                    "Installing apps from unknown sources may endanger your device..."
                  </div>
                  <div className="p-2 bg-[#312525] border border-red-900/50 text-[11px] text-red-300 flex items-center justify-between">
                    <span>10-Second Countdown Active</span>
                    <span className="font-mono font-bold text-white bg-red-600 px-2 py-0.5">00:00</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">
                    Check: [✓] I am aware of the possible risks → Tap OK
                  </div>
                </div>
              )}

              {step.mockupType === 'source-toggle' && (
                <div className="mt-3 p-3 bg-[#f8f9fa] dark:bg-[#202124] text-[#1f1a0e] dark:text-white border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">Install unknown apps</div>
                    <div className="text-[11px] text-gray-600 dark:text-gray-400">Allow from this source</div>
                  </div>
                  <div className="w-12 h-6 bg-[#0e4dff] rounded-full p-0.5 flex items-center justify-end border border-[#1f1a0e]">
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Troubleshooting Accordion Section */}
      <div className="p-5 sm:p-6 bg-[#eedcb4]/60 dark:bg-[#271f13] border-3 border-[#1f1a0e] dark:border-[#eedcb4]/20 shadow-[4px_4px_0_#1f1a0e]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#1f1a0e] dark:border-[#eedcb4]/20">
          <div>
            <div className="flex items-center gap-1.5 text-[#ff4a8a] text-xs font-['Bowlby_One'] uppercase mb-1">
              <HelpCircle size={16} />
              <span>Diagnostic & Resolution Center</span>
            </div>
            <h4 className="font-['Bowlby_One'] text-xl uppercase tracking-tight text-[#1f1a0e] dark:text-[#fdfaf2]">
              Troubleshooting Common Installation Errors
            </h4>
          </div>

          {/* Search box for troubleshooting */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a4f30] dark:text-[#cdbe9e]" />
            <input
              type="text"
              value={troubleshootSearch}
              onChange={(e) => setTroubleshootSearch(e.target.value)}
              placeholder="Filter errors (e.g. Play Protect)..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#1a140b] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 text-xs font-sans text-[#1f1a0e] dark:text-[#fdfaf2] focus:outline-none"
            />
          </div>
        </div>

        {/* Accordion Items */}
        <div className="space-y-3">
          {filteredTroubleshoot.length === 0 ? (
            <div className="p-4 bg-white dark:bg-[#1a140b] text-center text-xs text-[#5a4f30] dark:text-[#cdbe9e]">
              No troubleshooting guides found matching "{troubleshootSearch}".
            </div>
          ) : (
            filteredTroubleshoot.map((item) => {
              const isOpen = openTroubleshootId === item.id;

              return (
                <div
                  key={item.id}
                  className="border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 bg-white dark:bg-[#1a140b] shadow-[2px_2px_0_#1f1a0e] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenTroubleshootId(isOpen ? null : item.id)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-[#eedcb4]/30 dark:hover:bg-[#271f13] transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-['Bowlby_One'] text-xs sm:text-sm uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                        {item.title}
                      </span>
                      <div className="flex gap-1">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.2 bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#cdbe9e] text-[9px] font-mono border border-[#1f1a0e]/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isOpen ? <ChevronUp size={18} className="shrink-0" /> : <ChevronDown size={18} className="shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 border-t-2 border-[#1f1a0e] dark:border-[#eedcb4]/20 bg-[#f5ecd4]/40 dark:bg-[#120e07] text-xs space-y-2.5">
                      <div>
                        <strong className="text-[#ff4a8a] uppercase text-[10px] block tracking-wider">
                          Symptom:
                        </strong>
                        <p className="text-[#2a2515] dark:text-[#e8deca] font-medium mt-0.5">
                          {item.symptom}
                        </p>
                      </div>

                      <div>
                        <strong className="text-[#0e4dff] uppercase text-[10px] block tracking-wider">
                          Root Cause:
                        </strong>
                        <p className="text-[#2a2515] dark:text-[#e8deca] font-medium mt-0.5">
                          {item.cause}
                        </p>
                      </div>

                      <div>
                        <strong className="text-[#10b981] uppercase text-[10px] block tracking-wider">
                          Numbered Fix:
                        </strong>
                        <ol className="list-decimal list-inside space-y-1 mt-1 text-[#1f1a0e] dark:text-[#fdfaf2] font-semibold">
                          {item.solution.map((sol, sIdx) => (
                            <li key={sIdx} className="leading-relaxed">
                              {sol}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SideloadWizard;
