import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { useTransactions } from "@/hooks/usePortfolio";
import { useState } from "react";
import { X, ExternalLink, Copy, Check, ArrowUpRight, ArrowDownLeft, Repeat, Sparkles, ArrowLeftRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ParsedTransaction } from "@/lib/helius";

function humanizeType(tx: any, walletAddress: string): { label: string; Icon: any } {
  const type = (tx.type || "").toUpperCase();
  const isOutgoing = tx.nativeTransfers?.[0]?.fromUserAccount === walletAddress;
  if (type === "SWAP") return { label: "Swap", Icon: Repeat };
  if (type.includes("TRANSFER")) return isOutgoing ? { label: "Sent", Icon: ArrowUpRight } : { label: "Received", Icon: ArrowDownLeft };
  if (type.includes("MINT")) return { label: "Mint", Icon: Sparkles };
  return { label: tx.type?.replace(/_/g, " ") || "Transaction", Icon: ArrowLeftRight };
}

function humanize(tx: any, walletAddress: string): string {
  if (tx.description && tx.description.length < 60) return tx.description;
  const type = (tx.type || "").toUpperCase();
  const sol = tx.nativeTransfers?.find((t: any) => t.amount > 0);
  if (sol) {
    const amt = (sol.amount / 1e9).toFixed(2);
    return sol.fromUserAccount === walletAddress ? `You sent ${amt} SOL` : `You received ${amt} SOL`;
  }
  if (type === "SWAP") return "You swapped tokens";
  if (type.includes("MINT")) return "You minted an NFT";
  return "Transaction processed";
}

function TransactionDetail({ tx, onClose }: { tx: ParsedTransaction; onClose: () => void }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const copy = (text: string, field: string) => { navigator.clipboard.writeText(text); setCopiedField(field); setTimeout(() => setCopiedField(null), 2000); };
  const date = tx.timestamp ? new Date(tx.timestamp * 1000) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="glass-card w-full max-w-md p-6 space-y-5 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Transaction Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-muted/20 transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        {tx.description && <p className="text-sm text-muted-foreground leading-relaxed">{tx.description}</p>}
        <div className="space-y-0">
          {[
            { label: "Signature", value: tx.signature },
            { label: "Fee Payer", value: tx.feePayer },
          ].filter(f => f.value).map((f) => (
            <div key={f.label} className="flex items-center justify-between py-2.5 border-b border-border/20">
              <span className="text-[11px] text-muted-foreground">{f.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-foreground truncate max-w-[180px]">{f.value}</span>
                <button onClick={() => copy(f.value!, f.label)} className="p-1 rounded-lg hover:bg-muted/20">
                  {copiedField === f.label ? <Check className="w-3 h-3 text-[hsl(var(--chart-green))]" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between py-2.5 border-b border-border/20">
            <span className="text-[11px] text-muted-foreground">Fee</span>
            <span className="text-[11px] text-foreground">{tx.fee} SOL</span>
          </div>
          {date && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[11px] text-muted-foreground">Date</span>
              <span className="text-[11px] text-foreground">{date.toLocaleString()}</span>
            </div>
          )}
        </div>
        <a href={`https://solscan.io/tx/${tx.signature}`} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-muted/15 text-sm font-medium text-foreground hover:bg-muted/25 transition-colors">
          View on Explorer <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </motion.div>
    </motion.div>
  );
}

export default function Transactions() {
  const navigate = useNavigate();
  const { activeWalletAddress } = useAppStore();
  const { data: txData, isLoading } = useTransactions(activeWalletAddress);
  const [selected, setSelected] = useState<ParsedTransaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  if (!activeWalletAddress) {
    return (
      <div className="page-container min-h-[60vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto">
            <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Your Activity</h3>
          <p className="text-sm text-muted-foreground">Scan a wallet to see what's been happening.</p>
          <button onClick={() => navigate("/dashboard")} className="px-4 py-2 rounded-xl monarch-gradient text-primary-foreground text-sm font-medium">Check Health</button>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page-container max-w-2xl mx-auto space-y-3">
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}
      </div>
    );
  }

  const transactions = Array.isArray(txData) ? txData : [];
  const types = ["all", ...new Set(transactions.map((tx: any) => tx.type).filter(Boolean))];
  const filtered = typeFilter === "all" ? transactions : transactions.filter((tx: any) => tx.type === typeFilter);

  // Group by date
  const grouped = filtered.reduce((acc: Record<string, any[]>, tx: any) => {
    const date = tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : "Unknown";
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {});

  return (
    <div className="page-container max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Your Activity</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">{transactions.length} recent transactions</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {types.slice(0, 5).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-xl text-[12px] font-medium capitalize transition-colors ${
                typeFilter === t ? "bg-primary/15 text-primary border border-primary/20" : "bg-muted/15 text-muted-foreground hover:text-foreground border border-transparent"
              }`}>
              {t === "all" ? "Everything" : t.toLowerCase().replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {/* Timeline — grouped by date */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">{date}</p>
              <div className="space-y-1">
                {(txs as any[]).map((tx: any, i: number) => {
                  const { label, Icon } = humanizeType(tx, activeWalletAddress || "");
                  const desc = humanize(tx, activeWalletAddress || "");
                  const time = tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "";
                  return (
                    <motion.button key={tx.signature || i}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.01 }}
                      onClick={() => setSelected(tx)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/10 transition-colors text-left glass-card">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted/15 text-muted-foreground flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{desc}</p>
                        <p className="text-[10px] text-muted-foreground/40 mt-0.5">{label} · {time}</p>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/30 -rotate-90 flex-shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-12">No activity found.</p>}
        </div>
      </motion.div>
      <AnimatePresence>{selected && <TransactionDetail tx={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </div>
  );
}
