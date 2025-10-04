import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const FloatingProfileButton = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <Link
        to="/auth"
        className="fixed top-4 right-4 z-[60] p-3 rounded-full bg-gradient-to-b from-white/90 to-[#e8eef9]/90 border-2 border-white/90 shadow-[0_4px_12px_rgba(0,0,0,.2),inset_0_1px_0_rgba(255,255,255,.9),inset_0_-1px_1px_rgba(0,0,0,.08)] hover:scale-105 active:scale-95 transition-transform backdrop-blur-sm"
        aria-label="Sign In"
      >
        <User className="size-5 text-slate-700 drop-shadow-[0_1px_0_rgba(255,255,255,.9)]" strokeWidth={2.5} />
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="fixed top-4 right-4 z-[60] p-3 rounded-full bg-gradient-to-b from-white/90 to-[#e8eef9]/90 border-2 border-white/90 shadow-[0_4px_12px_rgba(0,0,0,.2),inset_0_1px_0_rgba(255,255,255,.9),inset_0_-1px_1px_rgba(0,0,0,.08)] hover:scale-105 active:scale-95 transition-transform backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Profile menu"
        >
          <User className="size-5 text-slate-700 drop-shadow-[0_1px_0_rgba(255,255,255,.9)]" strokeWidth={2.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 mr-4 mt-2">
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          {user.email}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/submit" className="cursor-pointer">
            Submit Post
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
