import { useState, useEffect } from 'react';
import { PostCard } from '@/components/PostCard';
import { ComposeBox } from '@/components/ComposeBox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(alias)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    setPosts(data || []);
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
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black mb-2">Cafeteria</h1>
          <p className="text-muted-foreground text-sm">
            The real tea, straight from students.
          </p>
        </div>
        
        {/* Compose Box */}
        {user && (
          <div className="mb-4">
            <ComposeBox onPost={handleNewPost} />
          </div>
        )}
        
        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        
        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  );
}
