import "server-only";

import { experimental_decide as decide, type Experimental_DecisionQuestion } from "ai";
import {
  BAG_IDS,
  BAGS,
  SEASON_IDS,
  SEASONS,
  SIGNAL_IDS,
  SIGNALS,
  TEMPERATURE_LEVELS,
  type BagId,
  type SeasonId,
  type SignalId,
  type Signals,
} from "./catalog";
import type { DecideResponse } from "./types";

export const DECISION_MODEL = process.env.DECISION_MODEL ?? "typesafe-ai/jev";

const signalQuestions = Object.fromEntries(
  SIGNAL_IDS.map((id) => [
    id,
    { type: "boolean", instructions: SIGNALS[id].question },
  ]),
) as Record<SignalId, { type: "boolean"; instructions: string }>;

const questions = {
  ...signalQuestions,
  season: {
    type: "choice",
    instructions:
      "Which season will it be at the destination during the trip? Mind the hemisphere: July is winter in the south.",
    criteria: Object.fromEntries(SEASON_IDS.map((id) => [id, SEASONS[id].description])) as Record<
      SeasonId,
      string
    >,
  },
  temperature: {
    type: "score",
    instructions: "What is the typical temperature during the trip?",
    criteria: [...TEMPERATURE_LEVELS],
  },
  bag: {
    type: "choice",
    instructions: "Which bag fits this trip best?",
    criteria: Object.fromEntries(BAG_IDS.map((id) => [id, BAGS[id].description])) as Record<
      BagId,
      string
    >,
  },
} satisfies Record<string, Experimental_DecisionQuestion>;

export const QUESTION_COUNT = Object.keys(questions).length;

export function hasGatewayCredentials() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

/** One-hot distribution for providers that return a choice without probabilities. */
function oneHot<K extends string>(ids: readonly K[], picked: K): Record<K, number> {
  return Object.fromEntries(ids.map((id) => [id, id === picked ? 1 : 0])) as Record<K, number>;
}

/** Ask Jev every packing question about the trip in a single call. */
export async function decideTrip(trip: string, abortSignal?: AbortSignal): Promise<DecideResponse> {
  const started = performance.now();
  const result = await decide({
    model: DECISION_MODEL,
    state: { trip },
    questions,
    abortSignal,
    maxRetries: 1,
  });
  const latencyMs = Math.round(performance.now() - started);

  const { season, temperature, bag } = result.answers;
  const seasons = {
    ...oneHot(SEASON_IDS, season.choice),
    ...season.probabilities,
  } as Record<SeasonId, number>;

  const signals = {
    ...Object.fromEntries(SIGNAL_IDS.map((id) => [id, result.answers[id].probability])),
    ...seasons,
  } as Signals;

  return {
    signals,
    season: season.choice,
    temperature: temperature.score,
    bag: bag.choice,
    bagProbabilities: bag.probabilities,
    source: "model",
    model: result.response?.modelId ?? DECISION_MODEL,
    latencyMs,
  };
}

// --- Offline fallback -------------------------------------------------------
// Keeps the UI usable without AI Gateway credentials. Crude keyword matching,
// clearly labelled as such in the UI; it is not what the demo is about.

const KEYWORDS: Record<SignalId, RegExp> = {
  sun: /\b(sun|sunny|beach|coast|hot|warm|summer|tropical|2[4-9]°|3\d°)/i,
  cold: /\b(cold|chilly|winter|snow|ski|freez|cool|-?[0-9]°c|1[01]°)/i,
  snow: /\b(snow|ski|freez|ice|icy|glacier)|-\d+°/i,
  rain: /\b(rain|showers?|wet|storm|monsoon|drizzle)/i,
  swimming: /\b(swim|beach|pool|snorkel|surf|dive|lake)/i,
  hiking: /\b(hik|trek|trail|mountain|summit|highlands|camp|glacier walk)/i,
  exploring: /\b(explor|sightsee|museum|city|walks?|tour|photo|old town|temple|market)/i,
  abroad: /\b(abroad|flying from|international|overseas)/i,
  flying: /\b(fly|flying|flight|plane|airport)/i,
  reading: /\b(read|book|novel|relax|downtime)/i,
  work: /\b(work|conference|meeting|business|laptop|client)/i,
  formal: /\b(wedding|formal|gala|dress code|fancy|opera|fine dining)/i,
  fitness: /\b(run|running|gym|workout|yoga|marathon)/i,
  packLight: /\b(pack light|minimal|carry-on only|hand luggage)/i,
};

const SEASON_KEYWORDS: Record<SeasonId, RegExp> = {
  winter: /\b(winter|december|january|february|christmas|snow|ski)/i,
  spring: /\b(spring|march|april|may|blossom)/i,
  summer: /\b(summer|june|july|august)/i,
  autumn: /\b(autumn|fall|september|october|november)/i,
};

export function decideOffline(trip: string): DecideResponse {
  const started = performance.now();
  const flags = Object.fromEntries(
    SIGNAL_IDS.map((id) => [id, KEYWORDS[id].test(trip) ? 0.85 : 0.1]),
  ) as Record<SignalId, number>;
  if (/no rain/i.test(trip)) flags.rain = 0.05;

  const season = SEASON_IDS.find((id) => SEASON_KEYWORDS[id].test(trip)) ?? "summer";
  const temperature =
    flags.snow > 0.5 ? 0.5 : flags.cold > 0.5 ? 1.5 : flags.sun > 0.5 ? 3.6 : 2.5;
  const days = Number(
    /(\d+)\s*(days|nights)/i.exec(trip)?.[1] ?? (/weekend/i.test(trip) ? 3 : /week/i.test(trip) ? 7 : 5),
  );
  const bag: BagId =
    flags.snow > 0.5 || days > 9 ? "checked" : days > 6 || flags.hiking > 0.5 ? "carryon" : days <= 2 ? "underseat" : "cabin";

  return {
    signals: { ...flags, ...oneHot(SEASON_IDS, season) },
    season,
    temperature,
    bag,
    source: "offline",
    model: "keyword heuristic",
    latencyMs: Math.round(performance.now() - started),
  };
}
