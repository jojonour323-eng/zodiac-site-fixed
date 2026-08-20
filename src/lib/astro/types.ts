// Shared types for astrology calculation responses and our simplified app models.

export type SignId =
  | "aries" | "taurus" | "gemini" | "cancer"
  | "leo" | "virgo" | "libra" | "scorpio"
  | "sagittarius" | "capricorn" | "aquarius" | "pisces";

export type Element = "fire" | "earth" | "air" | "water";
export type Modality = "cardinal" | "fixed" | "mutable";

export type PlanetId =
  | "sun" | "moon" | "mercury" | "venus" | "mars"
  | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto"
  | "north_node" | "chiron" | "lilith";

export interface PlanetInfo {
  id: PlanetId;
  name: string;
  sign: string;
  sign_id: SignId;
  pos: number;
  abs_pos: number;
  retrograde: boolean;
  house: number;
  declination_deg?: number;
}

export interface HouseInfo {
  house: number;
  name: string;
  sign: string;
  sign_id: SignId;
  pos: number;
  abs_pos: number;
}

export interface NatalApiResponse {
  subject: {
    name: string;
    datetime: string;
    location: {
      city: string;
      lat: number;
      lng: number;
      timezone: string;
    };
    settings: {
      house_system: string;
      zodiac_type: string;
      time_known: boolean;
      [k: string]: unknown;
    };
  };
  planets: PlanetInfo[];
  houses: HouseInfo[];
  angles: { asc: number; mc: number; ic: number; dc: number; vertex?: number };
  aspects_summary: {
    total: number;
    major: number;
    minor: number;
    by_type: Record<string, number>;
  };
  confidence: { houses: string; angles: string; overall: string };
}

export interface SynastryAspect {
  id: string;
  kind: string;
  a_point: string;
  b_point: string;
  pair_key: string;
  aspect: string;
  aspect_angle_deg: number;
  separation_deg: number;
  orb_deg: number;
  strength: number;
  strength_label: string;
  polarity: "harmonious" | "tense" | "neutral" | "supportive" | "challenging" | "mixed";
  polarity_confidence?: number;
  categories: string[];
  domains: string[];
  themes: string[];
  applying?: boolean;
  is_angle_contact?: boolean;
}

export interface SynastryScores {
  overall: number;
  romance: number;
  communication: number;
  stability: number;
  intimacy: number;
  growth: number;
  tension: number;
}

export interface SynastryArchetype {
  id: string;
  label: string;
  one_liner: string;
  confidence?: number;
}

export interface SynastryTextEntry {
  title: string;
  summary: string;
  detail: string;
  themes: string[];
  strength_label: string;
  keywords: string[];
  advice: string[];
}

export interface SynastryApiResponse {
  meta: {
    engine: { name: string; version: string };
    [k: string]: unknown;
  };
  natal: {
    person_a: NatalApiResponse;
    person_b: NatalApiResponse;
  };
  synastry: {
    aspects: SynastryAspect[];
    house_overlays?: unknown;
    highlights?: { kind: string; ref_id: string; reason_codes: string[] }[];
    scores: SynastryScores;
    archetype: SynastryArchetype;
    text?: {
      locale: string;
      tone: string;
      by_key: Record<string, SynastryTextEntry>;
    };
    index?: unknown;
  };
}

export interface TraitScore {
  key: string;
  label: string;
  value: number; // 0-100
}

export interface PlanetSummary {
  id: PlanetId;
  name: string;
  sign: string;
  signId: SignId;
  signName: string;
  element: Element;
  modality: Modality;
  house: number;
  retrograde: boolean;
  pos: number;
}

export interface NatalProfile {
  subject: {
    name: string;
    datetime: string;
    city: string;
    lat: number;
    lng: number;
    timezone: string;
    timeKnown: boolean;
  };
  sun: PlanetSummary;
  moon: PlanetSummary;
  ascendant: {
    sign: string;
    signId: SignId;
    signName: string;
    element: Element;
    modality: Modality;
    absPos: number;
  };
  midheaven: {
    sign: string;
    signId: SignId;
    signName: string;
    absPos: number;
  };
  planets: PlanetSummary[];
  houses: {
    house: number;
    sign: string;
    signId: SignId;
    signName: string;
    element: Element;
  }[];
  traits: TraitScore[];
  summary: string;
  quickLine: string;               // one punchy sentence for Quick View
  personalityTag: string;          // short 3-6 word punchy tag
  combinedNarratives: { title: string; teaser: string; body: string }[];  // flowing combined explanations
  confidence: { houses: string; angles: string; overall: string };
}

export interface CompatibilityPairItem {
  aPoint: string;
  bPoint: string;
  aspect: string;
  polarity: "harmonious" | "tense" | "neutral" | "supportive" | "challenging" | "mixed";
  strength: number;
  strengthLabel: string;
  themes: string[];
  categories: string[];
  title: string;
  summary: string;
  detail: string;
  advice: string[];
}

// A small, practical tension point derived from the synastry aspects.
// Each one has a short name, what's actually happening, and a real tip.
export interface TensionPoint {
  title: string;
  what: string;
  tip: string;
  source: string;  // which aspect pair triggered it (for transparency)
}

export interface CompatibilityProfile {
  // All planets + angles for both people, so the comparison grid can show
  // every placement side by side, not just Sun/Moon/Rising.
  personA: { sun: SignId; moon: SignId; ascendant: SignId };
  personB: { sun: SignId; moon: SignId; ascendant: SignId };
  allPlacementsA: { id: string; signId: SignId }[];
  allPlacementsB: { id: string; signId: SignId }[];
  overall: number;
  domainScores: { label: string; value: number; key: string }[];
  archetype: SynastryArchetype;
  // Why-the-score-is-what-it-is: a longer, casual narrative that walks
  // through the Sun/Moon/Rising comparison + top aspects.
  narrative: string;
  strengths: CompatibilityPairItem[];
  frictions: CompatibilityPairItem[];
  tensionPoints: TensionPoint[];
  tensionBand: string;
  scoreBand: string;
}

export interface BirthRequest {
  name?: string;
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  timeKnown?: boolean;
  city?: string;
  lat?: number;
  lng?: number;
  tzStr?: string;
  gender?: "male" | "female";
}

export interface SynastryRequest {
  personA: BirthRequest;
  personB: BirthRequest;
}
