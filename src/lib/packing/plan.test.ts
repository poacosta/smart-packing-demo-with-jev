import assert from "node:assert/strict";
import { test } from "node:test";
import { BAG_IDS, BAGS, ITEMS, SEASON_IDS, SIGNAL_IDS, type Signals } from "./catalog";
import { computePlan, isRelevant, type Overrides } from "./plan";

const summer = {
  ...Object.fromEntries([...SIGNAL_IDS, ...SEASON_IDS].map((id) => [id, 0])),
  summer: 1,
  sun: 0.9,
  swimming: 0.9,
} as Signals;

const summerScores = Object.fromEntries(ITEMS.map((item) => [
  item.id, item.signal === "basic" ? 1 : summer[item.signal],
]));

test("treats every selectable capacity as a limit without adding clothing copies", () => {
  for (const bag of BAG_IDS) {
    const plan = computePlan(summer, bag, {}, summerScores);
    assert.ok(plan.usedLiters < BAGS[bag].liters, bag);
    assert.equal(plan.items.find((row) => row.item.id === "wool-coat")?.quantity, 0);
    for (const row of plan.packed) {
      assert.equal(row.quantity, 1, row.item.id);
    }
    const total = plan.packed.reduce((sum, row) => sum + row.quantity * row.item.liters, 0);
    assert.ok(Math.abs(total - plan.usedLiters) < 1e-9);
  }
  assert.equal(computePlan(summer, "checked", {}, summerScores).usedLiters, 16.2);
});

test("keeps user picks and basics while leaving excluded garments out", () => {
  const plan = computePlan(summer, "underseat", {
    "cotton-tees": "out",
    "puffer-jacket": "in",
  }, summerScores);
  assert.equal(plan.items.find((row) => row.item.id === "cotton-tees")?.status, "removed");
  assert.equal(plan.items.find((row) => row.item.id === "puffer-jacket")?.quantity, 1);
  for (const row of plan.items.filter((row) => row.item.signal === "basic" && row.item.id !== "cotton-tees")) {
    assert.equal(row.quantity, 1);
  }
  assert.ok(plan.usedLiters < 18);
});

test("leaves space instead of duplicating equipment when no clothing is available", () => {
  const allowed = new Set(["passport", "travel-adapter", "laptop"]);
  const overrides: Overrides = Object.fromEntries(
    ITEMS.filter((item) => !allowed.has(item.id)).map((item) => [item.id, "out"]),
  );
  const scores = Object.fromEntries(ITEMS.map((item) => [item.id, 1]));
  const plan = computePlan(summer, "checked", overrides, scores);
  assert.equal(plan.usedLiters, 2.8);
  assert.equal(plan.packed.length, 3);
  assert.ok(plan.packed.every((row) => row.quantity === 1));
});

test("finds the most useful combination within capacity", () => {
  const allowed = new Set([
    "wool-coat", "puffer-jacket", "winter-boots", "hiking-boots", "ankle-boots",
    "passport", "travel-adapter", "sunscreen", "tiny-umbrella",
  ]);
  const candidates = ITEMS.filter((item) => allowed.has(item.id));
  const overrides: Overrides = Object.fromEntries(
    ITEMS.filter((item) => !allowed.has(item.id)).map((item) => [item.id, "out"]),
  );
  const scores = Object.fromEntries(candidates.map((item, index) => [item.id, 0.5 + index * 0.05]));
  let best = 0;
  for (let mask = 0; mask < 2 ** candidates.length; mask++) {
    const units = candidates.reduce((sum, item, index) =>
      sum + ((mask & (1 << index)) ? Math.round(item.liters * 10) : 0), 0);
    const utility = candidates.reduce((sum, item, index) =>
      sum + ((mask & (1 << index)) ? scores[item.id] : 0), 0);
    if (units <= 180) best = Math.max(best, utility);
  }
  const plan = computePlan(summer, "underseat", overrides, scores);
  const utility = plan.packed.reduce((sum, row) => sum + scores[row.item.id], 0);
  assert.ok(Math.abs(utility - best) < 1e-9);
});

