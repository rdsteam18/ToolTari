export const imageEditor = {
  /**
   * Helper to load File into HTMLImageElement
   */
  loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to render source image.'));
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Resize with custom methods (percentage or raw dimension constraints)
   */
  async resize(
    file: File, 
    options: { width?: number; height?: number; percentage?: number; maintainAspect?: boolean }
  ): Promise<Blob> {
    const img = await this.loadImage(file);
    let targetWidth = img.naturalWidth;
    let targetHeight = img.naturalHeight;

    if (options.percentage) {
      const scale = options.percentage / 100;
      targetWidth = Math.round(img.naturalWidth * scale);
      targetHeight = Math.round(img.naturalHeight * scale);
    } else {
      const w = options.width;
      const h = options.height;
      
      if (w && h) {
        targetWidth = w;
        targetHeight = h;
      } else if (w) {
        targetWidth = w;
        if (options.maintainAspect) {
          targetHeight = Math.round((w / img.naturalWidth) * img.naturalHeight);
        }
      } else if (h) {
        targetHeight = h;
        if (options.maintainAspect) {
          targetWidth = Math.round((h / img.naturalHeight) * img.naturalWidth);
        }
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Resize canvas export failed.'));
      }, file.type);
      URL.revokeObjectURL(img.src);
    });
  },

  /**
   * Crop tool supporting rectangles, squares, or circular crop templates
   */
  async crop(
    file: File,
    x: number,
    y: number,
    width: number,
    height: number,
    shape: 'rectangle' | 'square' | 'circle' = 'rectangle'
  ): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    if (shape === 'circle') {
      // Circular crop path masking
      ctx.beginPath();
      const radius = Math.min(width, height) / 2;
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Crop canvas export failed.'));
      }, shape === 'circle' ? 'image/png' : file.type); // Circle must be PNG to preserve transparent corners
      URL.revokeObjectURL(img.src);
    });
  },

  /**
   * Rotate by custom angles (90, 180, 270, or custom degrees)
   */
  async rotate(file: File, angleDegrees: number): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    
    const rads = (angleDegrees * Math.PI) / 180;
    const sin = Math.abs(Math.sin(rads));
    const cos = Math.abs(Math.cos(rads));
    
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    
    canvas.width = width * cos + height * sin;
    canvas.height = width * sin + height * cos;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rads);
    ctx.drawImage(img, -width / 2, -height / 2);

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Rotation canvas export failed.'));
      }, file.type);
      URL.revokeObjectURL(img.src);
    });
  },

  /**
   * Flip horizontally or vertically
   */
  async flip(file: File, direction: 'horizontal' | 'vertical'): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    if (direction === 'horizontal') {
      ctx.scale(-1, 1);
      ctx.drawImage(img, -img.naturalWidth, 0);
    } else {
      ctx.scale(1, -1);
      ctx.drawImage(img, 0, -img.naturalHeight);
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Flip canvas export failed.'));
      }, file.type);
      URL.revokeObjectURL(img.src);
    });
  },

  /**
   * Filter renderer
   */
  async applyFilter(file: File, filterName: 'grayscale' | 'sepia' | 'blur' | 'invert'): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

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
        else reject(new Error('Filter application failed.'));
      }, file.type);
      URL.revokeObjectURL(img.src);
    });
  },

  /**
   * Watermark blending
   */
  async addWatermark(
    file: File, 
    text: string, 
    options?: { color?: string; opacity?: number; rotation?: number; position?: 'center' | 'bottom-right' }
  ): Promise<Blob> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context unavailable');

    ctx.drawImage(img, 0, 0);
    
    const opacity = options?.opacity !== undefined ? options.opacity : 0.4;
    const color = options?.color || `rgba(255,255,255,${opacity})`;
    const rotation = options?.rotation !== undefined ? (options.rotation * Math.PI) / 180 : -Math.PI / 6;
    const position = options?.position || 'center';

    const fontSize = Math.max(16, Math.floor(canvas.width / 15));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (position === 'center') {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotation);
      ctx.fillText(text, 0, 0);
    } else {
      // bottom right
      ctx.fillText(text, canvas.width - (fontSize * 3), canvas.height - fontSize);
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Watermark application failed.'));
      }, file.type);
      URL.revokeObjectURL(img.src);
    });
  }
};
