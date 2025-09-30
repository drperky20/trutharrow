import { useState, useEffect } from 'react';
import { IssueCard } from '@/components/IssueCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function Issues() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    const { data } = await supabase
      .from('issues')
      .select('*')
      .order('last_updated', { ascending: false });
    setIssues(data || []);
    setLoading(false);
  };
  
  const allTags = Array.from(new Set(issues.flatMap(i => i.tags || [])));
  
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || (issue.tags && issue.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="container px-4 py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Detention Board</h1>
        <p className="text-muted-foreground text-lg">
          Report cards on how the district is handling key issues.
        </p>
      </div>
      
      {/* Search & Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${
                !selectedTag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-xs px-3 py-1.5 rounded font-mono transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Issues Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredIssues.map(issue => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
      
      {filteredIssues.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {issues.length === 0 
              ? 'No issues yet. Check back soon!' 
              : 'No issues found matching your criteria.'}
          </p>
        </div>
      )}
    </div>
  );
}