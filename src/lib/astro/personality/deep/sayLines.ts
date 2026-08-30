// ===========================================================================
// SAY LINES — public types + merged library (see sayLines1/2 for content)
// ===========================================================================

import { SAY_LINES_1 } from "./sayLines1";
import { SAY_LINES_2 } from "./sayLines2";

export interface SayPair {
  /** direct quote — what to say TO them (second person; never transformed) */
  works: string;
  /** why it works — neutral plural voice, gv-transformed at render */
  worksWhy: string;
  /** direct quote — what NOT to say */
  avoid: string;
  /** why it backfires — neutral plural voice, gv-transformed at render */
  avoidWhy: string;
}

export const SAY_LINES: Record<string, { moon: SayPair; mercury: SayPair; venus: SayPair; mars: SayPair }> = {
  ...SAY_LINES_1,
  ...SAY_LINES_2,
};
