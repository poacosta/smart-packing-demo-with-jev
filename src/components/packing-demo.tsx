"use client";

import { useMemo, useRef, useState } from "react";
import { BAG_IDS, BAGS, getWardrobeItems, PRESETS, SEASONS, TEMPERATURE_LEVELS, WARDROBES, WARDROBE_IDS, type BagId, type WardrobeId } from "@/lib/packing/catalog";
import { computePlan, isRelevant, type Overrides } from "@/lib/packing/plan";
import { ItemArt, ItemArtContext } from "./item-art";
import { ItemCard } from "./item-card";
import { Suitcase } from "./suitcase";
import { UnderTheHood } from "./under-the-hood";
import { useDecision } from "./use-decision";

export function PackingDemo({ art }: { art: Record<string, string> }) {
  const [trip, setTrip] = useState<string>(PRESETS[0].text);
  const [live, setLive] = useState(true);
  const [bagId, setBagId] = useState<BagId>("cabin");
  const [overrides, setOverrides] = useState<Overrides>({});
  const [showHood, setShowHood] = useState(false);
  const [wardrobe, setWardrobe] = useState<WardrobeId>("men");
  const wardrobeTabs = useRef<Record<WardrobeId, HTMLButtonElement | null>>({ men: null, women: null });

  const { decision: response, status, error } = useDecision(trip, bagId, wardrobe, live);
  const decision = response?.bag === bagId && response.wardrobe === wardrobe ? response : null;

  const plan = useMemo(
    () => computePlan(decision?.signals ?? null, bagId, overrides, decision?.itemScores ?? null, wardrobe),
    [decision, bagId, overrides, wardrobe],
  );
  const cards = plan.items.filter(isRelevant);
  const leftOut = plan.items.filter((p) => !isRelevant(p));

  const toggle = (id: string, packed: boolean) =>
    setOverrides((prev) => ({ ...prev, [id]: packed ? "out" : "in" }));

  const chooseWardrobe = (next: WardrobeId) => {
    setWardrobe(next);
    const compatible = new Set(getWardrobeItems(next).map((item) => item.id));
    setOverrides((previous) => Object.fromEntries(
      Object.entries(previous).filter(([id]) => compatible.has(id)),
    ));
  };

  const climate =
    decision != null
      ? `${SEASONS[decision.season].label} · ${TEMPERATURE_LEVELS[Math.round(decision.temperature)].toLowerCase()}`
      : null;

  return (
    <ItemArtContext value={art}>
      <main className="mx-auto flex min-h-dvh max-w-[1180px] flex-col gap-5 px-4 py-5 sm:px-6">
        {/* Prompt */}
        <section className="rounded-2xl border border-line bg-panel p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
            <span className="tracking-[0.2em] uppercase">Where to?</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setTrip(preset.text);
                  setOverrides({});
                }}
                className={`flex items-center gap-1.5 transition hover:text-ink ${trip === preset.text ? "text-ink" : ""}`}
              >
                <span aria-hidden>{preset.icon}</span>
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setLive((v) => !v)}
              className="ml-auto flex items-center gap-1.5 hover:text-ink"
              aria-pressed={live}
            >
              <span aria-hidden>{live ? "❚❚" : "▶"}</span>
              {live ? "Live" : "Paused"}
            </button>
          </div>

          <label htmlFor="trip" className="sr-only">
            Describe your trip
          </label>
          <textarea
            id="trip"
            value={trip}
            onChange={(e) => setTrip(e.target.value)}
            rows={3}
            placeholder="Where are you going, what will you do, what's the weather like?"
            className="mt-3 w-full resize-none rounded-xl bg-paper/70 px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-leaf/30"
          />

          <div className="mt-2 flex justify-between gap-4 text-[11px] text-muted">
            <span>Choose your bag, describe the trip. Jev fills the space.</span>
            <span className={status === "error" ? "text-clay" : ""}>
              {!live
                ? "Paused"
                : status === "thinking"
                  ? "Jev is deciding…"
                  : status === "error"
                    ? error
                    : "Updates as you type"}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-[10px] tracking-[0.15em] text-muted uppercase">Wardrobe</span>
            <div role="tablist" aria-label="Wardrobe" className="inline-flex gap-1 rounded-full border border-line bg-paper/70 p-1">
              {WARDROBE_IDS.map((id) => (
                <button
                  key={id}
                  ref={(node) => { wardrobeTabs.current[id] = node; }}
                  id={`wardrobe-tab-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={wardrobe === id}
                  aria-controls="wardrobe-panel"
                  tabIndex={wardrobe === id ? 0 : -1}
                  onClick={() => chooseWardrobe(id)}
                  onKeyDown={(event) => {
                    let next: WardrobeId;
                    if (event.key === "ArrowLeft" || event.key === "ArrowRight") next = id === "men" ? "women" : "men";
                    else if (event.key === "Home") next = "men";
                    else if (event.key === "End") next = "women";
                    else return;
                    event.preventDefault();
                    chooseWardrobe(next);
                    wardrobeTabs.current[next]?.focus();
                  }}
                  className={`rounded-full px-5 py-1.5 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf ${wardrobe === id ? "bg-leaf text-white shadow-sm" : "text-muted hover:bg-panel hover:text-ink"}`}
                >
                  {WARDROBES[id].label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {decision?.source === "offline" && (
          <p className="rounded-xl border border-dashed border-clay/40 px-4 py-2 text-xs text-clay">
            Offline keyword fallback. Add <code>AI_GATEWAY_API_KEY</code> to{" "}
            <code>.env.local</code> (or run <code>vercel env pull</code>) to let Jev decide.
          </p>
        )}

        <div
          id="wardrobe-panel"
          role="tabpanel"
          aria-labelledby={`wardrobe-tab-${wardrobe}`}
          tabIndex={0}
          className="grid gap-5 rounded-2xl focus-visible:outline-2 focus-visible:outline-leaf lg:grid-cols-[minmax(320px,400px)_1fr]"
        >
          {/* Bag */}
          <section className="self-start rounded-2xl border border-line bg-[#e9e6da] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-muted uppercase">Packing for</p>
                <h1 className="font-serif text-3xl italic">Your next adventure</h1>
                {climate && <p className="mt-1 text-xs text-muted">≈ {climate}</p>}
              </div>
              <label className="flex shrink-0 flex-col gap-1 text-[10px] text-muted">
                Fill this bag
                <select
                  value={bagId}
                  onChange={(e) => setBagId(e.target.value as BagId)}
                  className="rounded-lg border border-line bg-panel px-2 py-1.5 text-xs text-ink outline-none focus:ring-2 focus:ring-leaf/30"
                  aria-label="Bag size"
                >
                  {BAG_IDS.map((id) => (
                    <option key={id} value={id}>
                      {BAGS[id].label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4">
              <Suitcase plan={plan} onRemove={(id) => toggle(id, true)} />
            </div>
          </section>

          {/* Packing edit */}
          <section>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-3xl italic">The packing edit</h2>
              <div className="flex items-center gap-4">
                {Object.keys(overrides).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setOverrides({})}
                    className="text-[11px] text-leaf underline-offset-2 hover:underline"
                  >
                    Reset to Jev
                  </button>
                )}
                <span className="hidden text-[10px] tracking-[0.2em] text-muted uppercase sm:inline">
                  Jev picks for {BAGS[bagId].liters} L
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((p) => (
                <ItemCard
                  key={p.item.id}
                  planned={p}
                  onToggle={() => toggle(p.item.id, p.status === "packed")}
                />
              ))}
            </div>

            {leftOut.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-[10px] tracking-[0.2em] text-muted uppercase">
                  Jev left these at home
                </p>
                <div className="flex flex-wrap gap-2">
                  {leftOut.map((p) => (
                    <button
                      key={p.item.id}
                      type="button"
                      title={p.why}
                      onClick={() => toggle(p.item.id, false)}
                      className="flex items-center gap-1.5 rounded-full border border-line bg-panel py-1 pr-3 pl-1.5 text-xs text-muted transition hover:border-leaf/50 hover:text-ink"
                    >
                      <ItemArt item={p.item} size={20} />
                      {p.item.name}
                      <span className="text-[10px] opacity-70">{p.reason}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {showHood && (
          <section className="rounded-2xl border border-line bg-panel p-5">
            <UnderTheHood decision={decision} />
          </section>
        )}

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-muted">
          <span className="flex items-center gap-2">
            <span
              className={`size-1.5 rounded-full ${
                status === "thinking"
                  ? "pulse-dot bg-[#d9a441]"
                  : status === "error" || decision?.source === "offline"
                    ? "bg-clay"
                    : "bg-leaf"
              }`}
            />
            {decision ? `${decision.model} · ${decision.latencyMs} ms` : "typesafe-ai/jev"}
          </span>
          <span className="flex gap-5">
            <button type="button" onClick={() => setShowHood((v) => !v)} className="hover:text-ink">
              {showHood ? "Hide the hood" : "Under the hood"}
            </button>
            <a
              href="https://vercel.com/ai-gateway/models/jev"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink"
            >
              Jev on AI Gateway ↗
            </a>
          </span>
        </footer>
      </main>
    </ItemArtContext>
  );
}
