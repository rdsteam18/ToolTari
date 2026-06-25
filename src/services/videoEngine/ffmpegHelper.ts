// Abstraction layer for dynamic CDN loading of FFmpeg.wasm
let ffmpegInstance: any = null;

export const ffmpegHelper = {
  /**
   * Loads FFmpeg script and WASM cores dynamically when needed
   */
  async loadFFmpeg(onProgress?: (p: number, msg: string) => void): Promise<any> {
    if (ffmpegInstance) return ffmpegInstance;

    onProgress?.(10, 'Loading FFmpeg dependencies from CDN...');
    
    // Load ffmpeg.js UMD wrapper
    await this.loadScript('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js');
    // Load util.js UMD wrapper
    await this.loadScript('https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js');

    const FFmpeg = (window as any).FFmpeg;
    if (!FFmpeg) {
      throw new Error('Failed to load FFmpeg UMD package from CDN.');
    }

    onProgress?.(20, 'Initializing FFmpeg WASM core (requires COOP/COEP headers)...');
    
    try {
      const ffmpeg = new FFmpeg.FFmpeg();
      
      // Hook progress listener
      ffmpeg.on('progress', ({ progress }: { progress: number }) => {
        onProgress?.(30 + Math.floor(progress * 60), `Encoding frames: ${Math.round(progress * 100)}%`);
      });

      // Load binaries
      await ffmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
      });

      ffmpegInstance = ffmpeg;
      return ffmpeg;
    } catch (e: any) {
      console.error('FFmpeg loading error:', e);
      throw new Error(`FFmpeg WASM Load Failed: Browser headers (COOP/COEP) may not be configured. Details: ${e.message}`);
    }
  },

  /**
   * Helper to load scripts dynamically in the DOM
   */
  loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Avoid duplicate script tag insertion
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to download script ${src}`));
      document.head.appendChild(script);
    });
  },

  /**
   * Runs raw FFmpeg commands in the virtual filesystem
   */
  async runCommand(
    inputFile: File,
    outputName: string,
    args: string[],
    onProgress?: (p: number, msg: string) => void
  ): Promise<Blob> {
    const ffmpeg = await this.loadFFmpeg(onProgress);
    const util = (window as any).FFmpegUtil;
    if (!util) throw new Error('FFmpeg utilities package not found.');

    onProgress?.(25, 'Writing input video stream to virtual FS...');
    
    // Write input file to FFmpeg Virtual FS
    const fileData = await util.toBlobURL(inputFile);
    const response = await fetch(fileData);
    const arrayBuffer = await response.arrayBuffer();
    await ffmpeg.writeFile('input.mp4', new Uint8Array(arrayBuffer));

    onProgress?.(30, 'Invoking FFmpeg transcoder command...');
    
    // Execute command arguments
    await ffmpeg.exec(args);

    onProgress?.(90, 'Reading output stream from virtual FS...');
    
    // Read output file
    const data = await ffmpeg.readFile(outputName);
    const outputBlob = new Blob([(data as any).buffer], { type: this.getMimeType(outputName) });

    // Memory Cleanup: Delete files to free memory
    await ffmpeg.deleteFile('input.mp4');
    await ffmpeg.deleteFile(outputName);

    return outputBlob;
  },

  getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'webm') return 'video/webm';
    if (ext === 'mov') return 'video/quicktime';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'mp3') return 'audio/mpeg';
    if (ext === 'wav') return 'audio/wav';
    if (ext === 'aac') return 'audio/aac';
    if (ext === 'm4a') return 'audio/mp4';
    if (ext === 'flac') return 'audio/flac';
    if (ext === 'ogg') return 'audio/ogg';
    if (ext === 'opus') return 'audio/opus';
    if (ext === 'aiff') return 'audio/aiff';
    return 'video/mp4';
  }
};
