"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LEGENDARY_QUOTES, pickQuote } from "@/lib/astro/quotes";

/**
 * Auto-rotating legendary quote.
 *
 * - Picks a random quote on mount.
 * - Every ~12 seconds, fades out the current quote and fades in a new one.
 * - Never shows the same quote twice in a row.
 * - Pauses when the tab is hidden (saves cycles, avoids jarring jumps).
 * - 1.2s crossfade so the transition feels calm, not flickery.
 */
const ROTATION_MS = 12_000;

export function RotatingQuote() {
  // Start with index 0 (deterministic) to prevent hydration mismatches.
  // The useEffect below sets a random initial quote after mount.
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    // On mount (client-side only), pick a random starting index.
    setIndex(Math.floor(Math.random() * LEGENDARY_QUOTES.length));
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;

    function scheduleNext() {
      timer = setTimeout(() => {
        if (cancelled) return;
        if (document.hidden) {
          // Tab is hidden — wait and try again without rotating.
          scheduleNext();
          return;
        }
        setIndex((cur) => {
          let next: number;
          do {
            next = Math.floor(Math.random() * LEGENDARY_QUOTES.length);
          } while (next === cur && LEGENDARY_QUOTES.length > 1);
          return next;
        });
        scheduleNext();
      }, ROTATION_MS);
    }

    scheduleNext();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const quote = LEGENDARY_QUOTES[index] ?? pickQuote();

  return (
    <motion.blockquote
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5 }}
      className="mt-8 mx-auto max-w-xl"
    >
      <div className="relative rounded-xl border border-amber-300/15 bg-amber-300/[0.03] backdrop-blur p-5 sm:p-6 overflow-hidden">
        {/* Tiny "rotating" indicator so users know it changes */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <span className="text-[9px] uppercase tracking-wider text-amber-200/40">rotating</span>
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-amber-300/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="absolute -top-3 left-4 text-2xl text-amber-300/60 font-serif">&ldquo;</span>
            <p className="text-sm sm:text-base font-serif italic text-white/80 leading-relaxed">
              {quote.text}
            </p>
            <footer className="mt-3 text-xs uppercase tracking-[0.2em] text-amber-200/60">
              &mdash; {quote.author}
            </footer>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.blockquote>
  );
}
