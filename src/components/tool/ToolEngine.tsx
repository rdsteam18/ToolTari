import { useState } from 'react';
import Button from '../ui/Button';
import { Upload } from '../ui/Upload';
import Progress from '../ui/Progress';
import { universalDocumentEngine } from '../../services/documentEngine/universalDocumentEngine';
import { runToolProcessor } from '../../lib/processingEngine';
import type { ToolProcessor } from '../../lib/processingEngine';
import { findToolById } from '../../toolRegistry';
import { Shield, Sparkles, Download, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import ImageComparisonSlider from './ImageComparisonSlider';
import { videoEngine } from '../../services/videoEngine';
import { audioEngine } from '../../services/audioEngine';
import AudioWaveform from './AudioWaveform';

interface ToolEngineProps {
  toolId: string;
}

export default function ToolEngine({ toolId }: ToolEngineProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const [message, setMessage] = useState('');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalFileUrl, setOriginalFileUrl] = useState<string | null>(null);
  const [videoProfile, setVideoProfile] = useState<any | null>(null);
  const [audioProfile, setAudioProfile] = useState<any | null>(null);
  const [estimate, setEstimate] = useState<any | null>(null);
  const [audioEstimate, setAudioEstimate] = useState<any | null>(null);
  const [trimStart, setTrimStart] = useState('0');
  const [trimEnd, setTrimEnd] = useState('10');
  const [compressLevel, setCompressLevel] = useState('medium');
  const [error, setError] = useState<string | null>(null);

  // Audio specific options
  const [volumeFactor, setVolumeFactor] = useState('1.5');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaArtist, setMetaArtist] = useState('');
  const [metaAlbum, setMetaAlbum] = useState('');
  const [metaGenre, setMetaGenre] = useState('');
  const [metaYear, setMetaYear] = useState('');

  // Tool settings inputs
  const [password, setPassword] = useState('');
  const [watermarkText, setWatermarkText] = useState('ToolTari');
  const [compressQuality, setCompressQuality] = useState(0.8);
  const [convertFormat, setConvertFormat] = useState('PNG');
  const [resizeWidth, setResizeWidth] = useState(800);
  const [resizeHeight, setResizeHeight] = useState(600);
  const [splitRanges, setSplitRanges] = useState('1-3');
  const [rotateAngle, setRotateAngle] = useState(90);
  const [outputFilename, setOutputFilename] = useState('');

  // Developer & text tools states
  const [devInput, setDevInput] = useState('');
  const [devOutput, setDevOutput] = useState('');
  const [passwordOptions, setPasswordOptions] = useState({ length: 16, upper: true, lower: true, nums: true, symbols: true });
  const [passStrength, setPassStrength] = useState<any>(null);

  const toolEntry = findToolById(toolId);
  
  const getProcessorForTool = (_category: string): ToolProcessor => {
    return universalDocumentEngine;
  };

  const resetEngine = () => {
    setFiles([]);
    setLoading(false);
    setPercent(0);
    setMessage('');
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    if (originalFileUrl) URL.revokeObjectURL(originalFileUrl);
    setOriginalFileUrl(null);
    setVideoProfile(null);
    setAudioProfile(null);
    setEstimate(null);
    setAudioEstimate(null);
    setError(null);
    setOutputFilename('');
    setTrimStart('0');
    setTrimEnd('10');
    setVolumeFactor('1.5');
    setMetaTitle('');
    setMetaArtist('');
    setMetaAlbum('');
    setMetaGenre('');
    setMetaYear('');
  };

  const runVideoAnalysis = async (file: File) => {
    try {
      const profile = await videoEngine.analyzer.analyze(file);
      const est = videoEngine.estimator.estimate(profile, toolId);
      setVideoProfile(profile);
      setEstimate(est);
    } catch (e) {
      console.warn('Failed to analyze video:', e);
    }
  };

  const handleAudioProfileLoaded = (profile: any) => {
    setAudioProfile(profile);
    const est = audioEngine.estimator.estimate(profile, toolId);
    setAudioEstimate(est);

    // Prepopulate metadata title if empty
    if (!metaTitle && profile.name) {
      const baseName = profile.name.replace(/\.[^/.]+$/, "");
      setMetaTitle(baseName);
    }
    // Update trim markers to boundaries
    setTrimStart('0');
    setTrimEnd(profile.duration.toFixed(1));
  };

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => {
      const all = [...prev, ...newFiles];
      // Keep only first file for single-file operations
      const singleFileTools = [
        'split-pdf', 'compress-pdf', 'protect-pdf', 'unlock-pdf', 'rotate-pdf', 'watermark-pdf', 
        'add-page-numbers', 'delete-pages', 'extract-pages', 'compress-image', 'resize-image', 
        'crop-image', 'image-converter', 'rotate-image', 'image-filter', 'watermark-image', 
        'image-metadata', 'remove-bg', 'image-editor', 'compress-video', 'trim-video', 
        'mute-video', 'extract-audio', 'video-to-gif',
        'compress-audio', 'trim-audio', 'volume-audio', 'convert-audio', 'metadata-audio'
      ];
      const targetFiles = singleFileTools.includes(toolId) ? [all[0]] : all;
      
      // Update original file URL for comparison slider
      if (targetFiles.length > 0 && targetFiles[0].type.startsWith('image/')) {
        if (originalFileUrl) URL.revokeObjectURL(originalFileUrl);
        setOriginalFileUrl(URL.createObjectURL(targetFiles[0]));
      }

      // Check if it is a video file
      if (targetFiles.length > 0 && targetFiles[0].type.startsWith('video/')) {
        runVideoAnalysis(targetFiles[0]);
      }
      
      return targetFiles;
    });
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Execution Handlers using Reusable Processing Engine
  const executeProcess = async () => {
    if (!toolEntry) {
      setError('Tool configuration not found in registry.');
      return;
    }

    setLoading(true);
    setError(null);
    setPercent(0);
    setMessage('Initializing processing pipeline...');

    try {
      const processor = getProcessorForTool(toolEntry.category);
      const ctx = {
        toolId,
        files,
        options: {
          password,
          watermarkText,
          compressQuality,
          convertFormat,
          resizeWidth,
          resizeHeight,
          splitRanges,
          rotateAngle,
          outputFilename,
          trimStart,
          trimEnd,
          compressLevel,
          volumeFactor,
          metaTitle,
          metaArtist,
          metaAlbum,
          metaGenre,
          metaYear
        },
        onProgress: (p: number, msg: string) => {
          setPercent(p);
          setMessage(msg);
        }
      };

      const result = await runToolProcessor(processor, ctx);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.blob) {
        setResultBlob(result.blob);
        setResultUrl(URL.createObjectURL(result.blob));
        if (result.outputName) {
          setOutputFilename(result.outputName);
        }
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } else if (result.data) {
        // Handle tools that return direct metadata / string outputs
        setDevOutput(JSON.stringify(result.data, null, 2));
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during processing.');
    } finally {
      setLoading(false);
    }
  };

  // Immediate Utility computations using Reusable Processing Engine
  const runPasswordGen = async () => {
    setLoading(true);
    setError(null);
    try {
      const processor = getProcessorForTool('security');
      const result = await runToolProcessor(processor, {
        toolId,
        files: [],
        options: passwordOptions,
        onProgress: (p, msg) => {
          setPercent(p);
          setMessage(msg);
        }
      });
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setDevOutput(result.data.password);
        setPassStrength(result.data.strength);
        confetti({ particleCount: 20, spread: 30 });
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBase64Convert = async (encode: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const processor = getProcessorForTool('developer');
      const result = await runToolProcessor(processor, {
        toolId,
        files: [],
        options: {
          inputVal: devInput,
          mode: encode ? 'encode' : 'decode'
        },
        onProgress: (p, msg) => {
          setPercent(p);
          setMessage(msg);
        }
      });
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setDevOutput(result.data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseConvert = async (transform: 'upper' | 'lower' | 'title') => {
    setLoading(true);
    setError(null);
    try {
      const processor = getProcessorForTool('text');
      const result = await runToolProcessor(processor, {
        toolId,
        files: [],
        options: {
          inputVal: devInput,
          transform
        },
        onProgress: (p, msg) => {
          setPercent(p);
          setMessage(msg);
        }
      });
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setDevOutput(result.data);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      
      {/* Privacy Guard Notice */}
      <div className="p-4 bg-success/10 border border-success/30 text-text-secondary text-sm rounded-md flex items-start gap-3 select-none">
        <Shield className="h-5 w-5 text-success shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-text-primary">100% Secure In-Browser Processing</span>
          <p className="text-xs text-text-secondary leading-relaxed">
            Your files and inputs stay completely local. All operations execute client-side using sandboxed JavaScript algorithms in memory. No uploads.
          </p>
        </div>
      </div>

      {/* Errors Banner */}
      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 text-danger text-sm rounded-md flex items-center gap-2 animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* RENDER LOGIC BY TOOL CATEGORY */}
      {resultBlob ? (
        /* Success result screen */
        <div className="bg-bg-surface border border-border-base rounded-md p-6 md:p-8 flex flex-col items-center justify-center text-center gap-4 animate-fade-in shadow-small w-full">
          <div className="p-4 bg-success/15 text-success rounded-full">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Process Completed Successfully!</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Your file was formatted locally in browser RAM. You can save it to your desktop below.
          </p>

          {originalFileUrl && resultUrl && files[0] && files[0].type.startsWith('image/') && !outputFilename.endsWith('.pdf') && (
            <div className="w-full max-w-lg my-2">
              <ImageComparisonSlider
                originalUrl={originalFileUrl}
                processedUrl={resultUrl}
                originalName="Before"
                processedName="After"
              />
            </div>
          )}

          <a
            href={resultUrl || '#'}
            download={outputFilename || `tooltari_${toolId}_result`}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-md text-sm flex items-center gap-1.5 shadow-medium select-none transition-smooth"
          >
            <Download className="h-4 w-4" /> Download Processed Output
          </a>
          <button onClick={resetEngine} className="text-xs font-semibold text-text-muted hover:text-primary flex items-center gap-1 mt-2 transition-smooth">
            <RefreshCw className="h-3 w-3" /> Process Another File
          </button>
        </div>
      ) : loading ? (
        /* Processing screen */
        <Progress percent={percent} message={message} />
      ) : (
        /* Main tool options panels */
        <div className="flex flex-col gap-6">
          
          {/* File inputs for standard converter tools */}
          {!['password-generator', 'base64-converter', 'text-converter', 'word-counter'].includes(toolId) && (
            <div className="flex flex-col gap-4">
              <Upload
                onFilesSelected={handleFilesSelected}
                selectedFiles={files}
                onRemoveFile={handleRemoveFile}
                multiple={['merge-pdf', 'zip-compressor'].includes(toolId)}
                accept={toolId.includes('pdf') ? '.pdf' : (toolId.includes('video') || ['extract-audio', 'video-to-gif'].includes(toolId)) ? 'video/*' : toolId.includes('audio') ? 'audio/*' : 'image/*'}
              />

              {/* Audio Waveform Editor & Preview */}
              {files.length > 0 && toolEntry?.category === 'audio' && (
                <AudioWaveform
                  file={files[0]}
                  trimStart={parseFloat(trimStart) || 0}
                  trimEnd={parseFloat(trimEnd) || 10}
                  onChangeTrim={(start, end) => {
                    setTrimStart(start.toFixed(1));
                    setTrimEnd(end.toFixed(1));
                  }}
                  onProfileLoaded={handleAudioProfileLoaded}
                />
              )}

              {/* PDF Protect option */}
              {toolId === 'protect-pdf' && (
                <div className="flex flex-col gap-1.5 bg-bg-surface border border-border-base p-4 rounded-md shadow-small">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Set Password</label>
                  <input
                    type="password"
                    placeholder="Enter lock password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth w-full"
                  />
                </div>
              )}

              {/* PDF/Image Watermark Option */}
              {(toolId === 'watermark-pdf' || toolId === 'watermark-image') && (
                <div className="flex flex-col gap-1.5 bg-bg-surface border border-border-base p-4 rounded-md shadow-small">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Watermark Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth w-full"
                  />
                </div>
              )}

              {/* Compress image Slider option */}
              {toolId === 'compress-image' && (
                <div className="flex flex-col gap-3 bg-bg-surface border border-border-base p-4 rounded-md shadow-small">
                  <div className="flex justify-between items-center text-xs font-bold text-text-secondary uppercase tracking-wider">
                    <span>Compression Level</span>
                    <span className="text-primary font-extrabold">{Math.round(compressQuality * 100)}% Quality</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={compressQuality}
                    onChange={(e) => setCompressQuality(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              )}

              {/* Image Converter select format option */}
              {toolId === 'image-converter' && (
                <div className="flex flex-col gap-2 bg-bg-surface border border-border-base p-4 rounded-md shadow-small">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Target Format</label>
                  <select
                    value={convertFormat}
                    onChange={(e) => setConvertFormat(e.target.value)}
                    className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
                  >
                    <option value="PNG">PNG (Portable Network Graphics)</option>
                    <option value="JPEG">JPEG (Joint Photographic Experts Group)</option>
                    <option value="WEBP">WEBP (Modern web format)</option>
                  </select>
                </div>
               )}

               {/* PDF Split page range option */}
               {toolId === 'split-pdf' && (
                 <div className="flex flex-col gap-1.5 bg-bg-surface border border-border-base p-4 rounded-md shadow-small">
                   <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Page Ranges (e.g. 1-3, 5)</label>
                   <input
                     type="text"
                     value={splitRanges}
                     onChange={(e) => setSplitRanges(e.target.value)}
                     className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth w-full"
                   />
                 </div>
               )}

               {/* PDF/Image Rotation angle option */}
               {(toolId === 'rotate-pdf' || toolId === 'rotate-image') && (
                 <div className="flex flex-col gap-2 bg-bg-surface border border-border-base p-4 rounded-md shadow-small">
                   <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Rotation Angle</label>
                   <select
                     value={rotateAngle}
                     onChange={(e) => setRotateAngle(parseInt(e.target.value) || 90)}
                     className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
                   >
                     <option value={90}>90° Clockwise</option>
                     <option value={180}>180°</option>
                     <option value={270}>270° Counter-Clockwise</option>
                   </select>
                 </div>
               )}

               {/* Image Resize dimension options */}
               {toolId === 'resize-image' && (
                 <div className="flex gap-4 bg-bg-surface border border-border-base p-4 rounded-md shadow-small animate-fade-in">
                   <div className="flex-1 flex flex-col gap-1.5">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Width (px)</label>
                     <input
                       type="number"
                       value={resizeWidth}
                       onChange={(e) => setResizeWidth(parseInt(e.target.value) || 0)}
                       className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth w-full"
                     />
                   </div>
                   <div className="flex-1 flex flex-col gap-1.5">
                     <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Height (px)</label>
                     <input
                       type="number"
                       value={resizeHeight}
                       onChange={(e) => setResizeHeight(parseInt(e.target.value) || 0)}
                       className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth w-full"
                     />
                   </div>
                 </div>
               )}

                {/* Video Compress options */}
                {toolId === 'compress-video' && (
                  <div className="flex flex-col gap-2 bg-bg-surface border border-border-base p-4 rounded-md shadow-small">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Compression Preset</label>
                    <select
                      value={compressLevel}
                      onChange={(e) => setCompressLevel(e.target.value)}
                      className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
                    >
                      <option value="low">Low (Fastest, Larger size)</option>
                      <option value="medium">Medium (Standard optimization)</option>
                      <option value="high">High (Reduce to 720p)</option>
                      <option value="max">Maximum (Reduce to 480p, Smallest size)</option>
                    </select>
                  </div>
                )}

                {/* Video Trim options */}
                {toolId === 'trim-video' && (
                  <div className="flex gap-4 bg-bg-surface border border-border-base p-4 rounded-md shadow-small">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Start Time (sec)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={trimStart}
                        onChange={(e) => setTrimStart(e.target.value)}
                        className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth w-full"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">End Time (sec)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        value={trimEnd}
                        onChange={(e) => setTrimEnd(e.target.value)}
                        className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Video Estimator Panel */}
                {videoProfile && estimate && (
                  <div className="flex flex-col gap-3 bg-bg-surface border border-border-base p-4 rounded-md shadow-small animate-fade-in text-xs">
                    <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px] text-primary">Resource Estimation Report</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-text-secondary">
                      <div><span className="font-semibold text-text-muted">Duration:</span> {Math.round(videoProfile.duration)}s</div>
                      <div><span className="font-semibold text-text-muted">Resolution:</span> {videoProfile.resolution}</div>
                      <div><span className="font-semibold text-text-muted">Bitrate:</span> {videoProfile.bitrate}</div>
                      <div><span className="font-semibold text-text-muted">Codec:</span> {videoProfile.codec}</div>
                      <div><span className="font-semibold text-text-muted">Est. RAM Required:</span> {estimate.ramReadable}</div>
                      <div><span className="font-semibold text-text-muted">Est. Render Time:</span> {estimate.timeReadable}</div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 mt-2 border-t border-border-base/50 pt-2">
                      <span className="font-bold text-text-muted">Browser Support:</span>
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                        estimate.compatibilityColor === 'success' ? 'bg-success/15 text-success' :
                        estimate.compatibilityColor === 'warning' ? 'bg-warning/15 text-warning' :
                        'bg-danger/15 text-danger'
                      }`}>
                        {estimate.compatibility}
                      </span>
                    </div>

                    {estimate.recommendCloud && (
                      <div className="p-2.5 bg-danger/5 border border-danger/20 text-danger text-[11px] rounded mt-1 leading-relaxed">
                        <strong>⚠️ Recommendation:</strong> This video is large or complex. Client-side processing may lag or crash some mobile browsers. Recommend cloud-queue worker (Phase 2).
                      </div>
                    )}
                  </div>
                )}

                {/* Audio Compress options */}
                {toolId === 'compress-audio' && (
                  <div className="flex flex-col gap-2 bg-bg-surface border border-border-base p-4 rounded-md shadow-small animate-fade-in">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Compression Preset</label>
                    <select
                      value={compressLevel}
                      onChange={(e) => setCompressLevel(e.target.value)}
                      className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
                    >
                      <option value="low">Low (192kbps - Best Quality)</option>
                      <option value="medium">Medium (128kbps - Recommended)</option>
                      <option value="high">High (96kbps - Compact Size)</option>
                      <option value="max">Maximum (64kbps - Smallest Size)</option>
                    </select>
                  </div>
                )}

                {/* Audio Convert options */}
                {toolId === 'convert-audio' && (
                  <div className="flex flex-col gap-2 bg-bg-surface border border-border-base p-4 rounded-md shadow-small animate-fade-in">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Convert To Format</label>
                    <select
                      value={convertFormat}
                      onChange={(e) => setConvertFormat(e.target.value)}
                      className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
                    >
                      <option value="mp3">MP3 (MPEG Audio Layer 3)</option>
                      <option value="wav">WAV (Lossless Waveform Audio)</option>
                      <option value="aac">AAC (Advanced Audio Coding)</option>
                      <option value="flac">FLAC (Free Lossless Audio Codec)</option>
                      <option value="ogg">OGG (Ogg Vorbis Audio)</option>
                      <option value="opus">OPUS (Highly Compressed Voice Codec)</option>
                    </select>
                  </div>
                )}

                {/* Audio Volume options */}
                {toolId === 'volume-audio' && (
                  <div className="flex flex-col gap-3 bg-bg-surface border border-border-base p-4 rounded-md shadow-small animate-fade-in">
                    <div className="flex justify-between items-center text-xs font-bold text-text-secondary uppercase tracking-wider">
                      <span>Volume Boost Factor</span>
                      <span className="text-primary font-extrabold">{Math.round(parseFloat(volumeFactor) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={volumeFactor}
                      onChange={(e) => setVolumeFactor(e.target.value)}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted font-semibold">
                      <span>0.5x (Quieter)</span>
                      <span>1.0x (Normal)</span>
                      <span>2.0x (Double Volume)</span>
                      <span>3.0x (Max Boost)</span>
                    </div>
                  </div>
                )}

                {/* Audio Metadata tag editor options */}
                {toolId === 'metadata-audio' && (
                  <div className="flex flex-col gap-3 bg-bg-surface border border-border-base p-4 rounded-md shadow-small animate-fade-in">
                    <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px] text-primary">Audio Metadata Tags</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-text-secondary uppercase text-[10px] tracking-wide">Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Song Title"
                          value={metaTitle}
                          onChange={(e) => setMetaTitle(e.target.value)}
                          className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-text-secondary uppercase text-[10px] tracking-wide">Artist</label>
                        <input
                          type="text"
                          placeholder="e.g. Composer/Singer"
                          value={metaArtist}
                          onChange={(e) => setMetaArtist(e.target.value)}
                          className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-text-secondary uppercase text-[10px] tracking-wide">Album</label>
                        <input
                          type="text"
                          placeholder="e.g. Album Name"
                          value={metaAlbum}
                          onChange={(e) => setMetaAlbum(e.target.value)}
                          className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-text-secondary uppercase text-[10px] tracking-wide">Genre</label>
                        <input
                          type="text"
                          placeholder="e.g. Pop, Rock, Podcast"
                          value={metaGenre}
                          onChange={(e) => setMetaGenre(e.target.value)}
                          className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-text-secondary uppercase text-[10px] tracking-wide">Year</label>
                        <input
                          type="text"
                          placeholder="e.g. 2026"
                          value={metaYear}
                          onChange={(e) => setMetaYear(e.target.value)}
                          className="px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio Estimator Panel */}
                {audioProfile && audioEstimate && (
                  <div className="flex flex-col gap-3 bg-bg-surface border border-border-base p-4 rounded-md shadow-small animate-fade-in text-xs">
                    <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px] text-primary">Audio Resource Estimate</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-text-secondary">
                      <div><span className="font-semibold text-text-muted">Duration:</span> {Math.round(audioProfile.duration)}s</div>
                      <div><span className="font-semibold text-text-muted">Sample Rate:</span> {audioProfile.sampleRate} Hz</div>
                      <div><span className="font-semibold text-text-muted">Bitrate:</span> {audioProfile.bitrate}</div>
                      <div><span className="font-semibold text-text-muted">Channels:</span> {audioProfile.channels}</div>
                      <div><span className="font-semibold text-text-muted">Est. RAM Required:</span> {audioEstimate.ramReadable}</div>
                      <div><span className="font-semibold text-text-muted">Est. Render Time:</span> {audioEstimate.timeReadable}</div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 mt-2 border-t border-border-base/50 pt-2">
                      <span className="font-bold text-text-muted">Browser Support:</span>
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                        audioEstimate.compatibilityColor === 'success' ? 'bg-success/15 text-success' :
                        audioEstimate.compatibilityColor === 'warning' ? 'bg-warning/15 text-warning' :
                        'bg-danger/15 text-danger'
                      }`}>
                        {audioEstimate.compatibility}
                      </span>
                    </div>

                    {audioEstimate.recommendCloud && (
                      <div className="p-2.5 bg-danger/5 border border-danger/20 text-danger text-[11px] rounded mt-1 leading-relaxed">
                        <strong>⚠️ Recommendation:</strong> This audio file is large. Client-side decoding may consume significant memory. Recommend cloud-queue worker (Phase 2).
                      </div>
                    )}
                  </div>
                )}

               {/* Run Action triggers */}
              {files.length > 0 && (
                <Button onClick={executeProcess} className="py-2.5 font-bold shadow-medium flex items-center justify-center gap-1">
                  <Sparkles className="h-4 w-4" /> Run Processing Engine
                </Button>
              )}
            </div>
          )}

          {/* Password Generator Interface */}
          {toolId === 'password-generator' && (
            <div className="flex flex-col gap-4 bg-bg-surface border border-border-base p-6 rounded-md shadow-small">
              <h3 className="font-bold text-text-primary text-base">Password Generator Parameters</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Password Length</label>
                  <input
                    type="number"
                    min="8"
                    max="64"
                    value={passwordOptions.length}
                    onChange={(e) => setPasswordOptions({ ...passwordOptions, length: parseInt(e.target.value) || 16 })}
                    className="px-3 py-1.5 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 text-xs font-semibold text-text-secondary select-none">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={passwordOptions.upper} onChange={(e) => setPasswordOptions({ ...passwordOptions, upper: e.target.checked })} className="accent-primary" /> Uppercase Letters</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={passwordOptions.lower} onChange={(e) => setPasswordOptions({ ...passwordOptions, lower: e.target.checked })} className="accent-primary" /> Lowercase Letters</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={passwordOptions.nums} onChange={(e) => setPasswordOptions({ ...passwordOptions, nums: e.target.checked })} className="accent-primary" /> Numbers (0-9)</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={passwordOptions.symbols} onChange={(e) => setPasswordOptions({ ...passwordOptions, symbols: e.target.checked })} className="accent-primary" /> Special Symbols</label>
              </div>

              <Button onClick={runPasswordGen} className="mt-4 font-bold">Generate Password</Button>

              {devOutput && (
                <div className="mt-4 p-4 bg-bg-base border border-border-base rounded-md flex flex-col gap-2 animate-fade-in">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Generated Password</span>
                  <div className="flex justify-between items-center bg-bg-surface border border-border-base px-3 py-2 rounded-md font-mono text-sm break-all">
                    <span>{devOutput}</span>
                    <button onClick={() => { navigator.clipboard.writeText(devOutput); confetti({ particleCount: 10, spread: 20 }); }} className="text-xs text-primary font-bold hover:underline select-none ml-2">Copy</button>
                  </div>
                  {passStrength && (
                    <div className="flex justify-between items-center text-xs font-bold mt-2">
                      <span className="text-text-secondary">Security Score:</span>
                      <span className={passStrength.score >= 3 ? 'text-success' : 'text-warning'}>{passStrength.label} (Entropy: {passStrength.entropy})</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Base64 Converter Interface */}
          {toolId === 'base64-converter' && (
            <div className="flex flex-col gap-4 bg-bg-surface border border-border-base p-6 rounded-md shadow-small">
              <h3 className="font-bold text-text-primary text-base">Base64 Text Encoder/Decoder</h3>
              <textarea
                rows={4}
                placeholder="Enter string values here..."
                value={devInput}
                onChange={(e) => setDevInput(e.target.value)}
                className="w-full px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm font-mono outline-none resize-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
              />
              <div className="flex gap-4">
                <Button onClick={() => handleBase64Convert(true)} className="flex-1 font-bold">Encode to Base64</Button>
                <Button onClick={() => handleBase64Convert(false)} variant="secondary" className="flex-1 font-bold">Decode Base64</Button>
              </div>
              {devOutput && (
                <div className="mt-4 p-4 bg-bg-base border border-border-base rounded-md flex flex-col gap-2 animate-fade-in">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Output Result</span>
                  <textarea
                    readOnly
                    rows={4}
                    value={devOutput}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-base rounded-md text-sm font-mono outline-none resize-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                  <button onClick={() => navigator.clipboard.writeText(devOutput)} className="w-fit text-xs text-primary font-bold hover:underline select-none mt-1 transition-smooth">Copy to Clipboard</button>
                </div>
              )}
            </div>
          )}

          {/* Text Casing Converter */}
          {toolId === 'text-converter' && (
            <div className="flex flex-col gap-4 bg-bg-surface border border-border-base p-6 rounded-md shadow-small">
              <h3 className="font-bold text-text-primary text-base">Text Case Converter</h3>
              <textarea
                rows={4}
                placeholder="Paste your text draft copy here..."
                value={devInput}
                onChange={(e) => setDevInput(e.target.value)}
                className="w-full px-3 py-2 bg-bg-base border border-border-base focus:border-primary focus:bg-bg-surface text-text-primary rounded-md text-sm outline-none resize-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-smooth"
              />
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => handleCaseConvert('upper')} className="text-xs font-bold flex-grow">UPPERCASE</Button>
                <Button onClick={() => handleCaseConvert('lower')} className="text-xs font-bold flex-grow">lowercase</Button>
                <Button onClick={() => handleCaseConvert('title')} variant="secondary" className="text-xs font-bold flex-grow">Title Case</Button>
              </div>
              {devOutput && (
                <div className="mt-4 p-4 bg-bg-base border border-border-base rounded-md flex flex-col gap-2 animate-fade-in">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Result Casing</span>
                  <textarea
                    readOnly
                    rows={4}
                    value={devOutput}
                    className="w-full px-3 py-2 bg-bg-surface border border-border-base rounded-md text-sm outline-none resize-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                  <button onClick={() => navigator.clipboard.writeText(devOutput)} className="w-fit text-xs text-primary font-bold hover:underline select-none mt-1 transition-smooth">Copy to Clipboard</button>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
