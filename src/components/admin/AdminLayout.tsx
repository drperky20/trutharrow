import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { FileText, MessageSquare, Image, Bell, TrendingUp, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const adminRoutes = [
  { path: '/admin/issues', icon: FileText, label: 'Issues' },
  { path: '/admin/posts', icon: MessageSquare, label: 'Posts' },
  { path: '/admin/evidence', icon: Image, label: 'Evidence' },
  { path: '/admin/banners', icon: Bell, label: 'Banners' },
  { path: '/admin/polls', icon: TrendingUp, label: 'Polls' },
  { path: '/admin/ticker', icon: Quote, label: 'Ticker' },
];

export const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen">
      {/* Admin Navigation */}
      <div className="border-b border-border bg-card/50 sticky top-16 z-10">
        <div className="container px-4">
          <nav className="flex gap-1 overflow-x-auto py-2">
            {adminRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = location.pathname === route.path;
              return (
                <Link
                  key={route.path}
                  to={route.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{route.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 py-8">
        {title && <h1 className="text-3xl font-black mb-6">{title}</h1>}
        {children}
      </div>
    </div>
  );
};

