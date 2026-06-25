export interface VideoProfile {
  name: string;
  resolution: string;
  width: number;
  height: number;
  duration: number; // in seconds
  fps: number;
  codec: string;
  bitrate: string;
  audio: boolean;
  sizeBytes: number;
  sizeReadable: string;
  rotation: number;
}

export const videoAnalyzer = {
  /**
   * Loads video into a temporary DOM element to extract profile parameters
   */
  async analyze(file: File): Promise<VideoProfile> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const sizeReadable = this.formatBytes(file.size);

    return new Promise<VideoProfile>((resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const cleanup = () => {
        video.src = '';
        video.load();
        URL.revokeObjectURL(url);
      };

      video.onloadedmetadata = () => {
        const width = video.videoWidth || 1920;
        const height = video.videoHeight || 1080;
        const duration = video.duration || 0;
        const fps = 30; // default estimated frame rate

        // Estimate bitrate: File size in bits / duration
        const bitrateKbps = duration > 0 ? Math.round((file.size * 8) / (duration * 1020)) : 0;
        const bitrate = bitrateKbps > 0 ? `${bitrateKbps} kbps` : 'Unknown';

        // Check audio track presence (using HTML5 track inspection)
        let hasAudio = true;
        if ((video as any).audioTracks) {
          hasAudio = (video as any).audioTracks.length > 0;
        } else if ((video as any).webkitAudioDecodedByteCount !== undefined) {
          // Chrome support check: if webkitAudioDecodedByteCount is 0 after minor pre-roll it means no audio
          hasAudio = (video as any).webkitAudioDecodedByteCount > 0;
        }

        // Guess codec based on format
        let codec = 'H.264 / AAC';
        if (ext === 'webm') codec = 'VP9 / Vorbis';
        else if (ext === 'ogv') codec = 'Theora / Vorbis';
        else if (ext === 'mov') codec = 'HEVC / AAC';

        cleanup();

        resolve({
          name: file.name,
          resolution: `${width}x${height}`,
          width,
          height,
          duration,
          fps,
          codec,
          bitrate,
          audio: hasAudio,
          sizeBytes: file.size,
          sizeReadable,
          rotation: 0
        });
      };

      video.onerror = () => {
        cleanup();
        // Return default video profile if metadata loading fails
        resolve({
          name: file.name,
          resolution: '1920x1080 (Estimated)',
          width: 1920,
          height: 1080,
          duration: 10,
          fps: 30,
          codec: ext.toUpperCase(),
          bitrate: 'Unknown',
          audio: true,
          sizeBytes: file.size,
          sizeReadable,
          rotation: 0
        });
      };

      video.src = url;
    });
  },

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};
