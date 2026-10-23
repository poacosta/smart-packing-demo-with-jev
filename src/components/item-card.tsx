"use client";

import type { PlannedItem } from "@/lib/packing/plan";
import { ItemArt } from "./item-art";

const STYLES: Record<PlannedItem["status"], string> = {
  packed: "border-leaf-line bg-leaf-soft",
  "no-room": "border-dashed border-clay/50 bg-panel",
  skipped: "border-line bg-panel",
  removed: "border-line bg-panel",
};

export function ItemCard({
  planned,
  onToggle,
}: {
  planned: PlannedItem;
  onToggle: () => void;
}) {
  const { item, quantity, status, reason, why } = planned;
  const packed = status === "packed";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={packed}
      title={why}
      className={`group relative flex min-h-[108px] items-start gap-3 rounded-lg border p-3 pb-10 text-left hover:border-leaf focus-visible:outline-2 focus-visible:outline-leaf ${STYLES[status]}`}
    >
      <ItemArt item={item} size={50} />
      <span className="pr-5 pt-2 text-base leading-snug">
        {item.name}
        {quantity > 1 && (
          <span className="ml-1.5 inline-block rounded bg-leaf/10 px-1 py-0.5 text-sm font-semibold text-leaf">
            ×{quantity}
          </span>
        )}
      </span>

      <span
        aria-hidden
        className={`absolute top-2 right-2 flex size-5 items-center justify-center rounded-full text-sm ${
          packed ? "bg-leaf text-white" : "border border-muted/40 text-muted group-hover:border-leaf group-hover:text-leaf"
        }`}
      >
        {packed ? "✓" : "+"}
      </span>

      <span className="absolute right-9 bottom-2 left-3 text-right text-sm text-muted">
        {status === "no-room" ? `${reason} · no room` : status === "removed" ? "Taken out" : packed ? `${(quantity * item.liters).toFixed(1)} L · ${reason}` : reason}
      </span>
      <span
        aria-hidden
        className="absolute right-3 bottom-2 flex size-5 items-center justify-center rounded-full border border-muted text-xs font-medium text-muted"
      >
        i
      </span>
      <span className="sr-only">{why}</span>
    </button>
  );
}
