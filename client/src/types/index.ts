export type Verdict = 'AI_GENERATED' | 'LIKELY_AI' | 'UNCERTAIN' | 'LIKELY_REAL' | 'REAL';

export interface ScanResult {
  id: string;
  imageUrl: string;
  verdict: Verdict;
  confidence_ai: number;
  confidence_real: number;
  is_deepfake: boolean;
  deepfake_score: number;
  face_count: number;
  scan_time_ms: number;
  originalName?: string;
  fileSize?: number;
  createdAt: string;
}

export interface HistoryScan extends ScanResult {
  originalName: string;
  fileSize: number;
  publicId: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface HistoryResponse {
  scans: HistoryScan[];
  pagination: PaginationInfo;
}

export type UploadState =
  | { stage: 'idle' }
  | { stage: 'selecting'; file: File; preview: string }
  | { stage: 'uploading'; progress: number; file: File; preview: string }
  | { stage: 'analyzing'; file: File; preview: string }
  | { stage: 'done'; result: ScanResult }
  | { stage: 'error'; message: string; code?: string };

export interface VerdictMeta {
  label: string;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  icon: string;
  description: string;
}
