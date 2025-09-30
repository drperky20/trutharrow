import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ComposeBoxProps {
  onPost?: () => void;
}

export const ComposeBox = ({ onPost }: ComposeBoxProps) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const maxLength = 500;

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    setLoading(true);
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      type: 'assignment',
      content: content.trim(),
      status: 'pending',
    });

    if (error) {
      toast({
        title: "Error posting",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Post submitted!",
        description: "Your post is pending review.",
      });
      setContent('');
      onPost?.();
    }

    setLoading(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-mono">?</span>
        </div>
        <div className="flex-1">
          <Textarea
            placeholder="What's the tea? 👀"
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
            className="min-h-[100px] resize-none border-0 focus-visible:ring-0 bg-transparent p-0"
          />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className={`text-xs font-mono ${
              content.length > maxLength - 50 ? 'text-alert' : 'text-muted-foreground'
            }`}>
              {content.length}/{maxLength}
            </span>
            <Button 
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
