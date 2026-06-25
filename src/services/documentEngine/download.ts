import { utilityEngine } from '../utilityEngine';

export interface DownloadTarget {
  blob?: Blob;
  outputName?: string;
  blobs?: Array<{ blob: Blob; name: string }>;
}

export const downloadEngine = {
  /**
   * Orchestrates the download phase. Supports single file triggers or ZIP packaging for batch results.
   */
  async triggerDownload(result: DownloadTarget): Promise<void> {
    // 1. Check for multiple files (packaged into ZIP or individual depending on config)
    if (result.blobs && result.blobs.length > 0) {
      if (result.blobs.length === 1) {
        this.downloadFile(result.blobs[0].blob, result.blobs[0].name);
      } else {
        // Zip them together
        const fileObjects = result.blobs.map(item => new File([item.blob], item.name));
        const zipBlob = await utilityEngine.compressToZip(fileObjects);
        const zipName = result.outputName || 'tooltari_batch_files.zip';
        this.downloadFile(zipBlob, zipName);
      }
    } else if (result.blob && result.outputName) {
      // 2. Standard single file download
      this.downloadFile(result.blob, result.outputName);
    } else {
      console.warn('Download Engine: No blobs available to trigger download.');
    }
  },

  /**
   * Performs browser-native anchor element download trigger
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    
    // Append, trigger, and cleanup DOM Node
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    
    // Memory cleanup: defer revoking slightly to ensure browser registers the click
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  }
};
