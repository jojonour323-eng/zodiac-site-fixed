"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BirthForm } from "./BirthForm";
import {
  Heart, Sparkles, Check, AlertTriangle, ArrowRight, RefreshCw, Lightbulb,
  ChevronDown, ChevronRight,
} from "lucide-react";
import type { BirthRequest, CompatibilityProfile, SignId } from "@/lib/astro/types";
import { CompatAnalysisView } from "./CompatAnalysisView";
import { SIGN_META, SIGN_EMOJI, ELEMENT_COLORS } from "@/lib/astro/signs";
import { pointEmoji, pointDisplayName, PLANET_ROLE_SHORT } from "@/lib/astro/interpretations";
import { generateDeepSynastryExplanation, type ExplanationSection } from "@/lib/astro/deepReading";
import { generateSynastryAspectReading } from "@/lib/astro/synastryReading";
import type { PlanetId } from "@/lib/astro/types";

interface CompatibilityCheckerProps {
  self: BirthRequest;
  onReset: () => void;
}

export function CompatibilityChecker({ self, onReset }: CompatibilityCheckerProps) {
  const [stage, setStage] = useState<"form" | "result">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CompatibilityProfile | null>(null);
  const [partnerName, setPartnerName] = useState<string>("");
  const [partnerReq, setPartnerReq] = useState<BirthRequest | null>(null);

  async function handleSubmit(partner: BirthRequest) {
    setLoading(true);
    setError(null);
    try {
      // Client-side timeout so the UI never hangs forever.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);
      let res: Response;
      try {
        res = await fetch("/api/synastry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personA: self, personB: partner }),
          signal: controller.signal,
        });
      } catch (fetchErr) {
        if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
          throw new Error(
            "The request is taking too long. The astrology service may be slow right now — please try again in a moment."
          );
        }
        throw new Error(
          "Could not reach the server. Please check your connection and try again."
        );
      } finally {
        clearTimeout(timeout);
      }
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }
      setPartnerName(partner.name?.trim() || "Person B");
      setPartnerReq(partner);
      setProfile(data);
      setStage("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-rose-200">
          <Heart className="h-3.5 w-3.5" /> Compatibility
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-white">
          How do you two fit together?
        </h2>
        <p className="text-sm text-white/50 max-w-md mx-auto">
          Enter your partner's birth details. We'll calculate a real synastry score from your combined charts.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {stage === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <SelfSummary self={self} />
            <div className="mt-6 max-w-xl mx-auto">
              <Card className="border-white/10 bg-white/[0.03] backdrop-blur p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-white mb-1">Your partner</h3>
                <p className="text-sm text-white/50 mb-5">
                  Date and city are required. Time improves accuracy. Name is optional — gender isn&apos;t needed here.
                </p>
                <BirthForm
                  onSubmit={handleSubmit}
                  loading={loading}
                  compact
                  submitLabel="Calculate compatibility"
                />
                {error && (
                  <div className="mt-4 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-200">
                    {error}
                  </div>
                )}
              </Card>
            </div>
          </motion.div>
        )}

        {stage === "result" && profile && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <CompatibilityResult profile={profile} nameA={self.name?.trim() || "Person A"} nameB={partnerName || "Person B"} onReset={() => setStage("form")} onRestart={onReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SelfSummary({ self }: { self: BirthRequest }) {
  return (
    <div className="max-w-xl mx-auto rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-white/60">
      <span className="text-white/40">You: </span>
      {self.month}/{self.day}/{self.year}
      {self.timeKnown ? ` at ${self.hour}:${String(self.minute).padStart(2, "0")}` : ""}
      {self.city ? `, ${self.city}` : ""}
    </div>
  );
}

function CompatibilityResult({
  profile,
  nameA,
  nameB,

  onReset,
  onRestart,
}: {
  profile: CompatibilityProfile;
  nameA: string;
  nameB: string;
  onReset: () => void;
  onRestart: () => void;
}) {
  const { overall, domainScores, archetype, strengths, frictions, tensionPoints, personA, personB, narrativeSections } = profile;

  // Honest rating: the whole-chart analysis average (same number as the
  // honest breakdown below), shown out of 10 — never the old detached 0-100.
  const honestOverall = profile.compat?.overall ?? overall;

  const scoreColor =
    honestOverall >= 75 ? "#fbbf24" :
    honestOverall >= 60 ? "#a78bfa" :
    honestOverall >= 45 ? "#60a5fa" :
    honestOverall >= 30 ? "#fb923c" : "#94a3b8";

  return (
    <div className="space-y-8">
      {/* Big score — out of 10, honest, nothing dangling below the number */}
      <div className="flex flex-col items-center gap-4 text-center">
        <ScoreRing value={honestOverall} color={scoreColor} />
        <div className="space-y-1">
          <div className="text-sm uppercase tracking-[0.2em] text-white/40">Overall compatibility</div>
          <div className="text-xl font-semibold text-white">{archetype.label}</div>
          <p className="text-sm text-white/60 max-w-md mx-auto">{archetype.one_liner}</p>
        </div>
      </div>

      {/* Why this score — structured walkthrough, right under the rating */}
      <Card className="border-white/10 bg-white/[0.03] backdrop-blur p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-300" /> Why this score, in plain words
        </h3>
        <div className="space-y-4">
          {narrativeSections.map((s) => (
            <div key={s.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div className="text-sm font-semibold text-amber-200/90 mb-1.5">{s.title}</div>
              {s.body && <p className="text-sm text-white/80 leading-relaxed mb-2">{s.body}</p>}
              {s.bullets && s.bullets.length > 0 && (
                <ul className="space-y-1.5">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/75 leading-relaxed">
                      <span className="text-amber-300/60 mt-1 flex-shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Whole-chart compatibility analysis (personality models + synastry deep-dive) */}
      <CompatAnalysisView
        compat={profile.compat}
        nameA={nameA}
        nameB={nameB}
      />

      {/* Full planet comparison table (all planets, not just Sun/Moon/Rising) */}
      <FullPlanetComparison profile={profile} nameA={nameA} nameB={nameB} />

      {/* Domain breakdown — same numbers as the honest breakdown (Romance =
          Attraction, Stability = Trust, Intimacy = Emotional, Growth = Long-
          Term), each bar expands to show the aspects driving it. */}
      <Card className="border-white/10 bg-white/[0.03] backdrop-blur p-6">
        <h3 className="text-lg font-semibold text-white mb-1">Where you click — and where you don&apos;t</h3>
        <p className="text-xs text-white/50 mb-4">
          Five domains, scored out of 10 — the same numbers as the honest breakdown above. Tap any row to see what&apos;s driving the score.
        </p>
        <div className="space-y-2">
          {domainScores.map((d) => (
            <DomainBar
              key={d.key}
              domainKey={d.key}
              label={d.label}
              value={d.value}
              strengths={strengths}
              frictions={frictions}
            />
          ))}
        </div>
      </Card>

      {/* Strengths */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <Check className="h-5 w-5 text-emerald-300" /> What matches well
        </h3>
        <p className="text-xs text-white/50 mb-4">
          The strongest harmonious contacts between your two charts. Tap any card to see why it works and what it gives you.
        </p>
        {strengths.length === 0 ? (
          <p className="text-sm text-white/50">No standout harmonious contacts in this pairing.</p>
        ) : (
          <div className="space-y-3">
            {strengths.map((s, i) => (
              <PairCard key={i} item={s} kind="strength" profile={profile} />
            ))}
          </div>
        )}
      </section>

      {/* Frictions */}
      <section>
        <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-300" /> Where friction lives
        </h3>
        <p className="text-xs text-white/50 mb-4">
          The tense contacts. These aren't dealbreakers — they're the places you'll have to actually do the work of understanding each other.
        </p>
        {frictions.length === 0 ? (
          <p className="text-sm text-white/50">No major tension points detected — enjoy the calm.</p>
        ) : (
          <div className="space-y-3">
            {frictions.map((s, i) => (
              <PairCard key={i} item={s} kind="friction" profile={profile} />
            ))}
          </div>
        )}
      </section>

      {/* Tension points — everyday patterns NOT already covered by a friction
          card above (deduped server-side). Section hides when everything is
          already shown; the green card only appears when there were no
          friction contacts at all. */}
      {(tensionPoints.length > 0 || frictions.length === 0) && (
        <section>
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-300" /> Things to watch out for
          </h3>
          <p className="text-xs text-white/50 mb-4">
            Small, realistic friction patterns to expect — and a practical tip for handling each one.
          </p>
          {tensionPoints.length === 0 ? (
            <Card className="border-emerald-300/30 bg-emerald-300/[0.06] p-5 backdrop-blur">
              <p className="text-sm text-emerald-100/90 leading-relaxed">
                Your charts don&apos;t flag any of the usual everyday friction patterns. That doesn&apos;t mean you&apos;ll never disagree — it just means there&apos;s no built-in structural tension to plan around.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {tensionPoints.map((t, i) => (
                <TensionCard key={i} point={t} />
              ))}
            </div>
          )}
        </section>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Button onClick={onReset} variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
          <RefreshCw className="mr-2 h-4 w-4" /> Try another partner
        </Button>
        <Button onClick={onRestart} variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
          Start over with new birth date
        </Button>
      </div>
    </div>
  );
}

function TensionCard({ point }: { point: CompatibilityProfile["tensionPoints"][number] }) {
  return (
    <Card className="border-white/10 bg-white/[0.03] backdrop-blur overflow-hidden" style={{ borderLeft: "3px solid #fbbf24" }}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="text-sm sm:text-base font-semibold text-white">{point.title}</h4>
          <Badge variant="outline" className="border-white/15 text-white/40 text-[10px] font-mono flex-shrink-0">
            {point.source}
          </Badge>
        </div>
        <p className="text-sm text-white/75 leading-relaxed mb-3">{point.what}</p>
        <div className="rounded-lg border border-amber-300/25 bg-amber-300/[0.06] p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Lightbulb className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-[11px] uppercase tracking-wider text-amber-300/90 font-medium">Try this</span>
          </div>
          <p className="text-sm text-white/85 leading-relaxed">{point.tip}</p>
        </div>
      </div>
    </Card>
  );
}

function ScoreRing({ value, color }: { value: number; color: string }) {
  const size = 200;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  // Honest 0-10 rating with one decimal, shown inline — nothing below it.
  const outOf10 = (value / 10).toFixed(1);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 12px ${color}88)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-5xl font-bold tabular-nums"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {outOf10}
        </motion.span>
        <span className="text-sm text-white/40 ml-1.5 mt-2">/ 10</span>
      </div>
    </div>
  );
}

function ComparisonColumn({ label, sub, aId, bId }: { label: string; sub: string; aId: CompatibilityProfile["personA"]["sun"]; bId: CompatibilityProfile["personB"]["sun"] }) {
  const a = SIGN_META[aId];
  const b = SIGN_META[bId];
  const matches = aId === bId;
  const sameElement = a.element === b.element;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="text-[10px] text-amber-200/70 mb-2">{sub}</div>
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center justify-center w-10 h-10 rounded-full font-serif text-xl" style={{ background: `${ELEMENT_COLORS[a.element]}1f`, border: `1px solid ${ELEMENT_COLORS[a.element]}44`, color: ELEMENT_COLORS[a.element] }}>
          {a.glyph}
        </div>
        <span className="text-xs text-white/70">{a.name} {SIGN_EMOJI[aId]}</span>
        <ArrowRight className="h-3 w-3 text-white/30 my-0.5" />
        <div className="flex items-center justify-center w-10 h-10 rounded-full font-serif text-xl" style={{ background: `${ELEMENT_COLORS[b.element]}1f`, border: `1px solid ${ELEMENT_COLORS[b.element]}44`, color: ELEMENT_COLORS[b.element] }}>
          {b.glyph}
        </div>
        <span className="text-xs text-white/70">{b.name} {SIGN_EMOJI[bId]}</span>
      </div>
      {matches && (
        <Badge className="mt-2 bg-amber-300/20 text-amber-200 border-amber-300/30">Same sign</Badge>
      )}
      {!matches && sameElement && (
        <Badge className="mt-2 bg-emerald-300/20 text-emerald-200 border-emerald-300/30">Same element</Badge>
      )}
    </div>
  );
}

// Full planet comparison — a scannable two-person TABLE instead of the old
// grid of tiny arrow cards: one row per planet, both signs side by side,
// status chip at the end. Tap a row for the full meaning (modal unchanged).
function FullPlanetComparison({ profile, nameA, nameB }: { profile: CompatibilityProfile; nameA: string; nameB: string }) {
  const a = profile.allPlacementsA;
  const b = profile.allPlacementsB;
  const ids = a.map((p) => p.id);
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <Card className="border-white/10 bg-white/[0.03] backdrop-blur p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Your full charts, side by side</h3>
      <p className="text-xs text-white/50 mb-4">
        Every planet and point, compared. Tap any row to see what it means.
      </p>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-2 px-1">
        <div className="text-xs uppercase tracking-wider text-white/40 truncate">{nameA}</div>
        <div className="w-24 sm:w-32" />
        <div className="text-xs uppercase tracking-wider text-white/40 text-right truncate">{nameB}</div>
      </div>

      <div className="space-y-1.5">
        {ids.map((id) => {
          const pa = a.find((p) => p.id === id);
          const pb = b.find((p) => p.id === id);
          if (!pa || !pb) return null;
          return (
            <ComparisonRow
              key={id}
              id={id}
              aId={pa.signId}
              bId={pb.signId}
              isOpen={openId === id}
              onOpen={() => setOpenId(id)}
            />
          );
        })}
      </div>

      {/* Modal overlay — renders above everything, doesn't touch the table. */}
      <AnimatePresence>
        {openId && (
          <PlacementModal
            id={openId}
            aId={a.find((p) => p.id === openId)?.signId ?? "aries"}
            bId={b.find((p) => p.id === openId)?.signId ?? "aries"}
            onClose={() => setOpenId(null)}
          />
        )}
      </AnimatePresence>
    </Card>
  );
}

function ComparisonRow({ id, aId, bId, isOpen, onOpen }: { id: string; aId: SignId; bId: SignId; isOpen: boolean; onOpen: () => void; }) {
  const a = SIGN_META[aId];
  const b = SIGN_META[bId];
  const emoji = pointEmoji(id);
  const name = pointDisplayName(id);
  const roleShort = id in PLANET_ROLE_SHORT ? PLANET_ROLE_SHORT[id as PlanetId] : id === "ascendant" ? "Your Mask" : id === "midheaven" ? "Calling" : "";
  const matches = aId === bId;
  const sameElement = a.element === b.element;
  return (
    <button
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`w-full text-left px-2.5 py-2 rounded-lg border bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-300/40 focus:outline-none focus:border-amber-300/60 transition-colors cursor-pointer grid grid-cols-[1fr_auto_1fr] items-center gap-2 ${
        isOpen ? "border-amber-300/60 bg-amber-300/[0.06]" : "border-white/10"
      }`}
    >
      {/* Person A sign */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center font-serif text-sm flex-shrink-0"
          style={{ background: `${ELEMENT_COLORS[a.element]}1f`, border: `1px solid ${ELEMENT_COLORS[a.element]}44`, color: ELEMENT_COLORS[a.element] }}
          title={a.name}
        >
          {a.glyph}
        </span>
        <span className="text-xs text-white/80 truncate">{a.name}</span>
      </div>

      {/* Planet label */}
      <div className="w-24 sm:w-32 text-center">
        <div className="text-[11px] font-medium text-white/85 leading-tight">{emoji} {name}</div>
        {roleShort && <div className="text-[9px] text-amber-200/60 leading-tight">{roleShort}</div>}
      </div>

      {/* Person B sign + status */}
      <div className="flex items-center justify-end gap-2 min-w-0">
        <span className="text-xs text-white/80 truncate text-right">{b.name}</span>
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center font-serif text-sm flex-shrink-0"
          style={{ background: `${ELEMENT_COLORS[b.element]}1f`, border: `1px solid ${ELEMENT_COLORS[b.element]}44`, color: ELEMENT_COLORS[b.element] }}
          title={b.name}
        >
          {b.glyph}
        </span>
      </div>
      {matches && (
        <span className="col-span-3 justify-self-start mt-0.5 text-[9px] px-1.5 py-0 rounded-full bg-amber-300/20 text-amber-200 border border-amber-300/30">Same sign</span>
      )}
      {!matches && sameElement && (
        <span className="col-span-3 justify-self-start mt-0.5 text-[9px] px-1.5 py-0 rounded-full bg-emerald-300/15 text-emerald-200 border border-emerald-300/30">Same element</span>
      )}
    </button>
  );
}

// Modal that shows the full explanation for a planet comparison without
// disturbing the grid layout. Centered, dark backdrop, click-outside to close.
function PlacementModal({ id, aId, bId, onClose }: { id: string; aId: SignId; bId: SignId; onClose: () => void; }) {
  const a = SIGN_META[aId];
  const b = SIGN_META[bId];
  const emoji = pointEmoji(id);
  const name = pointDisplayName(id);
  const roleShort = id in PLANET_ROLE_SHORT ? PLANET_ROLE_SHORT[id as PlanetId] : id === "ascendant" ? "Your Mask" : id === "midheaven" ? "Calling" : "";
  const matches = aId === bId;
  const sameElement = a.element === b.element;
  // Use the new structured deep explanation instead of the old single-string one.
  const deep = generateDeepSynastryExplanation(id, aId, bId);

  // Close on Escape key.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 12 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl border border-white/15 bg-[#0f0a2e]/95 backdrop-blur-xl shadow-2xl"
      >
        <div className="h-1 w-full bg-gradient-to-r from-amber-300 via-rose-300 to-violet-400" />

        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        <div className="p-5 sm:p-6">
          {/* Header: emoji + name + role */}
          <div className="flex items-center gap-3 mb-4 pr-8">
            <div className="w-12 h-12 rounded-full bg-amber-300/10 border border-amber-300/30 flex items-center justify-center text-2xl flex-shrink-0">
              {emoji}
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{name}</div>
              <div className="text-xs text-amber-200/70">{roleShort}</div>
            </div>
          </div>

          {/* The two signs side by side */}
          <div className="flex items-center justify-center gap-3 mb-4 py-2">
            <div className="flex flex-col items-center gap-1">
              <span
                className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl"
                style={{ background: `${ELEMENT_COLORS[a.element]}1f`, border: `1px solid ${ELEMENT_COLORS[a.element]}55`, color: ELEMENT_COLORS[a.element] }}
              >
                {a.glyph}
              </span>
              <span className="text-xs text-white/70">{a.name} {SIGN_EMOJI[aId]}</span>
              <span className="text-[9px] text-white/40">{a.element}</span>
            </div>
            <ArrowRight className="h-4 w-4 text-white/40" />
            <div className="flex flex-col items-center gap-1">
              <span
                className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl"
                style={{ background: `${ELEMENT_COLORS[b.element]}1f`, border: `1px solid ${ELEMENT_COLORS[b.element]}55`, color: ELEMENT_COLORS[b.element] }}
              >
                {b.glyph}
              </span>
              <span className="text-xs text-white/70">{b.name} {SIGN_EMOJI[bId]}</span>
              <span className="text-[9px] text-white/40">{b.element}</span>
            </div>
          </div>

          {/* Match badge */}
          {matches && (
            <div className="flex justify-center mb-3">
              <Badge className="bg-amber-300/20 text-amber-200 border-amber-300/40">Same sign — you mirror each other here</Badge>
            </div>
          )}
          {!matches && sameElement && (
            <div className="flex justify-center mb-3">
              <Badge className="bg-emerald-300/20 text-emerald-200 border-emerald-300/40">Same element — you speak the same language</Badge>
            </div>
          )}

          {/* Headline — punchy one-liner */}
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3.5 mb-3">
            <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
              {deep.headline}
            </p>
            <p className="text-xs text-white/65 leading-relaxed mt-2">
              {deep.summary}
            </p>
          </div>

          {/* Structured sections — each with heading + body/bullets */}
          <div className="space-y-2.5">
            {deep.sections.map((section, i) => (
              <SynastrySectionBlock key={i} section={section} />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Renders one structured section inside the synastry modal.
// Color-coded by section type so the reader can scan for what they care about.
function SynastrySectionBlock({ section }: { section: ExplanationSection }) {
  let accentColor = "text-amber-200";
  let borderClass = "border-white/10";
  let bgClass = "bg-white/[0.02]";

  const h = section.heading.toLowerCase();
  if (h.includes("bright side")) {
    accentColor = "text-emerald-300";
    borderClass = "border-emerald-300/20";
    bgClass = "bg-emerald-300/[0.04]";
  } else if (h.includes("shadow")) {
    accentColor = "text-rose-300";
    borderClass = "border-rose-300/20";
    bgClass = "bg-rose-300/[0.04]";
  } else if (h.includes("takeaway")) {
    accentColor = "text-amber-300";
    borderClass = "border-amber-300/20";
    bgClass = "bg-amber-300/[0.04]";
  } else if (h.includes("daily life")) {
    accentColor = "text-cyan-300";
    borderClass = "border-cyan-300/20";
    bgClass = "bg-cyan-300/[0.04]";
  } else if (h.includes("controls")) {
    accentColor = "text-violet-300";
    borderClass = "border-violet-300/20";
    bgClass = "bg-violet-300/[0.04]";
  } else if (h.includes("pairing") || h.includes("sign pairing")) {
    accentColor = "text-sky-300";
    borderClass = "border-sky-300/20";
    bgClass = "bg-sky-300/[0.04]";
  }

  return (
    <div className={`rounded-lg border ${borderClass} ${bgClass} p-3.5`}>
      <div className={`text-xs uppercase tracking-wider font-semibold ${accentColor} mb-1.5`}>
        {section.heading}
      </div>
      {section.body && (
        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
          {section.body}
        </p>
      )}
      {section.bullets && section.bullets.length > 0 && (
        <ul className="space-y-1.5 mt-1">
          {section.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/75 leading-relaxed">
              <span className={`${accentColor} mt-0.5 flex-shrink-0`}>•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Plain-English explanation of what each planet/point controls, plus what
// the specific sign pairing means. Used by the clickable comparison cells.
// This is written to be genuinely useful — real astrological insight, not
// generic boilerplate. Simple enough that someone with zero zodiac
// knowledge can follow along.
function placementExplanation(id: string, aId: SignId, bId: SignId): string {
  const a = SIGN_META[aId];
  const b = SIGN_META[bId];
  const name = pointDisplayName(id);
  const sameSign = aId === bId;
  const sameEl = a.element === b.element;

  // What each planet/point governs in a relationship, written in plain English.
  // No "Planet IS your X" framing — just describes the domain directly.
  const whatItControls: Record<string, string> = {
    sun: "This is about core identity — who you fundamentally are, your ego, your life force. When these align well, you recognize something essential in each other. When they clash, you'll feel like you're running on different operating systems.",
    moon: "This is about your emotional world — what you need to feel safe, how you process feelings, what comforts you when you're hurt. It's the invisible factor that decides whether living together feels like home or like work.",
    mercury: "This is about how you think and talk — your communication style, what interests you, how you argue, whether you're direct or indirect. Good contacts mean conversations flow. Bad ones mean you'll feel misunderstood even when you're both trying.",
    venus: "This is about love and attraction — what you find beautiful, how you give and receive affection, your love language, what turns you on. These contacts decide whether there's real chemistry or just friendship.",
    mars: "This is about drive — how you go after what you want, your energy, your temper, your ambition, how you take action. These contacts decide whether you'll fight well (constructively) or badly (destructively), and whether the spark is real.",
    jupiter: "This is about growth and meaning — where you expand, what you believe in, what feels meaningful, your sense of optimism. These contacts decide whether you inspire each other or hold each other back.",
    saturn: "This is about structure and limits — your work ethic, your fears, your sense of responsibility, what you take seriously. These contacts can feel heavy, but they're what gives a relationship staying power. Without them, things feel fun but unstable.",
    uranus: "This is about change and rebellion — where you break the rules, what makes you different, your sudden insights and sudden changes. These contacts bring excitement and unpredictability, but can also feel destabilizing.",
    neptune: "This is about dreams and imagination — your spirituality, your fantasies, your romantic idealism, where you blur boundaries. These contacts can feel magical and fated, but they can also mean you're seeing what you want to see instead of what's there.",
    pluto: "This is about power and transformation — your obsessions, your dark side, where you go deep, what you can't let go of. These contacts are intense — they can mean a fated, life-changing connection, or a power struggle that's hard to escape.",
    north_node: "This is about your life path — the direction you're being pulled toward in this lifetime, even when it's uncomfortable. These contacts can feel fated, like you're meant to learn something from each other.",
    chiron: "This is about wounds and healing — the pain you carry, and the healing you're here to offer others. These contacts mean one of you will touch the other's old wound — which can be deeply healing or deeply triggering.",
    lilith: "This is about your wild side — the part of you that refuses to be tamed, your hidden desires, what you repress and what you project. These contacts bring out intensity, sexuality, and shadow — for better or worse.",
    ascendant: "This is about the mask you wear — how you come across to people who don't know you yet, your first-impression energy, the vibe you give off. When these match, you'll feel like you 'get' each other immediately.",
    midheaven: "This is about your calling — your public role, your career direction, what you're known for in the world. These contacts mean your public lives and ambitions are linked.",
    mc: "This is about your calling — your public role, your career direction, what you're known for in the world. These contacts mean your public lives and ambitions are linked.",
    asc: "This is about the mask you wear — how you come across to people who don't know you yet, your first-impression energy, the vibe you give off. When these match, you'll feel like you 'get' each other immediately.",
  };
  const controls = whatItControls[id.toLowerCase()] || "An important part of who you are and how you connect.";

  // What the specific sign pairing means — going beyond just elements into
  // the actual quality of the match.
  let pairing: string;
  if (sameSign) {
    pairing = `You both have the same sign here. You'll feel profoundly seen and understood, like you don't have to explain yourself. The risk: you'll amplify each other's blind spots, because you both have the same ones. ${elementInsight(a.element, true)}`;
  } else if (sameEl) {
    pairing = `You share the same underlying element here. You process this area of life through the same basic flavor — different expression, but the same language. Easy to understand each other, even when the surface details differ. ${elementInsight(a.element, true)}`;
  } else {
    // Cross-element pairing — no sign names cited.
    const compat: Record<string, string> = {
      "fire-air": `You'll energize each other here. One of you brings the spark, the other brings the oxygen. You'll inspire each other, keep things exciting, and rarely feel bored.`,
      "air-fire": `You'll energize each other here. One of you feeds the flame, the other gives it something to think about. You'll inspire each other, keep things exciting, and rarely feel bored.`,
      "earth-water": `You'll nurture each other here. One of you gives the other a container, and the other softens the edges. You'll build something real together, with both structure and emotional depth.`,
      "water-earth": `You'll nurture each other here. One of you brings the feeling, the other brings the form. You'll build something real together, with both structure and emotional depth.`,
      "fire-water": `Challenging mix. One of you evaporates the other, the other douses the first. You'll feel intense and magnetic here, but also volatile. Passion is real, but it cuts both ways.`,
      "water-fire": `Challenging mix. Sensitivity meets intensity. You'll feel a strong pull here, but you'll trigger each other too. The chemistry is real; the emotional whiplash is also real.`,
      "earth-air": `You speak different languages here. One of you wants results, the other wants ideas. Both are valid — but you'll have to consciously translate.`,
      "air-earth": `You speak different languages here. One of you wants concepts, the other wants tangible results. Both are valid — but you'll have to consciously translate.`,
    };
    pairing = compat[`${a.element}-${b.element}`] || `There's some friction here — you'll need to meet each other halfway.`;
  }

  return `${controls}\n\nIn this pairing: ${pairing}`;
}

// Helper: returns a short, deep insight about what each element brings to
// this placement. `sameElement` flag makes the copy match the context.
function elementInsight(el: string, sameElement: boolean): string {
  const insights: Record<string, string> = {
    fire: sameElement
      ? "Together here, you'll either fuel each other brilliantly or burn each other out."
      : "",
    earth: sameElement
      ? "Together here, you'll build something solid, but you might also get stuck in routine."
      : "",
    air: sameElement
      ? "Together here, you'll talk for hours, but you might also stay in your heads and forget to feel."
      : "",
    water: sameElement
      ? "Together here, you'll understand each other without words, but you might also drown in each other's moods."
      : "",
  };
  return insights[el] || "";
}

// Domain bars are clickable. Tapping a row expands an explanation panel
// showing what aspects (positive and negative) feed into that domain's score,
// so the user understands WHY e.g. Romance is 13/100.
function DomainBar({
  domainKey,
  label,
  value,
  strengths,
  frictions,
}: {
  domainKey: string;
  label: string;
  value: number;
  strengths: CompatibilityProfile["strengths"];
  frictions: CompatibilityProfile["frictions"];
}) {
  const [open, setOpen] = useState(false);
  const color =
    value >= 70 ? "#34d399" :
    value >= 50 ? "#a78bfa" :
    value >= 35 ? "#fbbf24" : "#fb7185";

  // Which aspects belong to this domain? Match the same rules used in the
  // synastry engine (lib/astro/local.ts):
  //   romance       -> venus or mars
  //   communication -> mercury
  //   stability     -> saturn
  //   intimacy      -> moon or pluto
  //   growth        -> jupiter or north_node
  const planetMap: Record<string, string[]> = {
    romance: ["venus", "mars"],
    communication: ["mercury"],
    stability: ["saturn"],
    intimacy: ["moon", "pluto"],
    growth: ["jupiter", "north_node", "node"],
  };
  const domainPlanets = planetMap[domainKey] || [];

  const matchesDomain = (item: CompatibilityProfile["strengths"][number]) => {
    const a = (item.aPoint || "").toLowerCase();
    const b = (item.bPoint || "").toLowerCase();
    return domainPlanets.some((p) => a.includes(p) || b.includes(p));
  };

  const helpingAspects = strengths.filter(matchesDomain);
  const hurtingAspects = frictions.filter(matchesDomain);

  // Plain-English description of what this domain measures.
  const whatItMeasures: Record<string, string> = {
    romance: "Chemistry, attraction, sexual connection, and how you give and receive affection.",
    communication: "How you talk, argue, understand each other, and whether you feel heard.",
    stability: "Commitment, trust, staying power, and whether the relationship feels like a solid foundation.",
    intimacy: "Emotional closeness, vulnerability, and how deeply you let each other in.",
    growth: "Whether you expand each other's worlds, learn together, and push each other toward becoming more.",
  };
  const meaning = whatItMeasures[domainKey] || "An important dimension of your connection.";

  // Plain-English summary of WHY this score — always leads with the actual
  // number, then explains it from the real helping/hurting contacts.
  const help = helpingAspects.length;
  const hurt = hurtingAspects.length;
  const v10 = (value / 10).toFixed(1);
  let whySummary: string;

  if (help === 0 && hurt === 0) {
    whySummary = `${label} sits at ${v10}/10. Neither chart has major ${label.toLowerCase()}-related contacts, so there's nothing actively helping or hurting — a quiet neutral zone rather than a strength or a weakness.`;
  } else if (help > 0 && hurt === 0) {
    whySummary = `${label} sits at ${v10}/10, fed by ${help} supportive contact${help === 1 ? "" : "s"} and zero friction sources. ${value >= 55 ? "This is the part that feels easy without working for it — lean on it when other areas get bumpy." : "The support is gentle rather than loud, so it steadies things without making them exciting."}`;
  } else if (help === 0 && hurt > 0) {
    whySummary = `${label} sits at ${v10}/10 — ${hurt} friction source${hurt === 1 ? "" : "s"} with nothing offsetting them. This is where most recurring misunderstandings will come from; patience and out-loud check-ins are the whole fix.`;
  } else {
    if (help > hurt) {
      whySummary = `${label} sits at ${v10}/10 — ${help} supportive contact${help === 1 ? "" : "s"} outweigh ${hurt} friction source${hurt === 1 ? "" : "s"}. Support wins on average, but you'll still feel the friction in specific moments, especially tired ones.`;
    } else if (hurt > help) {
      whySummary = `${label} sits at ${v10}/10 — ${hurt} friction source${hurt === 1 ? "" : "s"} outweigh ${help} supportive contact${help === 1 ? "" : "s"}. The supportive one${help === 1 ? "" : "s"} give${help === 1 ? "s" : ""} you something to build on, but this lane needs deliberate work.`;
    } else {
      whySummary = `${label} sits at ${v10}/10 — ${help} supportive and ${hurt} friction contacts, evenly matched. Some days easy, some days impossible; the score is the average, not the lived experience.`;
    }
  }

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden bg-white/[0.02]">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left p-3 hover:bg-white/[0.03] focus:bg-white/[0.03] focus:outline-none transition-colors cursor-pointer"
      >
        <div className="flex items-center justify-between text-xs mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-white/80 font-medium">{label}</span>
            <ChevronDown className={`h-3 w-3 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
          </div>
          <span className="tabular-nums font-semibold" style={{ color }}>{(value / 10).toFixed(1)}<span className="text-white/30">/10</span></span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={false}
            animate={{ width: `${Math.max(2, value)}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-3 space-y-3 bg-white/[0.02]">
              {/* What this domain measures */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">What this measures</div>
                <p className="text-xs text-white/75 leading-relaxed">{meaning}</p>
              </div>

              {/* Why this score */}
              <div className="rounded-md border border-white/10 bg-white/[0.03] p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Why this score</div>
                <p className="text-xs text-white/80 leading-relaxed">{whySummary}</p>
              </div>

              {/* Supporting aspects */}
              {helpingAspects.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-300/70 mb-1.5 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Helping ({helpingAspects.length})
                  </div>
                  <div className="space-y-1">
                    {helpingAspects.map((a, i) => (
                      <div key={i} className="text-[11px] text-white/70 leading-relaxed pl-3 border-l border-emerald-300/30">
                        <span className="text-white/85 font-medium">{a.title}</span>
                        <span className="text-white/40"> — {a.summary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hurting aspects */}
              {hurtingAspects.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-rose-300/70 mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Dragging it down ({hurtingAspects.length})
                  </div>
                  <div className="space-y-1">
                    {hurtingAspects.map((a, i) => (
                      <div key={i} className="text-[11px] text-white/70 leading-relaxed pl-3 border-l border-rose-300/30">
                        <span className="text-white/85 font-medium">{a.title}</span>
                        <span className="text-white/40"> — {a.summary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {helpingAspects.length === 0 && hurtingAspects.length === 0 && (
                <p className="text-[11px] text-white/40 italic">
                  No major {label.toLowerCase()}-related aspects between your charts — this domain is neutral by default.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Map a synastry aspect point id ("asc", "mc", "north_node", …) to the
// allPlacements id space ("ascendant", "midheaven", …).
function placementKey(point: string): string {
  const p = point.toLowerCase();
  if (p === "asc" || p === "ascendant") return "ascendant";
  if (p === "mc" || p === "midheaven") return "midheaven";
  if (p === "node") return "north_node";
  return p;
}

function PairCard({ item, kind, profile }: { item: CompatibilityProfile["strengths"][number]; kind: "strength" | "friction"; profile: CompatibilityProfile }) {
  const [open, setOpen] = useState(false);
  const accent = kind === "strength" ? "#34d399" : "#fb7185";

  // Resolve this contact's REAL signs from both charts so the per-aspect
  // reading is sign-specific instead of generic.
  const aSign = profile.allPlacementsA.find((p) => p.id === placementKey(item.aPoint))?.signId;
  const bSign = profile.allPlacementsB.find((p) => p.id === placementKey(item.bPoint))?.signId;

  // Generate fresh per-aspect reading using the synastry engine.
  const reading = generateSynastryAspectReading(
    item.aPoint,
    item.bPoint,
    item.aspect,
    item.polarity,
    item.strength,
    aSign,
    bSign
  );

  return (
    <Card
      className="border-white/10 bg-white/[0.03] backdrop-blur overflow-hidden"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Placement tags — Rule 0.6 */}
            {reading.placementTags.length > 0 && (
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                {reading.placementTags.map((tag, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
                    {tag.icon} {tag.label}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium text-white text-sm">{reading.headline}</span>
              {kind === "strength" ? (
                <span className="text-[10px] text-emerald-300/70 uppercase tracking-wide">matches well</span>
              ) : (
                <span className="text-[10px] text-rose-300/70 uppercase tracking-wide">friction</span>
              )}
            </div>
            <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{reading.summary}</p>
          </div>
          <div className="text-right flex-shrink-0">
            {open ? (
              <ChevronDown className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronRight className="h-4 w-4 text-white/40" />
            )}
          </div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-4 space-y-3">
              {/* Fresh per-aspect sections */}
              {reading.sections.map((section, i) => (
                <div key={i}>
                  <div className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: accent }}>
                    {section.heading}
                  </div>
                  {section.body && (
                    <p className="text-xs text-white/75 leading-relaxed mb-1.5">{section.body}</p>
                  )}
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="space-y-1">
                      {section.bullets.map((b, j) => (
                        <li key={j} className="text-xs text-white/70 leading-relaxed flex items-start gap-1.5">
                          <span style={{ color: accent }} className="mt-0.5 flex-shrink-0">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Map a synastry point id ("sun", "moon", "asc", "mc", "venus", ...) to a
// short, plain-English role label so users always know what each contact
// is actually about.
function pairRole(id: string): string {
  const map: Record<string, string> = {
    sun: "Core Self",
    moon: "Emotions",
    mercury: "Thinking",
    venus: "Love",
    mars: "Drive",
    jupiter: "Growth",
    saturn: "Limits",
    uranus: "Change",
    neptune: "Dreams",
    pluto: "Power",
    asc: "Mask",
    mc: "Calling",
    desc: "Partnership",
    ic: "Roots",
    vertex: "Fate",
    chiron: "Wound",
    lilith: "Wild Self",
    node: "Life Path",
    north_node: "Life Path",
  };
  return map[id.toLowerCase()] || id;
}

// Emoji for a synastry point id, used in pair cards.
function pairEmoji(id: string): string {
  return pointEmoji(id);
}
