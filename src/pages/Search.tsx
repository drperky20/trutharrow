import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';
import { IssueCard } from '@/components/IssueCard';
import { PostCard } from '@/components/PostCard';
import { supabase } from '@/integrations/supabase/client';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<'all' | 'issues' | 'posts' | 'evidence'>('all');
  const [issues, setIssues] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    const [issuesData, postsData, evidenceData] = await Promise.all([
      supabase.from('issues').select('*'),
      supabase.from('posts').select('*, profiles(alias)').eq('status', 'approved'),
      supabase.from('evidence').select('*'),
    ]);

    setIssues(issuesData.data || []);
    setPosts(postsData.data || []);
    setEvidence(evidenceData.data || []);
    setLoading(false);
  };
  
  useEffect(() => {
    if (query) {
      setSearchParams({ q: query });
    }
  }, [query, setSearchParams]);
  
  const searchQuery = query.toLowerCase();
  
  const matchedIssues = issues.filter(
    i => i.title.toLowerCase().includes(searchQuery) || 
         i.summary.toLowerCase().includes(searchQuery) ||
         (i.tags && i.tags.some((t: string) => t.toLowerCase().includes(searchQuery)))
  );
  
  const matchedPosts = posts.filter(
    p => p.content.toLowerCase().includes(searchQuery) ||
         p.type.toLowerCase().includes(searchQuery)
  );
  
  const matchedEvidence = evidence.filter(
    e => e.title.toLowerCase().includes(searchQuery) ||
         e.caption.toLowerCase().includes(searchQuery)
  );
  
  const hasResults = matchedIssues.length > 0 || matchedPosts.length > 0 || matchedEvidence.length > 0;

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
              Issues ({matchedIssues.length})
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
              Posts ({matchedPosts.length})
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
              Evidence ({matchedEvidence.length})
              {activeTab === 'evidence' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>
          
          {/* Results */}
          {!hasResults && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found for "{query}"</p>
            </div>
          )}
          
          {(activeTab === 'all' || activeTab === 'issues') && matchedIssues.length > 0 && (
            <section className="mb-12">
              {activeTab === 'all' && <h2 className="text-2xl font-black mb-4">Issues</h2>}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {matchedIssues.map(issue => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </section>
          )}
          
          {(activeTab === 'all' || activeTab === 'posts') && matchedPosts.length > 0 && (
            <section className="mb-12">
              {activeTab === 'all' && <h2 className="text-2xl font-black mb-4">Posts</h2>}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {matchedPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
          
          {(activeTab === 'all' || activeTab === 'evidence') && matchedEvidence.length > 0 && (
            <section>
              {activeTab === 'all' && <h2 className="text-2xl font-black mb-4">Evidence</h2>}
              <div className="space-y-4">
                {matchedEvidence.map(ev => (
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