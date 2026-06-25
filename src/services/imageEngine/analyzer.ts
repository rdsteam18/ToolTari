import { imageMetadata } from './metadata';

export type ImageCategory = 'Photo' | 'Screenshot' | 'Logo' | 'Illustration' | 'Document Scan' | 'Transparent Graphic';

export interface ImageProfile {
  name: string;
  width: number;
  height: number;
  fileSize: number;
  fileSizeReadable: string;
  format: string;
  category: ImageCategory;
  transparency: boolean;
  orientation: 'portrait' | 'landscape' | 'square';
  metadata: Record<string, any>;
}

export const imageAnalyzer = {
  /**
   * Generates a comprehensive ImageProfile, running file reading and canvas pixel classification
   */
  async analyze(file: File): Promise<ImageProfile> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const metadataInfo = await imageMetadata.read(file);
    
    return new Promise<ImageProfile>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        
        // 1. Determine orientation
        let orientation: 'portrait' | 'landscape' | 'square' = 'square';
        if (width > height) orientation = 'landscape';
        else if (height > width) orientation = 'portrait';

        // 2. Perform pixel analysis on a small 50x50 grid for privacy and performance
        const { hasTransparency, uniqueColors, isBinarized } = this.analyzePixels(img);

        // 3. Smart Classification presets
        let category: ImageCategory = 'Photo';
        if (ext === 'svg') {
          category = 'Illustration';
        } else if (hasTransparency) {
          category = 'Transparent Graphic';
        } else if (isBinarized) {
          category = 'Document Scan';
        } else if (uniqueColors < 50) {
          category = 'Logo';
        } else if (uniqueColors < 200 && (ext === 'png' || width > 1000)) {
          // Screenshots are typically PNG and have repeating UI colors
          category = 'Screenshot';
        } else if (uniqueColors < 120) {
          category = 'Illustration';
        }

        URL.revokeObjectURL(url);

        resolve({
          name: file.name,
          width,
          height,
          fileSize: file.size,
          fileSizeReadable: this.formatBytes(file.size),
          format: ext.toUpperCase(),
          category,
          transparency: hasTransparency,
          orientation,
          metadata: {
            ...metadataInfo.exif,
            dimensions: `${width}x${height}px`,
            colorCountSample: uniqueColors
          }
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Failed to load image structure for analysis.`));
      };

      img.src = url;
    });
  },

  /**
   * Helper to draw image onto a 50x50 canvas to extract pixel metrics
   */
  analyzePixels(img: HTMLImageElement): { hasTransparency: boolean; uniqueColors: number; isBinarized: boolean } {
    const canvas = document.createElement('canvas');
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { hasTransparency: false, uniqueColors: 100, isBinarized: false };
    }

    ctx.drawImage(img, 0, 0, 50, 50);
    const imgData = ctx.getImageData(0, 0, 50, 50);
    const data = imgData.data;

    let hasTransparency = false;
    const colorSet = new Set<string>();
    let darkPixels = 0;
    let lightPixels = 0;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Transparency Check
      if (a < 255) {
        hasTransparency = true;
      }

      // Unique Colors Count
      const rgbHex = `${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
      colorSet.add(rgbHex);

      // Contrast / Binarization check (Document Scan indicator: mostly black or white pixels)
      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      if (brightness < 60) darkPixels++;
      else if (brightness > 200) lightPixels++;
    }

    const totalSamplePixels = 50 * 50;
    const isBinarized = (darkPixels + lightPixels) > (totalSamplePixels * 0.9); // 90% is black/white

    return {
      hasTransparency,
      uniqueColors: colorSet.size,
      isBinarized
    };
  },

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};
