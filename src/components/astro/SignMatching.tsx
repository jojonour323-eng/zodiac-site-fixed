"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SIGN_META, ELEMENT_COLORS, ELEMENT_LABELS } from "@/lib/astro/signs";
import type { SignId, PlanetId } from "@/lib/astro/types";
import { PLANET_EMOJI, PLANET_ROLE_SHORT } from "@/lib/astro/interpretations";
import { bestMatchesFor, planetMatches, signPairScore } from "@/lib/astro/matches";
import { Heart, Users, Sparkles, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";

interface SignMatchingProps {
  sunSign: SignId;
  moonSign?: SignId;
  onOpenFullCompatibility?: () => void;
}

type MatchType = "love" | "friend" | "all";

export function SignMatching({ sunSign, moonSign, onOpenFullCompatibility }: SignMatchingProps) {
  const [matchType, setMatchType] = useState<MatchType>("love");
  const [showAllPlanets, setShowAllPlanets] = useState(false);
  const sunMeta = SIGN_META[sunSign];

  const matches = bestMatchesFor(sunSign);

  return (
    <section className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-rose-200">
          <Heart className="h-3.5 w-3.5" /> Sign Matching
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mt-3">
          Who matches with your {sunMeta.name}?
        </h2>
        <p className="text-sm text-white/50 mt-1 max-w-md mx-auto">
          Based on your Sun sign&apos;s element and modality. Switch to see love or friendship matches.
        </p>
      </div>

      {/* Match type toggle */}
      <div className="flex justify-center gap-2">
        <Button
          size="sm"
          variant={matchType === "love" ? "default" : "outline"}
          onClick={() => setMatchType("love")}
          className={matchType === "love" ? "bg-rose-500 hover:bg-rose-400 text-white" : "border-white/10 bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10"}
        >
          <Heart className="mr-1.5 h-3.5 w-3.5" /> Love
        </Button>
        <Button
          size="sm"
          variant={matchType === "friend" ? "default" : "outline"}
          onClick={() => setMatchType("friend")}
          className={matchType === "friend" ? "bg-emerald-500 hover:bg-emerald-400 text-white" : "border-white/10 bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10"}
        >
          <Users className="mr-1.5 h-3.5 w-3.5" /> Friendship
        </Button>
        <Button
          size="sm"
          variant={matchType === "all" ? "default" : "outline"}
          onClick={() => setMatchType("all")}
          className={matchType === "all" ? "bg-violet-500 hover:bg-violet-400 text-white" : "border-white/10 bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/10"}
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> All Signs
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {matchType === "love" && (
          <motion.div
            key="love"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <MatchGrid
              title="Best love matches"
              signs={matches.love}
              yourSign={sunSign}
              accent="rose"
              icon={Heart}
            />
            {matches.challenging.length > 0 && (
              <MatchGrid
                title="Challenging matches"
                signs={matches.challenging}
                yourSign={sunSign}
                accent="amber"
                icon={Sparkles}
                compact
              />
            )}
          </motion.div>
        )}

        {matchType === "friend" && (
          <motion.div
            key="friend"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <MatchGrid
              title="Best friendship matches"
              signs={matches.friends}
              yourSign={sunSign}
              accent="emerald"
              icon={Users}
            />
          </motion.div>
        )}

        {matchType === "all" && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <AllSignsGrid yourSign={sunSign} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Per-planet matching */}
      <div className="pt-4">
        <button
          onClick={() => setShowAllPlanets((v) => !v)}
          className="inline-flex items-center gap-1 text-sm font-medium text-amber-200 hover:text-amber-100 transition-colors"
        >
          {showAllPlanets ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          See matches by planet (Moon, Venus, Mars, etc.)
        </button>
        <AnimatePresence>
          {showAllPlanets && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <PlanetMatchGrid sunSign={sunSign} moonSign={moonSign} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Link to full compatibility tool */}
      {onOpenFullCompatibility && (
        <Card className="border-rose-300/20 bg-rose-300/[0.04] p-5 backdrop-blur">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-rose-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">Want a deeper compatibility check?</h4>
              <p className="text-xs text-white/60 mt-1">
                Enter your partner&apos;s birth date for a full synastry chart with real aspect scores, strengths, and friction points.
              </p>
              <Button
                size="sm"
                onClick={onOpenFullCompatibility}
                className="mt-3 bg-rose-500 hover:bg-rose-400 text-white"
              >
                Open full compatibility tool <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}

function MatchGrid({
  title,
  signs,
  yourSign,
  accent,
  icon: Icon,
  compact,
}: {
  title: string;
  signs: SignId[];
  yourSign: SignId;
  accent: "rose" | "emerald" | "amber";
  icon: React.ElementType;
  compact?: boolean;
}) {
  const accentColor =
    accent === "rose" ? "#fb7185" :
    accent === "emerald" ? "#34d399" : "#fbbf24";
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: accentColor }} />
        {title}
      </h3>
      <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-3"} gap-3`}>
        {signs.map((sign, i) => {
          const meta = SIGN_META[sign];
          const color = ELEMENT_COLORS[meta.element];
          const score = signPairScore(yourSign, sign);
          return (
            <motion.div
              key={sign}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto font-serif text-2xl mb-2"
                  style={{ background: `${color}1f`, border: `1px solid ${color}44`, color }}
                >
                  {meta.glyph}
                </div>
                <div className="text-sm font-semibold text-white">{meta.name}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                  {ELEMENT_LABELS[meta.element]}
                </div>
                <div className="space-y-1">
                  <ScoreBar label="Love" value={score.love} color="#fb7185" />
                  <ScoreBar label="Friend" value={score.friend} color="#34d399" />
                </div>
                <p className="text-[10px] text-white/50 mt-2 leading-relaxed">{score.reason}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-0.5">
        <span className="text-white/50">{label}</span>
        <span className="tabular-nums text-white/60">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
      </div>
    </div>
  );
}

function AllSignsGrid({ yourSign }: { yourSign: SignId }) {
  const allSigns: SignId[] = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {allSigns.map((sign, i) => {
        const meta = SIGN_META[sign];
        const color = ELEMENT_COLORS[meta.element];
        const score = signPairScore(yourSign, sign);
        const isYou = sign === yourSign;
        return (
          <motion.div
            key={sign}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className={`p-3 backdrop-blur ${isYou ? "border-amber-300/40 bg-amber-300/[0.08]" : "border-white/10 bg-white/[0.03]"}`}>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm flex-shrink-0"
                  style={{ background: `${color}1f`, border: `1px solid ${color}44`, color }}
                >
                  {meta.glyph}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white">
                    {meta.name} {isYou && <span className="text-amber-300">(you)</span>}
                  </div>
                  <div className="flex gap-2 text-[10px] text-white/50">
                    <span>Love {score.love}</span>
                    <span>Friend {score.friend}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function PlanetMatchGrid({ sunSign, moonSign }: { sunSign: SignId; moonSign?: SignId }) {
  const planets: PlanetId[] = ["sun", "moon", "venus", "mars", "mercury"];
  // If we don't have the moon sign from the profile, use the sun sign as fallback
  const signsByPlanet: Record<PlanetId, SignId> = {
    sun: sunSign,
    moon: moonSign || sunSign,
    venus: sunSign,
    mars: sunSign,
    mercury: sunSign,
  };

  return (
    <div className="space-y-3 mt-4">
      {planets.map((planet) => {
        const yourSign = signsByPlanet[planet];
        const result = planetMatches(planet, yourSign);
        const emoji = PLANET_EMOJI[planet];
        const roleShort = PLANET_ROLE_SHORT[planet];
        return (
          <Card key={planet} className="border-white/10 bg-white/[0.03] p-4 backdrop-blur">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{emoji}</span>
              <div>
                <div className="text-sm font-semibold text-white">{roleShort}</div>
                <div className="text-[10px] text-white/40">
                  Your {planet === "sun" ? "Sun" : planet === "moon" ? "Moon" : planet.charAt(0).toUpperCase() + planet.slice(1)}: {SIGN_META[yourSign].name}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-rose-300/70 mb-2 flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Best Love
                </div>
                <div className="space-y-1.5">
                  {result.bestLove.map((m) => (
                    <SignScoreRow key={m.sign} sign={m.sign} score={m.love} />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-300/70 mb-2 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Best Friends
                </div>
                <div className="space-y-1.5">
                  {result.bestFriend.map((m) => (
                    <SignScoreRow key={m.sign} sign={m.sign} score={m.friend} />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function SignScoreRow({ sign, score }: { sign: SignId; score: number }) {
  const meta = SIGN_META[sign];
  const color = ELEMENT_COLORS[meta.element];
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center font-serif text-[10px] flex-shrink-0"
        style={{ background: `${color}1f`, border: `1px solid ${color}44`, color }}
      >
        {meta.glyph}
      </div>
      <span className="text-xs text-white/70 flex-1">{meta.name}</span>
      <span className="text-xs font-semibold tabular-nums" style={{ color: scoreColor(score) }}>{score}%</span>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 80) return "#34d399";
  if (score >= 60) return "#a78bfa";
  if (score >= 40) return "#fbbf24";
  return "#fb7185";
}
