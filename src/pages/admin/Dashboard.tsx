import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { FileText, MessageSquare, Image, Bell, TrendingUp, Quote } from 'lucide-react';

export default function AdminDashboard() {
  const { isAdmin, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return <Navigate to="/auth" replace />;

  const sections = [
    { title: 'Issues', icon: FileText, href: '/admin/issues', desc: 'Manage detention board' },
    { title: 'Posts', icon: MessageSquare, href: '/admin/posts', desc: 'Moderate cafeteria posts' },
    { title: 'Evidence', icon: Image, href: '/admin/evidence', desc: 'Manage receipts' },
    { title: 'Banners', icon: Bell, href: '/admin/banners', desc: 'Edit front office banners' },
    { title: 'Polls', icon: TrendingUp, href: '/admin/polls', desc: 'Create polls' },
    { title: 'Ticker', icon: Quote, href: '/admin/ticker', desc: 'Manage ticker quotes' },
  ];

  return (
    <div className="container px-4 py-12">
      <h1 className="text-4xl font-black mb-8">Admin Dashboard</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              to={section.href}
              className="bg-card border border-border rounded-lg p-6 hover:bg-card/80 hover:border-primary transition-all"
            >
              <Icon className="h-8 w-8 mb-3 text-primary" />
              <h2 className="text-xl font-bold mb-1">{section.title}</h2>
              <p className="text-sm text-muted-foreground">{section.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}