interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showCount?: boolean;
  color?: 'blue' | 'green' | 'amber';
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  current,
  total,
  label,
  showCount = true,
  color = 'blue',
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    amber: 'bg-amber-500',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {(label || showCount) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-slate-600 font-medium">{label}</span>}
          {showCount && (
            <span className="text-sm text-slate-500 tabular-nums">
              {current}/{total}
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
      {size === 'lg' && (
        <p className="text-center text-sm text-slate-500 mt-1 tabular-nums">{percentage}%</p>
      )}
    </div>
  );
}
