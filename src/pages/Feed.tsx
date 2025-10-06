import { useState, useEffect } from 'react';
import { PostCard } from '@/components/PostCard';
import { ComposeBox } from '@/components/ComposeBox';
import { TweetSkeletonList } from '@/components/TweetSkeleton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { PullToRefreshIndicator } from '@/components/PullToRefresh';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { supabase } from '@/integrations/supabase/client';
import { AquaWindow } from '@/components/aqua/AquaWindow';
import { usePostData } from '@/hooks/usePostData';
import { useQuery } from '@tanstack/react-query';

type FeedMode = 'for-you' | 'latest';

export default function Feed() {
  const [mode, setMode] = useState<FeedMode>('for-you');
  
  const { data: posts = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['feed-posts', mode],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'approved')
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
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
        return rankedPosts;
      }
      
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
  
  // Batch fetch post data for all posts
  const postIds = posts.map(post => post.id);
  const { data: postDataMap } = usePostData(postIds);

  useEffect(() => {
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
            refetch();
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
            refetch();
          } else if (old.status === 'approved' && updated.status !== 'approved') {
            refetch();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleNewPost = () => {
    refetch();
  };

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
    <div id="feed-skeuo" className="min-h-dvh md:min-h-screen pb-[calc(env(safe-area-inset-bottom)+96px)] md:pb-8 space-y-4">
      <div className="max-w-2xl mx-auto min-h-dvh md:min-h-screen">
        <AquaWindow 
          title="Cafeteria" 
          className="min-h-dvh md:min-h-screen"
          headingLevel="h1"
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
            <div className="border-b border-aqua-border p-4 md:p-5 bg-white/80">
              <ComposeBox onPost={handleNewPost} />
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
              <div className="space-y-4 md:space-y-5">
                {posts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    postData={postDataMap?.get(post.id)}
                    onDelete={() => refetch()}
                  />
                ))}
              </div>
            )}
          </div>
        </AquaWindow>
      </div>
      <div className="h-[88px] md:hidden" />
    </div>
    </>
  );
}
