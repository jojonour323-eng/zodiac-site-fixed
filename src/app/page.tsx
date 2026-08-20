"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StarField } from "@/components/astro/StarField";
import { NavBar, type TabId } from "@/components/astro/NavBar";
import { BirthForm } from "@/components/astro/BirthForm";
import { QuickView } from "@/components/astro/QuickView";
import { DetailedView } from "@/components/astro/DetailedView";
import { CompatibilityChecker } from "@/components/astro/CompatibilityChecker";
import { SoulmateCard } from "@/components/astro/SoulmateCard";
import { CompatibilityTab } from "@/components/astro/CompatibilityTab";
import { RedFlagsTab } from "@/components/astro/RedFlagsTab";
import { KinkTestTab } from "@/components/astro/KinkTestTab";
import { SoulmateTab } from "@/components/astro/SoulmateTab";
import { AboutTab } from "@/components/astro/AboutTab";
import { ScrollToTop } from "@/components/astro/ScrollToTop";
import { RotatingQuote } from "@/components/astro/RotatingQuote";
import type { BirthRequest, NatalProfile } from "@/lib/astro/types";
import { Sparkles, Moon, Heart, Compass } from "lucide-react";

type Stage = "intro" | "quick" | "detailed" | "compatibility";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [stage, setStage] = useState<Stage>("intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [birth, setBirth] = useState<BirthRequest | null>(null);
  const [profile, setProfile] = useState<NatalProfile | null>(null);

  async function handleBirth(req: BirthRequest) {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);
      let res: Response;
      try {
        res = await fetch("/api/natal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req),
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
      setBirth(req);
      setProfile(data);
      setStage("quick");

      // Fire-and-forget: save the submission (name / age / full birthday /
      // country / Sun-Moon-Rising) to a server-side file so the site owner
      // can review who's been using the tool. If it fails, we don't surface
      // that to the user — their chart still rendered fine.
      try {
        fetch("/api/collect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...req,
            sunSign: data.sun?.signName,
            moonSign: data.moon?.signName,
            risingSign: data.ascendant?.signName,
          }),
        }).catch(() => {});
      } catch {
        // Ignore — collection is best-effort.
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStage("intro");
    setBirth(null);
    setProfile(null);
    setError(null);
  }

  function handleTabChange(tab: TabId) {
    setActiveTab(tab);
    // If switching to home and we have a profile, go back to quick view
    if (tab === "home" && profile && stage === "compatibility") {
      setStage("quick");
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background gradient + stars */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at top, #1e1b4b 0%, #0f0a2e 35%, #050314 70%, #020110 100%)",
        }}
      />
      <StarField count={70} />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed -z-10 top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none fixed -z-10 bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px]" />

      {/* Navigation Bar */}
      <NavBar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="relative z-10 px-4 sm:px-6 py-8 sm:py-12 max-w-5xl mx-auto">
        {/* HOME TAB */}
        {activeTab === "home" && (
          <>
            {/* Header (only on intro stage) */}
            {stage === "intro" && (
              <header className="text-center mb-10 sm:mb-14">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2 mb-4"
                >
                  <Moon className="h-5 w-5 text-amber-300" />
                  <span className="text-xs uppercase tracking-[0.3em] text-amber-200/70">
                    Celestial
                  </span>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-3xl sm:text-5xl font-serif font-medium text-white"
                >
                  Your stars, in plain English
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-sm sm:text-base text-white/50 mt-3 max-w-md mx-auto"
                >
                  Enter your birth details. Get your Sun, Moon, and Rising signs, a personality breakdown, your full chart, and real compatibility.
                </motion.p>

                {/* Legendary motivational quote — auto-rotates every ~12s */}
                <RotatingQuote />
              </header>
            )}

            <AnimatePresence mode="wait">
              {stage === "intro" && (
                <motion.section
                  key="intro"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-8"
                >
                  <div className="max-w-xl mx-auto">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur p-6 sm:p-8">
                      <h2 className="text-xl font-semibold text-white mb-1 text-center">
                        Tell us when you arrived
                      </h2>
                      <p className="text-sm text-white/50 mb-6 text-center">
                        Date and city are required. Time sharpens your Rising sign and houses.
                      </p>
                      <BirthForm onSubmit={handleBirth} loading={loading} />
                      {error && (
                        <div className="mt-4 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-sm text-rose-200">
                          {error}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Three-step explainer */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
                    <StepCard icon={Sparkles} title="Quick view" desc="Sun, Moon, Rising + your personality rings." />
                    <StepCard icon={Compass} title="Detailed chart" desc="Every planet, every house, with fun nicknames." />
                    <StepCard icon={Heart} title="Compatibility" desc="Sign matching + a real synastry tool." />
                  </div>
                </motion.section>
              )}

              {stage === "quick" && profile && (
                <motion.section
                  key="quick"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-12"
                >
                  <QuickView
                    profile={profile}
                    onReadMore={() => setStage("compatibility")}
                    onReset={reset}
                  />

                  {/* Full chart + houses — shown inline on scroll, no click needed */}
                  <div className="pt-8 border-t border-white/10">
                    <DetailedView profile={profile} onBack={() => setStage("intro")} />
                  </div>
                </motion.section>
              )}

              {stage === "compatibility" && birth && (
                <motion.section
                  key="compatibility"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  <CompatibilityChecker self={birth} onReset={reset} />
                </motion.section>
              )}
            </AnimatePresence>
          </>
        )}

        {/* ABOUT TAB */}
        {activeTab === "about" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AboutTab />
          </motion.div>
        )}

        {/* COMPATIBILITY TAB — auto-loads from profile, no manual picker */}
        {activeTab === "compatibility" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CompatibilityTab
              profile={profile}
              gender={birth?.gender ?? null}
              onEnterBirthData={() => {
                setActiveTab("home");
                setStage("intro");
              }}
              onOpenFullTool={() => {
                setActiveTab("home");
                if (birth) {
                  setStage("compatibility");
                } else {
                  setStage("intro");
                }
              }}
            />
          </motion.div>
        )}

        {/* SOULMATES TAB */}
        {activeTab === "soulmates" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SoulmateTab
              profile={profile}
              onEnterBirthData={() => {
                setActiveTab("home");
                setStage("intro");
              }}
            />
          </motion.div>
        )}

        {/* RED FLAGS TAB (now 'The Full Read') */}
        {activeTab === "redflags" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <RedFlagsTab
              profile={profile}
              gender={birth?.gender ?? null}
              onEnterBirthData={() => {
                setActiveTab("home");
                setStage("intro");
              }}
            />
          </motion.div>
        )}

        {/* KINK TEST TAB */}
        {activeTab === "kinktest" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <KinkTestTab
              profile={profile}
              gender={birth?.gender ?? null}
              onEnterBirthData={() => {
                setActiveTab("home");
                setStage("intro");
              }}
            />
          </motion.div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-center text-xs text-white/30">
          <p>
            Astrology calculated locally with Swiss Ephemeris. Read it as guidance, not gospel.
          </p>
        </footer>
      </div>

      {/* Floating scroll-to-top button — appears after scrolling down */}
      <ScrollToTop />
    </main>
  );
}

function StepCard({
  icon: Icon, title, desc,
}: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur p-4 text-center">
      <div className="w-10 h-10 rounded-full bg-amber-300/10 border border-amber-300/30 flex items-center justify-center mx-auto mb-3">
        <Icon className="h-5 w-5 text-amber-300" />
      </div>
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <p className="text-xs text-white/50 mt-1">{desc}</p>
    </div>
  );
}
