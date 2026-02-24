import { Bell, Copy, Check, Search, User, Settings, LogOut, RefreshCw } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function TopBar({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const { activeWalletAddress, setActiveWalletAddress } = useAppStore();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const truncated = activeWalletAddress
    ? `${activeWalletAddress.slice(0, 4)}...${activeWalletAddress.slice(-4)}`
    : null;

  const handleCopy = () => {
    if (!activeWalletAddress) return;
    navigator.clipboard.writeText(activeWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Search */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-sm"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline text-[10px] font-mono bg-muted/50 px-1.5 py-0.5 rounded-md ml-2">⌘K</kbd>
      </button>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
          <Bell className="w-[18px] h-[18px]" />
        </button>

        {truncated && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-mono text-xs">{truncated}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Profile avatar — clickable dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-8 h-8 rounded-full monarch-gradient flex items-center justify-center text-primary-foreground text-xs font-bold hover:shadow-[0_0_16px_hsl(24_95%_53%_/_0.4)] transition-shadow"
          >
            {user?.email?.[0]?.toUpperCase() || "M"}
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-11 w-52 rounded-xl bg-card border border-border shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-border mb-1">
                <p className="text-xs font-semibold text-foreground truncate">{user?.email || "Wallet User"}</p>
                {truncated && <p className="text-[10px] text-muted-foreground font-mono">{truncated}</p>}
              </div>
              <button onClick={() => { navigate("/account"); setProfileOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/30 transition-colors">
                <User className="w-4 h-4 text-muted-foreground" /> Account
              </button>
              <button onClick={() => { navigate("/settings"); setProfileOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/30 transition-colors">
                <Settings className="w-4 h-4 text-muted-foreground" /> Settings
              </button>
              <div className="border-t border-border mt-1 pt-1">
                {activeWalletAddress && (
                  <button onClick={() => { setActiveWalletAddress(null); setProfileOpen(false); navigate("/"); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-muted/30 transition-colors">
                    <RefreshCw className="w-4 h-4 text-muted-foreground" /> Change Wallet
                  </button>
                )}
                <button onClick={() => { signOut(); setActiveWalletAddress(null); setProfileOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
