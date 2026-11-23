import { NextRequest, NextResponse } from "next/server";
import snapshot from "@/data/cafes-bengaluru.json";
import { chainKey, norm } from "@/lib/chains";
import { getFeatured } from "@/lib/featured";

type Row = { id: string; name: string; address: string };
const ROWS = snapshot as unknown as Row[];

// how many branches each chain has, worked out once at startup
type Group = { names: Map<string, number>; count: number };
const GROUPS = new Map<string, Group>();
for (const r of ROWS) {
  const k = chainKey(r.name);
  const g = GROUPS.get(k) ?? { names: new Map<string, number>(), count: 0 };
  g.names.set(r.name, (g.names.get(r.name) ?? 0) + 1);
  g.count += 1;
  GROUPS.set(k, g);
}
const labelFor = (g: Group) =>
  [...g.names.entries()].sort((a, b) => b[1] - a[1])[0][0];

export function GET(req: NextRequest) {
  const q = norm(req.nextUrl.searchParams.get("q") ?? "");
  if (q.length < 2) return NextResponse.json([]);

  const seen = new Set<string>();
  const items: { score: number; item: object }[] = [];

  for (const r of ROWS) {
    const key = chainKey(r.name);
    const n = norm(r.name);
    if (!n.includes(q) && !key.includes(q)) continue;
    const starts = n.startsWith(q) || key.startsWith(q);
    const g = GROUPS.get(key)!;

    if (g.count > 1) {
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        score: (starts ? 0 : 10) - 3,
        item: { type: "chain", key, name: labelFor(g), count: g.count },
      });
    } else {
      const featured = getFeatured(r.id, r.name) !== null;
      items.push({
        score: (starts ? 0 : 10) - (featured ? 5 : 0),
        item: { type: "cafe", id: r.id, name: r.name, address: r.address, featured },
      });
    }
  }

  items.sort((a, b) => a.score - b.score);
  return NextResponse.json(items.slice(0, 6).map((x) => x.item));
}