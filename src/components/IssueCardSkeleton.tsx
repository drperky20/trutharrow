import { Skeleton } from '@/components/ui/skeleton';

export const IssueCardSkeleton = () => {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-8 w-12 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex flex-wrap gap-2 pt-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
};

export const IssueCardSkeletonList = ({ count = 6 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <IssueCardSkeleton key={i} />
      ))}
    </>
  );
};
