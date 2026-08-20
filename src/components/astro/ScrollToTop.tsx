"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * Floating "scroll to top" button.
 * - Fixed at bottom-right
 * - Hidden until the user has scrolled down at least 400px
 * - Smoothly scrolls to top on click
 * - Doesn't overlap the footer or the navbar (z-50, between them)
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    // Initial check in case the page loaded already scrolled
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 10 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 shadow-lg shadow-black/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
