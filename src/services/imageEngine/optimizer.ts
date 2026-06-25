import type { ImageCategory } from './analyzer';

export interface OptimizationPreset {
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
  lossless: boolean;
  enhanceContrast: boolean;
  preserveAlpha: boolean;
}

export const imageOptimizer = {
  /**
   * Resolves the optimal presets depending on classified image type
   */
  getPreset(category: ImageCategory): OptimizationPreset {
    switch (category) {
      case 'Photo':
        return {
          format: 'jpeg', // Standard lossy format
          quality: 0.75, // Good quality-to-size trade off
          lossless: false,
          enhanceContrast: false,
          preserveAlpha: false
        };

      case 'Screenshot':
        return {
          format: 'webp', // WebP is highly efficient for screenshots
          quality: 0.85,
          lossless: true, // Lossless compression preserves sharp font letters
          enhanceContrast: false,
          preserveAlpha: false
        };

      case 'Logo':
      case 'Illustration':
        return {
          format: 'png', // Solid blocks and flat colors are preserved best in PNG
          quality: 0.80,
          lossless: true,
          enhanceContrast: false,
          preserveAlpha: true
        };

      case 'Document Scan':
        return {
          format: 'jpeg',
          quality: 0.65,
          lossless: false,
          enhanceContrast: true, // Enhances readability of scanned texts
          preserveAlpha: false
        };

      case 'Transparent Graphic':
        return {
          format: 'png',
          quality: 0.80,
          lossless: true,
          enhanceContrast: false,
          preserveAlpha: true // Active transparent pixels are preserved
        };

      default:
        return {
          format: 'webp',
          quality: 0.80,
          lossless: false,
          enhanceContrast: false,
          preserveAlpha: true
        };
    }
  },

  /**
   * Applies inline pixel enhancements to canvas context (e.g. binarization for Document Scans)
   */
  applyEnhancements(ctx: CanvasRenderingContext2D, width: number, height: number, preset: OptimizationPreset): void {
    if (!preset.enhanceContrast) return;

    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Greyscale conversion (brightness formula)
        const v = 0.299 * r + 0.587 * g + 0.114 * b;

        // Apply high-contrast thresholding (Document binarization)
        let finalVal = v;
        if (v > 128) {
          finalVal = Math.min(255, v * 1.2); // make light areas lighter
        } else {
          finalVal = Math.max(0, v * 0.8); // make dark texts darker
        }

        data[i] = finalVal;
        data[i + 1] = finalVal;
        data[i + 2] = finalVal;
      }

      ctx.putImageData(imgData, 0, 0);
    } catch (e) {
      console.warn('Optimizer: Enhancements canvas write skipped due to security origins.', e);
    }
  }
};
