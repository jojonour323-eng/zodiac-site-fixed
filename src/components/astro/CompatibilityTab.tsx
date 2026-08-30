"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SIGN_META, SIGN_EMOJI, ELEMENT_COLORS, ELEMENT_LABELS } from "@/lib/astro/signs";
import type { SignId, NatalProfile } from "@/lib/astro/types";
import { signPairScore } from "@/lib/astro/matches";
import { generateCompatibilityExplanation } from "@/lib/astro/compatibilityReading";
import { CompatibilityChecker } from "./CompatibilityChecker";
import { Heart, Users, ArrowRight, Moon, Sun, Search, ChevronDown } from "lucide-react";
import type { BirthRequest } from "@/lib/astro/types";

const ALL_SIGNS: SignId[] = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];

interface CompatibilityTabProps {
  /** Full natal profile — auto-loaded, no manual picking needed. */
  profile?: NatalProfile | null;
  /** Gender from the birth form — used as a display filter only. */
  gender?: "male" | "female" | null;
  /** Own birth request — enables the whole-chart two-person tool inline. */
  birth?: BirthRequest | null;
  /** Called when the user wants to enter their birth data. */
  onEnterBirthData?: () => void;
  /** Called when the user wants to open the full synastry tool (optional). */
  onOpenFullTool?: () => void;
}

type MatchKind = "love" | "friendship";

