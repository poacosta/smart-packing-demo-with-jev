"use client";

import {
  BAGS,
  SEASON_IDS,
  SEASONS,
  SIGNAL_IDS,
  SIGNALS,
  TEMPERATURE_LEVELS,
  WARDROBES,
} from "@/lib/packing/catalog";
import type { DecideResponse } from "@/lib/packing/types";

const pct = (p: number) => `${Math.round(p * 100)}%`;

export function UnderTheHood({
  decision,
}: {
  decision: DecideResponse | null;
}) {
  if (!decision) {
    return <p className="text-sm text-muted">No decision yet.</p>;
  }

  const signals = [...SIGNAL_IDS].sort((a, b) => decision.signals[b] - decision.signals[a]);
  const tempLevel = TEMPERATURE_LEVELS[Math.round(decision.temperature)];

  return (
    <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
      <section>
        <h3 className="mb-3 text-[10px] tracking-[0.2em] text-muted uppercase">
          Boolean questions · P(true)
        </h3>
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {signals.map((id) => {
            const p = decision.signals[id];
            return (
              <li key={id} title={SIGNALS[id].question}>
                <div className="flex justify-between text-xs">
                  <span>{SIGNALS[id].label}</span>
                  <span className="tabular-nums text-muted">{pct(p)}</span>
                </div>
                <div className="relative mt-1 h-1 rounded-full bg-line">
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${p >= 0.5 ? "bg-leaf" : "bg-muted/40"}`}
                    style={{ width: pct(p) }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-6">
        <div>
          <h3 className="mb-2 text-[10px] tracking-[0.2em] text-muted uppercase">
            Choice · season
          </h3>
          <ul className="space-y-1 text-xs">
            {SEASON_IDS.map((id) => (
              <li
                key={id}
                className={`flex justify-between ${id === decision.season ? "font-semibold" : "text-muted"}`}
              >
                <span className="capitalize">{SEASONS[id].label}</span>
                <span className="tabular-nums">{pct(decision.signals[id])}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-[10px] tracking-[0.2em] text-muted uppercase">
            Score · temperature
          </h3>
          <p className="font-serif text-2xl italic">{tempLevel}</p>
          <p className="text-xs text-muted tabular-nums">
            score {decision.temperature.toFixed(2)} of {TEMPERATURE_LEVELS.length - 1}
          </p>
        </div>
        <div>
          <h3 className="mb-2 text-[10px] tracking-[0.2em] text-muted uppercase">
            Your capacity
          </h3>
          <p className="text-sm">{BAGS[decision.bag].label}</p>
          <p className="mt-1 text-sm">{WARDROBES[decision.wardrobe].label} wardrobe</p>
          <p className="mt-1 text-xs text-muted">Passed to the model when scoring each item. This is a capacity limit; the bag may have room to spare.</p>
        </div>
        <p className="text-xs text-muted">
          {decision.source === "model"
            ? `${decision.questionCount} questions, one call to ${decision.model} in ${decision.latencyMs} ms.`
            : "Offline keyword matching; no model call."}{" "}
          The bars show trip signals; each item also receives a capacity-aware usefulness score. Packing prioritizes useful items within the limit.
        </p>
      </section>
    </div>
  );
}
