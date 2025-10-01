import { Link } from 'react-router-dom';
import { Search, LogOut, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { MobileDrawer } from './MobileDrawer';

export const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-black hover:text-primary transition-colors relative group"
          >
            TruthArrow
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-alert to-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Front Office
            </Link>
            <Link to="/issues" className="text-sm font-medium hover:text-primary transition-colors">
              Detention Board
            </Link>
            <Link to="/feed" className="text-sm font-medium hover:text-primary transition-colors">
              Cafeteria
            </Link>
            <Link to="/receipts" className="text-sm font-medium hover:text-primary transition-colors">
              Receipts
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Desktop actions */}
            {user ? (
              <>
                <Link to="/submit" className="hidden md:block">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Submit
                  </Button>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hidden md:block p-2 hover:bg-accent rounded-md transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
            <Link to="/search" className="hidden md:block">
              <button className="p-2 hover:bg-accent rounded-md transition-colors">
                <Search className="h-5 w-5" />
              </button>
            </Link>
            
            {/* Mobile drawer menu */}
            <MobileDrawer />
          </div>
        </div>
      </div>
    </nav>
  );
};
