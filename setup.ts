import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { useMultiPortfolio } from "@/hooks/useMultiPortfolio";
import { useTransactions } from "@/hooks/usePortfolio";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import confetti from "canvas-confetti";
import {
  Search, ArrowRight, Shield, Lightbulb, Heart, Target,
  Sparkles, RefreshCw, Clock, ChevronRight, ChevronDown,
  Share2, Play, TrendingUp, Droplets, PieChart, Plus, X, Wallet, Activity, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
const WALLET_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const DEMO_WALLET = "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg";

function computeHealth(tokens: any[], totalValue: number, txCount: number) {
  if (totalValue === 0) return { score: 0, factors: [] as any[] };
  let score = 50;
  const factors: { label: string; status: "good" | "warn" | "bad"; tip: string; fix?: string; metric?: number; icon: any }[] = [];

  const topPct = tokens.length > 0 ? Math.max(...tokens.map(t => (t.usdValue || 0) / totalValue * 100)) : 100;
  if (topPct < 40) { score += 20; factors.push({ label: "Well diversified", status: "good", tip: "No single token dominates.", metric: topPct, icon: PieChart }); }
  else if (topPct < 70) { score += 5; factors.push({ label: "Somewhat concentrated", status: "warn", tip: `Top token is ${topPct.toFixed(0)}%.`, fix: "Spread across more assets", metric: topPct, icon: PieChart }); }
  else { score -= 15; factors.push({ label: "Heavily concentrated", status: "bad", tip: `${topPct.toFixed(0)}% in one token.`, fix: "Diversify into other tokens", metric: topPct, icon: PieChart }); }

  if (tokens.length >= 5) { score += 15; factors.push({ label: "Good variety", status: "good", tip: `${tokens.length} different tokens.`, metric: tokens.length, icon: BarChart3 }); }
  else if (tokens.length >= 2) { score += 5; factors.push({ label: "Limited variety", status: "warn", tip: `Only ${tokens.length} tokens.`, fix: "Add different asset types", metric: tokens.length, icon: BarChart3 }); }
  else { factors.push({ label: "Single asset", status: "bad", tip: "All eggs in one basket.", fix: "Add 2–3 different tokens", metric: tokens.length, icon: BarChart3 }); }

  const stables = ["USDC", "USDT", "PYUSD", "USDH", "DAI"];
  const stablePct = tokens.filter(t => stables.includes(t.symbol?.toUpperCase())).reduce((s, t) => s + (t.usdValue || 0), 0) / (totalValue || 1) * 100;
  if (stablePct >= 10) { score += 15; factors.push({ label: "Stablecoin buffer", status: "good", tip: `${stablePct.toFixed(0)}% in stablecoins.`, metric: stablePct, icon: Droplets }); }
  else if (stablePct > 0) { score += 5; factors.push({ label: "Low buffer", status: "warn", tip: `Only ${stablePct.toFixed(1)}% in stablecoins.`, fix: "Hold 10–20% in USDC", metric: stablePct, icon: Droplets }); }
  else { factors.push({ label: "No safety net", status: "bad", tip: "Zero stablecoins.", fix: "Add USDC or USDT", metric: 0, icon: Droplets }); }

  if (txCount > 15) { score -= 5; factors.push({ label: "High activity", status: "warn", tip: `${txCount} recent txs.`, fix: "Trade less frequently", metric: txCount, icon: Activity }); }
  else if (txCount > 0) { score += 5; factors.push({ label: "Moderate activity", status: "good", tip: "Healthy trading frequency.", metric: txCount, icon: Activity }); }

  return { score: Math.min(100, Math.max(0, score)), factors };
}

// Animated health ring
function HealthRing({ score, animate }: { score: number; animate: boolean }) {
  const color = score >= 70 ? "hsl(var(--chart-green))" : score >= 40 ? "hsl(var(--chart-orange))" : "hsl(var(--chart-red))";
  const label = score >= 70 ? "Looking good" : score >= 40 ? "Room to improve" : "Needs attention";
  const c = 2 * Math.PI * 50;
  const offset = c - (score / 100) * c;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-44 h-44">
        <motion.div className="absolute inset-0 rounded-full blur-[50px]"
          style={{ background: `radial-gradient(circle, ${color.replace(")", " / 0.15)")}, transparent 70%)` }}
          initial={{ opacity: 0 }} animate={{ opacity: animate ? 1 : 0 }} transition={{ delay: 1, duration: 1 }} />

        <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="50" fill="none" stroke="hsl(var(--border))" strokeWidth="4" opacity="0.06" />
          <motion.circle cx="56" cy="56" r="50" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: animate ? offset : c }}
            transition={{ duration: 2.5, ease, delay: 0.4 }} />
        </svg>

        <motion.div className="absolute inset-0 flex flex-col items-center justify-center z-10"
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: animate ? 1 : 0, scale: animate ? 1 : 0.5 }}
          transition={{ delay: 1.2, duration: 0.6, ease }}>
          <span className="text-5xl font-extrabold text-foreground" style={{ letterSpacing: "-0.06em" }}>{score}</span>
          <span className="text-[10px] text-muted-foreground/40 font-semibold">/ 100</span>
        </motion.div>
      </div>
      <motion.p className="text-sm font-bold" style={{ color }}
        initial={{ opacity: 0 }} animate={{ opacity: animate ? 1 : 0 }} transition={{ delay: 1.6 }}>
        {label}
      </motion.p>
    </div>
  );
}

