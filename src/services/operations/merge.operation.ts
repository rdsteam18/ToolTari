import { PDFDocument } from 'pdf-lib';
import type { DocumentOperation } from './operation.interface';
import type { ProcessContext, ProcessResult } from '../../lib/processingEngine';
import { pdfEngine } from '../pdfEngine';

/**
 * Helper to convert an image to PNG using Canvas
 */
function convertToPng(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob returned null'));
      }, 'image/png');
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for embedding'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Helper to draw images onto PDF pages
 */
async function compileImagesToPdf(files: File[], onProgress?: (p: number, msg: string) => void): Promise<Blob> {
  onProgress?.(10, 'Initializing PDF workspace...');
  const pdfDoc = await PDFDocument.create();
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const stepPercent = 10 + Math.floor((i / files.length) * 80);
    onProgress?.(stepPercent, `Processing image ${i + 1} of ${files.length}: ${file.name}...`);
    
    const bytes = await file.arrayBuffer();
    let embeddedImg;
    
    // Embed standard JPG and PNG directly, translate others through canvas
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      embeddedImg = await pdfDoc.embedJpg(bytes);
    } else if (file.type === 'image/png') {
      embeddedImg = await pdfDoc.embedPng(bytes);
    } else {
      // Fallback for WebP / BMP / GIF
      const pngBlob = await convertToPng(file);
      const pngBytes = await pngBlob.arrayBuffer();
      embeddedImg = await pdfDoc.embedPng(pngBytes);
    }
    
    const page = pdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: embeddedImg.width,
      height: embeddedImg.height,
    });
  }
  
  onProgress?.(95, 'Synthesizing output PDF...');
  const pdfBytes = await pdfDoc.save();
  onProgress?.(100, 'Compilation finished!');
  
  return new Blob([pdfBytes as any], { type: 'application/pdf' });
}

export const mergeOperation: DocumentOperation = {
  id: 'merge', // base operation family name
  name: 'Merge & Compilation Engine',

  validate(ctx: ProcessContext): void {
    const { toolId, files } = ctx;
    if (files.length === 0) {
      throw new Error('Please select files to merge.');
    }
    
    if (toolId === 'merge-pdf') {
      const invalidFiles = files.filter(f => !f.name.toLowerCase().endsWith('.pdf'));
      if (invalidFiles.length > 0) {
        throw new Error('All uploaded files must be valid PDF documents.');
      }
    } else if (toolId === 'image-to-pdf') {
      const invalidFiles = files.filter(f => !f.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        throw new Error('All uploaded files must be valid images.');
      }
    }
  },

  async execute(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    let outputBlob: Blob;
    let outputName = 'merged_document.pdf';

    if (toolId === 'merge-pdf') {
      outputBlob = await pdfEngine.mergePDFs(files, onProgress);
      outputName = options.outputFilename || 'merged_document.pdf';
    } else if (toolId === 'image-to-pdf') {
      outputBlob = await compileImagesToPdf(files, onProgress);
      outputName = options.outputFilename || 'images_compiled.pdf';
    } else {
      throw new Error(`Unsupported tool "${toolId}" in merge operation.`);
    }

    return {
      blob: outputBlob,
      outputName
    };
  }
};
