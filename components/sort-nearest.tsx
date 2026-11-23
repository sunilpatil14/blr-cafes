"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LocateFixed } from "lucide-react";

export function SortNearest({ brand, name }: { brand: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function go() {
    setError("");
    if (!("geolocation" in navigator)) {
      setError("Your browser doesn't support location.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        router.replace(
          `/cafes?brand=${encodeURIComponent(brand)}&name=${encodeURIComponent(name)}&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`
        );
      },
      () => {
        setBusy(false);
        setError("Couldn't get your location. Allow access and try again.");
      },
      { timeout: 10000 }
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2 text-sm transition hover:bg-sky/40 disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4 text-accent" />}
        {busy ? "Finding you…" : "Sort by nearest to me"}
      </button>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}