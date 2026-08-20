"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SIGN_META, ELEMENT_COLORS, ELEMENT_LABELS } from "@/lib/astro/signs";
import type { SignId, NatalProfile } from "@/lib/astro/types";
import { getKinkResult } from "@/lib/astro/kinktest";
import { Flame, Sparkles, ArrowRight } from "lucide-react";

interface KinkTestTabProps {
  /** Full natal profile from the birth chart. Used to compute results across all planets. */
  profile?: NatalProfile | null;
  /** Gender from the birth form — used for he/she framing. */
  gender?: "male" | "female" | null;
  /** Called when the user wants to go enter their birth data. */
  onEnterBirthData?: () => void;
}

// Quick planet symbol lookup for the chart-readout chip strip.
const PLANET_GLYPH: Record<string, string> = {
  sun: "☀", moon: "🌙", rising: "↑", mercury: "☿", venus: "♀",
  mars: "♂", jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
};

export function KinkTestTab({ profile, gender, onEnterBirthData }: KinkTestTabProps) {
  // No birth data yet — show a prompt.
  if (!profile || !gender) {
    return (
      <div className="space-y-8">
        <Header />
        <Card className="border-fuchsia-400/20 bg-fuchsia-400/[0.04] p-6 sm:p-8 backdrop-blur text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-fuchsia-400/15 border border-fuchsia-400/30 flex items-center justify-center mb-4">
            <Flame className="h-5 w-5 text-fuchsia-300" />
          </div>
          <h3 className="text-lg font-semibold text-white">Enter your birth data first</h3>
          <p className="text-sm text-white/60 mt-2 max-w-sm mx-auto">
            We&apos;ll read your full chart — Sun, Moon, Rising, Venus, Mars, Pluto and the rest — to guess what you&apos;re into. No picking required.
          </p>
          {onEnterBirthData && (
            <Button onClick={onEnterBirthData} className="mt-5 bg-gradient-to-r from-fuchsia-500 to-rose-500 hover:from-fuchsia-400 hover:to-rose-400 text-white font-medium">
              Enter my birth details <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </Card>
      </div>
    );
  }

  // Build the chart input object for the kink engine.
  const sunSign = profile.sun.signId;
  const moonSign = profile.moon.signId;
  const findPlanet = (id: string) => profile.planets.find((p) => p.id === id)?.signId;

  const chartInput = {
    sun: sunSign,
    moon: moonSign,
    rising: profile.ascendant.signId,
    mercury: findPlanet("mercury"),
    venus: findPlanet("venus"),
    mars: findPlanet("mars"),
    jupiter: findPlanet("jupiter"),
    saturn: findPlanet("saturn"),
    uranus: findPlanet("uranus"),
    neptune: findPlanet("neptune"),
    pluto: findPlanet("pluto"),
  };

  const result = getKinkResult(sunSign, moonSign, gender, chartInput);

  return (
    <div className="space-y-8">
      <Header />

      {/* Results */}
      <AnimatePresence>
        <motion.div
          key={`${sunSign}-${moonSign}-${gender}-${profile.ascendant.signId}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="space-y-6"
        >
          <KinkResults result={result} sunSign={sunSign} gender={gender} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-fuchsia-300">
        <Flame className="h-3.5 w-3.5" /> Kink Test
      </div>
      <h1 className="text-3xl sm:text-4xl font-serif font-medium text-white mt-4">
        What Are You Into?
      </h1>
      <p className="text-sm sm:text-base text-white/50 mt-3 max-w-md mx-auto">
        Auto-read from your full birth chart — all 10 planets + Rising. Just for fun.
      </p>
    </div>
  );
}

function SignChip({ sign, label, glyph }: { sign: SignId; label: string; glyph: string }) {
  const meta = SIGN_META[sign];
  const color = ELEMENT_COLORS[meta.element];
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
      style={{ background: `${color}14`, borderColor: `${color}44` }}
    >
      <span className="text-xs text-white/60">{glyph}</span>
      <span className="text-xs font-medium text-white/80">{meta.name} {label}</span>
      <span className="text-[10px] text-white/40">{ELEMENT_LABELS[meta.element]}</span>
    </div>
  );
}

function KinkResults({ result, sunSign, gender }: { result: ReturnType<typeof getKinkResult>; sunSign: SignId; gender: "male" | "female" }) {
  const sunMeta = SIGN_META[sunSign];
  const top = result.traits[0];

  return (
    <div className="space-y-6">
      {/* Hero header with the top kink */}
      <Card className="overflow-hidden border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/[0.06] via-rose-500/[0.04] to-violet-500/[0.06] backdrop-blur">
        <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-violet-500" />
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center font-serif text-2xl" style={{ background: `${ELEMENT_COLORS[sunMeta.element]}1f`, border: `1px solid ${ELEMENT_COLORS[sunMeta.element]}44`, color: ELEMENT_COLORS[sunMeta.element] }}>
              {sunMeta.glyph}
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-fuchsia-300/60">Your top vibe</div>
              <div className="text-2xl font-bold text-white">{result.title}</div>
              <div className="text-sm text-white/50">{top.percentage}% — {top.description}</div>
            </div>
          </div>

          {/* Top vibes (>= 40% only, ranked) */}
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-wider text-white/40 mb-2">Your top vibes (ranked)</div>
            {result.traits.filter((t) => t.percentage >= 40).map((trait, i) => (
              <motion.div
                key={trait.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.6) }}
              >
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-white/30 tabular-nums w-6">#{i + 1}</span>
                    <span className="text-sm font-medium text-white/85 truncate">{trait.label}</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color: traitColor(trait.percentage) }}>{trait.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: traitBarColor(trait.percentage) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${trait.percentage}%` }}
                    transition={{ duration: 0.7, delay: 0.15 + Math.min(i * 0.04, 0.6), ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <p className="text-[11px] text-white/40 mt-1 leading-relaxed">{trait.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-fuchsia-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/70 leading-relaxed">{result.summary}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function traitColor(percentage: number): string {
  if (percentage >= 80) return "#f0abfc";
  if (percentage >= 65) return "#e879f9";
  if (percentage >= 50) return "#c084fc";
  if (percentage >= 35) return "#a78bfa";
  return "#7c3aed";
}

function traitBarColor(percentage: number): string {
  if (percentage >= 80) return "linear-gradient(90deg, #f0abfc, #e879f9)";
  if (percentage >= 65) return "linear-gradient(90deg, #e879f9, #d946ef)";
  if (percentage >= 50) return "linear-gradient(90deg, #c084fc, #a855f7)";
  if (percentage >= 35) return "linear-gradient(90deg, #a78bfa, #8b5cf6)";
  return "linear-gradient(90deg, #7c3aed, #6d28d9)";
}
