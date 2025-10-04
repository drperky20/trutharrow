import { User, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { AquaButton } from "./AquaButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AquaUserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <button
        onClick={() => navigate('/auth')}
        className="relative rounded-xl p-3 bg-gradient-to-b from-white/90 to-[#e8eef9]/90 
                   border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,.15),inset_0_1px_0_rgba(255,255,255,.9),inset_0_-1px_1px_rgba(0,0,0,.08)]
                   hover:scale-105 transition-transform"
        aria-label="Sign In"
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/60 to-transparent" />
        <LogIn className="size-6 text-slate-700 relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,.9)]" 
               strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative rounded-xl p-3 bg-gradient-to-b from-white/90 to-[#e8eef9]/90 
                     border border-white/90 shadow-[0_2px_8px_rgba(0,0,0,.15),inset_0_1px_0_rgba(255,255,255,.9),inset_0_-1px_1px_rgba(0,0,0,.08)]
                     hover:scale-105 transition-transform"
          aria-label="User Menu"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/60 to-transparent" />
          <User className="size-6 text-slate-700 relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,.9)]" 
                strokeWidth={2.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="aqua-card min-w-[200px] p-2">
        <div className="px-3 py-2 text-sm aqua-font">
          <div className="font-semibold text-slate-800">Signed in as</div>
          <div className="text-slate-600 text-xs mt-1 truncate">{user.email}</div>
        </div>
        <DropdownMenuItem asChild>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-3 py-2 text-sm aqua-font text-slate-700 
                       hover:bg-white/60 rounded-lg cursor-pointer transition-colors"
          >
            Sign Out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
