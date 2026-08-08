interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'text-sm px-3 py-1 gap-1',
    md: 'text-base px-4 py-2 gap-1.5',
    lg: 'text-lg px-6 py-3 gap-2',
  };

  const flameSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`
      inline-flex items-center ${sizeClasses[size]}
      bg-gradient-to-r from-amber-50 to-orange-50
      border border-amber-200 rounded-xl
      shadow-sm
    `}>
      <span className={flameSize[size]}>{streak > 0 ? '🔥' : '💤'}</span>
      <span className="font-bold text-amber-700 tabular-nums">{streak}</span>
      <span className="text-amber-600 font-medium">天连胜</span>
    </div>
  );
}
