import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { banners } from '@/data/seedData';

export const RainbowBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldShake, setShouldShake] = useState(false);
  
  const activeBanners = banners.filter(b => b.active);
  
  useEffect(() => {
    if (activeBanners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 150);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeBanners.length]);
  
  if (activeBanners.length === 0) return null;
  
  const currentBanner = activeBanners[currentIndex];
  
  const content = (
    <div className={`py-2 text-center text-sm font-mono font-semibold uppercase tracking-wide ${shouldShake ? 'shake-1' : ''}`}>
      {currentBanner.title}
    </div>
  );
  
  return (
    <div className="rainbow-gradient">
      {currentBanner.url ? (
        <Link to={currentBanner.url} className="block text-background hover:opacity-90 transition-opacity">
          {content}
        </Link>
      ) : (
        <div className="text-background">{content}</div>
      )}
    </div>
  );
};
