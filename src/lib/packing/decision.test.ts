import assert from "node:assert/strict";
import { test } from "node:test";
import { Experimental_DecisionMockModelV4 as DecisionMockModelV4 } from "ai/test";
import { BAG_IDS, BAGS, ITEMS, SIGNAL_IDS } from "./catalog";
import { decideOffline, decideTrip } from "./decision";
import { computePlan } from "./plan";
import { ITEM_ILLUSTRATIONS, WARDROBE_ILLUSTRATIONS, UNISEX_ILLUSTRATIONS } from "./illustrations";

test("passes every selected capacity and all item questions through the decision SDK", async () => {
  for (const bag of BAG_IDS) {
    const selectedItems = ITEMS;
    const controller = new AbortController();
    let calls = 0;
    let sentState: unknown;
    let sentQuestions: unknown;
    const model = new DecisionMockModelV4({
      modelId: "packing-capacity-test",
      supportedQuestionTypes: ["boolean", "choice", "score"],
      doDecide: async (options) => {
        calls++;
        const state = options.state.find((part) => part.type === "json");
        assert.ok(state?.type === "json");
        sentState = state.value;
        sentQuestions = options.questions;
        assert.equal((state.value as { capacityLiters: number }).capacityLiters, BAGS[bag].liters);
        assert.equal("wardrobe" in (state.value as object), false);
        assert.equal("wardrobePreference" in (state.value as object), false);
        assert.match((state.value as { packingGoal: string }).packingGoal, /may remain partly empty/);
        assert.equal(options.abortSignal, controller.signal);
        assert.equal(Object.keys(options.questions).length, SIGNAL_IDS.length + 2 + selectedItems.length);
        assert.equal(options.questions.bag, undefined);
        for (const item of selectedItems) {
          const question = options.questions[`item_${item.id.replaceAll("-", "_")}`];
          assert.equal(question.type, "score");
          assert.match(JSON.stringify(question.instructions), /Capacity is an upper limit, not a target/);
          assert.ok(JSON.stringify(question.instructions).includes(item.use));
        }
        return {
          answers: Object.fromEntries(Object.entries(options.questions).map(([id, question]) => [
            id,
            question.type === "boolean"
              ? { type: "boolean" as const, probability: 0.8 }
              : question.type === "choice"
                ? { type: "choice" as const, choice: "summer" }
                : { type: "score" as const, score: 3 },
          ])),
          warnings: [],
          response: { modelId: "packing-capacity-test" },
        };
      },
    });

    const result = await decideTrip("A summer trip to the beach.", bag, controller.signal, model);
    assert.equal(calls, 1);
    assert.equal(result.bag, bag);
    assert.equal("wardrobe" in result, false);
    assert.equal(result.questionCount, SIGNAL_IDS.length + 2 + selectedItems.length);
    assert.equal(result.source, "model");
    assert.equal(result.model, "packing-capacity-test");
    assert.equal(Object.keys(result.itemScores).length, selectedItems.length);
    assert.ok(Object.values(result.itemScores).every((score) => score === 0.75));
    assert.ok(result.request);
    assert.equal(result.request.model, "packing-capacity-test");
    assert.deepEqual(result.request.state, sentState);
    assert.deepEqual(result.request.questions, sentQuestions);
    assert.deepEqual(Object.keys(result.request).sort(), ["maxRetries", "model", "questions", "state"]);
    assert.equal(result.request.maxRetries, 1);
    assert.ok(result.response);
    assert.equal(Object.keys(result.response.answers).length, result.questionCount);
    assert.deepEqual(result.response.answers.sun, { type: "boolean", probability: 0.8 });
    assert.deepEqual(result.response.answers.season, { type: "choice", choice: "summer" });
    assert.deepEqual(result.response.answers.item_cotton_tees, { type: "score", score: 3 });
    assert.deepEqual(Object.keys(result.response).sort(), ["answers", "usage"]);
  }
});

