import { useState, useCallback } from 'react';

interface AudioButtonProps {
  onPlay: () => Promise<void>;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export function AudioButton({ onPlay, size = 'md', label, variant = 'primary', className = '' }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20',
    secondary: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    ghost: 'bg-transparent text-slate-500 hover:text-blue-600 hover:bg-slate-100',
  };

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await onPlay();
    } finally {
      setIsPlaying(false);
    }
  }, [onPlay, isPlaying]);

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]} ${variantClasses[variant]}
        rounded-full flex items-center justify-center
        transition-all duration-200 active:scale-90
        ${isPlaying ? 'animate-pulse-soft scale-110' : ''}
        ${className}
      `}
      title={label || 'Listen'}
      aria-label={label || 'Listen to pronunciation'}
    >
      {isPlaying ? (
        <svg className={`${iconSizes[size]} animate-pulse`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg className={iconSizes[size]} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      )}
    </button>
  );
}
