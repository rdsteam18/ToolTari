import type { DocumentOperation } from './operation.interface';
import type { ProcessContext, ProcessResult } from '../../lib/processingEngine';
import { imageEngine } from '../imageEngine';
import { utilityEngine } from '../utilityEngine';

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
    script.onerror = () => reject(new Error('Failed to load PDF.js library.'));
    document.head.appendChild(script);
  });
}

export const convertOperation: DocumentOperation = {
  id: 'convert',
  name: 'Conversion Engine',

  validate(ctx: ProcessContext): void {
    const { toolId, files, options } = ctx;

    // Checks for tools that require files
    if (['pdf-to-image', 'image-converter'].includes(toolId) && files.length === 0) {
      throw new Error('Please select a file to convert.');
    }

    // Checks for input-based tools
    if (toolId === 'base64-converter' && !options.inputVal) {
      throw new Error('Please enter text to encode or decode.');
    }
    if (toolId === 'text-converter' && !options.inputVal) {
      throw new Error('Please enter text to transform.');
    }
  },

  async execute(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    let outputBlob: Blob | undefined = undefined;
    let outputName = '';
    let data: any = null;
    let blobs: Array<{ blob: Blob; name: string }> = [];

    switch (toolId) {
      case 'pdf-to-image': {
        onProgress?.(10, 'Loading PDF renderer...');
        const pdfjsLib = await loadPdfJS();
        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();
        
        onProgress?.(20, 'Loading PDF document pages...');
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const percent = 20 + Math.floor((pageNum / numPages) * 70);
          onProgress?.(percent, `Rendering page ${pageNum} of ${numPages}...`);

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for print quality
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Canvas context unavailable');

          await page.render({ canvasContext: context, viewport }).promise;

          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Canvas render failed')), 'image/png');
          });

          blobs.push({
            blob,
            name: `${file.name.replace('.pdf', '')}_page_${pageNum}.png`
          });
        }

        outputName = options.outputFilename || `${file.name.replace('.pdf', '')}_pages.zip`;
        break;
      }

      case 'image-converter': {
        const format = options.convertFormat || 'PNG';
        onProgress?.(40, `Converting image to ${format}...`);
        outputBlob = await imageEngine.convertImage(files[0], format);
        outputName = options.outputFilename || `converted_image.${format.toLowerCase()}`;
        break;
      }

      case 'base64-converter': {
        const inputVal = options.inputVal || '';
        const mode = options.mode || 'encode';
        onProgress?.(50, 'Converting Base64...');
        if (mode === 'encode') {
          data = utilityEngine.encodeBase64(inputVal);
        } else {
          data = utilityEngine.decodeBase64(inputVal);
        }
        break;
      }

      case 'image-to-base64': {
        onProgress?.(40, 'Serializing media binary array...');
        data = await utilityEngine.fileToBase64(files[0]);
        break;
      }

      case 'text-converter': {
        const inputVal = options.inputVal || '';
        const transform = options.transform || 'upper';
        onProgress?.(50, 'Transforming casing...');
        if (transform === 'upper') {
          data = inputVal.toUpperCase();
        } else if (transform === 'lower') {
          data = inputVal.toLowerCase();
        } else {
          data = inputVal.replace(/\w\S*/g, (w: string) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase());
        }
        break;
      }

      case 'color-converter': {
        const hex = options.hex || '#000000';
        onProgress?.(50, 'Translating RGB channels...');
        const rgb = utilityEngine.hexToRgb(hex);
        data = { hex, rgb };
        break;
      }

      default:
        throw new Error(`Unsupported tool "${toolId}" in convert operation.`);
    }

    return {
      blob: outputBlob,
      outputName,
      blobs: blobs.length > 0 ? blobs : undefined,
      data
    };
  }
};
