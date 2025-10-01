import { useState, useEffect } from 'react';
import { PostCard } from '@/components/PostCard';
import { ComposeBox } from '@/components/ComposeBox';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

type FeedMode = 'for-you' | 'latest';

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FeedMode>('for-you');

  useEffect(() => {
    fetchPosts();
  }, [mode]);

  const fetchPosts = async () => {
    setLoading(true);
    
    // Fetch only root posts (no parent_id)
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'approved')
      .is('parent_id', null)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) {
      if (mode === 'for-you') {
        // Hybrid ranking: engagement-weighted with time decay
        const rankedPosts = data.map(post => {
          const reactions = post.reactions as any;
          const totalReactions = (reactions?.like || 0) + (reactions?.lol || 0) + (reactions?.angry || 0);
          const hoursAgo = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
          const score = totalReactions / Math.pow(hoursAgo + 2, 0.5);
          return { ...post, score };
        });
        rankedPosts.sort((a, b) => b.score - a.score);
        setPosts(rankedPosts);
      } else {
        setPosts(data);
      }
    }
    
    setLoading(false);
  };

  const handleNewPost = () => {
    fetchPosts();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto border-x border-border min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="px-4 py-3">
            <h1 className="text-xl font-black">Cafeteria</h1>
            <p className="text-muted-foreground text-xs">
              The real tea, straight from students.
            </p>
          </div>
          
          {/* Feed mode toggle */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setMode('for-you')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
                mode === 'for-you' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              For You
              {mode === 'for-you' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t" />
              )}
            </button>
            <button
              onClick={() => setMode('latest')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
                mode === 'latest' 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              Latest
              {mode === 'latest' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t" />
              )}
            </button>
          </div>
        </div>
        
        {/* Compose Box - Always visible */}
        <div className="border-b border-border">
          <ComposeBox onPost={handleNewPost} />
        </div>
        
        {/* Posts Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          <div>
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
