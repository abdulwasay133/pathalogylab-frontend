import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
} from "lucide-react";
import { useAuth } from "context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItemClass =
  "group text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 focus:bg-emerald-50 focus:text-emerald-900";

const menuIconClass =
  "h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-emerald-600 group-focus:text-emerald-600";

const AdminNavbar = ({ brandText, onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout, roles } = useAuth();

  const userName = user?.name || "User";
  const userEmail = user?.email || "";
  const roleLabel = roles?.[0] || "user";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card/95 px-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80 md:px-6">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0 border-emerald-200/80 md:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-emerald-800" />
      </Button>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
          PrimeLIMS
        </p>
        <h1 className="truncate text-lg font-bold tracking-tight text-foreground md:text-xl">
          {brandText || "Dashboard"}
        </h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            id="lims-user-menu-trigger"
            className={cn(
              "group/trigger flex items-center gap-2 rounded-lg border border-emerald-200/90 bg-background px-2 py-1.5 text-left transition-colors",
              "hover:border-emerald-300 hover:bg-emerald-50/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2",
              "data-[state=open]:border-emerald-400 data-[state=open]:bg-emerald-50/50 data-[state=open]:ring-2 data-[state=open]:ring-emerald-500/20 data-[state=open]:ring-offset-2",
              "md:px-3"
            )}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
              style={{
                background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
              }}
              aria-hidden
            >
              {initials}
            </span>
            <span className="hidden min-w-0 md:block">
              <span className="block truncate text-sm font-semibold text-slate-800">
                {userName}
              </span>
              <span className="block truncate text-xs capitalize text-slate-500">
                {roleLabel}
              </span>
            </span>
            <ChevronDown
              className="hidden h-4 w-4 shrink-0 text-slate-400 transition-transform group-data-[state=open]/trigger:rotate-180 md:block"
              aria-hidden
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          id="lims-user-menu"
          align="end"
          className="w-56"
        >
          <DropdownMenuLabel className="border-b border-emerald-100 px-3 py-2.5 font-normal">
            <p className="text-sm font-semibold text-slate-800">{userName}</p>
            {userEmail && (
              <p className="truncate text-xs font-normal text-slate-500">{userEmail}</p>
            )}
          </DropdownMenuLabel>

          <DropdownMenuItem asChild className={menuItemClass}>
            <Link to="/admin/index" className="flex w-full items-center gap-2">
              <LayoutDashboard className={menuIconClass} aria-hidden />
              Dashboard
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className={menuItemClass}>
            <Link to="/admin/user-profile" className="flex w-full items-center gap-2">
              <Settings className={menuIconClass} aria-hidden />
              Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className={menuItemClass}>
            <Link to="/admin/user-profile" className="flex w-full items-center gap-2">
              <User className={menuIconClass} aria-hidden />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="group text-red-600 focus:bg-red-50 focus:text-red-700"
            onSelect={handleLogout}
          >
            <LogOut
              className="h-4 w-4 shrink-0 text-red-500 group-focus:text-red-600"
              aria-hidden
            />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default AdminNavbar;
