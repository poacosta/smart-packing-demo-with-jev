"use client";

import type { PlannedItem } from "@/lib/packing/plan";
import { ItemArt } from "./item-art";

const STYLES: Record<PlannedItem["status"], string> = {
  packed: "border-leaf-line bg-leaf-soft",
  "no-room": "border-dashed border-clay/50 bg-panel",
  skipped: "border-line bg-panel",
  removed: "border-line bg-panel opacity-70",
};

export function ItemCard({
  planned,
  onToggle,
}: {
  planned: PlannedItem;
  onToggle: () => void;
}) {
  const { item, status, reason, why } = planned;
  const packed = status === "packed";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={packed}
      title={why}
      className={`group relative flex h-[92px] items-center gap-3 rounded-xl border px-3 text-left transition-colors duration-300 hover:border-leaf/50 focus-visible:outline-2 focus-visible:outline-leaf ${STYLES[status]}`}
    >
      <ItemArt item={item} size={50} />
      <span className="text-sm leading-tight">{item.name}</span>

      <span
        aria-hidden
        className={`absolute top-2 right-2 flex size-[18px] items-center justify-center rounded-full text-[11px] transition ${
          packed ? "bg-leaf text-white" : "border border-muted/40 text-muted group-hover:border-leaf group-hover:text-leaf"
        }`}
      >
        {packed ? "✓" : "+"}
      </span>

      <span className="absolute bottom-1.5 left-3 text-[10px] text-muted">
        {status === "no-room" ? `${reason} · no room` : status === "removed" ? "Taken out" : reason}
      </span>
      <span
        aria-hidden
        className="absolute right-2 bottom-1.5 flex size-3.5 items-center justify-center rounded-full border border-muted/40 text-[8px] text-muted"
      >
        i
      </span>
      <span className="sr-only">{why}</span>
    </button>
  );
}
