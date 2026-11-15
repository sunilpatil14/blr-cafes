"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useSaved } from "@/lib/saved";

export function SavedLink({ className = "" }: { className?: string }) {
  const { saved } = useSaved();

  return (
    <Link
      href="/saved"
      className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground ${className}`}
    >
      <Heart className="size-4" />
      Saved
      {saved.length > 0 && (
        <span className="rounded-full bg-sky/60 px-1.5 text-xs text-foreground">
          {saved.length}
        </span>
      )}
    </Link>
  );
}