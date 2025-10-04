import { Link } from 'react-router-dom';
import { useSmartAvoidance } from '@/hooks/useSmartAvoidance';
import { useEffect, useState } from 'react';

interface SmartLogoProps {
  anchor?: 'top-left' | 'top-right';
  margin?: number;
  className?: string;
}

export function SmartLogo(props: SmartLogoProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { style } = useSmartAvoidance({
    avoidSelectors: ['[data-avoid="critical"]'],
    anchor: props.anchor ?? 'top-left',
    margin: props.margin ?? 12,
    stickyUntilPx: 96,
  });

  // Mobile: render inline (will be positioned by parent layout)
  if (isMobile) {
    return (
      <Link 
        to="/" 
        aria-label="Go to Front Office"
        className="aqua-card px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,.2)] 
                   bg-gradient-to-b from-white to-[#f4f7ff] inline-flex items-center gap-2"
      >
        <svg className="w-5 h-5 text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,.2)]" 
             viewBox="0 0 24 24" 
             fill="currentColor">
          <path d="M12 2L2 19.5L12 16L22 19.5L12 2Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinejoin="round"/>
        </svg>
        <h1 className="font-righteous text-lg tracking-wide text-primary 
                       drop-shadow-[0_2px_4px_rgba(0,0,0,.15)]">
          TruthArrow
        </h1>
      </Link>
    );
  }

  // Desktop: collision-aware fixed positioning
  return (
    <Link
      to="/"
      aria-label="Go to Front Office"
      role="banner"
      style={style}
      className="aqua-card px-3 py-2 md:px-4 md:py-2.5 shadow-[0_4px_16px_rgba(0,0,0,.2)] 
                 bg-gradient-to-b from-white to-[#f4f7ff] z-50 
                 hover:shadow-[0_6px_20px_rgba(0,0,0,.25)] transition-shadow duration-200"
    >
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 md:w-6 md:h-6 text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,.2)]" 
             viewBox="0 0 24 24" 
             fill="currentColor">
          <path d="M12 2L2 19.5L12 16L22 19.5L12 2Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinejoin="round"/>
        </svg>
        <h1 className="font-righteous text-lg md:text-2xl tracking-wide text-primary 
                       drop-shadow-[0_2px_4px_rgba(0,0,0,.15)]">
          TruthArrow
        </h1>
      </div>
    </Link>
  );
}

export default SmartLogo;
