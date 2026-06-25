export interface ExifMetadata {
  cameraModel?: string;
  software?: string;
  dateTime?: string;
  gpsLatitude?: string;
  gpsLongitude?: string;
  exposureTime?: string;
  fNumber?: string;
  isoSpeed?: number;
}

export const imageMetadata = {
  /**
   * Reads basic file stats and attempts to parse EXIF details
   */
  async read(file: File): Promise<{ filename: string; size: number; mime: string; exif: ExifMetadata }> {
    const info = {
      filename: file.name,
      size: file.size,
      mime: file.type,
      exif: {} as ExifMetadata
    };

    try {
      const buffer = await file.arrayBuffer();
      info.exif = this.parseExif(buffer);
    } catch (e) {
      console.warn('EXIF reader: Failed to read EXIF chunks from file buffer.', e);
    }

    return info;
  },

  /**
   * Removes all EXIF metadata headers from an image by drawing it to a clean Canvas 
   * and exporting it to a fresh Blob.
   */
  async strip(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Drawing onto canvas drops the JPEG APP1 EXIF segment completely
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to generate stripped image blob.'));
        }, file.type || 'image/jpeg');

        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for metadata stripping.'));
      };

      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Helper to parse Exif tags from raw JPEG ArrayBuffer
   */
  parseExif(buffer: ArrayBuffer): ExifMetadata {
    const view = new DataView(buffer);
    const exif: ExifMetadata = {};

    // Check for JPEG Magic Marker (SOI - Start of Image) 0xFFD8
    if (view.byteLength < 2 || view.getUint16(0) !== 0xFFD8) {
      return exif; // Not a JPEG, skip parsing
    }

    let offset = 2;
    const length = view.byteLength;

    while (offset < length - 2) {
      const marker = view.getUint16(offset);
      const segmentLength = view.getUint16(offset + 2);

      // APP1 Marker containing EXIF data is 0xFFE1
      if (marker === 0xFFE1) {
        // Exif header should start with "Exif\0\0" (0x457869660000)
        const exifHeader = view.getUint32(offset + 4);
        if (exifHeader === 0x45786966) {
          this.extractExifTags(view, offset + 10, segmentLength, exif);
        }
        break;
      }
      offset += 2 + segmentLength;
    }

    return exif;
  },

  /**
   * Extracts specific tags from EXIF structure
   */
  extractExifTags(view: DataView, startOffset: number, _segmentLen: number, exif: ExifMetadata): void {
    try {
      // TIFF header starts here. 
      // First 2 bytes define byte align (0x4949 "II" Little Endian, 0x4D4D "MM" Big Endian)
      const isLittleEndian = view.getUint16(startOffset) === 0x4949;
      const tiffHeaderOffset = startOffset;
      
      // Get offset to first IFD (Image File Directory)
      const firstIfdOffset = view.getUint32(startOffset + 4, isLittleEndian);
      let ifdOffset = tiffHeaderOffset + firstIfdOffset;

      const numEntries = view.getUint16(ifdOffset, isLittleEndian);
      ifdOffset += 2;

      for (let i = 0; i < numEntries; i++) {
        const tag = view.getUint16(ifdOffset, isLittleEndian);
        // const type = view.getUint16(ifdOffset + 2, isLittleEndian);
        const numValues = view.getUint32(ifdOffset + 4, isLittleEndian);
        const valueOffset = view.getUint32(ifdOffset + 8, isLittleEndian);

        // Map tag numbers
        if (tag === 0x0110) { // Model
          exif.cameraModel = this.readString(view, tiffHeaderOffset + valueOffset, numValues);
        } else if (tag === 0x0131) { // Software
          exif.software = this.readString(view, tiffHeaderOffset + valueOffset, numValues);
        } else if (tag === 0x0132) { // DateTime
          exif.dateTime = this.readString(view, tiffHeaderOffset + valueOffset, numValues);
        }

        ifdOffset += 12;
      }
    } catch (e) {
      console.warn('Error extracting tags from EXIF block:', e);
    }
  },

  readString(view: DataView, offset: number, length: number): string {
    const chars = [];
    for (let i = 0; i < length; i++) {
      const char = view.getUint8(offset + i);
      if (char === 0) break; // null terminator
      chars.push(String.fromCharCode(char));
    }
    return chars.join('').trim();
  }
};
