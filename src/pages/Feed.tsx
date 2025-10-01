import { useState, useEffect } from 'react';
import { PostCard } from '@/components/PostCard';
import { ComposeBox } from '@/components/ComposeBox';
import { TweetSkeletonList } from '@/components/TweetSkeleton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { supabase } from '@/integrations/supabase/client';

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
          
          {/* Segmented control tabs */}
          <div className="px-4 py-2">
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
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