export function CompatibilityTab({ profile, gender, birth, onEnterBirthData }: CompatibilityTabProps) {
  const [matchKind, setMatchKind] = useState<MatchKind>("love");
  const [lookupSign, setLookupSign] = useState<SignId | null>(null);

  // No birth data — show a prompt.
  if (!profile || !gender) {
    return (
      <div className="space-y-8">
        <Header />
        <Card className="border-rose-400/20 bg-rose-400/[0.04] p-6 sm:p-8 backdrop-blur text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-400/15 border border-rose-400/30 flex items-center justify-center mb-4">
            <Heart className="h-5 w-5 text-rose-300" />
          </div>
          <h3 className="text-lg font-semibold text-white">Enter your birth data first</h3>
          <p className="text-sm text-white/60 mt-2 max-w-sm mx-auto">
            Once you enter your birth details, this tab will auto-load your Sun, Moon, and Rising signs and show you your top matches instantly — no manual picking required.
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

  const sunSign = profile.sun.signId;
  const moonSign = profile.moon.signId;

  // Compute match scores using the FULL chart — not just Sun+Moon.
  // Each candidate sign is scored against the user's Sun, Moon, Rising, Venus,
  // Mars, Mercury, and Saturn. The reason text is personalized based on the
  // user's actual placements, so two different Aries users get different text.
  const allMatches = useMemo(() => {
    const venus = profile.planets.find((p) => p.id === "venus")?.signId;
    const mars = profile.planets.find((p) => p.id === "mars")?.signId;
    const mercury = profile.planets.find((p) => p.id === "mercury")?.signId;
    const saturn = profile.planets.find((p) => p.id === "saturn")?.signId;
    const rising = profile.ascendant.signId;
    const venusHouse = profile.planets.find((p) => p.id === "venus")?.house;
    const marsHouse = profile.planets.find((p) => p.id === "mars")?.house;

    return ALL_SIGNS.map((candidate) => {
      // Score against ALL the user's planets (weighted by importance)
      const sunS = signPairScore(sunSign, candidate);
      const moonS = signPairScore(moonSign, candidate);
      const venusS = venus ? signPairScore(venus, candidate) : null;
      const marsS = mars ? signPairScore(mars, candidate) : null;
      const mercS = mercury ? signPairScore(mercury, candidate) : null;
      const risingS = signPairScore(rising, candidate);
      const satS = saturn ? signPairScore(saturn, candidate) : null;

      // Weighted combined love score
      let loveSum = sunS.love * 0.3 + moonS.love * 0.25 + risingS.love * 0.1;
      let loveW = 0.65;
      if (venusS) { loveSum += venusS.love * 0.2; loveW += 0.2; }
      if (marsS) { loveSum += marsS.love * 0.15; loveW += 0.15; }

      // Weighted combined friend score
      let friendSum = sunS.friend * 0.25 + moonS.friend * 0.25 + risingS.friend * 0.1;
      let friendW = 0.6;
      if (mercS) { friendSum += mercS.friend * 0.2; friendW += 0.2; }
      if (marsS) { friendSum += marsS.friend * 0.1; friendW += 0.1; }
      if (satS) { friendSum += satS.friend * 0.1; friendW += 0.1; }

      const combinedLove = Math.round(loveSum / loveW * 100) / 100;
      const combinedFriend = Math.round(friendSum / friendW * 100) / 100;

      // One-word vibe tag based on the actual dynamic
      const vibeTag = computeVibeTag(combinedLove, candidate, sunSign, moonSign, venus, mars);

      // Personalized reason text — references the user's actual placements
      const reason = computePersonalizedReason(candidate, sunSign, moonSign, venus, mars, mercury, rising, saturn, venusHouse, marsHouse);

      return {
        sign: candidate,
        love: Math.round(combinedLove),
        friend: Math.round(combinedFriend),
        reason,
        vibeTag,
        isSameSign: candidate === sunSign || candidate === moonSign,
      };
    }).sort((a, b) => (matchKind === "love" ? b.love - a.love : b.friend - a.friend));
  }, [sunSign, moonSign, profile, matchKind]);

  // Compute the one-word vibe tag from the actual score + element dynamic
  function computeVibeTag(
    love: number,
    candidate: SignId,
    sun: SignId,
    moon: SignId,
    venus?: SignId,
    mars?: SignId
  ): string {
    // Check for quincunx (150° — signs that share neither element nor modality)
    const order: SignId[] = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
    const idxA = order.indexOf(sun);
    const idxB = order.indexOf(candidate);
    const diff = ((idxB - idxA) % 12 + 12) % 12;
    const isQuincunx = diff === 5 || diff === 7;

    if (candidate === sun || candidate === moon) return "Mirror";
    if (love >= 85) return "Easy";
    if (love >= 75) return "Electric";
    if (love >= 65) return "Solid";
    if (love >= 55) return "Slow-burn";
    if (love >= 45) return "Work";
    if (isQuincunx) return "Curious";
    return "Rough";
  }

  // Personalized reason text — references the user's actual chart, not just Sun.
  // Two different Aries users with different Venus/Mars/Rising will get different text.
  function computePersonalizedReason(
    candidate: SignId,
    sun: SignId,
    moon: SignId,
    venus: SignId | undefined,
    mars: SignId | undefined,
    mercury: SignId | undefined,
    rising: SignId,
    saturn: SignId | undefined,
    venusHouse: number | undefined,
    marsHouse: number | undefined
  ): string {
    const parts: string[] = [];
    const sunScore = signPairScore(sun, candidate).love;

    // Sun dynamic
    if (sun === candidate) {
      parts.push("You share the same core wavelength — no translation needed on the fundamentals");
    } else if (sunScore >= 85) {
      parts.push("Your core selves naturally click — same language, minimal friction");
    } else if (sunScore >= 70) {
      parts.push("Your core selves are complementary — enough overlap to connect, enough difference to grow");
    } else {
      parts.push("Your core selves run on different wiring — conscious translation required");
    }

    // Moon dynamic
    const moonScore = signPairScore(moon, candidate).love;
    if (moon === candidate) {
      parts.push("your inner worlds match — you'll feel safe with each other without trying");
    } else if (moonScore >= 80) {
      parts.push("your emotional rhythms sync naturally — comfort is effortless here");
    } else if (moonScore >= 60) {
      parts.push("your emotional worlds are compatible — different enough to add range, similar enough to feel safe");
    } else {
      parts.push("your emotional worlds need conscious adjustment — not effortless, but workable with awareness");
    }

    // Venus dynamic (if available) — attraction-specific
    if (venus) {
      const vScore = signPairScore(venus, candidate).love;
      if (vScore >= 80) {
        parts.push(venusHouse === 7
          ? "there's real romantic chemistry here — your love nature is in its natural element with this sign"
          : "there's genuine attraction — the way you love aligns with how they naturally are");
      } else if (vScore >= 60) {
        parts.push("there's romantic potential — the attraction isn't instant, but it builds with proximity");
      } else if (vScore < 45) {
        parts.push("the attraction axis is challenging — what you're drawn to and what they offer don't naturally align");
      }
    }

    // Mars dynamic (if available) — drive/chemistry-specific
    if (mars) {
      const mScore = signPairScore(mars, candidate).love;
      if (mScore >= 80) {
        parts.push(marsHouse === 5 || marsHouse === 8
          ? "the physical chemistry is strong — the spark is real and it runs deep"
          : "your drive and their energy create real momentum together");
      } else if (mScore >= 60) {
        parts.push("there's physical chemistry — not explosive, but it builds steadily");
      } else if (mScore < 45) {
        parts.push("the drive dynamic has friction — how you each go after things pulls in different directions");
      }
    }

    // Mercury dynamic (if available) — communication
    if (mercury) {
      const mercScore = signPairScore(mercury, candidate).friend;
      if (mercScore >= 80) {
        parts.push("you'll rarely feel misunderstood — conversations flow naturally");
      } else if (mercScore < 50) {
        parts.push("communication will need patience — you process words differently");
      }
    }

    // Saturn stability note (if available)
    if (saturn && signPairScore(saturn, candidate).love >= 75) {
      parts.push("there's a stability axis here — the kind that makes things last, not just spark");
    }

    return parts.join("; ") + ".";
  }

  // Good matches only: score >= 60 on the active metric.
  // Same-sign matches are ALWAYS included, even if the combined score dips
  // below 60 (because the Moon cross can drag it down even though same-sign
  // Sun alone is strong). The user should always see their own sign.
  const goodMatches = allMatches.filter((m) => {
    const score = matchKind === "love" ? m.love : m.friend;
    return score >= 60 || m.isSameSign;
  });

  // Worst match (separate small section).
  const worstMatch = allMatches[allMatches.length - 1];

  // Lookup result (if user picked a specific sign).
  const lookupResult = lookupSign
    ? allMatches.find((m) => m.sign === lookupSign)
    : null;

  return (
    <div className="space-y-8">
      {/* WHOLE-CHART COMPATIBILITY — both full charts interacting */}
      {birth && (
        <section>
          <CompatibilityChecker self={birth} onReset={() => {}} />
        </section>
      )}

      <div className="pt-6 border-t border-white/10">
        <Header />
      </div>

      {/* Reading-from banner */}
      <Card className="border-white/10 bg-white/[0.03] p-4 backdrop-blur">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-xs uppercase tracking-wider text-white/40">Your chart</div>
          <SignChip sign={sunSign} kind="Sun" />
          <SignChip sign={moonSign} kind="Moon" />
          <SignChip sign={profile.ascendant.signId} kind="Rising" />
        </div>
      </Card>

      {/* Tabs: Love / Friendship */}
      <div className="flex gap-2 justify-center">
        <TabButton
          active={matchKind === "love"}
          onClick={() => setMatchKind("love")}
          icon={Heart}
          label="Love Matches"
        />
        <TabButton
          active={matchKind === "friendship"}
          onClick={() => setMatchKind("friendship")}
          icon={Users}
          label="Friendship"
        />
      </div>

      {/* Top matches — good only, ranked */}
      <Card className="border-rose-300/20 bg-rose-300/[0.04] p-5 backdrop-blur">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-rose-400/15 border border-rose-400/30 flex items-center justify-center">
            <Heart className="h-4 w-4 text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold text-rose-300 uppercase tracking-wider">
            Your Top {matchKind === "love" ? "Love" : "Friendship"} Matches
          </h3>
        </div>
        <p className="text-xs text-white/50 mb-4">
          Ranked best to good. Scores below 60 are filtered out — you don&apos;t need to see your worst matches mixed in.
        </p>
        <div className="space-y-2.5">
          {goodMatches.length === 0 ? (
            <p className="text-sm text-white/50 italic">No strong matches found at the 60+ threshold. Try switching to Friendship, or check a specific sign below.</p>
          ) : (
            goodMatches.map((match, i) => (
              <MatchRow key={match.sign} rank={i + 1} match={match} kind={matchKind} profile={profile} />
            ))
          )}
        </div>
      </Card>

      {/* Worst match — small separate section */}
      {worstMatch && (matchKind === "love" ? worstMatch.love : worstMatch.friend) < 50 && (
        <Card className="border-rose-400/20 bg-rose-400/[0.06] p-4 backdrop-blur">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider text-rose-300/80">Toughest Match</span>
          </div>
          <MatchRow match={worstMatch} kind={matchKind} compact />
        </Card>
      )}

      {/* Lookup any specific sign */}
      <Card className="border-white/10 bg-white/[0.03] p-5 backdrop-blur">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-300/15 border border-amber-300/30 flex items-center justify-center">
            <Search className="h-4 w-4 text-amber-300" />
          </div>
          <h3 className="text-sm font-semibold text-amber-200 uppercase tracking-wider">Check a Specific Sign</h3>
        </div>
        <p className="text-xs text-white/50 mb-4">
          Curious about a specific sign, even if it&apos;s not in your top matches? Pick any sign and see your full compatibility breakdown.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
          {ALL_SIGNS.map((sign) => {
            const meta = SIGN_META[sign];
            const color = ELEMENT_COLORS[meta.element];
            const isSelected = lookupSign === sign;
            return (
              <button
                key={sign}
                onClick={() => setLookupSign(sign)}
                className={`rounded-xl border p-2.5 text-center transition-all duration-200 ${
                  isSelected ? "border-amber-300/60 bg-amber-300/[0.1] scale-105" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
                }`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto font-serif text-base mb-0.5" style={{ background: `${color}1f`, border: `1px solid ${color}44`, color }}>
                  {meta.glyph}
                </div>
                <div className="text-[10px] font-medium text-white">{meta.name}</div>
              </button>
            );
          })}
        </div>
        <AnimatePresence>
          {lookupResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-amber-300/20 bg-amber-300/[0.04] p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl" style={{ background: `${ELEMENT_COLORS[SIGN_META[lookupResult.sign].element]}1f`, border: `1px solid ${ELEMENT_COLORS[SIGN_META[lookupResult.sign].element]}44`, color: ELEMENT_COLORS[SIGN_META[lookupResult.sign].element] }}>
                  {SIGN_META[lookupResult.sign].glyph}
                </div>
                <div>
                  <div className="text-base font-semibold text-white">{SIGN_META[lookupResult.sign].name} {SIGN_EMOJI[lookupResult.sign]}</div>
                  {lookupResult.isSameSign && (
                    <div className="text-[10px] text-amber-300 uppercase tracking-wide">Same sign as you</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">{lookupResult.vibeTag || "—"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <ScoreBox label="Love" value={lookupResult.love} />
                <ScoreBox label="Friendship" value={lookupResult.friend} />
              </div>
              {(() => {
                const expl = generateCompatibilityExplanation(profile, lookupResult.sign);
                return (
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-rose-300/80 mb-1.5">Why the Love score is {expl.loveScore}%</div>
                      <ul className="space-y-1">
                        {expl.loveLines.map((line, i) => (
                          <li key={i} className="text-[11px] text-white/70 leading-relaxed flex items-start gap-1.5">
                            <span className="text-rose-300/40 mt-0.5">•</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-emerald-300/80 mb-1.5">Why the Friendship score is {expl.friendScore}%</div>
                      <ul className="space-y-1">
                        {expl.friendLines.map((line, i) => (
                          <li key={i} className="text-[11px] text-white/70 leading-relaxed flex items-start gap-1.5">
                            <span className="text-emerald-300/40 mt-0.5">•</span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-[11px] text-white/65 leading-relaxed">{expl.dailyLife}</div>
                    <div className="text-[11px] text-rose-300/70 leading-relaxed">{expl.friction}</div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

    </div>
  );
}

// ---- Sub-components ----

function Header() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-rose-200">
        <Heart className="h-3.5 w-3.5" /> Compatibility
      </div>
      <h1 className="text-3xl sm:text-4xl font-serif font-medium text-white mt-4">
        Who Matches With You
      </h1>
      <p className="text-sm sm:text-base text-white/50 mt-3 max-w-md mx-auto">
        Auto-loaded from your chart. Your top matches, ranked. Same-sign matches included.
      </p>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
      }`}
    >
      <Icon className="h-4 w-4 inline mr-1.5" /> {label}
    </button>
  );
}


function SignChip({ sign, kind }: { sign: SignId; kind: "Sun" | "Moon" | "Rising" }) {
  const meta = SIGN_META[sign];
  const color = ELEMENT_COLORS[meta.element];
  const Icon = kind === "Sun" ? Sun : kind === "Moon" ? Moon : ChevronDown;
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1"
      style={{ background: `${color}14`, borderColor: `${color}44` }}
    >
      <Icon className="h-3 w-3" style={{ color }} />
      <span className="text-xs font-medium text-white/80">{meta.name} {SIGN_EMOJI[sign]} {kind}</span>
      <span className="text-[10px] text-white/40">{ELEMENT_LABELS[meta.element]}</span>
    </div>
  );
}

function MatchRow({ match, kind, rank, compact, profile }: { match: { sign: SignId; love: number; friend: number; reason: string; vibeTag?: string; isSameSign: boolean }; kind: MatchKind; rank?: number; compact?: boolean; profile?: NatalProfile | null }) {
  const meta = SIGN_META[match.sign];
  const color = ELEMENT_COLORS[meta.element];
  const score = kind === "love" ? match.love : match.friend;
  const scoreColor = score >= 70 ? "#34d399" : score >= 50 ? "#a78bfa" : score >= 35 ? "#fbbf24" : "#fb7185";
  const [expanded, setExpanded] = useState(false);

  // Generate the placement-specific explanation
  const explanation = profile ? generateCompatibilityExplanation(profile, match.sign) : null;

  return (
    <div className={`rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors ${compact ? "p-2" : "p-2.5"}`}>
      <div className="flex items-center gap-3">
        {rank && (
          <span className="text-[10px] text-white/30 tabular-nums w-6 flex-shrink-0">#{rank}</span>
        )}
        {match.vibeTag && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 flex-shrink-0">
            {match.vibeTag}
          </span>
        )}
        <div className="w-9 h-9 rounded-full flex items-center justify-center font-serif text-sm flex-shrink-0" style={{ background: `${color}1f`, border: `1px solid ${color}44`, color }}>
          {meta.glyph}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white">{meta.name}</div>
          {match.isSameSign && (
            <div className="text-[9px] text-amber-300 uppercase tracking-wide">Same sign</div>
          )}
        </div>
        <div className="flex gap-3 text-right flex-shrink-0">
          <div>
            <div className="text-[9px] text-rose-300/60 uppercase">Love</div>
            <div className="text-sm font-semibold tabular-nums" style={{ color: match.love >= 70 ? "#34d399" : match.love >= 50 ? "#a78bfa" : match.love >= 35 ? "#fbbf24" : "#fb7185" }}>{match.love}%</div>
          </div>
          <div>
            <div className="text-[9px] text-emerald-300/60 uppercase">Friend</div>
            <div className="text-sm font-semibold tabular-nums" style={{ color: match.friend >= 70 ? "#34d399" : match.friend >= 50 ? "#a78bfa" : match.friend >= 35 ? "#fbbf24" : "#fb7185" }}>{match.friend}%</div>
          </div>
        </div>
      </div>
      {explanation && !compact && (
        <>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-[10px] text-amber-200/70 hover:text-amber-100 transition-colors"
          >
            {expanded ? "Hide breakdown" : "Why this score?"}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-2">
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-rose-300/70 mb-1">Love — {explanation.loveScore}%</div>
                    <ul className="space-y-1">
                      {explanation.loveLines.map((line, i) => (
                        <li key={i} className="text-[11px] text-white/70 leading-relaxed flex items-start gap-1.5">
                          <span className="text-rose-300/40 mt-0.5">•</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-wider text-emerald-300/70 mb-1">Friendship — {explanation.friendScore}%</div>
                    <ul className="space-y-1">
                      {explanation.friendLines.map((line, i) => (
                        <li key={i} className="text-[11px] text-white/70 leading-relaxed flex items-start gap-1.5">
                          <span className="text-emerald-300/40 mt-0.5">•</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-[11px] text-white/65 leading-relaxed pt-1">{explanation.dailyLife}</div>
                  <div className="text-[11px] text-rose-300/70 leading-relaxed">{explanation.friction}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function ScoreBox({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "#34d399" : value >= 50 ? "#a78bfa" : value >= 35 ? "#fbbf24" : "#fb7185";
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</div>
      <div className="text-2xl font-bold tabular-nums" style={{ color }}>{value}%</div>
    </div>
  );
}
