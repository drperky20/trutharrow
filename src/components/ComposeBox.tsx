import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useAlias } from '@/hooks/useAlias';
import { AliasAvatar } from '@/components/AliasAvatar';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComposeBoxProps {
  onPost?: () => void;
  parentId?: string;
  placeholder?: string;
  compact?: boolean;
}

export const ComposeBox = ({ onPost, parentId, placeholder = "What's the tea? 👀", compact = false }: ComposeBoxProps) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [editingAlias, setEditingAlias] = useState(false);
  const [tempAlias, setTempAlias] = useState('');
  const { alias, setAlias } = useAlias();
  const { user } = useAuth();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 500;

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Empty post",
        description: "Please write something to post.",
        variant: "destructive",
      });
      return;
    }

    if (!alias.trim()) {
      toast({
        title: "Alias required",
        description: "Please set your alias before posting.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Run AI moderation check
      const { data: moderationData, error: moderationError } = await supabase.functions.invoke('moderate-post', {
        body: { content: content.trim() }
      });

      let postStatus = 'approved'; // Default to approved for immediate posting
      
      if (moderationError) {
        console.error('Moderation error:', moderationError);
        // Fail open: allow post if moderation service fails
        toast({
          title: "Moderation check failed",
          description: "Posting anyway. Our team will review it.",
        });
      } else if (moderationData && !moderationData.approved) {
        // Post was rejected by AI - send to admin review
        postStatus = 'pending';
        toast({
          title: "Post flagged for review",
          description: moderationData.reason || "Your post has been flagged and will be reviewed by admins.",
          variant: "default",
        });
      }

      // Insert post with appropriate status
      const { error } = await supabase.from('posts').insert({
        alias: alias.trim(),
        content: content.trim(),
        parent_id: parentId || null,
        user_id: user?.id || null,
        type: 'assignment',
        status: postStatus,
      });

      if (error) {
        toast({
          title: "Error posting",
          description: error.message,
          variant: "destructive",
        });
      } else {
        if (postStatus === 'approved') {
          toast({
            title: "Posted!",
            description: "Your post is live.",
          });
        } else {
          toast({
            title: "Submitted for review",
            description: "Admins will review your post shortly.",
          });
        }
        setContent('');
        setIsFocused(false);
        onPost?.();
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: "Failed to submit post. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleSaveAlias = () => {
    if (tempAlias.trim()) {
      setAlias(tempAlias.trim());
      setEditingAlias(false);
      toast({
        title: "Alias saved",
        description: `You'll post as "${tempAlias.trim()}"`,
      });
    }
  };

  const openAliasEditor = () => {
    setTempAlias(alias);
    setEditingAlias(true);
  };

  const charsLeft = maxLength - content.length;
  const isNearLimit = charsLeft < 50;
  const isAtLimit = charsLeft <= 0;
  const canPost = content.trim().length > 0 && alias.trim().length > 0 && !loading;

  return (
    <>
      <div className={cn(
        "bg-card/80 border border-border rounded-2xl transition-all",
        compact ? "p-3" : "p-4",
        isFocused && "ring-2 ring-primary/20"
      )}>
        <div className="flex gap-3">
          <AliasAvatar alias={alias} />
          
          <div className="flex-1 space-y-3">
            {/* Alias chip */}
            <div className="flex items-center gap-2">
              {alias ? (
                <Popover open={editingAlias} onOpenChange={setEditingAlias}>
                  <PopoverTrigger asChild>
                    <button
                      onClick={openAliasEditor}
                      className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm hover:bg-muted/80 transition-colors"
                    >
                      <span className="font-medium">{alias}</span>
                      <Pencil className="h-3 w-3 opacity-60" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Your alias</label>
                        <Input
                          value={tempAlias}
                          onChange={(e) => setTempAlias(e.target.value.slice(0, 30))}
                          placeholder="e.g., Student-2025"
                          className="mt-1.5"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveAlias();
                            if (e.key === 'Escape') setEditingAlias(false);
                          }}
                          autoFocus
                        />
                      </div>
                      <Button onClick={handleSaveAlias} size="sm" className="w-full">
                        Save
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Popover open={editingAlias} onOpenChange={setEditingAlias}>
                  <PopoverTrigger asChild>
                    <button
                      onClick={openAliasEditor}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Set your alias →
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="start">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Your alias</label>
                        <Input
                          value={tempAlias}
                          onChange={(e) => setTempAlias(e.target.value.slice(0, 30))}
                          placeholder="e.g., Student-2025"
                          className="mt-1.5"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveAlias();
                            if (e.key === 'Escape') setEditingAlias(false);
                          }}
                          autoFocus
                        />
                      </div>
                      <Button onClick={handleSaveAlias} size="sm" className="w-full">
                        Save
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Content textarea */}
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "resize-none border-0 focus-visible:ring-0 bg-transparent p-0 transition-all",
                isFocused ? "min-h-[120px]" : "min-h-[84px]"
              )}
            />

            {/* Safety hint */}
            <p className="text-xs text-muted-foreground">
              Be kind. No PII. Receipts &gt; rumors.
            </p>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center justify-between pt-3 border-t border-border">
              <span className={cn(
                "text-xs font-mono transition-colors",
                isAtLimit ? "text-destructive" : isNearLimit ? "text-yellow-500" : "text-muted-foreground"
              )}>
                {content.length}/{maxLength}
              </span>
              <Button 
                onClick={handleSubmit}
                disabled={!canPost}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Posting...' : parentId ? 'Reply' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky footer */}
      {isFocused && (
        <div className="md:hidden fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur px-4 py-3 flex items-center justify-between z-50 safe-area-bottom">
          <span className={cn(
            "text-xs font-mono transition-colors",
            isAtLimit ? "text-destructive" : isNearLimit ? "text-yellow-500" : "text-muted-foreground"
          )}>
            {content.length}/{maxLength}
          </span>
          <Button 
            onClick={handleSubmit}
            disabled={!canPost}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Posting...' : parentId ? 'Reply' : 'Post'}
          </Button>
        </div>
      )}
    </>
  );
};
