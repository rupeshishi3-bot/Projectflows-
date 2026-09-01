import React from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name = 'User', 
  size = 'md',
  className = '' 
}) => {
  const [imgError, setImgError] = React.useState(false);

  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm font-semibold',
    xl: 'w-14 h-14 text-base font-bold',
  };

  // Deterministic background color from name string
  const getBgColor = (text: string) => {
    const colors = [
      'bg-indigo-600',
      'bg-rose-600',
      'bg-emerald-600',
      'bg-sky-600',
      'bg-amber-600',
      'bg-violet-600',
      'bg-teal-600',
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover shrink-0 border border-zinc-700/80 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      title={name}
      className={`rounded-full flex items-center justify-center text-white shrink-0 font-mono font-medium border border-white/10 ${getBgColor(name)} ${sizeClasses[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
