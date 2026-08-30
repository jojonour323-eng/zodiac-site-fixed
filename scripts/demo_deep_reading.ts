// Quick demo: build a fake NatalProfile for a sample person and print
// what the new deep reading engine produces for their Sun, Moon, Venus,
// and Ascendant. This shows the actual text the user will see on the site.

import type { NatalProfile, PlanetSummary, SignId, Element, Modality } from "../src/lib/astro/types";
import { SIGN_META } from "../src/lib/astro/signs";
import {
  generateDeepPlanetExplanation,
  generateDeepAscendantExplanation,
} from "../src/lib/astro/deepReading";

// Sample chart: Sun in Leo (house 5), Moon in Pisces (house 12),
// Mercury in Virgo (house 6), Venus in Libra (house 7),
// Mars in Aries (house 1), Jupiter in Sagittarius (house 9),
// Saturn in Capricorn (house 10), etc.
function buildSampleProfile(): NatalProfile {
  const mk = (
    id: PlanetSummary["id"],
    name: string,
    signId: SignId,
    house: number,
    pos: number,
    retrograde = false
  ): PlanetSummary => {
    const meta = SIGN_META[signId];
    return {
      id,
      name,
      sign: meta.abbr,
      signId,
      signName: meta.name,
      element: meta.element,
      modality: meta.modality,
      house,
      retrograde,
      pos,
    };
  };

  const sun = mk("sun", "Sun", "leo", 5, 12);          // 12° Leo
  const moon = mk("moon", "Moon", "pisces", 12, 24);   // 24° Pisces
  const mercury = mk("mercury", "Mercury", "virgo", 6, 3);
  const venus = mk("venus", "Venus", "libra", 7, 18);
  const mars = mk("mars", "Mars", "aries", 1, 9);
  const jupiter = mk("jupiter", "Jupiter", "sagittarius", 9, 20);
  const saturn = mk("saturn", "Saturn", "capricorn", 10, 15);
  const uranus = mk("uranus", "Uranus", "aquarius", 11, 8);
  const neptune = mk("neptune", "Neptune", "capricorn", 10, 22);
  const pluto = mk("pluto", "Pluto", "scorpio", 8, 28);

  const ascSign: SignId = "scorpio";
  const ascMeta = SIGN_META[ascSign];

  return {
    subject: {
      name: "Sample Person",
      datetime: "1990-08-05T14:30:00",
      city: "Sample City",
      lat: 40,
      lng: -74,
      timezone: "America/New_York",
      timeKnown: true,
    },
    sun,
    moon,
    ascendant: {
      sign: ascMeta.abbr,
      signId: ascSign,
      signName: ascMeta.name,
      element: ascMeta.element,
      modality: ascMeta.modality,
      absPos: 217,
    },
    midheaven: {
      sign: "Leo",
      signId: "leo",
      signName: "Leo",
      absPos: 142,
    },
    planets: [sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto],
    houses: [],
    traits: [],
    summary: "",
    quickLine: "",
    personalityTag: "",
    combinedNarratives: [],
    confidence: { houses: "high", angles: "high", overall: "high" },
  };
}

function printExplanation(label: string, deep: ReturnType<typeof generateDeepPlanetExplanation> | ReturnType<typeof generateDeepAscendantExplanation>) {
  console.log("\n" + "=".repeat(80));
  console.log(label);
  console.log("=".repeat(80));
  console.log("\n📌 HEADLINE:");
  console.log(deep.headline);
  console.log("\n📝 SUMMARY:");
  console.log(deep.summary);
  console.log("\n📚 SECTIONS:");
  deep.sections.forEach((s, i) => {
    console.log(`\n--- ${i + 1}. ${s.heading} ---`);
    if (s.body) console.log(s.body);
    if (s.bullets && s.bullets.length > 0) {
      s.bullets.forEach((b) => console.log(`  • ${b}`));
    }
  });
}

const profile = buildSampleProfile();
const venus = profile.planets.find((p) => p.id === "venus")!;
const mars = profile.planets.find((p) => p.id === "mars")!;

printExplanation("☀️  SUN IN LEO (5th HOUSE)", generateDeepPlanetExplanation(profile.sun, profile));
printExplanation("🌙  MOON IN PISCES (12th HOUSE)", generateDeepPlanetExplanation(profile.moon, profile));
printExplanation("♀️  VENUS IN LIBRA (7th HOUSE)", generateDeepPlanetExplanation(venus, profile));
printExplanation("♂️  MARS IN ARIES (1st HOUSE)", generateDeepPlanetExplanation(mars, profile));
printExplanation("🎭  ASCENDANT IN SCORPIO", generateDeepAscendantExplanation(profile));

console.log("\n" + "=".repeat(80));
console.log("DONE");
