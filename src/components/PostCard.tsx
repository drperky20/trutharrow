import { ThumbsUp, Laugh, Angry, MessageCircle, Repeat2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: any;
  isNew?: boolean;
}

export const PostCard = ({ post, isNew = false }: PostCardProps) => {
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

  return (
    <div
      className={cn(
        'bg-card border border-border hover:bg-card/80 transition-all cursor-pointer',
        isNew && 'pop-in glow-yellow'
      )}
    >
      <div className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-mono">{post.profiles?.alias?.split('-')[1]?.slice(0, 2) || '??'}</span>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm truncate">{post.profiles?.alias || 'Anonymous'}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {formatTime(post.created_at)}
              </span>
            </div>
            
            <p className="text-sm mb-3 whitespace-pre-wrap break-words">{post.content}</p>
            
            {post.images && post.images.length > 0 && (
              <div className="mb-3 rounded-xl overflow-hidden border border-border">
                {post.images.map((img, idx) => (
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
            <div className="flex items-center justify-between max-w-md mt-2">
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">0</span>
              </button>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-green-500 transition-colors group">
                <Repeat2 className="h-4 w-4" />
                <span className="text-xs">0</span>
              </button>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors group">
                <ThumbsUp className="h-4 w-4" />
                <span className="text-xs">{post.reactions.like}</span>
              </button>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-yellow-500 transition-colors group">
                <Laugh className="h-4 w-4" />
                <span className="text-xs">{post.reactions.lol}</span>
              </button>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-orange-500 transition-colors group">
                <Angry className="h-4 w-4" />
                <span className="text-xs">{post.reactions.angry}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
