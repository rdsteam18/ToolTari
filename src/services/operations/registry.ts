import type { DocumentOperation } from './operation.interface';
import { mergeOperation } from './merge.operation';
import { splitOperation } from './split.operation';
import { compressOperation } from './compress.operation';
import { rotateOperation } from './rotate.operation';
import { ocrOperation } from './ocr.operation';
import { convertOperation } from './convert.operation';
import { watermarkOperation } from './watermark.operation';
import { protectOperation } from './protect.operation';
import { utilityOperation } from './utility.operation';
import { videoOperation } from './video.operation';
import { audioOperation } from './audio.operation';

// Registry of toolId mappings to operation objects
const operationRegistry: Record<string, DocumentOperation> = {
  // Merge Operations
  'merge-pdf': mergeOperation,
  'image-to-pdf': mergeOperation,

  // Split Operations
  'split-pdf': splitOperation,
  'delete-pages': splitOperation,
  'extract-pages': splitOperation,

  // Compress Operations
  'compress-pdf': compressOperation,
  'compress-image': compressOperation,
  'zip-compressor': compressOperation,

  // Rotate Operations
  'rotate-pdf': rotateOperation,
  'rotate-image': rotateOperation,

  // OCR Operations
  'ocr-pdf': ocrOperation,
  'ocr-image': ocrOperation,

  // Convert Operations
  'pdf-to-image': convertOperation,
  'image-converter': convertOperation,
  'base64-converter': convertOperation,
  'image-to-base64': convertOperation,
  'text-converter': convertOperation,
  'color-converter': convertOperation,

  // Watermark Operations
  'watermark-pdf': watermarkOperation,
  'watermark-image': watermarkOperation,

  // Protect Operations
  'protect-pdf': protectOperation,
  'unlock-pdf': protectOperation,
  'password-generator': protectOperation,
  'password-strength': protectOperation,

  // Utility Operations
  'resize-image': utilityOperation,
  'crop-image': utilityOperation,
  'image-filter': utilityOperation,
  'blur-image': utilityOperation,
  'image-metadata': utilityOperation,
  'add-page-numbers': utilityOperation,
  'random-number': utilityOperation,
  'file-renamer': utilityOperation,
  'word-counter': utilityOperation,
  'qr-generator': utilityOperation,
  'qr-scanner': utilityOperation,

  // Video Operations
  'youtube-thumbnail': videoOperation,
  'instagram-downloader': videoOperation,
  'compress-video': videoOperation,
  'trim-video': videoOperation,
  'mute-video': videoOperation,
  'extract-audio': videoOperation,
  'video-to-gif': videoOperation,

  // Audio Operations
  'compress-audio': audioOperation,
  'trim-audio': audioOperation,
  'volume-audio': audioOperation,
  'convert-audio': audioOperation,
  'metadata-audio': audioOperation
};

export const registry = {
  /**
   * Find an operation by its tool ID mapping
   */
  getOperation(toolId: string): DocumentOperation | undefined {
    return operationRegistry[toolId];
  },

  /**
   * Register a new operation dynamically
   */
  register(toolId: string, operation: DocumentOperation): void {
    operationRegistry[toolId] = operation;
  }
};
