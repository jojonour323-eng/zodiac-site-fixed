"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown, ChevronRight, Home, Orbit, Sparkles, Moon, Sun, Compass,
} from "lucide-react";
import type { NatalProfile, PlanetSummary } from "@/lib/astro/types";
import { SIGN_META, ELEMENT_COLORS, ELEMENT_LABELS } from "@/lib/astro/signs";
import {
  interpretPlanetInSign,
  PLANET_ROLES,
  PLANET_ROLE_SHORT,
  PLANET_EMOJI,
  ANGLE_EMOJI,
  houseMeaning,
  houseHeadline,
  houseInSignShort,
  houseInSignLong,
  ordinal,
  ascendantHeadline,
  ascendantLong,
  ascendantTraits,
} from "@/lib/astro/interpretations";
import type { TraitPoint } from "@/lib/astro/interpretations";
import { TraitNicknamesCard } from "./TraitNicknamesCard";

interface DetailedViewProps {
  profile: NatalProfile;
  onBack: () => void;
}

export function DetailedView({ profile, onBack }: DetailedViewProps) {
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
          <h2 className="text-2xl sm:text-3xl font-semibold text-white">Your full birth chart</h2>
          <p className="text-sm text-white/50 mt-1">
            Every planet, every house — explained in plain English.
          </p>
        </div>
        <Button
          onClick={onBack}
          variant="outline"
          className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          Back to quick view
        </Button>
      </div>

      <PlanetList profile={profile} />
      <CombinedNarratives profile={profile} />
      <EmptyHousesList profile={profile} />
    </motion.div>
  );
}

function CombinedNarratives({ profile }: { profile: NatalProfile }) {
  const narratives = profile.combinedNarratives || [];
  if (narratives.length === 0) return null;
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-300" /> How your chart works together
      </h3>
      <p className="text-sm text-white/50">
        Real readings don&apos;t explain one planet at a time. Here&apos;s how your placements actually combine in real behavior.
      </p>
      <div className="space-y-3">
        {narratives.map((n, i) => (
          <CombinedNarrativeCard key={i} narrative={n} index={i} />
        ))}
      </div>
    </section>
  );
}

function CombinedNarrativeCard({
  narrative,
  index,
}: {
  narrative: { title: string; teaser: string; body: string };
  index: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.06, 0.4) }}
    >
      <Card className="border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur">
        <h4 className="text-base font-semibold text-white mb-2">{narrative.title}</h4>
        {/* Teaser: always visible, 1-2 sentence hook */}
        <p className="text-sm sm:text-base text-white/80 leading-relaxed">
          {narrative.teaser}
        </p>
        {/* Full body: hidden until expand */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className="text-sm text-white/75 leading-relaxed whitespace-pre-line pt-3">
                {narrative.body}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-200 hover:text-amber-100 transition-colors"
        >
          {open ? (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> Show less
            </>
          ) : (
            <>
              <ChevronRight className="h-3.5 w-3.5" /> Read the full breakdown
            </>
          )}
        </button>
      </Card>
    </motion.div>
  );
}

function PlanetList({ profile }: { profile: NatalProfile }) {
  // Sun first, then Moon, then Ascendant, then the rest of the planets.
  const luminaryOrder = ["sun", "moon"];
  const luminaries = profile.planets.filter((p) => luminaryOrder.includes(p.id));
  const rest = profile.planets.filter((p) => !luminaryOrder.includes(p.id));

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-300" /> Planets & signs
      </h3>

      {/* Sun first */}
      {luminaries.filter((p) => p.id === "sun").map((p, i) => (
        <PlanetCard key={p.id} planet={p} index={i} />
      ))}
      {/* Moon second */}
      {luminaries.filter((p) => p.id === "moon").map((p, i) => (
        <PlanetCard key={p.id} planet={p} index={i + 1} />
      ))}
      {/* Ascendant third */}
      <AscendantCard profile={profile} />
      {/* Rest of the planets */}
      {rest.map((p, i) => (
        <PlanetCard key={p.id} planet={p} index={i + 2} />
      ))}
    </section>
  );
}

