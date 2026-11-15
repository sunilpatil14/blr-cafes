import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Results } from "@/components/results";
import { StatusState, type StatusKind } from "@/components/status-state";
import { findCafes, geocodeCity, type Cafe } from "@/lib/cafes";
import { SavedLink } from "@/components/saved-link";

export default async function CafesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; lat?: string; lng?: string; name?: string }>;
}) {
  const { city, lat, lng, name } = await searchParams;

  if (!city && !(lat && lng)) redirect("/");

  let title = "Cafes near you";
  let place = "your location";
  let cafes: Cafe[] = [];
  let status: StatusKind | null = null;

  try {
    let coords: { lat: number; lng: number } | null = null;

    if (lat && lng) {
      if (name) {
        title = `Cafes in ${name}`;
        place = name;
      }
      const la = parseFloat(lat);
      const ln = parseFloat(lng);
      if (Number.isNaN(la) || Number.isNaN(ln)) status = "notfound";
      else coords = { lat: la, lng: ln };
    } else if (city) {
      title = `Cafes in ${city}`;
      place = city;
      coords = await geocodeCity(city);
      if (!coords) status = "notfound";
    }

    if (coords) {
      cafes = await findCafes(coords.lat, coords.lng);
      if (cafes.length === 0) status = "empty";
    }
  } catch {
    status = "busy";
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to search
        </Link>
        <SavedLink />
      </div>

      <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>

      {status && <StatusState kind={status} place={place} />}

      {cafes.length > 0 && <Results cafes={cafes} />}

      <p className="mt-16 text-xs text-muted-foreground">
        Cafe data © OpenStreetMap contributors
      </p>
    </main>
  );
}