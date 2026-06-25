export interface FormatCapabilities {
  transparency: 'yes' | 'no' | 'limited' | 'vector';
  animation: boolean;
  metadata: 'yes' | 'no' | 'limited';
  browserSupport: 'full' | 'modern' | 'limited';
}

const capabilityMatrix: Record<string, FormatCapabilities> = {
  png: { transparency: 'yes', animation: false, metadata: 'limited', browserSupport: 'full' },
  jpeg: { transparency: 'no', animation: false, metadata: 'yes', browserSupport: 'full' },
  jpg: { transparency: 'no', animation: false, metadata: 'yes', browserSupport: 'full' },
  webp: { transparency: 'yes', animation: true, metadata: 'limited', browserSupport: 'full' },
  avif: { transparency: 'yes', animation: false, metadata: 'limited', browserSupport: 'modern' },
  gif: { transparency: 'limited', animation: true, metadata: 'no', browserSupport: 'full' },
  svg: { transparency: 'vector', animation: false, metadata: 'no', browserSupport: 'full' },
  bmp: { transparency: 'no', animation: false, metadata: 'no', browserSupport: 'full' },
  tiff: { transparency: 'yes', animation: false, metadata: 'yes', browserSupport: 'limited' }
};

export const formatMatrix = {
  /**
   * Look up capabilities of an image format by its extension or mime type
   */
  getCapabilities(format: string): FormatCapabilities | undefined {
    const cleanFormat = format.toLowerCase().replace('image/', '').replace('.', '');
    return capabilityMatrix[cleanFormat];
  },

  /**
   * Check if format supports transparency
   */
  supportsTransparency(format: string): boolean {
    const cap = this.getCapabilities(format);
    return cap ? cap.transparency === 'yes' || cap.transparency === 'vector' : false;
  },

  /**
   * Check if format supports animation
   */
  supportsAnimation(format: string): boolean {
    const cap = this.getCapabilities(format);
    return cap ? cap.animation : false;
  },

  /**
   * Check if format supports metadata
   */
  supportsMetadata(format: string): boolean {
    const cap = this.getCapabilities(format);
    return cap ? cap.metadata === 'yes' || cap.metadata === 'limited' : false;
  }
};
