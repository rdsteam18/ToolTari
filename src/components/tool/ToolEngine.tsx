import { useState } from 'react';
import Button from '../ui/Button';
import { Upload } from '../ui/Upload';
import Progress from '../ui/Progress';
import { pdfProcessor } from '../../features/pdf/services/pdfProcessor';
import { imageProcessor } from '../../features/image/services/imageProcessor';
import { developerProcessor } from '../../features/developer/services/developerProcessor';
import { runToolProcessor } from '../../lib/processingEngine';
import type { ToolProcessor } from '../../lib/processingEngine';
import { findToolById } from '../../toolRegistry';
import { Shield, Sparkles, Download, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [error, setError] = useState<string | null>(null);

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
  
  const getProcessorForTool = (category: string): ToolProcessor => {
    if (category === 'pdf') return pdfProcessor;
    if (category === 'image') return imageProcessor;
    return developerProcessor;
  };

  const resetEngine = () => {
    setFiles([]);
    setLoading(false);
    setPercent(0);
    setMessage('');
    setResultBlob(null);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(null);
    setError(null);
    setOutputFilename('');
  };

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(prev => {
      const all = [...prev, ...newFiles];
      // Keep only first file for single-file operations
      const singleFileTools = ['split-pdf', 'compress-pdf', 'protect-pdf', 'unlock-pdf', 'rotate-pdf', 'watermark-pdf', 'add-page-numbers', 'delete-pages', 'extract-pages', 'compress-image', 'resize-image', 'crop-image', 'image-converter', 'rotate-image', 'image-filter', 'watermark-image', 'image-metadata', 'remove-bg', 'image-editor'];
      return singleFileTools.includes(toolId) ? [all[0]] : all;
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
          outputFilename
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
        <div className="bg-bg-surface border border-border-base rounded-md p-6 md:p-8 flex flex-col items-center justify-center text-center gap-4 animate-fade-in shadow-small">
          <div className="p-4 bg-success/15 text-success rounded-full">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Process Completed Successfully!</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Your file was formatted locally in browser RAM. You can save it to your desktop below.
          </p>
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
                accept={toolId.includes('pdf') ? '.pdf' : 'image/*'}
              />

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
