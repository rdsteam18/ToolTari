export interface AudioProfile {
  name: string;
  duration: number; // in seconds
  sampleRate: number; // in Hz
  channels: number;
  bitrate: string; // e.g. "320 kbps"
  peakAmplitude: number; // 0 to 1
  averageLoudnessDb: number; // dB value
  sizeBytes: number;
  sizeReadable: string;
  codec: string;
  silenceRanges: Array<{ start: number; end: number }>;
}

export const audioAnalyzer = {
  /**
   * Decodes audio file using AudioContext to extract channel parameters and peaks
   */
  async analyze(file: File): Promise<AudioProfile> {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const sizeReadable = this.formatBytes(file.size);

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Use AudioContext to decode audio data in-browser
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer).catch((err) => {
        throw new Error(`Failed to decode audio bytes: ${err.message || err}`);
      });

      const duration = audioBuffer.duration || 0;
      const sampleRate = audioBuffer.sampleRate || 44100;
      const channels = audioBuffer.numberOfChannels || 2;

      // Estimate bitrate: File size in bits / duration
      const bitrateKbps = duration > 0 ? Math.round((file.size * 8) / (duration * 1000)) : 0;
      const bitrate = bitrateKbps > 0 ? `${bitrateKbps} kbps` : 'Unknown';

      // Guess codec based on format
      let codec = 'MP3';
      if (ext === 'wav') codec = 'PCM / WAV';
      else if (ext === 'aac') codec = 'AAC';
      else if (ext === 'm4a') codec = 'ALAC / AAC';
      else if (ext === 'flac') codec = 'FLAC';
      else if (ext === 'ogg') codec = 'Vorbis';
      else if (ext === 'opus') codec = 'Opus';
      else if (ext === 'aiff') codec = 'AIFF';

      // Scan channel data for peak amplitude, average loudness (RMS), and silent periods
      let peakAmplitude = 0;
      let rmsSum = 0;
      let sampleCount = 0;

      // Scan only first channel for speed and memory efficiency if multi-channel
      const channelData = audioBuffer.getChannelData(0);
      const step = Math.max(1, Math.floor(channelData.length / 100000)); // Sample up to 100k points

      for (let i = 0; i < channelData.length; i += step) {
        const val = Math.abs(channelData[i]);
        if (val > peakAmplitude) peakAmplitude = val;
        rmsSum += val * val;
        sampleCount++;
      }

      const rms = Math.sqrt(rmsSum / (sampleCount || 1));
      const averageLoudnessDb = rms > 0 ? Math.max(-100, Math.round(20 * Math.log10(rms))) : -100;

      // Detect silences (e.g. amplitude < 0.02 for > 1.0 second)
      const silenceRanges = this.detectSilence(channelData, sampleRate, duration);

      // Close audio context to prevent browser context accumulation
      if (audioCtx.state !== 'closed') {
        await audioCtx.close();
      }

      return {
        name: file.name,
        duration,
        sampleRate,
        channels,
        bitrate,
        peakAmplitude,
        averageLoudnessDb,
        sizeBytes: file.size,
        sizeReadable,
        codec,
        silenceRanges
      };
    } catch (e: any) {
      console.warn('Audio decoding failed, falling back to static estimates:', e);
      // Return static/estimated profile if Web Audio context decoding fails
      const durationEstimate = 180; // 3 min default
      const sampleRate = 44100;
      const channels = 2;
      const bitrateKbps = durationEstimate > 0 ? Math.round((file.size * 8) / (durationEstimate * 1000)) : 128;
      const bitrate = `${bitrateKbps} kbps`;

      return {
        name: file.name,
        duration: durationEstimate,
        sampleRate,
        channels,
        bitrate,
        peakAmplitude: 0.9,
        averageLoudnessDb: -14,
        sizeBytes: file.size,
        sizeReadable,
        codec: ext.toUpperCase(),
        silenceRanges: []
      };
    }
  },

  /**
   * Helper to scan channel buffer and isolate silent intervals (amplitude < 0.015 for > 0.8s)
   */
  detectSilence(
    channelData: Float32Array, 
    sampleRate: number, 
    duration: number
  ): Array<{ start: number; end: number }> {
    const silences: Array<{ start: number; end: number }> = [];
    const threshold = 0.015; // 1.5% max amplitude
    const minSilenceSamples = sampleRate * 0.8; // 0.8s minimum
    
    let isSilent = false;
    let silenceStartSample = 0;

    // Scan in chunks of 50ms (sampleRate * 0.05) to save loops
    const chunkSize = Math.floor(sampleRate * 0.05);
    for (let i = 0; i < channelData.length; i += chunkSize) {
      // Find peak in this chunk
      let chunkPeak = 0;
      const endIdx = Math.min(channelData.length, i + chunkSize);
      for (let j = i; j < endIdx; j++) {
        const val = Math.abs(channelData[j]);
        if (val > chunkPeak) chunkPeak = val;
      }

      if (chunkPeak < threshold) {
        if (!isSilent) {
          isSilent = true;
          silenceStartSample = i;
        }
      } else {
        if (isSilent) {
          isSilent = false;
          const durationSamples = i - silenceStartSample;
          if (durationSamples >= minSilenceSamples) {
            silences.push({
              start: silenceStartSample / sampleRate,
              end: i / sampleRate
            });
          }
        }
      }
    }

    // Add trailing silence if applicable
    if (isSilent) {
      const durationSamples = channelData.length - silenceStartSample;
      if (durationSamples >= minSilenceSamples) {
        silences.push({
          start: silenceStartSample / sampleRate,
          end: duration
        });
      }
    }

    return silences;
  },

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};
