@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Deep matte dark — #0A0A0C → #0F1117 */
    --background: 230 18% 4%;
    --foreground: 220 14% 96%;

    --card: 230 14% 7%;
    --card-foreground: 220 14% 96%;

    --popover: 230 14% 7%;
    --popover-foreground: 220 14% 96%;

    /* Monarch Orange — #FF7A18 → #FFB347 */
    --primary: 28 100% 55%;
    --primary-foreground: 0 0% 100%;
    --primary-glow: 32 90% 62%;

    --secondary: 228 12% 11%;
    --secondary-foreground: 220 8% 72%;

    --muted: 228 12% 10%;
    --muted-foreground: 220 6% 48%;

    --accent: 28 22% 12%;
    --accent-foreground: 28 72% 64%;

    --destructive: 0 68% 52%;
    --destructive-foreground: 0 0% 100%;

    --success: 152 58% 44%;
    --success-foreground: 0 0% 100%;

    --border: 230 12% 12%;
    --input: 230 12% 12%;
    --ring: 28 100% 55%;

    --radius: 0.75rem;

    --sidebar-background: 230 18% 5%;
    --sidebar-foreground: 220 6% 48%;
    --sidebar-primary: 28 100% 55%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 28 20% 12%;
    --sidebar-accent-foreground: 28 72% 64%;
    --sidebar-border: 228 10% 11%;
    --sidebar-ring: 28 100% 55%;

    --chart-orange: 28 100% 55%;
    --chart-orange-light: 32 90% 62%;
    --chart-green: 152 58% 46%;
    --chart-red: 0 68% 54%;
    --chart-blue: 215 72% 56%;
    --chart-purple: 265 56% 58%;
    --chart-cyan: 185 60% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    letter-spacing: -0.015em;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-bold;
    font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
    letter-spacing: -0.035em;
  }

  /* Minimal scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: hsl(var(--muted-foreground)); }
}

@layer components {
  /* Glass surfaces */
  .glass-card {
    @apply bg-card/60 border border-border/30 rounded-2xl;
    backdrop-filter: blur(24px) saturate(1.2);
    box-shadow: 
      0 1px 2px hsl(0 0% 0% / 0.2),
      inset 0 1px 0 hsl(0 0% 100% / 0.02);
  }

  .glass-card-hover {
    @apply glass-card transition-all duration-300 ease-out;
  }
  .glass-card-hover:hover {
    @apply border-border/50;
    transform: translateY(-2px);
    box-shadow: 0 16px 48px -12px hsl(0 0% 0% / 0.6), inset 0 1px 0 hsl(0 0% 100% / 0.03);
  }

  .glass-surface {
    @apply bg-card/30 backdrop-blur-xl border border-border/15 rounded-2xl;
  }

  /* Stat styles */
  .stat-value { @apply text-3xl font-bold tracking-tighter text-foreground; }
  .stat-label { @apply text-[13px] font-medium text-muted-foreground; }

  .page-container { @apply p-5 md:p-8 max-w-2xl mx-auto; }
  .page-title { @apply text-xl font-bold text-foreground; }
  .section-title { @apply text-[11px] font-bold text-muted-foreground uppercase tracking-[0.14em]; }

  .monarch-gradient {
    background: linear-gradient(135deg, hsl(28 100% 55%), hsl(32 90% 62%));
  }
  .monarch-gradient-subtle {
    background: linear-gradient(135deg, hsl(28 100% 55% / 0.06), hsl(32 90% 62% / 0.02));
  }

  .text-gain { color: hsl(var(--chart-green)); }
  .text-loss { color: hsl(var(--chart-red)); }

  /* Skeleton loading */
  .skeleton {
    @apply bg-muted/30 rounded-2xl;
    animation: skeleton-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  .skeleton-text {
    @apply h-4 bg-muted/30 rounded-lg;
    animation: skeleton-pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes skeleton-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.12; }
  }

  /* Ambient glow */
  .ambient-glow {
    background: radial-gradient(ellipse 60% 35% at 50% 0%, hsl(28 100% 55% / 0.03), transparent 60%);
  }

  /* Trust badge */
  .trust-badge {
    @apply inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/40 px-3 py-1.5 rounded-full border border-border/20;
  }

  /* Grain overlay */
  .noise-texture {
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 256px;
  }

  /* Glowing path line */
  .glow-path {
    background: linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.15) 100%);
    box-shadow: 0 0 12px hsl(var(--primary) / 0.35), 0 0 32px hsl(var(--primary) / 0.08);
  }

  /* Glass orb */
  .glass-orb {
    background: linear-gradient(135deg, hsl(var(--card) / 0.7) 0%, hsl(var(--card) / 0.3) 100%);
    border: 1px solid hsl(0 0% 100% / 0.06);
    box-shadow: 
      0 32px 80px -20px hsl(0 0% 0% / 0.7),
      0 0 60px hsl(var(--primary) / 0.06),
      inset 0 1px 0 hsl(0 0% 100% / 0.05),
      inset 0 -1px 0 hsl(0 0% 0% / 0.2);
    backdrop-filter: blur(32px) saturate(1.4);
  }

  /* Magnetic button hover */
  .btn-magnetic {
    @apply transition-all duration-200;
  }
  .btn-magnetic:hover {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 8px 24px -8px hsl(var(--primary) / 0.3);
  }
  .btn-magnetic:active {
    transform: translateY(0) scale(0.98);
  }

  /* Network line background */
  .network-bg {
    background-image: radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.04) 0%, transparent 50%),
                       radial-gradient(circle at 80% 70%, hsl(var(--chart-blue) / 0.03) 0%, transparent 50%),
                       radial-gradient(circle at 50% 50%, hsl(var(--chart-purple) / 0.02) 0%, transparent 50%);
  }

  /* Water level animation */
  @keyframes water-wave {
    0%, 100% { transform: translateX(0) translateY(0); }
    25% { transform: translateX(-5px) translateY(-2px); }
    50% { transform: translateX(0) translateY(-4px); }
    75% { transform: translateX(5px) translateY(-2px); }
  }
  .water-wave { animation: water-wave 3s ease-in-out infinite; }

  /* Sparkline draw */
  @keyframes draw-line {
    from { stroke-dashoffset: 200; }
    to { stroke-dashoffset: 0; }
  }
  .sparkline-draw {
    stroke-dasharray: 200;
    animation: draw-line 1.5s ease-out forwards;
  }
}

@layer utilities {
  .scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-none::-webkit-scrollbar { display: none; }
}
