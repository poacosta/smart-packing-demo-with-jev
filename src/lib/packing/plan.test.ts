import assert from "node:assert/strict";
import { test } from "node:test";
import { BAG_IDS, BAGS, getWardrobeItems, ITEMS, SEASON_IDS, SIGNAL_IDS, WARDROBE_IDS, type Signals } from "./catalog";
import { computePlan, type Overrides } from "./plan";

const summer = {
  ...Object.fromEntries([...SIGNAL_IDS, ...SEASON_IDS].map((id) => [id, 0])),
  summer: 1,
  sun: 0.9,
  swimming: 0.9,
} as Signals;

const summerScores = Object.fromEntries(ITEMS.map((item) => [
  item.id, item.signal === "basic" ? 1 : summer[item.signal],
]));

test("fills every selectable capacity with suitable items and clothing quantities", () => {
  for (const bag of BAG_IDS) {
    const plan = computePlan(summer, bag, {}, summerScores);
    assert.equal(plan.usedLiters, BAGS[bag].liters, bag);
    assert.ok(plan.packed.some((row) => row.quantity > 1));
    assert.equal(plan.items.find((row) => row.item.id === "wool-coat")?.quantity, 0);
    for (const row of plan.packed) {
      assert.ok(Number.isInteger(row.quantity) && row.quantity > 0);
      if (!row.item.repeatable) assert.equal(row.quantity, 1, row.item.id);
    }
    const total = plan.packed.reduce((sum, row) => sum + row.quantity * row.item.liters, 0);
    assert.ok(Math.abs(total - plan.usedLiters) < 1e-9);
  }
  const largePlan = computePlan(summer, "checked", {}, summerScores);
  const units = (id: string) => largePlan.items.find((row) => row.item.id === id)!.quantity;
  assert.ok(units("swim-shorts") <= 2 * units("linen-shirt"), "Tiny garments must not dominate spare capacity");
});

test("keeps user picks and basics while refilling around an excluded garment", () => {
  const plan = computePlan(summer, "underseat", {
    "cotton-tees": "out",
    "puffer-jacket": "in",
  }, summerScores);
  assert.equal(plan.items.find((row) => row.item.id === "cotton-tees")?.status, "removed");
  assert.equal(plan.items.find((row) => row.item.id === "puffer-jacket")?.quantity, 1);
  for (const row of plan.items.filter((row) => row.item.signal === "basic" && row.item.id !== "cotton-tees")) {
    assert.equal(row.quantity, 1);
  }
  assert.equal(plan.usedLiters, 18);
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

test("finds the fullest combination instead of accepting a greedy remainder", () => {
  const allowed = new Set([
    "wool-coat", "puffer-jacket", "winter-boots", "hiking-boots", "ankle-boots",
    "passport", "travel-adapter", "sunscreen", "tiny-umbrella",
  ]);
  const candidates = ITEMS.filter((item) => allowed.has(item.id));
  const overrides: Overrides = Object.fromEntries(
    ITEMS.filter((item) => !allowed.has(item.id)).map((item) => [item.id, "out"]),
  );
  let best = 0;
  for (let mask = 0; mask < 2 ** candidates.length; mask++) {
    const units = candidates.reduce((sum, item, index) =>
      sum + ((mask & (1 << index)) ? Math.round(item.liters * 10) : 0), 0);
    if (units <= 180) best = Math.max(best, units);
  }
  const scores = Object.fromEntries(candidates.map((item) => [item.id, 0.5]));
  assert.equal(computePlan(summer, "underseat", overrides, scores).usedLiters, best / 10);
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

test("both wardrobes fill every capacity and keep only their compatible clothing", () => {
  for (const wardrobe of WARDROBE_IDS) {
    for (const bag of BAG_IDS) {
      const plan = computePlan(summer, bag, {}, summerScores, wardrobe);
      assert.equal(plan.items.length, getWardrobeItems(wardrobe).length);
      assert.ok(plan.items.every((row) => !row.item.wardrobe || row.item.wardrobe === wardrobe));
      assert.equal(plan.usedLiters, BAGS[bag].liters, `${wardrobe}, ${bag}`);
      assert.ok(plan.packed.some((row) => row.item.signal === "swimming"));
      assert.equal(plan.items.find((row) => row.item.id === "phone-charger")?.quantity, 1);
    }
  }
});

test("an incompatible manual override cannot leak clothing into the other wardrobe", () => {
  const men = computePlan(summer, "checked", {
    "summer-dress": "in", "formal-dress": "in", swimwear: "in",
  }, summerScores, "men");
  assert.ok(men.items.every((row) => row.item.wardrobe !== "women"));
  const women = computePlan(summer, "checked", {
    "smart-outfit": "in", "swim-shorts": "in",
  }, summerScores, "women");
  assert.ok(women.items.every((row) => row.item.wardrobe !== "men"));
});
