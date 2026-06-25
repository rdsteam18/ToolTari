export const imageExport = {
  /**
   * Translates canvas data into specific target MIME type formats
   */
  async exportCanvas(
    canvas: HTMLCanvasElement, 
    format: string, 
    quality: number = 0.8
  ): Promise<Blob> {
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      webp: 'image/webp',
      avif: 'image/avif',
      bmp: 'image/bmp',
      gif: 'image/gif'
    };

    const targetMime = mimeTypes[format.toLowerCase()] || 'image/png';
    
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`Failed to export canvas to format "${format}".`));
        }
        
        // Immediate Memory Management: Clean up canvas reference and dimensions to free GC
        canvas.width = 0;
        canvas.height = 0;
      }, targetMime, quality);
    });
  },

  /**
   * Memory management helper to release blob URL references
   */
  revokeUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }
};
