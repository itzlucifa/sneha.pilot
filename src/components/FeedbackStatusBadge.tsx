import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Bug,
  CheckCircle2,
  Calendar,
  CheckCheck,
  Mail,
  ChevronDown,
  Check,
  AlertCircle,
} from 'lucide-react';

export type FeedbackTriageStatus =
  | 'Investigating'
  | 'Bug Confirmed'
  | 'Fixed in Next Build'
  | 'Feature Planned'
  | 'Closed / Resolved';

export interface FeedbackStatusBadgeProps {
  feedbackId: number | string;
  testerEmail?: string | null;
  rating: number;
  whatWorked: string;
  whatBroke: string;
  onStatusChange?: (feedbackId: number | string, newStatus: FeedbackTriageStatus) => void;
  className?: string;
}

const STORAGE_KEY = 'sneha_feedback_status_map';

interface StatusConfig {
  label: FeedbackTriageStatus;
  bgLight: string;
  textLight: string;
  borderLight: string;
  bgDark: string;
  textDark: string;
  borderDark: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

const STATUS_CONFIGS: Record<FeedbackTriageStatus, StatusConfig> = {
  Investigating: {
    label: 'Investigating',
    bgLight: 'bg-[#ff7028]',
    textLight: 'text-[#1f1a0e]',
    borderLight: 'border-[#1f1a0e]',
    bgDark: 'dark:bg-[#ff8544]',
    textDark: 'dark:text-[#120e07]',
    borderDark: 'dark:border-[#fdfaf2]',
    icon: Clock,
    description: 'Active maintainer analysis & reproduction',
  },
  'Bug Confirmed': {
    label: 'Bug Confirmed',
    bgLight: 'bg-[#ff4a8a]',
    textLight: 'text-[#1f1a0e]',
    borderLight: 'border-[#1f1a0e]',
    bgDark: 'dark:bg-[#ff4a8a]',
    textDark: 'dark:text-[#120e07]',
    borderDark: 'dark:border-[#fdfaf2]',
    icon: Bug,
    description: 'Reproduction verified; defect tracker ticket logged',
  },
  'Fixed in Next Build': {
    label: 'Fixed in Next Build',
    bgLight: 'bg-[#10b981]',
    textLight: 'text-white',
    borderLight: 'border-[#1f1a0e]',
    bgDark: 'dark:bg-[#059669]',
    textDark: 'dark:text-white',
    borderDark: 'dark:border-[#fdfaf2]',
    icon: CheckCircle2,
    description: 'Committed to repository; staged for upcoming APK build',
  },
  'Feature Planned': {
    label: 'Feature Planned',
    bgLight: 'bg-[#0e4dff]',
    textLight: 'text-white',
    borderLight: 'border-[#1f1a0e]',
    bgDark: 'dark:bg-[#5489ff]',
    textDark: 'dark:text-white',
    borderDark: 'dark:border-[#fdfaf2]',
    icon: Calendar,
    description: 'Accepted feature request queued on roadmap',
  },
  'Closed / Resolved': {
    label: 'Closed / Resolved',
    bgLight: 'bg-[#64748b]',
    textLight: 'text-white',
    borderLight: 'border-[#1f1a0e]',
    bgDark: 'dark:bg-[#475569]',
    textDark: 'dark:text-white',
    borderDark: 'dark:border-[#fdfaf2]',
    icon: CheckCheck,
    description: 'Resolved, shipped, or closed by maintainer',
  },
};

const ALL_STATUSES: FeedbackTriageStatus[] = [
  'Investigating',
  'Bug Confirmed',
  'Fixed in Next Build',
  'Feature Planned',
  'Closed / Resolved',
];

export const FeedbackStatusBadge: React.FC<FeedbackStatusBadgeProps> = ({
  feedbackId,
  testerEmail,
  rating,
  whatWorked,
  whatBroke,
  onStatusChange,
  className = '',
}) => {
  const [status, setStatus] = useState<FeedbackTriageStatus>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[String(feedbackId)] && STATUS_CONFIGS[parsed[String(feedbackId)] as FeedbackTriageStatus]) {
          return parsed[String(feedbackId)];
        }
      }
    } catch {
      // Fallback
    }
    return 'Investigating';
  });

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusSelect = (newStatus: FeedbackTriageStatus) => {
    setStatus(newStatus);
    setIsOpen(false);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[String(feedbackId)] = newStatus;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (err) {
      console.error('Failed to update sneha_feedback_status_map in localStorage:', err);
    }

    if (onStatusChange) {
      onStatusChange(feedbackId, newStatus);
    }
  };

  const currentConfig = STATUS_CONFIGS[status] || STATUS_CONFIGS.Investigating;
  const CurrentIcon = currentConfig.icon;

  // Compose professional reply mailto link
  const composeMailto = () => {
    if (!testerEmail) return '#';

    const subject = `[SNEHA Pilot Feedback #${feedbackId}] Engineering Team Follow-up`;
    const body = `Hi,

Thank you for participating in the SNEHA Pilot Distribution and sharing your valuable feedback with us!

We have thoroughly audited your report (Report ID: #${feedbackId}):
• Rating: ${rating} / 5 Stars
• What Worked Well:
  "${whatWorked || 'N/A'}"
• What Broke / Issues Encountered:
  "${whatBroke || 'N/A'}"

Current Maintainer Triage Status: ${status.toUpperCase()}

Our engineering team has logged this report into our audit matrix. If you have any additional logs, system traces, or steps to reproduce on your handset, please reply directly to this message.

Warm regards,
SNEHA Pilot Engineering Team
Project Maintainer Admin
https://github.com/sneha-project/sneha-android`;

    return `mailto:${encodeURIComponent(testerEmail)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      data-testid={`feedback-status-badge-${feedbackId}`}
    >
      {/* Triage Status Dropdown / Button */}
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label={`Triage status: ${status}. Click to change.`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border-2 shadow-[2px_2px_0_#1f1a0e] dark:shadow-[2px_2px_0_#fdfaf2] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${currentConfig.bgLight} ${currentConfig.textLight} ${currentConfig.borderLight} ${currentConfig.bgDark} ${currentConfig.textDark} ${currentConfig.borderDark}`}
        >
          <CurrentIcon size={13} className="shrink-0" />
          <span>{status}</span>
          <ChevronDown
            size={12}
            className={`transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            role="menu"
            aria-orientation="vertical"
            className="absolute left-0 mt-1.5 w-64 bg-[#f5ecd4] dark:bg-[#1c170d] border-3 border-[#1f1a0e] dark:border-[#fdfaf2] shadow-[4px_4px_0_#1f1a0e] dark:shadow-[4px_4px_0_#fdfaf2] z-50 py-1"
          >
            <div className="px-3 py-1.5 border-b border-[#1f1a0e]/20 dark:border-[#fdfaf2]/20">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#5a4f30] dark:text-[#cdbe9e] block">
                Update Triage Status
              </span>
            </div>

            <div className="py-1">
              {ALL_STATUSES.map((itemStatus) => {
                const config = STATUS_CONFIGS[itemStatus];
                const ItemIcon = config.icon;
                const isSelected = itemStatus === status;

                return (
                  <button
                    key={itemStatus}
                    role="menuitem"
                    type="button"
                    onClick={() => handleStatusSelect(itemStatus)}
                    className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#1f1a0e] text-[#f5ecd4] dark:bg-[#fdfaf2] dark:text-[#120e07]'
                        : 'text-[#1f1a0e] dark:text-[#fdfaf2] hover:bg-[#eedcb4] dark:hover:bg-[#271f13]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-none border border-[#1f1a0e] dark:border-[#fdfaf2] shrink-0 ${config.bgLight} ${config.bgDark}`}
                      />
                      <ItemIcon size={13} className="shrink-0" />
                      <span>{itemStatus}</span>
                    </div>
                    {isSelected && <Check size={14} className="shrink-0 font-bold" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 1-Click "Reply to Tester" Button */}
      {testerEmail ? (
        <a
          href={composeMailto()}
          aria-label={`Reply to tester at ${testerEmail}`}
          title={`Open mail draft to ${testerEmail}`}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1f1a0e] text-[#f5ecd4] hover:bg-[#0e4dff] hover:text-white dark:bg-[#eedcb4] dark:text-[#120e07] dark:hover:bg-[#5489ff] dark:hover:text-white border-2 border-[#1f1a0e] dark:border-[#fdfaf2] text-[11px] font-bold uppercase tracking-wider shadow-[2px_2px_0_#1f1a0e] dark:shadow-[2px_2px_0_#fdfaf2] transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
        >
          <Mail size={12} className="shrink-0" />
          <span>Reply to Tester</span>
        </a>
      ) : (
        <span
          title="No tester email provided with this submission"
          className="inline-flex items-center gap-1 px-2 py-1 bg-[#eedcb4]/50 dark:bg-[#271f13] text-[#5a4f30] dark:text-[#cdbe9e] border border-dashed border-[#1f1a0e]/40 dark:border-[#fdfaf2]/40 text-[10px] font-mono italic cursor-not-allowed"
        >
          <AlertCircle size={11} className="shrink-0 opacity-70" />
          <span>No Email</span>
        </span>
      )}
    </div>
  );
};

export default FeedbackStatusBadge;
