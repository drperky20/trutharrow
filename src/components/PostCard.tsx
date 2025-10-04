import { ThumbsUp, Laugh, Angry, MessageCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AliasAvatar } from '@/components/AliasAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFingerprint } from '@/lib/fingerprint';

interface PostCardProps {
  post: any;
  isNew?: boolean;
  showReplyLine?: boolean;
  level?: number;
  onDelete?: () => void;
}

export const PostCard = ({ post, isNew = false, showReplyLine = false, level = 0, onDelete }: PostCardProps) => {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [reactions, setReactions] = useState(post.reactions || { like: 0, lol: 0, angry: 0 });
  const [reacting, setReacting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [isPostAuthorAdmin, setIsPostAuthorAdmin] = useState(false);

  useEffect(() => {
    checkUserReactions();
    checkIfAuthorIsAdmin();
  }, [post.id, user]);

  const checkUserReactions = async () => {
    const fingerprint = getFingerprint();
    const { data } = await supabase
      .from('post_reactions')
      .select('reaction_type')
      .eq('post_id', post.id)
      .or(user ? `user_id.eq.${user.id}` : `fingerprint.eq.${fingerprint}`);
    
    if (data) {
      setUserReactions(new Set(data.map(r => r.reaction_type)));
    }
  };

  const checkIfAuthorIsAdmin = async () => {
    if (!post.user_id) {
      setIsPostAuthorAdmin(false);
      return;
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', post.user_id)
      .eq('role', 'admin')
      .maybeSingle();
    
    setIsPostAuthorAdmin(!!data);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleReaction = async (kind: 'like' | 'lol' | 'angry') => {
    if (reacting || userReactions.has(kind)) return;
    setReacting(true);

    // Optimistic update
    setReactions(prev => ({
      ...prev,
      [kind]: (prev[kind] || 0) + 1
    }));
    setUserReactions(prev => new Set([...prev, kind]));

    const fingerprint = getFingerprint();
    const { data, error } = await supabase.rpc('increment_reaction_safe', {
      p_post_id: post.id,
      p_kind: kind,
      p_user_id: user?.id || null,
      p_fingerprint: user ? null : fingerprint
    });

    const result = data as { success: boolean; message?: string } | null;

    if (error || !result?.success) {
      // Revert on error
      setReactions(prev => ({
        ...prev,
        [kind]: Math.max((prev[kind] || 0) - 1, 0)
      }));
      setUserReactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(kind);
        return newSet;
      });
      
      if (result?.message) {
        toast({
          title: "Already reacted",
          description: "You've already reacted to this post with that reaction.",
          variant: "destructive",
        });
      }
    }

    setReacting(false);
  };

  const handleOpenThread = () => {
    navigate(`/feed/${post.thread_id || post.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "The post has been removed.",
      });

      // Call the onDelete callback if provided, otherwise fallback to reload
      if (onDelete) {
        onDelete();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const isPending = post.status === 'pending';

  return (
    <div
      className={cn(
        'relative bg-gradient-surface border border-border rounded-xl cursor-pointer overflow-hidden shadow-skeu-raised hover:shadow-skeu-raised-lg active:shadow-skeu-pressed transition-all duration-200 ease-out',
        isNew && 'pop-in',
        level > 0 && 'ml-12'
      )}
      onClick={handleOpenThread}
    >
      {/* Reply line connector */}
      {showReplyLine && level > 0 && (
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
      )}

      <div className="p-4">
        <div className="flex gap-3">
          <AliasAvatar alias={post.alias || 'Anonymous'} />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm truncate">{post.alias || 'Anonymous'}</span>
              {isPostAuthorAdmin && (
                <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                  Admin
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {formatTime(post.created_at)}
              </span>
              {isPending && (
                <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">
                  Pending
                </span>
              )}
              
              {/* Admin delete button */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="ml-auto h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  aria-label="Delete post"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            
            <p className="text-sm mb-3 whitespace-pre-wrap break-words">{post.content}</p>
            
            {post.images && post.images.length > 0 && (
              <div className="mb-3 rounded-xl overflow-hidden border border-border">
                {post.images.map((img: string, idx: number) => (
                  <img
                    key={idx}
                    src={img}
                    alt="Post attachment"
                    className="w-full object-cover max-h-96"
                  />
                ))}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center gap-6 mt-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenThread();
                }}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group"
                aria-label="View thread"
              >
                <MessageCircle className="h-4 w-4" />
                {post.reply_count > 0 && (
                  <span className="text-xs">{post.reply_count}</span>
                )}
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction('like');
                }}
                disabled={reacting || isPending || userReactions.has('like')}
                className={cn(
                  "flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors group disabled:opacity-50",
                  userReactions.has('like') && "text-red-500"
                )}
                aria-label="Like"
              >
                <ThumbsUp className={cn("h-4 w-4", userReactions.has('like') && "fill-current")} />
                <span className="text-xs">{reactions.like || 0}</span>
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction('lol');
                }}
                disabled={reacting || isPending || userReactions.has('lol')}
                className={cn(
                  "flex items-center gap-1.5 text-muted-foreground hover:text-yellow-500 transition-colors group disabled:opacity-50",
                  userReactions.has('lol') && "text-yellow-500"
                )}
                aria-label="Laugh"
              >
                <Laugh className={cn("h-4 w-4", userReactions.has('lol') && "fill-current")} />
                <span className="text-xs">{reactions.lol || 0}</span>
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction('angry');
                }}
                disabled={reacting || isPending || userReactions.has('angry')}
                className={cn(
                  "flex items-center gap-1.5 text-muted-foreground hover:text-orange-500 transition-colors group disabled:opacity-50",
                  userReactions.has('angry') && "text-orange-500"
                )}
                aria-label="Angry"
              >
                <Angry className={cn("h-4 w-4", userReactions.has('angry') && "fill-current")} />
                <span className="text-xs">{reactions.angry || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
