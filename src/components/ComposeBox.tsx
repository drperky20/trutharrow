import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ComposeBoxProps {
  onPost?: () => void;
  parentId?: string;
  placeholder?: string;
}

const ALIAS_STORAGE_KEY = 'trutharrow:lastAlias';

export const ComposeBox = ({ onPost, parentId, placeholder = "What's the tea? 👀" }: ComposeBoxProps) => {
  const [content, setContent] = useState('');
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const maxLength = 500;

  // Load last used alias from localStorage
  useEffect(() => {
    const savedAlias = localStorage.getItem(ALIAS_STORAGE_KEY);
    if (savedAlias) {
      setAlias(savedAlias);
    }
  }, []);

  const handleSubmit = async () => {
    if (!content.trim() || !alias.trim()) {
      toast({
        title: "Missing fields",
        description: "Please provide both an alias and content.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('posts').insert({
      alias: alias.trim(),
      content: content.trim(),
      parent_id: parentId || null,
      user_id: user?.id || null,
      type: 'assignment',
    });

    if (error) {
      toast({
        title: "Error posting",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Save alias for next time
      localStorage.setItem(ALIAS_STORAGE_KEY, alias.trim());
      
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
          <span className="text-sm font-mono">{alias ? alias[0].toUpperCase() : '?'}</span>
        </div>
        <div className="flex-1 space-y-3">
          <Input
            placeholder="Your alias (e.g., Student-2025)"
            value={alias}
            onChange={(e) => setAlias(e.target.value.slice(0, 30))}
            className="border-0 focus-visible:ring-0 bg-transparent px-0 placeholder:text-muted-foreground/60"
          />
          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
            className="min-h-[100px] resize-none border-0 focus-visible:ring-0 bg-transparent p-0"
          />
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className={`text-xs font-mono ${
              content.length > maxLength - 50 ? 'text-alert' : 'text-muted-foreground'
            }`}>
              {content.length}/{maxLength}
            </span>
            <Button 
              onClick={handleSubmit}
              disabled={!content.trim() || !alias.trim() || loading}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Posting...' : parentId ? 'Reply' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
