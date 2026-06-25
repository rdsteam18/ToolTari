import { BaseToolProcessor } from '../../../lib/processingEngine';
import type { ProcessContext, ProcessResult } from '../../../lib/processingEngine';
import { pdfEngine } from '../../../services/pdfEngine';

export class PdfToolProcessor extends BaseToolProcessor {
  validate(ctx: ProcessContext): void {
    super.validate(ctx);
    if (ctx.files.length > 0) {
      // Validate all files are PDFs
      const invalidFiles = ctx.files.filter(f => !f.name.toLowerCase().endsWith('.pdf'));
      if (invalidFiles.length > 0) {
        throw new Error('All uploaded files must be valid PDF documents.');
      }
    }

    if (ctx.toolId === 'protect-pdf' && !ctx.options.password) {
      throw new Error('Please specify a password to lock the PDF.');
    }

    if (ctx.toolId === 'unlock-pdf' && !ctx.options.password) {
      throw new Error('Please specify the decryption password.');
    }
  }

  async process(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    let outputBlob: Blob | undefined = undefined;
    let outputName = `processed_${toolId}.pdf`;

    switch (toolId) {
      case 'merge-pdf':
        outputBlob = await pdfEngine.mergePDFs(files, onProgress);
        outputName = options.outputFilename || 'merged_document.pdf';
        break;

      case 'split-pdf': {
        const splitRanges = options.splitRanges || '1-3';
        onProgress?.(40, 'Splitting document...');
        const splits = await pdfEngine.splitPDF(files[0], splitRanges);
        if (splits.length === 0) throw new Error('No pages were extracted. Check your split range.');
        outputBlob = splits[0]; // Take the first segment
        outputName = options.outputFilename || 'split_pages.pdf';
        break;
      }

      case 'compress-pdf':
        onProgress?.(50, 'Reducing file structure...');
        outputBlob = await pdfEngine.compressPDF(files[0]);
        outputName = options.outputFilename || 'compressed_document.pdf';
        break;

      case 'rotate-pdf': {
        const rotateAngle = parseInt(options.rotateAngle) || 90;
        onProgress?.(50, 'Re-orienting pages...');
        outputBlob = await pdfEngine.rotatePDF(files[0], rotateAngle);
        outputName = options.outputFilename || 'rotated_document.pdf';
        break;
      }

      case 'protect-pdf':
        onProgress?.(60, 'Encrypting pages...');
        outputBlob = await pdfEngine.protectPDF(files[0], options.password);
        outputName = options.outputFilename || 'protected_document.pdf';
        break;

      case 'unlock-pdf':
        onProgress?.(60, 'Removing password headers...');
        outputBlob = await pdfEngine.unlockPDF(files[0], options.password);
        outputName = options.outputFilename || 'unlocked_document.pdf';
        break;

      case 'watermark-pdf': {
        const watermarkText = options.watermarkText || 'ToolTari';
        onProgress?.(50, 'Stamping watermark layers...');
        outputBlob = await pdfEngine.watermarkPDF(files[0], watermarkText);
        outputName = options.outputFilename || 'watermarked_document.pdf';
        break;
      }

      case 'add-page-numbers':
        onProgress?.(60, 'Injecting page numbers...');
        outputBlob = await pdfEngine.addPageNumbers(files[0]);
        outputName = options.outputFilename || 'numbered_document.pdf';
        break;

      case 'delete-pages':
        onProgress?.(50, 'Deleting target pages...');
        outputBlob = await pdfEngine.deletePages(files[0], options.pagesToDelete || [0]);
        outputName = options.outputFilename || 'pages_deleted.pdf';
        break;

      case 'extract-pages':
        onProgress?.(50, 'Extracting selected ranges...');
        outputBlob = await pdfEngine.extractPages(files[0], options.pagesToExtract || [0]);
        outputName = options.outputFilename || 'extracted_pages.pdf';
        break;

      default:
        throw new Error(`PDF Processor: Unknown tool ID "${toolId}"`);
    }

    return {
      blob: outputBlob,
      outputName
    };
  }
}

export const pdfProcessor = new PdfToolProcessor();
