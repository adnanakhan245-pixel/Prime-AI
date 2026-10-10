// Service for managing uploaded CSV files with mandatory 24-hour auto-deletion
// RULE 3: Every CSV file uploaded must auto-delete after 24 hours. Show timer to user: "This file will be deleted after 24h"

export interface UploadedCsvFile {
  id: string;
  filename: string;
  sizeBytes: number;
  uploadedAt: number; // Unix timestamp ms
  expiresAt: number;  // Exactly uploadedAt + 24 * 60 * 60 * 1000
  rowCount: number;
  summary?: string;
}

const STORAGE_KEY = 'prime_uploaded_csv_files_v1';
const EXPIRY_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds

/**
 * Registers an uploaded CSV file with a strict 24-hour expiration timestamp
 */
export function registerUploadedCsv(
  filename: string,
  sizeBytes: number,
  rowCount: number,
  summary?: string
): UploadedCsvFile {
  const now = Date.now();
  const file: UploadedCsvFile = {
    id: `csv_${now}_${Math.random().toString(36).substring(2, 7)}`,
    filename,
    sizeBytes,
    uploadedAt: now,
    expiresAt: now + EXPIRY_DURATION_MS,
    rowCount,
    summary: summary || `${rowCount} records processed`
  };

  const current = getActiveCsvFiles();
  const updated = [file, ...current];
  saveToStorage(updated);

  // Dispatch custom event for reactive UI updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('prime:csv_files_updated', { detail: { file } }));
  }

  return file;
}

/**
 * Retrieves all non-expired CSV files, purging any that are older than 24 hours
 */
export function getActiveCsvFiles(): UploadedCsvFile[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const files: UploadedCsvFile[] = JSON.parse(raw);
    const now = Date.now();

    // Filter out files whose 24-hour window has lapsed
    const active = files.filter(f => f.expiresAt > now);

    // If any expired, persist the cleaned list
    if (active.length !== files.length) {
      saveToStorage(active);
    }

    return active;
  } catch (err) {
    console.warn('Could not read uploaded CSV files from storage:', err);
    return [];
  }
}

/**
 * Manually deletes a CSV file before the 24-hour auto-expiration
 */
export function deleteCsvFile(id: string): void {
  const active = getActiveCsvFiles();
  const updated = active.filter(f => f.id !== id);
  saveToStorage(updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('prime:csv_files_updated'));
  }
}

/**
 * Formats the countdown timer remaining until the 24-hour auto-deletion
 */
export function formatTimeRemaining(expiresAt: number): {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  isExpired: boolean;
} {
  const diff = expiresAt - Date.now();

  if (diff <= 0) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      formatted: 'Expired & Auto-Deleted',
      isExpired: true
    };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const formatted = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

  return {
    hours,
    minutes,
    seconds,
    formatted,
    isExpired: false
  };
}

/**
 * Internal helper to save to local storage
 */
function saveToStorage(files: UploadedCsvFile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  } catch (err) {
    console.warn('Could not write CSV list to local storage:', err);
  }
}
