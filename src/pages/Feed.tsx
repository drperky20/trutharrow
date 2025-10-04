import { useState, useEffect } from 'react';
import { PostCard } from '@/components/PostCard';
import { ComposeBox } from '@/components/ComposeBox';
import { TweetSkeletonList } from '@/components/TweetSkeleton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { PullToRefreshIndicator } from '@/components/PullToRefresh';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { supabase } from '@/integrations/supabase/client';
import { AquaWindow } from '@/components/aqua/AquaWindow';

type FeedMode = 'for-you' | 'latest';

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<FeedMode>('for-you');

  useEffect(() => {
    fetchPosts();

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
            setPosts((curr) => {
              const exists = curr.find((p) => p.id === updated.id);
              return exists
                ? curr.map((p) => (p.id === updated.id ? updated : p))
                : [updated, ...curr];
            });
          } else if (old.status === 'approved' && updated.status !== 'approved') {
            setPosts((curr) => curr.filter((p) => p.id !== updated.id));
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
    <div id="feed-skeuo" className="min-h-dvh md:min-h-screen pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto min-h-dvh md:min-h-screen">
        <AquaWindow 
          title="Cafeteria" 
          className="min-h-dvh md:min-h-screen"
        >
          <div>
            <div className="px-4 py-3 border-b border-aqua-border bg-white/80">
              <p className="text-muted-foreground text-xs md:text-sm aqua-font">
                The real tea, straight from students.
              </p>
              
              {/* Segmented control tabs */}
              <div className="py-3">
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
            <div className="border-b border-aqua-border p-4 bg-white/80">
              <div data-ta="composer" className="skeuo-card p-3">
                <ComposeBox onPost={handleNewPost} />
              </div>
            </div>
            
            {/* Posts Feed */}
            {loading ? (
              <TweetSkeletonList count={5} />
            ) : posts.length === 0 ? (
              <div className="text-center py-16 px-4">
                <p className="text-lg font-semibold mb-2 aqua-font">It's quiet… 👀</p>
                <p className="text-muted-foreground mb-6 aqua-font">Be the first to spill (respectfully).</p>
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
        </AquaWindow>
      </div>
    </div>
    </>
  );
}
