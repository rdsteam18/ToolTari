import type { DocumentOperation } from './operation.interface';
import type { ProcessContext, ProcessResult } from '../../lib/processingEngine';
import { audioEngine } from '../audioEngine';

export const audioOperation: DocumentOperation = {
  id: 'audio',
  name: 'Audio Processing Engine',

  validate(ctx: ProcessContext): void {
    const { toolId, files, options } = ctx;

    if (files.length === 0) {
      throw new Error('Please select an audio file to process.');
    }

    if (toolId === 'trim-audio') {
      const start = parseFloat(options.trimStart);
      const end = parseFloat(options.trimEnd);
      if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
        throw new Error('Please enter valid Start and End times. End time must be greater than Start time.');
      }
    }

    if (toolId === 'volume-audio') {
      const factor = parseFloat(options.volumeFactor);
      if (isNaN(factor) || factor <= 0) {
        throw new Error('Please enter a valid volume adjustment factor greater than 0.');
      }
    }
  },

  async execute(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
    let outputBlob: Blob | undefined = undefined;
    let outputName = `processed_audio.${ext}`;

    switch (toolId) {
      case 'compress-audio': {
        const level = options.compressLevel || 'medium';
        onProgress?.(20, 'Analyzing audio levels...');
        outputBlob = await audioEngine.compressAudio(file, level as any, onProgress);
        outputName = options.outputFilename || `compressed_${file.name}`;
        break;
      }

      case 'trim-audio': {
        const start = parseFloat(options.trimStart) || 0;
        const end = parseFloat(options.trimEnd) || 10;
        onProgress?.(20, 'Locating audio trim frames...');
        outputBlob = await audioEngine.trimAudio(file, start, end, onProgress);
        outputName = options.outputFilename || `trimmed_${file.name}`;
        break;
      }

      case 'volume-audio': {
        const factor = parseFloat(options.volumeFactor) || 1.5;
        onProgress?.(20, 'Modifying audio volume gain...');
        outputBlob = await audioEngine.adjustVolume(file, factor, onProgress);
        outputName = options.outputFilename || `boosted_${file.name}`;
        break;
      }

      case 'convert-audio': {
        const target = options.convertFormat || 'mp3';
        onProgress?.(20, 'Transcoding audio format...');
        outputBlob = await audioEngine.convertFormat(file, target as any, onProgress);
        outputName = (options.outputFilename || file.name).replace(/\.[^/.]+$/, "") + `.${target}`;
        break;
      }

      case 'metadata-audio': {
        const tags = {
          title: options.metaTitle || '',
          artist: options.metaArtist || '',
          album: options.metaAlbum || '',
          genre: options.metaGenre || '',
          year: options.metaYear || ''
        };
        onProgress?.(20, 'Injecting ID3 metadata tags...');
        outputBlob = await audioEngine.writeMetadata(file, tags, onProgress);
        outputName = options.outputFilename || `tagged_${file.name}`;
        break;
      }

      default:
        throw new Error(`Unsupported tool "${toolId}" in audio operation.`);
    }

    return {
      blob: outputBlob,
      outputName
    };
  }
};
