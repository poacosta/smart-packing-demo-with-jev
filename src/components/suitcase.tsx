"use client";

import type { Plan } from "@/lib/packing/plan";
import type { ReactNode } from "react";
import { ItemArt } from "./item-art";

export function Suitcase({ plan, onRemove, children }: {
  plan: Plan;
  onRemove: (id: string) => void;
  children: ReactNode;
}) {
  const fill = Math.min(plan.usedLiters / plan.capacity, 1);
  const totalQuantity = plan.packed.reduce((total, packed) => total + packed.quantity, 0);

  return (
    <section aria-label="Bag usage" className="self-start rounded-2xl border border-line bg-[#e9e6da] p-5">
      {children}
      <div className="relative mx-auto mt-4 mb-6 w-full max-w-[340px] pt-7">
        <div aria-hidden className="absolute top-0 left-1/2 h-9 w-24 -translate-x-1/2 rounded-t-2xl border-[6px] border-b-0 border-shell-dark" />
        <div className="relative rounded-[22px] bg-shell p-3 shadow-[0_10px_0_-4px_var(--shell-dark),0_18px_30px_-12px_rgb(0_0_0/0.35)]">
          <div className="lining relative min-h-[360px] rounded-[14px] p-4 shadow-[inset_0_0_0_2px_rgb(0_0_0/0.06)]">
            {plan.packed.length === 0 ? (
              <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-base text-muted">Describe your trip to start packing.</p>
            ) : (
              <ul aria-label="Packed items" className="grid grid-cols-3 gap-x-2 gap-y-3">
                {plan.packed.map(({ item, quantity }) => (
                  <li key={item.id} className="drop-in flex justify-center">
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      title={`Take out ${item.name}`}
                      className="relative rounded-xl p-1 transition hover:-translate-y-0.5 hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-leaf"
                    >
                      <ItemArt item={item} size={54} />
                      {quantity > 1 && <span aria-hidden className="absolute -right-1 -bottom-1 rounded-full bg-panel px-1.5 py-0.5 text-sm font-semibold text-leaf shadow-sm">×{quantity}</span>}
                      <span className="sr-only">Take out {quantity} × {item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div aria-hidden className="absolute top-10 -right-1 h-8 w-2.5 rounded-sm bg-[#d9b778]" />
        </div>
        <div aria-hidden className="flex justify-between px-10">
          <span className="h-3 w-4 rounded-b-md bg-shell-dark" />
          <span className="h-3 w-4 rounded-b-md bg-shell-dark" />
        </div>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">{totalQuantity} items packed</h2>
        <p className="text-lg font-semibold text-leaf tabular-nums">{plan.usedLiters.toFixed(1)} / {plan.capacity} L</p>
      </div>
      <div
        role="meter"
        aria-label="Packed volume in litres"
        aria-valuenow={plan.usedLiters}
        aria-valuemin={0}
        aria-valuemax={plan.capacity}
        className="mt-3 h-2 overflow-hidden rounded-full bg-line"
      >
        <div className="h-full rounded-full bg-leaf" style={{ width: `${fill * 100}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted">{Math.max(0, plan.capacity - plan.usedLiters).toFixed(1)} L free. Spare space is fine.</p>
    </section>
  );
}
