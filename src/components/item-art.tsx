"use client";

import { createContext, useContext } from "react";
import type { Item } from "@/lib/packing/catalog";
import { ITEM_ATLAS, ITEM_ILLUSTRATIONS, WARDROBE_ATLAS, WARDROBE_ILLUSTRATIONS, UNISEX_ATLAS, UNISEX_ILLUSTRATIONS } from "@/lib/packing/illustrations";

/** Item id → URL of its illustration in public/items/. */
export const ItemArtContext = createContext<Record<string, string>>({});

/** Individual artwork overrides the bundled illustration for an item. */
export function ItemArt({ item, size }: { item: Item; size: number }) {
  const src = useContext(ItemArtContext)[item.id] ?? item.image;
  const bounds = UNISEX_ILLUSTRATIONS[item.id] ?? ITEM_ILLUSTRATIONS[item.id] ?? WARDROBE_ILLUSTRATIONS[item.id];
  const atlas = UNISEX_ILLUSTRATIONS[item.id] ? UNISEX_ATLAS : ITEM_ILLUSTRATIONS[item.id] ? ITEM_ATLAS : WARDROBE_ATLAS;

  if (!src && bounds) {
    const [left, top, width, height] = bounds;
    const scale = size / Math.max(width, height);

    return (
      <span
        aria-hidden
        className="flex shrink-0 items-center justify-center drop-shadow-sm select-none"
        style={{ width: size, height: size }}
      >
        <span
          className="block bg-no-repeat"
          style={{
            width: width * scale,
            height: height * scale,
            backgroundImage: `url('${atlas.src}')`,
            backgroundSize: `${atlas.width * scale}px ${atlas.height * scale}px`,
            backgroundPosition: `${-left * scale}px ${-top * scale}px`,
          }}
        />
      </span>
    );
  }

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
