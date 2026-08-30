"use client";

import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import type { NatalProfile, SignId } from "@/lib/astro/types";
import { SIGN_META, ELEMENT_COLORS } from "@/lib/astro/signs";
import { houseMeaning } from "@/lib/astro/interpretations";
import { generatePersonalReading } from "@/lib/astro/readingEngine";
import { ReadingView } from "./ReadingView";

interface DetailedViewProps {
  profile: NatalProfile;
}

export function DetailedView({ profile }: DetailedViewProps) {
  const p = profile.personality;
  // New whole-chart reading (falls back to legacy engine if payload missing).
  const reading = p
    ? {
        archetype: `${p.archetype.emoji} ${p.archetype.label}`,
        archetypeLine: p.fullReading.archetypeLine,
        intro: p.fullReading.intro,
        sections: p.fullReading.sections,
      }
    : generatePersonalReading(profile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">Your full reading</h2>
          <p className="text-sm text-white/50 mt-1">
            Why you are this way — placement by placement, then the pattern that connects them.
          </p>
        </div>
      </div>

      <ReadingView reading={reading} />

      {/* Empty houses — kept as-is per Rule 8 */}
      <EmptyHousesList profile={profile} />
    </motion.div>
  );
}

function EmptyHousesList({ profile }: { profile: NatalProfile }) {
  if (profile.houses.length === 0) return null;
  const housesWithPlanets = new Set(profile.planets.map((p) => p.house));
  const emptyHouses = profile.houses.filter((h) => !housesWithPlanets.has(h.house));
  if (emptyHouses.length === 0) return null;

  return (
    <section className="space-y-4 pt-8 border-t border-white/10">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Compass className="h-5 w-5 text-amber-300" /> Your empty houses
      </h3>
      <p className="text-sm text-white/50">
        These areas of your life have no planets in them — they still shape your chart, just more quietly.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {emptyHouses.map((h) => (
          <EmptyHouseCard key={h.house} house={h.house} signId={h.signId} />
        ))}
      </div>
    </section>
  );
}

function EmptyHouseCard({ house, signId }: { house: number; signId: SignId }) {
  const meta = SIGN_META[signId];
  const color = ELEMENT_COLORS[meta.element];
  const meaning = houseMeaning(house);

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-serif text-lg"
          style={{ background: `${color}1f`, border: `1px solid ${color}44`, color }}
        >
          {meta.glyph}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-mono text-white/40">H{house}</span>
            <h5 className="text-sm font-semibold text-white">{meaning.name}</h5>
          </div>
          <p className="text-xs text-white/60 mt-1">
            {meta.name} · {meta.element}
          </p>
        </div>
      </div>
    </div>
  );
}
