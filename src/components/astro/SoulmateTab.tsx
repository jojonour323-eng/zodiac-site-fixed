"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { NatalProfile } from "@/lib/astro/types";
import { ArrowRight, Sparkles, Heart, ThumbsUp, ThumbsDown, GraduationCap } from "lucide-react";

interface SoulmateTabProps {
  /** Full natal profile from the birth chart. */
  profile?: NatalProfile | null;
  /** Called when the user wants to enter their birth data. */
  onEnterBirthData?: () => void;
}

export function SoulmateTab({ profile, onEnterBirthData }: SoulmateTabProps) {
  if (!profile) {
    return (
      <div className="space-y-8">
        <Header />
        <Card className="border-amber-300/20 bg-amber-300/[0.04] p-6 sm:p-8 backdrop-blur text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-300/15 border border-amber-300/30 flex items-center justify-center mb-4">
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <h3 className="text-lg font-semibold text-white">Enter your birth data first</h3>
          <p className="text-sm text-white/60 mt-2 max-w-sm mx-auto">
            We&apos;ll read your entire chart — not just Venus — to map how you love: attraction, attachment, safety, trust, and what you actually need.
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

  const soulmate = profile.personality?.soulmate;

  return (
    <div className="space-y-10">
      <Header />

      {!soulmate ? (
        <Card className="border-white/10 bg-white/[0.03] p-6 text-center">
          <p className="text-sm text-white/60">
            The relationship psychology profile isn&apos;t available for this chart right now — but the synastry personas below still work.
          </p>
        </Card>
      ) : (
        <>
          {/* Soulmate archetype */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="rounded-2xl border border-rose-300/25 bg-gradient-to-br from-rose-400/10 to-fuchsia-400/5 px-8 py-6 text-center max-w-lg">
              <div className="text-4xl mb-2">{soulmate.archetype.emoji}</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">
                Your soulmate archetype
              </div>
              <h2 className="text-2xl font-serif font-medium text-white mb-2">{soulmate.archetype.label}</h2>
              <p className="text-sm text-white/65 leading-relaxed">{soulmate.archetype.why}</p>
            </div>
          </motion.section>

          {/* Relationship psychology sections — trait bullets, one per line */}
          <section className="space-y-4 max-w-3xl mx-auto">
            {soulmate.sections.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
              >
                <Card className="border-white/10 bg-white/[0.03] backdrop-blur p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">{s.title}</h3>
                  {s.lead && <p className="text-sm text-white/65 leading-relaxed mb-3">{s.lead}</p>}
                  <ul className="space-y-2">
                    {s.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
                        <span className="text-rose-300/60 mt-1 flex-shrink-0">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  {s.tail && <p className="text-xs text-white/50 leading-relaxed mt-3">{s.tail}</p>}
                </Card>
              </motion.div>
            ))}
          </section>

          {/* Green flags / Red flags */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <Card className="border-emerald-300/20 bg-emerald-300/[0.04] backdrop-blur p-6">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-emerald-300" /> Your green flags
              </h3>
              <ul className="space-y-2">
                {soulmate.greenFlags.map((f, i) => (
                  <li key={i} className="text-sm text-emerald-100/85 leading-relaxed flex gap-2">
                    <Heart className="h-3.5 w-3.5 text-emerald-300 mt-1 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="border-rose-300/20 bg-rose-300/[0.04] backdrop-blur p-6">
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <ThumbsDown className="h-4 w-4 text-rose-300" /> Your red flags
              </h3>
              <ul className="space-y-2">
                {soulmate.redFlags.map((f, i) => (
                  <li key={i} className="text-sm text-rose-100/85 leading-relaxed flex gap-2">
                    <AlertTriangleIcon />
                    {f}
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* Growth lesson */}
          <section className="max-w-3xl mx-auto">
            <Card className="border-amber-300/20 bg-amber-300/[0.04] backdrop-blur p-6">
              <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-amber-300" /> What you&apos;re learning about love
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">{soulmate.growthLesson}</p>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function AlertTriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 text-rose-300 mt-1 flex-shrink-0">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function Header() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-amber-200">
        <Sparkles className="h-3.5 w-3.5" /> Soulmates
      </div>
      <h1 className="text-3xl sm:text-4xl font-serif font-medium text-white mt-4">
        How You Love
      </h1>
      <p className="text-sm sm:text-base text-white/50 mt-3 max-w-xl mx-auto">
        A relationship psychology profile read from the whole chart: what makes this person fall, what builds safety, what kills interest — and what&apos;s actually being learned.
      </p>
    </div>
  );
}
