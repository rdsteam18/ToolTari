import type { ProcessResult } from '../../lib/processingEngine';

export const qualityEngine = {
  /**
   * Evaluates the output ProcessResult for quality issues.
   * Throws an error or returns modified result with warnings if issues are found.
   */
  async check(result: ProcessResult): Promise<void> {
    if (result.error) {
      throw new Error(`Processing Error: ${result.error}`);
    }

    // If it's a metadata/string output, there is no blob to check
    if (!result.blob && result.data) {
      return;
    }

    const { blob, outputName } = result;

    if (!blob) {
      throw new Error('Quality Check Failure: The operation completed but generated no output data or files.');
    }

    // 1. Zero-byte check
    if (blob.size === 0) {
      throw new Error('Quality Check Failure: Generated output file is empty (0 bytes).');
    }

    // 2. Format structure validation
    const ext = outputName?.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') {
      await this.validatePdfStructure(blob);
    } else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
      await this.validateImageStructure(blob);
    }
  },

  /**
   * Validates if a PDF blob is structurally sound
   */
  async validatePdfStructure(blob: Blob): Promise<void> {
    try {
      const buffer = await blob.slice(0, 4).arrayBuffer();
      const arr = new Uint8Array(buffer);
      // PDF magic number header: %PDF- (% = 0x25, P = 0x50, D = 0x44, F = 0x46)
      const isPdfHeader = arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46;
      if (!isPdfHeader) {
        throw new Error('Output is missing a valid PDF magic signature.');
      }
    } catch (e: any) {
      throw new Error(`Quality Control: The generated PDF document is corrupted. Details: ${e.message}`);
    }
  },

  /**
   * Validates if an image blob can be successfully rendered by the browser layout engine
   */
  async validateImageStructure(blob: Blob): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        // Basic check for extreme/blank resolutions
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          URL.revokeObjectURL(url);
          reject(new Error('Generated image has invalid 0x0 dimensions.'));
          return;
        }

        // Future checks: Scan image pixels for 100% white/black to detect blank pages
        
        URL.revokeObjectURL(url);
        resolve();
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('The generated image format is invalid or corrupted and cannot be rendered by the canvas processor.'));
      };

      img.src = url;
    });
  }
};
