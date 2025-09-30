import { Grade } from '@/types';
import { cn } from '@/lib/utils';

const gradeColors: Record<Grade, string> = {
  A: 'bg-success text-background',
  B: 'bg-primary text-primary-foreground',
  C: 'bg-alert text-alert-foreground',
  D: 'bg-destructive/80 text-foreground',
  F: 'bg-destructive text-destructive-foreground',
};

const gradeLabels: Record<Grade, string> = {
  A: 'Rare Win',
  B: 'Partial',
  C: 'Mid',
  D: 'Failing',
  F: 'Disaster',
};

interface GradeBadgeProps {
  grade: Grade;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const GradeBadge = ({ grade, size = 'md', showLabel = false }: GradeBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-bold font-mono',
        gradeColors[grade],
        sizeClasses[size]
      )}
    >
      <span>{grade}</span>
      {showLabel && <span className="font-normal">{gradeLabels[grade]}</span>}
    </span>
  );
};
