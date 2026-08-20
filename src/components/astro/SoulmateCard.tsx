"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { SIGN_META, ELEMENT_COLORS } from "@/lib/astro/signs";
import type { SignId, NatalProfile } from "@/lib/astro/types";
import { PLANET_EMOJI } from "@/lib/astro/interpretations";
import { topSoulmatePersonas, type SoulmatePersona } from "@/lib/astro/matches";
import { Sparkles, Heart, Trophy, Medal } from "lucide-react";

interface SoulmateCardProps {
  /** Full natal profile — we need Sun, Moon, Rising, Venus, Mars, Mercury, Saturn */
  profile: NatalProfile;
}

const RANK_ICONS = [Trophy, Medal, Medal, Medal, Medal];
const RANK_LABELS = ["Best Match", "Runner-Up", "Third Pick", "Fourth Pick", "Fifth Pick"];
const RANK_COLORS = ["#fbbf24", "#c0c0c0", "#cd7f32", "#a78bfa", "#60a5fa"]; // gold, silver, bronze, purple, blue

export function SoulmateCard({ profile }: SoulmateCardProps) {
  // Build the input for the soulmate engine
  const find = (id: string) => profile.planets.find((p) => p.id === id)?.signId;
  const personas = topSoulmatePersonas({
    sun: profile.sun.signId,
    moon: profile.moon.signId,
    rising: profile.ascendant.signId,
    venus: find("venus"),
    mars: find("mars"),
    mercury: find("mercury"),
    saturn: find("saturn"),
    jupiter: find("jupiter"),
    uranus: find("uranus"),
    neptune: find("neptune"),
    pluto: find("pluto"),
  }, 5);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      <Card className="overflow-hidden border-amber-300/30 bg-gradient-to-br from-amber-300/[0.06] via-fuchsia-400/[0.04] to-violet-400/[0.06] backdrop-blur">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-300 via-fuchsia-400 to-violet-400" />
        <div className="p-5 sm:p-6">
          {/* Top 5 personas — header is provided by SoulmateTab, no duplicate here */}
          <div className="space-y-4">
            {personas.map((persona, i) => (
              <PersonaCard key={i} persona={persona} />
            ))}
          </div>

          <p className="text-center text-xs text-white/40 mt-5 italic max-w-md mx-auto">
            These are persona templates — real people have full charts, not just sign placements. But if you find someone whose Sun, Moon, Rising, Venus, Mars, and Mercury land close to one of these, hold on.
          </p>
        </div>
      </Card>
    </motion.section>
  );
}

function PersonaCard({ persona }: { persona: SoulmatePersona }) {
  const Icon = RANK_ICONS[persona.rank - 1] || Medal;
  const rankColor = RANK_COLORS[persona.rank - 1] || "#94a3b8";
  const rankLabel = RANK_LABELS[persona.rank - 1] || `Pick ${persona.rank}`;

  const placementRows: { label: string; sign: SignId; emoji: string }[] = [
    { label: "Sun", sign: persona.placements.sun, emoji: PLANET_EMOJI.sun },
    { label: "Moon", sign: persona.placements.moon, emoji: PLANET_EMOJI.moon },
    { label: "Rising", sign: persona.placements.rising, emoji: "\u{1F9D9}" },
    { label: "Venus", sign: persona.placements.venus, emoji: PLANET_EMOJI.venus },
    { label: "Mars", sign: persona.placements.mars, emoji: PLANET_EMOJI.mars },
    { label: "Mercury", sign: persona.placements.mercury, emoji: PLANET_EMOJI.mercury },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: persona.rank * 0.15 }}
      className="rounded-xl border bg-white/[0.03] overflow-hidden"
      style={{ borderColor: `${rankColor}30` }}
    >
      {/* Header: rank + vibe + score */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10" style={{ background: `${rankColor}08` }}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${rankColor}15`, border: `1px solid ${rankColor}40` }}
        >
          <Icon className="h-4 w-4" style={{ color: rankColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: rankColor }}>{rankLabel}</span>
            <span className="text-white/30 text-[10px]">·</span>
            <span className="text-sm font-medium text-white">{persona.vibe}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden flex-1 max-w-[100px]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: rankColor }}
                initial={{ width: 0 }}
                animate={{ width: `${persona.score}%` }}
                transition={{ duration: 0.8, delay: persona.rank * 0.15 + 0.2 }}
              />
            </div>
            <span className="text-[10px] tabular-nums text-white/50">{persona.score}/100</span>
          </div>
        </div>
      </div>

      {/* Placements grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {placementRows.map((row) => {
            const meta = SIGN_META[row.sign];
            const color = ELEMENT_COLORS[meta.element];
            return (
              <div key={row.label} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2">
                <span className="text-sm flex-shrink-0">{row.emoji}</span>
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-wider text-white/40">{row.label}</div>
                  <div className="text-xs font-medium text-white truncate">{meta.name}</div>
                </div>
                <span
                  className="font-serif text-base ml-auto flex-shrink-0"
                  style={{ color }}
                >
                  {meta.glyph}
                </span>
              </div>
            );
          })}
        </div>

        {/* Birthday + birthplace — makes it feel like a real person */}
        <div className="flex items-center gap-2 mb-3 text-xs text-white/50">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2 py-0.5">
            🎂 {persona.birthday}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2 py-0.5">
            📍 {persona.birthplace}
          </span>
        </div>

        {/* Why this works */}
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-start gap-2">
            <Heart className="h-3.5 w-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/70 leading-relaxed">{persona.explanation}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
