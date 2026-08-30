"use client";

import { motion } from "framer-motion";
import { TraitRing } from "./TraitRing";
import { SignBadge } from "./SignBadge";
import { Button } from "@/components/ui/button";
import type { NatalProfile } from "@/lib/astro/types";
import { PLANET_EMOJI, ANGLE_EMOJI } from "@/lib/astro/interpretations";
import { SIGN_META, ELEMENT_COLORS } from "@/lib/astro/signs";
import { RefreshCw } from "lucide-react";

interface QuickViewProps {
  profile: NatalProfile;
  onReadMore: () => void;
  onReset: () => void;
}

/** Ring value → short level word shown under the ring. */
function ringLevel(v: number): { word: string; className: string } {
  if (v >= 70) return { word: "strong", className: "text-emerald-300/90" };
  if (v >= 40) return { word: "mixed", className: "text-amber-300/90" };
  return { word: "low", className: "text-rose-300/90" };
}

export function QuickView({ profile, onReadMore, onReset }: QuickViewProps) {
  const { sun, moon, ascendant, personality } = profile;

  const sunMeta = SIGN_META[sun.signId];
  const sunColor = ELEMENT_COLORS[sunMeta.element];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-10"
    >
      {/* Hero: three signs — unchanged */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-amber-200">
          Your three signs
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 items-end justify-items-center">
          <SignBadge signId={sun.signId} role={`${PLANET_EMOJI.sun} Sun`} roleLabel="Core Self" size="lg" />
          <SignBadge signId={moon.signId} role={`${PLANET_EMOJI.moon} Moon`} roleLabel="Emotions" size="lg" />
          <SignBadge signId={ascendant.signId} role={`${ANGLE_EMOJI.asc} Rising`} roleLabel="Your Mask" size="lg" />
        </div>
        {!profile.subject.timeKnown && (
          <p className="text-xs text-amber-200/70 max-w-md mx-auto">
            You didn&apos;t enter a birth time, so your Rising sign is showing the Sun sign as a stand-in and your houses are hidden. Add a birth time to unlock a precise Ascendant and the 12 houses.
          </p>
        )}
      </section>

      {/* Personality portrait — the main event */}
      {personality && (
        <section className="space-y-5">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white/60">
              We read your whole chart
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-medium text-white">
              {personality.home.title}
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            {personality.home.paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                className="text-sm sm:text-base text-white/75 leading-relaxed"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </section>
      )}

      {/* Your traits, one by one — every trait on its own detailed line */}
      {personality && personality.traitLines.length > 0 && (
        <section className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Your traits, one by one</h2>
            <p className="text-sm text-white/50">
              One trait per line, strongest first — what it looks like, and where it comes from in your chart.
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {personality.traitLines.map((t, i) => {
              const high = t.level.includes("high");
              return (
                <motion.div
                  key={t.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + i * 0.05 }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-white">
                      {t.label} — <span className={high ? "text-emerald-300" : "text-rose-300"}>{t.level}</span>
                    </span>
                    <span className="text-[10px] font-mono text-white/30 tabular-nums">{t.value}/100</span>
                  </div>
                  <p className="text-sm text-white/75 leading-relaxed">{t.line}</p>
                  {t.why && (
                    <p className="text-[11px] text-amber-200/60 mt-1.5">from your {t.why}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Archetype */}
      {personality && (
        <section className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-lg"
          >
            <div
              className="rounded-2xl border px-6 py-5 text-left"
              style={{
                background: `linear-gradient(135deg, ${sunColor}1a, ${sunColor}05)`,
                borderColor: `${sunColor}30`,
              }}
            >
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <span className="text-2xl">{personality.archetype.emoji}</span>
                <span className="text-xl font-semibold text-white">{personality.archetype.label}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 ml-auto">
                  your archetype
                </span>
              </div>
              <p className="text-sm text-white/65 leading-relaxed">{personality.archetype.reason}</p>
            </div>
          </motion.div>
        </section>
      )}

      {/* Personality rings — whole-chart scored, notes written from the real placements */}
      {personality && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">Your personality rings</h2>
            <p className="text-sm text-white/50 mt-1">
              Each ring is scored from your whole chart, and the line under it is written from your actual placements.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-8 justify-items-center">
            {personality.rings.map((ring, i) => {
              const lvl = ringLevel(ring.value);
              return (
                <div key={ring.key} className="flex flex-col items-center gap-1.5 text-center max-w-[170px]">
                  <TraitRing label={ring.label} value={ring.value} hue={250 + i * 12} delay={i * 0.08} />
                  <div className={`text-[10px] uppercase tracking-wider font-semibold ${lvl.className}`}>
                    {lvl.word}
                  </div>
                  <div className="text-xs font-medium text-white/85 leading-snug">{ring.headline}</div>
                  <p className="text-[11px] text-white/50 leading-relaxed">{ring.note}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Fallback if personality payload missing */}
      {!personality && (
        <section className="text-center">
          <div className="inline-block rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 max-w-lg">
            <p className="text-sm text-white/60">{profile.summary}</p>
          </div>
        </section>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onReadMore}
          size="lg"
          className="bg-gradient-to-r from-amber-300 to-fuchsia-400 hover:from-amber-200 hover:to-fuchsia-300 text-slate-900 font-medium"
        >
          Read the full analysis
        </Button>
        <Button
          onClick={onReset}
          size="lg"
          variant="outline"
          className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Start over
        </Button>
      </div>
    </motion.div>
  );
}
