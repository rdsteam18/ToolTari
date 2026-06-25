const MAX_IMAGE_SIZE = 30 * 1024 * 1024; // 30MB limit for local image processing
const MAX_DIMENSION = 8000; // 8000px max width or height to protect canvas memory

export const imageValidator = {
  /**
   * Performs image-specific checks (format, MIME, size, dimension limits, corruption, and animation flag)
   */
  async validate(file: File): Promise<void> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    
    // 1. Extension Verification
    const supportedExts = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'svg', 'bmp', 'tiff', 'ico'];
    if (!supportedExts.includes(ext)) {
      throw new Error(`Unsupported Image Format: File type ".${ext}" is not supported by the local processing engine.`);
    }

    // 2. MIME Verification
    if (file.type && !file.type.startsWith('image/')) {
      throw new Error(`Security Alert: Uploaded file is categorized as "${file.type}" instead of a valid image.`);
    }

    // 3. File Size Cap
    if (file.size > MAX_IMAGE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(`File Too Large: Image is ${sizeMb}MB. Local canvas engines can only process images up to 30MB safely.`);
    }

    // 4. Resolution & Corruption Checks
    await this.checkResolutionAndCorruption(file);
  },

  /**
   * Loads image in-memory to check for dimensions and parsing corruption
   */
  checkResolutionAndCorruption(file: File): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();

      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        URL.revokeObjectURL(url);

        if (width === 0 || height === 0) {
          reject(new Error(`Corruption Error: Image "${file.name}" has invalid 0x0 natural dimensions.`));
          return;
        }

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          reject(new Error(`Resolution Limit Exceeded: Image is ${width}x${height}. Max supported canvas resolution is ${MAX_DIMENSION}x${MAX_DIMENSION} to avoid browser tab crashes.`));
          return;
        }

        resolve();
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Rendering Error: Failed to decode image file "${file.name}". The file header might be corrupted.`));
      };

      img.src = url;
    });
  },

  /**
   * Check if a GIF file contains animation (multiple frames)
   */
  async isAnimatedGif(file: File): Promise<boolean> {
    if (!file.name.toLowerCase().endsWith('.gif')) {
      return false;
    }

    try {
      const buffer = await file.arrayBuffer();
      const arr = new Uint8Array(buffer);
      
      // Look for the GIF89a application extension marker for graphics control block
      let graphicsControlCount = 0;
      for (let i = 0; i < arr.length - 3; i++) {
        // GIF Graphic Control Extension block header is [0x21, 0xF9]
        if (arr[i] === 0x21 && arr[i+1] === 0xF9) {
          graphicsControlCount++;
          if (graphicsControlCount > 1) {
            return true; // More than 1 frame => animated
          }
        }
      }
    } catch (e) {
      console.warn('GIF animation check failed:', e);
    }
    return false;
  }
};
