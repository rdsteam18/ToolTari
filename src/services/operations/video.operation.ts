import type { DocumentOperation } from './operation.interface';
import type { ProcessContext, ProcessResult } from '../../lib/processingEngine';
import { videoEngine } from '../videoEngine';

/**
 * Extract high quality YouTube cover image from link
 */
function extractYoutubeThumbnail(url: string): { videoId: string; imageUrl: string } {
  let videoId = '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    videoId = match[2];
  } else {
    throw new Error('Invalid YouTube URL. Please enter a valid watch or share link.');
  }

  return {
    videoId,
    imageUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  };
}

export const videoOperation: DocumentOperation = {
  id: 'video',
  name: 'Video Processing Engine',

  validate(ctx: ProcessContext): void {
    const { toolId, files, options } = ctx;

    if (toolId !== 'youtube-thumbnail' && files.length === 0) {
      throw new Error('Please select a video file to process.');
    }

    if (toolId === 'trim-video') {
      const start = parseFloat(options.trimStart);
      const end = parseFloat(options.trimEnd);
      if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
        throw new Error('Please enter valid Start and End times. End time must be greater than Start time.');
      }
    }

    if (toolId === 'youtube-thumbnail' && !options.inputVal) {
      throw new Error('Please enter a YouTube video URL.');
    }
  },

  async execute(ctx: ProcessContext): Promise<ProcessResult> {
    const { toolId, files, options, onProgress } = ctx;
    let outputBlob: Blob | undefined = undefined;
    let outputName = 'processed_video.mp4';
    let data: any = null;

    switch (toolId) {
      case 'compress-video': {
        const level = options.compressLevel || 'medium';
        onProgress?.(20, 'Analyzing file frames...');
        outputBlob = await videoEngine.compressVideo(files[0], level as any, onProgress);
        outputName = options.outputFilename || 'compressed_video.mp4';
        break;
      }

      case 'trim-video': {
        const start = parseFloat(options.trimStart) || 0;
        const end = parseFloat(options.trimEnd) || 10;
        onProgress?.(20, 'Seeking trim markers...');
        outputBlob = await videoEngine.trimVideo(files[0], start, end, onProgress);
        outputName = options.outputFilename || 'trimmed_video.mp4';
        break;
      }

      case 'mute-video':
        onProgress?.(20, 'Stripping audio tracks...');
        outputBlob = await videoEngine.muteVideo(files[0], onProgress);
        outputName = options.outputFilename || 'muted_video.mp4';
        break;

      case 'extract-audio':
        onProgress?.(20, 'Extracting audio track channels...');
        outputBlob = await videoEngine.extractAudio(files[0], onProgress);
        outputName = options.outputFilename || 'extracted_audio.mp3';
        break;

      case 'video-to-gif':
        onProgress?.(20, 'Converting video frames to animated GIF...');
        outputBlob = await videoEngine.convertFormat(files[0], 'gif', onProgress);
        outputName = options.outputFilename || 'video_animation.gif';
        break;

      case 'youtube-thumbnail': {
        const url = options.inputVal || '';
        onProgress?.(50, 'Extracting thumbnail ID parameters...');
        const thumbnailInfo = extractYoutubeThumbnail(url);
        data = thumbnailInfo;
        
        // Return thumbnail image as blob if available for direct download
        if (thumbnailInfo.imageUrl) {
          const response = await fetch(thumbnailInfo.imageUrl);
          outputBlob = await response.blob();
          outputName = 'youtube_thumbnail.jpg';
        }
        break;
      }

      default:
        throw new Error(`Unsupported tool "${toolId}" in video operation.`);
    }

    return {
      blob: outputBlob,
      outputName,
      data
    };
  }
};
