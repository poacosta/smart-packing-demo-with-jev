"use client";

import { useMemo, useState } from "react";
import { BAG_IDS, BAGS, PRESETS, type BagId } from "@/lib/packing/catalog";
import { computePlan, isRelevant, type Overrides } from "@/lib/packing/plan";
import { ItemArt, ItemArtContext } from "./item-art";
import { ItemCard } from "./item-card";
import { JevRequest } from "./jev-request";
import { Suitcase } from "./suitcase";
import { UnderTheHood } from "./under-the-hood";
import { useDecision } from "./use-decision";

export function PackingDemo({ art }: { art: Record<string, string> }) {
  const [trip, setTrip] = useState<string>(PRESETS[0].text);
  const [live, setLive] = useState(true);
  const [bagId, setBagId] = useState<BagId>("cabin");
  const [overrides, setOverrides] = useState<Overrides>({});
  const { decision: response, status, error } = useDecision(trip, bagId, live);
  const decision = response?.bag === bagId ? response : null;

  const plan = useMemo(
    () => computePlan(decision?.signals ?? null, bagId, overrides, decision?.itemScores ?? null),
    [decision, bagId, overrides],
  );
  const cards = plan.items.filter(isRelevant);
  const leftOut = plan.items.filter((p) => !isRelevant(p));

  const toggle = (id: string, packed: boolean) =>
    setOverrides((prev) => ({ ...prev, [id]: packed ? "out" : "in" }));

  const statusMessage = !live
    ? "Paused"
    : status === "thinking"
      ? "Jev is deciding…"
      : status === "error"
        ? (error ?? "Jev could not decide.")
        : decision?.source === "offline"
          ? "Offline demo · keyword matching"
          : decision
            ? `Jev · ${decision.latencyMs} ms`
            : "Updates as you type";

  return (
    <ItemArtContext value={art}>
      <main className="mx-auto flex min-h-dvh max-w-[1180px] flex-col gap-5 px-4 py-5 sm:px-6">
        <header>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="font-serif text-3xl italic">Pack with Jev</h1>
            <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={live} onChange={(event) => setLive(event.target.checked)} className="size-4 accent-leaf" />
              Live updates
            </label>
          </div>
          <p className="mt-2 text-base text-muted">Describe a trip. Jev scores items. Your bag sets the limit.</p>
        </header>

        <section aria-label="Trip settings" className="space-y-3 rounded-xl border border-line bg-panel p-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <label htmlFor="trip" className="mr-auto text-base font-semibold">Where to?</label>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                aria-pressed={trip === preset.text}
                onClick={() => {
                  setTrip(preset.text);
                  setOverrides({});
                }}
                className={`min-h-10 rounded-md px-2 text-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-leaf ${trip === preset.text ? "font-semibold text-leaf underline" : "text-muted"}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <textarea
            id="trip"
            value={trip}
            onChange={(e) => setTrip(e.target.value)}
            rows={2}
            aria-label="Describe your trip"
            placeholder="Destination, dates, weather and plans"
            className="w-full resize-y rounded-lg border border-line bg-paper px-4 py-3 text-base leading-relaxed outline-none placeholder:text-muted focus:border-leaf focus:ring-2 focus:ring-leaf/30"
          />
          <JevRequest decision={decision} statusMessage={statusMessage} isError={status === "error"} />
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(320px,400px)_1fr]">
          <Suitcase plan={plan} onRemove={(id) => toggle(id, true)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm tracking-[0.15em] text-muted uppercase">Packing for</p>
                <h2 className="font-serif text-3xl leading-tight italic">Your next adventure</h2>
              </div>
              <label className="flex shrink-0 flex-col gap-1 text-sm text-muted">
                Capacity
                <select
                  value={bagId}
                  onChange={(e) => setBagId(e.target.value as BagId)}
                  className="min-h-10 rounded-lg border border-line bg-panel px-2 py-1.5 text-sm text-ink outline-none focus:ring-2 focus:ring-leaf/30"
                  aria-label="Bag size"
                >
                  {BAG_IDS.map((id) => <option key={id} value={id}>{BAGS[id].label}</option>)}
                </select>
              </label>
            </div>
          </Suitcase>
          <section aria-labelledby="packing-heading">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 id="packing-heading" className="font-serif text-3xl italic">Packing list</h2>
                <p className="mt-1 text-sm text-muted">Tap to add or remove.</p>
              </div>
              {Object.keys(overrides).length > 0 && (
                <button type="button" onClick={() => setOverrides({})} className="min-h-10 rounded-md text-sm font-medium text-leaf underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-leaf">Reset to Jev</button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {cards.map((p) => <ItemCard key={p.item.id} planned={p} onToggle={() => toggle(p.item.id, p.status === "packed")} />)}
            </div>
            {leftOut.length > 0 && (
              <details className="mt-5 rounded-lg border border-line bg-panel p-4">
                <summary className="cursor-pointer text-base font-medium focus-visible:outline-2 focus-visible:outline-leaf">Not packed ({leftOut.length})</summary>
                <div className="mt-4 flex flex-wrap gap-2">
                  {leftOut.map((p) => (
                    <button key={p.item.id} type="button" title={p.why} onClick={() => toggle(p.item.id, false)} className="flex min-h-11 items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-muted hover:border-leaf hover:text-ink focus-visible:outline-2 focus-visible:outline-leaf">
                      <ItemArt item={p.item} size={28} />{p.item.name}
                    </button>
                  ))}
                </div>
              </details>
            )}
          </section>
        </div>

        <details className="rounded-xl border border-line bg-panel p-5">
          <summary className="cursor-pointer text-base font-medium focus-visible:outline-2 focus-visible:outline-leaf">Decision scores</summary>
          <div className="mt-5"><UnderTheHood decision={decision} /></div>
        </details>
        <footer className="mt-auto pb-2 text-sm text-muted">
          <a href="https://vercel.com/ai-gateway/models/jev" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-leaf">Jev on AI Gateway</a>
        </footer>
      </main>
    </ItemArtContext>
  );
}
