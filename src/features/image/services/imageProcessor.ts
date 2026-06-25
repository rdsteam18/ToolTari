import { BaseToolProcessor } from '../../../lib/processingEngine';
import type { ProcessContext, ProcessResult } from '../../../lib/processingEngine';
import { imageEngine } from '../../../services/imageEngine';

export class ImageToolProcessor extends BaseToolProcessor {
  validate(ctx: ProcessContext): void {
    super.validate(ctx);
    if (ctx.files.length > 0) {
      // Validate all files are images
      const invalidFiles = ctx.files.filter(f => !f.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        throw new Error('All uploaded files must be valid images.');
      }
    }
  }

  async process(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    let outputBlob: Blob | undefined = undefined;
    let outputName = `processed_${toolId}.png`;
    let data: any = null;

    switch (toolId) {
      case 'compress-image': {
        const quality = options.compressQuality !== undefined ? options.compressQuality : 0.8;
        onProgress?.(50, 'Quantizing canvas colors...');
        outputBlob = await imageEngine.compressImage(files[0], quality);
        outputName = options.outputFilename || 'compressed_image.jpg';
        break;
      }

      case 'image-converter': {
        const format = options.convertFormat || 'PNG';
        onProgress?.(50, 'Re-encoding pixels...');
        outputBlob = await imageEngine.convertImage(files[0], format);
        outputName = options.outputFilename || `converted_image.${format.toLowerCase()}`;
        break;
      }

      case 'resize-image': {
        const width = parseInt(options.resizeWidth) || 800;
        const height = parseInt(options.resizeHeight) || 600;
        onProgress?.(50, 'Recalculating layout grid dimensions...');
        outputBlob = await imageEngine.resizeImage(files[0], width, height);
        outputName = options.outputFilename || 'resized_image.png';
        break;
      }

      case 'crop-image': {
        const x = options.cropX || 0;
        const y = options.cropY || 0;
        const w = options.cropWidth || 300;
        const h = options.cropHeight || 300;
        onProgress?.(50, 'Extracting bounding pixels...');
        outputBlob = await imageEngine.cropImage(files[0], x, y, w, h);
        outputName = options.outputFilename || 'cropped_image.png';
        break;
      }

      case 'rotate-image': {
        const angle = parseInt(options.rotateAngle) || 90;
        onProgress?.(50, 'Rotating canvas transform matrices...');
        outputBlob = await imageEngine.rotateImage(files[0], angle);
        outputName = options.outputFilename || 'rotated_image.png';
        break;
      }

      case 'image-filter': {
        const filter = options.filterName || 'grayscale';
        onProgress?.(50, `Applying filter "${filter}"...`);
        outputBlob = await imageEngine.applyFilter(files[0], filter);
        outputName = options.outputFilename || 'filtered_image.png';
        break;
      }

      case 'blur-image':
        onProgress?.(50, 'Blending pixel matrices...');
        outputBlob = await imageEngine.applyFilter(files[0], 'blur');
        outputName = options.outputFilename || 'blurred_image.png';
        break;

      case 'watermark-image': {
        const watermarkText = options.watermarkText || 'ToolTari';
        onProgress?.(50, 'Blending text vector layers...');
        outputBlob = await imageEngine.addWatermark(files[0], watermarkText);
        outputName = options.outputFilename || 'watermarked_image.png';
        break;
      }

      case 'image-metadata':
        onProgress?.(50, 'Extracting file header headers...');
        data = await imageEngine.getMetadata(files[0]);
        break;

      default:
        throw new Error(`Image Processor: Unknown tool ID "${toolId}"`);
    }

    return {
      blob: outputBlob,
      outputName,
      data
    };
  }
}

export const imageProcessor = new ImageToolProcessor();
