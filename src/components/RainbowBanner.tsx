import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const RainbowBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shouldShake, setShouldShake] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  
  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data } = await supabase
      .from('banners')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    setBanners(data || []);
  };
  
  useEffect(() => {
    if (banners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 150);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);
  
  if (banners.length === 0) return null;
  
  const currentBanner = banners[currentIndex];
  
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