import { ThumbsUp, Laugh, Angry, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AliasAvatar } from '@/components/AliasAvatar';

interface PostCardProps {
  post: any;
  isNew?: boolean;
  showReplyLine?: boolean;
  level?: number;
}

export const PostCard = ({ post, isNew = false, showReplyLine = false, level = 0 }: PostCardProps) => {
  const navigate = useNavigate();
  const [reactions, setReactions] = useState(post.reactions || { like: 0, lol: 0, angry: 0 });
  const [reacting, setReacting] = useState(false);

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
    if (reacting) return;
    setReacting(true);

    // Optimistic update
    setReactions(prev => ({
      ...prev,
      [kind]: (prev[kind] || 0) + 1
    }));

    const { error } = await supabase.rpc('increment_reaction', {
      p_post_id: post.id,
      p_kind: kind
    });

    if (error) {
      // Revert on error
      setReactions(prev => ({
        ...prev,
        [kind]: Math.max((prev[kind] || 0) - 1, 0)
      }));
    }

    setReacting(false);
  };

  const handleOpenThread = () => {
    navigate(`/feed/${post.thread_id || post.id}`);
  };

  const isPending = post.status === 'pending';

  return (
    <div
      className={cn(
        'relative bg-card/80 border-b border-border hover:bg-card/90 transition-all cursor-pointer',
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
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {formatTime(post.created_at)}
              </span>
              {isPending && (
                <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">
                  Pending
                </span>
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
                disabled={reacting || isPending}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors group disabled:opacity-50"
                aria-label="Like"
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-xs">{reactions.like || 0}</span>
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction('lol');
                }}
                disabled={reacting || isPending}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-yellow-500 transition-colors group disabled:opacity-50"
                aria-label="Laugh"
              >
                <Laugh className="h-4 w-4" />
                <span className="text-xs">{reactions.lol || 0}</span>
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction('angry');
                }}
                disabled={reacting || isPending}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-orange-500 transition-colors group disabled:opacity-50"
                aria-label="Angry"
              >
                <Angry className="h-4 w-4" />
                <span className="text-xs">{reactions.angry || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
