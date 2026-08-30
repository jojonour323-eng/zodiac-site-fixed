// ===========================================================================
// PERSONALITY ENGINE — public API
// ---------------------------------------------------------------------------
// Pipeline: NatalApiResponse → ChartFacts → PersonalityProfile → generators
// ===========================================================================

export { analyzeChartFacts, type ChartFacts } from "./facts";
export { buildPersonalityProfile, type PersonalityProfile, prettyPlanet } from "./model";
export { computeRings, type RingResult } from "./rings";
export { selectArchetype, type ArchetypeResult } from "./archetype";
export { buildHomePortrait, type HomePortrait } from "./home";
export { buildFullReading } from "./fullReading";
export { buildSoulmateProfile, type SoulmateProfile } from "./soulmate";
export { buildCompatibilityAnalysis, type CompatAnalysis, type CompatArea } from "./compat";
export { buildKinkChartProfile, AXIS_LABELS, type KinkProfile, type KinkIdentity, type KinkAxis } from "./kink";
export { DIMENSIONS, DIMENSION_LABELS, type Dimension, type DimensionScore, makeRng } from "./core";
