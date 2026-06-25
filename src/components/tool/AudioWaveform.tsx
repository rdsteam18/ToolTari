import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertTriangle } from 'lucide-react';

interface AudioWaveformProps {
  file: File;
  trimStart: number;
  trimEnd: number;
  onChangeTrim: (start: number, end: number) => void;
  onProfileLoaded?: (profile: any) => void;
}

export default function AudioWaveform({
  file,
  trimStart,
  trimEnd,
  onChangeTrim,
  onProfileLoaded
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [duration, setDuration] = useState(0);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Silence detection state
  const [detectedSilences, setDetectedSilences] = useState<Array<{ start: number; end: number }>>([]);
  const [showSilences, setShowSilences] = useState(false);

  // Web Audio Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startOffsetRef = useRef(0);
  const startTimeRef = useRef(0);
  const playheadAnimRef = useRef<number | null>(null);

  // Dragging states
  const [dragTarget, setDragTarget] = useState<'start' | 'end' | null>(null);

  // 1. Decode Audio on File change
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setAudioBuffer(null);
    setPeaks([]);
    setDetectedSilences([]);
    setShowSilences(false);
    setCurrentTime(0);
    setIsPlaying(false);

    const decode = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const buffer = await ctx.decodeAudioData(arrayBuffer);
        if (!active) {
          ctx.close();
          return;
        }

        setAudioBuffer(buffer);
        setDuration(buffer.duration);

        // Generate downsampled peaks (e.g. 300 points)
        const channelData = buffer.getChannelData(0);
        const pointCount = 300;
        const step = Math.floor(channelData.length / pointCount) || 1;
        const extractedPeaks: number[] = [];

        for (let i = 0; i < pointCount; i++) {
          const startIdx = i * step;
          const endIdx = Math.min(channelData.length, startIdx + step);
          let peak = 0;
          for (let j = startIdx; j < endIdx; j++) {
            const val = Math.abs(channelData[j]);
            if (val > peak) peak = val;
          }
          extractedPeaks.push(peak);
        }
        setPeaks(extractedPeaks);

        // Standard profile metadata trigger
        const bitrateKbps = buffer.duration > 0 ? Math.round((file.size * 8) / (buffer.duration * 1000)) : 128;
        const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
        
        onProfileLoaded?.({
          name: file.name,
          duration: buffer.duration,
          sampleRate: buffer.sampleRate,
          channels: buffer.numberOfChannels,
          bitrate: `${bitrateKbps} kbps`,
          peakAmplitude: Math.max(...extractedPeaks),
          averageLoudnessDb: -14,
          sizeBytes: file.size,
          sizeReadable: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          codec: ext.toUpperCase(),
          silenceRanges: []
        });

        // Initialize trim props
        onChangeTrim(0, buffer.duration);
        setLoading(false);
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to parse audio file.');
          setLoading(false);
        }
      }
    };

    decode();

    return () => {
      active = false;
      stopAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, [file]);

  // Update gain node when volume or mute state changes
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 2. Waveform Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || peaks.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const barWidth = width / peaks.length;
    const padding = 1; // gap between bars

    // Render bars
    peaks.forEach((peak, index) => {
      const x = index * barWidth;
      const barHeight = peak * (height - 20); // leave padding
      const y = (height - barHeight) / 2;

      const timeAtIdx = (index / peaks.length) * duration;
      const inTrim = timeAtIdx >= trimStart && timeAtIdx <= trimEnd;

      if (inTrim) {
        ctx.fillStyle = '#6366f1'; // Primary color (indigo-500)
      } else {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.25)'; // Muted translucent indigo
      }

      // Draw rounded rectangle bars
      const r = 2; // radius
      ctx.beginPath();
      ctx.roundRect(x + padding, y, barWidth - padding * 2, barHeight, r);
      ctx.fill();
    });

    // Render Silences Overlay if requested
    if (showSilences && detectedSilences.length > 0) {
      detectedSilences.forEach(s => {
        const xStart = (s.start / duration) * width;
        const xEnd = (s.end / duration) * width;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.22)'; // Transparent Amber/Orange
        ctx.fillRect(xStart, 0, xEnd - xStart, height);

        // Accent borders for silence segments
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(xStart, 0);
        ctx.lineTo(xStart, height);
        ctx.moveTo(xEnd, 0);
        ctx.lineTo(xEnd, height);
        ctx.stroke();
      });
    }

    // Render Trim Boundary lines
    const startX = (trimStart / duration) * width;
    const endX = (trimEnd / duration) * width;

    // Start handle
    ctx.strokeStyle = '#4f46e5'; // Indigo-600
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.stroke();

    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.arc(startX, height / 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // End handle
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX, height);
    ctx.stroke();

    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.arc(endX, height / 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Render Playhead vertical indicator line
    if (currentTime >= trimStart && currentTime <= trimEnd) {
      const playheadX = (currentTime / duration) * width;
      ctx.strokeStyle = '#ef4444'; // Red playhead
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();
      
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(playheadX, 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [peaks, trimStart, trimEnd, currentTime, duration, showSilences, detectedSilences]);

  // 3. Playhead progress animator
  const startTimer = () => {
    startTimeRef.current = audioCtxRef.current!.currentTime;
    
    const animate = () => {
      if (!audioCtxRef.current) return;
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
      const calculatedPos = startOffsetRef.current + elapsed;

      if (calculatedPos >= trimEnd) {
        // Loop back to trim start or stop
        stopAudio();
        return;
      }

      setCurrentTime(calculatedPos);
      playheadAnimRef.current = requestAnimationFrame(animate);
    };

    playheadAnimRef.current = requestAnimationFrame(animate);
  };

  const playAudio = async () => {
    if (!audioBuffer || !audioCtxRef.current) return;
    
    // Resume context if suspended (browser security policy)
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    // Stop current source if playing
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
    }

    const ctx = audioCtxRef.current;
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    const gain = ctx.createGain();
    gain.gain.value = isMuted ? 0 : volume;

    source.connect(gain);
    gain.connect(ctx.destination);

    sourceNodeRef.current = source;
    gainNodeRef.current = gain;

    // Start offset calculation (must align inside trim bounds)
    let startOffset = currentTime;
    if (startOffset < trimStart || startOffset >= trimEnd) {
      startOffset = trimStart;
      setCurrentTime(trimStart);
    }
    startOffsetRef.current = startOffset;

    source.start(0, startOffset);
    setIsPlaying(true);
    startTimer();

    source.onended = () => {
      // Audio stream ended naturally
      if (audioCtxRef.current && (audioCtxRef.current.currentTime - startTimeRef.current + startOffsetRef.current >= trimEnd)) {
        setIsPlaying(false);
        if (playheadAnimRef.current) cancelAnimationFrame(playheadAnimRef.current);
      }
    };
  };

  const stopAudio = () => {
    if (playheadAnimRef.current) cancelAnimationFrame(playheadAnimRef.current);
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      // Store current offset time
      startOffsetRef.current = currentTime;
      stopAudio();
    } else {
      playAudio();
    }
  };

  // 4. Drag and Seek mouse events
  const getMouseTime = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    if ('touches' in e) {
      if (e.touches.length === 0) return 0;
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    const relativeX = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, relativeX / rect.width));
    return pct * duration;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement> & { touches?: any }) => {
    const time = getMouseTime(e);
    
    // Check if clicking near start or end handle
    const threshold = duration * 0.03; // 3% margin
    if (Math.abs(time - trimStart) < threshold) {
      setDragTarget('start');
    } else if (Math.abs(time - trimEnd) < threshold) {
      setDragTarget('end');
    } else {
      // Direct seek
      setCurrentTime(time);
      startOffsetRef.current = time;
      if (isPlaying) {
        stopAudio();
        setTimeout(playAudio, 30);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!dragTarget) return;
    const time = getMouseTime(e);

    if (dragTarget === 'start') {
      const newStart = Math.max(0, Math.min(time, trimEnd - 0.5)); // min 0.5s duration
      onChangeTrim(newStart, trimEnd);
      if (currentTime < newStart) setCurrentTime(newStart);
    } else {
      const newEnd = Math.max(trimStart + 0.5, Math.min(time, duration));
      onChangeTrim(trimStart, newEnd);
      if (currentTime > newEnd) setCurrentTime(newEnd);
    }
  };

  const handleMouseUp = () => {
    setDragTarget(null);
  };

  // 5. Silence scanner
  const runSilenceDetection = () => {
    if (!audioBuffer) return;
    const sampleRate = audioBuffer.sampleRate;
    const channelData = audioBuffer.getChannelData(0);
    
    // Run scanner
    const threshold = 0.015; // 1.5% amplitude
    const minSilenceSamples = sampleRate * 0.8;
    const silences: Array<{ start: number; end: number }> = [];
    
    let isSilent = false;
    let silenceStartSample = 0;
    const chunkSize = Math.floor(sampleRate * 0.05);

    for (let i = 0; i < channelData.length; i += chunkSize) {
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

    if (isSilent && (channelData.length - silenceStartSample >= minSilenceSamples)) {
      silences.push({
        start: silenceStartSample / sampleRate,
        end: duration
      });
    }

    setDetectedSilences(silences);
    setShowSilences(true);
  };

  // Helper format seconds -> mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-text-secondary">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"></div>
        <span className="text-xs font-semibold">Decoding audio channels in browser RAM...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-danger/10 border border-danger/30 text-danger text-xs rounded-md flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <span>Failed to load audio peaks: {error}</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-4 bg-bg-surface border border-border-base p-4 rounded-md shadow-small w-full">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-[10px] uppercase tracking-wider text-primary">Interactive Audio Waveform Editor</h4>
        <span className="text-xs font-semibold text-text-muted">{formatTime(currentTime)} / {formatTime(duration)}</span>
      </div>

      {/* Visual Canvas Waveform Block */}
      <div className="relative w-full h-24 bg-bg-base/40 rounded border border-border-base/50 overflow-hidden cursor-ew-resize select-none">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={(e) => handleMouseDown(e as any)}
          onTouchMove={(e) => handleMouseMove(e as any)}
          onTouchEnd={handleMouseUp}
          className="w-full h-full block"
        />
      </div>

      {/* Editing Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-base pt-3">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayback}
            className="p-2 bg-primary hover:bg-primary-hover text-white rounded-full shadow transition-smooth"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 hover:bg-bg-base rounded text-text-secondary transition-smooth"
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-danger" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="w-16 accent-primary h-1.5 bg-bg-base rounded"
            title="Volume"
          />
        </div>

        {/* Silence Detection and Trim Displays */}
        <div className="flex items-center gap-3">
          <button
            onClick={runSilenceDetection}
            className="px-2.5 py-1 text-[11px] font-bold border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20 rounded transition-smooth"
          >
            Detect Silence
          </button>

          {showSilences && (
            <span className="text-[11px] font-semibold text-warning">
              {detectedSilences.length} silences highlighted
            </span>
          )}

          <div className="text-[11px] text-text-secondary font-medium">
            Trim range: <span className="font-bold text-text-primary">{trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
