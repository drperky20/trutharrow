import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import heroBanner from '@/assets/hero-banner.jpg';
import heroBannerWebp from '@/assets/hero-banner.webp';

export const HeroSection = () => {
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [currentHeadline, setCurrentHeadline] = useState(0);

  useEffect(() => {
    const fetchHeadlines = async () => {
      const { data } = await supabase
        .from('hero_headlines')
        .select('text')
        .eq('active', true)
        .order('display_order');
      
      if (data && data.length > 0) {
        setHeadlines(data.map(h => h.text));
      }
    };
    
    fetchHeadlines();
  }, []);

  useEffect(() => {
    if (headlines.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentHeadline(prev => (prev + 1) % headlines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [headlines.length]);
  
  return <section className="relative overflow-hidden border-b-2 border-aqua-border shadow-aqua mb-8">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-[1]" />
      <picture className="absolute inset-0 block">
        <source 
          srcSet={`${heroBannerWebp}?w=640 640w, ${heroBannerWebp}?w=768 768w, ${heroBannerWebp}?w=1024 1024w, ${heroBannerWebp}?w=1280 1280w, ${heroBannerWebp}?w=1920 1920w`}
          sizes="100vw"
          type="image/webp" 
        />
        <source 
          srcSet={`${heroBanner}?w=640 640w, ${heroBanner}?w=768 768w, ${heroBanner}?w=1024 1024w, ${heroBanner}?w=1280 1280w, ${heroBanner}?w=1920 1920w`}
          sizes="100vw"
          type="image/jpeg" 
        />
        <img 
          src={heroBanner} 
          alt="Broken Arrow Public Schools campus" 
          className="w-full h-full object-cover opacity-20" 
          loading="eager" 
          sizes="100vw" 
          fetchPriority="high"
          width={1920}
          height={1080}
          decoding="sync"
        />
      </picture>
      <div className="relative z-[2] container px-4 py-20 md:py-32">
        
        <h1 className="aqua-font text-4xl md:text-6xl lg:text-7xl font-black mb-6 max-w-4xl bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent min-h-[4rem] md:min-h-[6rem] lg:min-h-[7rem]" style={{
        textShadow: '0 2px 8px rgba(0,0,0,0.8)'
      }}>
          {headlines.length > 0 ? headlines[currentHeadline] : 'Loading...'}
        </h1>
        <p className="aqua-font text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
          The official truth and accountability platform for Broken Arrow Public Schools students, staff, and families.
        </p>
        <div className="flex flex-wrap gap-4" data-avoid="critical">
          <Link to="/issues">
            <Button size="lg" className="aqua-pressable font-bold text-base min-h-[44px] px-6 skeu-interactive">
              See the Issues
            </Button>
          </Link>
          <Link to="/submit">
            <Button size="lg" variant="outline" className="aqua-pressable font-bold text-base min-h-[44px] px-6 skeu-interactive">
              Drop Your Homework
            </Button>
          </Link>
          <Link to="/about">
            <Button size="lg" variant="outline" className="aqua-pressable font-bold text-base min-h-[44px] px-6 skeu-interactive">
              Read the Yearbook
            </Button>
          </Link>
        </div>
      </div>
    </section>;
};