"use client";

import { motion } from "framer-motion";
import { TraitRing } from "./TraitRing";
import { SignBadge } from "./SignBadge";
import { Button } from "@/components/ui/button";
import type { NatalProfile } from "@/lib/astro/types";
import { PLANET_EMOJI, ANGLE_EMOJI } from "@/lib/astro/interpretations";
import { readChart } from "@/lib/astro/reading";
import { SIGN_META, ELEMENT_COLORS } from "@/lib/astro/signs";
import { BookOpen, RefreshCw, ChevronDown } from "lucide-react";

interface QuickViewProps {
  profile: NatalProfile;
  onReadMore: () => void;
  onReset: () => void;
}

export function QuickView({ profile, onReadMore, onReset }: QuickViewProps) {
  const { sun, moon, ascendant, traits } = profile;

  // ONE nickname + ONE bio, based on the full chart (not just Sun/Moon).
  const reading = readChart(profile);
  const sunMeta = SIGN_META[sun.signId];
  const sunColor = ELEMENT_COLORS[sunMeta.element];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-10"
    >
      {/* Hero: three signs */}
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

      {/* Trait rings */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">Your personality rings</h2>
          <p className="text-sm text-white/50 mt-1">
            Green means it's a strength. Red means it's a weak spot. The rest is in between.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
          {traits.map((t, i) => (
            <TraitRing
              key={t.key}
              label={t.label}
              value={t.value}
              hue={250 + i * 12}
              delay={i * 0.08}
            />
          ))}
        </div>
      </section>

      {/* Single merged nickname + bio (full chart reading) */}
      <section className="space-y-5">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div
              className="inline-block rounded-2xl border px-6 py-4 text-left max-w-lg"
              style={{
                background: `linear-gradient(135deg, ${sunColor}1a, ${sunColor}05)`,
                borderColor: `${sunColor}30`,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">✨</span>
                <span className="text-lg font-semibold text-white">{reading.nickname}</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{reading.bio}</p>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={onReset}
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Start over
          </Button>
        </div>
      </section>
    </motion.div>
  );
}
