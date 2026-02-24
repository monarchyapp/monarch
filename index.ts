import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/appStore";
import monarchLogo from "@/assets/monarch-logo.png";
import { ArrowRight, Shield, Zap, Play, CheckCircle2, Star, X, ChevronDown } from "lucide-react";

const DEMO_WALLET = "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg";

const ease = [0.16, 1, 0.3, 1] as const;

// Animated counter
function Counter({ to, duration = 2, delay = 0 }: { to: number; duration?: number; delay?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / (duration * 1000), 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(eased * to));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [to, duration, delay]);
  return <>{val}</>;
}

// Ambient particles
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 1 + Math.random() * 2.5,
            height: 1 + Math.random() * 2.5,
          }}
          animate={{
            y: [0, -60 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 40, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{ duration: 6 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 8, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// Score ring hero
function ScoreReveal({ mouseX, mouseY }: { mouseX: any; mouseY: any }) {
  const rx = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 80, damping: 20 });
  const ry = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 80, damping: 20 });
  const c = 2 * Math.PI * 54;

  return (
    <motion.div style={{ rotateX: rx, rotateY: ry, perspective: 800 }} className="relative w-48 h-48 md:w-56 md:h-56 mx-auto">
      {/* Glow */}
      <motion.div
        className="absolute inset-0 rounded-full blur-[80px]"
        style={{ background: "radial-gradient(circle, hsl(var(--chart-green) / 0.25), transparent 70%)" }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 1.5 }}
      />
      {/* Glass shell */}
      <div className="absolute inset-1 rounded-full glass-orb flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity="0.08" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none" stroke="url(#heroGrad)" strokeWidth="3.5" strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * 0.26 }}
            transition={{ duration: 2.8, delay: 1, ease }}
          />
          <defs>
            <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--chart-green))" />
              <stop offset="100%" stopColor="hsl(var(--chart-cyan))" />
            </linearGradient>
          </defs>
        </svg>
        <motion.div initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.8, duration: 0.8, ease }} className="text-center z-10">
          <span className="text-5xl md:text-6xl font-extrabold text-foreground block" style={{ letterSpacing: "-0.06em" }}>
            <Counter to={74} duration={1.8} delay={1.8} />
          </span>
          <span className="text-[10px] text-muted-foreground/50 font-bold tracking-[0.15em] uppercase">Health Score</span>
        </motion.div>
        {/* Specular highlight */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2/5 h-6 rounded-full bg-white/[0.025] blur-sm" />
      </div>
    </motion.div>
  );
}

const steps = [
  { num: "01", title: "Paste your wallet", desc: "Any Solana address. Read-only, completely safe." },
  { num: "02", title: "Get your health score", desc: "A single 0–100 number. Risk, diversification, stability." },
  { num: "03", title: "Follow your Fix-It Plan", desc: "Personalized steps to improve. Earn XP along the way." },
];

const testimonials = [
  { text: "Finally an app that explains crypto in plain English. I actually understand my portfolio now.", name: "Sarah K.", role: "First-time investor", avatar: "S" },
  { text: "I had no idea I was 86% in one token. Monarch showed me the risk and how to fix it.", name: "Alex M.", role: "Phantom user", avatar: "A" },
  { text: "The health score is genius. My score went from 42 to 78 in two weeks.", name: "Jordan R.", role: "SOL holder", avatar: "J" },
];

const compLeft = ["Confusing charts & numbers", "Technical jargon everywhere", "No guidance on what to do", "Designed for traders"];
const compRight = ["Simple 0–100 health score", "Plain English explanations", "Step-by-step Fix-It Plan", "Designed for real people"];

