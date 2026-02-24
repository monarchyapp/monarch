import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/stores/appStore";
import { useState, useEffect } from "react";
import { BookOpen, Shield, Zap, Target, AlertTriangle, CheckCircle2, Sparkles, Flame, Trophy, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };

function getStreak(): { count: number; lastDate: string } {
  try { return JSON.parse(localStorage.getItem("monarch-streak") || '{"count":0,"lastDate":""}'); } catch { return { count: 0, lastDate: "" }; }
}

function updateStreak(): number {
  const today = new Date().toDateString();
  const s = getStreak();
  if (s.lastDate === today) return s.count;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const n = s.lastDate === yesterday ? s.count + 1 : 1;
  localStorage.setItem("monarch-streak", JSON.stringify({ count: n, lastDate: today }));
  return n;
}

const LESSONS = [
  { id: "stablecoins", title: "What are stablecoins?", subtitle: "Your safety net", icon: Shield, duration: "30 sec", color: "from-[hsl(var(--chart-green))] to-[hsl(var(--chart-cyan))]",
    steps: [
      { text: "Stablecoins like USDC are designed to always be worth $1. They don't swing like other tokens." },
      { text: "Holding 10–20% in stablecoins gives you a buffer when the market drops." },
      { text: "When markets crash, stablecoins hold value. You can buy dips at a discount." },
    ],
    quiz: { q: "Good stablecoin allocation?", opts: ["0%", "10–20%", "100%"], ans: 1 }, takeaway: "Convert some volatile tokens to USDC for safety.", xp: 20 },
  { id: "diversification", title: "Why diversify?", subtitle: "Don't put all eggs in one basket", icon: Target, duration: "30 sec", color: "from-[hsl(var(--chart-blue))] to-[hsl(var(--chart-purple))]",
    steps: [
      { text: "If 90% is in one token and it drops 50%, you lose almost half of everything." },
      { text: "Spread across different tokens. Aim for no single token above 40%." },
      { text: "Mix types: stablecoins, established tokens, small amount in speculative." },
    ],
    quiz: { q: "Max any single token should be?", opts: ["10%", "40%", "80%"], ans: 1 }, takeaway: "Check your Health score for concentration.", xp: 20 },
  { id: "fees", title: "Trading fees add up", subtitle: "Every swap costs money", icon: Zap, duration: "30 sec", color: "from-[hsl(var(--chart-orange))] to-primary",
    steps: [
      { text: "Every swap pays a small network fee." },
      { text: "10 swaps/day can eat 2–5% of your portfolio per month." },
      { text: "Only trade with a clear reason." },
    ],
    quiz: { q: "What happens trading too often?", opts: ["Get richer", "Fees eat returns", "Nothing"], ans: 1 }, takeaway: "Trade less, save more.", xp: 20 },
  { id: "risk", title: "Understanding risk levels", subtitle: "Low, Medium, High", icon: AlertTriangle, duration: "30 sec", color: "from-[hsl(var(--chart-red))] to-[hsl(var(--chart-orange))]",
    steps: [
      { text: "Low risk: Stablecoins and SOL/ETH. Steady but slower." },
      { text: "Medium risk: Altcoins. Can swing 20–40%." },
      { text: "High risk: Meme tokens. Can 10x or go to zero." },
    ],
    quiz: { q: "Meme tokens are:", opts: ["Low risk", "Medium risk", "High risk"], ans: 2 }, takeaway: "Know what you own and how risky it is.", xp: 20 },
  { id: "scams", title: "How scams look on-chain", subtitle: "Protect yourself", icon: Shield, duration: "40 sec", color: "from-[hsl(var(--chart-purple))] to-[hsl(var(--chart-blue))]",
    steps: [
      { text: "Scammers send random tokens. Never interact with unknown tokens." },
      { text: "No liquidity = can't sell = likely scam." },
      { text: "Never sign transactions you don't understand." },
    ],
    quiz: { q: "Random tokens in your wallet?", opts: ["Sell them", "Ignore them", "Send to friends"], ans: 1 }, takeaway: "If it seems too good to be true, it is.", xp: 25 },
  { id: "mints", title: "What is a token mint?", subtitle: "Token verification", icon: Sparkles, duration: "30 sec", color: "from-primary to-[hsl(var(--chart-orange-light))]",
    steps: [
      { text: "Every token has a unique 'mint address' — its ID." },
      { text: "Scam tokens copy names but have different mints." },
      { text: "Always verify on Solscan before buying." },
    ],
    quiz: { q: "How to verify a token?", opts: ["Trust logo", "Check mint address", "Ask friend"], ans: 1 }, takeaway: "Always verify mint addresses.", xp: 20 },
];

