import assert from "node:assert/strict";
import { test } from "node:test";
import { Experimental_DecisionMockModelV4 as DecisionMockModelV4 } from "ai/test";
import { BAG_IDS, BAGS, getWardrobeItems, ITEMS, SIGNAL_IDS, WARDROBE_IDS } from "./catalog";
import { decideOffline, decideTrip } from "./decision";

const configurations = BAG_IDS.flatMap((bag) => WARDROBE_IDS.map((wardrobe) => ({ bag, wardrobe })));

test("passes every selected capacity and all item questions through the decision SDK", async () => {
  for (const { bag, wardrobe } of configurations) {
    const selectedItems = getWardrobeItems(wardrobe);
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
        assert.equal((state.value as { wardrobe: string }).wardrobe, wardrobe);
        assert.match((state.value as { packingGoal: string }).packingGoal, /may remain partly empty/);
        assert.equal(options.abortSignal, controller.signal);
        assert.equal(Object.keys(options.questions).length, SIGNAL_IDS.length + 2 + selectedItems.length);
        assert.equal(options.questions.bag, undefined);
        for (const item of selectedItems) {
          const question = options.questions[`item_${item.id.replaceAll("-", "_")}`];
          assert.equal(question.type, "score");
          assert.match(JSON.stringify(question.instructions), /Capacity is an upper limit, not a target/);
        }
        for (const item of ITEMS.filter((item) => item.wardrobe && item.wardrobe !== wardrobe)) {
          assert.equal(options.questions[`item_${item.id.replaceAll("-", "_")}`], undefined);
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

    const result = await decideTrip("A summer trip to the beach.", bag, wardrobe, controller.signal, model);
    assert.equal(calls, 1);
    assert.equal(result.bag, bag);
    assert.equal(result.wardrobe, wardrobe);
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
  }
});

test("offline decisions respect the selected capacity instead of choosing another bag", () => {
  for (const { bag, wardrobe } of configurations) {
    const result = decideOffline("Three weeks skiing in winter snow.", bag, wardrobe);
    assert.equal(result.bag, bag);
    assert.equal(result.source, "offline");
    assert.equal(result.wardrobe, wardrobe);
    assert.equal(result.questionCount, 0);
    assert.equal(result.request, null);
    assert.equal(Object.keys(result.itemScores).length, getWardrobeItems(wardrobe).length);
  }
});