export default function Landing() {
  const navigate = useNavigate();
  const { setActiveWalletAddress } = useAppStore();
  const [walletInput, setWalletInput] = useState("");
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [logoRevealed, setLogoRevealed] = useState(false);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.94]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const handleMouse = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width - 0.5);
    mouseY.set((e.clientY - r.top) / r.height - 0.5);
  };

  const handleScan = () => {
    const addr = walletInput.trim();
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)) { setActiveWalletAddress(addr); navigate("/dashboard"); }
  };

  const handleDemo = () => { setActiveWalletAddress(DEMO_WALLET); navigate("/dashboard"); };

  useEffect(() => { const t = setTimeout(() => setLogoRevealed(true), 200); return () => clearTimeout(t); }, []);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      <div className="fixed inset-0 noise-texture pointer-events-none z-0" />
      <div className="fixed inset-0 network-bg pointer-events-none z-0" />

      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div animate={{ x: [0, 60, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute top-[5%] left-[-5%] w-[800px] h-[800px] rounded-full opacity-[0.035]"
          style={{ background: "radial-gradient(circle, hsl(28 100% 55%), transparent 60%)" }} />
        <motion.div animate={{ x: [0, -50, 0], y: [0, 60, 0] }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="absolute top-[55%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.02]"
          style={{ background: "radial-gradient(circle, hsl(215 72% 56%), transparent 60%)" }} />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/30 backdrop-blur-2xl border-b border-border/10">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease }} className="flex items-center gap-2.5">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease, delay: 0.1 }}
              className="w-8 h-8 rounded-xl overflow-hidden shadow-lg shadow-primary/15"
            >
              <img src={monarchLogo} alt="Monarch" className="w-full h-full object-cover" />
            </motion.div>
            <span className="text-sm font-extrabold tracking-tight">Monarch</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease, delay: 0.15 }} className="flex items-center gap-2">
            <button onClick={() => navigate("/dashboard")}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full monarch-gradient text-primary-foreground text-xs font-bold btn-magnetic shadow-lg shadow-primary/20">
              Open App <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative min-h-screen flex items-center justify-center pt-14" onMouseMove={handleMouse}>
        <Particles />
        <div className="relative z-10 max-w-xl mx-auto px-5 text-center space-y-10">
          {/* Logo reveal */}
          <motion.div initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: logoRevealed ? 1 : 0, scale: logoRevealed ? 1 : 0.3 }} transition={{ duration: 1.2, ease }}>
            <ScoreReveal mouseX={mouseX} mouseY={mouseY} />
          </motion.div>

          {/* Copy */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease }} className="space-y-4">
            <h1 className="text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold leading-[1.06]">
              Your crypto health.
              <br />
              <span className="bg-gradient-to-r from-primary to-[hsl(var(--chart-orange-light))] bg-clip-text text-transparent">
                Instantly understood.
              </span>
            </h1>
            <p className="text-[15px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Paste any Solana wallet. See how safe your portfolio really is — in seconds.
            </p>
          </motion.div>

          {/* Wallet input */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="space-y-4">
            <div className="relative max-w-md mx-auto group">
              <div className="absolute -inset-[1.5px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"
                style={{ background: "linear-gradient(90deg, transparent, hsl(28 100% 55% / 0.3), transparent)", backgroundSize: "200% 100%", animation: "shimmer 2.5s linear infinite" }} />
              <div className="relative flex items-center bg-card/60 border border-border/20 rounded-full p-1.5 group-focus-within:border-primary/12 transition-all duration-500 shadow-2xl shadow-background/60 backdrop-blur-xl">
                <input value={walletInput} onChange={e => setWalletInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleScan()}
                  placeholder="Paste wallet address"
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none font-medium" />
                <button onClick={handleScan} disabled={walletInput.trim().length < 32}
                  className="flex items-center gap-2 px-6 py-3 rounded-full monarch-gradient text-primary-foreground text-sm font-bold disabled:opacity-10 btn-magnetic shadow-lg shadow-primary/20">
                  Scan <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button onClick={handleDemo}
              className="group mx-auto flex items-center gap-2.5 px-5 py-3 rounded-full border border-border/15 bg-card/20 hover:bg-card/50 hover:border-primary/10 transition-all duration-300 backdrop-blur-sm">
              <div className="w-7 h-7 rounded-full monarch-gradient-subtle flex items-center justify-center group-hover:scale-110 transition-transform border border-primary/8">
                <Play className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Try a demo wallet</span>
            </button>

            <div className="flex items-center justify-center gap-6">
              {[{ icon: Shield, t: "Read-only" }, { icon: Zap, t: "Instant" }, { icon: Shield, t: "No transfers" }].map((b, i) => (
                <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + i * 0.1 }}
                  className="flex items-center gap-1.5 text-[10px] text-muted-foreground/25 font-semibold tracking-wide">
                  <b.icon className="w-3 h-3" /> {b.t}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="pt-6">
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-5 h-9 rounded-full border-2 border-border/10 mx-auto flex justify-center pt-2">
              <div className="w-0.5 h-2 rounded-full bg-primary/15" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ===== iPhone Mockup ===== */}
      <section className="py-24 px-5 relative">
        <motion.div initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease }} className="max-w-xs mx-auto">
          <div className="rounded-[40px] border-[3px] border-border/15 bg-card/40 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-background/80 aspect-[9/18] glass-orb">
            <div className="h-10 flex items-center justify-center">
              <div className="w-20 h-5 rounded-full bg-background/60" />
            </div>
            <div className="px-5 py-3 space-y-4">
              <div className="text-center space-y-1">
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.15em]">Health Score</p>
                <div className="relative w-20 h-20 mx-auto">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="5" opacity="0.1" />
                    <motion.circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--chart-green))" strokeWidth="5" strokeLinecap="round"
                      strokeDasharray={264} initial={{ strokeDashoffset: 264 }}
                      whileInView={{ strokeDashoffset: 264 * 0.26 }} viewport={{ once: true }}
                      transition={{ duration: 2, delay: 0.5, ease }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-extrabold text-foreground">74</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                {["Well diversified", "Stablecoin buffer", "Moderate activity"].map((l, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 1 + i * 0.1 }}
                    className="flex items-center gap-2 text-[9px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--chart-green))]" />
                    <span className="text-foreground/60">{l}</span>
                  </motion.div>
                ))}
              </div>
              <div className="rounded-lg bg-muted/5 p-2.5 border border-border/8">
                <p className="text-[8px] text-primary font-bold uppercase tracking-wider mb-0.5">Coach</p>
                <p className="text-[9px] text-foreground/40 leading-relaxed">Looking good. Keep watching concentration risk.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== How It Works ===== */}
      <section className="py-32 px-5">
        <div className="max-w-3xl mx-auto space-y-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="section-title text-primary">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">Three steps to safer crypto.</h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-8 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/8 to-transparent hidden md:block" />

            <div className="space-y-8 md:space-y-16">
              {steps.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: i * 0.1, duration: 0.6, ease }}
                  className={`md:flex items-center gap-12 ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                  <div className="md:w-1/2 md:text-right space-y-3">
                    <span className="text-5xl font-black text-primary/8">{s.num}</span>
                    <h3 className="text-xl font-bold text-foreground">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                  <div className="hidden md:flex w-4 h-4 rounded-full border-2 border-primary/30 bg-background relative z-10 mx-auto" />
                  <div className="md:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Comparison ===== */}
      <section className="py-32 px-5">
        <div className="max-w-3xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
            <p className="section-title text-primary">Why Monarch</p>
            <h2 className="text-3xl font-extrabold">Not another crypto dashboard.</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="glass-card p-7 space-y-5 border-destructive/6">
              <p className="section-title text-destructive">Other crypto apps</p>
              <div className="space-y-3.5">
                {compLeft.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <X className="w-4 h-4 text-destructive/50 flex-shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="glass-card p-7 space-y-5 border-primary/6 monarch-gradient-subtle">
              <p className="section-title text-primary">Monarch</p>
              <div className="space-y-3.5">
                {compRight.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      <section className="py-32 px-5">
        <div className="max-w-4xl mx-auto space-y-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <p className="section-title text-primary">What people say</p>
            <h2 className="text-2xl font-extrabold mt-3">Loved by real users</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, ease }}
                className="glass-card p-6 space-y-4 hover:border-border/30 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-[13px] text-foreground/80 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full monarch-gradient flex items-center justify-center text-[11px] font-bold text-primary-foreground">{t.avatar}</div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Waitlist ===== */}
      <section id="waitlist" className="py-32 px-5">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-md mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold">Get early access</h2>
            <p className="text-muted-foreground text-sm">Join the waitlist for mobile + premium features.</p>
          </div>
          {emailSubmitted ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[hsl(var(--chart-green))] mx-auto" />
              <p className="text-base font-bold text-foreground">You're on the list!</p>
            </motion.div>
          ) : (
            <div className="flex gap-2 max-w-sm mx-auto">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                className="flex-1 px-5 py-3.5 rounded-full bg-card/50 border border-border/20 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/15 font-medium backdrop-blur-sm" />
              <button onClick={() => { if (email.includes("@")) setEmailSubmitted(true); }}
                className="px-6 py-3.5 rounded-full monarch-gradient text-primary-foreground text-sm font-bold btn-magnetic">Join</button>
            </div>
          )}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/10 py-10 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md overflow-hidden"><img src={monarchLogo} alt="" className="w-full h-full object-cover" /></div>
            <span className="text-xs font-bold text-foreground">Monarch</span>
            <span className="text-[10px] text-muted-foreground/20">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] text-muted-foreground/20">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Read-only · Never requests transfers</span>
            <button onClick={() => navigate("/dashboard")} className="text-primary hover:text-primary/80 transition-colors font-semibold">Open App</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
