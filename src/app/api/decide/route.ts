import { decideOffline, decideTrip, hasGatewayCredentials } from "@/lib/packing/decision";
import { BAGS, type BagId } from "@/lib/packing/catalog";
import type { DecideError, DecideResponse } from "@/lib/packing/types";

// Plenty for a trip description; keeps requests small and cheap.
const MAX_TRIP_CHARS = 2000;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    trip?: unknown; bag?: unknown;
  } | null;
  const trip = typeof body?.trip === "string" ? body.trip.trim().slice(0, MAX_TRIP_CHARS) : "";
  if (!trip) {
    return Response.json({ error: "Describe your trip first." } satisfies DecideError, {
      status: 400,
    });
  }

  const bag = body?.bag === undefined ? "cabin" : body.bag;
  if (typeof bag !== "string" || !Object.hasOwn(BAGS, bag)) {
    return Response.json({ error: "Choose a valid bag capacity." } satisfies DecideError, {
      status: 400,
    });
  }
  const bagId = bag as BagId;

  if (!hasGatewayCredentials()) {
    return Response.json(decideOffline(trip, bagId) satisfies DecideResponse);
  }

  try {
    const result = await decideTrip(trip, bagId, request.signal);
    return Response.json(result satisfies DecideResponse);
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    // Full details stay in the server logs; provider errors can include internals.
    console.error("Decision failed", error);
    return Response.json(
      { error: "Jev could not decide. Check the server logs." } satisfies DecideError,
      { status: 502 },
    );
  }
}
