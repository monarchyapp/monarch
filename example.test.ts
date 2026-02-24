import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { usePortfolio, useTransactions } from "@/hooks/usePortfolio";
import { useNavigate } from "react-router-dom";
import monarchLogo from "@/assets/monarch-logo.png";
import { ChevronRight, Target, Shield, TrendingUp, AlertTriangle, Lightbulb, Heart, MessageCircle } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };

const DAILY_TIPS = [
  { text: "Holding stablecoins protects you when the market drops. Even 10% in USDC makes a big difference.", icon: Shield },
  { text: "Trading too often eats returns. Each swap has a fee. Trade with purpose, not impulse.", icon: TrendingUp },
  { text: "If 80%+ is in one token, a 50% drop means losing 40% of everything.", icon: AlertTriangle },
  { text: "Never interact with tokens you didn't buy. They could be scam dust.", icon: Shield },
  { text: "Check your health score weekly. Small improvements compound.", icon: Heart },
];

function getInsights(tokens: any[], totalValue: number, txCount: number) {
  const insights: { text: string; type: "info" | "warning" | "tip"; action?: string; path?: string }[] = [];
  if (tokens.length === 0) return insights;
  const top = tokens[0];
  const topPct = totalValue > 0 ? ((top?.usdValue || 0) / totalValue * 100) : 0;

  if (topPct > 70) insights.push({ text: `You're ${topPct.toFixed(0)}% in ${top?.symbol}. A 20% drop wipes ~${(topPct * 0.2).toFixed(0)}% of your wallet.`, type: "warning", action: "See plan", path: "/plan" });
  else if (topPct > 40) insights.push({ text: `${top?.symbol} is ${topPct.toFixed(0)}% of your portfolio. Worth monitoring.`, type: "info" });

  const stables = ["USDC", "USDT", "PYUSD", "USDH", "DAI"];
  const stablePct = tokens.filter(t => stables.includes(t.symbol?.toUpperCase())).reduce((s, t) => s + (t.usdValue || 0), 0) / (totalValue || 1) * 100;
  if (stablePct === 0) insights.push({ text: "Zero stablecoins. When the market crashes, everything drops together.", type: "warning" });
  else if (stablePct < 10) insights.push({ text: `Only ${stablePct.toFixed(1)}% in stablecoins. A 10–20% buffer helps.`, type: "tip" });
  else insights.push({ text: `${stablePct.toFixed(0)}% in stablecoins. Smart safety net.`, type: "info" });

  if (txCount > 15) insights.push({ text: `${txCount} recent transactions. Fees add up. Trade with purpose.`, type: "warning" });
  else if (txCount > 0) insights.push({ text: `${txCount} recent transactions — healthy activity.`, type: "info" });

  if (tokens.length >= 5) insights.push({ text: `${tokens.length} different tokens. Solid diversification.`, type: "info" });
  else if (tokens.length < 3) insights.push({ text: `Only ${tokens.length} token${tokens.length === 1 ? "" : "s"}. More variety reduces risk.`, type: "tip", action: "Learn more", path: "/learn" });

  return insights;
}

function TypedText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => { const t = setTimeout(() => setStarted(true), delay); return () => clearTimeout(t); }, [delay]);
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const iv = setInterval(() => { if (i < text.length) { setShown(text.slice(0, i + 1)); i++; } else clearInterval(iv); }, 10);
    return () => clearInterval(iv);
  }, [started, text]);

  if (!started) return null;
  return <>{shown}<motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-0.5 h-3 bg-foreground/40 ml-0.5 align-text-bottom" /></>;
}

const ACTIONS = [
  { label: "Explain my score", icon: Heart, path: "/dashboard" },
  { label: "What should I do?", icon: Target, path: "/plan" },
  { label: "Is this risky?", icon: AlertTriangle, path: "/tokens" },
  { label: "Learn something", icon: Lightbulb, path: "/learn" },
];

export default function Coach() {
  const navigate = useNavigate();
  const { activeWalletAddress } = useAppStore();
  const { data: portfolio } = usePortfolio(activeWalletAddress);
  const { data: txData } = useTransactions(activeWalletAddress);

  const tokens = portfolio?.tokens || [];
  const totalVal = portfolio?.totalValue || 0;
  const txCount = Array.isArray(txData) ? txData.length : 0;
  const insights = useMemo(() => getInsights(tokens, totalVal, txCount), [tokens, totalVal, txCount]);
  const tip = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];

  if (!activeWalletAddress) {
    return (
      <div className="page-container min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm space-y-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden mx-auto shadow-lg shadow-primary/12">
            <img src={monarchLogo} alt="Coach" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-lg font-extrabold text-foreground">Monarch Coach</h3>
          <p className="text-sm text-muted-foreground">Scan a wallet to get personalized guidance.</p>
          <button onClick={() => navigate("/dashboard")} className="px-5 py-2.5 rounded-full monarch-gradient text-primary-foreground text-sm font-bold btn-magnetic">Check Health</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-2xl mx-auto">
      <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }} className="space-y-5">

        <motion.div variants={fadeUp}>
          <h1 className="text-lg font-extrabold text-foreground">Coach</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Your personal crypto advisor</p>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
          {ACTIONS.map(a => (
            <button key={a.label} onClick={() => navigate(a.path)}
              className="glass-card p-3.5 flex items-center gap-2.5 text-left hover:border-primary/8 transition-all group">
              <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:scale-105 transition-all">
                <a.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[12px] font-semibold text-foreground">{a.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Daily tip */}
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 monarch-gradient opacity-[0.04]" />
          <div className="relative p-5 border border-primary/6 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg monarch-gradient flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/12">
                <tip.icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] text-primary font-bold uppercase tracking-[0.12em] mb-1.5">Daily Tip</p>
                <p className="text-[13px] text-foreground leading-relaxed font-medium">{tip.text}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Insights */}
        <motion.div variants={fadeUp} className="space-y-2.5">
          <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-[0.12em] flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-primary" /> What I see
          </p>
          <div className="space-y-2">
            {insights.map((ins, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8, x: -4 }} animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.4, ease }} className="flex items-start gap-2.5">
                <motion.div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 mt-0.5 shadow-sm"
                  animate={{ y: [0, -1, 0] }} transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}>
                  <img src={monarchLogo} alt="" className="w-full h-full object-cover" />
                </motion.div>
                <div className={`flex-1 rounded-xl rounded-tl-sm p-3.5 ${
                  ins.type === "warning" ? "bg-gradient-to-br from-destructive/5 to-transparent border border-destructive/6"
                  : ins.type === "tip" ? "bg-gradient-to-br from-primary/5 to-transparent border border-primary/6"
                  : "bg-gradient-to-br from-[hsl(var(--chart-green))]/4 to-transparent border border-[hsl(var(--chart-green))]/6"
                }`}>
                  <p className="text-[12px] text-foreground leading-relaxed font-medium">
                    <TypedText text={ins.text} delay={300 + i * 500} />
                  </p>
                  {ins.action && (
                    <button onClick={() => navigate(ins.path!)} className="mt-2 text-[11px] text-primary font-bold flex items-center gap-0.5 hover:gap-1 transition-all">
                      {ins.action} <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + insights.length * 0.12 + 0.5 }}
              className="flex items-center gap-2.5 pl-9">
              <div className="flex gap-1 px-3.5 py-2.5 rounded-xl rounded-tl-sm bg-card/20 border border-border/10">
                {[0,1,2].map(d => (
                  <motion.div key={d} className="w-1 h-1 rounded-full bg-muted-foreground/20"
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: d * 0.2 }} />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
