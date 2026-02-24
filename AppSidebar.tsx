import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, Target, Coins, MessageCircle, BookOpen, User, Settings, X } from "lucide-react";

const pages = [
  { label: "Health", icon: Heart, path: "/dashboard" },
  { label: "Plan", icon: Target, path: "/plan" },
  { label: "Assets", icon: Coins, path: "/tokens" },
  { label: "Coach", icon: MessageCircle, path: "/coach" },
  { label: "Learn", icon: BookOpen, path: "/learn" },
  { label: "Account", icon: User, path: "/account" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = pages.filter((p) =>
    p.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
          onClick={() => onOpenChange(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.96, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.2 }} className="glass-card w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
              <button onClick={() => onOpenChange(false)} className="p-1 rounded-lg hover:bg-muted/30 transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pages</p>
              {filtered.map((page) => (
                <button key={page.path} onClick={() => handleSelect(page.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-muted/30 transition-colors">
                  <page.icon className="w-4 h-4 text-muted-foreground" />
                  <span>{page.label}</span>
                </button>
              ))}
              {filtered.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results found</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
