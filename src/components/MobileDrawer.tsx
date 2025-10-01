import { Link } from 'react-router-dom';
import { Menu, X, Search, Shield, Send, Info, LogOut, LogIn } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export const MobileDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const toggleDrawer = () => setIsOpen(!isOpen);
  const closeDrawer = () => setIsOpen(false);

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={toggleDrawer}
        className="md:hidden p-2 hover:bg-accent rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "md:hidden fixed top-0 right-0 bottom-0 w-[280px] bg-card border-l border-border z-50 transition-transform duration-300 ease-out",
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-black">Menu</h2>
            <button
              onClick={closeDrawer}
              className="p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              <Link
                to="/search"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors min-h-[48px]"
              >
                <Search className="h-5 w-5" />
                <span className="font-medium">Search</span>
              </Link>

              <Link
                to="/submit"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors min-h-[48px]"
              >
                <Send className="h-5 w-5" />
                <span className="font-medium">Submit</span>
              </Link>

              <Link
                to="/about"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors min-h-[48px]"
              >
                <Info className="h-5 w-5" />
                <span className="font-medium">About</span>
              </Link>

              {isAdmin && (
                <>
                  <div className="h-px bg-border my-4" />
                  <Link
                    to="/admin"
                    onClick={closeDrawer}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-primary min-h-[48px]"
                  >
                    <Shield className="h-5 w-5" />
                    <span className="font-medium">Admin Dashboard</span>
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border">
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  closeDrawer();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-accent transition-colors min-h-[48px]"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={closeDrawer}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors min-h-[48px]"
              >
                <LogIn className="h-5 w-5" />
                <span className="font-medium">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
