// ===========================================================================
// SIGN CONTENT TYPES — shared shape for all twelve sign libraries
// ---------------------------------------------------------------------------
// Every string is authored in neutral plural voice ("they want") and runs
// through gv() at render time. First-person monologue quotes need no transform.
// ===========================================================================

export interface SignChapter {
  sun: {
    /** 2–3 identity paragraphs */
    core: string[];
    /** what actually motivates vs what they're afraid of */
    drive: string[];
    /** inner-monologue quotes, first person */
    monologue: string[];
  };
  moon: {
    core: string[];
    /** bullet list: what makes them feel safe */
    safe: string[];
    /** how they process sadness / hurt / rejection */
    hurt: string[];
    /** do they talk about feelings or hide them */
    talk: string[];
    monologue: string[];
  };
  rising: {
    /** first impression + outer style */
    core: string[];
    /** strangers vs close friends */
    close: string[];
  };
  mercury: {
    core: string[];
    /** how they communicate when angry or hurt */
    angryComm: string[];
    /** what makes them open up / shut down */
    openUp: string[];
    monologue: string[];
  };
  venus: {
    core: string[];
    /** how they show affection */
    showLove: string[];
    /** what makes them lose interest / pull away */
    pullAway: string[];
    /** how attachment forms + vulnerability pattern */
    attach: string[];
    monologue: string[];
  };
  mars: {
    core: string[];
    /** everyday anger expression */
    anger: string[];
    /** what happens at their absolute limit */
    limit: string[];
    monologue: string[];
  };
}
