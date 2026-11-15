"use client";

import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useSaved, type Saved } from "@/lib/saved";

export function SaveButton({
  cafe,
  labelled = false,
  className = "",
}: {
  cafe: Saved;
  labelled?: boolean;
  className?: string;
}) {
  const { isSaved, toggle } = useSaved();
  const on = isSaved(cafe.id);
  const label = on ? `Remove ${cafe.name} from saved` : `Save ${cafe.name}`;

  if (labelled) {
    return (
      <button
        type="button"
        onClick={() => toggle(cafe)}
        aria-pressed={on}
        aria-label={label}
        className={`inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm transition hover:bg-sky/40 ${className}`}
      >
        <Heart className={`size-4 ${on ? "fill-accent text-accent" : ""}`} />
        {on ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.8 }}
      onClick={() => toggle(cafe)}
      aria-pressed={on}
      aria-label={label}
      className={`flex size-9 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur transition hover:bg-card ${className}`}
    >
      <Heart
        className={`size-5 transition ${
          on ? "fill-accent text-accent" : "text-foreground/70"
        }`}
      />
    </motion.button>
  );
}