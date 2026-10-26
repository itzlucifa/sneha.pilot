import React, { useState, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  Copy,
  Check,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  HardDrive,
  FileText,
  Key,
  Info
} from 'lucide-react';

export interface ChecksumValidatorProps {
  expectedHash?: string;
  fileName?: string;
  className?: string;
}

const DEFAULT_EXPECTED_HASH = 'c7a409f9e160ef5212384918e90e768393e5066db293bb859c253456860d5e1b';
const DEFAULT_FILE_NAME = 'sneha-v1.0.2-release.apk';

interface FileDetails {
  name: string;
  size: string;
  bytes: number;
  lastModified: string;
}

export const ChecksumValidator: React.FC<ChecksumValidatorProps> = ({
  expectedHash = DEFAULT_EXPECTED_HASH,
  fileName = DEFAULT_FILE_NAME,
  className = ''
}) => {
  const [activeExpectedHash, setActiveExpectedHash] = useState<string>(expectedHash);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [hashingProgress, setHashingProgress] = useState<number>(0);
  const [hashingTimeMs, setHashingTimeMs] = useState<number | null>(null);
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [copiedComputed, setCopiedComputed] = useState<boolean>(false);
  const [copiedExpected, setCopiedExpected] = useState<boolean>(false);
  const [manualCompareInput, setManualCompareInput] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format bytes into readable string
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Format hash into 8-character chunks for human readability
  const chunkHash = (hashStr: string): string[] => {
    const chunks: string[] = [];
    for (let i = 0; i < hashStr.length; i += 8) {
      chunks.push(hashStr.slice(i, i + 8));
    }
    return chunks;
  };

  // Compute SHA-256 hash using Web Crypto API
  const computeSHA256 = useCallback(async (file: File) => {
    setIsHashing(true);
    setHashingProgress(20);
    const startTime = performance.now();

    try {
      setFileDetails({
        name: file.name,
        size: formatBytes(file.size),
        bytes: file.size,
        lastModified: new Date(file.lastModified).toLocaleString()
      });

      setHashingProgress(50);
      const arrayBuffer = await file.arrayBuffer();
      setHashingProgress(80);

      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      const endTime = performance.now();
      setHashingTimeMs(Math.round(endTime - startTime));
      setComputedHash(hashHex);
      setHashingProgress(100);
    } catch (error) {
      console.error('Error computing SHA-256 hash:', error);
      alert('Failed to compute hash for file. Ensure the file is accessible.');
    } finally {
      setIsHashing(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      computeSHA256(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      computeSHA256(file);
    }
  };

  const copyToClipboard = async (text: string, type: 'computed' | 'expected') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'computed') {
        setCopiedComputed(true);
        setTimeout(() => setCopiedComputed(false), 2000);
      } else {
        setCopiedExpected(true);
        setTimeout(() => setCopiedExpected(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Simulators for testing
  const simulateOfficialBuild = () => {
    setIsHashing(true);
    setHashingProgress(40);
    setTimeout(() => {
      setHashingProgress(100);
      setFileDetails({
        name: fileName,
        size: '48.24 MB',
        bytes: 50587216,
        lastModified: new Date().toLocaleString()
      });
      setComputedHash(activeExpectedHash);
      setHashingTimeMs(48);
      setIsHashing(false);
    }, 350);
  };

  const simulateCorruptedBuild = () => {
    setIsHashing(true);
    setHashingProgress(40);
    setTimeout(() => {
      setHashingProgress(100);
      setFileDetails({
        name: 'sneha-v1.0.2-modified.apk',
        size: '48.25 MB',
        bytes: 50591240,
        lastModified: new Date().toLocaleString()
      });
      setComputedHash('8f3b2029ad7e59f428c049d9b626e382025e98bb4501a5b67e34c99026117ac1');
      setHashingTimeMs(52);
      setIsHashing(false);
    }, 350);
  };

  const resetValidator = () => {
    setComputedHash(null);
    setFileDetails(null);
    setHashingTimeMs(null);
    setHashingProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Verification status comparison
  const isMatch = computedHash !== null && computedHash.toLowerCase() === activeExpectedHash.toLowerCase();
  const isMismatch = computedHash !== null && computedHash.toLowerCase() !== activeExpectedHash.toLowerCase();

  return (
    <div
      className={`bg-[#f5ecd4] dark:bg-[#1c170d] text-[#1f1a0e] dark:text-[#f5ecd4] border-3 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[6px_6px_0_#1f1a0e] dark:shadow-[6px_6px_0_#000000] p-4 sm:p-6 lg:p-8 transition-all overflow-hidden ${className}`}
    >
      {/* Top Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-3 border-[#1f1a0e] dark:border-[#eedcb4]/20">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-[#0e4dff] text-white text-[10px] font-mono font-bold uppercase tracking-wider border border-[#1f1a0e]">
              Web Crypto SHA-256
            </span>
            <span className="px-2.5 py-0.5 bg-[#ff7028] text-[#1f1a0e] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#1f1a0e]">
              Client-Side Integrity
            </span>
            <span className="px-2.5 py-0.5 bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#1f1a0e]">
              Zero-Cloud Upload
            </span>
          </div>
          <h3 className="font-['Bowlby_One'] text-xl sm:text-3xl uppercase tracking-tight text-[#1f1a0e] dark:text-[#fdfaf2] break-words">
            Cryptographic Checksum Validator
          </h3>
          <p className="font-['Crimson_Pro'] italic text-xs sm:text-sm text-[#5a4f30] dark:text-[#cdbe9e] mt-1">
            Verify your downloaded SNEHA APK against the official release fingerprint before installation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="px-3 py-1.5 bg-[#eedcb4] dark:bg-[#271f13] text-[#1f1a0e] dark:text-[#fdfaf2] text-xs font-bold uppercase border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[2px_2px_0_#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Key size={13} />
            <span>{showManualInput ? 'Hide Hash Config' : 'Custom Hash'}</span>
          </button>
          {computedHash && (
            <button
              onClick={resetValidator}
              className="px-3 py-1.5 bg-[#ff4a8a] text-[#1f1a0e] text-xs font-bold uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Hash Configuration Drawer */}
      {showManualInput && (
        <div className="mb-6 p-4 bg-[#eedcb4]/60 dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/20 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#1f1a0e] dark:text-[#fdfaf2]">
              Set Custom Expected SHA-256 Hash:
            </label>
            <button
              onClick={() => setActiveExpectedHash(DEFAULT_EXPECTED_HASH)}
              className="text-[11px] font-mono text-[#0e4dff] underline hover:text-[#1f1a0e] cursor-pointer"
            >
              Restore Default (v1.0.2)
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCompareInput || activeExpectedHash}
              onChange={(e) => {
                setManualCompareInput(e.target.value.trim());
                setActiveExpectedHash(e.target.value.trim());
              }}
              placeholder="Paste custom 64-character SHA-256 hex string..."
              className="flex-1 px-3 py-2 bg-white dark:bg-[#1a140b] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 font-mono text-xs text-[#1f1a0e] dark:text-[#fdfaf2] focus:outline-none focus:ring-2 focus:ring-[#0e4dff]"
            />
          </div>
        </div>
      )}

      {/* Drag & Drop File Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 sm:p-10 border-3 border-dashed cursor-pointer transition-all text-center relative ${
          isDragOver
            ? 'border-[#ff4a8a] bg-[#ff4a8a]/10 scale-[1.01]'
            : 'border-[#1f1a0e] dark:border-[#eedcb4]/40 bg-[#eedcb4]/30 dark:bg-[#120e07] hover:bg-[#eedcb4]/70 dark:hover:bg-[#221a0f]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".apk,application/vnd.android.package-archive,*/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="w-14 h-14 bg-[#0e4dff] text-white flex items-center justify-center border-2 border-[#1f1a0e] shadow-[3px_3px_0_#1f1a0e] mb-3">
            <Upload size={28} />
          </div>
          <span className="font-['Bowlby_One'] text-base sm:text-lg uppercase tracking-tight text-[#1f1a0e] dark:text-[#fdfaf2]">
            {isDragOver ? 'DROP YOUR .APK FILE HERE' : 'CLICK TO BROWSE OR DRAG & DROP .APK FILE'}
          </span>
          <p className="font-['Crimson_Pro'] italic text-xs sm:text-sm text-[#5a4f30] dark:text-[#cdbe9e] mt-1 max-w-md">
            File is processed entirely inside your local browser via WebAssembly Web Crypto API. No files are uploaded to any server.
          </p>

          {/* Target File Label */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] text-xs font-mono font-bold text-[#1f1a0e] dark:text-[#fdfaf2] shadow-[2px_2px_0_#1f1a0e]">
            <FileCheck size={14} className="text-[#0e4dff]" />
            <span>Target: {fileName}</span>
          </div>
        </div>

        {/* Hashing Progress Bar */}
        {isHashing && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-xs font-mono font-bold mb-1">
              <span>CALCULATING SHA-256 DIGEST...</span>
              <span>{hashingProgress}%</span>
            </div>
            <div className="w-full h-3 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] overflow-hidden">
              <div
                className="h-full bg-[#0e4dff] transition-all duration-300"
                style={{ width: `${hashingProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Test Simulator Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 p-3 bg-[#eedcb4]/50 dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/20">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1f1a0e] dark:text-[#fdfaf2] flex items-center gap-1.5">
          <Info size={14} className="text-[#ff7028]" />
          <span>Interactive Testing Suite:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={simulateOfficialBuild}
            className="px-2.5 py-1 bg-[#10b981] text-white text-[11px] font-bold uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#1f1a0e] transition-all cursor-pointer"
          >
            Simulate Official Build
          </button>
          <button
            onClick={simulateCorruptedBuild}
            className="px-2.5 py-1 bg-[#ff7028] text-[#1f1a0e] text-[11px] font-bold uppercase border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] hover:bg-[#1f1a0e] hover:text-[#f5ecd4] transition-all cursor-pointer"
          >
            Simulate Tampered Build
          </button>
        </div>
      </div>

      {/* Verification Status Badge */}
      <div className="mt-6">
        {computedHash === null && !isHashing && (
          <div className="p-4 bg-[#eedcb4]/40 dark:bg-[#1a140b] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/20 flex items-center gap-3">
            <Clock size={20} className="text-[#5a4f30] dark:text-[#cdbe9e] shrink-0" />
            <div className="text-xs">
              <span className="font-bold uppercase tracking-wider block text-[#1f1a0e] dark:text-[#fdfaf2]">
                STATUS: AWAITING APK SELECTION
              </span>
              <span className="font-['Crimson_Pro'] italic text-[#5a4f30] dark:text-[#cdbe9e]">
                Select or drag a file above, or use the interactive simulation buttons to verify hash integrity.
              </span>
            </div>
          </div>
        )}

        {isMatch && (
          <div className="p-4 bg-[#10b981] text-white border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] flex items-start sm:items-center gap-3 sm:gap-4 animate-fade-in">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-[#10b981] flex items-center justify-center border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] shrink-0">
              <ShieldCheck size={26} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="font-['Bowlby_One'] text-sm sm:text-lg uppercase tracking-tight text-white flex flex-wrap items-center gap-2">
                <span>VERIFIED OFFICIAL SNEHA BUILD</span>
                <span className="px-2 py-0.5 bg-white text-[#10b981] text-[10px] font-mono font-black border border-[#1f1a0e] shrink-0">
                  MATCH 100%
                </span>
              </div>
              <p className="font-sans text-xs text-white/95 font-medium mt-0.5 break-words">
                The computed cryptographic hash exactly matches the official release signature signed by SNEHA release engineering. The package is safe to sideload.
              </p>
            </div>
          </div>
        )}

        {isMismatch && (
          <div className="p-4 bg-[#ff4a8a] text-[#1f1a0e] border-3 border-[#1f1a0e] shadow-[4px_4px_0_#1f1a0e] flex items-start sm:items-center gap-3 sm:gap-4 animate-fade-in">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-[#ff4a8a] flex items-center justify-center border-2 border-[#1f1a0e] shadow-[2px_2px_0_#1f1a0e] shrink-0">
              <ShieldAlert size={26} strokeWidth={2.5} />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="font-['Bowlby_One'] text-sm sm:text-lg uppercase tracking-tight text-[#1f1a0e] flex flex-wrap items-center gap-2">
                <span>CHECKSUM MISMATCH - POTENTIAL TAMPERING</span>
                <span className="px-2 py-0.5 bg-[#1f1a0e] text-[#ff4a8a] text-[10px] font-mono font-black border border-[#1f1a0e] shrink-0">
                  CORRUPTED
                </span>
              </div>
              <p className="font-sans text-xs text-[#1f1a0e] font-bold mt-0.5 break-words">
                WARNING: The SHA-256 fingerprint does not match the official release! Do not install this package on your Android device. Re-download from the official distribution channel.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Metadata Details */}
      {fileDetails && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[2px_2px_0_#1f1a0e]">
            <div className="flex items-center gap-1.5 text-[#5a4f30] dark:text-[#cdbe9e] mb-1">
              <FileText size={13} />
              <span className="text-[10px] font-bold uppercase">File Name</span>
            </div>
            <div className="font-bold text-[#1f1a0e] dark:text-[#fdfaf2] truncate" title={fileDetails.name}>
              {fileDetails.name}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[2px_2px_0_#1f1a0e]">
            <div className="flex items-center gap-1.5 text-[#5a4f30] dark:text-[#cdbe9e] mb-1">
              <HardDrive size={13} />
              <span className="text-[10px] font-bold uppercase">Size</span>
            </div>
            <div className="font-bold text-[#1f1a0e] dark:text-[#fdfaf2]">
              {fileDetails.size}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[2px_2px_0_#1f1a0e]">
            <div className="flex items-center gap-1.5 text-[#5a4f30] dark:text-[#cdbe9e] mb-1">
              <Clock size={13} />
              <span className="text-[10px] font-bold uppercase">Digest Time</span>
            </div>
            <div className="font-bold text-[#1f1a0e] dark:text-[#fdfaf2]">
              {hashingTimeMs !== null ? `${hashingTimeMs} ms` : '—'}
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[2px_2px_0_#1f1a0e]">
            <div className="flex items-center gap-1.5 text-[#5a4f30] dark:text-[#cdbe9e] mb-1">
              <Key size={13} />
              <span className="text-[10px] font-bold uppercase">Algorithm</span>
            </div>
            <div className="font-bold text-[#0e4dff]">
              SHA-256 (256-bit)
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic Hash Comparison Matrix */}
      <div className="mt-6 space-y-4">
        {/* Expected Official Hash */}
        <div className="p-4 bg-white dark:bg-[#171108] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[3px_3px_0_#1f1a0e]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#0e4dff] rounded-none inline-block border border-[#1f1a0e]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1f1a0e] dark:text-[#fdfaf2]">
                Expected Official SHA-256 Fingerprint:
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(activeExpectedHash, 'expected')}
              className="text-[11px] font-bold uppercase tracking-wider text-[#0e4dff] hover:text-[#1f1a0e] flex items-center gap-1 cursor-pointer"
            >
              {copiedExpected ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
              <span>{copiedExpected ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>

          {/* Monospace Chunked Hash Display */}
          <div className="font-mono text-xs sm:text-sm bg-[#eedcb4]/30 dark:bg-[#221a0f] p-3 border border-[#1f1a0e] dark:border-[#eedcb4]/20 break-all select-all flex flex-wrap gap-x-2 gap-y-1">
            {chunkHash(activeExpectedHash).map((chunk, idx) => (
              <span key={idx} className="bg-white/80 dark:bg-[#1a140b] px-1 py-0.5 border border-[#1f1a0e]/20">
                {chunk}
              </span>
            ))}
          </div>
        </div>

        {/* Computed Local Hash */}
        <div className="p-4 bg-white dark:bg-[#171108] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/30 shadow-[3px_3px_0_#1f1a0e]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-none inline-block border border-[#1f1a0e] ${
                  computedHash === null
                    ? 'bg-[#5a4f30]'
                    : isMatch
                    ? 'bg-[#10b981]'
                    : 'bg-[#ff4a8a]'
                }`}
              />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1f1a0e] dark:text-[#fdfaf2]">
                Computed File SHA-256 Digest:
              </span>
            </div>

            {computedHash && (
              <button
                onClick={() => copyToClipboard(computedHash, 'computed')}
                className="text-[11px] font-bold uppercase tracking-wider text-[#ff4a8a] hover:text-[#1f1a0e] flex items-center gap-1 cursor-pointer"
              >
                {copiedComputed ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                <span>{copiedComputed ? 'COPIED' : 'COPY'}</span>
              </button>
            )}
          </div>

          {/* Computed Hash Display */}
          <div className="font-mono text-xs sm:text-sm bg-[#eedcb4]/30 dark:bg-[#221a0f] p-3 border border-[#1f1a0e] dark:border-[#eedcb4]/20 break-all select-all min-h-[46px] flex flex-wrap items-center gap-x-2 gap-y-1">
            {computedHash ? (
              chunkHash(computedHash).map((chunk, idx) => {
                const expectedChunk = chunkHash(activeExpectedHash)[idx];
                const matchesChunk = expectedChunk === chunk;
                return (
                  <span
                    key={idx}
                    className={`px-1 py-0.5 border ${
                      matchesChunk
                        ? 'bg-[#10b981]/20 border-[#10b981] text-[#065f46] dark:text-[#34d399] font-bold'
                        : 'bg-[#ff4a8a]/20 border-[#ff4a8a] text-[#9f1239] dark:text-[#f43f5e] font-bold'
                    }`}
                  >
                    {chunk}
                  </span>
                );
              })
            ) : (
              <span className="text-xs font-['Crimson_Pro'] italic text-[#5a4f30] dark:text-[#cdbe9e]">
                No file selected. Drop an APK or choose a sample simulation above to calculate.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Security Note / Cryptographic Assurance */}
      <div className="mt-6 p-4 bg-[#eedcb4]/50 dark:bg-[#271f13] border-2 border-[#1f1a0e] dark:border-[#eedcb4]/20 text-xs">
        <div className="font-['Bowlby_One'] uppercase text-[11px] text-[#1f1a0e] dark:text-[#fdfaf2] mb-1 flex items-center gap-1.5">
          <AlertTriangle size={14} className="text-[#ff7028]" />
          <span>Why Verify SHA-256 Hashes?</span>
        </div>
        <p className="font-['Crimson_Pro'] italic text-xs text-[#2a2515] dark:text-[#e8deca] leading-relaxed">
          Because SNEHA contains on-device AI models and processes sensitive voice and screen contexts offline, verifying that the downloaded binary exactly matches the core cryptographic digest prevents Man-In-The-Middle (MITM) attacks, proxy injection, and truncated incomplete downloads.
        </p>
      </div>
    </div>
  );
};

export default ChecksumValidator;
