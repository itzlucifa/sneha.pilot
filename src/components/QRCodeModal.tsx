import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Copy, Check, ExternalLink, QrCode, Smartphone, Sparkles, Download, RefreshCw } from 'lucide-react';

export interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

// ============================================================================
// SELF-CONTAINED PURE-SVG MATHEMATICAL QR CODE GENERATOR (VERSIONS 1 - 10)
// Error Correction: Level M (15% redundancy)
// Zero external dependencies. Generates pixel-perfect crisp SVG matrices.
// ============================================================================

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
let expInitVal = 1;
for (let i = 0; i < 255; i++) {
  EXP[i] = expInitVal;
  EXP[i + 255] = expInitVal;
  LOG[expInitVal] = i;
  expInitVal = (expInitVal << 1) ^ (expInitVal >= 128 ? 0x11d : 0);
}

function gmul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

function rsGenPoly(n: number): number[] {
  let g = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(g.length + 1).fill(0);
    const root = EXP[i];
    for (let j = 0; j < g.length; j++) {
      next[j] ^= gmul(g[j], root);
      next[j + 1] ^= g[j];
    }
    g = next;
  }
  return g;
}

function rsRemainder(data: number[], poly: number[]): number[] {
  const result = new Uint8Array(data.length + poly.length - 1);
  result.set(data);
  for (let i = 0; i < data.length; i++) {
    const coef = result[i];
    if (coef !== 0) {
      for (let j = 0; j < poly.length; j++) {
        result[i + j] ^= gmul(poly[j], coef);
      }
    }
  }
  return Array.from(result.slice(data.length));
}

interface QRVersionSpec {
  v: number;
  total: number;
  ecPerBlock: number;
  b1: number;
  d1: number;
  b2: number;
  d2: number;
  align: number[];
}

const QR_SPECS_M: (QRVersionSpec | null)[] = [
  null,
  { v: 1, total: 26, ecPerBlock: 10, b1: 1, d1: 16, b2: 0, d2: 0, align: [] },
  { v: 2, total: 44, ecPerBlock: 16, b1: 1, d1: 28, b2: 0, d2: 0, align: [6, 18] },
  { v: 3, total: 70, ecPerBlock: 26, b1: 1, d1: 44, b2: 0, d2: 0, align: [6, 22] },
  { v: 4, total: 100, ecPerBlock: 18, b1: 2, d1: 32, b2: 0, d2: 0, align: [6, 26] },
  { v: 5, total: 134, ecPerBlock: 24, b1: 2, d1: 43, b2: 0, d2: 0, align: [6, 30] },
  { v: 6, total: 172, ecPerBlock: 16, b1: 4, d1: 27, b2: 0, d2: 0, align: [6, 34] },
  { v: 7, total: 196, ecPerBlock: 18, b1: 4, d1: 31, b2: 0, d2: 0, align: [6, 22, 38] },
  { v: 8, total: 242, ecPerBlock: 22, b1: 2, d1: 38, b2: 2, d2: 39, align: [6, 24, 42] },
  { v: 9, total: 292, ecPerBlock: 22, b1: 3, d1: 36, b2: 2, d2: 37, align: [6, 26, 46] },
  { v: 10, total: 346, ecPerBlock: 26, b1: 4, d1: 43, b2: 1, d2: 44, align: [6, 28, 50] }
];

