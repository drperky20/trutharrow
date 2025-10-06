import { useState, useEffect } from 'react';
import { FileImage, FileText, Link as LinkIcon, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EvidenceCardSkeletonList } from '@/components/EvidenceCardSkeleton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { PullToRefreshIndicator } from '@/components/PullToRefresh';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function Receipts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterType, setFilterType] = useState<string | null>(searchParams.get('type'));
  const [sortBy, setSortBy] = useState<'newest' | 'featured'>((searchParams.get('sort') as 'newest' | 'featured') || 'newest');
  const [evidence, setEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const updateSearchParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // @ts-ignore - Bypass deep type instantiation issue with complex Supabase query
    const { data: evidenceData } = await supabase
      .from('evidence')
      .select('*')
      .order('date_of_doc', { ascending: false });

    // Then fetch associated issues separately if needed
    if (evidenceData && evidenceData.length > 0) {
      const issueIds = [...new Set(evidenceData.map((e: any) => e.issue_ref).filter(Boolean))];
      if (issueIds.length > 0) {
        // @ts-ignore
        const { data: issuesData } = await supabase
          .from('issues')
          .select('id, title, slug')
          .in('id', issueIds);
        
        // Merge the data
        const evidenceWithIssues = evidenceData.map((ev: any) => ({
          ...ev,
          issues: issuesData?.find((i: any) => i.id === ev.issue_ref) || null
        }));
        setEvidence(evidenceWithIssues);
      } else {
        setEvidence(evidenceData);
      }
    } else {
      setEvidence([]);
    }
    
    setLoading(false);
  };
  
  const filteredEvidence = evidence
    .filter(e => !filterType || e.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date_of_doc).getTime() - new Date(a.date_of_doc).getTime();
      }
      return Number(b.featured) - Number(a.featured);
    });

  const evidenceCounts = {
    all: evidence.length,
    image: evidence.filter(e => e.type === 'image').length,
    pdf: evidence.filter(e => e.type === 'pdf').length,
    url: evidence.filter(e => e.type === 'url').length,
  };

  const handleTypeFilter = (type: string | null) => {
    setFilterType(type);
    updateSearchParams('type', type);
  };

  const handleSortChange = (sort: 'newest' | 'featured') => {
    setSortBy(sort);
    updateSearchParams('sort', sort);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return FileImage;
      case 'pdf': return FileText;
      case 'url': return LinkIcon;
      default: return FileText;
    }
  };

  const { isPulling, isRefreshing, pullDistance, shouldTrigger } = usePullToRefresh({
    onRefresh: async () => {
      await fetchData();
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
          <h1 className="text-4xl md:text-5xl font-black mb-4">The Receipts</h1>
          <p className="text-muted-foreground text-lg">
            Documented evidence, source materials, and the paper trail.
          </p>
        </div>
        
        {/* Sticky Filter Bar */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-y border-border -mx-4 px-4 py-4 mb-6">
          <div className="space-y-4">
            {/* Type filters with counts */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTypeFilter(null)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  !filterType
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
                aria-label="Show all evidence types"
              >
                <FileText className="h-4 w-4" />
                All
                <Badge variant="secondary" className="ml-1">{evidenceCounts.all}</Badge>
              </button>
              {(['image', 'pdf', 'url'] as const).map(type => {
                const Icon = getTypeIcon(type);
                const count = evidenceCounts[type];
                
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeFilter(type)}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      filterType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                    aria-label={`Filter by ${type}`}
                  >
                    <Icon className="h-4 w-4" />
                    {type === 'url' ? 'URL' : type.charAt(0).toUpperCase() + type.slice(1)}
                    <Badge variant="secondary" className="ml-1">{count}</Badge>
                  </button>
                );
              })}
              {filterType && (
                <button
                  onClick={() => handleTypeFilter(null)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                  aria-label="Clear filter"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>

            {/* Sort control */}
            <div>
              <SegmentedControl
                value={sortBy}
                onValueChange={(val) => handleSortChange(val as 'newest' | 'featured')}
                items={[
                  { id: 'newest', label: 'Newest' },
                  { id: 'featured', label: 'Featured' },
                ]}
                className="w-full max-w-xs"
              />
            </div>
          </div>
        </div>
      
        {/* Evidence Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <EvidenceCardSkeletonList count={6} />
          </div>
        ) : filteredEvidence.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-lg font-semibold mb-2">No receipts found</p>
            <p className="text-muted-foreground mb-6">
              {evidence.length === 0 
                ? 'Got evidence? Help us build the case.' 
                : 'Try adjusting your filters.'}
            </p>
            {evidence.length === 0 && (
              <Link to="/submit">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors min-h-[44px]">
                  Drop Your Homework
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEvidence.map(ev => {
              const Icon = getTypeIcon(ev.type);
              
              return (
                <div
                  key={ev.id}
                  className="bg-card border border-border rounded-2xl p-5 hover:bg-card/90 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-base">{ev.title}</h3>
                        {ev.featured && (
                          <Badge variant="secondary" className="flex-shrink-0">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      {ev.caption && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{ev.caption}</p>
                      )}
                      
                      {ev.file && ev.type === 'image' && (
                        <img
                          src={ev.file}
                          alt={ev.title}
                          loading="lazy"
                          decoding="async"
                          width={400}
                          height={192}
                          className="rounded-lg border border-border w-full mb-3 object-cover max-h-48"
                        />
                      )}
                      
                      {ev.external_url && (
                        <a
                          href={ev.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-3"
                        >
                          View source
                          <LinkIcon className="h-3 w-3" />
                        </a>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                        <time dateTime={ev.date_of_doc}>
                          {new Date(ev.date_of_doc).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                        {ev.issues && (
                          <Link
                            to={`/issues/${ev.issues.slug}`}
                            className="text-primary hover:underline font-mono"
                          >
                            #{ev.issues.slug}
                           </Link>
                        )}
                      </div>
                      
                      {ev.redacted && (
                        <Badge variant="destructive" className="mt-2">
                          REDACTED
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}