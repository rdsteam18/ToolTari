import type { DocumentOperation } from './operation.interface';
import type { ProcessContext, ProcessResult } from '../../lib/processingEngine';
import { pdfEngine } from '../pdfEngine';
import { utilityEngine } from '../utilityEngine';

export const protectOperation: DocumentOperation = {
  id: 'protect',
  name: 'Security & Encryption Engine',

  validate(ctx: ProcessContext): void {
    const { toolId, files, options } = ctx;

    if (toolId === 'protect-pdf') {
      if (files.length === 0) throw new Error('Please select a PDF file to encrypt.');
      if (!options.password) throw new Error('Please specify a password to lock the PDF.');
    }

    if (toolId === 'unlock-pdf') {
      if (files.length === 0) throw new Error('Please select a PDF file to decrypt.');
      if (!options.password) throw new Error('Please specify the decryption password.');
    }
  },

  async execute(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    let outputBlob: Blob | undefined = undefined;
    let outputName = '';
    let data: any = null;

    switch (toolId) {
      case 'protect-pdf':
        onProgress?.(40, 'Generating user/owner passwords and crypt blocks...');
        outputBlob = await pdfEngine.protectPDF(files[0], options.password);
        outputName = options.outputFilename || 'protected_document.pdf';
        break;

      case 'unlock-pdf':
        onProgress?.(40, 'Decrypting PDF catalog dictionary streams...');
        outputBlob = await pdfEngine.unlockPDF(files[0], options.password);
        outputName = options.outputFilename || 'unlocked_document.pdf';
        break;

      case 'password-generator': {
        const length = options.length || 16;
        const upper = options.upper !== undefined ? options.upper : true;
        const lower = options.lower !== undefined ? options.lower : true;
        const nums = options.nums !== undefined ? options.nums : true;
        const symbols = options.symbols !== undefined ? options.symbols : true;
        
        onProgress?.(50, 'Simulating entropy sequences...');
        const pass = utilityEngine.generatePassword({ length, upper, lower, nums, symbols });
        const strength = utilityEngine.checkPasswordStrength(pass);
        data = { password: pass, strength };
        break;
      }

      case 'password-strength':
        onProgress?.(50, 'Measuring entropy weights...');
        data = utilityEngine.checkPasswordStrength(options.password || '');
        break;

      default:
        throw new Error(`Unsupported tool "${toolId}" in protect operation.`);
    }

    return {
      blob: outputBlob,
      outputName,
      data
    };
  }
};
