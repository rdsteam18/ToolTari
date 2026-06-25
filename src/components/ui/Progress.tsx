interface ProgressProps {
  percent: number;
  message?: string;
}

export default function Progress({ percent, message = 'Processing...' }: ProgressProps) {
  const cleanPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div className="w-full bg-bg-surface border border-border-base rounded-md shadow-small p-5 flex flex-col gap-3">
      <div className="flex justify-between items-center text-sm font-semibold text-text-primary">
        <span className="animate-pulse">{message}</span>
        <span className="text-primary">{cleanPercent}%</span>
      </div>
      
      {/* Outer progress background track */}
      <div className="w-full h-2.5 bg-bg-base rounded-full overflow-hidden">
        {/* Animated fill indicator */}
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${cleanPercent}%` }}
        />
      </div>
    </div>
  );
}
