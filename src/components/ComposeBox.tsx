import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image, Smile } from 'lucide-react';

export const ComposeBox = () => {
  const [content, setContent] = useState('');
  const maxLength = 280;

  const handleSubmit = () => {
    if (content.trim()) {
      // TODO: Submit post
      console.log('Posting:', content);
      setContent('');
    }
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
            <div className="flex gap-2">
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Image className="h-4 w-4" />
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Smile className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-mono ${
                content.length > maxLength - 20 ? 'text-alert' : 'text-muted-foreground'
              }`}>
                {content.length}/{maxLength}
              </span>
              <Button 
                onClick={handleSubmit}
                disabled={!content.trim()}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
