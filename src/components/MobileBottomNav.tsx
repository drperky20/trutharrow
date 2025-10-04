import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { navItems, type NavItem } from '@/config/navConfig';

interface NavItemLinkProps {
  item: NavItem;
  isActive: boolean;
}

const NavItemLink = ({ item, isActive }: NavItemLinkProps) => {
  const { path, icon: Icon, label } = item;
  
  return (
    <Link
      to={path}
      className="flex flex-col items-center justify-center gap-1.5 min-w-[60px] active:scale-95 transition-transform"
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="relative rounded-xl p-2.5 bg-gradient-to-b from-white/90 to-[#e8eef9]/90 
                      border border-white/90 shadow-[0_2px_6px_rgba(0,0,0,.12),inset_0_1px_0_rgba(255,255,255,.9),inset_0_-1px_1px_rgba(0,0,0,.06)]">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/60 to-transparent" />
        <Icon className="size-5 text-slate-700 relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,.9)]" 
              aria-hidden 
              strokeWidth={2.5} />
      </div>
      <span className="text-[9px] leading-tight text-center aqua-font font-medium text-slate-700 drop-shadow-sm max-w-[60px] overflow-hidden text-ellipsis">
        {label}
      </span>
    </Link>
  );
};

export const MobileBottomNav = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Hide on auth page
  if (location.pathname === '/auth') {
    return null;
  }

  const visibleNavItems = navItems.filter(item => !item.requiresAdmin || isAdmin);

  const isActiveRoute = (path: string) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/40 border-t border-white/60"
      role="navigation"
      aria-label="Primary navigation"
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center justify-around gap-1 pt-3 px-2 pb-1">
        {visibleNavItems.map((item) => (
          <NavItemLink 
            key={item.path} 
            item={item} 
            isActive={isActiveRoute(item.path)} 
          />
        ))}
      </div>
    </nav>
  );
};
