import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { navItems } from '@/config/navConfig';
export const Navbar = () => {
  const {
    user,
    isAdmin,
    signOut
  } = useAuth();
  return <>
      {/* School Branding Banner */}
      
      
      <nav className="sticky top-0 z-50 bg-gradient-surface backdrop-blur-md border-b border-border shadow-skeu-raised">
        <div className="container px-4">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo - Always visible */}
            <Link to="/" className="text-lg md:text-2xl font-black hover:text-primary transition-colors relative group flex-shrink-0 text-primary">
              TruthArrow
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>

          {/* Center Links - Desktop only */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {navItems.filter(item => !item.isPrimary && (!item.requiresAdmin || isAdmin)).map(item => {
              const Icon = item.icon;
              return <Link key={item.id} to={item.path} className="text-xs lg:text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1">
                    {item.requiresAdmin && <Icon className="h-4 w-4 flex-shrink-0" />}
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>;
            })}
          </div>

          {/* Right Side - Search only */}
          <div className="flex items-center gap-2">
            <Link to="/search">
              <button className="p-2 hover:bg-secondary rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Search">
                <Search className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
    </>;
};