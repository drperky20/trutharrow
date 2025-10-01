import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

export default function AdminPosts() {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const { logAction } = useAuditLog();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();

    // Set up real-time subscription for all posts (admin view)
    const channel = supabase
      .channel('posts-admin')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          const newPost = payload.new;
          setPosts((curr) => [newPost, ...curr]);
          
          // Show notification for pending posts
          if (newPost.status === 'pending') {
            toast({
              title: 'New post pending review',
              description: `From ${newPost.alias || 'Anonymous'}`,
            });
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
          setPosts((curr) => curr.map((p) => (p.id === updated.id ? updated : p)));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          const deleted = payload.old;
          setPosts((curr) => curr.filter((p) => p.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const updateStatus = async (id: string, status: string) => {
    const oldPost = posts.find(p => p.id === id);
    const { error } = await supabase.from('posts').update({ status }).eq('id', id);
    
    if (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to update post status',
        variant: 'destructive'
      });
    } else {
      // Log the moderation action
      await logAction(
        `Post ${status}`,
        'posts',
        id,
        { status: oldPost?.status },
        { status }
      );
      
      toast({ title: `Post ${status}` });
      // Real-time subscription will handle the state update
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/auth" replace />;

  return (
    <div className="container px-4 py-12">
      <h1 className="text-3xl font-black mb-8">Moderate Posts</h1>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-sm font-mono font-semibold">{post.alias || 'Anonymous'}</span>
                {post.parent_id && (
                  <p className="text-xs text-muted-foreground mt-1">↳ Reply in thread</p>
                )}
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${
                    post.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                    post.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(post.created_at).toLocaleString()}
                </p>
              </div>
              {post.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => updateStatus(post.id, 'approved')}>
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus(post.id, 'rejected')}>
                    <X className="h-4 w-4 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm whitespace-pre-wrap">{post.content}</p>
            {post.images && post.images.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {post.images.map((img: string, idx: number) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt="attachment" 
                    className="h-24 w-24 object-cover rounded border border-border"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}