import { FC } from "react";

export const AquaTrafficLights: FC<{className?: string}> = ({ className }) => (
  <div className={`flex gap-2 items-center ${className || ""}`}>
    {[
      { c:'#ff5f57', label:'close' },
      { c:'#febc2e', label:'minimize' },
      { c:'#28c840', label:'zoom' }
    ].map((b,i)=>(
      <span
        key={i}
        aria-hidden="true"
        className="relative inline-block h-3.5 w-3.5 rounded-full"
        style={{ 
          background: b.c, 
          boxShadow:'inset 0 1px 0 rgba(255,255,255,.6), 0 1px 1px rgba(0,0,0,.25)'
        }}
      >
        <span 
          className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-full opacity-60"
          style={{background:'linear-gradient(rgba(255,255,255,.9), rgba(255,255,255,0))'}}
        />
      </span>
    ))}
  </div>
);