test("prefers more useful items even when a bulkier alternative would fill the bag", () => {
  const scores = {
    "wool-coat": 0.5, "puffer-jacket": 0.5, "hiking-boots": 0.5,
    "ankle-boots": 0.5, "linen-shirt": 0.5, "dark-jeans": 1,
  };
  const overrides: Overrides = Object.fromEntries(
    ITEMS.filter((item) => !(item.id in scores)).map((item) => [item.id, "out"]),
  );
  const plan = computePlan(summer, "underseat", overrides, scores);
  assert.equal(plan.usedLiters, 15);
  assert.equal(plan.items.find((row) => row.item.id === "dark-jeans")?.quantity, 1);
  const fullAlternative = computePlan(summer, "underseat", {
    ...overrides, "dark-jeans": "out",
  }, scores);
  assert.equal(fullAlternative.usedLiters, 18);
});

test("leaves optional items at home even with spare capacity unless manually added", () => {
  const scores = { ...summerScores, "good-book": 0.25 };
  const plan = computePlan(summer, "checked", {}, scores);
  assert.equal(plan.items.find((row) => row.item.id === "good-book")?.status, "skipped");
  assert.ok(plan.usedLiters < plan.capacity);
  const manual = computePlan(summer, "checked", { "good-book": "in" }, scores);
  assert.equal(manual.items.find((row) => row.item.id === "good-book")?.quantity, 1);
});

test("uses the model's item suitability instead of filling with rejected recommendations", () => {
  const scores = Object.fromEntries(ITEMS.map((item) => [item.id, 0]));
  const plan = computePlan(summer, "cabin", {}, scores);
  assert.ok(plan.packed.every((row) => row.item.signal === "basic"));
  assert.equal(plan.items.find((row) => row.item.id === "linen-shirt")?.quantity, 0);
});

test("does not invent additional quantities before a decision is available", () => {
  const plan = computePlan(null, "checked", {});
  assert.ok(plan.packed.every((row) => row.item.signal === "basic" && row.quantity === 1));
  assert.ok(plan.usedLiters < plan.capacity);
});

test("never exceeds capacity across different suitability distributions", () => {
  for (let sample = 0; sample < 5; sample++) {
    const scores = Object.fromEntries(ITEMS.map((item, index) => [
      item.id, ((index * 17 + sample * 13) % 101) / 100,
    ]));
    for (const bag of BAG_IDS) {
      const plan = computePlan(summer, bag, {}, scores);
      assert.ok(plan.usedLiters <= plan.capacity, `${bag}, sample ${sample}`);
      const units = plan.packed.reduce((sum, row) =>
        sum + row.quantity * Math.round(row.item.liters * 10), 0);
      assert.equal(units, Math.round(plan.usedLiters * 10));
    }
  }
});

test("the shared wardrobe keeps all items available at every capacity", () => {
  for (const bag of BAG_IDS) {
    const plan = computePlan(summer, bag, {}, summerScores);
    assert.deepEqual(plan.items.map((row) => row.item.id), ITEMS.map((item) => item.id));
    assert.ok(plan.usedLiters <= BAGS[bag].liters, bag);
    for (const id of ["lightweight-overshirt", "formal-jacket", "swim-cap", "swim-shorts", "party-shirt", "evening-top"]) {
      assert.ok(plan.items.some((row) => row.item.id === id), id);
    }
  }
});

test("manual picks can combine any clothing from the shared wardrobe", () => {
  const selected = ["lightweight-overshirt", "formal-jacket", "swim-cap", "swim-shorts"];
  const plan = computePlan(summer, "checked", Object.fromEntries(selected.map((id) => [id, "in"])), summerScores);
  for (const id of selected) {
    assert.equal(plan.items.find((row) => row.item.id === id)?.quantity, 1, id);
  }
  assert.ok(plan.usedLiters <= plan.capacity);
});

test("visible cards follow item suitability rather than a broad seasonal signal", () => {
  const scores = Object.fromEntries(ITEMS.map((item) => [item.id, 0.1]));
  scores["blazer"] = 0.9;
  const plan = computePlan(summer, "carryon", {}, scores);
  const linen = plan.items.find((row) => row.item.id === "linen-shirt")!;
  const blazer = plan.items.find((row) => row.item.id === "blazer")!;
  assert.equal(linen.status, "skipped");
  assert.equal(isRelevant(linen), false);
  assert.equal(blazer.status, "packed");
  assert.equal(isRelevant(blazer), true);
  const manual = computePlan(summer, "carryon", { "linen-shirt": "in" }, scores);
  assert.equal(isRelevant(manual.items.find((row) => row.item.id === "linen-shirt")!), true);
});
