import { BaseToolProcessor } from '../../../lib/processingEngine';
import type { ProcessContext, ProcessResult } from '../../../lib/processingEngine';
import { utilityEngine } from '../../../services/utilityEngine';

export class DeveloperToolProcessor extends BaseToolProcessor {
  validate(ctx: ProcessContext): void {
    const { toolId, files, options } = ctx;

    // Check specific validations
    if (toolId === 'base64-converter' && !options.inputVal) {
      throw new Error('Please enter text to encode or decode.');
    }
    if (toolId === 'text-converter' && !options.inputVal) {
      throw new Error('Please enter text to format.');
    }
    if (toolId === 'word-counter' && !options.inputVal) {
      throw new Error('Please enter text to count.');
    }

    if (toolId === 'file-renamer' && files.length === 0) {
      throw new Error('Please upload files to rename.');
    }
    if (toolId === 'zip-compressor' && files.length === 0) {
      throw new Error('Please upload files to compress.');
    }
    if (toolId === 'image-to-base64' && files.length === 0) {
      throw new Error('Please select an image file.');
    }
  }

  async process(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    let outputBlob: Blob | undefined = undefined;
    let outputName = '';
    let data: any = null;

    switch (toolId) {
      case 'password-generator': {
        const length = options.length || 16;
        const upper = options.upper !== undefined ? options.upper : true;
        const lower = options.lower !== undefined ? options.lower : true;
        const nums = options.nums !== undefined ? options.nums : true;
        const symbols = options.symbols !== undefined ? options.symbols : true;
        
        onProgress?.(50, 'Generating entropy bytes...');
        const pass = utilityEngine.generatePassword({ length, upper, lower, nums, symbols });
        const strength = utilityEngine.checkPasswordStrength(pass);
        data = { password: pass, strength };
        break;
      }

      case 'password-strength': {
        onProgress?.(50, 'Evaluating entropy arrays...');
        data = utilityEngine.checkPasswordStrength(options.password || '');
        break;
      }

      case 'base64-converter': {
        const inputVal = options.inputVal || '';
        const mode = options.mode || 'encode'; // 'encode' or 'decode'
        onProgress?.(50, 'Converting encoding bits...');
        if (mode === 'encode') {
          data = utilityEngine.encodeBase64(inputVal);
        } else {
          data = utilityEngine.decodeBase64(inputVal);
        }
        break;
      }

      case 'image-to-base64': {
        onProgress?.(50, 'Serializing media array buffers...');
        data = await utilityEngine.fileToBase64(files[0]);
        break;
      }

      case 'random-number': {
        const min = options.min !== undefined ? options.min : 1;
        const max = options.max !== undefined ? options.max : 100;
        const count = options.count !== undefined ? options.count : 1;
        const unique = options.unique !== undefined ? options.unique : false;

        onProgress?.(50, 'Calculating random vectors...');
        const numbers: number[] = [];
        const range = max - min + 1;
        if (unique && count > range) {
          throw new Error('Range is too small to generate requested count of unique numbers.');
        }

        while (numbers.length < count) {
          const num = Math.floor(Math.random() * range) + min;
          if (!unique || !numbers.includes(num)) {
            numbers.push(num);
          }
        }
        data = numbers;
        break;
      }

      case 'color-converter': {
        const hex = options.hex || '#000000';
        onProgress?.(50, 'Translating RGB channels...');
        const rgb = utilityEngine.hexToRgb(hex);
        data = { hex, rgb };
        break;
      }

      case 'file-renamer': {
        const prefix = options.prefix || '';
        const suffix = options.suffix || '';
        const find = options.replaceFind || '';
        const replaceWith = options.replaceWith || '';
        const indexing = options.indexing !== undefined ? options.indexing : false;
        
        onProgress?.(50, 'Applying filename substitutions...');
        data = utilityEngine.renameFiles(files, { prefix, suffix, replaceFind: find, replaceWith, indexing });
        break;
      }

      case 'text-converter': {
        const inputVal = options.inputVal || '';
        const transform = options.transform || 'upper'; // 'upper' | 'lower' | 'title'
        onProgress?.(50, 'Converting text case values...');
        if (transform === 'upper') {
          data = inputVal.toUpperCase();
        } else if (transform === 'lower') {
          data = inputVal.toLowerCase();
        } else {
          data = inputVal.replace(/\w\S*/g, (w: string) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase());
        }
        break;
      }

      case 'word-counter': {
        const inputVal = options.inputVal || '';
        onProgress?.(50, 'Counting text boundaries...');
        const trimmed = inputVal.trim();
        const words = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
        const characters = inputVal.length;
        const sentences = trimmed === '' ? 0 : trimmed.split(/[.!?]+/).filter(Boolean).length;
        const paragraphs = trimmed === '' ? 0 : trimmed.split(/\n+/).filter(Boolean).length;
        const readingTime = Math.ceil(words / 200); // 200 words per minute average
        data = { words, characters, sentences, paragraphs, readingTime };
        break;
      }

      case 'zip-compressor': {
        onProgress?.(10, 'Packing file nodes...');
        outputBlob = await utilityEngine.compressToZip(files, onProgress);
        outputName = options.outputFilename || 'archive_package.zip';
        break;
      }

      default:
        throw new Error(`Developer Processor: Unknown tool ID "${toolId}"`);
    }

    return {
      blob: outputBlob,
      outputName,
      data
    };
  }
}

export const developerProcessor = new DeveloperToolProcessor();
