"use client";

import { useState } from "react";
import type { DecideResponse } from "@/lib/packing/types";

export function JevRequest({ decision, statusMessage, isError }: {
  decision: DecideResponse | null;
  statusMessage: string;
  isError: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [responseExpanded, setResponseExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p role="status" className={`text-sm ${isError ? "text-clay" : "text-muted"}`}>{statusMessage}</p>
        <div className="flex flex-wrap gap-x-4">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls="jev-request"
            onClick={() => setExpanded((value) => !value)}
            className="min-h-10 rounded-md text-sm font-semibold text-leaf underline decoration-leaf/40 underline-offset-4 hover:decoration-leaf focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-leaf"
          >
            {expanded ? "Hide Jev request" : "Show Jev request"}
          </button>
          <button
            type="button"
            aria-expanded={responseExpanded}
            aria-controls="jev-response"
            onClick={() => setResponseExpanded((value) => !value)}
            className="min-h-10 rounded-md text-sm font-semibold text-leaf underline decoration-leaf/40 underline-offset-4 hover:decoration-leaf focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-leaf"
          >
            {responseExpanded ? "Hide Jev response" : "Show Jev response"}
          </button>
        </div>
      </div>
      <div id="jev-request" hidden={!expanded} className="space-y-3">
        {decision?.request ? (
          <>
            <p className="text-sm text-muted">Last model call · {decision.questionCount} questions · {decision.latencyMs} ms</p>
            <pre
              aria-label="Jev request JSON"
              tabIndex={0}
              className="max-h-96 overflow-auto rounded-lg border border-line bg-paper p-4 text-sm leading-relaxed whitespace-pre-wrap break-words focus-visible:outline-2 focus-visible:outline-leaf"
            >
              <code>{JSON.stringify(decision.request, null, 2)}</code>
            </pre>
          </>
        ) : (
          <p className="text-sm text-muted">
            {decision?.source === "offline" ? "Offline mode: no Jev request was sent." : "The request appears after Jev responds."}
          </p>
        )}
      </div>
      <div id="jev-response" hidden={!responseExpanded} className="space-y-3">
        {decision?.response ? (
          <>
            <p className="text-sm text-muted">Last model response · original answers and token usage</p>
            <pre
              aria-label="Jev response JSON"
              tabIndex={0}
              className="max-h-96 overflow-auto rounded-lg border border-line bg-paper p-4 text-sm leading-relaxed whitespace-pre-wrap break-words focus-visible:outline-2 focus-visible:outline-leaf"
            >
              <code>{JSON.stringify(decision.response, null, 2)}</code>
            </pre>
          </>
        ) : (
          <p className="text-sm text-muted">
            {decision?.source === "offline" ? "Offline mode: no Jev response was received." : "The response appears after Jev responds."}
          </p>
        )}
      </div>
    </div>
  );
}
