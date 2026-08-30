"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { PersonalReading, ReadingSection, ReadingBlock } from "@/lib/astro/readingEngine";

interface ReadingViewProps {
  reading: PersonalReading;
}

/**
 * Renders the full personal reading as a flowing narrative.
 * Supports: paragraphs, callouts (colored boxes), examples (italic quotes),
 * subheadings (small headers), and bullets.
 *
 * Each major section is expandable so the page isn't overwhelming,
 * but the first section ("Who you are") is open by default.
 */
export function ReadingView({ reading }: ReadingViewProps) {
  return (
    <div className="space-y-8">
      {/* Hero — archetype + intro */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-amber-200">
          Your Personal Reading
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-medium text-white">
          {reading.archetype}
        </h1>
        <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl mx-auto">
          {reading.intro}
        </p>
      </motion.div>

      {/* Sections */}
      <div className="space-y-4">
        {reading.sections.map((section, i) => (
          <ReadingSectionView key={section.id} section={section} defaultOpen={i === 0} index={i} />
        ))}
      </div>
    </div>
  );
}

function ReadingSectionView({ section, defaultOpen, index }: { section: ReadingSection; defaultOpen: boolean; index: number }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur overflow-hidden"
    >
      {/* Section header — click to expand/collapse */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-5 sm:p-6 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-[10px] font-mono text-white/30 tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              {section.title}
            </h2>
            {section.label && (
              <span className="text-xs text-amber-200/80 italic">
                — {section.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 mt-1">
          {open ? (
            <ChevronDown className="h-5 w-5 text-white/40" />
          ) : (
            <ChevronRight className="h-5 w-5 text-white/40" />
          )}
        </div>
      </button>

      {/* Section body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4">
              {section.blocks.map((block, i) => (
                <BlockView key={i} block={block} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function BlockView({ block }: { block: ReadingBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-sm sm:text-base text-white/85 leading-relaxed">
          {block.text}
        </p>
      );

    case "subheading":
      return (
        <div className="pt-2">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-amber-200/80">
            {block.label}
          </h3>
        </div>
      );

    case "callout": {
      const variant = block.variant || "insight";
      const styles = {
        insight: { border: "border-violet-300/20", bg: "bg-violet-300/[0.04]", label: "text-violet-300" },
        shadow: { border: "border-rose-300/20", bg: "bg-rose-300/[0.04]", label: "text-rose-300" },
        strength: { border: "border-emerald-300/20", bg: "bg-emerald-300/[0.04]", label: "text-emerald-300" },
        growth: { border: "border-amber-300/20", bg: "bg-amber-300/[0.04]", label: "text-amber-300" },
        example: { border: "border-cyan-300/20", bg: "bg-cyan-300/[0.04]", label: "text-cyan-300" },
      }[variant];

      return (
        <div className={`rounded-lg border ${styles.border} ${styles.bg} p-4`}>
          {block.label && (
            <div className={`text-xs uppercase tracking-wider font-semibold ${styles.label} mb-1.5`}>
              {block.label}
            </div>
          )}
          <p className="text-sm text-white/85 leading-relaxed">
            {block.text}
          </p>
        </div>
      );
    }

    case "example":
      return (
        <div className="border-l-2 border-cyan-300/40 pl-4 py-1">
          <div className="text-[10px] uppercase tracking-wider text-cyan-300/70 mb-1">
            In real life
          </div>
          <p className="text-sm text-white/75 leading-relaxed italic">
            {block.text}
          </p>
        </div>
      );

    case "quote":
      return (
        <div className="border-l-2 border-amber-200/50 pl-4 py-1">
          <div className="text-[10px] uppercase tracking-wider text-amber-200/60 mb-1">
            In their own head
          </div>
          <p className="text-sm text-amber-100/85 leading-relaxed italic">
            {block.text}
          </p>
        </div>
      );

    case "meta":
      return (
        <p className="text-[11px] font-mono tracking-wide text-white/40 uppercase">
          {block.text}
        </p>
      );

    case "bullets": {
      const tone = block.tone ?? "neutral";
      const dotColor =
        tone === "good" ? "text-emerald-300/80" : tone === "avoid" ? "text-rose-300/80" : "text-amber-300/60";
      return (
        <ul className="space-y-2">
          {block.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
              <span className={`${dotColor} mt-1 flex-shrink-0`}>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    default:
      return null;
  }
}
