import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/stores/appStore";
import { useState } from "react";
import { Wallet, Plus, Trash2, Shield, Download, ChevronRight, AlertTriangle, Bell, Eye, EyeOff, User } from "lucide-react";

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function Account() {
  const { user, signOut } = useAuth();
  const { activeWalletAddress, setActiveWalletAddress, hideBalances, setHideBalances } = useAppStore();
  const [newWalletAddr, setNewWalletAddr] = useState("");
  const [newWalletName, setNewWalletName] = useState("");
  const [trackedWallets, setTrackedWallets] = useState(() => {
    const wallets = [];
    if (activeWalletAddress && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(activeWalletAddress)) {
      wallets.push({ address: activeWalletAddress, name: "Main", isActive: true });
    }
    return wallets;
  });

  const addWallet = () => {
    const addr = newWalletAddr.trim();
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)) return;
    if (trackedWallets.some(w => w.address === addr)) return;
    setTrackedWallets([...trackedWallets, { address: addr, name: newWalletName || "Wallet", isActive: false }]);
    setNewWalletAddr("");
    setNewWalletName("");
  };

  const setActive = (addr: string) => {
    setTrackedWallets(trackedWallets.map(w => ({ ...w, isActive: w.address === addr })));
    setActiveWalletAddress(addr);
  };

  const removeWallet = (addr: string) => {
    setTrackedWallets(trackedWallets.filter(w => w.address !== addr));
    if (addr === activeWalletAddress) setActiveWalletAddress(trackedWallets.find(w => w.address !== addr)?.address || null);
  };

  return (
    <div className="page-container ambient-glow">
      <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }} className="space-y-5 max-w-2xl">
        <motion.div variants={item}>
          <h1 className="page-title">Account</h1>
          <p className="text-[12px] text-muted-foreground mt-1">Manage your wallets, preferences, and data</p>
        </motion.div>

        {/* Profile */}
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="section-title mb-4">Profile</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl monarch-gradient flex items-center justify-center text-primary-foreground font-bold text-lg">
              {user?.email?.[0]?.toUpperCase() || "M"}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{user?.email || "Anonymous"}</p>
              <p className="text-[11px] text-muted-foreground">{user ? "Email authenticated" : "No account — scan only"}</p>
            </div>
          </div>
        </motion.div>

        {/* Tracked Wallets */}
        <motion.div variants={item} className="glass-card p-6 space-y-4">
          <h3 className="section-title">Connected Wallets</h3>
          {trackedWallets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No wallets tracked yet.</p>
          ) : (
            <div className="space-y-2">
              {trackedWallets.map((wallet) => (
                <div key={wallet.address} className="flex items-center justify-between py-3 px-3 rounded-xl bg-muted/10 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${wallet.isActive ? "monarch-gradient text-primary-foreground" : "bg-muted/20 text-muted-foreground"}`}>
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{wallet.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!wallet.isActive && (
                      <button onClick={() => setActive(wallet.address)} className="text-[11px] text-primary hover:underline">
                        Activate
                      </button>
                    )}
                    {wallet.isActive && <span className="text-[10px] text-primary font-medium px-2 py-0.5 rounded-full bg-primary/10">Active</span>}
                    {trackedWallets.length > 1 && (
                      <button onClick={() => removeWallet(wallet.address)} className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-border/30">
            <p className="text-[11px] font-medium text-muted-foreground">Add wallet</p>
            <div className="flex gap-2">
              <input value={newWalletName} onChange={(e) => setNewWalletName(e.target.value)} placeholder="Name"
                className="w-24 px-3 py-2 rounded-xl bg-muted/15 text-sm text-foreground placeholder:text-muted-foreground/40 border border-border/30 outline-none focus:ring-1 focus:ring-primary/30" />
              <input value={newWalletAddr} onChange={(e) => setNewWalletAddr(e.target.value)} placeholder="Solana address"
                className="flex-1 px-3 py-2 rounded-xl bg-muted/15 text-sm font-mono text-foreground placeholder:text-muted-foreground/40 border border-border/30 outline-none focus:ring-1 focus:ring-primary/30" />
              <button onClick={addWallet} disabled={newWalletAddr.trim().length < 32}
                className="px-3 py-2 rounded-xl monarch-gradient text-primary-foreground text-sm font-medium disabled:opacity-20 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={item} className="glass-card p-6 space-y-3">
          <h3 className="section-title">Preferences</h3>
          <button onClick={() => setHideBalances(!hideBalances)}
            className="w-full flex items-center justify-between py-3 group">
            <div className="flex items-center gap-3">
              {hideBalances ? <EyeOff className="w-4.5 h-4.5 text-muted-foreground" /> : <Eye className="w-4.5 h-4.5 text-muted-foreground" />}
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Hide Balances</p>
                <p className="text-[11px] text-muted-foreground">{hideBalances ? "Balances are hidden" : "Balances are visible"}</p>
              </div>
            </div>
            <div className={`w-9 h-5 rounded-full transition-colors ${hideBalances ? 'bg-primary' : 'bg-muted/40'} relative`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${hideBalances ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </button>
        </motion.div>

        {/* Data */}
        <motion.div variants={item} className="glass-card p-6 space-y-1">
          <h3 className="section-title mb-3">Data</h3>
          <button className="w-full flex items-center justify-between py-3 group hover:bg-muted/10 rounded-xl px-1 transition-colors">
            <div className="flex items-center gap-3">
              <Download className="w-4.5 h-4.5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Export CSV</p>
                <p className="text-[11px] text-muted-foreground">Download transaction history</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>

        {/* Security */}
        <motion.div variants={item} className="glass-card p-6 space-y-1">
          <h3 className="section-title mb-3">Security</h3>
          <div className="px-1 py-2">
            <div className="trust-badge mb-3">
              <Shield className="w-3 h-3" />
              Read-only access. We never request transfers.
            </div>
          </div>
          <button onClick={signOut} className="w-full flex items-center justify-between py-3 group hover:bg-muted/10 rounded-xl px-1 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-4.5 h-4.5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Sign Out</p>
                <p className="text-[11px] text-muted-foreground">End current session</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={item} className="glass-card p-6 border-destructive/15">
          <button className="w-full flex items-center justify-between py-1 group">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4.5 h-4.5 text-destructive/70" />
              <div className="text-left">
                <p className="text-sm font-medium text-destructive">Delete Account</p>
                <p className="text-[11px] text-muted-foreground">Permanently remove all data</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
