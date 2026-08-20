"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SoulmateCard } from "./SoulmateCard";
import type { NatalProfile } from "@/lib/astro/types";
import { ArrowRight, Sparkles } from "lucide-react";

interface SoulmateTabProps {
  /** Full natal profile from the birth chart. */
  profile?: NatalProfile | null;
  /** Called when the user wants to enter their birth data. */
  onEnterBirthData?: () => void;
}

export function SoulmateTab({ profile, onEnterBirthData }: SoulmateTabProps) {
  // No birth data yet — show a prompt.
  if (!profile) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-amber-200">
            <Sparkles className="h-3.5 w-3.5" /> Soulmates
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-medium text-white mt-4">
            Your Top 5 Soulmate Personas
          </h1>
          <p className="text-sm sm:text-base text-white/50 mt-3 max-w-md mx-auto">
            Enter your birth details and we&apos;ll generate 5 ideal partner charts — each with full placements, a birthday, and a birthplace. Ranked by full-chart synastry.
          </p>
        </div>
        <Card className="border-amber-300/20 bg-amber-300/[0.04] p-6 sm:p-8 backdrop-blur text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-300/15 border border-amber-300/30 flex items-center justify-center mb-4">
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <h3 className="text-lg font-semibold text-white">Enter your birth data first</h3>
          <p className="text-sm text-white/60 mt-2 max-w-sm mx-auto">
            We need your full chart to compute real synastry — Sun, Moon, Rising, Venus, Mars, Mercury, Saturn, Jupiter, and the outer planets.
          </p>
          {onEnterBirthData && (
            <Button onClick={onEnterBirthData} className="mt-5 bg-gradient-to-r from-amber-300 to-fuchsia-400 hover:from-amber-200 hover:to-fuchsia-300 text-slate-900 font-medium">
              Enter my birth details <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-amber-200">
          <Sparkles className="h-3.5 w-3.5" /> Soulmates
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-medium text-white mt-4">
          Your Top 5 Soulmate Personas
        </h1>
        <p className="text-sm sm:text-base text-white/50 mt-3 max-w-md mx-auto">
          Ranked by full-chart synastry. Each persona has full placements, a birthday, and a birthplace — so it feels like a real person, not just sign placements.
        </p>
      </div>

      <AnimatePresence>
        <motion.div
          key={profile.sun.signId + profile.moon.signId}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
        >
          <SoulmateCard profile={profile} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
