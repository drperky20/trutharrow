export const AquaProgress = ({ value }: { value: number }) => {
  return (
    <div className="h-3 rounded-full border border-[#aab4d0] bg-[#eef2ff] aqua-bevel overflow-hidden">
      <div
        className="h-full relative transition-all duration-300"
        style={{ 
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: 'linear-gradient(#6aa7ff,#3b82f6)',
          boxShadow: 'inset 0 2px 6px rgba(255,255,255,.6), inset 0 -2px 6px rgba(0,0,0,.08)' 
        }}
      >
        <div 
          className="absolute inset-x-0 top-0 h-[45%] opacity-50"
          style={{background:'linear-gradient(rgba(255,255,255,.9), rgba(255,255,255,0))'}}
        />
      </div>
    </div>
  );
};
