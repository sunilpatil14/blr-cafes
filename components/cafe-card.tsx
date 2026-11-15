"use client";

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
  active = false,
  onActive,
}: {
  cafe: Cafe;
  openInfo?: OpenInfo;
  active?: boolean;
  onActive?: (id: string | null) => void;
}) {
  const extra = getFeatured(cafe.id, cafe.name);
  const photo = extra?.images?.[0];
  const hasMenu = !!extra?.menu?.length;
  // straight-line distance x 1.3 for winding streets, at about 5 km/h
  const walk = Math.max(1, Math.round(cafe.distanceKm * 1.3 * 12));

  return (
    <div
      id={`cafe-${cafe.id}`}
      onMouseEnter={() => onActive?.(cafe.id)}
      onMouseLeave={() => onActive?.(null)}
      className={`group relative scroll-mt-40 rounded-3xl border transition duration-300 ${
        active
          ? "border-sky-deep bg-sky/20 shadow-lg"
          : "border-border bg-card hover:shadow-md"
      }`}
    >
      <Link href={`/cafes/${cafe.id}`} className="flex gap-4 p-3 sm:gap-5 sm:p-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl sm:size-32">
          {photo ? (
            <Image
              src={photo}
              alt={`${cafe.name} interior`}
              fill
              sizes="128px"
              className="object-cover"
            />
          ) : (
            <CafeCover name={cafe.name} className="h-full w-full" />
          )}
          {hasMenu && (
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium text-accent">
              Menu
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col py-0.5 pr-9">
          <h3 className="font-display line-clamp-2 text-lg leading-snug sm:text-xl">
            {cafe.name}
          </h3>

          <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <span className="line-clamp-1">
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

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3">
            {cafe.wifi && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Wifi className="size-3.5 text-accent" /> WiFi
              </span>
            )}
            {cafe.outdoorSeating && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Sun className="size-3.5 text-accent" /> Outdoor
              </span>
            )}
            {cafe.distanceKm > 0 && (
              <span className="ml-auto whitespace-nowrap rounded-full bg-sky/50 px-2.5 py-1 text-xs font-medium">
                {cafe.distanceKm.toFixed(1)} km
                {walk <= 40 && (
                  <span className="hidden sm:inline"> · ~{walk} min walk</span>
                )}
              </span>
            )}
          </div>
        </div>
      </Link>

      <SaveButton cafe={cafe} className="absolute right-3 top-3" />
    </div>
  );
}