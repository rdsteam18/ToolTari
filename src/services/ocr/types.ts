export type OcrProfileMode =
  | 'document'
  | 'receipt'
  | 'idcard'
  | 'book'
  | 'table'
  | 'notes';

export type OcrQualityScore = 'excellent' | 'good' | 'average' | 'poor';

export interface OcrResult {
  success: boolean;
  text: string;
  confidence: number; // 0 to 100
  qualityScore: OcrQualityScore;
  language: string;
  aiEnhanced: boolean;
  latency: number;
  error?: string;
}

export interface OcrOptions {
  profileMode: OcrProfileMode;
  language: 'eng' | 'hin' | 'guj';
  useAiCleanup?: boolean;
}

export const DEFAULT_OCR_OPTIONS: OcrOptions = {
  profileMode: 'document',
  language: 'eng',
  useAiCleanup: false
};
