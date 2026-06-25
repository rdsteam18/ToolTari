export interface ImageEnhancerConfig {
  grayscale: boolean;
  contrast: number; // -100 to 100
  binarize: boolean;
  adaptiveThreshold: boolean;
  sharpen: boolean;
  rotateAngle?: number;
}

/**
 * Loads an image from a DataURL
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

/**
 * Applies a grayscale filter to ImageData
 */
function grayscaleFilter(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Standard luminance weights
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
}

/**
 * Adjusts contrast of ImageData
 * contrast: factor from -100 to 100
 */
function contrastFilter(data: Uint8ClampedArray, contrast: number) {
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  for (let i = 0; i < data.length; i += 4) {
    data[i] = factor * (data[i] - 128) + 128;
    data[i + 1] = factor * (data[i + 1] - 128) + 128;
    data[i + 2] = factor * (data[i + 2] - 128) + 128;
  }
}

/**
 * Binarizes pixels based on a static global threshold (default 127)
 */
function binarizeFilter(data: Uint8ClampedArray, threshold = 127) {
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i];
    const binary = gray >= threshold ? 255 : 0;
    data[i] = binary;
    data[i + 1] = binary;
    data[i + 2] = binary;
  }
}

/**
 * Adaptive Thresholding (local thresholding)
 * Compares each pixel against average in a surrounding block. Excellent for uneven lighting (receipts, books).
 */
function adaptiveThresholdFilter(data: Uint8ClampedArray, width: number, height: number) {
  const grayscale = new Uint8ClampedArray(width * height);
  for (let i = 0; i < data.length; i += 4) {
    grayscale[i / 4] = data[i];
  }

  const output = new Uint8ClampedArray(width * height);
  const S = Math.floor(Math.min(width, height) / 8); // block size
  const T = 15; // percentage threshold subtraction

  // Compute integral image
  const intImg = new Uint32Array(width * height);
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = 0; y < height; y++) {
      const idx = y * width + x;
      sum += grayscale[idx];
      if (x === 0) {
        intImg[idx] = sum;
      } else {
        intImg[idx] = intImg[idx - 1] + sum;
      }
    }
  }

  // Perform local threshold comparison
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const idx = y * width + x;
      const x1 = Math.max(x - S / 2, 0);
      const x2 = Math.min(x + S / 2, width - 1);
      const y1 = Math.max(y - S / 2, 0);
      const y2 = Math.min(y + S / 2, height - 1);
      
      const count = (x2 - x1) * (y2 - y1);
      
      // Box sum calculation
      const idxBR = y2 * width + x2;
      const idxTL = y1 * width + x1;
      const idxTR = y1 * width + x2;
      const idxBL = y2 * width + x1;
      
      const sum = intImg[idxBR] - intImg[idxTR] - intImg[idxBL] + intImg[idxTL];
      
      if (grayscale[idx] * count < sum * (100 - T) / 100) {
        output[idx] = 0; // Black
      } else {
        output[idx] = 255; // White
      }
    }
  }

  // Copy result back
  for (let i = 0; i < data.length; i += 4) {
    const val = output[i / 4];
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
  }
}

/**
 * Sharpen filter using a 3x3 convolution matrix
 */
function sharpenFilter(data: Uint8ClampedArray, width: number, height: number) {
  const original = new Uint8ClampedArray(data);
  const weights = [
     0, -1,  0,
    -1,  5, -1,
     0, -1,  0
  ];
  const side = 3;
  const halfSide = 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sy = y;
      const sx = x;
      const dstOff = (y * width + x) * 4;
      
      let r = 0, g = 0, b = 0;

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = Math.min(height - 1, Math.max(0, sy + cy - halfSide));
          const scx = Math.min(width - 1, Math.max(0, sx + cx - halfSide));
          const srcOff = (scy * width + scx) * 4;
          const wt = weights[cy * side + cx];
          
          r += original[srcOff] * wt;
          g += original[srcOff + 1] * wt;
          b += original[srcOff + 2] * wt;
        }
      }

      data[dstOff] = Math.min(255, Math.max(0, r));
      data[dstOff + 1] = Math.min(255, Math.max(0, g));
      data[dstOff + 2] = Math.min(255, Math.max(0, b));
    }
  }
}

export const imageEnhancer = {
  /**
   * Applies target image filters on canvas and returns processed base64 data URL
   */
  async enhance(file: File, config: ImageEnhancerConfig): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const dataUrl = event.target?.result as string;
          const img = await loadImage(dataUrl);

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas 2D context is not available.');
          }

          // Handle rotation dimensions if angle is defined
          const angleRad = ((config.rotateAngle || 0) * Math.PI) / 180;
          const sin = Math.abs(Math.sin(angleRad));
          const cos = Math.abs(Math.cos(angleRad));
          
          const newWidth = Math.floor(img.width * cos + img.height * sin);
          const newHeight = Math.floor(img.width * sin + img.height * cos);

          canvas.width = newWidth;
          canvas.height = newHeight;

          // Apply rotation transformation
          if (config.rotateAngle) {
            ctx.translate(newWidth / 2, newHeight / 2);
            ctx.rotate(angleRad);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
          } else {
            ctx.drawImage(img, 0, 0);
          }

          // Fetch pixels
          const imgData = ctx.getImageData(0, 0, newWidth, newHeight);
          const pixels = imgData.data;

          // 1. Grayscale conversion
          if (config.grayscale) {
            grayscaleFilter(pixels);
          }

          // 2. Contrast adjustment
          if (config.contrast !== 0) {
            contrastFilter(pixels, config.contrast);
          }

          // 3. Sharpen edges
          if (config.sharpen) {
            sharpenFilter(pixels, newWidth, newHeight);
          }

          // 4. Binarization
          if (config.adaptiveThreshold) {
            adaptiveThresholdFilter(pixels, newWidth, newHeight);
          } else if (config.binarize) {
            binarizeFilter(pixels);
          }

          // Write back processed pixels
          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          reject(e);
        }
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
};
