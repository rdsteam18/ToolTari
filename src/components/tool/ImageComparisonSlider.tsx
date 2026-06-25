import { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight, Eye, Sparkles } from 'lucide-react';

interface ImageComparisonSliderProps {
  originalUrl: string;
  processedUrl: string;
  originalName?: string;
  processedName?: string;
}

export default function ImageComparisonSlider({
  originalUrl,
  processedUrl,
  originalName = 'Original',
  processedName = 'Processed'
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  // Read natural aspect ratio of the original image to scale the slider container cleanly
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = originalUrl;
  }, [originalUrl]);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      <div className="flex justify-between items-center px-1">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-text-secondary">
          <Eye className="h-3.5 w-3.5 text-primary" /> Visual Comparison Slider
        </span>
        <span className="text-[10px] font-bold text-text-muted uppercase bg-bg-base px-2 py-0.5 rounded border border-border-base">
          Drag divider to inspect details
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden w-full rounded-lg border border-border-base bg-bg-base cursor-ew-resize shadow-medium max-h-[500px] flex items-center justify-center"
        style={{ aspectRatio: aspectRatio ? `${aspectRatio}` : '16/9' }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* Underlay: Original Image */}
        <img
          src={originalUrl}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
        <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase rounded shadow select-none pointer-events-none tracking-wider">
          {originalName}
        </div>

        {/* Overlay: Processed Image (Clipped from the left) */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            clipPath: `inset(0 0 0 ${sliderPosition}%)`
          }}
        >
          <img
            src={processedUrl}
            alt="Processed"
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
        <div className="absolute top-3 right-3 px-2 py-1 bg-primary/80 backdrop-blur-sm text-white text-[10px] font-extrabold uppercase rounded shadow select-none pointer-events-none tracking-wider flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> {processedName}
        </div>

        {/* Sliding Handle Bar */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="h-8 w-8 bg-white text-text-primary rounded-full flex items-center justify-center shadow-large border border-border-base transition-transform active:scale-110">
            <ChevronsLeftRight className="h-4 w-4 shrink-0 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}
