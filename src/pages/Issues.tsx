import { useState } from 'react';
import { IssueCard } from '@/components/IssueCard';
import { IssueCardSkeletonList } from '@/components/IssueCardSkeleton';
import { Input } from '@/components/ui/input';
import { Search, SortDesc } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PullToRefreshIndicator } from '@/components/PullToRefresh';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

type SortMode = 'updated' | 'grade';

export default function Issues() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('updated');

  const { data: issues = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('last_updated', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
  
  const allTags = Array.from(new Set(issues.flatMap(i => i.tags || [])));
  
  const gradeValues: Record<string, number> = {
    'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1
  };
  
  const filteredIssues = issues
    .filter(issue => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           issue.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || (issue.tags && issue.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortMode === 'grade') {
        return gradeValues[b.grade] - gradeValues[a.grade];
      }
      return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
    });

  const { isPulling, isRefreshing, pullDistance, shouldTrigger } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    },
  });
  
  return (
    <>
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        shouldTrigger={shouldTrigger}
      />
    <div className="min-h-screen">
      <div className="container px-4 py-8 md:py-12">
        <div className="mb-6 md:mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Detention Board</h1>
          <p className="text-muted-foreground text-lg">
            Report cards on how the district is handling key issues.
          </p>
        </div>
        
        {/* Sticky Search & Filter Bar */}
        <div className="sticky top-0 z-20 bg-gradient-surface backdrop-blur border-y border-border shadow-skeu-raised -mx-4 px-4 py-4 mb-6">
          <div className="space-y-4">
            {/* Search with sort */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11"
                  aria-label="Search issues"
                />
              </div>
              <button
                onClick={() => setSortMode(sortMode === 'updated' ? 'grade' : 'updated')}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-gradient-surface text-sm font-medium transition-all min-h-[44px] whitespace-nowrap shadow-skeu-raised hover:shadow-skeu-raised-lg active:shadow-skeu-pressed",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                )}
                aria-label={`Sort by ${sortMode === 'updated' ? 'grade' : 'last updated'}`}
              >
                <SortDesc className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {sortMode === 'updated' ? 'Latest' : 'Grade'}
                </span>
              </button>
            </div>
            
            {/* Tag filters */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-mono transition-all min-h-[36px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    !selectedTag
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                  aria-label="Show all tags"
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-mono transition-all min-h-[36px]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      selectedTag === tag
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                    aria-label={`Filter by ${tag}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      
        {/* Issues Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <IssueCardSkeletonList count={6} />
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-lg font-semibold mb-2">
              {issues.length === 0 ? 'No issues graded yet' : 'No matches found'}
            </p>
            <p className="text-muted-foreground mb-6">
              {issues.length === 0 
                ? 'Want to report on a district issue? Learn how we grade accountability.' 
                : 'Try adjusting your search or filters.'}
            </p>
            {issues.length === 0 && (
              <Link to="/about">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors min-h-[44px]">
                  How We Grade Issues
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}