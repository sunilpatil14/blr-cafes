"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  DoorOpen,
  List,
  Loader2,
  Map as MapIcon,
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
      className={`inline-flex shrink-0 select-none items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
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
  const [view, setView] = useState<"list" | "map">("list");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [openNow, setOpenNow] = useState(false);
  const [infos, setInfos] = useState<Map<string, OpenInfo> | null>(null);
  const [checking, setChecking] = useState(false);
  const [openError, setOpenError] = useState(false);
  const hasDistance = cafes.some((c) => c.distanceKm > 0);

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
      setInfos(await evaluateOpen(cafes));
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

  function selectFromMap(id: string) {
    setActiveId(id);
    const el = document.getElementById(`cafe-${id}`);
    if (el && el.offsetParent !== null) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground">
          {filtering
            ? `Showing ${filtered.length} of ${cafes.length} cafes`
            : `${cafes.length} cafes${hasDistance ? " · nearest first" : ""}`}
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

      {/* sticky filter bar */}
      <div className="sticky top-0 z-20 -mx-6 mt-4 border-b border-border/60 bg-background/85 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] lg:flex-wrap lg:overflow-visible [&::-webkit-scrollbar]:hidden">
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

          {hasDistance && (
            <>
              <span className="mx-1 hidden h-6 w-px shrink-0 bg-border sm:block" />
              {DISTANCES.map((d) => (
                <Chip key={d.label} active={maxKm === d.km} onClick={() => setMaxKm(d.km)}>
                  {d.label}
                </Chip>
              ))}
            </>
          )}

          {filtering && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex shrink-0 items-center gap-1 px-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" /> Clear
            </button>
          )}
        </div>
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
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,560px)_1fr]">
          <div
            className={`content-start gap-4 ${
              view === "map" ? "hidden lg:grid" : "grid"
            }`}
          >
            {filtered.map((cafe, i) => (
              <Reveal key={cafe.id} index={i}>
                <CafeCard
                  cafe={cafe}
                  openInfo={infos?.get(cafe.id)}
                  active={activeId === cafe.id}
                  onActive={setActiveId}
                />
              </Reveal>
            ))}
          </div>

          <div
            className={`h-[70vh] overflow-hidden rounded-3xl border border-border lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] ${
              view === "list" ? "hidden lg:block" : "block"
            }`}
          >
            <CafeMap cafes={pins} activeId={activeId} onSelect={selectFromMap} />
          </div>
        </div>
      )}

      {/* phone: switch between list and map */}
      {filtered.length > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-30 flex justify-center lg:hidden">
          <button
            type="button"
            onClick={() => setView((v) => (v === "list" ? "map" : "list"))}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground shadow-xl"
          >
            {view === "list" ? (
              <>
                <MapIcon className="size-4" /> Map
              </>
            ) : (
              <>
                <List className="size-4" /> List
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}