import "server-only";

import { experimental_decide as decide, type Experimental_DecisionQuestion } from "ai";
import {
  BAGS,
  ITEMS,
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

const ITEM_SCORE_CRITERIA = [
  "Not appropriate for this trip; leave it at home even if there is space",
  "Optional; leave it out unless the traveller explicitly adds it",
  "Useful for the planned weather or activities",
  "Important for this trip",
  "Essential for this trip",
];

const itemQuestionKey = (id: string): `item_${string}` => `item_${id.replaceAll("-", "_")}`;

const itemQuestions = Object.fromEntries(
  ITEMS.map((item) => [itemQuestionKey(item.id), {
    type: "score",
    instructions: `How useful is ${item.name} (${item.liters} litres per unit) for this trip? Item use: ${item.use} Score the actual need, not whether it could conceivably be worn. Use 0 for a climate or activity mismatch and 1 for merely optional items. Only score 2 or above when the described weather or activity calls for this item. An explicitly named season is the intended scenario; use typical destination weather for it unless explicit temperatures say otherwise. Distinguish swimming, nightlife, formal events and business conferences. Capacity is an upper limit, not a target: leave spare space rather than adding unnecessary items or extra clothing units.`,
    criteria: ITEM_SCORE_CRITERIA,
  }]),
) as Record<`item_${string}`, { type: "score"; instructions: string; criteria: string[] }>;

const tripQuestions = {
  season: {
    type: "choice",
    instructions:
      "Which season is the trip set in? Use an explicitly named season as the intended scenario. Otherwise infer from destination and dates, accounting for the hemisphere: July is winter in the south.",
    criteria: Object.fromEntries(SEASON_IDS.map((id) => [id, SEASONS[id].description])) as Record<
      SeasonId,
      string
    >,
  },
  temperature: {
    type: "score",
    instructions: "What is the typical temperature during the trip? Prefer explicit temperatures. Otherwise use the explicitly named season and destination; infer the season from dates only when it is not named.",
    criteria: [...TEMPERATURE_LEVELS],
  },
} satisfies Record<string, Experimental_DecisionQuestion>;

export function hasGatewayCredentials() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

/** One-hot distribution for providers that return a choice without probabilities. */
function oneHot<K extends string>(ids: readonly K[], picked: K): Record<K, number> {
  return Object.fromEntries(ids.map((id) => [id, id === picked ? 1 : 0])) as Record<K, number>;
}

/** Ask Jev every packing question about the trip in a single call. */
export async function decideTrip(
  trip: string,
  bag: BagId = "cabin",
  abortSignal?: AbortSignal,
  model: Parameters<typeof decide>[0]["model"] = DECISION_MODEL,
): Promise<DecideResponse> {
  const started = performance.now();
  const questions: typeof signalQuestions & typeof itemQuestions & typeof tripQuestions = {
    ...signalQuestions,
    ...itemQuestions,
    ...tripQuestions,
  };
  const request = {
    model: typeof model === "string" ? model : model.modelId,
    state: {
      trip,
      capacityLiters: BAGS[bag].liters,
      packingGoal: "Pack useful items for the trip within the selected capacity. The catalog contains unisex garments and shared accessories; distinguish them by climate, activity and dress code. Respect clothing preferences stated in the trip. The bag may remain partly empty. Do not add optional items or extra clothing units just to fill space.",
    },
    questions,
    maxRetries: 1,
  };
  const result = await decide({ ...request, model, abortSignal });
  const latencyMs = Math.round(performance.now() - started);

  const { season, temperature } = result.answers;
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
    bag,
    questionCount: Object.keys(questions).length,
    itemScores: Object.fromEntries(ITEMS.map((item) => [
      item.id,
      Math.max(0, Math.min(1, result.answers[itemQuestionKey(item.id)].score / (ITEM_SCORE_CRITERIA.length - 1))),
    ])),
    source: "model",
    model: result.response?.modelId ?? DECISION_MODEL,
    latencyMs,
    request,
    response: { answers: result.answers, usage: result.usage },
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
  conference: /\b(conference|convention|trade show|business event|client meeting|presentation|workshop)/i,
  party: /\b(part(y|ies)|nightclub|nightlife|cocktail|celebration|reception)/i,
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

export function decideOffline(
  trip: string,
  bag: BagId = "cabin",
): DecideResponse {
  const started = performance.now();
  const flags = Object.fromEntries(
    SIGNAL_IDS.map((id) => [id, KEYWORDS[id].test(trip) ? 0.85 : 0.1]),
  ) as Record<SignalId, number>;
  if (/no rain/i.test(trip)) flags.rain = 0.05;

  const explicitSeason = trip.match(/\b(winter|spring|summer|autumn|fall)\b/i)?.[1].toLowerCase();
  const season = (explicitSeason === "fall" ? "autumn" : explicitSeason) as SeasonId | undefined
    ?? SEASON_IDS.find((id) => SEASON_KEYWORDS[id].test(trip)) ?? "summer";
  const temperature =
    flags.snow > 0.5 ? 0.5 : flags.cold > 0.5 ? 1.5 : flags.sun > 0.5 ? 3.6 : 2.5;
  const signals: Signals = { ...flags, ...oneHot(SEASON_IDS, season) };

  return {
    signals,
    season,
    temperature,
    bag,
    questionCount: 0,
    itemScores: Object.fromEntries(ITEMS.map((item) => [
      item.id, item.signal === "basic" ? 1 : Math.max(signals[item.signal], ...(item.alsoFor ?? []).map((signal) => signals[signal])),
    ])),
    source: "offline",
    model: "keyword heuristic",
    latencyMs: Math.round(performance.now() - started),
    request: null,
    response: null,
  };
}
