import type { DocumentOperation } from './operation.interface';
import type { ProcessContext, ProcessResult } from '../../lib/processingEngine';
import { pdfEngine } from '../pdfEngine';
import { imageEngine } from '../imageEngine';
import { utilityEngine } from '../utilityEngine';

export const compressOperation: DocumentOperation = {
  id: 'compress',
  name: 'Compression Engine',

  validate(ctx: ProcessContext): void {
    const { toolId, files } = ctx;
    if (files.length === 0) {
      throw new Error('Please select at least one file to compress.');
    }

    if (toolId === 'compress-pdf' && !files[0].name.toLowerCase().endsWith('.pdf')) {
      throw new Error('File must be a valid PDF document.');
    }

    if (toolId === 'compress-image' && !files[0].type.startsWith('image/')) {
      throw new Error('File must be a valid image.');
    }
  },

  async execute(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    let outputBlob: Blob;
    let outputName = 'compressed_file';

    switch (toolId) {
      case 'compress-pdf':
        onProgress?.(30, 'Flattening PDF structures...');
        outputBlob = await pdfEngine.compressPDF(files[0]);
        outputName = options.outputFilename || 'compressed_document.pdf';
        break;

      case 'compress-image': {
        const quality = options.compressQuality !== undefined ? options.compressQuality : 0.8;
        onProgress?.(30, 'Reducing canvas color bit depth...');
        outputBlob = await imageEngine.compressImage(files[0], quality);
        
        // Match extension to original or fallback to jpg
        const origExt = files[0].name.split('.').pop()?.toLowerCase() || 'jpg';
        const finalExt = origExt === 'png' ? 'jpg' : origExt; // PNG compress converts to JPG/WebP
        outputName = options.outputFilename || `compressed_image.${finalExt}`;
        break;
      }

      case 'zip-compressor':
        onProgress?.(20, 'Packing file nodes into JSZip...');
        outputBlob = await utilityEngine.compressToZip(files, onProgress);
        outputName = options.outputFilename || 'archive_package.zip';
        break;

      default:
        throw new Error(`Unsupported tool "${toolId}" in compress operation.`);
    }

    return {
      blob: outputBlob,
      outputName
    };
  }
};
