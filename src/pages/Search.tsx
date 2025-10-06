import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { IssueCard } from '@/components/IssueCard';
import { PostCard } from '@/components/PostCard';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { usePostData } from '@/hooks/usePostData';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<'all' | 'issues' | 'posts' | 'evidence'>('all');

  // Server-side search queries
  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['search-issues', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!query.trim(),
    staleTime: 30 * 1000,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['search-posts', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(alias)')
        .eq('status', 'approved')
        .ilike('content', `%${query}%`)
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!query.trim(),
    staleTime: 30 * 1000,
  });

  const { data: evidence = [], isLoading: evidenceLoading } = useQuery({
    queryKey: ['search-evidence', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from('evidence')
        .select('*')
        .or(`title.ilike.%${query}%,caption.ilike.%${query}%`)
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!query.trim(),
    staleTime: 30 * 1000,
  });

  // Batch fetch post data for posts
  const postIds = posts.map(post => post.id);
  const { data: postDataMap } = usePostData(postIds);
  
  useEffect(() => {
    if (query) {
      setSearchParams({ q: query });
    }
  }, [query, setSearchParams]);
  
  const hasResults = issues.length > 0 || posts.length > 0 || evidence.length > 0;
  const loading = issuesLoading || postsLoading || evidenceLoading;
  
  return (
    <div className="container px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Search</h1>
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search issues, posts, evidence..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 text-base h-12"
            autoFocus
          />
        </div>
      </div>
      
      {query && (
        <>
          {/* Tabs */}
          <div className="mb-8 flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'all'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'issues'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Issues ({issues.length})
              {activeTab === 'issues' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'posts'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Posts ({posts.length})
              {activeTab === 'posts' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2 font-medium transition-colors relative ${
                activeTab === 'evidence'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Evidence ({evidence.length})
              {activeTab === 'evidence' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
          
          {/* Results */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Searching...</p>
            </div>
          )}
          
          {!loading && !hasResults && query && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found for "{query}"</p>
            </div>
          )}
          
          {!loading && (activeTab === 'all' || activeTab === 'issues') && issues.length > 0 && (
            <section className="mb-12">
              {activeTab === 'all' && <h2 className="text-2xl font-black mb-4">Issues</h2>}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {issues.map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </section>
          )}
          
          {!loading && (activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
            <section className="mb-12">
              {activeTab === 'all' && <h2 className="text-2xl font-black mb-4">Posts</h2>}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    postData={postDataMap?.get(post.id)}
                  />
                ))}
              </div>
            </section>
          )}
          
          {!loading && (activeTab === 'all' || activeTab === 'evidence') && evidence.length > 0 && (
            <section>
              {activeTab === 'all' && <h2 className="text-2xl font-black mb-4">Evidence</h2>}
              <div className="space-y-4">
                {evidence.map(ev => (
                  <div
                    key={ev.id}
                    className="bg-card border border-border rounded-lg p-5"
                  >
                    <h3 className="font-bold mb-2">{ev.title}</h3>
                    <p className="text-sm text-muted-foreground">{ev.caption}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}