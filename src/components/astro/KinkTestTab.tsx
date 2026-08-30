"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { NatalProfile } from "@/lib/astro/types";
import { buildKinkChartProfile } from "@/lib/astro/personality/kink";
import { Flame, Mars, Venus, Sparkles } from "lucide-react";

interface KinkTestTabProps {
  profile?: NatalProfile | null;
  gender?: "male" | "female" | null;
  birth?: unknown;
  onEnterBirthData?: () => void;
}

export function KinkTestTab({ profile, onEnterBirthData }: KinkTestTabProps) {
  const result = useMemo(() => {
    if (!profile) return null;
    return buildKinkChartProfile(profile);
  }, [profile]);

  if (!profile || !result) {
    return (
      <div className="space-y-8">
        <Header />
        <Card className="border-fuchsia-400/20 bg-fuchsia-400/[0.04] p-6 sm:p-8 backdrop-blur text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-fuchsia-400/15 border border-fuchsia-400/30 flex items-center justify-center mb-4">
            <Flame className="h-5 w-5 text-fuchsia-300" />
          </div>
          <h3 className="text-lg font-semibold text-white">Enter your birth data first</h3>
          <p className="text-sm text-white/60 mt-2 max-w-sm mx-auto">
            No questions — your chart answers on its own. Mars sets your drive, Venus sets how you love, Pluto sets your intensity, and your 5th and 8th houses set how you play and how you merge.
          </p>
          {onEnterBirthData && (
            <button
              onClick={onEnterBirthData}
              className="mt-5 inline-flex items-center rounded-lg bg-gradient-to-r from-fuchsia-500 to-rose-500 hover:from-fuchsia-400 hover:to-rose-400 text-white font-medium px-5 py-2.5"
            >
              Enter my birth details
            </button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Header />

      <motion.div
        key={profile.sun.signId + profile.moon.signId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        {/* The straight answer — real slang, no euphemism */}
        <Card className="border-fuchsia-400/25 bg-gradient-to-br from-fuchsia-500/10 to-rose-500/5 p-6 sm:p-8 text-center">
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">Straight answer</div>
          <h2 className="text-3xl sm:text-4xl font-serif font-medium text-white mb-3">{result.verdict.label}</h2>
          <p className="text-sm text-white/70 leading-relaxed max-w-md mx-auto">{result.verdict.blurb}</p>
        </Card>

        {/* bdsm-test style slang identities — one per line */}
        <Card className="border-rose-300/20 bg-rose-300/[0.04] backdrop-blur p-6">
          <h3 className="text-base font-semibold text-white mb-1">Your kink identities</h3>
          <p className="text-xs text-white/50 mb-5">Scored straight from your placements — every line traces to your chart.</p>
          <div className="space-y-4">
            {result.identities.map((id, i) => (
              <div key={id.id}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="text-sm font-semibold text-white">{id.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-rose-300">{id.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${id.pct}%` }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-400"
                  />
                </div>
                <p className="text-[11px] text-white/55 mt-1 leading-relaxed">{id.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* bdsm appetite meter */}
        <Card className="border-fuchsia-400/20 bg-fuchsia-400/[0.04] backdrop-blur p-6">
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <h3 className="text-base font-semibold text-white">Bdsm appetite</h3>
            <span className="text-2xl font-semibold tabular-nums text-fuchsia-300">{result.appetite.pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.appetite.pct}%` }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-400"
            />
          </div>
          <p className="text-xs text-white/55 mt-2">{result.appetite.line}</p>
          <p className="text-[10px] text-white/35 mt-1">
            0% = fully vanilla, 100% = the whole kinky menu. Most people sit somewhere in the middle.
          </p>
        </Card>

        {/* Chart-first written interpretation — one point per bullet */}
        <Card className="border-violet-300/20 bg-violet-300/[0.04] backdrop-blur p-6">
          <h3 className="text-base font-semibold text-white mb-3">What your chart says</h3>
          <ul className="space-y-2.5">
            {result.interpretation.map((pgh, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
                <span className="text-fuchsia-300/60 mt-1 flex-shrink-0">•</span>
                <span>{pgh}</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-white/35 mt-4">
            Generated fresh from your real placements — the same chart data behind your main reading.
          </p>
        </Card>

        {/* Axes — the dials behind the verdict */}
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur p-6">
          <h3 className="text-base font-semibold text-white mb-1">The dials behind the verdict</h3>
          <p className="text-xs text-white/50 mb-5">Each dial cites the placement that moves it.</p>
          <div className="space-y-4">
            {result.axes.map((axis, i) => (
              <div key={axis.key}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="text-sm font-medium text-white">{axis.label}</span>
                  <span className="text-sm font-semibold tabular-nums text-fuchsia-300">{axis.value}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${axis.value}%` }}
                    transition={{ duration: 0.7, delay: 0.1 + i * 0.05 }}
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-400"
                  />
                </div>
                <p className="text-[11px] text-white/45 mt-1">{axis.note}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* May not appeal */}
        {result.mayNotAppeal.length > 0 && (
          <Card className="border-white/10 bg-white/[0.02] backdrop-blur p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-2">Likely not your thing (and that&apos;s fine)</h3>
            <ul className="space-y-2">
              {result.mayNotAppeal.map((m, i) => (
                <li key={i} className="text-xs text-white/55 leading-relaxed">— {m}</li>
              ))}
            </ul>
          </Card>
        )}

        {/* The placements behind this */}
        <Card className="border-amber-300/15 bg-amber-300/[0.03] backdrop-blur p-5">
          <h3 className="text-xs font-semibold text-amber-200/80 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> The placements behind this
          </h3>
          <p className="text-xs text-white/55 leading-relaxed">{result.chartNote}</p>
        </Card>
      </motion.div>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-fuchsia-300">
        <Flame className="h-3.5 w-3.5" /> Kink
      </div>
      <h1 className="text-3xl sm:text-4xl font-serif font-medium text-white mt-4">
        What Are You Into?
      </h1>
      <p className="text-sm sm:text-base text-white/50 mt-3 max-w-xl mx-auto">
        No questions. Your chart already knows — and the answer comes in the words people actually use: dom, sub, switch, brat, vanilla, bdsm.
      </p>
      <div className="mt-4 flex items-center justify-center gap-4 text-[10px] uppercase tracking-wider text-white/40">
        <span className="inline-flex items-center gap-1"><Mars className="h-3 w-3 text-rose-300" /> Mars · drive</span>
        <span className="inline-flex items-center gap-1"><Venus className="h-3 w-3 text-fuchsia-300" /> Venus · love style</span>
        <span className="inline-flex items-center gap-1"><Flame className="h-3 w-3 text-amber-300" /> Pluto · intensity</span>
        <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3 text-violet-300" /> 5th &amp; 8th · play &amp; intimacy</span>
      </div>
    </div>
  );
}
