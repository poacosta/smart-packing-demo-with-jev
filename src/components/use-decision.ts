"use client";

import { useEffect, useState } from "react";
import type { BagId, WardrobeId } from "@/lib/packing/catalog";
import type { DecideError, DecideResponse } from "@/lib/packing/types";

export type DecisionStatus = "idle" | "thinking" | "ready" | "error";

const DEBOUNCE_MS = 350;

/**
 * Re-asks the decision model when the trip, capacity or wardrobe changes.
 * Aborts superseded requests so an older plan cannot replace the latest one.
 */
export function useDecision(trip: string, bag: BagId, wardrobe: WardrobeId, live: boolean) {
  const [decision, setDecision] = useState<DecideResponse | null>(null);
  const [status, setStatus] = useState<DecisionStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const text = trip.trim();
    if (!live || text.length < 8) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("thinking");
      try {
        const res = await fetch("/api/decide", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ trip: text, bag, wardrobe }),
          signal: controller.signal,
        });
        const data = (await res.json()) as DecideResponse | DecideError;
        if (controller.signal.aborted) return;
        if ("error" in data) throw new Error(data.error);
        setDecision(data);
        setError(null);
        setStatus("ready");
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Jev could not decide.");
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trip, bag, wardrobe, live]);

  return { decision, status, error };
}
