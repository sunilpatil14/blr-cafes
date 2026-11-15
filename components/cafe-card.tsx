import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin, Sun, Wifi } from "lucide-react";
import { CafeCover } from "@/components/cafe-cover";
import { SaveButton } from "@/components/save-button";
import type { Cafe } from "@/lib/cafes";
import { getFeatured } from "@/lib/featured";
import { prettyHours } from "@/lib/hours";
import type { OpenInfo } from "@/lib/open-now";

const DOT: Record<OpenInfo["state"], string> = {
  open: "bg-sky-deep",
  closed: "bg-muted-foreground/40",
  unknown: "bg-accent/60",
};

export function CafeCard({
  cafe,
  openInfo,
}: {
  cafe: Cafe;
  openInfo?: OpenInfo;
}) {
  const extra = getFeatured(cafe.id, cafe.name);
  const photo = extra?.images?.[0];

  return (
    <div className="group relative h-full transition hover:-translate-y-1">
      <Link href={`/cafes/${cafe.id}`} className="block h-full">
        <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition group-hover:shadow-lg">
          <div className="relative mb-4 h-32 shrink-0 overflow-hidden rounded-xl bg-secondary">
            {photo ? (
              <Image
                src={photo}
                alt={`${cafe.name} interior`}
                fill
                sizes="(min-width: 1024px) 20vw, 50vw"
                className="object-cover"
              />
            ) : (
              <CafeCover name={cafe.name} className="h-full w-full" />
            )}
            {extra?.menu && extra.menu.length > 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2.5 py-1 text-xs font-medium text-accent">
                Menu
              </span>
            )}
          </div>

          <h3 className="font-display line-clamp-2 text-xl leading-snug">
            {cafe.name}
          </h3>

          <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span className="line-clamp-2">
              {cafe.address || "Tap for location & directions"}
            </span>
          </p>

          {openInfo ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm">
              <span className="flex size-4 shrink-0 items-center justify-center">
                <span className={`size-2 rounded-full ${DOT[openInfo.state]}`} />
              </span>
              <span className="line-clamp-1">{openInfo.text}</span>
            </p>
          ) : cafe.openingHours ? (
            <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
              <Clock className="mt-0.5 size-4 shrink-0" />
              <span className="line-clamp-1">{prettyHours(cafe.openingHours)}</span>
            </p>
          ) : null}

          <div className="mt-auto flex items-center justify-between pt-4">
            <div className="flex gap-2 text-accent">
              {cafe.wifi && <Wifi className="size-4" aria-label="WiFi" />}
              {cafe.outdoorSeating && (
                <Sun className="size-4" aria-label="Outdoor seating" />
              )}
            </div>
            {cafe.distanceKm > 0 && (
              <span className="text-sm font-medium">
                {cafe.distanceKm.toFixed(1)} km
              </span>
            )}
          </div>
        </article>
      </Link>

      <SaveButton cafe={cafe} className="absolute right-7 top-7" />
    </div>
  );
}