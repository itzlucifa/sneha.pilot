import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Star,
  Smartphone,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  Filter,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export interface AdminAnalyticsProps {
  signups: any[];
  feedback: any[];
  className?: string;
}

// -------------------------------------------------------------
// Helper Types & Normalizers
// -------------------------------------------------------------
interface RatingDistribution {
  star: number;
  count: number;
  percentage: number;
  colorBg: string;
  colorBorder: string;
}

interface OSVersionStat {
  version: string;
  badge?: string;
  count: number;
  percentage: number;
  colorBg: string;
}

interface ManufacturerStat {
  name: string;
  count: number;
  percentage: number;
  colorBg: string;
}

interface ModelStat {
  model: string;
  manufacturer: string;
  count: number;
  percentage: number;
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  signups = [],
  feedback = [],
  className = '',
}) => {
  const [activeViewFilter, setActiveViewFilter] = useState<'all' | 'ratings' | 'os' | 'devices'>('all');

  // -----------------------------------------------------------
  // 1. Rating Breakdown Distribution & Satisfaction Metrics
  // -----------------------------------------------------------
  const ratingAnalytics = useMemo(() => {
    const total = feedback.length;
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let ratingSum = 0;

    feedback.forEach((f) => {
      const rawRating = Number(f.rating);
      const star = Math.min(5, Math.max(1, Math.round(rawRating || 5)));
      distribution[star] = (distribution[star] || 0) + 1;
      ratingSum += rawRating || 5;
    });

    const avgRating = total > 0 ? ratingSum / total : 5.0;
    const satisfactionPercentage = total > 0 ? (avgRating / 5) * 100 : 100;

    const ratingColors: Record<number, { bg: string; border: string }> = {
      5: { bg: 'bg-[#10b981]', border: 'border-[#059669]' }, // Emerald Green
      4: { bg: 'bg-[#0e4dff]', border: 'border-[#0037cc]' }, // Electric Blue
      3: { bg: 'bg-[#f59e0b]', border: 'border-[#d97706]' }, // Amber
      2: { bg: 'bg-[#ff7028]', border: 'border-[#ea580c]' }, // Orange
      1: { bg: 'bg-[#ff4a8a]', border: 'border-[#e11d48]' }, // Pink / Red
    };

    const breakdown: RatingDistribution[] = [5, 4, 3, 2, 1].map((star) => {
      const count = distribution[star] || 0;
      const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
      return {
        star,
        count,
        percentage,
        colorBg: ratingColors[star].bg,
        colorBorder: ratingColors[star].border,
      };
    });

    const positiveCount = (distribution[5] || 0) + (distribution[4] || 0);
    const positivePercentage = total > 0 ? Math.round((positiveCount / total) * 100) : 100;

    return {
      total,
      avgRating,
      satisfactionPercentage,
      breakdown,
      positiveCount,
      positivePercentage,
    };
  }, [feedback]);

  // -----------------------------------------------------------
  // 2. Android OS Version Breakdown
  // -----------------------------------------------------------
  const osAnalytics = useMemo(() => {
    const rawList: string[] = [];

    signups.forEach((s) => {
      const v = s.android_version || s.androidVersion;
      if (v && typeof v === 'string') rawList.push(v);
    });

    feedback.forEach((f) => {
      const v = f.tester_device || f.android_version || f.androidVersion;
      if (v && typeof v === 'string' && /android/i.test(v)) rawList.push(v);
    });

    // If no explicit signups yet, use fallback sample distribution for preview
    const effectiveTotal = rawList.length || signups.length || feedback.length || 0;

    const counts: Record<string, number> = {
      'Android 15': 0,
      'Android 14': 0,
      'Android 13': 0,
      'Android 12': 0,
      'Android 11': 0,
      'Legacy (Android 8 - 10)': 0,
      Other: 0,
    };

    rawList.forEach((item) => {
      const lower = item.toLowerCase();
      if (/15|vanilla|api\s*35/i.test(lower)) {
        counts['Android 15']++;
      } else if (/14|upside|api\s*34/i.test(lower)) {
        counts['Android 14']++;
      } else if (/13|tiramisu|api\s*33/i.test(lower)) {
        counts['Android 13']++;
      } else if (/12|snow|api\s*3[12]/i.test(lower)) {
        counts['Android 12']++;
      } else if (/11|red\s*velvet|api\s*30/i.test(lower)) {
        counts['Android 11']++;
      } else if (/10|9|8|pie|oreo/i.test(lower)) {
        counts['Legacy (Android 8 - 10)']++;
      } else {
        counts['Other']++;
      }
    });

    const colorMap: Record<string, string> = {
      'Android 15': 'bg-[#10b981]', // Target SDK
      'Android 14': 'bg-[#0e4dff]',
      'Android 13': 'bg-[#ff7028]',
      'Android 12': 'bg-[#ff4a8a]',
      'Android 11': 'bg-[#8b5cf6]',
      'Legacy (Android 8 - 10)': 'bg-[#64748b]', // Min SDK
      Other: 'bg-[#94a3b8]',
    };

    const badgeMap: Record<string, string> = {
      'Android 15': 'Target SDK 35',
      'Android 14': 'Verified Edge-to-Edge',
      'Android 13': 'Verified High Perf',
      'Android 12': 'Material You Core',
      'Android 11': 'Full Backward Compat',
      'Legacy (Android 8 - 10)': 'Min SDK 26 Support',
    };

    const list: OSVersionStat[] = Object.keys(counts)
      .filter((k) => counts[k] > 0 || (effectiveTotal === 0 && (k === 'Android 15' || k === 'Android 14')))
      .map((version) => {
        const count = counts[version];
        const percentage = effectiveTotal > 0 ? Math.round((count / effectiveTotal) * 1000) / 10 : 0;
        return {
          version,
          badge: badgeMap[version],
          count,
          percentage,
          colorBg: colorMap[version] || 'bg-[#eedcb4]',
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      totalDevicesLogged: effectiveTotal,
      list,
    };
  }, [signups, feedback]);

  // -----------------------------------------------------------
  // 3. Handset Models & Manufacturers Breakdown
  // -----------------------------------------------------------
  const deviceAnalytics = useMemo(() => {
    const rawDevices: string[] = [];

    signups.forEach((s) => {
      const d = s.device_model || s.deviceModel;
      if (d && typeof d === 'string' && d.trim().length > 0) rawDevices.push(d.trim());
    });

    feedback.forEach((f) => {
      const d = f.tester_device || f.testerDevice;
      if (d && typeof d === 'string' && d.trim().length > 0 && !/android\s*\d/i.test(d)) {
        rawDevices.push(d.trim());
      }
    });

    const totalAudited = rawDevices.length;

    // Detect Manufacturers
    const mfgCounts: Record<string, number> = {
      'Google Pixel': 0,
      'Samsung Galaxy': 0,
      OnePlus: 0,
      'Xiaomi / Redmi / POCO': 0,
      Motorola: 0,
      'Nothing Phone': 0,
      'Other Android OEM': 0,
    };

    // Specific model frequency
    const modelFrequency: Record<string, { count: number; manufacturer: string }> = {};

    rawDevices.forEach((dev) => {
      const lower = dev.toLowerCase();
      let mfg = 'Other Android OEM';

      if (/pixel|nexus|google/i.test(lower)) {
        mfg = 'Google Pixel';
      } else if (/samsung|galaxy|sm-|z\s*flip|z\s*fold/i.test(lower)) {
        mfg = 'Samsung Galaxy';
      } else if (/oneplus|1\+|nord/i.test(lower)) {
        mfg = 'OnePlus';
      } else if (/xiaomi|redmi|poco|mi\s*\d/i.test(lower)) {
        mfg = 'Xiaomi / Redmi / POCO';
      } else if (/moto|motorola|edge\s*\d/i.test(lower)) {
        mfg = 'Motorola';
      } else if (/nothing/i.test(lower)) {
        mfg = 'Nothing Phone';
      }

      mfgCounts[mfg] = (mfgCounts[mfg] || 0) + 1;

      // Clean model name
      const normalizedModel = dev
        .replace(/^(google|samsung|xiaomi|oneplus|motorola)\s+/i, '')
        .trim();

      const displayModel = normalizedModel.length > 2 ? normalizedModel : dev;
      if (!modelFrequency[displayModel]) {
        modelFrequency[displayModel] = { count: 0, manufacturer: mfg };
      }
      modelFrequency[displayModel].count++;
    });

    const mfgColors: Record<string, string> = {
      'Google Pixel': 'bg-[#0e4dff]', // Blue
      'Samsung Galaxy': 'bg-[#ff7028]', // Orange
      OnePlus: 'bg-[#ff4a8a]', // Pink
      'Xiaomi / Redmi / POCO': 'bg-[#f59e0b]', // Amber
      Motorola: 'bg-[#10b981]', // Green
      'Nothing Phone': 'bg-[#8b5cf6]', // Purple
      'Other Android OEM': 'bg-[#64748b]',
    };

    const manufacturers: ManufacturerStat[] = Object.keys(mfgCounts)
      .map((name) => {
        const count = mfgCounts[name] || 0;
        const percentage = totalAudited > 0 ? Math.round((count / totalAudited) * 1000) / 10 : 0;
        return {
          name,
          count,
          percentage,
          colorBg: mfgColors[name] || 'bg-[#eedcb4]',
        };
      })
      .filter((m) => m.count > 0 || totalAudited === 0)
      .sort((a, b) => b.count - a.count);

    const topModels: ModelStat[] = Object.keys(modelFrequency)
      .map((model) => ({
        model,
        manufacturer: modelFrequency[model].manufacturer,
        count: modelFrequency[model].count,
        percentage:
          totalAudited > 0
            ? Math.round((modelFrequency[model].count / totalAudited) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      totalAudited,
      manufacturers,
      topModels,
    };
  }, [signups, feedback]);

  // -----------------------------------------------------------
  // 4. Key Performance Metrics
  // -----------------------------------------------------------
  const kpiMetrics = useMemo(() => {
    const totalSignups = signups.length;
    const totalFeedback = feedback.length;

    // Review to Signup Engagement Ratio
    const engagementRatio =
      totalSignups > 0
        ? Math.round((totalFeedback / totalSignups) * 1000) / 10
        : totalFeedback > 0
        ? 100
        : 0;

    // Defect breakdown
    let bugsReported = 0;
    feedback.forEach((f) => {
      const broke = (f.what_broke || '').toLowerCase().trim();
      if (
        broke.length > 2 &&
        !['none', 'no', 'n/a', 'nothing', 'nil', 'all good', 'smooth'].includes(broke)
      ) {
        bugsReported++;
      }
    });

    const cleanRuns = Math.max(0, totalFeedback - bugsReported);
    const defectRatio = totalFeedback > 0 ? Math.round((bugsReported / totalFeedback) * 100) : 0;

    return {
      totalSignups,
      totalFeedback,
      engagementRatio,
      bugsReported,
      cleanRuns,
      defectRatio,
    };
  }, [signups, feedback]);

  return (
    <section
      className={`space-y-6 ${className}`}
      data-testid="admin-analytics-dashboard"
      aria-label="Maintainer Admin Analytics Dashboard"
    >
      {/* -----------------------------------------------------------
          Dashboard Top Banner & Filter Controls
          ----------------------------------------------------------- */}
      <div className="p-4 sm:p-5 bg-[#f5ecd4] dark:bg-[#1c170d] border-3 border-[#1f1a0e] dark:border-[#fdfaf2] shadow-[6px_6px_0_#1f1a0e] dark:shadow-[6px_6px_0_#fdfaf2] flex flex-wrap items-center justify-between gap-4 overflow-hidden">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-[#0e4dff] text-white font-['Bowlby_One'] text-[10px] uppercase border border-[#1f1a0e] dark:border-[#fdfaf2]">
              Live Telemetry
            </span>
            <span className="text-xs font-mono font-bold text-[#5a4f30] dark:text-[#cdbe9e]">
              AUDIT v1.0.2 · SUPABASE REALTIME
            </span>
          </div>
          <h2 className="font-['Bowlby_One'] text-lg sm:text-2xl uppercase tracking-tight text-[#1f1a0e] dark:text-[#fdfaf2] flex flex-wrap items-center gap-2 break-words">
            <BarChart3 size={24} className="text-[#0e4dff] shrink-0" />
            <span>Pilot Analytics Dashboard</span>
          </h2>
          <p className="font-['Crimson_Pro'] italic text-xs sm:text-sm text-[#2a2515] dark:text-[#e8deca]">
            Comprehensive hardware distribution, crash-safety metrics, and user feedback triage.
          </p>
        </div>

        {/* View Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f1a0e] dark:text-[#fdfaf2] flex items-center gap-1 mr-1">
            <Filter size={13} /> View:
          </span>
          {[
            { id: 'all', label: 'Overview' },
            { id: 'ratings', label: 'Satisfaction' },
            { id: 'os', label: 'Android OS' },
            { id: 'devices', label: 'Hardware OEM' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveViewFilter(item.id as any)}
              className={`px-2.5 py-1 text-xs font-bold uppercase transition-all cursor-pointer border-2 border-[#1f1a0e] dark:border-[#fdfaf2] ${
                activeViewFilter === item.id
                  ? 'bg-[#1f1a0e] text-[#f5ecd4] dark:bg-[#fdfaf2] dark:text-[#120e07] shadow-[2px_2px_0_#0e4dff]'
                  : 'bg-[#eedcb4] text-[#1f1a0e] dark:bg-[#271f13] dark:text-[#fdfaf2] hover:bg-white dark:hover:bg-[#342a1a]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* -----------------------------------------------------------
          KPI Overview Cards (4 Key Metrics)
          ----------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Review-to-Signup Ratio */}
        <div className="p-4 bg-[#f5ecd4] dark:bg-[#1c170d] border-3 border-[#1f1a0e] dark:border-[#fdfaf2] shadow-[4px_4px_0_#1f1a0e] dark:shadow-[4px_4px_0_#fdfaf2] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a4f30] dark:text-[#cdbe9e]">
                Engagement Ratio
              </span>
              <TrendingUp size={16} className="text-[#0e4dff]" />
            </div>
            <div className="flex items-baseline gap-2">
              <b className="font-['Bowlby_One'] text-3xl sm:text-4xl text-[#0e4dff] dark:text-[#5489ff]">
                {kpiMetrics.engagementRatio}%
              </b>
              <span className="text-xs font-bold uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                conversion
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1f1a0e]/15 dark:border-[#fdfaf2]/15 flex items-center justify-between text-[11px]">
            <span className="font-['Crimson_Pro'] italic text-[#2a2515] dark:text-[#e8deca]">
              {kpiMetrics.totalFeedback} reviews / {kpiMetrics.totalSignups} testers
            </span>
            <span
              className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border border-[#1f1a0e] dark:border-[#fdfaf2] ${
                kpiMetrics.engagementRatio >= 30
                  ? 'bg-[#10b981] text-white'
                  : 'bg-[#ff7028] text-[#1f1a0e]'
              }`}
            >
              {kpiMetrics.engagementRatio >= 30 ? 'High' : 'Baseline'}
            </span>
          </div>
        </div>

        {/* KPI 2: Average Satisfaction Rate */}
        <div className="p-4 bg-[#f5ecd4] dark:bg-[#1c170d] border-3 border-[#1f1a0e] dark:border-[#fdfaf2] shadow-[4px_4px_0_#1f1a0e] dark:shadow-[4px_4px_0_#fdfaf2] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a4f30] dark:text-[#cdbe9e]">
                Satisfaction Rate
              </span>
              <Star size={16} className="text-[#f59e0b] fill-[#f59e0b]" />
            </div>
            <div className="flex items-baseline gap-2">
              <b className="font-['Bowlby_One'] text-3xl sm:text-4xl text-[#ff7028] dark:text-[#ff8544]">
                {ratingAnalytics.avgRating.toFixed(1)}
              </b>
              <span className="text-xs font-bold uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                / 5.0 ★
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1f1a0e]/15 dark:border-[#fdfaf2]/15 flex items-center justify-between text-[11px]">
            <span className="font-['Crimson_Pro'] italic text-[#2a2515] dark:text-[#e8deca]">
              CSAT Score: {ratingAnalytics.satisfactionPercentage.toFixed(0)}%
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase border border-[#1f1a0e] dark:border-[#fdfaf2] bg-[#10b981] text-white">
              {ratingAnalytics.positivePercentage}% Positive
            </span>
          </div>
        </div>

        {/* KPI 3: Audited Test Reports */}
        <div className="p-4 bg-[#f5ecd4] dark:bg-[#1c170d] border-3 border-[#1f1a0e] dark:border-[#fdfaf2] shadow-[4px_4px_0_#1f1a0e] dark:shadow-[4px_4px_0_#fdfaf2] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a4f30] dark:text-[#cdbe9e]">
                Audited Test Reports
              </span>
              <ShieldCheck size={16} className="text-[#10b981]" />
            </div>
            <div className="flex items-baseline gap-2">
              <b className="font-['Bowlby_One'] text-3xl sm:text-4xl text-[#ff4a8a]">
                {kpiMetrics.totalFeedback}
              </b>
              <span className="text-xs font-bold uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                verified
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1f1a0e]/15 dark:border-[#fdfaf2]/15 flex items-center justify-between text-[11px]">
            <span className="font-['Crimson_Pro'] italic text-[#2a2515] dark:text-[#e8deca]">
              {kpiMetrics.bugsReported} issues · {kpiMetrics.cleanRuns} clean
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase border border-[#1f1a0e] dark:border-[#fdfaf2] bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2]">
              {kpiMetrics.defectRatio}% Defects
            </span>
          </div>
        </div>

        {/* KPI 4: Enrolled Hardware Fleet */}
        <div className="p-4 bg-[#f5ecd4] dark:bg-[#1c170d] border-3 border-[#1f1a0e] dark:border-[#fdfaf2] shadow-[4px_4px_0_#1f1a0e] dark:shadow-[4px_4px_0_#fdfaf2] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#5a4f30] dark:text-[#cdbe9e]">
                Enrolled Fleet
              </span>
              <Smartphone size={16} className="text-[#1f1a0e] dark:text-[#fdfaf2]" />
            </div>
            <div className="flex items-baseline gap-2">
              <b className="font-['Bowlby_One'] text-3xl sm:text-4xl text-[#1f1a0e] dark:text-[#fdfaf2]">
                {kpiMetrics.totalSignups}
              </b>
              <span className="text-xs font-bold uppercase text-[#1f1a0e] dark:text-[#fdfaf2]">
                handsets
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1f1a0e]/15 dark:border-[#fdfaf2]/15 flex items-center justify-between text-[11px]">
            <span className="font-['Crimson_Pro'] italic text-[#2a2515] dark:text-[#e8deca]">
              Across {deviceAnalytics.manufacturers.length} OEM brands
            </span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase border border-[#1f1a0e] dark:border-[#fdfaf2] bg-[#0e4dff] text-white">
              GPLv3 Core
            </span>
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------------
          Section 1: Rating Breakdown Distribution
          ----------------------------------------------------------- */}
      {(activeViewFilter === 'all' || activeViewFilter === 'ratings') && (
        <div className="p-6 bg-[#f5ecd4] dark:bg-[#1c170d] border-3 border-[#1f1a0e] dark:border-[#fdfaf2] shadow-[6px_6px_0_#1f1a0e] dark:shadow-[6px_6px_0_#fdfaf2] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1f1a0e]/15 dark:border-[#fdfaf2]/15 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0e4dff] dark:text-[#5489ff] block">
                User Experience & Quality Score
              </span>
              <h3 className="font-['Bowlby_One'] text-lg sm:text-xl uppercase text-[#1f1a0e] dark:text-[#fdfaf2] flex items-center gap-2">
                <Star size={20} className="text-[#ff7028] fill-[#ff7028]" />
                <span>Rating Breakdown Distribution</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#fdfaf2] font-mono text-xs font-bold text-[#1f1a0e] dark:text-[#fdfaf2]">
                {ratingAnalytics.total} Total Ratings Audited
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {ratingAnalytics.breakdown.map((row) => (
              <div key={row.star} className="flex items-center gap-3 text-xs">
                {/* Star Badge */}
                <span className="w-16 shrink-0 flex items-center justify-center gap-1 py-1 font-['Bowlby_One'] text-xs border-2 border-[#1f1a0e] dark:border-[#fdfaf2] bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] shadow-[2px_2px_0_#1f1a0e] dark:shadow-[2px_2px_0_#fdfaf2]">
                  {row.star} <Star size={11} className="fill-current text-[#ff7028]" />
                </span>

                {/* Visual Percentage Bar */}
                <div className="flex-1 bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#fdfaf2] h-6 relative overflow-hidden">
                  <div
                    className={`h-full ${row.colorBg} border-r-2 border-[#1f1a0e] dark:border-[#fdfaf2] transition-all duration-500`}
                    style={{ width: `${Math.max(row.percentage, 0)}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-mono font-bold text-[#1f1a0e] dark:text-[#fdfaf2] pointer-events-none">
                    <span>{row.percentage}%</span>
                    <span>
                      {row.count} {row.count === 1 ? 'review' : 'reviews'}
                    </span>
                  </span>
                </div>

                {/* Count Pill */}
                <span className="w-14 text-right font-mono font-bold text-[#5a4f30] dark:text-[#cdbe9e] shrink-0">
                  {row.count} req
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#eedcb4]/60 dark:bg-[#271f13] border-2 border-dashed border-[#1f1a0e]/40 dark:border-[#fdfaf2]/40 text-xs flex flex-wrap items-center justify-between gap-2">
            <span className="font-['Crimson_Pro'] italic text-[#2a2515] dark:text-[#e8deca]">
              Positive Sentiment Threshold (4★ and 5★ reviews):
            </span>
            <strong className="font-['Bowlby_One'] text-sm text-[#10b981]">
              {ratingAnalytics.positivePercentage}% Positive Sentiment ({ratingAnalytics.positiveCount} of{' '}
              {ratingAnalytics.total} submissions)
            </strong>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------
          Section 2: Android OS Version Breakdown Chart
          ----------------------------------------------------------- */}
      {(activeViewFilter === 'all' || activeViewFilter === 'os') && (
        <div className="p-6 bg-[#f5ecd4] dark:bg-[#1c170d] border-3 border-[#1f1a0e] dark:border-[#fdfaf2] shadow-[6px_6px_0_#1f1a0e] dark:shadow-[6px_6px_0_#fdfaf2] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1f1a0e]/15 dark:border-[#fdfaf2]/15 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff4a8a] block">
                API Level & Runtime Compatibility
              </span>
              <h3 className="font-['Bowlby_One'] text-lg sm:text-xl uppercase text-[#1f1a0e] dark:text-[#fdfaf2] flex items-center gap-2">
                <Cpu size={20} className="text-[#ff4a8a] shrink-0" />
                <span>Android OS Version Distribution</span>
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#10b981] text-white font-['Bowlby_One'] text-[10px] uppercase border border-[#1f1a0e] dark:border-[#fdfaf2]">
                Min SDK 26 · Target SDK 35
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {osAnalytics.list.length === 0 ? (
              <div className="p-6 text-center font-['Crimson_Pro'] italic text-sm text-[#5a4f30] dark:text-[#cdbe9e] border-2 border-dashed border-[#1f1a0e] dark:border-[#fdfaf2]">
                Awaiting device OS telemetry data from verified signups and feedback submissions.
              </div>
            ) : (
              osAnalytics.list.map((os) => (
                <div key={os.version} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#1f1a0e] dark:text-[#fdfaf2]">
                    <div className="flex items-center gap-2">
                      <span className="font-['Bowlby_One'] text-xs">{os.version}</span>
                      {os.badge && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 bg-[#1f1a0e] text-[#f5ecd4] dark:bg-[#fdfaf2] dark:text-[#120e07] border border-[#1f1a0e] dark:border-[#fdfaf2] font-mono">
                          {os.badge}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-[#5a4f30] dark:text-[#cdbe9e]">
                      {os.percentage}% ({os.count} devices)
                    </div>
                  </div>

                  <div className="bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#fdfaf2] h-5 relative overflow-hidden">
                    <div
                      className={`h-full ${os.colorBg} border-r-2 border-[#1f1a0e] dark:border-[#fdfaf2] transition-all duration-500`}
                      style={{ width: `${Math.max(os.percentage, 0)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-[#eedcb4]/40 dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#fdfaf2]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0e4dff] dark:text-[#5489ff] block mb-1">
                Target Platform: Android 15 (SDK 35)
              </span>
              <p className="text-xs font-['Crimson_Pro'] italic text-[#2a2515] dark:text-[#e8deca]">
                Edge-to-edge rendering and 16KB memory page alignment verified for high-end flagship flag.
              </p>
            </div>
            <div className="p-3 bg-[#eedcb4]/40 dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#fdfaf2]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff7028] dark:text-[#ff8544] block mb-1">
                Baseline Support: Android 8.0 Oreo (SDK 26)
              </span>
              <p className="text-xs font-['Crimson_Pro'] italic text-[#2a2515] dark:text-[#e8deca]">
                Ensures accessibility across legacy handsets without vendor telemetry compromises.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------
          Section 3: Top Handset Models & Manufacturers Breakdown
          ----------------------------------------------------------- */}
      {(activeViewFilter === 'all' || activeViewFilter === 'devices') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Manufacturer Share */}
          <div className="p-6 bg-[#f5ecd4] dark:bg-[#1c170d] border-3 border-[#1f1a0e] dark:border-[#fdfaf2] shadow-[6px_6px_0_#1f1a0e] dark:shadow-[6px_6px_0_#fdfaf2] space-y-4">
            <div className="border-b-2 border-[#1f1a0e]/15 dark:border-[#fdfaf2]/15 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff7028] dark:text-[#ff8544] block">
                OEM Share Distribution
              </span>
              <h3 className="font-['Bowlby_One'] text-lg uppercase text-[#1f1a0e] dark:text-[#fdfaf2] flex items-center gap-2">
                <Layers size={18} className="text-[#ff7028] shrink-0" />
                <span>Top Manufacturers</span>
              </h3>
            </div>

            <div className="space-y-3">
              {deviceAnalytics.manufacturers.length === 0 ? (
                <div className="p-6 text-center font-['Crimson_Pro'] italic text-sm text-[#5a4f30] dark:text-[#cdbe9e]">
                  No OEM hardware data logged yet.
                </div>
              ) : (
                deviceAnalytics.manufacturers.map((mfg) => (
                  <div key={mfg.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1f1a0e] dark:text-[#fdfaf2]">
                      <span>{mfg.name}</span>
                      <span className="font-mono text-[11px] text-[#5a4f30] dark:text-[#cdbe9e]">
                        {mfg.percentage}% ({mfg.count})
                      </span>
                    </div>
                    <div className="bg-[#eedcb4] dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#fdfaf2] h-4 overflow-hidden">
                      <div
                        className={`h-full ${mfg.colorBg} border-r border-[#1f1a0e] dark:border-[#fdfaf2] transition-all duration-500`}
                        style={{ width: `${Math.max(mfg.percentage, 0)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Top Tested Specific Handset Models Leaderboard */}
          <div className="p-6 bg-[#f5ecd4] dark:bg-[#1c170d] border-3 border-[#1f1a0e] dark:border-[#fdfaf2] shadow-[6px_6px_0_#1f1a0e] dark:shadow-[6px_6px_0_#fdfaf2] space-y-4">
            <div className="border-b-2 border-[#1f1a0e]/15 dark:border-[#fdfaf2]/15 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#0e4dff] dark:text-[#5489ff] block">
                Handset Leaderboard
              </span>
              <h3 className="font-['Bowlby_One'] text-lg uppercase text-[#1f1a0e] dark:text-[#fdfaf2] flex items-center gap-2">
                <Smartphone size={18} className="text-[#0e4dff] shrink-0" />
                <span>Top Tested Handset Models</span>
              </h3>
            </div>

            <div className="space-y-2">
              {deviceAnalytics.topModels.length === 0 ? (
                <div className="p-6 text-center font-['Crimson_Pro'] italic text-sm text-[#5a4f30] dark:text-[#cdbe9e]">
                  No device model submissions recorded yet.
                </div>
              ) : (
                deviceAnalytics.topModels.map((item, idx) => (
                  <div
                    key={item.model}
                    className="p-2.5 bg-[#eedcb4]/40 dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#fdfaf2] flex items-center justify-between text-xs shadow-[2px_2px_0_#1f1a0e] dark:shadow-[2px_2px_0_#fdfaf2]"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span
                        className={`w-6 h-6 flex items-center justify-center font-['Bowlby_One'] text-[11px] border border-[#1f1a0e] dark:border-[#fdfaf2] shrink-0 ${
                          idx === 0
                            ? 'bg-[#ff7028] text-white'
                            : idx === 1
                            ? 'bg-[#0e4dff] text-white'
                            : idx === 2
                            ? 'bg-[#ff4a8a] text-white'
                            : 'bg-[#eedcb4] dark:bg-[#342a1a] text-[#1f1a0e] dark:text-[#fdfaf2]'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div className="truncate">
                        <strong className="font-bold text-[#1f1a0e] dark:text-[#fdfaf2] block truncate">
                          {item.model}
                        </strong>
                        <span className="text-[10px] font-mono text-[#5a4f30] dark:text-[#cdbe9e]">
                          {item.manufacturer}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2 py-0.5 bg-[#1f1a0e] text-[#f5ecd4] dark:bg-[#fdfaf2] dark:text-[#120e07] font-mono text-xs font-bold border border-[#1f1a0e] dark:border-[#fdfaf2]">
                        {item.count} tests
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminAnalytics;
