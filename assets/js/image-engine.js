// ========== IMAGE ADVANCED ENGINE - Complete Production Version ==========
// Reusable image processing engine for all ToolTari image tools
// Features: Load image, compress, resize, rotate, flip, adjust quality, convert format, apply filters

(function() {
  'use strict';
  
  // ========== ImageEngine Class - Core Image Manipulation ==========
  class ImageEngine {
    constructor() {
      this.originalFile = null;
      this.originalImage = null;
      this.processedImage = null;
      this.originalCanvas = null;
      this.processedCanvas = null;
      this.originalContext = null;
      this.processedContext = null;
      this.isLoaded = false;
    }
    
    // Load image from File object
    async loadImage(file) {
      return new Promise((resolve, reject) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          reject(new Error('Please upload a valid image file (JPG, PNG, WebP)'));
          return;
        }
        
        // Validate size (max 20MB)
        if (file.size > 20 * 1024 * 1024) {
          reject(new Error('File size exceeds 20MB limit'));
          return;
        }
        
        this.originalFile = file;
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            this.originalImage = img;
            this.processedImage = img;
            
            // Create canvases
            this.originalCanvas = document.createElement('canvas');
            this.originalCanvas.width = img.width;
            this.originalCanvas.height = img.height;
            this.originalContext = this.originalCanvas.getContext('2d');
            this.originalContext.drawImage(img, 0, 0);
            
            this.processedCanvas = document.createElement('canvas');
            this.processedCanvas.width = img.width;
            this.processedCanvas.height = img.height;
            this.processedContext = this.processedCanvas.getContext('2d');
            this.processedContext.drawImage(img, 0, 0);
            
            this.isLoaded = true;
            resolve({
              width: img.width,
              height: img.height,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type
            });
          };
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = e.target.result;
        };
        
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    }
    
    // Reset to original image
    reset() {
      if (!this.isLoaded) return false;
      
      this.processedImage = this.originalImage;
      this.processedCanvas.width = this.originalCanvas.width;
      this.processedCanvas.height = this.originalCanvas.height;
      this.processedContext.drawImage(this.originalImage, 0, 0);
      
      return true;
    }
    
    // Get current processed image as data URL
    getProcessedDataURL(format = 'image/png', quality = 0.9) {
      if (!this.processedCanvas) return null;
      return this.processedCanvas.toDataURL(format, quality);
    }
    
    // Get processed image as Blob
    getProcessedBlob(format = 'image/png', quality = 0.9) {
      return new Promise((resolve) => {
        if (!this.processedCanvas) {
          resolve(null);
          return;
        }
        this.processedCanvas.toBlob((blob) => resolve(blob), format, quality);
      });
    }
    
    // Download processed image
    async downloadImage(format = 'image/png', quality = 0.9) {
      const blob = await this.getProcessedBlob(format, quality);
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const originalName = this.originalFile?.name.replace(/\.[^/.]+$/, '') || 'image';
      const extension = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
      a.download = `${originalName}_processed.${extension}`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    // ========== COMPRESSION ==========
    
    // Compress image by quality
    compressByQuality(quality = 0.7) {
      if (!this.isLoaded) return false;
      
      // Quality compression is handled during export
      // For preview, we don't actually compress the canvas display
      return { quality, estimatedSize: this.originalFile.size * quality };
    }
    
    // Get estimated compressed size
    getEstimatedCompressedSize(quality) {
      return Math.round(this.originalFile.size * quality);
    }
    
    // ========== RESIZE ==========
    
    // Resize image to new dimensions
    resize(width, height, maintainAspect = true) {
      if (!this.isLoaded) return false;
      
      let newWidth = width;
      let newHeight = height;
      
      if (maintainAspect) {
        const aspect = this.originalImage.width / this.originalImage.height;
        if (width && !height) {
          newHeight = Math.round(width / aspect);
        } else if (!width && height) {
          newWidth = Math.round(height * aspect);
        }
      }
      
      // Create new canvas for resized image
      const newCanvas = document.createElement('canvas');
      newCanvas.width = newWidth;
      newCanvas.height = newHeight;
      const newContext = newCanvas.getContext('2d');
      newContext.drawImage(this.processedImage, 0, 0, newWidth, newHeight);
      
      // Update processed image
      this.processedImage = new Image();
      this.processedImage.src = newCanvas.toDataURL();
      
      this.processedCanvas = newCanvas;
      this.processedContext = newContext;
      
      return { width: newWidth, height: newHeight };
    }
    
    // Resize by percentage
    resizeByPercent(percent) {
      const newWidth = Math.round(this.processedCanvas.width * (percent / 100));
      const newHeight = Math.round(this.processedCanvas.height * (percent / 100));
      return this.resize(newWidth, newHeight, false);
    }
    
    // ========== ROTATION & FLIP ==========
    
    // Rotate image by degrees (90, 180, 270)
    rotate(degrees) {
      if (!this.isLoaded) return false;
      
      const is90or270 = degrees === 90 || degrees === 270;
      const newWidth = is90or270 ? this.processedCanvas.height : this.processedCanvas.width;
      const newHeight = is90or270 ? this.processedCanvas.width : this.processedCanvas.height;
      
      const newCanvas = document.createElement('canvas');
      newCanvas.width = newWidth;
      newCanvas.height = newHeight;
      const newContext = newCanvas.getContext('2d');
      
      // Translate and rotate
      newContext.translate(newWidth / 2, newHeight / 2);
      newContext.rotate(degrees * Math.PI / 180);
      newContext.drawImage(this.processedImage, -this.processedCanvas.width / 2, -this.processedCanvas.height / 2);
      
      // Update processed image
      this.processedImage = new Image();
      this.processedImage.src = newCanvas.toDataURL();
      this.processedCanvas = newCanvas;
      this.processedContext = newContext;
      
      return { width: newWidth, height: newHeight, degrees };
    }
    
    // Flip horizontally
    flipHorizontal() {
      if (!this.isLoaded) return false;
      
      const newCanvas = document.createElement('canvas');
      newCanvas.width = this.processedCanvas.width;
      newCanvas.height = this.processedCanvas.height;
      const newContext = newCanvas.getContext('2d');
      
      newContext.translate(newCanvas.width, 0);
      newContext.scale(-1, 1);
      newContext.drawImage(this.processedImage, 0, 0);
      
      this.processedImage = new Image();
      this.processedImage.src = newCanvas.toDataURL();
      this.processedCanvas = newCanvas;
      this.processedContext = newContext;
      
      return true;
    }
    
    // Flip vertically
    flipVertical() {
      if (!this.isLoaded) return false;
      
      const newCanvas = document.createElement('canvas');
      newCanvas.width = this.processedCanvas.width;
      newCanvas.height = this.processedCanvas.height;
      const newContext = newCanvas.getContext('2d');
      
      newContext.translate(0, newCanvas.height);
      newContext.scale(1, -1);
      newContext.drawImage(this.processedImage, 0, 0);
      
      this.processedImage = new Image();
      this.processedImage.src = newCanvas.toDataURL();
      this.processedCanvas = newCanvas;
      this.processedContext = newContext;
      
      return true;
    }
    
    // ========== FILTERS ==========
    
    // Apply brightness filter
    applyBrightness(value) {
      if (!this.isLoaded) return false;
      
      const imageData = this.processedContext.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] *= value;     // Red
        data[i + 1] *= value; // Green
        data[i + 2] *= value; // Blue
      }
      
      this.processedContext.putImageData(imageData, 0, 0);
      this.processedImage = new Image();
      this.processedImage.src = this.processedCanvas.toDataURL();
      
      return true;
    }
    
    // Apply contrast filter
    applyContrast(value) {
      if (!this.isLoaded) return false;
      
      const imageData = this.processedContext.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
      const data = imageData.data;
      const factor = (259 * (value + 255)) / (255 * (259 - value));
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
      }
      
      this.processedContext.putImageData(imageData, 0, 0);
      this.processedImage = new Image();
      this.processedImage.src = this.processedCanvas.toDataURL();
      
      return true;
    }
    
    // Apply grayscale filter
    applyGrayscale() {
      if (!this.isLoaded) return false;
      
      const imageData = this.processedContext.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      
      this.processedContext.putImageData(imageData, 0, 0);
      this.processedImage = new Image();
      this.processedImage.src = this.processedCanvas.toDataURL();
      
      return true;
    }
    
    // Apply sepia filter
    applySepia() {
      if (!this.isLoaded) return false;
      
      const imageData = this.processedContext.getImageData(0, 0, this.processedCanvas.width, this.processedCanvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      }
      
      this.processedContext.putImageData(imageData, 0, 0);
      this.processedImage = new Image();
      this.processedImage.src = this.processedCanvas.toDataURL();
      
      return true;
    }
    
    // ========== CROPPING ==========
    
    // Crop image to selected area
    crop(x, y, width, height) {
      if (!this.isLoaded) return false;
      
      const newCanvas = document.createElement('canvas');
      newCanvas.width = width;
      newCanvas.height = height;
      const newContext = newCanvas.getContext('2d');
      
      newContext.drawImage(this.processedImage, x, y, width, height, 0, 0, width, height);
      
      this.processedImage = new Image();
      this.processedImage.src = newCanvas.toDataURL();
      this.processedCanvas = newCanvas;
      this.processedContext = newContext;
      
      return { width, height };
    }
    
    // ========== FORMAT CONVERSION ==========
    
    // Get current format info
    getFormatInfo() {
      return {
        originalFormat: this.originalFile?.type,
        originalSize: this.originalFile?.size,
        currentWidth: this.processedCanvas?.width,
        currentHeight: this.processedCanvas?.height
      };
    }
    
    // Convert to JPEG
    async convertToJPEG(quality = 0.9) {
      const blob = await this.getProcessedBlob('image/jpeg', quality);
      return blob;
    }
    
    // Convert to PNG
    async convertToPNG() {
      const blob = await this.getProcessedBlob('image/png', 1);
      return blob;
    }
    
    // Convert to WebP
    async convertToWebP(quality = 0.8) {
      const blob = await this.getProcessedBlob('image/webp', quality);
      return blob;
    }
  }
  
  // ========== ImageUIManager Class - UI Rendering ==========
  class ImageUIManager {
    constructor(originalCanvasId, processedCanvasId, engine) {
      this.originalCanvas = document.getElementById(originalCanvasId);
      this.processedCanvas = document.getElementById(processedCanvasId);
      this.engine = engine;
      this.originalCtx = this.originalCanvas?.getContext('2d');
      this.processedCtx = this.processedCanvas?.getContext('2d');
    }
    
    // Update canvas displays
    updateDisplays() {
      if (this.originalCanvas && this.engine.originalImage) {
        this.originalCanvas.width = this.engine.originalImage.width;
        this.originalCanvas.height = this.engine.originalImage.height;
        this.originalCtx.drawImage(this.engine.originalImage, 0, 0);
      }
      
      if (this.processedCanvas && this.engine.processedImage) {
        this.processedCanvas.width = this.engine.processedImage.width;
        this.processedCanvas.height = this.engine.processedImage.height;
        this.processedCtx.drawImage(this.engine.processedImage, 0, 0);
      }
    }
    
    // Fit canvas to container
    fitCanvasesToContainer(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      
      const maxWidth = container.clientWidth - 40;
      const maxHeight = 300;
      
      if (this.originalCanvas && this.engine.originalImage) {
        const ratio = this.engine.originalImage.width / this.engine.originalImage.height;
        let width = maxWidth;
        let height = width / ratio;
        if (height > maxHeight) {
          height = maxHeight;
          width = height * ratio;
        }
        this.originalCanvas.style.width = `${width}px`;
        this.originalCanvas.style.height = `${height}px`;
      }
      
      if (this.processedCanvas && this.engine.processedImage) {
        const ratio = this.engine.processedImage.width / this.engine.processedImage.height;
        let width = maxWidth;
        let height = width / ratio;
        if (height > maxHeight) {
          height = maxHeight;
          width = height * ratio;
        }
        this.processedCanvas.style.width = `${width}px`;
        this.processedCanvas.style.height = `${height}px`;
      }
    }
    
    // Clear displays
    clearDisplays() {
      if (this.originalCanvas) {
        this.originalCtx.clearRect(0, 0, this.originalCanvas.width, this.originalCanvas.height);
      }
      if (this.processedCanvas) {
        this.processedCtx.clearRect(0, 0, this.processedCanvas.width, this.processedCanvas.height);
      }
    }
  }
  
  // ========== Export ==========
  window.ToolTariImageEngine = {
    ImageEngine,
    ImageUIManager,
    version: '1.0.0'
  };
  
  console.log('Image Advanced Engine loaded successfully');
})();
