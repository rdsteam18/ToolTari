export interface ImageMeta {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  lastModified: number;
}

export const imageEngine = {
  // Read file as HTML Image
  loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = URL.createObjectURL(file);
    });
  },

  // Compress image (JPEG/WebP) using canvas quality settings
  async compressImage(file: File, quality: number): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    
    ctx.drawImage(img, 0, 0);
    
    // Default to jpeg unless original is webp or png to preserve type
    let outType = 'image/jpeg';
    if (file.type === 'image/webp') outType = 'image/webp';
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Compression failed'));
        }
      }, outType, quality);
    });
  },

  // Convert image format
  async convertImage(file: File, targetFormat: string): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(img, 0, 0);

    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      bmp: 'image/bmp',
      gif: 'image/gif'
    };

    const outType = mimeTypes[targetFormat.toLowerCase()] || 'image/png';

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Conversion failed'));
        }
      }, outType);
    });
  },

  // Resize image
  async resizeImage(file: File, newWidth: number, newHeight: number): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Resizing failed'));
      }, file.type);
    });
  },

  // Crop image
  async cropImage(
    file: File,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Cropping failed'));
      }, file.type);
    });
  },

  // Rotate image
  async rotateImage(file: File, angleDegrees: number): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    
    // Determine new canvas bounds if rotating by 90 or 270 deg
    const rads = (angleDegrees * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rads));
    const cos = Math.abs(Math.cos(rads));
    
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    
    canvas.width = width * cos + height * sin;
    canvas.height = width * sin + height * cos;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rads);
    ctx.drawImage(img, -width / 2, -height / 2);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Rotation failed'));
      }, file.type);
    });
  },

  // Apply filters
  async applyFilter(
    file: File,
    filterName: 'grayscale' | 'sepia' | 'blur' | 'invert'
  ): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const filters = {
      grayscale: 'grayscale(100%)',
      sepia: 'sepia(100%)',
      blur: 'blur(5px)',
      invert: 'invert(100%)'
    };

    ctx.filter = filters[filterName] || 'none';
    ctx.drawImage(img, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Filter application failed'));
      }, file.type);
    });
  },

  // Add text watermark
  async addWatermark(file: File, text: string, color: string = 'rgba(255,255,255,0.4)'): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(img, 0, 0);
    
    // Compute font size based on image width
    const fontSize = Math.max(16, Math.floor(canvas.width / 15));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw centered watermark
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.fillText(text, 0, 0);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Watermarking failed'));
      }, file.type);
    });
  },

  // Get image metadata
  async getMetadata(file: File): Promise<ImageMeta> {
    const img = await this.loadImage(file);
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      width: img.naturalWidth,
      height: img.naturalHeight,
      lastModified: file.lastModified
    };
  }
};
