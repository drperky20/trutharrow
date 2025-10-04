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
import { postSchema, sanitizeInput } from '@/lib/validation';
import { z } from 'zod';

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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
    setValidationErrors({});

    try {
      // Validate input
      const validatedData = postSchema.parse({
        content: sanitizeInput(content),
        alias: sanitizeInput(alias),
      });

      // Call new content moderation service
      const { data: modResult, error: modError } = await supabase.functions.invoke('content-moderation', {
        body: { content: validatedData.content }
      });

      // Determine post status: approved (live immediately) or pending (admin review)
      const shouldApprove = modError || !modResult ? true : modResult.shouldApprove;
      const finalStatus = shouldApprove ? 'approved' : 'pending';

      // Insert post into database
      const { error: insertError } = await supabase.from('posts').insert({
        alias: validatedData.alias,
        content: validatedData.content,
        parent_id: parentId || null,
        user_id: user?.id || null,
        type: 'assignment',
        status: finalStatus,
      });

      if (insertError) {
        toast({
          title: "Error posting",
          description: insertError.message,
          variant: "destructive",
        });
      } else {
        // Success - show appropriate message
        if (finalStatus === 'approved') {
          toast({
            title: "Posted! 🎉",
            description: "Your post is live on the feed.",
          });
        } else {
          toast({
            title: "Flagged for review",
            description: modResult?.flagReason || "Admins will review your post.",
            variant: "default",
          });
        }
        
        setContent('');
        setIsFocused(false);
        onPost?.();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
        toast({
          title: 'Validation error',
          description: Object.values(errors)[0] || 'Please check your input.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit post. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAlias = () => {
    setValidationErrors({});
    try {
      const validatedAlias = postSchema.shape.alias.parse(tempAlias);
      setAlias(validatedAlias);
      setEditingAlias(false);
      toast({
        title: "Alias saved",
        description: `You'll post as "${validatedAlias}"`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationErrors({ alias: error.errors[0]?.message || 'Invalid alias' });
        toast({
          title: 'Invalid alias',
          description: error.errors[0]?.message,
          variant: 'destructive'
        });
      }
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
    <div className={cn(
      "rounded-3xl backdrop-blur bg-white/6 border border-white/10 shadow-[0_1px_0_rgba(255,255,255,.15),0_6px_15px_rgba(0,0,0,.2)] ring-1 ring-white/20 ring-inset transition-all",
      compact ? "p-3" : "p-4",
      isFocused && "ring-2 ring-primary/20 shadow-[0_2px_0_rgba(255,255,255,.25),0_8px_20px_rgba(0,0,0,.25)]"
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
                        className={`mt-1.5 ${validationErrors.alias ? 'border-destructive' : ''}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveAlias();
                          if (e.key === 'Escape') {
                            setEditingAlias(false);
                            setValidationErrors({});
                          }
                        }}
                        autoFocus
                      />
                      {validationErrors.alias && (
                        <p className="text-xs text-destructive mt-1">{validationErrors.alias}</p>
                      )}
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

          {/* Content textarea wrapper with integrated button */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "resize-none border-0 focus-visible:ring-0 bg-transparent p-0 pl-2 transition-all placeholder:font-bold",
                isFocused ? "min-h-[120px]" : "min-h-[84px]",
                "pr-20" // Make room for the button
              )}
            />
            
            {/* Post button positioned inside textarea - mobile optimized */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2">
              {/* Character counter - shows when typing */}
              {content.length > 0 && (
                <span className={cn(
                  "text-[10px] font-mono transition-colors px-1.5 py-0.5 rounded-md bg-background/80",
                  isAtLimit ? "text-destructive" : isNearLimit ? "text-yellow-500" : "text-muted-foreground"
                )}>
                  {content.length}/{maxLength}
                </span>
              )}
              
              {/* Post button */}
              <button 
                onClick={handleSubmit}
                disabled={!canPost}
                className={cn(
                "bg-[#FF6A00] text-white rounded-xl px-4 py-2 font-semibold",
                "shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_3px_10px_rgba(255,106,0,.3)]",
                "active:translate-y-px disabled:opacity-50 transition-all",
                  "h-9 min-h-[36px] md:px-3",
                  "touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70"
                )}
              >
                {loading ? 'Posting...' : parentId ? 'Reply' : 'Post'}
              </button>
            </div>
          </div>

          {/* Safety hint */}
          <p className="text-xs text-muted-foreground">
            Be kind. No PII. Receipts &gt; rumors.
          </p>
        </div>
      </div>
    </div>
  );
};