function generateQRMatrix(text: string): boolean[][] {
  const utf8 = new TextEncoder().encode(text);
  const dataLen = utf8.length;

  let spec: QRVersionSpec | null = null;
  for (let v = 1; v <= 10; v++) {
    const s = QR_SPECS_M[v];
    if (!s) continue;
    const totalDataCapacity = s.b1 * s.d1 + s.b2 * s.d2;
    const requiredBits = 4 + (v < 10 ? 8 : 16) + dataLen * 8;
    if (requiredBits <= totalDataCapacity * 8) {
      spec = s;
      break;
    }
  }

  if (!spec) {
    // If text exceeds version 10, fallback to version 10 truncated
    spec = QR_SPECS_M[10]!;
  }

  const totalDataBytes = spec.b1 * spec.d1 + spec.b2 * spec.d2;
  const bitBuffer: number[] = [];
  function pushBits(val: number, numBits: number) {
    for (let i = numBits - 1; i >= 0; i--) {
      bitBuffer.push((val >> i) & 1);
    }
  }

  // 8-bit Byte mode: 0100
  pushBits(0b0100, 4);
  pushBits(Math.min(dataLen, totalDataBytes - 2), spec.v < 10 ? 8 : 16);
  for (let i = 0; i < Math.min(dataLen, totalDataBytes - 2); i++) {
    pushBits(utf8[i], 8);
  }

  // Terminator
  const maxBits = totalDataBytes * 8;
  const termLen = Math.min(4, maxBits - bitBuffer.length);
  pushBits(0, termLen);
  while (bitBuffer.length % 8 !== 0) {
    bitBuffer.push(0);
  }

  const dataBytes: number[] = [];
  for (let i = 0; i < bitBuffer.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bitBuffer[i + j];
    }
    dataBytes.push(b);
  }

  const pad = [0xec, 0x11];
  let padIdx = 0;
  while (dataBytes.length < totalDataBytes) {
    dataBytes.push(pad[padIdx % 2]);
    padIdx++;
  }

  // Split into blocks and compute Reed-Solomon codewords
  const genPoly = rsGenPoly(spec.ecPerBlock);
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;

  for (let i = 0; i < spec.b1; i++) {
    const blockData = dataBytes.slice(offset, offset + spec.d1);
    offset += spec.d1;
    dataBlocks.push(blockData);
    ecBlocks.push(rsRemainder(blockData, genPoly));
  }
  for (let i = 0; i < spec.b2; i++) {
    const blockData = dataBytes.slice(offset, offset + spec.d2);
    offset += spec.d2;
    dataBlocks.push(blockData);
    ecBlocks.push(rsRemainder(blockData, genPoly));
  }

  // Interleave data codewords
  const finalCodewords: number[] = [];
  const maxDataLen = Math.max(spec.d1, spec.d2 || 0);
  for (let i = 0; i < maxDataLen; i++) {
    for (let b = 0; b < dataBlocks.length; b++) {
      if (i < dataBlocks[b].length) {
        finalCodewords.push(dataBlocks[b][i]);
      }
    }
  }
  // Interleave EC codewords
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (let b = 0; b < ecBlocks.length; b++) {
      finalCodewords.push(ecBlocks[b][i]);
    }
  }

  const size = spec.v * 4 + 17;
  const matrix: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const isReserved: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  function setModule(r: number, c: number, val: boolean, reserved = true) {
    matrix[r][c] = val;
    if (reserved) isReserved[r][c] = true;
  }

  // 1. Finder patterns
  function addFinder(top: number, left: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = top + r;
        const nc = left + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
              setModule(nr, nc, true);
            } else {
              setModule(nr, nc, false);
            }
          } else {
            setModule(nr, nc, false);
          }
        }
      }
    }
  }

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // 2. Alignment patterns
  const alignCoords = spec.align;
  for (let i = 0; i < alignCoords.length; i++) {
    for (let j = 0; j < alignCoords.length; j++) {
      const ar = alignCoords[i];
      const ac = alignCoords[j];
      if (
        (ar < 9 && ac < 9) ||
        (ar < 9 && ac > size - 10) ||
        (ar > size - 10 && ac < 9)
      ) {
        continue;
      }
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const isEdge = Math.abs(r) === 2 || Math.abs(c) === 2;
          const isCenter = r === 0 && c === 0;
          setModule(ar + r, ac + c, isEdge || isCenter);
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const val = i % 2 === 0;
    if (!isReserved[6][i]) setModule(6, i, val);
    if (!isReserved[i][6]) setModule(i, 6, val);
  }

  // 4. Dark module
  setModule(size - 8, 8, true);

  // 5. Reserve format info modules
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      isReserved[8][i] = true;
      isReserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    isReserved[8][size - 1 - i] = true;
    isReserved[size - 1 - i][8] = true;
  }

  // 6. Place data bits
  const bits: number[] = [];
  for (let i = 0; i < finalCodewords.length; i++) {
    for (let b = 7; b >= 0; b--) {
      bits.push((finalCodewords[i] >> b) & 1);
    }
  }

  let bitIdx = 0;
  let dir = -1;
  let col = size - 1;

  while (col > 0) {
    if (col === 6) col--;
    for (let i = 0; i < size; i++) {
      const row = dir === -1 ? size - 1 - i : i;
      for (let c = 0; c < 2; c++) {
        const curCol = col - c;
        if (!isReserved[row][curCol]) {
          const bit = bitIdx < bits.length ? bits[bitIdx] === 1 : false;
          matrix[row][curCol] = bit;
          bitIdx++;
        }
      }
    }
    dir = -dir;
    col -= 2;
  }

  // 7. Format Information (Level M, Mask 0)
  function getFormatBits(ec: number, mask: number): number {
    const data = (ec << 3) | mask;
    let rem = data << 10;
    for (let i = 4; i >= 0; i--) {
      if ((rem >> (i + 10)) & 1) {
        rem ^= 0x537 << i;
      }
    }
    return ((data << 10) | rem) ^ 0x5412;
  }

  const maskPattern = 0;
  const ecBits = 0b00; // Level M
  const format = getFormatBits(ecBits, maskPattern);

  // Apply mask: (row + col) % 2 === 0
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isReserved[r][c]) {
        if ((r + c) % 2 === 0) {
          matrix[r][c] = !matrix[r][c];
        }
      }
    }
  }

  // Write format bits
  for (let i = 0; i < 15; i++) {
    const bit = ((format >> i) & 1) === 1;
    if (i < 6) {
      matrix[8][i] = bit;
    } else if (i < 8) {
      matrix[8][i + 1] = bit;
    } else {
      matrix[14 - i][8] = bit;
    }

    if (i < 8) {
      matrix[size - 1 - i][8] = bit;
    } else {
      matrix[8][size - 15 + i] = bit;
    }
  }

  return matrix;
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

  // Generate QR Matrix
  const matrix = useMemo(() => {
    try {
      return generateQRMatrix(url || 'https://sneha.app/download');
    } catch {
      return generateQRMatrix('https://sneha.app/download');
    }
  }, [url]);

  const quietZone = 2;
  const matrixSize = matrix.length;
  const totalSvgSize = matrixSize + quietZone * 2;

  // Build SVG path string for crisp modules
  const pathData = useMemo(() => {
    let d = '';
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r][c]) {
          const x = c + quietZone;
          const y = r + quietZone;
          d += `M${x},${y}h1v1h-1z `;
        }
      }
    }
    return d;
  }, [matrix, matrixSize]);

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
              Point your Android camera at the QR code to download directly to your device.
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

        {/* QR Code Container with Viewfinder Accents */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative p-3 sm:p-4 bg-white border-3 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] rounded-none max-w-full">
            {/* Neo-brutalist Viewfinder Reticle Corners */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-3 border-l-3 border-[#ff4a8a]" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t-3 border-r-3 border-[#ff4a8a]" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-3 border-l-3 border-[#ff4a8a]" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-3 border-r-3 border-[#ff4a8a]" />

            {/* Pure SVG QR Code */}
            <svg
              viewBox={`0 0 ${totalSvgSize} ${totalSvgSize}`}
              className="w-40 h-40 sm:w-56 sm:h-56 max-w-full aspect-square"
              shapeRendering="crispEdges"
              role="img"
              aria-label="Scannable QR Code for SNEHA APK Download"
            >
              {/* Background */}
              <rect width={totalSvgSize} height={totalSvgSize} fill="#ffffff" />
              {/* Modules */}
              <path d={pathData} fill="#1f1a0e" />
            </svg>

            {/* Target Badge Center Overlay / Subtle branding */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#ff7028] text-[#1f1a0e] font-['Bowlby_One'] text-[9px] uppercase tracking-wider border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] whitespace-nowrap">
              ● SCAN TARGET
            </div>
          </div>

          <span className="text-[10px] sm:text-[11px] font-mono text-[#5a4f30] dark:text-[#cdbe9e] mt-3.5 flex items-center gap-1">
            <Sparkles size={11} className="text-[#ff7028]" />
            Pure SVG • Lossless Scalable Vector • ECC Level M
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
