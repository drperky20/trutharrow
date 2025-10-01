import { Skeleton } from '@/components/ui/skeleton';

type SkeletonType = 'card' | 'post' | 'issue' | 'evidence';

interface LoadingSkeletonProps {
  type?: SkeletonType;
  count?: number;
}

const CardSkeleton = () => (
  <div className="bg-card border border-border rounded-lg p-6 space-y-4">
    <div className="flex items-start justify-between">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-8 w-12 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
    <div className="flex items-center gap-4 pt-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

const PostSkeleton = () => (
  <div className="p-4 border-b border-border">
    <div className="flex gap-3">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex items-center gap-6 mt-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  </div>
);

const IssueSkeleton = () => (
  <div className="bg-card border border-border rounded-lg p-5 space-y-3">
    <div className="flex items-start justify-between">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-6 w-10 rounded-full" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="flex gap-2 pt-2">
      <Skeleton className="h-5 w-16 rounded" />
      <Skeleton className="h-5 w-20 rounded" />
    </div>
    <Skeleton className="h-3 w-32" />
  </div>
);

const EvidenceSkeleton = () => (
  <div className="bg-card border border-border rounded-lg overflow-hidden">
    <Skeleton className="w-full h-48" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

export const LoadingSkeleton = ({ type = 'card', count = 3 }: LoadingSkeletonProps) => {
  const SkeletonComponent = {
    card: CardSkeleton,
    post: PostSkeleton,
    issue: IssueSkeleton,
    evidence: EvidenceSkeleton,
  }[type];

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </>
  );
};

