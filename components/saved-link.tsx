"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useSaved } from "@/lib/saved";

export function SavedLink({
  className = "",
  dark = false,
}: {
  className?: string;
  dark?: boolean;
}) {
  const { saved } = useSaved();

  return (
    <Link
      href="/saved"
      className={`inline-flex items-center gap-1.5 text-sm transition ${
        dark
          ? "text-[#f6f0e6]/70 hover:text-[#f6f0e6]"
          : "text-muted-foreground hover:text-foreground"
      } ${className}`}
    >
      <Heart className="size-4" />
      Saved
      {saved.length > 0 && (
        <span
          className={`rounded-full px-1.5 text-xs ${
            dark ? "bg-white/15 text-[#f6f0e6]" : "bg-sky/60 text-foreground"
          }`}
        >
          {saved.length}
        </span>
      )}
    </Link>
  );
}