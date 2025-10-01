import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { navItems } from '@/config/navConfig';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Don't show on admin pages or auth
  if (location.pathname.startsWith('/admin') || location.pathname === '/auth') {
    return null;
  }

  // Filter nav items based on admin status
  const visibleNavItems = navItems.filter(item => !item.requiresAdmin || isAdmin);

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur border-t border-border"
      role="navigation"
      aria-label="Primary navigation"
      style={{
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center justify-around pt-2">
        {visibleNavItems.map(({ path, icon: Icon, label, isPrimary }) => {
          const isActive = location.pathname === path || 
                          (path !== '/' && location.pathname.startsWith(path));
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] min-h-[56px] transition-all rounded-xl relative",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isPrimary && !isActive && "text-primary",
                isActive 
                  ? 'text-primary font-semibold' 
                  : !isPrimary && 'text-muted-foreground hover:text-foreground active:scale-95'
              )}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn(
                "h-6 w-6 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs",
                isActive ? "font-bold" : "font-medium"
              )}>
                {label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
