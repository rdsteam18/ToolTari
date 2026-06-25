import type { OcrProfileMode } from './types';
import type { ImageEnhancerConfig } from './imageEnhancer';

export const ocrProfiles = {
  /**
   * Returns the corresponding image enhancement parameters for a given profile mode
   */
  getProfileConfig(mode: OcrProfileMode): ImageEnhancerConfig {
    switch (mode) {
      case 'receipt':
        return {
          grayscale: true,
          contrast: 50, // High contrast stretch
          binarize: false,
          adaptiveThreshold: true, // Key for uneven lighting and thermal paper text
          sharpen: true
        };
      
      case 'idcard':
        return {
          grayscale: true,
          contrast: 60, // Very high contrast
          binarize: true, // Stark black and white separation
          adaptiveThreshold: false,
          sharpen: true
        };
      
      case 'book':
        return {
          grayscale: true,
          contrast: 40,
          binarize: false,
          adaptiveThreshold: true, // Solves page-fold shadows
          sharpen: true
        };
      
      case 'table':
        return {
          grayscale: true,
          contrast: 30,
          binarize: true,
          adaptiveThreshold: false,
          sharpen: true
        };
      
      case 'notes':
        return {
          grayscale: true,
          contrast: 20, // Low contrast modification
          binarize: false,
          adaptiveThreshold: false, // Prevents ink loops from getting detached
          sharpen: false // Avoid noise enhancement in handwriting
        };
      
      case 'document':
      default:
        return {
          grayscale: true,
          contrast: 30,
          binarize: false,
          adaptiveThreshold: false,
          sharpen: true
        };
    }
  }
};
