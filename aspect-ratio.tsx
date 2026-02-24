import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Coins, ArrowLeftRight, BookOpen, User, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/stores/appStore";
import monarchLogo from "@/assets/monarch-logo.png";

const navItems = [
  { label: "Health", icon: Heart, path: "/dashboard" },
  { label: "Assets", icon: Coins, path: "/tokens" },
  { label: "Activity", icon: ArrowLeftRight, path: "/transactions" },
  { label: "Learn", icon: BookOpen, path: "/analytics" },
];

const bottomItems = [
  { label: "Account", icon: User, path: "/account" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed, setActiveWalletAddress } = useAppStore();

  const renderNavItem = (item: typeof navItems[0]) => {
    const isActive = item.path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(item.path);
    return (
      <RouterNavLink
        key={item.path}
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 relative group ${
          isActive ? "text-foreground" : "text-sidebar-foreground hover:text-foreground hover:bg-muted/15"
        } ${sidebarCollapsed ? "justify-center" : ""}`}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 bg-muted/25 rounded-xl border border-border/30"
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
          />
        )}
        <item.icon className="w-[17px] h-[17px] relative z-10 flex-shrink-0" />
        {!sidebarCollapsed && <span className="relative z-10">{item.label}</span>}
      </RouterNavLink>
    );
  };

  return (
    <motion.aside
      initial={{ x: -12, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${sidebarCollapsed ? "w-[68px]" : "w-[200px]"}`}
    >
      <button
        onClick={() => navigate("/")}
        className={`flex items-center gap-3 p-4 mb-2 hover:opacity-80 transition-opacity ${sidebarCollapsed ? "justify-center" : ""}`}
      >
        <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
          <img src={monarchLogo} alt="Monarch" className="w-full h-full object-cover" />
        </div>
        {!sidebarCollapsed && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-bold text-foreground tracking-tight">
            Monarch
          </motion.span>
        )}
      </button>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(renderNavItem)}
      </nav>

      <div className="px-3 pb-3 space-y-0.5">
        {bottomItems.map(renderNavItem)}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-muted/15 transition-colors ${sidebarCollapsed ? "justify-center" : ""}`}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
        <button
          onClick={() => { signOut(); setActiveWalletAddress(null); }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ${sidebarCollapsed ? "justify-center" : ""}`}
        >
          <LogOut className="w-4 h-4" />
          {!sidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
