export const MAX_AUDIO_SIZE = 100 * 1024 * 1024; // 100MB maximum safety cap for browser audio decoding

export const audioValidator = {
  /**
   * Performs basic extension, mime type, and file size checks
   */
  async validate(file: File): Promise<void> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    
    // 1. Supported Formats List Check
    const supportedExts = ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg', 'opus', 'aiff'];
    if (!supportedExts.includes(ext)) {
      throw new Error(`Unsupported Audio Format: File ".${ext}" is not recognized by the audio engine.`);
    }

    // 2. MIME Verification (support audio/* and some generic binary streams if named right)
    if (file.type && !file.type.startsWith('audio/') && file.type !== 'application/octet-stream') {
      throw new Error(`Invalid File: Expected audio mime type, received "${file.type}".`);
    }

    // 3. File Size Caps
    if (file.size > MAX_AUDIO_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(0);
      throw new Error(`File Exceeds Limit: Audio is ${sizeMb}MB. Local in-browser processing is restricted to files under 100MB to prevent memory overflows. Re-upload a smaller file.`);
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
        throw new Error('Audio file size is 0 bytes.');
      }
    } catch (e: any) {
      throw new Error(`Integrity Check Failed: Audio file "${file.name}" is corrupted or unreadable. Details: ${e.message}`);
    }
  }
};
