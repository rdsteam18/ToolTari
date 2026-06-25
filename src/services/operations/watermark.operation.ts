import type { DocumentOperation } from './operation.interface';
import type { ProcessContext, ProcessResult } from '../../lib/processingEngine';
import { pdfEngine } from '../pdfEngine';
import { imageEngine } from '../imageEngine';

export const watermarkOperation: DocumentOperation = {
  id: 'watermark',
  name: 'Watermarking Engine',

  validate(ctx: ProcessContext): void {
    const { toolId, files } = ctx;
    if (files.length === 0) {
      throw new Error('Please select a file to watermark.');
    }

    if (toolId === 'watermark-pdf' && !files[0].name.toLowerCase().endsWith('.pdf')) {
      throw new Error('File must be a valid PDF document.');
    }

    if (toolId === 'watermark-image' && !files[0].type.startsWith('image/')) {
      throw new Error('File must be a valid image.');
    }
  },

  async execute(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    const watermarkText = options.watermarkText || 'ToolTari';
    let outputBlob: Blob;
    let outputName = 'watermarked_file';

    switch (toolId) {
      case 'watermark-pdf':
        onProgress?.(40, 'Rendering watermark text stamps...');
        outputBlob = await pdfEngine.watermarkPDF(files[0], watermarkText);
        outputName = options.outputFilename || 'watermarked_document.pdf';
        break;

      case 'watermark-image':
        onProgress?.(40, 'Blending text layers on canvas...');
        outputBlob = await imageEngine.addWatermark(files[0], watermarkText);
        outputName = options.outputFilename || 'watermarked_image.png';
        break;

      default:
        throw new Error(`Unsupported tool "${toolId}" in watermark operation.`);
    }

    return {
      blob: outputBlob,
      outputName
    };
  }
};
