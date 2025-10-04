import { Link, useLocation } from "react-router-dom";
import { useSafeAreaBottom } from "@/hooks/useSafeArea";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import icons
import HomeFilled from "@/icons/skeuo/HomeFilled";
import DetentionFilled from "@/icons/skeuo/DetentionFilled";
import CafeteriaFilled from "@/icons/skeuo/CafeteriaFilled";
import ReceiptsFilled from "@/icons/skeuo/ReceiptsFilled";
import SubmitFilled from "@/icons/skeuo/SubmitFilled";
import AdminShieldFilled from "@/icons/skeuo/AdminShieldFilled";
import UserFilled from "@/icons/skeuo/UserFilled";

type DockItem = {
  key: string;
  label: string;
  to: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  adminOnly?: boolean;
};

interface SkeuoButtonProps {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

function SkeuoButton({ active, children, className }: SkeuoButtonProps) {
  return (
    <div
      className={cn(
        "skeuo-btn",
        active ? "skeuo-pressed" : "skeuo-rest",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function DockBar() {
  const { pathname } = useLocation();
  const padBottom = useSafeAreaBottom(10);
  const { user, isAdmin } = useAuth();

  const items: DockItem[] = [
    { key: "home", label: "Front Office", to: "/", Icon: HomeFilled },
    { key: "detention", label: "Detention", to: "/issues", Icon: DetentionFilled },
    { key: "cafeteria", label: "Cafeteria", to: "/feed", Icon: CafeteriaFilled },
    { key: "receipts", label: "Receipts", to: "/receipts", Icon: ReceiptsFilled },
    { key: "submit", label: "Submit", to: "/submit", Icon: SubmitFilled },
    { key: "admin", label: "Admin", to: "/admin", Icon: AdminShieldFilled, adminOnly: true },
  ];

  const visibleItems = items.filter(i => !i.adminOnly || isAdmin);

  return (
    <nav
      aria-label="Primary navigation"
      data-avoid="critical"
      className="fixed inset-x-0 bottom-0 z-40 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-4 pointer-events-none"
    >
      {/* MOBILE: full-width bar */}
      <div className="md:hidden mx-0 rounded-t-3xl bg-white/80 dark:bg-[#1a1a1a]/90 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_-2px_0_rgba(0,0,0,0.08),0_-10px_30px_rgba(0,0,0,0.25)] border-t-2 border-white/50 dark:border-white/10 pointer-events-auto pb-[env(safe-area-inset-bottom)]">
        <ul className="grid gap-1 px-3 pt-2 pb-2" style={{ gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))` }}>
          {visibleItems.map(item => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <li key={item.key} className="min-w-0">
                <Link
                  to={item.to}
                  className="flex flex-col items-center gap-1 px-1 py-1.5 min-h-[44px] justify-center"
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                >
                  <SkeuoButton active={active}>
                    <item.Icon className="w-5 h-5 text-[#1b1b1b] dark:text-white/95" />
                  </SkeuoButton>
                  <span className="text-[10px] leading-tight text-gray-700 dark:text-gray-300 truncate max-w-full text-center">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* DESKTOP: floating dock */}
      <div className="hidden md:block pointer-events-auto rounded-2xl px-4 py-1.5 bg-white/80 dark:bg-[#1a1a1a]/90 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_20px_40px_rgba(0,0,0,0.35)] border-2 border-white/50 dark:border-white/10">
        <ul className="flex items-end gap-2">
          {visibleItems.map(item => {
            const active = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <li key={item.key}>
                <Link
                  to={item.to}
                  className="flex flex-col items-center gap-1 px-2 py-0.5 min-h-[44px]"
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                >
                  <SkeuoButton active={active}>
                    <item.Icon className="w-7 h-6 text-[#1b1b1b] dark:text-white/95" />
                  </SkeuoButton>
                  <span className="text-xs text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

interface ProfileButtonProps {
  active?: boolean;
  isMobile?: boolean;
}

function ProfileButton({ active, isMobile }: ProfileButtonProps) {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.alias || user?.email?.split("@")[0] || "Profile";

  if (!user) {
    return (
      <Link
        to="/auth"
        className="flex flex-col items-center gap-1 px-1 py-1.5 min-h-[44px] justify-center"
        aria-label="Sign in"
      >
        <SkeuoButton active={active}>
          <UserFilled className={cn("text-[#1b1b1b] dark:text-white/95", isMobile ? "w-5 h-5" : "w-6 h-6")} />
        </SkeuoButton>
        <span className={cn("leading-tight text-gray-700 dark:text-gray-300 truncate", isMobile ? "text-[10px] max-w-full" : "text-xs whitespace-nowrap")}>
          Sign In
        </span>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex flex-col items-center gap-1 px-1 py-1.5 min-h-[44px] justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
          aria-label={`Profile: ${displayName}`}
        >
          <SkeuoButton active={active}>
            <UserFilled className={cn("text-[#1b1b1b] dark:text-white/95", isMobile ? "w-5 h-5" : "w-6 h-6")} />
          </SkeuoButton>
          <span className={cn("leading-tight text-gray-700 dark:text-gray-300 truncate", isMobile ? "text-[10px] max-w-full" : "text-xs whitespace-nowrap max-w-[72px]")}>
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-gradient-surface border-2 border-[#aab4d0] shadow-skeu-raised">
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          {user.email}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/submit" className="cursor-pointer">
            Submit Post
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

