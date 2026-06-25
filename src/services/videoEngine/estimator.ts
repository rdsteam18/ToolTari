import type { VideoProfile } from './analyzer';

export interface EstimateResult {
  ramRequiredMb: number;
  ramReadable: string;
  estimatedTimeSeconds: number;
  timeReadable: string;
  compatibility: 'Full' | 'Supported (Caution)' | 'Risk of Tab Crash' | 'Cloud Recommended';
  compatibilityColor: 'success' | 'warning' | 'danger';
  recommendCloud: boolean;
}

export const videoEstimator = {
  /**
   * Generates a resource estimation report for running a video tool operation
   */
  estimate(profile: VideoProfile, toolId: string): EstimateResult {
    const sizeMb = profile.sizeBytes / (1024 * 1024);
    let ramMultiplier = 1.5; // default for light operations
    let timeFactor = 0.05; // default speed factor

    // Heavy operations require loading decoding heaps in WASM memory
    const heavyTools = ['compress-video', 'convert-video', 'video-to-gif'];
    const lightTools = ['trim-video', 'mute-video', 'extract-audio', 'youtube-thumbnail'];

    if (heavyTools.includes(toolId)) {
      ramMultiplier = 3.2; // WASM heap + input file + output buffer
      timeFactor = 0.4; // 2.5x processing speed relative to video duration
    } else if (lightTools.includes(toolId)) {
      ramMultiplier = 1.2;
      timeFactor = 0.02; // Native elements execute almost instantly
    }

    // 1. RAM Calculation
    const ramRequiredMb = Math.round(sizeMb * ramMultiplier + 128); // plus 128MB baseline for WASM load
    const ramReadable = ramRequiredMb > 1024 
      ? `${(ramRequiredMb / 1024).toFixed(1)} GB` 
      : `${ramRequiredMb} MB`;

    // 2. Time Calculation
    let estimatedTimeSeconds = Math.round(profile.duration * timeFactor + 1);
    if (toolId === 'youtube-thumbnail') estimatedTimeSeconds = 1; // Instant API fetch
    const timeReadable = estimatedTimeSeconds > 60 
      ? `${Math.floor(estimatedTimeSeconds / 60)}m ${estimatedTimeSeconds % 60}s` 
      : `${estimatedTimeSeconds} seconds`;

    // 3. Browser Compatibility Decision
    let compatibility: 'Full' | 'Supported (Caution)' | 'Risk of Tab Crash' | 'Cloud Recommended' = 'Full';
    let compatibilityColor: 'success' | 'warning' | 'danger' = 'success';
    let recommendCloud = false;

    if (sizeMb > 400) {
      compatibility = 'Cloud Recommended';
      compatibilityColor = 'danger';
      recommendCloud = true;
    } else if (sizeMb > 200) {
      compatibility = 'Risk of Tab Crash';
      compatibilityColor = 'danger';
      recommendCloud = true;
    } else if (sizeMb > 100) {
      compatibility = 'Supported (Caution)';
      compatibilityColor = 'warning';
    }

    return {
      ramRequiredMb,
      ramReadable,
      estimatedTimeSeconds,
      timeReadable,
      compatibility,
      compatibilityColor,
      recommendCloud
    };
  }
};
