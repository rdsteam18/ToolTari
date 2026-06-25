import type { DocumentOperation } from './operation.interface';
import type { ProcessContext, ProcessResult } from '../../lib/processingEngine';
import { pdfEngine } from '../pdfEngine';

export const splitOperation: DocumentOperation = {
  id: 'split',
  name: 'Split & Page Extraction Engine',

  validate(ctx: ProcessContext): void {
    const { files } = ctx;
    if (files.length === 0) {
      throw new Error('Please select a PDF file to process.');
    }
    if (!files[0].name.toLowerCase().endsWith('.pdf')) {
      throw new Error('File must be a valid PDF document.');
    }
  },

  async execute(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    const file = files[0];
    let outputBlob: Blob | undefined = undefined;
    let outputName = 'split_document.pdf';

    switch (toolId) {
      case 'split-pdf': {
        const splitRanges = options.splitRanges || '1-3';
        onProgress?.(30, 'Analyzing split boundaries...');
        const splits = await pdfEngine.splitPDF(file, splitRanges);
        if (splits.length === 0) {
          throw new Error('No pages were extracted. Check your split range.');
        }
        outputBlob = splits[0]; // For single UI, take the first segment
        outputName = options.outputFilename || 'split_pages.pdf';
        break;
      }

      case 'delete-pages': {
        const pagesToDelete = options.pagesToDelete || [0];
        onProgress?.(40, 'Locating target pages to remove...');
        outputBlob = await pdfEngine.deletePages(file, pagesToDelete);
        outputName = options.outputFilename || 'pages_deleted.pdf';
        break;
      }

      case 'extract-pages': {
        const pagesToExtract = options.pagesToExtract || [0];
        onProgress?.(40, 'Isolating select pages...');
        outputBlob = await pdfEngine.extractPages(file, pagesToExtract);
        outputName = options.outputFilename || 'extracted_pages.pdf';
        break;
      }

      default:
        throw new Error(`Unsupported tool "${toolId}" in split operation.`);
    }

    return {
      blob: outputBlob,
      outputName
    };
  }
};
