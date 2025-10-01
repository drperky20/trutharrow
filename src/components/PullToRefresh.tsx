import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  shouldTrigger: boolean;
}

export const PullToRefreshIndicator = ({
  isPulling,
  isRefreshing,
  pullDistance,
  shouldTrigger,
}: PullToRefreshIndicatorProps) => {
  if (!isPulling && !isRefreshing) return null;

  const rotation = Math.min((pullDistance / 80) * 360, 360);
  const opacity = Math.min(pullDistance / 80, 1);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center pointer-events-none md:hidden"
      style={{
        transform: `translateY(${Math.min(pullDistance, 80)}px)`,
        transition: isPulling ? 'none' : 'transform 300ms ease-out',
      }}
    >
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border shadow-lg",
          shouldTrigger && "bg-primary border-primary"
        )}
        style={{ opacity }}
      >
        <RefreshCw
          className={cn(
            "h-5 w-5 transition-colors",
            shouldTrigger ? "text-primary-foreground" : "text-muted-foreground",
            isRefreshing && "animate-spin"
          )}
          style={{
            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
          }}
        />
      </div>
    </div>
  );
};
