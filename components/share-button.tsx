"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { BRAND } from "@/lib/brand";

export function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
        const text = `${name} on ${BRAND}`;

    if ("share" in navigator) {
      try {
        await navigator.share({ title: name, text, url });
      } catch {
        // the person closed the share sheet; nothing to do
      }
      return;
    }
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked; ignore
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={share}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition hover:bg-sky/40"
      >
        <Share2 className="size-4" /> Share
      </button>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy link"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm transition hover:bg-sky/40"
      >
        {copied ? <Check className="size-4 text-accent" /> : <Link2 className="size-4" />}
        {copied && <span className="text-xs">Copied</span>}
      </button>
    </div>
  );
}