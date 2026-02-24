import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import monarchLogo from "@/assets/monarch-logo.png";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crypto-wizard`;

const STARTERS = [
  "What's the smartest move in a bear market?",
  "Explain MEV like I'm 5",
  "Is SOL still a good hold?",
  "What should I look for before aping in?",
];

export function CryptoWizard() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      const userMsg: Msg = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      let assistantSoFar = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
            );
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: [...messages, userMsg] }),
        });

        if (!resp.ok || !resp.body) {
          const errData = await resp.json().catch(() => ({}));
          upsert(errData.error || "Something went wrong ser. Try again.");
          setIsLoading(false);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) upsert(content);
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        // flush
        if (textBuffer.trim()) {
          for (let raw of textBuffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (raw.startsWith(":") || raw.trim() === "") continue;
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) upsert(content);
            } catch {}
          }
        }
      } catch {
        upsert("Network error. Check your connection and retry, anon.");
      }
      setIsLoading(false);
    },
    [messages, isLoading]
  );

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full monarch-gradient shadow-[0_0_30px_hsl(28_100%_55%_/_0.3)] flex items-center justify-center text-white md:bottom-6"
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)" }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-6rem)] rounded-2xl border border-border/20 bg-[#0c0c10]/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/30">
                  <img src={monarchLogo} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight">Crypto Wizard</p>
                  <p className="text-[10px] text-primary font-medium">in the trenches since '17</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-muted/20 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-12 h-12 rounded-full monarch-gradient flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">gm anon 👋</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                      Ask me anything about crypto. No normie answers, only real alpha.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-[11px] px-3 py-1.5 rounded-full border border-border/20 bg-muted/10 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary/15 text-foreground rounded-br-md"
                        : "bg-muted/10 text-foreground/90 rounded-bl-md border border-border/10"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_strong]:text-primary [&_code]:text-primary/80 [&_code]:bg-primary/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_a]:text-primary">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-muted-foreground text-xs"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>cooking up alpha...</span>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-border/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="ask the wizard..."
                  disabled={isLoading}
                  className="flex-1 bg-muted/10 border border-border/15 rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 rounded-xl monarch-gradient flex items-center justify-center text-white disabled:opacity-30 hover:shadow-[0_0_16px_hsl(28_100%_55%_/_0.3)] transition-shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
