"use client";

import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { CafeCard } from "@/components/cafe-card";
import { Reveal } from "@/components/reveal";
import { useHydrated, useSaved } from "@/lib/saved";

export default function SavedPage() {
  const hydrated = useHydrated();
  const { saved, clear } = useSaved();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to search
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-4xl sm:text-5xl">Saved cafes</h1>
        {hydrated && saved.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Remove all saved cafes?")) clear();
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Remove all
          </button>
        )}
      </div>

      {!hydrated ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="mx-auto mt-20 flex max-w-sm flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-sky/50">
            <Heart className="size-7 text-accent" />
          </div>
          <h2 className="font-display mt-5 text-2xl">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the heart on any cafe to keep it here for later.
          </p>
          <Link
            href="/"
            className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground transition hover:opacity-90"
          >
            Find cafes
          </Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-muted-foreground">
            {saved.length} saved on this device
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {saved.map((s, i) => (
              <Reveal key={s.id} index={i}>
                <CafeCard cafe={{ ...s, distanceKm: 0 }} />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </main>
  );
}