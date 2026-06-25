import type { DocumentOperation } from './operation.interface';
import type { ProcessContext, ProcessResult } from '../../lib/processingEngine';
import { pdfEngine } from '../pdfEngine';
import { imageEngine } from '../imageEngine';

export const rotateOperation: DocumentOperation = {
  id: 'rotate',
  name: 'Rotation Engine',

  validate(ctx: ProcessContext): void {
    const { toolId, files } = ctx;
    if (files.length === 0) {
      throw new Error('Please select a file to rotate.');
    }

    if (toolId === 'rotate-pdf' && !files[0].name.toLowerCase().endsWith('.pdf')) {
      throw new Error('File must be a valid PDF document.');
    }

    if (toolId === 'rotate-image' && !files[0].type.startsWith('image/')) {
      throw new Error('File must be a valid image.');
    }
  },

  async execute(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    const rotateAngle = parseInt(options.rotateAngle) || 90;
    let outputBlob: Blob;
    let outputName = 'rotated_file';

    switch (toolId) {
      case 'rotate-pdf':
        onProgress?.(40, 'Recalculating page matrix rotations...');
        outputBlob = await pdfEngine.rotatePDF(files[0], rotateAngle);
        outputName = options.outputFilename || 'rotated_document.pdf';
        break;

      case 'rotate-image':
        onProgress?.(40, 'Re-mapping canvas pixel arrays...');
        outputBlob = await imageEngine.rotateImage(files[0], rotateAngle);
        outputName = options.outputFilename || 'rotated_image.png';
        break;

      default:
        throw new Error(`Unsupported tool "${toolId}" in rotate operation.`);
    }

    return {
      blob: outputBlob,
      outputName
    };
  }
};
