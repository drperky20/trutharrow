import React from "react";

export const AquaChrome: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ 
  className = "", 
  children 
}) => (
  <div 
    className={`rounded-2xl bg-aquaGloss text-black shadow-[inset_0_1px_0_rgba(255,255,255,.9),inset_0_-1px_0_rgba(0,0,0,.25),0_10px_30px_rgba(42,118,255,.25)] ${className}`}
  >
    {children}
  </div>
);

export const GlassCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ 
  className = "", 
  children 
}) => (
  <div 
    className={`rounded-3xl backdrop-blur bg-white/6 border border-white/10 shadow-[0_1px_0_rgba(255,255,255,.25),0_12px_30px_rgba(0,0,0,.4)] ${className}`}
  >
    {children}
  </div>
);

export const SkeuoPlate: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ 
  className = "", 
  children 
}) => (
  <div 
    className={`rounded-2xl bg-plate bg-plateGloss border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.2),inset_0_-2px_6px_rgba(0,0,0,.45)] ${className}`}
  >
    {children}
  </div>
);
