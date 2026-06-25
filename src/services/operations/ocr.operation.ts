import type { DocumentOperation } from './operation.interface';
import type { ProcessContext, ProcessResult } from '../../lib/processingEngine';
import { ocrEngine } from '../ocr/ocrEngine';

/**
 * Helper to load PDF.js dynamically from CDN
 */
async function loadPdfJS(): Promise<any> {
  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js rendering engine from CDN. Check connection.'));
    document.head.appendChild(script);
  });
}

export const ocrOperation: DocumentOperation = {
  id: 'ocr',
  name: 'OCR & Document Intelligence Engine',

  validate(ctx: ProcessContext): void {
    const { files } = ctx;
    if (files.length === 0) {
      throw new Error('Please select a document or image to run OCR.');
    }
  },

  async execute(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    const file = files[0];
    const language = options.language || 'eng';
    const profileMode = options.profileMode || 'default';
    const useAiCleanup = options.useAiCleanup !== undefined ? options.useAiCleanup : false;

    if (toolId === 'ocr-image') {
      onProgress?.(20, 'Executing OCR engine on image...');
      const ocrResult = await ocrEngine.process(file, {
        language,
        profileMode,
        useAiCleanup
      });

      if (!ocrResult.success) {
        throw new Error(ocrResult.error || 'Failed to extract text from image.');
      }

      return {
        data: ocrResult.text
      };
    } else if (toolId === 'ocr-pdf') {
      onProgress?.(10, 'Loading PDF rendering library...');
      const pdfjsLib = await loadPdfJS();
      const arrayBuffer = await file.arrayBuffer();
      
      onProgress?.(20, 'Parsing PDF structures...');
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = '';

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const percent = Math.floor((pageNum / numPages) * 70) + 20;
        onProgress?.(percent, `OCR Processing page ${pageNum} of ${numPages}...`);

        // 1. Render page to canvas
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas context unavailable');

        await page.render({ canvasContext: context, viewport }).promise;

        // 2. Convert canvas to File/Blob for OCR
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Canvas conversion failed')), 'image/png');
        });
        const pageImgFile = new File([blob], `page_${pageNum}.png`, { type: 'image/png' });

        // 3. Run OCR on page
        const ocrResult = await ocrEngine.process(pageImgFile, {
          language,
          profileMode,
          useAiCleanup
        });

        if (ocrResult.success && ocrResult.text.trim()) {
          fullText += `--- PAGE ${pageNum} ---\n\n${ocrResult.text}\n\n`;
        }
      }

      if (!fullText.trim()) {
        fullText = 'No text could be extracted from this PDF.';
      }

      return {
        data: fullText
      };
    } else {
      throw new Error(`Unsupported tool "${toolId}" in OCR operation.`);
    }
  }
};
