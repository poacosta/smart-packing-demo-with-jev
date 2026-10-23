"use client";

import {
  BAGS,
  SIGNAL_IDS,
  SIGNALS,
  TEMPERATURE_LEVELS,
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
        <h3 className="mb-3 text-base font-semibold">
          Trip signals · probability
        </h3>
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {signals.map((id) => {
            const p = decision.signals[id];
            return (
              <li key={id} title={SIGNALS[id].question}>
                <div className="flex justify-between text-sm">
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
          <h3 className="mb-2 text-base font-semibold">
            Temperature
          </h3>
          <p className="text-lg">{tempLevel}</p>
          <p className="text-sm text-muted tabular-nums">
            score {decision.temperature.toFixed(2)} of {TEMPERATURE_LEVELS.length - 1}
          </p>
        </div>
        <div>
          <h3 className="mb-2 text-base font-semibold">
            Bag
          </h3>
          <p className="text-sm">{BAGS[decision.bag].label}</p>
        </div>
        <p className="text-sm text-muted">
          {decision.source === "model"
            ? `${decision.questionCount} questions · ${decision.latencyMs} ms`
            : "Offline · no model call"}
        </p>
      </section>
    </div>
  );
}
