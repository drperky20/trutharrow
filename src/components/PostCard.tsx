import { Post } from '@/types';
import { ThumbsUp, Laugh, Angry } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeLabels: Record<Post['type'], string> = {
  'assignment': 'Assignment',
  'detention-slip': 'Detention Slip',
  'pop-quiz': 'Pop Quiz',
  'announcement': 'Announcement',
};

const typeBadgeColors: Record<Post['type'], string> = {
  'assignment': 'bg-primary/20 text-primary',
  'detention-slip': 'bg-destructive/20 text-destructive',
  'pop-quiz': 'bg-alert/20 text-alert-foreground',
  'announcement': 'bg-secondary text-secondary-foreground',
};

interface PostCardProps {
  post: Post;
  isNew?: boolean;
}

export const PostCard = ({ post, isNew = false }: PostCardProps) => {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-4 hover-lift hover:glow-orange transition-all',
        isNew && 'pop-in glow-yellow'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">{post.alias}</span>
          <span className={cn('text-xs font-mono px-2 py-0.5 rounded', typeBadgeColors[post.type])}>
            {typeLabels[post.type]}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>
      
      <p className="text-sm mb-3">{post.content}</p>
      
      {post.images && post.images.length > 0 && (
        <div className="mb-3 grid gap-2">
          {post.images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="Post attachment"
              className="rounded border border-border w-full object-cover max-h-64"
            />
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
          <ThumbsUp className="h-3 w-3" />
          <span>{post.reactions.like}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Laugh className="h-3 w-3" />
          <span>{post.reactions.lol}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Angry className="h-3 w-3" />
          <span>{post.reactions.angry}</span>
        </button>
      </div>
    </div>
  );
};
