import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Results } from "@/components/results";
import { SavedLink } from "@/components/saved-link";
import { StatusState, type StatusKind } from "@/components/status-state";
import { findCafes, geocodeCity, type Cafe } from "@/lib/cafes";

export default async function CafesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; lat?: string; lng?: string; name?: string }>;
}) {
  const { city, lat, lng, name } = await searchParams;

  if (!city && !(lat && lng)) redirect("/");

  let kicker = "Cafes";
  let headline = "Near you";
  let place = "your location";
  let cafes: Cafe[] = [];
  let status: StatusKind | null = null;

  try {
    let coords: { lat: number; lng: number } | null = null;

    if (lat && lng) {
      if (name) {
        kicker = "Cafes in";
        headline = name;
        place = name;
      }
      const la = parseFloat(lat);
      const ln = parseFloat(lng);
      if (Number.isNaN(la) || Number.isNaN(ln)) status = "notfound";
      else coords = { lat: la, lng: ln };
    } else if (city) {
      kicker = "Cafes in";
      headline = city;
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
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to search
        </Link>
        <SavedLink />
      </div>

      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {kicker}
      </p>
      <h1 className="font-display mt-2 text-4xl sm:text-6xl">{headline}</h1>

      {status && <StatusState kind={status} place={place} />}

      {cafes.length > 0 && (
        <Results
          key={`${city ?? ""}|${lat ?? ""}|${lng ?? ""}`}
          cafes={cafes}
        />
      )}

      <p className="mt-16 text-xs text-muted-foreground">
        Cafe data © OpenStreetMap contributors
      </p>
    </main>
  );
}