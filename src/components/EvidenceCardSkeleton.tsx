import { Skeleton } from '@/components/ui/skeleton';

export const EvidenceCardSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 flex-shrink-0 mt-1 rounded" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full rounded" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const EvidenceCardSkeletonList = ({ count = 4 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <EvidenceCardSkeleton key={i} />
      ))}
    </>
  );
};
