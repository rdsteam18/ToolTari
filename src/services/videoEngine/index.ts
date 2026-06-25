import { videoValidator } from './validator';
import { videoAnalyzer } from './analyzer';
import { videoEstimator } from './estimator';
import { ffmpegHelper } from './ffmpegHelper';

export const videoEngine = {
  validator: videoValidator,
  analyzer: videoAnalyzer,
  estimator: videoEstimator,
  ffmpeg: ffmpegHelper,

  /**
   * Compress video by adjusting bitrate and scale via FFmpeg
   */
  async compressVideo(
    file: File, 
    level: 'low' | 'medium' | 'high' | 'max', 
    onProgress?: (p: number, msg: string) => void
  ): Promise<Blob> {
    await videoValidator.validate(file);

    const bitrateMapping = {
      low: ['-b:v', '2000k'],
      medium: ['-b:v', '1000k'],
      high: ['-b:v', '600k', '-vf', 'scale=-2:720'], // scale down to 720p
      max: ['-b:v', '300k', '-vf', 'scale=-2:480'] // scale down to 480p
    };

    const targetArgs = bitrateMapping[level] || bitrateMapping.medium;
    const args = ['-i', 'input.mp4', ...targetArgs, '-c:a', 'copy', 'output.mp4'];

    return ffmpegHelper.runCommand(file, 'output.mp4', args, onProgress);
  },

  /**
   * Trim video between start and end times
   */
  async trimVideo(
    file: File, 
    startSeconds: number, 
    endSeconds: number, 
    onProgress?: (p: number, msg: string) => void
  ): Promise<Blob> {
    await videoValidator.validate(file);
    const duration = endSeconds - startSeconds;
    
    // Command: ffmpeg -ss start -i input -t duration -c copy output.mp4
    const args = [
      '-ss', startSeconds.toString(),
      '-i', 'input.mp4',
      '-t', duration.toString(),
      '-c', 'copy',
      'output.mp4'
    ];

    return ffmpegHelper.runCommand(file, 'output.mp4', args, onProgress);
  },

  /**
   * Mute the audio track in a video
   */
  async muteVideo(file: File, onProgress?: (p: number, msg: string) => void): Promise<Blob> {
    await videoValidator.validate(file);
    
    // Command: ffmpeg -i input -an -c:v copy output.mp4
    const args = ['-i', 'input.mp4', '-an', '-c:v', 'copy', 'output.mp4'];
    return ffmpegHelper.runCommand(file, 'output.mp4', args, onProgress);
  },

  /**
   * Extract audio track from video as MP3
   */
  async extractAudio(file: File, onProgress?: (p: number, msg: string) => void): Promise<Blob> {
    await videoValidator.validate(file);
    
    // Command: ffmpeg -i input -vn -q:a 2 output.mp3
    const args = ['-i', 'input.mp4', '-vn', '-q:a', '2', 'output.mp3'];
    return ffmpegHelper.runCommand(file, 'output.mp3', args, onProgress);
  },

  /**
   * Convert video to WebM or MOV format
   */
  async convertFormat(
    file: File, 
    targetFormat: 'webm' | 'mov' | 'gif', 
    onProgress?: (p: number, msg: string) => void
  ): Promise<Blob> {
    await videoValidator.validate(file);
    
    const outputName = `output.${targetFormat}`;
    let args: string[] = [];

    if (targetFormat === 'webm') {
      args = ['-i', 'input.mp4', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '30', '-c:a', 'libopus', outputName];
    } else if (targetFormat === 'mov') {
      args = ['-i', 'input.mp4', '-c:v', 'copy', '-c:a', 'copy', outputName];
    } else {
      // gif conversion
      args = ['-i', 'input.mp4', '-t', '5', '-vf', 'fps=10,scale=320:-1:flags=lanczos', outputName];
    }

    return ffmpegHelper.runCommand(file, outputName, args, onProgress);
  }
};
