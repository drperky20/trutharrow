import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type Anchor = 'top-left' | 'top-right';
type Opts = { 
  avoidSelectors: string[]; 
  anchor?: Anchor; 
  margin?: number; 
  stickyUntilPx?: number; 
};

export function useSmartAvoidance({ 
  avoidSelectors, 
  anchor = 'top-left', 
  margin = 12, 
  stickyUntilPx = 96 
}: Opts) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const avoidNodesRef = useRef<HTMLElement[]>([]);
  const rAF = useRef<number | null>(null);

  const recalc = () => {
    if (rAF.current) cancelAnimationFrame(rAF.current);
    rAF.current = requestAnimationFrame(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const bounds = { x: margin, y: margin, w: vw - margin * 2, h: vh - margin * 2 };

      const rects = avoidNodesRef.current
        .map(n => n.getBoundingClientRect())
        .map(r => ({ 
          x: r.left - margin, 
          y: r.top - margin, 
          w: r.width + margin * 2, 
          h: r.height + margin * 2 
        }))
        .filter(r => r.w > 0 && r.h > 0);

      const overlaps = (x: number, y: number, size = 80) => 
        rects.some(r => x < r.x + r.w && x + size > r.x && y < r.y + r.h && y + size > r.y);

      // Starting candidate position
      let x = anchor === 'top-left' ? bounds.x : bounds.x + bounds.w - 80;
      let y = bounds.y + (window.scrollY < stickyUntilPx ? 0 : 0);

      // Try different positions in priority order
      const tryPositions = [
        () => ({ 
          x: anchor === 'top-left' ? bounds.x : bounds.x + bounds.w - 80, 
          y: bounds.y 
        }),
        () => {
          const maxTop = rects.reduce((m, r) => Math.max(m, r.y + r.h), bounds.y);
          return { x: bounds.x, y: Math.min(maxTop, bounds.y + bounds.h / 4) };
        },
        () => ({ x: bounds.x + bounds.w - 80, y: bounds.y }),
      ];

      let placed = { x, y };
      for (const fn of tryPositions) {
        const c = fn();
        if (!overlaps(c.x, c.y)) {
          placed = c;
          break;
        }
      }

      // Incremental nudge if still overlapping
      let tries = 0;
      while (overlaps(placed.x, placed.y) && tries < 48) {
        placed = { x: placed.x, y: Math.min(placed.y + 8, bounds.y + bounds.h - margin) };
        tries++;
      }

      const prefersReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      setStyle({
        position: 'fixed',
        top: Math.max(bounds.y, placed.y),
        ...(anchor === 'top-left' 
          ? { left: Math.max(bounds.x, placed.x) } 
          : { right: Math.max(bounds.x, bounds.x + bounds.w - placed.x) }
        ),
        transition: prefersReduce 
          ? 'none' 
          : 'top 0.2s ease-out, left 0.2s ease-out, right 0.2s ease-out, transform 0.2s ease-out',
      });
    });
  };

  useLayoutEffect(() => {
    avoidNodesRef.current = avoidSelectors.flatMap(sel => 
      Array.from(document.querySelectorAll<HTMLElement>(sel))
    );
    
    const ro = new ResizeObserver(recalc);
    avoidNodesRef.current.forEach(n => ro.observe(n));
    
    const mo = new MutationObserver(recalc);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true });
    
    window.addEventListener('resize', recalc, { passive: true });
    window.addEventListener('scroll', recalc, { passive: true });
    
    recalc();
    
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', recalc);
      window.removeEventListener('scroll', recalc);
      if (rAF.current) cancelAnimationFrame(rAF.current);
    };
  }, [avoidSelectors.join(','), anchor, margin, stickyUntilPx]);

  return { style, recalc };
}
