"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { SIGN_META, ELEMENT_COLORS, ELEMENT_LABELS } from "@/lib/astro/signs";
import { PLANET_EMOJI, PLANET_ROLE_SHORT, PLANET_ROLES, HOUSE_MEANINGS } from "@/lib/astro/interpretations";
import type { SignId, PlanetId } from "@/lib/astro/types";
import { Moon, Star, Compass, Heart, Sparkles } from "lucide-react";

const ALL_SIGNS: SignId[] = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
const ALL_PLANETS: PlanetId[] = ["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto","north_node","chiron","lilith"];

export function AboutTab() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-amber-200">
          <Star className="h-3.5 w-3.5" /> About
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-medium text-white mt-4">
          Zodiac Signs, Planets & Houses
        </h1>
        <p className="text-sm sm:text-base text-white/50 mt-3 max-w-md mx-auto">
          A plain-English guide to how astrology works and what each piece means.
        </p>
      </div>

      {/* What is astrology */}
      <Card className="border-white/10 bg-white/[0.03] p-6 backdrop-blur">
        <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
          <Moon className="h-5 w-5 text-amber-300" /> What is a birth chart?
        </h2>
        <div className="space-y-3 text-sm text-white/70 leading-relaxed">
          <p>
            Your birth chart is a snapshot of the sky at the exact moment and place you were born. It shows where every planet was, which sign of the zodiac it was in, and which of the 12 houses it occupied.
          </p>
          <p>
            The three most important pieces are your <span className="text-amber-200">Sun sign</span> (who you are at your core), your <span className="text-amber-200">Moon sign</span> (your inner emotional world), and your <span className="text-amber-200">Rising sign</span> (the mask you wear, how others first see you). Together these are called your &quot;Big Three.&quot;
          </p>
          <p>
            Everything else — the other planets, the houses, the aspects between them — adds detail and nuance. The chart doesn&apos;t dictate your life; it describes patterns and tendencies you can work with or against.
          </p>
        </div>
      </Card>

      {/* The 12 signs */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-300" /> The 12 Zodiac Signs
        </h2>
        <p className="text-sm text-white/50">
          Each sign belongs to one of four elements (fire, earth, air, water) and one of three modalities (cardinal, fixed, mutable).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_SIGNS.map((sign, i) => {
            const meta = SIGN_META[sign];
            const color = ELEMENT_COLORS[meta.element];
            return (
              <motion.div
                key={sign}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="border-white/10 bg-white/[0.03] p-4 backdrop-blur h-full">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-lg flex-shrink-0"
                      style={{ background: `${color}1f`, border: `1px solid ${color}44`, color }}
                    >
                      {meta.glyph}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white">{meta.name}</div>
                      <div className="text-xs text-white/40 mb-2">{meta.dates}</div>
                      <div className="flex gap-2 mb-2">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ background: `${color}22`, color }}
                        >
                          {ELEMENT_LABELS[meta.element]}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/60">
                          {meta.modality}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">{meta.short}</p>
                      <p className="text-xs text-white/40 mt-1 italic">{meta.vibe}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Elements explained — general meanings, not tied to any specific sign */}
      <Card className="border-white/10 bg-white/[0.03] p-6 backdrop-blur">
        <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
          <Compass className="h-5 w-5 text-amber-300" /> The Four Elements
        </h2>
        <p className="text-sm text-white/50 mb-4">
          In astrology, every sign belongs to one of four elements. The element tells you what kind of energy that sign brings — it&apos;s the flavor, the fuel, the way that sign approaches life. Understanding elements helps you understand why some signs click instantly and others take work.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { el: "fire", name: "Fire Energy", signs: "Aries, Leo, Sagittarius",
              desc: "Fire is action, courage, passion, and instinct. Fire energy means moving first and thinking later — it's the spark that gets things started. People with strong Fire energy are enthusiastic, warm, and inspiring. They lead by doing, not by planning. Fire is the energy of beginnings, of jumping in, of trusting your gut. The challenge with Fire is that it can burn out, burn too bright, or burn others. Without something to fuel it, Fire fizzles. With too much fuel, it becomes destructive. Fire needs purpose — a reason to burn — or it becomes restlessness.",
            },
            { el: "earth", name: "Earth Energy", signs: "Taurus, Virgo, Capricorn",
              desc: "Earth is practicality, patience, stability, and the real world. Earth energy means building things that last — through consistency, discipline, and attention to what's actually there. People with strong Earth energy are grounded, reliable, and sensual (they experience life through the body and the senses). Earth is the energy of follow-through, of showing up, of making things real. The challenge with Earth is that it can become rigid, stuck, or overly focused on the material at the expense of the spiritual. Earth needs to remember that not everything valuable can be touched or measured.",
            },
            { el: "air", name: "Air Energy", signs: "Gemini, Libra, Aquarius",
              desc: "Air is thought, communication, ideas, and connection. Air energy means living in your head — processing the world through concepts, language, and social interaction. People with strong Air energy are curious, articulate, and mentally quick. They connect people, ideas, and perspectives. Air is the energy of learning, of dialogue, of seeing all sides. The challenge with Air is that it can become detached, over-intellectual, or disconnected from feeling. Air needs to remember that some things can't be thought through — they have to be felt. Ideas without action are just air.",
            },
            { el: "water", name: "Water Energy", signs: "Cancer, Scorpio, Pisces",
              desc: "Water is emotion, intuition, depth, and sensitivity. Water energy means feeling everything — sometimes before you even know why. People with strong Water energy are empathetic, intuitive, and deeply connected to the unseen layers of life. They absorb the moods of people around them and often know things without being told. Water is the energy of caring, of going deep, of trusting your gut over your head. The challenge with Water is that it can become overwhelming, boundary-less, or prone to escapism. Water needs a container — a shoreline, a riverbank — or it becomes a flood. Boundaries are not the enemy of depth; they're what make depth possible.",
            },
          ] as const).map(({ el, name, desc, signs }) => {
            const color = ELEMENT_COLORS[el];
            return (
              <div key={el} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    style={{ background: `${color}33`, border: `1px solid ${color}55` }}
                  />
                  <div>
                    <div className="text-sm font-semibold" style={{ color }}>{name}</div>
                    <div className="text-xs text-white/40">{signs}</div>
                  </div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/[0.04] p-3">
          <p className="text-xs text-white/70 leading-relaxed">
            <span className="text-amber-300 font-medium">How elements interact:</span> Fire and Air fuel each other (action + ideas = momentum). Earth and Water nurture each other (stability + feeling = depth). Fire and Water can create steam — intense but volatile. Earth and Air can feel like they&apos;re speaking different languages. Same-element connections are easy but can amplify blind spots. Different-element connections take more work but bring balance.
          </p>
        </div>
      </Card>

      {/* The planets */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Heart className="h-5 w-5 text-amber-300" /> The Planets
        </h2>
        <p className="text-sm text-white/50">
          Each planet rules a different part of your personality. Where it was when you were born shapes that part of you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ALL_PLANETS.map((planet) => (
            <Card key={planet} className="border-white/10 bg-white/[0.03] p-4 backdrop-blur">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{PLANET_EMOJI[planet]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white capitalize">
                      {planet === "north_node" ? "North Node" : planet}
                    </span>
                    <span className="text-[10px] text-amber-200/70 bg-amber-300/10 px-1.5 py-0.5 rounded-full">
                      {PLANET_ROLE_SHORT[planet]}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">{PLANET_ROLES[planet]}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* The 12 houses */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Compass className="h-5 w-5 text-amber-300" /> The 12 Houses
        </h2>
        <p className="text-sm text-white/50">
          Houses show <em>where</em> in life each planet&apos;s energy shows up. Your 1st house begins with your Rising sign.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HOUSE_MEANINGS.map((house) => (
            <Card key={house.number} className="border-white/10 bg-white/[0.03] p-3 backdrop-blur">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-mono text-white/40">H{house.number}</span>
                <span className="text-sm font-semibold text-white">{house.name}</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">{house.long}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How to read your chart */}
      <Card className="border-amber-300/20 bg-amber-300/[0.04] p-6 backdrop-blur">
        <h2 className="text-xl font-semibold text-white mb-3">How to use all this</h2>
        <div className="space-y-2 text-sm text-white/70 leading-relaxed">
          <p>
            <span className="text-amber-200">1.</span> Start with your Big Three (Sun, Moon, Rising). That&apos;s the headline of who you are.
          </p>
          <p>
            <span className="text-amber-200">2.</span> Look at where Venus and Mars are — they shape how you love and how you go after things.
          </p>
          <p>
            <span className="text-amber-200">3.</span> Check which houses your planets fall in. A planet in your 7th house shows up in relationships; in your 10th, in your career.
          </p>
          <p>
            <span className="text-amber-200">4.</span> Don&apos;t take any single placement as the whole story. You&apos;re the sum of all of them, and the tension between them is what makes you interesting.
          </p>
        </div>
      </Card>
    </div>
  );
}
