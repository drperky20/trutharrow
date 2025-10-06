import { Link } from 'react-router-dom';
import { RainbowBanner } from './RainbowBanner';
import { FloatingProfileButton } from './FloatingProfileButton';

export const Header = () => {
  return (
    <header className="relative z-50">
      {/* Top bar with logo and profile */}
      <div className="flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
        {/* Logo */}
        <Link 
          to="/" 
          aria-label="Go to Front Office"
          className="aqua-card px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,.2)] 
                     bg-gradient-to-b from-white to-[#f4f7ff] inline-flex items-center gap-2
                     hover:shadow-[0_6px_20px_rgba(0,0,0,.25)] transition-shadow duration-200"
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

        {/* Profile button */}
        <FloatingProfileButton />
      </div>

      {/* Rainbow banner slot - always reserves space */}
      <RainbowBanner />
    </header>
  );
};
