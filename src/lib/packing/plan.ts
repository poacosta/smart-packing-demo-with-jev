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
  /** Probability of the item's signal; null for basic kit. */
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
// (e.g. 55% spring, 40% summer) should still get some of both wardrobes.
const SEASON_THRESHOLD = 0.35;
/** Below this, an item isn't worth showing as a card. */
export const RELEVANCE_FLOOR = 0.15;

const pct = (p: number) => `${Math.round(p * 100)}%`;

export function computePlan(
  signals: Signals | null,
  bagId: BagId,
  overrides: Overrides,
): Plan {
  const capacity = BAGS[bagId].liters;
  const threshold =
    signals && signals.packLight >= 0.5 ? PACK_LIGHT_THRESHOLD : BASE_THRESHOLD;

  const thresholdFor = (signal: TripSignalId) =>
    signal in SEASONS ? SEASON_THRESHOLD : threshold;

  const rows = ITEMS.map((item) => {
    const probability =
      item.signal === "basic" || !signals ? null : signals[item.signal];
    const override = overrides[item.id];
    const wanted =
      override === "in" ||
      (override !== "out" &&
        (item.signal === "basic" ||
          (probability ?? 0) >= thresholdFor(item.signal)));
    // Your picks first, then basics, then the strongest signals.
    const priority =
      override === "in" ? 3 : item.signal === "basic" ? 2 : (probability ?? 0);
    return { item, probability, override, wanted, priority };
  });

  const packedIds = new Set<string>();
  let usedLiters = 0;
  for (const row of [...rows].sort((a, b) => b.priority - a.priority)) {
    if (!row.wanted) continue;
    if (usedLiters + row.item.liters <= capacity + 1e-9) {
      usedLiters += row.item.liters;
      packedIds.add(row.item.id);
    }
  }

  const items = rows.map(({ item, probability, override, wanted }): PlannedItem => {
    const status: ItemStatus = packedIds.has(item.id)
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
          : probability == null
            ? "—"
            : `${pct(probability)} ${signalLabel(item.signal)}`;

    let why: string;
    if (override === "in") why = "You added this one.";
    else if (override === "out") why = "You took this out. Tap to pack it again.";
    else if (item.signal === "basic") why = "Basic kit: goes on every trip.";
    else if (probability == null) why = "Waiting for Jev.";
    else
      why = `Jev: ${pct(probability)} chance of “${signalLabel(item.signal)}”. Packs at ${pct(thresholdFor(item.signal))} or more.`;
    if (status === "no-room") why += ` No room left in the ${capacity} L bag.`;

    return { item, probability, status, override, reason, why };
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
