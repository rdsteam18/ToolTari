import { audioValidator } from './validator';
import { audioAnalyzer } from './analyzer';
import { audioEstimator } from './estimator';
import { ffmpegHelper } from '../videoEngine/ffmpegHelper';

export const audioEngine = {
  validator: audioValidator,
  analyzer: audioAnalyzer,
  estimator: audioEstimator,

  /**
   * Compress audio by adjusting audio bitrate via FFmpeg
   */
  async compressAudio(
    file: File,
    level: 'low' | 'medium' | 'high' | 'max',
    onProgress?: (p: number, msg: string) => void
  ): Promise<Blob> {
    await audioValidator.validate(file);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';

    // Compression bitrate mapping
    const bitrateMapping = {
      low: '192k',
      medium: '128k',
      high: '96k',
      max: '64k'
    };

    const targetBitrate = bitrateMapping[level] || bitrateMapping.medium;
    const outputName = `compressed_${Date.now()}.${ext}`;
    const args = ['-i', 'input.mp4', '-ab', targetBitrate, outputName];

    return ffmpegHelper.runCommand(file, outputName, args, onProgress);
  },

  /**
   * Trim audio between start and end times
   */
  async trimAudio(
    file: File,
    startSeconds: number,
    endSeconds: number,
    onProgress?: (p: number, msg: string) => void
  ): Promise<Blob> {
    await audioValidator.validate(file);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
    const duration = endSeconds - startSeconds;

    const outputName = `trimmed_${Date.now()}.${ext}`;
    // Command: ffmpeg -ss start -i input -t duration -c copy output
    const args = [
      '-ss', startSeconds.toString(),
      '-i', 'input.mp4',
      '-t', duration.toString(),
      '-c', 'copy',
      outputName
    ];

    return ffmpegHelper.runCommand(file, outputName, args, onProgress);
  },

  /**
   * Adjust audio playback volume (Gain)
   */
  async adjustVolume(
    file: File,
    multiplier: number,
    onProgress?: (p: number, msg: string) => void
  ): Promise<Blob> {
    await audioValidator.validate(file);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';

    const outputName = `volume_${Date.now()}.${ext}`;
    // Command: ffmpeg -i input -filter:a volume=1.5 output
    const args = [
      '-i', 'input.mp4',
      '-filter:a', `volume=${multiplier}`,
      outputName
    ];

    return ffmpegHelper.runCommand(file, outputName, args, onProgress);
  },

  /**
   * Transcode audio between formats
   */
  async convertFormat(
    file: File,
    targetFormat: 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg' | 'opus',
    onProgress?: (p: number, msg: string) => void
  ): Promise<Blob> {
    await audioValidator.validate(file);

    const outputName = `converted_${Date.now()}.${targetFormat}`;
    const args = ['-i', 'input.mp4', outputName];

    return ffmpegHelper.runCommand(file, outputName, args, onProgress);
  },

  /**
   * Write ID3 metadata tags to audio file
   */
  async writeMetadata(
    file: File,
    tags: { title?: string; artist?: string; album?: string; genre?: string; year?: string },
    onProgress?: (p: number, msg: string) => void
  ): Promise<Blob> {
    await audioValidator.validate(file);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';

    const outputName = `tagged_${Date.now()}.${ext}`;
    const args = ['-i', 'input.mp4'];

    if (tags.title) {
      args.push('-metadata', `title=${tags.title}`);
    }
    if (tags.artist) {
      args.push('-metadata', `artist=${tags.artist}`);
    }
    if (tags.album) {
      args.push('-metadata', `album=${tags.album}`);
    }
    if (tags.genre) {
      args.push('-metadata', `genre=${tags.genre}`);
    }
    if (tags.year) {
      args.push('-metadata', `date=${tags.year}`);
    }

    // Copy audio codec to write metadata instantly without re-encoding
    args.push('-c:a', 'copy', outputName);

    return ffmpegHelper.runCommand(file, outputName, args, onProgress);
  }
};
