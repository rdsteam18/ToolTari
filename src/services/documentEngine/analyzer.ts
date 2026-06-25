import { PDFDocument } from 'pdf-lib';

export interface DocumentProfile {
  name: string;
  type: string;
  sizeBytes: number;
  sizeReadable: string;
  pageCount?: number;
  isEncrypted?: boolean;
  resolution?: { width: number; height: number; aspect: string };
  orientation?: 'portrait' | 'landscape' | 'square';
  language?: string;
  metadata?: Record<string, string>;
}

export const analyzerEngine = {
  /**
   * Run the analysis pipeline on a file and return its profile
   */
  async analyze(file: File): Promise<DocumentProfile> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const sizeReadable = this.formatBytes(file.size);
    
    const profile: DocumentProfile = {
      name: file.name,
      type: ext.toUpperCase(),
      sizeBytes: file.size,
      sizeReadable,
      language: 'English', // default fallback, can be refined post-OCR/AI
      metadata: {}
    };

    if (ext === 'pdf') {
      await this.analyzePdf(file, profile);
    } else if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif'].includes(ext)) {
      await this.analyzeImage(file, profile);
    } else {
      // General file profile
      profile.metadata = {
        lastModified: new Date(file.lastModified).toISOString()
      };
    }

    return profile;
  },

  /**
   * Helper to format bytes into human-readable strings
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  /**
   * Analyze a PDF document
   */
  async analyzePdf(file: File, profile: DocumentProfile): Promise<void> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Try to load the PDF to check if encrypted
      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        profile.pageCount = pdfDoc.getPageCount();
        profile.isEncrypted = false;
        
        // Extract metadata
        profile.metadata = {
          title: pdfDoc.getTitle() || 'Untitled',
          author: pdfDoc.getAuthor() || 'Unknown',
          subject: pdfDoc.getSubject() || 'None',
          creator: pdfDoc.getCreator() || 'Unknown',
          producer: pdfDoc.getProducer() || 'Unknown',
          creationDate: pdfDoc.getCreationDate()?.toISOString() || 'Unknown',
          modificationDate: pdfDoc.getModificationDate()?.toISOString() || 'Unknown'
        };

        // Determine orientation based on first page
        if (profile.pageCount > 0) {
          const firstPage = pdfDoc.getPage(0);
          const { width, height } = firstPage.getSize();
          if (width > height) {
            profile.orientation = 'landscape';
          } else if (height > width) {
            profile.orientation = 'portrait';
          } else {
            profile.orientation = 'square';
          }
        }
      } catch (encryptError: any) {
        // If it throws an error about password, then it is encrypted!
        if (encryptError.message?.toLowerCase().includes('password') || 
            encryptError.message?.toLowerCase().includes('encrypt') || 
            encryptError.message?.toLowerCase().includes('decrypt')) {
          profile.isEncrypted = true;
          profile.pageCount = 0; // cannot read page count without password
          profile.metadata = { status: 'Encrypted & Locked' };
        } else {
          throw encryptError;
        }
      }
    } catch (e: any) {
      console.warn('PDF specific analysis failed:', e);
      profile.isEncrypted = profile.isEncrypted ?? false;
      profile.pageCount = profile.pageCount ?? 0;
    }
  },

  /**
   * Analyze an image file
   */
  async analyzeImage(file: File, profile: DocumentProfile): Promise<void> {
    return new Promise<void>((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const aspect = (width / height).toFixed(2);
        
        profile.resolution = {
          width,
          height,
          aspect: `${width}:${height} (Ratio: ${aspect})`
        };

        if (width > height) {
          profile.orientation = 'landscape';
        } else if (height > width) {
          profile.orientation = 'portrait';
        } else {
          profile.orientation = 'square';
        }

        profile.metadata = {
          dimensions: `${width}x${height} pixels`,
          naturalAspect: aspect
        };

        URL.revokeObjectURL(url);
        resolve();
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(); // resolve gracefully even if loading image tags fails
      };

      img.src = url;
    });
  }
};