function AscendantCard({ profile }: { profile: NatalProfile }) {
  const asc = profile.ascendant;
  const meta = SIGN_META[asc.signId];
  const color = ELEMENT_COLORS[asc.element];
  const long = ascendantLong(asc.signId);

  return (
    <Card className="overflow-hidden border-white/10 bg-white/[0.03] backdrop-blur">
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 font-serif text-3xl"
            style={{
              background: `radial-gradient(circle, ${color}33, transparent 70%)`,
              border: `1px solid ${color}55`,
              color,
            }}
          >
            {meta.glyph}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-lg font-semibold text-white">
                <span className="mr-1.5">{ANGLE_EMOJI.asc}</span>
                Ascendant (Rising)
              </h4>
              <Badge variant="outline" className="border-white/20 text-white/70">
                {meta.name}
              </Badge>
              <Badge variant="outline" className="border-white/20 text-white/70">
                {ELEMENT_LABELS[asc.element]} · {asc.modality}
              </Badge>
            </div>
            <div className="mt-2">
              <Badge className="bg-amber-300/15 text-amber-200 border-amber-300/30 text-xs">
                Your Mask — how others first see you
              </Badge>
            </div>
            <p className="text-xs text-white/50 mt-2">
              The sign rising on the eastern horizon at the moment you were born. It shapes your appearance, your first impression, and the lens through which the rest of your chart expresses itself.
            </p>
          </div>
        </div>
        <ExpandableExplanation
          headline={ascendantHeadline(asc.signId)}
          traits={ascendantTraits(asc.signId)}
          short={`Your Rising sign is ${meta.name}. ${meta.vibe}`}
          long={long}
        />
      </div>
    </Card>
  );
}

