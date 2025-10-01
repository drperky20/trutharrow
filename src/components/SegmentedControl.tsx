import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface SegmentedControlItem {
  id: string;
  label: string;
}

interface SegmentedControlProps {
  value: string;
  onValueChange: (value: string) => void;
  items: SegmentedControlItem[];
  className?: string;
}

export const SegmentedControl = ({ value, onValueChange, items, className }: SegmentedControlProps) => {
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeButtonRef.current && containerRef.current) {
      const container = containerRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      
      setUnderlineStyle({
        width: buttonRect.width - 16, // padding adjustment
        left: buttonRect.left - containerRect.left + 8,
      });
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }
    
    onValueChange(items[nextIndex].id);
  };

  return (
    <div 
      ref={containerRef}
      role="tablist"
      className={cn(
        "inline-flex rounded-full bg-card/60 border border-border p-1 relative",
        className
      )}
    >
      {items.map((item, index) => {
        const isActive = value === item.id;
        
        return (
          <button
            key={item.id}
            ref={isActive ? activeButtonRef : null}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${item.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onValueChange(item.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors min-w-[100px]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive 
                ? 'text-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
          </button>
        );
      })}
      
      {/* Animated rainbow underline */}
      <div
        className="absolute bottom-1 h-0.5 rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 transition-all duration-300 ease-out motion-reduce:transition-none"
        style={{
          width: `${underlineStyle.width}px`,
          transform: `translateX(${underlineStyle.left}px)`,
        }}
      />
    </div>
  );
};
