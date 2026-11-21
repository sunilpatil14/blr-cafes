import placeIds from "@/data/place-ids.json";

const IDS = placeIds as Record<string, string | null>;

type Spot = { id: string; name: string; lat: number; lng: number };

// Opens the exact cafe on Google Maps when we have its place ID,
// otherwise falls back to a search zoomed in on its location.
export function placeUrl(c: Spot) {
  const pid = IDS[c.id];
  return pid
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.name)}&query_place_id=${pid}`
    : `https://www.google.com/maps/search/${encodeURIComponent(c.name)}/@${c.lat},${c.lng},19z`;
}

export function directionsUrl(c: Spot) {
  const pid = IDS[c.id];
  return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}${
    pid ? `&destination_place_id=${pid}` : ""
  }`;
}