export default function Analytics() {
  const navigate = useNavigate();
  const { activeWalletAddress } = useAppStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [qAnswer, setQAnswer] = useState<number | null>(null);
  const [done, setDone] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("monarch-lessons") || "[]"); } catch { return []; }
  });

  useEffect(() => { updateStreak(); }, []);

  const finish = (id: string) => {
    if (!done.includes(id)) {
      const u = [...done, id];
      setDone(u);
      localStorage.setItem("monarch-lessons", JSON.stringify(u));
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.5 }, colors: ["#f97316", "#fbbf24", "#22c55e"] });
    }
    setExpanded(null); setStep(0); setQAnswer(null);
  };

  const open = (id: string) => { setExpanded(expanded === id ? null : id); setStep(0); setQAnswer(null); };
  const xp = done.length * 20 + (done.includes("scams") ? 5 : 0);
  const streak = getStreak().count;

  return (
    <div className="page-container max-w-2xl mx-auto">
      <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} className="space-y-5">

        <motion.div variants={fadeUp}>
          <h1 className="text-lg font-extrabold text-foreground">Learn</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">30-second lessons to level up</p>
        </motion.div>

        {/* Streak + XP */}
        <motion.div variants={fadeUp} className="glass-card p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Flame className="w-5 h-5 text-primary" />
                </motion.div>
                <span className="text-lg font-extrabold text-foreground">{streak}</span>
                <span className="text-[10px] text-muted-foreground">day streak</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[hsl(var(--chart-orange))]" />
                <span className="text-sm font-bold text-foreground">{xp} XP</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">{done.length}/{LESSONS.length}</span>
          </div>
          <div className="h-1.5 bg-muted/6 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full monarch-gradient" initial={{ width: 0 }}
              animate={{ width: `${(done.length / LESSONS.length) * 100}%` }} transition={{ duration: 0.8, delay: 0.2, ease }} />
          </div>
          {done.length === LESSONS.length && <p className="text-[11px] text-primary font-bold mt-2">All complete. You're a pro.</p>}
        </motion.div>

        {/* Lessons */}
        <motion.div variants={fadeUp} className="space-y-1.5">
          {LESSONS.map((lesson, i) => {
            const isOpen = expanded === lesson.id;
            const isDone = done.includes(lesson.id);
            const cur = isOpen ? lesson : null;
            const onQuiz = cur && step >= cur.steps.length;

            return (
              <motion.div key={lesson.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className={`glass-card overflow-hidden transition-all ${isOpen ? "border-primary/8" : ""}`}>
                <button onClick={() => open(lesson.id)} className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-muted/3 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? "bg-[hsl(var(--chart-green))]/6" : `bg-gradient-to-br ${lesson.color} shadow-md`}`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5 text-[hsl(var(--chart-green))]" /> : <lesson.icon className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-foreground">{lesson.title}</p>
                    <p className="text-[10px] text-muted-foreground">{lesson.subtitle} · {lesson.duration}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isDone && <span className="text-[9px] text-[hsl(var(--chart-green))] font-bold">Done</span>}
                    {!isDone && <span className="text-[9px] text-primary/40 font-bold">+{lesson.xp} XP</span>}
                    <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground/20 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && cur && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }} className="border-t border-border/8 overflow-hidden">
                      <div className="p-4 space-y-4">
                        {/* Progress dots */}
                        <div className="flex items-center gap-1.5 justify-center">
                          {cur.steps.map((_, si) => (
                            <div key={si} className={`h-1 rounded-full transition-all ${si <= step ? "bg-primary w-5" : "bg-muted/10 w-1"}`} />
                          ))}
                          <div className={`h-1 rounded-full transition-all ${onQuiz ? "bg-primary w-5" : "bg-muted/10 w-1"}`} />
                        </div>

                        {!onQuiz ? (
                          <>
                            <AnimatePresence mode="wait">
                              <motion.p key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                                transition={{ duration: 0.25, ease }} className="text-[13px] text-foreground/75 leading-relaxed text-center min-h-[50px] font-medium">
                                {cur.steps[step]?.text}
                              </motion.p>
                            </AnimatePresence>
                            <button onClick={() => setStep(step + 1)}
                              className="w-full py-2.5 rounded-lg bg-primary/6 text-primary text-[13px] font-bold hover:bg-primary/10 transition-colors">
                              {step < cur.steps.length - 1 ? "Next →" : "Take Quiz →"}
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="space-y-2.5">
                              <p className="text-[13px] font-bold text-foreground text-center">{cur.quiz.q}</p>
                              {cur.quiz.opts.map((opt, oi) => {
                                const correct = oi === cur.quiz.ans;
                                const sel = qAnswer === oi;
                                const show = qAnswer !== null;
                                return (
                                  <button key={oi} onClick={() => qAnswer === null && setQAnswer(oi)} disabled={qAnswer !== null}
                                    className={`w-full py-3 px-3.5 rounded-lg text-[13px] font-semibold text-left transition-all ${
                                      show && correct ? "bg-[hsl(var(--chart-green))]/8 text-[hsl(var(--chart-green))] border-2 border-[hsl(var(--chart-green))]/15"
                                      : show && sel && !correct ? "bg-destructive/6 text-destructive border-2 border-destructive/10"
                                      : "bg-card/30 text-foreground border-2 border-border/10 hover:border-primary/10"
                                    }`}>{opt}</button>
                                );
                              })}
                            </div>
                            {qAnswer !== null && (
                              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5">
                                <div className="p-3 rounded-lg bg-primary/3 border border-primary/6">
                                  <p className="text-[12px] font-semibold text-primary">{cur.takeaway}</p>
                                </div>
                                {!isDone && (
                                  <button onClick={() => finish(lesson.id)}
                                    className="w-full py-3 rounded-lg monarch-gradient text-primary-foreground text-[13px] font-bold btn-magnetic">
                                    Complete! +{cur.xp} XP
                                  </button>
                                )}
                              </motion.div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

        {!activeWalletAddress && (
          <motion.div variants={fadeUp} className="glass-card p-5 text-center space-y-2.5">
            <p className="text-[13px] font-bold text-foreground">Ready to check your portfolio?</p>
            <button onClick={() => navigate("/dashboard")} className="px-5 py-2.5 rounded-full monarch-gradient text-primary-foreground text-sm font-bold btn-magnetic">Check Health</button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
