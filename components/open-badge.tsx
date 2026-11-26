"use client";

import { useEffect, useState } from "react";
import { evaluateOpen, type OpenInfo } from "@/lib/open-now";

const DOT: Record<OpenInfo["state"], string> = {
  open: "bg-sky-deep",
  closed: "bg-muted-foreground/40",
  unknown: "bg-accent/60",
};

export function OpenBadge({ id, hours }: { id: string; hours?: string }) {
  const [info, setInfo] = useState<OpenInfo | null>(null);

  useEffect(() => {
    if (!hours) return;
    let alive = true;
    evaluateOpen([{ id, openingHours: hours }])
      .then((m) => {
        if (alive) setInfo(m.get(id) ?? null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id, hours]);

  if (!info) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm">
      <span className={`size-2 rounded-full ${DOT[info.state]}`} />
      {info.text}
    </span>
  );
}