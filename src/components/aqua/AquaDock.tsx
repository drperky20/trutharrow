import { NavLink } from "react-router-dom";
import { Home, ListChecks, MessagesSquare, FileStack, Upload, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AquaUserMenu } from "./AquaUserMenu";

const ITEMS = [
  { to:'/', icon: Home, label:'Front Office' },
  { to:'/issues', icon: ListChecks, label:'Detention' },
  { to:'/feed', icon: MessagesSquare, label:'Cafeteria' },
  { to:'/receipts', icon: FileStack, label:'Receipts' },
  { to:'/submit', icon: Upload, label:'Submit' },
];

export const AquaDock = () => {
  const { isAdmin } = useAuth();
  
  const items = isAdmin 
    ? [...ITEMS, { to:'/admin', icon: Shield, label:'Admin' }]
    : ITEMS;
  
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40
                    backdrop-blur-md bg-white/40 border border-white/60
                    rounded-2xl px-4 py-2 shadow-[0_20px_40px_rgba(0,0,0,.18)]
                    hidden md:block"
         data-avoid="critical">
      <nav className="flex gap-4 items-center">
        {items.map(({to,icon:Icon,label})=>(
          <NavLink 
            key={to} 
            to={to} 
            className="group flex flex-col items-center"
            title={label}
          >
            <div className="relative transition-transform duration-150 group-hover:scale-125
                            rounded-xl p-3 bg-gradient-to-b from-white/90 to-[#e8eef9]/90 
                            border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,.15),inset_0_1px_0_rgba(255,255,255,.9),inset_0_-1px_1px_rgba(0,0,0,.08)]">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/60 to-transparent" />
              <Icon className="size-6 text-slate-700 relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,.9)]" 
                    aria-hidden 
                    strokeWidth={2.5} />
            </div>
            <span className="mt-1.5 text-[10px] text-slate-700 aqua-font font-medium drop-shadow-sm">{label}</span>
          </NavLink>
        ))}
        <div className="ml-2 pl-2 border-l border-white/60">
          <AquaUserMenu />
        </div>
      </nav>
    </div>
  );
};
