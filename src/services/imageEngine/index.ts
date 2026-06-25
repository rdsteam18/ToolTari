import { imageValidator } from './validator';
import { imageAnalyzer } from './analyzer';
import { imageOptimizer } from './optimizer';
import { imageEditor } from './editor';
import { imageMetadata } from './metadata';
import { imageExport } from './export';
import { formatMatrix } from './matrix';

export interface ImageMeta {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  lastModified: number;
}

export const imageEngine = {
  // Expose sub-engines for modular access
  validator: imageValidator,
  analyzer: imageAnalyzer,
  optimizer: imageOptimizer,
  editor: imageEditor,
  metadata: imageMetadata,
  exporter: imageExport,
  matrix: formatMatrix,

  /**
   * Loads image element
   */
  loadImage(file: File): Promise<HTMLImageElement> {
    return imageEditor.loadImage(file);
  },

  /**
   * Compresses image using smart classification preset overrides
   */
  async compressImage(file: File, customQuality?: number): Promise<Blob> {
    // 1. Validation
    await imageValidator.validate(file);

    // 2. Classify and generate profile
    const profile = await imageAnalyzer.analyze(file);
    const preset = imageOptimizer.getPreset(profile.category);

    // 3. Resolve quality and formats
    const finalQuality = customQuality !== undefined ? customQuality : preset.quality;
    const finalFormat = preset.format;

    // 4. Render to canvas
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    ctx.drawImage(img, 0, 0);

    // 5. Apply category specific binarization or contrast filters
    imageOptimizer.applyEnhancements(ctx, canvas.width, canvas.height, preset);

    // 6. Export to blob
    const resultBlob = await imageExport.exportCanvas(canvas, finalFormat, finalQuality);

    return resultBlob;
  },

  /**
   * Converts image formats
   */
  async convertImage(file: File, targetFormat: string): Promise<Blob> {
    await imageValidator.validate(file);
    return imageEditor.loadImage(file).then((img) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');
      ctx.drawImage(img, 0, 0);
      return imageExport.exportCanvas(canvas, targetFormat);
    });
  },

  /**
   * Resizes image dimensions
   */
  async resizeImage(file: File, width: number, height: number): Promise<Blob> {
    await imageValidator.validate(file);
    return imageEditor.resize(file, { width, height, maintainAspect: true });
  },

  /**
   * Crops image selection
   */
  async cropImage(file: File, x: number, y: number, width: number, height: number): Promise<Blob> {
    await imageValidator.validate(file);
    return imageEditor.crop(file, x, y, width, height, 'rectangle');
  },

  /**
   * Rotates canvas degrees
   */
  async rotateImage(file: File, angleDegrees: number): Promise<Blob> {
    await imageValidator.validate(file);
    return imageEditor.rotate(file, angleDegrees);
  },

  /**
   * Applies CSS visual filters
   */
  async applyFilter(file: File, filterName: 'grayscale' | 'sepia' | 'blur' | 'invert'): Promise<Blob> {
    await imageValidator.validate(file);
    return imageEditor.applyFilter(file, filterName);
  },

  /**
   * Watermarks text overlays
   */
  async addWatermark(file: File, text: string): Promise<Blob> {
    await imageValidator.validate(file);
    return imageEditor.addWatermark(file, text);
  },

  /**
   * Extract file EXIF metadata
   */
  async getMetadata(file: File): Promise<any> {
    await imageValidator.validate(file);
    return imageMetadata.read(file).then(info => ({
      name: info.filename,
      size: info.size,
      type: info.mime,
      width: 0, // Fallback fields for legacy compatibility
      height: 0,
      exif: info.exif
    }));
  }
};
