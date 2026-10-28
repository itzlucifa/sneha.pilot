import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Copy, Check, ExternalLink, QrCode, Smartphone, Sparkles } from 'lucide-react';
import { qrcodegen } from '../utils/qrcodegen';

export interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  title = 'SCAN TO DOWNLOAD SNEHA APK'
}) => {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Generate ISO/IEC 18004 Compliant QR Code Matrix with 4-module quiet zone
  const { pathData, totalSvgSize } = useMemo(() => {
    const targetUrl = (url || '').trim() || 'https://github.com/itzlucifa/sneha.pilot/releases/download/v1.0.1/Sneha-Full-Offline-AI.apk';
    try {
      // Medium error correction (15% recovery capacity) with automatic optimal mask evaluation
      const qr = qrcodegen.QrCode.encodeText(targetUrl, qrcodegen.QrCode.Ecc.MEDIUM);
      const quietZone = 4; // ISO/IEC 18004 standard requires a 4-module quiet zone on all sides
      const size = qr.size;
      const total = size + quietZone * 2;

      let d = '';
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (qr.getModule(x, y)) {
            d += `M${x + quietZone},${y + quietZone}h1v1h-1z `;
          }
        }
      }

      return { pathData: d, totalSvgSize: total };
    } catch (err) {
      console.error('Failed to encode QR code:', err);
      return { pathData: '', totalSvgSize: 49 };
    }
  }, [url]);

  // Handle Escape key & Trap Focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    // Prevent background scroll
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Copy URL with visual feedback
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy QR code URL:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md my-auto max-h-[92vh] overflow-y-auto bg-[#f5ecd4] dark:bg-[#1c170d] text-[#1f1a0e] dark:text-[#f5ecd4] border-3 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[4px_4px_0_#1f1a0e] sm:shadow-[8px_8px_0_#1f1a0e] dark:shadow-[4px_4px_0_#000000] p-4 sm:p-6 relative transition-all duration-200"
      >
        {/* Top Header Badge & Close Button */}
        <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b-2 border-[#1f1a0e] dark:border-[#eedcb4]/20">
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mb-1.5 bg-[#0e4dff] text-white text-[10px] font-mono font-bold uppercase tracking-wider border border-[#1f1a0e]">
              <QrCode size={12} />
              <span>Direct Android Sideload</span>
            </div>
            <h2
              id="qr-modal-title"
              className="font-['Bowlby_One'] text-lg sm:text-2xl uppercase tracking-tight text-[#1f1a0e] dark:text-[#fdfaf2] break-words"
            >
              {title}
            </h2>
            <p className="font-['Crimson_Pro'] italic text-xs sm:text-sm text-[#5a4f30] dark:text-[#cdbe9e] mt-0.5">
              Point your Android camera or Google Lens at the QR code to download directly to your device.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close QR Code Modal"
            className="p-1.5 bg-[#ff4a8a] text-[#1f1a0e] border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4] transition-all cursor-pointer shrink-0"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* QR Code Container with High-Contrast Canvas and Zero Visual Obstructions */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative p-2.5 sm:p-3 bg-white border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] rounded-none max-w-full">
            {/* Pure SVG QR Code - ISO/IEC 18004 Standard */}
            <svg
              viewBox={`0 0 ${totalSvgSize} ${totalSvgSize}`}
              className="w-48 h-48 sm:w-60 sm:h-60 max-w-full aspect-square"
              shapeRendering="crispEdges"
              role="img"
              aria-label="Scannable QR Code for SNEHA APK Download"
            >
              {/* High-contrast pure white background */}
              <rect width={totalSvgSize} height={totalSvgSize} fill="#ffffff" />
              {/* Crisp deep black modules */}
              <path d={pathData} fill="#000000" />
            </svg>
          </div>

          {/* Clean External Scan Target Badge (Does NOT obstruct the QR code or quiet zone) */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-[#ff7028] text-[#1f1a0e] font-['Bowlby_One'] text-[10px] uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e]">
            ● SCAN TARGET
          </div>

          <span className="text-[10px] sm:text-[11px] font-mono text-[#5a4f30] dark:text-[#cdbe9e] mt-2 flex items-center gap-1">
            <Sparkles size={11} className="text-[#ff7028]" />
            ISO/IEC 18004 Standard • 100% Camera Scannable • ECC Level M
          </span>
        </div>

        {/* Step-by-Step Scan Instructions */}
        <div className="p-2.5 sm:p-3 bg-[#eedcb4]/60 dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/20 my-3 text-xs">
          <div className="font-['Bowlby_One'] uppercase text-[11px] text-[#1f1a0e] dark:text-[#fdfaf2] mb-1 flex items-center gap-1.5">
            <Smartphone size={13} className="text-[#0e4dff]" />
            <span>How to Scan from your Phone:</span>
          </div>
          <ol className="list-decimal list-inside space-y-0.5 text-[#2a2515] dark:text-[#e8deca] font-sans font-medium text-[11px] leading-relaxed">
            <li>Open the standard Camera app or Google Lens on your Android device.</li>
            <li>Align your camera frame over the QR code on this screen.</li>
            <li>Tap the browser pop-up banner to initiate direct APK download.</li>
          </ol>
        </div>

        {/* Copyable Link Field & Action Buttons */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="min-w-0 flex-1 px-2.5 py-1.5 bg-[#eedcb4]/40 dark:bg-[#1a140b] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/20 font-mono text-xs text-[#1f1a0e] dark:text-[#fdfaf2] truncate select-all">
              {url}
            </div>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                copied
                  ? 'bg-[#10b981] text-white'
                  : 'bg-[#ff4a8a] text-[#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4]'
              }`}
            >
              {copied ? (
                <>
                  <Check size={13} strokeWidth={3} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-[#0e4dff] text-white font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4] transition-all flex items-center justify-center gap-1.5 text-center"
            >
              <ExternalLink size={13} />
              <span>Open Link</span>
            </a>

            <button
              onClick={onClose}
              className="px-3 py-2 bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] font-bold text-xs uppercase tracking-wider border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[2px_2px_0_#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4] transition-all cursor-pointer text-center"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
