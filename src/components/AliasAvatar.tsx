import { cn } from '@/lib/utils';

interface AliasAvatarProps {
  alias: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getAvatarColor = (alias: string): string => {
  const colors = [
    'bg-blue-500/20 text-blue-400',
    'bg-green-500/20 text-green-400',
    'bg-purple-500/20 text-purple-400',
    'bg-orange-500/20 text-orange-400',
    'bg-pink-500/20 text-pink-400',
    'bg-teal-500/20 text-teal-400',
    'bg-yellow-500/20 text-yellow-400',
    'bg-red-500/20 text-red-400',
  ];
  const hash = alias.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export const AliasAvatar = ({ alias, size = 'md', className }: AliasAvatarProps) => {
  const initial = alias?.[0]?.toUpperCase() || '?';
  const colorClass = alias ? getAvatarColor(alias) : 'bg-muted text-muted-foreground';

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-mono font-semibold flex-shrink-0',
        sizeClasses[size],
        colorClass,
        className
      )}
      title={alias ? `Posting as ${alias}` : 'Set your alias'}
    >
      {initial}
    </div>
  );
};