function PlanetCard({ planet, index }: { planet: PlanetSummary; index: number }) {
  const meta = SIGN_META[planet.signId];
  const color = ELEMENT_COLORS[planet.element];
  const interp = interpretPlanetInSign(planet.id, planet.signId);
  const role = PLANET_ROLES[planet.id];
  const roleShort = PLANET_ROLE_SHORT[planet.id];
  const isLuminary = planet.id === "sun" || planet.id === "moon";

  const Icon = planet.id === "sun" ? Sun : planet.id === "moon" ? Moon : Orbit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
    >
      <Card className="overflow-hidden border-white/10 bg-white/[0.03] backdrop-blur">
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
        />
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `radial-gradient(circle, ${color}33, transparent 70%)`,
                border: `1px solid ${color}55`,
              }}
            >
              <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base sm:text-lg font-semibold text-white">
                  <span className="mr-1.5">{PLANET_EMOJI[planet.id]}</span>
                  {planet.name}
                  {planet.retrograde && (
                    <span className="ml-2 text-xs text-amber-300 uppercase tracking-wide">Retrograde</span>
                  )}
                </h4>
                <Badge variant="outline" className="border-white/20 text-white/70">
                  {meta.glyph} {meta.name}
                </Badge>
                <Badge variant="outline" className="border-white/20 text-white/70">
                  House {planet.house}
                </Badge>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <Badge className="bg-amber-300/15 text-amber-200 border-amber-300/30 text-xs">
                  {roleShort}
                </Badge>
                {isLuminary && (
                  <Badge className="bg-violet-400/15 text-violet-200 border-violet-400/30 text-xs">
                    Big 3
                  </Badge>
                )}
              </div>
              <p className="text-xs text-white/50 mt-2">{role}</p>
            </div>
          </div>
          <ExpandableExplanation
            headline={interp.headline}
            traits={interp.traits}
            short={interp.short}
            long={interp.long}
          />
          <TraitNicknamesCard planet={planet.id} sign={planet.signId} retrograde={planet.retrograde} />
          {/* House info inline — combined with the planet, not separate */}
          <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Home className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs font-semibold text-white/70">
                In your {planet.house}{ordinal(planet.house)} house
              </span>
              <span className="text-xs text-white/40">— {houseMeaning(planet.house).name.toLowerCase()}</span>
            </div>
            <p className="text-xs text-white/55 leading-relaxed">
              {houseInSignShort(planet.house, planet.signId)}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function EmptyHousesList({ profile }: { profile: NatalProfile }) {
  if (profile.houses.length === 0) return null;
  // Find houses that have no planets in them — the ones with planets are
  // already shown inline in each planet card.
  const housesWithPlanets = new Set(profile.planets.map((p) => p.house));
  const emptyHouses = profile.houses.filter((h) => !housesWithPlanets.has(h.house));
  if (emptyHouses.length === 0) return null;

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Compass className="h-5 w-5 text-amber-300" /> Your empty houses
      </h3>
      <p className="text-sm text-white/50">
        These houses have no planets in them — they still shape your chart, just more quietly.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {emptyHouses.map((h, i) => {
          const meaning = houseMeaning(h.house);
          const meta = SIGN_META[h.signId];
          const color = ELEMENT_COLORS[meta.element];
          return (
            <motion.div
              key={h.house}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.4) }}
            >
              <Card className="border-white/10 bg-white/[0.03] p-4 backdrop-blur h-full">
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-serif text-lg"
                    style={{
                      background: `${color}1f`,
                      border: `1px solid ${color}44`,
                      color,
                    }}
                  >
                    {meta.glyph}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-mono text-white/40">H{h.house}</span>
                      <h5 className="text-sm font-semibold text-white">{meaning.name}</h5>
                    </div>
                    <p className="text-xs text-white/60 mt-1">
                      {meta.name} · {meta.element}
                    </p>
                    <ExpandableExplanation
                      headline={houseHeadline(h.house, h.signId)}
                      short={houseInSignShort(h.house, h.signId)}
                      long={houseInSignLong(h.house, h.signId)}
                      small
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

interface LongShape {
  positive: string;
  shadow: string;
  takeaway: string;
}

function ExpandableExplanation({
  headline,
  short,
  traits,
  long,
  small,
  expandLabel = "Expand for the deeper meaning",
}: {
  headline?: string;
  short?: string;
  traits?: TraitPoint[];
  long: LongShape;
  small?: boolean;
  expandLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      {/* Headline: always visible, punchy one-liner */}
      {headline && (
        <p className={`font-medium text-white leading-relaxed ${small ? "text-sm" : "text-sm sm:text-base"}`}>
          {headline}
        </p>
      )}
      {/* Trait list + deeper explanation: hidden until expand */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              {/* Trait list — clean bullet points, normal font size/weight */}
              {traits && traits.length > 0 && (
                <ul className={`space-y-1 ${small ? "text-xs" : "text-sm"}`}>
                  {traits.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/70 leading-relaxed">
                      <span className="text-amber-300/40 mt-0.5 flex-shrink-0">•</span>
                      <span>{t.label.toLowerCase().replace(/^you /, "")} {t.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {short && (
                <p className={`text-white/70 leading-relaxed ${small ? "text-xs" : "text-sm"}`}>
                  {short}
                </p>
              )}
              <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.04] p-3">
                <div className="text-xs uppercase tracking-wider text-emerald-300/80 mb-1">
                  The bright side
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{long.positive}</p>
              </div>
              <div className="rounded-lg border border-rose-300/20 bg-rose-300/[0.04] p-3">
                <div className="text-xs uppercase tracking-wider text-rose-300/80 mb-1">
                  The shadow
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{long.shadow}</p>
              </div>
              <div className="rounded-lg border border-amber-300/20 bg-amber-300/[0.04] p-3">
                <div className="text-xs uppercase tracking-wider text-amber-300/80 mb-1">
                  Takeaway
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{long.takeaway}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((v) => !v)}
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-200 hover:text-amber-100 transition-colors"
      >
        {open ? (
          <>
            <ChevronDown className="h-3.5 w-3.5" /> Show less
          </>
        ) : (
          <>
            <ChevronRight className="h-3.5 w-3.5" /> {expandLabel}
          </>
        )}
      </button>
    </div>
  );
}