test("every item has distinct artwork and specific suitability guidance", () => {
  assert.equal(new Set(ITEMS.map((item) => item.id)).size, ITEMS.length);
  for (const item of ITEMS) {
    assert.ok(item.use.length > 30, item.id);
    assert.ok(item.image || ITEM_ILLUSTRATIONS[item.id] || WARDROBE_ILLUSTRATIONS[item.id] || UNISEX_ILLUSTRATIONS[item.id], item.id);
  }
});

test("the unisex catalog replaces retired outfits while retaining occasion coverage", () => {
  const ids = new Set(ITEMS.map((item) => item.id));
  for (const id of ["summer-dress", "formal-dress", "cocktail-dress", "swimwear", "smart-outfit", "evening-bag", "jewelry", "bow-tie"]) {
    assert.equal(ids.has(id), false, id);
  }
  for (const id of ["lightweight-overshirt", "swim-shorts", "swim-cap", "party-shirt", "evening-top", "formal-jacket", "formal-trousers", "blazer", "business-shirt"]) {
    assert.ok(ids.has(id), id);
  }
});

test("offline seasonal scenarios replace several garments in the shared wardrobe", () => {
  const plans = Object.fromEntries(["winter", "spring", "summer", "autumn"].map((season) => {
    const d = decideOffline(`Five days in Hamburg in ${season} for a city break.`, "carryon");
    const p = computePlan(d.signals, d.bag, {}, d.itemScores);
    assert.ok(p.usedLiters <= p.capacity);
    return [season, new Set(p.packed.map((row) => row.item.id))];
  }));
  for (const [from, to] of [["winter", "spring"], ["spring", "summer"], ["summer", "autumn"], ["autumn", "winter"]]) {
    assert.ok([...plans[from]].filter((id) => !plans[to].has(id)).length >= 4, `${from} -> ${to}`);
    assert.ok([...plans[to]].filter((id) => !plans[from].has(id)).length >= 4, `${to} -> ${from}`);
  }
  assert.ok(plans.winter.has("wool-socks"));
  assert.ok(plans.spring.has("long-sleeve-top"));
  assert.ok(plans.summer.has("espadrilles"));
  assert.ok(plans.autumn.has("quilted-vest"));
});

test("offline activities provide full swim, conference, party and formal kits", () => {
  const kits = {
    swimming: ["beach-towel", "swim-goggles", "flip-flops", "rash-guard"],
    conference: ["blazer", "business-shirt", "tailored-trousers", "notebook", "laptop"],
    party: ["crossbody-bag", "wristwatch", "dress-shoes"],
    wedding: ["dress-shoes", "crossbody-bag", "wristwatch"],
    reading: ["good-book", "tablet", "headphones"],
    hiking: ["hiking-boots", "daypack", "trekking-trousers", "trail-cap"],
  };
  for (const [activity, expected] of Object.entries(kits)) {
    const d = decideOffline(`Five days in Malaga in summer for ${activity}.`, "carryon");
    const p = computePlan(d.signals, d.bag, {}, d.itemScores);
    const packed = new Set(p.packed.map((row) => row.item.id));
    for (const id of expected) assert.ok(packed.has(id), `${activity}: ${id}`);
    if (activity === "party") assert.ok(packed.has("party-shirt") && packed.has("evening-top"));
    if (activity === "wedding") assert.ok(packed.has("formal-jacket") && packed.has("formal-trousers"));
    if (activity !== "conference") assert.equal(packed.has("blazer"), false);
    assert.ok(p.usedLiters <= p.capacity);
  }
});

test("an explicit season takes precedence over an unchanged month in the offline demo", () => {
  assert.equal(decideOffline("A spring city trip to Hamburg in December.").season, "spring");
  assert.equal(decideOffline("A fall city trip to Hamburg in July.").season, "autumn");
});

test("offline decisions respect the selected capacity instead of choosing another bag", () => {
  for (const bag of BAG_IDS) {
    const result = decideOffline("Three weeks skiing in winter snow.", bag);
    assert.equal(result.bag, bag);
    assert.equal(result.source, "offline");
    assert.equal("wardrobe" in result, false);
    assert.equal(result.questionCount, 0);
    assert.equal(result.request, null);
    assert.equal(result.response, null);
    assert.equal(Object.keys(result.itemScores).length, ITEMS.length);
  }
});
