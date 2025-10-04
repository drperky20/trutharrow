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
        "inline-flex rounded-2xl bg-aquaGloss p-1 relative shadow-[inset_0_1px_0_rgba(255,255,255,.9),inset_0_-1px_0_rgba(0,0,0,.25),0_10px_30px_rgba(42,118,255,.25)]",
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
              "flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all min-w-[100px] shadow-[inset_0_1px_0_rgba(255,255,255,.9),inset_0_-1px_0_rgba(0,0,0,.25)]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/80",
              isActive 
                ? 'bg-white/90 text-black' 
                : 'text-black/60 hover:text-black/80'
            )}
          >
            {item.label}
          </button>
        );
      })}
      
      {/* Hidden underline in aqua context (buttons have their own active state) */}
    </div>
  );
};