// Risk breakdown panels
function RiskPanel({ factor, index, expanded, onToggle }: { factor: any; index: number; expanded: boolean; onToggle: () => void }) {
  const sc = factor.status === "good" ? "chart-green" : factor.status === "warn" ? "chart-orange" : "chart-red";
  const Icon = factor.icon;

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.06 }}
      onClick={onToggle} className={`glass-card overflow-hidden cursor-pointer transition-all duration-300 ${expanded ? `border-[hsl(var(--${sc}))]/12` : "hover:border-border/30"}`}>
      <div className="p-4 flex items-center gap-3.5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[hsl(var(--${sc}))]/8`}>
          <Icon className={`w-4.5 h-4.5 text-[hsl(var(--${sc}))]`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground">{factor.label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{factor.tip}</p>
        </div>
        <div className={`w-2 h-2 rounded-full bg-[hsl(var(--${sc}))] flex-shrink-0`} />
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }} className="border-t border-border/10">
            <div className="p-4 space-y-3">
              <div className="h-1.5 bg-muted/8 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(factor.metric || 0, 100)}%` }}
                  transition={{ duration: 0.8, ease }} className={`h-full rounded-full bg-[hsl(var(--${sc}))]`} />
              </div>
              <p className="text-[12px] text-foreground/70 leading-relaxed">{factor.tip}</p>
              {factor.fix && (
                <div className="flex items-center gap-1.5 text-[11px] text-primary font-semibold">
                  <Lightbulb className="w-3 h-3" /> {factor.fix}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Scan reveal animation
function ScanReveal({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const msgs = ["Checking concentration…", "Checking stablecoin buffer…", "Reviewing activity…", "Detecting dust…", "Calculating health score…"];

  useEffect(() => {
    const timers = msgs.map((_, i) => setTimeout(() => { if (i < msgs.length - 1) setStep(i + 1); else onComplete(); }, 600 + i * 450));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="page-container min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-8">
        <motion.div className="w-16 h-16 mx-auto rounded-2xl monarch-gradient flex items-center justify-center shadow-2xl shadow-primary/20"
          animate={{ scale: [1, 1.04, 1] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
          <Heart className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <div className="h-6">
          <AnimatePresence mode="wait">
            <motion.p key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="text-sm font-semibold text-muted-foreground">{msgs[Math.min(step, msgs.length - 1)]}</motion.p>
          </AnimatePresence>
        </div>
        <div className="w-48 h-1 bg-muted/6 rounded-full mx-auto overflow-hidden">
          <motion.div className="h-full rounded-full monarch-gradient" initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / msgs.length) * 100}%` }} transition={{ duration: 0.3, ease: "easeOut" }} />
        </div>
      </div>
    </div>
  );
}

// Empty state — wallet input
function EmptyDashboard() {
  const { setActiveWalletAddress, addWallet } = useAppStore();
  const [wallets, setWallets] = useState<string[]>([""]);
  const navigate = useNavigate();

  const handleAdd = () => { if (wallets.length < 5) setWallets([...wallets, ""]); };
  const handleRemove = (i: number) => { if (wallets.length > 1) setWallets(wallets.filter((_, idx) => idx !== i)); };
  const handleChange = (i: number, v: string) => { const u = [...wallets]; u[i] = v; setWallets(u); };
  const valid = wallets.filter(w => WALLET_REGEX.test(w.trim()));

  const handleScan = () => {
    if (valid.length === 0) return;
    setActiveWalletAddress(valid[0]);
    valid.slice(1).forEach(w => addWallet(w));
  };

  return (
    <div className="page-container min-h-[80vh] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}
        className="max-w-md w-full text-center space-y-8">
        <div className="space-y-5">
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.3 }}
            className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-2xl monarch-gradient opacity-15 blur-2xl" />
            <div className="relative w-20 h-20 rounded-2xl monarch-gradient flex items-center justify-center shadow-2xl shadow-primary/20">
              <Search className="w-8 h-8 text-primary-foreground" />
            </div>
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-foreground">Check your crypto health</h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Paste one or more Solana wallets for a combined health score.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {wallets.map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="relative group">
              <div className="absolute -inset-[1.5px] rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
                style={{ background: "linear-gradient(90deg, transparent, hsl(28 100% 55% / 0.25), transparent)", backgroundSize: "200% 100%", animation: "shimmer 2.5s linear infinite" }} />
              <div className="relative flex items-center bg-card/50 border border-border/20 rounded-xl p-1.5 group-focus-within:border-primary/10 transition-all backdrop-blur-xl">
                <div className="ml-2 mr-1 w-6 h-6 rounded-lg bg-muted/8 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-3 h-3 text-muted-foreground/30" />
                </div>
                <input value={w} onChange={e => handleChange(i, e.target.value)} onKeyDown={e => e.key === "Enter" && handleScan()}
                  placeholder={i === 0 ? "Paste primary wallet" : `Wallet ${i + 1} (optional)`}
                  className="flex-1 bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/25 focus:outline-none font-medium" />
                {wallets.length > 1 && (
                  <button onClick={() => handleRemove(i)} className="p-1.5 text-muted-foreground/20 hover:text-destructive transition-colors mr-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {i === 0 && WALLET_REGEX.test(w.trim()) && <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--chart-green))] mr-2.5 flex-shrink-0" />}
              </div>
            </motion.div>
          ))}

          {wallets.length < 5 && (
            <button onClick={handleAdd} className="mx-auto flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-dashed border-border/20 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/15 transition-all">
              <Plus className="w-3 h-3" /> Add another wallet
            </button>
          )}

          <button onClick={handleScan} disabled={valid.length === 0}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl monarch-gradient text-primary-foreground text-sm font-bold disabled:opacity-10 btn-magnetic mt-3 shadow-lg shadow-primary/20">
            Scan {valid.length > 1 ? `${valid.length} wallets` : "wallet"} <ArrowRight className="w-4 h-4" />
          </button>

          <button onClick={() => { setActiveWalletAddress(DEMO_WALLET); }}
            className="group mx-auto flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/15 bg-card/20 hover:bg-card/40 transition-all">
            <Play className="w-3 h-3 text-primary" />
            <span className="text-[12px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Try demo</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-5">
          {[{ icon: Shield, t: "Read-only" }, { icon: Shield, t: "No transfers" }].map((b, i) => (
            <span key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground/20 font-semibold"><b.icon className="w-3 h-3" /> {b.t}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Wallet pills for multi-wallet
function WalletPills() {
  const { activeWalletAddress, additionalWallets, removeWallet, addWallet } = useAppStore();
  const [adding, setAdding] = useState(false);
  const [addr, setAddr] = useState("");
  const all = activeWalletAddress ? [activeWalletAddress, ...additionalWallets] : [];
  if (all.length <= 1) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-1.5 mt-2">
      {all.map((w, i) => (
        <div key={w} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/6 border border-border/10 text-[10px] font-mono text-muted-foreground">
          <Wallet className="w-2.5 h-2.5 text-primary/50" />
          {w.slice(0, 4)}…{w.slice(-4)}
          {i > 0 && <button onClick={() => removeWallet(w)} className="ml-0.5 text-muted-foreground/20 hover:text-destructive"><X className="w-2.5 h-2.5" /></button>}
        </div>
      ))}
      {!adding && all.length < 5 && (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1 px-2 py-1 rounded-full border border-dashed border-border/15 text-[10px] text-muted-foreground/30 hover:text-foreground transition-all">
          <Plus className="w-2.5 h-2.5" /> Add
        </button>
      )}
      {adding && (
        <div className="flex items-center gap-1">
          <input value={addr} onChange={e => setAddr(e.target.value)} onKeyDown={e => e.key === "Enter" && WALLET_REGEX.test(addr.trim()) && (addWallet(addr.trim()), setAddr(""), setAdding(false))}
            placeholder="Address" autoFocus className="w-28 bg-muted/6 border border-border/15 rounded-full px-2.5 py-1 text-[10px] text-foreground focus:outline-none" />
          <button onClick={() => { setAdding(false); setAddr(""); }} className="text-muted-foreground/30 hover:text-foreground"><X className="w-3 h-3" /></button>
        </div>
      )}
    </motion.div>
  );
}

// Share card modal
function ShareCard({ score, factors, onClose }: { score: number; factors: any[]; onClose: () => void }) {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f97316" : "#ef4444";
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-xs glass-orb rounded-3xl p-6 space-y-4 text-center" onClick={e => e.stopPropagation()}>
        <p className="text-5xl font-extrabold" style={{ color }}>{score}</p>
        <p className="text-sm font-bold text-foreground">{score >= 70 ? "Looking good" : score >= 40 ? "Room to improve" : "Needs attention"}</p>
        <div className="space-y-1.5">
          {factors.slice(0, 3).map((f: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <div className={`w-1.5 h-1.5 rounded-full ${f.status === "good" ? "bg-[hsl(var(--chart-green))]" : f.status === "warn" ? "bg-[hsl(var(--chart-orange))]" : "bg-[hsl(var(--chart-red))]"}`} />
              {f.label}
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-center pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-muted/10 text-sm font-medium text-foreground">Close</button>
          <button className="px-4 py-2 rounded-lg monarch-gradient text-primary-foreground text-sm font-bold flex items-center gap-1 btn-magnetic">
            <Share2 className="w-3 h-3" /> Share
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Allocation visualization
function AllocationRing({ tokens, totalValue }: { tokens: any[]; totalValue: number }) {
  if (tokens.length === 0 || totalValue === 0) return null;
  const top5 = tokens.slice(0, 5);
  const colors = ["hsl(var(--primary))", "hsl(var(--chart-green))", "hsl(var(--chart-blue))", "hsl(var(--chart-purple))", "hsl(var(--chart-cyan))"];
  let cumulative = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width="56" height="56" viewBox="0 0 56 56" className="flex-shrink-0">
        {top5.map((t: any, i: number) => {
          const pct = (t.usdValue || 0) / totalValue;
          const start = cumulative;
          cumulative += pct;
          const r = 22;
          const c = 2 * Math.PI * r;
          return (
            <motion.circle key={i} cx="28" cy="28" r={r} fill="none" stroke={colors[i]} strokeWidth="6"
              strokeDasharray={`${pct * c} ${(1 - pct) * c}`}
              strokeDashoffset={-start * c}
              className="-rotate-90 origin-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
            />
          );
        })}
      </svg>
      <div className="flex-1 space-y-1">
        {top5.map((t: any, i: number) => (
          <div key={i} className="flex items-center gap-2 text-[10px]">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors[i] }} />
            <span className="text-muted-foreground truncate">{t.symbol}</span>
            <span className="text-foreground font-semibold ml-auto">{((t.usdValue || 0) / totalValue * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeWalletAddress, additionalWallets, hideBalances, lastRefresh } = useAppStore();
  const allWallets = activeWalletAddress ? [activeWalletAddress, ...additionalWallets] : [];
  const { data: portfolio, isLoading, refetch, isFetching, isError } = useMultiPortfolio(allWallets);
  const { data: txData } = useTransactions(activeWalletAddress);
  const [expandedFactor, setExpandedFactor] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const totalValue = useAnimatedNumber(portfolio?.totalValue || 0, 1200);
  const lastRefreshTime = activeWalletAddress ? lastRefresh[activeWalletAddress] : undefined;
  const txCount = Array.isArray(txData) ? txData.length : 0;
  const mask = (v: string) => hideBalances ? "••••••" : v;

  const tokens = portfolio?.tokens || [];
  const totalVal = portfolio?.totalValue || 0;
  const { score, factors } = useMemo(() => computeHealth(tokens, totalVal, txCount), [tokens, totalVal, txCount]);

  useEffect(() => { if (portfolio && !revealed && !isLoading) setShowReveal(true); }, [portfolio, revealed, isLoading]);

  const onRevealComplete = useCallback(() => {
    setShowReveal(false); setRevealed(true);
    if (score >= 70) confetti({ particleCount: 80, spread: 60, origin: { y: 0.4 }, colors: ["#f97316", "#22c55e", "#3b82f6"] });
  }, [score]);

  if (!activeWalletAddress) return <EmptyDashboard />;
  if (isLoading || showReveal) {
    if (showReveal) return <ScanReveal onComplete={onRevealComplete} />;
    return (
      <div className="page-container space-y-6 max-w-2xl mx-auto">
        <div className="flex justify-center py-8"><div className="skeleton w-44 h-44 rounded-full" /></div>
        <div className="skeleton h-16 w-full rounded-xl" />
        <div className="skeleton h-40 w-full rounded-xl" />
      </div>
    );
  }
  if (isError || !portfolio) return <EmptyDashboard />;

  const topHoldings = tokens.slice(0, 5);

  return (
    <div className="page-container max-w-2xl mx-auto">
      <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="space-y-6">

        {/* Header */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-extrabold text-foreground">Your Crypto Health</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {allWallets.length > 1 ? `${allWallets.length} wallets combined` : "How safe and balanced you are"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowShare(true)} className="flex items-center gap-1 text-[10px] text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary/5 font-semibold transition-colors">
                <Share2 className="w-3 h-3" /> Share
              </button>
              <button onClick={() => refetch()} disabled={isFetching} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/8 transition-colors">
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
          <WalletPills />
        </motion.div>

        {/* Score + Value */}
        <motion.div variants={fadeUp} className="glass-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 ambient-glow" />
          <div className="relative">
            <HealthRing score={score} animate={revealed} />
            <div className="text-center mt-5 pt-4 border-t border-border/8">
              <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.12em] mb-0.5">Total Value</p>
              <p className="text-xl font-extrabold text-foreground" style={{ letterSpacing: "-0.04em" }}>
                {mask(`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)}
              </p>
              {lastRefreshTime && (
                <p className="text-[9px] text-muted-foreground/20 mt-1 flex items-center justify-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {new Date(lastRefreshTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Allocation + Risk row */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="glass-card p-4">
            <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-[0.12em] mb-3">Allocation</p>
            <AllocationRing tokens={tokens} totalValue={totalVal} />
          </div>
          <div className="glass-card p-4">
            <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-[0.12em] mb-3">Risk Snapshot</p>
            <div className="space-y-2.5">
              {factors.slice(0, 3).map((f, i) => {
                const sc = f.status === "good" ? "chart-green" : f.status === "warn" ? "chart-orange" : "chart-red";
                return (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full bg-[hsl(var(--${sc}))]`} />
                    <span className="text-[11px] text-foreground font-medium flex-1">{f.label}</span>
                    <span className={`text-[10px] font-bold text-[hsl(var(--${sc}))]`}>{f.status === "good" ? "Good" : f.status === "warn" ? "Watch" : "Fix"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Per-wallet breakdown */}
        {allWallets.length > 1 && portfolio.perWallet && (
          <motion.div variants={fadeUp} className="space-y-2">
            <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-[0.12em]">Per Wallet</p>
            {portfolio.perWallet.map((pw: any, i: number) => (
              <div key={pw.wallet || i} className="glass-card p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-muted/6 flex items-center justify-center"><Wallet className="w-3.5 h-3.5 text-muted-foreground/40" /></div>
                  <div>
                    <p className="text-[11px] font-mono text-foreground">{pw.wallet?.slice(0, 6)}…{pw.wallet?.slice(-4)}</p>
                    <p className="text-[9px] text-muted-foreground">{pw.tokenCount} tokens</p>
                  </div>
                </div>
                <p className="text-[13px] font-bold text-foreground">{mask(`$${(pw.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`)}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Breakdown panels */}
        <motion.div variants={fadeUp} className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-[0.12em] mb-2">Detailed Breakdown</p>
          {factors.map((f, i) => (
            <RiskPanel key={f.label} factor={f} index={i} expanded={expandedFactor === f.label}
              onToggle={() => setExpandedFactor(expandedFactor === f.label ? null : f.label)} />
          ))}
        </motion.div>

        {/* Coach nudge */}
        <motion.div variants={fadeUp} className="glass-card p-4 relative overflow-hidden">
          <div className="absolute inset-0 monarch-gradient-subtle" />
          <div className="relative flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg monarch-gradient flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/12">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-primary font-bold uppercase tracking-[0.12em] mb-0.5">Coach</p>
              <p className="text-[12px] text-foreground leading-relaxed font-medium">
                {score >= 70 ? "Solid work. Keep watching concentration risk." : score >= 40 ? `Focus on ${factors.find(f => f.status === "bad" || f.status === "warn")?.label?.toLowerCase() || "improving"}.` : `Start with ${factors.find(f => f.status === "bad")?.label?.toLowerCase() || "diversifying"}.`}
              </p>
            </div>
            <button onClick={() => navigate("/coach")} className="text-[10px] text-primary flex items-center gap-0.5 flex-shrink-0 font-bold hover:text-primary/80 transition-colors">
              More <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Top holdings */}
        {topHoldings.length > 0 && (
          <motion.div variants={fadeUp} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-[0.12em]">Top Holdings</p>
              <button onClick={() => navigate("/tokens")} className="text-[10px] text-primary flex items-center gap-0.5 font-bold">
                All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {topHoldings.map((token: any, i: number) => {
              const pct = totalVal > 0 ? ((token.usdValue || 0) / totalVal * 100) : 0;
              return (
                <motion.button key={token.mint} onClick={() => navigate(`/tokens/${token.mint}`)}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/4 transition-colors text-left">
                  <div className="w-9 h-9 rounded-lg bg-muted/6 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {token.logoURI ? <img src={token.logoURI} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px] font-bold text-muted-foreground">{token.symbol?.[0]}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-bold text-foreground">{token.symbol}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-muted/6 rounded-full overflow-hidden max-w-[60px]">
                        <motion.div className="h-full rounded-full bg-primary/20" initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.6 }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <p className="text-[13px] font-bold text-foreground flex-shrink-0">{mask(`$${(token.usdValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`)}</p>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Next action */}
        {factors.some(f => f.status === "bad" || f.status === "warn") && (
          <motion.div variants={fadeUp}>
            <button onClick={() => navigate("/plan")} className="w-full glass-card p-4 flex items-center gap-3 hover:border-primary/8 transition-all group">
              <div className="w-10 h-10 rounded-lg monarch-gradient flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/12">
                <Target className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[13px] font-bold text-foreground">Fix your {factors.find(f => f.status === "bad")?.label?.toLowerCase() || factors.find(f => f.status === "warn")?.label?.toLowerCase()}</p>
                <p className="text-[11px] text-muted-foreground">See your Fix-It Plan</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </button>
          </motion.div>
        )}

        <motion.div variants={fadeUp} className="flex justify-center pt-2 pb-4">
          <div className="trust-badge"><Shield className="w-3 h-3" /> Read-only · Never requests transfers</div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showShare && <ShareCard score={score} factors={factors} onClose={() => setShowShare(false)} />}
      </AnimatePresence>
    </div>
  );
}
