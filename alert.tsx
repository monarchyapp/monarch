import { ReactNode, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { CommandPalette } from "@/components/CommandPalette";
import { useAppStore } from "@/stores/appStore";
import { useAuth } from "@/contexts/AuthContext";
import monarchLogo from "@/assets/monarch-logo.png";
import { Heart, Target, Coins, MessageCircle, BookOpen, Search, User, Settings, LogOut, RefreshCw, Copy, Check } from "lucide-react";
import { CryptoWizard } from "@/components/CryptoWizard";

const tabs = [
  { label: "Health", icon: Heart, path: "/dashboard" },
  { label: "Plan", icon: Target, path: "/plan" },
  { label: "Assets", icon: Coins, path: "/tokens" },
  { label: "Coach", icon: MessageCircle, path: "/coach" },
  { label: "Learn", icon: BookOpen, path: "/learn" },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeWalletAddress, setActiveWalletAddress } = useAppStore();
  const { user, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const truncated = activeWalletAddress ? `${activeWalletAddress.slice(0, 4)}…${activeWalletAddress.slice(-4)}` : null;

  const handleCopy = () => {
    if (!activeWalletAddress) return;
    navigator.clipboard.writeText(activeWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
  }, []);

  useEffect(() => { window.addEventListener("keydown", handleKeyDown); return () => window.removeEventListener("keydown", handleKeyDown); }, [handleKeyDown]);
  useEffect(() => {
    const h = (e: MouseEvent) => { const el = document.getElementById("profile-menu"); if (el && !el.contains(e.target as Node)) setProfileOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const isActive = (path: string) => path === "/dashboard" ? location.pathname === "/dashboard" : location.pathname.startsWith(path);

  return (
    <div className="flex flex-col min-h-screen w-full bg-background relative">
      <div className="absolute inset-0 noise-texture pointer-events-none" />

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/40 backdrop-blur-2xl border-b border-border/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-12 flex items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 rounded-lg overflow-hidden">
                <img src={monarchLogo} alt="Monarch" className="w-full h-full object-cover" />
              </div>
              <span className="text-[13px] font-extrabold text-foreground tracking-tight hidden sm:block">Monarch</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors">
                <Search className="w-3 h-3" />
                <kbd className="hidden sm:inline text-[9px] font-mono bg-muted/20 px-1 py-0.5 rounded">⌘K</kbd>
              </button>

              {truncated && (
                <button onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-muted/10 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono">
                  {truncated} {copied ? <Check className="w-2.5 h-2.5 text-success" /> : <Copy className="w-2.5 h-2.5" />}
                </button>
              )}

              <div className="relative" id="profile-menu">
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="w-7 h-7 rounded-full monarch-gradient flex items-center justify-center text-primary-foreground text-[10px] font-bold hover:shadow-[0_0_12px_hsl(28_100%_55%_/_0.2)] transition-shadow">
                  {user?.email?.[0]?.toUpperCase() || "M"}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-10 w-44 rounded-xl bg-card/90 backdrop-blur-xl border border-border/20 shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 border-b border-border/10 mb-0.5">
                      <p className="text-[11px] font-semibold text-foreground truncate">{user?.email || "Wallet User"}</p>
                      {truncated && <p className="text-[9px] text-muted-foreground font-mono">{truncated}</p>}
                    </div>
                    <button onClick={() => { navigate("/account"); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-muted/10 transition-colors">
                      <User className="w-3 h-3 text-muted-foreground" /> Account
                    </button>
                    <button onClick={() => { navigate("/settings"); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-muted/10 transition-colors">
                      <Settings className="w-3 h-3 text-muted-foreground" /> Settings
                    </button>
                    <div className="border-t border-border/10 mt-0.5 pt-0.5">
                      {activeWalletAddress && (
                        <button onClick={() => { setActiveWalletAddress(null); setProfileOpen(false); navigate("/"); }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-foreground hover:bg-muted/10 transition-colors">
                          <RefreshCw className="w-3 h-3 text-muted-foreground" /> Change Wallet
                        </button>
                      )}
                      <button onClick={() => { signOut(); setActiveWalletAddress(null); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-destructive hover:bg-destructive/6 transition-colors">
                        <LogOut className="w-3 h-3" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-0.5 -mb-px">
            {tabs.map(tab => {
              const active = isActive(tab.path);
              return (
                <button key={tab.path} onClick={() => navigate(tab.path)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-medium transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {active && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-2 right-2 h-[1.5px] rounded-full bg-primary"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.main key={location.pathname}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 pb-20 md:pb-6 relative z-10">
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden">
        <div className="mx-3 mb-3 rounded-2xl bg-card/80 backdrop-blur-2xl border border-border/15 shadow-2xl shadow-background/60 px-1 py-0.5 flex items-center justify-around">
          {tabs.map(tab => {
            const active = isActive(tab.path);
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl transition-colors relative ${active ? "text-primary" : "text-muted-foreground"}`}>
                {active && <motion.div layoutId="mobile-active" className="absolute inset-0 bg-primary/6 rounded-xl" transition={{ type: "spring", bounce: 0.15, duration: 0.4 }} />}
                <tab.icon className="w-4.5 h-4.5 relative z-10" />
                <span className="text-[8px] font-medium relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      <CryptoWizard />
    </div>
  );
}
