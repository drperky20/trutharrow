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
import { PostData } from '@/hooks/usePostData';
interface PostCardProps {
  post: any;
  isNew?: boolean;
  showReplyLine?: boolean;
  level?: number;
  onDelete?: () => void;
  postData?: PostData;
}
export const PostCard = ({
  post,
  isNew = false,
  showReplyLine = false,
  level = 0,
  onDelete,
  postData
}: PostCardProps) => {
  const navigate = useNavigate();
  const {
    isAdmin,
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [reactions, setReactions] = useState(post.reactions || {
    like: 0,
    lol: 0,
    angry: 0
  });
  const [reacting, setReacting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Use batched data if available, otherwise fallback to individual queries
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [isPostAuthorAdmin, setIsPostAuthorAdmin] = useState(false);
  
  useEffect(() => {
    if (postData) {
      setUserReactions(postData.userReactions);
      setIsPostAuthorAdmin(postData.isAuthorAdmin);
    } else {
      // Fallback to individual queries if no batched data
      checkUserReactions();
      checkIfAuthorIsAdmin();
    }
  }, [post.id, user, postData]);
  
  const checkUserReactions = async () => {
    const fingerprint = getFingerprint();
    const {
      data
    } = await supabase.from('post_reactions').select('reaction_type').eq('post_id', post.id).or(user ? `user_id.eq.${user.id}` : `fingerprint.eq.${fingerprint}`);
    if (data) {
      setUserReactions(new Set(data.map(r => r.reaction_type)));
    }
  };
  
  const checkIfAuthorIsAdmin = async () => {
    if (!post.user_id) {
      setIsPostAuthorAdmin(false);
      return;
    }
    const {
      data
    } = await supabase.from('user_roles').select('role').eq('user_id', post.user_id).eq('role', 'admin').maybeSingle();
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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
    const {
      data,
      error
    } = await supabase.rpc('increment_reaction_safe', {
      p_post_id: post.id,
      p_kind: kind,
      p_user_id: user?.id || null,
      p_fingerprint: user ? null : fingerprint
    });
    const result = data as {
      success: boolean;
      message?: string;
    } | null;
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
          variant: "destructive"
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
      const {
        error
      } = await supabase.from('posts').delete().eq('id', post.id);
      if (error) throw error;
      toast({
        title: "Post deleted",
        description: "The post has been removed."
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
        variant: "destructive"
      });
      setIsDeleting(false);
    }
  };
  const isPending = post.status === 'pending';
  return <article data-ta="card" className={cn('relative bg-gradient-to-b from-white to-[#eef2ff] border border-[#aab4d0] rounded-3xl cursor-pointer overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,.18)] hover:shadow-[0_2px_8px_rgba(0,0,0,.1)] active:shadow-[0_1px_3px_rgba(0,0,0,.05)] transition-all duration-200 ease-out ring-1 ring-white/20 ring-inset', 'skeuo-card', isNew && 'pop-in')} onClick={handleOpenThread} style={{
    contentVisibility: 'auto',
    containIntrinsicSize: '200px'
  }}>
      {/* Reply line connector */}
      {showReplyLine && level > 0}

      <div className="p-4 md:p-5">
        <div className="flex gap-3">
          <AliasAvatar alias={post.alias || 'Anonymous'} />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-[15px] md:text-base truncate">{post.alias || 'Anonymous'}</span>
              {isPostAuthorAdmin && <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
                  Admin
                </Badge>}
              <span className="text-xs text-white/60">·</span>
              <span className="text-xs text-white/60">
                {formatTime(post.created_at)}
              </span>
              {isPending && <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">
                  Pending
                </span>}
              
              {/* Admin delete button */}
              {isAdmin && <button onClick={handleDelete} disabled={isDeleting} className="ml-auto rounded-xl min-h-10 min-w-10 p-2 flex items-center justify-center bg-white/6 hover:bg-red-500/20 active:translate-y-px transition disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 focus-visible:ring-2 ring-white/70" aria-label="Delete post">
                  <Trash2 className="h-4 w-4 opacity-90" />
                </button>}
            </div>
            
            <div data-ta="message" className="skeuo-bubble mb-3" style={{
            contentVisibility: 'auto',
            containIntrinsicSize: '200px'
          }}>
              <p className="text-sm whitespace-pre-wrap break-words">{post.content}</p>
            </div>
            
            {post.images && post.images.length > 0 && <div className="mb-3 rounded-xl overflow-hidden border border-border">
                {post.images.map((img: string, idx: number) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt="Post attachment" 
                    className="w-full object-cover max-h-96" 
                    loading="lazy"
                    decoding="async"
                    width={800}
                    height={600}
                  />
                ))}
              </div>}
            
            {/* Actions */}
            <div data-ta="reacts" className="skeuo-reacts">
              <button onClick={e => {
              e.stopPropagation();
              handleOpenThread();
            }} className="rounded-xl px-3 h-8 min-w-10 flex items-center gap-1 bg-white/6 hover:bg-white/10 active:translate-y-px transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 min-h-10 p-2" aria-label="View thread">
                <MessageCircle className="h-4 w-4 opacity-90" />
                {post.reply_count > 0 && <output aria-live="polite" className="text-sm">{post.reply_count}</output>}
              </button>
              
              <button onClick={e => {
              e.stopPropagation();
              handleReaction('like');
            }} disabled={reacting || isPending || userReactions.has('like')} className={cn("rounded-xl px-3 h-8 min-w-10 flex items-center gap-1 bg-white/6 hover:bg-white/10 active:translate-y-px transition disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 min-h-10 p-2", userReactions.has('like') && "bg-red-500/20")} aria-label="Like">
                <span className="opacity-90">👍</span>
                <output aria-live="polite" className="text-sm">{reactions.like || 0}</output>
              </button>
              
              <button onClick={e => {
              e.stopPropagation();
              handleReaction('lol');
            }} disabled={reacting || isPending || userReactions.has('lol')} className={cn("rounded-xl px-3 h-8 min-w-10 flex items-center gap-1 bg-white/6 hover:bg-white/10 active:translate-y-px transition disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 min-h-10 p-2", userReactions.has('lol') && "bg-yellow-500/20")} aria-label="Laugh">
                <span className="opacity-90">😂</span>
                <output aria-live="polite" className="text-sm">{reactions.lol || 0}</output>
              </button>
              
              <button onClick={e => {
              e.stopPropagation();
              handleReaction('angry');
            }} disabled={reacting || isPending || userReactions.has('angry')} className={cn("rounded-xl px-3 h-8 min-w-10 flex items-center gap-1 bg-white/6 hover:bg-white/10 active:translate-y-px transition disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70 min-h-10 p-2", userReactions.has('angry') && "bg-orange-500/20")} aria-label="Angry">
                <span className="opacity-90">😠</span>
                <output aria-live="polite" className="text-sm">{reactions.angry || 0}</output>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>;
};