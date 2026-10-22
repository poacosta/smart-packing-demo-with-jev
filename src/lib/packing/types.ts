import type { BagId, SeasonId, Signals } from "./catalog";

export type DecideResponse = {
  /** P(true) for each boolean signal, plus the season distribution. */
  signals: Signals;
  season: SeasonId;
  /** Fractional position on TEMPERATURE_LEVELS (0 = freezing, 4 = hot). */
  temperature: number;
  bag: BagId;
  bagProbabilities?: Partial<Record<BagId, number>>;
  /** "model" when answered by the decision model, "offline" for the keyword fallback. */
  source: "model" | "offline";
  model: string;
  latencyMs: number;
};

export type DecideError = { error: string };
