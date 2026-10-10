import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, Trash2, CheckCircle2 } from 'lucide-react';
import { UploadedCsvFile, formatTimeRemaining, deleteCsvFile } from '../services/csvStore';

interface CsvAutoDeleteTimerProps {
  file: UploadedCsvFile;
  onDeleted?: () => void;
  className?: string;
  compact?: boolean;
}

export const CsvAutoDeleteTimer: React.FC<CsvAutoDeleteTimerProps> = ({
  file,
  onDeleted,
  className = '',
  compact = false
}) => {
  const [remaining, setRemaining] = useState(() => formatTimeRemaining(file.expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = formatTimeRemaining(file.expiresAt);
      setRemaining(updated);

      if (updated.isExpired) {
        deleteCsvFile(file.id);
        if (onDeleted) onDeleted();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [file.id, file.expiresAt, onDeleted]);

  const handleDeleteNow = () => {
    deleteCsvFile(file.id);
    if (onDeleted) onDeleted();
  };

  // Calculate percentage of 24h elapsed
  const totalDuration = 24 * 60 * 60 * 1000;
  const elapsed = Math.max(0, totalDuration - (file.expiresAt - Date.now()));
  const percentElapsed = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  if (compact) {
    return (
      <div className={`p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#FFD700] animate-pulse shrink-0" />
          <span className="font-semibold text-white">This file will be deleted after 24h</span>
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/50 text-[#FFD700] border border-[#FFD700]/30 font-bold">
            {remaining.formatted} remaining
          </span>
        </div>
        <button
          onClick={handleDeleteNow}
          className="text-white/40 hover:text-rose-400 p-1 transition-colors cursor-pointer"
          title="Delete Immediately"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-2xl bg-[#141414] border border-amber-500/30 shadow-lg text-white space-y-3 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Auto-Purge Telemetry
            </span>
            <span className="text-xs font-mono text-white/50">{file.filename}</span>
          </div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FFD700] animate-pulse" />
            <span>This file will be deleted after 24h</span>
          </h4>
        </div>

        <div className="text-right">
          <div className="text-sm font-mono font-black text-[#FFD700] bg-black/60 px-3 py-1 rounded-xl border border-[#FFD700]/30 shadow-inner">
            {remaining.formatted}
          </div>
          <span className="text-[10px] text-white/40 block mt-0.5">Time remaining</span>
        </div>
      </div>

      {/* 24-Hour Progress Bar */}
      <div className="space-y-1">
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#FFD700] to-rose-500 transition-all duration-1000"
            style={{ width: `${100 - percentElapsed}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/40 font-mono">
          <span>Uploaded: {new Date(file.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>Zero-Retention Guarantee (24h Hard Limit)</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400 text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>No permanent storage • Data auto-wiped from server memory</span>
        </div>
        <button
          onClick={handleDeleteNow}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer font-medium"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete Now</span>
        </button>
      </div>
    </div>
  );
};
