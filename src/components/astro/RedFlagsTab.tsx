"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SIGN_META, ELEMENT_COLORS, ELEMENT_LABELS } from "@/lib/astro/signs";
import type { SignId, NatalProfile } from "@/lib/astro/types";
import { getFullChartFlags, type FlagResult, type Flag } from "@/lib/astro/redflags";
import { generateFlagReading, type FlagType } from "@/lib/astro/flagReading";
import { DeepExplanationView } from "./DeepExplanationView";
import { Flag as FlagIcon, Heart, ArrowRight, MessageSquare, Brain, Activity, Sparkles, TrendingUp, Meh } from "lucide-react";

interface RedFlagsTabProps {
  profile?: NatalProfile | null;
  gender?: "male" | "female" | null;
  onEnterBirthData?: () => void;
}

export function RedFlagsTab({ profile, gender, onEnterBirthData }: RedFlagsTabProps) {
  if (!profile || !gender) {
    return (
      <div className="space-y-8">
        <Header />
        <Card className="border-rose-400/20 bg-rose-400/[0.04] p-6 sm:p-8 backdrop-blur text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-400/15 border border-rose-400/30 flex items-center justify-center mb-4">
            <FlagIcon className="h-5 w-5 text-rose-300" />
          </div>
          <h3 className="text-lg font-semibold text-white">Enter your birth data first</h3>
          <p className="text-sm text-white/60 mt-2 max-w-sm mx-auto">
            We&apos;ll read your full chart — every planet, every house — and give you the full read: red flags, green flags, growth areas, and neutral quirks.
          </p>
          {onEnterBirthData && (
            <Button onClick={onEnterBirthData} className="mt-5 bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-400 hover:to-fuchsia-400 text-white font-medium">
              Enter my birth details <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </Card>
      </div>
    );
  }

  const result = getFullChartFlags(profile);

  return (
    <div className="space-y-8">
      <Header />

      <AnimatePresence>
        <motion.div
          key={profile.sun.signId + profile.moon.signId}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="space-y-6"
        >
          {/* Red Flags */}
          <FlagTypeSection
            title="Red Flags"
            description="The stuff that's actually problematic. No sugarcoating."
            icon={FlagIcon}
            color="#fb7185"
            data={result.redFlags}
            flagType="red"
            profile={profile}
          />

          {/* Growth Areas */}
          <FlagTypeSection
            title="Growth Areas"
            description="Not broken, but not fully developed either. Things to work on."
            icon={TrendingUp}
            color="#fbbf24"
            data={result.growthAreas}
            flagType="growth"
            profile={profile}
          />

          {/* Neutral Quirks */}
          <FlagTypeSection
            title="Neutral Quirks"
            description="Just who they are. Not good or bad — just specific."
            icon={Meh}
            color="#a78bfa"
            data={result.quirks}
            flagType="quirk"
            profile={profile}
          />

          {/* Green Flags */}
          {result.greenFlags.length > 0 && (
            <Card className="border-emerald-400/20 bg-emerald-400/[0.04] p-5 backdrop-blur">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">Green Flags</h3>
              </div>
              <div className="space-y-3">
                {result.greenFlags.map((flag, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-emerald-400/[0.03] border border-emerald-400/10"
                  >
                    <span className="text-emerald-400/60 text-xs mt-0.5">✓</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white mb-0.5">{flag.title}</div>
                      <p className="text-xs text-white/70 leading-relaxed">{flag.detail}</p>
                      <div className="mt-1.5 flex gap-1.5 flex-wrap">
                        {flag.sources.map((src, j) => (
                          <span key={j} className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300/90 border border-emerald-400/25">
                            {src}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-rose-300">
        <FlagIcon className="h-3.5 w-3.5" /> The Full Read
      </div>
      <h1 className="text-3xl sm:text-4xl font-serif font-medium text-white mt-4">
        The Full Read
      </h1>
      <p className="text-sm sm:text-base text-white/50 mt-3 max-w-md mx-auto">
        Red flags, growth areas, neutral quirks, and green flags — categorized by area. No sugarcoating, no filler.
      </p>
    </div>
  );
}

function SignChip({ sign, kind }: { sign: SignId; kind: "Sun" | "Moon" | "Rising" }) {
  const meta = SIGN_META[sign];
  const color = ELEMENT_COLORS[meta.element];
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
      style={{ background: `${color}14`, borderColor: `${color}44` }}
    >
      <span className="text-xs font-medium text-white/80">{meta.name} {kind}</span>
      <span className="text-[10px] text-white/40">{ELEMENT_LABELS[meta.element]}</span>
    </div>
  );
}

const CATEGORIES = [
  { key: "relationship", label: "Relationship", icon: Heart, desc: "How they show up in love" },
  { key: "communication", label: "Communication", icon: MessageSquare, desc: "How they talk and argue" },
  { key: "emotional", label: "Emotional", icon: Brain, desc: "How they process feelings" },
  { key: "behavioral", label: "Behavioral", icon: Activity, desc: "Day-to-day patterns" },
] as const;

function FlagTypeSection({
  title,
  description,
  icon: Icon,
  color,
  data,
  flagType,
  profile,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  data: FlagResult["redFlags"];
  flagType: FlagType;
  profile: NatalProfile;
}) {
  const totalFlags = data.relationship.length + data.communication.length + data.emotional.length + data.behavioral.length;
  if (totalFlags === 0) return null;

  return (
    <Card className="backdrop-blur p-5" style={{ borderColor: `${color}30`, background: `${color}06` }}>
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color }}>{title}</h3>
          <p className="text-[10px] text-white/40">{description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const catFlags = data[cat.key];
          if (catFlags.length === 0) return null;
          const CatIcon = cat.icon;
          return (
            <div key={cat.key}>
              <div className="flex items-center gap-1.5 mb-2">
                <CatIcon className="h-3 w-3 text-white/40" />
                <span className="text-[10px] uppercase tracking-wider text-white/50">{cat.label}</span>
              </div>
              <div className="space-y-2">
                {catFlags.map((flag, i) => (
                  <FlagCard
                    key={i}
                    flag={flag}
                    index={i}
                    color={color}
                    flagType={flagType}
                    category={cat.label}
                    profile={profile}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Individual flag card with the deep structured explanation.
// The flag title + detail + sources are always visible.
// The deep explanation (connecting to specific chart placements) is expandable.
function FlagCard({
  flag,
  index,
  color,
  flagType,
  category,
  profile,
}: {
  flag: Flag;
  index: number;
  color: string;
  flagType: FlagType;
  category: string;
  profile: NatalProfile;
}) {
  const reading = generateFlagReading(profile, flag, flagType, category);
  // The card above already shows the flag title, detail, and source chips —
  // pass headline/summary/tags empty so the deep view adds ONLY the expander.
  const deep = { headline: "", summary: "", sections: reading.sections };

  return (
    <div
      className="p-3 rounded-lg"
      style={{ background: `${color}03`, border: `1px solid ${color}15` }}
    >
      <div className="flex items-start gap-3">
        <span className="text-[10px] font-mono mt-1 flex-shrink-0" style={{ color: `${color}80` }}>#{index + 1}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white mb-0.5">{flag.title}</div>
          <p className="text-xs text-white/70 leading-relaxed">{flag.detail}</p>
          <div className="mt-1.5 flex gap-1.5 flex-wrap">
            {flag.sources.map((src, j) => (
              <span
                key={j}
                className="text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ background: `${color}10`, color: `${color}90`, border: `1px solid ${color}25` }}
              >
                {src}
              </span>
            ))}
          </div>

          {/* Deep structured explanation — connects this flag to the user's chart */}
          <DeepExplanationView explanation={deep} expandLabel="Why this is in your chart" compact />
        </div>
      </div>
    </div>
  );
}
