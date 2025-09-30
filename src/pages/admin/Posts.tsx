import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

export default function AdminPosts() {
  const { isAdmin, loading } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(alias)')
      .order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('posts').update({ status }).eq('id', id);
    toast({ title: `Post ${status}` });
    fetchPosts();
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
                <span className="text-sm font-mono text-muted-foreground">{post.profiles?.alias}</span>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${
                    post.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                    post.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {post.status}
                  </span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{post.type}</span>
                </div>
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
            <p className="text-sm">{post.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}