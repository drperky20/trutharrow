import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-black">TruthArrow</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Front Office
          </Link>
          <Link
            to="/issues"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/issues') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Detention Board
          </Link>
          <Link
            to="/feed"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/feed') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Cafeteria
          </Link>
          <Link
            to="/receipts"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/receipts') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Receipts
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link to="/submit">
            <Button size="sm" className="font-semibold">
              Submit
            </Button>
          </Link>
          <Link to="/search">
            <Button size="sm" variant="ghost">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
