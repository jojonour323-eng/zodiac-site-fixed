"use client";

import { motion } from "framer-motion";
import { getNicknameEntry } from "@/lib/astro/nicknames";
import type { PlanetId, SignId } from "@/lib/astro/types";
import { SIGN_META, ELEMENT_COLORS } from "@/lib/astro/signs";

interface TraitNicknamesCardProps {
  planet: PlanetId;
  sign: SignId;
  retrograde?: boolean;
}

// Shows ONE real, funny nickname + a short description that sounds like
// a friend teasing you lovingly.
export function TraitNicknamesCard({ planet, sign, retrograde }: TraitNicknamesCardProps) {
  const entry = getNicknameEntry(planet, sign);
  const meta = SIGN_META[sign];
  const color = ELEMENT_COLORS[meta.element];

  return (
    <div className="mt-3">
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg p-3"
        style={{
          background: `${color}0d`,
          border: `1px solid ${color}25`,
        }}
      >
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold text-white">{entry.nickname}</span>
          {retrograde && (
            <span className="text-[10px] text-amber-300 uppercase tracking-wide">Retrograde</span>
          )}
        </div>
        <p className="text-xs text-white/60 leading-relaxed">{entry.description}</p>
      </motion.div>
    </div>
  );
}
