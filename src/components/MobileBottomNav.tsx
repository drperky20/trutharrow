import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, MessageSquare, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/issues', icon: FileText, label: 'Issues' },
  { path: '/feed', icon: MessageSquare, label: 'Feed' },
  { path: '/receipts', icon: Receipt, label: 'Receipts' },
];

export const MobileBottomNav = () => {
  const location = useLocation();

  // Don't show on admin pages or auth
  if (location.pathname.startsWith('/admin') || location.pathname === '/auth') {
    return null;
  }

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
      }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path || 
                          (path !== '/' && location.pathname.startsWith(path));
          
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px] transition-all rounded-lg",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              )}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={cn(
                "h-6 w-6 transition-transform",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium">{label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
