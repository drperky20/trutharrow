import { NavLink } from "react-router-dom";
import { Home, ListChecks, MessagesSquare, FileStack, Upload, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
                    hidden md:block">
      <nav className="flex gap-4">
        {items.map(({to,icon:Icon,label})=>(
          <NavLink 
            key={to} 
            to={to} 
            className="group flex flex-col items-center"
            title={label}
          >
            <div className="transition-transform duration-150 group-hover:scale-125
                            rounded-xl p-2 bg-white/70 border border-white/80 shadow">
              <Icon className="size-6 text-slate-700" aria-hidden />
            </div>
            <span className="mt-1 text-[10px] text-slate-700 aqua-font">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
