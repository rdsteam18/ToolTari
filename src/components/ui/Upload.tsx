import React, { useState, useRef } from 'react';
import { UploadCloud, File, AlertCircle, Trash2 } from 'lucide-react';

interface UploadProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onFilesSelected: (files: File[]) => void;
  helperText?: string;
  selectedFiles: File[];
  onRemoveFile?: (index: number) => void;
}

export default function Upload({
  accept = '*',
  multiple = false,
  maxSizeMB = 50,
  onFilesSelected,
  helperText = "Drag & drop files here, or click to select",
  selectedFiles,
  onRemoveFile
}: UploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (filesList: FileList): File[] => {
    setError(null);
    const validFiles: File[] = [];
    const sizeLimit = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      
      // Validate File Size
      if (file.size > sizeLimit) {
        setError(`File "${file.name}" exceeds the ${maxSizeMB}MB file size limit.`);
        continue;
      }

      validFiles.push(file);
      if (!multiple) break; // If single file, take only the first one
    }

    return validFiles;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const valid = validateFiles(e.dataTransfer.files);
      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const valid = validateFiles(e.target.files);
      if (valid.length > 0) {
        onFilesSelected(valid);
      }
      // Reset input value so same file can be uploaded again if removed
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Upload Drop Zone Container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`w-full py-10 px-4 border-2 border-border-base border-dashed rounded-md flex flex-col items-center justify-center gap-3 cursor-pointer transition-smooth bg-bg-surface ${
          isDragActive ? 'upload-drag-active border-primary bg-primary/5' : 'hover:border-primary/60 hover:bg-bg-base/45'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="p-3 bg-primary/10 text-primary rounded-md">
          <UploadCloud className="h-6 w-6" />
        </div>
        
        <div className="text-center">
          <p className="text-sm font-bold text-text-primary">{helperText}</p>
          <p className="text-xs text-text-muted mt-1">Maximum file size: {maxSizeMB}MB</p>
        </div>
      </div>

      {/* Validation Error Banner */}
      {error && (
        <div className="p-3 bg-danger/10 border border-danger/25 text-danger text-sm rounded-md flex items-center gap-2 animate-fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected Files List (If not managed externally) */}
      {selectedFiles.length > 0 && onRemoveFile && (
        <div className="bg-bg-surface border border-border-base rounded-md shadow-small p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Uploaded Files ({selectedFiles.length})</span>
          <ul className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, idx) => (
              <li key={idx} className="flex items-center justify-between p-2 bg-bg-base hover:bg-border-base/30 border border-border-base/50 rounded-md transition-smooth">
                <div className="flex items-center gap-2 min-w-0">
                  <File className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-text-primary truncate" title={file.name}>{file.name}</span>
                    <span className="text-xs text-text-muted">{formatSize(file.size)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(idx);
                  }}
                  className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-smooth"
                  aria-label="Remove file"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
export { Upload };
