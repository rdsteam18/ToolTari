import type { AudioProfile } from './analyzer';

export interface AudioEstimateResult {
  ramRequiredMb: number;
  ramReadable: string;
  estimatedTimeSeconds: number;
  timeReadable: string;
  compatibility: 'Full' | 'Supported (Caution)' | 'Risk of Tab Crash' | 'Cloud Recommended';
  compatibilityColor: 'success' | 'warning' | 'danger';
  recommendCloud: boolean;
}

export const audioEstimator = {
  /**
   * Generates a resource estimation report for running an audio tool operation
   */
  estimate(profile: AudioProfile, toolId: string): AudioEstimateResult {
    const sizeMb = profile.sizeBytes / (1024 * 1024);
    let ramMultiplier = 4.0; // Audio buffer decoding requires ~4-8x memory multiplier for raw PCM float array
    let timeFactor = 0.02; // Very fast processing relative to video

    const heavyTools = ['compress-audio', 'convert-audio'];
    const lightTools = ['trim-audio', 'volume-audio', 'metadata-audio'];

    if (heavyTools.includes(toolId)) {
      ramMultiplier = 6.0; // FFmpeg WASM heap + input/output buffers
      timeFactor = 0.08; // Transcoding speed factor
    } else if (lightTools.includes(toolId)) {
      ramMultiplier = 4.5; // Web Audio offline context render buffers
      timeFactor = 0.01; // Instant native offline context render
    }

    // 1. RAM Calculation
    const ramRequiredMb = Math.round(sizeMb * ramMultiplier + 96); // plus 96MB baseline
    const ramReadable = ramRequiredMb > 1024 
      ? `${(ramRequiredMb / 1024).toFixed(1)} GB` 
      : `${ramRequiredMb} MB`;

    // 2. Time Calculation
    let estimatedTimeSeconds = Math.round(profile.duration * timeFactor + 1);
    if (toolId === 'metadata-audio') estimatedTimeSeconds = 1; // Instant tag injection
    const timeReadable = estimatedTimeSeconds > 60 
      ? `${Math.floor(estimatedTimeSeconds / 60)}m ${estimatedTimeSeconds % 60}s` 
      : `${estimatedTimeSeconds} seconds`;

    // 3. Browser Compatibility Decision
    let compatibility: 'Full' | 'Supported (Caution)' | 'Risk of Tab Crash' | 'Cloud Recommended' = 'Full';
    let compatibilityColor: 'success' | 'warning' | 'danger' = 'success';
    let recommendCloud = false;

    if (sizeMb > 80) {
      compatibility = 'Cloud Recommended';
      compatibilityColor = 'danger';
      recommendCloud = true;
    } else if (sizeMb > 40) {
      compatibility = 'Risk of Tab Crash';
      compatibilityColor = 'danger';
      recommendCloud = true;
    } else if (sizeMb > 15) {
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
