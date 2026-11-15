"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  DoorOpen,
  Loader2,
  Shuffle,
  Sun,
  Wifi,
  X,
  type LucideIcon,
} from "lucide-react";
import { CafeCard } from "@/components/cafe-card";
import { CafeMap } from "@/components/cafe-map";
import { Reveal } from "@/components/reveal";
import type { Cafe } from "@/lib/cafes";
import { evaluateOpen, type OpenInfo } from "@/lib/open-now";

type FeatureKey = "wifi" | "outdoor" | "hours";

const FEATURES: {
  key: FeatureKey;
  label: string;
  icon: LucideIcon;
  test: (c: Cafe) => boolean;
}[] = [
  { key: "wifi", label: "WiFi", icon: Wifi, test: (c) => c.wifi },
  { key: "outdoor", label: "Outdoor seating", icon: Sun, test: (c) => c.outdoorSeating },
  { key: "hours", label: "Hours listed", icon: Clock, test: (c) => !!c.openingHours },
];

const DISTANCES = [
  { label: "Any distance", km: Infinity },
  { label: "Within 1 km", km: 1 },
  { label: "Within 2 km", km: 2 },
];

function Chip({
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex select-none items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-sky/40"
      } ${disabled ? "cursor-not-allowed opacity-45 hover:bg-card" : ""}`}
    >
      {children}
    </button>
  );
}

export function Results({ cafes }: { cafes: Cafe[] }) {
  const router = useRouter();
  const [active, setActive] = useState<FeatureKey[]>([]);
  const [maxKm, setMaxKm] = useState<number>(Infinity);

  const [openNow, setOpenNow] = useState(false);
  const [infos, setInfos] = useState<Map<string, OpenInfo> | null>(null);
  const [checking, setChecking] = useState(false);
  const [openError, setOpenError] = useState(false);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        FEATURES.map((f) => [f.key, cafes.filter(f.test).length])
      ) as Record<FeatureKey, number>,
    [cafes]
  );

  const openCount = infos
    ? cafes.filter((c) => infos.get(c.id)?.state === "open").length
    : null;

  const filtered = useMemo(() => {
    const tests = FEATURES.filter((f) => active.includes(f.key));
    return cafes.filter(
      (c) =>
        c.distanceKm <= maxKm &&
        tests.every((f) => f.test(c)) &&
        (!openNow || !infos || infos.get(c.id)?.state === "open")
    );
  }, [cafes, active, maxKm, openNow, infos]);

  const pins = useMemo(
    () => filtered.map(({ id, name, lat, lng }) => ({ id, name, lat, lng })),
    [filtered]
  );

  const filtering = active.length > 0 || maxKm !== Infinity || openNow;

  function toggle(key: FeatureKey) {
    setActive((a) => (a.includes(key) ? a.filter((k) => k !== key) : [...a, key]));
  }

  async function toggleOpen() {
    if (openNow) {
      setOpenNow(false);
      return;
    }
    setOpenError(false);
    setOpenNow(true);
    setChecking(true);
    try {
      setInfos(await evaluateOpen(cafes)); // re-checked each time it's switched on
    } catch {
      setOpenNow(false);
      setOpenError(true);
    } finally {
      setChecking(false);
    }
  }

  function clear() {
    setActive([]);
    setMaxKm(Infinity);
    setOpenNow(false);
  }

  function surprise() {
    if (!filtered.length) return;
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    router.push(`/cafes/${pick.id}`);
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground">
          {filtering
            ? `Showing ${filtered.length} of ${cafes.length} cafes`
            : `${cafes.length} cafes found, nearest first`}
        </p>
        <button
          type="button"
          onClick={surprise}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          <Shuffle className="size-4" /> Surprise me
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Chip
          active={openNow}
          disabled={counts.hours === 0 && !openNow}
          onClick={toggleOpen}
        >
          {checking ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <DoorOpen className="size-4" />
          )}
          Open now
          {openCount !== null && (
            <span className="text-xs opacity-70">{openCount}</span>
          )}
        </Chip>

        {FEATURES.map((f) => {
          const on = active.includes(f.key);
          return (
            <Chip
              key={f.key}
              active={on}
              disabled={counts[f.key] === 0 && !on}
              onClick={() => toggle(f.key)}
            >
              <f.icon className="size-4" />
              {f.label}
              <span className="text-xs opacity-70">{counts[f.key]}</span>
            </Chip>
          );
        })}

        <span className="mx-1 hidden h-6 w-px bg-border sm:block" />

        {DISTANCES.map((d) => (
          <Chip key={d.label} active={maxKm === d.km} onClick={() => setMaxKm(d.km)}>
            {d.label}
          </Chip>
        ))}

        {filtering && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 px-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" /> Clear
          </button>
        )}
      </div>

      {openError && (
        <p className="mt-3 text-sm text-red-700">
          Couldn't check opening hours right now. Please try again.
        </p>
      )}
      {openNow && infos && (
        <p className="mt-3 text-xs text-muted-foreground">
          Based on opening hours listed on OpenStreetMap, which may be out of
          date. {cafes.length - counts.hours} cafes have no hours listed and
          aren't shown here.
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-display text-2xl">No cafes match those filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Only cafes with that detail listed on OpenStreetMap can match, so
            try removing one.
          </p>
          <button
            type="button"
            onClick={clear}
            className="mt-5 rounded-full border border-border px-5 py-2 text-sm hover:bg-sky/40"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div className="grid content-start gap-6 sm:grid-cols-2">
            {filtered.map((cafe, i) => (
              <Reveal key={cafe.id} index={i}>
                <CafeCard cafe={cafe} openInfo={infos?.get(cafe.id)} />
              </Reveal>
            ))}
          </div>

          <div className="order-first h-[320px] overflow-hidden rounded-2xl border border-border lg:sticky lg:top-6 lg:order-last lg:h-[calc(100vh-3rem)]">
            <CafeMap cafes={pins} />
          </div>
        </div>
      )}
    </div>
  );
}