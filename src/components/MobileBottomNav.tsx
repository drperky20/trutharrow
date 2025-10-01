import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { navItems, type NavItem } from '@/config/navConfig';

interface NavItemLinkProps {
  item: NavItem;
  isActive: boolean;
}

const NavItemLink = ({ item, isActive }: NavItemLinkProps) => {
  const { path, icon: Icon, label, isPrimary } = item;
  
  return (
    <Link
      to={path}
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-1.5 py-2 min-h-[64px] transition-all rounded-xl relative",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:scale-95",
        "max-w-[80px]",
        isPrimary && !isActive && "text-primary",
        isActive 
          ? 'text-primary font-semibold' 
          : !isPrimary && 'text-muted-foreground hover:text-foreground'
      )}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className={cn(
        "h-6 w-6 transition-transform motion-reduce:transition-none flex-shrink-0",
        isActive && "scale-110"
      )} />
      <span className={cn(
        "text-[10px] leading-tight text-center px-0.5 max-w-full overflow-hidden text-ellipsis",
        "break-words hyphens-auto",
        isActive ? "font-bold" : "font-medium"
      )}
      style={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}>
        {label}
      </span>
      {isActive && (
        <div 
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60 rounded-full motion-reduce:transition-none" 
          aria-hidden="true"
        />
      )}
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border"
      role="navigation"
      aria-label="Primary navigation"
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-stretch justify-evenly gap-0.5 pt-2 px-1">
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
