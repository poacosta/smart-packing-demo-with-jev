import type { BagId, SeasonId, Signals, WardrobeId } from "./catalog";

export type DecideResponse = {
  /** P(true) for each boolean signal, plus the season distribution. */
  signals: Signals;
  season: SeasonId;
  /** Fractional position on TEMPERATURE_LEVELS (0 = freezing, 4 = hot). */
  temperature: number;
  bag: BagId;
  wardrobe: WardrobeId;
  /** Zero for offline decisions; otherwise the actual number of SDK questions. */
  questionCount: number;
  /** Capacity-aware usefulness, normalized to 0–1 for each catalog item. */
  itemScores: Record<string, number>;
  /** "model" when answered by the decision model, "offline" for the keyword fallback. */
  source: "model" | "offline";
  model: string;
  latencyMs: number;
};

export type DecideError = { error: string };
