"use client";

import type { Plan } from "@/lib/packing/plan";
import { ItemArt } from "./item-art";

export function Suitcase({
  plan,
  onRemove,
}: {
  plan: Plan;
  onRemove: (id: string) => void;
}) {
  const fill = Math.min(plan.usedLiters / plan.capacity, 1);
  const totalQuantity = plan.packed.reduce((total, packed) => total + packed.quantity, 0);

  return (
    <div className="flex flex-col">
      <div className="relative mx-auto w-full max-w-[340px] pt-7">
        {/* Handle */}
        <div className="absolute top-0 left-1/2 h-9 w-24 -translate-x-1/2 rounded-t-2xl border-[6px] border-b-0 border-shell-dark" />
        {/* Shell */}
        <div className="relative rounded-[22px] bg-shell p-3 shadow-[0_10px_0_-4px_var(--shell-dark),0_18px_30px_-12px_rgb(0_0_0/0.35)]">
          <div className="lining relative min-h-[360px] rounded-[14px] p-4 shadow-[inset_0_0_0_2px_rgb(0_0_0/0.06)] sm:min-h-[400px]">
            <div className="pointer-events-none absolute inset-2 rounded-[10px] border border-dashed border-[#d8c8a8]" />
            {plan.packed.length === 0 ? (
              <p className="absolute inset-0 flex items-center justify-center px-8 text-center font-serif text-xl text-muted italic">
                Tell me about your trip…
              </p>
            ) : (
              <ul className="relative grid grid-cols-3 gap-x-2 gap-y-3">
                {plan.packed.map(({ item, quantity }) => (
                  <li key={item.id} className="drop-in flex justify-center">
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      title={`Take out ${quantity > 1 ? `${quantity} × ` : ""}${item.name}`}
                      className="relative rounded-xl p-1 transition hover:-translate-y-0.5 hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-leaf"
                    >
                      <ItemArt item={item} size={54} />
                      {quantity > 1 && (
                        <span aria-hidden className="absolute -right-1 -bottom-1 rounded-full bg-panel px-1.5 py-0.5 text-[10px] font-semibold text-leaf shadow-sm">
                          ×{quantity}
                        </span>
                      )}
                      <span className="sr-only">Take out {quantity} × {item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-serif text-sm whitespace-nowrap tracking-wide text-[#b8a888] italic">
              smart packing.
            </span>
          </div>
          {/* Zip pull */}
          <div className="absolute top-10 -right-1 h-8 w-2.5 rounded-sm bg-[#d9b778]" />
        </div>
        {/* Wheels */}
        <div className="flex justify-between px-10">
          <span className="h-3 w-4 rounded-b-md bg-shell-dark" />
          <span className="h-3 w-4 rounded-b-md bg-shell-dark" />
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between text-sm">
          <p>
            <span className="font-serif text-2xl">{totalQuantity}</span>{" "}
            <span className="text-muted">items packed</span>
          </p>
          <p className="text-leaf">
            {plan.usedLiters.toFixed(1)} / {plan.capacity} L
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-leaf transition-[width] duration-500"
            style={{ width: `${fill * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {Math.max(0, plan.capacity - plan.usedLiters).toFixed(1)} L free. Room to spare is fine. Tap an item to take it out.
        </p>
      </div>
    </div>
  );
}
