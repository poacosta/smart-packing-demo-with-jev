"use client";

import { createContext, useContext } from "react";
import type { Item } from "@/lib/packing/catalog";

/** Item id → URL of its illustration in public/items/. */
export const ItemArtContext = createContext<Record<string, string>>({});

/** Shows the item's illustration when one exists, otherwise its emoji. */
export function ItemArt({ item, size }: { item: Item; size: number }) {
  const src = useContext(ItemArtContext)[item.id];

  if (!src) {
    return (
      <span
        aria-hidden
        className="flex shrink-0 items-center justify-center leading-none select-none"
        style={{ width: size, height: size, fontSize: size * 0.62 }}
      >
        {item.emoji}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- small local illustrations, no optimisation needed
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className="shrink-0 object-contain drop-shadow-sm select-none"
      style={{ width: size, height: size }}
    />
  );
}
