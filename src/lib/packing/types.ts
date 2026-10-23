import type { BagId, SeasonId, Signals, WardrobeId } from "./catalog";
import type { Experimental_DecisionQuestion } from "ai";

/** Serializable SDK input for the request viewer; excludes credentials and runtime controls. */
export type JevRequest = {
  model: string;
  state: {
    trip: string;
    capacityLiters: number;
    wardrobe: WardrobeId;
    wardrobePreference: string;
    packingGoal: string;
  };
  questions: Record<string, Experimental_DecisionQuestion>;
  maxRetries: number;
};

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
  /** Actual model-call input, or null when the offline fallback makes no call. */
  request: JevRequest | null;
};

export type DecideError = { error: string };
