import { useState, useEffect } from 'react';
import { PostCard } from '@/components/PostCard';
import { ComposeBox } from '@/components/ComposeBox';
import { TweetSkeletonList } from '@/components/TweetSkeleton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { PullToRefreshIndicator } from '@/components/PullToRefresh';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { supabase } from '@/integrations/supabase/client';

type FeedMode = 'for-you' | 'latest';

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FeedMode>('for-you');

  useEffect(() => {
    fetchPosts();

    // Set up real-time subscription for approved posts
    const channel = supabase
      .channel('posts-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: 'status=eq.approved',
        },
        (payload) => {
          const newPost = payload.new;
          // Only add root posts (no parent_id) to feed
          if (!newPost.parent_id) {
            setPosts((curr) => [newPost, ...curr]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          const updated = payload.new;
          const old = payload.old;

          if (updated.status === 'approved' && !updated.parent_id) {
            // Post was approved (possibly was pending before)
            setPosts((curr) => {
              const exists = curr.find((p) => p.id === updated.id);
              if (exists) {
                // Update existing post
                return curr.map((p) => (p.id === updated.id ? updated : p));
              } else {
                // Newly approved post, add to feed
                return [updated, ...curr];
              }
            });
          } else if (old.status === 'approved' && updated.status !== 'approved') {
            // Post was removed or rejected, remove from feed
            setPosts((curr) => curr.filter((p) => p.id !== updated.id));
          } else if (updated.status === 'approved' && !updated.parent_id) {
            // Content update on approved post
            setPosts((curr) => curr.map((p) => (p.id === updated.id ? updated : p)));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const { isPulling, isRefreshing, pullDistance, shouldTrigger } = usePullToRefresh({
    onRefresh: async () => {
      await fetchPosts();
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
    <div className="min-h-dvh md:min-h-screen pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto md:border-x border-border min-h-dvh md:min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3">
            <h1 className="text-xl md:text-2xl font-black">Cafeteria</h1>
            <p className="text-muted-foreground text-xs md:text-sm">
              The real tea, straight from students.
            </p>
          </div>
          
          {/* Segmented control tabs */}
          <div className="px-4 py-3">
            <SegmentedControl
              value={mode}
              onValueChange={(val) => setMode(val as FeedMode)}
              items={[
                { id: 'for-you', label: 'For You' },
                { id: 'latest', label: 'Latest' },
              ]}
              className="w-full max-w-xs"
            />
          </div>
        </div>
        
        {/* Compose Box */}
        <div className="border-b border-border p-4">
          <ComposeBox onPost={handleNewPost} />
        </div>
        
        {/* Posts Feed */}
        {loading ? (
          <TweetSkeletonList count={5} />
        ) : posts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-lg font-semibold mb-2">It's quiet… 👀</p>
            <p className="text-muted-foreground mb-6">Be the first to spill (respectfully).</p>
            <TweetSkeletonList count={3} />
          </div>
        ) : (
          <div>
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={() => setPosts(prev => prev.filter(p => p.id !== post.id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
