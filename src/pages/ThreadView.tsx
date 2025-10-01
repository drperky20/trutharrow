import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PostCard } from '@/components/PostCard';
import { ComposeBox } from '@/components/ComposeBox';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface PostWithLevel {
  post: any;
  level: number;
  children: PostWithLevel[];
}

export default function ThreadView() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [rootPost, setRootPost] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchThread();

      const channel = supabase
        .channel(`thread-${postId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'posts',
            filter: `parent_id=eq.${postId}`,
          },
          (payload) => {
            const newReply = payload.new;
            if (newReply.status === 'approved') {
              setReplies((curr) => [...curr, newReply]);
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

            if (updated.parent_id === postId || updated.thread_id === (rootPost?.thread_id || rootPost?.id)) {
              if (updated.status === 'approved') {
                setReplies((curr) => {
                  const exists = curr.find((r) => r.id === updated.id);
                  return exists
                    ? curr.map((r) => (r.id === updated.id ? updated : r))
                    : old.status === 'pending'
                    ? [...curr, updated]
                    : curr;
                });
              } else if (old.status === 'approved' && updated.status !== 'approved') {
                setReplies((curr) => curr.filter((r) => r.id !== updated.id));
              }
            }

            if (updated.id === postId) {
              setRootPost(updated);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const fetchThread = async () => {
    setLoading(true);

    // Fetch the root post
    const { data: root } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('status', 'approved')
      .maybeSingle();

    if (!root) {
      setLoading(false);
      return;
    }

    setRootPost(root);

    // Fetch all replies in this thread
    const threadId = root.thread_id || root.id;
    const { data: threadReplies } = await supabase
      .from('posts')
      .select('*')
      .eq('thread_id', threadId)
      .eq('status', 'approved')
      .neq('id', root.id)
      .order('created_at', { ascending: true });

    setReplies(threadReplies || []);
    setLoading(false);
  };

  const buildThreadTree = (replies: any[]): PostWithLevel[] => {
    const replyMap = new Map<string, any[]>();
    
    // Group replies by parent_id
    replies.forEach(reply => {
      const parentId = reply.parent_id;
      if (!replyMap.has(parentId)) {
        replyMap.set(parentId, []);
      }
      replyMap.get(parentId)!.push(reply);
    });

    const buildTree = (parentId: string, level: number): PostWithLevel[] => {
      const children = replyMap.get(parentId) || [];
      return children.map(child => ({
        post: child,
        level,
        children: buildTree(child.id, level + 1)
      }));
    };

    return buildTree(rootPost?.id, 1);
  };

  const renderThread = (items: PostWithLevel[], maxLevel: number = 2) => {
    return items.map(({ post, level, children }) => {
      const shouldCollapse = level > maxLevel;
      
      return (
        <div key={post.id}>
          {!shouldCollapse && (
            <>
              <PostCard 
                post={post} 
                level={level}
                showReplyLine={level > 0}
                onDelete={() => setReplies(prev => prev.filter(p => p.id !== post.id))}
              />
              {children.length > 0 && renderThread(children, maxLevel)}
            </>
          )}
          {shouldCollapse && children.length > 0 && (
            <div className="ml-12 py-2 px-4">
              <button 
                className="text-sm text-primary hover:underline"
                onClick={() => navigate(`/feed/${post.id}`)}
              >
                View {children.length} more {children.length === 1 ? 'reply' : 'replies'}...
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  const handleNewReply = () => {
    fetchThread();
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-2xl mx-auto border-x border-border min-h-screen">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/feed')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-black">Thread</h1>
          </div>
          <LoadingSkeleton type="post" count={3} />
        </div>
      </div>
    );
  }

  if (!rootPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Thread not found</p>
          <Button onClick={() => navigate('/feed')}>
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  const threadTree = buildThreadTree(replies);

  return (
    <div className="min-h-dvh md:min-h-screen pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto md:border-x border-border min-h-dvh md:min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/feed')}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              aria-label="Back to feed"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-black">Thread</h1>
            </div>
          </div>
        </div>

        {/* Root Post */}
        <div className="border-b-4 border-border">
          <PostCard 
            post={rootPost} 
            level={0}
            onDelete={() => navigate('/feed')}
          />
        </div>

        {/* Reply composer */}
        <div className="border-b border-border p-4">
          <ComposeBox 
            onPost={handleNewReply} 
            parentId={rootPost.id}
            placeholder="Post your reply..."
            compact
          />
        </div>

        {/* Replies Thread */}
        {replies.length > 0 ? (
          <div>
            {renderThread(threadTree)}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              No replies yet. Be the first to reply!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
