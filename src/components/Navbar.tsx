import { Link } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { navItems } from '@/config/navConfig';

export const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Always visible */}
          <Link 
            to="/" 
            className="text-2xl font-black hover:text-primary transition-colors relative group"
          >
            TruthArrow
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-alert to-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>

          {/* Center Links - Desktop only */}
          <div className="hidden md:flex items-center gap-6">
            {navItems
              .filter(item => !item.isPrimary && (!item.requiresAdmin || isAdmin))
              .map(item => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.id}
                    to={item.path} 
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {item.requiresAdmin && <Icon className="h-4 w-4" />}
                    {item.label}
                  </Link>
                );
              })}
          </div>

          {/* Right Side - Desktop only */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/submit">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Submit
                  </Button>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
            <Link to="/search">
              <button 
                className="p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </Link>
          </div>

          {/* Mobile: Search icon only */}
          <Link to="/search" className="md:hidden">
            <button 
              className="p-2 hover:bg-accent rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
