export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB maximum safety cap for browser processing

export const videoValidator = {
  /**
   * Performs basic extension, mime type, and file size checks
   */
  async validate(file: File): Promise<void> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    
    // 1. Supported Formats List Check
    const supportedExts = ['mp4', 'mov', 'mkv', 'avi', 'webm', 'flv', 'm4v', 'ogv'];
    if (!supportedExts.includes(ext)) {
      throw new Error(`Unsupported Video Format: File ".${ext}" is not recognized by the processing router.`);
    }

    // 2. MIME Verification
    if (file.type && !file.type.startsWith('video/')) {
      throw new Error(`Invalid File: Expected video mime type, received "${file.type}".`);
    }

    // 3. File Size Caps
    if (file.size > MAX_VIDEO_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(0);
      throw new Error(`File Exceeds Limit: Video is ${sizeMb}MB. Local in-browser processing is restricted to files under 500MB to prevent memory overflows. Re-upload a smaller file.`);
    }
    
    // 4. Basic integrity check
    await this.checkIntegrity(file);
  },

  /**
   * Asserts the file stream can be read into a basic buffer
   */
  async checkIntegrity(file: File): Promise<void> {
    try {
      const slice = file.slice(0, 1024);
      const buffer = await slice.arrayBuffer();
      if (buffer.byteLength === 0) {
        throw new Error('Video file size is 0 bytes.');
      }
    } catch (e: any) {
      throw new Error(`Integrity Check Failed: Video file "${file.name}" is corrupted or unreadable. Details: ${e.message}`);
    }
  }
};
