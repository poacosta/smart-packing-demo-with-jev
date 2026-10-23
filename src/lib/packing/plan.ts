import {
  BAGS,
  ITEMS,
  SEASONS,
  signalLabel,
  type BagId,
  type Item,
  type Signals,
  type TripSignalId,
} from "./catalog";

export type Override = "in" | "out";
export type Overrides = Record<string, Override>;

export type ItemStatus =
  /** In the bag. */
  | "packed"
  /** Jev wants it, but the bag is full. */
  | "no-room"
  /** Signal too weak to pack it. */
  | "skipped"
  /** The traveller took it out. */
  | "removed";

export type PlannedItem = {
  item: Item;
  /** Number of packed units; zero when the item is left out. */
  quantity: number;
  /** Model suitability, or fallback signal probability; null for basic kit. */
  probability: number | null;
  status: ItemStatus;
  override?: Override;
  /** Short label shown on the card, e.g. "92% sun". */
  reason: string;
  /** Longer explanation for the tooltip. */
  why: string;
};

export type Plan = {
  items: PlannedItem[];
  packed: PlannedItem[];
  usedLiters: number;
  capacity: number;
  threshold: number;
};

const BASE_THRESHOLD = 0.5;
const PACK_LIGHT_THRESHOLD = 0.6;
// Seasons share one choice distribution, so a shoulder-season trip
// (e.g. 55% spring, 40% summer) should still get some clothing from both seasons.
const SEASON_THRESHOLD = 0.35;
const ITEM_SCORE_THRESHOLD = 0.5;
/** Below this, an item isn't worth showing as a card. */
export const RELEVANCE_FLOOR = ITEM_SCORE_THRESHOLD;

const pct = (p: number) => `${Math.round(p * 100)}%`;

export function computePlan(
  signals: Signals | null,
  bagId: BagId,
  overrides: Overrides,
  itemScores: Record<string, number> | null = null,
): Plan {
  const capacity = BAGS[bagId].liters;
  const threshold =
    signals && signals.packLight >= 0.5 ? PACK_LIGHT_THRESHOLD : BASE_THRESHOLD;

  const thresholdFor = (signal: TripSignalId) =>
    signal in SEASONS ? SEASON_THRESHOLD : threshold;

  const rows = ITEMS.map((item) => {
    const score = itemScores?.[item.id];
    const probability =
      item.signal === "basic" || !signals ? null : score ?? signals[item.signal];
    const override = overrides[item.id];
    const wanted =
      override === "in" ||
      (override !== "out" &&
        (item.signal === "basic" ||
          (score != null
            ? score >= ITEM_SCORE_THRESHOLD
            : (probability ?? 0) >= thresholdFor(item.signal))));
    // User picks reserve space before basics.
    const priority =
      override === "in" ? 3 : item.signal === "basic" ? 2 : (score ?? probability ?? 0);
    return { item, probability, score, override, wanted, priority };
  });

  // Reserve one unit of user picks and basics before selecting useful items.
  // Integer decilitres avoid rounding errors in the capacity search.
  const quantities = new Map<string, number>();
  const capacityUnits = Math.round(capacity * 10);
  let reservedUnits = 0;
  for (const row of [...rows].sort((a, b) => b.priority - a.priority)) {
    if (!row.wanted || (row.override !== "in" && row.item.signal !== "basic")) continue;
    const units = Math.round(row.item.liters * 10);
    if (reservedUnits + units <= capacityUnits) {
      reservedUnits += units;
      quantities.set(row.item.id, 1);
    }
  }

  type Fill = { utility: number; previous: Fill | null; id: string; quantity: number };
  const remaining = capacityUnits - reservedUnits;
  let fills: (Fill | undefined)[] = Array(remaining + 1);
  fills[0] = { utility: 0, previous: null, id: "", quantity: 0 };

  if (signals) {
    for (const row of rows) {
      if (!row.wanted) continue;
      const existing = quantities.get(row.item.id) ?? 0;
      const units = Math.round(row.item.liters * 10);
      const limit = 1 - existing;
      const next = [...fills];
      const suitability = Math.max(row.score ?? row.probability ?? 1, 0.01);
      for (let used = 0; used <= remaining; used++) {
        const previous = fills[used];
        if (!previous) continue;
        let utility = previous.utility;
        for (let count = 1; count <= limit && used + count * units <= remaining; count++) {
          utility += suitability;
          const total = used + count * units;
          if (!next[total] || utility > next[total]!.utility) {
            next[total] = { utility, previous, id: row.item.id, quantity: count };
          }
        }
      }
      fills = next;
    }
  }

  // Capacity is a limit, not a target. Prefer usefulness, then less luggage.
  let filledUnits = 0;
  for (let used = 1; used <= remaining; used++) {
    if (fills[used] && fills[used]!.utility > fills[filledUnits]!.utility) filledUnits = used;
  }
  for (let fill = fills[filledUnits]; fill?.previous; fill = fill.previous) {
    quantities.set(fill.id, (quantities.get(fill.id) ?? 0) + fill.quantity);
  }
  const usedLiters = (reservedUnits + filledUnits) / 10;

  const items = rows.map(({ item, probability, score, override, wanted }): PlannedItem => {
    const quantity = quantities.get(item.id) ?? 0;
    const status: ItemStatus = quantity > 0
      ? "packed"
      : override === "out"
        ? "removed"
        : wanted
          ? "no-room"
          : "skipped";

    const reason =
      override === "in"
        ? "Your pick"
        : item.signal === "basic"
          ? "Basic kit"
          : score != null
            ? `${pct(score)} trip fit`
            : probability == null
              ? "—"
              : `${pct(probability)} ${signalLabel(item.signal)}`;

    let why: string;
    if (override === "in") why = "You added this one.";
    else if (override === "out") why = "You took this out. Tap to pack it again.";
    else if (item.signal === "basic") why = "Basic kit: goes on every trip.";
    else if (score != null)
      why = `${item.use} Suitability for this trip and ${capacity} L capacity: ${pct(score)}. Appropriate items are considered from ${pct(ITEM_SCORE_THRESHOLD)}.`;
    else if (probability == null) why = "Waiting for Jev.";
    else
      why = `Jev: ${pct(probability)} chance of “${signalLabel(item.signal)}”. Packs at ${pct(thresholdFor(item.signal))} or more.`;
    if (status === "no-room") why += ` No room left in the ${capacity} L bag.`;
    if (quantity > 0)
      why += ` Packed: ${quantity} ${quantity === 1 ? "unit" : "units"}, ${(quantity * item.liters).toFixed(1)} L in total.`;

    return { item, quantity, probability, status, override, reason, why };
  });

  return {
    items,
    packed: items.filter((i) => i.status === "packed"),
    usedLiters,
    capacity,
    threshold,
  };
}

export function isRelevant(p: PlannedItem) {
  return (
    p.status === "packed" ||
    p.status === "no-room" ||
    p.override != null ||
    p.item.signal === "basic" ||
    (p.probability ?? 0) >= RELEVANCE_FLOOR
  );
}
