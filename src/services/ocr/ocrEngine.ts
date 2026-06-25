import { createWorker } from 'tesseract.js';
import { DEFAULT_OCR_OPTIONS } from './types';
import type { OcrOptions, OcrResult, OcrQualityScore } from './types';
import { imageEnhancer } from './imageEnhancer';
import { ocrProfiles } from './ocrProfiles';
import { aiEngine } from '../ai/aiEngine';

export const ocrEngine = {
  /**
   * Evaluates Tesseract confidence and determines the quality class
   */
  calculateQualityScore(confidence: number): OcrQualityScore {
    if (confidence >= 85) return 'excellent';
    if (confidence >= 70) return 'good';
    if (confidence >= 50) return 'average';
    return 'poor';
  },

  /**
   * Main OCR processor. Enhances image, executes local browser OCR, evaluates quality,
   * and runs AI-assisted text correction if quality score is sub-optimal.
   */
  async process(
    imageFile: File,
    options?: Partial<OcrOptions>
  ): Promise<OcrResult> {
    const startTime = Date.now();
    const config = { ...DEFAULT_OCR_OPTIONS, ...options };

    try {
      // 1. Resolve Profile Preprocessing Config
      const enhancementConfig = ocrProfiles.getProfileConfig(config.profileMode);

      // 2. Run local canvas preprocessing
      console.log(`OCREngine: Preprocessing scan with profile "${config.profileMode}"...`);
      const enhancedDataUrl = await imageEnhancer.enhance(imageFile, enhancementConfig);

      // 3. Initialize Tesseract Browser Worker
      console.log(`OCREngine: Initializing browser OCR worker for language "${config.language}"...`);
      const worker = await createWorker(config.language);

      // 4. Perform character recognition
      console.log('OCREngine: Running character recognition locally in memory...');
      const { data } = await worker.recognize(enhancedDataUrl);
      const rawText = data.text || '';
      const confidence = data.confidence || 0;

      // Clean up worker memory
      await worker.terminate();

      const qualityScore = this.calculateQualityScore(confidence);
      console.log(`OCREngine: Local OCR complete. Confidence: ${confidence}%, Quality: ${qualityScore}`);

      // 5. Smart OCR Routing decision:
      // Skip AI if quality is 'excellent' AND the user hasn't explicitly forced AI cleanup
      const shouldRunAiCleanup = 
        config.useAiCleanup || 
        qualityScore === 'poor' || 
        qualityScore === 'average';

      let finalOutputText = rawText;
      let aiEnhanced = false;

      if (shouldRunAiCleanup && rawText.trim().length > 0) {
        console.log('OCREngine: Quality is sub-optimal or AI cleanup requested. Invoking AI Engine...');
        const aiResult = await aiEngine.execute(rawText, 'ocr', {
          targetLanguage: config.language === 'eng' ? 'English' : config.language === 'hin' ? 'Hindi' : 'Gujarati',
          isPrivate: true // Guarantee complete privacy of document contents
        });

        if (aiResult.success) {
          finalOutputText = aiResult.data;
          aiEnhanced = true;
          console.log('OCREngine: AI correction complete.');
        } else {
          console.warn('OCREngine: AI cleanup failed, falling back to raw OCR text:', aiResult.error);
        }
      }

      const latency = Date.now() - startTime;

      return {
        success: true,
        text: finalOutputText,
        confidence,
        qualityScore,
        language: config.language,
        aiEnhanced,
        latency
      };
    } catch (err: any) {
      console.error('OCREngine Error:', err);
      return {
        success: false,
        text: '',
        confidence: 0,
        qualityScore: 'poor',
        language: config.language,
        aiEnhanced: false,
        latency: Date.now() - startTime,
        error: err.message || 'An error occurred during local document processing.'
      };
    }
  }
};
