"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Heart, AlertTriangle, ShieldCheck, Sparkles, PenLine } from "lucide-react";
import type { CompatPayload } from "@/lib/astro/types";

interface CompatAnalysisViewProps {
  compat?: CompatPayload | null;
  nameA: string;
  nameB: string;
  deepStatus?: "idle" | "loading" | "ready" | "failed";
}

function scoreColor(v: number): string {
  if (v >= 75) return "#34d399";
  if (v >= 60) return "#a3e635";
  if (v >= 45) return "#fbbf24";
  if (v >= 30) return "#fb923c";
  return "#f87171";
}

export function CompatAnalysisView({ compat, nameA, nameB, deepStatus = "idle" }: CompatAnalysisViewProps) {
  // Waiting for the whole-chart analysis to compute/generate.
  if (!compat) {
    return (
      <Card className="border-white/10 bg-white/[0.03] backdrop-blur p-6 text-center">
        <p className="text-sm text-white/60 flex items-center justify-center gap-2">
          <PenLine className="h-4 w-4 animate-pulse text-amber-200/70" />
          {deepStatus === "loading"
            ? `Reading both charts — ${nameA}'s and ${nameB}'s — as two whole personalities…`
            : "The whole-chart analysis is being prepared…"}
        </p>
      </Card>
    );
  }
  return (
    <div className="space-y-8">
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="text-5xl">{compat.headline.emoji}</div>
        <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white">
          {compat.headline.label}
        </h2>
        <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-2xl mx-auto">
          {compat.headline.why}
        </p>
        {deepStatus === "loading" && (
          <p className="text-xs text-amber-200/70 flex items-center justify-center gap-2">
            <PenLine className="h-3.5 w-3.5 animate-pulse" />
            Reading both full charts as personalities — the deeper analysis lands here in a moment.
          </p>
        )}
        {deepStatus === "ready" && (
          <p className="text-[11px] text-emerald-300/70">✨ Whole-chart analysis of both people complete.</p>
        )}
      </motion.div>

      {/* Area scores — the honest breakdown */}
      <Card className="border-white/10 bg-white/[0.03] backdrop-blur p-6">
        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-300" /> The honest breakdown
        </h3>
        <p className="text-xs text-white/50 mb-5">
          Seven areas, scored from both whole charts interacting — not just Sun signs. Strong attraction with weak conflict handling is allowed here.
        </p>
        <div className="space-y-4">
          {compat.areas.map((area, i) => (
            <motion.div
              key={area.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-sm font-medium text-white">{area.label}</span>
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: scoreColor(area.value) }}
                >
                  {area.value}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${area.value}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.06, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: scoreColor(area.value) }}
                />
              </div>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">{area.note}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Written analysis sections — structured: short lead + one bullet per point */}
      <div className="space-y-4">
        {compat.sections.map((s) => (
          <Card key={s.id} className="border-white/10 bg-white/[0.03] backdrop-blur p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300 flex-shrink-0" /> {s.title}
            </h3>
            {s.body && (
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line mb-3">
                {s.body}
              </p>
            )}
            {s.bullets && s.bullets.length > 0 && (
              <ul className="space-y-2">
                {s.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
                    <span className="text-amber-300/60 mt-1 flex-shrink-0">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        ))}
      </div>

      {/* Biggest friction point */}
      <Card className="border-rose-300/20 bg-rose-300/[0.04] backdrop-blur p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-300 flex-shrink-0" /> Biggest friction point: {compat.frictionPoint.title}
        </h3>
        <p className="text-sm text-white/80 leading-relaxed">{compat.frictionPoint.body}</p>
      </Card>

      {/* Toxicity risk */}
      <Card className="border-amber-300/20 bg-amber-300/[0.04] backdrop-blur p-6">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-amber-300 flex-shrink-0" /> What could become toxic
        </h3>
        <p className="text-sm text-white/80 leading-relaxed">{compat.toxicityRisk}</p>
      </Card>

      {/* What each person needs to understand — the full-breakdown structure,
          one card per person, one detailed bullet per trait. The strongest /
          hardest currents used to live here too, but every one of those
          contacts already appears as a full card in "What matches well" /
          "Where friction lives" below — the duplicate lists were removed. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">
            What you need to understand about {nameB}
          </div>
          <ul className="space-y-2.5">
            {compat.eachNeeds.a.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
                <span className="text-violet-300/60 mt-1 flex-shrink-0">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur p-6">
          <div className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">
            What {nameB} needs to understand about you
          </div>
          <ul className="space-y-2.5">
            {compat.eachNeeds.b.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
                <span className="text-violet-300/60 mt-1 flex-shrink-0">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
