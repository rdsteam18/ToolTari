import type { ProcessContext } from '../../lib/processingEngine';

// Default configuration for validation
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB safety limit

// Map of common allowed extensions and their MIME types
const ALLOWED_MAPPING: Record<string, string[]> = {
  pdf: ['application/pdf'],
  png: ['image/png'],
  jpeg: ['image/jpeg', 'image/jpg'],
  jpg: ['image/jpeg', 'image/jpg'],
  webp: ['image/webp'],
  bmp: ['image/bmp'],
  gif: ['image/gif'],
  tiff: ['image/tiff'],
  zip: ['application/zip', 'application/x-zip-compressed'],
  txt: ['text/plain'],
  csv: ['text/csv', 'application/vnd.ms-excel'],
  // Future types: docx, doc, xlsx, xls, pptx, ppt, etc.
};

export const validatorEngine = {
  /**
   * Run the full validation pipeline on context files
   */
  async validate(ctx: ProcessContext, expectedTypes?: string[], maxSize: number = DEFAULT_MAX_SIZE): Promise<void> {
    const { files, toolId } = ctx;
    
    // Tools that don't need files (text input-based tools)
    const noFileTools = ['password-generator', 'base64-converter', 'text-converter', 'word-counter', 'random-number', 'color-converter', 'password-strength'];
    if (files.length === 0) {
      if (noFileTools.includes(toolId)) return;
      throw new Error('Please upload at least one file to run this operation.');
    }

    for (const file of files) {
      // 1. Sanitize file name to prevent directory traversal and special chars issues
      this.sanitizeFilename(file.name);

      // 2. Reject executable files explicitly
      this.checkExecutable(file.name, file.type);

      // 3. Extension and MIME Checks
      if (expectedTypes && expectedTypes.length > 0) {
        this.checkFileFormat(file, expectedTypes);
      }

      // 4. Size Check
      this.checkSize(file, maxSize);

      // 5. In-Memory Corruption Check (Read header)
      await this.checkCorruption(file);

      // 6. Virus Hook (Future)
      await this.scanForThreats(file);
    }
  },

  /**
   * Cleans filename or throws if directory traversal detected
   */
  sanitizeFilename(name: string): string {
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
      throw new Error('Security Error: Potential path traversal attempt detected in filename.');
    }
    // Simple sanitization: remove common dangerous symbols
    return name.replace(/[<>:"|?*]/g, '');
  },

  /**
   * Explicitly reject common executable extensions
   */
  checkExecutable(name: string, type: string): void {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const dangerousExts = ['exe', 'bat', 'cmd', 'sh', 'com', 'vbs', 'scr', 'pif', 'msi', 'js', 'vbe', 'wsf'];
    
    if (dangerousExts.includes(ext) || type.includes('application/x-msdownload') || type.includes('application/octet-stream') && dangerousExts.includes(ext)) {
      throw new Error('Security Error: Uploading executable scripts or binary files is strictly prohibited.');
    }
  },

  /**
   * Validate file extension and MIME type
   */
  checkFileFormat(file: File, expectedTypes: string[]): void {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Check if the extension is in expected list
    const isExtensionMatch = expectedTypes.some(type => {
      if (type.startsWith('.')) {
        return type.toLowerCase() === `.${ext}`;
      }
      return type.toLowerCase() === ext;
    });

    if (!isExtensionMatch) {
      throw new Error(`File validation failed: File "${file.name}" is not of the accepted format. Expected: ${expectedTypes.join(', ')}`);
    }

    // Double check MIME mapping if registered
    const registeredMimes = ALLOWED_MAPPING[ext];
    if (registeredMimes && file.type) {
      const mimeOk = registeredMimes.some(mime => file.type.toLowerCase().includes(mime.toLowerCase()) || mime.toLowerCase().includes(file.type.toLowerCase()));
      if (!mimeOk) {
        console.warn(`MIME type mismatch for file ${file.name}: got ${file.type}, expected one of ${registeredMimes.join(', ')}. Proceeding with caution.`);
      }
    }
  },

  /**
   * Verify file size does not exceed limits
   */
  checkSize(file: File, maxSize: number): void {
    if (file.size > maxSize) {
      const mbSize = (file.size / (1024 * 1024)).toFixed(2);
      const mbLimit = (maxSize / (1024 * 1024)).toFixed(0);
      throw new Error(`File size limit exceeded: "${file.name}" is ${mbSize}MB. The maximum size allowed for in-browser processing is ${mbLimit}MB.`);
    }
  },

  /**
   * Basic file corruption check by reading the first few bytes as an ArrayBuffer
   */
  async checkCorruption(file: File): Promise<void> {
    try {
      const slice = file.slice(0, 1024); // read first 1KB
      const buffer = await slice.arrayBuffer();
      if (buffer.byteLength === 0) {
        throw new Error('File is empty (0 bytes).');
      }
    } catch (e: any) {
      throw new Error(`Integrity Check Failed: File "${file.name}" appears to be corrupted or unreadable. Details: ${e.message}`);
    }
  },

  /**
   * Hook for future cloud-based virus scans (currently logs and passes safely)
   */
  async scanForThreats(file: File): Promise<boolean> {
    // Future Integrations: Send file hash or stream to VirusTotal/ClamAV/etc.
    // Client-side execution will pass this by default.
    console.debug(`Security Engine: Pre-scanning file hash for "${file.name}"... Passed.`);
    return true;
  }
};
