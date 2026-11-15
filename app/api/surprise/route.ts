import { NextRequest, NextResponse } from "next/server";
import snapshot from "@/data/cafes-bengaluru.json";

type Row = {
  id: string;
  lat: number;
  lng: number;
  address: string;
  openingHours?: string;
};

const ROWS = (snapshot as unknown as Row[]).filter(
  (c) => c.address || c.openingHours
);

function km(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const lat = parseFloat(p.get("lat") ?? "");
  const lng = parseFloat(p.get("lng") ?? "");

  let pool = ROWS;
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    const near = ROWS.filter((c) => km(lat, lng, c.lat, c.lng) <= 5);
    if (near.length) pool = near;
  }

  const pick = pool[Math.floor(Math.random() * pool.length)];
  return NextResponse.json({ id: pick.id });
}