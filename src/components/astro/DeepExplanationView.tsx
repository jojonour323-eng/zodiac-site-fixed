"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DeepExplanation, ExplanationSection } from "@/lib/astro/deepReading";

interface DeepExplanationViewProps {
  explanation: DeepExplanation;
  /** Label for the expand button. Defaults to "Read the full deep breakdown". */
  expandLabel?: string;
  /** Compact mode — smaller text, tighter spacing. */
  compact?: boolean;
  /** Placement tags (icon + label) to show next to the headline — Rule 0.6 */
  placementTags?: { icon: string; label: string }[];
}

/**
 * Shared renderer for structured DeepExplanation objects.
 * Used by DetailedView (planets + ascendant), CompatibilityChecker (synastry modal),
 * SoulmateCard, RedFlagsTab, and KinkTestTab.
 *
 * Renders:
 *   - Headline (always visible, punchy one-liner) + optional placement tags
 *   - Summary (always visible, 1-2 sentences)
 *   - Expandable sections (each color-coded by type)
 */
export function DeepExplanationView({ explanation, expandLabel = "Read the full deep breakdown", compact = false, placementTags }: DeepExplanationViewProps) {
  const [open, setOpen] = useState(false);

  const headlineSize = compact ? "text-sm" : "text-sm sm:text-base";
  const summarySize = compact ? "text-xs" : "text-sm";
  const sectionPadding = compact ? "p-3" : "p-3.5";

  return (
    <div className="mt-3">
      {/* Placement tags — Rule 0.6: show icon + name next to the headline */}
      {placementTags && placementTags.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {placementTags.map((tag, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
              {tag.icon} {tag.label}
            </span>
          ))}
        </div>
      )}

      {/* Headline — always visible, punchy one-liner (skipped when the card
          already shows it, e.g. the red-flag cards pass it empty) */}
      {explanation.headline && (
        <p className={`font-medium text-white leading-relaxed ${headlineSize}`}>
          {explanation.headline}
        </p>
      )}

      {/* Summary — always visible, 1-2 sentences connecting sign + house */}
      {explanation.summary && (
        <p className={`${summarySize} text-white/65 leading-relaxed mt-2`}>
          {explanation.summary}
        </p>
      )}

      {/* Expandable deep dive */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              {explanation.sections.map((section, i) => (
                <SectionBlock key={i} section={section} compact={compact} padding={sectionPadding} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-200 hover:text-amber-100 transition-colors"
      >
        {open ? (
          <>
            <ChevronDown className="h-3.5 w-3.5" /> Show less
          </>
        ) : (
          <>
            <ChevronRight className="h-3.5 w-3.5" /> {expandLabel}
          </>
        )}
      </button>
    </div>
  );
}

function SectionBlock({ section, compact = false, padding = "p-3.5" }: { section: ExplanationSection; compact?: boolean; padding?: string }) {
  // Color-code the section by its heading type so the reader can scan
  // for the parts they care about.
  let accentColor = "text-amber-200";
  let borderClass = "border-white/10";
  let bgClass = "bg-white/[0.02]";

  const h = section.heading.toLowerCase();
  if (h.includes("bright side") || h.includes("green flag") || h.includes("the good")) {
    accentColor = "text-emerald-300";
    borderClass = "border-emerald-300/20";
    bgClass = "bg-emerald-300/[0.04]";
  } else if (h.includes("shadow") || h.includes("red flag") || h.includes("the hard part") || h.includes("the risk")) {
    accentColor = "text-rose-300";
    borderClass = "border-rose-300/20";
    bgClass = "bg-rose-300/[0.04]";
  } else if (h.includes("takeaway") || h.includes("what to do")) {
    accentColor = "text-amber-300";
    borderClass = "border-amber-300/20";
    bgClass = "bg-amber-300/[0.04]";
  } else if (h.includes("connect") || h.includes("fits your whole") || h.includes("what in your chart") || h.includes("what drives")) {
    accentColor = "text-violet-300";
    borderClass = "border-violet-300/20";
    bgClass = "bg-violet-300/[0.04]";
  } else if (h.includes("house") || h.includes("matters here")) {
    accentColor = "text-sky-300";
    borderClass = "border-sky-300/20";
    bgClass = "bg-sky-300/[0.04]";
  } else if (h.includes("retrograde")) {
    accentColor = "text-orange-300";
    borderClass = "border-orange-300/20";
    bgClass = "bg-orange-300/[0.04]";
  } else if (h.includes("what this actually") || h.includes("daily life") || h.includes("real life") || h.includes("what it feels like")) {
    accentColor = "text-cyan-300";
    borderClass = "border-cyan-300/20";
    bgClass = "bg-cyan-300/[0.04]";
  } else if (h.includes("why their") || h.includes("why this persona") || h.includes("how your charts")) {
    accentColor = "text-fuchsia-300";
    borderClass = "border-fuchsia-300/20";
    bgClass = "bg-fuchsia-300/[0.04]";
  }

  const bodySize = compact ? "text-xs" : "text-sm";
  const bulletSize = compact ? "text-xs" : "text-sm";
  const headingSize = compact ? "text-[10px]" : "text-xs";

  return (
    <div className={`rounded-lg border ${borderClass} ${bgClass} ${padding}`}>
      <div className={`${headingSize} uppercase tracking-wider font-semibold ${accentColor} mb-1.5`}>
        {section.heading}
      </div>
      {section.body && (
        <p className={`${bodySize} text-white/80 leading-relaxed whitespace-pre-line`}>
          {section.body}
        </p>
      )}
      {section.bullets && section.bullets.length > 0 && (
        <ul className="space-y-1.5 mt-1">
          {section.bullets.map((b, i) => (
            <li key={i} className={`flex items-start gap-2 ${bulletSize} text-white/75 leading-relaxed`}>
              <span className={`${accentColor} mt-0.5 flex-shrink-0`}>•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
